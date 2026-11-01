import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { BALANCE } from "../data/balance.js";
import { posKey } from "../core/ids.js";
import { getPark, parkTime, insidePark, recordVisitors, inScopeAt, runLater, scopedJob } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { exhibitAt, getExhibit, speciesIn } from "../exhibits/exhibits.js";
import { measureRoom, measureRoomSteps } from "../staff/rules.js";
import { pathLinked } from "./network.js";
import { allPoints } from "./points.js";
import { mobHouseSales, pensOnView, MOB_HOUSE_TEXT } from "../animals/mobRules.js";
import { refreshMobGuard } from "../animals/mobs.js";
import { dim, blockReader, message, onlinePlayers } from "../platform/mc.js";

// The Mob House (0.1.163, module 11: research/mobhouse_plan.md). Like the Gift Shop, a building the players make: the
// Mob House block goes inside a closed hall (at least 3 x 3 x 3 inside, the Staff Room's check), where guests walk, and
// a guest path has to reach it. Mob pens are exhibits beside the hall, walled off from it (glass or bars to look
// through); guests pay the house's entry price once they can see a mob in a pen from a Viewing Point in the hall. Wild
// monsters never spawn in the hall or the pens (animals/mobs.js). Records live in "equipment" (type "mobhouse"), keyed
// by position.

const EQUIP = "equipment";
const housesToCheck = new Set();

// The scope's park's Mob Houses while a loop runs for one park (park/park.js inScopeAt).
export function allHouses() {
  return db.all(EQUIP).filter((e) => e.type === "mobhouse" && inScopeAt(e));
}

const working = (rec) => !rec.problem;

export function workingHouses() {
  return allHouses().filter(working);
}

// Does the Mob House with this id still have its hall (what a pen beside it needs; the path is only for the guests)?
export function houseWorks(id) {
  return db.get(EQUIP, id)?.room === "ok";
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "mobhouse", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, price: BALANCE.mobHouse.defaultPrice, carry: 0, paidToday: 0, paidDay: 0, pens: 0, problem: "unchecked" };
    db.put(EQUIP, rec);
  }
  return rec;
}

function roomOpts(perYield = Infinity) {
  const g = BALANCE.mobHouse;
  return { minSize: g.roomMinSize, maxCells: g.roomMaxCells, perYield };
}

// Measure the hall round the block (the Staff Room's rule). Keeps the last answer when it isn't loaded.
function measure(rec) {
  let r;
  try {
    r = measureRoom(blockReader(dim(rec.dimension)), rec.pos, roomOpts());
  } catch {
    r = { ok: false, reason: "unloaded" };
  }
  applyMeasure(rec, r);
}

// The re-measures after an edit and the regular ones queue in one job, a slice of the walk at a time (the Gift Shop's).
const houseJobs = jobQueue((gen) => system.runJob(timedJob("mobhouses", gen)), (error) => log(`mob house: a hall check failed: ${error}`));
const queued = new Set();

function queueMeasure(id) {
  if (queued.has(id)) return;
  queued.add(id);
  houseJobs.push(scopedJob((function* () {
    let r;
    try {
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      try {
        r = yield* measureRoomSteps(blockReader(dim(rec.dimension)), rec.pos, roomOpts(BALANCE.mobHouse.roomCellsPerYield));
      } catch {
        r = { ok: false, reason: "unloaded" };
      }
    } finally {
      queued.delete(id);
    }
    const rec = db.get(EQUIP, id);
    if (!rec || !r) return;
    applyMeasure(rec, r);
    checkHouse(rec);
  })()));
}

function applyMeasure(rec, r) {
  if (r.reason === "unloaded") return;
  const was = rec.room;
  rec.room = r.ok ? "ok" : r.reason;
  rec.space = r.cells ?? 0;
  rec.bbox = r.bbox;
  rec.checkedAt = parkTime();
  if (was !== rec.room) runLater(refreshMobGuard); // the spawn guard covers working halls only
}

// Re-check a Mob House: where it stands, its hall (when `measureNow` or never measured) and its path.
export function checkHouse(rec, measureNow = false) {
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
    for (const p of onlinePlayers()) if (park?.members[p.id]) message(p, `§eThe Mob House at ${rec.pos.x}, ${rec.pos.y}, ${rec.pos.z} has closed. §f${MOB_HOUSE_TEXT[rec.problem]}`);
  }
  return rec;
}

// Every visitor step: houses waiting after an edit, then the one measured longest ago, into the job; the rest of each
// house's check (where it stands, its path) at once.
export function checkHouses() {
  for (const id of [...housesToCheck]) {
    housesToCheck.delete(id);
    queueMeasure(id);
  }
  const now = parkTime();
  const houses = allHouses();
  const due = houses
    .filter((r) => !queued.has(r.id))
    .filter((r) => r.checkedAt === undefined || now - r.checkedAt >= BALANCE.mobHouse.roomRecheckSeconds)
    .filter((r) => {
      try {
        return dim(r.dimension).isChunkLoaded(r.pos);
      } catch {
        return false;
      }
    })
    .sort((a, b) => (a.checkedAt ?? -Infinity) - (b.checkedAt ?? -Infinity))[0];
  if (due) queueMeasure(due.id);
  for (const rec of houses) checkHouse(rec);
}

// A player placed or broke a block: measure the halls it could touch again.
export function houseBlockChanged(dimensionId, pos) {
  for (const rec of allHouses()) {
    if (rec.dimension !== dimensionId) continue;
    const b = rec.bbox ?? { min: rec.pos, max: rec.pos };
    if (pos.x >= b.min.x - 3 && pos.x <= b.max.x + 3 && pos.y >= b.min.y - 3 && pos.y <= b.max.y + 3 && pos.z >= b.min.z - 3 && pos.z <= b.max.z + 3) housesToCheck.add(rec.id);
  }
}

// The pens this house shows guests now: mob pens beside it that a viewed Viewing Point in its hall looks into.
export function pensShown(rec) {
  return pensOnView(rec, allPoints("viewpoint"), (id) => {
    const ex = getExhibit(id);
    return ex && speciesIn(ex).some((sp) => sp.mob) ? ex : undefined;
  });
}

export function houseText(rec) {
  if (rec.problem) return `§e${MOB_HOUSE_TEXT[rec.problem]}`;
  const pens = pensShown(rec).length;
  return pens ? `§aMob House: open, entry ${rec.price} coins, ${pens} mob pen${pens === 1 ? "" : "s"} on view from its hall.` : "§eMob House: open, but no mob pen is on view yet. Guests pay to go in once they can see a mob in a pen from a Viewing Point standing in the hall.";
}

// Tell the player who placed a Mob House whether it's ready.
export function housePlaced(player, block) {
  const rec = checkHouse(ensure(block), true);
  message(player, working(rec) ? `§a${houseText(rec)} §fUse it to set the entry price. Build the mob pens beside the hall.` : `§eMob House: ${MOB_HOUSE_TEXT[rec.problem]}`);
}

// One visitor step with guests arriving: each working Mob House with a mob pen on view gets its share of them, and
// each who goes in pays its price.
export function mobHouseStep(guests, stepKey) {
  const park = getPark();
  if (!park || guests <= 0) return;
  const houses = workingHouses();
  if (!houses.length) return;
  let income = 0;
  for (const h of houses) {
    const pens = pensShown(h).length;
    h.pens = pens;
    const sale = mobHouseSales({ guests: guests / houses.length, price: h.price, carry: h.carry ?? 0, pens }, BALANCE);
    h.carry = sale.carry;
    if (sale.paid > 0) {
      const res = earn(sale.revenue, `Mob House: ${sale.paid} guest${sale.paid === 1 ? "" : "s"} at ${h.price}`, `mobhouse:${h.id}:${stepKey}`);
      if (res.ok && !res.duplicate) {
        const day = park.today.day;
        h.paidToday = h.paidDay === day ? (h.paidToday ?? 0) + sale.paid : sale.paid;
        h.paidDay = day;
        income += sale.revenue;
      }
    }
    db.put(EQUIP, h);
  }
  if (income > 0) recordVisitors({ revenue: income });
}

// --- actions (the Mob House menu calls these) ---

export function setHousePrice(rec, price) {
  rec.price = price;
  db.put(EQUIP, rec);
}

export function mobHouseComponent(openMenu) {
  return {
    onPlace(e) {
      // Measured at once if no one has (the test zoo's builder places it; a player's placing measures it in housePlaced),
      // so a pen beside it measured next finds its hall.
      const rec = ensure(e.block);
      if (rec.room === undefined) runLater(() => {
        const now = db.get(EQUIP, rec.id);
        if (now && now.room === undefined) checkHouse(now, true);
      });
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      runLater(() => openMenu(player, checkHouse(rec, true)));
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      if (!db.get(EQUIP, id)) return;
      db.remove(EQUIP, id);
      housesToCheck.delete(id);
      runLater(refreshMobGuard);
    },
  };
}
