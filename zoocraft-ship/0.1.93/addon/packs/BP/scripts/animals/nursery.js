import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { on, emit } from "../core/events.js";
import { log } from "../core/log.js";
import { dayOf } from "../core/clock.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, pluralOf } from "../data/species.js";
import { requiredArea } from "../data/profiles.js";
import { habitatArea } from "../exhibits/room.js";
import { allExhibits, getExhibit, profileOf, setBreeding, addResident, releaseSpot, validate, cellsOf } from "../exhibits/exhibits.js";
import { animalsIn, getAnimal, createAnimal, saveAnimal, spawnInExhibit, liveEntity, respawnView, welfare, feederDaysLeft } from "./animals.js";
import { breedingCheck, sexOf, rivalStallions } from "./breeding.js";
import { shadeOf, pickNestSpot, nestStage } from "./flamingoRules.js";
import { crocNestStage, pickSandSpot, hatchSex, hatchLine, openSky } from "./crocRules.js";
import { hatchSounds } from "./croc.js";
import { grubCell } from "./beetleRules.js";
import { heldBeds } from "./beetle.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { isDenned, letCubOut } from "./predators.js";
import { clash } from "./tigerRules.js";
import { introToday } from "./tigerTurns.js";
import { BLOCKS } from "../data/items.js";
import { getPark, can, denyText } from "../park/park.js";
import { dim, message, onlinePlayers, blockReader } from "../platform/mc.js";

// Breeding controls (spec section 9), the runtime side of animals/breeding.js. Once a park day:
// young grow up, mothers due give birth, and an exhibit with breeding on and everything ready
// counts a day of good care (a pair starts expecting after enough of them in a row). Births are
// journaled in "births" and committed with one flush. Time is active park days only: nothing
// happens while nobody from the park is online.
// Nests (flamingos, 0.1.72, species.nest): a pair that starts expecting gets a "nests" record on a nest
// site (mud at the water's edge, ex.nestSpots), and this module keeps a Flamingo Nest block there
// showing its stage (animals/flamingoRules.js nestStage: the mound, the egg, hatched) until the chick
// grows up; then it crumbles back to bare mud. The chick hatches on the nest. Only this module writes
// "nests" (animals/flamingo.js reads them to walk the parents over).
// Sand nests (crocodiles, 0.1.77, species.sandNest): a "nests" record of kind "sand" on a sand nest site (sand or
// red sand floor a few blocks from the water, ex.sandSpots); this module swaps the sand floor block for a
// Crocodile Nest block showing its stage (animals/crocRules.js crocNestStage: the hole with the eggs, filled in
// flush, hatched) and back to sand after. At the hatching the nest's warmth sets each hatchling's sex: in full
// sun (open to the sky) mostly males, shaded all females. animals/croc.js has the mother dig it, guard it and
// carry the hatchlings to the water.

const BIRTHS = "births";
const B = () => BALANCE.breeding;
const NESTS = "nests";
/** @type {any} Custom block states aren't in the vanilla typings. */
const STAGE = "zoocraft:stage";
/** @type {any} */
const RED = "zoocraft:red";

export function today() {
  const park = getPark();
  return park ? dayOf(park.clock.seconds, BALANCE.clock.dayLength) : 0;
}

// Breeding follows the exhibit's lead species (the first to move in); in a shared exhibit only
// that species pairs up, and the group limit counts that species alone (0.1.61).
export function breedingStatus(ex) {
  const species = SPECIES[ex.speciesId];
  const profile = profileOf(ex);
  const st = ex.breeding ?? {};
  const group = animalsIn(ex).filter((a) => !species || a.speciesId === species.id);
  // Tigers: grown ones loose together (fighting, unless it's a pair's introduction day), and the last
  // introduction (animals/tigerTurns.js puts it on the exhibit).
  const loose = species?.solitary ? group.filter((a) => !a.juvenile && !isDenned(a.id)) : [];
  const fighting = species?.solitary && clash(loose, introToday(ex.id)) ? loose.length : 0;
  return breedingCheck(
    {
      on: Boolean(st.on),
      species,
      plural: species ? pluralOf(species) : "Animals",
      animals: group,
      state: ex.state,
      issue: ex.issues?.[0],
      usable: habitatArea(ex, profile),
      required: (pop) => requiredArea(profile, pop),
      foodDays: feederDaysLeft(ex) ?? 0,
      coveredCells: ex.coveredCells,
      usableArea: ex.usableArea,
      goodDays: st.goodDays ?? 0,
      day: today(),
      cooldownUntil: st.cooldownUntil ?? 0,
      welfareOf: welfare,
      // Nesting birds (flamingos): the Flock Mirrors here, the nest sites and how pink each grown-up is.
      mirrors: fixturesOf(ex).filter((f) => f.type === "mirror").length,
      nestSites: ex.nestSites,
      sandSites: ex.sandSites, // crocodiles: sand to nest in
      nestBoxes: fixturesOf(ex).filter((f) => f.type === "nest").length, // owls lay their eggs in one
      hostPlants: ex.soul?.plants, // Soul Moths: host plants in the floor for the caterpillars
      substrate: ex.substrateCells, // Quartz Beetles: Mineral Substrate in the floor for the grubs
      pinkOf: (a) => shadeOf(a.pink, BALANCE.flamingo),
      coalitionMax: BALANCE.lion.coalitionMax, // prides (lions): grown males at most
      clash: fighting,
      intro: ex.turns?.introDay !== undefined ? { day: ex.turns.introDay, ids: ex.turns.introIds ?? [] } : undefined,
      introEvery: BALANCE.tiger.introEvery,
      introWindow: BALANCE.tiger.introWindow,
    },
    B(),
  );
}

// The clipboard's toggle. Turning it on says straight away what still stops a pair (AC-12).
export function toggleBreeding(player, exId) {
  const ex = getExhibit(exId);
  if (!ex) return;
  if (!can(player, "care")) return message(player, denyText("care"));
  if (!ex.speciesId) return message(player, "§eRelease some animals here first.");
  const on = !ex.breeding?.on;
  setBreeding(ex, { on, goodDays: 0 });
  if (!on) return message(player, `§7Breeding is off in ${ex.name}. Animals already expecting still have their young.`);
  message(player, `§aBreeding is on in ${ex.name}.`);
  if (ex.seed) validate(ex.id).then(() => {
    const fresh = getExhibit(exId);
    if (fresh) message(player, `§7${breedingStatus(fresh).reason}`);
  });
}

function tell(text) {
  const park = getPark();
  for (const p of onlinePlayers()) if (park?.members[p.id]) message(p, text);
}

function growUp(a, ex) {
  a.juvenile = false;
  delete a.juvenileDaysLeft;
  // A caterpillar's pupa grown (Soul Moths): the moth comes out today, and pumps its wings out (animals/moth.js); a
  // grub's (Quartz Beetles): the beetle digs up out of the substrate today (animals/beetle.js).
  const pupa = Boolean(SPECIES[a.speciesId]?.breeding?.pupaDays);
  if (pupa) a.emergedDay = today();
  const pink = SPECIES[a.speciesId]?.pink;
  if (pink) a.pink = 0; // a grey chick grows up pale (animals/flamingoRules.js)
  saveAnimal(a);
  letCubOut(a.id); // grown up in the den with its mother (tigers): out it comes, a den of its own to come
  respawnView(a); // an unloaded mob is swapped when it loads (animals.js track)
  // A colt that grows up in a harem is a second stallion: he'll fight the stallion over the mares (zebras).
  const species = SPECIES[a.speciesId];
  const rival = Boolean(species?.harem || species?.troop) && rivalStallions(animalsIn(ex).filter((b) => b.speciesId === a.speciesId), species).some((b) => b.id === a.id);
  tell(`§a${a.name} in ${ex.name} is all grown up.${pupa ? (species?.substrate ? " §7It has come out of its pupa as a beetle: watch it dig its way up out of the substrate." : " §7It has come out of its pupa as a moth: watch it pump its wings out before it flies.") : ""}${pink ? " §7It's pale: Flamingo Pellets in a feeder it eats from turn it pink over a few park days." : ""}${rival ? (species.troop ? " §eHe's a young silverback now and will fight the silverback over the females: move him to a bachelor group (an exhibit with no females)." : " §eHe's a young stallion now and will fight the stallion over the mares: move him to a bachelor group (an exhibit with no mares).") : ""}`);
}

function startExpecting(ex, species, pair, day, room = undefined) {
  const br = species.breeding;
  // Lions have 1 to 3 cubs (br.litterMax), never more than there's room for (the breeding check's `room`).
  const most = Math.max(br.litter, room ?? br.litter);
  const litter = br.litter + Math.floor(Math.random() * (most - br.litter + 1));
  pair.mother.expecting = { daysLeft: br.gestationDays, fatherId: pair.father.id, litter, since: day };
  // Nesting birds: a nest on the free nest site nearest the mother.
  const nest = species.nest ? makeNest(ex, pair.mother) : species.sandNest ? makeSandNest(ex, pair.mother) : undefined;
  if (nest) pair.mother.expecting.nestId = nest.id;
  saveAnimal(pair.mother);
  const what = litter === 1 ? `a ${br.young}` : `${litter} ${br.youngPlural}`;
  const due = `${br.gestationDays} park day${br.gestationDays === 1 ? "" : "s"}`;
  if (species.nest) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} are nesting!${nest ? ` They build a mud nest at the water's edge (${nest.pos.x} ${nest.pos.y} ${nest.pos.z}) today, then sit on the egg in turns:` : ""} ${what} hatches in ${due}.`);
  else if (species.sandNest) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} have mated!${nest ? ` She digs a nest in the sand (${nest.pos.x} ${nest.pos.y - 1} ${nest.pos.z}) today, lays her eggs and fills it in, then lies guarding it:` : ""} ${what} hatch in ${due}. §7A nest in full sun is warm and hatches mostly males; a shaded one hatches females.`);
  else if (br.hostPlants) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} have mated! She lays ${litter} eggs on the host plants in the floor: ${what} hatch in ${due}.`);
  else if (br.carried) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} have mated! She carries ${litter} eggs under her tail: ${what} come out in ${due}.`);
  else if (br.eggBed) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} have mated! ${pair.mother.name} lays ${litter} eggs in the Mineral Substrate: ${what} hatch in ${due}.`);
  else if (br.substrate) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} have mated! She lays ${litter} eggs in the Mineral Substrate: ${what} hatch in ${due}.`);
  else if (br.nestBox) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} have mated! She lays ${litter === 1 ? "an egg" : `${litter} eggs`} in the Nest Box and sits on ${litter === 1 ? "it" : "them"}: ${what} hatch${litter === 1 ? "es" : ""} in ${due}.`);
  else tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} are expecting ${what}! Due in ${due}.`);
}

function giveBirth(mother, ex, species, day) {
  const br = species.breeding;
  const exp = mother.expecting;
  const father = getAnimal(exp.fatherId);
  const born = [];
  // A sand nest (crocodiles): its warmth sets each hatchling's sex: in full sun (open to the sky) mostly males.
  const sandNest = species.sandNest && exp.nestId ? db.get(NESTS, exp.nestId) : undefined;
  const sunny = sandNest ? nestSunny(sandNest) : false;
  for (let i = 0; i < exp.litter; i++) {
    const tsd = species.sandNest?.tsd ? { sex: hatchSex(sunny, BALANCE.croc) } : {};
    const coat = species.sexByCoat ? Math.floor(Math.random() * species.coats.length) : Math.random() < 0.5 || !father ? mother.coat : father.coat;
    // A lion cub's mane (light or dark, shown once he's grown) comes from one parent or the other.
    const mane = species.manes ? { mane: (Math.random() < 0.5 ? mother.mane : father?.mane) ?? 0 } : {};
    const young = createAnimal(species, coat, { juvenile: true, juvenileDaysLeft: br.matureDays, parents: [mother.id, exp.fatherId], bornDay: day, needsSpawn: true, ...mane, ...tsd });
    young.location = { kind: "exhibit", id: ex.id };
    saveAnimal(young);
    addResident(ex, young.id, species.id);
    born.push(young);
  }
  // Nesting birds: the chick hatches on the nest (placeYoung puts it there), which stays until it grows up.
  const nest = exp.nestId && db.get(NESTS, exp.nestId);
  if (nest && born.length && nest.kind !== "sand") db.put(NESTS, { ...nest, youngId: born[0].id });
  // A sand nest hatches all its young, dug open (stage 2) for a couple of days; the hatchlings call, the shells crack.
  if (nest && born.length && nest.kind === "sand") {
    db.put(NESTS, { ...nest, youngIds: born.map((a) => a.id), hatchDay: day, sunny });
    try {
      const d = dim(nest.dimension);
      if (d.isChunkLoaded(nest.pos)) hatchSounds(d, nest.pos);
    } catch {
      // Cosmetic only.
    }
  }
  mother.expecting = undefined;
  saveAnimal(mother);
  setBreeding(ex, { cooldownUntil: day + br.cooldownDays, goodDays: 0 });
  db.put(BIRTHS, { id: newId("bi"), exhibitId: ex.id, motherId: mother.id, fatherId: exp.fatherId, animalIds: born.map((a) => a.id), day });
  pruneBirths();
  db.flush();
  for (const a of born) placeYoung(a);
  const names = born.map((a) => a.name).join(" and ");
  const what = born.length === 1 ? `a ${br.young}` : `${born.length} ${br.youngPlural}`;
  const young = `Young need half an adult's space and food, a sheltered corner, and grow up in ${br.matureDays} park days.`;
  if (species.nest) tell(`§d${mother.name}'s egg hatched on the nest in ${ex.name}: ${what}, ${names}! §fChicks are grey, and their parents feed them crop milk. ${young}`);
  else if (sandNest) tell(`§d${mother.name}'s eggs hatched in ${ex.name}: ${what}, ${names}! §f${hatchLine(born.map((a) => a.sex), sunny)}. She digs them out and carries each to the water in her jaws; they keep near her. ${young}`);
  else if (br.hostPlants) tell(`§d${mother.name}'s eggs hatched on the host plants in ${ex.name}: ${what}, ${names}! §fThe caterpillars crawl from plant to plant eating them, not from the feeder. For their last ${br.pupaDays} park days each burrows into the floor as a pupa, and they come out as moths in ${br.matureDays} park days.`);
  else if (br.carried) tell(`§d${mother.name}'s eggs hatched in ${ex.name}: ${what}, ${names}! §fThe crablets come out from under her, each with a little spiral shell on its back, and keep near her. ${young}`);
  else if (br.eggBed) tell(`§d${mother.name}'s eggs hatched in the Mineral Substrate in ${ex.name}: ${what}, ${names}! §fHatchlings glow faintly, leave a fainter trail and crawl after their parent. ${young}`);
  else if (br.substrate) tell(`§d${mother.name}'s eggs hatched in the Mineral Substrate in ${ex.name}: ${what}, ${names}! §fThe grubs live buried in it and feed in it, not from the feeder. For their last ${br.pupaDays} park days each lies in a pupal cell, and they dig out as beetles in ${br.matureDays} park days.`);
  else if (br.nestBox) tell(`§d${mother.name}'s eggs hatched in the Nest Box in ${ex.name}: ${what}, ${names}! §fOwlets are grey-buff down and stay in the box their first ${BALANCE.owl.nestDays} park days, then hop about the floor and the low perches. ${young}`);
  else tell(`§d${mother.name} had ${what} in ${ex.name}: ${names}! §f${young}`);
  emit("animalBorn", { exhibit: ex, mother, animals: born });
  validate(ex.id); // crowding and shelter with the young counted
}

function pruneBirths(keep = 200) {
  const all = db.all(BIRTHS).sort((a, b) => a.day - b.day);
  for (const r of all.slice(0, Math.max(0, all.length - keep))) db.remove(BIRTHS, r.id);
}

// Put a newborn's mob next to its mother, or anywhere on the exhibit's floor; waits while the
// exhibit isn't loaded (checked every few seconds).
function placeYoung(a) {
  const ex = a.location.kind === "exhibit" && getExhibit(a.location.id);
  if (!ex?.seed) return false;
  const nest = db.all(NESTS).find((n) => n.youngId === a.id || n.youngIds?.includes(a.id)); // a chick hatches on its nest (flamingos), hatchlings on theirs (crocodiles)
  const near = nest?.pos ?? liveEntity(a.parents?.[0])?.location ?? ex.seed;
  const d = dim(ex.dimension);
  if (!d.isChunkLoaded(near)) return false;
  // Lava Ray pups are born in the lava beside their mother.
  // Owlets hatch in the Nest Box (0.1.81).
  const box = SPECIES[a.speciesId]?.breeding?.nestBox ? fixturesOf(ex).find((f) => f.type === "nest")?.pos : undefined;
  // Caterpillars hatch on a host plant (Soul Moths, 0.1.88): one no other caterpillar is on yet, while there is one.
  const plants = SPECIES[a.speciesId]?.breeding?.hostPlants ? ex.soul?.plantSpots ?? [] : [];
  const onIt = new Set(animalsIn(ex).filter((o) => o.id !== a.id && o.juvenile).map((o) => liveEntity(o.id)?.location).filter(Boolean).map((p) => `${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`));
  const free = plants.filter(([x, y, z]) => !onIt.has(`${x},${y},${z}`));
  const leaves = free.length ? free : plants;
  const leaf = leaves.length ? leaves[Math.floor(Math.random() * leaves.length)] : undefined;
  // Grubs hatch in the Mineral Substrate (Quartz Beetles, 0.1.89): each in a cell of it near their mother that no other
  // beetle lies in or is tunnelling to (beetleRules.js grubCell, beetle.js heldBeds), while there is one.
  const grubBed = SPECIES[a.speciesId]?.breeding?.substrate ? grubCell(substrateNear(ex, d, near), near, new Set([...residentCells(ex, a.id), ...heldBeds(ex.dimension)])) : undefined;
  // Hatchlings come up out of the Mineral Substrate (Shimmer Snails, 0.1.92): each on the cell of it nearest their parent
  // (anywhere in the exhibit: the eggs were laid in it) that no other animal is on, while there is one.
  const eggBed = SPECIES[a.speciesId]?.breeding?.eggBed ? grubCell(substrateNear(ex, d, near, Infinity, Infinity), near, residentCells(ex, a.id)) : undefined;
  const spot = nest?.pos ?? box ?? (leaf ? { x: leaf[0], y: leaf[1], z: leaf[2] } : undefined) ?? grubBed ?? eggBed ?? (SPECIES[a.speciesId]?.lavaSwimmer ? releaseSpot(ex.id, near, ["lava"]) : undefined) ?? releaseSpot(ex.id, near) ?? ex.seed;
  try {
    spawnInExhibit(a, ex, spot);
  } catch (error) {
    log(`couldn't place ${a.name} yet: ${error}`);
    return false;
  }
  a.needsSpawn = false;
  saveAnimal(a);
  return true;
}

// The exhibit's land cells over Mineral Substrate within `reach` blocks across and `rise` up or down of `near` ([{ x, y, z }],
// the cell over the block).
function substrateNear(ex, d, near, reach = 4, rise = 2) {
  const out = [];
  for (const [k, kind] of cellsOf(ex.id) ?? []) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (Math.abs(x + 0.5 - near.x) > reach || Math.abs(z + 0.5 - near.z) > reach || Math.abs(y - near.y) > rise) continue;
    try {
      if (d.getBlock({ x, y: y - 1, z })?.typeId === "zoocraft:mineral_substrate") out.push({ x, y, z });
    } catch {
      // unloaded
    }
  }
  return out;
}

// The cells the exhibit's other animals stand or lie in ("x,y,z").
function residentCells(ex, exceptId) {
  return new Set(animalsIn(ex).filter((o) => o.id !== exceptId).map((o) => liveEntity(o.id)?.location).filter(Boolean).map((p) => `${Math.floor(p.x)},${Math.floor(p.y + 0.01)},${Math.floor(p.z)}`));
}

function placeWaiting() {
  for (const a of db.all("animals")) if (a.needsSpawn && a.location.kind === "exhibit") placeYoung(a);
}

function parkDay({ day }) {
  for (const ex of allExhibits()) {
    const species = SPECIES[ex.speciesId];
    if (!species?.breeding || !ex.animalIds.length) continue;
    if ((ex.breeding?.lastDay ?? -1) >= day) continue; // once per park day, even after a reload
    setBreeding(ex, { lastDay: day });
    for (const a of animalsIn(ex)) {
      const own = SPECIES[a.speciesId] ?? species; // a companion species grows and gives birth by its own clock
      if (a.juvenile) {
        a.juvenileDaysLeft = (a.juvenileDaysLeft ?? own.breeding?.matureDays ?? species.breeding.matureDays) - 1;
        if (a.juvenileDaysLeft <= 0) growUp(a, ex);
        else saveAnimal(a);
      }
      if (a.expecting) {
        a.expecting.daysLeft -= 1;
        if (a.expecting.daysLeft <= 0) giveBirth(a, ex, own.breeding ? own : species, day);
        else saveAnimal(a);
      }
    }
    const fresh = getExhibit(ex.id);
    if (!fresh?.breeding?.on) continue;
    const s = breedingStatus(fresh);
    if (!s.ready) {
      if (fresh.breeding.goodDays) setBreeding(fresh, { goodDays: 0 });
      continue;
    }
    const good = (fresh.breeding.goodDays ?? 0) + 1;
    if (good >= B().goodDays) {
      setBreeding(fresh, { goodDays: 0 });
      startExpecting(fresh, species, s.pair, day, s.litter);
    } else setBreeding(fresh, { goodDays: good });
  }
}

// ---------------- nests (flamingos) ----------------
// The nests in an exhibit (animals/flamingo.js walks the parents over to them).
export function nestsIn(exId) {
  return db.all(NESTS).filter((n) => n.exhibitId === exId);
}

// A nest for a pair that starts expecting: the free nest site nearest the mother, on open ground if
// there's any (a flower or anything else standing on the mud keeps the nest waiting: syncNests). None
// free: no nest, and the young are born beside her as anywhere else.
function makeNest(ex, mother) {
  const taken = nestsIn(ex.id).map((n) => n.pos);
  const near = liveEntity(mother.id)?.location ?? ex.seed ?? { x: 0, y: 0, z: 0 };
  const d = dim(ex.dimension);
  const open = (ex.nestSpots ?? []).filter(([x, y, z]) => {
    try {
      return d.getBlock({ x, y, z })?.isAir === true;
    } catch {
      return false; // not loaded
    }
  });
  const pos = pickNestSpot(open, taken, near) ?? pickNestSpot(ex.nestSpots, taken, near);
  if (!pos) return undefined;
  const rec = { id: newId("ne"), exhibitId: ex.id, dimension: ex.dimension, pos, motherId: mother.id, day: today() };
  db.put(NESTS, rec);
  return rec;
}

// A sand nest for a crocodile that starts expecting: the free sand nest site nearest her (not right beside another
// nest). None free: no nest, and the young are born beside her. pos: the floor cell over the nest (the nest block
// is the floor block under it).
function makeSandNest(ex, mother) {
  const taken = nestsIn(ex.id).map((n) => n.pos);
  const near = liveEntity(mother.id)?.location ?? ex.seed ?? { x: 0, y: 0, z: 0 };
  const at = pickSandSpot(ex.sandSpots, taken, near);
  if (!at) return undefined;
  const rec = { id: newId("ne"), kind: "sand", exhibitId: ex.id, dimension: ex.dimension, pos: { x: at.x, y: at.y, z: at.z }, red: at.red, motherId: mother.id, day: today() };
  db.put(NESTS, rec);
  return rec;
}

// Is the nest in full sun (nothing but air or plants over it, up to BALANCE.croc.sky blocks)?
function nestSunny(rec) {
  try {
    const d = dim(rec.dimension);
    const read = blockReader(d, { croc: true });
    return openSky((dy) => read(rec.pos.x, rec.pos.y + dy, rec.pos.z), BALANCE.croc.sky);
  } catch {
    return true;
  }
}

// A sand nest's block: the Crocodile Nest in the floor at its stage (red: red sand), or the sand back.
function syncSandNest(rec) {
  const mother = getAnimal(rec.motherId);
  const species = SPECIES[mother?.speciesId] ?? SPECIES["zoocraft:crocodile"];
  const stage = crocNestStage(rec, mother, today(), species?.breeding?.gestationDays ?? 1, BALANCE.croc);
  const d = dim(rec.dimension);
  const at = { x: rec.pos.x, y: rec.pos.y - 1, z: rec.pos.z };
  if (!d.isChunkLoaded(at)) return;
  const block = d.getBlock(at);
  if (!block) return;
  if (stage === undefined) {
    if (block.typeId === BLOCKS.crocNest) block.setType(rec.red ? "minecraft:red_sand" : "minecraft:sand");
    db.remove(NESTS, rec.id);
    return;
  }
  if (block.typeId === "minecraft:sand" || block.typeId === "minecraft:red_sand") block.setType(BLOCKS.crocNest);
  if (block.typeId !== BLOCKS.crocNest) return; // built over: it waits
  const perm = block.permutation;
  if (perm.getState(STAGE) !== stage || perm.getState(RED) !== Boolean(rec.red)) block.setPermutation(perm.withState(STAGE, stage).withState(RED, Boolean(rec.red)));
}

// Every two seconds: each nest's block shows its stage, and a nest that has had its day crumbles back to
// the mud (its record goes). A nest whose spot is built over waits there until it's clear again.
function syncNests() {
  for (const rec of db.all(NESTS)) {
    if (rec.kind === "sand") {
      try {
        syncSandNest(rec);
      } catch {
        // Unloaded or replaced; the next pass catches up.
      }
      continue;
    }
    const mother = getAnimal(rec.motherId);
    const species = SPECIES[mother?.speciesId] ?? SPECIES["zoocraft:flamingo"];
    const stage = nestStage(rec, mother, rec.youngId ? getAnimal(rec.youngId) : undefined, species?.breeding?.gestationDays ?? 1);
    try {
      const d = dim(rec.dimension);
      if (!d.isChunkLoaded(rec.pos)) continue;
      const block = d.getBlock(rec.pos);
      if (!block) continue;
      if (stage === undefined) {
        if (block.typeId === BLOCKS.flamingoNest) block.setType("minecraft:air");
        db.remove(NESTS, rec.id);
        continue;
      }
      if (block.isAir) block.setType(BLOCKS.flamingoNest);
      if (block.typeId === BLOCKS.flamingoNest && block.permutation.getState(STAGE) !== stage) block.setPermutation(block.permutation.withState(STAGE, stage));
    } catch {
      // Unloaded or replaced; the next pass catches up.
    }
  }
}

export function initNursery() {
  on("parkDay", parkDay);
  system.runInterval(placeWaiting, 100);
  system.runInterval(syncNests, 40);
  log(`nursery: ${db.all("animals").filter((a) => a.juvenile).length} young, ${db.all("animals").filter((a) => a.expecting).length} expecting`);
}

export { sexOf };
