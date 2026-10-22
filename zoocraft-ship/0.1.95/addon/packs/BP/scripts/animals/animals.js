import { world, system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { on, emit } from "../core/events.js";
import { log } from "../core/log.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, speciesForEntity, pluralOf, livesOnLava } from "../data/species.js";
import { requiredArea } from "../data/profiles.js";
import { RATIONS, rationPlural } from "../data/items.js";
import { habitatArea } from "../exhibits/room.js";
import { simulateAnimal, dirtyExhibit, recoverInHolding, welfareScore, band, lowestNeed, adviceFor, hasCover, coverNeeded, hasMud, hasBask, hasAsh, hasEnd, comfortCauses, NEED_KEYS } from "./welfare.js";
import { allExhibits, getExhibit, profileOf, capacity, setCareWarnings, dirtied, removeResident } from "../exhibits/exhibits.js";
import { consume } from "../equipment/feeder.js";
import { allFixtures, fixturesOf, saveFixture, refreshLook } from "../equipment/fixtures.js";
import { hasDrinkingWater, drinksFrom, drinksFromPool, enrichmentKinds, enrichmentOptions, waterDirtFactor, drawUnits, isCold, isWarm, hasDen, isAnchored, hasTunnels, reachesFeeder } from "../equipment/rules.js";
import { hasClimbTree, canWash, treesMeasure } from "./climbRules.js";
import { getPark, parkTime, can, denyText } from "../park/park.js";
import { dim, message, center } from "../platform/mc.js";
import { cleanName } from "./names.js";
import { recoveryFactor, anchorUsePerDay } from "../research/research.js";
import { populationWeight, hasShelter, shelterNeeded, rivalStallions } from "./breeding.js";
import { shadeOf, pinkWarnings } from "./flamingoRules.js";
import { feedingPlaces, pushedOff, rankOrder, grassNeeded, grazeShare, hasGrass, herdWarnings } from "./zebraRules.js";
import { densOf, isDenned, keeperStop, keepInDen } from "./predators.js";
import { densNeeded, fastDay } from "./predatorRules.js";
import { ledgesNeeded, prideWarnings } from "./lionRules.js";
import { clash, screensNeeded, tigerWarnings } from "./tigerRules.js";
import { introToday } from "./tigerTurns.js";
import { shortOfBank, deepNeeded, crocWarnings, sizeOrder, mealDrain, wantsMeal } from "./crocRules.js";
import { hasCanopy, hasNestBoxes, hasShade, pandaWarnings } from "./pandaRules.js";
import { deepWaterSafe, troopWarnings } from "./gorillaRules.js";
import { hasPerchSpread, owlWarnings } from "./owlRules.js";
import { hasNylium, hasRubStem, grazerWarnings } from "./grazerRules.js";
import { hasWalls, hasHides, oneMale, geckoWarnings } from "./geckoRules.js";
import { hasThermalMud, boarWarnings } from "./boarRules.js";
import { hasSoulLight, hasHostPlants, mothWarnings } from "./mothRules.js";
import { hasSubstrate, beetleWarnings } from "./beetleRules.js";
import { hasPads, hopperWarnings } from "./hopperRules.js";
import { hasCrevices, hasMineralBed, snailWarnings } from "./snailRules.js";
import { hasRockFaces, hasBurrows, crabWarnings } from "./crabRules.js";
import { hasChorusFlowers, hasChorusHosts, hasLowLight, chorusMothWarnings } from "./chorusMothRules.js";
import { isNocturnalHouse } from "./nightRules.js";
import { hasEndPlants, hasWarmPads, hasRetreat, starbackWarnings } from "./starbackRules.js";
import { dayOf } from "../core/clock.js";

// Animals (spec sections 7, 19, 20). The record is the animal; the mob in the world is a view.
// Each mob carries only its record id. On load, mobs are matched back to records: duplicates are
// removed, mobs whose record says they're somewhere else are removed, and a record whose mob is
// unloaded is simply "not loaded", never escaped (AC-13). Only this module writes "animals".

const AN = "animals";
const RID = "zoocraft:rid";
const live = new Map(); // animal id -> entity id (never Entity objects across ticks)
const ZOO_TYPES = new Set(Object.values(SPECIES).map((s) => s.entityType));
const DIETS = Object.fromEntries(Object.entries(RATIONS).map(([item, r]) => [item, r.diet]));

export function getAnimal(id) {
  return db.get(AN, id);
}

export function allAnimals() {
  return db.all(AN);
}

export function animalsIn(ex) {
  return ex.animalIds.map((id) => getAnimal(id)).filter(Boolean);
}

// The residents by species, the exhibit's lead species first (mixed exhibits, 0.1.61).
export function speciesGroups(animals) {
  const by = new Map();
  for (const a of animals) {
    const species = SPECIES[a.speciesId];
    if (!species) continue;
    if (!by.has(species.id)) by.set(species.id, { species, animals: [] });
    by.get(species.id).animals.push(a);
  }
  return [...by.values()];
}

// What holds a species' comfort down in this exhibit (for adviceFor): its own causes in a shared
// exhibit, the exhibit's otherwise.
export function causesFor(ex, speciesId) {
  return ex.comfortCausesBy?.[speciesId] ?? ex.comfortCauses;
}

export function inHolding() {
  return allAnimals().filter((a) => a.location.kind === "holding");
}

export function welfare(a) {
  return welfareScore(a.needs, BALANCE.needs.weights);
}

export function liveEntity(animalId) {
  const eid = live.get(animalId);
  if (!eid) return undefined;
  const e = world.getEntity(eid);
  return e?.isValid ? e : undefined;
}

// `extra` adds fields for a zoo-born animal (juvenile, parents, sex). A caught animal gets a sex at
// random, or from its coat where the coat shows it (deer). A species with stripe patterns (tigers) gets
// one at random (a caught one keeps its own: `extra`).
export function createAnimal(species, coat, extra = {}) {
  const used = new Set(allAnimals().map((a) => a.name));
  let name = species.names.find((n) => !used.has(n));
  if (!name) name = `${species.names[0]} ${used.size + 1}`;
  const a = {
    id: newId("an"),
    speciesId: species.id,
    name,
    coat: Math.max(0, Math.min(species.coats.length - 1, coat ?? 0)),
    location: { kind: "carrier", id: undefined },
    needs: { ...BALANCE.needs.startNeeds },
    health: 100,
    ill: false,
    criticalSeconds: 0,
    lastPlayed: -1e9,
    outside: false,
    createdAt: parkTime(),
  };
  a.sex = species.hermaphrodite ? "hermaphrodite" : species.sexByCoat ? species.sexByCoat[a.coat] : Math.random() < 0.5 ? "female" : "male";
  if (species.pink) a.pink = 100; // caught flamingos come in rosy (animals/flamingoRules.js)
  if (species.patterns) a.pattern = Math.floor(Math.random() * species.patterns); // its own stripes (tigers), tail crest (crocodiles)
  if (species.sizes) a.size = Math.floor(Math.random() * species.sizes); // its own size class (crocodiles)
  Object.assign(a, extra);
  db.put(AN, a);
  return a;
}

export function saveAnimal(a) {
  db.put(AN, a);
}

export function setLocation(a, location) {
  a.location = location;
  db.put(AN, a);
}

const HOME_RADII = [4, 8, 16, 32];

// Spawn the mob for a record inside an exhibit. The mob's home is where it spawns.
export function spawnInExhibit(a, ex, spot) {
  const species = SPECIES[a.speciesId];
  const d = dim(ex.dimension);
  const e = d.spawnEntity(species.entityType, center(spot));
  e.setDynamicProperty(RID, a.id);
  e.nameTag = a.name;
  // A young buck has no antlers yet: young deer show the doe's look until they grow up.
  const look = a.juvenile && species.sexByCoat ? 0 : a.coat;
  if (species.coats.length > 1) e.triggerEvent(`zoocraft:coat_${look}`);
  // A tiger's sex (a male is bigger, with a full ruff) and its stripes; before the young one's size.
  if (species.sexLook) e.triggerEvent(`zoocraft:sex_${a.sex === "male" ? 1 : 0}`);
  if (species.patterns) e.triggerEvent(`zoocraft:pattern_${a.pattern ?? 0}`);
  if (species.sizes) e.triggerEvent(`zoocraft:size_${a.size ?? 2}`); // a crocodile's own size
  if (a.juvenile) e.triggerEvent("zoocraft:juvenile"); // smaller, with a smaller collision box
  if (species.manes && !a.juvenile) e.triggerEvent(`zoocraft:mane_${a.mane ?? 0}`); // a lion's mane: light or dark
  if (species.pink) e.setProperty("zoocraft:pink", a.juvenile ? 0 : shadeOf(a.pink, BALANCE.flamingo)); // rosy, fading or pale (a chick is grey whatever)
  const span = ex.bbox ? Math.max(ex.bbox.max.x - ex.bbox.min.x, ex.bbox.max.z - ex.bbox.min.z) / 2 + 2 : 8;
  const radius = HOME_RADII.find((r) => r >= span) ?? 32;
  e.triggerEvent(`zoocraft:home_${radius}`);
  live.set(a.id, e.id);
  if (species.dangerous) keepInDen(e, a); // shut in a Holding Den: it stays there (a cub born in one too)
  return e;
}

// Replace the mob with a fresh one where it stands: a youngster that grew up, or a mob whose
// young/adult look doesn't match its record. An unloaded mob is fixed when it loads.
export function respawnView(a) {
  const e = liveEntity(a.id);
  const ex = a.location.kind === "exhibit" && getExhibit(a.location.id);
  if (!e || !ex) return false;
  const at = { x: Math.floor(e.location.x), y: Math.floor(e.location.y), z: Math.floor(e.location.z) };
  despawn(a);
  spawnInExhibit(a, ex, at);
  return true;
}

export function despawn(a) {
  const e = liveEntity(a.id);
  live.delete(a.id);
  if (e) e.remove();
}

// --- mob <-> record reconciliation ---

// checkAge: only for mobs loading from the world (a just-spawned mob gets its juvenile event in the
// same tick, so it is never compared).
function track(entity, checkAge = false) {
  if (!entity?.isValid || !ZOO_TYPES.has(entity.typeId)) return;
  const rid = entity.getDynamicProperty(RID);
  if (typeof rid !== "string") {
    // Never registered (summoned by command): zoo animals only come from carriers.
    log(`removed unregistered ${entity.typeId} at ${Math.floor(entity.location.x)} ${Math.floor(entity.location.y)} ${Math.floor(entity.location.z)}`);
    entity.remove();
    return;
  }
  const a = getAnimal(rid);
  if (!a) {
    // A record we can't find: keep the mob for recovery, never delete it silently.
    if (!entity.hasTag("zoocraft_quarantine")) {
      entity.addTag("zoocraft_quarantine");
      log(`quarantined ${entity.typeId} with unknown record ${rid}`);
    }
    return;
  }
  if (a.location.kind !== "exhibit") {
    // The record says this animal is in a carrier or in holding: this mob is stale.
    entity.remove();
    return;
  }
  const prev = live.get(rid);
  if (prev && prev !== entity.id) {
    const other = world.getEntity(prev);
    if (other?.isValid) {
      log(`removed duplicate of ${a.name}`);
      entity.remove();
      return;
    }
  }
  live.set(rid, entity.id);
  if (entity.nameTag !== a.name) entity.nameTag = a.name;
  if (checkAge && Boolean(entity.getComponent("minecraft:is_baby")) !== Boolean(a.juvenile)) system.run(() => respawnView(a));
}

// --- simulation ---

// Drinking and foraging take whole units from real stock each time the exhibit's running total of
// what was used passes a whole unit.
function useStock(ex, field, records, amount) {
  ex[field] = (ex[field] ?? 0) + amount;
  const whole = Math.floor(ex[field]);
  if (whole <= 0) return;
  ex[field] -= whole; // what can't be taken is simply missed; the needs show it
  drawUnits(records, whole);
  for (const r of records) {
    saveFixture(r);
    refreshLook(r);
  }
}

export function simulate(seconds) {
  const park = getPark();
  if (!park) return;
  const peaceful = park.settings.peacefulCare;
  const days = seconds / BALANCE.clock.dayLength;
  const toHolding = [];
  const chilled = [];
  if (allFixtures("station").length) {
    for (const a of inHolding()) {
      recoverInHolding(a, seconds * recoveryFactor(), BALANCE);
      db.put(AN, a);
    }
  }
  for (const ex of allExhibits()) {
    if (!ex.animalIds.length) {
      if (ex.careWarnings.length) setCareWarnings(ex, []);
      continue;
    }
    const residents = animalsIn(ex);
    // Mixed species (0.1.61): each species gets its own care (its drink, food, cover, heat...), the
    // exhibit's space, cleanliness and shared fixtures count for everyone.
    const groups = speciesGroups(residents);
    if (!groups.length) continue;
    const profile = profileOf(ex);
    const fixtures = fixturesOf(ex);
    const allTroughs = fixtures.filter((f) => f.type === "trough");
    const filters = fixtures.filter((f) => f.type === "filter");
    const coolers = fixtures.filter((f) => f.type === "cooler");
    const heaters = fixtures.filter((f) => f.type === "heater");
    const anchors = fixtures.filter((f) => f.type === "anchor");
    const feeders = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
    // Space: everyone against the shared profile (a shared exhibit needs a quarter more room).
    const cap = capacity(ex);
    const spaceRatio = cap.usable / cap.required;
    const shelter = hasShelter(ex, BALANCE.breeding);
    if (!peaceful) dirtyExhibit(ex, residents.length, seconds, BALANCE, waterDirtFactor(ex, filters, BALANCE));
    const warnings = [];
    const causesBy = {};
    for (const { species, animals } of groups) {
      // Only troughs holding what this species drinks (water, or lava for Basalt Tortoises).
      const troughs = allTroughs.filter((t) => drinksFrom(species, t));
      const water = hasDrinkingWater(profile, ex, troughs, species);
      const cover = hasCover(species, ex);
      const cold = isCold(species, coolers);
      const mud = hasMud(species, ex);
      const heat = isWarm(species, heaters);
      const bask = hasBask(species, ex);
      const ash = hasAsh(species, ex);
      const end = hasEnd(species, ex);
      const den = hasDen(species, fixtures);
      const anchor = isAnchored(species, anchors);
      const tunnel = hasTunnels(species, fixtures);
      const tree = hasClimbTree(species, ex, fixtures);
      const wash = canWash(species, ex);
      // Zebras (0.1.74): grass to graze (part of their food, and unsettled without enough), one stallion
      // with the mares, and rank at the food (with too few feeding places the low-ranking ones get
      // pushed off: they're fed only what the others leave).
      const graze = !species.graze || hasGrass(ex.grassCells, grassNeeded(animals, species.graze, BALANCE.breeding.juvenileWeight));
      const share = grazeShareIn(ex, species, animals);
      const harem = !species.harem || !rivalStallions(animals, species).length;
      const pushed = new Set(pushedOffIn(ex, species, animals, feeders).map((a) => a.id));
      // Big predators (0.1.75): a Holding Den for each grown one (lions one spare), a ledge to rest up
      // high for each lion, a coalition of two males at most; on a planned fast day (one park day in
      // seven) the keepers don't feed them and their satiety drains slowly, so a fast is no hardship.
      const dens = !species.dangerous || densOf(ex).length >= densNeeded(species, animals);
      const ledge = !species.ledge || ex.ledgeCells === undefined || ex.ledgeCells >= ledgesNeeded(animals, BALANCE.lion);
      const coalition = !species.manes || animals.filter((a) => !a.juvenile && a.sex === "male").length <= BALANCE.lion.coalitionMax;
      const drainFactor = fastDay(species, dayOf(parkTime(), BALANCE.clock.dayLength), BALANCE.predators) ? BALANCE.predators.fastDrain : 1;
      // Tigers (0.1.76): screened floor to get out of sight, and one grown tiger loose at a time (two
      // loose together, but for a pair on their introduction day, fight).
      const privacy = !species.privacy || ex.screenCells === undefined || ex.screenCells >= screensNeeded(animals, BALANCE.tiger);
      const solitary = !species.solitary || !clash(animals.filter((a) => !a.juvenile && !isDenned(a.id)), introToday(ex.id));
      // Crocodiles (0.1.77): the sunny bank in size order (the smallest go without when it's short), and deep
      // water for all to go under at once. They eat in size order too, the biggest first, about once a week.
      const short = species.basks && ex.sunBankCells !== undefined ? shortOfBank(animals, ex.sunBankCells, BALANCE.croc) : new Set();
      const submerge = !species.submerges || ex.deepWaterCells === undefined || ex.deepWaterCells >= deepNeeded(animals, BALANCE.croc);
      if (species.rank) animals.splice(0, animals.length, ...sizeOrder(animals));
      // Red pandas (0.1.79): canopy enough up in the trees, a Nest Box each, and shade in a hot biome.
      const canopy = hasCanopy(species, ex, animals, BALANCE.redpanda);
      const nestbox = hasNestBoxes(species, fixtures, animals);
      const shade = hasShade(species, ex, BALANCE.redpanda);
      // Gorillas (0.1.80): one silverback with the females, and no deep water (they can't swim).
      const troop = !species.troop || !rivalStallions(animals, species).length;
      const deep = deepWaterSafe(species, ex);
      // Owls (0.1.81): Perches at different heights.
      const perches = hasPerchSpread(species, ex, BALANCE.owl);
      // Crimson Grazers (0.1.84): crimson ground underfoot and a stem to rub on.
      const nylium = hasNylium(species, ex, BALANCE.grazer);
      const rub = hasRubStem(species, ex);
      // Warped Geckos (0.1.85): wall to climb, a hide each by day (a crack or a Burrow Shelter), one grown male.
      const walls = hasWalls(species, ex, animals.length, BALANCE.gecko);
      const hide = hasHides(species, ex, fixtures.filter((f) => f.type === "burrow").length, animals.length);
      const males = oneMale(species, animals);
      // Cinder Boars (0.1.87): Thermal Mud to wallow in (too hot without it).
      const wallow = hasThermalMud(species, ex);
      // Soul Moths (0.1.88): a soul light to gather round; host plants in the floor, which the caterpillars eat (Chorus
      // Moths', 0.1.94: chorus standing on the floor).
      const soul = hasSoulLight(species, ex);
      const hostPlants = species.chorusFlowers ? hasChorusHosts(species, ex) : hasHostPlants(species, ex);
      // Quartz Beetles (0.1.89): Mineral Substrate to bury themselves in by day, which the grubs live and feed in.
      const bed = hasSubstrate(species, ex);
      // End Hoppers (0.1.91): Landing Pads enough to leap between, one of them high.
      const pads = hasPads(species, ex, animals.filter((a) => !a.juvenile).length, BALANCE.hopper);
      // Shimmer Snails (0.1.92): a crevice each to rest in, Mineral Substrate to graze.
      const crevices = hasCrevices(species, ex, animals.filter((a) => !a.juvenile).length);
      const mineral = hasMineralBed(species, ex);
      // Obsidian Crabs (0.1.93): rock faces to scrape, Mineral Substrate to dig into.
      const rock = hasRockFaces(species, ex, animals.filter((a) => !a.juvenile).length);
      const burrows = hasBurrows(species, ex, animals.filter((a) => !a.juvenile).length);
      // Chorus Moths (0.1.94): chorus flowers to hover at, one for each; a dim house.
      const flowers = hasChorusFlowers(species, ex, animals.filter((a) => !a.juvenile).length);
      const dim = hasLowLight(species, ex, BALANCE);
      // Starback Tortoises (0.1.95): chorus to browse, Warm Pads to bask on, a low roof to rest under.
      const endPlants = hasEndPlants(species, ex, animals.filter((a) => !a.juvenile).length);
      const warmPads = hasWarmPads(species, ex, animals.filter((a) => !a.juvenile).length);
      const retreat = hasRetreat(species, ex, animals.filter((a) => !a.juvenile).length);
      // Puzzle Feeders count with the equipment (while they hold food it eats), and climbing trees too.
      const puzzles = feeders.filter((f) => f.puzzle).map((f) => ({ ...f, type: "puzzle" }));
      const kinds = enrichmentKinds([...fixtures, ...puzzles], species, BALANCE, DIETS, treesMeasure(species, ex)?.trees ?? 0);
      const enrichmentPerDay = kinds.length * BALANCE.enrichment.perCategoryPerDay;
      const food = edible(feeders, species);
      // Flamingos eat their Flamingo Pellets first: they're what keeps them pink.
      if (species.pink) food.sort((f, g) => Number(Boolean(RATIONS[g.item]?.pink)) - Number(Boolean(RATIONS[f.item]?.pink)));
      // Young eat a share of an adult's rations, and without a sheltered corner they're never comfortable.
      const young = { ...species, rationUnitsPerParkDay: species.rationUnitsPerParkDay * BALANCE.breeding.juvenileFeed };
      // What holds this species' comfort down, so the advice names only that (and says "recovering" when nothing does).
      const causes = comfortCauses({ spaceRatio, water, cover, cold, mud, heat, bask, ash, den, end, anchor, tunnel, tree, wash, graze, harem, dens, ledge, coalition, privacy, solitary, bank: !short.size, submerge, canopy, nestbox, shade, troop, deep, perches, nylium, rub, walls, hide, males, wallow, soul, bed, pads, crevices, mineral, rock, burrows, flowers, dim, endPlants, warmPads, retreat }, BALANCE);
      causesBy[species.id] = causes;
      for (const a of animals) {
        const units = food.reduce((n, f) => n + f.units, 0);
        if (peaceful) {
          a.needs.cleanliness = ex.cleanliness;
          // Peaceful care eats nothing from the feeders, but what's in them still colours flamingos.
          if (species.pink && units > 0) {
            const share = species.rationUnitsPerParkDay * days;
            a.ateToday = (a.ateToday ?? 0) + share;
            if (food.some((f) => f.units > 0 && RATIONS[f.item]?.pink)) a.pelletsToday = (a.pelletsToday ?? 0) + share;
          }
        } else {
          // Crocodiles: a grown one eats only when it's down to its meal (about once a week; its satiety drains at a
          // seventh of the rate), then until it's full; a female guarding her nest eats nothing.
          const guarding = Boolean(species.sandNest && a.expecting?.nestId);
          const eats = (!species.meals || wantsMeal(a, species)) && !guarding;
          // A caterpillar (Soul Moths) eats the host plants in the floor (as much as it wants while there are enough),
          // never from the feeders.
          const larva = Boolean(a.juvenile && species.breeding?.hostPlants);
          // A grub (Quartz Beetles) lives and feeds in the Mineral Substrate, never at the feeders.
          const grub = Boolean(a.juvenile && species.breeding?.substrate);
          const ctx = { exhibitCleanliness: ex.cleanliness, spaceRatio, groupSize: animals.length, feederUnits: larva ? (hostPlants ? 100 : 0) : grub ? (bed ? 100 : 0) : eats ? units : 0, water, cover: a.juvenile ? cover && shelter : cover, cold, mud, heat, bask, ash, den, end, anchor, tunnel, tree, wash, graze, harem, dens, ledge, coalition, privacy, solitary, bank: !short.has(a.id), submerge, drainFactor: drainFactor * mealDrain(a, species), grazeShare: share, satietyCap: pushed.has(a.id) ? BALANCE.zebra.pushedSatiety : undefined, enrichmentPerDay, canopy, nestbox, shade, troop, deep, perches, nylium, rub, walls, hide, males, wallow, soul, bed, pads, crevices, mineral, rock, burrows, flowers, dim, endPlants, warmPads, retreat };
          const { unitsEaten } = simulateAnimal(a, a.juvenile ? young : species, ctx, seconds, BALANCE);
          if (species.meals && !a.juvenile) {
            // The meal: when it started (animals/croc.js plays it for anyone near), and whether it's still eating
            // (the feeder ran out before it was full).
            if (unitsEaten > 0 && !a.eating) {
              a.lastMeal = dayOf(parkTime(), BALANCE.clock.dayLength);
              a.mealTick = system.currentTick;
            }
            a.eating = unitsEaten > 0 && a.needs.satiety <= 100 - BALANCE.needs.drainPerDay.satiety / species.rationUnitsPerParkDay;
          }
          let left = larva || grub ? 0 : unitsEaten;
          for (const f of food) {
            if (left <= 0) break;
            const pink = RATIONS[f.item]?.pink; // read first: an emptied feeder forgets what it held
            const took = consume(f, left);
            left -= took;
            // What a flamingo ate this park day, and how much of it was Flamingo Pellets (its pink).
            if (species.pink) {
              a.ateToday = (a.ateToday ?? 0) + took;
              if (pink) a.pelletsToday = (a.pelletsToday ?? 0) + took;
            }
          }
          // A park day of critical care: recovery holding, with a clear task (spec section 7).
          if (a.ill && a.criticalSeconds >= BALANCE.recovery.holdAfterCriticalSeconds) toHolding.push(a);
        }
        db.put(AN, a);
      }
      if (!peaceful) {
        const pool = drinksFromPool(species, profile, ex);
        if (!pool) useStock(ex, "waterUsed", troughs, animals.length * BALANCE.trough.unitsPerAnimalPerDay * days);
        if (kinds.includes("forage")) useStock(ex, "forageUsed", fixtures.filter((f) => f.type === "basket" && species.dietTags.includes(DIETS[f.item])), BALANCE.basket.unitsPerDay * days);
      }
      warnings.push(...careWarnings(ex, animals, feeders, species, { water, cover, cold, mud, heat, bask, ash, den, end, anchor, tunnel, tree, wash, troughs, allTroughs, filters, coolers, heaters, anchors, tunnels: fixtures.filter((f) => f.type === "tunnel").length, kinds, profile, peaceful, causes }));
    }
    if (!peaceful) {
      // Shared fixtures run once for the exhibit, whichever species needs them.
      const needing = (flag) => groups.filter((g) => g.species[flag]).map((g) => g.species);
      if (needing("cold").length) useStock(ex, "coldUsed", coolers, BALANCE.cooler.unitsPerDay * days);
      if (needing("heat").length) useStock(ex, "heatUsed", heaters, BALANCE.heater.unitsPerDay * days);
      if (needing("anchor").length) useStock(ex, "anchorUsed", anchors, anchorUsePerDay() * days);
      // Thermal failure (spec section 10): a warning at once, then a recovery window, then recovery
      // holding for every animal in the exhibit. Nothing burns.
      const warmNeeded = needing("heat");
      if (warmNeeded.length) {
        const heat = warmNeeded.every((sp) => isWarm(sp, heaters));
        ex.chillSeconds = heat ? 0 : (ex.chillSeconds ?? 0) + seconds;
        if (ex.chillSeconds >= BALANCE.heater.graceSeconds) {
          chilled.push(...residents);
          ex.chillSeconds = 0;
        }
      }
    }
    ex.comfortCausesBy = causesBy;
    ex.comfortCauses = causesBy[ex.speciesId] ?? causesBy[groups[0].species.id];
    dirtied(ex);
    // One line per text, worst first, across the species.
    const seen = new Set();
    setCareWarnings(ex, warnings.sort((x, y) => y.severity - x.severity).filter((w) => !seen.has(w.text) && seen.add(w.text)));
  }
  for (const a of toHolding) if (!chilled.includes(a)) moveToHolding(a, "unwell");
  for (const a of chilled) moveToHolding(a, "too cold: the exhibit had no heat");
}

const EQUIPMENT_ADVICE = {
  basket: (s) => `a Hanging Food Basket with ${rationPlural(s.baitItem)}`,
  toy: () => "a Floating Toy in the pool",
  ball: () => "an Enrichment Ball on the ground",
  bone: () => "a Blaze Bone on the ground",
  skull: () => "a Wither Skull Ball on the ground",
  frame: () => "a Climbing Frame on the floor (or a climbing tree)",
  puzzle: (s) => `a Puzzle Feeder with ${rationPlural(s.baitItem)}`,
  scent: () => "a Scent Post on the floor",
};

// Feeders it can reach, holding a ration this species eats.
function edible(feeders, species) {
  return feeders.filter((f) => f.item && species.dietTags.includes(RATIONS[f.item]?.diet) && reachesFeeder(species, f));
}

function exhibitFeeders(ex) {
  return ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
}

// Feeding places at the feeders holding food this species eats (zebras feed in rank order: a Basic
// Feeder has room for 2 at once, a Hay Rack for 4; animals/zebraRules.js feedingPlaces).
export function feedingPlacesFor(ex, species, feeders = exhibitFeeders(ex)) {
  return feedingPlaces(edible(feeders, species).filter((f) => f.units > 0), BALANCE.zebra.places);
}

// The grown-ups pushed off the food by higher-ranking ones (species.feedRank): the lowest-ranking ones
// beyond the feeding places. Nobody when there's no food at all (then they're all hungry).
export function pushedOffIn(ex, species, animals, feeders = exhibitFeeders(ex)) {
  if (!species.feedRank) return [];
  const places = feedingPlacesFor(ex, species, feeders);
  return places > 0 ? pushedOff(rankOrder(animals, species, ex.animalIds), places) : [];
}

// The share of their food grazers get from the grass in the exhibit floor (0 for everyone else, and
// before the grass has been counted): their rations go that much further.
export function grazeShareIn(ex, species, animals) {
  return species.graze ? grazeShare(ex.grassCells, grassNeeded(animals, species.graze, BALANCE.breeding.juvenileWeight), species.graze) : 0;
}

function careWarnings(ex, residents, feeders, species, gear) {
  const out = [];
  const bands = BALANCE.needs.bands;
  // Zebras pushed off the food by higher-ranking ones: their advice says so.
  const pushed = new Set(pushedOffIn(ex, species, residents, feeders).map((a) => a.id));
  for (const a of residents) {
    const worst = lowestNeed(a.needs);
    const b = band(a.needs[worst], bands);
    if (a.outside) out.push({ severity: 3, text: `${a.name} is outside the exhibit! Catch it with an empty carrier and release it back inside.` });
    if (a.ill) out.push({ severity: 3, text: `${a.name} is unwell: fix its ${worst}.` });
    const tip = adviceFor(worst, species, gear.causes, pushed.has(a.id) ? BALANCE.zebra.places : undefined);
    if (b === "critical") out.push({ severity: 3, text: `${a.name}: ${worst} critical. ${tip}.` });
    else if (b === "urgent") out.push({ severity: 2, text: `${a.name}: ${worst} low. ${tip}.` });
    else if (b === "attention") out.push({ severity: 1, text: `${a.name}: ${worst} needs attention. ${tip}.` });
  }
  const perDay = populationWeight(species.breeding?.hostPlants || species.breeding?.substrate ? residents.filter((a) => !a.juvenile) : residents, BALANCE.breeding.juvenileFeed) * species.rationUnitsPerParkDay * (1 - grazeShareIn(ex, species, residents));
  const units = edible(feeders, species).reduce((n, f) => n + f.units, 0);
  const reach = feeders.filter((f) => reachesFeeder(species, f));
  const wrong = reach.some((f) => f.units > 0 && !species.dietTags.includes(RATIONS[f.item]?.diet));
  if (!feeders.length) out.push({ severity: 2, text: species.lavaSwimmer ? "No reachable feeder: put a Thermal Feeder at the edge of the lava pool, level with the lava." : "No reachable feeder." });
  else if (!reach.length && species.lavaSwimmer) out.push({ severity: 3, text: `${pluralOf(species)} feed in the lava: put a Thermal Feeder at the edge of the lava pool and fill it with ${rationPlural(species.baitItem)}.` });
  else if (!reach.length && species.browsesHigh) out.push({ severity: 3, text: `${pluralOf(species)} browse high: put an Elevated Browse Feeder inside and fill it with ${rationPlural(species.baitItem)}.` });
  else if (!reach.length && species.nectarFeeder) out.push({ severity: 3, text: `${pluralOf(species)} sip nectar: put a Nectar Feeder inside and fill it with ${rationPlural(species.baitItem)}.` });
  else if (!reach.length && species.mineralFeeder) out.push({ severity: 3, text: `${pluralOf(species)} eat only from a Mineral Feeder: put one inside and fill it with ${rationPlural(species.baitItem)}.` });
  else if (!reach.length && species.insectFeeder) out.push({ severity: 3, text: `${pluralOf(species)} hunt their food: put an Insect Feeder inside and fill it with ${rationPlural(species.baitItem)}.` });
  else if (!reach.length && feeders.every((f) => f.insect)) out.push({ severity: 3, text: `${pluralOf(species)} don't eat from an Insect Feeder: put a Basic Feeder inside.` });
  else if (!reach.length && feeders.every((f) => f.nectar)) out.push({ severity: 3, text: `${pluralOf(species)} don't eat from a Nectar Feeder: put a Basic Feeder inside.` });
  else if (!reach.length && feeders.every((f) => f.mineral)) out.push({ severity: 3, text: `${pluralOf(species)} don't eat from a Mineral Feeder: put a Basic Feeder inside.` });
  else if (!reach.length && feeders.every((f) => f.rack)) out.push({ severity: 3, text: `${pluralOf(species)} don't eat from a Hay Rack: put a Basic Feeder inside.` });
  else if (!reach.length) out.push({ severity: 3, text: `An Elevated Browse Feeder is too high for ${pluralOf(species)}: put a Basic Feeder inside.` });
  else if (units === 0 && wrong) out.push({ severity: 3, text: `Wrong food: ${pluralOf(species)} eat ${rationPlural(species.baitItem)}.` });
  else if (units === 0) out.push({ severity: 3, text: `Feeder empty: add ${rationPlural(species.baitItem)}.` });
  else if (units / perDay < 1) out.push({ severity: 2, text: `Feeder low: under a day of food left.` });
  const pool = drinksFromPool(species, gear.profile, ex);
  const wrongLiquid = gear.allTroughs.some((t) => !gear.troughs.includes(t));
  if (!gear.water && species.drinksLava) out.push({ severity: 2, text: `Nothing to drink: ${pluralOf(species)} drink lava, not water. Put a Lava Trough beside the floor and fill it with a lava bucket${wrongLiquid ? " (a Water Trough is no use to them)" : ""}.` });
  else if (!gear.water) out.push({ severity: 2, text: `No drinking water: put a Water Trough beside the floor and fill it with a water bucket${wrongLiquid ? " (a Lava Trough is only for Nether animals)" : ""}.` });
  else if (!pool && gear.troughs.reduce((n, t) => n + t.units, 0) < residents.length * BALANCE.trough.unitsPerAnimalPerDay) out.push({ severity: 1, text: species.drinksLava ? "Lava Trough low: add a lava bucket." : "Water Trough low: add a water bucket." });
  const head = gear.profile.minHeight;
  if (!gear.cover) out.push({ severity: 2, text: `${pluralOf(species)} want ${species.cover.why ?? "quiet cover"} over at least ${Math.round(species.cover.minFraction * 100)}% of the ground: tree leaves 2 to ${head + BALANCE.cover.height - 1} blocks up, or a roof at least ${head} blocks up (${ex.coveredCells} of ${coverNeeded(species, ex.usableArea)} blocks covered).` });
  // A roof lower than the headroom takes that floor away, and it never counts as cover: say so plainly.
  if (ex.lowCells > 0 && ex.usableArea > 0) out.push({ severity: species.cover ? 2 : 1, text: `${ex.lowCells} blocks of floor are under a roof or blocks lower than ${head} blocks, so ${pluralOf(species).toLowerCase()} can't use them${species.cover ? " and they aren't cover" : ""}. Raise the roof to ${head} blocks.` });
  if (species.cold && !gear.coolers.length) out.push({ severity: 3, text: `${pluralOf(species)} need a cold exhibit: put a Cooling Unit beside the floor or the pool and fill it with ice.` });
  else if (!gear.cold) out.push({ severity: 3, text: "The Cooling Unit is out of ice: add ice, packed ice, blue ice or snow blocks." });
  else if (species.cold && gear.coolers.reduce((n, c) => n + c.units, 0) <= BALANCE.cooler.lowAt) out.push({ severity: 1, text: "Cooling Unit low: add more ice." });
  if (species.heat) {
    const left = Math.max(1, Math.ceil((BALANCE.heater.graceSeconds - (ex.chillSeconds ?? 0)) / 60));
    const then = gear.peaceful ? "" : ` They go to recovery holding in about ${left} minute${left === 1 ? "" : "s"} if it isn't fixed.`;
    if (!gear.heaters.length) out.push({ severity: 3, text: `${pluralOf(species)} are cold: put a Thermal Regulator beside the floor and fuel it with charcoal or coal.${then}` });
    else if (!gear.heat) out.push({ severity: 3, text: `The Thermal Regulator is out of fuel: add charcoal, coal, coal blocks or blaze rods.${then}` });
    else if (gear.heaters.reduce((n, h) => n + h.units, 0) <= BALANCE.heater.lowAt) out.push({ severity: 1, text: "Thermal Regulator low: add more fuel." });
  }
  if (!gear.bask && species.bask.rest) out.push({ severity: 2, text: `${pluralOf(species)} need warm spots to rest on the bank: at least ${species.bask.minCells} magma blocks in the exhibit floor (${ex.hotCells} now). Off the lava and off magma they shiver. Magma blocks don't hurt them (sneak across them yourself).` });
  else if (!gear.bask) out.push({ severity: 2, text: `${pluralOf(species)} need basking pads: at least ${species.bask.minCells} magma blocks in the exhibit floor (${ex.hotCells} now). Magma blocks don't hurt them (sneak across them yourself).` });
  if (!gear.ash) out.push({ severity: 2, text: `${pluralOf(species)} need a warm ash bed to dig in: at least ${species.ash.minCells} Warm Ash blocks in the exhibit floor (${ex.ashCells} now). Craft Warm Ash from gravel or soul soil with charcoal.` });
  if (!gear.den && species.den === "burrow") out.push({ severity: 2, text: `${pluralOf(species)} need a burrow to sleep in: place a Burrow Shelter on the exhibit floor.` });
  else if (!gear.den) out.push({ severity: 2, text: `${pluralOf(species)} need a den to curl up in: place an Ember Den on the exhibit floor.` });
  // Containment (spec AC-11): without a charged anchor the ferrets stop blinking and are unsettled.
  if (species.anchor) {
    if (!gear.anchors.length) out.push({ severity: 3, text: `${pluralOf(species)} are unsettled without a Containment Anchor: put one beside the floor and charge it with ender pearls. They don't blink without one.` });
    else if (!gear.anchor) out.push({ severity: 3, text: "The Containment Anchor is out of charge: add ender pearls, eyes of ender or popped chorus fruit. The Rift Ferrets have stopped blinking." });
    else if (gear.anchors.reduce((n, a) => n + a.units, 0) <= BALANCE.anchor.lowAt) out.push({ severity: 1, text: "Containment Anchor low: add more ender pearls." });
  }
  if (!gear.tunnel) out.push({ severity: 2, text: `${pluralOf(species)} need tunnels to blink between and hide in: place ${species.tunnels.min} or more Rift Tunnels on the exhibit floor (${gear.tunnels} now).` });
  if (!gear.end) out.push({ severity: 2, text: `${pluralOf(species)} need End ground underfoot: at least ${species.endGround.minCells} end stone blocks in the exhibit floor (${ex.endCells} now).` });
  // Climbers (raccoons): something to climb, and water to wash their food in.
  if (!gear.tree) out.push({ severity: 2, text: `${pluralOf(species)} need something to climb: a climbing tree (a trunk 3 or more logs high standing on the floor) or a Climbing Frame. Keep it back from the walls.` });
  if (!gear.wash) out.push({ severity: 2, text: `${pluralOf(species)} wash their food before they eat it: give them water, a pool in the floor (even one block).` });
  // Flamingos (0.1.72): their pink comes from Flamingo Pellets.
  if (species.pink) out.push(...pinkWarnings(residents.filter((a) => !a.juvenile), edible(feeders, species).some((f) => f.units > 0 && RATIONS[f.item]?.pink), pluralOf(species), BALANCE.flamingo));
  // Zebras (0.1.74): rival stallions with the mares, the ones pushed off the food, and grass to graze.
  if (species.harem || species.graze || species.feedRank) out.push(...herdWarnings(residents, species, { places: feedingPlacesFor(ex, species, feeders), grassCells: ex.grassCells, order: ex.animalIds, plural: pluralOf(species) }, BALANCE.zebra, BALANCE.breeding.juvenileWeight));
  // Big predators (0.1.75): what stops the keepers going in (the double Keeper Gate, the dens), and the
  // pride's ledges and males.
  if (species.dangerous) {
    const stop = keeperStop(ex);
    if (stop) out.push({ severity: 3, text: stop });
  }
  if (species.ledge) out.push(...prideWarnings(ex, residents, ex.ledgeCells ?? Infinity, BALANCE.lion));
  // Tigers (0.1.76): screened floor for privacy, and grown tigers loose together.
  if (species.solitary) out.push(...tigerWarnings(ex, residents, residents.filter((a) => !a.juvenile && !isDenned(a.id)), introToday(ex.id), BALANCE.tiger));
  // Crocodiles (0.1.77): the sunny basking bank and deep water to go under (shore clearance is the keepers').
  if (species.basks) out.push(...crocWarnings(ex, residents, BALANCE.croc));
  // Red pandas (0.1.79): the canopy, a Nest Box each, and shade in a hot biome.
  if (species.canopy) out.push(...pandaWarnings(ex, residents, fixturesOf(ex), pluralOf(species), BALANCE.redpanda));
  // Gorillas (0.1.80): deep water, rival silverbacks, too big a bachelor group.
  if (species.troop) out.push(...troopWarnings(ex, residents, rivalStallions(residents, species), BALANCE.gorilla));
  // Owls (0.1.81): Perches all about one height, breeding on without a Nest Box.
  if (species.roosts) out.push(...owlWarnings(ex, residents, fixturesOf(ex), BALANCE.owl));
  // Crimson Grazers (0.1.84): crimson nylium underfoot and a crimson stem to rub on.
  if (species.nylium) out.push(...grazerWarnings(ex, pluralOf(species), BALANCE.grazer));
  // Warped Geckos (0.1.85): wall to climb, a hide each, one grown male.
  if (species.clings) out.push(...geckoWarnings(ex, residents, fixturesOf(ex).filter((f) => f.type === "burrow").length, pluralOf(species), BALANCE.gecko));
  // Cinder Boars (0.1.87): Thermal Mud to wallow in, one grown boar.
  if (species.wallow) out.push(...boarWarnings(ex, residents, pluralOf(species), species));
  // Soul Moths (0.1.88): a soul light, host plants for the caterpillars while breeding is on.
  if (species.soulLight) out.push(...mothWarnings(ex, residents, pluralOf(species), species, BALANCE.moth));
  // Quartz Beetles (0.1.89): Mineral Substrate to bury themselves in, and for the grubs while breeding is on.
  if (species.substrate) out.push(...beetleWarnings(ex, residents, pluralOf(species), species, BALANCE.beetle));
  // End Hoppers (0.1.91): Landing Pads to leap between, one of them high.
  if (species.pads) out.push(...hopperWarnings(ex, residents, pluralOf(species), BALANCE.hopper));
  // Shimmer Snails (0.1.92): a crevice each, the Mineral Substrate.
  if (species.crevices) out.push(...snailWarnings(ex, residents, pluralOf(species), species, BALANCE.snail));
  // Obsidian Crabs (0.1.93): rock faces to scrape, Mineral Substrate to dig into.
  if (species.rockFaces) out.push(...crabWarnings(ex, residents, pluralOf(species), species, BALANCE.crab));
  // Chorus Moths (0.1.94): chorus flowers, low light, chorus on the floor for the caterpillars while breeding is on.
  // Starback Tortoises (0.1.95): chorus, Warm Pads, the retreat, Mineral Substrate to nest in while breeding is on.
  if (species.warmPads) out.push(...starbackWarnings(ex, residents, pluralOf(species), species, BALANCE.starback));
  if (species.chorusFlowers) out.push(...chorusMothWarnings(ex, residents, pluralOf(species), species, BALANCE.chorusMoth, ex.house && species.lowLight ? isNocturnalHouse(ex, BALANCE) : undefined));
  if (residents.some((a) => a.juvenile) && !hasShelter(ex, BALANCE.breeding)) {
    const need = shelterNeeded(ex.usableArea, BALANCE.breeding);
    out.push({ severity: 2, text: `Young ${pluralOf(species).toLowerCase()} need a sheltered corner: tree leaves or a roof over at least ${need} blocks of floor (${ex.coveredCells ?? 0} now).` });
  }
  if (!gear.mud) out.push({ severity: 2, text: `${pluralOf(species)} need a mud wallow to bathe in: at least ${species.mud.minCells} blocks of mud in the exhibit floor (${ex.mudCells} now). Make mud by using a water bottle on dirt.` });
  if (pool && !livesOnLava(species) && !gear.filters.length) out.push({ severity: 1, text: "No Water Filter: the pool gets dirty faster. Place one at the pool's edge." });
  if (!gear.kinds.length) {
    const options = enrichmentOptions(species, BALANCE).map((t) => EQUIPMENT_ADVICE[t](species));
    if (options.length) out.push({ severity: 1, text: `No enrichment equipment: try ${options.join(" or ")}.` });
  }
  // Deduplicate: one line per text, worst first.
  const seen = new Set();
  return out.sort((x, y) => y.severity - x.severity).filter((w) => !seen.has(w.text) && seen.add(w.text));
}

// Park days of food in the feeders: in a shared exhibit, for the species that runs out first. Grazers'
// food goes further with grass to graze.
export function feederDaysLeft(ex) {
  const groups = speciesGroups(animalsIn(ex));
  if (!groups.length) return undefined;
  const feeders = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
  let least;
  for (const { species, animals } of groups) {
    // Grubs (Quartz Beetles) and caterpillars (Soul Moths) feed in the substrate and on the host plants, not here.
    const eaters = species.breeding?.hostPlants || species.breeding?.substrate ? animals.filter((a) => !a.juvenile) : animals;
    if (!eaters.length) continue;
    const units = edible(feeders, species).reduce((n, f) => n + f.units, 0);
    const d = units / (populationWeight(eaters, BALANCE.breeding.juvenileFeed) * species.rationUnitsPerParkDay * (1 - grazeShareIn(ex, species, eaters)));
    if (least === undefined || d < least) least = d;
  }
  return least;
}

// Every few seconds: flag loaded animals standing outside their exhibit (AC-02). Unloaded
// animals are never flagged.
export function watch() {
  for (const [rid, eid] of live) {
    const a = getAnimal(rid);
    const e = world.getEntity(eid);
    if (!a || !e?.isValid) {
      if (!e?.isValid) live.delete(rid);
      continue;
    }
    const ex = a.location.kind === "exhibit" && getExhibit(a.location.id);
    if (!ex?.bbox) continue;
    if (a.onRide) continue; // a Void Ray flying the Expedition loop (visitors/rides.js) is out on purpose
    if (SPECIES[a.speciesId]?.dangerous && isDenned(a.id)) continue; // shut in a Holding Den, in the fence line
    const p = e.location;
    const b = ex.penBox ?? ex.bbox; // the pen as built, while a broken fence leaves it open (0.1.87)
    const outside = p.x < b.min.x - 1 || p.x > b.max.x + 2 || p.z < b.min.z - 1 || p.z > b.max.z + 2 || p.y < b.min.y - 4;
    if (outside !== a.outside) {
      a.outside = outside;
      db.put(AN, a);
      if (outside) emit("animalOutside", { animal: a, exhibit: ex });
    }
  }
}

export function play(player, entity) {
  const rid = entity.getDynamicProperty(RID);
  const a = typeof rid === "string" && getAnimal(rid);
  if (!a) return;
  if (!can(player, "care")) return message(player, denyText("care"));
  const now = parkTime();
  if (now - a.lastPlayed < BALANCE.care.playCooldown) return message(player, `§e${a.name} wants a rest before playing again.`);
  a.lastPlayed = now;
  a.needs.enrichment = Math.min(100, a.needs.enrichment + BALANCE.care.playEnrichment);
  db.put(AN, a);
  try {
    entity.dimension.spawnParticle("minecraft:heart_particle", { x: entity.location.x, y: entity.location.y + 0.8, z: entity.location.z });
  } catch {
    // Cosmetic only.
  }
  message(player, `§a${a.name} enjoyed that. Enrichment ${Math.round(a.needs.enrichment)}.`);
  emit("careGiven", { player, kind: "play", animal: a });
}

// A new name from the clipboard or a vanilla name tag. A name that cleans down to nothing keeps
// the old one (and puts it back over the mob's head).
export function renameAnimal(animal, raw, player) {
  const a = getAnimal(animal.id);
  if (!a) return;
  const name = cleanName(raw);
  const e = liveEntity(a.id);
  if (!name) {
    if (e) e.nameTag = a.name;
    return message(player, "§eThat name is empty. Try one with letters in it.");
  }
  const old = a.name;
  a.name = name;
  db.put(AN, a);
  if (e) e.nameTag = name;
  if (old !== name) message(player, `§a${old} is now called ${name}.`);
}

export function animalFromEntity(entity) {
  const rid = entity.getDynamicProperty(RID);
  return typeof rid === "string" ? getAnimal(rid) : undefined;
}

export function isZooAnimal(entity) {
  return ZOO_TYPES.has(entity.typeId);
}

// A conservation release (quests/conservation.js): the animal leaves the park's records for good.
// Its mob is already gone (it went into a carrier first); the record is removed, not quarantined.
export function retireAnimal(a) {
  despawn(a);
  db.remove(AN, a.id);
}

export function moveToHolding(a, why) {
  if (a.location.kind === "exhibit") {
    const ex = getExhibit(a.location.id);
    if (ex) removeResident(ex, a.id);
  }
  despawn(a);
  setLocation(a, { kind: "holding", id: undefined, why });
  emit("animalToHolding", { animal: a, why });
}

export function initAnimals() {
  world.afterEvents.entityLoad.subscribe(({ entity }) => track(entity, true));
  world.afterEvents.entitySpawn.subscribe(({ entity }) => track(entity));
  world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
    if (!ZOO_TYPES.has(removedEntity.typeId)) return;
    const rid = removedEntity.getDynamicProperty(RID);
    if (typeof rid === "string" && live.get(rid) === removedEntity.id) live.delete(rid);
  });
  world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
    if (!ZOO_TYPES.has(deadEntity.typeId)) return;
    let a;
    try {
      a = animalFromEntity(deadEntity);
    } catch {
      return; // the mob is already gone; the record stays where it was
    }
    // Zoo animals ignore damage, so this is /kill or similar: keep the animal, send it to holding.
    if (a) system.run(() => moveToHolding(a, "lost its mob"));
  });
  on("simStep", ({ seconds }) => simulate(seconds));
  // Mobs already loaded when the script starts (after /reload).
  system.run(() => {
    for (const d of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
      for (const type of ZOO_TYPES) for (const e of dim(d).getEntities({ type })) track(e, true);
    }
  });
  log(`animals: ${allAnimals().length} registered`);
}

export { NEED_KEYS, speciesForEntity };
