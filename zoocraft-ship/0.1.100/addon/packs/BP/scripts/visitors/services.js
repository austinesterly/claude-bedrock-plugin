import { system, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { BLOCKS, ITEMS } from "../data/items.js";
import { posKey, newId } from "../core/ids.js";
import { emit } from "../core/events.js";
import { getPark, parkTime, insidePark, can, denyText, setServiceState, recordVisitors } from "../park/park.js";
import { earn, spend } from "../economy/economy.js";
import { exhibitAt, getExhibit } from "../exhibits/exhibits.js";
import { animalsIn, welfare } from "../animals/animals.js";
import { allPoints } from "./points.js";
import { pointSlot } from "./demand.js";
import { pathLinked, currentNetwork } from "./network.js";
import { standSpot } from "./sight.js";
import { cellsOf, LAYOUTS } from "../equipment/multiblock.js";
import { DIR, needsClearSpace, fillParts, structureBlocks, mainBlockOf, mainBroken, partBroken } from "../equipment/structures.js";
import { snackSales, litterFlow, litterProduced, donations, servicesScore, coverageSteps, binnedShare, binsNeeded, benchesNeeded, amenityBonus, restroomsNeeded, fountainsNeeded } from "./serviceRules.js";
import { timedJob } from "../core/perf.js";
import { log } from "../core/log.js";
import { dim, blockReader, countItem, takeItem, message, heldItem, setHeldItem } from "../platform/mc.js";
import { binRaid } from "../animals/climbRules.js";

// Guest services (spec section 12): Snack Stands sell food from stock, Benches give guests a
// seat, Litter Bins catch litter before it lands on the paths, and Donation Boxes near a working
// Viewing Point collect coins that grow with animal welfare. Each counts only when a guest path
// from the entrance reaches it. Records live in "equipment", keyed by block position.
// Raccoons (0.1.71, animals/raccoon.js) loose at night knock over Litter Bins that have no Bin Latch:
// the litter spills onto the paths and the bin catches nothing until someone stands it up. A latched
// bin they try and give up on. Using a Bin Latch on a bin fits it (and stands the bin up).
// Coverage (0.1.99, research/guests_plan.md): bins and benches count by how much of the path network they're near
// (serviceRules.js coverageSteps, worked out as a job whenever the network or the working bins and benches change).
// The bins catch half the litter when they're only by the gate and all of it when they're along every path; bunched-up
// benches count for less; bins and benches near nearly all the paths, enough of them, bring a few more guests.
// Keepers empty bins three-quarters full (staff/staff.js).
// 0.1.100: Restrooms and Water Fountains are parts of the services score (guests walk to them too), Path Lamps and
// Planters two more amenities counted by how much of the paths they cover.

const EQUIP = "equipment";
/** @type {any} Custom block states aren't in the vanilla typings. */
const FILL = "zoocraft:fill";
/** @type {any} */
const LATCHED = "zoocraft:latched";
/** @type {any} */
const TIPPED = "zoocraft:tipped";
const TYPE_OF_BLOCK = {
  [BLOCKS.snackStand]: "stand",
  [BLOCKS.bench]: "bench",
  [BLOCKS.litterBin]: "bin",
  [BLOCKS.donationBox]: "donation",
  [BLOCKS.restroom]: "restroom",
  [BLOCKS.waterFountain]: "fountain",
  [BLOCKS.pathLamp]: "lamp",
  [BLOCKS.planter]: "planter",
};
export const SERVICE_NAMES = { stand: "Snack Stand", bench: "Bench", bin: "Litter Bin", donation: "Donation Box", restroom: "Restroom", fountain: "Water Fountain", lamp: "Path Lamp", planter: "Planter" };
// The services guests walk up to and stand beside (visitors/guests.js): each keeps the spot beside it.
export const WALK_TO = new Set(["stand", "bench", "restroom", "fountain"]);

export function allServices(type) {
  return db.all(EQUIP).filter((e) => (type ? e.type === type : SERVICE_NAMES[e.type]));
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    const type = TYPE_OF_BLOCK[block.typeId];
    rec = { id, type, blockId: block.typeId, dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, dir: block.permutation.getState(DIR), linked: undefined, problem: "unchecked" };
    if (type === "stand") Object.assign(rec, { stock: 0, price: BALANCE.snacks.defaultPrice, carry: 0, soldToday: 0, soldDay: 0 });
    if (type === "bin") rec.fill = 0;
    db.put(EQUIP, rec);
  }
  return rec;
}

// Re-check where a service block stands and whether a path reaches it. Keeps the last answer for
// whatever the latest path walk couldn't tell.
export function checkService(rec) {
  const linked = linkedAny(rec);
  if (linked !== undefined) rec.linked = linked;
  if (!insidePark(rec.dimension, rec.pos)) rec.problem = "outside";
  else if (exhibitAt(rec.dimension, rec.pos)) rec.problem = "inside";
  else if (rec.linked === false) rec.problem = "path";
  else if (rec.linked === undefined) rec.problem = "unchecked";
  else rec.problem = undefined;
  const d = dim(rec.dimension);
  if ((WALK_TO.has(rec.type) || LAYOUTS[rec.blockId]) && d.isChunkLoaded(rec.pos)) {
    if (WALK_TO.has(rec.type)) rec.spot = standSpot(blockReader(d), rec.pos);
    completeParts(rec);
  }
  db.put(EQUIP, rec);
  refreshLook(rec);
  return rec;
}

// A path beside any ground cell of a wide stand or bench reaches it.
function linkedAny(rec) {
  const ground = cellsOf(rec.blockId, rec.pos, rec.dir).filter((c) => c.pos.y === rec.pos.y);
  const answers = ground.map((c) => pathLinked(rec.dimension, c.pos));
  if (answers.includes(true)) return true;
  if (answers.includes(undefined)) return undefined;
  return false;
}

// --- multi-block parts (equipment/multiblock.js, equipment/structures.js) ---

// Fill in any missing part of a wide stand or bench (stands and benches placed before they were
// widened, or parts lost to an explosion).
function completeParts(rec) {
  const dir = fillParts(dim(rec.dimension), rec.blockId, rec.pos);
  if (dir) rec.dir = dir;
}

export function checkAllServices() {
  for (const rec of allServices()) checkService(rec);
  coverageDue();
}

// Every park second, the services whose turn it is: each is checked once every `every` park seconds (a visitor step) at
// a second of its own, as the Viewing Points are (0.1.96: a full park's stands, benches and bins all on the minute were
// one of its slowest moments). Placing or using one still checks it at once.
export function checkServicesDue(parkTime, every) {
  const now = Math.floor(parkTime) % every;
  for (const rec of allServices()) if (pointSlot(rec.id, every) === now) checkService(rec);
  coverageDue();
}

// A knocked-over bin catches nothing until it's stood up.
const working = (rec) => !rec.problem && !rec.tipped;

// --- coverage (0.1.99) ---

// The share of the reached path blocks near a working bin, a working bench, a lamp and a planter (0.1.100); undefined
// until the first count is done (the litter then goes to the bins as before 0.1.99).
const cover = { bins: undefined, benches: undefined, lamps: undefined, planters: undefined, sig: "", running: false };
// What's counted: [cover key, service type, the BALANCE section with its coverRange and coverRise].
const COVERED = [
  ["bins", "bin", "litter"],
  ["benches", "bench", "seating"],
  ["lamps", "lamp", "lamps"],
  ["planters", "planter", "planters"],
];
const netIds = new WeakMap();
let netSeq = 0;
const netId = (net) => netIds.get(net) ?? (netIds.set(net, ++netSeq), netSeq);
const posSig = (p) => `${p.x},${p.y},${p.z}`;

function coverPoints(type, dimensionId) {
  return allServices(type)
    .filter((r) => working(r) && r.dimension === dimensionId)
    .map((r) => r.pos);
}

// Count again when the path network or the working bins, benches, lamps and planters have changed since the last count.
function coverageDue() {
  const cur = currentNetwork();
  if (!cur || cover.running) return;
  const sets = COVERED.map(([key, type, section]) => ({ key, section, points: coverPoints(type, cur.dimension) }));
  const sig = `${netId(cur.net)}|${sets.map((s) => s.points.map(posSig).join(";")).join("|")}`;
  if (sig === cover.sig) return;
  cover.running = true;
  system.runJob(
    timedJob("coverage", (function* () {
      try {
        const shares = {};
        for (const s of sets) {
          const c = BALANCE[s.section];
          // A yield* on its own: QuickJS can't compile one inside a longer expression in a try ("unconsistent stack size").
          const r = yield* coverageSteps(cur.net.columns, cur.net.size, s.points, c.coverRange, c.coverRise);
          shares[s.key] = r.share;
        }
        Object.assign(cover, shares);
        cover.sig = sig;
      } catch (error) {
        log(`services: the coverage count failed: ${error}`);
      } finally {
        cover.running = false;
      }
    })()),
  );
}

export function coverageNow() {
  return { bins: cover.bins, benches: cover.benches, lamps: cover.lamps, planters: cover.planters };
}

function refreshLook(rec) {
  if (rec.type !== "stand" && rec.type !== "bin") return;
  try {
    const d = dim(rec.dimension);
    if (!d.isChunkLoaded(rec.pos)) return;
    const block = d.getBlock(rec.pos);
    if (!block || block.typeId !== rec.blockId) return;
    const value = rec.type === "stand" ? (rec.stock > 0 ? 1 : 0) : rec.fill <= 0 ? 0 : rec.fill < BALANCE.litter.binCapacity * 0.75 ? 1 : 2;
    // The stand's food tray spans its upper parts, so every part carries the fill state.
    const blocks = rec.type === "stand" ? structureBlocks(d, rec.blockId, rec.pos, block.permutation.getState(DIR)) : [block];
    for (const b of blocks) if (b.permutation.getState(FILL) !== value) b.setPermutation(b.permutation.withState(FILL, value));
    // A bin shows its latch too, and lies on its side when a raccoon has knocked it over.
    if (rec.type === "bin") {
      const perm = block.permutation;
      const latched = Boolean(rec.latched);
      const tipped = Boolean(rec.tipped);
      if (perm.getState(LATCHED) !== latched || perm.getState(TIPPED) !== tipped) block.setPermutation(perm.withState(LATCHED, latched).withState(TIPPED, tipped));
    }
  } catch {
    // Unloaded or replaced; the look catches up next time.
  }
}

// Donation Boxes count near a Viewing Point that guests can see animals from.
function nearViewing(rec) {
  const r = BALANCE.donations.range;
  return allPoints("viewpoint").some((v) => v.viewed && v.dimension === rec.dimension && Math.abs(v.pos.x - rec.pos.x) <= r && Math.abs(v.pos.z - rec.pos.z) <= r && Math.abs(v.pos.y - rec.pos.y) <= r);
}

function viewedWelfare() {
  return viewedSummary().welfare;
}

// What guests can see from working Viewing Points: the animals' average welfare and how many kinds.
export function viewedSummary() {
  const ids = new Set(allPoints("viewpoint").filter((v) => v.viewed && v.exhibitId).map((v) => v.exhibitId));
  const species = new Set();
  const list = [...ids].flatMap((id) => {
    const ex = getExhibit(id);
    const animals = ex ? animalsIn(ex) : [];
    if (animals.length) for (const id of ex.speciesIds ?? [ex.speciesId]) species.add(id); // every species in a shared exhibit (0.1.61)
    return animals.map(welfare);
  });
  return { welfare: list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0, species: species.size };
}

// One visitor step with guests arriving: snacks, litter and donations. `stepKey` makes each
// payment's operation id unique to this step, so a replay can't pay twice.
export function serviceStep(guests, stepKey) {
  const park = getPark();
  if (!park || guests <= 0) return;
  let income = 0;
  let sold = 0;
  const stands = allServices("stand").filter((s) => working(s) && s.stock > 0);
  for (const s of stands) {
    const sale = snackSales({ guests: guests / stands.length, price: s.price, stock: s.stock, carry: s.carry ?? 0 }, BALANCE);
    s.carry = sale.carry;
    if (sale.sold > 0) {
      const res = earn(sale.revenue, `Snacks: ${sale.sold} sold at ${s.price}`, `snack:${s.id}:${stepKey}`);
      if (res.ok && !res.duplicate) {
        s.stock -= sale.sold;
        const day = park.today.day;
        s.soldToday = s.soldDay === day ? (s.soldToday ?? 0) + sale.sold : sale.sold;
        s.soldDay = day;
        income += sale.revenue;
        sold += sale.sold;
      }
    }
    db.put(EQUIP, s);
    refreshLook(s);
  }
  const bins = allServices("bin").filter(working);
  // The bins' share of the litter goes to them, in turn while they have room (0.1.99: by how much of the paths they're near).
  const produced = litterProduced(guests, sold, BALANCE);
  const caught = bins.length ? produced * binnedShare(cover.bins ?? 1, BALANCE) : 0;
  const flow = litterFlow(caught, bins.map((b) => b.fill ?? 0), BALANCE);
  bins.forEach((b, i) => {
    b.fill = flow.fills[i];
    db.put(EQUIP, b);
    refreshLook(b);
  });
  const litter = Math.min(BALANCE.litter.max, (park.litter ?? 0) + flow.overflow + (produced - caught));
  const boxes = allServices("donation").filter((b) => working(b) && nearViewing(b)).length;
  const gift = donations({ guests, boxes, welfare: viewedWelfare(), carry: park.donationCarry ?? 0 }, BALANCE);
  setServiceState({ litter, donationCarry: gift.carry });
  if (gift.coins > 0) {
    const res = earn(gift.coins, `Donations from ${guests} guest${guests === 1 ? "" : "s"}`, `donation:${stepKey}`);
    if (res.ok && !res.duplicate) income += gift.coins;
  }
  if (income > 0) recordVisitors({ revenue: income });
}

// The services satisfaction factor right now, for the park rating, with the well-furnished park's bonus (0.1.99:
// `amenities` says how each amenity stands, `bonus` the share more guests a day; 0.1.100: `facilities` the Restrooms
// and Water Fountains against the need).
export function servicesNow(demand) {
  const all = allServices();
  const linkedStands = all.filter((s) => s.type === "stand" && working(s));
  const count = (type) => all.filter((s) => s.type === type && working(s)).length;
  const benches = count("bench");
  const bins = count("bin");
  const restrooms = count("restroom");
  const fountains = count("fountain");
  const score = servicesScore(
    {
      stands: linkedStands.filter((s) => s.stock > 0).length,
      standsEmpty: linkedStands.filter((s) => s.stock <= 0).length,
      benches,
      litter: getPark()?.litter ?? 0,
      demand,
      unlinked: all.filter((s) => s.problem === "path").length,
      benchCover: cover.benches ?? 1,
      restrooms,
      fountains,
    },
    BALANCE,
  );
  const amenities = amenityBonus(
    {
      bins: { cover: cover.bins, count: bins, need: binsNeeded(demand, BALANCE) },
      benches: { cover: cover.benches, count: benches, need: benchesNeeded(demand, BALANCE) },
      lamps: { cover: cover.lamps, count: count("lamp"), need: 1 },
      planters: { cover: cover.planters, count: count("planter"), need: 1 },
    },
    BALANCE,
  );
  const facilities = {
    restrooms: { count: restrooms, need: restroomsNeeded(demand, BALANCE), part: score.parts.restrooms },
    fountains: { count: fountains, need: fountainsNeeded(demand, BALANCE), part: score.parts.drinks },
  };
  return { ...score, amenities, facilities, bonus: amenities.bonus };
}

// Litter Bins for the keepers to empty (0.1.99): working ones three-quarters full or more.
export function binsToEmpty() {
  const at = BALANCE.litter.binCapacity * BALANCE.staff.binEmptyAt;
  return allServices("bin").filter((b) => working(b) && (b.fill ?? 0) >= at);
}

// A keeper empties a bin; how much it held, or undefined when it isn't a bin any more.
export function keeperEmptyBin(id) {
  const rec = db.get(EQUIP, id);
  if (rec?.type !== "bin") return undefined;
  const had = Math.round(rec.fill ?? 0);
  rec.fill = 0;
  db.put(EQUIP, rec);
  refreshLook(rec);
  return had;
}

export function serviceText(rec) {
  const name = SERVICE_NAMES[rec.type];
  switch (rec.problem) {
    case "outside":
      return `§c${name}: outside the park. Guests only visit inside the park boundary.`;
    case "inside":
      return `§c${name}: this is inside an exhibit. Put it on the guest side of the fence.`;
    case "path":
      return `§e${name}: no guest path reaches it. Lay a path (gravel, dirt path, bricks, planks...) from the Park Entrance Gate to right beside it.`;
    case "unchecked":
      return `§7${name}: checking the paths... use it again in a moment. Is there a Park Entrance Gate yet?`;
  }
  switch (rec.type) {
    case "stand":
      return rec.stock > 0 ? `§aSnack Stand: open, ${rec.stock} snacks at ${rec.price} coins.` : "§eSnack Stand: out of food. Stock it so guests can buy snacks.";
    case "bench":
      return "§aBench: guests can sit here.";
    case "bin": {
      const cap = BALANCE.litter.binCapacity;
      if (rec.tipped) return "§eLitter Bin: knocked over by a raccoon! Use it to stand it up: lying down it catches no litter. A Bin Latch (use one on the bin) keeps raccoons out.";
      const latch = rec.latched ? " §7Latched: raccoons can't open it." : " §7No latch: raccoons out at night knock it over (use a Bin Latch on it).";
      return rec.fill >= cap ? `§eLitter Bin: full! Empty it, or litter lands on the paths.${latch}` : `§aLitter Bin: ${Math.round(rec.fill)} of ${cap} full.${latch}`;
    }
    case "donation":
      return nearViewing(rec) ? "§aDonation Box: guests are giving. Happier animals, bigger gifts." : `§eDonation Box: no working Viewing Point within ${BALANCE.donations.range} blocks. Guests give where they can see the animals.`;
    case "restroom":
      return `§aRestroom: open. §7Guests need one for every ${BALANCE.restrooms.guestsPer} a day (the Park Ledger's Finances page says how many).`;
    case "fountain":
      return `§aWater Fountain: guests can get a drink here. §7One for every ${BALANCE.drinks.guestsPer} guests a day is enough.`;
    case "lamp":
      return `§aPath Lamp: lights the paths within ${BALANCE.lamps.coverRange} blocks, so no monsters spawn on them at night. §7Lamps lighting ${Math.round(BALANCE.amenities.lamps.cover * 100)}% of the paths bring more guests.`;
    case "planter":
      return `§aPlanter: guests enjoy the flowers along the path. §7Planters near ${Math.round(BALANCE.amenities.planters.cover * 100)}% of the paths bring more guests.`;
  }
  return "";
}

// --- actions (the Snack Stand menu and the blocks call these) ---

export function stockFromInventory(player, rec) {
  if (!can(player, "care")) return message(player, denyText("care"));
  const cap = BALANCE.snacks.capacity;
  let added = 0;
  for (const [item, units] of Object.entries(BALANCE.snackFoods)) {
    const room = Math.floor((cap - rec.stock - added) / units);
    const n = Math.min(room, countItem(player, item));
    if (n > 0 && takeItem(player, item, n)) added += n * units;
  }
  if (!added) return message(player, rec.stock >= cap ? "§eThe stand is full." : "§eYou have no food the stand can sell (bread, cookies, apples, melon slices, baked potatoes, pumpkin pie, cake, sweet berries).");
  rec.stock += added;
  db.put(EQUIP, rec);
  db.flush();
  refreshLook(rec);
  message(player, `§aAdded ${added} snacks. The stand holds ${rec.stock}.`);
}

export function buyStock(player, rec) {
  if (!can(player, "spend")) return message(player, denyText("spend"));
  const s = BALANCE.snacks;
  const n = Math.min(s.wholesaleBundle, s.capacity - rec.stock);
  if (n <= 0) return message(player, "§eThe stand is full.");
  const cost = n * s.wholesaleCost;
  const res = spend(player, cost, `Bought ${n} snacks for a Snack Stand`, newId("snacks"));
  if (!res.ok) return message(player, `§cNot enough Zoo Coins (${cost} needed).`);
  rec.stock += n;
  db.put(EQUIP, rec);
  db.flush();
  refreshLook(rec);
  message(player, `§aBought ${n} snacks for ${cost} coins. The stand holds ${rec.stock}.`);
}

export function setSnackPrice(rec, price) {
  rec.price = price;
  db.put(EQUIP, rec);
}

function emptyBin(player, rec) {
  if (!can(player, "care")) return message(player, serviceText(rec));
  const had = Math.round(rec.fill ?? 0);
  rec.fill = 0;
  db.put(EQUIP, rec);
  refreshLook(rec);
  const latch = rec.latched ? "" : " §7No latch: raccoons out at night can knock it over (use a Bin Latch on it).";
  message(player, `${had ? `§aEmptied the Litter Bin (${had} litter).` : "§7The Litter Bin is already empty."}${latch}`);
  if (had) emit("careGiven", { player, kind: "bin" });
}

// A Bin Latch on a bin keeps raccoons out: they try the lid and give up. Fitting one stands a
// knocked-over bin up too.
function latchBin(player, rec) {
  if (!can(player, "care")) return message(player, denyText("care"));
  if (rec.latched) return message(player, "§7This Litter Bin already has a latch.");
  const stack = heldItem(player);
  if (stack?.typeId !== ITEMS.binLatch) return;
  if (stack.amount > 1) {
    stack.amount -= 1;
    setHeldItem(player, stack);
  } else setHeldItem(player, undefined);
  rec.latched = true;
  rec.tipped = false;
  db.put(EQUIP, rec);
  refreshLook(rec);
  message(player, "§aFitted a Bin Latch: raccoons can't open this bin now. §7Guests use it and you empty it as before.");
}

function standBin(player, rec) {
  if (!can(player, "care")) return message(player, serviceText(rec));
  rec.tipped = false;
  db.put(EQUIP, rec);
  refreshLook(rec);
  message(player, `§aStood the Litter Bin back up.${rec.latched ? "" : " §7Fit a Bin Latch (use one on it) and raccoons can't knock it over."}`);
}

// A raccoon at a Litter Bin at night (animals/raccoon.js; spec 5.x "attracted to unsecured bins"),
// as animals/climbRules.js binRaid decides: a bin knocked over spills what was in it and the scraps
// the raccoon drags out onto the paths (a working bin's only: one off the paths spills nowhere that
// counts), and catches nothing until it's stood up. { outcome, spilled, rec }, or undefined when
// there's no bin there.
export function raidBin(dimensionId, pos) {
  const rec = db.get(EQUIP, posKey(dimensionId, pos));
  if (rec?.type !== "bin") return undefined;
  const r = binRaid(rec, BALANCE);
  if (r.outcome !== "tipped") return { ...r, rec };
  const park = getPark();
  if (park && !rec.problem) setServiceState({ litter: Math.min(BALANCE.litter.max, (park.litter ?? 0) + r.spilled) });
  rec.tipped = true;
  rec.fill = 0;
  db.put(EQUIP, rec);
  refreshLook(rec);
  return { ...r, rec };
}

// Sweeping a path with the Cleaning Rake picks litter up off the paths.
const lastSweep = new Map();
export function sweepPath(player) {
  const park = getPark();
  if (!park) return false;
  const now = parkTime();
  if (now - (lastSweep.get(player.id) ?? -Infinity) < BALANCE.litter.rakeCooldown) return true;
  lastSweep.set(player.id, now);
  const before = park.litter ?? 0;
  if (before <= 0) {
    message(player, "§7The paths are clean.");
    return true;
  }
  const after = Math.max(0, before - BALANCE.litter.rakeSweeps);
  setServiceState({ litter: after });
  message(player, `§aSwept the paths. §7Litter ${Math.round(before)} -> ${Math.round(after)}.`);
  return true;
}

function interact(player, block) {
  const rec = ensure(block);
  system.run(() => {
    checkService(rec);
    if (rec.type === "stand") return emit("openStand", { player, stand: rec });
    if (rec.type === "bin" && heldItem(player)?.typeId === ITEMS.binLatch) return latchBin(player, rec);
    if (rec.type === "bin" && rec.tipped) return standBin(player, rec);
    if (rec.type === "bin" && !rec.problem) return emptyBin(player, rec);
    message(player, serviceText(rec));
  });
}

// The record goes with the block; a stand hands back its food as bread, so stock isn't lost.
function forget(d, pos) {
  const id = posKey(d.id, pos);
  const rec = db.get(EQUIP, id);
  db.remove(EQUIP, id);
  if (rec?.latched) system.run(() => d.spawnItem(new ItemStack(ITEMS.binLatch, 1), { x: rec.pos.x + 0.5, y: rec.pos.y + 0.5, z: rec.pos.z + 0.5 })); // its latch comes off with it
  if (rec?.type !== "stand" || !(rec.stock > 0)) return;
  const n = Math.floor(rec.stock / BALANCE.snacks.refundPerItem);
  const where = { x: rec.pos.x + 0.5, y: rec.pos.y + 0.5, z: rec.pos.z + 0.5 };
  if (n > 0) system.run(() => d.spawnItem(new ItemStack(BALANCE.snacks.refundItem, n), where));
}

// Custom component for the service blocks (the main block of a stand, bench, restroom or lamp).
export function serviceComponent() {
  return {
    beforeOnPlayerPlace: needsClearSpace,
    onPlace(e) {
      const block = e.block;
      const rec = ensure(block);
      system.run(() => completeParts(rec));
      system.runTimeout(() => {
        const cur = db.get(EQUIP, rec.id);
        if (cur) checkService(cur);
      }, 10);
    },
    onPlayerInteract(e) {
      if (e.player) interact(e.player, e.block);
    },
    onPlayerBreak(e) {
      forget(e.block.dimension, { x: e.block.x, y: e.block.y, z: e.block.z });
      mainBroken(e);
    },
  };
}

// The extra blocks of a wide stand or bench, or a tall restroom or lamp: they pass a click on to the main block, and breaking
// one breaks the whole thing and drops one item.
export function servicePartComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const main = mainBlockOf(e.block, e.block.permutation);
      if (main) return interact(player, main);
      system.run(() => e.block.isValid && e.block.setType("minecraft:air")); // a leftover part
    },
    onPlayerBreak(e) {
      partBroken(e, forget);
    },
  };
}
