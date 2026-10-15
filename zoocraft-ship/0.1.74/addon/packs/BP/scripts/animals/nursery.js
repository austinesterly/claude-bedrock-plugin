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
import { allExhibits, getExhibit, profileOf, setBreeding, addResident, releaseSpot, validate } from "../exhibits/exhibits.js";
import { animalsIn, getAnimal, createAnimal, saveAnimal, spawnInExhibit, liveEntity, respawnView, welfare, feederDaysLeft } from "./animals.js";
import { breedingCheck, sexOf, rivalStallions } from "./breeding.js";
import { shadeOf, pickNestSpot, nestStage } from "./flamingoRules.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { BLOCKS } from "../data/items.js";
import { getPark, can, denyText } from "../park/park.js";
import { dim, message, onlinePlayers } from "../platform/mc.js";

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

const BIRTHS = "births";
const B = () => BALANCE.breeding;
const NESTS = "nests";
/** @type {any} Custom block states aren't in the vanilla typings. */
const STAGE = "zoocraft:stage";

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
  return breedingCheck(
    {
      on: Boolean(st.on),
      species,
      plural: species ? pluralOf(species) : "Animals",
      animals: animalsIn(ex).filter((a) => !species || a.speciesId === species.id),
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
      pinkOf: (a) => shadeOf(a.pink, BALANCE.flamingo),
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
  const pink = SPECIES[a.speciesId]?.pink;
  if (pink) a.pink = 0; // a grey chick grows up pale (animals/flamingoRules.js)
  saveAnimal(a);
  respawnView(a); // an unloaded mob is swapped when it loads (animals.js track)
  // A colt that grows up in a harem is a second stallion: he'll fight the stallion over the mares (zebras).
  const species = SPECIES[a.speciesId];
  const rival = Boolean(species?.harem) && rivalStallions(animalsIn(ex).filter((b) => b.speciesId === a.speciesId), species).some((b) => b.id === a.id);
  tell(`§a${a.name} in ${ex.name} is all grown up.${pink ? " §7It's pale: Flamingo Pellets in a feeder it eats from turn it pink over a few park days." : ""}${rival ? " §eHe's a young stallion now and will fight the stallion over the mares: move him to a bachelor group (an exhibit with no mares)." : ""}`);
}

function startExpecting(ex, species, pair, day) {
  const br = species.breeding;
  pair.mother.expecting = { daysLeft: br.gestationDays, fatherId: pair.father.id, litter: br.litter, since: day };
  // Nesting birds: a nest on the free nest site nearest the mother.
  const nest = species.nest ? makeNest(ex, pair.mother) : undefined;
  if (nest) pair.mother.expecting.nestId = nest.id;
  saveAnimal(pair.mother);
  const what = br.litter === 1 ? `a ${br.young}` : br.youngPlural;
  const due = `${br.gestationDays} park day${br.gestationDays === 1 ? "" : "s"}`;
  if (species.nest) tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} are nesting!${nest ? ` They build a mud nest at the water's edge (${nest.pos.x} ${nest.pos.y} ${nest.pos.z}) today, then sit on the egg in turns:` : ""} ${what} hatches in ${due}.`);
  else tell(`§d${pair.mother.name} and ${pair.father.name} in ${ex.name} are expecting ${what}! Due in ${due}.`);
}

function giveBirth(mother, ex, species, day) {
  const br = species.breeding;
  const exp = mother.expecting;
  const father = getAnimal(exp.fatherId);
  const born = [];
  for (let i = 0; i < exp.litter; i++) {
    const coat = species.sexByCoat ? Math.floor(Math.random() * species.coats.length) : Math.random() < 0.5 || !father ? mother.coat : father.coat;
    const young = createAnimal(species, coat, { juvenile: true, juvenileDaysLeft: br.matureDays, parents: [mother.id, exp.fatherId], bornDay: day, needsSpawn: true });
    young.location = { kind: "exhibit", id: ex.id };
    saveAnimal(young);
    addResident(ex, young.id, species.id);
    born.push(young);
  }
  // Nesting birds: the chick hatches on the nest (placeYoung puts it there), which stays until it grows up.
  const nest = exp.nestId && db.get(NESTS, exp.nestId);
  if (nest && born.length) db.put(NESTS, { ...nest, youngId: born[0].id });
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
  const nest = db.all(NESTS).find((n) => n.youngId === a.id); // a chick hatches on its nest (flamingos)
  const near = nest?.pos ?? liveEntity(a.parents?.[0])?.location ?? ex.seed;
  const d = dim(ex.dimension);
  if (!d.isChunkLoaded(near)) return false;
  // Lava Ray pups are born in the lava beside their mother.
  const spot = nest?.pos ?? (SPECIES[a.speciesId]?.lavaSwimmer ? releaseSpot(ex.id, near, ["lava"]) : undefined) ?? releaseSpot(ex.id, near) ?? ex.seed;
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
      startExpecting(fresh, species, s.pair, day);
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

// Every two seconds: each nest's block shows its stage, and a nest that has had its day crumbles back to
// the mud (its record goes). A nest whose spot is built over waits there until it's clear again.
function syncNests() {
  for (const rec of db.all(NESTS)) {
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
