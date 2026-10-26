import { system, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { BALANCE } from "../data/balance.js";
import { posKey, newId } from "../core/ids.js";
import { getPark, parkTime, insidePark, can, denyText, recordVisitors, inScopeAt, runLater, scopedJob } from "../park/park.js";
import { earn, spend } from "../economy/economy.js";
import { exhibitAt } from "../exhibits/exhibits.js";
import { measureRoom, measureRoomSteps } from "../staff/rules.js";
import { pathLinked } from "./network.js";
import { viewedSummary } from "./services.js";
import { giftSales } from "./serviceRules.js";
import { dim, blockReader, countItem, takeItem, message, onlinePlayers } from "../platform/mc.js";

// Gift Shop (spec section 12: shops). Like the Staff Room, it's a building the players make: the
// Gift Shop block goes inside a closed building (at least 3 x 3 x 3 inside) or against its outside
// wall, and a guest path from the entrance has to reach it. Guests buy souvenirs on their way out,
// more after a memorable visit. Records live in "equipment" (type "giftshop"), keyed by position.

const EQUIP = "equipment";
const shopsToCheck = new Set();

export const SHOP_TEXT = {
  outside: "It's outside the park. Guests only shop inside the park boundary.",
  inside: "It's inside an exhibit. Build the shop on the guest side of the fence.",
  open: "It isn't in a building yet. Build walls, a floor and a roof all round with no gaps (doors count as wall), then put the Gift Shop inside or against the outside wall.",
  small: "The building is too small: it needs open space at least 3 x 3 x 3 inside (furniture takes up space).",
  unloaded: "Part of the building isn't loaded. Come closer and try again.",
  path: "No guest path reaches it. Lay a path (gravel, bricks, planks...) from the Park Entrance Gate, through the door, to right beside the shop.",
  unchecked: "Checking the paths... use it again in a moment. Is there a Park Entrance Gate yet?",
};

// 0.1.111: the scope's park's shops while a loop runs for one park (park/park.js inScopeAt).
export function allShops() {
  return db.all(EQUIP).filter((e) => e.type === "giftshop" && inScopeAt(e));
}

const working = (rec) => !rec.problem;

export function workingShops() {
  return allShops().filter(working);
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "giftshop", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, stock: 0, price: BALANCE.giftShop.defaultPrice, carry: 0, soldToday: 0, soldDay: 0, problem: "unchecked" };
    db.put(EQUIP, rec);
  }
  return rec;
}

// Measure the building around the shop (the same rule as a Staff Room). Keeps the last answer
// when the building isn't loaded.
function measure(rec) {
  const g = BALANCE.giftShop;
  let r;
  try {
    r = measureRoom(blockReader(dim(rec.dimension)), rec.pos, { minSize: g.roomMinSize, maxCells: g.roomMaxCells }); // it reads each block once
  } catch {
    r = { ok: false, reason: "unloaded" };
  }
  applyMeasure(rec, r);
}

// The re-measures after an edit and the regular ones queue in one job, a slice of the walk at a time (0.1.96, as the
// Staff Rooms'). A player placing or using the shop still gets the answer at once (checkShop with measureNow).
const shopJobs = jobQueue((gen) => system.runJob(timedJob("shops", gen)), (error) => log(`gift shop: a building check failed: ${error}`));
const queuedShops = new Set();

function queueMeasure(id) {
  if (queuedShops.has(id)) return;
  queuedShops.add(id);
  shopJobs.push(scopedJob((function* () {
    let r;
    try {
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      const g = BALANCE.giftShop;
      try {
        r = yield* measureRoomSteps(blockReader(dim(rec.dimension)), rec.pos, { minSize: g.roomMinSize, maxCells: g.roomMaxCells, perYield: g.roomCellsPerYield });
      } catch {
        r = { ok: false, reason: "unloaded" };
      }
    } finally {
      queuedShops.delete(id);
    }
    const rec = db.get(EQUIP, id); // as it is now: guests may have bought souvenirs while it was measured
    if (!rec || !r) return;
    applyMeasure(rec, r);
    checkShop(rec);
  })()));
}

function applyMeasure(rec, r) {
  if (r.reason === "unloaded") return;
  rec.room = r.ok ? "ok" : r.reason;
  rec.space = r.cells ?? 0;
  rec.bbox = r.bbox;
  rec.checkedAt = parkTime();
}

// Re-check a shop: where it stands, its building (when `measureNow` or never measured) and its path.
export function checkShop(rec, measureNow = false) {
  const was = working(rec);
  if (measureNow || rec.room === undefined) measure(rec);
  const linked = pathLinked(rec.dimension, rec.pos);
  if (linked !== undefined) rec.linked = linked;
  if (!insidePark(rec.dimension, rec.pos)) rec.problem = "outside";
  else if (exhibitAt(rec.dimension, rec.pos)) rec.problem = "inside";
  else if (rec.room === undefined) rec.problem = "unloaded";
  else if (rec.room !== "ok") rec.problem = rec.room;
  else if (rec.linked === false) rec.problem = "path";
  else if (rec.linked === undefined) rec.problem = "unchecked";
  else rec.problem = undefined;
  db.put(EQUIP, rec);
  if (was && !working(rec) && rec.problem !== "unchecked") {
    const park = getPark();
    for (const p of onlinePlayers()) if (park?.members[p.id]) message(p, `§eThe Gift Shop at ${rec.pos.x}, ${rec.pos.y}, ${rec.pos.z} has closed. §f${SHOP_TEXT[rec.problem]}`);
  }
  return rec;
}

// Every visitor step: shops waiting after an edit, then the one measured longest ago, into the job; the rest of
// each shop's check (where it stands, its path) at once.
export function checkShops() {
  for (const id of [...shopsToCheck]) {
    shopsToCheck.delete(id);
    queueMeasure(id);
  }
  const now = parkTime();
  const shops = allShops();
  const due = shops
    .filter((r) => !queuedShops.has(r.id))
    .filter((r) => r.checkedAt === undefined || now - r.checkedAt >= BALANCE.giftShop.roomRecheckSeconds)
    .filter((r) => {
      try {
        return dim(r.dimension).isChunkLoaded(r.pos);
      } catch {
        return false;
      }
    })
    .sort((a, b) => (a.checkedAt ?? -Infinity) - (b.checkedAt ?? -Infinity))[0];
  if (due) queueMeasure(due.id);
  for (const rec of shops) checkShop(rec);
}

// A player placed or broke a block: measure the shops it could touch again.
export function shopBlockChanged(dimensionId, pos) {
  for (const rec of allShops()) {
    if (rec.dimension !== dimensionId) continue;
    const b = rec.bbox ?? { min: rec.pos, max: rec.pos };
    if (pos.x >= b.min.x - 3 && pos.x <= b.max.x + 3 && pos.y >= b.min.y - 3 && pos.y <= b.max.y + 3 && pos.z >= b.min.z - 3 && pos.z <= b.max.z + 3) shopsToCheck.add(rec.id);
  }
}

export function shopText(rec) {
  if (rec.problem) return `§e${SHOP_TEXT[rec.problem]}`;
  return rec.stock > 0 ? `§aGift Shop: open, ${rec.stock} souvenirs at ${rec.price} coins.` : "§eGift Shop: sold out. Stock it so guests can buy souvenirs.";
}

// Tell the player who placed a Gift Shop whether it's ready.
export function shopPlaced(player, block) {
  const rec = checkShop(ensure(block), true);
  message(player, working(rec) ? `§a${shopText(rec)} §fUse it to stock souvenirs and set the price.` : `§eGift Shop: ${SHOP_TEXT[rec.problem]}`);
}

// One visitor step with guests arriving: each working shop with stock gets its share of them.
export function giftStep(guests, stepKey) {
  const park = getPark();
  if (!park || guests <= 0) return;
  const shops = workingShops().filter((s) => s.stock > 0);
  if (!shops.length) return;
  const seen = viewedSummary();
  let income = 0;
  for (const s of shops) {
    const sale = giftSales({ guests: guests / shops.length, price: s.price, stock: s.stock, carry: s.carry ?? 0, welfare: seen.welfare, species: seen.species }, BALANCE);
    s.carry = sale.carry;
    if (sale.sold > 0) {
      const res = earn(sale.revenue, `Gift Shop: ${sale.sold} souvenir${sale.sold === 1 ? "" : "s"} sold at ${s.price}`, `gift:${s.id}:${stepKey}`);
      if (res.ok && !res.duplicate) {
        s.stock -= sale.sold;
        const day = park.today.day;
        s.soldToday = s.soldDay === day ? (s.soldToday ?? 0) + sale.sold : sale.sold;
        s.soldDay = day;
        income += sale.revenue;
      }
    }
    db.put(EQUIP, s);
  }
  if (income > 0) recordVisitors({ revenue: income });
}

// --- actions (the Gift Shop menu calls these) ---

export function stockShop(player, rec) {
  if (!can(player, "care")) return message(player, denyText("care"));
  const cap = BALANCE.giftShop.capacity;
  let added = 0;
  for (const [item, units] of Object.entries(BALANCE.giftItems)) {
    const room = Math.floor((cap - rec.stock - added) / units);
    const n = Math.min(room, countItem(player, item));
    if (n > 0 && takeItem(player, item, n)) added += n * units;
  }
  if (!added) return message(player, rec.stock >= cap ? "§eThe shop is full." : "§eYou have nothing the shop can sell. Wool makes plush toys (2 each), paper makes postcards, and paintings make prints (3 each).");
  rec.stock += added;
  db.put(EQUIP, rec);
  db.flush();
  message(player, `§aAdded ${added} souvenirs. The shop holds ${rec.stock}.`);
}

export function buySouvenirs(player, rec) {
  if (!can(player, "spend")) return message(player, denyText("spend"));
  const g = BALANCE.giftShop;
  const n = Math.min(g.wholesaleBundle, g.capacity - rec.stock);
  if (n <= 0) return message(player, "§eThe shop is full.");
  const cost = n * g.wholesaleCost;
  const res = spend(player, cost, `Bought ${n} souvenirs for a Gift Shop`, newId("gifts"));
  if (!res.ok) return message(player, `§cNot enough Zoo Coins (${cost} needed).`);
  rec.stock += n;
  db.put(EQUIP, rec);
  db.flush();
  message(player, `§aBought ${n} souvenirs for ${cost} coins. The shop holds ${rec.stock}.`);
}

export function setGiftPrice(rec, price) {
  rec.price = price;
  db.put(EQUIP, rec);
}

export function giftShopComponent(openMenu) {
  return {
    onPlace(e) {
      ensure(e.block);
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      runLater(() => openMenu(player, checkShop(rec, true)));
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      db.remove(EQUIP, id);
      shopsToCheck.delete(id);
      // The stock comes back as paper, so it isn't lost.
      const g = BALANCE.giftShop;
      let count = Math.floor((rec.stock ?? 0) / g.refundPerItem);
      const d = e.block.dimension;
      const where = e.block.center();
      runLater(() => {
        while (count > 0) {
          const s = new ItemStack(g.refundItem, 1);
          s.amount = Math.min(count, s.maxAmount);
          count -= s.amount;
          d.spawnItem(s, where);
        }
      });
    },
  };
}
