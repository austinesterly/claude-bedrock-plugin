import { system, world, BlockPermutation, BlockVolume } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { ENTITIES } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { log } from "../core/log.js";
import { startCapture, stopCapture, capturing, worldLoadMs } from "../core/perf.js";
import { getPark, claimPark, setOpen } from "../park/park.js";
import { applyLedger } from "../economy/ledger.js";
import { allExhibits, controllerAt, controllerPlaced, getExhibit, validate, addResident, rename, cellsOf } from "../exhibits/exhibits.js";
import { allAnimals, createAnimal, setLocation, spawnInExhibit, liveEntity } from "../animals/animals.js";
import { feederAt, refreshLook as refreshFeeder } from "../equipment/feeder.js";
import { saveFixture, refreshLook as refreshFixture } from "../equipment/fixtures.js";
import { feederCapacity } from "../research/research.js";
import { roomAt, checkRoom, stockRoom, hire, allKeepers } from "../staff/staff.js";
import { pathsDirty } from "../visitors/network.js";
import { message } from "../platform/mc.js";
import { planPark, STAFF_RATIONS, BENCH_VERSION } from "./parkPlan.js";
import { benchReport } from "./report.js";

// The benchmark (0.1.96, spec 21: "Profile all script loops with a full park"): /zoocraft:benchmark build builds a
// full park round the player in a new flat world (bench/parkPlan.js: 20 exhibits, 100 animals of the 20
// script-steered species, paths, Viewing Points, guest services, 5 Staff Rooms, the entrance), hires 10 keepers and
// opens it to 40 visible guests (park.benchmark lifts the usual caps of 6 guests and 6 keepers);
// /zoocraft:benchmark run [seconds] measures any park (ticks per second, script time per tick and per loop, what the
// park holds, saved data) and prints the readout; /zoocraft:benchmark report prints the last one again.
// The builder places blocks with the script API, so it registers every ZooCraft block itself by calling the block's
// own onPlace handler (whether the game also calls it for blocks a script places isn't documented, and each handler
// is safe to run twice), except the Exhibit Controller, whose record it makes only when the game made none.

const BENCH = "bench";
const AREA = "zoocraft_bench";
const PER_SLICE = 1500; // blocks placed between two yields
const LOAD_TICKS = 600; // how long the park's chunks may take to load (30 seconds)
let building = false; // a build job is running in this session

// The block components main.js registers, by id, so the builder can run a block's onPlace.
const COMPONENTS = new Map();
export function recordingRegistry(registry) {
  return {
    registerCustomComponent(id, component) {
      COMPONENTS.set(id, component);
      return registry.registerCustomComponent(id, component);
    },
  };
}

// Which component's onPlace registers each block the builder places (the blocks' own JSON names them; a test checks).
export const PLACE_COMPONENT = {
  "zoocraft:basic_feeder": "zoocraft:feeder",
  "zoocraft:puzzle_feeder": "zoocraft:feeder",
  "zoocraft:hay_rack": "zoocraft:feeder",
  "zoocraft:insect_feeder": "zoocraft:feeder",
  "zoocraft:nectar_feeder": "zoocraft:feeder",
  "zoocraft:mineral_feeder": "zoocraft:feeder",
  "zoocraft:water_trough": "zoocraft:fixture",
  "zoocraft:hanging_food_basket": "zoocraft:fixture",
  "zoocraft:thermal_regulator": "zoocraft:fixture",
  "zoocraft:water_filter": "zoocraft:fixture",
  "zoocraft:burrow_shelter": "zoocraft:fixture",
  "zoocraft:climbing_frame": "zoocraft:fixture",
  "zoocraft:scent_post": "zoocraft:fixture",
  "zoocraft:nest_box": "zoocraft:fixture",
  "zoocraft:perch": "zoocraft:fixture",
  "zoocraft:landing_pad": "zoocraft:fixture",
  "zoocraft:void_perch": "zoocraft:fixture",
  "zoocraft:holding_den": "zoocraft:holding_den",
  "zoocraft:keeper_gate": "zoocraft:keeper_gate",
  "zoocraft:viewing_point": "zoocraft:guest_point",
  "zoocraft:ticket_booth": "zoocraft:guest_point",
  "zoocraft:snack_stand": "zoocraft:guest_service",
  "zoocraft:bench": "zoocraft:guest_service",
  "zoocraft:litter_bin": "zoocraft:guest_service",
  "zoocraft:donation_box": "zoocraft:guest_service",
  "zoocraft:staff_room": "zoocraft:staff_room",
  "zoocraft:park_entrance_gate": "zoocraft:entrance_gate",
};

export function benchState() {
  return db.get(BENCH, "park");
}

function setState(patch) {
  db.put(BENCH, { ...(db.get(BENCH, "park") ?? { id: "park" }), ...patch });
  db.flush(BENCH);
}

const perms = new Map();
function perm(block, states) {
  const k = states ? `${block}${JSON.stringify(states)}` : block;
  let p = perms.get(k);
  if (!p) perms.set(k, (p = BlockPermutation.resolve(block, states)));
  return p;
}

// --- build ---

/** Start building round the player. Returns why it can't, or undefined once the build has started. */
export function startBuild(player) {
  if (building) return "The benchmark park is already being built.";
  const park = getPark();
  if (park?.benchmark && benchState()?.state !== "built") {
    const why = benchState()?.why;
    return `This world holds a benchmark park that didn't finish building${why ? ` (${why})` : ""}. Make a new Superflat world (Creative, cheats on) and run it there.`;
  }
  if (park) return "This world already has a park. The benchmark builds its own park: make a new Superflat world (Creative, cheats on) and run it there.";
  if (player.dimension.id !== "minecraft:overworld") return "Run it in the Overworld.";
  const G = groundY(player);
  const origin = { x: Math.floor(player.location.x), z: Math.floor(player.location.z) };
  const plan = planPark(origin, G);
  const bad = unresolved(plan);
  if (bad) {
    log(`benchmark: ${bad}`);
    return `The benchmark can't build: ${bad}. Nothing was changed.`;
  }
  setState({ state: "building", version: BENCH_VERSION, origin, G, bbox: plan.bbox, startedAt: Date.now() });
  building = true;
  system.runJob(build(player, plan, G));
  return undefined;
}

// The ground under the player: the top block of their column (they may be flying or in a jump), else the block under
// their feet. 0.1.97: it was always the block under their feet, so a player in the air got "isn't level".
function groundY(player) {
  const x = Math.floor(player.location.x);
  const z = Math.floor(player.location.z);
  try {
    const top = player.dimension.getTopmostBlock({ x, z });
    if (top && !top.isAir && !top.isLiquid) return top.y;
  } catch {
    // the player's own chunk is loaded; if the read fails anyway, the block under their feet
  }
  return Math.floor(player.location.y) - 1;
}

// Every block the plan puts down, resolved before anything changes (0.1.97: one the game wouldn't take stopped the
// build half-way, in a park it had already claimed). Returns which one the game refused, if any.
function unresolved(plan) {
  for (const op of plan.ops) {
    const block = op.op === "controller" ? "zoocraft:exhibit_controller" : op.block;
    const states = op.op === "controller" ? undefined : op.states;
    try {
      perm(block, states);
    } catch (error) {
      return `the game won't take ${block}${states ? ` ${JSON.stringify(states)}` : ""} (${error})`;
    }
  }
  return undefined;
}

// Keep the whole park loaded and ticking, then wait until every chunk of it is loaded (30 seconds at most, counted in
// ticks: 0.1.97, the wait counted job steps, and the game runs many steps a tick when it has time, so the 30 seconds
// were over in a moment). Two ticking areas, either of which keeps the park loaded: one by command (kept with the
// world, so the park still ticks after a rejoin; a command area holds at most 100 chunks) and the add-on's own from
// the script API (world.tickingAreaManager, for this session). Returns what each did, and whether the park loaded.
function* loadPark(d, bbox, G) {
  const { min, max } = bbox;
  const byCommand = commandArea(d, min, max, G);
  const api = { said: "not there" };
  const mgr = world.tickingAreaManager;
  if (mgr) {
    const options = { dimension: d, from: { x: min.x, y: G, z: min.z }, to: { x: max.x, y: G, z: max.z } };
    try {
      if (mgr.hasTickingArea(AREA)) mgr.removeTickingArea(AREA);
      if (mgr.hasCapacity(options)) {
        api.said = "asked";
        mgr.createTickingArea(AREA, options).then(
          () => (api.said = `loaded at tick ${system.currentTick}`),
          (error) => (api.said = `failed: ${error}`),
        );
      } else api.said = `no room (${mgr.chunkCount} of its ${mgr.maxChunkCount} chunks in use)`;
    } catch (error) {
      api.said = `failed: ${error}`;
    }
  }
  // One spot in every chunk of the park.
  const spots = [];
  for (let x = min.x; x <= max.x + 15; x += 16) for (let z = min.z; z <= max.z + 15; z += 16) spots.push({ x: Math.min(x, max.x), y: G, z: Math.min(z, max.z) });
  const t0 = system.currentTick;
  let missing = spots.length;
  for (;;) {
    missing = spots.filter((c) => !d.isChunkLoaded(c)).length;
    if (!missing || system.currentTick - t0 > LOAD_TICKS) break;
    yield* waitTicks(1);
  }
  const said = `tick ${system.currentTick} (asked at ${t0}), ${spots.length - missing} of ${spots.length} chunks loaded; ticking area by command: ${byCommand}; by script: ${api.said}`;
  return { loaded: !missing, said };
}

// The ticking area by command, replacing one an earlier try left. Says what the game answered.
function commandArea(d, min, max, G) {
  const chunks = ((max.x >> 4) - (min.x >> 4) + 1) * ((max.z >> 4) - (min.z >> 4) + 1);
  const mid = (min.z + max.z) >> 1;
  const areas = chunks <= 100 ? [[AREA, min.z, max.z]] : [[`${AREA}_n`, min.z, mid], [`${AREA}_s`, mid + 1, max.z]];
  const out = [];
  for (const [name, z0, z1] of areas) {
    try {
      d.runCommand(`tickingarea remove ${name}`);
    } catch {
      // none to remove
    }
    try {
      const r = d.runCommand(`tickingarea add ${min.x} ${G} ${z0} ${max.x} ${G} ${z1} ${name} true`);
      out.push(`${name} ${r?.successCount ? "added" : "not added"}`);
    } catch (error) {
      out.push(`${name} failed: ${error}`);
    }
  }
  return out.join(", ");
}

function* waitTicks(n) {
  const until = system.currentTick + n;
  while (system.currentTick < until) yield;
}

// Wait for a promise inside a job.
function* waitFor(promise) {
  let done = false;
  let value;
  promise.then(
    (v) => {
      done = true;
      value = v;
    },
    () => {
      done = true;
    },
  );
  while (!done) yield;
  return value;
}

// `claimed`: the park was claimed, so this world can't take another try.
function fail(player, why, claimed = false) {
  setState({ state: "failed", why });
  if (player.isValid) message(player, `§cBenchmark: ${why}${claimed ? " §fThis world now holds part of the park: make a new Superflat world for the next try." : ""}`);
  log(`benchmark: ${why}`);
}

function* build(player, plan, G) {
  const d = player.dimension;
  const say = (text) => player.isValid && message(player, text);
  let claimed = false;
  try {
    say("§6Benchmark: §fbuilding the park round you (about 120 x 120 blocks). Stay where you are.");
    const { min, max } = plan.bbox;
    const area = yield* loadPark(d, plan.bbox, G);
    log(`benchmark: the park's chunks: ${area.said}`);
    if (!area.loaded) return fail(player, `the park's chunks didn't load in 30 seconds (${area.said}). Stay in the middle of the area and try again.`);
    // Flat ground: solid at G, open sky above it (the benchmark needs the same park every time).
    for (let x = min.x; x <= max.x; x += 4) {
      for (let z = min.z; z <= max.z; z += 4) {
        const ground = d.getBlock({ x, y: G, z });
        if (!ground || ground.isAir || ground.isLiquid) return fail(player, `the ground at ${x} ${z} isn't level with the ground under you (y ${G}: ${ground ? ground.typeId : "not loaded"} there). Use a new Superflat world.`);
        for (const dy of [1, 2, 5, 10, 17]) {
          const b = d.getBlock({ x, y: G + dy, z });
          if (b && !b.isAir) return fail(player, `there's something in the way at ${x} ${G + dy} ${z}. Use a new Superflat world.`);
        }
      }
      yield;
    }
    // The park, its funds (keepers' wages and the guests' first days) and the benchmark caps.
    const claim = claimPark(player);
    if (!claim.ok) return fail(player, claim.reason);
    claimed = true;
    const park = claim.park;
    applyLedger(db, park, { opId: "grant:benchmark", amount: 100000, reason: "Benchmark funds", parkTime: 0 }, BALANCE.economy.ledgerKeep);
    park.benchmark = { ...BALANCE.benchmark, version: BENCH_VERSION };
    db.put("park", park);
    db.flush();
    // The blocks.
    let n = 0;
    const placed = [];
    const controllers = [];
    for (const op of plan.ops) {
      if (op.op === "fill") {
        d.fillBlocks(new BlockVolume(op.from, op.to), perm(op.block, op.states));
        n += (op.to.x - op.from.x + 1) * (op.to.y - op.from.y + 1) * (op.to.z - op.from.z + 1);
      } else {
        const b = d.getBlock(op.pos);
        if (!b) continue;
        b.setPermutation(op.op === "controller" ? perm("zoocraft:exhibit_controller") : perm(op.block, op.states));
        if (op.op === "place") placed.push(op);
        if (op.op === "controller") controllers.push(op);
        n++;
      }
      if (n >= PER_SLICE) {
        n = 0;
        yield;
      }
    }
    yield* waitTicks(3); // any onPlace the game ran itself has done its work
    // Register what was placed: each block's own onPlace (feeders, fixtures, dens, gates, points, services, rooms, the gate).
    for (const op of placed) {
      const comp = COMPONENTS.get(PLACE_COMPONENT[op.block]);
      const b = d.getBlock(op.pos);
      if (comp?.onPlace && b) comp.onPlace({ block: b, dimension: d, previousBlock: perm("minecraft:air") }, { params: {} });
      if (++n % 50 === 0) yield;
    }
    yield* waitTicks(3);
    // Exhibits: a record for each controller, named for its animals.
    const exhibits = [];
    for (const c of controllers) {
      const b = d.getBlock(c.pos);
      const ex = controllerAt(d.id, c.pos) ?? (b && controllerPlaced(b).exhibit);
      if (!ex) return fail(player, `no exhibit record for the controller at ${c.pos.x} ${c.pos.y} ${c.pos.z}.`, true);
      rename(ex, plan.exhibits[c.exhibit].name);
      exhibits[c.exhibit] = ex.id;
    }
    // Fill the feeders, troughs, heaters and baskets.
    for (const op of placed) {
      if (!op.stock) continue;
      if (op.stock.full === "feeder") {
        const rec = feederAt(d.id, op.pos);
        if (!rec) continue;
        Object.assign(rec, { item: op.stock.item, units: feederCapacity() });
        db.put("equipment", rec);
        refreshFeeder(rec);
      } else {
        const rec = db.get("equipment", posKey(d.id, op.pos));
        if (!rec) continue;
        const cap = { trough: BALANCE.trough.capacity, heater: BALANCE.heater.capacity, basket: BALANCE.basket.capacity }[op.stock.full];
        Object.assign(rec, { units: cap }, op.stock.item ? { item: op.stock.item } : {});
        saveFixture(rec);
        refreshFixture(rec);
      }
    }
    say("§6Benchmark: §fblocks placed. Measuring the exhibits...");
    // Measure each empty exhibit, move its animals in, measure it again with them, then let them out.
    let animals = 0;
    for (let i = 0; i < plan.exhibits.length; i++) {
      const spec = plan.exhibits[i];
      const exId = exhibits[i];
      yield* waitFor(validate(exId, spec.seed));
      const species = SPECIES[spec.species];
      const recs = spec.animals.map((s, k) => {
        const coat = species.sexByCoat ? Math.max(0, species.sexByCoat.indexOf(s.sex)) : k % species.coats.length;
        const a = createAnimal(species, coat, species.sexByCoat ? {} : { sex: s.sex });
        setLocation(a, { kind: "exhibit", id: exId });
        addResident(getExhibit(exId), a.id, species.id);
        return a;
      });
      yield* waitFor(validate(exId));
      const ex = getExhibit(exId);
      const spots = spreadSpots(cellsOf(exId), species.lavaSwimmer ? "lava" : "land", recs.length);
      recs.forEach((a, k) => {
        if (spots[k]) spawnInExhibit(a, ex, spots[k]);
      });
      animals += recs.length;
      yield;
    }
    // Staff: the rooms measured and stocked, 10 keepers hired (park.benchmark lets 5 rooms house them).
    for (const pos of plan.rooms) {
      const room = roomAt(d.id, pos);
      if (!room) continue;
      checkRoom(room);
      const each = Math.floor(BALANCE.staff.roomCapacity / STAFF_RATIONS.length);
      for (const item of STAFF_RATIONS) stockRoom(room, item, each);
    }
    const hired = [];
    for (let k = 0; k < BALANCE.benchmark.keepers; k++) {
      const r = hire();
      if (!r.ok) {
        log(`benchmark: hiring keeper ${k + 1}: ${r.reason}`);
        break;
      }
      hired.push(r.keeper);
    }
    // Open: the path network walks from the entrance, guests start arriving.
    pathsDirty(d.id, plan.entrance);
    setOpen(true);
    db.flush();
    if (player.isValid) player.teleport(plan.view, { dimension: d });
    const states = allExhibits().map((e) => e.state);
    const count = (s) => states.filter((x) => x === s).length;
    setState({ state: "built", builtAt: Date.now(), exhibits: exhibits.length, animals, keepers: hired.length });
    say(`§aBenchmark park built: §f${exhibits.length} exhibits (${count("occupied")} occupied${count("unsafe") ? `, §c${count("unsafe")} unsafe§f` : ""}), ${animals} animals, ${hired.length} keepers, ${plan.viewing.length} Viewing Points, ${plan.services.length} guest services. The park is open: guests arrive over the next minute.`);
    say("§fLet it settle for a minute, then run §e/zoocraft:benchmark run 60§f.");
    log(`benchmark: built ${exhibits.length} exhibits, ${animals} animals, ${hired.length} keepers`);
  } catch (error) {
    fail(player, `the build stopped: ${error}`, claimed);
  } finally {
    building = false;
  }
}

// `n` cells of `kind` spread over the exhibit (one animal each, two blocks apart where there's room).
function spreadSpots(cells, kind, n) {
  if (!cells) return [];
  const all = [];
  for (const [k, v] of cells) {
    if (v !== kind) continue;
    const [x, y, z] = k.split(",").map(Number);
    all.push({ x, y, z });
  }
  // A fixed shuffle, so each build is the same.
  all.sort((a, b) => hash(a) - hash(b));
  const out = [];
  for (const gap of [3, 2, 0]) {
    for (const c of all) {
      if (out.length >= n) break;
      if (out.includes(c)) continue;
      if (out.every((o) => Math.abs(o.x - c.x) + Math.abs(o.z - c.z) >= gap)) out.push(c);
    }
  }
  return out;
}

function hash({ x, y, z }) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return (h ^ (h >>> 13)) >>> 0;
}

// --- run: measure ---

let running;

/** Measure for `seconds`, then print the readout to `player` and the content log. Returns why it can't start. */
export function startRun(player, seconds) {
  if (running || capturing()) return "A benchmark run is already going.";
  const gaps = [];
  let last = Date.now();
  const ticks = seconds * 20;
  running = { player, seconds };
  // In the benchmark park every exhibit is made a little dirty, so the keepers walk out and work during the run.
  if (benchState()?.state === "built") {
    for (const ex of allExhibits()) {
      if (!ex.animalIds.length) continue;
      ex.cleanliness = Math.min(ex.cleanliness ?? 100, BALANCE.benchmark.startCleanliness);
      db.put("exhibits", ex);
    }
  }
  message(player, `§6Benchmark: §fmeasuring for ${seconds} seconds. Keep still and don't open menus.`);
  startCapture();
  let n = 0;
  const seen = { samples: 0, guests: 0, keepers: 0, peakKeepers: 0 };
  const id = system.runInterval(() => {
    const now = Date.now();
    gaps.push(now - last);
    last = now;
    if (++n % 20 === 0) sample(seen);
    if (n < ticks) return;
    system.clearRun(id);
    const capture = stopCapture();
    running = undefined;
    if (!capture) return;
    const r = benchReport(capture, gaps.slice(1), parkFacts(seconds, seen));
    db.put(BENCH, { id: "last", at: Date.now(), chat: r.chat, log: r.log, summary: r.summary });
    db.flush(BENCH);
    for (const line of r.log) log(`benchmark: ${line}`);
    if (player.isValid) for (const line of r.chat) message(player, line);
  }, 1);
  return undefined;
}

/** The last readout, for chat. */
export function lastReport() {
  return db.get(BENCH, "last")?.chat;
}

// The guests and keepers in view, once a second during the run.
function sample(seen) {
  let guests = 0;
  let keepers = 0;
  try {
    const d = world.getDimension("minecraft:overworld");
    guests = d.getEntities({ type: ENTITIES.guest }).length;
    keepers = d.getEntities({ type: ENTITIES.keeper }).length;
  } catch {
    return;
  }
  seen.samples++;
  seen.guests += guests;
  seen.keepers += keepers;
  seen.peakKeepers = Math.max(seen.peakKeepers, keepers);
}

function parkFacts(seconds, seen) {
  const exs = allExhibits();
  const by = (s) => exs.filter((e) => e.state === s).length;
  const animals = allAnimals().filter((a) => a.location?.kind === "exhibit");
  let entities = 0;
  let guests = 0;
  let keepersShown = 0;
  for (const id of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
    try {
      const all = world.getDimension(id).getEntities();
      entities += all.length;
      for (const e of all) {
        if (e.typeId === ENTITIES.guest) guests++;
        else if (e.typeId === ENTITIES.keeper) keepersShown++;
      }
    } catch {
      // a dimension not loaded
    }
  }
  return {
    seconds,
    version: versionText(),
    exhibits: { total: exs.length, occupied: by("occupied"), ready: by("ready"), unsafe: by("unsafe"), other: exs.length - by("occupied") - by("ready") - by("unsafe") },
    animals: animals.length,
    animalEntities: animals.filter((a) => liveEntity(a.id)).length,
    guests,
    guestsAvg: seen?.samples ? Math.round(seen.guests / seen.samples) : guests,
    keepers: allKeepers().length,
    keepersShown,
    keepersAvg: seen?.samples ? Math.round((seen.keepers / seen.samples) * 10) / 10 : keepersShown,
    keepersPeak: seen?.samples ? seen.peakKeepers : keepersShown,
    entities,
    saveBytes: world.getDynamicPropertyTotalByteCount(),
    loadMs: worldLoadMs(),
  };
}

function versionText() {
  return `bench ${BENCH_VERSION}`;
}
