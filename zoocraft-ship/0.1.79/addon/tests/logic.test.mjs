// Unit tests for ZooCraft's pure logic. Run: node --test tests/
// These modules import nothing from Minecraft, so they run in plain Node. In-game behavior
// (movement, saving the real world, forms) still needs the test world: see docs/M1_test_plan.md.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { Store } from "../packs/BP/scripts/persistence/store.js";
import { floodTerrestrial, floodAerial, floodClimb, newResult, newClimbResult, isReachable } from "../packs/BP/scripts/exhibits/geometry.js";
import { simulateAnimal, welfareScore, band } from "../packs/BP/scripts/animals/welfare.js";
import { applyLedger } from "../packs/BP/scripts/economy/ledger.js";
import { TRANSFERS, move, checkToken, reconcile, canMove } from "../packs/BP/scripts/transport/journal.js";
import { advance } from "../packs/BP/scripts/core/clock.js";
import { dailyDemand, arrivals, parkRating, fairPrice, valueScore, priceDemand, viewingScore, viewStatus, dominantComplaint, visibleGuests } from "../packs/BP/scripts/visitors/demand.js";
import { lineOfSight, standSpot, eyeOf, yawToward } from "../packs/BP/scripts/visitors/sight.js";
import { newNetwork, entranceStarts, walkPaths, besidePath, linkStatus } from "../packs/BP/scripts/visitors/paths.js";
import { snackShare, snackSales, litterFlow, litterProduced, donations, servicesScore, benchesNeeded } from "../packs/BP/scripts/visitors/serviceRules.js";
import { complaintText } from "../packs/BP/scripts/visitors/demand.js";
import { LAYOUTS, cellsOf, mainOf, turn, walkwayOf } from "../packs/BP/scripts/equipment/multiblock.js";
import { cleanName, MAX_NAME } from "../packs/BP/scripts/animals/names.js";
import { validateData } from "../packs/BP/scripts/data/validate.js";
import { classifyBlock, blocksView, isPathBlock } from "../packs/BP/scripts/data/blocks.js";
import { BALANCE } from "../packs/BP/scripts/data/balance.js";
import { SPECIES } from "../packs/BP/scripts/data/species.js";
import { EXHIBIT_LIMITS, HABITAT_PROFILES, requiredArea } from "../packs/BP/scripts/data/profiles.js";

const memBackend = () => {
  const m = new Map();
  return { m, get: (k) => m.get(k), set: (k, v) => (v === undefined ? m.delete(k) : m.set(k, v)), now: () => 1 };
};

// ---------- data ----------
test("data tables are consistent", () => {
  assert.deepEqual(validateData(), []);
});

test("block classifier", () => {
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("minecraft:oak_fence"), "barrier");
  assert.equal(c("minecraft:cobblestone_wall"), "barrier");
  assert.equal(c("minecraft:oak_fence_gate"), "barrier");
  assert.equal(c("minecraft:oak_fence_gate", { open: true }), "gate_open");
  assert.equal(c("minecraft:oak_wall_sign"), "air");
  assert.equal(c("minecraft:short_grass"), "air");
  assert.equal(c("minecraft:grass_block"), "solid");
  assert.equal(c("minecraft:water", { isLiquid: true }), "water");
  assert.equal(c("minecraft:lava", { isLiquid: true }), "lava");
});

// ---------- persistence ----------
test("store round trip across a 'reload', with chunking", () => {
  const be = memBackend();
  const a = new Store(be);
  for (let i = 0; i < 300; i++) a.put("animals", { id: `an_${i}`, name: "Pebble ".repeat(10) + i });
  a.flush();
  assert.ok(be.get("zoocraft:db:animals:n") > 1, "should need several chunks");
  const b = new Store(be); // fresh cache = world reopened
  assert.equal(b.all("animals").length, 300);
  assert.equal(b.get("animals", "an_299").name.endsWith("299"), true);
  // Shrinking removes stale chunks.
  for (let i = 0; i < 299; i++) b.remove("animals", `an_${i}`);
  b.flush();
  assert.equal(be.get("zoocraft:db:animals:n"), 1);
  assert.equal(be.get("zoocraft:db:animals:1"), undefined);
});

test("store migrates an old schema once and quarantines unreadable data", () => {
  const be = memBackend();
  be.set("zoocraft:db:animals:n", 1);
  be.set("zoocraft:db:animals:0", JSON.stringify({ schemaVersion: 0, records: { a: { id: "a" } } }));
  let runs = 0;
  const s = new Store(be, { migrations: { 0: (col, recs) => (runs++, Object.fromEntries(Object.entries(recs).map(([k, r]) => [k, { ...r, traits: [] }]))) } });
  assert.deepEqual(s.get("animals", "a").traits, []);
  s.flush();
  const again = new Store(be, { migrations: { 0: () => assert.fail("must not migrate twice") } });
  assert.ok(again.get("animals", "a"));
  assert.equal(runs, 1);

  be.set("zoocraft:db:park:n", 1);
  be.set("zoocraft:db:park:0", "{not json");
  const q = new Store(be);
  assert.equal(q.all("park").length, 0);
  assert.ok(be.get("zoocraft:db:park:quarantined"), "quarantine key recorded");
});

// ---------- habitat validation ----------
// Grid helper: rows of characters at feet level y=1 over a solid floor at y=0.
//   '.' open ground   'F' fence   'G' open gate   '#' solid block   'W' water   ' ' (outside: open ground)
function gridReader(rows, { roofAt } = {}) {
  return (x, y, z) => {
    const row = rows[z];
    const ch = row && x >= 0 && x < row.length ? row[x] : " ";
    if (y <= 0) return ch === "P" ? "air" : ch === "W" && y === 0 ? "solid" : "solid";
    if (roofAt && y >= roofAt) return "solid";
    if (y === 1 || y === 2) {
      if (ch === "F") return "barrier";
      if (ch === "G") return y === 1 ? "gate_open" : "air";
      if (ch === "#") return y === 1 ? "solid" : "air";
      if (ch === "W" && y === 1) return "water";
    }
    return "air";
  };
}
function run(read, seed, limits = {}) {
  const out = newResult(seed);
  const gen = floodTerrestrial(read, seed, { ...EXHIBIT_LIMITS, halfWidth: 12, minHeight: 3, ...limits }, out);
  while (!gen.next().done);
  return out;
}

test("a closed 6x6 pen is enclosed with 36 usable cells", () => {
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 3, y: 1, z: 3 });
  assert.equal(r.enclosed, true);
  assert.equal(r.usableArea, 36);
  assert.equal(r.escape, undefined);
});

test("AC-01: a pocket the animals can't reach adds no space", () => {
  const rows = ["FFFFFFFF", "F...F..F", "F...F..F", "F...FFFF", "F......F", "FFFFFFFF"];
  // The pocket at x 5-6, z 1-2 is walled off from the rest.
  const r = run(gridReader(rows), { x: 1, y: 1, z: 1 });
  assert.equal(r.enclosed, true);
  assert.equal(r.usableArea, 3 * 3 + 6); // left block 3x3 + bottom row 6
});

test("a gap in the fence is found", () => {
  const rows = ["FFFF.FFF", "F......F", "F......F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 2, y: 1, z: 1 });
  assert.equal(r.enclosed, false);
  assert.ok(r.escape, "reports where animals get out");
});

test("an open gate is a containment issue", () => {
  const rows = ["FFFGFFFF", "F......F", "F......F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 2, y: 1, z: 1 });
  assert.equal(r.enclosed, false);
  assert.ok(r.openGates.length >= 1);
});

test("a one-block step is climbable, so it isn't a wall", () => {
  const rows = ["FFFFFFFF", "F..#...F", "F..#...F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 1, y: 1, z: 1 });
  assert.equal(r.enclosed, true);
  assert.ok(r.cells.has("3,2,1"), "stands on top of the step");
});

test("water is crossed but doesn't count as land", () => {
  const rows = ["FFFFFFFF", "F..WW..F", "F..WW..F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 1, y: 1, z: 1 });
  assert.equal(r.enclosed, true);
  assert.equal(r.waterCells, 4);
  assert.equal(r.usableArea, 8);
});

test("a low roof makes cells unusable", () => {
  const rows = ["FFFFFFFF", "F......F", "FFFFFFFF"];
  const r = run(gridReader(rows, { roofAt: 3 }), { x: 1, y: 1, z: 1 });
  assert.equal(r.usableArea, 0);
  assert.equal(r.lowCeilingCells, 6);
});

test("unloaded blocks stop validation without a result", () => {
  const r = run(() => "unloaded", { x: 0, y: 1, z: 0 });
  assert.equal(r.unloaded, true);
  assert.ok(r.error);
});

test("AC-03: a feeder behind a wall isn't reachable", () => {
  const rows = ["FFFFFFFF", "F......F", "F......F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 1, y: 1, z: 1 });
  assert.equal(isReachable(r.cells, { x: 3, y: 1, z: 1 }), true); // inside, beside open ground
  assert.equal(isReachable(r.cells, { x: 3, y: 1, z: -1 }), false); // outside the north fence
});

test("required area formula (spec section 6)", () => {
  const p = HABITAT_PROFILES.small_terrestrial;
  assert.equal(requiredArea(p, 1), 36);
  assert.equal(requiredArea(p, 3), 60);
});

// ---------- welfare ----------
const rabbit = SPECIES["zoocraft:zoo_rabbit"];
const fresh = () => ({ needs: { ...BALANCE.needs.startNeeds }, criticalSeconds: 0, ill: false });

test("an animal eating its daily ration holds steady over a park day", () => {
  const a = fresh();
  let units = 32;
  for (let t = 0; t < BALANCE.clock.dayLength; t += 10) {
    const { unitsEaten } = simulateAnimal(a, rabbit, { exhibitCleanliness: 100, spaceRatio: 1, groupSize: 2, feederUnits: units }, 10, BALANCE);
    units -= unitsEaten;
  }
  assert.ok(a.needs.satiety >= 75, `satiety ${a.needs.satiety}`);
  assert.equal(32 - units, rabbit.rationUnitsPerParkDay, "ate exactly one day's ration");
});

test("AC-04: two animals can't eat the same last unit", () => {
  const a = fresh();
  const b = fresh();
  a.needs.satiety = b.needs.satiety = 10;
  let units = 1;
  for (const x of [a, b]) units -= simulateAnimal(x, rabbit, { exhibitCleanliness: 100, spaceRatio: 1, groupSize: 2, feederUnits: units }, 10, BALANCE).unitsEaten;
  assert.equal(units, 0);
  assert.ok(a.needs.satiety > b.needs.satiety);
});

test("no food: satiety drains, the animal becomes ill but never dies", () => {
  const a = fresh();
  for (let day = 0; day < 6; day++) simulateAnimal(a, rabbit, { exhibitCleanliness: 100, spaceRatio: 1, groupSize: 2, feederUnits: 0 }, BALANCE.clock.dayLength, BALANCE);
  assert.equal(a.needs.satiety, 0);
  assert.equal(a.ill, true);
  assert.equal(band(a.needs.satiety, BALANCE.needs.bands), "critical");
  assert.ok(welfareScore(a.needs, BALANCE.needs.weights) < 60);
});

// ---------- clock ----------
test("AC-08 / AC-16: only active seconds move the clock; period crossings are counted once", () => {
  const clock = { seconds: 0 };
  let sims = 0, days = 0;
  for (let i = 0; i < 1200; i++) {
    const r = advance(clock, 1, BALANCE.clock);
    sims += r.simSteps;
    days += r.daysAdvanced;
  }
  assert.equal(sims, 120);
  assert.equal(days, 1);
  // A closed world adds nothing: there is no wall-clock input at all.
  assert.equal(clock.seconds, 1200);
});

// ---------- economy ----------
test("ledger: replays pay once, balance never goes negative (AC-09, AC-10, AC-15)", () => {
  const s = new Store(memBackend());
  const park = { id: "main", balance: 0 };
  s.put("park", park);
  assert.equal(applyLedger(s, park, { opId: "grant:start", amount: 500, reason: "start", parkTime: 0 }).balance, 500);
  assert.equal(applyLedger(s, park, { opId: "grant:start", amount: 500, reason: "start", parkTime: 0 }).duplicate, true);
  assert.equal(park.balance, 500);
  assert.equal(applyLedger(s, park, { opId: "buy:1", amount: -600, reason: "too much", parkTime: 1 }).ok, false);
  assert.equal(applyLedger(s, park, { opId: "buy:2", amount: -16, reason: "rations", parkTime: 1 }).balance, 484);
  assert.throws(() => applyLedger(s, park, { opId: "x", amount: 1.5, reason: "fraction", parkTime: 1 }));
});

test("visitors: arrivals carry fractions and demand follows the rating", () => {
  const demand = dailyDemand({ stars: 3.5, occupiedExhibits: 1 }, BALANCE);
  assert.ok(demand > 0 && demand < BALANCE.economy.demandTarget);
  let carry = 0, guests = 0;
  for (let i = 0; i < 20; i++) {
    const r = arrivals(carry, demand, 60, BALANCE);
    carry = r.carry;
    guests += r.guests;
  }
  assert.equal(guests, Math.floor(demand + 1e-9));
  assert.equal(dailyDemand({ stars: 5, occupiedExhibits: 0 }, BALANCE), 0);
  const capped = parkRating({ welfare: 100, viewing: 100, services: 100, cleanliness: 100, value: 100, speciesCount: 4, operations: 100, anyCritical: true }, BALANCE);
  assert.equal(capped.stars, 2);
});

// ---------- transport ----------
test("journal: a copied carrier releases nothing, and an interrupted pack goes to holding (AC-05, AC-06)", () => {
  const s = new Store(memBackend());
  const t = { id: "tr1", token: "tk1", animalId: "an1", phase: "Reserved", createdAt: 0, updatedAt: 0 };
  s.put(TRANSFERS, t);
  assert.equal(checkToken(s, "tr1", "tk1").ok, false, "not packed yet");
  move(s, t, "Packed", 1);
  assert.equal(checkToken(s, "tr1", "tk1").ok, true);
  assert.equal(checkToken(s, "tr1", "forged").ok, false);
  move(s, t, "ArrivalPending", 2);
  move(s, t, "Exhibited", 3);
  assert.equal(checkToken(s, "tr1", "tk1").ok, false, "a second use of the same carrier fails");
  assert.equal(canMove("Exhibited", "Packed"), false);

  const r = { id: "tr2", token: "tk2", animalId: "an2", phase: "Reserved", createdAt: 0, updatedAt: 0 };
  const p = { id: "tr3", token: "tk3", animalId: "an3", phase: "ArrivalPending", createdAt: 0, updatedAt: 0 };
  s.put(TRANSFERS, r);
  s.put(TRANSFERS, p);
  const toHolding = reconcile(s, 10);
  assert.deepEqual(toHolding, ["an2"]);
  assert.equal(s.get(TRANSFERS, "tr3").phase, "Packed", "an interrupted release keeps the animal in its carrier");
  assert.equal(checkToken(s, "tr2", "tk2").ok, false, "a carrier from the interrupted pack is stale");
});

test("carrier lookup tells empty and occupied carriers apart", async () => {
  const { carrierByItem } = await import("../packs/BP/scripts/data/items.js");
  const empty = carrierByItem("zoocraft:small_carrier");
  const full = carrierByItem("zoocraft:small_carrier_occupied");
  assert.equal(empty.full, false, "an empty carrier can catch");
  assert.equal(full.full, true);
  assert.equal(empty.occupied, "zoocraft:small_carrier_occupied", "item ids are kept");
  assert.equal(carrierByItem("minecraft:stick"), undefined);
});

test("a catch explains why no exhibit has room", async () => {
  const { noRoomReason } = await import("../packs/BP/scripts/exhibits/room.js");
  const species = { id: "zoocraft:zoo_rabbit", displayName: "Rabbit" };
  const check = (ex) => {
    const population = ex.animalIds.length + 1;
    const required = 36 + 12 * Math.max(0, population - 1);
    return { cap: { population, required, usable: ex.usableArea, fits: ex.usableArea >= required }, problem: ex.problem };
  };
  const pen = { name: "Exhibit 1", state: "occupied", speciesId: species.id, animalIds: ["a1"], usableArea: 36, issues: [] };
  assert.match(noRoomReason([pen], species, check), /no room.*2 need 48 usable blocks and it has 36/);
  assert.equal(noRoomReason([{ ...pen, usableArea: 49 }], species, check), undefined);
  assert.match(noRoomReason([{ ...pen, usableArea: 49, problem: "Needs water." }], species, check), /isn't right for a Rabbit yet. Needs water/);
  assert.match(noRoomReason([{ ...pen, state: "draft", animalIds: [], issues: ["Not enclosed."] }], species, check), /isn't ready yet: Not enclosed/);
  assert.match(noRoomReason([{ ...pen, speciesId: "zoocraft:otter" }], species, check), /already holds a species Rabbits don't share with/);
  // 0.1.61: a shares(ex) check lets a companion species in (exhibits/mixing.js decides who).
  assert.equal(noRoomReason([{ ...pen, speciesId: "zoocraft:deer", usableArea: 49 }], species, check, () => true), undefined);
  assert.match(noRoomReason([{ ...pen, speciesId: "zoocraft:deer", usableArea: 49 }], species, check, () => false), /already holds a species Rabbits don't share with/);
  assert.match(noRoomReason([], species, check), /Build an exhibit first/);
});

test("otter exhibits need water, dry bank and a deep pool", async () => {
  const { habitatArea, habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const wetland = { baseArea: 64, extraArea: 20, minHeight: 4, amphibious: true, minWaterFraction: 0.35, minDryFraction: 0.25, minDeepWater: 4 };
  const dry = { amphibious: false };
  const ex = { usableArea: 40, waterCells: 30, deepWaterCells: 10 };
  assert.equal(habitatArea(ex, wetland), 70, "water counts as space for otters");
  assert.equal(habitatArea(ex, dry), 40, "but not for rabbits");
  assert.equal(habitatProblem(ex, wetland, "Otter"), undefined);
  assert.match(habitatProblem({ ...ex, waterCells: 10 }, wetland, "Otter"), /more water/);
  assert.match(habitatProblem({ usableArea: 10, waterCells: 60, deepWaterCells: 10 }, wetland, "Otter"), /dry bank/);
  assert.match(habitatProblem({ ...ex, deepWaterCells: 2 }, wetland, "Otter"), /2 blocks deep/);

  // A 9 x 9 pen: the west part is grass, the east part a pool, 2 deep in the middle.
  const grid = (x, y, z) => {
    if (x < -5 || x > 5 || z < -5 || z > 5) return "air";
    if (x === -5 || x === 5 || z === -5 || z === 5) return y === 0 || y === 1 ? "barrier" : y < 0 ? "solid" : "air";
    const pool = x >= 1;
    const deep = x >= 2 && x <= 3 && z >= -2 && z <= 2;
    if (y >= 0) return "air";
    if (y === -1) return pool ? "water" : "solid";
    if (y === -2) return deep ? "water" : "solid";
    return "solid";
  };
  const r = newResult({ x: -2, y: 0, z: 0 });
  const it = floodTerrestrial(grid, r.seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 3, cellsPerYield: 1e9 }, r);
  while (!it.next().done);
  assert.equal(r.enclosed, true);
  assert.equal(r.landCells, 45, "5 dry columns x 9");
  assert.equal(r.waterCells, 36, "4 pool columns x 9");
  assert.equal(r.deepWaterCells, 10, "2 x 5 deep spots");
});

test("tutorial steps finish in order and never go backwards", async () => {
  const { TUTORIAL_STEPS, completeSteps, currentStep, kitOffer } = await import("../packs/BP/scripts/quests/steps.js");
  const all = Object.fromEntries(TUTORIAL_STEPS.map((s) => [s.id, true]));
  assert.deepEqual(completeSteps({}, { claim: true, workshop: false, tools: true }), ["claim"], "a later fact waits for the earlier step");
  assert.equal(completeSteps({}, all).length, TUTORIAL_STEPS.length, "an existing park can finish every step at once");
  const done = { claim: 1, workshop: 2 };
  assert.deepEqual(completeSteps(done, { claim: false, workshop: false, tools: true }), ["tools"], "finished steps stay finished");
  assert.equal(currentStep(done).id, "tools");

  const kit = [{ item: "a", amount: 1 }, { item: "b", amount: 4 }];
  const q = { completed: {}, kitClaims: 0, kitDay: undefined };
  assert.deepEqual(kitOffer(q, 0, { a: true }, kit, 3).items, [{ item: "b", amount: 4 }], "only missing items");
  assert.equal(kitOffer({ ...q, kitDay: 0 }, 0, {}, kit, 3).ok, false, "one kit per park day");
  assert.equal(kitOffer({ ...q, kitClaims: 3 }, 1, {}, kit, 3).ok, false, "limited claims");
  assert.equal(kitOffer({ ...q, completed: Object.fromEntries(TUTORIAL_STEPS.map((s) => [s.id, 0])) }, 1, {}, kit, 3).ok, false, "no kit after the tutorial");
});

// ---------- exhibit equipment (M2 part 3a) ----------
test("equipment serves an exhibit only where the animals can use it", async () => {
  const { serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const cells = new Map([
    ["0,1,0", "land"],
    ["1,1,0", "land"],
    ["3,0,0", "water"],
  ]);
  assert.equal(serves("trough", cells, { x: -1, y: 1, z: 0 }), true, "beside the floor");
  assert.equal(serves("trough", cells, { x: -2, y: 1, z: 0 }), false, "two blocks away");
  assert.equal(serves("basket", cells, { x: 0, y: 3, z: 0 }), true, "hanging two blocks up");
  assert.equal(serves("basket", cells, { x: 0, y: 4, z: 0 }), false, "out of reach");
  assert.equal(serves("filter", cells, { x: 4, y: 0, z: 0 }), true, "at the pool edge");
  assert.equal(serves("filter", cells, { x: 3, y: -1, z: 0 }), true, "under the water");
  assert.equal(serves("filter", cells, { x: 0, y: 0, z: 0 }), false, "nowhere near water");
});

test("enrichment, water, filters and stock", async () => {
  const { enrichmentKinds, enrichmentOptions, hasDrinkingWater, waterDirtFactor, drawUnits } = await import("../packs/BP/scripts/equipment/rules.js");
  const diets = { "zoocraft:leafy_ration": "leafy", "zoocraft:fish_ration": "fish" };
  const rabbit = SPECIES["zoocraft:zoo_rabbit"];
  const otter = SPECIES["zoocraft:otter"];
  const basket = (item, units) => ({ type: "basket", item, units });
  assert.deepEqual(enrichmentKinds([basket("zoocraft:leafy_ration", 3)], rabbit, BALANCE, diets), ["forage"]);
  assert.deepEqual(enrichmentKinds([basket("zoocraft:fish_ration", 3)], rabbit, BALANCE, diets), [], "food it doesn't eat");
  assert.deepEqual(enrichmentKinds([basket("zoocraft:leafy_ration", 0)], rabbit, BALANCE, diets), [], "empty basket");
  assert.deepEqual(enrichmentKinds([{ type: "toy" }], rabbit, BALANCE, diets), [], "rabbits don't swim");
  assert.deepEqual(enrichmentKinds([{ type: "toy" }, { type: "toy" }, basket("zoocraft:fish_ration", 1)], otter, BALANCE, diets).sort(), ["forage", "swim"], "two toys count once");
  assert.deepEqual(enrichmentOptions(rabbit, BALANCE), ["basket"]);
  const land = HABITAT_PROFILES[rabbit.habitatProfile];
  const wet = HABITAT_PROFILES[otter.habitatProfile];
  assert.equal(hasDrinkingWater(land, { waterCells: 0 }, []), false);
  assert.equal(hasDrinkingWater(land, { waterCells: 0 }, [{ units: 0 }]), false, "empty trough");
  assert.equal(hasDrinkingWater(land, { waterCells: 0 }, [{ units: 3 }]), true);
  assert.equal(hasDrinkingWater(wet, { waterCells: 30 }, []), true, "otters drink from their pool");
  assert.equal(waterDirtFactor({ waterCells: 30, usableArea: 30 }, [], BALANCE), 0.5);
  assert.equal(waterDirtFactor({ waterCells: 30, usableArea: 30 }, [{}], BALANCE), 0, "a filter keeps it clean");
  assert.equal(waterDirtFactor({ waterCells: 0, usableArea: 30 }, [], BALANCE), 0);
  const stock = [{ units: 1, item: "a" }, { units: 5, item: "b" }];
  assert.equal(drawUnits(stock, 3), 3);
  assert.deepEqual(stock, [{ units: 0, item: undefined }, { units: 3, item: "b" }]);
  assert.equal(drawUnits(stock, 9), 3, "only what is there");
});

test("no drinking water caps comfort; equipment restores enrichment", () => {
  const species = SPECIES["zoocraft:zoo_rabbit"];
  const fresh = () => ({ needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false });
  const day = BALANCE.clock.dayLength;
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 2, feederUnits: 10 };
  const dry = fresh();
  simulateAnimal(dry, species, { ...ctx, water: false }, day, BALANCE);
  assert.equal(dry.needs.comfort, BALANCE.trough.dryComfortCap);
  const wet = fresh();
  simulateAnimal(wet, species, { ...ctx, water: true }, day, BALANCE);
  assert.equal(wet.needs.comfort, 90);
  const bored = fresh();
  simulateAnimal(bored, species, { ...ctx, water: true }, day, BALANCE);
  const busy = fresh();
  simulateAnimal(busy, species, { ...ctx, water: true, enrichmentPerDay: 12 }, day, BALANCE);
  assert.equal(bored.needs.enrichment, 35);
  assert.equal(busy.needs.enrichment, 47);
});

test("a Recovery Station nurses animals in holding back to health", async () => {
  const { recoverInHolding } = await import("../packs/BP/scripts/animals/welfare.js");
  const a = { needs: { satiety: 10, comfort: 30, cleanliness: 95, enrichment: 5, social: 40 }, criticalSeconds: 900, ill: true };
  recoverInHolding(a, BALANCE.clock.dayLength / 2, BALANCE);
  assert.equal(a.ill, true, "not yet");
  assert.equal(a.needs.satiety, 40);
  assert.equal(a.needs.cleanliness, 95, "never lowered");
  recoverInHolding(a, BALANCE.clock.dayLength, BALANCE);
  assert.deepEqual(a.needs, { satiety: 80, comfort: 70, cleanliness: 95, enrichment: 70, social: 70 });
  assert.equal(a.ill, false);
  assert.equal(a.criticalSeconds, 0);
});

test("keeper gates contain animals only while closed", () => {
  assert.equal(classifyBlock("zoocraft:keeper_gate", { isAir: false, isLiquid: false, open: false }), "barrier");
  assert.equal(classifyBlock("zoocraft:keeper_gate_top", { isAir: false, isLiquid: false, open: false }), "barrier");
  assert.equal(classifyBlock("zoocraft:keeper_gate", { isAir: false, isLiquid: false, open: true }), "gate_open");
  assert.equal(classifyBlock("zoocraft:park_entrance_gate_part", { isAir: false, isLiquid: false, open: false }), "solid", "the entrance arch's pillars aren't a gap");
});

// ---------- part 3b: ticket price, viewing points, visible guests ----------
test("ticket price: fair price rises with stars; dear tickets cost value and guests", () => {
  assert.equal(fairPrice(0, BALANCE), 10);
  assert.equal(fairPrice(5, BALANCE), 20);
  assert.equal(valueScore(10, 10, BALANCE), 100);
  assert.equal(valueScore(0, 10, BALANCE), 100);
  assert.equal(valueScore(15, 10, BALANCE), 60);
  assert.equal(valueScore(40, 10, BALANCE), 0);
  assert.equal(priceDemand(10, 10, BALANCE), 1);
  assert.ok(priceDemand(5, 10, BALANCE) > 1 && priceDemand(0, 20, BALANCE) === BALANCE.admission.demandBonusMax);
  assert.ok(priceDemand(20, 10, BALANCE) < 1 && priceDemand(40, 10, BALANCE) === BALANCE.admission.demandFloor);
  // Free entry earns nothing; the default price is inside the booth's range.
  assert.ok(BALANCE.admission.min <= BALANCE.economy.admissionPrice && BALANCE.economy.admissionPrice <= BALANCE.admission.max);
});

test("viewing: seen exhibits score higher; a short hide still counts; complaints", () => {
  assert.equal(viewingScore([], BALANCE), 0);
  assert.equal(viewingScore([{ welfare: 100, viewed: true }], BALANCE), 100);
  assert.equal(viewingScore([{ welfare: 100, viewed: false }], BALANCE), 40);
  assert.equal(viewingScore([{ welfare: 50, viewed: true }, { welfare: 50, viewed: false }], BALANCE), 45);
  let st = viewStatus({}, 0, 100, BALANCE);
  assert.equal(st.viewed, false);
  st = viewStatus(st, 2, 200, BALANCE);
  assert.deepEqual(st, { lastSeenAt: 200, viewed: true });
  st = viewStatus(st, 0, 200 + BALANCE.viewing.memorySeconds, BALANCE);
  assert.equal(st.viewed, true, "hidden for a short while still counts");
  st = viewStatus(st, 0, 201 + BALANCE.viewing.memorySeconds, BALANCE);
  assert.equal(st.viewed, false);
  assert.equal(dominantComplaint({ viewing: 90, services: 70, cleanliness: 80, value: 100 }, BALANCE), undefined, "nothing under the bar");
  assert.equal(dominantComplaint({ viewing: 90, services: 10, cleanliness: 80, value: 100 }, BALANCE), "services");
  assert.equal(dominantComplaint({ viewing: 40, services: 50, cleanliness: 30, value: 100 }, BALANCE), "cleanliness");
  assert.equal(dominantComplaint({ viewing: 32, services: 50, cleanliness: 90, value: 60 }, BALANCE), "viewing");
});

test("sightlines: glass, fences and water are clear; walls and leaves block", () => {
  assert.equal(blocksView("minecraft:glass", {}), false);
  assert.equal(blocksView("minecraft:light_blue_stained_glass", {}), false);
  assert.equal(blocksView("minecraft:oak_fence", {}), false);
  assert.equal(blocksView("minecraft:iron_bars", {}), false);
  assert.equal(blocksView("minecraft:water", { isLiquid: true }), false);
  assert.equal(blocksView("zoocraft:water_trough", {}), false);
  assert.equal(blocksView("minecraft:stone", {}), true);
  assert.equal(blocksView("minecraft:oak_leaves", {}), true);
  // A wall of stone at x = 5, from y 0 to 3; everything else clear.
  const wall = (x, y) => x === 5 && y >= 0 && y <= 3;
  const view = (x, y, z) => (wall(x, y, z) ? "blocked" : "clear");
  assert.equal(lineOfSight(view, { x: 0.5, y: 1.6, z: 0.5 }, { x: 9.5, y: 0.3, z: 3.5 }), false, "the wall hides the animal");
  assert.equal(lineOfSight(view, { x: 0.5, y: 5.6, z: 0.5 }, { x: 9.5, y: 4.3, z: 3.5 }), true, "over the wall");
  assert.equal(lineOfSight(view, { x: 0.5, y: 1.6, z: 0.5 }, { x: 4.5, y: 0.3, z: 0.5 }), true, "in front of the wall");
  assert.equal(lineOfSight(() => "clear", { x: 0.5, y: 1.6, z: 0.5 }, { x: 0.5, y: 1.6, z: 0.5 }), true, "same cell");
  assert.equal(lineOfSight((x) => (x === 3 ? "unloaded" : "clear"), { x: 0.5, y: 1, z: 0.5 }, { x: 8.5, y: 1, z: 0.5 }), false, "unloaded never counts as seen");
  // Exhaustive: a straight line along x through clear cells is always seen.
  for (let d = 1; d < 30; d++) assert.equal(lineOfSight(() => "clear", { x: 0.5, y: 1.6, z: 0.5 }, { x: 0.5 + d, y: 0.3, z: 0.2 + d / 3 }), true);
});

test("viewing points need somewhere to stand", () => {
  // Floor at y = 0, a viewing point at (0, 1, 0), a wall cell east of it.
  const solid = new Set(["1,1,0", "1,2,0"]);
  const read = (x, y, z) => (y <= 0 || solid.has(`${x},${y},${z}`) ? "solid" : "air");
  const spot = standSpot(read, { x: 0, y: 1, z: 0 }, { x: -10, z: 0 });
  assert.deepEqual(spot, { x: -1, y: 1, z: 0 }, "the side nearest the exhibit");
  assert.deepEqual(eyeOf(spot), { x: -0.5, y: 2.6, z: 0.5 });
  const boxed = (x, y, z) => (y <= 0 || y >= 2 ? "solid" : "air");
  assert.equal(standSpot(boxed, { x: 0, y: 1, z: 0 }), undefined, "a 1-block-high gap is no place to stand");
  const water = (x, y) => (y <= 0 ? "water" : "air");
  assert.equal(standSpot(water, { x: 0, y: 1, z: 0 }), undefined, "guests don't stand in water");
});

test("visible guests stand in for the day's admissions, a few at most", () => {
  assert.equal(visibleGuests(0, BALANCE), 0);
  assert.equal(visibleGuests(1, BALANCE), 1);
  assert.equal(visibleGuests(8, BALANCE), 2);
  assert.equal(visibleGuests(1000, BALANCE), BALANCE.guests.max);
});

// ---------- M3 part 1: guest paths and services ----------
function walk(read, starts, opts = {}) {
  const net = newNetwork();
  const gen = walkPaths(read, starts, { maxNodes: 3000, perYield: 5, ...opts }, net);
  let r = gen.next();
  while (!r.done) r = gen.next();
  return net;
}

test("path blocks: gravel, dirt path, bricks, planks and slabs; not walls or grass", () => {
  for (const id of ["minecraft:gravel", "minecraft:grass_path", "minecraft:dirt_path", "minecraft:brick_block", "minecraft:stone_bricks", "minecraft:oak_planks", "minecraft:oak_slab", "minecraft:polished_andesite", "minecraft:white_concrete", "minecraft:cobblestone", "minecraft:deepslate_tiles"]) assert.equal(isPathBlock(id), true, id);
  for (const id of ["minecraft:grass_block", "minecraft:dirt", "minecraft:stone", "minecraft:stone_brick_wall", "minecraft:cobblestone_wall", "minecraft:polished_blackstone_wall", "minecraft:sand", "minecraft:water"]) assert.equal(isPathBlock(id), false, id);
});

test("path network: walks from the entrance along paths, up and down steps, never across grass", () => {
  // A gravel path at y = 0 from x = 0 to x = 10 along z = 0, a step up to y = 1 at x = 11..14,
  // and a separate path at x = 20 that isn't joined to it.
  const path = new Set();
  for (let x = 0; x <= 10; x++) path.add(`${x},0,0`);
  for (let x = 11; x <= 14; x++) path.add(`${x},1,0`);
  path.add("20,0,0");
  const read = (x, y, z) => (path.has(`${x},${y},${z}`) ? "path" : "other");
  const gate = { x: -2, y: 1, z: 0 };
  const starts = entranceStarts(read, gate, 3);
  assert.deepEqual(starts, [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }], "path blocks next to the gate");
  const net = walk(read, starts);
  assert.equal(net.size, 15);
  assert.equal(net.partial, false);
  assert.equal(besidePath(net, { x: 14, y: 2, z: 2 }, 2), true, "a bench two blocks off the raised path");
  assert.equal(besidePath(net, { x: 5, y: 1, z: 3 }, 2), false, "three blocks off");
  assert.equal(linkStatus(net, { x: 20, y: 1, z: 1 }, 2), false, "the separate path isn't reached");
  assert.equal(linkStatus(net, { x: 5, y: 1, z: 1 }, 2), true);
  // The walk stays inside the park and stops at its cap.
  assert.equal(walk(read, starts, { inBounds: (x) => x <= 5 }).size, 6);
  const capped = walk(read, starts, { maxNodes: 4 });
  assert.equal(capped.capped, true);
  assert.equal(linkStatus(capped, { x: 14, y: 2, z: 1 }, 2), undefined, "a capped walk can't say no");
  // Unloaded ground: the walk can't tell about what lies beyond.
  const half = walk((x, y, z) => (x > 6 ? "unloaded" : read(x, y, z)), starts);
  assert.equal(half.partial, true);
  assert.equal(linkStatus(half, { x: 12, y: 2, z: 1 }, 2), undefined);
  assert.equal(linkStatus(newNetwork(), { x: 0, y: 1, z: 0 }, 2), undefined, "no walk yet");
});

test("snacks: fair price sells to about a third; never sells more than the stock", () => {
  assert.equal(snackShare(BALANCE.snacks.fair, BALANCE), BALANCE.snacks.shareAtFair);
  assert.ok(snackShare(10, BALANCE) < snackShare(4, BALANCE));
  assert.ok(snackShare(15, BALANCE) < 0.05, "hardly anyone buys at the top price");
  assert.equal(snackShare(1, BALANCE) <= BALANCE.snacks.shareMax, true);
  let carry = 0;
  let sold = 0;
  for (let i = 0; i < 20; i++) {
    const r = snackSales({ guests: 1, price: 4, stock: 100, carry }, BALANCE);
    carry = r.carry;
    sold += r.sold;
    assert.equal(r.revenue, r.sold * 4);
  }
  assert.equal(sold, 7, "20 guests at the fair price buy 7 snacks");
  const short = snackSales({ guests: 20, price: 4, stock: 3 }, BALANCE);
  assert.deepEqual(short, { sold: 3, revenue: 12, carry: 0 });
});

test("litter: bins fill in order, the rest lands on the paths", () => {
  assert.equal(litterProduced(20, 7, BALANCE), 17);
  const cap = BALANCE.litter.binCapacity;
  assert.deepEqual(litterFlow(10, [0, 0], BALANCE), { fills: [10, 0], overflow: 0 });
  assert.deepEqual(litterFlow(10, [cap - 4, 0], BALANCE), { fills: [cap, 6], overflow: 0 });
  assert.deepEqual(litterFlow(10, [cap, cap - 3], BALANCE), { fills: [cap, cap], overflow: 7 });
  assert.deepEqual(litterFlow(5, [], BALANCE), { fills: [], overflow: 5 });
});

test("donations grow with welfare and boxes, in whole coins", () => {
  assert.deepEqual(donations({ guests: 10, boxes: 0, welfare: 100 }, BALANCE), { coins: 0, carry: 0 });
  assert.equal(donations({ guests: 10, boxes: 2, welfare: 100 }, BALANCE).coins, 15);
  assert.equal(donations({ guests: 10, boxes: 1, welfare: 100 }, BALANCE).coins, 7);
  assert.equal(donations({ guests: 10, boxes: 5, welfare: 50 }, BALANCE).coins, 7, "more boxes than needed don't add more");
  const r = donations({ guests: 1, boxes: 2, welfare: 40, carry: 0.5 }, BALANCE);
  assert.equal(r.coins, 1);
  assert.ok(Math.abs(r.carry - 0.1) < 1e-9);
});

test("services score: food, seating and tidy paths, with the weakest named", () => {
  const base = { stands: 1, standsEmpty: 0, benches: 3, litter: 0, demand: 20, unlinked: 0 };
  assert.equal(benchesNeeded(20, BALANCE), 3);
  assert.deepEqual(servicesScore(base, BALANCE).score, 100);
  const none = servicesScore({ ...base, stands: 0, benches: 0 }, BALANCE);
  assert.equal(none.score, 30);
  assert.equal(none.worst, "food");
  assert.equal(servicesScore({ ...base, stands: 0, standsEmpty: 1 }, BALANCE).detail, "restock");
  assert.equal(servicesScore({ ...base, benches: 0, unlinked: 2 }, BALANCE).detail, "paths");
  const messy = servicesScore({ ...base, litter: 40 }, BALANCE);
  assert.equal(messy.parts.litter, 20);
  assert.equal(messy.worst, "litter");
  assert.equal(servicesScore({ ...base, litter: 1000 }, BALANCE).parts.litter, 0);
  assert.match(complaintText("services", "seating"), /Bench/);
  assert.match(complaintText("value", "seating"), /Ticket Booth/);
});

// ---------- wide Snack Stand and Bench ----------
test("multi-block: every part finds its main block, in every direction", () => {
  const origin = { x: 10, y: 64, z: -5 };
  for (const dir of ["north", "south", "east", "west"]) {
    // The model's front (-z) ends up facing the block's direction.
    const [fx, fz] = turn(dir, 0, -1);
    assert.deepEqual([fx + 0, fz + 0], { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }[dir], dir);
    for (const [main, layout] of Object.entries(LAYOUTS)) {
      const cells = cellsOf(main, origin, dir);
      assert.equal(cells.length, layout.cells.length);
      assert.deepEqual(cells[0].pos, origin);
      assert.equal(new Set(cells.map((c) => `${c.pos.x},${c.pos.y},${c.pos.z}`)).size, cells.length, "no two parts share a cell");
      for (const c of cells.slice(1)) assert.deepEqual(mainOf(layout.part, c.pos, dir, c.part), origin, `${main} part ${c.part} ${dir}`);
    }
  }
  const stand = cellsOf("zoocraft:snack_stand", origin, "north");
  const xs = new Set(stand.map((c) => c.pos.x)), ys = new Set(stand.map((c) => c.pos.y)), zs = new Set(stand.map((c) => c.pos.z));
  assert.deepEqual([xs.size, ys.size, zs.size], [2, 2, 2], "2 x 2 base, 2 tall");
  assert.equal(new Set(cellsOf("zoocraft:bench", origin, "east").map((c) => c.pos.y)).size, 1, "a bench is 1 tall");
  assert.equal(cellsOf("zoocraft:litter_bin", origin, "north").length, 1);
});

// ---------- playtest fixes after 0.1.15 ----------
test("entrance arch: 5 wide, 4 tall, with a clear 3-wide walkway under it", () => {
  const origin = { x: 0, y: 64, z: 0 };
  for (const dir of ["north", "south", "east", "west"]) {
    const cells = cellsOf("zoocraft:park_entrance_gate", origin, dir);
    const taken = new Set(cells.map((c) => `${c.pos.x},${c.pos.y},${c.pos.z}`));
    const walk = walkwayOf(origin, dir);
    assert.deepEqual(walk[0], origin, "the threshold is the middle of the walkway");
    for (const p of walk.slice(1)) {
      for (const dy of [0, 1]) assert.equal(taken.has(`${p.x},${p.y + dy},${p.z}`), false, `${dir}: walkway ${dy} is open`);
      assert.equal(taken.has(`${p.x},${p.y + 2},${p.z}`), true, `${dir}: beam over the walkway`);
    }
    const span = (k) => Math.max(...cells.map((c) => c.pos[k])) - Math.min(...cells.map((c) => c.pos[k])) + 1;
    assert.deepEqual([span("y"), Math.max(span("x"), span("z")), Math.min(span("x"), span("z"))], [4, 5, 1], dir);
  }
  assert.equal(classifyBlock("zoocraft:park_entrance_gate", {}), "air", "guests and paths go over the threshold");
});

test("sightlines: water, glass and coral don't block; stone does", () => {
  for (const id of ["minecraft:tube_coral_fan", "minecraft:brain_coral_wall_fan", "minecraft:fire_coral", "minecraft:sea_pickle", "minecraft:seagrass", "minecraft:kelp", "minecraft:tinted_glass"]) assert.equal(blocksView(id, {}), false, id);
  assert.equal(blocksView("minecraft:flowing_water", { isLiquid: true }), false);
  assert.equal(blocksView("minecraft:tube_coral_block", {}), true);
  // A glass tunnel through a pool: stone floor at y 0, air at 1-2, glass walls at x = 2 and a glass
  // roof at y 3, water beyond. The guest's eye is in the tunnel, the otter swims in the pool.
  const block = (x, y, z) => (y <= 0 ? "minecraft:stone" : x === 2 || y === 3 ? "minecraft:glass" : x > 2 || y > 3 ? "minecraft:water" : "minecraft:air");
  const view = (x, y, z) => {
    const id = block(x, y, z);
    return blocksView(id, { isAir: id === "minecraft:air", isLiquid: id === "minecraft:water" }) ? "blocked" : "clear";
  };
  assert.equal(lineOfSight(view, { x: 0.5, y: 1.6, z: 0.5 }, { x: 5.5, y: 2.3, z: 3.5 }), true, "through the wall");
  assert.equal(lineOfSight(view, { x: 0.5, y: 1.6, z: 0.5 }, { x: 1.5, y: 5.3, z: 2.5 }), true, "up through the roof");
  assert.equal(lineOfSight(view, { x: 0.5, y: 1.6, z: 0.5 }, { x: 5.5, y: -1.5, z: 0.5 }), false, "not through the stone floor");
});

test("guests turn to face the exhibit", () => {
  assert.equal(yawToward({ x: 0, z: 0 }, { x: 0, z: 5 }), 0, "south");
  assert.equal(yawToward({ x: 0, z: 0 }, { x: -5, z: 0 }), 90, "west");
  assert.equal(yawToward({ x: 0, z: 0 }, { x: 5, z: 0 }), -90, "east");
  assert.equal(Math.abs(yawToward({ x: 0, z: 0 }, { x: 0, z: -5 })), 180, "north");
});

test("animal names: tidied, capped and never empty", () => {
  assert.equal(cleanName("  Fluffy  "), "Fluffy");
  assert.equal(cleanName("§cRed §lBob"), "Red Bob");
  assert.equal(cleanName("Mr\n  Whiskers"), "Mr Whiskers");
  assert.equal(cleanName("x".repeat(40)).length, MAX_NAME);
  assert.equal(cleanName("   "), undefined);
  assert.equal(cleanName("§a"), undefined);
  assert.equal(cleanName(undefined), undefined);
});

test("multi-block models are mirrored in x (Bedrock geometry +x shows on the world's -x side)", () => {
  const geo = (f, id) => JSON.parse(readFileSync(new URL(`../packs/RP/models/blocks/${f}`, import.meta.url), "utf8"))["minecraft:geometry"].find((g) => g.description.identifier === id).bones[0].cubes;
  // The bench's main half is at model x 0 and its other half at +x (multiblock.js), so its heavy end
  // frame (the 11-tall front leg) has to be drawn at local +x to show on the outer end.
  const leg0 = geo("bench.geo.json", "geometry.zoocraft.bench_p0").find((c) => c.size[0] === 2 && c.size[1] === 11);
  const leg1 = geo("bench.geo.json", "geometry.zoocraft.bench_p1").find((c) => c.size[0] === 2 && c.size[1] === 11);
  assert.ok(leg0.origin[0] > 0 && leg1.origin[0] < 0, "end frames on the outer ends");
  // The left pillar's stub of the beam (cell x -2) points toward the middle, drawn at local -x.
  const stub = geo("park_entrance_gate.geo.json", "geometry.zoocraft.park_entrance_gate_p3").find((c) => c.size[0] === 2 && c.size[1] === 6);
  assert.ok(stub.origin[0] < 0, "beam stub toward the walkway");
});

// ---------- M3 part 2: capybara ----------
test("capybara: a calm grazer for a grassy bank with a shallow pool, carried in a Livestock Crate", async () => {
  const { SPECIES, speciesForWild } = await import("../packs/BP/scripts/data/species.js");
  const { HABITAT_PROFILES, requiredArea } = await import("../packs/BP/scripts/data/profiles.js");
  const { CARRIERS, carrierByItem } = await import("../packs/BP/scripts/data/items.js");
  const { habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const capy = SPECIES["zoocraft:capybara"];
  assert.equal(speciesForWild("zoocraft:wild_capybara"), capy);
  assert.deepEqual(carrierByItem("zoocraft:livestock_crate"), { ...CARRIERS.livestock, profile: "livestock", full: false });
  assert.equal(carrierByItem("zoocraft:livestock_crate_occupied").full, true);
  const p = HABITAT_PROFILES[capy.habitatProfile];
  assert.equal(requiredArea(p, 2), 120, "a pair needs 120 blocks of bank and water");
  // 100 grass + a 6 x 5 pool, 2 spots of it 2 deep: fine for capybaras, too dry for otters.
  const ex = { usableArea: 100, waterCells: 30, deepWaterCells: 2 };
  assert.equal(habitatProblem(ex, p, "Capybara"), undefined);
  assert.match(habitatProblem(ex, HABITAT_PROFILES.small_wetland, "Otter"), /more water/);
  assert.match(habitatProblem({ ...ex, waterCells: 10 }, p, "Capybara"), /more water/);
  assert.match(habitatProblem({ usableArea: 40, waterCells: 80, deepWaterCells: 6 }, p, "Capybara"), /dry bank/);
});

test("guests push each other apart instead of standing inside one another", () => {
  const guest = JSON.parse(readFileSync(new URL("../packs/BP/entities/guest.json", import.meta.url), "utf8"))["minecraft:entity"].components;
  assert.ok(guest["minecraft:pushable_by_entity"] && guest["minecraft:collision_box"] && guest["minecraft:physics"]);
});

// ---------- M3 part 3: keepers ----------
test("keepers: the jobs an exhibit needs, most urgent first, never claimed twice", async () => {
  const { jobsFor, pickJob, rationFor, takeStock, totalStock, defaultExhibits, keeperLimit } = await import("../packs/BP/scripts/staff/rules.js");
  const { BALANCE } = await import("../packs/BP/scripts/data/balance.js");
  const { SPECIES } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS } = await import("../packs/BP/scripts/data/items.js");
  const diets = Object.fromEntries(Object.entries(RATIONS).map(([item, r]) => [item, r.diet]));
  const capy = SPECIES["zoocraft:capybara"]; // leafy, forages, 2 units a day each
  const at = { x: 1, y: 64, z: 1 };
  const ex = { id: "ex1", dimension: "minecraft:overworld", controller: { x: 0, y: 64, z: 0 }, animalIds: ["a", "b"], cleanliness: 90 };
  const leafy = "zoocraft:leafy_ration";
  const fish = "zoocraft:fish_ration";
  const kinds = (jobs) => jobs.map((j) => `${j.kind}:${j.priority}`).sort();

  // Under a day of food (4 units for two), an empty basket, a low trough, a clean exhibit.
  let jobs = jobsFor(ex, capy, [{ id: "f1", units: 2, item: leafy, pos: at }], [{ id: "b1", type: "basket", units: 0, pos: at }, { id: "t1", type: "trough", units: 2, pos: at }], false, BALANCE, diets);
  assert.deepEqual(kinds(jobs), ["basket:1", "feed:2", "water:2"]);
  // A pool means no trough job; an empty feeder is urgent; a very dirty exhibit too.
  jobs = jobsFor({ ...ex, cleanliness: 15 }, capy, [{ id: "f1", units: 0, pos: at }], [{ id: "t1", type: "trough", units: 0, pos: at }], true, BALANCE, diets);
  assert.deepEqual(kinds(jobs), ["clean:3", "feed:3"]);
  // A feeder holding the wrong ration is the player's call, not a keeper's.
  assert.deepEqual(jobsFor(ex, capy, [{ id: "f1", units: 10, item: fish, pos: at }], [], false, BALANCE, diets), []);
  // An exhibit with no animals needs nothing.
  assert.deepEqual(jobsFor({ ...ex, animalIds: [] }, capy, [{ id: "f1", units: 0, pos: at }], [], false, BALANCE, diets), []);

  // Picking: only the keeper's own exhibits, not a job another keeper holds, not while it waits to be retried.
  jobs = jobsFor({ ...ex, cleanliness: 15 }, capy, [{ id: "f1", units: 0, pos: at }], [{ id: "b1", type: "basket", units: 0, pos: at }], false, BALANCE, diets);
  const k = { exhibitIds: ["ex1"] };
  assert.equal(pickJob(k, jobs, new Set(), new Map(), 0).priority, 3);
  assert.equal(pickJob(k, jobs, new Set(["clean:ex1", "feed:f1"]), new Map(), 0).kind, "basket");
  assert.equal(pickJob(k, jobs, new Set(["clean:ex1", "feed:f1"]), new Map([["basket:b1", 100]]), 50), undefined);
  assert.equal(pickJob({ exhibitIds: ["other"] }, jobs, new Set(), new Map(), 0), undefined);

  // Supplies: what the feeder holds, else a ration the species eats that the rooms have.
  assert.equal(rationFor(capy, { units: 0 }, { [fish]: 50, [leafy]: 3 }, RATIONS), leafy);
  assert.equal(rationFor(capy, { units: 0 }, { [fish]: 50 }, RATIONS), undefined);
  const rooms = [{ stock: { [leafy]: 5 } }, { stock: { [leafy]: 10, [fish]: 4 } }];
  assert.deepEqual(totalStock(rooms), { [leafy]: 15, [fish]: 4 });
  assert.equal(takeStock(rooms, leafy, 8), 8);
  assert.deepEqual(rooms.map((r) => r.stock), [{}, { [leafy]: 7, [fish]: 4 }]);
  assert.equal(takeStock(rooms, leafy, 20), 7, "never more than the rooms hold");

  // A new keeper takes the busiest uncovered exhibits; Staff Rooms set how many keepers fit.
  const exs = [{ id: "a", animalIds: [1] }, { id: "b", animalIds: [1, 2, 3] }, { id: "c", animalIds: [] }, { id: "d", animalIds: [1, 2] }];
  assert.deepEqual(defaultExhibits(exs, [{ exhibitIds: ["b"] }], 2), ["d", "a"]);
  assert.deepEqual([0, 1, 5].map((n) => keeperLimit(n, BALANCE)), [0, 2, 6]);
});

test("Staff Room: a closed building with 3 x 3 x 3 of space, the block inside or against the wall", async () => {
  const { measureRoom } = await import("../packs/BP/scripts/staff/rules.js");
  const { BALANCE } = await import("../packs/BP/scripts/data/balance.js");
  const opts = { minSize: BALANCE.staff.roomMinSize, maxCells: BALANCE.staff.roomMaxCells };
  // Flat ground at y 63, open sky above; a stone building carved out of a solid block of stone.
  const make = (x0, z0, w, h, d) => {
    const inside = new Set();
    for (let x = x0; x < x0 + w; x++) for (let y = 64; y < 64 + h; y++) for (let z = z0; z < z0 + d; z++) inside.add(`${x},${y},${z}`);
    const holes = new Set();
    const read = (x, y, z) => {
      const k = `${x},${y},${z}`;
      if (inside.has(k) || holes.has(k)) return "air";
      const wall = x >= x0 - 1 && x <= x0 + w && y >= 63 && y <= 64 + h && z >= z0 - 1 && z <= z0 + d;
      return wall || y < 64 ? "solid" : "air";
    };
    return { read, holes };
  };
  const room = make(0, 0, 3, 3, 3); // walls at x -1 and 3
  assert.equal(measureRoom(room.read, { x: 1, y: 64, z: 1 }, opts).ok, true, "block inside");
  const withBlock = (x, y, z) => (x === 0 && y === 64 && z === 0 ? "solid" : room.read(x, y, z));
  assert.equal(measureRoom(withBlock, { x: 0, y: 64, z: 0 }, opts).ok, true, "the block's own cell counts as room space");
  const inWall = (x, y, z) => (x === 3 && y === 64 && z === 1 ? "solid" : room.read(x, y, z));
  assert.equal(measureRoom(inWall, { x: 3, y: 64, z: 1 }, opts).ok, true, "the block set into the wall");
  const r = measureRoom(room.read, { x: 4, y: 64, z: 1 }, opts);
  assert.equal(r.ok, true, "block against the outside wall");
  assert.equal(r.cells, 27);
  assert.equal(measureRoom(room.read, { x: 6, y: 64, z: 1 }, opts).reason, "open", "too far from the building");
  assert.equal(measureRoom(make(0, 0, 3, 2, 3).read, { x: 1, y: 64, z: 1 }, opts).reason, "small", "only 2 high");
  assert.equal(measureRoom(make(0, 0, 2, 3, 6).read, { x: 0, y: 64, z: 1 }, opts).reason, "small", "only 2 wide");
  room.holes.add("1,67,1"); // a hole in the roof
  assert.equal(measureRoom(room.read, { x: 1, y: 64, z: 1 }, opts).reason, "open");
  assert.equal(measureRoom(() => "unloaded", { x: 0, y: 64, z: 0 }, opts).reason, "unloaded");
});

// ---------- M3 part 4: Field Journal and research ----------
test("Field Journal: levels, unbroken watching, and research needs", async () => {
  const { levelOf, tasksSeen, watch, projectNeeds } = await import("../packs/BP/scripts/discovery/rules.js");
  const { SPECIES } = await import("../packs/BP/scripts/data/species.js");
  const { PROJECTS } = await import("../packs/BP/scripts/data/research.js");
  const capy = SPECIES["zoocraft:capybara"];
  const rabbit = SPECIES["zoocraft:zoo_rabbit"];
  assert.deepEqual([[], ["spot"], ["spot", "swim"], ["spot", "swim", "bank"]].map((d) => levelOf(capy, d)), [0, 1, 2, 3]);
  assert.equal(levelOf(rabbit, ["spot"]), 3, "the starter species only needs spotting");
  assert.equal(levelOf(capy, ["swim", "bank"]), 0, "nothing counts before it's spotted");
  // Behaviours only count once it's spotted, and only while the animal is doing them.
  assert.deepEqual(tasksSeen(capy, [], { inWater: true, onGround: false }), ["spot"]);
  assert.deepEqual(tasksSeen(capy, ["spot"], { inWater: true, onGround: false }), ["swim"]);
  assert.deepEqual(tasksSeen(capy, ["spot"], { inWater: false, onGround: true }), ["bank"]);
  // Watching: 2 s to spot, 3 s for a behaviour, and looking away starts it again.
  const prog = new Map();
  const k = "p|zoocraft:capybara|swim";
  assert.deepEqual(watch(prog, new Set([k]), 1), []);
  assert.deepEqual(watch(prog, new Set(), 1), []);
  assert.deepEqual(watch(prog, new Set([k]), 1), []);
  assert.deepEqual(watch(prog, new Set([k]), 1), []);
  assert.deepEqual(watch(prog, new Set([k]), 1), [k]);
  // Research opens with the journal.
  const guide = PROJECTS.find((p) => p.id === "park_guidebook");
  const train = PROJECTS.find((p) => p.id === "keeper_training");
  assert.equal(projectNeeds(guide, { a: 1, b: 1 }).length, 1);
  assert.deepEqual(projectNeeds(guide, { a: 1, b: 1, c: 3 }), []);
  assert.equal(projectNeeds(train, { a: 3, b: 2 })[0], "2 species ready to move (1 so far)");
  for (const p of PROJECTS) assert.ok(p.cost > 0 && Object.keys(p.items).length && p.text, p.id);
});

// ---------- M3 part 5: Gift Shop ----------
test("Gift Shop: souvenir sales follow price, welfare and variety", async () => {
  const { giftShare, memorable, giftSales } = await import("../packs/BP/scripts/visitors/serviceRules.js");
  const g = BALANCE.giftShop;
  assert.equal(giftShare(g.fair, BALANCE), g.shareAtFair);
  assert.ok(giftShare(g.fair + 5, BALANCE) < g.shareAtFair && giftShare(g.max, BALANCE) >= 0);
  assert.ok(giftShare(g.min, BALANCE) <= g.shareMax);
  // Nothing to see, nothing sold; happier animals and a second kind of animal sell more.
  assert.equal(memorable(100, 0, BALANCE), 0);
  assert.ok(memorable(40, 1, BALANCE) < memorable(100, 1, BALANCE));
  assert.ok(memorable(100, 1, BALANCE) < memorable(100, 2, BALANCE));
  assert.equal(memorable(100, 3, BALANCE), 1);
  // 40 guests after a perfect visit at the fair price: 25% buy, 10 souvenirs.
  assert.deepEqual(giftSales({ guests: 40, price: g.fair, stock: 64, welfare: 100, species: 2 }, BALANCE), { sold: 10, revenue: 10 * g.fair, carry: 0 });
  // Never more than the stock, and the leftover fraction is dropped when it sells out.
  const out = giftSales({ guests: 40, price: g.fair, stock: 3, welfare: 100, species: 2 }, BALANCE);
  assert.equal(out.sold, 3);
  assert.equal(out.carry, 0);
  // Fractions carry over between steps.
  const a = giftSales({ guests: 2, price: g.fair, stock: 64, welfare: 100, species: 2 }, BALANCE);
  assert.equal(a.sold, 0);
  const b = giftSales({ guests: 2, price: g.fair, stock: 64, carry: a.carry, welfare: 100, species: 2 }, BALANCE);
  assert.equal(b.sold, 1);
  // Souvenirs bought in cost less than the fair price, so a stocked shop pays its way.
  assert.ok(g.wholesaleCost < g.fair);
  for (const [item, n] of Object.entries(BALANCE.giftItems)) assert.ok(item.startsWith("minecraft:") && n > 0, item);
});

// ---------- M3 part 6: deer ----------
test("Deer: a herd grazer that needs cover, watched grazing and with its herd", async () => {
  const { levelOf, tasksSeen, TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  const { hasCover, coverNeeded } = await import("../packs/BP/scripts/animals/welfare.js");
  const deer = SPECIES["zoocraft:deer"];
  assert.ok(deer && SPECIES[deer.id] === deer);
  assert.equal(deer.habitatProfile, "medium_terrestrial");
  assert.equal(deer.carrierProfile, "livestock");
  assert.deepEqual(deer.coats, ["Doe", "Buck"]);
  for (const t of deer.observe) assert.ok(TASKS[t], t);
  // Field Journal: spotting first; grazing needs it standing still on dry ground; herd needs company.
  assert.deepEqual(tasksSeen(deer, ["spot"], { onGround: true, inWater: false, still: false, herd: false }), []);
  assert.deepEqual(tasksSeen(deer, ["spot"], { onGround: true, inWater: false, still: true, herd: false }), ["graze"]);
  assert.deepEqual(tasksSeen(deer, ["spot"], { onGround: true, inWater: false, still: false, herd: true }), ["herd"]);
  assert.deepEqual([[], ["spot"], ["spot", "graze"], ["spot", "graze", "herd"]].map((d) => levelOf(deer, d)), [0, 1, 2, 3]);
  // Cover: a tenth of the usable ground under trees or a roof; unmeasured exhibits aren't penalised.
  assert.equal(coverNeeded(deer, 120), 12);
  assert.equal(coverNeeded(SPECIES["zoocraft:capybara"], 120), 0);
  assert.equal(hasCover(deer, { usableArea: 120, coveredCells: 11 }), false);
  assert.equal(hasCover(deer, { usableArea: 120, coveredCells: 12 }), true);
  assert.equal(hasCover(deer, { usableArea: 120 }), true);
  assert.equal(hasCover(SPECIES["zoocraft:capybara"], { usableArea: 120, coveredCells: 0 }), true);
  // Without cover, comfort is capped; with it, a roomy exhibit is comfortable.
  const day = BALANCE.clock.dayLength;
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 3, feederUnits: 20, water: true };
  const open = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(open, deer, { ...ctx, cover: false }, day, BALANCE);
  assert.equal(open.needs.comfort, BALANCE.cover.comfortCap);
  const sheltered = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(sheltered, deer, { ...ctx, cover: true }, day, BALANCE);
  assert.equal(sheltered.needs.comfort, 90);
});

test("Deer cover: leaves or a roof above the headroom count, open sky doesn't", () => {
  // A 6 x 6 pen; a canopy 5 blocks up over the two left columns (x 1-2).
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const base = gridReader(rows);
  const read = (x, y, z) => (y === 5 && x >= 1 && x <= 2 && z >= 1 && z <= 6 ? "solid" : base(x, y, z));
  const r = run(read, { x: 3, y: 1, z: 3 }, { minHeight: 4, coverHeight: BALANCE.cover.height });
  assert.equal(r.usableArea, 36);
  assert.equal(r.coveredCells, 12);
  // Not asked for: not counted.
  assert.equal(run(read, { x: 3, y: 1, z: 3 }, { minHeight: 4 }).coveredCells, 0);
  // Too high above the headroom: no cover.
  const high = (x, y, z) => (y === 4 + 1 + BALANCE.cover.height && x >= 1 && x <= 2 ? "solid" : base(x, y, z));
  assert.equal(run(high, { x: 3, y: 1, z: 3 }, { minHeight: 4, coverHeight: BALANCE.cover.height }).coveredCells, 0);
});

// ---------- M3 part 7: penguins and the Cooling Unit ----------
test("Penguins: a colony diver for a cold pool, watched swimming and with its colony", async () => {
  const { levelOf, tasksSeen, TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  const { HABITAT_PROFILES, requiredArea } = await import("../packs/BP/scripts/data/profiles.js");
  const { habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const { speciesForWild } = await import("../packs/BP/scripts/data/species.js");
  const peng = SPECIES["zoocraft:penguin"];
  assert.equal(speciesForWild("zoocraft:wild_penguin"), peng);
  assert.equal(peng.carrierProfile, "small");
  assert.deepEqual(peng.dietTags, ["fish"]);
  assert.equal(peng.cold, true);
  for (const t of peng.observe) assert.ok(TASKS[t], t);
  assert.deepEqual(tasksSeen(peng, ["spot"], { onGround: false, inWater: true, herd: false }), ["swim"]);
  assert.deepEqual(tasksSeen(peng, ["spot"], { onGround: true, inWater: false, herd: true }), ["colony"]);
  assert.equal(levelOf(peng, ["spot", "swim", "colony"]), 3);
  // A colony of 3 needs 88 blocks: 40% water with 4 deep spots, and 30% dry bank.
  const p = HABITAT_PROFILES[peng.habitatProfile];
  assert.equal(requiredArea(p, 3), 88);
  assert.equal(habitatProblem({ usableArea: 50, waterCells: 40, deepWaterCells: 6 }, p, "Penguin"), undefined);
  assert.match(habitatProblem({ usableArea: 70, waterCells: 20, deepWaterCells: 6 }, p, "Penguin"), /more water/);
  assert.match(habitatProblem({ usableArea: 50, waterCells: 40, deepWaterCells: 2 }, p, "Penguin"), /deep/);
});

test("Cooling Unit: ice keeps a penguin exhibit cold; without it comfort stays low", async () => {
  const { serves, isCold, coolingValue, drawUnits } = await import("../packs/BP/scripts/equipment/rules.js");
  const { key } = await import("../packs/BP/scripts/exhibits/geometry.js");
  const peng = SPECIES["zoocraft:penguin"];
  // Beside the floor or the pool, not out in the field.
  const cells = new Map([[key(0, 64, 0), "land"], [key(5, 63, 0), "water"]]);
  assert.equal(serves("cooler", cells, { x: 1, y: 64, z: 0 }), true);
  assert.equal(serves("cooler", cells, { x: 6, y: 64, z: 0 }), true);
  assert.equal(serves("cooler", cells, { x: 3, y: 64, z: 4 }), false);
  // Ice values: packed ice is worth three ice; anything else isn't ice.
  assert.equal(coolingValue("minecraft:packed_ice", BALANCE), 3 * coolingValue("minecraft:ice", BALANCE));
  assert.equal(coolingValue("minecraft:dirt", BALANCE), 0);
  // Cold only with ice left; other species don't need it.
  assert.equal(isCold(peng, []), false);
  assert.equal(isCold(peng, [{ units: 0 }]), false);
  assert.equal(isCold(peng, [{ units: 3 }]), true);
  assert.equal(isCold(SPECIES["zoocraft:otter"], []), true);
  const unit = { units: 4 };
  assert.equal(drawUnits([unit], BALANCE.cooler.unitsPerDay), 2);
  assert.equal(unit.units, 2);
  // Comfort: capped while warm, normal when cold.
  const day = BALANCE.clock.dayLength;
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 4, feederUnits: 20, water: true, cover: true };
  const warm = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(warm, peng, { ...ctx, cold: false }, day, BALANCE);
  assert.equal(warm.needs.comfort, BALANCE.cooler.warmComfortCap);
  const cool = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(cool, peng, { ...ctx, cold: true }, day, BALANCE);
  assert.equal(cool.needs.comfort, 90);
});

// ---------- M3 part 8: giraffes, the Elevated Browse Feeder and the Reinforced Crate ----------
test("Giraffes: a tall savanna browser in a Reinforced Crate, with 7 blocks of headroom", async () => {
  const { levelOf, tasksSeen, TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  const { speciesForWild } = await import("../packs/BP/scripts/data/species.js");
  const { CARRIERS, carrierByItem } = await import("../packs/BP/scripts/data/items.js");
  const gir = SPECIES["zoocraft:giraffe"];
  assert.equal(speciesForWild("zoocraft:wild_giraffe"), gir);
  assert.equal(gir.browsesHigh, true);
  assert.deepEqual(gir.dietTags, ["leafy"]);
  for (const t of gir.observe) assert.ok(TASKS[t], t);
  assert.deepEqual(tasksSeen(gir, ["spot"], { onGround: true, inWater: false, still: true, herd: false }), ["browse"]);
  assert.deepEqual(tasksSeen(gir, ["spot"], { onGround: true, inWater: false, still: false, herd: false }), []);
  assert.equal(levelOf(gir, ["spot", "browse", "herd"]), 3);
  const p = HABITAT_PROFILES[gir.habitatProfile];
  assert.equal(p.minHeight, 7);
  assert.equal(requiredArea(p, 2), 240);
  assert.deepEqual(carrierByItem("zoocraft:reinforced_crate"), { ...CARRIERS.large, profile: "large", full: false });
  assert.equal(carrierByItem("zoocraft:reinforced_crate_occupied").full, true);
  assert.equal(gir.carrierProfile, "large");
  assert.deepEqual(validateData(), []);
});

test("Elevated Browse Feeder: only giraffes reach it, and giraffes reach nothing else", async () => {
  const { reachesFeeder } = await import("../packs/BP/scripts/equipment/rules.js");
  const { jobsFor } = await import("../packs/BP/scripts/staff/rules.js");
  const { RATIONS } = await import("../packs/BP/scripts/data/items.js");
  const diets = Object.fromEntries(Object.entries(RATIONS).map(([item, r]) => [item, r.diet]));
  const gir = SPECIES["zoocraft:giraffe"];
  const deer = SPECIES["zoocraft:deer"];
  const low = { id: "f1", units: 0, pos: { x: 1, y: 64, z: 1 } };
  const high = { id: "f2", units: 0, pos: { x: 2, y: 64, z: 1 }, high: true };
  assert.equal(reachesFeeder(gir, high), true);
  assert.equal(reachesFeeder(gir, low), false);
  assert.equal(reachesFeeder(deer, low), true);
  assert.equal(reachesFeeder(deer, high), false);
  // Keepers only fill the feeder the animals can reach.
  const ex = { id: "ex1", dimension: "minecraft:overworld", controller: { x: 0, y: 64, z: 0 }, animalIds: ["a", "b"], cleanliness: 90 };
  assert.equal(jobsFor(ex, gir, [low], [], true, BALANCE, diets).filter((j) => j.kind === "feed").length, 0);
  assert.equal(jobsFor(ex, gir, [low, high], [], true, BALANCE, diets).filter((j) => j.kind === "feed").length, 1);
  assert.equal(jobsFor(ex, deer, [high], [], true, BALANCE, diets).filter((j) => j.kind === "feed").length, 0);
});

// ---------- 0.1.34: natural trees give deer cover ----------
test("Deer cover: a low natural canopy (leaves inside the headroom) counts, a low roof doesn't", () => {
  // A 6 x 6 pen; something 2 blocks above the animals' feet over the two left columns (x 1-2).
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const base = gridReader(rows);
  const over = (kind) => (x, y, z) => (y === 3 && x >= 1 && x <= 2 && z >= 1 && z <= 6 ? kind : base(x, y, z));
  const opts = { minHeight: 4, coverHeight: BALANCE.cover.height };
  // Leaves: the animals still stand under them, and that ground is under cover.
  const tree = run(over("leaves"), { x: 3, y: 1, z: 3 }, opts);
  assert.equal(tree.usableArea, 36);
  assert.equal(tree.coveredCells, 12);
  // A solid roof that low is a low ceiling: not usable, so not counted as cover either.
  const roof = run(over("solid"), { x: 3, y: 1, z: 3 }, opts);
  assert.equal(roof.usableArea, 24);
  assert.equal(roof.coveredCells, 0);
});

// ---------- M3 part 9: elephants, the mud wallow and the Enrichment Ball ----------
test("Elephants: a big savanna herd animal in a Reinforced Crate that wants mud and a ball", async () => {
  const { levelOf, tasksSeen, TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  const { speciesForWild } = await import("../packs/BP/scripts/data/species.js");
  const { enrichmentKinds, enrichmentOptions } = await import("../packs/BP/scripts/equipment/rules.js");
  const { RATIONS } = await import("../packs/BP/scripts/data/items.js");
  const diets = Object.fromEntries(Object.entries(RATIONS).map(([item, r]) => [item, r.diet]));
  const ele = SPECIES["zoocraft:elephant"];
  assert.equal(speciesForWild("zoocraft:wild_elephant"), ele);
  assert.equal(ele.carrierProfile, "large");
  assert.equal(ele.mud.minCells, 6);
  for (const t of ele.observe) assert.ok(TASKS[t], t);
  assert.deepEqual(tasksSeen(ele, ["spot"], { onGround: true, inWater: false, still: true, herd: false }), ["trunk"]);
  assert.equal(levelOf(ele, ["spot", "trunk", "herd"]), 3);
  const p = HABITAT_PROFILES[ele.habitatProfile];
  assert.equal(p.minHeight, 6);
  assert.equal(requiredArea(p, 2), 336);
  // The ball is "manipulate" enrichment: elephants (and otters) enjoy it, rabbits don't.
  assert.deepEqual(enrichmentKinds([{ type: "ball" }], ele, BALANCE, diets), ["manipulate"]);
  assert.ok(enrichmentOptions(ele, BALANCE).includes("ball"));
  assert.deepEqual(enrichmentKinds([{ type: "ball" }], SPECIES["zoocraft:zoo_rabbit"], BALANCE, diets), []);
  assert.deepEqual(validateData(), []);
});

test("Mud wallow: mud in the floor is counted only when asked, and too little caps comfort", async () => {
  const { hasMud } = await import("../packs/BP/scripts/animals/welfare.js");
  assert.equal(classifyBlock("minecraft:mud", { isAir: false, isLiquid: false, open: false, mud: true }), "mud");
  assert.equal(classifyBlock("minecraft:mud", { isAir: false, isLiquid: false, open: false }), "solid");
  assert.equal(classifyBlock("minecraft:packed_mud", { isAir: false, isLiquid: false, open: false, mud: true }), "solid");
  // A 6 x 6 pen with mud in the floor under x 1-3, z 1-2 (6 blocks).
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const base = gridReader(rows);
  const read = (x, y, z) => (y === 0 && x >= 1 && x <= 3 && z >= 1 && z <= 2 ? "mud" : base(x, y, z));
  const counted = run(read, { x: 3, y: 1, z: 3 }, { countMud: true });
  assert.equal(counted.usableArea, 36);
  assert.equal(counted.mudCells, 6);
  assert.equal(run(read, { x: 3, y: 1, z: 3 }).mudCells, 0);
  const ele = SPECIES["zoocraft:elephant"];
  assert.equal(hasMud(ele, { mudCells: 6 }), true);
  assert.equal(hasMud(ele, { mudCells: 5 }), false);
  assert.equal(hasMud(ele, {}), true); // not measured yet
  assert.equal(hasMud(SPECIES["zoocraft:deer"], { mudCells: 0 }), true);
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 2, feederUnits: 10, water: true, enrichmentPerDay: 0 };
  const day = BALANCE.clock.dayLength;
  const dry = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(dry, ele, { ...ctx, mud: false }, day, BALANCE);
  assert.equal(dry.needs.comfort, BALANCE.mud.comfortCap);
  const wet = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(wet, ele, { ...ctx, mud: true }, day, BALANCE);
  assert.equal(wet.needs.comfort, 90);
});

test("Breeding: pairs need an unrelated adult female and male; sex follows the deer's coat", async () => {
  const { sexOf, related, findPair } = await import("../packs/BP/scripts/animals/breeding.js");
  const deer = SPECIES["zoocraft:deer"];
  assert.equal(sexOf({ id: "an_1", coat: 1 }, deer), "male");
  assert.equal(sexOf({ id: "an_1", coat: 0 }, deer), "female");
  assert.equal(sexOf({ id: "an_1", sex: "male", coat: 0 }, deer), "male");
  const otter = SPECIES["zoocraft:otter"];
  assert.equal(sexOf({ id: "an_xyz" }, otter), sexOf({ id: "an_xyz" }, otter)); // fixed for old records
  const mum = { id: "m", sex: "female" };
  const dad = { id: "d", sex: "male" };
  const son = { id: "s", sex: "male", parents: ["m", "d"] };
  const daughter = { id: "g", sex: "female", parents: ["m", "d"] };
  assert.equal(related(mum, son), true);
  assert.equal(related(son, daughter), true);
  assert.equal(related(mum, dad), false);
  assert.equal(findPair([son, daughter], otter), undefined);
  assert.deepEqual(findPair([mum, son, dad], otter), { mother: mum, father: dad });
  assert.equal(findPair([mum, { ...dad, juvenile: true }], otter), undefined); // young don't pair
  assert.equal(findPair([{ ...mum, expecting: { daysLeft: 1 } }, dad], otter), undefined);
});

test("Breeding check: each rule explains itself, and a full exhibit is blocked with the space it needs (AC-12)", async () => {
  const { breedingCheck } = await import("../packs/BP/scripts/animals/breeding.js");
  const B = BALANCE.breeding;
  const sp = SPECIES["zoocraft:capybara"];
  const profile = HABITAT_PROFILES[sp.habitatProfile];
  const a = (id, sex, extra = {}) => ({ id, name: id, sex, ...extra });
  const base = {
    on: true, species: sp, plural: "Capybaras", animals: [a("Mochi", "female"), a("Bean", "male")], state: "occupied",
    usable: 400, required: (pop) => requiredArea(profile, pop), foodDays: 5, coveredCells: 40, usableArea: 300,
    goodDays: B.goodDays, day: 10, cooldownUntil: 0, welfareOf: () => 80,
  };
  assert.equal(breedingCheck(base, B).ok, true);
  assert.match(breedingCheck({ ...base, on: false }, B).reason, /off/);
  assert.match(breedingCheck({ ...base, animals: [a("Mochi", "female"), a("Coco", "female")] }, B).reason, /adult female and an adult male \(now 2 female and 0 male/);
  // Two adults and two pups need 96 + 24 * 2 = 144 blocks.
  const full = breedingCheck({ ...base, usable: 120 }, B);
  assert.equal(full.ok, false);
  assert.match(full.reason, /needs 144 usable blocks, the exhibit has 120/);
  assert.match(breedingCheck({ ...base, foodDays: 1 }, B).reason, /2 park days of food/);
  assert.match(breedingCheck({ ...base, coveredCells: 3 }, B).reason, /sheltered corner.*at least 30 blocks/);
  assert.match(breedingCheck({ ...base, coveredCells: undefined }, B).reason, /Measure the exhibit again/);
  assert.match(breedingCheck({ ...base, welfareOf: (x) => (x.id === "Bean" ? 50 : 80) }, B).reason, /Bean is 50/);
  const waiting = breedingCheck({ ...base, goodDays: 1 }, B);
  assert.equal(waiting.ok, false);
  assert.equal(waiting.ready, true);
  assert.match(breedingCheck({ ...base, day: 3, cooldownUntil: 5 }, B).reason, /Resting.*2 park days/);
  assert.match(breedingCheck({ ...base, animals: [a("Mochi", "female", { expecting: { daysLeft: 2 } }), a("Bean", "male")] }, B).reason, /Mochi is expecting: due in 2 park days/);
  const crowd = Array.from({ length: 7 }, (_, i) => a(`c${i}`, i ? "male" : "female"));
  assert.match(breedingCheck({ ...base, animals: crowd }, B).reason, /group is full: 8 is the most capybaras/);
  assert.match(breedingCheck({ ...base, state: "unsafe" }, B).reason, /enclosed/);
});

test("Young: half the space and half the food, and every species has a smaller young look", async () => {
  const { populationWeight } = await import("../packs/BP/scripts/animals/breeding.js");
  const B = BALANCE.breeding;
  assert.equal(populationWeight([{}, {}, { juvenile: true }], B.juvenileWeight), 2.5);
  const sp = SPECIES["zoocraft:elephant"];
  const young = { ...sp, rationUnitsPerParkDay: sp.rationUnitsPerParkDay * B.juvenileFeed };
  const mk = () => ({ needs: { satiety: 50, comfort: 70, cleanliness: 90, enrichment: 70, social: 70 }, criticalSeconds: 0, ill: false });
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 2, feederUnits: 20, water: true };
  const adultEats = simulateAnimal(mk(), sp, ctx, BALANCE.clock.dayLength, BALANCE).unitsEaten;
  const youngEats = simulateAnimal(mk(), young, ctx, BALANCE.clock.dayLength, BALANCE).unitsEaten;
  assert.equal(youngEats * 2, adultEats);
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  for (const s of Object.values(SPECIES)) {
    assert.ok(s.breeding, `${s.id} breeds`);
    const name = s.id.split(":")[1];
    const be = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    if (s.sizes) {
      // Crocodiles: a hatchling grows through five stages (zoocraft:grow_0 to 4), from a tenth of a female's size.
      assert.deepEqual(be.events["zoocraft:juvenile"], { add: { component_groups: ["zoocraft:grow_0"] }, set_property: { "zoocraft:grow": 0 } });
      for (const g of [0, 1, 2, 3, 4]) assert.ok(be.component_groups[`zoocraft:grow_${g}`]["minecraft:is_baby"], `${name} grow ${g}`);
      const scale = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description.scripts.scale;
      assert.match(scale, /^\(q\.is_baby \? 0\.05 \* \(1 \+ q\.property\('zoocraft:grow'\)\) : \(q\.mark_variant == 1 \? 0\.655 : 0\.5\)/);
      assert.equal(0.05 / 0.5, s.breeding.juvenileScale);
      continue;
    }
    assert.ok(be.component_groups["zoocraft:juvenile"]["minecraft:is_baby"], `${name} juvenile group`);
    assert.deepEqual(be.events["zoocraft:juvenile"], { add: { component_groups: ["zoocraft:juvenile"] } });
    if (name === "zoo_rabbit") {
      const adult = be.components["minecraft:scale"].value;
      assert.equal(be.component_groups["zoocraft:juvenile"]["minecraft:scale"].value / adult, s.breeding.juvenileScale);
      continue;
    }
    const scale = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description.scripts.scale;
    const m = /^\(?q(?:uery)?\.is_baby \? ([\d.]+) : (?:\(q\.(?:variant|mark_variant) == 1 \? [\d.]+ : ([\d.]+)\)|([\d.]+))\)?$/.exec(scale);
    assert.ok(m, `${name} client scale reads query.is_baby`);
    assert.ok(Math.abs(Number(m[1]) / Number(m[2] ?? m[3]) - s.breeding.juvenileScale) < 1e-6, `${name} young scale`);
  }
});

// ---------- M4 part 1: the Basalt Tortoise, heat and basking pads ----------
test("Basalt Tortoise: a Nether animal in a Thermal Carrier that eats Mineral Pellets", async () => {
  const { levelOf, tasksSeen, TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  const { speciesForWild } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, CARRIERS, carrierByItem } = await import("../packs/BP/scripts/data/items.js");
  const { PROJECTS } = await import("../packs/BP/scripts/data/research.js");
  const tor = SPECIES["zoocraft:basalt_tortoise"];
  assert.equal(speciesForWild("zoocraft:wild_basalt_tortoise"), tor);
  assert.equal(tor.homeDimension, "minecraft:nether");
  assert.equal(tor.heat, true);
  assert.equal(tor.bask.minCells, 4);
  assert.equal(RATIONS[tor.baitItem].diet, "mineral");
  assert.ok(tor.dietTags.includes("mineral"));
  // The Thermal Carrier needs Heat Systems research, and that project exists.
  assert.equal(tor.carrierProfile, "thermal");
  assert.equal(carrierByItem("zoocraft:thermal_carrier").research, "heat_systems");
  assert.ok(PROJECTS.some((p) => p.id === CARRIERS.thermal.research));
  // Field Journal: bask on magma, then gnaw at the rocks off it.
  for (const t of tor.observe) assert.ok(TASKS[t], t);
  const still = { onGround: true, inWater: false, still: true, herd: false };
  assert.deepEqual(tasksSeen(tor, ["spot"], { ...still, onMagma: true }), ["bask"]);
  assert.deepEqual(tasksSeen(tor, ["spot"], { ...still, onMagma: false }), ["gnaw"]);
  assert.deepEqual(tasksSeen(tor, ["spot"], { ...still, still: false, onMagma: true }), []);
  assert.equal(levelOf(tor, ["spot", "bask", "gnaw"]), 3);
  // Shop and recipes: pellets are renewable (basalt or blackstone with bone meal) and on sale.
  assert.ok(BALANCE.shop["zoocraft:mineral_pellets"].price > 0);
  for (const r of ["mineral_pellets_basalt", "mineral_pellets_blackstone", "thermal_regulator", "thermal_carrier"]) {
    const j = JSON.parse(readFileSync(new URL(`../packs/BP/recipes/zoocraft_${r}.json`, import.meta.url), "utf8"));
    assert.ok(j["minecraft:recipe_shapeless"] || j["minecraft:recipe_shaped"], r);
  }
  assert.deepEqual(validateData(), []);
});

test("Basalt Tortoise entities: fireproof, walk onto magma to bask, spawn in basalt deltas, glowing seams", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  for (const name of ["basalt_tortoise", "wild_basalt_tortoise"]) {
    const c = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"].components;
    assert.ok(c["minecraft:fire_immune"], name);
    assert.deepEqual(c["minecraft:behavior.move_to_block"].target_blocks, ["minecraft:magma"]);
    assert.equal(c["minecraft:navigation.walk"].avoid_damage_blocks, false); // magma is a damage block
    const client = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(client.materials.default, "entity_emissive_alpha");
  }
  const rule = read("../packs/BP/spawn_rules/wild_basalt_tortoise.json")["minecraft:spawn_rules"].conditions[0];
  assert.equal(rule["minecraft:biome_filter"].value, "basalt_deltas");
  const rc = read("../packs/RP/render_controllers/basalt_tortoise.render_controllers.json")["render_controllers"]["controller.render.zoocraft.basalt_tortoise"];
  assert.equal(rc.overlay_color.a, "variable.glow"); // set while basking (client pre_animation)
});

test("Heat: a fuelled Thermal Regulator keeps Nether animals warm; without it comfort is capped", async () => {
  const { isWarm, heatValue, serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const tor = SPECIES["zoocraft:basalt_tortoise"];
  assert.equal(isWarm(tor, []), false);
  assert.equal(isWarm(tor, [{ type: "heater", units: 0 }]), false);
  assert.equal(isWarm(tor, [{ type: "heater", units: 3 }]), true);
  assert.equal(isWarm(SPECIES["zoocraft:elephant"], []), true); // Overworld animals don't care
  assert.equal(heatValue("minecraft:charcoal", BALANCE), 2);
  assert.equal(heatValue("minecraft:coal_block", BALANCE), 18);
  assert.equal(heatValue("minecraft:oak_log", BALANCE), 0);
  // It stands beside the floor, like a Cooling Unit.
  const cells = new Map([["5,1,5", "land"]]);
  assert.equal(serves("heater", cells, { x: 6, y: 1, z: 5 }), true);
  assert.equal(serves("heater", cells, { x: 8, y: 1, z: 5 }), false);
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 10, water: true, enrichmentPerDay: 0 };
  const day = BALANCE.clock.dayLength;
  const mk = () => ({ needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false });
  const cold = mk();
  simulateAnimal(cold, tor, { ...ctx, heat: false }, day * 2, BALANCE); // comfort moves 50 a day
  assert.equal(cold.needs.comfort, BALANCE.heater.coldComfortCap);
  const warm = mk();
  simulateAnimal(warm, tor, { ...ctx, heat: true, bask: true }, day, BALANCE);
  assert.equal(warm.needs.comfort, 90);
  // The recovery window is shorter than the time it takes to fall ill: holding comes first, warned.
  assert.ok(BALANCE.heater.graceSeconds <= BALANCE.recovery.holdAfterCriticalSeconds);
});

test("Basking pads: magma blocks in the floor are counted only when asked, and too few cap comfort", async () => {
  const { hasBask } = await import("../packs/BP/scripts/animals/welfare.js");
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("minecraft:magma", { hot: true }), "hot");
  assert.equal(c("minecraft:magma"), "solid");
  assert.equal(c("minecraft:basalt", { hot: true }), "solid");
  // A 6 x 6 pen with magma under x 1-2, z 1-2 (4 blocks).
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const base = gridReader(rows);
  const read = (x, y, z) => (y === 0 && x >= 1 && x <= 2 && z >= 1 && z <= 2 ? "hot" : base(x, y, z));
  const counted = run(read, { x: 3, y: 1, z: 3 }, { countHot: true });
  assert.equal(counted.usableArea, 36);
  assert.equal(counted.hotCells, 4);
  assert.equal(run(read, { x: 3, y: 1, z: 3 }).hotCells, 0);
  const tor = SPECIES["zoocraft:basalt_tortoise"];
  assert.equal(hasBask(tor, { hotCells: 4 }), true);
  assert.equal(hasBask(tor, { hotCells: 3 }), false);
  assert.equal(hasBask(tor, {}), true); // not measured yet
  assert.equal(hasBask(SPECIES["zoocraft:deer"], { hotCells: 0 }), true);
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 10, water: true, heat: true, enrichmentPerDay: 0 };
  const a = { needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false };
  simulateAnimal(a, tor, { ...ctx, bask: false }, BALANCE.clock.dayLength, BALANCE);
  assert.equal(a.needs.comfort, BALANCE.bask.comfortCap);
});

// ---------- Feeder and basket food looks (0.1.44) ----------
test("Feeders and Hanging Food Baskets show the food inside: leaves, fish or mineral pellets", async () => {
  const { RATIONS, FOOD_LOOK, foodLook } = await import("../packs/BP/scripts/data/items.js");
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  // Every ration has a look, and each look is a different one.
  for (const item of Object.keys(RATIONS)) assert.ok(FOOD_LOOK[RATIONS[item].diet] !== undefined, item);
  assert.equal(foodLook("zoocraft:leafy_ration"), 0);
  assert.equal(foodLook("zoocraft:fish_ration"), 1);
  assert.equal(foodLook("zoocraft:mineral_pellets"), 2);
  assert.equal(foodLook(undefined), 0);
  const allLooks = Object.values(FOOD_LOOK);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const [file, perFill] of [["basic_feeder", [1, 2]], ["hanging_food_basket", [null]]]) {
    const b = read(`../packs/BP/blocks/${file}.json`)["minecraft:block"];
    // Molten Plankton Feed never goes in a Basic Feeder (it has the Thermal Feeder), only in baskets.
    const looks = file === "basic_feeder" ? allLooks.filter((l) => l !== FOOD_LOOK.plankton) : allLooks;
    assert.deepEqual(b.description.states["zoocraft:food"], looks, file);
    const shown = new Set();
    for (const food of looks) for (const fill of perFill) {
      // The last permutation whose condition matches wins, as in the game.
      let tex = file === "basic_feeder" ? b.components["minecraft:material_instances"].up.texture : b.components["minecraft:material_instances"].food.texture;
      for (const p of b.permutations ?? []) {
        const cond = p.condition.replace(/query\.block_state\('zoocraft:fill'\)/g, String(fill)).replace(/query\.block_state\('zoocraft:food'\)/g, String(food));
        if (!/^[\d =&|]+$/.test(cond) || !eval(cond)) continue;
        const mi = p.components["minecraft:material_instances"];
        tex = file === "basic_feeder" ? mi.up.texture : mi.food.texture;
      }
      assert.ok(terrain[tex], tex);
      shown.add(`${fill}|${tex}`);
    }
    assert.equal(shown.size, looks.length * perFill.length, file); // each food and fill level has its own texture
  }
});

test("Basalt Tortoises drink lava from a Lava Trough; other animals only drink water", async () => {
  const { hasDrinkingWater, drinkOf, drinksFrom } = await import("../packs/BP/scripts/equipment/rules.js");
  const { BLOCKS } = await import("../packs/BP/scripts/data/items.js");
  const { jobsFor } = await import("../packs/BP/scripts/staff/rules.js");
  const tor = SPECIES["zoocraft:basalt_tortoise"];
  const otter = SPECIES["zoocraft:otter"];
  const land = HABITAT_PROFILES[tor.habitatProfile];
  const wet = HABITAT_PROFILES[otter.habitatProfile];
  assert.equal(drinkOf(tor), "lava");
  assert.equal(drinkOf(otter), "water");
  const lava = { type: "trough", units: 8, liquid: "lava" }; // a Lava Trough
  const water = { type: "trough", units: 8 }; // a Water Trough has no liquid set
  assert.equal(drinksFrom(tor, lava), true);
  assert.equal(drinksFrom(tor, water), false);
  assert.equal(hasDrinkingWater(land, { waterCells: 0 }, [lava], tor), true);
  assert.equal(hasDrinkingWater(land, { waterCells: 0 }, [water], tor), false);
  assert.equal(hasDrinkingWater(land, { waterCells: 40 }, [], tor), false, "a pool is no use to a tortoise");
  assert.equal(hasDrinkingWater(wet, { waterCells: 0 }, [lava], otter), false);
  assert.equal(hasDrinkingWater(wet, { waterCells: 0 }, [water], otter), true);
  // Keepers top up a tortoise's Lava Trough, and leave a Water Trough in a tortoise exhibit alone.
  const ex = { id: "e1", animalIds: ["a"], cleanliness: 100, controller: { x: 0, y: 0, z: 0 } };
  const at = { x: 0, y: 0, z: 0 };
  const diets = { "zoocraft:mineral_pellets": "mineral" };
  const feeder = [{ id: "f1", units: 30, item: "zoocraft:mineral_pellets", pos: at }];
  const kinds = (fx) => jobsFor(ex, tor, feeder, fx, false, BALANCE, diets).map((j) => j.kind);
  assert.deepEqual(kinds([{ id: "t1", type: "trough", units: 2, liquid: "lava", pos: at }]), ["water"]);
  assert.deepEqual(kinds([{ id: "t1", type: "trough", units: 0, pos: at }]), []);
  // The Lava Trough: a block of its own (blackstone, a lava surface that glows when filled), crafted at the workshop.
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const b = read("../packs/BP/blocks/lava_trough.json")["minecraft:block"];
  assert.equal(b.description.identifier, BLOCKS.lavaTrough);
  assert.ok(b.components["zoocraft:fixture"]);
  const mi = b.components["minecraft:material_instances"];
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  assert.ok(terrain[mi["*"].texture] && terrain[mi.water.texture], "textures");
  assert.equal(mi.water.texture, "zoocraft_trough_lava");
  assert.ok(b.permutations.some((p) => p.components["minecraft:light_emission"] > 0));
  assert.equal(read("../packs/BP/recipes/zoocraft_lava_trough.json")["minecraft:recipe_shaped"].result.item, BLOCKS.lavaTrough);
  assert.equal(read("../packs/BP/blocks/water_trough.json")["minecraft:block"].description.states["zoocraft:liquid"], undefined);
  assert.match(readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8"), /^tile\.zoocraft:lava_trough\.name=Lava Trough$/m);
});

// ---------- Ember Fox (0.1.45, M4 part 2) ----------
test("Ember Fox: Warm Ash bed, Ember Den, heat and lava; each one missing caps comfort", async () => {
  const { hasAsh, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { hasDen, serves, drinkOf, isWarm } = await import("../packs/BP/scripts/equipment/rules.js");
  const { RATIONS, FOOD_LOOK, foodLook } = await import("../packs/BP/scripts/data/items.js");
  const { PASSABLE_PATTERNS } = await import("../packs/BP/scripts/data/blocks.js");
  const fox = SPECIES["zoocraft:ember_fox"];
  assert.equal(fox.plural, "Ember Foxes");
  assert.equal(fox.carrierProfile, "thermal");
  assert.equal(drinkOf(fox), "lava");
  assert.equal(RATIONS[fox.baitItem].diet, "ember");
  assert.equal(foodLook("zoocraft:ember_ration"), FOOD_LOOK.ember);
  assert.equal(new Set(Object.values(FOOD_LOOK)).size, Object.keys(FOOD_LOOK).length);
  assert.equal(isWarm(fox, []), false);
  // Warm Ash is counted only when asked for, like magma.
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("zoocraft:warm_ash", { ash: true }), "ash");
  assert.equal(c("zoocraft:warm_ash"), "solid");
  assert.equal(c("zoocraft:ember_den"), "air", "the den has no collision: its cell is floor");
  assert.ok(PASSABLE_PATTERNS.some((r) => r.test("zoocraft:ember_den")));
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const base = gridReader(rows);
  const read = (x, y, z) => (y === 0 && x >= 1 && x <= 2 && z >= 1 && z <= 2 ? "ash" : base(x, y, z));
  const r = run(read, { x: 3, y: 1, z: 3 }, { countAsh: true });
  assert.equal(r.usableArea, 36);
  assert.equal(r.ashCells, 4);
  assert.equal(hasAsh(fox, { ashCells: 4 }), true);
  assert.equal(hasAsh(fox, { ashCells: 3 }), false);
  assert.equal(hasAsh(fox, {}), true); // not measured yet
  assert.equal(hasAsh(SPECIES["zoocraft:basalt_tortoise"], { ashCells: 0 }), true);
  // The den stands on the floor inside the pen.
  assert.equal(serves("den", r.cells, { x: 3, y: 1, z: 3 }), true);
  assert.equal(serves("den", r.cells, { x: 3, y: 3, z: 3 }), false);
  assert.equal(hasDen(fox, []), false);
  assert.equal(hasDen(fox, [{ type: "den" }]), true);
  assert.equal(hasDen(SPECIES["zoocraft:deer"], []), true);
  // Comfort: no ash bed or no den keeps it at the cap; with everything in place it climbs.
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 10, water: true, heat: true, ash: true, den: true, enrichmentPerDay: 0 };
  const animal = () => ({ needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false });
  for (const k of ["ash", "den"]) {
    const a = animal();
    simulateAnimal(a, fox, { ...ctx, [k]: false }, BALANCE.clock.dayLength, BALANCE);
    assert.equal(a.needs.comfort, BALANCE[k].comfortCap, k);
  }
  const ok = animal();
  ok.needs.comfort = 40;
  simulateAnimal(ok, fox, ctx, BALANCE.clock.dayLength, BALANCE);
  assert.equal(ok.needs.comfort, 90);
  assert.deepEqual(comfortCauses(ctx, BALANCE), []);
  assert.deepEqual(comfortCauses({ ...ctx, ash: false, den: false, heat: false }, BALANCE), ["heat", "ash", "den"]);
});

test("Comfort advice names only what this exhibit lacks, and says when comfort is just recovering", async () => {
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const tor = SPECIES["zoocraft:basalt_tortoise"];
  const deer = SPECIES["zoocraft:deer"];
  const ctx = { spaceRatio: 1, water: true, heat: true, bask: true };
  // Everything in place: nothing to fix, it's recovering (Austin's tortoise, 0.1.44).
  assert.match(adviceFor("comfort", tor, comfortCauses(ctx, BALANCE)), /^Nothing to fix: .*recovering/);
  const tip = adviceFor("comfort", tor, comfortCauses({ ...ctx, water: false, bask: false }, BALANCE));
  assert.equal(tip, "Give the animals lava to drink in a Lava Trough and magma blocks to bask on");
  assert.doesNotMatch(tip, /deer|penguin|Cooling Unit/);
  assert.equal(adviceFor("comfort", deer, comfortCauses({ spaceRatio: 0.5, water: false, cover: false }, BALANCE)), "Give the animals more room, drinking water and trees or a roof over part of the ground");
  // A little short on room still lets comfort reach healthy, so it isn't blamed.
  assert.deepEqual(comfortCauses({ spaceRatio: 0.9 }, BALANCE), []);
  assert.equal(adviceFor("satiety", tor), "Fill the feeder with Mineral Pellets");
  assert.match(adviceFor("social", deer), /^Deer like company: keep 2 or more together/);
  assert.match(adviceFor("social", tor), /^Basalt Tortoises are happy alone/);
  // Without the exhibit's causes the comfort advice is generic but names no other species.
  assert.doesNotMatch(adviceFor("comfort"), /deer|penguin/i);
});

test("Ember Fox files: entities, spawn rules, blocks, recipes, ember feeder look and names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const id of ["ember_fox", "wild_ember_fox"]) {
    const e = read(`../packs/BP/entities/${id}.json`)["minecraft:entity"];
    const comp = e.components;
    assert.ok(comp["minecraft:fire_immune"], id);
    assert.deepEqual(comp["minecraft:behavior.tempt"].items, ["zoocraft:ember_ration"]);
    assert.ok(read(`../packs/RP/entity/${id}.entity.json`)["minecraft:client_entity"].description.scripts.scale);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${id}\\.name=`, "m"));
  }
  assert.deepEqual(read("../packs/BP/entities/ember_fox.json")["minecraft:entity"].components["minecraft:behavior.move_to_block"].target_blocks, ["zoocraft:ember_den"]);
  const spawn = read("../packs/BP/spawn_rules/wild_ember_fox.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(spawn["minecraft:biome_filter"].any_of.map((t) => t.value), ["soulsand_valley", "crimson_forest"]);
  const den = read("../packs/BP/blocks/ember_den.json")["minecraft:block"];
  assert.equal(den.components["minecraft:collision_box"], false);
  assert.ok(den.components["zoocraft:fixture"]);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const m of Object.values(den.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
  assert.equal(read("../packs/BP/blocks/warm_ash.json")["minecraft:block"].description.identifier, "zoocraft:warm_ash");
  for (const r of ["zoocraft_warm_ash_gravel", "zoocraft_warm_ash_soul_soil", "zoocraft_ember_den", "zoocraft_ember_ration_beef"]) assert.ok(read(`../packs/BP/recipes/${r}.json`), r);
  for (const k of ["item.zoocraft:ember_ration", "tile.zoocraft:warm_ash", "tile.zoocraft:ember_den"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
  // Feeders and baskets have an ember look (zoocraft:food 3).
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  assert.deepEqual(feeder.description.states["zoocraft:food"], [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11], "5: warped fungus for Striders (0.1.48), 6: Chorus Browse for Chorus Deer (0.1.50), 7: Insect Rations for Hedgehogs (0.1.62), 8: Fruit Rations for Raccoons (0.1.71), 9: Flamingo Pellets for Flamingos (0.1.72), 10: Grain Rations for Zebras (0.1.74), 11: Meat Rations for Lions (0.1.75)");
  for (const fill of [1, 2]) assert.ok(feeder.permutations.some((p) => p.condition.includes(`fill') == ${fill}`) && p.condition.includes("food') == 3") && terrain[p.components["minecraft:material_instances"].up.texture]));
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.ok(basket.permutations.some((p) => p.condition.includes("== 3") && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_ember"));
  // Every block uses one render method for all its material instances (a content log error otherwise).
  const elevated = read("../packs/BP/blocks/elevated_feeder.json")["minecraft:block"];
  assert.equal(new Set(Object.values(elevated.components["minecraft:material_instances"]).map((m) => m.render_method)).size, 1);
});

test("A Viewing Point serves the exhibit at its fence, else the nearest with animals in view", async () => {
  const { chooseViewed } = await import("../packs/BP/scripts/visitors/demand.js");
  const ex1 = { id: "e1" }, ex3 = { id: "e3" };
  // Austin's case: right at Exhibit 3's fence (its tortoise out of sight), Exhibit 1 farther with 2 of 4 in view.
  assert.equal(chooseViewed([{ ex: ex3, seen: 0, total: 1, dist: 1 }, { ex: ex1, seen: 2, total: 4, dist: 9 }], BALANCE).ex, ex3);
  assert.equal(chooseViewed([{ ex: ex3, seen: 1, total: 1, dist: 1 }, { ex: ex1, seen: 4, total: 4, dist: 9 }], BALANCE).ex, ex3);
  // Away from any fence: the nearest exhibit with an animal in view, not the one with the most.
  assert.equal(chooseViewed([{ ex: ex3, seen: 0, total: 1, dist: 6 }, { ex: ex1, seen: 2, total: 4, dist: 9 }], BALANCE).ex, ex1);
  assert.equal(chooseViewed([{ ex: ex3, seen: 1, total: 1, dist: 6 }, { ex: ex1, seen: 3, total: 4, dist: 9 }], BALANCE).ex, ex3);
  // Nothing in view: the nearest with animals loaded; nothing loaded: the nearest.
  assert.equal(chooseViewed([{ ex: ex3, seen: 0, total: 0, dist: 6 }, { ex: ex1, seen: 0, total: 4, dist: 9 }], BALANCE).ex, ex1);
  assert.equal(chooseViewed([{ ex: ex3, seen: 0, total: 0, dist: 6 }], BALANCE).total, 0);
});

// A 9 x 9 pen walled with barriers: a grass bank west of `edge`, a lava pool east of it (one block
// down), 2 deep in the middle.
function lavaPen(edge) {
  return (x, y, z) => {
    if (x < -5 || x > 5 || z < -5 || z > 5) return "air";
    if (x === -5 || x === 5 || z === -5 || z === 5) return y === 0 || y === 1 ? "barrier" : y < 0 ? "solid" : "air";
    const pool = x >= edge;
    const deep = x >= 2 && x <= 3 && z >= -2 && z <= 2;
    if (y >= 0) return "air";
    if (y === -1) return pool ? "lava" : "solid";
    if (y === -2) return deep ? "lava" : "solid";
    return "solid";
  };
}
function runLava(grid, seed, swimLava) {
  const r = newResult(seed);
  const it = floodTerrestrial(grid, seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 3, cellsPerYield: 1e9, swimLava }, r);
  while (!it.next().done);
  return r;
}

test("Lava Rays swim in a lava pool: it counts as their space; walkers stay out of it", async () => {
  const { habitatArea, habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const prof = HABITAT_PROFILES.lava_pool;
  const ray = SPECIES["zoocraft:lava_ray"];
  assert.equal(ray.habitatProfile, "lava_pool");
  // A Lava Ray's view: the bank and the lava surface; the pool is 2 deep in 10 spots.
  const r = runLava(lavaPen(-2), { x: -4, y: 0, z: 0 }, true);
  assert.equal(r.enclosed, true);
  assert.equal(r.landCells, 18, "2 bank columns x 9");
  assert.equal(r.lavaCells, 63, "7 lava columns x 9");
  assert.equal(r.deepLavaCells, 10);
  assert.equal(r.hazards, 0);
  // A fox's view of the same pen: only the bank; it never steps into the lava.
  const walk = runLava(lavaPen(-2), { x: -4, y: 0, z: 0 }, false);
  assert.equal(walk.lavaCells, 0);
  assert.equal(walk.landCells, 18);
  assert.ok(![...walk.cells.values()].includes("lava"));
  // Space and what's missing.
  const ex = { usableArea: r.usableArea, lavaCells: r.lavaCells, deepLavaCells: r.deepLavaCells };
  assert.equal(habitatArea(ex, prof), 81);
  assert.equal(habitatArea(ex, HABITAT_PROFILES.small_terrestrial), 18, "lava is no space for walkers");
  assert.equal(habitatProblem(ex, prof, "Lava Ray"), undefined);
  assert.match(habitatProblem({ usableArea: 18, lavaCells: 0 }, prof, "Lava Ray"), /live in lava.*wooden fences on fire/);
  const small = runLava(lavaPen(1), { x: -4, y: 0, z: 0 }, true); // 4 lava columns, 5 bank columns
  assert.match(habitatProblem({ usableArea: small.usableArea, lavaCells: small.lavaCells, deepLavaCells: small.deepLavaCells }, prof, "Lava Ray"), /more lava: at least 60%/);
  assert.match(habitatProblem({ ...ex, deepLavaCells: 3 }, prof, "Lava Ray"), /room to turn: lava 2 blocks deep in at least 8 spots \(now 3\)/);
  // They drink the lava they swim in: no trough, no Water Filter warning.
  const { drinksFromPool, hasDrinkingWater } = await import("../packs/BP/scripts/equipment/rules.js");
  assert.equal(drinksFromPool(ray, prof, ex), true);
  assert.equal(hasDrinkingWater(prof, ex, [], ray), true);
  assert.equal(drinksFromPool(SPECIES["zoocraft:ember_fox"], HABITAT_PROFILES.small_terrestrial, ex), false);
  assert.equal(drinksFromPool(SPECIES["zoocraft:otter"], HABITAT_PROFILES.small_wetland, { waterCells: 20 }), true);
});

test("Lava Rays eat Molten Plankton Feed from a Thermal Feeder at the edge of the lava", async () => {
  const { reachesFeeder, serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const { jobsFor, rationFor } = await import("../packs/BP/scripts/staff/rules.js");
  const { RATIONS } = await import("../packs/BP/scripts/data/items.js");
  const ray = SPECIES["zoocraft:lava_ray"];
  const fox = SPECIES["zoocraft:ember_fox"];
  const giraffe = SPECIES["zoocraft:giraffe"];
  const thermal = { thermal: true }, basic = {}, high = { high: true };
  assert.equal(reachesFeeder(ray, thermal), true);
  assert.equal(reachesFeeder(ray, basic), false);
  assert.equal(reachesFeeder(ray, high), false);
  assert.equal(reachesFeeder(fox, thermal), false);
  assert.equal(reachesFeeder(fox, basic), true);
  assert.equal(reachesFeeder(giraffe, high), true);
  assert.equal(reachesFeeder(giraffe, thermal), false);
  // A Thermal Feeder in the pool wall, level with the lava, is reached from the lava, not the bank.
  const r = runLava(lavaPen(-2), { x: -4, y: 0, z: 0 }, true);
  assert.equal(isReachable(r.cells, { x: 2, y: -1, z: -5 }, "lava"), true);
  assert.equal(isReachable(r.cells, { x: 2, y: -1, z: -5 }), false);
  // A basket can hang over the lava.
  assert.equal(serves("basket", r.cells, { x: 2, y: 1, z: 0 }), true);
  // Rations: plankton is thermal; keepers fill the Thermal Feeder with it.
  assert.equal(RATIONS["zoocraft:molten_plankton"].diet, "plankton");
  assert.ok(RATIONS["zoocraft:molten_plankton"].thermal);
  assert.equal(ray.baitItem, "zoocraft:molten_plankton");
  const feeder = { id: "f1", type: "feeder", thermal: true, units: 0, pos: { x: 2, y: -1, z: -5 } };
  const ex = { id: "e1", dimension: "minecraft:nether", controller: { x: 0, y: 0, z: 0 }, animalIds: ["a1", "a2"], cleanliness: 100 };
  const diets = Object.fromEntries(Object.entries(RATIONS).map(([k, v]) => [k, v.diet]));
  const jobs = jobsFor(ex, ray, [feeder], [], true, BALANCE, diets);
  assert.deepEqual(jobs.map((j) => j.kind), ["feed"]);
  assert.equal(rationFor(ray, feeder, { "zoocraft:molten_plankton": 10, "zoocraft:ember_ration": 10 }, RATIONS), "zoocraft:molten_plankton");
  // A Basic Feeder in a Lava Ray exhibit gets no keeper job: they can't eat from it.
  assert.deepEqual(jobsFor(ex, ray, [{ ...feeder, thermal: undefined }], [], true, BALANCE, diets).map((j) => j.kind), []);
  // Shop and names.
  assert.ok(BALANCE.shop["zoocraft:molten_plankton"]);
  assert.deepEqual(validateData(), []);
});

test("Ration names read right in the plural: Molten Plankton Feed stays as it is", async () => {
  const { rationPlural, rationCount } = await import("../packs/BP/scripts/data/items.js");
  assert.equal(rationPlural("zoocraft:leafy_ration"), "Leafy Rations");
  assert.equal(rationPlural("zoocraft:molten_plankton"), "Molten Plankton Feed");
  assert.equal(rationCount("zoocraft:fish_ration", 1), "Fish Ration");
  assert.equal(rationCount("zoocraft:fish_ration", 3), "Fish Rations");
  assert.equal(rationCount("zoocraft:molten_plankton", 3), "Molten Plankton Feed");
  // No script builds a plural by adding "s" to a ration label any more.
  for (const f of ["ui/staffMenu.js", "ui/fieldJournal.js", "staff/staff.js", "equipment/fixtures.js", "animals/animals.js", "animals/welfare.js"]) {
    const src = readFileSync(new URL(`../packs/BP/scripts/${f}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, /\.label(?: \?\? [\w"]+)?\}s|\.label\}\$\{\w+(?:\.\w+)? === 1/, f);
  }
});

test("Nether toys: a Blaze Bone for Ember Foxes, a Wither Skull Ball for Basalt Tortoises, nobody else", async () => {
  const { enrichmentKinds, enrichmentOptions, likesToy } = await import("../packs/BP/scripts/equipment/rules.js");
  const fox = SPECIES["zoocraft:ember_fox"];
  const tor = SPECIES["zoocraft:basalt_tortoise"];
  const elephant = SPECIES["zoocraft:elephant"];
  const kinds = (sp, types) => enrichmentKinds(types.map((type) => ({ type })), sp, BALANCE, {});
  assert.deepEqual(kinds(fox, ["bone"]), ["dig"]);
  assert.deepEqual(kinds(rabbit, ["bone"]), [], "rabbits dig, but the Blaze Bone is the fox's");
  assert.deepEqual(kinds(tor, ["skull"]), ["manipulate"]);
  assert.deepEqual(kinds(elephant, ["skull"]), [], "elephants like handling things, but not the skull ball");
  assert.deepEqual(kinds(fox, ["skull"]), []);
  assert.deepEqual(kinds(tor, ["bone"]), []);
  assert.deepEqual(kinds(elephant, ["ball"]), ["manipulate"], "the Enrichment Ball is still for anyone");
  assert.deepEqual(kinds(fox, ["bone", "ball"]).sort(), ["dig", "manipulate"]);
  assert.equal(likesToy(rabbit, "basket", BALANCE), true);
  assert.ok(enrichmentOptions(fox, BALANCE).includes("bone"));
  assert.ok(!enrichmentOptions(rabbit, BALANCE).includes("bone"));
  assert.ok(enrichmentOptions(tor, BALANCE).includes("skull"));
  assert.ok(!enrichmentOptions(elephant, BALANCE).includes("skull"));
});

test("Lava Rays are watched gliding through the lava and drifting at the surface", async () => {
  const { tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const ray = SPECIES["zoocraft:lava_ray"];
  assert.deepEqual(ray.observe, ["spot", "glide", "drift"]);
  assert.deepEqual(tasksSeen(ray, ["spot"], { inLava: true, still: false }), ["glide"]);
  assert.deepEqual(tasksSeen(ray, ["spot"], { inLava: true, still: true }), ["drift"]);
  assert.deepEqual(tasksSeen(ray, ["spot"], { inLava: false, onGround: true, still: true }), []);
});

test("A Lava Ray in a Clear Lava pool is seen along the line of sight through the lava", async () => {
  const { alongSight } = await import("../packs/BP/scripts/discovery/rules.js");
  const { cellsAlong } = await import("../packs/BP/scripts/animals/glide.js");
  const { TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  // Looking down into a pool from the bank: air, then Clear Lava, with the ray two blocks under the surface.
  const line = cellsAlong({ x: 0.5, y: 5.6, z: 0.5 }, { x: 0.6, y: -0.8, z: 0 }, 24, 0.25);
  const cells = line.map((c) => ({ ...c, open: c.y >= 3 || (c.y >= 0 && c.x >= 1) }));
  const ray = { id: "ray", x: 2.5, y: 1.7, z: 0.5 };
  assert.equal(alongSight(cells, [ray]), "ray");
  // A ray off the line, or stone in the way, isn't seen.
  assert.equal(alongSight(cells, [{ id: "far", x: 2.5, y: 1.7, z: 4.5 }]), undefined);
  assert.equal(alongSight(cells.map((c) => ({ ...c, open: c.y >= 3 })), [ray]), undefined);
  assert.equal(alongSight([], [ray]), undefined);
  assert.match(TASKS.glide.text, /Clear Lava counts/);
  assert.match(TASKS.drift.text, /Clear Lava counts/);
});

test("Lava Ray, Thermal Feeder and Nether toy files: entities, spawn rules, blocks, recipes, looks and names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const icons = read("../packs/RP/textures/item_texture.json").texture_data;
  for (const id of ["lava_ray", "wild_lava_ray"]) {
    const comp = read(`../packs/BP/entities/${id}.json`)["minecraft:entity"].components;
    assert.ok(comp["minecraft:fire_immune"], id);
    assert.ok(comp["minecraft:lava_movement"], id);
    assert.equal(comp["minecraft:behavior.move_to_liquid"].material_type, "Lava");
    assert.equal(comp["minecraft:navigation.walk"].can_walk_in_lava, true);
    assert.deepEqual(comp["minecraft:behavior.tempt"].items, ["zoocraft:molten_plankton"]);
    const client = read(`../packs/RP/entity/${id}.entity.json`)["minecraft:client_entity"].description;
    assert.ok(client.scripts.scale, id);
    assert.equal(client.materials.default, "entity_emissive_alpha");
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${id}\\.name=`, "m"));
  }
  const spawn = read("../packs/BP/spawn_rules/wild_lava_ray.json")["minecraft:spawn_rules"].conditions[0];
  assert.ok(spawn["minecraft:spawns_lava"]);
  assert.deepEqual(spawn["minecraft:biome_filter"].any_of.map((t) => t.value), ["basalt_deltas", "nether_wastes"]);
  // Thermal Feeder: a feeder block whose look shows how full it is.
  const tf = read("../packs/BP/blocks/thermal_feeder.json")["minecraft:block"];
  assert.equal(tf.description.identifier, "zoocraft:thermal_feeder");
  assert.deepEqual(tf.description.states["zoocraft:fill"], [0, 1, 2]);
  assert.ok(tf.components["zoocraft:feeder"]);
  const tops = new Set([tf.components["minecraft:material_instances"].up.texture]);
  for (const p of tf.permutations) {
    for (const m of Object.values(p.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
    tops.add(p.components["minecraft:material_instances"].up.texture);
  }
  assert.equal(tops.size, 3, "empty, low and full each look different");
  // Baskets show plankton (zoocraft:food 4).
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.ok(basket.permutations.some((p) => p.condition.includes("== 4") && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_plankton"));
  assert.ok(terrain.zoocraft_basket_food_plankton);
  // Items, recipes and names.
  for (const [item, comp] of [["molten_plankton", undefined], ["blaze_bone", "zoocraft:nether_toy"], ["wither_skull_ball", "zoocraft:nether_toy"]]) {
    const it = read(`../packs/BP/items/${item}.json`)["minecraft:item"];
    assert.ok(icons[it.components["minecraft:icon"].textures.default], item);
    if (comp) assert.ok(it.components[comp], item);
    assert.match(lang, new RegExp(`^item\\.zoocraft:${item}\\.name=`, "m"));
    assert.ok(read(`../packs/BP/recipes/zoocraft_${item}.json`), item);
  }
  const skull = read("../packs/BP/recipes/zoocraft_wither_skull_ball.json")["minecraft:recipe_shaped"];
  assert.ok(Object.values(skull.key).some((k) => k.item === "minecraft:wither_skeleton_skull"), "crafted with a wither skull");
  const bone = read("../packs/BP/recipes/zoocraft_blaze_bone.json")["minecraft:recipe_shaped"];
  assert.deepEqual(Object.values(bone.key).map((k) => k.item).sort(), ["minecraft:blaze_rod", "minecraft:bone"]);
  assert.ok(read("../packs/BP/recipes/zoocraft_thermal_feeder.json"));
  assert.match(lang, /^tile\.zoocraft:thermal_feeder\.name=Thermal Feeder$/m);
  // Toy entities: picked up again by hand, never hurt, and their client files point at real art.
  for (const id of ["blaze_bone_entity", "wither_skull_ball_entity"]) {
    const comp = read(`../packs/BP/entities/${id}.json`)["minecraft:entity"].components;
    assert.ok(comp["minecraft:interact"] && comp["minecraft:fire_immune"], id);
    assert.ok(read(`../packs/RP/entity/${id}.entity.json`)["minecraft:client_entity"].description.geometry.default, id);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${id}\\.name=`, "m"));
  }
});

test("Clear Lava counts as lava for exhibits, but guests see through it", () => {
  const c = (id) => classifyBlock(id, { isAir: false, isLiquid: false, open: false });
  assert.equal(c("zoocraft:clear_lava"), "lava");
  assert.equal(blocksView("zoocraft:clear_lava", { isAir: false, isLiquid: false }), false);
  assert.equal(blocksView("minecraft:lava", { isAir: false, isLiquid: true }), false);
  assert.equal(blocksView("zoocraft:lava_filter", { isAir: false, isLiquid: false }), true);
});

test("Lava Rays glide through Clear Lava in arcs, hold their depth and drift now and then", async () => {
  const { GLIDE, glideStep, turnToward, yawOf, facing, reached, spotIn, cellsAlong } = await import("../packs/BP/scripts/animals/glide.js");
  // Yaw and facing agree (Minecraft: 0 faces +z, 90 faces -x).
  for (const [dx, dz] of [[0, 1], [-1, 0], [1, 0], [0, -1], [0.6, 0.8]]) {
    const f = facing(yawOf(dx, dz));
    assert.ok(Math.abs(f.x - dx / Math.hypot(dx, dz)) < 1e-9 && Math.abs(f.z - dz / Math.hypot(dx, dz)) < 1e-9, `${dx},${dz}`);
  }
  assert.equal(turnToward(170, -170, 5), 175, "the short way round");
  assert.equal(turnToward(0, 3, 5), 3);
  assert.equal(turnToward(0, 90, 5), 5);
  // Gliding: forward at its pace, turning a few degrees a tick; slower and sharper at the pool's edge.
  const pos = { x: 0.5, y: 10.35, z: 0.5 };
  const spot = spotIn({ x: 0, y: 10, z: 6 });
  const a = glideStep({ pos, yaw: 90, spot, drifting: false, clearAhead: true });
  assert.ok(Math.abs(Math.hypot(a.x, a.z) - GLIDE.speed) < 1e-9);
  assert.equal(a.yaw, 90 - GLIDE.turn);
  const b = glideStep({ pos, yaw: 90, spot, drifting: false, clearAhead: false });
  assert.ok(Math.hypot(b.x, b.z) < Math.hypot(a.x, a.z));
  assert.equal(b.yaw, 90 - GLIDE.sharpTurn);
  // Drifting: no sideways movement.
  const dr = glideStep({ pos, yaw: 30, spot: pos, drifting: true, clearAhead: true });
  assert.equal(dr.x, 0);
  assert.equal(dr.z, 0);
  assert.equal(dr.yaw, 30);
  // Depth: whichever way round the game applies gravity, the ray settles at its spot's depth and
  // reaches the spot (it swims in an arc and gets there).
  for (const gravityFirst of [true, false]) {
    let p = { x: 0.5, y: 11.6, z: 0.5 }, yaw = 180, trim = 0, got = false;
    for (let t = 0; t < 400 && !got; t++) {
      const v = glideStep({ pos: p, yaw, spot, drifting: false, clearAhead: true, trim });
      yaw = v.yaw;
      trim = v.trim;
      const vy = gravityFirst ? (v.y - GLIDE.gravity) * 0.98 : v.y;
      p = { x: p.x + v.x, y: p.y + vy, z: p.z + v.z };
      got = reached(p, spot);
    }
    assert.ok(got, `reaches its spot (gravity first: ${gravityFirst})`);
    let still = { ...spot, y: spot.y + 0.8 };
    trim = 0;
    for (let t = 0; t < 600; t++) {
      const v = glideStep({ pos: still, yaw: 0, spot, drifting: true, clearAhead: true, trim });
      trim = v.trim;
      still = { ...still, y: still.y + (gravityFirst ? (v.y - GLIDE.gravity) * 0.98 : v.y - GLIDE.gravity) };
    }
    assert.ok(Math.abs(still.y - spot.y) < 0.1, `holds its depth (gravity first: ${gravityFirst}): ${still.y}`);
  }
  // The cells a bucket points through, in order, each once.
  const cells = cellsAlong({ x: 0.5, y: 1.6, z: 0.5 }, { x: 0, y: -0.6, z: 0.8 }, 3);
  assert.deepEqual(cells[0], { x: 0, y: 1, z: 0 });
  assert.equal(new Set(cells.map((c) => `${c.x},${c.y},${c.z}`)).size, cells.length);
  assert.deepEqual(cells.at(-1), { x: 0, y: -1, z: 2 });
});

test("Clear Lava, the Lava Filter and the Clear Lava Bucket files", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const icons = read("../packs/RP/textures/item_texture.json").texture_data;
  // Clear Lava: see-through, glowing, can't be walked on, aimed at or mined; its faces vanish
  // against more Clear Lava; its texture is animated.
  const cl = read("../packs/BP/blocks/clear_lava.json")["minecraft:block"];
  assert.equal(cl.description.identifier, "zoocraft:clear_lava");
  const comp = cl.components;
  assert.equal(comp["minecraft:material_instances"]["*"].render_method, "blend");
  assert.ok(terrain[comp["minecraft:material_instances"]["*"].texture]);
  assert.equal(comp["minecraft:collision_box"], false);
  assert.equal(comp["minecraft:selection_box"], false);
  assert.equal(comp["minecraft:light_emission"], 15);
  const geo = read("../packs/RP/models/blocks/clear_lava.geo.json")["minecraft:geometry"][0];
  assert.equal(geo.description.identifier, comp["minecraft:geometry"].identifier);
  const cull = read("../packs/RP/block_culling/clear_lava.json")["minecraft:block_culling_rules"];
  assert.equal(cull.description.identifier, comp["minecraft:geometry"].culling);
  assert.equal(cull.rules.length, 6);
  assert.ok(cull.rules.every((r) => r.condition === "same_block" && r.geometry_part.bone === geo.bones[0].name));
  const flip = read("../packs/RP/textures/flipbook_textures.json");
  const f = flip.find((x) => x.atlas_tile === "zoocraft_clear_lava");
  assert.equal(f.flipbook_texture, terrain.zoocraft_clear_lava.textures);
  const png = readFileSync(new URL(`../packs/RP/${f.flipbook_texture}.png`, import.meta.url));
  assert.equal(png.readUInt32BE(16), 16, "frames 16 wide");
  assert.equal(png.readUInt32BE(20) % 16, 0, "a strip of square frames");
  // Lava Filter: a workshop block whose window glows while it works.
  const lf = read("../packs/BP/blocks/lava_filter.json")["minecraft:block"];
  assert.ok(lf.components["zoocraft:lava_filter"]);
  assert.deepEqual(lf.description.states["zoocraft:working"], [false, true]);
  for (const m of [lf.components["minecraft:material_instances"], lf.permutations[0].components["minecraft:material_instances"]]) for (const v of Object.values(m)) assert.ok(terrain[v.texture], v.texture);
  const recipe = read("../packs/BP/recipes/zoocraft_lava_filter.json")["minecraft:recipe_shaped"];
  assert.deepEqual(recipe.tags, ["zoocraft_workshop"]);
  assert.equal(recipe.result.item, "zoocraft:lava_filter");
  // The bucket.
  const it = read("../packs/BP/items/clear_lava_bucket.json")["minecraft:item"];
  assert.ok(it.components["zoocraft:clear_lava_bucket"]);
  assert.equal(it.components["minecraft:max_stack_size"].value, 1);
  assert.ok(icons[it.components["minecraft:icon"].textures.default]);
  // Names.
  assert.match(lang, /^tile\.zoocraft:clear_lava\.name=Clear Lava$/m);
  assert.match(lang, /^tile\.zoocraft:lava_filter\.name=Lava Filter$/m);
  assert.match(lang, /^item\.zoocraft:clear_lava_bucket\.name=Clear Lava Bucket$/m);
  // Lava Rays swim (and show it) in Clear Lava too.
  const ctl = readFileSync(new URL("../packs/RP/animation_controllers/lava_ray.animation_controllers.json", import.meta.url), "utf8");
  assert.match(ctl, /query\.ground_speed/);
});

// ---------- M4 part 4: Striders ----------
test("Striders walk across a lava pool, rest on magma on the bank and shiver anywhere else", async () => {
  const { habitatArea, habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const { drinksFromPool, hasDrinkingWater, reachesFeeder } = await import("../packs/BP/scripts/equipment/rules.js");
  const { speciesForWild, livesOnLava } = await import("../packs/BP/scripts/data/species.js");
  const { hasBask, adviceFor } = await import("../packs/BP/scripts/animals/welfare.js");
  const st = SPECIES["zoocraft:zoo_strider"];
  const prof = HABITAT_PROFILES[st.habitatProfile];
  // A zoo copy of the vanilla strider, caught from wild ones in a Thermal Carrier.
  assert.equal(speciesForWild("minecraft:strider"), st);
  assert.equal(st.origin, "vanilla");
  assert.equal(st.homeDimension, "minecraft:nether");
  assert.equal(st.carrierProfile, "thermal");
  assert.equal(st.lavaWalker, true);
  assert.ok(!st.lavaSwimmer && !st.heat && !st.drinksLava, "the lava keeps it warm and it drinks nothing else");
  assert.equal(livesOnLava(st), true);
  assert.equal(livesOnLava(SPECIES["zoocraft:lava_ray"]), true);
  assert.equal(livesOnLava(SPECIES["zoocraft:ember_fox"]), false);
  // The pool counts as its space; any depth will do, but it needs a bank to rest on.
  const r = runLava(lavaPen(-2), { x: -4, y: 0, z: 0 }, true);
  const ex = { usableArea: r.usableArea, lavaCells: r.lavaCells, deepLavaCells: 0 };
  assert.equal(habitatArea(ex, prof), 81);
  assert.equal(habitatProblem(ex, prof, "Strider"), undefined, "a shallow pool is fine");
  assert.match(habitatProblem({ usableArea: 18, lavaCells: 0 }, prof, "Strider"), /Striders walk across lava: dig a lava pool/);
  assert.match(habitatProblem({ usableArea: 60, lavaCells: 20 }, prof, "Strider"), /more lava: at least 40% of the space \(now 25%\)/);
  assert.match(habitatProblem({ usableArea: 8, lavaCells: 72 }, prof, "Strider"), /a bank to rest on: at least 20% of the space dry ground \(now 10%\)/);
  assert.match(habitatProblem({ usableArea: 18, lavaCells: 0 }, HABITAT_PROFILES.lava_pool, "Lava Ray"), /Lava Rays live in lava/, "rays unchanged");
  // Warm resting spots: magma blocks on the bank (exhibits measure them as hot cells).
  assert.equal(hasBask(st, { hotCells: 3 }), false);
  assert.equal(hasBask(st, { hotCells: 4 }), true);
  assert.equal(adviceFor("comfort", st, ["bask", "water"]), "Give the animals magma blocks to rest on and a lava pool");
  assert.equal(adviceFor("comfort", SPECIES["zoocraft:basalt_tortoise"], ["bask"]), "Give the animals magma blocks to bask on");
  // No trough: the lava pool is enough. No Thermal Feeder: warped fungus in a Basic Feeder on the bank.
  assert.equal(drinksFromPool(st, prof, ex), true);
  assert.equal(hasDrinkingWater(prof, ex, [], st), true);
  assert.equal(reachesFeeder(st, {}), true);
  assert.equal(reachesFeeder(st, { thermal: true }), false);
  assert.equal(reachesFeeder(st, { high: true }), false);
  assert.equal(adviceFor("satiety", st), "Fill the feeder with Warped Fungi");
  assert.deepEqual(validateData(), []);
});

test("Striders eat warped fungus; feeders and baskets show it", async () => {
  const { RATIONS, rationPlural, rationCount, foodLook } = await import("../packs/BP/scripts/data/items.js");
  const { rationFor } = await import("../packs/BP/scripts/staff/rules.js");
  const st = SPECIES["zoocraft:zoo_strider"];
  assert.equal(st.baitItem, "minecraft:warped_fungus");
  assert.equal(RATIONS[st.baitItem].diet, "fungus");
  assert.ok(!RATIONS[st.baitItem].thermal, "a Basic Feeder takes it");
  assert.equal(rationPlural(st.baitItem), "Warped Fungi");
  assert.equal(rationCount(st.baitItem, 1), "Warped Fungus");
  assert.equal(rationFor(st, {}, { "minecraft:warped_fungus": 5, "zoocraft:leafy_ration": 5 }, RATIONS), "minecraft:warped_fungus");
  // The shop sells it but doesn't buy it back (it grows on warped nylium).
  assert.ok(BALANCE.shop["minecraft:warped_fungus"].price > 0);
  assert.ok(!BALANCE.shop["minecraft:warped_fungus"].sell);
  // The look: food 5 on the Basic Feeder (low and full) and in the Hanging Food Basket.
  assert.equal(foodLook("minecraft:warped_fungus"), 5);
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  assert.ok(feeder.description.states["zoocraft:food"].includes(5));
  for (const fill of [1, 2]) {
    const p = feeder.permutations.find((x) => x.condition === `query.block_state('zoocraft:fill') == ${fill} && query.block_state('zoocraft:food') == 5`);
    const tex = p.components["minecraft:material_instances"].up.texture;
    assert.equal(tex, `zoocraft_feeder_fungus_${fill}`);
    assert.ok(terrain[tex]);
  }
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.ok(basket.description.states["zoocraft:food"].includes(5));
  const bp = basket.permutations.find((x) => x.condition === "query.block_state('zoocraft:food') == 5");
  assert.equal(bp.components["minecraft:material_instances"].food.texture, "zoocraft_basket_food_fungus");
  assert.ok(terrain.zoocraft_basket_food_fungus);
});

test("Striders are watched walking across the lava and shivering ashore", async () => {
  const { tasksSeen, TASKS } = await import("../packs/BP/scripts/discovery/rules.js");
  const st = SPECIES["zoocraft:zoo_strider"];
  for (const t of st.observe) assert.ok(TASKS[t], t);
  const done = ["spot"];
  assert.deepEqual(tasksSeen(st, done, { inLava: true, still: false, onGround: false }), ["stride"]);
  assert.deepEqual(tasksSeen(st, done, { inLava: true, still: true, onGround: false }), []);
  assert.deepEqual(tasksSeen(st, done, { inLava: false, inWater: false, onGround: true, still: true, onMagma: false }), ["ashore"]);
  assert.deepEqual(tasksSeen(st, done, { inLava: false, inWater: false, onGround: true, still: true, onMagma: true }), [], "warm on magma: no shivering");
});

test("Zoo Strider files: the vanilla strider's model, a cold look off the lava and magma, names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const be = read("../packs/BP/entities/zoo_strider.json")["minecraft:entity"];
  const c = be.components;
  assert.ok(c["minecraft:fire_immune"]);
  assert.ok(c["minecraft:navigation.walk"].can_walk_in_lava && c["minecraft:navigation.walk"].can_path_over_lava);
  assert.ok(c["minecraft:lava_movement"].value > c["minecraft:movement"].value, "quicker on lava");
  assert.ok(c["minecraft:behavior.rise_to_liquid_level"]);
  assert.deepEqual(c["minecraft:behavior.move_to_block"].target_blocks, ["minecraft:magma"]);
  assert.ok(c["minecraft:behavior.tempt"].items.includes("warped_fungus"));
  assert.ok(c["minecraft:type_family"].family.includes("strider"));
  // Warm on lava or magma; it shivers anywhere else, and stops once it's back.
  const tests = (g) => JSON.stringify(be.component_groups[g]["minecraft:environment_sensor"]);
  assert.match(tests("zoocraft:warm"), /in_lava.*on_hot_block/);
  assert.ok(be.component_groups["zoocraft:shivering"]["minecraft:is_shaking"]);
  assert.match(tests("zoocraft:shivering"), /any_of.*in_lava.*on_hot_block/);
  assert.deepEqual(be.events["minecraft:entity_spawned"].add.component_groups.sort(), ["zoocraft:home_8", "zoocraft:warm"]);
  for (const r of [4, 8, 16, 32]) assert.ok(be.component_groups[`zoocraft:home_${r}`]);
  const ce = read("../packs/RP/entity/zoo_strider.entity.json")["minecraft:client_entity"].description;
  assert.equal(ce.geometry.default, "geometry.strider");
  assert.equal(ce.textures.cold, "textures/entity/strider/strider_suffocated");
  const rc = read("../packs/RP/render_controllers/zoo_strider.render_controllers.json").render_controllers[ce.render_controllers[0]];
  assert.deepEqual(rc.textures, ["query.is_shaking ? Texture.cold : Texture.default"]);
  assert.match(lang, /^entity\.zoocraft:zoo_strider\.name=Zoo Strider$/m);
});

// ---------- 0.1.49: Clear Lava flows like lava ----------
async function lavaWorld({ floorY = 0, blocks = {} } = {}) {
  const { flowStep, flowRules, neighbours, isLava } = await import("../packs/BP/scripts/equipment/lavaFlow.js");
  const K = (p) => `${p.x},${p.y},${p.z}`;
  const m = new Map(Object.entries(blocks));
  const w = {
    at: (p) => (m.has(K(p)) ? m.get(K(p)) : p.y <= floorY ? "minecraft:stone" : "open"),
    set: (p, v) => m.set(K(p), v),
    // Run lava's updates until nothing changes, like the game re-checking cells next to each change.
    run(starts, dim = "minecraft:overworld") {
      const rules = flowRules(dim);
      let q = new Map(starts.map((p) => [K(p), p]));
      for (let round = 0; q.size && round < 200; round++) {
        const next = new Map();
        for (const p of q.values()) {
          for (const wr of flowStep(w.at, p, rules)) {
            w.set(wr.pos, wr.to);
            for (const n of [wr.pos, ...neighbours(wr.pos)]) if (isLava(w.at(n))) next.set(K(n), n);
          }
        }
        q = next;
      }
      assert.equal(q.size, 0, "the flow settles");
    },
    lava: () => [...m.entries()].filter(([, v]) => isLava(v)),
    level: (x, y, z) => {
      const c = w.at({ x, y, z });
      return isLava(c) ? (c.falling ? "F" : c.level) : c;
    },
  };
  return w;
}

test("Clear Lava spreads like lava: 3 blocks out on a floor, 7 in the Nether, and dries up without its source", async () => {
  const { SOURCE } = await import("../packs/BP/scripts/equipment/lavaFlow.js");
  const w = await lavaWorld();
  const src = { x: 0, y: 1, z: 0 };
  w.set(src, SOURCE);
  w.run([src]);
  assert.deepEqual([1, 2, 3, 4].map((x) => w.level(x, 1, 0)), [2, 4, 6, "open"], "shallower each block, 3 out");
  assert.equal(w.level(1, 1, 1), 4, "a diamond, like lava");
  assert.equal(w.level(0, 2, 0), "open", "it stays on the floor");
  assert.equal(w.lava().length, 25);
  // Scoop the source: the flow dries up.
  w.set(src, "open");
  w.run([{ x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: -1 }]);
  assert.equal(w.lava().length, 0);
  // The Nether: further, one level a block.
  const n = await lavaWorld();
  n.set(src, SOURCE);
  n.run([src], "minecraft:nether");
  assert.deepEqual([1, 4, 7, 8].map((x) => n.level(x, 1, 0)), [1, 4, 7, "open"]);
});

test("Clear Lava runs toward a drop, falls in a column and spreads again where it lands", async () => {
  const { SOURCE } = await import("../packs/BP/scripts/equipment/lavaFlow.js");
  const blocks = {};
  for (let x = -6; x <= 2; x++) for (let z = -6; z <= 6; z++) blocks[`${x},3,${z}`] = "minecraft:stone"; // a ledge ending at x = 2
  const w = await lavaWorld({ floorY: -10, blocks });
  w.set({ x: 0, y: 4, z: 0 }, SOURCE);
  w.run([{ x: 0, y: 4, z: 0 }]);
  assert.deepEqual([-1, 1, 2, 3].map((x) => w.level(x, 4, 0)), ["open", 2, 4, 6], "only toward the edge 2 blocks away");
  assert.equal(w.level(0, 4, 1), "open");
  for (const y of [3, 0, -5, -9]) assert.equal(w.level(3, y, 0), "F", `falling at y ${y}`);
  assert.deepEqual([4, 5, 6, 7].map((x) => w.level(x, -9, 0)), [2, 4, 6, "open"], "spreads out at the bottom");
  // Falling onto a Clear Lava pool: it stops there.
  const p = await lavaWorld();
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) p.set({ x, y: 1, z }, SOURCE);
  p.set({ x: 0, y: 3, z: 0 }, SOURCE);
  p.run([{ x: 0, y: 3, z: 0 }]);
  assert.equal(p.level(0, 2, 0), "F");
  assert.equal(p.level(2, 2, 0), "open", "no flow across the pool's surface");
  // A pit fills with flowing lava around the source, which another bucket can then pour into.
  const pit = await lavaWorld();
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) if (Math.abs(x) > 1 || Math.abs(z) > 1) pit.set({ x, y: 1, z }, "minecraft:stone");
  pit.set({ x: 0, y: 1, z: 0 }, SOURCE);
  pit.run([{ x: 0, y: 1, z: 0 }]);
  assert.deepEqual([pit.level(1, 1, 0), pit.level(1, 1, 1), pit.level(0, 2, 0)], [2, 4, "open"]);
});

test("Clear Lava meeting water sets like lava: obsidian, cobblestone, stone and basalt", async () => {
  const { SOURCE } = await import("../packs/BP/scripts/equipment/lavaFlow.js");
  const w = await lavaWorld({ blocks: { "2,1,0": "water" } });
  w.set({ x: 0, y: 1, z: 0 }, SOURCE);
  w.run([{ x: 0, y: 1, z: 0 }]);
  assert.equal(w.level(1, 1, 0), "minecraft:cobblestone", "flowing lava beside water");
  assert.equal(w.level(0, 1, 0), 0, "the source isn't touching the water");
  const s = await lavaWorld({ blocks: { "1,1,0": "water" } });
  s.set({ x: 0, y: 1, z: 0 }, SOURCE);
  s.run([{ x: 0, y: 1, z: 0 }]);
  assert.equal(s.level(0, 1, 0), "minecraft:obsidian", "a source beside water");
  const d = await lavaWorld({ blocks: { "0,1,0": "water" } });
  d.set({ x: 0, y: 3, z: 0 }, SOURCE);
  d.run([{ x: 0, y: 3, z: 0 }]);
  assert.equal(d.level(0, 1, 0), "minecraft:stone", "lava falling onto water");
  const b = await lavaWorld({ blocks: { "0,0,0": "minecraft:soul_soil", "1,1,0": "minecraft:blue_ice" } });
  b.set({ x: 0, y: 1, z: 0 }, SOURCE);
  b.run([{ x: 0, y: 1, z: 0 }]);
  assert.equal(b.level(0, 1, 0), "minecraft:basalt");
});

test("Flowing Clear Lava files: the same texture, shallower each level, and counted as lava", async () => {
  const { CLEAR_LAVA_FLOWING, isClearLava } = await import("../packs/BP/scripts/data/items.js");
  const { flowRules, LAVA_REPLACES } = await import("../packs/BP/scripts/equipment/lavaFlow.js");
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const sounds = read("../packs/RP/blocks.json");
  const src = read("../packs/BP/blocks/clear_lava.json")["minecraft:block"];
  assert.deepEqual(src.description.states["zoocraft:falling"], [false, true]);
  assert.ok(src.components["zoocraft:clear_lava_flow"] && src.components["minecraft:tick"].looping);
  assert.deepEqual(src.components["minecraft:replaceable"], {}, "blocks can be placed into it, like lava");
  assert.equal(src.components["minecraft:geometry"].identifier, "geometry.zoocraft.clear_lava", "the source keeps its look");
  const geos = read("../packs/RP/models/blocks/clear_lava_flowing.geo.json")["minecraft:geometry"];
  assert.equal(CLEAR_LAVA_FLOWING.length, 7);
  CLEAR_LAVA_FLOWING.forEach((id, i) => {
    const b = read(`../packs/BP/blocks/${id.split(":")[1]}.json`)["minecraft:block"];
    assert.equal(b.description.identifier, id);
    const c = b.components;
    assert.deepEqual(c["minecraft:material_instances"], src.components["minecraft:material_instances"], "same texture");
    assert.equal(c["minecraft:geometry"].culling, src.components["minecraft:geometry"].culling);
    for (const k of ["minecraft:collision_box", "minecraft:selection_box", "minecraft:light_emission", "minecraft:replaceable", "zoocraft:clear_lava_flow"]) assert.deepEqual(c[k], src.components[k], k);
    const g = geos.find((x) => x.description.identifier === c["minecraft:geometry"].identifier);
    assert.equal(g.bones[0].name, "lava");
    assert.equal(g.bones[0].cubes[0].size[1], 14 - 2 * i, "shallower each level");
    assert.equal(classifyBlock(id, { isAir: false, isLiquid: false, open: false }), "lava");
    assert.equal(blocksView(id, { isAir: false, isLiquid: false }), false);
    assert.ok(isClearLava(id));
    assert.ok(sounds[id]);
    assert.match(lang, new RegExp(`^tile\\.${id}\\.name=Flowing Clear Lava$`, "m"));
  });
  assert.ok(isClearLava("zoocraft:clear_lava") && !isClearLava("minecraft:lava") && !isClearLava("zoocraft:clear_lava_bucket"));
  assert.deepEqual(flowRules("minecraft:overworld"), { step: 2, delay: 30, slope: 2 });
  assert.deepEqual(flowRules("minecraft:the_end"), flowRules("minecraft:overworld"));
  assert.deepEqual(flowRules("minecraft:nether"), { step: 1, delay: 10, slope: 4 });
  assert.ok(LAVA_REPLACES.has("minecraft:short_grass") && !LAVA_REPLACES.has("minecraft:stone"));
});

// ---------- End wing: Chorus Deer (0.1.50, M5 part 1) ----------
test("Chorus Deer: the first End animal, in a Stabilized Carrier after Dimensional Preparation, with End ground underfoot", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, CARRIERS, carrierByItem, FOOD_LOOK, foodLook, rationPlural, rationCount } = await import("../packs/BP/scripts/data/items.js");
  const { PROJECTS } = await import("../packs/BP/scripts/data/research.js");
  const { hasEnd, hasCover, comfortCauses, adviceFor } = await import("../packs/BP/scripts/animals/welfare.js");
  const { TASKS, levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { rationFor } = await import("../packs/BP/scripts/staff/rules.js");
  const { reachesFeeder } = await import("../packs/BP/scripts/equipment/rules.js");
  const deer = SPECIES["zoocraft:chorus_deer"];
  assert.equal(speciesForWild("zoocraft:wild_chorus_deer"), deer);
  assert.equal(deer.origin, "custom_end");
  assert.equal(deer.homeDimension, "minecraft:the_end");
  assert.equal(pluralOf(deer), "Chorus Deer");
  assert.equal(deer.habitatProfile, "medium_terrestrial");
  assert.deepEqual(deer.coats, ["Lavender", "Dusk"]);
  assert.ok(deer.social.prefersCompany && deer.social.minGroup === 2, "herd room");
  assert.equal(deer.cover.minFraction, 0.1, "quiet retreat");
  assert.ok(!deer.heat && !deer.drinksLava, "no Thermal Regulator or Lava Trough: it's not a Nether animal");
  // The Stabilized Carrier (spec: reinforced crate, obsidian, ender pearls) needs Dimensional Preparation.
  assert.equal(deer.carrierProfile, "stabilized");
  assert.equal(carrierByItem("zoocraft:stabilized_carrier").research, "dimensional_preparation");
  assert.equal(carrierByItem("zoocraft:stabilized_carrier_occupied").full, true);
  const prep = PROJECTS.find((p) => p.id === CARRIERS.stabilized.research);
  assert.equal(prep.needs.ready, 4, "four species ready to move first");
  assert.ok(prep.items["minecraft:ender_pearl"] && prep.items["minecraft:obsidian"] && prep.cost > BALANCE.shop["zoocraft:thermal_carrier"].price / 2);
  assert.ok(BALANCE.shop["zoocraft:stabilized_carrier"].price > BALANCE.shop["zoocraft:thermal_carrier"].price);
  // Chorus Browse: crafted from chorus fruit, goes in a Basic Feeder, its own look (food 6), on sale.
  assert.equal(deer.baitItem, "zoocraft:chorus_browse");
  assert.equal(RATIONS[deer.baitItem].diet, "chorus");
  assert.ok(!RATIONS[deer.baitItem].thermal);
  assert.equal(rationPlural(deer.baitItem), "Chorus Browse");
  assert.equal(rationCount(deer.baitItem, 3), "Chorus Browse");
  assert.equal(foodLook(deer.baitItem), FOOD_LOOK.chorus);
  assert.equal(FOOD_LOOK.chorus, 6);
  assert.equal(new Set(Object.values(FOOD_LOOK)).size, Object.keys(FOOD_LOOK).length);
  assert.equal(rationFor(deer, {}, { "zoocraft:leafy_ration": 5, "zoocraft:chorus_browse": 5 }, RATIONS), "zoocraft:chorus_browse");
  assert.equal(reachesFeeder(deer, {}), true);
  assert.equal(reachesFeeder(deer, { thermal: true }), false);
  assert.equal(adviceFor("satiety", deer), "Fill the feeder with Chorus Browse");
  assert.equal(BALANCE.shop["zoocraft:chorus_browse"].sell, 1);
  // End ground: end stone in the floor is counted only when asked for, like magma and Warm Ash.
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("minecraft:end_stone", { end: true }), "end");
  assert.equal(c("minecraft:end_stone"), "solid");
  assert.equal(c("minecraft:end_stone_bricks", { end: true }), "solid");
  assert.equal(c("minecraft:purpur_block", { end: true }), "solid");
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const base = gridReader(rows);
  const read = (x, y, z) => (y === 0 && x >= 1 && x <= 4 && z >= 1 && z <= 2 ? "end" : base(x, y, z));
  const r = run(read, { x: 3, y: 1, z: 3 }, { countEnd: true });
  assert.equal(r.usableArea, 36, "end stone is ordinary floor");
  assert.equal(r.endCells, 8);
  assert.equal(run(read, { x: 3, y: 1, z: 3 }).endCells, 0);
  assert.equal(deer.endGround.minCells, 8);
  assert.equal(hasEnd(deer, { endCells: 8 }), true);
  assert.equal(hasEnd(deer, { endCells: 7 }), false);
  assert.equal(hasEnd(deer, {}), true); // not measured yet
  assert.equal(hasEnd(SPECIES["zoocraft:deer"], { endCells: 0 }), true);
  assert.equal(hasCover(deer, { usableArea: 100, coveredCells: 5 }), false);
  // Too little end stone caps comfort; with cover and End ground it climbs.
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 2, feederUnits: 10, water: true, cover: true, end: true, enrichmentPerDay: 0 };
  const animal = () => ({ needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false });
  const capped = animal();
  simulateAnimal(capped, deer, { ...ctx, end: false }, BALANCE.clock.dayLength, BALANCE);
  assert.equal(capped.needs.comfort, BALANCE.endGround.comfortCap);
  const ok = animal();
  ok.needs.comfort = 40;
  simulateAnimal(ok, deer, ctx, BALANCE.clock.dayLength, BALANCE);
  assert.equal(ok.needs.comfort, 90);
  assert.deepEqual(comfortCauses({ ...ctx, end: false, cover: false }, BALANCE), ["cover", "end"]);
  assert.equal(adviceFor("comfort", deer, ["cover", "end"]), "Give the animals trees or a roof over part of the ground and end stone in the floor");
  // Field Journal: spot, browse (standing still), herd.
  assert.deepEqual(deer.observe, ["spot", "browse", "herd"]);
  for (const t of deer.observe) assert.ok(TASKS[t], t);
  assert.deepEqual(tasksSeen(deer, ["spot"], { onGround: true, inWater: false, still: true, herd: false }), ["browse"]);
  assert.deepEqual(tasksSeen(deer, ["spot"], { onGround: true, inWater: false, still: false, herd: true }), ["herd"]);
  assert.equal(levelOf(deer, ["spot", "browse", "herd"]), 3);
  assert.deepEqual(validateData(), []);
});

test("Chorus Deer files: lavender model in two coats, wary herds on end stone, Chorus Browse and the Stabilized Carrier", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  // Server entities: the zoo deer is a quiet, nameable, unhurtable resident; the wild one keeps away.
  const zoo = read("../packs/BP/entities/chorus_deer.json")["minecraft:entity"];
  assert.equal(zoo.description.identifier, "zoocraft:chorus_deer");
  assert.deepEqual(zoo.components["minecraft:type_family"].family, ["zoocraft_animal", "chorus_deer", "mob"]);
  assert.deepEqual(zoo.components["minecraft:damage_sensor"].triggers, [{ cause: "all", deals_damage: "no" }]);
  assert.ok(zoo.components["minecraft:persistent"] && zoo.components["minecraft:nameable"]);
  assert.ok(zoo.components["minecraft:behavior.tempt"].items.includes("zoocraft:chorus_browse"));
  for (const r of [4, 8, 16, 32]) assert.equal(zoo.component_groups[`zoocraft:home_${r}`]["minecraft:home"].restriction_radius, r);
  assert.deepEqual(zoo.events["minecraft:entity_spawned"].add.component_groups, ["zoocraft:coat_0", "zoocraft:home_8"]);
  assert.equal(zoo.component_groups["zoocraft:coat_1"]["minecraft:variant"].value, 1);
  assert.ok(zoo.component_groups["zoocraft:juvenile"], "it breeds");
  assert.deepEqual(zoo.components["minecraft:collision_box"], { width: 0.8, height: 1.6 });
  const wild = read("../packs/BP/entities/wild_chorus_deer.json")["minecraft:entity"];
  assert.equal(wild.description.is_spawnable, true);
  assert.ok(wild.components["minecraft:despawn"] && wild.components["minecraft:behavior.panic"]);
  const avoid = wild.components["minecraft:behavior.avoid_mob_type"].entity_types[0];
  assert.deepEqual(avoid.filters.all_of[1], { test: "is_sneaking", subject: "other", value: false });
  assert.deepEqual(wild.events["minecraft:entity_spawned"].randomize.map((r) => r.weight), [3, 1], "three Lavender to one Dusk");
  // Spawn rules: End islands, on end stone, in small herds, whatever the light.
  const sr = read("../packs/BP/spawn_rules/wild_chorus_deer.json")["minecraft:spawn_rules"];
  assert.equal(sr.description.population_control, "animal");
  const cond = sr.conditions[0];
  assert.deepEqual(cond["minecraft:biome_filter"], { test: "has_biome_tag", value: "the_end" });
  assert.deepEqual(cond["minecraft:spawns_on_block_filter"], ["minecraft:end_stone"]);
  assert.deepEqual(cond["minecraft:herd"], { min_size: 2, max_size: 4 });
  assert.equal(cond["minecraft:brightness_filter"].min, 0);
  // Model and skins: the detailed deer with chorus-branch antlers, two coats picked by variant.
  const geo = read("../packs/RP/models/entity/chorus_deer.geo.json")["minecraft:geometry"][0];
  assert.equal(geo.description.identifier, "geometry.zoocraft.chorus_deer");
  const bones = Object.fromEntries(geo.bones.map((b) => [b.name, b]));
  for (const n of ["body", "neck", "head", "earL", "earR", "antlers", "tail", "leg0", "leg0low", "leg3low"]) assert.ok(bones[n], n);
  assert.ok(bones.antlers.cubes.length >= 12, "branching antlers with flowers on both sides");
  assert.ok(geo.bones.reduce((n, b) => n + b.cubes.length, 0) >= 30, "kept detailed");
  for (const b of geo.bones) for (const c of b.cubes) {
    const [w, h, d] = c.size;
    assert.ok(c.uv[0] + 2 * (w + d) <= geo.description.texture_width && c.uv[1] + h + d <= geo.description.texture_height, `${b.name} fits the skin`);
  }
  const rc = read("../packs/RP/render_controllers/chorus_deer.render_controllers.json").render_controllers["controller.render.zoocraft.chorus_deer"];
  assert.match(rc.textures[0], /query\.variant == 1 \? Texture\.dusk : Texture\.default/);
  for (const name of ["chorus_deer", "wild_chorus_deer"]) {
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(d.identifier, `zoocraft:${name}`);
    assert.equal(d.materials.default, "entity_emissive_alpha", "glowing eyes and chorus flowers");
    assert.equal(d.textures.default, "textures/entity/zoocraft/chorus_deer");
    assert.equal(d.textures.dusk, "textures/entity/zoocraft/chorus_deer_dusk");
    assert.deepEqual(d.render_controllers, ["controller.render.zoocraft.chorus_deer"]);
    assert.ok(d.animations.walk && d.animations.idle && d.animations.look_at_target && d.animations.move);
    assert.match(d.scripts.scale, /0\.95/);
  }
  assert.ok(read("../packs/RP/entity/wild_chorus_deer.entity.json")["minecraft:client_entity"].description.spawn_egg.base_color);
  for (const png of ["chorus_deer", "chorus_deer_dusk"]) assert.ok(readFileSync(new URL(`../packs/RP/textures/entity/zoocraft/${png}.png`, import.meta.url)).length > 100, png);
  const anims = read("../packs/RP/animations/chorus_deer.animation.json").animations;
  for (const a of ["walk", "idle", "look_at_target"]) assert.ok(anims[`animation.zoocraft.chorus_deer.${a}`], a);
  assert.ok(read("../packs/RP/animation_controllers/chorus_deer.animation_controllers.json").animation_controllers["controller.animation.zoocraft.chorus_deer.move"]);
  // Chorus Browse: three chorus fruit make four; the Stabilized Carrier: a Reinforced Crate, obsidian and pearls.
  const browse = read("../packs/BP/recipes/zoocraft_chorus_browse.json")["minecraft:recipe_shapeless"];
  assert.equal(browse.ingredients.length, 3);
  assert.ok(browse.ingredients.every((i) => i.item === "minecraft:chorus_fruit"));
  assert.deepEqual(browse.result, { item: "zoocraft:chorus_browse", count: 4 });
  assert.equal(read("../packs/BP/items/chorus_browse.json")["minecraft:item"].description.identifier, "zoocraft:chorus_browse");
  const crate = read("../packs/BP/recipes/zoocraft_stabilized_carrier.json")["minecraft:recipe_shaped"];
  assert.deepEqual(crate.pattern, [" P ", "OCO", " P "]);
  assert.equal(crate.key.P.item, "minecraft:ender_pearl");
  assert.equal(crate.key.O.item, "minecraft:obsidian");
  assert.equal(crate.key.C.item, "zoocraft:reinforced_crate");
  assert.deepEqual(crate.tags, ["zoocraft_workshop"]);
  const carrier = read("../packs/BP/items/stabilized_carrier.json")["minecraft:item"];
  assert.ok(carrier.components["zoocraft:carrier"]);
  assert.equal(carrier.components["minecraft:max_stack_size"].value, 1);
  const occupied = read("../packs/BP/items/stabilized_carrier_occupied.json")["minecraft:item"];
  assert.equal(occupied.description.menu_category.is_hidden_in_commands, true);
  assert.equal(occupied.components["minecraft:should_despawn"].value, false);
  const items = read("../packs/RP/textures/item_texture.json").texture_data;
  for (const n of ["chorus_browse", "stabilized_carrier", "stabilized_carrier_occupied"]) {
    assert.equal(items[`zoocraft:${n}`].textures, `textures/items/zoocraft/${n}`);
    assert.ok(readFileSync(new URL(`../packs/RP/textures/items/zoocraft/${n}.png`, import.meta.url)).length > 100, n);
  }
  // The chorus look: food 6 on the Basic Feeder (low and full) and in the Hanging Food Basket.
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  for (const fill of [1, 2]) {
    const p = feeder.permutations.find((x) => x.condition === `query.block_state('zoocraft:fill') == ${fill} && query.block_state('zoocraft:food') == 6`);
    const tex = p.components["minecraft:material_instances"].up.texture;
    assert.equal(tex, `zoocraft_feeder_chorus_${fill}`);
    assert.ok(terrain[tex]);
  }
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.ok(basket.description.states["zoocraft:food"].includes(6));
  const bp = basket.permutations.find((x) => x.condition === "query.block_state('zoocraft:food') == 6");
  assert.equal(bp.components["minecraft:material_instances"].food.texture, "zoocraft_basket_food_chorus");
  assert.ok(terrain.zoocraft_basket_food_chorus);
  for (const k of ["entity.zoocraft:chorus_deer", "entity.zoocraft:wild_chorus_deer", "item.spawn_egg.entity.zoocraft:wild_chorus_deer", "item.zoocraft:chorus_browse", "item.zoocraft:stabilized_carrier", "item.zoocraft:stabilized_carrier_occupied"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
});

// ---------- M5 part 2: the Void Ray, the first flyer, and the Void Perch ----------

test("Void Ray: the first flyer, in a Stabilized Carrier, for a roofed exhibit with Void Perches to rest on", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { AERIAL_HEIGHT } = await import("../packs/BP/scripts/data/profiles.js");
  const { habitatArea, habitatProblem, noRoomReason } = await import("../packs/BP/scripts/exhibits/room.js");
  const { serves, reachesFeeder } = await import("../packs/BP/scripts/equipment/rules.js");
  const { key } = await import("../packs/BP/scripts/exhibits/geometry.js");
  const { FLIGHT, pitchOf, glideStep } = await import("../packs/BP/scripts/animals/glide.js");
  const { TASKS, levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { hasEnd } = await import("../packs/BP/scripts/animals/welfare.js");
  const ray = SPECIES["zoocraft:void_ray"];
  assert.equal(speciesForWild("zoocraft:wild_void_ray"), ray);
  assert.equal(ray.origin, "custom_end");
  assert.equal(ray.flies, true);
  assert.equal(pluralOf(ray), "Void Rays");
  assert.equal(ray.carrierProfile, "stabilized");
  assert.equal(ray.baitItem, "zoocraft:chorus_browse");
  assert.equal(reachesFeeder(ray, {}), true, "Chorus Browse from a Basic Feeder on the floor");
  assert.equal(ray.endGround.minCells, 16);
  assert.equal(hasEnd(ray, { endCells: 15 }), false);
  const prof = HABITAT_PROFILES[ray.habitatProfile];
  assert.deepEqual([prof.aerial, prof.minPerches, prof.minHeight, prof.baseArea], [true, 2, 14, 400], "giant since 0.1.66");
  assert.equal(AERIAL_HEIGHT, 14);
  assert.deepEqual(validateData(), []);
  // Flight room: the floor with the profile's air above it, from the flight measurement (ex.aerial).
  assert.equal(habitatArea({ usableArea: 400 }, prof), 0, "a walking measurement is no flight room");
  assert.equal(habitatArea({ usableArea: 400, aerial: { usableArea: 150 } }, prof), 150);
  assert.match(habitatProblem({ usableArea: 400 }, prof, "Void Ray"), /float 2 Void Perches .* then measure/);
  assert.match(habitatProblem({ aerial: { enclosed: false, usableArea: 0, escape: { x: 1, y: 20, z: 3 } } }, prof, "Void Ray"), /needs a roof .* near 1 20 3/);
  assert.match(habitatProblem({ aerial: { enclosed: true, usableArea: 0, perchCount: 2 } }, prof, "Void Ray"), /14 blocks of air .* raise the roof/);
  assert.match(habitatProblem({ aerial: { enclosed: true, usableArea: 150, perchCount: 1 } }, prof, "Void Ray"), /2 or more Void Perches .* \(1 now/);
  assert.equal(habitatProblem({ aerial: { enclosed: true, usableArea: 150, perchCount: 2 } }, prof, "Void Ray"), undefined);
  const check = (ex) => ({ cap: { population: 0, required: 144, usable: habitatArea(ex, prof), fits: habitatArea(ex, prof) >= 144 }, problem: habitatProblem(ex, prof, ray.displayName) });
  assert.match(noRoomReason([{ id: "e", name: "Sky", state: "ready", issues: [], usableArea: 200, animalIds: [] }], ray, check), /Sky isn't right for a Void Ray yet\. Void Rays fly: float 2 Void Perches/);
  // A Void Perch serves when the air over it is flight room and there is air under it; a basket hangs anywhere in the flight room.
  const cells = new Map([[key(5, 6, 5), "perch"], [key(5, 4, 5), "air"], [key(5, 2, 5), "perch"], [key(9, 7, 9), "air"]]);
  assert.equal(serves("perch", cells, { x: 5, y: 5, z: 5 }), true);
  assert.equal(serves("perch", cells, { x: 5, y: 1, z: 5 }), false, "on the floor: no air under it");
  assert.equal(serves("perch", cells, { x: 9, y: 6, z: 9 }), false, "nothing over it");
  assert.equal(serves("basket", cells, { x: 9, y: 8, z: 9 }), true);
  assert.equal(serves("trough", cells, { x: 9, y: 8, z: 9 }), false);
  // Gliding: no gravity to cancel, it holds its height and climbs or dives within maxRise, pitching to match.
  assert.equal(FLIGHT.gravity, 0);
  const level = glideStep({ pos: { x: 0, y: 10, z: 0 }, yaw: 0, spot: { x: 0, y: 10, z: 8 }, drifting: false, clearAhead: true }, FLIGHT);
  assert.equal(level.y, 0);
  assert.ok(Math.abs(level.z - FLIGHT.speed) < 1e-9 && Math.abs(level.x) < 1e-9, "straight ahead at full speed");
  const climb = glideStep({ pos: { x: 0, y: 10, z: 0 }, yaw: 0, spot: { x: 0, y: 14, z: 8 }, drifting: false, clearAhead: true }, FLIGHT);
  assert.ok(climb.y >= FLIGHT.maxRise && climb.y <= FLIGHT.maxRise + FLIGHT.maxTrim, "climbs at most maxRise, plus what it learns about drifting");
  assert.ok(pitchOf(climb) < -20 && pitchOf(climb) >= -35, "nose up");
  assert.ok(pitchOf({ x: 0, y: -FLIGHT.maxRise, z: FLIGHT.speed }) > 20, "nose down");
  assert.equal(pitchOf(level), 0);
  const hover = glideStep({ pos: { x: 0, y: 10, z: 0 }, yaw: 30, spot: { x: 3, y: 10, z: 3 }, drifting: true, clearAhead: true }, FLIGHT);
  assert.deepEqual([hover.x, hover.y, hover.z, hover.yaw], [0, 0, 0, 30]);
  // The Void Perch block: "perch" only for readers that ask; guests see past it.
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("zoocraft:void_perch", { perch: true }), "perch");
  assert.equal(c("zoocraft:void_perch"), "solid");
  assert.equal(c("minecraft:end_stone", { perch: true, end: true }), "end");
  assert.equal(blocksView("zoocraft:void_perch", { isAir: false, isLiquid: false }), false);
  // Field Journal: spot, soar (gliding) and the loop the loop, both read from the entity's flight properties.
  assert.deepEqual(ray.observe, ["spot", "soar", "loop"]);
  for (const t of ray.observe) assert.ok(TASKS[t], t);
  assert.deepEqual(tasksSeen(ray, ["spot"], { onGround: false, inWater: false, still: false, herd: false, flying: true, looping: false }), ["soar"]);
  assert.deepEqual(tasksSeen(ray, ["spot", "soar"], { onGround: false, inWater: false, still: false, herd: false, flying: true, looping: true }), ["loop"]);
  assert.deepEqual(tasksSeen(ray, ["spot"], { onGround: true, inWater: false, still: true, herd: true }), []);
  assert.equal(levelOf(ray, ["spot", "soar", "loop"]), 3);
});

// A roofed box: floor at y 0 everywhere, walls at x/z 0 and 13 up to the roof (open sky above when
// there is no roof), 12 x 12 of floor inside. `perches` are Void Perch blocks, `open` makes a block air (a hole).
function airBox({ roof, perches = [], open = [], gates = [], end = [] } = {}) {
  const at = (list) => new Set(list.map((p) => p.join(",")));
  const P = at(perches), O = at(open), G = at(gates), E = at(end);
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (P.has(k)) return "perch";
    if (O.has(k)) return "air";
    if (G.has(k)) return "gate_open";
    if (y <= 0) return E.has(k) ? "end" : "solid";
    if (roof !== undefined && y >= roof) return "solid";
    if (x === 0 || x === 13 || z === 0 || z === 13) return "barrier";
    return "air";
  };
}
function runAir(read, seed = { x: 6, y: 1, z: 6 }, limits = {}) {
  const out = newResult(seed);
  const gen = floodAerial(read, seed, { ...EXHIBIT_LIMITS, halfWidth: 16, minHeight: 10, ...limits }, out);
  while (!gen.next().done);
  return out;
}

test("Flight room: the air flood needs a roof, counts the floor with 10 blocks of air over it, and finds the perches", async () => {
  const { serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const { key } = await import("../packs/BP/scripts/exhibits/geometry.js");
  // Roof at 11: air from 1 to 10 over every floor block, so all 144 are usable and the rest is room to fly in.
  const r = runAir(airBox({ roof: 11 }));
  assert.equal(r.enclosed, true);
  assert.equal(r.usableArea, 144);
  assert.equal(r.landCells, 144);
  assert.equal(r.flightCells, 144 * 9);
  assert.equal(r.lowCeilingCells, 0);
  assert.deepEqual(r.bbox, { min: { x: 1, y: 1, z: 1 }, max: { x: 12, y: 10, z: 12 } });
  assert.equal(r.cells.get(key(6, 1, 6)), "land");
  assert.equal(r.cells.get(key(6, 7, 6)), "air");
  // No roof: the air leads out of the top, so the rays would fly away.
  const open = runAir(airBox({}));
  assert.equal(open.enclosed, false);
  assert.ok(open.escape && open.escape.y > 11, "escaped upward");
  // A roof at 9 leaves 8 blocks of air: no floor is usable, all of it is too low.
  const low = runAir(airBox({ roof: 9 }));
  assert.equal(low.enclosed, true);
  assert.equal(low.usableArea, 0);
  assert.equal(low.lowCeilingCells, 144);
  // A hole in the wall up high is an escape too; an open gate is recorded and flown through.
  assert.equal(runAir(airBox({ roof: 11, open: [[13, 8, 6]] })).enclosed, false);
  const gate = runAir(airBox({ roof: 11, gates: [[13, 1, 6]] }));
  assert.equal(gate.enclosed, false);
  assert.deepEqual(gate.openGates, [{ x: 13, y: 1, z: 6 }]);
  // Perches: the air over a perch is a "perch" cell. One floating at 5 has air under it and serves; one
  // on the floor doesn't. Each costs a floor block: the floating one takes its column's headroom, the
  // other sits on the floor.
  const p = runAir(airBox({ roof: 11, perches: [[6, 5, 6], [3, 1, 3]] }));
  assert.equal(p.cells.get(key(6, 6, 6)), "perch");
  assert.equal(p.cells.get(key(3, 2, 3)), "perch");
  assert.equal(p.cells.has(key(6, 5, 6)), false, "the perch block itself isn't air");
  assert.equal(p.perchCells, 2);
  assert.equal(p.usableArea, 142);
  assert.equal(serves("perch", p.cells, { x: 6, y: 5, z: 6 }), true);
  assert.equal(serves("perch", p.cells, { x: 3, y: 1, z: 3 }), false);
  // End ground: the usable floor on end stone, only when asked for.
  const e = runAir(airBox({ roof: 11, end: [[1, 0, 1], [2, 0, 1], [3, 0, 1]] }), undefined, { countEnd: true });
  assert.equal(e.endCells, 3);
  assert.equal(runAir(airBox({ roof: 11, end: [[1, 0, 1]] })).endCells, 0);
  // The seed must be open air; unloaded blocks stop the measurement.
  assert.match(runAir(airBox({ roof: 11 }), { x: 0, y: 1, z: 6 }).error, /isn't open ground/);
  const base = airBox({ roof: 11 });
  const u = runAir((x, y, z) => (x === 9 && y === 4 && z === 9 ? "unloaded" : base(x, y, z)));
  assert.equal(u.unloaded, true);
  assert.match(u.error, /isn't loaded/);
});

test("Void Ray and Void Perch files: a gravity-free ray in two coats steered by properties, a floating ledge, names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const name of ["void_ray", "wild_void_ray"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.equal(e.description.identifier, `zoocraft:${name}`);
    for (const k of ["gliding", "resting", "looping"]) assert.deepEqual(e.description.properties[`zoocraft:${k}`], { type: "bool", default: false, client_sync: true }, k);
    assert.deepEqual(e.components["minecraft:physics"], { has_gravity: false, has_collision: true });
    assert.equal(e.components["minecraft:movement"].value, 0, "the script moves it, not the game");
    assert.ok(!e.components["minecraft:behavior.random_stroll"] && !e.components["minecraft:behavior.tempt"]);
    assert.ok(e.components["minecraft:type_family"].family.includes("void_ray"));
    assert.deepEqual(e.components["minecraft:collision_box"], { width: 1.5, height: 0.5 }, "the 0.1.65 body: giant only in looks (0.1.68)");
  }
  const zoo = read("../packs/BP/entities/void_ray.json")["minecraft:entity"];
  assert.deepEqual(zoo.components["minecraft:damage_sensor"].triggers, [{ cause: "all", deals_damage: "no" }]);
  assert.ok(zoo.components["minecraft:persistent"] && zoo.components["minecraft:nameable"] && zoo.component_groups["zoocraft:juvenile"]);
  assert.deepEqual(zoo.events["minecraft:entity_spawned"].add.component_groups, ["zoocraft:coat_0", "zoocraft:home_8"]);
  const wild = read("../packs/BP/entities/wild_void_ray.json")["minecraft:entity"];
  assert.ok(wild.component_groups["zoocraft:wild"]["minecraft:despawn"], "a wild ray despawns; a tamed one (0.1.66) never");
  assert.deepEqual(wild.events["minecraft:entity_spawned"].randomize.map((r) => r.weight), [3, 1], "three Void to one Nebula");
  const sr = read("../packs/BP/spawn_rules/wild_void_ray.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(sr["minecraft:biome_filter"], { test: "has_biome_tag", value: "the_end" });
  assert.deepEqual(sr["minecraft:spawns_on_block_filter"], ["minecraft:end_stone"]);
  // Model and skins: wings in three segments a side with frills, lobes, a whip tail; two coats by variant.
  const geo = read("../packs/RP/models/entity/void_ray.geo.json")["minecraft:geometry"][0];
  assert.equal(geo.description.identifier, "geometry.zoocraft.void_ray");
  const bones = Object.fromEntries(geo.bones.map((b) => [b.name, b]));
  for (const n of ["body", "lobeL", "lobeR", "wingL1", "wingL2", "wingL3", "wingR1", "wingR2", "wingR3", "finL", "finR", "tail", "tail_tip"]) assert.ok(bones[n], n);
  assert.ok(geo.bones.reduce((n, b) => n + b.cubes.length, 0) >= 24, "kept detailed");
  for (const b of geo.bones) for (const c of b.cubes) {
    const [w, h, d] = c.size.map(Math.ceil);
    assert.ok(c.uv[0] + 2 * (w + d) <= geo.description.texture_width && c.uv[1] + h + d <= geo.description.texture_height, `${b.name} fits the skin`);
  }
  const rc = read("../packs/RP/render_controllers/void_ray.render_controllers.json").render_controllers["controller.render.zoocraft.void_ray"];
  assert.match(rc.textures[0], /query\.variant == 1 \? Texture\.nebula : Texture\.default/);
  for (const name of ["void_ray", "wild_void_ray"]) {
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(d.materials.default, "entity_emissive_alpha", "the luminous underside and spots glow");
    assert.equal(d.textures.nebula, "textures/entity/zoocraft/void_ray_nebula");
    for (const a of ["fly", "hover", "rest", "loop", "move"]) assert.ok(d.animations[a], a);
    assert.match(d.scripts.scale, /2\.5/, "giant");
  }
  for (const png of ["void_ray", "void_ray_nebula"]) assert.ok(readFileSync(new URL(`../packs/RP/textures/entity/zoocraft/${png}.png`, import.meta.url)).length > 100, png);
  const anims = read("../packs/RP/animations/void_ray.animation.json").animations;
  assert.equal(anims["animation.zoocraft.void_ray.loop"].loop, false);
  assert.equal(anims["animation.zoocraft.void_ray.loop"].animation_length, 1.6);
  assert.deepEqual(anims["animation.zoocraft.void_ray.loop"].bones.body.rotation["1.6"], [-360, 0, 0], "a full loop, nose up first");
  const states = read("../packs/RP/animation_controllers/void_ray.animation_controllers.json").animation_controllers["controller.animation.zoocraft.void_ray.move"].states;
  assert.deepEqual(Object.keys(states).sort(), ["fly", "hover", "loop", "rest"]);
  assert.ok(JSON.stringify(states.hover.transitions).includes("query.property('zoocraft:resting')"));
  assert.ok(JSON.stringify(states.fly.transitions).includes("query.property('zoocraft:looping')"));
  // The Void Perch: a floating ledge with a lamp, a fixture, two from end stone, purpur and an end rod.
  const block = read("../packs/BP/blocks/void_perch.json")["minecraft:block"];
  assert.equal(block.description.identifier, "zoocraft:void_perch");
  assert.ok(block.components["zoocraft:fixture"]);
  assert.deepEqual(block.components["minecraft:collision_box"], { origin: [-7, 0, -7], size: [14, 3, 14] }, "the ledge the ray settles on");
  assert.ok(block.components["minecraft:light_emission"] >= 7, "the lamp lights the exhibit");
  assert.equal(block.components["minecraft:geometry"], "geometry.zoocraft.void_perch");
  const pg = read("../packs/RP/models/blocks/void_perch.geo.json")["minecraft:geometry"][0];
  assert.equal(pg.description.identifier, "geometry.zoocraft.void_perch");
  const mats = new Set(pg.bones[0].cubes.flatMap((c) => Object.values(c.uv).map((f) => f.material_instance)));
  assert.deepEqual([...mats].sort(), ["*", "glow", "trim"]);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const n of ["perch_stone", "perch_trim", "perch_glow"]) {
    assert.equal(terrain[`zoocraft_${n}`].textures, `textures/blocks/zoocraft/${n}`);
    assert.ok(readFileSync(new URL(`../packs/RP/textures/blocks/zoocraft/${n}.png`, import.meta.url)).length > 100, n);
  }
  const recipe = read("../packs/BP/recipes/zoocraft_void_perch.json")["minecraft:recipe_shaped"];
  assert.deepEqual(recipe.pattern, ["  R", "EEE", "PPP"]);
  assert.deepEqual([recipe.key.R.item, recipe.key.E.item, recipe.key.P.item], ["minecraft:end_rod", "minecraft:end_stone", "minecraft:purpur_block"]);
  assert.deepEqual(recipe.result, { item: "zoocraft:void_perch", count: 2 });
  assert.equal(read("../packs/BP/loot_tables/blocks/zoocraft_void_perch.json").pools[0].entries[0].name, "zoocraft:void_perch");
  for (const k of ["entity.zoocraft:void_ray", "entity.zoocraft:wild_void_ray", "item.spawn_egg.entity.zoocraft:wild_void_ray", "tile.zoocraft:void_perch"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
});

test("Rift Ferret: the third End animal, blinks only inside its exhibit with a charged Containment Anchor, and hides in Rift Tunnels", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, BLOCKS } = await import("../packs/BP/scripts/data/items.js");
  const { comfortCauses, adviceFor, hasEnd } = await import("../packs/BP/scripts/animals/welfare.js");
  const { isAnchored, hasTunnels, chargeValue, serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const { TASKS, levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { PASSABLE_PATTERNS } = await import("../packs/BP/scripts/data/blocks.js");
  const { RIFT, blinkSpot, landingOk, wildOffset, routeOf, landCells } = await import("../packs/BP/scripts/animals/riftRules.js");
  const ferret = SPECIES["zoocraft:rift_ferret"];
  assert.equal(speciesForWild("zoocraft:wild_rift_ferret"), ferret);
  assert.equal(ferret.origin, "custom_end");
  assert.equal(ferret.homeDimension, "minecraft:the_end");
  assert.equal(pluralOf(ferret), "Rift Ferrets");
  assert.equal(ferret.habitatProfile, "small_terrestrial");
  assert.equal(ferret.carrierProfile, "stabilized");
  assert.equal(RATIONS[ferret.baitItem].diet, "chorus");
  assert.deepEqual(ferret.coats, ["Twilight", "Moonlit"]);
  assert.ok(ferret.anchor && ferret.tunnels.min === 2 && ferret.endGround.minCells === 6);
  assert.equal(hasEnd(ferret, { endCells: 5 }), false);
  // The Containment Anchor: charged with ender pearls (eyes of ender and popped chorus fruit too), beside the floor.
  assert.equal(chargeValue("minecraft:ender_pearl", BALANCE), 6);
  assert.equal(chargeValue("minecraft:ender_eye", BALANCE), 12);
  assert.equal(chargeValue("minecraft:popped_chorus_fruit", BALANCE), 2);
  assert.equal(chargeValue("minecraft:coal", BALANCE), 0);
  assert.ok(BALANCE.anchor.capacity >= 4 * chargeValue("minecraft:ender_pearl", BALANCE) && BALANCE.anchor.lowAt < BALANCE.anchor.capacity && BALANCE.anchor.unitsPerDay > 0);
  assert.equal(isAnchored(ferret, []), false);
  assert.equal(isAnchored(ferret, [{ type: "anchor", units: 0 }]), false);
  assert.equal(isAnchored(ferret, [{ type: "anchor", units: 1 }]), true);
  assert.equal(isAnchored(SPECIES["zoocraft:chorus_deer"], []), true);
  assert.equal(hasTunnels(ferret, [{ type: "tunnel" }]), false);
  assert.equal(hasTunnels(ferret, [{ type: "tunnel" }, { type: "tunnel" }]), true);
  assert.equal(hasTunnels(SPECIES["zoocraft:deer"], []), true);
  assert.equal(BLOCKS.anchor, "zoocraft:containment_anchor");
  assert.equal(BLOCKS.tunnel, "zoocraft:rift_tunnel");
  // The tunnel has no collision: its cell is floor, like the Ember Den; the anchor stands beside the floor.
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("zoocraft:rift_tunnel"), "air");
  assert.ok(PASSABLE_PATTERNS.some((r) => r.test("zoocraft:rift_tunnel")));
  const rows = ["FFFFFFFF", "F......F", "F......F", "F......F", "F......F", "F......F", "F......F", "FFFFFFFF"];
  const r = run(gridReader(rows), { x: 3, y: 1, z: 3 });
  assert.equal(r.usableArea, 36);
  assert.equal(serves("tunnel", r.cells, { x: 2, y: 1, z: 2 }), true);
  assert.equal(serves("tunnel", r.cells, { x: 2, y: 2, z: 2 }), false);
  assert.equal(serves("anchor", r.cells, { x: 0, y: 1, z: 3 }), true, "on the fence line, beside the floor");
  assert.equal(serves("anchor", r.cells, { x: 3, y: 1, z: 3 }), true);
  assert.equal(serves("anchor", r.cells, { x: 3, y: 4, z: 3 }), false);
  // Comfort: no anchor charge or too few tunnels caps it; with everything in place it climbs.
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 10, water: true, end: true, anchor: true, tunnel: true, enrichmentPerDay: 0 };
  const animal = () => ({ needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false });
  for (const k of ["anchor", "tunnel"]) {
    const a = animal();
    simulateAnimal(a, ferret, { ...ctx, [k]: false }, BALANCE.clock.dayLength, BALANCE);
    assert.equal(a.needs.comfort, BALANCE[k].comfortCap, k);
  }
  const ok = animal();
  ok.needs.comfort = 40;
  simulateAnimal(ok, ferret, ctx, BALANCE.clock.dayLength, BALANCE);
  assert.equal(ok.needs.comfort, 90);
  assert.deepEqual(comfortCauses({ ...ctx, anchor: false, tunnel: false }, BALANCE), ["anchor", "tunnel"]);
  assert.equal(adviceFor("comfort", ferret, ["anchor", "tunnel"]), "Give the animals a charged Containment Anchor and 2 or more Rift Tunnels to blink between");
  // Blinks land only on floor cells of the exhibit's last measurement (spec: "teleport targets remain
  // valid and contained"), mostly along the tunnel route.
  const at = { x: 1, y: 1, z: 1 };
  const tunnels = [{ x: 6, y: 1, z: 6 }, { x: 1, y: 1, z: 6 }, { x: 6, y: 1, z: 1 }];
  assert.deepEqual(routeOf(tunnels).map((t) => `${t.x},${t.z}`), ["1,6", "6,1", "6,6"]);
  assert.equal(landCells(r.cells).length, 36);
  let seed = 7;
  const random = () => {
    seed = (seed * 48271) % 2147483647;
    return seed / 2147483647;
  };
  let found = 0;
  for (let i = 0; i < 300; i++) {
    const s = blinkSpot(r.cells, tunnels, at, random);
    if (!s) continue;
    found++;
    assert.equal(r.cells.get(`${s.x},${s.y},${s.z}`), "land", "contained");
    assert.ok(Math.hypot(s.x - at.x, s.z - at.z) >= 1.5, "somewhere else");
  }
  assert.ok(found > 250, `blinks found: ${found}`);
  // From a tunnel the route goes on to the next tunnel; off the route, to the nearest one.
  assert.deepEqual(blinkSpot(r.cells, tunnels, { x: 1, y: 1, z: 6 }, () => 0), { x: 6, y: 1, z: 1 });
  assert.deepEqual(blinkSpot(r.cells, tunnels, { x: 6, y: 1, z: 6 }, () => 0), { x: 1, y: 1, z: 6 });
  assert.deepEqual(blinkSpot(r.cells, tunnels, { x: 3, y: 1, z: 6 }, () => 0), { x: 1, y: 1, z: 6 });
  // A tunnel outside the measured cells is never a target, and one tunnel is no route.
  for (let i = 0; i < 50; i++) {
    const s = blinkSpot(r.cells, [{ x: 20, y: 1, z: 20 }, { x: 1, y: 1, z: 6 }], { x: 1, y: 1, z: 6 }, random);
    if (s) assert.equal(r.cells.get(`${s.x},${s.y},${s.z}`), "land");
  }
  assert.equal(blinkSpot(new Map(), [{ x: 1, y: 1, z: 1 }, { x: 5, y: 1, z: 5 }], at, () => 0), undefined, "nothing measured: nowhere to go");
  // A landing needs room for the body and solid ground under it.
  assert.equal(landingOk("air", "air", "solid"), true);
  assert.equal(landingOk("passable", "air", "solid"), true, "inside a tunnel");
  assert.equal(landingOk("air", "solid", "solid"), false, "no headroom");
  assert.equal(landingOk("air", "air", "air"), false, "over a drop");
  assert.equal(landingOk("air", "air", "liquid"), false);
  assert.equal(landingOk("solid", "air", "solid"), false);
  assert.equal(landingOk(undefined, "air", "solid"), false, "unloaded");
  // A wild blink goes a few blocks, away from whoever came too close.
  assert.deepEqual(wildOffset({ x: 0, z: 0 }, { x: 2, z: 0 }, () => 0.5), { dx: 7, dz: 0 });
  assert.ok(RIFT.wildDist[0] >= RIFT.fleeDist, "out of reach after the blink");
  // Field Journal: spot, blink, peer (all seen in the wild).
  assert.deepEqual(ferret.observe, ["spot", "blink", "peer"]);
  for (const t of ferret.observe) assert.ok(TASKS[t], t);
  assert.deepEqual(tasksSeen(ferret, ["spot"], { onGround: true, blinking: true, peering: false }), ["blink"]);
  assert.deepEqual(tasksSeen(ferret, ["spot"], { onGround: true, blinking: false, peering: true }), ["peer"]);
  assert.deepEqual(tasksSeen(ferret, ["spot"], { onGround: true, still: true }), []);
  assert.equal(levelOf(ferret, ["spot", "blink", "peer"]), 3);
  assert.deepEqual(validateData(), []);
});

test("Rift Ferret, Containment Anchor and Rift Tunnel files: a ferret in two coats with blink, peer and hide poses, a charged anchor, a walk-in tunnel, names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const name of ["rift_ferret", "wild_rift_ferret"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.equal(e.description.identifier, `zoocraft:${name}`);
    for (const k of ["rifted", "hiding", "peering"]) assert.deepEqual(e.description.properties[`zoocraft:${k}`], { type: "bool", default: false, client_sync: true }, k);
    assert.deepEqual(e.components["minecraft:behavior.tempt"].items, ["zoocraft:chorus_browse", "chorus_fruit"]);
    assert.ok(e.components["minecraft:type_family"].family.includes("rift_ferret"));
    assert.deepEqual(e.component_groups["zoocraft:still"], { "minecraft:movement": { value: 0 } }, "held still while it peers about");
    assert.ok(e.events["zoocraft:still"] && e.events["zoocraft:move"]);
    assert.deepEqual(e.components["minecraft:collision_box"], { width: 0.5, height: 0.4 });
    assert.ok(!e.components["minecraft:behavior.avoid_mob_type"], "it blinks away instead of running");
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(d.materials.default, "entity_emissive_alpha", "the shimmer and the shards glow");
    assert.equal(d.textures.moonlit, "textures/entity/zoocraft/rift_ferret_moonlit");
    for (const a of ["walk", "idle", "peer", "hide", "blink", "look_at_target", "move", "blinking"]) assert.ok(d.animations[a], a);
    assert.deepEqual(d.scripts.animate, ["move", "blinking"]);
    assert.match(d.scripts.scale, /0\.6/);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${name}\\.name=`, "m"));
  }
  const zoo = read("../packs/BP/entities/rift_ferret.json")["minecraft:entity"];
  assert.deepEqual(zoo.components["minecraft:behavior.move_to_block"].target_blocks, ["zoocraft:rift_tunnel"]);
  assert.deepEqual(zoo.components["minecraft:damage_sensor"].triggers, [{ cause: "all", deals_damage: "no" }]);
  assert.ok(zoo.components["minecraft:persistent"] && zoo.components["minecraft:nameable"] && zoo.component_groups["zoocraft:juvenile"]);
  assert.deepEqual(zoo.events["minecraft:entity_spawned"].add.component_groups, ["zoocraft:coat_0", "zoocraft:home_8"]);
  const wild = read("../packs/BP/entities/wild_rift_ferret.json")["minecraft:entity"];
  assert.ok(wild.components["minecraft:despawn"]);
  assert.deepEqual(wild.events["minecraft:entity_spawned"].randomize.map((r) => r.weight), [3, 1], "three Twilight to one Moonlit");
  const sr = read("../packs/BP/spawn_rules/wild_rift_ferret.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(sr["minecraft:biome_filter"], { test: "has_biome_tag", value: "the_end" });
  assert.deepEqual(sr["minecraft:spawns_on_block_filter"], ["minecraft:end_stone"]);
  // Model: two body halves, neck, head with muzzle, nose and ears, four two-part legs, a three-part tail, shards.
  const geo = read("../packs/RP/models/entity/rift_ferret.geo.json")["minecraft:geometry"][0];
  assert.equal(geo.description.identifier, "geometry.zoocraft.rift_ferret");
  const bones = Object.fromEntries(geo.bones.map((b) => [b.name, b]));
  for (const n of ["body", "hind", "shards", "neck", "head", "earL", "earR", "leg0", "leg0low", "leg1", "leg1low", "leg2", "leg2low", "leg3", "leg3low", "tail1", "tail2", "tail3"]) assert.ok(bones[n], n);
  assert.ok(geo.bones.reduce((n, b) => n + b.cubes.length, 0) >= 25, "kept detailed");
  for (const b of geo.bones) for (const c of b.cubes) {
    const [w, h, d] = c.size.map(Math.ceil);
    assert.ok(c.uv[0] + 2 * (w + d) <= geo.description.texture_width && c.uv[1] + h + d <= geo.description.texture_height, `${b.name} fits the skin`);
  }
  for (const png of ["rift_ferret", "rift_ferret_moonlit"]) assert.ok(readFileSync(new URL(`../packs/RP/textures/entity/zoocraft/${png}.png`, import.meta.url)).length > 100, png);
  const rc = read("../packs/RP/render_controllers/rift_ferret.render_controllers.json").render_controllers["controller.render.zoocraft.rift_ferret"];
  assert.match(rc.textures[0], /query\.variant == 1 \? Texture\.moonlit : Texture\.default/);
  const anims = read("../packs/RP/animations/rift_ferret.animation.json").animations;
  assert.equal(anims["animation.zoocraft.rift_ferret.blink"].loop, false);
  assert.deepEqual(anims["animation.zoocraft.rift_ferret.blink"].bones.body.scale["0.0"], [0.25, 1.7, 0.25], "stretched thin as it arrives");
  assert.equal(anims["animation.zoocraft.rift_ferret.peer"].bones.hind.rotation[0], 72, "the hind legs stay on the ground");
  assert.ok(anims["animation.zoocraft.rift_ferret.hide"].bones.body.position[1].includes("-1.5"), "flat on its belly");
  const ctrls = read("../packs/RP/animation_controllers/rift_ferret.animation_controllers.json").animation_controllers;
  const states = ctrls["controller.animation.zoocraft.rift_ferret.move"].states;
  assert.deepEqual(Object.keys(states).sort(), ["hide", "idle", "peer", "walking"]);
  assert.ok(JSON.stringify(states.idle.transitions).includes("query.property('zoocraft:hiding')"));
  assert.ok(JSON.stringify(states.idle.transitions).includes("query.property('zoocraft:peering')"));
  assert.ok(JSON.stringify(ctrls["controller.animation.zoocraft.rift_ferret.blink"].states.still.transitions).includes("query.property('zoocraft:rifted')"));
  // The Containment Anchor: a fixture whose crystal shows the charge and lights up; the items list's recipe.
  const anchor = read("../packs/BP/blocks/containment_anchor.json")["minecraft:block"];
  assert.deepEqual(anchor.description.states, { "zoocraft:fill": [0, 1, 2] });
  assert.ok(anchor.components["zoocraft:fixture"]);
  assert.equal(anchor.components["minecraft:light_emission"], 0, "dark without charge");
  assert.equal(anchor.components["minecraft:geometry"], "geometry.zoocraft.containment_anchor");
  const lit = anchor.permutations.find((p) => p.condition.includes("== 2"));
  assert.ok(lit.components["minecraft:light_emission"] >= 8 && lit.components["minecraft:material_instances"].crystal.texture === "zoocraft_anchor_crystal_on");
  assert.equal(anchor.permutations.find((p) => p.condition.includes("== 1")).components["minecraft:material_instances"].crystal.texture, "zoocraft_anchor_crystal_low");
  const ag = read("../packs/RP/models/blocks/containment_anchor.geo.json")["minecraft:geometry"][0];
  assert.ok(ag.bones[0].cubes.length >= 10 && ag.bones[0].cubes.some((c) => c.rotation?.[1] === 45), "a pillar with prongs and a crystal set on its corner");
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const n of ["anchor_base", "anchor_pillar", "anchor_crystal_off", "anchor_crystal_low", "anchor_crystal_on", "tunnel_brick", "tunnel_inner", "tunnel_crystal"]) {
    assert.equal(terrain[`zoocraft_${n}`].textures, `textures/blocks/zoocraft/${n}`);
    assert.ok(readFileSync(new URL(`../packs/RP/textures/blocks/zoocraft/${n}.png`, import.meta.url)).length > 100, n);
  }
  const ar = read("../packs/BP/recipes/zoocraft_containment_anchor.json")["minecraft:recipe_shaped"];
  const count = (pattern, ch) => pattern.join("").split(ch).length - 1;
  assert.deepEqual([count(ar.pattern, "E"), count(ar.pattern, "O"), count(ar.pattern, "P"), count(ar.pattern, "R")], [4, 2, 1, 1], "4 end stone, 2 obsidian, 1 ender pearl, 1 redstone");
  assert.deepEqual([ar.key.E.item, ar.key.O.item, ar.key.P.item, ar.key.R.item], ["minecraft:end_stone", "minecraft:obsidian", "minecraft:ender_pearl", "minecraft:redstone"]);
  assert.deepEqual(ar.tags, ["zoocraft_workshop"]);
  // The Rift Tunnel: no collision (a ferret walks in), lit, a fixture, turned to face the player; two from end stone bricks and purpur.
  const tunnel = read("../packs/BP/blocks/rift_tunnel.json")["minecraft:block"];
  assert.equal(tunnel.components["minecraft:collision_box"], false);
  assert.ok(tunnel.components["zoocraft:fixture"] && tunnel.components["minecraft:light_emission"] > 0);
  assert.ok(tunnel.description.traits["minecraft:placement_direction"]);
  for (const m of Object.values(tunnel.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
  assert.equal(new Set(Object.values(tunnel.components["minecraft:material_instances"]).map((m) => m.render_method)).size, 1);
  const tg = read("../packs/RP/models/blocks/rift_tunnel.geo.json")["minecraft:geometry"][0];
  assert.ok(tg.bones[0].cubes.length >= 12, "kept detailed");
  const tr = read("../packs/BP/recipes/zoocraft_rift_tunnel.json")["minecraft:recipe_shaped"];
  assert.deepEqual(tr.pattern, ["BBB", "P P", "BBB"]);
  assert.deepEqual([tr.key.B.item, tr.key.P.item], ["minecraft:end_bricks", "minecraft:purpur_block"]);
  assert.deepEqual(tr.result, { item: "zoocraft:rift_tunnel", count: 2 });
  for (const b of ["containment_anchor", "rift_tunnel"]) assert.equal(read(`../packs/BP/loot_tables/blocks/zoocraft_${b}.json`).pools[0].entries[0].name, `zoocraft:${b}`);
  for (const k of ["item.spawn_egg.entity.zoocraft:wild_rift_ferret", "tile.zoocraft:containment_anchor", "tile.zoocraft:rift_tunnel"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
});

// ---------- End expedition and End research (M5 part 4) ----------
test("End expedition: the campaign chain after the tutorial, checked from the park's real state, rewarded once", async () => {
  const { stepsDone, nextStep, TUTORIAL_STEPS, completeSteps } = await import("../packs/BP/scripts/quests/steps.js");
  const { EXPEDITION_STEPS, END_SPECIES, expeditionFacts } = await import("../packs/BP/scripts/quests/expeditionSteps.js");
  assert.deepEqual(EXPEDITION_STEPS.map((s) => s.id), ["research", "carrier", "end", "spot", "deer", "ground", "flight", "ray", "anchor", "ferret", "settled"]);
  for (const s of EXPEDITION_STEPS) assert.ok(s.title && s.hint, s.id);
  assert.deepEqual(END_SPECIES, ["zoocraft:chorus_deer", "zoocraft:void_ray", "zoocraft:rift_ferret"]);
  // The step rules are the tutorial's, shared.
  const facts = { claim: true, workshop: false, tools: true };
  assert.deepEqual(completeSteps({}, facts), stepsDone(TUTORIAL_STEPS, {}, facts));
  const empty = { researched: [], carrying: false, inEnd: false, levels: {}, exhibits: [], animals: [], anchors: [] };
  assert.deepEqual(Object.values(expeditionFacts(empty)), new Array(EXPEDITION_STEPS.length).fill(false));
  assert.deepEqual(stepsDone(EXPEDITION_STEPS, {}, expeditionFacts(empty)), []);
  // Step by step, from the records.
  const deerEx = { id: "ex1", speciesId: "zoocraft:chorus_deer", animalIds: ["a1"], endCells: 3, careWarnings: [{ severity: 2, text: "End ground" }] };
  const rayEx = { id: "ex2", speciesId: "zoocraft:void_ray", animalIds: ["a2"], aerial: { enclosed: true, perchCount: 2 }, perchCount: 2, careWarnings: [] };
  const ferretEx = { id: "ex3", speciesId: "zoocraft:rift_ferret", animalIds: ["a3"], endCells: 6, careWarnings: [{ severity: 1, text: "anchor low" }] };
  const view = {
    researched: ["dimensional_preparation"],
    carrying: true,
    inEnd: true,
    levels: { "zoocraft:chorus_deer": 3, "zoocraft:void_ray": 1, "zoocraft:rift_ferret": 1 },
    exhibits: [deerEx, rayEx, ferretEx],
    animals: [
      { speciesId: "zoocraft:chorus_deer", location: { kind: "exhibit", id: "ex1" } },
      { speciesId: "zoocraft:void_ray", location: { kind: "exhibit", id: "ex2" } },
      { speciesId: "zoocraft:rift_ferret", location: { kind: "exhibit", id: "ex3" } },
    ],
    anchors: [{ exhibitId: "ex3", units: 5 }],
  };
  let f = expeditionFacts(view);
  assert.equal(f.ground, false, "3 end stone is not End ground for a deer");
  assert.equal(f.settled, false, "a serious care warning in the deer's exhibit");
  assert.deepEqual(stepsDone(EXPEDITION_STEPS, {}, f), ["research", "carrier", "end", "spot", "deer"], "stops at the first step not done");
  deerEx.endCells = 8;
  deerEx.careWarnings = [];
  f = expeditionFacts(view);
  assert.deepEqual(stepsDone(EXPEDITION_STEPS, {}, f), EXPEDITION_STEPS.map((s) => s.id), "everything in place finishes the chain at once");
  const completed = { research: 1, carrier: 1, end: 1 };
  assert.equal(nextStep(EXPEDITION_STEPS, completed).id, "spot");
  assert.deepEqual(stepsDone(EXPEDITION_STEPS, completed, { ...f, research: false, spot: false }), [], "finished steps stay finished; a later fact waits");
  assert.equal(expeditionFacts({ ...view, anchors: [{ exhibitId: "ex3", units: 0 }] }).anchor, false, "an anchor without charge doesn't count");
  assert.equal(expeditionFacts({ ...view, anchors: [{ exhibitId: undefined, units: 5 }] }).anchor, false, "an anchor outside any exhibit doesn't count");
  assert.equal(expeditionFacts({ ...view, animals: view.animals.slice(0, 2) }).settled, false, "all three End animals must be home");
  // An End animal already at home proves the carrier and the trip (a park from before this chain).
  const before = expeditionFacts({ ...view, carrying: false, inEnd: false });
  assert.ok(before.carrier && before.end);
  // A flight room counts before a ray lives there (the second look), with its two perches.
  const room = (perchCount) => ({ ...empty, exhibits: [{ id: "e", animalIds: [], aerial: { enclosed: true, perchCount }, careWarnings: [] }] });
  assert.equal(expeditionFacts(room(1)).flight, false);
  assert.equal(expeditionFacts(room(2)).flight, true);
  assert.equal(expeditionFacts({ ...empty, exhibits: [{ id: "e", animalIds: [], aerial: { enclosed: false, perchCount: 2 }, careWarnings: [] }] }).flight, false, "an open roof is no flight room");
  // The reward is one ledger operation (AC-15: a retry never pays twice).
  const store = new Store(memBackend());
  const park = { id: "park", balance: 0, ledgerSeq: 0 };
  const op = { opId: "grant:end_expedition", amount: BALANCE.expedition.reward, reason: "End expedition complete", parkTime: 0 };
  assert.equal(applyLedger(store, park, op).duplicate, false);
  assert.equal(applyLedger(store, park, op).duplicate, true);
  assert.equal(park.balance, BALANCE.expedition.reward);
});

test("End research: Anchor Tuning and the End Guidebook open after earlier projects and the End pages of the Field Journal", async () => {
  const { projectNeeds } = await import("../packs/BP/scripts/discovery/rules.js");
  const { PROJECTS, projectById } = await import("../packs/BP/scripts/data/research.js");
  const tuning = projectById("anchor_tuning");
  const guide = projectById("end_guidebook");
  assert.ok(tuning && guide);
  assert.deepEqual(projectNeeds(tuning, {}, []), ["Dimensional Preparation researched", "Rift Ferret ready to move"]);
  assert.deepEqual(projectNeeds(tuning, { "zoocraft:rift_ferret": 2 }, ["dimensional_preparation"]), ["Rift Ferret ready to move"]);
  assert.deepEqual(projectNeeds(tuning, { "zoocraft:rift_ferret": 3 }, ["dimensional_preparation"]), []);
  assert.deepEqual(projectNeeds(guide, { "zoocraft:chorus_deer": 1, "zoocraft:void_ray": 1 }, ["park_guidebook"]), ["Rift Ferret observed"]);
  assert.deepEqual(projectNeeds(guide, { "zoocraft:chorus_deer": 1, "zoocraft:void_ray": 2, "zoocraft:rift_ferret": 3 }, []), ["Park Guidebook researched"]);
  assert.deepEqual(projectNeeds(guide, { "zoocraft:chorus_deer": 1, "zoocraft:void_ray": 2, "zoocraft:rift_ferret": 3 }, ["park_guidebook"]), []);
  assert.equal(projectNeeds(projectById("park_guidebook"), { a: 1, b: 1, c: 1 }).length, 0, "the counted needs work without a done list");
  // Their effects are numbers the game reads (research/research.js), and the texts say the same.
  assert.ok(BALANCE.research.anchorTuning.capacity > BALANCE.anchor.capacity && BALANCE.research.anchorTuning.unitsPerDay < BALANCE.anchor.unitsPerDay);
  assert.match(tuning.text, new RegExp(`hold ${BALANCE.research.anchorTuning.capacity} charge instead of ${BALANCE.anchor.capacity}`));
  assert.match(tuning.text, new RegExp(`use ${BALANCE.research.anchorTuning.unitsPerDay} charge a park day instead of ${BALANCE.anchor.unitsPerDay}`));
  assert.ok(BALANCE.research.endGuidebook.guests > 0 && BALANCE.research.parkGuidebook.guests > 0);
  assert.match(guide.text, new RegExp(`${Math.round(BALANCE.research.endGuidebook.guests * 100)}% more guests`));
  assert.ok(BALANCE.expedition.reward > BALANCE.tutorial.reward, "the End expedition pays more than the tutorial");
  for (const p of PROJECTS) assert.ok(p.cost > 0 && Object.keys(p.items).length && p.text, p.id);
  assert.deepEqual(validateData(), []);
});

// ---------- 0.1.56: the End Fence ----------
test("End Fence: Rift Ferrets never blink across one, its arms reach what stands beside it, and the validator reads it as a barrier", async () => {
  const { crossesFence } = await import("../packs/BP/scripts/animals/riftRules.js");
  const { fenceLinks } = await import("../packs/BP/scripts/equipment/rules.js");
  // A fence line along x = 5 (both halves, y 0 and 1), from z 0 to 10.
  const wall = new Set();
  for (let z = 0; z <= 10; z++) for (const y of [0, 1]) wall.add(`5,${y},${z}`);
  const at = (c) => wall.has(`${c.x},${c.y},${c.z}`);
  assert.equal(crossesFence({ x: 2, y: 0, z: 2 }, { x: 8, y: 0, z: 2 }, at), true, "straight across the fence");
  assert.equal(crossesFence({ x: 2, y: 0, z: 2 }, { x: 4, y: 0, z: 8 }, at), false, "staying on the near side");
  assert.equal(crossesFence({ x: 2, y: 0, z: 2 }, { x: 8, y: 1, z: 9 }, at), true, "a long diagonal across it, landing a block higher");
  assert.equal(crossesFence({ x: 2, y: 0, z: 12 }, { x: 8, y: 0, z: 14 }, at), false, "past the end of the fence");
  assert.equal(crossesFence({ x: 2, y: 3, z: 2 }, { x: 8, y: 3, z: 2 }, at), false, "well above it (a ledge) doesn't count");
  // Two posts touching at a corner: the diagonal between them is blocked too.
  const corner = new Set(["5,0,4", "5,1,4", "4,0,5", "4,1,5"]);
  const cornerAt = (c) => corner.has(`${c.x},${c.y},${c.z}`);
  assert.equal(crossesFence({ x: 3, y: 0, z: 3 }, { x: 6, y: 0, z: 6 }, cornerAt), true, "no slipping between corner-touching posts");
  assert.equal(crossesFence({ x: 3, y: 0, z: 3 }, { x: 3, y: 0, z: 3 }, cornerAt), false, "staying put");
  assert.deepEqual(fenceLinks({ n: "fence", e: "solid", s: "open", w: "open" }), { n: true, e: true, s: false, w: false });
  assert.deepEqual(fenceLinks({}), { n: false, e: false, s: false, w: false });
  for (const id of ["zoocraft:end_fence", "zoocraft:end_fence_top"]) {
    assert.equal(classifyBlock(id, { isAir: false, isLiquid: false, open: false }), "barrier", id);
    assert.equal(blocksView(id, { isAir: false, isLiquid: false }), false, "guests see over it");
  }
});

test("End Fence files: a two-part fence with link states, arm collision and selection, a lit crystal top, a recipe and names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const bottom = read("../packs/BP/blocks/end_fence.json")["minecraft:block"];
  const top = read("../packs/BP/blocks/end_fence_top.json")["minecraft:block"];
  for (const [b, h] of [[bottom, 16], [top, 8]]) {
    for (const k of ["n", "e", "s", "w"]) assert.deepEqual(b.description.states[`zoocraft:${k}`], [false, true]);
    assert.ok(b.components["zoocraft:end_fence"]);
    assert.deepEqual(b.components["minecraft:collision_box"], [{ origin: [-2, 0, -2], size: [4, h, 4] }], "the post alone with no arms");
    assert.equal(b.permutations.length, 15, "every combination of arms has its own collision");
    for (const k of ["n", "e", "s", "w"]) assert.equal(b.components["minecraft:geometry"].bone_visibility[`arm_${k}`], `query.block_state('zoocraft:${k}')`);
    const all = b.permutations.find((p) => !p.condition.includes("false"));
    assert.equal(all.components["minecraft:collision_box"].length, 5, "post and four arms");
    assert.ok(all.components["minecraft:collision_box"].every((box) => box.size[1] === h));
    // 0.1.59: the selection box hugs the post and its arms (like a vanilla fence), so aiming beside a
    // fence line hits the ground there.
    assert.deepEqual(b.components["minecraft:selection_box"], { origin: [-2, 0, -2], size: [4, h, 4] }, "a lone post is aimed at only at the post");
    assert.deepEqual(all.components["minecraft:selection_box"], { origin: [-8, 0, -8], size: [16, h, 16] });
    const ew = b.permutations.find((p) => p.condition === "query.block_state('zoocraft:n') == false && query.block_state('zoocraft:e') == true && query.block_state('zoocraft:s') == false && query.block_state('zoocraft:w') == true");
    assert.deepEqual(ew.components["minecraft:selection_box"], { origin: [-8, 0, -2], size: [16, h, 4] }, "a line along x is a thin slab");
    for (const p of b.permutations) {
      const boxes = p.components["minecraft:collision_box"];
      const sel = p.components["minecraft:selection_box"];
      for (let i = 0; i < 3; i++) {
        assert.equal(sel.origin[i], Math.min(...boxes.map((x) => x.origin[i])));
        assert.equal(sel.origin[i] + sel.size[i], Math.max(...boxes.map((x) => x.origin[i] + x.size[i])));
      }
    }
  }
  const fence = readFileSync(new URL("../packs/BP/scripts/equipment/endFence.js", import.meta.url), "utf8");
  assert.match(fence, /e\.permutationToPlace = linkedPermutation\(BLOCKS\.endFence/, "the arms are part of the placed block");
  assert.match(fence, /aimed\?\.typeId === BLOCKS\.endFenceTop && ground\?\.isAir/, "placing against the crystal top goes to the ground beside it");
  assert.match(fence, /above\.setPermutation\(linkedPermutation\(BLOCKS\.endFenceTop/, "the top goes on with its beams in one go");
  assert.equal(bottom.description.identifier, "zoocraft:end_fence");
  assert.equal(bottom.description.menu_category.category, "items");
  assert.equal(top.description.identifier, "zoocraft:end_fence_top");
  assert.equal(top.description.menu_category.category, "none", "the top half is placed by the script");
  assert.ok(top.components["minecraft:light_emission"] >= 5, "the crystal glows");
  for (const name of ["end_fence", "end_fence_top"]) {
    const g = read(`../packs/RP/models/blocks/${name}.geo.json`)["minecraft:geometry"][0];
    assert.equal(g.description.identifier, `geometry.zoocraft.${name}`);
    assert.deepEqual(g.bones.map((b) => b.name), [name === "end_fence" ? "post" : "spire", "arm_n", "arm_e", "arm_s", "arm_w"]);
  }
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const m of Object.values(bottom.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
  for (const m of Object.values(top.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
  const recipe = read("../packs/BP/recipes/zoocraft_end_fence.json")["minecraft:recipe_shaped"];
  assert.deepEqual(recipe.pattern, ["BRB", "BRB"]);
  assert.deepEqual([recipe.key.B.item, recipe.key.R.item], ["minecraft:end_bricks", "minecraft:end_rod"]);
  assert.deepEqual(recipe.result, { item: "zoocraft:end_fence", count: 4 });
  assert.ok(recipe.tags.includes("zoocraft_workshop"));
  assert.equal(read("../packs/BP/loot_tables/blocks/zoocraft_end_fence.json").pools[0].entries[0].name, "zoocraft:end_fence");
  assert.deepEqual(read("../packs/BP/loot_tables/blocks/zoocraft_end_fence_top.json").pools, [], "only the bottom drops the item");
  for (const k of ["tile.zoocraft:end_fence", "tile.zoocraft:end_fence_top"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=End Fence$`, "m"));
  const { BLOCKS } = JSON.parse(JSON.stringify({ BLOCKS: { endFence: "zoocraft:end_fence", endFenceTop: "zoocraft:end_fence_top" } }));
  assert.equal(BLOCKS.endFence, bottom.description.identifier);
});

// ---------- 0.1.57: conservation releases ----------
test("Conservation releases: who may go back to the wild, where, what it earns, and the quest chain", async () => {
  const { releaseCheck, siteCheck, groundOk, groundText, guestBoost, summarize, CONSERVATION_STEPS, conservationFacts, dimensionName } = await import("../packs/BP/scripts/quests/conservationRules.js");
  const { stepsDone } = await import("../packs/BP/scripts/quests/steps.js");
  const B = BALANCE.conservation;
  const deer = SPECIES["zoocraft:deer"];
  const base = { animal: { id: "a1", name: "Fern", juvenile: false, ill: false }, species: deer, welfare: 80, daysInPark: 5, level: 2, residentsAfter: 3, lastReleaseDay: undefined, cooldownDays: B.cooldownDays, day: 10 };
  assert.equal(releaseCheck(base, B).ok, true);
  assert.match(releaseCheck(base, B).reason, /ready for the wild/);
  // The first failing rule explains itself, in order.
  assert.match(releaseCheck({ ...base, animal: { ...base.animal, juvenile: true } }, B).reason, /still young/);
  assert.match(releaseCheck({ ...base, animal: { ...base.animal, expecting: { daysLeft: 1 } } }, B).reason, /expecting/);
  assert.match(releaseCheck({ ...base, animal: { ...base.animal, ill: true } }, B).reason, /unwell/);
  assert.match(releaseCheck({ ...base, welfare: B.welfareMin - 1 }, B).reason, new RegExp(`welfare ${B.welfareMin}`));
  assert.match(releaseCheck({ ...base, daysInPark: B.minDays - 1 }, B).reason, /settled for/);
  assert.match(releaseCheck({ ...base, level: 1 }, B).reason, /Field Journal/);
  // Social animals: don't leave one behind alone (deer like 2 or more); emptying the exhibit is fine.
  assert.match(releaseCheck({ ...base, residentsAfter: 1 }, B).reason, /leave 1 behind/);
  assert.equal(releaseCheck({ ...base, residentsAfter: 0 }, B).ok, true);
  assert.equal(releaseCheck({ ...base, species: SPECIES["zoocraft:basalt_tortoise"], residentsAfter: 1 }, B).ok, true, "a solitary species leaves nobody lonely");
  // The wild takes one of a species per cooldown; a researched cooldown is shorter.
  assert.match(releaseCheck({ ...base, lastReleaseDay: 8 }, B).reason, /takes the next one in 2 park days/);
  assert.equal(releaseCheck({ ...base, lastReleaseDay: 8, cooldownDays: 2 }, B).ok, true);
  assert.equal(releaseCheck({ ...base, lastReleaseDay: 6 }, B).ok, true);

  // The site: home dimension, past the park, the species' ground, air above.
  const ground = { id: "minecraft:grass_block", isAir: false, isLiquid: false, lavaNear: false };
  const site = { species: deer, dimensionId: "minecraft:overworld", insidePark: false, distance: B.minDistance + 100, ground, aboveFree: true };
  assert.equal(siteCheck(site, B).ok, true);
  assert.match(siteCheck({ ...site, dimensionId: "minecraft:nether" }, B).reason, /belongs in the Overworld/);
  assert.match(siteCheck({ ...site, insidePark: true, distance: 50 }, B).reason, /inside the park/i);
  assert.match(siteCheck({ ...site, distance: B.minDistance - 1 }, B).reason, /Too close/);
  assert.match(siteCheck({ ...site, ground: { ...ground, id: "minecraft:water", isLiquid: true } }, B).reason, /open ground/);
  assert.match(siteCheck({ ...site, aboveFree: false }, B).reason, /block above/);
  const ray = SPECIES["zoocraft:lava_ray"];
  assert.equal(siteCheck({ ...site, species: ray, dimensionId: "minecraft:nether", distance: Infinity, ground: { ...ground, id: "minecraft:basalt", lavaNear: true }, aboveFree: false }, B).ok, true, "a lava animal goes into lava beside the block");
  assert.match(siteCheck({ ...site, species: ray, dimensionId: "minecraft:nether", distance: Infinity }, B).reason, /lava lake/);
  const cdeer = SPECIES["zoocraft:chorus_deer"];
  assert.equal(groundOk(cdeer, { ...ground, id: "minecraft:end_stone" }), true);
  assert.equal(groundOk(cdeer, ground), false);
  assert.equal(groundOk(SPECIES["zoocraft:penguin"], { ...ground, id: "minecraft:snow" }), true);
  assert.equal(groundOk(SPECIES["zoocraft:penguin"], ground), false);
  assert.equal(groundText(cdeer), "on end stone");
  assert.equal(dimensionName("minecraft:the_end"), "the End");

  // Reputation: a little per release, capped.
  assert.equal(guestBoost(0, B), 0);
  assert.equal(guestBoost(1, B), B.guestsPerRelease);
  assert.equal(guestBoost(1000, B), B.guestsCap);
  const releases = [{ speciesId: "zoocraft:deer", zooBorn: false, day: 3 }, { speciesId: "zoocraft:deer", zooBorn: true, day: 7 }, { speciesId: "zoocraft:otter", zooBorn: false, day: 5 }];
  assert.deepEqual(summarize(releases), { count: 3, zooBorn: 1, species: { "zoocraft:deer": 2, "zoocraft:otter": 1 }, speciesCount: 2, lastDay: { "zoocraft:deer": 7, "zoocraft:otter": 5 } });

  // The chain.
  assert.deepEqual(CONSERVATION_STEPS.map((s) => s.id), ["notes", "thrive", "born", "release", "homegrown", "three", "science"]);
  for (const s of CONSERVATION_STEPS) assert.ok(s.title && s.hint, s.id);
  const empty = { levels: {}, exhibits: [], animals: [], welfareOf: () => 0, releases: [], researched: [] };
  assert.deepEqual(Object.values(conservationFacts(empty, B)), new Array(CONSERVATION_STEPS.length).fill(false));
  assert.deepEqual(stepsDone(CONSERVATION_STEPS, {}, conservationFacts(empty, B)), []);
  const ex = { id: "ex1", animalIds: ["a", "b"], careWarnings: [{ severity: 1 }] };
  const housed = (id, extra = {}) => ({ id, speciesId: "zoocraft:deer", juvenile: false, ill: false, location: { kind: "exhibit", id: "ex1" }, ...extra });
  const full = {
    levels: { "zoocraft:deer": 2 },
    exhibits: [ex],
    animals: [housed("a"), housed("b", { parents: ["x", "y"] })],
    welfareOf: () => 75,
    releases: [{ speciesId: "zoocraft:deer", zooBorn: true, day: 1 }, { speciesId: "zoocraft:otter", zooBorn: false, day: 2 }, { speciesId: "zoocraft:penguin", zooBorn: false, day: 3 }],
    researched: ["reintroduction_science"],
  };
  assert.deepEqual(Object.values(conservationFacts(full, B)), new Array(CONSERVATION_STEPS.length).fill(true));
  assert.equal(stepsDone(CONSERVATION_STEPS, {}, conservationFacts(full, B)).length, CONSERVATION_STEPS.length);
  // A thriving group needs two grown-ups all well, and no orange warning.
  assert.equal(conservationFacts({ ...full, animals: [housed("a"), housed("b", { juvenile: true })] }, B).thrive, false);
  assert.equal(conservationFacts({ ...full, welfareOf: () => B.welfareMin - 1 }, B).thrive, false);
  assert.equal(conservationFacts({ ...full, exhibits: [{ ...ex, careWarnings: [{ severity: 2 }] }] }, B).thrive, false);
  assert.equal(conservationFacts({ ...full, releases: full.releases.slice(0, 2) }, B).three, false);
  assert.equal(conservationFacts({ ...full, animals: [housed("a")], releases: [] }, B).born, false);
  assert.equal(conservationFacts({ ...full, animals: [housed("a")] }, B).born, true, "a zoo-born animal already released still counts");
});

test("Conservation releases: the transfer journal closes as Released, research can need releases, and the files wire it in", async () => {
  const { projectNeeds } = await import("../packs/BP/scripts/discovery/rules.js");
  const { PROJECTS } = await import("../packs/BP/scripts/data/research.js");
  assert.equal(canMove("ArrivalPending", "Released"), true);
  assert.equal(canMove("Packed", "Released"), false, "only through the arrival check");
  assert.equal(canMove("Released", "Packed"), false, "a released animal never comes back through the carrier");
  const s = new Store(memBackend());
  const t = { id: "t1", token: "k1", animalId: "a1", phase: "Reserved", purpose: "release", createdAt: 0, updatedAt: 0 };
  s.put(TRANSFERS, t);
  move(s, t, "Packed", 1);
  move(s, t, "ArrivalPending", 2);
  move(s, t, "Released", 3);
  assert.equal(checkToken(s, "t1", "k1").ok, false, "the carrier is stale once the animal is free");
  assert.deepEqual(reconcile(s, 4), [], "a closed release needs no recovery");
  const science = PROJECTS.find((p) => p.id === "reintroduction_science");
  assert.ok(science);
  assert.deepEqual(science.needs, { after: "park_guidebook", releases: 1 });
  assert.deepEqual(projectNeeds(science, {}, ["park_guidebook"], 0), ["1 animal released to the wild (0 so far)"]);
  assert.deepEqual(projectNeeds(science, {}, ["park_guidebook"], 1), []);
  assert.deepEqual(projectNeeds(science, {}, [], 2), ["Park Guidebook researched"]);
  assert.deepEqual(validateData(), []);
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  assert.match(read("../packs/BP/scripts/main.js"), /loop\("conservation", 40, \d+, tickConservation\)/);
  assert.match(read("../packs/BP/scripts/transport/carriers.js"), /export function packForRelease/);
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /Release to the wild/);
  assert.match(read("../packs/BP/scripts/ui/fieldJournal.js"), /releaseNote/);
  assert.ok(BALANCE.research.reintroduction.cooldownDays < BALANCE.conservation.cooldownDays);
});

// ---------- 0.1.58: sandbox mode and park roles ----------

test("Park roles: what each role may do, who to ask, the Members rows, and handing the park over", async () => {
  const R = await import("../packs/BP/scripts/park/rules.js");
  assert.equal(R.allowed("visitor", "care"), false);
  assert.equal(R.allowed("keeper", "care"), true);
  assert.equal(R.allowed("keeper", "build"), false);
  assert.equal(R.allowed("manager", "spend"), true);
  assert.equal(R.allowed("manager", "settings"), false);
  assert.equal(R.allowed("owner", "members"), true);
  assert.equal(R.allowed("owner", "nonsense"), false, "unknown actions are never allowed");
  assert.equal(R.allowed(undefined, "care"), false, "no role reads as a visitor");
  assert.match(R.denyLine("care", "Austin"), /^§cOnly a park keeper or above can do that\. §7Ask Austin, the park owner/);
  assert.equal(R.denyLine("build"), "§cOnly a park manager or above can do that.");
  assert.match(R.welcomeText("keeper"), /^§6Welcome to the park\. §fYou're a keeper: cares for the animals/);
  assert.match(R.welcomeText("owner", { sandbox: true }), /the owner: .*§dSandbox mode is on\.$/);
  assert.match(R.welcomeText("stranger"), /a visitor/);
  const park = { ownerId: "o", members: { o: { role: "owner", name: "Austin" }, k: { role: "keeper", name: "Kim" }, m: { role: "manager", name: "Mo" } }, settings: {} };
  const rows = R.memberRows(park, [{ id: "o", name: "Austin" }, { id: "k", name: "Kim" }, { id: "v", name: "Val" }, { id: "x" }], ["v", "k"]);
  assert.deepEqual(
    rows.map((r) => [r.name, r.role, r.online]),
    [
      ["Kim", "keeper", true],
      ["Val", "visitor", true],
      ["Mo", "manager", false],
    ],
    "the owner is left out, online first, then by rank; a member never seen joining is still listed; a nameless record is skipped",
  );
  assert.equal(R.canHandOver(park, "o").ok, false);
  assert.equal(R.canHandOver(park, "v").ok, false, "only a member can take the park");
  assert.equal(R.canHandOver(park, "m").ok, true);
  const r = R.handOver(park, "m", "Mo");
  assert.equal(r.ok, true);
  assert.equal(park.ownerId, "m");
  assert.deepEqual(park.members.m, { role: "owner", name: "Mo" });
  assert.deepEqual(park.members.o, { role: "manager", name: "Austin" }, "the old owner stays on as a manager");
  assert.deepEqual(R.GIVABLE_ROLES, ["visitor", "keeper", "manager"]);
  for (const role of Object.keys(R.ROLE_RANK)) assert.ok(R.ROLE_TEXT[role] && R.ROLE_LABEL[role], role);
});

test("Sandbox mode: free spending and wages at 0 under the same operation id, free research, remembered on the park, shown everywhere", async () => {
  const R = await import("../packs/BP/scripts/park/rules.js");
  const normal = { balance: 120, settings: {} };
  const sandbox = { balance: 120, settings: { sandbox: true } };
  assert.equal(R.sandboxOn(normal), false);
  assert.equal(R.sandboxOn(sandbox), true);
  assert.equal(R.sandboxOn(undefined), false);
  assert.equal(R.balanceText(normal), "§e120");
  assert.equal(R.balanceText(sandbox), "§dunlimited §8(sandbox; 120 banked)");
  assert.equal(R.coinsLabel(normal), "§eZoo Coins");
  assert.equal(R.coinsLabel(sandbox), "§dZoo Coins (sandbox)");
  assert.equal(R.sandboxLine(normal), "");
  assert.match(R.sandboxLine(sandbox), /^§dSandbox mode: on/);
  assert.match(R.sandboxLine({ settings: {}, sandboxUsed: true }), /has used it/);
  assert.match(R.settingsText({ settings: { sandbox: true, peacefulCare: false } }), /Sandbox mode: §don[\s\S]*Peaceful care: §7off[\s\S]*never used sandbox mode/);
  assert.match(R.settingsText({ settings: {}, sandboxUsed: true }), /This park has used sandbox mode/);
  assert.equal(R.SANDBOX_TEXT.length, 3);
  // The ledger at 0: the same operation id never runs twice, and the balance never moves.
  const s = new Store(memBackend());
  const park = { id: "main", balance: 50, ledgerSeq: 0 };
  const a = applyLedger(s, park, { opId: "buy:1", amount: 0, reason: "Bought 8 Leafy Rations §8(sandbox: free)", parkTime: 0 });
  assert.equal(a.ok, true);
  assert.equal(park.balance, 50);
  assert.equal(applyLedger(s, park, { opId: "buy:1", amount: 0, reason: "again", parkTime: 1 }).duplicate, true);
  assert.equal(applyLedger(s, park, { opId: "buy:2", amount: -500, reason: "too dear", parkTime: 1 }).ok, false, "outside sandbox the balance still can't go below zero");
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const economy = read("../packs/BP/scripts/economy/economy.js");
  assert.equal((economy.match(/if \(sandboxOn\(park\)\) return applyLedger\(db, park, \{ opId, amount: 0/g) ?? []).length, 2, "spend and charge are free in sandbox mode; earn is not touched");
  assert.match(read("../packs/BP/scripts/research/research.js"), /if \(sandboxOn\(getPark\(\)\)\) return \{ open: true, short: \[\], afford: true, sandbox: true \}/);
  assert.match(read("../packs/BP/scripts/research/research.js"), /if \(!st\.sandbox\) for \(const \[item, n\] of Object\.entries\(project\.items\)\) takeItem/);
  const parkJs = read("../packs/BP/scripts/park/park.js");
  assert.match(parkJs, /if \(name === "sandbox" && value\) park\.sandboxUsed = true;/);
  assert.match(parkJs, /export function notePlayer/);
  assert.match(parkJs, /export function transferPark/);
  assert.match(parkJs, /return allowed\(roleOf\(player\.id\), action\);/);
  const menu = read("../packs/BP/scripts/ui/parkMenu.js");
  assert.match(menu, /\.toggle\("Sandbox mode \(unlimited coins, free research and wages\)"/);
  assert.match(menu, /memberRows\(park, knownPlayers\(\), onlinePlayers\(\)\.map\(\(p\) => p\.id\)\)/);
  assert.match(menu, /Hand the park over to them/);
  assert.match(read("../packs/BP/scripts/ui/hud.js"), /\[coinsLabel\(park\), park\.balance\]/);
  assert.match(read("../packs/BP/scripts/main.js"), /notePlayer\(player\);[\s\S]*welcomeText\(roleOf\(player\.id\), park\.settings\)/);
  for (const f of ["ui/researchMenu.js", "ui/staffMenu.js"]) assert.doesNotMatch(read(`../packs/BP/scripts/${f}`), /Zoo Coins: §e\$\{/, `${f} shows the balance through balanceText`);
  assert.match(read("../packs/BP/scripts/quests/conservation.js"), /isClearLava\(typeId\)/, "Clear Lava counts for a release site");
});

// ---------- 0.1.60: guest journeys over the path network ----------

test("Guest journeys: routes over the path network climb steps and cross bridges, far spots are favoured, and the game walks them", async () => {
  const R = await import("../packs/BP/scripts/visitors/routes.js");
  // A path from x = 0..10 at y = 0, stairs up at x = 11 (y = 1) and 12 (y = 2), a bridge x = 13..20 at
  // y = 2, down at x = 21 (y = 1) and x = 22..30 at y = 0; a side path at z = 1..5 from x = 5.
  const path = new Set();
  for (let x = 0; x <= 10; x++) path.add(`${x},0,0`);
  path.add("11,1,0");
  path.add("12,2,0");
  for (let x = 13; x <= 20; x++) path.add(`${x},2,0`);
  path.add("21,1,0");
  for (let x = 22; x <= 30; x++) path.add(`${x},0,0`);
  for (let z = 1; z <= 5; z++) path.add(`5,0,${z}`);
  const read = (x, y, z) => (path.has(`${x},${y},${z}`) ? "path" : "other");
  const net = walk(read, entranceStarts(read, { x: -2, y: 1, z: 0 }, 3));
  assert.equal(net.size, 36);
  // Feet positions: a guest standing on the path at x = 2 is at y = 1.
  assert.deepEqual(R.nearestNode(net, { x: 2, y: 1, z: 0 }), { x: 2, y: 0, z: 0, d: 0 });
  assert.deepEqual(R.nearestNode(net, { x: 29, y: 1, z: 2 }, 2), { x: 29, y: 0, z: 0, d: 4 }, "a spot two blocks off the path still finds it");
  assert.equal(R.nearestNode(net, { x: 29, y: 1, z: 3 }, 2), undefined, "three blocks off: not on the network");
  assert.equal(R.nearestNode(net, { x: 15, y: 1, z: 0 }, 2), undefined, "under the bridge isn't on it (the deck is two above the feet)");
  const route = R.routeBetween(net, { x: 2, y: 0, z: 0 }, { x: 29, y: 0, z: 0 });
  assert.ok(route, "a way across the bridge");
  assert.equal(route.length, 28);
  assert.deepEqual(route[0], { x: 2, y: 0, z: 0 });
  assert.deepEqual(route[9], { x: 11, y: 1, z: 0 }, "up the first stair");
  assert.deepEqual(route[10], { x: 12, y: 2, z: 0 });
  assert.deepEqual(route[27], { x: 29, y: 0, z: 0 });
  assert.equal(R.routeBetween(net, { x: 2, y: 0, z: 0 }, { x: 40, y: 0, z: 0 }), undefined, "not on the network");
  const wps = R.waypoints(route);
  assert.deepEqual(
    wps.map((n) => [n.x, n.y]),
    [
      [2, 0],
      [10, 0],
      [11, 1],
      [12, 2],
      [20, 2],
      [21, 1],
      [22, 0],
      [29, 0],
    ],
    "corners: the flat runs in one go, every step kept",
  );
  const side = R.routeBetween(net, { x: 2, y: 0, z: 0 }, { x: 5, y: 0, z: 5 });
  assert.deepEqual(R.waypoints(side).map((n) => [n.x, n.z]), [[2, 0], [5, 0], [5, 5]], "a turn is a waypoint");
  // Feet on top of the blocks; a bottom slab is half a block lower.
  assert.deepEqual(R.feetAt({ x: 3, y: 0, z: 0 }), { x: 3.5, y: 1, z: 0.5 });
  assert.deepEqual(R.feetAt({ x: 3, y: 0, z: 0 }, () => 0.5), { x: 3.5, y: 0.5, z: 0.5 });
  // Walking a step: toward the target, facing it, climbing in a straight ramp.
  const a = R.walkStep({ x: 10.5, y: 1, z: 0.5 }, { x: 11.5, y: 2, z: 0.5 }, 0.25);
  assert.deepEqual([a.x, a.y, a.z, a.arrived], [10.75, 1.25, 0.5, false]);
  assert.equal(a.yaw, -90, "east is yaw -90");
  assert.equal(R.walkStep({ x: 0.5, y: 1, z: 0.5 }, { x: 0.5, y: 1, z: 3.5 }, 0.25).yaw, 0, "south is yaw 0");
  const b = R.walkStep({ x: 11.4, y: 1.9, z: 0.5 }, { x: 11.5, y: 2, z: 0.5 }, 0.25);
  assert.deepEqual([b.x, b.y, b.arrived], [11.5, 2, true], "snaps onto the target when within a step");
  assert.equal(R.routeTicks(route, 0.11), Math.ceil(27 / 0.11));
  // Far spots are favoured, spots already visited come last.
  const spots = [
    { id: "near", x: 3, y: 1, z: 0 },
    { id: "far", x: 29, y: 1, z: 0 },
  ];
  assert.equal(R.pickDestination(spots, { x: 2, y: 1, z: 0 }, new Set(), () => 0.2).id, "near", "weights 1 and 3.4: the first fifth lands on the near one");
  assert.equal(R.pickDestination(spots, { x: 2, y: 1, z: 0 }, new Set(), () => 0.5).id, "far");
  assert.equal(R.pickDestination(spots, { x: 2, y: 1, z: 0 }, new Set(["far"]), () => 0.99).id, "near", "unvisited first");
  assert.equal(R.pickDestination(spots, { x: 2, y: 1, z: 0 }, new Set(["far", "near"]), () => 0.9).id, "far", "all seen: any of them");
  assert.equal(R.pickDestination([], { x: 0, y: 0, z: 0 }, new Set()), undefined);
  // Wiring: the entity, its walk animation and the loop.
  const read2 = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const guest = JSON.parse(read2("../packs/BP/entities/guest.json"))["minecraft:entity"];
  assert.deepEqual(guest.description.properties["zoocraft:walking"], { type: "bool", default: false, client_sync: true });
  assert.ok(guest.component_groups["zoocraft:travelling"] && !guest.component_groups["zoocraft:travelling"]["minecraft:behavior.move_to_block"], "no mob goal fights the script while travelling");
  assert.deepEqual(guest.events["zoocraft:travel"].add.component_groups, ["zoocraft:travelling"]);
  for (const ev of ["zoocraft:stroll", "zoocraft:watch", "zoocraft:leave"]) assert.ok(guest.events[ev].remove.component_groups.includes("zoocraft:travelling"), ev);
  assert.ok(guest.components["minecraft:preferred_path"].preferred_path_blocks[0].blocks.includes("end_bricks"));
  const anim = read2("../packs/RP/animations/guest.animation.json");
  assert.equal((anim.match(/query\.property\('zoocraft:walking'\)/g) ?? []).length, 4, "both legs and arms swing while the script walks");
  assert.match(read2("../packs/BP/scripts/main.js"), /loop\("journeys", 1, \d+, tickJourneys\)/);
  const guests = read2("../packs/BP/scripts/visitors/guests.js");
  assert.match(guests, /export function tickJourneys/);
  assert.match(guests, /e\.teleport\(\{ x: next\.x, y: next\.y, z: next\.z \}, \{ rotation: \{ x: 0, y: next\.yaw \}, keepVelocity: false \}\)/);
  assert.match(guests, /startTravel\(s, path, "leave", undefined\)/, "leaving guests walk the network back to the gate");
  assert.match(read2("../packs/BP/scripts/visitors/network.js"), /export function currentNetwork/);
  const g = BALANCE.guests;
  assert.ok(g.walkSpeed > 0 && g.walkSpeed < 0.3 && g.tripRange >= 64 && g.tripAfterSeconds[0] < g.tripAfterSeconds[1]);
});

// ---------- 0.1.64: the 500-block park ----------

test("The 500-block park: the boundary grows, the path walk remembers unloaded ground and says where it stopped, the route search is a job, and guests walk on out of sight", async () => {
  const { boundaryRadius } = await import("../packs/BP/scripts/park/rules.js");
  const R = await import("../packs/BP/scripts/visitors/routes.js");
  const P = await import("../packs/BP/scripts/visitors/paths.js");
  assert.equal(BALANCE.park.radius, 500, "Austin: scan within 500 blocks");
  assert.equal(boundaryRadius(128, BALANCE), 500, "a park founded at 128 grows with the balance");
  assert.equal(boundaryRadius(undefined, BALANCE), 500);
  assert.equal(boundaryRadius(800, BALANCE), 800, "a saved radius is a floor, never a cut");
  assert.ok(BALANCE.conservation.minDistance > BALANCE.park.radius, "the wild starts past the boundary");
  assert.ok(BALANCE.paths.maxNodes >= 20000 && BALANCE.paths.frontierRange > 0 && BALANCE.guests.tripRange >= 1000 && BALANCE.guests.maxGhosts >= 1 && BALANCE.guests.searchPerTick >= 50);
  // Memory: a path at y 0 from x 0 to 20; the ground past x 10 is unloaded. The first walk stops
  // there and names the spot; given a network that knew the far part, the next walk carries on.
  const path = new Set();
  for (let x = 0; x <= 20; x++) path.add(`${x},0,0`);
  const read = (x, y, z) => (path.has(`${x},${y},${z}`) ? "path" : "other");
  const half = (x, y, z) => (x > 10 ? "unloaded" : read(x, y, z));
  const starts = entranceStarts(read, { x: -2, y: 1, z: 0 }, 3);
  const first = walk(half, starts);
  assert.equal(first.size, 11);
  assert.deepEqual(first.unloadedAt, { x: 11, y: 0, z: 0 }, "the first unloaded block it had to stop at");
  assert.equal(first.remembered, 0);
  assert.ok(first.incomplete.has("10,0,0") && !first.incomplete.has("9,0,0"), "only the node at the unloaded edge is incomplete");
  const prior = walk(read, starts);
  assert.equal(prior.size, 21);
  assert.equal(prior.unloadedAt, undefined);
  assert.equal(prior.incomplete.size, 0);
  assert.ok(P.isComplete(prior, 15, 0, 0) && !P.isComplete(prior, 15, 1, 0));
  const remembered = new Set();
  const again = walk(P.rememberingReader(half, prior, remembered), starts);
  assert.equal(again.size, 21, "the unloaded half came from memory");
  assert.equal(again.unloadedAt, undefined, "the ground round a remembered complete node was looked at last time");
  assert.equal(again.incomplete.size, 0);
  assert.equal(remembered.size, 10);
  assert.equal(P.rememberingReader(half, undefined)(15, 0, 0), "unloaded", "nothing to remember");
  assert.equal(P.rememberingReader(half, prior)(5, 0, 0), "path", "loaded ground is read for real");
  assert.equal(P.rememberingReader(half, prior)(15, 1, 0), "unloaded", "asked from nowhere: unknown");
  assert.equal(P.rememberingReader(half, prior)(15, 1, 0, { x: 15, y: 0, z: 0 }), "other", "asked from a complete node: it was not path last time");
  assert.equal(P.rememberingReader(half, first)(11, 0, 0, { x: 10, y: 0, z: 0 }), "unloaded", "asked from an incomplete node: still unknown");
  // A changed block forgets the remembered path blocks it touches, so a gap is never walked through from memory.
  assert.equal(P.forgetColumn(prior, 15, 0, -2, 0), 1);
  assert.equal(prior.size, 20);
  assert.equal(P.hasPath(prior, 15, 0, 0), false);
  assert.equal(P.forgetColumn(prior, 15, 0, -2, 0), 0, "nothing left there");
  assert.equal(walk(P.rememberingReader(half, prior), starts).size, 15, "the walk stops at the forgotten block");
  // Saved and read back, column by column, the same network; the hash tells a change.
  const cols = [...P.columnsOf(prior, 4)].flat();
  assert.equal(cols.length, 20);
  assert.ok(cols.includes("3,0:0"));
  const back = P.columnsInto(P.newNetwork(), cols);
  assert.equal(back.size, 20);
  assert.deepEqual([...back.columns.keys()].sort(), [...prior.columns.keys()].sort());
  const edge = P.columnsInto(P.newNetwork(), [...P.columnsOf(first)].flat());
  assert.ok(edge.incomplete.has("10,0,0") && edge.incomplete.size === 1, "an incomplete node comes back incomplete");
  assert.ok([...P.columnsOf(first)].flat().includes("10,0:0?"));
  assert.equal(P.columnsHash(cols), P.columnsHash([...cols]));
  assert.notEqual(P.columnsHash(cols), P.columnsHash(cols.slice(1)));
  assert.equal(P.columnsInto(P.newNetwork(), ["bad", "1,2:x", ":3"]).size, 0, "junk is skipped");
  // The route search yields along the way and finds the same route as the one-go search.
  const net = walk(read, starts);
  const from = { x: 0, y: 0, z: 0 };
  const to = { x: 20, y: 0, z: 0 };
  const whole = R.routeBetween(net, from, to);
  assert.equal(whole.length, 21);
  const job = R.routeSearch(net, from, to, 6000, 5);
  let yields = 0;
  let r = job.next();
  while (!r.done) {
    yields++;
    r = job.next();
  }
  assert.deepEqual(r.value, whole);
  assert.ok(yields >= 3, `a 21-node search at 5 a tick yields a few times (${yields})`);
  assert.equal(R.routeBetween(net, from, to, 10), undefined, "the limit still holds");
  // Wiring: ghosts, the saved network, the menu's words.
  const read2 = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const guests = read2("../packs/BP/scripts/visitors/guests.js");
  for (const fn of ["function toGhost(s)", "function materialize(s)", "function entityOf(s)", "routeSearch(net, from, toNode, BALANCE.paths.maxNodes, BALANCE.guests.searchPerTick)", "ghostCount() < g.maxGhosts", "presentCount() >= visibleGuests(demand, BALANCE)"]) assert.ok(guests.includes(fn), fn);
  assert.match(guests, /e\.triggerEvent\(`zoocraft:\$\{s\.mode\}`\)/, "a ghost gets its entity back in the mode it is in");
  const network = read2("../packs/BP/scripts/visitors/network.js");
  for (const fn of ['db.put("paths", { id: NET_ID', 'db.get("paths", NET_ID)', "rememberingReader(pathReader(d), prior, remembered)", "forgetColumn(current.net, pos.x, pos.z, pos.y - 2, pos.y)", "BALANCE.paths.frontierRange", "const radius = parkRadius(park);"]) assert.ok(network.includes(fn), fn);
  assert.match(read2("../packs/BP/scripts/park/park.js"), /const radius = parkRadius\(park\);\n  return dx \* dx \+ dz \* dz <= radius \* radius;/);
  const menu = read2("../packs/BP/scripts/ui/parkMenu.js");
  assert.ok(menu.includes("remembered from earlier visits") && menu.includes("unchecked ground at ${net.unloadedAt.x}, ${net.unloadedAt.z}"));
  assert.ok(read2("../packs/BP/scripts/visitors/paths.js").includes("net.unloadedAt ??= { x, y, z };"));
});

// ---------- 0.1.61: mixed-species exhibits ----------

test("Mixed-species exhibits: communities say who shares, a shared exhibit needs a quarter more room, and every module follows", async () => {
  const M = await import("../packs/BP/scripts/exhibits/mixing.js");
  const { SPECIES } = await import("../packs/BP/scripts/data/species.js");
  const { HABITAT_PROFILES } = await import("../packs/BP/scripts/data/profiles.js");
  // Every community member is a real species, and nobody flying or in lava shares.
  for (const c of Object.values(M.COMMUNITIES)) for (const id of c.members) assert.ok(SPECIES[id], id);
  for (const id of ["zoocraft:penguin", "zoocraft:lava_ray", "zoocraft:zoo_strider", "zoocraft:void_ray"]) assert.deepEqual(M.companions(id, SPECIES), [], id);
  assert.deepEqual(M.communitiesOf("zoocraft:capybara"), ["meadow", "wetland"]);
  assert.deepEqual(M.companions("zoocraft:capybara", SPECIES), ["zoocraft:zoo_rabbit", "zoocraft:otter", "zoocraft:deer"], "catalogue order");
  assert.ok(M.canShare("zoocraft:zoo_rabbit", "zoocraft:deer") && M.canShare("zoocraft:deer", "zoocraft:zoo_rabbit"), "symmetric");
  assert.ok(M.canShare("zoocraft:otter", "zoocraft:otter"), "a species always shares with itself");
  assert.ok(!M.canShare("zoocraft:otter", "zoocraft:deer"), "a capybara shares with both, but they don't share with each other");
  assert.ok(M.canShare("zoocraft:basalt_tortoise", "zoocraft:ember_fox") && M.canShare("zoocraft:chorus_deer", "zoocraft:rift_ferret"));
  // Why a release is refused, in the players' words.
  assert.equal(M.mixProblem([], SPECIES["zoocraft:deer"], SPECIES), undefined);
  assert.equal(M.mixProblem(["zoocraft:zoo_rabbit"], SPECIES["zoocraft:deer"], SPECIES), undefined);
  assert.equal(M.mixProblem(["zoocraft:zoo_rabbit", "zoocraft:capybara"], SPECIES["zoocraft:deer"], SPECIES), undefined, "shares with everyone already there");
  assert.equal(M.mixProblem(["zoocraft:otter", "zoocraft:capybara"], SPECIES["zoocraft:deer"], SPECIES), "Deer don't share an exhibit with Otters. Deer share with: Rabbits, Capybaras.");
  assert.equal(M.mixProblem(["zoocraft:deer"], SPECIES["zoocraft:penguin"], SPECIES), "Penguins don't share an exhibit with Deer. Penguins keep an exhibit of their own.");
  assert.equal(M.mixProblem([undefined], SPECIES["zoocraft:penguin"], SPECIES), undefined, "an empty exhibit's undefined lead is ignored");
  assert.equal(M.companyText(SPECIES["zoocraft:capybara"], SPECIES), "Shares an exhibit with: Rabbits, Otters, Deer (Meadow, Wetland)");
  assert.equal(M.companyText(SPECIES["zoocraft:lava_ray"], SPECIES), "Keeps an exhibit of its own");
  // Space: the biggest resident's profile for everyone, times the factor.
  assert.equal(M.widestProfile([SPECIES["zoocraft:zoo_rabbit"], SPECIES["zoocraft:deer"]], HABITAT_PROFILES), HABITAT_PROFILES.medium_terrestrial);
  assert.equal(M.widestProfile([SPECIES["zoocraft:capybara"], SPECIES["zoocraft:otter"]], HABITAT_PROFILES), HABITAT_PROFILES.medium_wetland, "the pool rules of the bigger wetland apply");
  assert.equal(M.widestProfile([], HABITAT_PROFILES), undefined);
  assert.equal(BALANCE.mixing.spaceFactor, 1.25, "a quarter more room, as the clipboard and journal say");
  assert.equal(M.spaceFactor(1, BALANCE), 1);
  assert.equal(M.spaceFactor(2, BALANCE), 1.25);
  assert.equal(Math.ceil((100 + 30) * M.spaceFactor(2, BALANCE)), 163, "a rabbit and a deer: 163 usable blocks");
  // Wiring: the exhibit, the care loop, the keepers, breeding, releases, the rating and the pages.
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const ex = read("../packs/BP/scripts/exhibits/exhibits.js");
  assert.match(ex, /export function speciesIn\(ex\)/);
  assert.match(ex, /mixProblem\(speciesIn\(ex\)\.map\(\(sp\) => sp\.id\), species, SPECIES\)/, "fitFor checks sharing first");
  assert.match(ex, /requiredArea\(profile, Math\.max\(1, spaceWeight\(ex\) \+ extra\)\) \* spaceFactor\(kinds\.size, BALANCE\)/);
  assert.match(ex, /for \(const sp of speciesIn\(ex\)\) \{\n    const problem = habitatProblem\(ex, HABITAT_PROFILES\[sp\.habitatProfile\], sp\.displayName\);/, "every resident species gets its habitat check");
  assert.match(ex, /ex\.mudCells = anyWants\(ex, "mud"\)/);
  assert.match(ex, /ex\.speciesIds = ids;/);
  const an = read("../packs/BP/scripts/animals/animals.js");
  assert.match(an, /export function speciesGroups\(animals\)/);
  assert.match(an, /for \(const \{ species, animals \} of groups\) \{\n      \/\/ Only troughs holding what this species drinks/);
  assert.match(an, /const spaceRatio = cap\.usable \/ cap\.required;/);
  assert.match(an, /export function causesFor\(ex, speciesId\)/);
  assert.match(read("../packs/BP/scripts/staff/staff.js"), /for \(const \{ species, animals \} of speciesGroups\(animalsIn\(ex\)\)\)/);
  assert.match(read("../packs/BP/scripts/animals/nursery.js"), /const group = animalsIn\(ex\)\.filter\(\(a\) => !species \|\| a\.speciesId === species\.id\);[^]*animals: group,/);
  const car = read("../packs/BP/scripts/transport/carriers.js");
  assert.match(car, /const sharing = mixProblem\(ex\.speciesIds \?\? \(ex\.speciesId \? \[ex\.speciesId\] : \[\]\), species, SPECIES\);/);
  assert.match(car, /noRoomReason\(allExhibits\(\), species, \(ex\) => fitFor\(ex, species\), \(ex\) => !mixProblem/);
  assert.match(read("../packs/BP/scripts/visitors/visitors.js"), /new Set\(occupied\.flatMap\(speciesOn\)\)\.size/, "every species on show counts for the rating");
  assert.match(read("../packs/BP/scripts/visitors/services.js"), /for \(const id of ex\.speciesIds \?\? \[ex\.speciesId\]\) species\.add\(id\)/);
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /shared: a quarter more room/);
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /causesFor\(ex, a\.speciesId\)/);
  assert.match(read("../packs/BP/scripts/ui/fieldJournal.js"), /companyText\(sp, SPECIES\)/);
});

// ---------- 0.1.62: the nocturnal house and the Hedgehog ----------

test("Nocturnal house rules: a fully enclosed, dim building turns a hedgehog's clock round, and the clipboard says why not", async () => {
  const N = await import("../packs/BP/scripts/animals/nightRules.js");
  assert.equal(N.sleepNow(false, false), true, "by day, outside a nocturnal house: asleep");
  assert.equal(N.sleepNow(true, false), false, "at night: up");
  assert.equal(N.sleepNow(false, true), false, "in a nocturnal house by day: up");
  assert.equal(N.sleepNow(true, true), true, "in a nocturnal house at night: asleep");
  // The measurement is the game's own light on every floor block: sky light (daylight) and light level.
  const r = (sky, light, n = 1) => Array.from({ length: n }, () => ({ sky, light }));
  const dark = N.houseFromReadings([...r(0, 5, 40), ...r(0, 0, 8)], BALANCE);
  assert.deepEqual(dark, { cells: 48, daylit: 0, bright: 0, lit: 40, brightest: 5 });
  assert.equal(N.isNocturnalHouse({ house: dark }, BALANCE), true, "enclosed and dim: a nocturnal house");
  assert.equal(N.isNocturnalHouse({}, BALANCE), false, "not measured for light yet");
  assert.equal(N.isNocturnalHouse({ house: N.houseFromReadings([], BALANCE) }, BALANCE), false, "nothing measured");
  const leaky = N.houseFromReadings([...r(0, 4, 40), ...r(12, 15, 3)], BALANCE);
  assert.equal(N.isNocturnalHouse({ house: leaky }, BALANCE), false, "daylight gets in");
  assert.match(N.nocturnalLine({ house: leaky }, "Hedgehogs", BALANCE), /no: daylight reaches 3 of 43 blocks.*doors shut.*too bright on 3 blocks, brightest 15 of 7 allowed.*sleep by day/);
  const torch = N.houseFromReadings([...r(0, 6, 20), ...r(0, 14, 2)], BALANCE);
  assert.equal(N.isNocturnalHouse({ house: torch }, BALANCE), false, "a torch inside is too bright");
  assert.match(N.nocturnalLine({ house: torch }, "Hedgehogs", BALANCE), /^(?!.*daylight).*too bright on 2 blocks, brightest 14 of 7 allowed.*Nocturnal Lamps only/);
  assert.match(N.nocturnalLine({ house: dark }, "Hedgehogs", BALANCE), /yes.*no daylight, brightest spot 5 of 7 allowed; 40 of 48 blocks in lamplight.*hedgehogs are up by day.*8 blocks are pitch dark/);
  assert.doesNotMatch(N.nocturnalLine({ house: N.houseFromReadings(r(0, 7, 30), BALANCE) }, "Hedgehogs", BALANCE), /pitch dark/, "lit everywhere");
  assert.match(N.nocturnalLine({}, "Hedgehogs", BALANCE), /no: not measured yet/);
  assert.match(N.stateText(true, false, false), /asleep for the day/);
  assert.match(N.stateText(true, false, true), /asleep for the night/);
  assert.match(N.stateText(false, true, false), /curled into a ball/);
  assert.match(N.stateText(false, false, false), /awake and foraging/);
});

test("Hedgehog: nocturnal, a Burrow Shelter for a den, Insect Rations from the hatchery, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, BLOCKS, FOOD_LOOK, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const { hasDen, denType, serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { PASSABLE_PATTERNS } = await import("../packs/BP/scripts/data/blocks.js");
  const { canShare, companyText } = await import("../packs/BP/scripts/exhibits/mixing.js");
  const hog = SPECIES["zoocraft:hedgehog"];
  assert.equal(speciesForWild("zoocraft:wild_hedgehog"), hog);
  assert.equal(hog.origin, "custom_overworld");
  assert.equal(hog.homeDimension, "minecraft:overworld");
  assert.equal(pluralOf(hog), "Hedgehogs");
  assert.equal(hog.habitatProfile, "small_terrestrial");
  assert.equal(hog.carrierProfile, "small");
  assert.equal(RATIONS[hog.baitItem].diet, "insect");
  assert.equal(hog.baitItem, ITEMS.insectRation);
  assert.equal(FOOD_LOOK.insect, 7);
  assert.ok(hog.nocturnal === true && hog.den === "burrow");
  assert.deepEqual(hog.coats, ["Brown", "Blonde"]);
  // The den: a Burrow Shelter, not an Ember Den (and the other way round for Ember Foxes).
  assert.equal(denType(hog), "burrow");
  assert.equal(denType(SPECIES["zoocraft:ember_fox"]), "den");
  assert.equal(hasDen(hog, [{ type: "den" }]), false);
  assert.equal(hasDen(hog, [{ type: "burrow" }]), true);
  assert.equal(hasDen(SPECIES["zoocraft:ember_fox"], [{ type: "burrow" }]), false);
  assert.equal(hasDen(SPECIES["zoocraft:zoo_rabbit"], []), true, "no den needed");
  assert.ok(PASSABLE_PATTERNS.some((r) => r.test(BLOCKS.burrow)), "no collision: its cell is still floor");
  const cells = new Map([["0,0,0", "land"]]);
  assert.equal(serves("burrow", cells, { x: 0, y: 0, z: 0 }), true, "a burrow stands on the floor");
  assert.equal(serves("burrow", cells, { x: 0, y: 1, z: 0 }), false);
  assert.equal(adviceFor("comfort", hog, ["den"]), "Give the animals a Burrow Shelter");
  assert.equal(adviceFor("comfort", SPECIES["zoocraft:ember_fox"], ["den"]), "Give the animals an Ember Den");
  assert.deepEqual(comfortCauses({ spaceRatio: 2, den: false }, BALANCE), ["den"]);
  // Field Journal: spot, forage (awake and about), curl (startled into a ball).
  assert.deepEqual(hog.observe, ["spot", "forage", "curl"]);
  assert.deepEqual(tasksSeen(hog, ["spot"], { awake: true, onGround: true, inWater: false, still: false, curled: false }), ["forage"]);
  assert.deepEqual(tasksSeen(hog, ["spot"], { awake: false, onGround: true, inWater: false, still: true, curled: false }), [], "asleep: nothing to watch");
  assert.deepEqual(tasksSeen(hog, ["spot", "forage"], { awake: true, onGround: true, inWater: false, still: true, curled: true }), ["curl"]);
  assert.equal(levelOf(hog, ["spot", "forage", "curl"]), 3);
  // Sharing: hedgehogs and rabbits share a hedgerow; nothing else.
  assert.ok(canShare("zoocraft:zoo_rabbit", "zoocraft:hedgehog") && !canShare("zoocraft:hedgehog", "zoocraft:deer"));
  assert.equal(companyText(hog, SPECIES), "Shares an exhibit with: Rabbits (Hedgerow)");
  const N = BALANCE.nocturnal;
  assert.ok(N.maxLight >= 4 && N.maxLight < 14 && N.startleRange > 0 && N.startleTicks > 0, "dim lamps pass, torches (14) don't");
  assert.ok(BALANCE.hatchery.batches >= 1 && BALANCE.hatchery.rationsPerBatch >= 1);
  assert.ok(BALANCE.shop["zoocraft:insect_ration"], "the park shop sells them too");
  // Wiring: the night loop, the hatchery component, the roof measurement, discovery, fixtures, text.
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  assert.match(read("../packs/BP/scripts/main.js"), /loop\("night", 10, \d+, \(\) => tickNight\(system\.currentTick\)\)/);
  assert.match(read("../packs/BP/scripts/main.js"), /blocks\.registerCustomComponent\("zoocraft:hatchery", hatcheryComponent\(\)\)/);
  assert.match(read("../packs/BP/scripts/platform/mc.js"), /export function isNight/);
  const night = read("../packs/BP/scripts/animals/night.js");
  assert.match(night, /families: \["hedgehog"\]/);
  assert.match(night, /setProp\(hog, "zoocraft:asleep", asleep\)/);
  assert.match(night, /hog\.triggerEvent\(still \? "zoocraft:still" : "zoocraft:move"\)/);
  assert.match(read("../packs/BP/scripts/exhibits/exhibits.js"), /yield\* measureHouse\(dim\(ex\.dimension\), out, BALANCE\)/, "the light is read after the walk");
  assert.match(read("../packs/BP/scripts/exhibits/exhibits.js"), /ex\.house = anyWants\(ex, "nocturnal"\) \? r\.house : undefined/);
  assert.match(read("../packs/BP/scripts/exhibits/light.js"), /getSkyLightLevel\(\)/);
  assert.doesNotMatch(read("../packs/BP/scripts/exhibits/geometry.js"), /roofScan/, "the roof scan went with 0.1.63");
  assert.match(read("../packs/BP/scripts/discovery/discovery.js"), /\.\.\.nightSight\(species, hit\)/);
  assert.match(read("../packs/BP/scripts/equipment/fixtures.js"), /\[BLOCKS\.burrow\]: "burrow"/);
  assert.match(read("../packs/BP/scripts/equipment/hatchery.js"), /onTick\(e\)/);
  assert.match(read("../packs/BP/scripts/animals/animals.js"), /place a Burrow Shelter on the exhibit floor/);
  assert.match(read("../packs/BP/scripts/ui/fieldJournal.js"), /Nocturnal: asleep by day and up at night/);
  assert.match(read("../packs/BP/scripts/visitors/points.js"), /if \(entityAsleep\(e\) \|\| hiddenInTheDark\(e\)\) continue;/, "a sleeping animal, or one in pitch dark, isn't on show");
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /nocturnalLine\(ex, pluralOf\(nocturnal\), BALANCE\)/);
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /Hedgehogs travel in a Small Carrier/);
});

test("Hedgehog, Burrow Shelter and Insect Hatchery files: a hedgehog in two coats and a hoglet's, big enough to see its face and legs, with curl and sleep poses, a walk-in burrow, a hatchery that grows rations, the insect feeder look and names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const name of ["hedgehog", "wild_hedgehog"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.equal(e.description.identifier, `zoocraft:${name}`);
    for (const k of ["asleep", "curled"]) assert.deepEqual(e.description.properties[`zoocraft:${k}`], { type: "bool", default: false, client_sync: true }, k);
    assert.deepEqual(e.components["minecraft:behavior.tempt"].items, ["zoocraft:insect_ration"]);
    assert.ok(e.components["minecraft:type_family"].family.includes("hedgehog"));
    assert.deepEqual(e.component_groups["zoocraft:still"], { "minecraft:movement": { value: 0 } }, "held still asleep or curled");
    assert.ok(e.events["zoocraft:still"] && e.events["zoocraft:move"]);
    assert.deepEqual(e.components["minecraft:collision_box"], { width: 0.6, height: 0.45 });
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(d.textures.blonde, "textures/entity/zoocraft/hedgehog_blonde");
    assert.equal(d.textures.hoglet, "textures/entity/zoocraft/hedgehog_hoglet");
    for (const a of ["walk", "idle", "curl", "sleep", "look_at_target", "move"]) assert.ok(d.animations[a], a);
    assert.match(d.scripts.scale, /0\.5/);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${name}\\.name=`, "m"));
  }
  const zoo = read("../packs/BP/entities/hedgehog.json")["minecraft:entity"];
  assert.deepEqual(zoo.components["minecraft:behavior.move_to_block"].target_blocks, ["zoocraft:burrow_shelter"]);
  assert.ok(zoo.components["minecraft:persistent"] && zoo.component_groups["zoocraft:juvenile"]);
  const wild = read("../packs/BP/entities/wild_hedgehog.json")["minecraft:entity"];
  assert.ok(wild.components["minecraft:despawn"]);
  assert.deepEqual(wild.events["minecraft:entity_spawned"].randomize.map((r) => r.weight), [3, 1], "three Brown to one Blonde");
  // Every bone the hedgehog's animations move is in its model (build.cmd's validate stops on a missing one).
  const geoBones = new Set(read("../packs/RP/models/entity/hedgehog.geo.json")["minecraft:geometry"][0].bones.map((b) => b.name));
  for (const [name, anim] of Object.entries(read("../packs/RP/animations/hedgehog.animation.json").animations)) for (const bone of Object.keys(anim.bones)) assert.ok(geoBones.has(bone), `${name} moves ${bone}`);
  assert.ok(geoBones.has("tail"), "the tail is its own bone, so the animations can wag it");
  // 0.1.73 (Austin: "Hedgehog looks terrible. Cannot even see a face or legs, and its puny"): redrawn
  // bigger, with a face (the eyes painted on, a snout and nose of their own), legs that show under the
  // skirt, closed eyes while it sleeps, and a ball of spines that it peeks out of when it curls up.
  for (const b of ["body", "head", "snout", "lids", "earL", "earR", "leg0", "leg1", "leg2", "leg3", "ball", "peek"]) assert.ok(geoBones.has(b), b);
  const hgeo = read("../packs/RP/models/entity/hedgehog.geo.json")["minecraft:geometry"][0];
  const zs = hgeo.bones.filter((b) => !["ball", "peek"].includes(b.name)).flatMap((b) => (b.cubes ?? []).flatMap((c) => [c.origin[2], c.origin[2] + c.size[2]]));
  assert.ok(((Math.max(...zs) - Math.min(...zs)) * 0.5) / 16 >= 0.75, "at least 0.75 blocks nose to tail at its client scale (0.5)");
  const hrc = read("../packs/RP/render_controllers/hedgehog.render_controllers.json").render_controllers["controller.render.zoocraft.hedgehog"];
  assert.deepEqual(hrc.arrays.textures["Array.coats"], ["Texture.default", "Texture.blonde", "Texture.hoglet"]);
  assert.equal(hrc.textures[0], "Array.coats[query.is_baby ? 2 : query.variant]", "Brown or Blonde; a hoglet in its own soft coat");
  const hvis = Object.assign({}, ...hrc.part_visibility);
  const rolled = "query.property('zoocraft:curled') && !query.property('zoocraft:asleep')";
  assert.deepEqual([hvis.ball, hvis.peek, hvis.body, hvis.head, hvis.lids], [rolled, rolled, `!(${rolled})`, `!(${rolled})`, "query.property('zoocraft:asleep')"], "curled up: the ball instead; asleep: eyes shut");
  const skins = readdirSync(new URL("../packs/RP/textures/entity/zoocraft/", import.meta.url));
  for (const t of ["hedgehog", "hedgehog_blonde", "hedgehog_hoglet"]) assert.ok(skins.includes(`${t}.png`), t);
  const ctrl = read("../packs/RP/animation_controllers/hedgehog.animation_controllers.json").animation_controllers["controller.animation.zoocraft.hedgehog.move"];
  assert.ok(ctrl.states.sleep && ctrl.states.curl && JSON.stringify(ctrl).includes("query.property('zoocraft:asleep')"));
  const spawn = read("../packs/BP/spawn_rules/wild_hedgehog.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(spawn["minecraft:brightness_filter"], { min: 0, max: 7, adjust_for_weather: false }, "in the dark: at night");
  assert.deepEqual(spawn["minecraft:biome_filter"].any_of.map((t) => t.value), ["forest", "plains", "meadow"]);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const burrow = read("../packs/BP/blocks/burrow_shelter.json")["minecraft:block"];
  assert.equal(burrow.components["minecraft:collision_box"], false);
  assert.ok(burrow.components["zoocraft:fixture"]);
  for (const m of Object.values(burrow.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
  const hatch = read("../packs/BP/blocks/insect_hatchery.json")["minecraft:block"];
  assert.deepEqual(hatch.description.states["zoocraft:grown"], [0, 1, 2, 3]);
  assert.ok(hatch.components["zoocraft:hatchery"] && hatch.components["minecraft:tick"].looping);
  assert.equal(hatch.permutations.length, 3, "a look per grown batch");
  for (const p of hatch.permutations) for (const m of Object.values(p.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
  // Every block uses one render method for all its material instances (a content log error otherwise).
  for (const b of [burrow, hatch]) assert.equal(new Set(Object.values(b.components["minecraft:material_instances"]).map((m) => m.render_method)).size, 1);
  for (const r of ["zoocraft_burrow_shelter", "zoocraft_insect_hatchery"]) assert.ok(read(`../packs/BP/recipes/${r}.json`), r);
  assert.equal(read("../packs/BP/items/insect_ration.json")["minecraft:item"].description.identifier, "zoocraft:insect_ration");
  assert.ok(read("../packs/RP/textures/item_texture.json").texture_data["zoocraft:insect_ration"]);
  for (const k of ["item.zoocraft:insect_ration", "tile.zoocraft:burrow_shelter", "tile.zoocraft:insect_hatchery", "item.spawn_egg.entity.zoocraft:wild_hedgehog"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
  // Nocturnal Lamps (0.1.63): dim (their light is the house's limit), placed on any face, two lamps a craft.
  for (const colour of ["red", "purple"]) {
    const lamp = read(`../packs/BP/blocks/${colour}_night_lamp.json`)["minecraft:block"];
    assert.equal(lamp.components["minecraft:light_emission"], BALANCE.nocturnal.maxLight);
    assert.deepEqual(lamp.description.traits["minecraft:placement_position"].enabled_states, ["minecraft:block_face"]);
    assert.equal(lamp.permutations.length, 5, "every face but the floor turns the lamp onto it");
    for (const m of Object.values(lamp.components["minecraft:material_instances"])) assert.ok(terrain[m.texture], m.texture);
    assert.equal(new Set(Object.values(lamp.components["minecraft:material_instances"]).map((m) => m.render_method)).size, 1);
    assert.equal(read(`../packs/BP/recipes/zoocraft_${colour}_night_lamp.json`)["minecraft:recipe_shaped"].result.count, 2);
    assert.match(lang, new RegExp(`^tile\\.zoocraft:${colour}_night_lamp\\.name=`, "m"));
  }
  // Feeders and baskets have an insect look (zoocraft:food 7).
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  for (const fill of [1, 2]) assert.ok(feeder.permutations.some((p) => p.condition.includes(`fill') == ${fill}`) && p.condition.includes("food') == 7") && terrain[p.components["minecraft:material_instances"].up.texture]));
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.ok(basket.description.states["zoocraft:food"].includes(7));
  assert.ok(basket.permutations.some((p) => p.condition.includes("== 7") && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_insect"));
});

test("Guided tours: tickets sell by price and by how much the walk shows, never past the seats, and a walk is planned nearest first over the network", async () => {
  const T = await import("../packs/BP/scripts/visitors/tourRules.js");
  const R = await import("../packs/BP/scripts/visitors/routes.js");
  const t = BALANCE.tours;
  assert.equal(T.tourShare(t.fair, BALANCE), t.shareAtFair, "the fair price sells the fair share");
  assert.ok(T.tourShare(t.fair + 5, BALANCE) < t.shareAtFair, "dearer sells fewer");
  assert.ok(T.tourShare(t.fair - 3, BALANCE) > t.shareAtFair, "cheaper sells more");
  assert.equal(T.tourShare(1, BALANCE), Math.min(t.shareMax, t.shareAtFair + (t.fair - 1) * t.sharePerCoinUnder));
  assert.equal(T.tourShare(t.max, BALANCE), Math.max(0, t.shareAtFair - (t.max - t.fair) * t.sharePerCoinOver));
  assert.equal(T.stopsFactor(0, BALANCE), 0, "no stops, no tickets");
  assert.equal(T.stopsFactor(1, BALANCE), t.stopsBase + t.stopsPer);
  assert.equal(T.stopsFactor(t.maxStops, BALANCE), 1, "a full walk shows the whole park");
  // Sales: 100 guests at the fair price with a full walk buy 20 tickets; the seats cap them.
  let s = T.tourSales({ guests: 100, price: t.fair, stops: 6, seatsLeft: 48 }, BALANCE);
  assert.deepEqual(s, { sold: 20, revenue: 20 * t.fair, carry: 0 });
  s = T.tourSales({ guests: 100, price: t.fair, stops: 6, seatsLeft: 5 }, BALANCE);
  assert.deepEqual(s, { sold: 5, revenue: 5 * t.fair, carry: 0 }, "only the seats left, and the rest don't wait");
  s = T.tourSales({ guests: 3, price: t.fair, stops: 6, seatsLeft: 48, carry: 0.5 }, BALANCE);
  assert.equal(s.sold, 1, "3 guests x 0.2 + 0.5 carried = 1.1: one ticket");
  assert.ok(Math.abs(s.carry - 0.1) < 1e-9, "the fraction carries on");
  assert.deepEqual(T.tourSales({ guests: 100, price: t.fair, stops: 0, seatsLeft: 48 }, BALANCE), { sold: 0, revenue: 0, carry: 0 }, "no walk, nothing sold");
  assert.deepEqual(T.tourSales({ guests: 10, price: t.fair, stops: 6, seatsLeft: 0 }, BALANCE).sold, 0, "sold out");
  assert.equal(T.seatsPerDay(2, BALANCE), 2 * t.toursPerGuide * t.groupSize);
  assert.equal(T.seatsPerDay(0, BALANCE), 0);
  assert.equal(T.guideLimit(1, BALANCE), t.guidesPerDesk);
  assert.equal(T.guideLimit(10, BALANCE), t.maxGuides, "the park's cap");
  // Stops in walking order: nearest first from the desk, then nearest from the last one.
  const order = T.orderStops({ x: 0, z: 0 }, [{ x: 30, z: 0, n: "far" }, { x: 5, z: 0, n: "near" }, { x: 12, z: 0, n: "mid" }], 6);
  assert.deepEqual(order.map((o) => o.n), ["near", "mid", "far"]);
  assert.deepEqual(T.orderStops({ x: 0, z: 0 }, [{ x: 30, z: 0, n: "far" }, { x: 5, z: 0, n: "near" }], 1).map((o) => o.n), ["near"], "maxStops");
  // A plan over a small network: the desk at x = 0, stops at the end of the path and up the side path,
  // and one stop whose node is off the network (left out).
  const path = new Set();
  for (let x = 0; x <= 10; x++) path.add(`${x},0,0`);
  for (let z = 1; z <= 5; z++) path.add(`5,0,${z}`);
  const read = (x, y, z) => (path.has(`${x},${y},${z}`) ? "path" : "other");
  const net = walk(read, entranceStarts(read, { x: -2, y: 1, z: 0 }, 3));
  const desk = { x: 0, y: 0, z: 0 };
  const stops = [
    { name: "End", node: { x: 10, y: 0, z: 0 } },
    { name: "Side", node: { x: 5, y: 0, z: 5 } },
    { name: "Nowhere", node: { x: 40, y: 0, z: 0 } },
  ];
  const run = (gen) => {
    let r = gen.next();
    let yields = 0;
    while (!r.done) {
      yields++;
      r = gen.next();
    }
    return { value: r.value, yields };
  };
  const { value: plan, yields } = run(T.planTour(net, desk, stops, { perYield: 3 }));
  assert.ok(yields > 0, "planning is a job");
  assert.deepEqual(plan.stops.map((s) => s.name), ["End", "Side"], "the stop off the network is left out");
  assert.equal(plan.legs.length, 3, "two stops and the way home");
  assert.equal(plan.legs[0].to.name, "End");
  assert.deepEqual(plan.legs[0].path[0], { x: 0, y: 0, z: 0 });
  assert.deepEqual(plan.legs[0].path.at(-1), { x: 10, y: 0, z: 0 });
  assert.deepEqual(plan.legs[1].path.at(-1), { x: 5, y: 0, z: 5 }, "on from the last stop, not from the desk");
  assert.equal(plan.legs[2].to, undefined, "home");
  assert.deepEqual(plan.legs[2].path.at(-1), desk);
  assert.equal(plan.length, 10 + 10 + 10, "there, across and back");
  assert.equal(run(T.planTour(net, desk, [stops[2]])).value, undefined, "no stop reached: no plan");
  assert.equal(run(T.planTour(net, { x: 40, y: 0, z: 0 }, stops)).value, undefined, "a desk off the network has no walk");
  const short = run(T.planTour(net, desk, stops, { maxLength: 15 })).value;
  assert.deepEqual(short.stops.map((s) => s.name), ["End"], "a walk stops adding stops past maxLength");
  assert.equal(T.tourTicks(plan, 0.1, 160), 300 + 2 * 160, "walking at 0.1 a tick plus a talk at each stop");
  const feet = T.legFeet(plan.legs[0], (n) => R.feetAt(n));
  assert.deepEqual(feet, [{ x: 0.5, y: 1, z: 0.5 }, { x: 10.5, y: 1, z: 0.5 }], "a straight leg is two waypoints on top of the path");
  // What the guide says.
  const groups = [{ name: "deer", plural: "deer", n: 3 }, { name: "rabbit", plural: "rabbits", n: 1 }];
  assert.equal(T.guideLine(0, 3, "Meadow", groups, 80, "Plains, meadows and forest edges", BALANCE), "Our first stop, Meadow: three deer and one rabbit. They're thriving here. Their wild home: plains, meadows and forest edges.");
  assert.equal(T.guideLine(1, 3, "Pond", [{ name: "otter", plural: "otters", n: 2 }], 40, undefined, BALANCE), "Stop 2, Pond: two otters. They're settling in.");
  assert.equal(T.guideLine(2, 3, "Cave", [{ name: "hedgehog", plural: "hedgehogs", n: 1 }], 10, undefined, BALANCE), "Our last stop, Cave: one hedgehog. They need a little more care at the moment.");
  assert.equal(T.guideLine(0, 1, "Yard", [], 0, undefined, BALANCE), "Our first stop, Yard. Nobody's home just now, so let's walk on.");
  assert.match(T.routeText(undefined, 0.1, 160, []), /^No tour route yet/);
  assert.equal(T.routeText(plan, 0.1, 160, ["End", "Side"]), "2 stops (End, Side), 30 blocks there and back, about 31 s.");
});

test("Tour Desk and Tour Guide files: a desk that opens its menu only at the block, a guide in two looks with a flag, the loops, the ledger line and names", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const text = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const lang = text("../packs/RP/texts/en_US.lang");
  const b = read("../packs/BP/blocks/tour_desk.json")["minecraft:block"];
  assert.equal(b.description.identifier, "zoocraft:tour_desk");
  assert.deepEqual(b.description.traits["minecraft:placement_direction"].enabled_states, ["minecraft:cardinal_direction"], "faces the player like the booth");
  assert.equal(b.description.menu_category.category, "items");
  assert.deepEqual(b.components["zoocraft:tour_desk"], {}, "the custom component opens the menu");
  assert.equal(b.components["minecraft:geometry"].identifier ?? b.components["minecraft:geometry"], "geometry.zoocraft.tour_desk");
  assert.equal(b.components["minecraft:collision_box"][0].size[1], 11, "waist high: players walk to it and talk over it");
  assert.equal(b.permutations.length, 3, "the other three directions");
  for (const k of ["*", "top", "map", "flag", "post"]) assert.ok(b.components["minecraft:material_instances"][k], k);
  assert.equal(b.components["minecraft:material_instances"].flag.render_method, "opaque", "one render method for the whole block (0.1.67)");
  const geo = read("../packs/RP/models/blocks/tour_desk.geo.json")["minecraft:geometry"][0];
  assert.equal(geo.description.identifier, "geometry.zoocraft.tour_desk");
  assert.ok(geo.bones.reduce((n, bone) => n + (bone.cubes?.length ?? 0), 0) >= 6, "counter, top, post, map board, pole and pennant");
  const rec = read("../packs/BP/recipes/zoocraft_tour_desk.json")["minecraft:recipe_shaped"];
  assert.deepEqual(rec.pattern, ["PCP", "WRW", "WWW"]);
  assert.deepEqual(rec.tags, ["zoocraft_workshop"]);
  assert.equal(rec.key.C.item, "minecraft:compass");
  assert.equal(read("../packs/BP/loot_tables/blocks/zoocraft_tour_desk.json").pools[0].entries[0].name, "zoocraft:tour_desk");
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const k of ["zoocraft_tour_desk_side", "zoocraft_tour_desk_top", "zoocraft_tour_desk_map", "zoocraft_tour_desk_flag"]) assert.ok(terrain[k], k);
  assert.ok(read("../packs/RP/blocks.json")["zoocraft:tour_desk"]);
  assert.match(lang, /^tile\.zoocraft:tour_desk\.name=Tour Desk$/m);
  // The guide: a guest-shaped staff mob in two looks, told what to do by events, with a flag on the right arm.
  const e = read("../packs/BP/entities/tour_guide.json")["minecraft:entity"];
  assert.equal(e.description.identifier, "zoocraft:tour_guide");
  assert.equal(e.description.is_spawnable, false, "only the tours module places one");
  assert.deepEqual(e.description.properties["zoocraft:look"], { type: "int", range: [0, 1], default: 0, client_sync: true });
  assert.deepEqual(e.description.properties["zoocraft:walking"], { type: "bool", default: false, client_sync: true });
  for (const k of ["zoocraft:idle", "zoocraft:travel", "zoocraft:talk"]) assert.ok(e.component_groups[k] && e.events[k], k);
  const fam = e.components["minecraft:type_family"].family;
  assert.ok(fam.includes("zoocraft_staff") && fam.includes("zoocraft_guide"));
  assert.equal(e.components["minecraft:interact"].interactions[0].interact_text, "action.interact.zoocraft.talk", "use on the guide talks (main.js handles it)");
  assert.ok(!e.components["minecraft:behavior.random_stroll"], "the module walks the guide; the game never wanders it off its route");
  const d = read("../packs/RP/entity/tour_guide.entity.json")["minecraft:client_entity"].description;
  assert.equal(d.identifier, "zoocraft:tour_guide");
  assert.equal(d.textures.look0, "textures/entity/zoocraft/tour_guide_0");
  assert.equal(d.textures.look1, "textures/entity/zoocraft/tour_guide_1");
  assert.equal(d.geometry.default, "geometry.zoocraft.tour_guide");
  assert.equal(d.animations.flag, "animation.zoocraft.tour_guide.flag");
  assert.deepEqual(d.scripts.animate, ["walk", "look_at_target", "flag"]);
  const g = read("../packs/RP/models/entity/tour_guide.geo.json")["minecraft:geometry"][0];
  const flag = g.bones.find((bone) => bone.name === "flag");
  assert.equal(flag?.parent, "rightArm", "the flag is carried in the right hand");
  assert.ok(flag.cubes.length >= 2, "a pole and a pennant");
  assert.ok(read("../packs/RP/animations/tour_guide.animation.json").animations["animation.zoocraft.tour_guide.flag"].bones.flag, "the flag sways");
  for (const p of ["tour_guide_0", "tour_guide_1"]) assert.ok(readFileSync(new URL(`../packs/RP/textures/entity/zoocraft/${p}.png`, import.meta.url)).length > 100, p);
  assert.match(lang, /^entity\.zoocraft:tour_guide\.name=Tour Guide$/m);
  // Wiring: the desk's component and the guide's talk in main.js, the loops, ticket sales in the
  // visitor step, the ledger line, and the balance the menu quotes.
  const main = text("../packs/BP/scripts/main.js");
  assert.match(main, /registerCustomComponent\("zoocraft:tour_desk", tourDeskComponent\(tourMenu\)\)/);
  assert.match(main, /loop\("tours", 40, 21, tickTours\)/);
  assert.match(main, /loop\("tourwalk", 1, 8, tickTourWalk\)/);
  assert.match(main, /ENTITIES\.tourGuide[\s\S]*talkToGuide/);
  assert.match(main, /if \(!isTourGuest\(entity\.id\) && !isRideGuest\(entity\.id\)\) guestLoaded\(entity\)/, "a guest on a tour or a ray is not a wandering guest");
  assert.match(main, /BLOCKS\.tourDesk\) deskPlaced/);
  assert.match(text("../packs/BP/scripts/visitors/visitors.js"), /tourStep\(guests, stepKey\)/);
  assert.match(text("../packs/BP/scripts/ui/parkMenu.js"), /tourSummary\(\)/);
  const tours = text("../packs/BP/scripts/visitors/tours.js");
  assert.match(tours, /`tour:\$\{desk\.id\}:\$\{stepKey\}`/, "one earn per desk per visitor step");
  assert.match(tours, /pathsChanged/, "the walk is re-planned when the paths change");
  assert.match(text("../packs/BP/scripts/ui/tourMenu.js"), /Hire a Tour Guide/);
  assert.equal(validateData().length, 0);
  const t = BALANCE.tours;
  assert.ok(t.followers <= t.groupSize && t.maxStops >= 1 && t.walkSpeed > 0 && t.spawnRange > t.talkRange);
});

// ---------- 0.1.66: Void Ray changes (Austin's ideas 5 and 7): giant, tamed and ridden, the Expedition ----------

test("Void Ray Expedition: rides sell by price and seats, the loop climbs over every roof and lands back on the platform", async () => {
  const { rideShare, rideSales, rideSeatsPerDay, loopStops, planLoop, rideTicks, loopStep, loopText, stopLine } = await import("../packs/BP/scripts/visitors/rideRules.js");
  const { BALANCE } = await import("../packs/BP/scripts/data/balance.js");
  const r = BALANCE.ride;
  assert.equal(rideShare(r.fair, BALANCE), r.shareAtFair);
  assert.ok(rideShare(r.fair + 10, BALANCE) < r.shareAtFair && rideShare(r.fair - 5, BALANCE) > r.shareAtFair);
  assert.ok(rideShare(r.max, BALANCE) >= 0 && rideShare(r.min, BALANCE) <= r.shareMax);
  // 100 guests at the fair price: 15 want a ride; only 8 seats left today sells 8 and drops the rest.
  assert.deepEqual(rideSales({ guests: 100, price: r.fair, seatsLeft: 50 }, BALANCE), { sold: 15, revenue: 150, carry: 0 });
  assert.deepEqual(rideSales({ guests: 100, price: r.fair, seatsLeft: 8 }, BALANCE), { sold: 8, revenue: 80, carry: 0 });
  const part = rideSales({ guests: 3, price: r.fair, seatsLeft: 50 }, BALANCE);
  assert.equal(part.sold, 0);
  assert.ok(part.carry > 0.44 && part.carry < 0.46, "the fraction carries");
  assert.equal(rideSeatsPerDay(2, BALANCE), 2 * r.ridesPerDay * r.seats);
  // The loop: nearest first, far exhibits left out, never more than maxStops.
  const platform = { x: 0, y: 64, z: 0 };
  const stops = [
    { exhibitId: "a", name: "Aviary", x: 30, y: 64, z: 0, top: 80 },
    { exhibitId: "b", name: "Burrows", x: 10, y: 64, z: 5, top: 70 },
    { exhibitId: "c", name: "Cliffs", x: 500, y: 64, z: 0, top: 90 },
  ];
  assert.deepEqual(loopStops(platform, stops, BALANCE).map((s) => s.exhibitId), ["b", "a"]);
  const plan = planLoop(platform, stops, BALANCE);
  assert.equal(plan.stops, 2);
  assert.equal(plan.cruise, 80 + r.clearance, "over the highest roof with clearance");
  assert.deepEqual(plan.waypoints.map((w) => w.kind), ["climb", "stop", "stop", "return", "land"]);
  assert.ok(plan.waypoints.slice(0, 4).every((w) => w.y === plan.cruise), "level at cruise height");
  const last = plan.waypoints[plan.waypoints.length - 1];
  assert.deepEqual({ x: last.x, y: last.y, z: last.z }, plan.start, "lands where it took off");
  const low = planLoop(platform, [{ exhibitId: "b", name: "Burrows", x: 10, y: 64, z: 5, top: 66 }], BALANCE);
  assert.equal(low.cruise, 64 + r.minCruise, "never lower than minCruise over the platform");
  assert.equal(planLoop(platform, [], BALANCE), undefined);
  assert.ok(rideTicks(plan, BALANCE) > (2 * (plan.cruise - plan.start.y)) / r.climbSpeed, "climb, loop, hovers and boarding all take time");
  assert.match(loopText(plan, BALANCE), /2 exhibits \(Burrows, Aviary\) at \d+ blocks up, about \d+ s a ride/);
  assert.match(loopText(undefined, BALANCE), /No loop yet/);
  // Stepping along a leg: straight toward the waypoint, arriving within reach.
  let pos = { x: 0, y: 10, z: 0 };
  let n = 0;
  let step;
  do {
    step = loopStep(pos, { x: 10, y: 10, z: 0 }, 1, 0.5);
    pos = step;
    n++;
  } while (!step.arrived && n < 50);
  assert.equal(n, 10);
  assert.deepEqual([pos.x, pos.y, pos.z], [10, 10, 0]);
  assert.match(stopLine(0, 2, "Burrows", [{ name: "hedgehog", plural: "hedgehogs", n: 3 }]), /Over Burrows \(1 of 2\): 3 hedgehogs below/);
  assert.match(stopLine(1, 2, "Aviary", []), /no animals yet/);
  // Balance: the giant ray's room, and the mount and city numbers validate.
  const { HABITAT_PROFILES, AERIAL_HEIGHT } = await import("../packs/BP/scripts/data/profiles.js");
  assert.deepEqual(HABITAT_PROFILES.large_aerial, { baseArea: 400, extraArea: 120, minHeight: 14, aerial: true, minPerches: 2 });
  assert.equal(AERIAL_HEIGHT, 14);
  assert.ok(BALANCE.rays.mount.speed > 0 && BALANCE.rays.cities.perCity >= BALANCE.rays.cities.group[1]);
  assert.ok(r.skyClear >= r.minCruise);
});

test("Expedition Platform and giant ray files: seats on the zoo ray, taming and seats on the wild one, the platform block", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const zoo = read("../packs/BP/entities/void_ray.json")["minecraft:entity"];
  const ride = zoo.components["minecraft:rideable"];
  assert.equal(ride.seat_count, 4);
  assert.deepEqual(ride.family_types, ["player", "zoocraft_guest"]);
  assert.equal(ride.seats.length, 4);
  assert.equal(ride.controlling_seat, undefined, "nobody steers a zoo ray: the ride flies it");
  assert.deepEqual(zoo.component_groups["zoocraft:juvenile"]["minecraft:collision_box"], { width: 0.75, height: 0.25 });
  const wild = read("../packs/BP/entities/wild_void_ray.json")["minecraft:entity"];
  assert.equal(wild.components["minecraft:despawn"], undefined, "despawning belongs to the wild group");
  const tame = wild.component_groups["zoocraft:wild"]["minecraft:tameable"];
  assert.deepEqual(tame.tame_items, ["zoocraft:chorus_browse"]);
  assert.equal(tame.tame_event.event, "zoocraft:on_tame");
  const tamed = wild.component_groups["zoocraft:tamed"];
  assert.ok(tamed["minecraft:is_tamed"] && tamed["minecraft:persistent"]);
  assert.ok(tamed["minecraft:type_family"].family.includes("void_ray_mount") && !tamed["minecraft:type_family"].family.includes("void_ray"), "a mount is no longer a wild ray to the flight script or the carriers");
  assert.equal(tamed["minecraft:rideable"].controlling_seat, 0);
  assert.equal(tamed["minecraft:rideable"].seat_count, 2);
  assert.deepEqual(wild.events["zoocraft:on_tame"], { remove: { component_groups: ["zoocraft:wild"] }, add: { component_groups: ["zoocraft:tamed"] } });
  assert.deepEqual(wild.events["minecraft:entity_spawned"].add.component_groups, ["zoocraft:wild"]);
  assert.deepEqual(wild.events["minecraft:entity_spawned"].randomize.map((r) => r.weight), [3, 1]);
  // The platform: a deck with posts, lamps and a sign, light of its own, placed facing the player.
  const b = read("../packs/BP/blocks/expedition_platform.json")["minecraft:block"];
  assert.equal(b.description.identifier, "zoocraft:expedition_platform");
  assert.ok(b.components["zoocraft:expedition_platform"]);
  assert.equal(b.components["minecraft:light_emission"], 8);
  assert.equal(b.components["minecraft:collision_box"][0].size[1], 5, "a low deck to stand on");
  assert.deepEqual(Object.keys(b.components["minecraft:material_instances"]).sort(), ["*", "lamp", "post", "sign"]);
  assert.equal(b.permutations.length, 3);
  const geo = read("../packs/RP/models/blocks/expedition_platform.geo.json")["minecraft:geometry"][0];
  assert.equal(geo.description.identifier, "geometry.zoocraft.expedition_platform");
  assert.ok(geo.bones[0].cubes.length >= 14, "kept detailed");
  for (const png of ["platform_deck", "platform_post", "platform_lamp", "platform_sign"]) assert.ok(readFileSync(new URL(`../packs/RP/textures/blocks/zoocraft/${png}.png`, import.meta.url)).length > 100, png);
  const tt = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const name of ["platform_deck", "platform_post", "platform_lamp", "platform_sign"]) assert.equal(tt[`zoocraft_${name}`].textures, `textures/blocks/zoocraft/${name}`);
  assert.equal(read("../packs/RP/blocks.json")["zoocraft:expedition_platform"].sound, "stone");
  const recipe = read("../packs/BP/recipes/zoocraft_expedition_platform.json")["minecraft:recipe_shaped"];
  assert.deepEqual(recipe.tags, ["zoocraft_workshop"]);
  assert.equal(recipe.key.C.item, "zoocraft:chorus_browse");
  assert.equal(recipe.result.item, "zoocraft:expedition_platform");
  assert.equal(read("../packs/BP/loot_tables/blocks/zoocraft_expedition_platform.json").pools[0].entries[0].name, "zoocraft:expedition_platform");
  assert.match(lang, /tile\.zoocraft:expedition_platform\.name=Expedition Platform/);
  // Wiring: the block component, the loops, the ride's guests kept, the species text.
  const main = readFileSync(new URL("../packs/BP/scripts/main.js", import.meta.url), "utf8");
  assert.match(main, /registerCustomComponent\("zoocraft:expedition_platform", platformComponent\(rideMenu\)\)/);
  for (const name of ["rides", "ridefly", "ridesafety", "mounts", "cities"]) assert.match(main, new RegExp(`loop\\("${name}"`), name);
  assert.match(main, /isRideGuest\(entity\.id\)/);
  const species = readFileSync(new URL("../packs/BP/scripts/data/species.js", import.meta.url), "utf8");
  assert.match(species, /End Cities/);
});

// ---------- 0.1.67: fixes from Austin's 0.1.66 content log, and the grounded wild ray ----------

test("0.1.68: rays fly as they did in 0.1.65 (Austin: \"The old behavior worked amazing\"), giant only in looks", async () => {
  const { FLIGHT } = await import("../packs/BP/scripts/animals/glide.js");
  const old = { speed: 0.14, reach: 0.9, depth: 0.5, wanderRange: 9, baitHeight: 2.2, wildHeight: [2, 6], groundBelow: 12, lookAhead: 1.5 };
  for (const [k, v] of Object.entries(old)) assert.deepEqual(FLIGHT[k], v, k);
  const flight = readFileSync(new URL("../packs/BP/scripts/animals/flight.js", import.meta.url), "utf8");
  const mount = readFileSync(new URL("../packs/BP/scripts/animals/mount.js", import.meta.url), "utf8");
  assert.equal((flight.match(/flyStep\(ray, v,/g) ?? []).length, 2, "flying and resting rays, moved a step at a time (0.1.69)");
  assert.doesNotMatch(flight, /push\(ray|tryTeleport|push\.js|applyImpulse/);
  assert.match(flight, /if \(!flying\.has\(r\.id\)\) wakeWild\(r\);\n      try \{/, "taming an old wild ray never stops it flying");
  assert.match(flight, /catch \(error\) \{\n        tell\(error\);/, "an error flying a ray goes to the content log");
  assert.match(mount, /catch \(error\) \{\n        tell\(error\);/);
  assert.match(flight, /reportError\("flight", error\)/);
  for (const f of ["void_ray", "wild_void_ray"]) {
    const d = JSON.parse(readFileSync(new URL(`../packs/RP/entity/${f}.entity.json`, import.meta.url), "utf8"))["minecraft:client_entity"].description;
    assert.match(d.scripts.scale, /2\.5/, `${f} still looks giant`);
  }
});

test("0.1.67 content-log fixes: rays without can_fly, one render method per block, Bedrock item ids", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  // can_fly (added in 0.1.66) kept the game from moving a ray: both rays are flown by script with no gravity.
  for (const f of ["void_ray", "wild_void_ray"]) {
    const c = read(`../packs/BP/entities/${f}.json`)["minecraft:entity"].components;
    assert.equal(c["minecraft:can_fly"], undefined, f);
    assert.equal(c["minecraft:physics"].has_gravity, false, f);
  }
  // Every block keeps one render method across its material instances (the Tour Desk's flag mixed them).
  const dir = new URL("../packs/BP/blocks/", import.meta.url);
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const b = JSON.parse(readFileSync(new URL(name, dir), "utf8"))["minecraft:block"];
    for (const comps of [b.components, ...(b.permutations ?? []).map((p) => p.components)]) {
      const mi = comps["minecraft:material_instances"];
      if (!mi) continue;
      const methods = new Set(Object.values(mi).map((m) => m.render_method ?? "opaque"));
      assert.equal(methods.size, 1, `${name}: ${[...methods]}`);
    }
  }
  // Java names that Bedrock calls something else.
  const javaOnly = ["minecraft:end_stone_bricks", "minecraft:cobblestone_stairs"];
  const rdir = new URL("../packs/BP/recipes/", import.meta.url);
  for (const name of readdirSync(rdir).filter((n) => n.endsWith(".json"))) {
    const text = readFileSync(new URL(name, rdir), "utf8");
    for (const bad of javaOnly) assert.ok(!text.includes(`"${bad}"`), `${name}: ${bad}`);
  }
  assert.equal(read("../packs/BP/recipes/zoocraft_expedition_platform.json")["minecraft:recipe_shaped"].key.E.item, "minecraft:end_bricks");
  const path = read("../packs/BP/entities/guest.json")["minecraft:entity"].components["minecraft:preferred_path"].preferred_path_blocks[0].blocks;
  assert.ok(!path.includes("cobblestone_stairs") && path.includes("stone_stairs"));
  assert.equal(new Set(path).size, path.length, "no block listed twice");
});

// ---------- 0.1.69: rays moved by teleport steps (Austin: they turn "they just never change XYZ coordinates") ----------
// ---------- 0.1.70: back to pushes, steps only for a ray the game won't push ----------

test("Rays glide by pushes again, and a ray the game won't push moves by short steps into open air", async () => {
  const { stepOptions, flyStep, pushState, tallyPush, PUSH_CHECK } = await import("../packs/BP/scripts/animals/mover.js");
  const opts = stepOptions({ x: 0, y: 10, z: 0 }, { x: 0.1, y: 0.05, z: -0.1 });
  assert.deepEqual(opts.map((o) => [o.x, o.y, o.z]), [[0.1, 10.05, -0.1], [0.1, 10, -0.1], [0, 10.05, 0]], "the whole step, then level, then straight up or down");
  // The check: a window of pushes that went nowhere is "ignored"; one that went most of the way is "ok".
  const w = { cmd: 0, got: 0, n: 0 };
  let verdict;
  for (let i = 0; i < PUSH_CHECK.samples; i++) verdict = tallyPush(w, 0.14, 0);
  assert.equal(verdict, "ignored");
  for (let i = 0; i < PUSH_CHECK.samples; i++) verdict = tallyPush(w, 0.14, 0.12);
  assert.equal(verdict, "ok");
  for (let i = 0; i < PUSH_CHECK.samples; i++) verdict = tallyPush(w, 0.03, 0);
  assert.equal(verdict, "ok", "a ray barely asked to move (hovering) is never judged");
  // A fake ray in open air: one the pushes move, one they don't.
  const fake = (id, moves) => ({
    id,
    location: { x: 0.5, y: 10, z: 0.5 },
    rot: { x: 0, y: 0 },
    pushes: 0,
    teleports: 0,
    dimension: { getBlock: () => ({ isAir: true }) },
    getRotation() { return this.rot; },
    setRotation(r) { this.rot = r; },
    clearVelocity() {},
    applyImpulse(v) {
      this.pushes += 1;
      if (moves) this.location = { x: this.location.x + v.x, y: this.location.y + v.y, z: this.location.z + v.z };
    },
    teleport(t) {
      this.teleports += 1;
      this.location = t;
    },
  });
  const v = { x: 0.14, y: 0, z: 0 };
  const good = fake("ray-pushed", true);
  for (let t = 0; t < 100; t++) flyStep(good, v, undefined, t);
  assert.equal(good.teleports, 0, "a ray the pushes move is never teleported");
  assert.equal(good.pushes, 100);
  assert.ok(pushState("ray-pushed").share > 0.9 && !pushState("ray-pushed").stepping);
  const stuck = fake("ray-stuck", false);
  const told = [];
  for (let t = 0; t <= PUSH_CHECK.samples; t++) flyStep(stuck, v, undefined, t, (x) => told.push(x));
  assert.ok(pushState("ray-stuck").stepping, "after a second of ignored pushes it steps");
  assert.equal(told.length, 1);
  assert.match(told[0], /ignored the pushes/);
  assert.equal(stuck.teleports, 1, "the tick it finds out, it steps");
  const x0 = stuck.location.x;
  flyStep(stuck, v, undefined, 99, (x) => told.push(x));
  assert.equal(stuck.teleports, 2);
  assert.ok(Math.abs(stuck.location.x - (x0 + 0.14)) < 1e-9, "one short step");
  assert.equal(told.length, 1, "said once");
  const src = (f) => readFileSync(new URL(`../packs/BP/scripts/${f}`, import.meta.url), "utf8");
  const mover = src("animals/mover.js");
  assert.match(mover, /entity\.applyImpulse\(\{ x: v\.x, y: v\.y, z: v\.z \}\)/, "pushes, as from 0.1.51 to 0.1.65");
  assert.match(mover, /entity\.teleport\(t, \{ rotation: rot, keepVelocity: false \}\)/);
  assert.match(mover, /openAt\(entity\.dimension, t\)/, "a step never goes into a block");
  for (const f of ["animals/flight.js", "animals/mount.js"]) assert.doesNotMatch(src(f), /applyImpulse|\.teleport\(/, `${f} moves rays only through the mover`);
  const rides = src("visitors/rides.js");
  assert.match(rides, /e\.applyImpulse\(\{ x: dx \* k, y: dyy \* k, z: dz \* k \}\)/, "the Expedition ride nudges its ray again (0.1.68)");
  const mount = src("animals/mount.js");
  assert.match(mount, /flyStep\(ray, \{ x: vx, y: vy, z: vz \}/, "a ridden ray too");
  assert.match(mount, /reseat\(ray, pilot, riders\)/, "riders put back on if a step drops them");
  assert.match(src("commands.js"), /name: "zoocraft:rays"/);
});

test("Every client mob's Molang property reads exist on its server mob (keepers share the guests' walk)", () => {
  const dirOf = (p) => new URL(p, import.meta.url);
  const jsonIn = (p) => readdirSync(dirOf(p)).filter((n) => n.endsWith(".json")).map((n) => JSON.parse(readFileSync(new URL(n, dirOf(p)), "utf8")));
  const reads = (o) => new Set([...JSON.stringify(o).matchAll(/q(?:uery)?\.property\(\s*'([^']+)'/g)].map((m) => m[1]));
  const used = new Map();
  for (const d of [...jsonIn("../packs/RP/animations/"), ...jsonIn("../packs/RP/animation_controllers/")]) {
    for (const key of ["animations", "animation_controllers"]) for (const [id, body] of Object.entries(d[key] ?? {})) used.set(id, reads(body));
  }
  const server = new Map(jsonIn("../packs/BP/entities/").map((d) => [d["minecraft:entity"].description.identifier, new Set(Object.keys(d["minecraft:entity"].description.properties ?? {}))]));
  for (const d of jsonIn("../packs/RP/entity/")) {
    const desc = d["minecraft:client_entity"].description;
    const need = reads(desc);
    for (const id of Object.values(desc.animations ?? {})) for (const p of used.get(id) ?? []) need.add(p);
    const have = server.get(desc.identifier) ?? new Set();
    for (const p of need) assert.ok(have.has(p), `${desc.identifier} reads ${p}`);
  }
});

// ---------- 0.1.70: rays lost their family; found by type, family given back (Austin: "They wont move, detection also fails") ----------

test("No entity event removes a component group whose components the entity keeps in its base components, unless it adds them back", () => {
  // Microsoft, Entity Behavior Introduction, "Removing Components": removing a component group removes
  // its components outright, even one the base components also define. The Void Rays lost their
  // family that way, the hedgehogs and Rift Ferrets their walking speed.
  const dir = new URL("../packs/BP/entities/", import.meta.url);
  const walk = (ev) => {
    if (!ev || typeof ev !== "object") return [];
    const out = [];
    const rem = ev.remove?.component_groups ?? [];
    const add = ev.add?.component_groups ?? [];
    if (rem.length) out.push([rem, add]);
    for (const k of ["sequence", "randomize"]) for (const sub of ev[k] ?? []) out.push(...walk(sub));
    return out;
  };
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const e = JSON.parse(readFileSync(new URL(name, dir), "utf8"))["minecraft:entity"];
    const base = new Set(Object.keys(e.components ?? {}));
    const groups = e.component_groups ?? {};
    for (const [id, ev] of Object.entries(e.events ?? {})) {
      for (const [rem, add] of walk(ev)) {
        const back = new Set(add.flatMap((g) => Object.keys(groups[g] ?? {})));
        for (const g of rem) for (const c of Object.keys(groups[g] ?? {})) assert.ok(!base.has(c) || back.has(c), `${name}: ${id} removes ${g} and with it ${c}`);
      }
    }
  }
});

test("A wild Void Ray keeps its family: the wild event removes nothing and gives the family back; tamed rays are mounts", async () => {
  const wild = JSON.parse(readFileSync(new URL("../packs/BP/entities/wild_void_ray.json", import.meta.url), "utf8"))["minecraft:entity"];
  const fam = (c) => c?.["minecraft:type_family"]?.family ?? [];
  assert.ok(fam(wild.components).includes("void_ray"));
  assert.deepEqual(wild.events["zoocraft:wild"], { add: { component_groups: ["zoocraft:wild", "zoocraft:wild_family"] } });
  assert.deepEqual(fam(wild.component_groups["zoocraft:wild_family"]), fam(wild.components));
  assert.ok(fam(wild.component_groups["zoocraft:tamed"]).includes("void_ray_mount"));
  for (const [id, ev] of Object.entries(wild.events)) for (const g of ev.remove?.component_groups ?? []) assert.equal(fam(wild.component_groups[g]).length, 0, `${id} removes ${g}, which holds a family`);
  // Who is who, by components (never by family alone).
  const { isTamedRay, hasFamily, RAY_TYPES } = await import("../packs/BP/scripts/animals/rayKinds.js");
  const ray = (typeId, comps) => ({ typeId, getComponent: (c) => comps[c] });
  assert.equal(isTamedRay(ray("zoocraft:wild_void_ray", { "minecraft:is_tamed": {} })), true);
  assert.equal(isTamedRay(ray("zoocraft:wild_void_ray", { "minecraft:rideable": {} })), true);
  assert.equal(isTamedRay(ray("zoocraft:wild_void_ray", {})), false);
  assert.equal(isTamedRay(ray("zoocraft:void_ray", { "minecraft:rideable": {} })), false, "zoo rays carry guests on rides but aren't mounts");
  assert.equal(hasFamily(ray("zoocraft:wild_void_ray", { "minecraft:type_family": { hasTypeFamily: (f) => f === "void_ray" } }), "void_ray"), true);
  assert.equal(hasFamily(ray("zoocraft:wild_void_ray", {}), "void_ray"), false, "no family component at all: lost");
  assert.deepEqual(RAY_TYPES, ["zoocraft:void_ray", "zoocraft:wild_void_ray"]);
  // The flight and the mounts find rays by type and tell mounts apart by components.
  const src = (f) => readFileSync(new URL(`../packs/BP/scripts/${f}`, import.meta.url), "utf8");
  const flight = src("animals/flight.js");
  assert.match(flight, /entitiesNear\(player\.dimension, player\.location, RANGE, RAY_TYPES\)/);
  assert.match(flight, /steeredElsewhere\.has\(r\.id\) \|\| isTamedRay\(r\)\) continue;/);
  assert.match(flight, /hasFamily\(ray, "void_ray"\) !== false/, "a wild ray without its family gets the wild event");
  assert.match(src("animals/mount.js"), /entitiesNear\(player\.dimension, player\.location, m\.range, \[WILD_RAY\]\)\.filter\(isTamedRay\)/);
  assert.match(src("animals/endCities.js"), /entitiesNear\(d, p\.location, c\.rayRange, RAY_TYPES\)/);
  for (const f of ["animals/flight.js", "animals/mount.js", "animals/endCities.js"]) assert.doesNotMatch(src(f), /families: \["void_ray/, f);
  assert.match(src("platform/mc.js"), /list = dimension\.getEntities\(\{ type \}\);/, "one search per type a tick");
});

test("Hedgehogs and Rift Ferrets switch between still and moving groups, and get their walk back when met", () => {
  for (const [name, speed] of [["hedgehog", 0.2], ["wild_hedgehog", 0.2], ["rift_ferret", 0.28], ["wild_rift_ferret", 0.28]]) {
    const e = JSON.parse(readFileSync(new URL(`../packs/BP/entities/${name}.json`, import.meta.url), "utf8"))["minecraft:entity"];
    assert.equal(e.components["minecraft:movement"].value, speed, name);
    assert.equal(e.component_groups["zoocraft:moving"]["minecraft:movement"].value, speed, `${name} walks at its own speed again`);
    assert.equal(e.component_groups["zoocraft:still"]["minecraft:movement"].value, 0);
    assert.deepEqual(e.events["zoocraft:move"], { remove: { component_groups: ["zoocraft:still"] }, add: { component_groups: ["zoocraft:moving"] } });
    assert.deepEqual(e.events["zoocraft:still"], { remove: { component_groups: ["zoocraft:moving"] }, add: { component_groups: ["zoocraft:still"] } });
  }
  const rift = readFileSync(new URL("../packs/BP/scripts/animals/rift.js", import.meta.url), "utf8");
  assert.match(rift, /state\.set\(ferret\.id, s\);\n[^]*?ferret\.triggerEvent\("zoocraft:move"\);\n  \}/, "a ferret met again is put on its feet");
});

test("/zoocraft:rays lists every Void Ray by type, tamed ones and far ones too, and taming a ray tells the feeder", () => {
  const src = (f) => readFileSync(new URL(`../packs/BP/scripts/${f}`, import.meta.url), "utf8");
  const report = src("animals/rayReport.js");
  assert.match(report, /for \(const type of RAY_TYPES\)/);
  assert.match(report, /player\.dimension\.getEntities\(\{ type \}\)/, "found by type, not by family or distance");
  assert.match(report, /isTamedRay\(e\)/, "tamed rays are named as mounts");
  assert.match(report, /familyCount\(player, "void_ray", RAY_RANGE\)/, "the old family search is counted beside it");
  assert.match(report, /familyCount\(player, "void_ray_mount"/);
  assert.match(report, /families \$\{familiesOf\(r\.e\)\}/, "each ray's families");
  assert.match(report, /moveText\(r\.e\.id\)/, "and whether pushes or steps move it");
  assert.match(src("commands.js"), /import \{ rayReport \} from "\.\/animals\/rayReport\.js";/);
  assert.doesNotMatch(src("animals/flight.js"), /export function rayReport/);
  // Taming is announced (the wild ray's tame_event is the event main.js listens for).
  const wild = JSON.parse(readFileSync(new URL("../packs/BP/entities/wild_void_ray.json", import.meta.url), "utf8"));
  const tameEvent = wild["minecraft:entity"].component_groups["zoocraft:wild"]["minecraft:tameable"].tame_event.event;
  const main = src("main.js");
  assert.match(main, /dataDrivenEntityTrigger\.subscribe/);
  assert.ok(main.includes(`eventId === "${tameEvent}"`) && main.includes(`eventTypes: ["${tameEvent}"]`), tameEvent);
  const mount = src("animals/mount.js");
  assert.match(mount, /The Void Ray is tamed!/);
  assert.match(mount, /BALANCE\.rays\.mount\.callRange/, "the call range it states is the real one");
  assert.match(mount, /s\.ridden = Boolean\(pilot\)/);
});

// ---------- 0.1.71: the Raccoon, the first climber (spec 5.x "raccoon | Raccoon | Manipulates puzzle feeders | Climbing; attracted to unsecured bins") ----------

// A world for the climb measure: `blocks` maps "x,y,z" to the category a climb reader gives
// (platform/mc.js blockReader with climb: true); everything else is air over a solid floor at y 0.
// The walking cells come from floodTerrestrial over the same world as the walking reader sees it
// (logs, frames and glass solid, panes like fences), as exhibits.js measures an exhibit.
function climbMeasure(blocks, seed = { x: 1, y: 1, z: 1 }) {
  const read = (x, y, z) => blocks.get(`${x},${y},${z}`) ?? (y <= 0 ? "solid" : "air");
  const walkView = (x, y, z) => {
    const c = read(x, y, z);
    return c === "log" || c === "frame" || c === "glass" ? "solid" : c === "pane" ? "barrier" : c;
  };
  const walk = newResult(seed);
  const w = floodTerrestrial(walkView, seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 2, cellsPerYield: 1e9 }, walk);
  while (!w.next().done);
  const out = newClimbResult();
  const c = floodClimb(read, walk.cells, { rise: BALANCE.climb.rise, cellsPerYield: 50 }, out);
  while (!c.next().done);
  return { walk, out, read };
}
// A pen's walls: the ring of blocks `r` out from 0,0, from y0 up to y1. And a box of blocks.
function ringOf(blocks, cat, r, y0, y1) {
  for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) if (Math.max(Math.abs(x), Math.abs(z)) === r) for (let y = y0; y <= y1; y++) blocks.set(`${x},${y},${z}`, cat);
  return blocks;
}
function boxOf(blocks, cat, [x0, x1], [y0, y1], [z0, z1]) {
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) blocks.set(`${x},${y},${z}`, cat);
  return blocks;
}
const climbReader = (blocks) => (x, y, z) => blocks.get(`${x},${y},${z}`) ?? (y <= 0 ? "solid" : "air");

test("Climb-proof: raccoons get out over fences, walls and hedges and along branches, but not up glass or past an overhang or a roof", async () => {
  const { climbIssue, climbLine } = await import("../packs/BP/scripts/animals/climbRules.js");
  const pen = (cat, h) => ringOf(new Map(), cat, 4, 1, h);
  // The way out: from the floor, a block across at a time, to the first block outside the walls.
  const wayOut = (m) => {
    const { path, escape } = m.out;
    assert.equal(m.walk.cells.get(`${path[0].x},${path[0].y},${path[0].z}`), "land", "it sets off from the floor");
    assert.deepEqual(path[path.length - 1], escape);
    assert.ok(Math.max(Math.abs(escape.x), Math.abs(escape.z)) > 4, "and ends outside the walls");
    for (let i = 1; i < path.length; i++) assert.ok(Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].z - path[i - 1].z) <= 1, "one block across at a time");
  };
  // A fence keeps walkers in; a climber goes up it and over the top.
  const fence = climbMeasure(pen("barrier", 1));
  assert.equal(fence.walk.enclosed, true);
  assert.equal(fence.out.proof, false);
  wayOut(fence);
  assert.equal(Math.max(Math.abs(fence.out.via.x), Math.abs(fence.out.via.z)), 4, "over the fence line");
  assert.equal(fence.out.via.y, 2, "on top of the fence");
  assert.ok(!fence.out.via.leaves && !fence.out.via.hedge);
  assert.match(climbIssue("Raccoons", fence.out), /^Raccoons climb: they could climb out near -?\d+ 2 -?\d+\. They climb fences, walls, bars, logs and hedges, but not glass, and can't hang under a roof: use glass walls there, add an overhang \(a row of blocks sticking inward along the top of the wall\), or roof the exhibit\.$/);
  // Stone walls too, as high as it is followed (balance.climb.rise above the floor).
  const stone = climbMeasure(pen("solid", 3));
  assert.equal(stone.out.proof, false);
  assert.equal(stone.out.via.y, 4, "over the top of the wall");
  wayOut(stone);
  assert.equal(climbMeasure(pen("solid", 1 + BALANCE.climb.rise)).out.proof, true, "walls taller than that keep them in");
  // Nothing to grip on glass or glass panes.
  for (const cat of ["glass", "pane"]) {
    const m = climbMeasure(pen(cat, 3));
    assert.equal(m.walk.enclosed, true, cat);
    assert.equal(m.out.proof, true, cat);
    assert.equal(m.out.escape, undefined);
  }
  // An overhang (a row of blocks sticking inward along the top of the wall) stops it: it can't hang
  // under a ceiling. A gap in the overhang is a way out.
  const lip = ringOf(pen("solid", 3), "solid", 3, 3, 3);
  assert.equal(climbMeasure(lip).out.proof, true);
  lip.delete("3,3,0");
  const gap = climbMeasure(lip);
  assert.equal(gap.out.proof, false);
  assert.deepEqual(gap.out.via, { x: 4, y: 4, z: 0, leaves: false, hedge: false }, "over the wall at the gap");
  wayOut(gap);
  // So does a roof.
  assert.equal(climbMeasure(boxOf(pen("solid", 3), "solid", [-4, 4], [4, 4], [-4, 4])).out.proof, true);
  // A hedge it climbs and pushes through: leaves down to the floor are the wall itself.
  const hedge = climbMeasure(pen("leaves", 3));
  assert.equal(hedge.walk.enclosed, true, "walkers can't get through a hedge");
  assert.equal(hedge.out.proof, false);
  assert.ok(hedge.out.via.hedge && !hedge.out.via.leaves);
  assert.match(climbIssue("Raccoons", hedge.out), /could climb out near -?\d+ 1 -?\d+, through a hedge\. They climb/);
  // The branches of a tree inside reaching out over a glass wall: up the trunk and out along them.
  const canopy = boxOf(ringOf(new Map(), "glass", 6, 1, 3), "leaves", [-1, 7], [5, 6], [-1, 1]);
  boxOf(canopy, "log", [0, 0], [1, 5], [0, 0]);
  const branches = climbMeasure(canopy, { x: 2, y: 1, z: 2 });
  assert.equal(branches.out.proof, false);
  assert.equal(branches.out.trees, 1);
  assert.deepEqual(branches.out.via, { x: 6, y: 5, z: 0, leaves: true, hedge: false }, "over the wall in the leaves");
  assert.match(climbIssue("Raccoons", branches.out), /near 6 5 0, through the branches of a tree that reach over the wall: move the tree back from the wall or cut the branches\./);
  // A trunk or a Climbing Frame by a wall it can't climb takes it over the top; well back from the
  // wall, it doesn't.
  const trunk = climbMeasure(boxOf(pen("glass", 3), "log", [-3, -2], [1, 5], [-3, -2]));
  assert.equal(trunk.out.proof, false);
  assert.equal(trunk.out.trees, 1, "a 2 x 2 trunk is one tree");
  wayOut(trunk);
  assert.equal(climbMeasure(boxOf(pen("glass", 3), "frame", [3, 3], [1, 3], [0, 0])).out.proof, false);
  const back = climbMeasure(boxOf(pen("glass", 3), "frame", [0, 0], [1, 3], [0, 0]));
  assert.equal(back.out.proof, true);
  assert.equal(back.out.trees, 0, "a Climbing Frame is equipment, not a tree");
  // Climbing trees: trunks 3 or more logs high standing beside the floor; a stump isn't one.
  const grove = ringOf(new Map(), "glass", 6, 1, 3);
  boxOf(grove, "log", [0, 0], [1, 4], [0, 0]);
  boxOf(grove, "log", [3, 3], [1, 2], [3, 3]);
  boxOf(grove, "log", [-3, -2], [1, 5], [-3, -2]);
  const trees = climbMeasure(grove);
  assert.equal(trees.out.proof, true, "all well back from the walls");
  assert.equal(trees.out.trees, 2);
  assert.ok(trees.out.reached > 0, "up the trunks and onto their tops");
  // Nothing measured to climb from.
  const none = newClimbResult();
  const g = floodClimb(() => "air", new Map(), { rise: 4, cellsPerYield: 10 }, none);
  while (!g.next().done);
  assert.equal(none.proof, true);
  // The Exhibit Clipboard's line.
  assert.match(climbLine({}, "Raccoons"), /^§fClimb-proof: §7not measured yet/);
  assert.equal(climbLine({ climb: trees.out }, "Raccoons"), "§fClimb-proof: §ayes§7, raccoons can't climb out; 2 climbing trees (3 or more logs high)");
  assert.match(climbLine({ climb: { ...fence.out, trees: 1 } }, "Raccoons"), /^§fClimb-proof: §cno§7, raccoons could climb out near -?\d+ 2 -?\d+; 1 climbing tree \(3 or more logs high\)$/);
  assert.match(climbLine({ climb: branches.out }, "Raccoons"), /near 6 5 0 through a tree's branches; 1 climbing tree/);
  assert.match(climbLine({ climb: hedge.out }, "Raccoons"), /through a hedge; 0 climbing trees/);
});

test("Climbing a trunk or a Climbing Frame: up the bark, onto the top or clinging under the leaves, back down head first, and the way out over a wall", async () => {
  const R = await import("../packs/BP/scripts/animals/climbRules.js");
  const T = BALANCE.raccoon;
  // What a climb reader makes of blocks (platform/mc.js blockReader with climb: true).
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, climb: true, ...extra });
  for (const id of ["minecraft:oak_log", "minecraft:stripped_birch_wood", "minecraft:crimson_stem", "minecraft:warped_hyphae"]) assert.equal(c(id), "log", id);
  for (const id of ["minecraft:glass", "minecraft:lime_stained_glass", "minecraft:tinted_glass", "minecraft:barrier"]) assert.equal(c(id), "glass", id);
  for (const id of ["minecraft:glass_pane", "minecraft:red_stained_glass_pane"]) assert.equal(c(id), "pane", id);
  assert.equal(c("zoocraft:climbing_frame"), "frame");
  assert.equal(c("minecraft:oak_fence"), "barrier");
  assert.equal(c("minecraft:iron_bars"), "barrier");
  assert.equal(c("minecraft:melon_stem"), "air", "a crop stem isn't a trunk");
  assert.equal(c("minecraft:oak_leaves", { leaves: true }), "leaves");
  const plain = (id) => classifyBlock(id, { isAir: false, isLiquid: false, open: false });
  assert.deepEqual(["minecraft:oak_log", "minecraft:glass", "minecraft:glass_pane", "zoocraft:climbing_frame"].map(plain), ["solid", "solid", "barrier", "solid"], "everyone else sees them as before");
  // The trunk beside it: straight on, or corner to corner (it steps round first).
  const trunk = (x, z, h = 3, cat = "log") => boxOf(new Map(), cat, [x, x], [1, h], [z, z]);
  const foot = { x: 0, y: 1, z: 0 };
  assert.deepEqual(R.trunkBeside(climbReader(trunk(1, 0)), foot), { dir: { x: 1, z: 0 }, from: foot });
  assert.deepEqual(R.trunkBeside(climbReader(trunk(1, 1)), foot), { dir: { x: 0, z: 1 }, from: { x: 1, y: 1, z: 0 } });
  const boxed = trunk(1, 1);
  boxed.set("1,1,0", "solid");
  boxed.set("0,1,1", "solid");
  assert.equal(R.trunkBeside(climbReader(boxed), foot), undefined, "no way round to it");
  assert.equal(R.trunkBeside(climbReader(trunk(1, 0, 2)), foot), undefined, "a stump");
  assert.deepEqual(R.trunkBeside(climbReader(trunk(0, 1, 3, "frame")), foot).dir, { x: 0, z: 1 }, "a Climbing Frame");
  // Up the face: onto the top where it ends in the open, clinging under a leafy crown, at most maxUp.
  const east = { x: 1, z: 0 };
  const short = R.climbRoute(climbReader(trunk(1, 0)), foot, east, T.maxUp);
  assert.deepEqual(short, { up: [{ x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 }], top: { x: 1, y: 4, z: 0 }, onTop: true });
  assert.equal(R.climbRoute(climbReader(trunk(1, 0, 3, "frame")), foot, east, T.maxUp).onTop, true, "up a frame and onto its platform");
  assert.equal(R.climbRoute(climbReader(trunk(1, 0, 2)), foot, east, T.maxUp), undefined, "under 2 blocks to climb");
  const crown = boxOf(trunk(1, 0, 6), "leaves", [-1, 3], [5, 6], [-1, 1]);
  boxOf(crown, "log", [1, 1], [5, 6], [0, 0]);
  const under = R.climbRoute(climbReader(crown), foot, east, T.maxUp);
  assert.deepEqual([under.onTop, under.top], [false, { x: 0, y: 4, z: 0 }], "it stops under the leaves");
  const tall = R.climbRoute(climbReader(trunk(1, 0, 20)), foot, east, T.maxUp);
  assert.deepEqual([tall.up.length, tall.onTop], [T.maxUp, false]);
  // The legs: onto the bark, up a block at a time facing it, over onto the top; back down head
  // first, facing away from it, and off the bark onto its feet.
  const up = R.upLegs(foot, east, short, T);
  assert.deepEqual(up.map((l) => l.act), [R.ACT.climb, R.ACT.climb, R.ACT.climb, R.ACT.climb, R.ACT.scramble]);
  assert.deepEqual(up.map((l) => l.to.y), [1, 2, 3, 4, 4]);
  assert.deepEqual(up.map((l) => l.ticks), [T.gripTicks, T.climbTicks, T.climbTicks, T.climbTicks, T.acrossTicks]);
  assert.ok(up.slice(0, 4).every((l) => l.yaw === -90 && Math.abs(l.to.x - (0.5 + T.hug)) < 1e-9 && l.to.z === 0.5), "hugging the bark to the east, facing it");
  assert.deepEqual(up[4].to, { x: 1.5, y: 4, z: 0.5 }, "on top of the trunk");
  const paused = R.upLegs(foot, east, short, T, 0);
  assert.equal(paused.length, 6);
  assert.deepEqual([paused[2].act, paused[2].ticks], [R.ACT.cling, T.pauseTicks], "a stop to cling partway");
  const down = R.downLegs(foot, east, short, T);
  assert.deepEqual(down.map((l) => l.act), [R.ACT.down, R.ACT.down, R.ACT.down, R.ACT.down, R.ACT.none]);
  assert.deepEqual(down.map((l) => l.to.y), [4, 3, 2, 1, 1]);
  assert.ok(down.every((l) => l.yaw === 90), "head first: facing away from the bark");
  assert.deepEqual(down[4].to, { x: 0.5, y: 1, z: 0.5 });
  assert.deepEqual(R.downLegs(foot, east, under, T).map((l) => l.to.y), [3, 2, 1, 1], "from where it clung");
  // A kit hugs nearer the bark: it is drawn at its species' juvenile scale about its feet.
  assert.ok(Math.abs(R.hugFor(T.hug) - T.hug) < 1e-9);
  assert.ok(Math.abs(R.hugFor(0.18, 0.5) - 0.34) < 1e-9);
  assert.deepEqual(R.clingSpot({ x: 2, y: 5, z: 2 }, { x: 0, z: -1 }, 0.25), { x: 2.5, y: 5, z: 2.25 });
  // Facing: Minecraft yaw, 0 south (+z), -90 east (+x), 90 west, 180 north.
  assert.deepEqual([R.yawTo(0, 1), R.yawTo(1, 0), R.yawTo(-1, 0), Math.abs(R.yawTo(0, -1))], [0, -90, 90, 180]);
  // Steps for the mover: up then across onto an edge, across then down off one.
  assert.deepEqual(R.stepsBetween({ x: 0, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }), [{ x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }]);
  assert.deepEqual(R.stepsBetween({ x: 0, y: 3, z: 0 }, { x: 1, y: 1, z: 0 }), [{ x: 1, y: 3, z: 0 }, { x: 1, y: 1, z: 0 }]);
  assert.deepEqual(R.stepsBetween({ x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }), [{ x: 0, y: 2, z: 0 }]);
  assert.equal(R.stillOpen(climbReader(new Map([["0,1,0", "leaves"]])), foot), true, "it pushes through leaves");
  assert.equal(R.stillOpen(climbReader(new Map([["0,1,0", "solid"]])), foot), false, "something built in its way: it lets go");
  // The way out over a wall: up the face facing it, over the top, straight on down the far side head
  // first, and off the bark onto its feet outside, facing the way out the whole time.
  const stone = climbMeasure(ringOf(new Map(), "solid", 4, 1, 3));
  const start = stone.out.path[0];
  const legs = R.escapeLegs(stone.read, start, stone.out.path, T);
  assert.deepEqual(legs.map((l) => l.act), [R.ACT.climb, R.ACT.climb, R.ACT.climb, R.ACT.scramble, R.ACT.down, R.ACT.down, R.ACT.down, R.ACT.none]);
  assert.deepEqual(legs.map((l) => l.to.y), [2, 3, 4, 4, 3, 2, 1, 1]);
  assert.ok(legs.every((l) => l.yaw === legs[0].yaw));
  const end = legs[legs.length - 1].to;
  assert.ok(Math.max(Math.abs(end.x), Math.abs(end.z)) > 5 && end.y === 1, "on the ground outside");
  const fence = climbMeasure(ringOf(new Map(), "barrier", 4, 1, 1));
  assert.deepEqual(R.escapeLegs(fence.read, fence.out.path[0], fence.out.path, T).map((l) => l.act), [R.ACT.climb, R.ACT.scramble, R.ACT.down, R.ACT.none]);
  // Out along branches it drops from the end of them.
  const canopy = boxOf(ringOf(new Map(), "glass", 6, 1, 3), "leaves", [-1, 7], [5, 6], [-1, 1]);
  boxOf(canopy, "log", [0, 0], [1, 5], [0, 0]);
  const branches = climbMeasure(canopy, { x: 2, y: 1, z: 2 });
  const drop = R.escapeLegs(branches.read, branches.out.path[0], branches.out.path, T);
  assert.ok(drop.slice(-4).every((l) => l.act === R.ACT.none && l.ticks === T.dropTicks));
  assert.equal(drop[drop.length - 1].to.y, 1);
  // From a couple of blocks away it scrambles across the floor to the foot of the wall first; with
  // something in the way, it doesn't go.
  const near = { x: start.x - 2, y: start.y, z: start.z };
  const across = R.escapeLegs(stone.read, near, stone.out.path, T);
  assert.deepEqual([across[0].act, across[0].to, across[0].ticks], [R.ACT.scramble, { x: start.x + 0.5, y: start.y, z: start.z + 0.5 }, 2 * T.acrossTicks]);
  assert.equal(across.length, legs.length + 1);
  const blocked = (x, y, z) => (x === start.x - 1 && y === start.y && z === start.z ? "solid" : stone.read(x, y, z));
  assert.equal(R.escapeLegs(blocked, near, stone.out.path, T), undefined);
});

test("Raccoon: a climber that washes its food, wants a tree or a Climbing Frame, works Puzzle Feeders, raids unlatched Litter Bins at night, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, BLOCKS, FOOD_LOOK, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const { enrichmentKinds, serves, drinksFromPool } = await import("../packs/BP/scripts/equipment/rules.js");
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const R = await import("../packs/BP/scripts/animals/climbRules.js");
  const rac = SPECIES["zoocraft:raccoon"];
  const hog = SPECIES["zoocraft:hedgehog"];
  assert.equal(speciesForWild("zoocraft:wild_raccoon"), rac);
  assert.equal(pluralOf(rac), "Raccoons");
  assert.equal(rac.origin, "custom_overworld");
  assert.equal(rac.habitatProfile, "small_terrestrial");
  assert.equal(rac.carrierProfile, "small");
  assert.ok(rac.climbs && rac.climbTree && rac.wash.minCells === 1);
  assert.deepEqual(rac.observe, ["spot", "climb", "wash"]);
  assert.deepEqual(rac.coats, ["Grey", "Cinnamon"]);
  assert.equal(rac.breeding.juvenileScale, 0.5, "the kits' client scale (gen/sizes.py) is half a grown-up's");
  assert.equal(rac.baitItem, ITEMS.fruitRation);
  assert.equal(RATIONS[ITEMS.fruitRation].diet, "fruit");
  assert.ok(["fruit", "insect", "fish"].every((d) => rac.dietTags.includes(d)), "it eats nearly anything");
  assert.equal(FOOD_LOOK.fruit, 8);
  assert.ok(BALANCE.shop[ITEMS.fruitRation], "the park shop sells Fruit Rations");
  assert.deepEqual(R.RACCOON_TYPES, ["zoocraft:raccoon", "zoocraft:wild_raccoon"]);
  assert.deepEqual([BLOCKS.puzzleFeeder, BLOCKS.climbingFrame, ITEMS.binLatch], ["zoocraft:puzzle_feeder", "zoocraft:climbing_frame", "zoocraft:bin_latch"]);
  // Something to climb: a climbing tree on the floor or a Climbing Frame (not measured yet: no complaint).
  const measured = (trees) => ({ climb: { proof: true, trees } });
  assert.equal(R.hasClimbTree(rac, measured(0), []), false);
  assert.equal(R.hasClimbTree(rac, measured(1), []), true);
  assert.equal(R.hasClimbTree(rac, measured(0), [{ type: "frame" }]), true);
  assert.equal(R.hasClimbTree(rac, {}, []), true);
  assert.equal(R.hasClimbTree(hog, measured(0), []), true, "only climbers need one");
  // Water to wash food in: a pool in the floor, even one block. They drink from it too.
  assert.equal(R.canWash(rac, { waterCells: 0 }), false);
  assert.equal(R.canWash(rac, { waterCells: 1 }), true);
  assert.equal(R.canWash(hog, { waterCells: 0 }), true);
  assert.equal(drinksFromPool(rac, HABITAT_PROFILES[rac.habitatProfile], { waterCells: 1 }), true);
  assert.equal(drinksFromPool(hog, HABITAT_PROFILES[hog.habitatProfile], { waterCells: 1 }), false);
  // Comfort: no tree, or no water, caps it, and the advice names them.
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 10, water: true, tree: true, wash: true, enrichmentPerDay: 0 };
  const animal = () => ({ needs: { satiety: 80, comfort: 90, cleanliness: 90, enrichment: 50, social: 90 }, criticalSeconds: 0, ill: false });
  for (const [k, cap] of [["tree", BALANCE.climbTree.comfortCap], ["wash", BALANCE.wash.comfortCap]]) {
    const a = animal();
    simulateAnimal(a, rac, { ...ctx, [k]: false }, BALANCE.clock.dayLength, BALANCE);
    assert.equal(a.needs.comfort, cap, k);
  }
  assert.deepEqual(comfortCauses({ ...ctx, tree: false, wash: false }, BALANCE), ["tree", "wash"]);
  assert.equal(adviceFor("comfort", rac, ["tree", "wash"]), "Give the animals a climbing tree (3 or more logs high) or a Climbing Frame and water to wash their food in (a pool, even one block)");
  // Enrichment: a Puzzle Feeder while it holds food they eat; a Climbing Frame, or climbing trees.
  const diets = Object.fromEntries(Object.entries(RATIONS).map(([item, r]) => [item, r.diet]));
  const puzzle = (units, item = ITEMS.fruitRation) => ({ type: "puzzle", units, item });
  assert.deepEqual(enrichmentKinds([puzzle(4)], rac, BALANCE, diets), ["manipulate"]);
  assert.deepEqual(enrichmentKinds([puzzle(0)], rac, BALANCE, diets), [], "empty");
  assert.deepEqual(enrichmentKinds([puzzle(4, "zoocraft:leafy_ration")], rac, BALANCE, diets), [], "holding food it doesn't eat");
  assert.deepEqual(enrichmentKinds([{ type: "frame" }], rac, BALANCE, diets), ["climb"]);
  assert.deepEqual(enrichmentKinds([], rac, BALANCE, diets, 2), ["climb"], "climbing trees count");
  assert.deepEqual(enrichmentKinds([], hog, BALANCE, diets, 2), [], "for animals that like to climb");
  // A Climbing Frame stands on the floor beside open ground.
  const cells = new Map([["0,1,0", "land"]]);
  assert.equal(serves("frame", cells, { x: 1, y: 1, z: 0 }), true);
  assert.equal(serves("frame", cells, { x: 3, y: 1, z: 0 }), false);
  // Washing: paddling in the shallows, at the bank, or a step down to the water.
  const foot = { x: 0, y: 1, z: 0 };
  assert.deepEqual(R.waterNear(climbReader(new Map([["0,1,0", "water"]])), foot), { dir: { x: 0, z: 0 }, at: foot });
  assert.deepEqual(R.waterNear(climbReader(new Map([["1,1,0", "water"]])), foot), { dir: { x: 1, z: 0 }, at: { x: 1, y: 1, z: 0 } });
  assert.deepEqual(R.waterNear(climbReader(new Map([["0,0,-1", "water"]])), foot), { dir: { x: 0, z: -1 }, at: { x: 0, y: 0, z: -1 } }, "a step down");
  assert.deepEqual(R.waterNear(climbReader(new Map([["-1,1,1", "water"]])), foot).dir, { x: -1, z: 1 }, "corner to corner");
  assert.equal(R.waterNear(climbReader(new Map()), foot), undefined);
  // Litter Bins at night: a latched one holds, an unlatched one goes over and spills, a fallen one
  // has nothing left.
  assert.deepEqual(R.binRaid({ fill: 3 }, BALANCE), { outcome: "tipped", spilled: 3 + BALANCE.raccoon.scraps });
  assert.deepEqual(R.binRaid({ fill: 3, latched: true }, BALANCE), { outcome: "latched", spilled: 0 });
  assert.deepEqual(R.binRaid({ fill: 3, tipped: true }, BALANCE), { outcome: "empty", spilled: 0 });
  // What it goes looking for: mostly bins when it is loose at night; a Puzzle Feeder only when one is stocked.
  const seq = (...v) => {
    let i = 0;
    return () => v[i++ % v.length];
  };
  assert.equal(R.pickInterest({ binsOk: true, puzzle: false }, seq(0.1)), "bins");
  assert.equal(R.pickInterest({ binsOk: true, puzzle: false }, seq(0.7, 0.6)), "water");
  assert.equal(R.pickInterest({ binsOk: false, puzzle: false }, seq(0)), "climb");
  assert.equal(R.pickInterest({ binsOk: false, puzzle: false }, seq(0.99)), "idle");
  assert.equal(R.pickInterest({ binsOk: false, puzzle: true }, seq(0.99)), "puzzle");
  // The Field Journal: spot one, watch one climb, watch one wash its food.
  assert.deepEqual(tasksSeen(rac, [], { climbing: true }), ["spot"], "spotted first");
  assert.deepEqual(tasksSeen(rac, ["spot"], { climbing: true, washing: false }), ["climb"]);
  assert.deepEqual(tasksSeen(rac, ["spot", "climb"], { climbing: false, washing: true }), ["wash"]);
  assert.equal(levelOf(rac, ["spot", "climb", "wash"]), 3);
  assert.deepEqual(R.CLIMBING_ACTS, [R.ACT.climb, R.ACT.cling, R.ACT.down, R.ACT.lookout]);
  // Wiring: the loops, the measure, the bins, the feeder, the frame, the journal and the clipboard.
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const main = read("../packs/BP/scripts/main.js");
  assert.match(main, /loop\("raccoons", 10, \d+, \(\) => tickRaccoons\(system\.currentTick\)\)/);
  assert.match(main, /loop\("raccoonmove", 1, \d+, tickRaccoonMoves\)/);
  const ex = read("../packs/BP/scripts/exhibits/exhibits.js");
  assert.match(ex, /yield\* floodClimb\(blockReader\(dim\(ex\.dimension\), \{ leaves: true, climb: true \}\), out\.cells, /);
  assert.match(ex, /const enclosed = \(r\.enclosed \|\| \(airlock && !r\.escape\)\) && \(r\.usableArea > 0 \|\| r\.lavaCells > 0\) && !climbsOut;/, "one that could get out makes the exhibit unsafe");
  assert.match(ex, /\?\? climbProblem\(ex, species\) \};/, "and keeps one from moving in");
  assert.match(read("../packs/BP/scripts/platform/mc.js"), /classifyBlock\(block\.typeId, \{ [^}]*climb \}\)/);
  const racJs = read("../packs/BP/scripts/animals/raccoon.js");
  assert.match(racJs, /entitiesNear\(player\.dimension, player\.location, RANGE, RACCOON_TYPES\)/, "found by type");
  assert.match(racJs, /body\(e, s, "move"\);\n    seek\(e, s, "none"\);\n    setAct\(e, ACT\.none\);/, "a raccoon met again is put on its feet");
  assert.match(racJs, /e\.triggerEvent\(`zoocraft:\$\{how\}`\)/);
  assert.match(racJs, /e\.triggerEvent\(`zoocraft:seek_\$\{what\}`\)/);
  assert.match(racJs, /hugFor\(T\.hug, species\.breeding\.juvenileScale\)/);
  assert.match(racJs, /const binsOk = night && \(!a \|\| Boolean\(a\.outside\)\);/, "bins only when it's loose at night");
  const svc = read("../packs/BP/scripts/visitors/services.js");
  assert.match(svc, /const working = \(rec\) => !rec\.problem && !rec\.tipped;/, "a knocked-over bin catches nothing");
  assert.match(svc, /export function raidBin\(dimensionId, pos\)/);
  assert.match(svc, /if \(rec\.type === "bin" && heldItem\(player\)\?\.typeId === ITEMS\.binLatch\) return latchBin\(player, rec\);/);
  assert.match(svc, /if \(rec\.type === "bin" && rec\.tipped\) return standBin\(player, rec\);/);
  assert.match(read("../packs/BP/scripts/equipment/feeder.js"), /if \(block\.typeId === BLOCKS\.puzzleFeeder\) rec\.puzzle = true;/);
  assert.match(read("../packs/BP/scripts/equipment/fixtures.js"), /\[BLOCKS\.climbingFrame\]: "frame"/);
  assert.match(read("../packs/BP/scripts/discovery/discovery.js"), /\.\.\.climbSight\(species, hit\)/);
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /climbLine\(ex, pluralOf\(climber\)\)/);
  assert.match(read("../packs/BP/scripts/ui/fieldJournal.js"), /They can't grip glass or glass panes and can't hang under a roof/);
  assert.match(read("../packs/BP/scripts/animals/animals.js"), /need something to climb: a climbing tree/);
});

test("Raccoon, Puzzle Feeder, Climbing Frame and Litter Bin files: a raccoon in two coats with climbing, washing and sleeping poses, a feeder to work at, a frame three blocks tall, a bin that takes a latch and falls over, Fruit Rations and names", async () => {
  const R = await import("../packs/BP/scripts/animals/climbRules.js");
  const { BLOCKS, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const name of ["raccoon", "wild_raccoon"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.equal(e.description.identifier, `zoocraft:${name}`);
    assert.deepEqual(e.description.properties["zoocraft:act"], { type: "int", range: [0, 9], default: 0, client_sync: true });
    assert.deepEqual(e.components["minecraft:behavior.tempt"].items, [ITEMS.fruitRation]);
    assert.ok(e.components["minecraft:type_family"].family.includes("raccoon"));
    assert.deepEqual(e.components["minecraft:collision_box"], { width: 0.5, height: 0.45 });
    // Walking, standing put, or climbing (no gravity: the script's glide carries it). Each event swaps
    // the other two out and brings its own movement and physics.
    const g = e.component_groups;
    assert.equal(g["zoocraft:moving"]["minecraft:movement"].value, e.components["minecraft:movement"].value);
    assert.equal(g["zoocraft:still"]["minecraft:movement"].value, 0);
    assert.deepEqual(g["zoocraft:climbing"]["minecraft:physics"], { has_gravity: false, has_collision: true });
    const bodies = { move: "zoocraft:moving", still: "zoocraft:still", climb: "zoocraft:climbing" };
    for (const [ev, own] of Object.entries(bodies)) {
      assert.deepEqual(e.events[`zoocraft:${ev}`], { remove: { component_groups: Object.values(bodies).filter((x) => x !== own) }, add: { component_groups: [own] } }, ev);
      assert.ok(g[own]["minecraft:physics"] && g[own]["minecraft:movement"], `${own} holds movement and physics`);
    }
    // What the engine walks it to.
    const seek = (k) => g[`zoocraft:seek_${k}`]["minecraft:behavior.move_to_block"].target_blocks;
    for (const b of ["minecraft:oak_log", "minecraft:dark_oak_wood", "minecraft:crimson_stem", BLOCKS.climbingFrame]) assert.ok(seek("climb").includes(b), b);
    assert.deepEqual(seek("water"), ["minecraft:water"]);
    assert.deepEqual(seek("puzzle"), [BLOCKS.puzzleFeeder]);
    assert.deepEqual(seek("bins"), ["zoocraft:litter_bin"]);
    assert.deepEqual([...e.events["zoocraft:seek_none"].remove.component_groups].sort(), ["zoocraft:seek_bins", "zoocraft:seek_climb", "zoocraft:seek_puzzle", "zoocraft:seek_water"]);
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(d.textures.cinnamon, "textures/entity/zoocraft/raccoon_cinnamon");
    for (const a of ["walk", "scramble", "idle", "climb", "cling", "down", "lookout", "sleep", "wash", "puzzle", "rummage", "look_at_target", "move"]) assert.ok(d.animations[a], a);
    assert.match(d.scripts.scale, /0\.5/);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${name}\\.name=`, "m"));
  }
  const zoo = read("../packs/BP/entities/raccoon.json")["minecraft:entity"];
  assert.ok(zoo.components["minecraft:persistent"] && zoo.component_groups["zoocraft:juvenile"]["minecraft:is_baby"]);
  assert.deepEqual(zoo.components["minecraft:damage_sensor"].triggers, [{ cause: "all", deals_damage: "no" }]);
  const wild = read("../packs/BP/entities/wild_raccoon.json")["minecraft:entity"];
  assert.ok(wild.components["minecraft:despawn"] && wild.components["minecraft:behavior.panic"]);
  assert.deepEqual(wild.components["minecraft:damage_sensor"].triggers, [{ cause: "fall", deals_damage: "no" }], "a climber that lets go lands unhurt");
  assert.deepEqual(wild.events["minecraft:entity_spawned"].randomize.map((r) => r.weight), [3, 1], "three Grey to one Cinnamon");
  for (const r of wild.events["minecraft:entity_spawned"].randomize) assert.ok(r.add.component_groups.includes("zoocraft:moving"), "spawned walking");
  // Every bone the animations move is in the model; the climbing poses turn on bones of their own.
  const geoBones = new Set(read("../packs/RP/models/entity/raccoon.geo.json")["minecraft:geometry"][0].bones.map((b) => b.name));
  for (const [name, anim] of Object.entries(read("../packs/RP/animations/raccoon.animation.json").animations)) for (const bone of Object.keys(anim.bones ?? {})) assert.ok(geoBones.has(bone), `${name} moves ${bone}`);
  for (const b of ["climb", "descend", "body", "head", "jaw", "lids", "tail", "tail2", "hand0", "hand1"]) assert.ok(geoBones.has(b), b);
  // The client plays what zoocraft:act says, and the eyes close asleep.
  const ctrl = read("../packs/RP/animation_controllers/raccoon.animation_controllers.json").animation_controllers["controller.animation.zoocraft.raccoon.move"];
  for (const [k, v] of Object.entries(R.ACT)) if (v) assert.ok(ctrl.states[k] && JSON.stringify(ctrl.states.idle.transitions).includes(`{"${k}":"query.property('zoocraft:act') == ${v}"}`), k);
  const rc = read("../packs/RP/render_controllers/raccoon.render_controllers.json").render_controllers["controller.render.zoocraft.raccoon"];
  assert.deepEqual(rc.part_visibility, [{ "*": true }, { lids: `query.property('zoocraft:act') == ${R.ACT.sleep}` }]);
  assert.equal(rc.textures[0], "query.variant == 1 ? Texture.cinnamon : Texture.default");
  const spawn = read("../packs/BP/spawn_rules/wild_raccoon.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(spawn["minecraft:brightness_filter"], { min: 0, max: 7, adjust_for_weather: false }, "out at night");
  assert.deepEqual(spawn["minecraft:biome_filter"].any_of.map((t) => t.value), ["forest", "swamp", "mangrove_swamp", "river"]);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const mats = (b) => [b.components, ...(b.permutations ?? []).map((p) => p.components)].flatMap((c) => Object.values(c["minecraft:material_instances"] ?? {}));
  const geos = new Set(readdirSync(new URL("../packs/RP/models/blocks/", import.meta.url)).filter((n) => n.endsWith(".json")).flatMap((n) => read(`../packs/RP/models/blocks/${n}`)["minecraft:geometry"].map((g) => g.description.identifier)));
  const geoOf = (c) => (typeof c["minecraft:geometry"] === "string" ? c["minecraft:geometry"] : c["minecraft:geometry"]?.identifier);
  // The Puzzle Feeder: a Basic Feeder's states, the food showing through the holes in its lid.
  const puzzle = read("../packs/BP/blocks/puzzle_feeder.json")["minecraft:block"];
  assert.deepEqual(puzzle.description.states, { "zoocraft:fill": [0, 1, 2], "zoocraft:food": [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11] });
  assert.ok(puzzle.components["zoocraft:feeder"]);
  assert.deepEqual(puzzle.components["minecraft:geometry"].bone_visibility, { food_low: "query.block_state('zoocraft:fill') == 1", food_high: "query.block_state('zoocraft:fill') == 2" });
  // The Climbing Frame: three blocks tall (the game's own multi-block), one item back whichever part breaks.
  const frame = read("../packs/BP/blocks/climbing_frame.json")["minecraft:block"];
  assert.deepEqual(frame.description.traits["minecraft:multi_block"], { enabled_states: ["minecraft:multi_block_part"], parts: 3, direction: "up" });
  assert.equal(frame.components["minecraft:loot"], "loot_tables/empty.json");
  assert.ok(frame.components["zoocraft:fixture"]);
  assert.deepEqual(frame.permutations.map((p) => geoOf(p.components)), ["geometry.zoocraft.climbing_frame_1", "geometry.zoocraft.climbing_frame_2"]);
  // The Litter Bin takes a latch and falls over.
  const bin = read("../packs/BP/blocks/litter_bin.json")["minecraft:block"];
  assert.deepEqual([bin.description.states["zoocraft:latched"], bin.description.states["zoocraft:tipped"]], [[false, true], [false, true]]);
  const vis = bin.components["minecraft:geometry"].bone_visibility;
  assert.equal(vis.latch, "query.block_state('zoocraft:latched') == true && query.block_state('zoocraft:tipped') == false");
  assert.equal(vis.fallen, "query.block_state('zoocraft:tipped') == true");
  assert.ok(bin.permutations.some((p) => p.condition === "query.block_state('zoocraft:tipped') == true" && p.components["minecraft:collision_box"]), "lying down it fills the ground it lies on");
  for (const b of [puzzle, frame, bin]) {
    for (const m of mats(b)) assert.ok(terrain[m.texture], m.texture);
    // One render method for all the material instances of a block (a content log error otherwise).
    assert.equal(new Set(mats(b).map((m) => m.render_method)).size, 1, b.description.identifier);
    for (const c of [b.components, ...(b.permutations ?? []).map((p) => p.components)]) if (geoOf(c)) assert.ok(geos.has(geoOf(c)), geoOf(c));
  }
  // Fruit Rations and the Bin Latch.
  for (const id of ["fruit_ration", "bin_latch"]) {
    assert.equal(read(`../packs/BP/items/${id}.json`)["minecraft:item"].description.identifier, `zoocraft:${id}`);
    assert.ok(read("../packs/RP/textures/item_texture.json").texture_data[`zoocraft:${id}`], id);
  }
  for (const f of ["apple", "sweet_berries", "glow_berries", "melon_slice"]) {
    const r = read(`../packs/BP/recipes/zoocraft_fruit_ration_${f}.json`)["minecraft:recipe_shapeless"];
    assert.deepEqual([r.result, r.tags], [{ item: ITEMS.fruitRation, count: 2 }, ["crafting_table", "zoocraft_workshop"]], f);
  }
  for (const r of ["zoocraft_puzzle_feeder", "zoocraft_climbing_frame", "zoocraft_bin_latch"]) assert.ok(read(`../packs/BP/recipes/${r}.json`), r);
  for (const k of ["item.zoocraft:fruit_ration", "item.zoocraft:bin_latch", "tile.zoocraft:puzzle_feeder", "tile.zoocraft:climbing_frame", "item.spawn_egg.entity.zoocraft:wild_raccoon"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
  // Basic Feeders and Hanging Food Baskets have a fruit look (zoocraft:food 8).
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  for (const fill of [1, 2]) assert.ok(feeder.permutations.some((p) => p.condition.includes(`fill') == ${fill}`) && p.condition.includes("food') == 8") && p.components["minecraft:material_instances"].up.texture === `zoocraft_feeder_fruit_${fill}` && terrain[`zoocraft_feeder_fruit_${fill}`]), fill);
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.ok(basket.description.states["zoocraft:food"].includes(8));
  assert.ok(basket.permutations.some((p) => p.condition.includes("== 8") && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_fruit"));
});

test("Flamingo: a wading flock that gets its pink from Flamingo Pellets and nests only as a rosy flock on mud at the water's edge, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, BLOCKS, FOOD_LOOK, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const { habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const { breedingCheck, flockFeel } = await import("../packs/BP/scripts/animals/breeding.js");
  const { serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const R = await import("../packs/BP/scripts/animals/flamingoRules.js");
  const F = BALANCE.flamingo;
  const fl = SPECIES["zoocraft:flamingo"];
  assert.equal(speciesForWild("zoocraft:wild_flamingo"), fl);
  assert.equal(pluralOf(fl), "Flamingos");
  assert.equal(fl.origin, "custom_overworld");
  assert.equal(fl.habitatProfile, "wading");
  assert.equal(fl.carrierProfile, "small");
  assert.ok(fl.wades && fl.pink);
  assert.deepEqual(fl.nest, { flock: 6, sites: 2, mirrorBirds: 2 });
  assert.deepEqual(fl.observe, ["spot", "filter", "oneleg", "display"]);
  assert.equal(fl.breeding.litter, 1, "one egg");
  assert.equal(fl.breeding.juvenileScale, 0.4, "the chicks' client scale (gen/sizes.py)");
  assert.equal(fl.baitItem, ITEMS.flamingoPellets);
  assert.deepEqual(F.bait, [ITEMS.flamingoPellets]);
  assert.deepEqual(RATIONS[ITEMS.flamingoPellets], { diet: "pellet", units: 1, label: "Flamingo Pellet", pink: true });
  assert.ok(fl.dietTags.includes("pellet") && fl.dietTags.includes("insect"));
  assert.ok(!Object.entries(RATIONS).some(([item, r]) => r.pink && item !== ITEMS.flamingoPellets), "only the pellets keep them pink");
  assert.equal(FOOD_LOOK.pellet, 9);
  assert.ok(BALANCE.shop[ITEMS.flamingoPellets], "the park shop sells Flamingo Pellets");
  assert.deepEqual(R.FLAMINGO_TYPES, ["zoocraft:flamingo", "zoocraft:wild_flamingo"]);
  assert.deepEqual([BLOCKS.flamingoNest, BLOCKS.flockMirror], ["zoocraft:flamingo_nest", "zoocraft:flock_mirror"]);
  // Wading: water 1 block deep (the ground right under it) in 16 or more spots; deeper water doesn't count.
  const wading = HABITAT_PROFILES.wading;
  assert.equal(wading.minShallowWater, 16);
  const room = { usableArea: 40, waterCells: 30, deepWaterCells: 10 };
  assert.equal(habitatProblem(room, wading, "Flamingo"), undefined, "20 spots 1 deep");
  assert.equal(habitatProblem({ ...room, deepWaterCells: 20 }, wading, "Flamingo"), "Flamingos wade in the shallows: water 1 block deep (the ground right under it) in at least 16 spots (now 10).");
  assert.equal(habitatProblem({ ...room, deepWaterCells: 20 }, HABITAT_PROFILES[SPECIES["zoocraft:otter"].habitatProfile], "Otter"), undefined, "only waders need shallows");
  // Nest sites: usable floor on mud right beside the water (here a pool dug a block down), counted only
  // when asked. A 9 x 9 pen: the east part a pool, 2 deep in the middle; mud along its west edge and one
  // more mud block further back.
  const grid = (x, y, z) => {
    if (x < -5 || x > 5 || z < -5 || z > 5) return "air";
    if (x === -5 || x === 5 || z === -5 || z === 5) return y === 0 || y === 1 ? "barrier" : y < 0 ? "solid" : "air";
    if (y >= 0) return "air";
    if (y === -1) return x >= 1 ? "water" : (x === 0 && Math.abs(z) <= 2) || (x === -3 && z === 0) ? "mud" : "solid";
    if (y === -2) return x >= 2 && x <= 3 && Math.abs(z) <= 2 ? "water" : "solid";
    return "solid";
  };
  const measure = (opts) => {
    const r = newResult({ x: -2, y: 0, z: 0 });
    const it = floodTerrestrial(grid, r.seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 3, cellsPerYield: 1e9, ...opts }, r);
    while (!it.next().done);
    return r;
  };
  const shore = measure({ countShore: true });
  assert.equal(shore.enclosed, true);
  assert.equal(shore.shoreMudCells, 5, "the mud along the pool, not the block further back");
  assert.deepEqual(shore.shoreMud.map((c) => c.join(",")).sort(), ["0,0,-1", "0,0,-2", "0,0,0", "0,0,1", "0,0,2"]);
  assert.equal(shore.mudCells, 0);
  assert.equal(measure({}).shoreMudCells, 0, "only counted when asked");
  assert.equal(measure({ countMud: true, countShore: true }).mudCells, 6);
  assert.equal(shore.waterCells - shore.deepWaterCells, 26, "the shallows");
  // Nesting: a flock of 6 grown-ups (each Flock Mirror counts as 2 more, up to twice the flock), mud at
  // the water's edge, and every grown-up rosy.
  assert.deepEqual([flockFeel(6, 0, fl.nest), flockFeel(4, 1, fl.nest), flockFeel(2, 3, fl.nest), flockFeel(1, 5, fl.nest)], [6, 6, 4, 2]);
  const B = BALANCE.breeding;
  const bird = (id, sex, extra = {}) => ({ id, name: id, sex, pink: 100, ...extra });
  const flock = [bird("Rosa", "female"), bird("Coral", "male"), bird("Blush", "female"), bird("Petal", "male"), bird("Lola", "female"), bird("Guava", "male")];
  const base = {
    on: true, species: fl, plural: "Flamingos", animals: flock, state: "occupied", usable: 400, required: (pop) => requiredArea(wading, pop),
    foodDays: 5, coveredCells: 40, usableArea: 300, goodDays: B.goodDays, day: 10, cooldownUntil: 0, welfareOf: () => 80,
    mirrors: 0, nestSites: 4, pinkOf: (a) => R.shadeOf(a.pink, F),
  };
  assert.equal(breedingCheck(base, B).ok, true);
  const four = { ...base, animals: flock.slice(0, 4) };
  assert.match(breedingCheck(four, B).reason, /^Flamingos nest only in a flock: 6 or more grown-ups \(now 4\)\. A Flock Mirror at the water's edge makes a small flock feel bigger/);
  assert.equal(breedingCheck({ ...four, mirrors: 1 }, B).ok, true, "a mirror makes 4 feel like 6");
  assert.match(breedingCheck({ ...base, animals: flock.slice(0, 2), mirrors: 3 }, B).reason, /\(now 2, and 3 Flock Mirrors make it feel like 4\)/);
  assert.match(breedingCheck({ ...base, nestSites: 1 }, B).reason, /mud to nest on at the water's edge: at least 2 mud blocks in the floor right beside the water \(1 now\)/);
  assert.match(breedingCheck({ ...base, nestSites: undefined }, B).reason, /so its nest sites can be counted/);
  const faded = flock.map((a, i) => (i < 3 ? { ...a, pink: 50 } : a));
  assert.match(breedingCheck({ ...base, animals: faded }, B).reason, /Every grown-up has to be rosy first: Rosa, Coral and 1 more aren't yet/);
  assert.match(breedingCheck({ ...base, animals: [{ ...flock[0], expecting: { daysLeft: 2 } }, ...flock.slice(1)] }, B).reason, /Rosa is nesting: the egg hatches in 2 park days/);
  assert.equal(breedingCheck({ ...base, animals: [...flock, bird("Fluff", "female", { juvenile: true, pink: 0 })] }, B).ok, true, "a grey chick doesn't hold the flock back");
  // Pink: a park day eating mostly pellets makes one pinker, any other day fades it: rosy, fading, pale.
  assert.deepEqual([100, 70, 69, 35, 34, 0, undefined].map((p) => R.shadeOf(p, F)), [0, 0, 1, 1, 2, 2, 0]);
  assert.deepEqual(R.pinkAfterDay(50, 4, 2, F), { pink: 84, fed: true }, "half of it pellets is enough");
  assert.deepEqual(R.pinkAfterDay(50, 4, 1, F), { pink: 30, fed: false });
  assert.deepEqual(R.pinkAfterDay(10, 0, 0, F), { pink: 0, fed: false }, "a day without food fades it too");
  assert.deepEqual(R.pinkAfterDay(90, 2, 2, F), { pink: 100, fed: true });
  const days = (pink, n, pellets) => Array.from({ length: n }, () => (pink = R.pinkAfterDay(pink, 2, pellets, F).pink)).map((p) => R.SHADES[R.shadeOf(p, F)]);
  assert.deepEqual(days(100, 4, 0), ["rosy", "fading", "fading", "pale"], "a rosy bird is pale after 4 park days without pellets");
  assert.deepEqual(days(0, 3, 2), ["pale", "fading", "rosy"], "and rosy again 3 park days back on them");
  assert.equal(R.pinkLine({ pink: 80, pinkFed: true }, F), `§fColour: §drosy §7(pink 80 of 100)§7. It ate mostly Flamingo Pellets last park day (+${F.pinkUp})`);
  assert.match(R.pinkLine({ pink: 20, pinkFed: false }, F), /§cpale §7\(pink 20 of 100\)§7\. It didn't get enough Flamingo Pellets last park day \(-20\)/);
  assert.match(R.pinkLine({ juvenile: true }, F), /grey down/);
  const warn = (grown, pellets) => R.pinkWarnings(grown, pellets, "Flamingos", F);
  assert.deepEqual(warn([bird("Rosa", "female")], true), []);
  assert.deepEqual(warn([bird("Rosa", "female")], false).map((w) => w.severity), [1]);
  assert.match(warn([bird("Rosa", "female")], false)[0].text, /^No Flamingo Pellets in the feeders: flamingos fed without them fade pale, and only a rosy flock nests\.$/);
  const dull = warn([bird("Rosa", "female", { pink: 50 }), bird("Coral", "male", { pink: 10 }), bird("Lola", "female")], true);
  assert.equal(dull.length, 1);
  assert.equal(dull[0].severity, 2);
  assert.match(dull[0].text, /^Rosa and Coral are turning pale: flamingos get their pink from their food\. Fill a feeder they eat from with Flamingo Pellets/);
  // The clipboard's flock line: grown-ups and mirrors, colours, shallows and nest sites against what nesting needs.
  assert.equal(
    R.flockLine({ waterCells: 30, deepWaterCells: 10, nestSites: 3 }, flock.slice(0, 4), 1, fl, wading, F),
    "§fFlock: §a4 grown-ups + 1 Flock Mirror (feels like 6)§7 (6 to nest); 4 rosy; shallows §a20§7 (16 needed); nest sites §a3§7 (mud by the water, 2 to nest)",
  );
  assert.match(R.flockLine({ waterCells: 12, deepWaterCells: 0 }, [bird("Rosa", "female", { pink: 50 }), bird("Coral", "male"), bird("Fluff", "female", { juvenile: true })], 0, fl, wading, F), /^§fFlock: §c2 grown-ups§7 \(6 to nest\); 1 rosy, 1 fading; shallows §c12§7 \(16 needed\); nest sites §cnot measured yet/);
  // A nest goes on the free nest site nearest the mother, never right beside another nest.
  const spots = [[0, 64, 0], [1, 64, 0], [5, 64, 0], [9, 64, 2]];
  assert.deepEqual(R.pickNestSpot(spots, [], { x: 4.6, y: 64, z: 0.5 }), { x: 5, y: 64, z: 0 });
  assert.deepEqual(R.pickNestSpot(spots, [{ x: 5, y: 64, z: 0 }], { x: 4.6, y: 64, z: 0.5 }), { x: 1, y: 64, z: 0 });
  assert.deepEqual(R.pickNestSpot(spots, [{ x: 1, y: 64, z: 0 }], { x: 0.4, y: 64, z: 0.5 }), { x: 5, y: 64, z: 0 }, "not right beside another nest");
  assert.equal(R.pickNestSpot([[0, 64, 0]], [{ x: 0, y: 64, z: 1 }], { x: 0, y: 64, z: 0 }), undefined);
  assert.equal(R.pickNestSpot(undefined, [], { x: 0, y: 64, z: 0 }), undefined, "not measured yet");
  // Its stage: building it the first park day, the egg in it after that, hatched while the chick is
  // young; then it crumbles (undefined), as it does when the mother leaves the exhibit.
  const rec = { id: "ne_1", exhibitId: "ex_1", motherId: "Rosa" };
  const mum = (daysLeft, extra = {}) => ({ ...flock[0], location: { kind: "exhibit", id: "ex_1" }, expecting: { daysLeft, nestId: "ne_1" }, ...extra });
  const gest = fl.breeding.gestationDays;
  assert.deepEqual([3, 2, 1].map((d) => R.nestStage(rec, mum(d), undefined, gest)), [0, 1, 1]);
  assert.equal(R.nestStage(rec, mum(2, { location: { kind: "carrier" } }), undefined, gest), undefined, "she was carried off");
  assert.equal(R.nestStage(rec, mum(2, { expecting: undefined }), undefined, gest), undefined);
  const chick = { juvenile: true, location: { kind: "exhibit", id: "ex_1" } };
  assert.equal(R.nestStage({ ...rec, youngId: "c" }, undefined, chick, gest), 2);
  assert.equal(R.nestStage({ ...rec, youngId: "c" }, undefined, { ...chick, juvenile: false }, gest), undefined, "grown up: it crumbles");
  // Both parents sit on the egg, in turns of a minute, the mother first.
  assert.deepEqual([0, F.sitTicks - 1, F.sitTicks, 2 * F.sitTicks].map((t) => R.sitterTurn(t, 0, F.sitTicks)), ["mother", "mother", "father", "mother"]);
  // A flock's mood: displays often when keen, never at night; acts by mood and footing.
  const seq = (...v) => {
    let i = 0;
    return () => v[i++ % v.length];
  };
  assert.equal(R.pickMood({ night: false, keen: true, wild: false }, F, seq(0.4)), "display");
  assert.equal(R.pickMood({ night: false, keen: false, wild: false }, F, seq(0.4, 0.5)), "wade", "an ordinary zoo flock displays less often");
  assert.equal(R.pickMood({ night: true, keen: true, wild: false }, F, seq(0)), "wade", "no displays at night");
  assert.equal(R.pickMood({ night: true, keen: true, wild: false }, F, seq(0.5)), "rest");
  assert.equal(R.pickAct("wade", "shallows", false, seq(0.1)), R.ACT.feed);
  assert.equal(R.pickAct("wade", "shallows", false, seq(0.7)), R.ACT.stamp);
  assert.equal(R.pickAct("wade", "shallows", true, seq(0.7)), undefined, "chicks don't stamp");
  assert.equal(R.pickAct("wade", "land", false, seq(0.1)), undefined, "feeding only in the shallows");
  assert.equal(R.pickAct("rest", "land", false, seq(0.1)), R.ACT.rest);
  assert.equal(R.pickAct("rest", "land", true, seq(0.1)), R.ACT.sit, "a chick lies down");
  assert.equal(R.pickAct("rest", "shallows", false, seq(0.6)), R.ACT.preen);
  assert.equal(R.pickAct("display", "land", false, seq(0.1)), R.ACT.flag);
  assert.equal(R.pickAct("display", "land", false, seq(0.6)), R.ACT.salute);
  assert.equal(R.pickAct("display", "land", true, seq(0.1)), undefined, "chicks don't display");
  assert.equal(R.pickAct("rest", "swim", false, seq(0.1)), undefined, "swimming it only swims");
  // Where it stands: the shallows (water with the bottom right under it), out of its depth, or land.
  const at = (blocks) => R.footing(climbReader(new Map(Object.entries(blocks))), { x: 0, y: 1, z: 0 });
  assert.equal(at({ "0,1,0": "water" }), "shallows");
  assert.equal(at({ "0,1,0": "water", "0,0,0": "water" }), "swim");
  assert.equal(at({ "0,1,0": "water", "0,2,0": "water" }), "swim", "water over its head");
  assert.equal(at({ "0,0,0": "water" }), "swim", "afloat on deeper water");
  assert.equal(at({}), "land");
  // Marches: level, a step up or a step down, stopping at a wall or the exhibit's edge.
  const march = (blocks, n, ok) => R.marchPath(climbReader(new Map(Object.entries(blocks))), { x: 0, y: 1, z: 0 }, { x: 1, z: 0 }, n, ok).map((c) => `${c.x},${c.y},${c.z}`);
  assert.deepEqual(march({ "3,1,0": "solid", "3,2,0": "solid" }, 5), ["1,1,0", "2,1,0"], "a wall");
  assert.deepEqual(march({ "3,1,0": "solid" }, 5), ["1,1,0", "2,1,0", "3,2,0", "4,1,0", "5,1,0"], "over a step and down again");
  assert.deepEqual(march({}, 5, (c) => c.x <= 2), ["1,1,0", "2,1,0"], "inside the exhibit");
  assert.deepEqual(march({ "1,2,0": "solid" }, 3), [], "no room for its head");
  assert.deepEqual([0, 0.5, 0.99].map((r) => R.turnBack(1, () => r)), [4, 5, 6], "right round, give or take 45 degrees");
  assert.deepEqual([R.yawTo(0, 1), R.yawTo(-1, 0), R.yawTo(1, 0), Math.abs(R.yawTo(0, -1))], [0, 90, -90, 180]);
  // Walks to the nest or a chick: over the floor and through the shallows, round deep water.
  const cells = new Map();
  for (let x = 0; x <= 4; x++) for (let z = 0; z <= 2; z++) cells.set(`${x},1,${z}`, "land");
  cells.set("2,1,1", "water");
  cells.set("2,1,0", "water");
  const pond = climbReader(new Map([["2,1,1", "water"], ["2,0,1", "water"], ["2,1,0", "water"]]));
  const way = R.walkPath(cells, pond, { x: 0, y: 1, z: 1 }, { x: 4, y: 1, z: 1 }, 12);
  assert.equal(way.length, 6);
  assert.deepEqual(way.at(-1), { x: 4, y: 1, z: 1 });
  assert.ok(!way.some((c) => c.x === 2 && c.z === 1), "round the deep water");
  assert.deepEqual(R.walkPath(cells, pond, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: 1 }, 12), []);
  assert.equal(R.walkPath(cells, pond, { x: 0, y: 1, z: 1 }, { x: 4, y: 1, z: 1 }, 3), undefined, "too far: the engine walks it there");
  // Wild birds in flocks: each joins the first flock with a bird close enough.
  assert.deepEqual(R.flocksOf([{ id: "a", x: 0, z: 0 }, { id: "b", x: 10, z: 0 }, { id: "c", x: 40, z: 0 }, { id: "d", x: 21, z: 0 }], 12), [0, 0, 1, 0]);
  // A Flock Mirror stands at the water's edge: water beside it, level with it or a block lower.
  const pos = { x: 0, y: 1, z: 0 };
  assert.equal(serves("mirror", new Map([["1,0,0", "water"]]), pos), true, "a block lower");
  assert.equal(serves("mirror", new Map([["-1,1,1", "water"]]), pos), true, "level, corner to corner");
  assert.equal(serves("mirror", new Map([["1,1,0", "land"]]), pos), false, "on dry ground");
  assert.equal(serves("mirror", new Map([["2,1,0", "water"]]), pos), false, "back from the water");
  // The nest is no obstacle (its cell is still floor, and a nest site); guests see past the mirror.
  assert.equal(classifyBlock(BLOCKS.flamingoNest, { isAir: false, isLiquid: false, open: false }), "air");
  assert.equal(blocksView(BLOCKS.flockMirror, { isAir: false, isLiquid: false }), false);
  // The Field Journal: spot one, watch one filter feeding, resting on one leg, and a flock displaying.
  assert.deepEqual(tasksSeen(fl, [], { filtering: true }), ["spot"], "spotted first");
  assert.deepEqual(tasksSeen(fl, ["spot"], { filtering: true }), ["filter"]);
  assert.deepEqual(tasksSeen(fl, ["spot", "filter"], { oneLeg: true }), ["oneleg"]);
  assert.deepEqual(tasksSeen(fl, ["spot", "filter", "oneleg"], { displaying: true }), ["display"]);
  assert.equal(levelOf(fl, ["spot", "filter"]), 2);
  assert.equal(levelOf(fl, fl.observe), 3);
  assert.deepEqual(R.DISPLAY_ACTS, [R.ACT.flag, R.ACT.march, R.ACT.salute]);
  // Wiring: the loops, the measure, the nests, pink from food, the mirror, the journal and the clipboard.
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const main = read("../packs/BP/scripts/main.js");
  assert.match(main, /loop\("flamingos", 10, \d+, \(\) => tickFlamingos\(system\.currentTick\)\)/);
  assert.match(main, /loop\("flamingomove", 1, \d+, tickFlamingoMoves\)/);
  assert.match(main, /initNursery\(\);\n    initFlamingos\(\);/);
  const ex = read("../packs/BP/scripts/exhibits/exhibits.js");
  assert.match(ex, /mud: wants\("mud"\) \|\| wants\("nest"\)/, "the reader tells mud apart for nest sites");
  assert.match(ex, /countShore: wants\("nest"\)/);
  assert.match(ex, /ex\.nestSites = anyWants\(ex, "nest"\) \? r\.shoreMudCells : undefined;/);
  const nursery = read("../packs/BP/scripts/animals/nursery.js");
  assert.match(nursery, /const nest = species\.nest \? makeNest\(ex, pair\.mother\) : species\.sandNest \? makeSandNest\(ex, pair\.mother\) : undefined;/);
  assert.match(nursery, /system\.runInterval\(syncNests, 40\);/);
  assert.match(nursery, /if \(block\.isAir\) block\.setType\(BLOCKS\.flamingoNest\);/, "a nest only goes on open ground");
  assert.match(nursery, /if \(block\.typeId === BLOCKS\.flamingoNest\) block\.setType\("minecraft:air"\);/, "and crumbles away without touching anything else");
  assert.match(nursery, /const spot = nest\?\.pos \?\? /, "the chick hatches on the nest");
  assert.match(nursery, /if \(pink\) a\.pink = 0;/, "a grown-up chick starts pale");
  assert.match(nursery, /mirrors: fixturesOf\(ex\)\.filter\(\(f\) => f\.type === "mirror"\)\.length,\n      nestSites: ex\.nestSites,/);
  const animals = read("../packs/BP/scripts/animals/animals.js");
  assert.match(animals, /if \(species\.pink\) a\.pink = 100;/, "caught ones come in rosy");
  assert.match(animals, /if \(pink\) a\.pelletsToday = \(a\.pelletsToday \?\? 0\) \+ took;/);
  assert.match(animals, /if \(species\.pink\) food\.sort\(/, "pellets first");
  assert.match(animals, /pinkWarnings\(residents\.filter\(\(a\) => !a\.juvenile\)/);
  const fla = read("../packs/BP/scripts/animals/flamingo.js");
  assert.match(fla, /entitiesNear\(player\.dimension, player\.location, RANGE, FLAMINGO_TYPES\)/, "found by type");
  assert.match(fla, /body\(e, s, "move"\);\n    seek\(e, s, "none"\);\n    setAct\(e, ACT\.none\);/, "a flamingo met again is put on its feet");
  assert.match(fla, /e\.triggerEvent\(`zoocraft:\$\{how\}`\)/);
  assert.match(fla, /e\.triggerEvent\(`zoocraft:seek_\$\{what\}`\)/);
  assert.match(fla, /const steps = top \? path : path\.slice\(0, -1\);/, "one builder up on the mound, its mate beside it");
  assert.match(fla, /on\("parkDay", pinkDay\)/);
  assert.match(read("../packs/BP/scripts/equipment/fixtures.js"), /\[BLOCKS\.flockMirror\]: "mirror"/);
  assert.match(read("../packs/BP/scripts/discovery/discovery.js"), /\.\.\.flamingoSight\(species, hit\)/);
  const clip = read("../packs/BP/scripts/ui/clipboard.js");
  assert.match(clip, /flockLine\(ex, animalsIn\(ex\)\.filter/);
  assert.match(clip, /pinkLine\(a, BALANCE\.flamingo\)/);
  assert.match(read("../packs/BP/scripts/ui/fieldJournal.js"), /Nesting: only in a flock, \$\{sp\.nest\.flock\} or more grown-ups/);
});

test("Flamingo, Flamingo Nest and Flock Mirror files: a flamingo in three shades of pink with a grey chick, wading or swimming, its displays and nest poses, a mud nest in three stages, a mirror for the water's edge, Flamingo Pellets and names", async () => {
  const R = await import("../packs/BP/scripts/animals/flamingoRules.js");
  const { BLOCKS, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  assert.equal(Math.max(...Object.values(R.ACT)), 11, "every act fits the property's range");
  for (const name of ["flamingo", "wild_flamingo"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.equal(e.description.identifier, `zoocraft:${name}`);
    assert.deepEqual(e.description.properties, {
      "zoocraft:act": { type: "int", range: [0, 11], default: 0, client_sync: true },
      "zoocraft:pink": { type: "int", range: [0, 2], default: 0, client_sync: true },
      "zoocraft:swim": { type: "bool", default: false, client_sync: true },
    });
    assert.deepEqual(e.components["minecraft:behavior.tempt"].items, [ITEMS.flamingoPellets]);
    assert.ok(e.components["minecraft:type_family"].family.includes("flamingo"));
    assert.deepEqual(e.components["minecraft:collision_box"], { width: 0.6, height: 1.5 });
    // Wading (walking on the bottom, never floating) or swimming (afloat): the environment sensor swaps
    // them by depth, and each brings its own navigation.
    const g = e.component_groups;
    assert.equal(e.components["minecraft:navigation.generic"], undefined, "navigation lives in the two groups");
    assert.equal(g["zoocraft:wading"]["minecraft:navigation.generic"].can_swim, false);
    assert.equal(g["zoocraft:wading"]["minecraft:behavior.float"], undefined, "a wader stands in the water");
    assert.equal(g["zoocraft:swimming"]["minecraft:navigation.generic"].can_swim, true);
    assert.ok(g["zoocraft:swimming"]["minecraft:behavior.float"]);
    assert.deepEqual(e.events["zoocraft:swim"], { remove: { component_groups: ["zoocraft:wading"] }, add: { component_groups: ["zoocraft:swimming"] }, set_property: { "zoocraft:swim": true } });
    assert.deepEqual(e.events["zoocraft:wade"], { remove: { component_groups: ["zoocraft:swimming"] }, add: { component_groups: ["zoocraft:wading"] }, set_property: { "zoocraft:swim": false } });
    const sensor = e.components["minecraft:environment_sensor"].triggers;
    assert.deepEqual(sensor.map((t) => t.event), ["zoocraft:swim", "zoocraft:wade"]);
    assert.deepEqual(sensor[0].filters.all_of[0], { test: "is_underwater", value: true }, "out of its depth");
    assert.ok(sensor[1].filters.all_of.some((f) => f.test === "is_baby" && f.value === false), "a chick stays afloat until animals/flamingo.js turns it back on the bank");
    // Walking or standing put: each event swaps the other out, and both hold movement and physics.
    const bodies = { move: "zoocraft:moving", still: "zoocraft:still" };
    for (const [ev, own] of Object.entries(bodies)) {
      assert.deepEqual(e.events[`zoocraft:${ev}`], { remove: { component_groups: Object.values(bodies).filter((x) => x !== own) }, add: { component_groups: [own] } }, ev);
      assert.ok(g[own]["minecraft:physics"] && g[own]["minecraft:movement"], `${own} holds movement and physics`);
    }
    assert.equal(g["zoocraft:still"]["minecraft:movement"].value, 0);
    // What the engine walks it to: into the water, onto the bank, or over to its nest.
    assert.ok(g["zoocraft:seek_water"]["minecraft:behavior.move_to_water"]);
    assert.ok(g["zoocraft:seek_land"]["minecraft:behavior.move_to_land"]);
    assert.deepEqual(g["zoocraft:seek_nest"]["minecraft:behavior.move_to_block"].target_blocks, [BLOCKS.flamingoNest]);
    assert.deepEqual([...e.events["zoocraft:seek_none"].remove.component_groups].sort(), ["zoocraft:seek_land", "zoocraft:seek_nest", "zoocraft:seek_water"]);
    for (const k of ["zoocraft:moving", "zoocraft:wading"]) assert.ok(e.events["minecraft:entity_spawned"].add.component_groups.includes(k), `spawned with ${k}`);
    // Keeping with its flock (zoo birds: only their own exhibit's).
    const follow = e.components["minecraft:behavior.follow_mob"];
    assert.equal(follow.use_home_position_restriction, name === "flamingo");
    assert.ok(follow.filters.all_of.some((f) => f.test === "is_family" && f.value === (name === "flamingo" ? "zoocraft_animal" : "wild_flamingo")));
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.deepEqual(d.textures, { default: "textures/entity/zoocraft/flamingo", fading: "textures/entity/zoocraft/flamingo_fading", pale: "textures/entity/zoocraft/flamingo_pale", chick: "textures/entity/zoocraft/flamingo_chick" });
    for (const a of ["walk", "march", "swim", "idle", "feed", "stamp", "preen", "rest", "flag", "salute", "build", "sit", "crop", "chick", "look_at_target", "move"]) assert.ok(d.animations[a], a);
    assert.match(d.scripts.scale, /0\.6/);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${name}\\.name=`, "m"));
  }
  const zoo = read("../packs/BP/entities/flamingo.json")["minecraft:entity"];
  assert.ok(zoo.components["minecraft:persistent"] && zoo.component_groups["zoocraft:juvenile"]["minecraft:is_baby"]);
  assert.deepEqual(zoo.components["minecraft:damage_sensor"].triggers, [{ cause: "all", deals_damage: "no" }]);
  const wild = read("../packs/BP/entities/wild_flamingo.json")["minecraft:entity"];
  assert.ok(wild.components["minecraft:despawn"] && wild.components["minecraft:behavior.panic"]);
  const shy = wild.components["minecraft:behavior.avoid_mob_type"].entity_types[0];
  assert.equal(shy.max_dist, BALANCE.flamingo.shyRange, "the engine keeps them as far off as the script says");
  assert.deepEqual(shy.filters.all_of, [{ test: "is_family", subject: "other", value: "player" }, { test: "is_sneaking", subject: "other", value: false }], "sneak up on them");
  // Every bone the animations move is in the model; the open wings, the chick's bill and the eyelids
  // are bones of their own.
  const geoBones = new Set(read("../packs/RP/models/entity/flamingo.geo.json")["minecraft:geometry"][0].bones.map((b) => b.name));
  for (const [name, anim] of Object.entries(read("../packs/RP/animations/flamingo.animation.json").animations)) for (const bone of Object.keys(anim.bones ?? {})) assert.ok(geoBones.has(bone), `${name} moves ${bone}`);
  for (const b of ["body", "tail", "neck1", "neck2", "neck3", "neck4", "look", "head", "bill", "billtip", "billkid", "lids", "foldL", "foldR", "wingL", "wingR", "legL", "shinL", "footL", "legR", "shinR", "footR"]) assert.ok(geoBones.has(b), b);
  // 0.1.73 (Austin: "Flamingos stand on only one foot"): standing about, preening and asleep, one leg is
  // folded up under the body (the thigh swung up and forward, the shin folded back up against it), the
  // legs taking turns; walking, the ankle (the joint that looks like a backward knee) folds the shin back
  // as the foot lifts.
  const fanims = read("../packs/RP/animations/flamingo.animation.json").animations;
  for (const n of ["idle", "preen", "rest"]) {
    const b = fanims[`animation.zoocraft.flamingo.${n}`].bones;
    for (const leg of ["legL", "legR", "shinL", "shinR"]) assert.ok(b[leg]?.rotation, `${n} moves ${leg}`);
    for (const side of ["L", "R"]) {
      assert.match(String(b[`leg${side}`].rotation[0]), /\* 100\b/, `${n}: the tucked thigh swings up and forward (${side})`);
      assert.match(String(b[`shin${side}`].rotation[0]), /\* -165\b/, `${n}: the tucked shin folds back up against it (${side})`);
    }
  }
  for (const n of ["walk", "march"]) for (const side of ["L", "R"]) assert.match(String(fanims[`animation.zoocraft.flamingo.${n}`].bones[`shin${side}`].rotation[0]), /^-math\.max\(0, /, `${n}: the ankle folds the shin back as the foot lifts (${side})`);
  // The client plays what zoocraft:act says while it isn't swimming.
  const ctrl = read("../packs/RP/animation_controllers/flamingo.animation_controllers.json").animation_controllers["controller.animation.zoocraft.flamingo.move"];
  for (const [k, v] of Object.entries(R.ACT)) {
    if (!v) continue;
    const st = k === "walk" ? "step" : k;
    assert.ok(ctrl.states[st] && JSON.stringify(ctrl.states.idle.transitions).includes(`{"${st}":"!query.property('zoocraft:swim') && query.property('zoocraft:act') == ${v}"}`), k);
  }
  assert.ok(JSON.stringify(ctrl.states.feed.transitions).includes(`{"swimming":"query.property('zoocraft:swim')"}`));
  const rc = read("../packs/RP/render_controllers/flamingo.render_controllers.json").render_controllers["controller.render.zoocraft.flamingo"];
  assert.deepEqual(rc.arrays.textures["Array.looks"], ["Texture.default", "Texture.fading", "Texture.pale", "Texture.chick"]);
  assert.equal(rc.textures[0], "Array.looks[query.is_baby ? 3 : query.property('zoocraft:pink')]", "its shade of pink; a chick is grey");
  const vis = Object.assign({}, ...rc.part_visibility);
  assert.equal(vis.wingL, `query.property('zoocraft:act') == ${R.ACT.salute}`, "the open wings only in the salute");
  assert.equal(vis.foldL, `!(query.property('zoocraft:act') == ${R.ACT.salute})`);
  assert.deepEqual([vis.bill, vis.billkid], ["!query.is_baby", "query.is_baby"], "a chick's bill is straight");
  const spawn = read("../packs/BP/spawn_rules/wild_flamingo.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(spawn["minecraft:brightness_filter"], { min: 7, max: 15, adjust_for_weather: false }, "out by day");
  assert.deepEqual(spawn["minecraft:herd"], { min_size: 4, max_size: 8 }, "in flocks");
  assert.deepEqual(spawn["minecraft:biome_filter"].any_of.slice(0, 2).map((t) => t.value), ["mangrove_swamp", "swamp"]);
  assert.deepEqual(spawn["minecraft:biome_filter"].any_of[2].all_of.map((t) => t.value), ["beach", "warm"]);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const mats = (b) => [b.components, ...(b.permutations ?? []).map((p) => p.components)].flatMap((c) => Object.values(c["minecraft:material_instances"] ?? {}));
  const geos = new Set(readdirSync(new URL("../packs/RP/models/blocks/", import.meta.url)).filter((n) => n.endsWith(".json")).flatMap((n) => read(`../packs/RP/models/blocks/${n}`)["minecraft:geometry"].map((x) => x.description.identifier)));
  const geoOf = (c) => (typeof c["minecraft:geometry"] === "string" ? c["minecraft:geometry"] : c["minecraft:geometry"]?.identifier);
  // The Flamingo Nest: placed by the script, its stage shown by bones: the heap, the mound, the egg, the shell.
  const nest = read("../packs/BP/blocks/flamingo_nest.json")["minecraft:block"];
  assert.deepEqual(nest.description.states, { "zoocraft:stage": [0, 1, 2] });
  assert.deepEqual(nest.description.menu_category, { category: "none" });
  assert.equal(nest.components["minecraft:collision_box"], false, "a flamingo stands in it");
  assert.equal(nest.components["minecraft:loot"], "loot_tables/empty.json");
  const stage = "query.block_state('zoocraft:stage')";
  assert.deepEqual(nest.components["minecraft:geometry"].bone_visibility, { heap: `${stage} == 0`, mound: `${stage} != 0`, egg: `${stage} == 1`, shell: `${stage} == 2` });
  // The Flock Mirror: it faces the one placing it; a fixture.
  const mirror = read("../packs/BP/blocks/flock_mirror.json")["minecraft:block"];
  assert.deepEqual(mirror.description.traits["minecraft:placement_direction"], { enabled_states: ["minecraft:cardinal_direction"], y_rotation_offset: 180 });
  assert.deepEqual(mirror.permutations.map((p) => p.components["minecraft:transformation"].rotation[1]), [180, 90, 270]);
  assert.ok(mirror.components["zoocraft:fixture"]);
  assert.equal(read(`../packs/BP/${mirror.components["minecraft:loot"]}`).pools[0].entries[0].name, BLOCKS.flockMirror);
  for (const b of [nest, mirror]) {
    for (const m of mats(b)) assert.ok(terrain[m.texture], m.texture);
    assert.equal(new Set(mats(b).map((m) => m.render_method)).size, 1, b.description.identifier);
    for (const c of [b.components, ...(b.permutations ?? []).map((p) => p.components)]) if (geoOf(c)) assert.ok(geos.has(geoOf(c)), geoOf(c));
  }
  // Flamingo Pellets: beetroot (the colour), dried kelp and a raw fish make 4.
  assert.equal(read("../packs/BP/items/flamingo_pellets.json")["minecraft:item"].description.identifier, ITEMS.flamingoPellets);
  assert.ok(read("../packs/RP/textures/item_texture.json").texture_data[ITEMS.flamingoPellets]);
  for (const f of ["cod", "salmon"]) {
    const r = read(`../packs/BP/recipes/zoocraft_flamingo_pellets_${f}.json`)["minecraft:recipe_shapeless"];
    assert.deepEqual([r.result, r.tags, r.ingredients.map((i) => i.item)], [{ item: ITEMS.flamingoPellets, count: 4 }, ["crafting_table", "zoocraft_workshop"], ["minecraft:beetroot", "minecraft:dried_kelp", `minecraft:${f}`]], f);
  }
  const mr = read("../packs/BP/recipes/zoocraft_flock_mirror.json")["minecraft:recipe_shaped"];
  assert.deepEqual([mr.tags, mr.result, mr.pattern], [["zoocraft_workshop"], { item: BLOCKS.flockMirror, count: 1 }, ["NGN", "NGN", "I I"]]);
  for (const k of ["item.zoocraft:flamingo_pellets", "tile.zoocraft:flamingo_nest", "tile.zoocraft:flock_mirror", "item.spawn_egg.entity.zoocraft:wild_flamingo"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
  // The pellet look (zoocraft:food 9) in the Basic Feeder, the Hanging Food Basket and the Puzzle Feeder.
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  for (const fill of [1, 2]) assert.ok(feeder.permutations.some((p) => p.condition.includes(`fill') == ${fill}`) && p.condition.includes("food') == 9") && p.components["minecraft:material_instances"].up.texture === `zoocraft_feeder_pellet_${fill}` && terrain[`zoocraft_feeder_pellet_${fill}`]), fill);
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  assert.deepEqual(basket.description.states["zoocraft:food"], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const puzzle = read("../packs/BP/blocks/puzzle_feeder.json")["minecraft:block"];
  for (const b of [basket, puzzle]) assert.ok(b.permutations.some((p) => p.condition === "query.block_state('zoocraft:food') == 9" && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_pellet"), b.description.identifier);
  assert.ok(terrain.zoocraft_basket_food_pellet);
});

// ---------- 0.1.74: the Zebra ----------

test("Zebra: a grazing harem that eats Grain Rations in rank order, from a Hay Rack too, walks off in single file and gallops from a fright, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, BLOCKS, FOOD_LOOK, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const { breedingCheck, rivalStallions } = await import("../packs/BP/scripts/animals/breeding.js");
  const { reachesFeeder } = await import("../packs/BP/scripts/equipment/rules.js");
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const M = await import("../packs/BP/scripts/exhibits/mixing.js");
  const R = await import("../packs/BP/scripts/animals/zebraRules.js");
  const Z = BALANCE.zebra;
  const zeb = SPECIES["zoocraft:zebra"];
  assert.equal(speciesForWild("zoocraft:wild_zebra"), zeb);
  assert.equal(pluralOf(zeb), "Zebras");
  assert.equal(zeb.origin, "custom_overworld");
  assert.equal(zeb.carrierProfile, "livestock");
  assert.equal(zeb.habitatProfile, "grassland");
  assert.deepEqual(zeb.dietTags, ["grain"]);
  assert.ok(zeb.harem && zeb.rack && zeb.feedRank);
  assert.deepEqual(zeb.graze, { perAnimal: 30, share: 0.5 });
  assert.deepEqual(zeb.observe, ["spot", "graze", "file", "groom"]);
  assert.deepEqual(zeb.coats, ["Burchell's", "Grant's"]);
  assert.equal(zeb.breeding.litter, 1, "one foal");
  assert.equal(zeb.breeding.juvenileScale, 0.6, "the foals' client scale (gen/sizes.py)");
  assert.equal(zeb.baitItem, ITEMS.grainRation);
  assert.deepEqual(Z.bait, [ITEMS.grainRation]);
  assert.deepEqual(RATIONS[ITEMS.grainRation], { diet: "grain", units: 1, label: "Grain Ration" });
  assert.equal(FOOD_LOOK.grain, 10);
  assert.ok(BALANCE.shop[ITEMS.grainRation], "the park shop sells Grain Rations");
  assert.deepEqual(R.ZEBRA_TYPES, ["zoocraft:zebra", "zoocraft:wild_zebra"]);
  assert.equal(BLOCKS.hayRack, "zoocraft:hay_rack");
  // Deer and elephants eat from a Hay Rack too; nobody else does, and the zebra reaches a Basic Feeder.
  assert.ok(SPECIES["zoocraft:deer"].rack && SPECIES["zoocraft:elephant"].rack);
  const rack = { rack: true };
  assert.deepEqual(Object.values(SPECIES).filter((s) => reachesFeeder(s, rack)).map((s) => s.id), ["zoocraft:deer", "zoocraft:elephant", "zoocraft:zebra"]);
  assert.equal(reachesFeeder(zeb, {}), true);
  assert.equal(reachesFeeder(zeb, { high: true }), false, "an Elevated Browse Feeder is a giraffe's");
  // The grassland: more room than deer, less than elephants; a savanna community with giraffes and elephants.
  const grass = HABITAT_PROFILES.grassland;
  assert.deepEqual(grass, { baseArea: 160, extraArea: 48, minHeight: 4 });
  assert.equal(requiredArea(grass, 3), 256);
  assert.ok(grass.baseArea > HABITAT_PROFILES[SPECIES["zoocraft:deer"].habitatProfile].baseArea && grass.baseArea < HABITAT_PROFILES[SPECIES["zoocraft:elephant"].habitatProfile].baseArea);
  assert.deepEqual(M.communitiesOf("zoocraft:zebra"), ["savanna"]);
  assert.deepEqual(M.companions("zoocraft:zebra", SPECIES), ["zoocraft:giraffe", "zoocraft:elephant"]);
  assert.equal(M.companyText(zeb, SPECIES), "Shares an exhibit with: Giraffes, Elephants (Savanna)");
  // Grass: a category of its own only for readers that ask (the measure, for grazers); grass plants stay passable.
  const c = (id, extra = {}) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, ...extra });
  assert.equal(c("minecraft:grass_block", { grass: true }), "grass");
  assert.equal(c("minecraft:grass_block"), "solid");
  assert.equal(c("minecraft:short_grass", { grass: true }), "air");
  assert.equal(c("minecraft:dirt", { grass: true }), "solid");
  assert.equal(blocksView(BLOCKS.hayRack, { isAir: false, isLiquid: false }), false, "guests see past a Hay Rack");
  // The measure counts usable floor standing on grass, when asked: a 9 x 9 pen, grass on its west half.
  const grid = (x, y, z) => {
    if (x < -5 || x > 5 || z < -5 || z > 5) return "air";
    if (x === -5 || x === 5 || z === -5 || z === 5) return y === 0 || y === 1 ? "barrier" : y < 0 ? "solid" : "air";
    if (y === -1) return x <= 0 ? "grass" : "solid";
    return y < -1 ? "solid" : "air";
  };
  const measure = (opts) => {
    const r = newResult({ x: 2, y: 0, z: 0 });
    const it = floodTerrestrial(grid, r.seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 4, cellsPerYield: 1e9, ...opts }, r);
    while (!it.next().done);
    return r;
  };
  const counted = measure({ countGrass: true });
  assert.equal(counted.enclosed, true, "grass is floor like any other");
  assert.equal(counted.usableArea, 81);
  assert.equal(counted.grassCells, 45, "the west half: 5 rows of 9");
  assert.equal(measure({}).grassCells, 0, "only counted when asked");
  // A Hay Rack is reached from the floor a block below it (hung on the fence) or level with it.
  const land = new Map([["1,0,0", "land"]]);
  assert.equal(isReachable(land, { x: 0, y: 1, z: 0 }, "land", [-1, 0]), true, "hung a block up");
  assert.equal(isReachable(land, { x: 0, y: 0, z: 0 }, "land", [-1, 0]), true, "on the floor");
  assert.equal(isReachable(land, { x: 0, y: 2, z: 0 }, "land", [-1, 0]), false, "out of reach two blocks up");
  assert.equal(isReachable(land, { x: 0, y: 1, z: 0 }), false, "a feeder is reached at the feet or a block below");
  // The harem: one stallion with the mares. Two grown stallions with mares are rivals; a bachelor group isn't.
  const z = (id, sex, extra = {}) => ({ id, name: id, sex, ...extra });
  const [S1, S2, A, B, N] = [z("Ziggy", "male"), z("Duma", "male"), z("Zola", "female"), z("Amani", "female"), z("Kesi", "female")];
  const fa = z("Tamu", "female", { juvenile: true, parents: ["Zola"], bornDay: 3 });
  const fb = z("Jabari", "male", { juvenile: true, parents: ["Amani"], bornDay: 7 });
  assert.deepEqual(rivalStallions([S1, A, B, fb], zeb), [], "a colt is no rival yet");
  assert.deepEqual(rivalStallions([S1, S2, A], zeb), [S1, S2]);
  assert.deepEqual(rivalStallions([S1, S2], zeb), [], "a bachelor group");
  assert.deepEqual([S1, A, fa].map((a) => R.roleOf(a, zeb)), ["stallion", "mare", "foal"]);
  // Breeding: never with rival stallions.
  const Bb = BALANCE.breeding;
  const base = {
    on: true, species: zeb, plural: "Zebras", animals: [S1, A, B], state: "occupied", usable: 400, required: (pop) => requiredArea(grass, pop),
    foodDays: 5, coveredCells: 40, usableArea: 300, goodDays: Bb.goodDays, day: 10, cooldownUntil: 0, welfareOf: () => 80,
  };
  assert.equal(breedingCheck(base, Bb).ok, true);
  assert.equal(breedingCheck({ ...base, animals: [S1, S2, A, B] }, Bb).reason, "Ziggy and Duma fight over the mares: zebras breed in harems, one stallion with his mares. Move the other stallions to a bachelor group of their own (an exhibit with no mares).");
  // Rank at the food: the stallion, the mares in the order they came (a newcomer last), a second stallion
  // after the mares; foals eat with their mothers.
  const order = ["Ziggy", "Zola", "Duma", "Amani"];
  assert.deepEqual(R.rankOrder([B, S2, A, S1, fa, N], zeb, order).map((a) => a.id), ["Ziggy", "Zola", "Amani", "Kesi", "Duma"]);
  assert.deepEqual(R.rankOrder([S2, S1], zeb, order).map((a) => a.id), ["Ziggy", "Duma"], "a bachelor group, in the order they came");
  // Feeding places: 2 at a Basic Feeder, 1 at a Puzzle Feeder, 4 at a Hay Rack; the lowest-ranking go without.
  assert.deepEqual(Z.places, { feeder: 2, puzzle: 1, rack: 4, trough: 2 });
  assert.equal(R.feedingPlaces([{}, rack, { puzzle: true }], Z.places), 7);
  assert.deepEqual(R.pushedOff([S1, A, B], 2), [B]);
  assert.deepEqual(R.pushedOff([S1, A, B], 4), []);
  // Grazing: 30 grass blocks each (a foal half) give up to half their food; less grass, less of it.
  assert.equal(R.grassNeeded([S1, A, B, fa], zeb.graze, Bb.juvenileWeight), 105);
  assert.deepEqual([105, 500, 42, 0, undefined].map((g) => R.grazeShare(g, 105, zeb.graze)), [0.5, 0.5, 0.2, 0, 0]);
  assert.deepEqual([undefined, 104, 105].map((g) => R.hasGrass(g, 105)), [true, false, true], "not counted yet is no complaint");
  // Welfare: grazing slows the hunger; one pushed off the food is fed only what the others leave; without
  // grass, or with rivals among the mares, comfort is capped.
  const zebra = (needs = {}) => ({ id: "Zola", needs: { satiety: 80, cleanliness: 100, enrichment: 80, comfort: 80, social: 80, ...needs }, health: 100 });
  const day = BALANCE.clock.dayLength;
  const ctx = { exhibitCleanliness: 100, spaceRatio: 1, groupSize: 4, feederUnits: 0 };
  const hungry = zebra();
  simulateAnimal(hungry, zeb, ctx, day, BALANCE);
  const grazing = zebra();
  simulateAnimal(grazing, zeb, { ...ctx, grazeShare: 0.5 }, day, BALANCE);
  assert.equal(80 - grazing.needs.satiety, (80 - hungry.needs.satiety) / 2, "half the hunger with half its food from the grass");
  const fed = simulateAnimal(zebra({ satiety: 40 }), zeb, { ...ctx, feederUnits: 20 }, day, BALANCE);
  const pushedAnimal = zebra({ satiety: 40 });
  const leftovers = simulateAnimal(pushedAnimal, zeb, { ...ctx, feederUnits: 20, satietyCap: Z.pushedSatiety }, day, BALANCE);
  assert.ok(pushedAnimal.needs.satiety <= Z.pushedSatiety && leftovers.unitsEaten < fed.unitsEaten, "pushed off: no more than 50");
  const noGrass = zebra({ comfort: 90 });
  simulateAnimal(noGrass, zeb, { ...ctx, graze: false }, day, BALANCE);
  assert.equal(noGrass.needs.comfort, BALANCE.graze.comfortCap);
  const rivals = zebra({ comfort: 90 });
  simulateAnimal(rivals, zeb, { ...ctx, harem: false }, day, BALANCE);
  assert.equal(rivals.needs.comfort, Z.rivalComfortCap);
  assert.deepEqual(comfortCauses({ ...ctx, graze: false, harem: false }, BALANCE), ["graze", "harem"]);
  assert.equal(adviceFor("comfort", zeb, ["graze", "harem"]), "Give the animals grass to graze (30 grass blocks in the floor for each) and one stallion with the mares (keep the other stallions together in a bachelor group)");
  assert.equal(adviceFor("satiety", zeb), "Fill the feeder or Hay Rack with Grain Rations");
  assert.equal(adviceFor("satiety", SPECIES["zoocraft:deer"]), "Fill the feeder or Hay Rack with Leafy Rations");
  assert.equal(adviceFor("satiety", zeb, [], Z.places), "Add feeding places: zebras feed in rank order, and this one gets pushed off the food by higher-ranking ones (a Basic Feeder has room for 2, a Hay Rack for 4)");
  // What players are told: care warnings, the clipboard's herd line and each zebra's place at the food.
  const warn = R.herdWarnings([S1, S2, A, B, fa], zeb, { places: 2, grassCells: 50, order, plural: "Zebras" }, Z, Bb.juvenileWeight);
  assert.deepEqual(warn.map((w) => w.severity), [2, 2, 2]);
  assert.equal(warn[0].text, "Ziggy and Duma fight over the mares: zebras live in harems, one stallion with his mares and their foals. Move the other stallions to a bachelor group of their own (an exhibit with no mares). Until then nobody here is settled, and none of them breeds.");
  assert.equal(warn[1].text, "Amani and Duma get pushed off the food by higher-ranking zebras: zebras feed in rank order, and there's room for 2 at the feeders. Add feeding places: a Basic Feeder has room for 2, a Hay Rack for 4.");
  assert.equal(warn[2].text, "Zebras graze: at least 135 grass blocks in the exhibit floor (50 now), 30 for each (a foal half). Grass spreads onto dirt beside it in the light, and grazing never wears it away.");
  assert.deepEqual(R.herdWarnings([S1, A, B], zeb, { places: 4, grassCells: 90, order, plural: "Zebras" }, Z, Bb.juvenileWeight), []);
  assert.deepEqual(R.herdWarnings([S1, A, B], zeb, { places: 0, grassCells: undefined, order, plural: "Zebras" }, Z, Bb.juvenileWeight), [], "an empty feeder has its own warning");
  assert.equal(R.herdLine({ grassCells: 120 }, [S1, A, B, fa], zeb, 4, Bb.juvenileWeight), "§fHerd: §7§a1 stallion§7, 2 mares, 1 foal; feeding places §a4§7 for 3 grown; grass §a120§7 (105 to graze)");
  assert.equal(R.herdLine({}, [S1, S2, A], zeb, 2, Bb.juvenileWeight), "§fHerd: §7§c2 stallions (rivals!)§7, 1 mare; feeding places §c2§7 for 3 grown; grass §anot counted yet§7 (90 to graze)");
  assert.match(R.herdLine({ grassCells: 10 }, [S1, S2], zeb, 2, Bb.juvenileWeight), /^§fHerd: §72 stallions \(a bachelor group\); feeding places §a2§7 for 2 grown; grass §c10§7/);
  assert.equal(R.rankLine(S1, [S1, A, B], zeb, order, 2), "§fAt the food: §71 of 3 in rank");
  assert.equal(R.rankLine(B, [S1, A, B], zeb, order, 2), "§fAt the food: §73 of 3 in rank, §cpushed off§7: room for 2 at the feeders");
  assert.equal(R.rankLine(B, [S1, A, B], zeb, order, 0), "§fAt the food: §73 of 3 in rank", "no feeding places at all is the empty-feeder warning");
  assert.equal(R.rankLine(fa, [S1, A, fa], zeb, order, 2), "§fAt the food: §7eats with its mother");
  assert.deepEqual([[S1], [S1, A], [S1, A, B, N]].map(R.namesOf), ["Ziggy", "Ziggy and Zola", "Ziggy, Zola and 2 more"]);
  // A herd's mood: grazing, trekking off or resting by day (resting more around midday), lying down at night.
  const seq = (...v) => {
    let i = 0;
    return () => v[i++ % v.length];
  };
  assert.deepEqual([0.1, 0.3, 0.6].map((r) => R.pickMood({ night: false, midday: false }, Z, seq(r))), ["rest", "trek", "graze"]);
  assert.deepEqual([0.3, 0.6, 0.8].map((r) => R.pickMood({ night: false, midday: true }, Z, seq(r))), ["rest", "trek", "graze"]);
  assert.equal(R.pickMood({ night: true, midday: false }, Z, seq(0.1)), "night");
  assert.deepEqual([3999, 4000, 6000, 7999, 8000, 30000, -18000].map(R.isMidday), [false, true, true, true, false, true, true]);
  // Single file: the mare with the youngest foal leads, each foal right behind its mother, the stallion at the rear.
  const m = (id, role, extra = {}) => ({ id, role, ...extra });
  const herd = [m("S", "stallion"), m("A", "mare"), m("B", "mare"), m("fa", "foal", { motherId: "A", born: 3 }), m("fb", "foal", { motherId: "B", born: 7 })];
  assert.deepEqual(R.fileOrder(herd, Z.fileGap), [{ id: "B", gap: 0 }, { id: "fb", gap: 2 }, { id: "A", gap: 3 }, { id: "fa", gap: 2 }, { id: "S", gap: 3 }]);
  assert.deepEqual(R.fileOrder([m("S", "stallion"), m("S2", "stallion"), m("A", "mare"), m("B", "mare")], Z.fileGap).map((x) => x.id), ["A", "B", "S2", "S"], "the top mare leads; a second stallion just ahead of the first");
  assert.deepEqual(R.fileOrder([m("S", "stallion"), m("S2", "stallion")], Z.fileGap), [{ id: "S", gap: 0 }, { id: "S2", gap: 3 }], "a bachelor group follows its top male");
  assert.equal(R.fileTarget(2, 3, 40, 0.05), 1);
  assert.equal(R.fileTarget(2, 6, 40, 0.05), 0, "it waits its turn");
  assert.deepEqual([[5, 5, false], [1, 3, false], [2, 3, false], [2, 3, true], [2.8, 3, true]].map(([h, w, t]) => R.filePace(h, w, t)), ["wait", "trot", "walk", "trot", "walk"]);
  // Walking gaits keep the hooves in time with the ground: the client's strides, in blocks a tick.
  assert.deepEqual([R.PACE.walk, R.PACE.trot, R.PACE.gallop].map((p) => Math.round(p * 20 * 100) / 100), [0.94, 2.25, 4.95]);
  assert.ok(Z.easeTrot > Z.easeWalk, "a run slows to a trot, then a walk");
  // Ways through the exhibit: round a wall, a step up only with headroom, never past the budget.
  const can = (cc) => cc.y === 0 && cc.x >= 0 && cc.x <= 4 && cc.z >= 0 && cc.z <= 2 && !(cc.x === 2 && cc.z < 2);
  const yes = () => true;
  const way = R.findWay(can, yes, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, 20);
  assert.equal(way.length, 8);
  assert.deepEqual(way.at(-1), { x: 4, y: 0, z: 0 });
  assert.ok(!way.some((cc) => cc.x === 2 && cc.z < 2), "round the wall");
  assert.equal(R.findWay(can, yes, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, 5), undefined, "too far");
  assert.equal(R.findWay(can, yes, { x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, 20, 6), undefined, "looked at too many blocks");
  assert.deepEqual(R.findWay(can, yes, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, 20), []);
  const steps = (cc) => cc.z === 0 && ((cc.y === 0 && cc.x <= 1 && cc.x >= 0) || (cc.y === 1 && cc.x >= 2 && cc.x <= 3));
  assert.deepEqual(R.findWay(steps, yes, { x: 0, y: 0, z: 0 }, { x: 3, y: 1, z: 0 }, 10), [{ x: 1, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 }]);
  assert.equal(R.findWay(steps, (cc) => cc.x !== 1, { x: 0, y: 0, z: 0 }, { x: 3, y: 1, z: 0 }, 10), undefined, "no room for its head to step up");
  // The glide: corners cut (every point inside the blocks of the way), its length, and a point along it.
  const pts = R.smoothWay({ x: 0.5, y: 0, z: 0.5 }, [{ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }]);
  assert.deepEqual([pts[0], pts.at(-1)], [{ x: 0.5, y: 0, z: 0.5 }, { x: 1.5, y: 0, z: 1.5 }]);
  assert.ok(pts.length > 3 && pts.every((p) => ["0,0", "1,0", "1,1"].includes(`${Math.floor(p.x)},${Math.floor(p.z)}`)), "it turns through the bend inside the way");
  // A post inside the bend (the block at 0, 1): the way bends in its block's middle, clear of the post.
  const bend = R.smoothWay({ x: 0.5, y: 0, z: 0.5 }, [{ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }], (cc) => !(cc.x === 0 && cc.z === 1));
  assert.ok(bend.some((p) => p.x === 1.5 && p.z === 0.5), "through the middle of the bend's block");
  assert.ok(bend.every((p) => p.x >= 0.5 || p.z <= 0.5), "never toward the post");
  assert.deepEqual(R.smoothWay({ x: 0.5, y: 0, z: 0.5 }, [{ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }], () => true), pts, "an open bend is cut as before");
  assert.equal(R.wayLength([{ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 }, { x: 3, y: 1, z: 4 }]), 5.5);
  const line = [{ x: 0, y: 0, z: 0 }, { x: 4, y: 0, z: 0 }, { x: 4, y: 0, z: 3 }];
  assert.deepEqual(R.pointAlong(line, 2), { x: 2, y: 0, z: 0, dx: 4, dz: 0 });
  assert.deepEqual(R.pointAlong(line, 5), { x: 4, y: 0, z: 1, dx: 0, dz: 3 });
  assert.deepEqual(R.pointAlong(line, 100), { x: 4, y: 0, z: 3, dx: 0, dz: 3 }, "the end, past it");
  // Facing: yaws, turning the short way round, and a spot beside it (a partner, the foal at the flank).
  assert.deepEqual([R.yawTo(0, 1), R.yawTo(-1, 0), R.yawTo(1, 0), Math.abs(R.yawTo(0, -1))], [0, 90, -90, 180]);
  assert.deepEqual([R.turnToward(0, 90, 30), R.turnToward(170, -170, 30), R.turnToward(170, -100, 30)], [30, -170, 200]);
  const round = (p) => ({ x: Math.round(p.x * 1000) / 1000 + 0, y: p.y, z: Math.round(p.z * 1000) / 1000 + 0 });
  assert.deepEqual(round(R.besideOf({ x: 0, y: 64, z: 0 }, 0, 1, 2)), { x: 1, y: 64, z: 2 }, "facing south its left is east");
  assert.deepEqual(round(R.besideOf({ x: 0, y: 64, z: 0 }, 90, 1, 2)), { x: -2, y: 64, z: 1 }, "facing west its left is south");
  // A fright: the nearest player sprinting up who isn't sneaking; they run straight away, else to either side.
  const runner = { x: 3, z: 0, sprinting: true, sneaking: false };
  assert.equal(R.threatOf([{ x: 0, z: 0 }], [runner], Z.startleRange), runner);
  assert.equal(R.threatOf([{ x: 0, z: 0 }], [{ ...runner, sneaking: true }], Z.startleRange), undefined, "sneak up on them");
  assert.equal(R.threatOf([{ x: 0, z: 0 }], [{ ...runner, sprinting: false }], Z.startleRange), undefined, "walking up is fine");
  assert.equal(R.threatOf([{ x: 0, z: 0 }], [{ ...runner, x: 9 }], Z.startleRange), undefined);
  assert.equal(R.threatOf([{ x: 0, z: 0 }], [{ ...runner, x: 9 }], Z.wildStartleRange).x, 9, "a wild herd startles further off");
  assert.deepEqual(R.headingsAway({ x: 0, z: 5 }, { x: 0, z: 0 }), [R.HEADINGS[0], R.HEADINGS[1], R.HEADINGS[7], R.HEADINGS[2], R.HEADINGS[6]]);
  assert.deepEqual(R.headingsAway({ x: 5, z: 0 }, { x: 0, z: 0 })[0], { x: 1, z: 0 }, "east, away from the west");
  const open = (cc) => cc.y === 0 && cc.x >= 0 && cc.x < 4 && cc.z >= 0 && cc.z <= 5;
  assert.deepEqual(R.runLine(open, yes, { x: 0, y: 0, z: 0 }, { x: 1, z: 0 }, 10), [{ x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }], "up to the wall");
  assert.deepEqual(R.runLine((cc) => open(cc) && !(cc.x === 1 && cc.z === 0), yes, { x: 0, y: 0, z: 0 }, { x: 1, z: 1 }, 5), [], "not between two blocks corner to corner");
  assert.deepEqual([R.headingIndex(0, 1), R.headingIndex(-1, 1), R.headingIndex(-1, 0), R.headingIndex(1, 0), R.headingIndex(0.2, -1)], [0, 1, 2, 6, 4], "the heading nearest a way");
  // Wild zebras in herds (a herd strung out across a plain, each a few blocks from the next, is one);
  // a wild one's sex fixed by its entity id, about a third of them stallions.
  assert.deepEqual(R.herdsOf([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 40, z: 0 }, { x: 21, z: 0 }], Z.herdReach), [0, 0, 1, 0]);
  assert.deepEqual(R.herdsOf([{ x: 0, z: 0 }, { x: 30, z: 0 }, { x: 15, z: 0 }], Z.herdReach), [0, 0, 0], "strung out, still one herd");
  assert.deepEqual(R.herdsOf([{ x: 50, z: 0 }, { x: 0, z: 0 }, { x: 64, z: 0 }, { x: 14, z: 0 }, { x: 100, z: 0 }], Z.herdReach), [0, 1, 0, 1, 2]);
  // Room: the ground each pose covers (measured off the model: gen/zeb_footprint.py), and how far two
  // crowd each other (a body or a head through the other's body; two heads together are fine).
  const fp = (x, z, yaw, how = "stand", foal = false) => R.footprintOf(x, z, yaw, how, foal);
  const r2 = (v) => Math.round(v * 100) / 100;
  const here = fp(0, 0, 0);
  assert.equal(R.crowding(here, fp(0.6, 0, 0)), 0, "side by side");
  assert.equal(R.crowding(here, fp(0, 2, 0)), 0, "nose to tail two blocks apart");
  assert.equal(R.crowding(here, fp(0, 2, 180)), 0, "nose to nose");
  assert.equal(r2(R.crowding(here, fp(0, 1, 0))), 0.48, "a block behind: in its rump");
  assert.equal(r2(R.crowding(here, fp(0, 1, 90))), 0.51, "across its front");
  for (const [side, foal] of [[Z.nurseSide, true], [Z.groomSide, false], [Z.restSide, false]]) {
    const at = R.besideOf({ x: 0, y: 0, z: 0 }, 0, side[0], side[1]);
    assert.equal(R.crowding(here, fp(at.x, at.z, 180, "stand", foal)), 0, "a pair's places leave them room");
  }
  assert.equal(R.crowding(fp(0, 0, 0, "lie"), fp(1, 0, 0)), 0, "beside one lying down");
  assert.ok(R.crowding(fp(0, 0, 0, "sleep"), fp(1, 0, 0)) > R.ROOM_TOUCH, "but not one flat out, legs to that side");
  assert.ok(R.crowding(fp(0, 0, 0, "stand", true), fp(0, 1, 0, "stand", true)) < R.crowding(here, fp(0, 1, 0)), "a foal is smaller");
  assert.deepEqual([...R.cellsUnder(fp(0.5, 0.5, 0).body, 64)].sort(), ["0,64,-1", "0,64,0", "0,64,1"], "the blocks under it");
  // Off the middle of its block beside a post, a way steps toward the middle first.
  const post = (cc) => !(cc.x === 1 && cc.z === 0);
  assert.ok(R.clearLine({ x: 0.5, y: 0, z: 0.5 }, { x: 0.5, y: 0, z: 2.5 }, post));
  assert.ok(!R.clearLine({ x: 0.9, y: 0, z: 0.5 }, { x: 0.9, y: 0, z: 2.5 }, post), "its body would brush the post");
  const off = R.smoothWay({ x: 0.9, y: 0, z: 0.2 }, [{ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 }], post);
  assert.ok(off[1].x < 0.9 && off.every((pt) => pt.x <= 0.9), "toward its block's middle, away from the post");
  const ids = Array.from({ length: 3000 }, (_, i) => `-${4294967295 - i * 7}`);
  assert.equal(R.wildSex(ids[0]), R.wildSex(ids[0]));
  const share = ids.filter((id) => R.wildSex(id) === "male").length / ids.length;
  assert.ok(share > 0.28 && share < 0.38, `stallions ${share}`);
  // Every act fits the property's range; lying, asleep and rolling are down.
  assert.equal(Math.max(...Object.values(R.ACT)), 26);
  assert.equal(new Set(Object.values(R.ACT)).size, Object.keys(R.ACT).length);
  assert.deepEqual(R.DOWN_ACTS, [R.ACT.lie, R.ACT.sleep, R.ACT.roll]);
  // The Field Journal: spot one, watch one grazing (really grazing: standing still in file doesn't
  // count), a herd walking in single file, and two grooming.
  const still = { onGround: true, inWater: false, still: true };
  assert.deepEqual(tasksSeen(zeb, [], still), ["spot"], "spotted first");
  assert.deepEqual(tasksSeen(zeb, ["spot"], { ...still, grazing: true }), ["graze"]);
  assert.deepEqual(tasksSeen(zeb, ["spot"], { ...still, grazing: false, inFile: true }), ["file"]);
  assert.deepEqual(tasksSeen(zeb, ["spot", "graze", "file"], { grooming: true }), ["groom"]);
  assert.deepEqual(tasksSeen(SPECIES["zoocraft:deer"], ["spot"], still), ["graze"], "a deer standing still grazes, as before");
  assert.equal(levelOf(zeb, zeb.observe), 3);
  // Wiring: the loops, the measure, feeders and racks, welfare, carriers, the nursery, the journal and the clipboard.
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const main = read("../packs/BP/scripts/main.js");
  assert.match(main, /loop\("zebras", 10, \d+, \(\) => tickZebras\(system\.currentTick\)\)/);
  assert.match(main, /loop\("zebramove", 1, \d+, tickZebraMoves\)/);
  assert.match(main, /initFlamingos\(\);\n    initZebras\(\);/);
  const ex = read("../packs/BP/scripts/exhibits/exhibits.js");
  assert.match(ex, /perch: true, grass: wants\("graze"\) \}\);/, "the reader tells grass apart for grazers");
  assert.match(ex, /countGrass: wants\("graze"\)/);
  assert.match(ex, /ex\.grassCells = anyWants\(ex, "graze"\) \? r\.grassCells : undefined;/);
  assert.match(ex, /isReachable\(r\.cells, f\.pos, f\.thermal \? "lava" : "land", f\.rack \? \[-1, 0\] : undefined\)/);
  const feeder = read("../packs/BP/scripts/equipment/feeder.js");
  assert.match(feeder, /if \(block\.typeId === BLOCKS\.hayRack\) rec\.rack = true;/);
  assert.match(feeder, /if \(rec\.rack && !RACK_DIETS\.includes\(RATIONS\[item\]\?\.diet\)\) return "§cA Hay Rack holds hay: Grain or Leafy Rations\.";/);
  assert.match(feeder, /block\?\.typeId !== BLOCKS\.puzzleFeeder && block\?\.typeId !== BLOCKS\.hayRack\) return;/, "its look shows the hay");
  assert.match(read("../packs/BP/scripts/equipment/rules.js"), /if \(feeder\.rack\) return Boolean\(species\.rack\);/);
  const animals = read("../packs/BP/scripts/animals/animals.js");
  assert.match(animals, /graze, harem, dens, ledge, coalition, privacy, solitary, bank: !short\.has\(a\.id\), submerge, drainFactor: drainFactor \* mealDrain\(a, species\), grazeShare: share, satietyCap: pushed\.has\(a\.id\) \? BALANCE\.zebra\.pushedSatiety : undefined, enrichmentPerDay/);
  assert.match(animals, /rationUnitsPerParkDay \* \(1 - grazeShareIn\(ex, species, residents\)\);/, "a grazer's food lasts longer");
  assert.match(animals, /herdWarnings\(residents, species, \{ places: feedingPlacesFor\(ex, species, feeders\)/);
  assert.match(read("../packs/BP/scripts/transport/carriers.js"), /const extra = species\.harem \? \{ sex: wildSex\(wild\.id\) \} : \{\};[^]*createAnimal\(species, coat, extra\)/, "a caught zebra stays the stallion or mare it was");
  assert.match(read("../packs/BP/scripts/animals/nursery.js"), /He's a young stallion now and will fight the stallion over the mares/);
  const zjs = read("../packs/BP/scripts/animals/zebra.js");
  assert.match(zjs, /entitiesNear\(player\.dimension, player\.location, KEEP_RANGE \+ Z\.herdReach, ZEBRA_TYPES\)/, "found by type");
  assert.match(zjs, /const close = \(b\) => \/\*\* @type \{number\} \*\/ \(near\.get\(b\.e\.id\)\) <= \(state\.has\(b\.e\.id\) \? KEEP_RANGE : RANGE\);/, "a herd is met within 48 blocks and kept till 56");
  assert.match(zjs, /if \(!met\(members\)\) continue;/, "a wild herd is met whole");
  assert.match(zjs, /body\(m\.e, s, "move"\);\n        setAct\(m\.e, ACT\.none\);/, "a zebra met again is put on its feet");
  assert.match(zjs, /if \(s\.body !== "move"\) e\.triggerEvent\("zoocraft:move"\);\n        setAct\(e, ACT\.none\);/, "and so is one left behind");
  assert.match(zjs, /e\.triggerEvent\(how === "move" \? "zoocraft:move" : "zoocraft:still"\)/);
  // The herd's goings on come round: grazing zebras look up for them, and one that can't happen just
  // now (those in it busy, too far apart, no room) is tried again a moment later, not a whole time later.
  assert.match(zjs, /function isFree\(m\) \{\n  return !isBusy\(m\) && \(m\.s\.phase === "idle" \|\| \(m\.s\.phase === "act" && m\.s\.act === ACT\.graze\)\);/);
  for (const [what, every] of [["herd", "herdEvery"], ["greet", "greetEvery"], ["\\[what\\]", "every"]]) {
    assert.match(zjs, new RegExp(`h\\.next\\.?${what} = now \\+ between\\(Z\\.tryAgain\\);`), `${what} tried again soon`);
    assert.match(zjs, new RegExp(`h\\.next\\.?${what} = now \\+ between\\((Z\\.)?${every}\\);`), `${what} then waits its time`);
  }
  assert.match(zjs, /if \(now >= next && isFree\(mother\) && far <= 12\) \{[\s\S]{0,200}?h\.next\[`nurse:\$\{m\.id\}`\] = now \+ between\(Z\.tryAgain\);/, "a foal nurses when it can");
  assert.match(zjs, /if \(dist\(a, b\) > Z\.rivalReach\) return;/);
  // One strolling about (the engine walking it) stops short of another and grazes there; a file's
  // walkers graze where they stop only with room (stepping off first), and a grazer in a file's way
  // steps off it.
  assert.match(zjs, /if \(walksInto\(m, ctx\)\) \{\n      s\.was = undefined;\n      const act = h\.mood === "graze" \? ACT\.graze : ACT\.none;\n      if \(inRoom\(m, ctx, Z, "stand", \(t\) => startAct\(m, t, act, act === ACT\.graze \? Z\.grazeTicks : Z\.stopTicks\)\)\) return;/);
  assert.match(zjs, /if \(deeper > ROOM_TOUCH && deeper > crowding\(here, q\) \+ 0\.02\) return true;/);
  assert.match(zjs, /if \(ok && inRoom\(m, ctx, Z, "stand", \(t2\) => startAct\(m, t2, ACT\.graze, Z\.grazeTicks\)\)\) return;/);
  assert.match(zjs, /if \(s\.act === ACT\.graze && onTrekWay\(ctx, m, footprintHere\(m\), m\.e\.location\.y\) && makeRoom\(/);
  assert.deepEqual(BALANCE.zebra.stopTicks, [40, 80]);
  // One boxed in steps out between the others (no look ahead turns it back); in the wild, nowhere within
  // its shy range of someone not sneaking is a place to stop (it would only be walked off again).
  assert.match(zjs, /glide\(m, way, \{ act: ACT\.step, pace: PACE\.walk, face: yaw, how, boxed \}/);
  assert.match(zjs, /if \(g\.file \|\| g\.boxed \|\| g\.act === ACT\.trot/);
  assert.match(zjs, /return !crowderOf\(ctx, m, fp, partner\) && !onTrekWay\(ctx, m, fp, m\.e\.location\.y\) && !shyAt\(ctx, m, x, z\);/);
  assert.match(zjs, /if \(p\.isSneaking \|\| p\.dimension\.id !== m\.e\.dimension\.id \|\| Z\.bait\.includes\(heldItem\(p\)\?\.typeId \?\? ""\)\) continue;\n      const l = p\.location;\n      if \(Math\.hypot\(l\.x - x, l\.y - y, l\.z - z\) <= Z\.shyRange\) return true;/);
  assert.match(zjs, /ctx\.players = players;/);
  // Two setting off the same way keep one behind the other, whatever their ranks.
  assert.match(zjs, /const ahead = \(ol\.x - l\.x\) \* dir\.x \+ \(ol\.z - l\.z\) \* dir\.z > 0;\n[^\n]*const sameWay = [^\n]*> 0\.5;\n    if \(ahead && sameWay\) return true;/);
  assert.deepEqual([BALANCE.zebra.tryAgain, BALANCE.zebra.rivalReach], [[60, 140], 24]);
  assert.match(read("../packs/BP/scripts/discovery/discovery.js"), /\.\.\.zebraSight\(species, hit\)/);
  const clip = read("../packs/BP/scripts/ui/clipboard.js");
  assert.match(clip, /herdLine\(ex, animalsIn\(ex\)\.filter\(\(a\) => a\.speciesId === herder\.id\), herder, feedingPlacesFor\(ex, herder\)/);
  assert.match(clip, /rankLine\(a, herd, species, ex\.animalIds, feedingPlacesFor\(ex, species\)\)/);
  assert.match(clip, /\$\{ex\.grassCells !== undefined \? `, \$\{ex\.grassCells\} grass` : ""\}/);
  const journal = read("../packs/BP/scripts/ui/fieldJournal.js");
  for (const line of [/Grain Rations: 2 wheat make 2, a hay bale makes 9/, /Hay Rack: they eat from one too/, /Grazing: \$\{sp\.graze\.perAnimal\} grass blocks/, /Harems: one stallion with his mares/, /Rank at the food: the stallion first/, /they walk off in single file/]) assert.match(journal, line);
});

test("Zebra, Hay Rack and Grain Ration files: a zebra in two coats and a brown foal, with grazing, herd, resting and fright poses, a hay rack hung on the fence that shows its hay, the grain look in the feeders, recipes and names", async () => {
  const R = await import("../packs/BP/scripts/animals/zebraRules.js");
  const { BLOCKS, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const Z = BALANCE.zebra;
  for (const name of ["zebra", "wild_zebra"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.equal(e.description.identifier, `zoocraft:${name}`);
    assert.deepEqual(e.description.properties, { "zoocraft:act": { type: "int", range: [0, 26], default: 0, client_sync: true } });
    assert.deepEqual(e.components["minecraft:behavior.tempt"].items, [ITEMS.grainRation, "wheat", "hay_block"]);
    assert.ok(e.components["minecraft:type_family"].family.includes("zebra"));
    assert.deepEqual(e.components["minecraft:collision_box"], { width: 0.9, height: 1.7 });
    // Walking where the engine takes it, or standing put (grazing, lying down, or a script walk carrying
    // it): each event swaps the other out, and both groups hold movement and physics.
    const g = e.component_groups;
    const bodies = { move: "zoocraft:moving", still: "zoocraft:still" };
    for (const [ev, own] of Object.entries(bodies)) {
      assert.deepEqual(e.events[`zoocraft:${ev}`], { remove: { component_groups: Object.values(bodies).filter((x) => x !== own) }, add: { component_groups: [own] } }, ev);
      assert.ok(g[own]["minecraft:physics"] && g[own]["minecraft:movement"], `${own} holds movement and physics`);
    }
    assert.equal(g["zoocraft:still"]["minecraft:movement"].value, 0);
    // Pushed by others only while walking where the engine takes it: standing put (a foal at its mother's
    // flank, a pair grooming side by side) it isn't shoved apart. Pistons still push it.
    assert.equal(e.components["minecraft:pushable_by_entity"], undefined);
    assert.ok(g["zoocraft:moving"]["minecraft:pushable_by_entity"]);
    assert.equal(g["zoocraft:still"]["minecraft:pushable_by_entity"], undefined);
    assert.ok(e.components["minecraft:pushable_by_block"]);
    assert.equal(g["zoocraft:still"]["minecraft:behavior.random_look_around"], undefined, "a zebra held still doesn't turn its head about");
    // Two coats: Burchell's (0) and Grant's (1).
    for (const n of [0, 1]) assert.deepEqual(e.events[`zoocraft:coat_${n}`], { remove: { component_groups: [`zoocraft:coat_${1 - n}`] }, add: { component_groups: [`zoocraft:coat_${n}`] } });
    // Keeping with its herd: a wild zebra drifts toward a herdmate (12 blocks round, till 6 off); an
    // exhibit's zebras don't (the pen holds them and the script keeps them a herd).
    const follow = e.components["minecraft:behavior.follow_mob"];
    if (name === "zebra") assert.equal(follow, undefined, "an exhibit's zebras don't drift into one another");
    else {
      assert.deepEqual([follow.priority, follow.search_range, follow.stop_distance], [6, 12, 6]);
      assert.deepEqual(follow.filters.all_of.map((f) => [f.test, f.subject, f.value]), [["is_family", "other", "zebra"], ["is_family", "other", "wild_zebra"]]);
    }
    assert.equal(e.components["minecraft:behavior.follow_parent"].priority, 5, "a foal keeps with its mother");
    const d = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.deepEqual(d.textures, { default: "textures/entity/zoocraft/zebra", grant: "textures/entity/zoocraft/zebra_grant", foal: "textures/entity/zoocraft/zebra_foal" });
    for (const a of ["walk", "walk_t", "trot", "gallop", "idle", "graze", "alert", "bark", "doze", "groom", "rest", "shake", "nurse", "play", "spar", "fight", "drink", "rack", "rack_low", "feed", "greet", "kick", "watch", "lie_down", "get_up", "roll", "to_sleep", "wake", "lie", "sleep", "foal", "look_at_target", "move"]) assert.ok(d.animations[a], a);
    assert.match(d.scripts.scale, /0\.5/);
    assert.match(lang, new RegExp(`^entity\\.zoocraft:${name}\\.name=`, "m"));
  }
  const zoo = read("../packs/BP/entities/zebra.json")["minecraft:entity"];
  assert.ok(zoo.components["minecraft:persistent"] && zoo.component_groups["zoocraft:juvenile"]["minecraft:is_baby"]);
  assert.deepEqual(zoo.components["minecraft:damage_sensor"].triggers, [{ cause: "all", deals_damage: "no" }]);
  assert.ok(zoo.events["minecraft:entity_spawned"].add.component_groups.includes("zoocraft:moving"), "spawned on its feet");
  const wild = read("../packs/BP/entities/wild_zebra.json")["minecraft:entity"];
  assert.ok(wild.components["minecraft:despawn"] && wild.components["minecraft:behavior.panic"]);
  for (const branch of wild.events["minecraft:entity_spawned"].randomize) assert.ok(branch.add.component_groups.includes("zoocraft:moving"), "each coat spawns on its feet");
  const shy = wild.components["minecraft:behavior.avoid_mob_type"].entity_types[0];
  assert.equal(shy.max_dist, Z.shyRange, "the engine keeps them as far off as the script says");
  assert.deepEqual(shy.filters.all_of, [{ test: "is_family", subject: "other", value: "player" }, { test: "is_sneaking", subject: "other", value: false }], "sneak up on them");
  // Every bone the animations move is in the model; the eyelids, the jaw and the ears are bones of their own.
  const geoBones = new Set(read("../packs/RP/models/entity/zebra.geo.json")["minecraft:geometry"][0].bones.map((b) => b.name));
  const anims = read("../packs/RP/animations/zebra.animation.json").animations;
  for (const [name, anim] of Object.entries(anims)) for (const bone of Object.keys(anim.bones ?? {})) assert.ok(geoBones.has(bone), `${name} moves ${bone}`);
  for (const b of ["body", "neck", "mane", "head", "jaw", "lids", "earL", "earR", "tail", "tuft", "armL", "forearmL", "fcannonL", "fhoofL", "thighL", "gaskinL", "hcannonL", "hhoofL", "armR", "hhoofR"]) assert.ok(geoBones.has(b), b);
  // The script waits out lying down, getting up, rolling, falling asleep and waking: the same lengths.
  const len = (n) => Math.round(anims[`animation.zoocraft.zebra.${n}`].animation_length * 20);
  assert.deepEqual([len("lie_down"), len("get_up"), len("roll"), len("to_sleep"), len("wake")], [Z.downTicks, Z.upTicks, Z.rollTicks, Z.toSleepTicks, Z.wakeTicks]);
  // The client plays what zoocraft:act says: each standing act its own state, lying, asleep and rolling
  // by way of lying down.
  const ctrl = read("../packs/RP/animation_controllers/zebra.animation_controllers.json").animation_controllers["controller.animation.zoocraft.zebra.move"];
  const stateOf = { none: "idle", rackLow: "rack_low" };
  for (const [k, v] of Object.entries(R.ACT)) {
    if (!v) continue;
    const from = R.DOWN_ACTS.includes(v) ? ctrl.states.lie_down : ctrl.states.idle;
    const st = stateOf[k] ?? k;
    assert.ok(ctrl.states[st], k);
    assert.ok(from.transitions.some((t) => String(t[st] ?? "").includes(`v.act == ${v}`)), k);
  }
  assert.ok(ctrl.states.idle.transitions.some((t) => t.lie_down === "v.down"), "down first");
  const rc = read("../packs/RP/render_controllers/zebra.render_controllers.json").render_controllers["controller.render.zoocraft.zebra"];
  assert.deepEqual(rc.arrays.textures["Array.coats"], ["Texture.default", "Texture.grant", "Texture.foal"]);
  assert.equal(rc.textures[0], "Array.coats[q.is_baby ? 2 : q.variant]", "its coat; a foal is brown");
  const vis = Object.assign({}, ...rc.part_visibility);
  assert.match(vis.lids, new RegExp(`== ${R.ACT.doze} \\|\\| .*== ${R.ACT.sleep} \\|\\| .*== ${R.ACT.rest} \\|\\| math\\.mod`), "eyes shut dozing, asleep and resting a chin, and a blink");
  const spawn = read("../packs/BP/spawn_rules/wild_zebra.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(spawn["minecraft:biome_filter"], { test: "has_biome_tag", value: "savanna" });
  assert.deepEqual(spawn["minecraft:herd"], { min_size: 3, max_size: 6 }, "in herds");
  assert.deepEqual(spawn["minecraft:brightness_filter"], { min: 7, max: 15, adjust_for_weather: false }, "out by day");
  assert.deepEqual(spawn["minecraft:spawns_on_block_filter"], ["minecraft:grass_block", "minecraft:coarse_dirt", "minecraft:dirt"]);
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  const mats = (b) => [b.components, ...(b.permutations ?? []).map((p) => p.components)].flatMap((cc) => Object.values(cc["minecraft:material_instances"] ?? {}));
  const geos = new Set(readdirSync(new URL("../packs/RP/models/blocks/", import.meta.url)).filter((n) => n.endsWith(".json")).flatMap((n) => read(`../packs/RP/models/blocks/${n}`)["minecraft:geometry"].map((x) => x.description.identifier)));
  // The Hay Rack: a feeder hung on the fence (or stood on the floor) facing the one placing it; its hay
  // shows how full it is, golden with Grain Rations and green with Leafy Rations.
  const hay = read("../packs/BP/blocks/hay_rack.json")["minecraft:block"];
  assert.deepEqual(hay.description.states, { "zoocraft:fill": [0, 1, 2], "zoocraft:food": [0, 10] });
  assert.deepEqual(hay.description.traits["minecraft:placement_direction"], { enabled_states: ["minecraft:cardinal_direction"], y_rotation_offset: 180 });
  assert.ok(hay.components["zoocraft:feeder"], "a feeder like the others");
  assert.deepEqual(hay.components["minecraft:geometry"].bone_visibility, { hay_low: "query.block_state('zoocraft:fill') >= 1", hay_high: "query.block_state('zoocraft:fill') == 2" });
  assert.deepEqual(hay.permutations.filter((p) => p.components["minecraft:transformation"]).map((p) => p.components["minecraft:transformation"].rotation[1]), [180, 90, 270]);
  const golden = hay.permutations.find((p) => p.condition === "query.block_state('zoocraft:food') == 10");
  assert.equal(golden.components["minecraft:material_instances"].hay.texture, "zoocraft_rack_hay_grain");
  assert.equal(hay.components["minecraft:material_instances"].hay.texture, "zoocraft_rack_hay_leafy");
  assert.equal(read(`../packs/BP/${hay.components["minecraft:loot"]}`).pools[0].entries[0].name, BLOCKS.hayRack);
  for (const m of mats(hay)) assert.ok(terrain[m.texture], m.texture);
  assert.equal(new Set(mats(hay).map((m) => m.render_method)).size, 1, "one render method");
  assert.ok(geos.has(hay.components["minecraft:geometry"].identifier));
  const hr = read("../packs/BP/recipes/zoocraft_hay_rack.json")["minecraft:recipe_shaped"];
  assert.deepEqual([hr.tags, hr.result, hr.pattern], [["zoocraft_workshop"], { item: BLOCKS.hayRack, count: 1 }, ["S S", "SHS", "PPP"]]);
  assert.deepEqual([hr.key.S, hr.key.H, hr.key.P], [{ item: "minecraft:stick" }, { item: "minecraft:hay_block" }, { tag: "minecraft:planks" }]);
  // Grain Rations: 2 wheat make 2, a hay bale makes 9.
  assert.equal(read("../packs/BP/items/grain_ration.json")["minecraft:item"].description.identifier, ITEMS.grainRation);
  assert.ok(read("../packs/RP/textures/item_texture.json").texture_data[ITEMS.grainRation]);
  const wheat = read("../packs/BP/recipes/zoocraft_grain_ration.json")["minecraft:recipe_shapeless"];
  assert.deepEqual([wheat.result, wheat.tags, wheat.ingredients.map((i) => i.item)], [{ item: ITEMS.grainRation, count: 2 }, ["crafting_table", "zoocraft_workshop"], ["minecraft:wheat", "minecraft:wheat"]]);
  const bale = read("../packs/BP/recipes/zoocraft_grain_ration_hay.json")["minecraft:recipe_shapeless"];
  assert.deepEqual([bale.result, bale.ingredients.map((i) => i.item)], [{ item: ITEMS.grainRation, count: 9 }, ["minecraft:hay_block"]]);
  for (const k of ["item.zoocraft:grain_ration", "tile.zoocraft:hay_rack", "item.spawn_egg.entity.zoocraft:wild_zebra"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
  // The grain look (zoocraft:food 10) in the Basic Feeder, the Hanging Food Basket and the Puzzle Feeder.
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  for (const fill of [1, 2]) assert.ok(feeder.permutations.some((p) => p.condition.includes(`fill') == ${fill}`) && p.condition.includes("food') == 10") && p.components["minecraft:material_instances"].up.texture === `zoocraft_feeder_grain_${fill}` && terrain[`zoocraft_feeder_grain_${fill}`]), fill);
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  const puzzle = read("../packs/BP/blocks/puzzle_feeder.json")["minecraft:block"];
  for (const b of [basket, puzzle]) assert.ok(b.permutations.some((p) => p.condition === "query.block_state('zoocraft:food') == 10" && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_grain"), b.description.identifier);
  assert.ok(terrain.zoocraft_basket_food_grain);
});

// ---------- 0.1.75: Big predators, secure keeper access and the Lion ----------

test("Big predators: Holding Dens, the double Keeper Gate, keepers who shift them first, Warn then swipe, fast days, and crating only from a den or while a wild one eats", async () => {
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const P = await import("../packs/BP/scripts/animals/predatorRules.js");
  const D = BALANCE.predators.danger;
  const lion = SPECIES["zoocraft:lion"];
  // Warn, then swipe: a player inside, in Survival, comes within warnRange: a warning; it waits warnTicks
  // (sneaking, sneakWarnTicks), then charges anyone within strikeRange; at reach the swipe, then it backs off.
  const see = (dist, extra = {}) => ({ inside: true, vulnerable: true, denned: false, dist, sneaking: false, ...extra });
  let s = P.dangerStep(undefined, see(D.warnRange + 1), 0, D);
  assert.equal(s.phase, "calm");
  s = P.dangerStep(s, see(D.warnRange), 10, D);
  assert.equal(s.phase, "warn");
  assert.equal(P.dangerStep(s, see(D.strikeRange), 10 + D.warnTicks - 1, D).phase, "warn", "a warning first");
  assert.equal(P.dangerStep(s, see(D.strikeRange, { sneaking: true }), 10 + D.warnTicks, D).phase, "warn", "sneaking makes the warning longer");
  assert.equal(P.dangerStep(s, see(D.strikeRange + 0.5), 10 + D.warnTicks, D).phase, "warn", "only charges someone within strike range");
  assert.equal(P.dangerStep(s, see(D.closeRange), 11, D).phase, "charge", "walking right up to it");
  assert.equal(P.dangerStep(s, see(D.warnRange + D.leaveSlack + 0.1), 11, D).phase, "calm", "backing away ends it");
  s = P.dangerStep(s, see(D.strikeRange), 10 + D.warnTicks, D);
  assert.equal(s.phase, "charge");
  const hit = P.dangerStep(s, see(D.reach), 10 + D.warnTicks + 5, D);
  assert.equal(hit.phase, "back");
  assert.ok(hit.swipe, "the swipe lands at reach");
  assert.equal(hit.until, 10 + D.warnTicks + 5 + D.backTicks);
  assert.equal(P.dangerStep(hit, see(1), hit.until - 1, D).phase, "back", "it leaves them alone a while");
  const after = P.dangerStep(hit, see(1), hit.until - 100, D);
  assert.ok(!after.swipe && P.dangerStep(after, see(1), hit.until - 90, D).swipe !== true, "one swipe, not one every step while it backs off");
  assert.equal(P.dangerStep(hit, see(1), hit.until, D).phase, "calm");
  const miss = P.dangerStep(s, see(D.strikeRange), 10 + D.warnTicks + D.chargeTicks, D);
  assert.equal(miss.phase, "back", "a player who got away in time");
  assert.ok(!miss.swipe);
  for (const safe of [{ inside: false }, { vulnerable: false }, { denned: true }]) assert.equal(P.dangerStep(undefined, see(1, safe), 0, D).phase, "calm", JSON.stringify(safe));
  assert.match(P.dangerLine(lion), /^Dangerous: lions warn anyone inside their exhibit, then charge and swipe\. Keepers go in only when every one is shut in a Holding Den, through a double Keeper Gate\.$/);
  // Holding Dens: one for each grown lion and one spare; the den serves the exhibit its door faces into.
  assert.equal(P.densNeeded(lion, [{}, {}, { juvenile: true }]), 3);
  assert.equal(P.densNeeded(lion, [{ juvenile: true }]), 0);
  const cells = new Map([["5,64,4", "land"]]);
  assert.ok(P.denServes(cells, { pos: { x: 5, y: 64, z: 5 }, facing: "north" }));
  assert.ok(!P.denServes(cells, { pos: { x: 5, y: 64, z: 5 }, facing: "south" }), "a den turned the wrong way serves nothing");
  // The keeper's shift: the nearest free den for each loose grown one; cubs stay out; the count.
  const plan = P.shiftPlan([{ id: "a", pos: { x: 0, y: 0, z: 0 } }, { id: "b", pos: { x: 10, y: 0, z: 0 } }, { id: "c", juvenile: true, pos: { x: 0, y: 0, z: 0 } }, { id: "d", denId: "d3", pos: { x: 0, y: 0, z: 0 } }],
    [{ id: "d1", pos: { x: 9, y: 0, z: 0 } }, { id: "d2", pos: { x: 1, y: 0, z: 0 } }, { id: "d3", pos: { x: 0, y: 0, z: 0 }, held: "d" }]);
  assert.deepEqual(plan, { assign: [{ animalId: "a", denId: "d2" }, { animalId: "b", denId: "d1" }], missing: [] });
  assert.ok(P.allShutIn([{ denId: "x" }, { juvenile: true }]));
  assert.ok(!P.allShutIn([{ denId: "x" }, {}]));
  // The double Keeper Gate: an inner gate in the fence, an outer one in line 2 to 4 blocks off; one at a time.
  const G = BALANCE.predators.gates;
  const gates = [{ id: "in", pos: { x: 0, y: 64, z: 0 } }, { id: "out", pos: { x: 0, y: 64, z: -3 } }, { id: "far", pos: { x: 0, y: 64, z: -9 } }, { id: "skew", pos: { x: 2, y: 64, z: -2 } }];
  const pairs = P.servicePairs(gates, (p) => p.z === 0, G);
  assert.deepEqual(pairs, [{ inner: "in", outer: "out", innerPos: gates[0].pos, outerPos: gates[1].pos }]);
  assert.deepEqual(P.servicePairs(gates.slice(0, 1).concat([{ id: "o1", pos: { x: 0, y: 64, z: -1 } }]), (p) => p.z === 0, G), [], "gates side by side are no airlock");
  assert.equal(P.interlockedBy("in", pairs, (id) => id === "out"), "out");
  assert.equal(P.interlockedBy("out", pairs, () => false), undefined);
  assert.match(P.keeperBlock(lion, { name: "Pride Rock" }, { pairs: [], needed: 3, have: 3 }), /^No double Keeper Gate: keepers won't go in with the lions/);
  assert.equal(P.keeperBlock(lion, { name: "Pride Rock" }, { pairs, needed: 3, have: 2 }), "Can't shift every lion in Pride Rock: add Holding Dens (3 needed, 2 now)");
  assert.equal(P.keeperBlock(lion, { name: "Pride Rock" }, { pairs, needed: 3, have: 3 }), undefined);
  // Fast days: one park day in fastEvery, big cats only.
  const B = BALANCE.predators;
  assert.deepEqual([...Array(B.fastEvery * 2).keys()].filter((d) => P.fastDay(lion, d, B)), [B.fastEvery - 1, B.fastEvery * 2 - 1]);
  assert.ok(!P.fastDay(SPECIES["zoocraft:zebra"], B.fastEvery - 1, B));
  // A Meat Ration thrown down: the nearest in range; crating only while a wild one eats, or from a den.
  assert.equal(P.baitNear({ x: 0, y: 0, z: 0 }, [{ id: 1, pos: { x: 20, y: 0, z: 0 } }, { id: 2, pos: { x: 5, y: 0, z: 0 } }], B.bait.range).id, 2);
  assert.equal(P.baitNear({ x: 0, y: 0, z: 0 }, [{ id: 1, pos: { x: B.bait.range + 1, y: 0, z: 0 } }], B.bait.range), undefined);
  assert.match(P.crateBlock(lion, { wild: true }), /throw a Meat Ration down near the lion and crate it while it eats/);
  assert.equal(P.crateBlock(lion, { wild: true, eating: true }), undefined);
  assert.match(P.crateBlock(lion, { wild: false }), /Shut the lion in a Holding Den first/);
  assert.equal(P.crateBlock(lion, { wild: false, denned: true }), undefined);
  assert.equal(P.crateBlock(SPECIES["zoocraft:zebra"], { wild: true }), undefined, "only dangerous species");
  // Everything that reads `dangerous` is generic: no module names a species.
  for (const f of ["animals/predatorRules.js", "animals/predators.js"]) assert.doesNotMatch(read(`../packs/BP/scripts/${f}`).replace(/^\s*\/\/.*$/gm, ""), /zoocraft:(lion|tiger|crocodile)/, f);
});

test("Lion: a dangerous pride that rests up high in the shade, eats Meat Rations and fasts, has 1 to 3 cubs, hunts people in the wild, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { RATIONS, BLOCKS, FOOD_LOOK, ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const { breedingCheck } = await import("../packs/BP/scripts/animals/breeding.js");
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { canShare } = await import("../packs/BP/scripts/exhibits/mixing.js");
  const R = await import("../packs/BP/scripts/animals/lionRules.js");
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const L = BALANCE.lion;
  const lion = SPECIES["zoocraft:lion"];
  assert.equal(speciesForWild("zoocraft:wild_lion"), lion);
  assert.equal(pluralOf(lion), "Lions");
  assert.equal(lion.carrierProfile, "large");
  assert.equal(lion.habitatProfile, "pride");
  assert.deepEqual(HABITAT_PROFILES.pride, { baseArea: 220, extraArea: 60, minHeight: 4 });
  assert.deepEqual(lion.dietTags, ["meat"]);
  assert.ok(lion.dangerous && lion.fasts && lion.ledge && lion.manes);
  assert.deepEqual(lion.dens, { spare: 1 });
  assert.deepEqual(lion.cover, { minFraction: 0.1, why: "shade" });
  assert.deepEqual(lion.coats, ["Lioness", "Lion"]);
  assert.deepEqual(lion.sexByCoat, ["female", "male"]);
  assert.deepEqual(lion.observe, ["spot", "pile", "scent", "roar"]);
  assert.equal(lion.breeding.litter, 1);
  assert.equal(lion.breeding.litterMax, 3);
  assert.equal(lion.breeding.juvenileScale, 0.48);
  assert.ok(lion.enrichmentTags.includes("scent") && BALANCE.enrichment.fromEquipment.scent === "scent", "a Scent Post is scent enrichment");
  assert.equal(lion.baitItem, ITEMS.meatRation);
  assert.deepEqual(RATIONS[ITEMS.meatRation], { diet: "meat", units: 1, label: "Meat Ration" });
  assert.equal(FOOD_LOOK.meat, 11);
  assert.ok(BALANCE.shop[ITEMS.meatRation], "the park shop sells Meat Rations");
  assert.deepEqual([BLOCKS.holdingDen, BLOCKS.holdingDenTop, BLOCKS.scentPost], ["zoocraft:holding_den", "zoocraft:holding_den_top", "zoocraft:scent_post"]);
  assert.ok(Object.values(SPECIES).every((s) => s.id === lion.id || !canShare(lion.id, s.id)), "lions keep an exhibit of their own");
  const others = new Set(Object.values(SPECIES).filter((s) => s.id !== lion.id).flatMap((s) => s.names));
  assert.deepEqual(lion.names.filter((n) => others.has(n)), [], "the lions' names are their own");
  assert.deepEqual(validateData(), []);
  // The pride: roles, the wild one's sex by its coat, the time of day, the moods (no play without cubs).
  assert.equal(R.roleOf({ sex: "male" }), "male");
  assert.equal(R.roleOf({ sex: "female" }), "lioness");
  assert.equal(R.roleOf({ sex: "male", juvenile: true }), "cub");
  assert.deepEqual([R.wildRole(0), R.wildRole(1)], ["lioness", "male"]);
  assert.deepEqual([0, 6000, 12000, 18000, 23000].map(R.dayPart), ["dawn", "midday", "dusk", "night", "dawn"]);
  assert.equal(R.dayPart(2000), "day");
  for (let i = 0; i < 50; i++) assert.notEqual(R.pickMood("dusk", false, L, () => i / 50), "play");
  assert.equal(R.pickMood("midday", false, L, () => 0), "rest");
  // Resting together: side by side a body apart, head to head and head to tail, the male off the end.
  const pile = R.pilePlaces({ x: 0, z: 0 }, 0, ["lioness", "lioness", "male", "cub"], L);
  assert.equal(pile.length, 4);
  assert.ok(Math.abs(Math.hypot(pile[1].x - pile[0].x, pile[1].z - pile[0].z) - L.pile.gap) < 1e-9);
  assert.equal(pile[1].yaw, 180, "head to tail");
  assert.ok(Math.abs(Math.hypot(pile[2].x, pile[2].z) - L.pile.maleOff) < 1e-9, "the male a little apart");
  // Ledges: a floor block 1 or 2 higher than the floor beside it (3 higher is a wall); two for each grown lion.
  const floor = new Map([["0,64,0", "land"], ["1,64,0", "land"], ["2,65,0", "land"], ["3,68,0", "land"], ["4,64,0", "water"]]);
  assert.deepEqual(R.ledgesOf(floor), [{ x: 2, y: 65, z: 0 }]);
  assert.equal(R.ledgesNeeded([{}, {}, { juvenile: true }], L), 2 * L.ledgePerLion);
  assert.match(R.prideWarnings({}, [{}, {}], 1, L)[0].text, /^Lions rest up high: 1 of 4 ledge blocks/);
  const males = [{ sex: "male" }, { sex: "male" }, { sex: "male" }, { sex: "female" }];
  assert.match(R.prideWarnings({}, males, 99, L)[0].text, /^3 grown males: a pride holds a coalition of 2 at most/);
  // The wild hunt: lionesses stalk, then charge; a male holds back roaring first; the bite at reach.
  assert.equal(R.huntStep("lioness", L.hunt.chargeRange + 4, 0, L), "stalk");
  assert.equal(R.huntStep("lioness", L.hunt.chargeRange, 0, L), "charge");
  assert.equal(R.huntStep("lioness", L.hunt.chargeRange + 4, L.hunt.stalkTicks, L), "charge", "it doesn't stalk for ever");
  assert.equal(R.huntStep("male", 5, 0, L), "hold");
  assert.equal(R.huntStep("male", 5, L.hunt.maleHoldTicks, L), "charge");
  assert.equal(R.huntStep("male", L.hunt.reach, 0, L), "attack");
  assert.equal(L.hunt.damage, 8, "4 hearts, as the Field Journal says");
  assert.ok(6.0 > 5.612, "a lion's gallop (6 blocks a second) is faster than a sprint");
  assert.match(R.wildLine(L), /spots anyone within 16 blocks by day and 24 at dusk and by night \(half that sneaking\)/);
  // Welfare: too few dens, ledges, or too many males cap comfort, and the advice names them.
  const mk = () => ({ needs: { satiety: 50, comfort: 90, cleanliness: 90, enrichment: 70, social: 70 }, criticalSeconds: 0, ill: false });
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 3, feederUnits: 0, water: true };
  for (const [k, cap] of [["dens", BALANCE.predators.dens.comfortCap], ["ledge", L.ledgeComfortCap], ["coalition", L.coalitionComfortCap]]) {
    const a = mk();
    simulateAnimal(a, lion, { ...ctx, [k]: false }, BALANCE.clock.dayLength * 5, BALANCE);
    assert.ok(a.needs.comfort <= cap, `${k}: comfort ${a.needs.comfort} capped at ${cap}`);
    assert.deepEqual(comfortCauses({ ...ctx, [k]: false }, BALANCE), [k]);
  }
  assert.equal(adviceFor("comfort", lion, ["dens"]), "Give the animals a Holding Den for each grown lion, and 1 spare");
  // A planned fast day: their hunger hardly drops.
  const fed = mk(), fasting = mk();
  simulateAnimal(fed, lion, ctx, BALANCE.clock.dayLength, BALANCE);
  simulateAnimal(fasting, lion, { ...ctx, drainFactor: BALANCE.predators.fastDrain }, BALANCE.clock.dayLength, BALANCE);
  assert.ok(50 - fasting.needs.satiety < (50 - fed.needs.satiety) / 2, "a fast is no hardship");
  // Breeding: a coalition of two males at most, and 1 to 3 cubs, as many as there's room for.
  const ok = (animals, usable = 10000) => ({ on: true, species: lion, plural: "Lions", animals, state: "occupied", usable, required: (pop) => 220 + 60 * (pop - 1), foodDays: 9, coveredCells: 999, usableArea: 1000, goodDays: 9, day: 9, cooldownUntil: 0, welfareOf: () => 90, coalitionMax: L.coalitionMax });
  const f = { id: "f", sex: "female", needs: {} }, m1 = { id: "m1", sex: "male" }, m2 = { id: "m2", sex: "male" }, m3 = { id: "m3", sex: "male" };
  assert.match(breedingCheck(ok([f, m1, m2, m3]), BALANCE.breeding).reason, /too many males for one pride, they fight\. A coalition of 2 at most/);
  const two = breedingCheck(ok([f, m1, m2]), BALANCE.breeding);
  assert.ok(two.ok, two.reason);
  assert.equal(two.litter, 3);
  assert.equal(breedingCheck(ok([f, m1], 220 + 60 + 60 * BALANCE.breeding.juvenileWeight * 2), BALANCE.breeding).litter, 2, "only as many cubs as there's room for");
  // The Field Journal's tasks: the pride lying up together, a scent investigated, the roar.
  assert.deepEqual(tasksSeen(lion, ["spot"], { lyingUp: true, herd: true, scenting: true, roaring: true }), ["pile", "scent", "roar"]);
  assert.deepEqual(tasksSeen(lion, ["spot"], { lyingUp: true, herd: false }), [], "lying up alone isn't the pride's pile");
  assert.equal(levelOf(lion, ["spot", "pile", "scent", "roar"]), 3);
  // A Scent Post is a post: walked round, never stood on (so never a ledge).
  assert.equal(classifyBlock("zoocraft:scent_post", { isAir: false, isLiquid: false, open: false }), "barrier");
  assert.equal(classifyBlock("zoocraft:holding_den", { isAir: false, isLiquid: false, open: false }), "solid", "a den is part of the fence");
  // Every module follows.
  const src = (f) => read(`../packs/BP/scripts/${f}`);
  assert.match(src("staff/staff.js"), /const stop = keeperStop\(ex\);\n    if \(stop\) return giveUp\(k, stop\);/, "no double gate or too few dens: the keeper won't go in");
  assert.match(src("staff/staff.js"), /const shift = shiftForKeeper\(ex\);/, "in view, the keeper shifts them into the dens first");
  assert.match(src("staff/staff.js"), /if \(fasting && j\.kind === "feed"\) continue;/);
  assert.match(src("staff/staff.js"), /releaseAfterKeeper\(ex\); \/\/ only the ones this keeper shut in/);
  assert.match(src("exhibits/exhibits.js"), /const openGates = r\.openGates\.filter\(\(g\) => !airlockHolds\(ex, g\)\);/, "an open gate whose partner is shut is the airlock working");
  assert.match(src("exhibits/exhibits.js"), /f\.type === "holding" \? inBox\(f\.pos\) && denServes\(r\.cells, f\)/);
  assert.match(src("equipment/fixtures.js"), /const locked = open && interlockText\(bottom\);/, "the interlock: one gate at a time");
  assert.match(src("transport/carriers.js"), /crateBlock\(species, \{ wild: true, eating: isFed\(wild\.id\) \}\)/);
  assert.match(src("transport/carriers.js"), /if \(den\) vacateDen\(den, a\.id\);/);
  assert.match(src("transport/carriers.js"), /if \(species\.dangerous\) calmFor\(e, BALANCE\.predators\.bait\.releaseCalmTicks\);/, "a lion let go in the wild gives you time to walk away");
  assert.match(src("animals/animals.js"), /graze, harem, dens, ledge, coalition, privacy, solitary, bank: !short\.has\(a\.id\), submerge, drainFactor: drainFactor \* mealDrain\(a, species\), grazeShare: share/);
  assert.match(src("animals/predators.js"), /a\.location\.kind !== "exhibit" \|\| a\.juvenile\) continue; \/\/ cubs are no danger/);
  assert.match(src("animals/lion.js"), /motherId: a\?\.parents\?\.\[0\] \}\);/, "a cub finds its mother by its record's parents");
  const main = src("main.js");
  assert.match(main, /blocks\.registerCustomComponent\("zoocraft:holding_den", holdingDenComponent\(\)\);/);
  assert.match(main, /on\("crateFromDen", \(\{ player, den \}\) => crateFromDen\(player, den\)\);/);
  for (const l of ['loop\\("predators", 10, 47', 'loop\\("lions", 10, 49', 'loop\\("lionmove", 1, 20, tickLionMoves\\)', "initPredators\\(\\);", "initLions\\(\\);"]) assert.match(main, new RegExp(l));
  assert.match(src("ui/fieldJournal.js"), /if \(sp\.dangerous\) lines\.splice\(3, 0, `§c\$\{dangerLine\(sp\)\}`\);/, "how dangerous they are is on the page from the first sighting");
  assert.match(src("ui/clipboard.js"), /\.\.\.\(danger \? keeperLines\(ex, danger\) : \[\]\),/);
});

test("Lion, Holding Den, Scent Post and Meat Ration files: a lioness, a maned lion light or dark and a cub, zoo and wild, savanna prides, a den in the fence with a door that drops, a post to scent, the meat look in the feeders, recipes and names", async () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  const terrain = read("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const name of ["lion", "wild_lion"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.ok(e.components["minecraft:type_family"].family.includes("lion"), `${name} is a lion for the herd sight`);
    for (const ev of ["zoocraft:coat_0", "zoocraft:coat_1", "zoocraft:mane_0", "zoocraft:mane_1", "zoocraft:den_in", "zoocraft:den_out", "zoocraft:move", "zoocraft:still"]) assert.ok(e.events[ev], `${name} ${ev}`);
    assert.deepEqual(e.component_groups["zoocraft:mane_1"], { "minecraft:mark_variant": { value: 1 } });
    assert.deepEqual(e.component_groups["zoocraft:denned"]["minecraft:physics"], { has_gravity: false, has_collision: false }, "shut in the den block: held still, no collision");
    // An event that takes a group away gives back every base component the group held.
    for (const [ev, body] of Object.entries(e.events)) {
      for (const g of body.remove?.component_groups ?? []) {
        for (const c of Object.keys(e.component_groups[g] ?? {})) {
          if (e.components[c]) assert.ok((body.add?.component_groups ?? []).some((a) => e.component_groups[a]?.[c]), `${name} ${ev}: ${c}`);
        }
      }
    }
    assert.doesNotMatch(JSON.stringify(e), /melee_attack|nearest_attackable_target/, "the script does the hunting, never the engine");
    const c = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.deepEqual(Object.keys(c.textures).sort(), ["cub", "default", "lion", "lion_dark"]);
    for (const t of Object.values(c.textures)) assert.ok(readFileSync(new URL(`../packs/RP/${t}.png`, import.meta.url)).length > 1000, t);
    assert.equal(c.scripts.scale, "q.is_baby ? 0.24 : (q.variant == 1 ? 0.575 : 0.5)", "a lioness, a lion a little bigger, a cub");
  }
  // Every bone channel of every lion animation is a value ([x, y, z] or one Molang string) or keyframes
  // ({time: ...}), never a list of key times (0.1.75: the swipe's solved keys were once merged that way,
  // and the swipe never played).
  for (const [name, anim] of Object.entries(read("../packs/RP/animations/lion.animation.json").animations)) {
    for (const [bone, chans] of Object.entries(anim.bones ?? {})) {
      for (const [ch, v] of Object.entries(chans)) {
        const ok = typeof v === "string" || typeof v === "number" || (Array.isArray(v) && v.length === 3) || (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).every((t) => Number.isFinite(Number(t))));
        assert.ok(ok, `${name} ${bone}.${ch}`);
      }
    }
  }
  const swipe = read("../packs/RP/animations/lion.animation.json").animations["animation.zoocraft.lion.swipe"].bones.armL.rotation;
  assert.ok(Object.keys(swipe).length > 4 && Object.values(swipe).some((k) => k.post[0] < -50), "the swipe raises the paw");
  const wild = read("../packs/BP/entities/wild_lion.json")["minecraft:entity"];
  assert.ok(wild.events["zoocraft:hunt"] && wild.events["zoocraft:calm"]);
  const spawn = read("../packs/BP/spawn_rules/wild_lion.json")["minecraft:spawn_rules"].conditions[0];
  assert.deepEqual(spawn["minecraft:biome_filter"], { test: "has_biome_tag", value: "savanna" });
  assert.deepEqual(spawn["minecraft:herd"], { min_size: 3, max_size: 6 }, "in prides");
  const den = read("../packs/BP/blocks/holding_den.json")["minecraft:block"];
  const top = read("../packs/BP/blocks/holding_den_top.json")["minecraft:block"];
  assert.ok(den.components["zoocraft:holding_den"] && top.components["zoocraft:holding_den"]);
  assert.deepEqual(den.description.states, { "zoocraft:door": [0, 1] });
  assert.deepEqual(top.description.states, { "zoocraft:door": [0, 1], "zoocraft:inside": [0, 1] });
  for (const b of [den, top]) assert.deepEqual(b.description.traits["minecraft:placement_direction"].enabled_states, ["minecraft:cardinal_direction"]);
  const post = read("../packs/BP/blocks/scent_post.json")["minecraft:block"];
  assert.ok(post.components["zoocraft:fixture"]);
  for (const b of [den, top, post]) for (const m of Object.values(b.components["minecraft:material_instances"] ?? {})) assert.ok(terrain[m.texture], m.texture);
  for (const r of ["zoocraft_holding_den", "zoocraft_scent_post", "zoocraft_meat_ration_beef", "zoocraft_meat_ration_mutton", "zoocraft_meat_ration_porkchop", "zoocraft_meat_ration_chicken", "zoocraft_meat_ration_rabbit"]) assert.ok(read(`../packs/BP/recipes/${r}.json`), r);
  assert.equal(read("../packs/BP/items/meat_ration.json")["minecraft:item"].description.identifier, "zoocraft:meat_ration");
  for (const k of ["item.zoocraft:meat_ration", "tile.zoocraft:holding_den", "tile.zoocraft:scent_post", "entity.zoocraft:lion", "entity.zoocraft:wild_lion"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
  // The meat look (zoocraft:food 11) in the Basic Feeder, the Puzzle Feeder and the Hanging Food Basket.
  const feeder = read("../packs/BP/blocks/basic_feeder.json")["minecraft:block"];
  for (const fill of [1, 2]) assert.ok(feeder.permutations.some((p) => p.condition === `query.block_state('zoocraft:fill') == ${fill} && query.block_state('zoocraft:food') == 11` && p.components["minecraft:material_instances"].up.texture === `zoocraft_feeder_meat_${fill}`));
  const basket = read("../packs/BP/blocks/hanging_food_basket.json")["minecraft:block"];
  const puzzle = read("../packs/BP/blocks/puzzle_feeder.json")["minecraft:block"];
  for (const b of [basket, puzzle]) assert.ok(b.permutations.some((p) => p.condition === "query.block_state('zoocraft:food') == 11" && p.components["minecraft:material_instances"].food.texture === "zoocraft_basket_food_meat"), b.description.identifier);
  for (const t of ["zoocraft_feeder_meat_1", "zoocraft_feeder_meat_2", "zoocraft_basket_food_meat", "zoocraft_scent_post"]) assert.ok(terrain[t], t);
});

// ---------- 0.1.77: Big predators, the Crocodile ----------

test("Crocodile rules: size and rank, the day, the bank and deep water, the shore, meals, the sand nest, and the hunt from the water", async () => {
  const R = await import("../packs/BP/scripts/animals/crocRules.js");
  const T = BALANCE.croc;
  // Size: a female of the middle class is 3.05 m (scale 0.5), a male a third bigger, each class 4% apart; the young grow.
  assert.equal(R.scaleOf({}), 0.5);
  assert.ok(Math.abs(R.scaleOf({ male: true }) - 0.655) < 1e-9);
  assert.ok(Math.abs(R.scaleOf({ size: 4 }) - 0.54) < 1e-9 && Math.abs(R.scaleOf({ size: 0 }) - 0.46) < 1e-9);
  assert.deepEqual([R.lengthOf({}), R.lengthOf({ male: true }), R.lengthOf({ juvenile: true }), R.lengthOf({ juvenile: true, grow: 4 })], [3.1, 4, 0.3, 1.5]);
  assert.deepEqual(R.bodyOf({ sex: "male", size: 3 }), { juvenile: false, male: true, size: 3, grow: 0 });
  assert.equal(R.bodyOf({ juvenile: true, juvenileDaysLeft: 2 }, 10).grow, 4, "a young one grows with its days");
  assert.equal(R.lengthOf(R.bodyOf({ juvenile: true, juvenileDaysLeft: 5 }, 10)), 0.9);
  assert.deepEqual([10, 8, 5, 2, 0].map((d) => R.growStage(d, 10)), [0, 1, 2, 4, 4]);
  // The feet keep time with the ground: a bigger one walks a little faster; you can't outswim one.
  assert.ok(R.paceOf("walk", 0.655) > R.paceOf("walk", 0.5) && R.paceOf("belly", 0.5) > R.paceOf("walk", 0.5) * 8);
  assert.ok(R.paceOf("swimFast", 0.5) * 20 > 4.3, "faster than a player swims");
  // Floating: the eyes just out of the water.
  assert.ok(Math.abs(R.floatY(62, 0.5) + (12.4 * 0.5) / 16 - (62 + 0.92)) < 1e-9);
  assert.ok(R.floatY(62, 0.655) < R.floatY(62, 0.5), "a bigger one floats deeper");
  // Rank by size, the biggest first; the smaller gives way (snout lift), two males of a size face up.
  const kubwa = { id: "k", name: "Kubwa", sex: "male", size: 3 }, mara = { id: "m", name: "Mara", sex: "female", size: 2 }, tumo = { id: "t", name: "Tumo", sex: "male", size: 2 };
  const hatch = { id: "h", name: "Nia", juvenile: true };
  assert.deepEqual(R.sizeOrder([mara, hatch, tumo, kubwa]).map((a) => a.id), ["k", "t", "m", "h"]);
  assert.deepEqual(R.meet(mara, kubwa), { yields: "m", show: "snout" });
  assert.deepEqual(R.meet(kubwa, tumo), { yields: "t", show: "face" });
  assert.equal(R.meet(hatch, kubwa), undefined);
  assert.equal(R.rankLine([mara, kubwa, hatch]), "Rank: Kubwa 4.2 m, Mara 3.1 m, and 1 young");
  assert.equal(R.rankLine([]), undefined);
  // The day: no bank, no basking; no deep water, nothing in it; rain keeps them off the bank; nights in the water.
  const all = { bank: true, deep: true, shade: true, display: true };
  for (let i = 0; i < 40; i++) {
    const r = () => i / 40;
    assert.notEqual(R.pickMood("day", { ...all, bank: false }, T, r), "bask");
    assert.ok(!["float", "submerge", "swim", "halfout"].includes(R.pickMood("day", { bank: true }, T, r)));
    assert.ok(!["bask", "shade", "halfout"].includes(R.pickMood("midday", { ...all, rain: true }, T, r)));
    assert.ok(["float", "submerge", "swim", "halfout"].includes(R.pickMood("night", all, T, r)));
    assert.notEqual(R.pickMood("dawn", { ...all, display: false }, T, r), "display");
  }
  assert.equal(R.pickMood("day", { bank: true, deep: true }, T, () => 0), "bask", "by day, mostly basking");
  // The bank in size order: the biggest nearest the water, spots apart; the smallest go without.
  const spots = [{ x: 0, y: 64, z: 0, d: 1 }, { x: 1, y: 64, z: 0, d: 1 }, { x: 4, y: 64, z: 0, d: 2 }, { x: 0, y: 64, z: 3, d: 3 }];
  const places = R.bankPlaces([mara, kubwa, tumo], spots, T);
  assert.deepEqual([...places.entries()].map(([id, s]) => [id, s.x, s.z]), [["k", 0, 0], ["t", 4, 0], ["m", 0, 3]]);
  assert.equal(R.bankPlaces([mara, kubwa, tumo], spots.slice(0, 2), T).size, 1, "one spot for one when they're side by side");
  assert.equal(R.bankNeeded([mara, kubwa, hatch], T), 2 * T.bankPerCroc);
  assert.deepEqual([...R.shortOfBank([mara, kubwa, tumo], T.bankPerCroc * 2, T)], ["m"]);
  assert.equal(R.shortOfBank([mara], undefined, T).size, 0, "not measured: nobody goes without");
  assert.equal(R.deepNeeded([mara, kubwa, hatch], T), 2 * T.deepPerCroc + T.deepPerYoung);
  // Sunny bank: open to the sky (air or plants over it) and not rough ground.
  const col = (list) => (dy) => list[dy] ?? "air";
  assert.ok(R.openSky(col({ 0: "plant" }), T.sky));
  assert.ok(!R.openSky(col({ 5: "solid" }), T.sky));
  assert.ok(R.openSky(col({ 3: "unloaded" }), T.sky), "out of the world above: sky");
  assert.ok(R.sunnyBank(col({ [-1]: "sand" }), T.sky) && !R.sunnyBank(col({ [-1]: "rough" }), T.sky));
  // The measure: a pond 3 x 3 in a 13 x 13 floor of grass, with sand to one side, gravel to another, a tree's
  // shade, reeds at the edge and a feeder standing at the water.
  const cells = new Map();
  for (let x = -6; x <= 6; x++) for (let z = -6; z <= 6; z++) cells.set(`${x},64,${z}`, Math.abs(x) <= 1 && Math.abs(z) <= 1 ? "water" : "land");
  const world = (x, y, z) => {
    if (y === 63) {
      if (Math.abs(x) <= 1 && Math.abs(z) <= 1) return "water";
      if (x >= 4 && Math.abs(z) <= 1) return "sand";
      if (x === -3 && z === 0) return "red_sand";
      if (z <= -2 && Math.abs(x) <= 1) return "rough";
      return "solid";
    }
    if (y === 64 && x === 0 && z === 2) return "plant"; // reeds at the edge
    if (y === 64 && x === -2 && z === 0) return "fixture"; // a feeder at the edge: a land cell, so not the shore's
    if (y === 64 && x === 2 && z === -1) return "plant";
    if (y === 68 && x >= 2 && x <= 4 && z >= 2 && z <= 4) return "solid"; // a canopy
    if (y < 63) return "solid";
    return "air";
  };
  const out = {};
  const it = R.measureCroc(world, cells, { bankReach: T.bankReach, sky: T.sky, nestNear: T.nestNear, nestFar: T.nestFar, cellsPerYield: 7 }, out);
  let yields = 0;
  while (!it.next().done) yields++;
  assert.ok(yields > 0, "it yields as it goes");
  assert.equal(out.shoreCells, 12, "the ring right round the pond");
  assert.equal(out.shoreBlocked, 2, "the reeds and the plant beside the water");
  assert.deepEqual(out.shoreSpots.map((s) => s.join(",")).sort(), ["0,64,2", "2,64,-1"]);
  // Count the sunny bank and the shade straight.
  let sunny = 0, shade = 0;
  for (const [k, v] of cells) {
    if (v !== "land") continue;
    const [x, , z] = k.split(",").map(Number);
    const d = Math.max(0, Math.abs(x) - 1) + Math.max(0, Math.abs(z) - 1);
    if (d < 1) continue;
    const covered = x >= 2 && x <= 4 && z >= 2 && z <= 4;
    const rough = z <= -2 && Math.abs(x) <= 1;
    if (d <= T.bankReach && !covered && !rough && !(x === -2 && z === 0)) sunny++;
    if (covered && d <= T.bankReach + 3) shade++; // shade a little further back counts too
  }
  assert.equal(out.sunBankCells, sunny);
  assert.ok(out.sunBankSpots.every((s, i, a) => i === 0 || a[i - 1][3] <= s[3]), "nearest the water first");
  assert.ok(!out.sunBankSpots.some(([x, , z]) => z <= -2 && Math.abs(x) <= 1), "not on the gravel");
  assert.equal(out.shadeSpots.length, shade);
  assert.equal(out.sandSites, 10, "sand 2 to 5 from the water (x 4 to 6 across 3 rows, and the red sand)");
  assert.deepEqual(out.sandSpots.filter((s) => s[3] === 1).map((s) => s.join(",")), ["-3,64,0,1"]);
  // The shore: keepers won't go in with it cluttered, or through a gate close to the water.
  assert.equal(R.gateToWater([{ innerPos: { x: 5, y: 64, z: 0 } }], [[1, 64, 0], [0, 64, 0]]), 4);
  assert.equal(R.gateToWater([], [[1, 64, 0]]), undefined);
  assert.match(R.shoreBlock({ shoreBlocked: 2, shoreSpots: [[0, 64, 2]] }, T), /^Shore clearance: 2 blocks of the water's edge are cluttered \(first at 0 64 2\): keepers must see into the water/);
  assert.match(R.shoreBlock({ shoreBlocked: 0, gateToWater: 2 }, T), /the inner Keeper Gate is 2 blocks from the water: keepers won't go in through a gate under 4 blocks/);
  assert.equal(R.shoreBlock({ shoreBlocked: 0, gateToWater: 6 }, T), undefined);
  assert.equal(R.shoreLine({ shoreBlocked: 0, gateToWater: 6 }, T), "Shore clearance: clear, the Keeper Gate 6 blocks from the water");
  const warn = R.crocWarnings({ sunBankCells: 4, deepWaterCells: 3 }, [kubwa, mara], T);
  assert.match(warn[0].text, /^Crocodiles need a sunny bank to bask on: 4 of 8 sunny bank blocks[^]*: Mara goes without$/);
  assert.match(warn[1].text, /^Crocodiles need deep water to go under all at once: 3 of 8 spots 2 blocks deep/);
  assert.deepEqual(R.crocWarnings({}, [kubwa], T), [], "not measured yet: no warning");
  // Meals about once a week: a seventh of the drain, eating only when it's down to 75, then till it's full.
  const croc = SPECIES["zoocraft:crocodile"];
  assert.equal(R.mealDrain({}, croc), 1 / 7);
  assert.equal(R.mealDrain({ juvenile: true }, croc), 1);
  assert.deepEqual([R.wantsMeal({ needs: { satiety: 80 } }, croc), R.wantsMeal({ needs: { satiety: 75 } }, croc), R.wantsMeal({ needs: { satiety: 90 }, eating: true }, croc), R.wantsMeal({ juvenile: true, needs: { satiety: 99 } }, croc)], [false, true, true, true]);
  assert.equal(R.daysToMeal({ needs: { satiety: 100 } }, croc, 25), 7, "full to hungry: a week");
  assert.equal(R.mealsLine([{ ...kubwa, lastMeal: 9, needs: { satiety: 98 } }, { ...mara, needs: { satiety: 80 } }], croc, 10, 25), "Meals: about once a week, biggest first. Kubwa ate yesterday; Mara eats next in about 2 park days.");
  assert.equal(R.mealsLine([hatch], croc, 10, 25), "Meals: young crocodiles eat every day");
  // The sand nest: dug and laid (0), filled in (1), hatched and dug open (2) for a couple of days, then sand again.
  const rec = { id: "n1", exhibitId: "e1", day: 5 };
  const mum = (daysLeft) => ({ expecting: { nestId: "n1", daysLeft }, location: { kind: "exhibit", id: "e1" } });
  assert.deepEqual([R.crocNestStage(rec, mum(4), 5, 4, T), R.crocNestStage(rec, mum(3), 6, 4, T)], [0, 1]);
  assert.equal(R.crocNestStage(rec, { ...mum(3), location: { kind: "carrier" } }, 6, 4, T), undefined, "she's been moved: the nest goes");
  assert.deepEqual([R.crocNestStage({ ...rec, hatchDay: 9 }, undefined, 9, 4, T), R.crocNestStage({ ...rec, hatchDay: 9 }, undefined, 9 + T.nestHatchedDays, 4, T)], [2, undefined]);
  assert.deepEqual(R.pickSandSpot([[0, 64, 0, 0], [5, 64, 0, 1], [9, 64, 0, 0]], [{ x: 1, y: 64, z: 1 }], { x: 6, y: 64, z: 0 }), { x: 5, y: 64, z: 0, red: true });
  assert.equal(R.pickSandSpot([[0, 64, 0, 0]], [{ x: 1, y: 64, z: 0 }], { x: 0, y: 64, z: 0 }), undefined, "not right beside another nest");
  // Warmth sets the sex: a sunny nest mostly males, a shaded one females.
  assert.deepEqual([R.hatchSex(true, T, () => 0.1), R.hatchSex(true, T, () => 0.9), R.hatchSex(false, T, () => 0)], ["male", "female", "female"]);
  assert.equal(R.hatchLine(["male", "male", "female"], true), "The nest was in full sun, so it was warm: 2 males and 1 female (a warm nest hatches mostly males)");
  assert.equal(R.hatchLine(["female", "female"], false), "The nest was shaded, so it was cool: 2 females (a cool nest hatches females)");
  // The hunt from the water: stalk under, look now and then, lunge at someone near the edge, grab, drag, roll, let go.
  const H = T.hunt;
  const at = (o) => ({ dist: 10, playerToWater: 5, inWater: true, toWater: 0, swimming: false, ...o });
  let h = R.huntStepCroc(undefined, at({}), 0, T);
  assert.equal(h.step, "stalk");
  h = R.huntStepCroc(h, at({}), H.checkEvery, T);
  assert.equal(h.step, "check", "up to look");
  h = R.huntStepCroc(h, at({ dist: H.lungeRange, playerToWater: H.lungeWater + 1 }), H.checkEvery + 10, T);
  assert.equal(h.step, "stalk", "too far from the water to lunge at");
  h = R.huntStepCroc(h, at({ dist: H.lungeRange, playerToWater: 1 }), 200, T);
  assert.equal(h.step, "lunge");
  assert.equal(R.huntStepCroc(h, at({ dist: 1 }), 200 + H.lungeTicks - 1, T).step, "lunge", "the lunge runs its course");
  const missed = R.huntStepCroc(h, at({ dist: H.grabReach + 1 }), 200 + H.lungeTicks, T);
  assert.deepEqual([missed.step, missed.retreatUntil], ["miss", 200 + H.lungeTicks + H.missTicks]);
  h = R.huntStepCroc(h, at({ dist: 1, inWater: false, toWater: 1 }), 200 + H.lungeTicks, T);
  assert.equal(h.step, "grab");
  h = R.huntStepCroc(h, at({ dist: 1, inWater: false, toWater: 1 }), 230, T);
  assert.equal(h.step, "drag");
  h = R.huntStepCroc(h, at({ dist: 1 }), 260, T);
  assert.equal(h.step, "roll", "in the water: the roll");
  let bites = 0;
  for (let t = 261; t < 261 + H.rollEvery * (H.rolls + 2) && h.phase === "roll"; t++) {
    h = R.huntStepCroc(h, at({ dist: 1 }), t, T);
    if (h.step === "rollBite") bites++;
  }
  assert.deepEqual([bites, h.step], [H.rolls, "release"]);
  assert.equal(R.huntStepCroc(h, at({}), h.retreatUntil - 1, T).step, "retreat");
  assert.equal(R.huntStepCroc(h, at({}), h.retreatUntil, T).step, "lurk");
  // Hit it and it lets go.
  const held = { phase: "roll", since: 0, rolls: 1, rollAt: 0 };
  assert.equal(R.huntStepCroc(held, at({ dist: 1, hurt: true }), 5, T).step, "release");
  // Dragging and never reaching the water: it rolls where it is.
  assert.equal(R.huntStepCroc({ phase: "drag", since: 0 }, at({ inWater: false, toWater: 3 }), H.dragTicks + 1, T).step, "roll");
  // A swimmer is chased under the water and grabbed; on land it warns, snaps, or slides in; hurt there it chases a little way.
  assert.equal(R.huntStepCroc(undefined, at({ swimming: true }), 0, T).step, "chase");
  assert.equal(R.huntStepCroc(undefined, at({ swimming: true, dist: 1 }), 0, T).step, "grab");
  const land = (o) => at({ inWater: false, toWater: 2, ...o });
  assert.deepEqual([land({ dist: H.landSnap }), land({ dist: H.landWarn }), land({ dist: H.landWarn + 1 })].map((s) => R.huntStepCroc(undefined, s, 0, T).step), ["lunge", "warn", "slide"]);
  h = R.huntStepCroc(undefined, land({ dist: 8, hurt: true }), 0, T);
  assert.equal(h.step, "landChase");
  assert.equal(R.huntStepCroc(h, land({ dist: 8, toWater: H.landReach + 1 }), 5, T).step, "slide", "never far from the water");
  assert.equal(R.huntStepCroc(h, land({ dist: 8 }), H.landChaseTicks + 1, T).step, "slide");
  assert.equal(R.grabDamage(T), H.biteDamage + H.rolls * H.rollDamage);
  assert.match(R.wildLine(T), /^Wild crocodiles lurk in swamp water with only their eyes showing[^]*bites \(4 hearts\), drags you in and rolls \(1\.5 hearts a roll\)\. Hit it and it lets go\. You can't outswim one\./);
  assert.ok(T.hunt.lungePace > 5.6, "the lunge is faster than a sprint");
});

test("Crocodile: a big pond with a sunny bank, deep water, the shore kept clear, meals once a week, a sand nest whose warmth sets the sex, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { ITEMS, BLOCKS } = await import("../packs/BP/scripts/data/items.js");
  const { breedingCheck } = await import("../packs/BP/scripts/animals/breeding.js");
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { canShare } = await import("../packs/BP/scripts/exhibits/mixing.js");
  const { habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const P = await import("../packs/BP/scripts/animals/predatorRules.js");
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const T = BALANCE.croc;
  const croc = SPECIES["zoocraft:crocodile"];
  assert.equal(speciesForWild("zoocraft:wild_crocodile"), croc);
  assert.equal(pluralOf(croc), "Crocodiles");
  assert.equal(croc.carrierProfile, "large");
  assert.equal(croc.habitatProfile, "crocodile");
  assert.deepEqual(HABITAT_PROFILES.crocodile, { baseArea: 150, extraArea: 45, minHeight: 2, amphibious: true, minWaterFraction: 0.4, minDryFraction: 0.35, minDeepWater: 4 });
  assert.deepEqual(croc.dietTags, ["meat"]);
  assert.equal(croc.baitItem, ITEMS.meatRation);
  assert.ok(croc.dangerous && croc.basks && croc.submerges && croc.shoreClear && croc.rank && croc.sexLook && !croc.solitary && !croc.nest && !croc.fasts);
  assert.deepEqual([croc.sizes, croc.patterns, croc.meals, croc.sandNest, croc.dens], [5, 3, { every: 7, at: 75 }, { sites: 1, tsd: true }, { spare: 0 }]);
  assert.deepEqual(croc.observe, ["spot", "gape", "roll", "lurk"]);
  assert.deepEqual([croc.breeding.litter, croc.breeding.litterMax, croc.breeding.young, croc.breeding.youngPlural], [2, 4, "hatchling", "hatchlings"]);
  assert.equal(BLOCKS.crocNest, "zoocraft:croc_nest");
  assert.ok(Object.values(SPECIES).every((s) => s.id === croc.id || !canShare(croc.id, s.id)), "crocodiles keep an exhibit of their own");
  const others = new Set(Object.values(SPECIES).filter((s) => s.id !== croc.id).flatMap((s) => s.names));
  assert.deepEqual(croc.names.filter((n) => others.has(n)), [], "the crocodiles' names are their own");
  assert.deepEqual(validateData(), []);
  // Dens for the grown ones; the warning, then the sideways snap; keepers need the shore kept clear.
  assert.equal(P.densNeeded(croc, [{}, {}, { juvenile: true }]), 2);
  assert.equal(P.dangerLine(croc), "Dangerous: crocodiles warn anyone inside their exhibit (reared up, puffed, the jaws wide, hissing), then charge and snap sideways. Keepers go in only when every one is shut in a Holding Den, through a double Keeper Gate, with the shore kept clear.");
  assert.match(P.dangerLine(SPECIES["zoocraft:lion"]), /then charge and swipe\. Keepers go in only when every one is shut in a Holding Den, through a double Keeper Gate\.$/, "lions unchanged");
  const pair = [{ inner: "a", outer: "b" }];
  assert.equal(P.keeperBlock(croc, { name: "Swamp" }, { pairs: pair, needed: 1, have: 1, shore: "Shore clearance: cluttered" }), "Shore clearance: cluttered");
  assert.equal(P.keeperBlock(croc, { name: "Swamp" }, { pairs: pair, needed: 1, have: 1 }), undefined);
  // The pond: about 40% water, deep in 4 spots or more.
  const pond = { usableArea: 140, waterCells: 100, deepWaterCells: 8 };
  assert.equal(habitatProblem(pond, HABITAT_PROFILES.crocodile, "Crocodile"), undefined);
  assert.match(habitatProblem({ ...pond, deepWaterCells: 2 }, HABITAT_PROFILES.crocodile, "Crocodile"), /Crocodiles need a pool 2 blocks deep in at least 4 spots \(now 2\)/);
  // Welfare: too little bank or deep water caps comfort; the advice names them; meals drain slowly.
  const mk = () => ({ needs: { satiety: 50, comfort: 90, cleanliness: 90, enrichment: 70, social: 70 }, criticalSeconds: 0, ill: false });
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 0, water: true };
  for (const [k, cap] of [["bank", T.bankComfortCap], ["submerge", T.submergeComfortCap]]) {
    const a = mk();
    simulateAnimal(a, croc, { ...ctx, [k]: false }, BALANCE.clock.dayLength * 5, BALANCE);
    assert.ok(a.needs.comfort <= cap, `${k}: comfort ${a.needs.comfort} capped at ${cap}`);
    assert.deepEqual(comfortCauses({ ...ctx, [k]: false }, BALANCE), [k]);
  }
  assert.match(adviceFor("comfort", croc, ["bank"]), /a bigger sunny bank to bask on/);
  assert.match(adviceFor("comfort", croc, ["submerge"]), /deeper water for all to go under at once/);
  const slow = mk(), fast = mk();
  simulateAnimal(slow, croc, { ...ctx, drainFactor: 1 / 7 }, BALANCE.clock.dayLength, BALANCE);
  simulateAnimal(fast, croc, ctx, BALANCE.clock.dayLength, BALANCE);
  assert.ok(slow.needs.satiety > fast.needs.satiety + 15, "a grown one goes a week on a meal");
  // Breeding: sand to dig the nest in.
  const f = { id: "f", name: "Mara", sex: "female", needs: {} }, m = { id: "m", name: "Kubwa", sex: "male" };
  const ok = (extra = {}) => ({ on: true, species: croc, plural: "Crocodiles", animals: [f, m], state: "occupied", usable: 10000, required: (pop) => 150 + 45 * (pop - 1), foodDays: 9, coveredCells: 999, usableArea: 1000, goodDays: 9, day: 9, cooldownUntil: 0, welfareOf: () => 90, sandSites: 3, ...extra });
  assert.match(breedingCheck(ok({ sandSites: 0 }), BALANCE.breeding).reason, /^Needs sand to nest in: sand or red sand in the floor 2 to 5 blocks from the water/);
  assert.match(breedingCheck(ok({ sandSites: undefined }), BALANCE.breeding).reason, /^Measure the exhibit again/);
  const yes = breedingCheck(ok(), BALANCE.breeding);
  assert.ok(yes.ok, yes.reason);
  assert.match(breedingCheck(ok({ animals: [{ ...f, expecting: { daysLeft: 2 } }, m] }), BALANCE.breeding).reason, /^Mara is guarding her nest: the eggs hatch in 2 park days\.$/);
  // Field Journal tasks: gaping, the death roll, lurking.
  assert.deepEqual(tasksSeen(croc, ["spot"], { gaping: true, rolling: true, lurking: true }), ["gape", "roll", "lurk"]);
  assert.equal(levelOf(croc, ["spot", "gape", "roll", "lurk"]), 3);
  // The croc reader: plants, fixtures, sand and rough ground, only when asked for.
  const c = (id, croc = true) => classifyBlock(id, { isAir: false, isLiquid: false, open: false, croc });
  assert.deepEqual(["minecraft:short_grass", "minecraft:red_tulip", "minecraft:oak_sapling", "minecraft:sugar_cane", "zoocraft:basic_feeder", "minecraft:sand", "zoocraft:croc_nest", "minecraft:red_sand", "minecraft:gravel", "minecraft:oak_log", "minecraft:grass_block", "minecraft:mud"].map((id) => c(id)), ["plant", "plant", "plant", "plant", "fixture", "sand", "sand", "red_sand", "rough", "rough", "solid", "solid"]);
  assert.equal(c("minecraft:sand", false), classifyBlock("minecraft:sand", { isAir: false, isLiquid: false, open: false }), "other readers unchanged");
  assert.equal(c("minecraft:oak_fence"), "barrier");
  // Every module follows.
  const src = (f) => read(`../packs/BP/scripts/${f}`);
  const animals = src("animals/animals.js");
  assert.match(animals, /if \(species\.sizes\) e\.triggerEvent\(`zoocraft:size_\$\{a\.size \?\? 2\}`\);[^\n]*\n  if \(a\.juvenile\) e\.triggerEvent\("zoocraft:juvenile"\);/);
  assert.match(animals, /if \(species\.sizes\) a\.size = Math\.floor\(Math\.random\(\) \* species\.sizes\);/);
  assert.match(animals, /if \(species\.rank\) animals\.splice\(0, animals\.length, \.\.\.sizeOrder\(animals\)\);/, "the biggest eat first");
  assert.match(animals, /feederUnits: eats \? units : 0/);
  assert.match(animals, /if \(species\.basks\) out\.push\(\.\.\.crocWarnings\(ex, residents, BALANCE\.croc\)\);/);
  const pred = src("animals/predators.js");
  assert.match(pred, /shore: species\.shoreClear \? shoreBlock\(ex, BALANCE\.croc\) : undefined/);
  assert.doesNotMatch(pred.replace(/^\s*\/\/.*$/gm, ""), /zoocraft:(lion|tiger|crocodile)/, "still generic");
  const ex = src("exhibits/exhibits.js");
  assert.match(ex, /yield\* measureCroc\(blockReader\(dim\(ex\.dimension\), \{ croc: true \}\), out\.cells/);
  assert.match(ex, /ex\.gateToWater = croc \? gateToWater\(ex\.service,/);
  const nursery = src("animals/nursery.js");
  assert.match(nursery, /species\.sandNest \? makeSandNest\(ex, pair\.mother\) : undefined/);
  assert.match(nursery, /const tsd = species\.sandNest\?\.tsd \? \{ sex: hatchSex\(sunny, BALANCE\.croc\) \} : \{\};/);
  assert.match(nursery, /if \(rec\.kind === "sand"\) \{\n      try \{\n        syncSandNest\(rec\);/);
  assert.match(nursery, /n\.youngIds\?\.includes\(a\.id\)/);
  const carriers = src("transport/carriers.js");
  assert.match(carriers, /if \(species\.sizes\) extra\.size = Number\(wild\.getProperty\("zoocraft:size"\) \?\? 2\);/);
  assert.match(carriers, /e\.triggerEvent\(`zoocraft:size_\$\{animal\.size \?\? 2\}`\);/);
  const main = src("main.js");
  for (const l of ['loop\\("crocs", 10, 57', 'loop\\("crocmove", 1, 24, tickCrocMoves\\)', "initCrocs\\(\\);"]) assert.match(main, new RegExp(l));
  assert.match(src("ui/fieldJournal.js"), /if \(sp\.basks\) lines\.splice\(4, 0, `§c\$\{crocWildLine\(BALANCE\.croc\)\}`\);/);
  assert.match(src("ui/clipboard.js"), /const croc = sp\.basks \? crocLines\(ex, sp, group\) : \[\];/);
  assert.match(src("discovery/discovery.js"), /\.\.\.tigerSight\(species, hit\), \.\.\.crocSight\(species, hit\) \};/);
  const cj = src("animals/croc.js");
  assert.match(cj, /\{ entityTypes: \["zoocraft:wild_crocodile"\] \}/);
  assert.match(cj, /world\.afterEvents\.weatherChange\.subscribe/, "rain from the weather changes (no stable getter)");
  assert.doesNotMatch(cj, /getWeather/);
  // Fixes from the mock-world run: a stale continuation never outlives the act it followed; a carry cut short
  // puts the hatchling down; rain sends a basking one in; a hit is answered once; a player gone from its jaws
  // is never pulled back; a young one moves at its grown-on size.
  assert.match(cj, /s\.why = why;\n  s\.then = undefined;/);
  assert.match(cj, /if \(s\.carrying && moving\.get\(m\.id\)\?\.act !== ACT\.carry\) \{/);
  assert.match(cj, /if \(ctx\.rain && \(ctx\.wild \|\| ctx\.deep\.length > 0\)/);
  assert.match(cj, /const fresh = Boolean\(grudge && grudge\.at > \(s\.hurtSeen \?\? -1\)\);/);
  assert.match(cj, /Gone from its jaws/);
  assert.match(cj, /return scaleOf\(bodyOf\(a, SPECIES\[a\.speciesId\]\?\.breeding\?\.matureDays\)\);/);
});

test("Crocodile files: zoo and wild, five sizes, both sexes, three tail crests, hatchlings that grow, swamps, the nest block, and names", async () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const name of ["crocodile", "wild_crocodile"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.ok(e.components["minecraft:type_family"].family.includes("crocodile"), `${name} is a crocodile`);
    assert.deepEqual(Object.keys(e.description.properties).sort(), ["zoocraft:act", "zoocraft:grow", "zoocraft:size"]);
    assert.deepEqual(e.description.properties["zoocraft:act"].range, [0, 31]);
    for (const ev of ["zoocraft:sex_0", "zoocraft:sex_1", "zoocraft:pattern_0", "zoocraft:pattern_2", "zoocraft:size_0", "zoocraft:size_4", "zoocraft:den_in", "zoocraft:den_out", "zoocraft:move", "zoocraft:still", "zoocraft:afloat"]) assert.ok(e.events[ev], `${name} ${ev}`);
    assert.deepEqual(e.component_groups["zoocraft:sex_1"]["minecraft:mark_variant"], { value: 1 });
    assert.deepEqual(e.component_groups["zoocraft:pattern_2"], { "minecraft:skin_id": { value: 2 } });
    assert.deepEqual(e.component_groups["zoocraft:afloat"]["minecraft:physics"], { has_gravity: false });
    assert.ok(e.components["minecraft:breathable"]?.breathes_water, "it doesn't drown under the water");
    for (const [ev, body] of Object.entries(e.events)) {
      for (const g of body.remove?.component_groups ?? []) {
        for (const c of Object.keys(e.component_groups[g] ?? {})) {
          if (e.components[c]) assert.ok((body.add?.component_groups ?? []).some((a) => e.component_groups[a]?.[c]), `${name} ${ev}: ${c}`);
        }
      }
    }
    assert.doesNotMatch(JSON.stringify(e), /melee_attack|nearest_attackable_target/, "the script does the hunting, never the engine");
  }
  const zoo = read("../packs/BP/entities/crocodile.json")["minecraft:entity"];
  for (const g of [0, 1, 2, 3, 4]) assert.ok(zoo.events[`zoocraft:grow_${g}`], `grow ${g}`);
  const wild = read("../packs/BP/entities/wild_crocodile.json")["minecraft:entity"];
  assert.ok(wild.events["zoocraft:hunt"] && wild.events["zoocraft:calm"]);
  const c = read("../packs/RP/entity/crocodile.entity.json")["minecraft:client_entity"].description;
  assert.deepEqual(Object.keys(c.textures).sort(), ["adult_0", "adult_1", "adult_2", "young_0", "young_1", "young_2"]);
  for (const t of Object.values(c.textures)) assert.ok(readFileSync(new URL(`../packs/RP/${t}.png`, import.meta.url)).length > 1000, t);
  assert.equal(c.scripts.scale, "(q.is_baby ? 0.05 * (1 + q.property('zoocraft:grow')) : (q.mark_variant == 1 ? 0.655 : 0.5) * (1 + 0.04 * (q.property('zoocraft:size') - 2)))");
  for (const [name, anim] of Object.entries(read("../packs/RP/animations/crocodile.animation.json").animations)) {
    for (const [bone, chans] of Object.entries(anim.bones ?? {})) {
      for (const [ch, v] of Object.entries(chans)) {
        const ok = typeof v === "string" || typeof v === "number" || (Array.isArray(v) && v.length === 3) || (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).every((t) => Number.isFinite(Number(t))));
        assert.ok(ok, `${name} ${bone}.${ch}`);
      }
    }
  }
  const nest = read("../packs/BP/blocks/croc_nest.json")["minecraft:block"];
  assert.deepEqual(nest.description.states, { "zoocraft:stage": [0, 1, 2], "zoocraft:red": [false, true] });
  const rules = read("../packs/BP/spawn_rules/wild_crocodile.json")["minecraft:spawn_rules"].conditions;
  assert.deepEqual(rules[0]["minecraft:biome_filter"], { any_of: [{ test: "has_biome_tag", value: "swamp" }, { test: "has_biome_tag", value: "mangrove_swamp" }] });
  for (const k of ["entity.zoocraft:crocodile", "entity.zoocraft:wild_crocodile", "item.spawn_egg.entity.zoocraft:wild_crocodile", "tile.zoocraft:croc_nest"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
});

// ---------- 0.1.76: Big predators, the Tiger ----------

test("Tiger rules: turns through the dens, introduction days, privacy, the ambush, and what it's told", async () => {
  const R = await import("../packs/BP/scripts/animals/tigerRules.js");
  const T = BALANCE.tiger;
  // Who's who: a grown tiger alone is a group; a tigress with her cubs is one; cubs without their mother here go together.
  const tigers = [{ id: "b", sex: "female" }, { id: "a", sex: "male" }, { id: "c1", juvenile: true, parents: ["b", "a"] }, { id: "c2", juvenile: true, parents: ["b", "a"] }, { id: "o", juvenile: true, parents: ["gone"] }];
  const groups = R.groupsOf(tigers);
  assert.deepEqual(groups.map((g) => [g.key, g.ids, g.grown, g.male, g.cubs]), [["a", ["a"], ["a"], true, 0], ["b", ["b", "c1", "c2"], ["b"], false, 2]], "a cub whose mother isn't here takes no turns: it stays out");
  assert.deepEqual([R.roleOf({ sex: "male" }), R.roleOf({ sex: "female" }), R.roleOf({ sex: "male", juvenile: true })], ["male", "tigress", "cub"]);
  assert.deepEqual([R.wildRole(0), R.wildRole(1)], ["tigress", "male"]);
  // One group out a day, in turn; with only one group, it's always out.
  const two = R.groupsOf([{ id: "a", sex: "male" }, { id: "b", sex: "female" }]);
  assert.deepEqual([0, 1, 2, 3].map((d) => [...R.turnPlan(two, d, false, T).out]), [["a"], ["b"], ["a"], ["b"]]);
  assert.deepEqual([...R.turnPlan(R.groupsOf([{ id: "a" }]), 5, true, T).out], ["a"]);
  assert.deepEqual([R.daysToTurn(two, "a", 1), R.daysToTurn(two, "b", 1)], [1, 0]);
  // Introduction days: breeding on, one day in introEvery, a grown male and a tigress without cubs out together.
  const intro = R.turnPlan(two, T.introEvery * 3, true, T);
  assert.deepEqual([[...intro.out].sort(), intro.intro], [["a", "b"], true]);
  assert.equal(R.turnPlan(two, T.introEvery * 3, false, T).intro, false, "breeding off: no introductions");
  assert.equal(R.turnPlan(two, T.introEvery * 3 + 1, true, T).intro, false);
  assert.equal(R.introPair(groups, 0, true, T), undefined, "a tigress with cubs isn't introduced");
  // Turn changes: the one going in is called in first; only when it's in is the next let out (never two loose).
  const plan = R.turnPlan(two, 1, false, T); // b's day
  assert.deepEqual(R.turnSteps(two, plan, [{ id: "a", denned: false }, { id: "b", denned: true, turnDen: true }]), { callIn: ["a"], letOut: [] });
  assert.deepEqual(R.turnSteps(two, plan, [{ id: "a", denned: true, turnDen: true }, { id: "b", denned: true, turnDen: true }]), { callIn: [], letOut: ["b"] });
  assert.deepEqual(R.turnSteps(two, plan, [{ id: "a", denned: true }, { id: "b", denned: true, turnDen: false }]), { callIn: [], letOut: [] }, "one a player shut in stays in");
  // Two grown loose together fight, but for a male and a tigress on their introduction day.
  const m = { sex: "male" }, f = { sex: "female" };
  assert.deepEqual([R.clash([m]), R.clash([m, f], false), R.clash([m, f], true), R.clash([f, f], true), R.clash([m, f, f], true)], [false, true, false, true, true]);
  assert.equal(R.turnsLine(two, plan, new Map([["a", "Raja"], ["b", "Mira"]]), 1), "Turns: Mira is out today; Raja (out tomorrow) in a Holding Den");
  assert.equal(R.turnsLine(groups, R.turnPlan(groups, 5, false, T), new Map([["a", "Raja"], ["b", "Mira"]]), 5), "Turns: Mira and her cubs are out today; Raja (out tomorrow) in a Holding Den");
  assert.equal(R.turnsLine(R.groupsOf([{ id: "a" }]), { out: new Set(["a"]) }, new Map(), 0), undefined);
  assert.equal(R.turnsLine(two, { out: new Set(two.map((g) => g.key)), intro: true }, new Map([["a", "Raja"], ["b", "Mira"]]), 4), "Turns: Raja and Mira are out together today: an introduction day", "nobody in a den: no dangling list");
  // Privacy: a floor block with 2 or more blocks of rock, earth, leaves or a trunk round it at head height.
  const at = (list) => (dx, dz) => list[`${dx},${dz}`] ?? "air";
  assert.ok(R.isScreened(at({ "1,0": "solid", "1,1": "leaves" })));
  assert.ok(R.isScreened(at({ "-1,0": "log", "0,-1": "solid" })));
  assert.ok(!R.isScreened(at({ "1,0": "solid", "0,1": "glass", "-1,0": "barrier", "0,-1": "pane" })), "glass, panes and fences don't hide a tiger");
  assert.equal(R.screensNeeded([{}, {}, { juvenile: true }], T), 2 * T.screenPerTiger);
  assert.match(R.tigerWarnings({ screenCells: 3 }, [{}], [{}], false, T)[0].text, /^Tigers want privacy, somewhere out of sight: 3 of 6 screened floor blocks/);
  assert.deepEqual(R.tigerWarnings({}, [{}], [{}], false, T), [], "not measured yet: no warning");
  assert.match(R.tigerWarnings({ screenCells: 99 }, [m, f], [m, f], false, T)[0].text, /^2 grown tigers are loose together and fighting: tigers live alone/);
  // Moods: no pool, no swim; no shallows, no soak; no cubs, no play.
  for (let i = 0; i < 50; i++) assert.ok(!["swim", "soak", "play"].includes(R.pickMood("midday", {}, T, () => i / 50)));
  assert.equal(R.pickMood("midday", { deep: true, shallow: true }, T, () => 0.999), "soak", "the midday heat: into the shallows");
  assert.equal(R.pickMood("midday", { deep: true, shallow: true, cubs: true }, T, () => 0.999), "play");
  // Swimming: the back just under the surface; a male a little lower, a cub higher.
  assert.ok(Math.abs(R.swimY(62, "tigress") - (62 + 0.89 - 0.08 - 0.875)) < 1e-9);
  assert.ok(R.swimY(62, "male") < R.swimY(62, "tigress") && R.swimY(62, "cub") > R.swimY(62, "tigress"));
  // Is the player looking its way?
  assert.ok(R.looking({ x: 0, z: 1 }, { x: 0, z: 0 }, { x: 0, z: 10 }, T.hunt.lookDeg));
  assert.ok(!R.looking({ x: 0, z: -1 }, { x: 0, z: 0 }, { x: 0, z: 10 }, T.hunt.lookDeg), "its back is turned");
  assert.ok(!R.looking({ x: 1, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 10 }, T.hunt.lookDeg), "looking off to the side");
  // The ambush: it creeps up behind; looked at it freezes, stared down it gives up; from behind it rushes, pounces once, bites.
  const H = T.hunt;
  let h = R.huntStep(undefined, { dist: 15, looked: false }, 0, T);
  assert.equal(h.step, "stalk");
  h = R.huntStep(h, { dist: 15, looked: true }, 10, T);
  assert.equal(h.step, "freeze");
  assert.equal(R.huntStep(h, { dist: 15, looked: true }, 10 + H.stareTicks - 1, T).step, "freeze");
  const gave = R.huntStep(h, { dist: 15, looked: true }, 10 + H.stareTicks, T);
  assert.equal(gave.step, "giveup", "stared down, it gives up");
  assert.equal(R.huntStep(gave, { dist: 3, looked: false }, 10 + H.stareTicks + H.giveUpTicks - 1, T).step, "giveup");
  assert.equal(R.huntStep(gave, { dist: 15, looked: false, hurt: true }, 10 + H.stareTicks + 1, T).step, "rush", "hurt, it comes at once");
  assert.equal(R.huntStep(undefined, { dist: H.rushBack, looked: false }, 0, T).step, "rush", "close behind them: the rush");
  assert.equal(R.huntStep(undefined, { dist: H.rushBack, looked: true }, 0, T).step, "freeze", "the same distance, faced: it freezes");
  assert.equal(R.huntStep(undefined, { dist: H.rushAny, looked: true }, 0, T).step, "rush", "too close: it rushes whatever");
  let r = R.huntStep(undefined, { dist: H.rushAny, looked: true }, 0, T);
  r = R.huntStep(r, { dist: H.pounceRange, looked: true }, 5, T);
  assert.equal(r.step, "pounce");
  assert.equal(R.huntStep(r, { dist: H.pounceRange, looked: true }, 6, T).step, "rush", "one pounce a rush");
  assert.equal(R.huntStep(r, { dist: H.reach, looked: true }, 7, T).step, "attack");
  const tired = R.huntStep(r, { dist: 8, looked: true }, 5 + H.rushTicks + 1, T);
  assert.equal(tired.step, "rest", "a rush is short: then it rests");
  assert.equal(R.huntStep(tired, { dist: 15, looked: false }, tired.restUntil, T).step, "stalk", "rested, it stalks again");
  assert.equal(R.huntStep(tired, { dist: 8, looked: false }, tired.restUntil, T).step, "rush", "rested, and close behind them: the rush");
  assert.ok(H.pounceDamage === 10 && H.damage === 8, "5 hearts and 4, as the Field Journal says");
  assert.ok(7.0 > 5.612, "a tiger's rush (7 blocks a second) is faster than a sprint");
  assert.match(R.wildLine(T), /spots anyone within 20 blocks by day and 28 at dusk and by night \(half that sneaking\) and creeps up while your back is turned, freezing flat when you look\. Facing it helps/);
  // Every rule here is generic or the tiger's own: no other species named.
  assert.deepEqual(R.TIGER_TYPES, ["zoocraft:tiger", "zoocraft:wild_tiger"]);
});

test("Tiger: a solitary swimmer that takes turns out of its den, wants privacy, meets only to mate, ambushes people in the wild, and every module follows", async () => {
  const { speciesForWild, pluralOf } = await import("../packs/BP/scripts/data/species.js");
  const { ITEMS } = await import("../packs/BP/scripts/data/items.js");
  const { breedingCheck } = await import("../packs/BP/scripts/animals/breeding.js");
  const { adviceFor, comfortCauses } = await import("../packs/BP/scripts/animals/welfare.js");
  const { levelOf, tasksSeen } = await import("../packs/BP/scripts/discovery/rules.js");
  const { canShare } = await import("../packs/BP/scripts/exhibits/mixing.js");
  const { habitatProblem } = await import("../packs/BP/scripts/exhibits/room.js");
  const P = await import("../packs/BP/scripts/animals/predatorRules.js");
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const T = BALANCE.tiger;
  const tiger = SPECIES["zoocraft:tiger"];
  assert.equal(speciesForWild("zoocraft:wild_tiger"), tiger);
  assert.equal(pluralOf(tiger), "Tigers");
  assert.equal(tiger.carrierProfile, "large");
  assert.equal(tiger.habitatProfile, "tiger");
  assert.deepEqual(HABITAT_PROFILES.tiger, { baseArea: 200, extraArea: 100, minHeight: 4, amphibious: true, minWaterFraction: 0.08, minDryFraction: 0.6, minDeepWater: 6, minShallowWater: 4, shallowWhy: "lie in the shallows to cool off", shallowUse: "to lie in" });
  assert.deepEqual(tiger.dietTags, ["meat"]);
  assert.equal(tiger.baitItem, ITEMS.meatRation);
  assert.ok(tiger.dangerous && tiger.fasts && tiger.solitary && tiger.privacy && tiger.sexLook && !tiger.manes && !tiger.ledge);
  assert.deepEqual(tiger.dens, { spare: 0, cubsFollow: true });
  assert.equal(tiger.patterns, 3);
  assert.deepEqual(tiger.coats, ["Bengal", "Amur"]);
  assert.equal(tiger.sexByCoat, undefined, "a tiger's sex isn't its coat");
  assert.deepEqual(tiger.observe, ["spot", "mark", "swim", "ambush"]);
  assert.deepEqual(tiger.enrichmentTags, ["scent", "manipulate", "swim"]);
  assert.deepEqual([tiger.breeding.litter, tiger.breeding.litterMax, tiger.breeding.matureDays, tiger.breeding.juvenileScale], [1, 3, 8, 0.45]);
  assert.ok(Object.values(SPECIES).every((s) => s.id === tiger.id || !canShare(tiger.id, s.id)), "tigers keep an exhibit of their own");
  const others = new Set(Object.values(SPECIES).filter((s) => s.id !== tiger.id).flatMap((s) => s.names));
  assert.deepEqual(tiger.names.filter((n) => others.has(n)), [], "the tigers' names are their own");
  assert.deepEqual(validateData(), []);
  // One den each (no spare), the cubs in with their mother; crated only from a den or while a wild one eats.
  assert.equal(P.densNeeded(tiger, [{}, {}, { juvenile: true }]), 2);
  assert.match(P.crateBlock(tiger, { wild: false }), /Shut the tiger in a Holding Den first/);
  assert.match(P.dangerLine(tiger), /^Dangerous: tigers warn anyone inside their exhibit, then charge and swipe\./);
  // The pool: a little water, mostly dry, 6 spots 2 deep to swim and 4 spots 1 deep to lie in.
  const pool = { usableArea: 400, waterCells: 40, deepWaterCells: 8 };
  assert.equal(habitatProblem(pool, HABITAT_PROFILES.tiger, "Tiger"), undefined);
  assert.match(habitatProblem({ ...pool, deepWaterCells: 3 }, HABITAT_PROFILES.tiger, "Tiger"), /Tigers need a pool 2 blocks deep in at least 6 spots \(now 3\)/);
  assert.equal(habitatProblem({ ...pool, deepWaterCells: 38 }, HABITAT_PROFILES.tiger, "Tiger"), "Tigers lie in the shallows to cool off: water 1 block deep (the ground right under it) in at least 4 spots (now 2).");
  // Welfare: too little privacy, or two loose together, cap comfort; the advice names them.
  const mk = () => ({ needs: { satiety: 50, comfort: 90, cleanliness: 90, enrichment: 70, social: 70 }, criticalSeconds: 0, ill: false });
  const ctx = { exhibitCleanliness: 90, spaceRatio: 2, groupSize: 1, feederUnits: 0, water: true };
  for (const [k, cap] of [["privacy", T.privacyComfortCap], ["solitary", T.solitaryComfortCap]]) {
    const a = mk();
    simulateAnimal(a, tiger, { ...ctx, [k]: false }, BALANCE.clock.dayLength * 5, BALANCE);
    assert.ok(a.needs.comfort <= cap, `${k}: comfort ${a.needs.comfort} capped at ${cap}`);
    assert.deepEqual(comfortCauses({ ...ctx, [k]: false }, BALANCE), [k]);
  }
  assert.equal(adviceFor("comfort", tiger, ["solitary"]), "Give the animals one grown tiger loose at a time (a Holding Den each: they take turns out)");
  const alone = mk();
  simulateAnimal(alone, tiger, ctx, BALANCE.clock.dayLength * 5, BALANCE);
  assert.ok(alone.needs.social >= 85, "happy alone");
  // Breeding: never while two fight; only the pair that met on an introduction day, for a while after it.
  const f = { id: "f", name: "Mira", sex: "female", needs: {} }, mm = { id: "m", name: "Raja", sex: "male" }, f2 = { id: "f2", name: "Tara", sex: "female" };
  const ok = (animals, extra = {}) => ({ on: true, species: tiger, plural: "Tigers", animals, state: "occupied", usable: 10000, required: (pop) => 200 + 100 * (pop - 1), foodDays: 9, coveredCells: 999, usableArea: 1000, goodDays: 9, day: 9, cooldownUntil: 0, welfareOf: () => 90, introEvery: T.introEvery, introWindow: T.introWindow, ...extra });
  assert.match(breedingCheck(ok([f, mm], { clash: 2 }), BALANCE.breeding).reason, /^2 grown tigers are loose together and fighting: they live alone/);
  assert.match(breedingCheck(ok([f, mm]), BALANCE.breeding).reason, /^Tigers meet only to mate: on an introduction day \(one park day in 4\)[^]*The next one is in 3 park days\.$/);
  assert.match(breedingCheck(ok([f, mm], { intro: { day: 9 - T.introWindow - 1, ids: ["f", "m"] } }), BALANCE.breeding).reason, /meet only to mate/, "too long ago");
  const met = breedingCheck(ok([f, f2, mm], { intro: { day: 8, ids: ["f2", "m"] } }), BALANCE.breeding);
  assert.ok(met.ok, met.reason);
  assert.equal(met.pair.mother.id, "f2", "the tigress who met him");
  assert.match(breedingCheck(ok([f, { ...mm, parents: ["f"] }], { intro: { day: 9, ids: ["f", "m"] } }), BALANCE.breeding).reason, /they're related: they won't pair/);
  // Field Journal tasks: marking, swimming, the ambush freeze.
  assert.deepEqual(tasksSeen(tiger, ["spot"], { marking: true, inWater: true, ambushing: true }), ["mark", "swim", "ambush"]);
  assert.equal(levelOf(tiger, ["spot", "mark", "swim", "ambush"]), 3);
  // The screened floor, counted by the measure with a reader that knows glass from rock.
  const grid = (x, y, z) => {
    if (x < -5 || x > 5 || z < -5 || z > 5) return "air";
    if (x === -5 || x === 5 || z === -5 || z === 5) return y === 0 || y === 1 ? "barrier" : y < 0 ? "solid" : "air";
    if (y < 0) return "solid";
    if (x === 0 && z === 0 && y <= 2) return "solid"; // a boulder 3 high
    if (x === 3 && z === 3 && y <= 2) return "glass"; // a glass pillar hides nothing
    return "air";
  };
  const res = newResult({ x: -2, y: 0, z: -2 });
  const it = floodTerrestrial(grid, res.seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 3, cellsPerYield: 1e9, screenRead: grid }, res);
  while (!it.next().done);
  assert.equal(res.screenCells, 0, "one boulder: each block beside it has only it at head height");
  const res2 = newResult({ x: -2, y: 0, z: -2 });
  const grid2 = (x, y, z) => (x === 1 && z === 0 && y <= 2 ? "solid" : grid(x, y, z));
  const it2 = floodTerrestrial(grid2, res2.seed, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 3, cellsPerYield: 1e9, screenRead: grid2 }, res2);
  while (!it2.next().done);
  assert.deepEqual(res2.screens.map((c) => c.join(",")).sort(), ["0,0,-1", "0,0,1", "1,0,-1", "1,0,1"], "a rock 2 wide: the four blocks either side of it");
  assert.equal(res2.screenCells, 4);
  // Every module follows.
  const src = (f) => read(`../packs/BP/scripts/${f}`);
  const pred = src("animals/predators.js");
  assert.match(pred, /rec\.cubs = cubsWith\(a\);/, "her cubs go into the den with her");
  assert.match(pred, /return shutIn\(entity, rec, \{ turn: it\.turn \}\);/);
  assert.match(pred, /export function keeperBusy\(exId\) \{\n  return keeperShut\.has\(exId\);/);
  assert.match(pred, /export function callAnimalIn\(animalId, rec, opts = \{\}\)/);
  assert.doesNotMatch(pred.replace(/^\s*\/\/.*$/gm, ""), /zoocraft:(lion|tiger|crocodile)/, "still generic");
  const animals = src("animals/animals.js");
  assert.match(animals, /if \(species\.sexLook\) e\.triggerEvent\(`zoocraft:sex_\$\{a\.sex === "male" \? 1 : 0\}`\);\n  if \(species\.patterns\) e\.triggerEvent\(`zoocraft:pattern_\$\{a\.pattern \?\? 0\}`\);\n  if \(species\.sizes\) e\.triggerEvent\(`zoocraft:size_\$\{a\.size \?\? 2\}`\);[^\n]*\n  if \(a\.juvenile\) e\.triggerEvent\("zoocraft:juvenile"\);/, "sex and stripes before the young one's size");
  assert.match(animals, /if \(species\.patterns\) a\.pattern = Math\.floor\(Math\.random\(\) \* species\.patterns\);/);
  assert.match(animals, /if \(species\.dangerous\) keepInDen\(e, a\);/, "a mob spawned for an animal in a den stays in it");
  assert.match(animals, /graze, harem, dens, ledge, coalition, privacy, solitary, bank: !short\.has\(a\.id\), submerge, drainFactor: drainFactor \* mealDrain\(a, species\), grazeShare: share/);
  assert.match(src("animals/nursery.js"), /letCubOut\(a\.id\);[^\n]*\n  respawnView\(a\);/, "a cub grown up in the den comes out first");
  const carriers = src("transport/carriers.js");
  assert.match(carriers, /if \(species\.sexLook\) extra\.sex = wild\.getComponent\("minecraft:mark_variant"\)\?\.value === 1 \? "male" : "female";/);
  assert.match(carriers, /if \(species\.patterns\) extra\.pattern = wild\.getComponent\("minecraft:skin_id"\)\?\.value \?\? 0;/);
  assert.match(carriers, /if \(den\) vacateDen\(den, a\.id\);/);
  assert.match(carriers, /"zoocraft:lion", "zoocraft:tiger"\]\);/);
  assert.match(src("exhibits/exhibits.js"), /screenRead: wants\("privacy"\) \? blockReader\(dim\(ex\.dimension\), \{ leaves: true, climb: true \}\) : undefined/);
  const main = src("main.js");
  for (const l of ['loop\\("tigers", 10, 51', 'loop\\("tigermove", 1, 22, tickTigerMoves\\)', 'loop\\("tigerturns", 40, 53, tickTurns\\)', "initTigers\\(\\);"]) assert.match(main, new RegExp(l));
  assert.match(src("ui/fieldJournal.js"), /if \(sp\.solitary\) lines\.splice\(4, 0, `§c\$\{tigerWildLine\(BALANCE\.tiger\)\}`\);/);
  assert.match(src("ui/clipboard.js"), /const turns = sp\.solitary \? turnsText\(ex\) : undefined;/);
  assert.match(src("animals/tigerTurns.js"), /fresh\.turns = \{ \.\.\.\(fresh\.turns \?\? \{\}\), introDay: day, introIds: out \};/);
  assert.match(src("animals/tiger.js"), /\{ entityTypes: \["zoocraft:wild_tiger"\] \}/);
});

test("Tiger files: a tigress, a bigger ruffed male and a cub in Bengal and Amur coats with three stripe patterns each, zoo and wild, jungle and cold taiga, swimming and denned, and names", async () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const lang = readFileSync(new URL("../packs/RP/texts/en_US.lang", import.meta.url), "utf8");
  for (const name of ["tiger", "wild_tiger"]) {
    const e = read(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.ok(e.components["minecraft:type_family"].family.includes("tiger"), `${name} is a tiger`);
    for (const ev of ["zoocraft:coat_0", "zoocraft:coat_1", "zoocraft:sex_0", "zoocraft:sex_1", "zoocraft:pattern_0", "zoocraft:pattern_1", "zoocraft:pattern_2", "zoocraft:den_in", "zoocraft:den_out", "zoocraft:move", "zoocraft:still", "zoocraft:afloat"]) assert.ok(e.events[ev], `${name} ${ev}`);
    assert.deepEqual(e.component_groups["zoocraft:sex_1"]["minecraft:mark_variant"], { value: 1 });
    assert.deepEqual(e.component_groups["zoocraft:pattern_2"], { "minecraft:skin_id": { value: 2 } });
    assert.deepEqual(e.component_groups["zoocraft:afloat"]["minecraft:physics"], { has_gravity: false }, "held at the surface while it swims");
    assert.deepEqual(e.component_groups["zoocraft:denned"]["minecraft:physics"], { has_gravity: false, has_collision: false });
    assert.ok(e.components["minecraft:breathable"]?.breathes_water, "it doesn't drown swimming");
    // An event that takes a group away gives back every base component the group held.
    for (const [ev, body] of Object.entries(e.events)) {
      for (const g of body.remove?.component_groups ?? []) {
        for (const c of Object.keys(e.component_groups[g] ?? {})) {
          if (e.components[c]) assert.ok((body.add?.component_groups ?? []).some((a) => e.component_groups[a]?.[c]), `${name} ${ev}: ${c}`);
        }
      }
    }
    assert.doesNotMatch(JSON.stringify(e), /melee_attack|nearest_attackable_target/, "the script does the hunting, never the engine");
    const c = read(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.deepEqual(Object.keys(c.textures).sort(), ["amur_0", "amur_1", "amur_2", "bengal_0", "bengal_1", "bengal_2"]);
    for (const t of Object.values(c.textures)) assert.ok(readFileSync(new URL(`../packs/RP/${t}.png`, import.meta.url)).length > 1000, t);
    assert.equal(c.scripts.scale, "(q.is_baby ? 0.225 : (q.mark_variant == 1 ? 0.572 : 0.5))", "a tigress, a male a little bigger, a cub");
  }
  const rc = read("../packs/RP/render_controllers/tiger.render_controllers.json").render_controllers["controller.render.zoocraft.tiger"];
  assert.equal(rc.arrays.textures["Array.coats"].length, 6);
  assert.match(rc.textures[0], /math\.clamp\(q(?:uery)?\.variant, ?0, ?1\) \* 3 \+ math\.clamp\(q(?:uery)?\.skin_id, ?0, ?2\)/, "the coat (Bengal or Amur) and the stripe pattern");
  for (const [name, anim] of Object.entries(read("../packs/RP/animations/tiger.animation.json").animations)) {
    for (const [bone, chans] of Object.entries(anim.bones ?? {})) {
      for (const [ch, v] of Object.entries(chans)) {
        const ok = typeof v === "string" || typeof v === "number" || (Array.isArray(v) && v.length === 3) || (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).every((t) => Number.isFinite(Number(t))));
        assert.ok(ok, `${name} ${bone}.${ch}`);
      }
    }
  }
  const wild = read("../packs/BP/entities/wild_tiger.json")["minecraft:entity"];
  assert.ok(wild.events["zoocraft:hunt"] && wild.events["zoocraft:calm"] && wild.events["zoocraft:wild_amur"]);
  const rules = read("../packs/BP/spawn_rules/wild_tiger.json")["minecraft:spawn_rules"].conditions;
  assert.deepEqual(rules.map((r) => r["minecraft:biome_filter"]), [{ test: "has_biome_tag", value: "jungle" }, { all_of: [{ test: "has_biome_tag", value: "taiga" }, { test: "has_biome_tag", value: "cold" }] }]);
  assert.deepEqual(rules[1]["minecraft:herd"], { min_size: 1, max_size: 1, event: "zoocraft:wild_amur", event_skip_count: 0 }, "a cold taiga's tigers are Amur tigers");
  for (const k of ["entity.zoocraft:tiger", "entity.zoocraft:wild_tiger", "item.spawn_egg.entity.zoocraft:wild_tiger"]) assert.match(lang, new RegExp(`^${k.replace(/\./g, "\\.")}\\.name=`, "m"));
});

// ---------- 0.1.78: catmullrom keys ----------
test("Animations: catmullrom keys hold only numbers (the game rejects the animation if one holds Molang)", () => {
  const dir = new URL("../packs/RP/animations/", import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    for (const [name, anim] of Object.entries(JSON.parse(readFileSync(new URL(file, dir), "utf8")).animations)) {
      for (const [bone, chans] of Object.entries(anim.bones ?? {})) {
        for (const [chan, keys] of Object.entries(chans)) {
          if (!keys || typeof keys !== "object" || Array.isArray(keys)) continue;
          for (const [at, key] of Object.entries(keys)) {
            if (key?.lerp_mode !== "catmullrom") continue;
            for (const v of [key.pre, key.post].flat().filter((x) => x !== undefined)) assert.equal(typeof v, "number", `${file} ${name} ${bone}.${chan} at ${at}`);
          }
        }
      }
    }
  }
});
// ---------- 0.1.79: the Treetop trio, the Red Panda ----------

// A tree in a glass pen for the red panda's climb measure: a trunk of logs at 0,0 from the floor up to y 5,
// leaves 5 x 5 round it at y 4 and 5 (the canopy on top of them at y 6, and on the trunk's top).
function treePen(wall = "glass", wallTop = 7) {
  const blocks = ringOf(new Map(), wall, 4, 1, wallTop);
  boxOf(blocks, "leaves", [-2, 2], [4, 5], [-2, 2]);
  boxOf(blocks, "log", [0, 0], [1, 5], [0, 0]);
  return blocks;
}
// The climb measure as exhibits.js runs it for red pandas: the whole canopy, and the Nest Boxes beside it.
function canopyMeasure(blocks, { full = true, nests = [] } = {}) {
  const read = climbReader(blocks);
  const walkView = (x, y, z) => {
    const c = read(x, y, z);
    return c === "log" || c === "frame" || c === "glass" ? "solid" : c === "pane" ? "barrier" : c;
  };
  const walk = newResult({ x: 2, y: 1, z: 2 });
  const w = floodTerrestrial(walkView, { x: 3, y: 1, z: 3 }, { halfWidth: 32, halfHeight: 16, maxDrop: 3, minHeight: 2, cellsPerYield: 1e9 }, walk);
  while (!w.next().done);
  const out = newClimbResult();
  const c = floodClimb(read, walk.cells, { rise: BALANCE.climb.rise, cellsPerYield: 50, full, nests }, out);
  while (!c.next().done);
  return { walk, out, read };
}

test("Red panda rules: the day's moods, what an exhibit needs (canopy, Nest Boxes, shade in a hot biome), and the warnings", async () => {
  const R = await import("../packs/BP/scripts/animals/pandaRules.js");
  const T = BALANCE.redpanda;
  const sp = SPECIES["zoocraft:red_panda"];
  // Crepuscular, with a spell around midnight; resting by day, asleep by night.
  assert.deepEqual([0, 1000, 6000, 11500, 12000, 15000, 18000, 21000, 23000, 24500].map((t) => R.moodAt(t, T)), ["active", "active", "rest", "active", "active", "sleep", "active", "sleep", "active", "active"]);
  assert.equal(R.restAct("sleep", false), R.ACT.curl);
  assert.equal(R.restAct("rest", true), R.ACT.pant, "panting in the heat");
  assert.equal(R.restAct("rest", false), R.ACT.drape);
  assert.deepEqual(R.SLEEP_ACTS, [R.ACT.curl, R.ACT.drape]);
  // The climbing acts are the raccoon's, so its climbing legs serve both.
  const C = await import("../packs/BP/scripts/animals/climbRules.js");
  for (const k of ["climb", "cling", "down"]) assert.equal(R.ACT[k], C.ACT[k], k);
  assert.equal(R.ACT.along, C.ACT.scramble);
  assert.deepEqual(R.RED_PANDA_TYPES, ["zoocraft:red_panda", "zoocraft:wild_red_panda"]);
  // The canopy: canopyPer blocks for each grown one (a cub counts for nothing), at least one's worth.
  const grown = { id: "a" }, cub = { id: "c", juvenile: true };
  assert.deepEqual([R.canopyNeeded([], T), R.canopyNeeded([grown, cub], T), R.canopyNeeded([grown, { id: "b" }], T)], [6, 6, 12]);
  assert.equal(R.hasCanopy(sp, { climb: { canopy: 11 } }, [grown, { id: "b" }], T), false);
  assert.equal(R.hasCanopy(sp, { climb: { canopy: 12 } }, [grown, { id: "b" }], T), true);
  assert.equal(R.hasCanopy(sp, { climb: { proof: true } }, [grown], T), true, "not measured for it yet");
  assert.equal(R.hasCanopy(SPECIES["zoocraft:raccoon"], { climb: { canopy: 0 } }, [grown], T), true, "a raccoon doesn't need one");
  // A Nest Box for each grown one.
  assert.equal(R.nestsNeeded([grown, cub]), 1);
  assert.equal(R.hasNestBoxes(sp, [{ type: "frame" }], [grown]), false);
  assert.equal(R.hasNestBoxes(sp, [{ type: "nest" }], [grown, cub]), true);
  assert.equal(R.hasNestBoxes(sp, [{ type: "nest" }], [grown, { id: "b" }]), false);
  // A hot biome by its tags (or its id when it has none); a bamboo jungle isn't.
  assert.equal(R.isHotBiome({ id: "minecraft:desert", tags: ["desert", "overworld"] }, T), true);
  assert.equal(R.isHotBiome({ id: "minecraft:savanna_plateau", tags: ["savanna", "plateau"] }, T), true);
  assert.equal(R.isHotBiome({ id: "minecraft:eroded_badlands", tags: ["mesa", "overworld"] }, T), true);
  assert.equal(R.isHotBiome({ id: "minecraft:bamboo_jungle", tags: ["jungle", "bamboo", "overworld"] }, T), false);
  assert.equal(R.isHotBiome({ id: "minecraft:badlands", tags: [] }, T), true);
  assert.equal(R.isHotBiome(undefined, T), false);
  // Shade over a third of the floor, only in a hot biome.
  assert.equal(R.shadeNeeded({ usableArea: 40 }, T), 14);
  assert.equal(R.hasShade(sp, { hotBiome: true, usableArea: 40, coveredCells: 13 }, T), false);
  assert.equal(R.hasShade(sp, { hotBiome: true, usableArea: 40, coveredCells: 14 }, T), true);
  assert.equal(R.hasShade(sp, { hotBiome: false, usableArea: 40, coveredCells: 0 }, T), true);
  // The warnings and the clipboard lines.
  const ex = { climb: { canopy: 3 }, hotBiome: true, usableArea: 30, coveredCells: 0 };
  const w = R.pandaWarnings(ex, [grown], [], "Red Pandas", T);
  assert.deepEqual(w.map((x) => x.severity), [2, 2, 3]);
  assert.match(w[0].text, /they need 6 canopy blocks \(6 for each grown one\) they can reach by climbing.*\(3 now\)/);
  assert.match(w[1].text, /Nest Boxes: place one for each grown one \(0 of 1\)/);
  assert.match(w[2].text, /^Too hot: red pandas suffer above about 25 C.*\(0 of 10 blocks now\)/);
  assert.deepEqual(R.pandaWarnings({ climb: { canopy: 6 }, hotBiome: false }, [grown], [{ type: "nest" }], "Red Pandas", T), []);
  assert.deepEqual(R.pandaLines(ex, [grown], [{ type: "nest" }], T), ["§fCanopy: §73 of 6 blocks up in the trees, reached from a trunk", "§fNest Boxes: §71 of 1", "§fHeat: §ca hot biome§7, 0 of 10 floor blocks shaded"]);
  assert.match(R.pandaLines({}, [grown], [], T)[0], /not measured yet/);
  // What it goes looking for on the ground.
  assert.equal(R.pickInterest({ mood: "active", feeder: true }, () => 0.99), "feeder");
  assert.equal(R.pickInterest({ mood: "active", feeder: true, cub: true, company: true }, () => 0.99), "play");
  assert.equal(R.pickInterest({ mood: "active" }, () => 0), "climb");
  assert.equal(R.pickInterest({ mood: "sleep", nest: true }, () => 0.99), "nest");
  assert.equal(R.pickInterest({ mood: "rest", nest: false }, () => 0.99), "climb");
});

test("Red panda climbing: up a trunk and through the leaves onto the canopy, along it, draped at its edge, into a Nest Box", async () => {
  const R = await import("../packs/BP/scripts/animals/pandaRules.js");
  const T = BALANCE.redpanda;
  const read = climbReader(treePen());
  // Up the trunk beside it and on up through the leaves: out on top of the canopy.
  const r = R.pandaRoute(read, { x: 1, y: 1, z: 0 }, { x: -1, z: 0 }, T.maxUp);
  assert.deepEqual(r.up.map((p) => p.y), [2, 3, 4, 5]);
  assert.deepEqual(r.top, { x: 1, y: 6, z: 0 });
  assert.equal(r.onTop && r.canopy, true);
  // A bare trunk (no leaves): over onto its top. Too short: no climb.
  const bare = climbReader(boxOf(new Map(), "log", [0, 0], [1, 4], [0, 0]));
  const b = R.pandaRoute(bare, { x: 1, y: 1, z: 0 }, { x: -1, z: 0 }, T.maxUp);
  assert.deepEqual([b.top, b.onTop, b.canopy], [{ x: 0, y: 5, z: 0 }, true, false]);
  assert.equal(R.pandaRoute(climbReader(boxOf(new Map(), "log", [0, 0], [1, 1], [0, 0])), { x: 1, y: 1, z: 0 }, { x: -1, z: 0 }, T.maxUp), undefined);
  // Along the top: the 25 blocks over the leaves and the trunk.
  assert.equal(R.isCanopy(read, 0, 6, 0), true, "the trunk's top");
  assert.equal(R.isCanopy(read, 3, 6, 0), false, "past the leaves");
  const map = R.canopyMap(read, r.top, T.canopyCells);
  assert.equal(map.size, 25);
  assert.equal(map.get("-2,6,2").dist, 5);
  assert.deepEqual(R.pathTo(map, "-1,6,0"), [{ x: 0, y: 6, z: 0 }, { x: -1, y: 6, z: 0 }]);
  assert.equal(R.canopyMap(read, r.top, 4).size, 4, "it maps only so much");
  const spot = R.pickSpot(map, 3, 5, () => 0);
  assert.ok(map.get(spot).dist >= 3 && map.get(spot).dist <= 5);
  assert.equal(R.pickSpot(new Map([["1,6,0", { x: 1, y: 6, z: 0, dist: 0 }]]), 3, 5), undefined, "nowhere else to go");
  // Draped at the edge, toward the drop, lying along it.
  assert.deepEqual(R.drapeSpot(read, { x: 2, y: 6, z: 0 }, T), { pos: { x: 2.75, y: 6, z: 0.5 }, yaw: 0 });
  assert.deepEqual(R.drapeSpot(read, { x: 0, y: 6, z: 2 }, T), { pos: { x: 0.5, y: 6, z: 2.75 }, yaw: 90 });
  assert.deepEqual(R.drapeSpot(read, { x: 1, y: 6, z: 1 }, T), { pos: { x: 1.5, y: 6, z: 1.5 }, yaw: undefined }, "in the middle it just lies there");
  // A Nest Box level with the canopy, right beside it: the nearest one.
  const nest = R.nestBeside(map, (x, y, z) => x === 3 && y === 6 && z === 0);
  assert.deepEqual(nest, { key: "2,6,0", cell: { x: 2, y: 6, z: 0 }, box: { x: 3, y: 6, z: 0 } });
  assert.equal(R.nestBeside(map, (x, y, z) => x === 3 && y === 5 && z === 0), undefined, "below the canopy it can't get in");
  // Sat in the box facing out of the hole, the head out of it (a cub further in).
  assert.deepEqual(R.holeDir("west"), { x: -1, z: 0 });
  assert.deepEqual(R.holeDir("bogus"), { x: 0, z: -1 });
  const sit = R.nestSpot({ x: 3, y: 6, z: 0 }, R.holeDir("west"), 1, T);
  assert.ok(Math.abs(sit.pos.x - (3.5 - (T.nestFront - T.headBack))) < 1e-9 && sit.pos.y === 6 + T.nestFloor && sit.pos.z === 0.5);
  assert.equal(sit.yaw, 90, "facing west");
  assert.equal(R.nestSpot({ x: 0, y: 1, z: 0 }, R.holeDir("north"), 1, T).yaw, 180);
  assert.equal(R.nestSpot({ x: 0, y: 1, z: 0 }, R.holeDir("south"), 1, T).yaw, 0);
  assert.ok(R.nestSpot({ x: 0, y: 1, z: 0 }, R.holeDir("north"), 0.35, T).pos.z < R.nestSpot({ x: 0, y: 1, z: 0 }, R.holeDir("north"), 1, T).pos.z, "a cub's head is further forward in the box");
  // The box's front (gen/redpanda.py: the front wall at z -3, its face at -3/16) and a grown one's head.
  assert.equal(T.nestFront, 3 / 16);
  assert.ok(T.nestFront - T.headBack > 0, "a grown one's head stays inside the hole's face");
});

test("Red panda exhibits: the climb measure counts the canopy reached by climbing and the Nest Boxes beside it", () => {
  // The tree in a glass pen: 25 canopy blocks (over the leaves and the trunk's top), climb-proof.
  const m = canopyMeasure(treePen(), { nests: [{ id: "up", pos: { x: 3, y: 6, z: 0 } }, { id: "low", pos: { x: 3, y: 3, z: 0 } }, { id: "far", pos: { x: 3, y: 6, z: 3 } }] });
  assert.equal(m.out.proof, true);
  assert.equal(m.out.canopy, 25);
  assert.deepEqual(m.out.nests, ["up"], "only the one level with the canopy, right beside it");
  assert.equal(m.out.trees, 1);
  // Leaves with no trunk to climb aren't reached: no canopy.
  const hover = ringOf(new Map(), "glass", 4, 1, 7);
  boxOf(hover, "leaves", [-2, 2], [4, 5], [-2, 2]);
  assert.equal(canopyMeasure(hover).out.canopy, 0);
  // A fence pen: a climber gets out, and with the whole flood the canopy is still all counted.
  const fenced = canopyMeasure(treePen("barrier", 1));
  assert.equal(fenced.out.proof, false);
  assert.ok(fenced.out.escape && fenced.out.path.length > 1);
  assert.equal(fenced.out.canopy, 25);
  // Without it (a raccoon's measure), the flood stops at the way out.
  const quick = canopyMeasure(treePen("barrier", 1), { full: false });
  assert.equal(quick.out.proof, false);
  assert.deepEqual(quick.out.escape, fenced.out.escape, "the same way out");
  assert.ok(quick.out.reached < fenced.out.reached);
  // A low bush on the floor isn't canopy: under 2 blocks up.
  const bush = ringOf(new Map(), "glass", 4, 1, 3);
  boxOf(bush, "leaves", [1, 2], [1, 1], [1, 2]);
  assert.equal(canopyMeasure(bush).out.canopy, 0);
  // A Climbing Frame's top counts (a frame is gripped and stood on).
  const frame = ringOf(new Map(), "glass", 4, 1, 7);
  boxOf(frame, "frame", [0, 0], [1, 3], [0, 0]);
  assert.equal(canopyMeasure(frame).out.canopy, 1);
});

test("Red panda care: the canopy, Nest Box and shade caps hold comfort down, and the advice names them", async () => {
  const W = await import("../packs/BP/scripts/animals/welfare.js");
  const sp = SPECIES["zoocraft:red_panda"];
  const day = BALANCE.clock.dayLength;
  const caps = { canopy: BALANCE.redpanda.canopyComfortCap, nestbox: BALANCE.redpanda.nestComfortCap, shade: BALANCE.redpanda.shadeComfortCap };
  for (const [k, cap] of Object.entries(caps)) {
    const a = { needs: { satiety: 90, comfort: 90, cleanliness: 90, enrichment: 90, social: 90 }, health: 100 };
    W.simulateAnimal(a, sp, { exhibitCleanliness: 100, spaceRatio: 1, groupSize: 1, feederUnits: 10, [k]: false }, day * 20, BALANCE);
    assert.equal(a.needs.comfort, cap, k);
  }
  assert.deepEqual(W.comfortCauses({ spaceRatio: 1, canopy: false, nestbox: false, shade: false }, BALANCE), ["canopy", "nestbox", "shade"]);
  const advice = W.adviceFor("comfort", sp, ["canopy", "nestbox", "shade"]);
  assert.match(advice, /more canopy to travel and rest on/);
  assert.match(advice, /a Nest Box for each grown one/);
  assert.match(advice, /shade from the heat over a third of the floor/);
  // The species: a climber up in the trees, in the arboreal profile, on Leafy Rations, one coat.
  assert.equal(sp.climbs && sp.climbTree && sp.canopy && sp.nestBox && sp.heatShade, true);
  assert.deepEqual(HABITAT_PROFILES[sp.habitatProfile], { baseArea: 40, extraArea: 16, minHeight: 5 });
  assert.deepEqual([sp.dietTags, sp.baitItem, sp.carrierProfile, sp.coats], [["leafy"], "zoocraft:leafy_ration", "small", ["Western"]]);
  assert.deepEqual(sp.observe, ["spot", "headfirst", "drape", "tailwrap"]);
  const others = Object.values(SPECIES).filter((s) => s !== sp).flatMap((s) => s.names ?? []);
  assert.deepEqual(sp.names.filter((n) => others.includes(n)), [], "names of its own");
  // Equipment: a Nest Box on the floor serves like a Burrow Shelter.
  const { serves } = await import("../packs/BP/scripts/equipment/rules.js");
  const cells = new Map([["0,1,0", "land"], ["1,1,0", "land"]]);
  assert.equal(serves("nest", cells, { x: 0, y: 1, z: 0 }), true);
  assert.equal(serves("nest", cells, { x: 0, y: 3, z: 0 }), false, "up a tree it's the climb measure's to find");
  assert.equal(classifyBlock("zoocraft:nest_box", { isAir: false, isLiquid: false, open: false, climb: true }), "air", "no collision");
  assert.equal(blocksView("zoocraft:nest_box", { isAir: false, isLiquid: false }), blocksView("zoocraft:burrow_shelter", { isAir: false, isLiquid: false }), "guests see it like a Burrow Shelter");
});

test("Red panda Field Journal: head first, draped, curled up with the tail over the face", async () => {
  const { TASKS, tasksSeen, levelOf } = await import("../packs/BP/scripts/discovery/rules.js");
  const sp = SPECIES["zoocraft:red_panda"];
  const R = await import("../packs/BP/scripts/animals/pandaRules.js");
  assert.deepEqual(tasksSeen(sp, ["spot"], { headDown: true, draped: false, tailWrapped: true }), ["headfirst", "tailwrap"]);
  assert.deepEqual(tasksSeen(sp, ["spot", "headfirst", "tailwrap"], { draped: true }), ["drape"]);
  assert.equal(levelOf(sp, ["spot", "headfirst", "drape", "tailwrap"]), 3);
  for (const t of sp.observe) assert.ok(TASKS[t], t);
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const disc = read("../packs/BP/scripts/discovery/discovery.js");
  assert.match(disc, /return \{ headDown: act === PANDA_ACT\.down, draped: act === PANDA_ACT\.drape, tailWrapped: act === PANDA_ACT\.curl \};/);
  assert.match(disc, /if \(!species\.climbs \|\| species\.canopy\) return \{\};/, "the raccoon's acts aren't read on a red panda");
  assert.equal(R.ACT.down, 7);
  const journal = read("../packs/BP/scripts/ui/fieldJournal.js");
  assert.match(journal, /if \(sp\.climbs && sp\.wash\) lines\.push\("§7Loose at night/, "Litter Bin raids are the raccoon's");
  assert.match(journal, /§7Canopy: a continuous climbing route up in the trees, \$\{P\.canopyPer\} canopy blocks for each grown one/);
});

test("Red panda files: the mob, the wild one, the spawn, the Nest Box, the skins and the wiring", () => {
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const json = (p) => JSON.parse(read(p));
  const R = { act: 12 };
  for (const name of ["red_panda", "wild_red_panda"]) {
    const be = json(`../packs/BP/entities/${name}.json`)["minecraft:entity"];
    assert.deepEqual(be.description.properties["zoocraft:act"], { type: "int", range: [0, R.act], default: 0, client_sync: true }, name);
    for (const ev of ["zoocraft:move", "zoocraft:still", "zoocraft:climb", "zoocraft:seek_climb", "zoocraft:seek_feeder", "zoocraft:seek_nest", "zoocraft:seek_none"]) assert.ok(be.events[ev], `${name} ${ev}`);
    assert.ok(be.component_groups["zoocraft:climbing"], `${name} climbing`);
    assert.deepEqual(be.components["minecraft:type_family"].family.includes("red_panda"), true, `${name} family`);
    // Seeking a Nest Box finds the block.
    const nest = JSON.stringify(be.component_groups["zoocraft:seek_nest"]);
    assert.ok(nest.includes("zoocraft:nest_box"), `${name} seeks the Nest Box`);
    const feed = JSON.stringify(be.component_groups["zoocraft:seek_feeder"]);
    assert.ok(feed.includes("zoocraft:basic_feeder") && feed.includes("minecraft:bamboo"), `${name} goes to a feeder, or bamboo`);
    const rp = json(`../packs/RP/entity/${name}.entity.json`)["minecraft:client_entity"].description;
    assert.equal(rp.geometry.default, "geometry.zoocraft.red_panda");
    for (const t of Object.values(rp.textures)) assert.ok(readdirSync(new URL("../packs/RP/textures/entity/zoocraft/", import.meta.url)).includes(`${t.split("/").pop()}.png`), t);
  }
  const spawn = json("../packs/BP/spawn_rules/wild_red_panda.json")["minecraft:spawn_rules"];
  assert.deepEqual(spawn.conditions[0]["minecraft:biome_filter"], { test: "has_biome_tag", operator: "==", value: "bamboo" });
  assert.deepEqual(spawn.conditions[0]["minecraft:herd"], { min_size: 1, max_size: 2 });
  // The client plays an animation for every act, and the render controller swaps the skins.
  const ctrl = read("../packs/RP/animation_controllers/red_panda.animation_controllers.json");
  for (let a = 1; a <= R.act; a++) assert.ok(ctrl.includes(`query.property('zoocraft:act') == ${a}`), `act ${a}`);
  const rc = read("../packs/RP/render_controllers/red_panda.render_controllers.json");
  assert.ok(rc.includes("query.is_baby ? 2 : 0") && rc.includes("bamboo"), "cub skins and the bamboo stalk");
  // The Nest Box: no collision, a fixture, turned the way it's placed, crafted at the Zoo Workshop.
  const block = json("../packs/BP/blocks/nest_box.json")["minecraft:block"];
  assert.equal(block.description.identifier, "zoocraft:nest_box");
  assert.equal(block.components["minecraft:collision_box"], false);
  assert.deepEqual(block.components["zoocraft:fixture"], {});
  assert.deepEqual(block.description.traits["minecraft:placement_direction"], { enabled_states: ["minecraft:cardinal_direction"], y_rotation_offset: 180 });
  assert.equal(block.permutations.length, 3);
  const recipe = json("../packs/BP/recipes/zoocraft_nest_box.json")["minecraft:recipe_shaped"];
  assert.deepEqual(recipe.tags, ["zoocraft_workshop"]);
  const terrain = json("../packs/RP/textures/terrain_texture.json").texture_data;
  for (const t of ["zoocraft_nest_box_wood", "zoocraft_nest_box_roof", "zoocraft_nest_box_hole"]) assert.ok(terrain[t], t);
  const lang = read("../packs/RP/texts/en_US.lang");
  for (const l of ["entity.zoocraft:red_panda.name=Red Panda", "entity.zoocraft:wild_red_panda.name=Wild Red Panda", "tile.zoocraft:nest_box.name=Nest Box"]) assert.ok(lang.includes(l), l);
  // The wiring: the loops, the measure, the fixture, the caps, the clipboard.
  const main = read("../packs/BP/scripts/main.js");
  assert.match(main, /loop\("redpandas", 10, \d+, \(\) => tickRedPandas\(system\.currentTick\)\)/);
  assert.match(main, /loop\("redpandamove", 1, \d+, tickRedPandaMoves\)/);
  const ex = read("../packs/BP/scripts/exhibits/exhibits.js");
  assert.match(ex, /\{ rise: BALANCE\.climb\.rise, cellsPerYield: opts\.cellsPerYield, full: canopy, nests \}, climb\);/);
  assert.match(ex, /f\.type === "nest" \? treeNests\.has\(f\.id\) \|\| \(inBox\(f\.pos\) && serves\(f\.type, r\.cells, f\.pos\)\)/);
  assert.match(ex, /ex\.hotBiome = anyWants\(ex, "heatShade"\) \? isHotBiome\(biomeAt\(dim\(ex\.dimension\), seed\), BALANCE\.redpanda\) : undefined;/);
  assert.match(read("../packs/BP/scripts/equipment/fixtures.js"), /\[BLOCKS\.nestBox\]: "nest" \};/);
  const animals = read("../packs/BP/scripts/animals/animals.js");
  assert.match(animals, /enrichmentPerDay, canopy, nestbox, shade \};/);
  assert.match(animals, /if \(species\.canopy\) out\.push\(\.\.\.pandaWarnings\(ex, residents, fixturesOf\(ex\), pluralOf\(species\), BALANCE\.redpanda\)\);/);
  const panda = read("../packs/BP/scripts/animals/redpanda.js");
  assert.match(panda, /entitiesNear\(player\.dimension, player\.location, RANGE, RED_PANDA_TYPES\)/, "found by type");
  // From the mock-world run: one met again up in the trees (or let go there) finds its way down; a Nest Box
  // entered from the canopy keeps the mood it has now; it lies down on the ground only when it got nowhere.
  assert.match(panda, /if \(fromCanopy\(e, s, T\)\) return;/);
  assert.match(panda, /const T = s\.climb\.T;\n  s\.mood = mood;/);
  assert.match(panda, /if \(mood !== "active" && s\.tired && Math\.random\(\) < T\.groundRestChance\)/);
  assert.match(read("../packs/BP/scripts/ui/clipboard.js"), /\.\.\.\(treetop \? pandaLines\(ex, /);
});
