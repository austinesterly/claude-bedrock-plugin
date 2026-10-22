import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, pluralOf } from "../data/species.js";
import { band, NEED_KEYS, adviceFor, lowestNeed, coverNeeded } from "../animals/welfare.js";
import { getExhibit, allExhibits, capacity, validate, rename, removeExhibit, nearestExhibit, profileOf, speciesIn } from "../exhibits/exhibits.js";
import { COMMUNITIES } from "../exhibits/mixing.js";
import { nocturnalLine, isNocturnalHouse, stateText } from "../animals/nightRules.js";
import { nightState } from "../animals/night.js";
import { climbLine } from "../animals/climbRules.js";
import { flockLine, pinkLine } from "../animals/flamingoRules.js";
import { herdLine, rankLine } from "../animals/zebraRules.js";
import { densOf, isDenned } from "../animals/predators.js";
import { densNeeded, dangerLine } from "../animals/predatorRules.js";
import { ledgesNeeded } from "../animals/lionRules.js";
import { screensNeeded } from "../animals/tigerRules.js";
import { turnsText } from "../animals/tigerTurns.js";
import { shoreLine, bankNeeded, deepNeeded, mealsLine, rankLine as crocRankLine, lengthOf, bodyOf } from "../animals/crocRules.js";
import { pandaLines } from "../animals/pandaRules.js";
import { apeLine, troopLines } from "../animals/gorillaRules.js";
import { owlLines } from "../animals/owlRules.js";
import { grazerLines } from "../animals/grazerRules.js";
import { geckoLines } from "../animals/geckoRules.js";
import { boarLines } from "../animals/boarRules.js";
import { mothLines } from "../animals/mothRules.js";
import { beetleLines } from "../animals/beetleRules.js";
import { hopperLines } from "../animals/hopperRules.js";
import { snailLines } from "../animals/snailRules.js";
import { crabLines } from "../animals/crabRules.js";
import { chorusMothLines } from "../animals/chorusMothRules.js";
import { starbackLines } from "../animals/starbackRules.js";
import { dayOf } from "../core/clock.js";
import { parkTime } from "../park/park.js";
import { db } from "../persistence/db.js";
import { AERIAL_HEIGHT, HABITAT_PROFILES } from "../data/profiles.js";
import { animalsIn, welfare, feederDaysLeft, animalFromEntity, renameAnimal, causesFor, feedingPlacesFor, pushedOffIn } from "../animals/animals.js";
import { MAX_NAME } from "../animals/names.js";
import { can, denyText } from "../park/park.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { viewedExhibits } from "../visitors/points.js";
import { message } from "../platform/mc.js";
import { breedingStatus, toggleBreeding, sexOf } from "../animals/nursery.js";
import { checkRelease } from "../quests/conservation.js";
import { packForRelease } from "../transport/carriers.js";
import { CARRIERS } from "../data/items.js";

// Exhibit Clipboard (spec section 16): count and capacity, structural state, the five needs,
// supply days left, and the single most useful next action.

const STATE_TEXT = {
  draft: "§7Draft (not ready)",
  ready: "§aReady for animals",
  occupied: "§aOpen",
  unsafe: "§cUnsafe: not enclosed",
};
const BAND_COLOR = { healthy: "§a", attention: "§e", urgent: "§6", critical: "§c" };

// "rabbits, deer and capybaras (Meadow); otters and capybaras (Wetland); ..." for the empty exhibit's advice.
function sharingText() {
  const plural = (id) => (SPECIES[id].plural ?? `${SPECIES[id].displayName}s`).toLowerCase();
  return Object.values(COMMUNITIES)
    .map((c) => `${c.members.map(plural).join(", ").replace(/, ([^,]*)$/, " and $1")} (${c.label})`)
    .join("; ");
}
const NEED_LABEL = { satiety: "Food", comfort: "Comfort", cleanliness: "Cleanliness", enrichment: "Enrichment", social: "Company" };

function needLine(needs) {
  return NEED_KEYS.map((k) => `${BAND_COLOR[band(needs[k], BALANCE.needs.bands)]}${NEED_LABEL[k]} ${Math.round(needs[k])}`).join("§7, ");
}

export function nextAction(ex) {
  if (ex.controllerMissing) return "Place a new Exhibit Controller next to the exhibit.";
  if (!ex.seed) return "Use the Habitat Marker on the controller, then on the ground inside.";
  if (ex.issues.length) return ex.issues[0];
  if (ex.careWarnings.length) return ex.careWarnings[0].text;
  if (!ex.animalIds.length) return `Catch an animal with a Small Carrier and release it here. Otters need a pool: about a third water, 2 blocks deep, with dry bank. Capybaras travel in a Livestock Crate and want mostly grassy bank with a shallow pool. Deer travel in a Livestock Crate too and want room (100 blocks for one) with trees or a roof (at least 4 blocks up) over part of it. Penguins live in colonies of 3 or more and need a deep pool, a dry bank and a Cooling Unit with ice. Giraffes travel in a Reinforced Crate, need 7 blocks of headroom and eat from an Elevated Browse Feeder. Elephants travel in a Reinforced Crate too, need lots of room (256 blocks for one) and a mud wallow: 6 or more blocks of mud in the floor. Basalt Tortoises come from the Nether in a Thermal Carrier and need a fuelled Thermal Regulator beside the floor, 4 or more magma blocks in it to bask on, and a Lava Trough filled with lava buckets to drink from. Ember Foxes come from the Nether in a Thermal Carrier too: a fuelled Thermal Regulator, a Lava Trough, 4 or more Warm Ash blocks in the floor and an Ember Den. Lava Rays come in a Thermal Carrier and swim in a lava pool: mostly lava, 2 blocks deep in 8 or more spots, with a bank to stand on and a Thermal Feeder at the pool's edge. Fill it with Clear Lava (a lava bucket used on a Lava Filter) to see them under the surface. Striders come in a Thermal Carrier too and walk across a lava pool: at least 40% lava with a bank, 4 or more magma blocks on the bank to rest on, and warped fungus in a Basic Feeder. Lava sets wooden fences on fire, so fence a lava pool with walls, nether brick fence or glass. Chorus Deer come from the End in a Stabilized Carrier (Dimensional Preparation research) and want room with 8 or more end stone blocks in the floor, trees, chorus plants or a roof over part of it, and Chorus Browse (crafted from chorus fruit) in a Basic Feeder. Void Rays come in a Stabilized Carrier too and fly, and they are giants: a roofed exhibit with 14 blocks of air over 400 blocks of floor (20 x 20; 16 or more end stone), 2 or more Void Perches floating up in the air to rest on (place them, then measure), and Chorus Browse in a Basic Feeder on the floor. Rift Ferrets come in a Stabilized Carrier too and blink about: a Containment Anchor beside the floor charged with ender pearls, 2 or more Rift Tunnels on the floor to blink between and hide in, 6 or more end stone blocks, and Chorus Browse in a Basic Feeder. Hedgehogs travel in a Small Carrier, eat Insect Rations (an Insect Hatchery grows them), want a Burrow Shelter on the floor, and sleep by day: build them a nocturnal house, a fully enclosed building with no daylight inside, lit only by red or purple Nocturnal Lamps, and they are up by day for the guests. Raccoons travel in a Small Carrier and climb, so their exhibit has to be climb-proof (glass walls, an overhang along the top of the wall, or a roof: this page says whether it is), with a climbing tree (3 or more logs high) or a Climbing Frame, a pool to wash their food in (even one block), and Fruit, Insect or Fish Rations; a Puzzle Feeder keeps them busy. Flamingos travel in a Small Carrier and live in flocks of 3 or more: they wade, so they need shallows (water 1 block deep in 16 or more spots) and a dry bank, and Flamingo Pellets to stay pink; to nest, a flock of 6 (Flock Mirrors help) and mud at the water's edge. Zebras travel in a Livestock Crate and live in harems, one stallion with his mares and their foals (other stallions go in a bachelor group of their own): they want room (160 blocks for the first), grass to graze (30 grass blocks in the floor for each), drinking water, and Grain Rations in a Basic Feeder or a Hay Rack, with a feeding place for each grown-up. Lions travel in a Reinforced Crate and are dangerous: a pride needs room (220 blocks for the first), a Holding Den in the fence for each grown lion and one spare, a double Keeper Gate (two Keeper Gates in a row, the inner one in the fence) so keepers can go in, a ledge to rest up high for each, shade over part of it, and Meat Rations; a wild one is crated only while it eats a Meat Ration thrown down near it. Tigers too, and they live alone: a pool to swim and shallows to lie in, screened floor to get out of sight, and a Holding Den each so they take turns out. Crocodiles too: a big pond (about 40% water) with deep water for all to go under at once, a sunny bank to bask on, the shore kept clear for the keepers, and sand to nest in. Red Pandas travel in a Small Carrier and live up in the trees: a climb-proof exhibit with trees whose leaves they reach from a trunk (6 canopy blocks up there for each), a Nest Box each (on the floor or up beside the canopy), Leafy Rations, and in a hot biome shade over a third of the floor. Gorillas travel in a Reinforced Crate and are dangerous: a troop (one silverback) needs room (200 blocks for the first), strong walls (4 blocks high of solid blocks or glass, nothing they can climb near them, no fences), no water deeper than 1 block, something to climb, Holding Dens and a double Keeper Gate, and Leafy or Fruit Rations. Owls travel in a Small Carrier and fly: a roofed aviary (16 blocks of floor for the first, 4 blocks of air), 2 or more Perches at different heights, Meat Rations, water, and a Nest Box to lay their eggs in. Crimson Grazers travel in a Thermal Carrier and live in herds of 3 or more: room to graze (180 blocks of floor for the first), crimson nylium in the floor, a crimson stem to rub on, shelter over part of it, heat and Fungal Rations. Warped Geckos travel in a Thermal Carrier and climb glass and walls: a roofed terrarium (9 blocks of floor for the first, 4 blocks of air, 16 wall faces each to cling to), a crack in a wall or a Burrow Shelter each to hide in by day, one grown male, heat, and Insect Rations in an Insect Feeder (put the feeder in, then measure: this page counts the walls). Cinder Boars travel in a Thermal Carrier and live in sounders of 2 or more: room (120 blocks of floor for the first), 8 or more Warm Ash blocks to root in, 4 or more Thermal Mud blocks to wallow in, strong walls (they break wooden fences, gates and doors), one grown boar, heat, and Ember or Fungal Rations. Soul Moths travel in a Thermal Carrier and fly: a roofed moth house (9 blocks of floor for the first, 4 blocks of air), a soul lantern, soul torch or soul campfire inside, a Nectar Feeder with Nectar Rations (put the feeder in, then measure), heat, and 4 or more Nether roots, sprouts or fungi in the floor for the caterpillars. Quartz Beetles travel in a Thermal Carrier and live in a cave: 12 blocks of floor for the first with a roof over it, 6 or more Mineral Substrate blocks in the floor to bury themselves in (4 gravel, a nether quartz and a bone meal make 4), heat, and Mineral Pellets. End Hoppers travel in a Stabilized Carrier and leap: 36 blocks of floor for the first under a roof 4 or more blocks up, 3 or more Landing Pads with 3 blocks of air over each (one 2 or more blocks over the floor), 8 end stone in the floor, and Chorus Browse. Shimmer Snails travel in a Stabilized Carrier: 9 blocks of floor for the first, a crevice to rest in for each (a one-block gap at the foot of a wall, roofed over), shade over a quarter of the floor, 4 Mineral Substrate and 4 end stone in it, and Mineral Pellets. Obsidian Crabs travel in a Stabilized Carrier too: 12 blocks of floor for the first, a roof over nearly all of it, rock faces to scrape (4 for the first), Mineral Substrate to dig into (2 for each), 4 end stone, and a Mineral Feeder. Chorus Moths travel in a Stabilized Carrier and fly: a roofed moth house (9 blocks of floor for the first, 4 blocks of air), chorus flowers inside (one for each, 2 at least), a Nectar Feeder with Nectar Rations (put the feeder in, then measure), low light (no daylight, Nocturnal Lamps only), 4 end stone, and 4 or more chorus plants on the floor for the caterpillars. Starback Tortoises travel in a Stabilized Carrier too: 12 blocks of floor for the first, chorus standing on it (2 for each, 3 at least), a Warm Pad for every 2, a low roof 2 blocks up over 2 blocks of floor for each (4 at least), 4 end stone, and a Basic Feeder with Chorus Browse. Some species share an exhibit (${sharingText()}); a shared exhibit needs a quarter more room, and every species in it gets its own food, drink and care.`;
  return "Everything looks good.";
}

function exhibitBody(ex) {
  const cap = capacity(ex);
  const living = speciesIn(ex);
  const species = living.length ? living.map((sp) => sp.displayName).join(" + ") + (living.length > 1 ? " §8(shared: a quarter more room)" : "") : "any";
  const days = feederDaysLeft(ex);
  const nocturnal = living.find((sp) => sp.nocturnal || sp.nightLife); // a nocturnal house, or not (animals/nightRules.js)
  // Climb-proof or not (raccoons): for climbers living here, and for an empty exhibit one might move into.
  const climber = living.find((sp) => sp.climbs) ?? (!living.length && ex.climb ? Object.values(SPECIES).find((sp) => sp.climbs) : undefined);
  const puzzles = ex.feederIds.filter((id) => db.get("equipment", id)?.puzzle).length;
  // Up in the trees (red pandas): the canopy, the Nest Boxes, and the heat in a hot biome.
  const treetop = living.find((sp) => sp.canopy);
  // Strong walls (gorillas): for apes living here, and for an empty exhibit one might move into; the troop.
  const ape = living.find((sp) => sp.ape) ?? (!living.length && ex.apeClimb ? Object.values(SPECIES).find((sp) => sp.ape) : undefined);
  const troop = living.find((sp) => sp.troop);
  // The aviary (owls): its Perches and their heights, the Nest Box.
  const percher = living.find((sp) => sp.roosts);
  // The herd (Crimson Grazers): the crimson ground and the rubbing stems.
  const grazer = living.find((sp) => sp.nylium);
  // The terrarium (Warped Geckos): the walls and the roof, the hides, the males. For an empty exhibit measured for
  // its walls too (an Insect Feeder inside).
  const clinger = living.find((sp) => sp.clings) ?? (!living.length && ex.walls ? Object.values(SPECIES).find((sp) => sp.clings) : undefined);
  const insects = ex.feederIds.filter((id) => db.get("equipment", id)?.insect).length;
  // The sounder (Cinder Boars): the Thermal Mud, the strong walls, the piglets.
  const sounder = living.find((sp) => sp.boarProof);
  // The moth house (Soul Moths): the soul lights, the Nectar Feeders, the host plants. For an empty exhibit measured
  // for moths too (a Nectar Feeder inside).
  const moth = living.find((sp) => sp.soulLight) ?? (!living.length && ex.soul ? Object.values(SPECIES).find((sp) => sp.soulLight) : undefined);
  // Chorus Moths' house: the chorus flowers, the Nectar Feeders, the light, the chorus on the floor. For an empty
  // exhibit measured for moths too.
  const chorusMoth = living.find((sp) => sp.chorusFlowers) ?? (!living.length && ex.chorus ? Object.values(SPECIES).find((sp) => sp.chorusFlowers) : undefined);
  // Starback Tortoises: the chorus on the floor, the Warm Pads, the retreat, the Mineral Substrate, the hatchlings.
  const tortoise = living.find((sp) => sp.warmPads);
  const nectars = ex.feederIds.filter((id) => db.get("equipment", id)?.nectar).length;
  // The cave (Quartz Beetles): the Mineral Substrate, the roof, the grubs.
  const beetle = living.find((sp) => sp.substrate);
  // The leaping room (End Hoppers): the roof and the Landing Pads. For an empty exhibit measured for its pads too (a
  // Landing Pad inside).
  const hopper = living.find((sp) => sp.pads) ?? (!living.length && ex.hops ? Object.values(SPECIES).find((sp) => sp.pads) : undefined);
  // The snails' rocks (Shimmer Snails): the crevices, the Mineral Substrate, the hatchlings.
  const snail = living.find((sp) => sp.crevices);
  // The rocky cave (Obsidian Crabs): the rock faces, the Mineral Substrate, the crablets; the Mineral Feeders.
  const crab = living.find((sp) => sp.rockFaces);
  const minerals = ex.feederIds.filter((id) => db.get("equipment", id)?.mineral).length;
  // The flock (flamingos): grown-ups and Flock Mirrors, their colour, the shallows and the nest sites.
  const wader = living.find((sp) => sp.nest);
  const mirrors = fixturesOf(ex).filter((f) => f.type === "mirror").length;
  // The herd (zebras): the stallion and mares, rivals, feeding places for the grown-ups, and the grass.
  const herder = living.find((sp) => sp.harem);
  const racks = ex.feederIds.filter((id) => db.get("equipment", id)?.rack).length;
  // Big predators (lions): the double Keeper Gate, the Holding Dens, the ledges, and the danger.
  const danger = living.find((sp) => sp.dangerous);
  const kinds = [puzzles ? `${puzzles} Puzzle Feeder${puzzles === 1 ? "" : "s"}` : "", racks ? `${racks} Hay Rack${racks === 1 ? "" : "s"}` : "", insects ? `${insects} Insect Feeder${insects === 1 ? "" : "s"}` : "", nectars ? `${nectars} Nectar Feeder${nectars === 1 ? "" : "s"}` : "", minerals ? `${minerals} Mineral Feeder${minerals === 1 ? "" : "s"}` : ""].filter(Boolean).join(", ");
  // The flight room (Void Rays): measured with the exhibit's own headroom once they live there, else the tallest flyer's.
  const airHeight = ex.aerial?.height ?? (profileOf(ex).aerial ? profileOf(ex).minHeight : AERIAL_HEIGHT);
  const roostsHere = ex.roostCount ? `, ${ex.roostCount} Perch${ex.roostCount === 1 ? "" : "es"}` : "";
  const lines = [
    `§fState: ${STATE_TEXT[ex.state]}`,
    `§fSpecies: §7${species}`,
    `§fAnimals: §7${cap.population} · needs ${cap.required} usable blocks${cap.mixed ? " (mixed)" : ""}, has ${cap.usable}`,
    `§fGround: §7${ex.usableArea} dry, ${ex.waterCells ?? 0} water (${ex.deepWaterCells ?? 0} deep)${ex.lavaCells ? `, ${ex.lavaCells} lava (${ex.deepLavaCells ?? 0} deep)` : ""}${ex.coveredCells !== undefined ? `, ${ex.coveredCells} under cover` : ""}${ex.mudCells !== undefined ? `, ${ex.mudCells} mud` : ""}${ex.nestSites !== undefined ? `, ${ex.nestSites} mud by the water` : ""}${ex.grassCells !== undefined ? `, ${ex.grassCells} grass` : ""}${ex.hotCells !== undefined ? `, ${ex.hotCells} magma` : ""}${ex.ashCells !== undefined ? `, ${ex.ashCells} warm ash` : ""}${ex.endCells !== undefined ? `, ${ex.endCells} end stone` : ""}${ex.nyliumCells !== undefined ? `, ${ex.nyliumCells} crimson nylium` : ""}${ex.lowCells ? `, §e${ex.lowCells} too low to use§7` : ""}${ex.aerial ? `; flight room: ${ex.aerial.enclosed ? `${ex.aerial.usableArea} floor with ${airHeight} blocks of air, ${ex.flightCells} air blocks` : "open to the sky"}${moth || chorusMoth ? "" : percher ? roostsHere || ", no Perches" : `, ${ex.perchCount ?? 0} Void Perch${ex.perchCount === 1 ? "" : "es"}${roostsHere}`}` : ""}`,
    ...(nocturnal ? [nocturnalLine(ex, pluralOf(nocturnal), BALANCE, Boolean(nocturnal.glows))] : []),
    ...(climber ? [climbLine(ex, pluralOf(climber))] : []),
    ...(ape ? [apeLine(ex, pluralOf(ape))] : []),
    ...(troop ? troopLines(ex, animalsIn(ex).filter((a) => a.speciesId === troop.id)) : []),
    ...(percher ? owlLines(ex, animalsIn(ex).filter((a) => a.speciesId === percher.id), fixturesOf(ex), BALANCE.owl) : []),
    ...(grazer ? grazerLines(ex, animalsIn(ex).filter((a) => a.speciesId === grazer.id), BALANCE.grazer) : []),
    ...(clinger ? geckoLines(ex, animalsIn(ex).filter((a) => a.speciesId === clinger.id), fixturesOf(ex).filter((f) => f.type === "burrow").length, pluralOf(clinger), BALANCE.gecko) : []),
    ...(sounder ? boarLines(ex, animalsIn(ex).filter((a) => a.speciesId === sounder.id), sounder) : []),
    ...(moth ? mothLines(ex, animalsIn(ex).filter((a) => a.speciesId === moth.id), nectars, moth, BALANCE.moth) : []),
    ...(beetle ? beetleLines(ex, animalsIn(ex).filter((a) => a.speciesId === beetle.id), beetle, coverNeeded(beetle, ex.usableArea)) : []),
    ...(hopper ? hopperLines(ex, animalsIn(ex).filter((a) => a.speciesId === hopper.id), BALANCE.hopper) : []),
    ...(snail ? snailLines(ex, animalsIn(ex).filter((a) => a.speciesId === snail.id), snail) : []),
    ...(crab ? crabLines(ex, animalsIn(ex).filter((a) => a.speciesId === crab.id), crab) : []),
    ...(tortoise ? starbackLines(ex, animalsIn(ex).filter((a) => a.speciesId === tortoise.id), tortoise) : []),
    ...(chorusMoth ? chorusMothLines(ex, animalsIn(ex).filter((a) => a.speciesId === chorusMoth.id), nectars, chorusMoth, BALANCE.chorusMoth, BALANCE) : []),
    ...(treetop ? pandaLines(ex, animalsIn(ex).filter((a) => a.speciesId === treetop.id), fixturesOf(ex), BALANCE.redpanda) : []),
    ...(wader ? [flockLine(ex, animalsIn(ex).filter((a) => a.speciesId === wader.id), mirrors, wader, HABITAT_PROFILES[wader.habitatProfile], BALANCE.flamingo)] : []),
    ...(herder ? [herdLine(ex, animalsIn(ex).filter((a) => a.speciesId === herder.id), herder, feedingPlacesFor(ex, herder), BALANCE.breeding.juvenileWeight)] : []),
    ...(danger ? keeperLines(ex, danger) : []),
    `§fCleanliness: ${BAND_COLOR[band(ex.cleanliness ?? 100, BALANCE.needs.bands)]}${Math.round(ex.cleanliness ?? 100)}`,
    `§fFeeders: §7${ex.feederIds.length}${kinds ? ` (${kinds})` : ""}${days !== undefined ? `, about ${days.toFixed(1)} park days of food` : ""}`,
    `§fEquipment: §7${equipmentLine(ex)}`,
    `§fGuests: ${viewedExhibits().has(ex.id) ? "§aseen from a Viewing Point" : "§7no Viewing Point sees in yet"}`,
    ...(ex.speciesId ? [breedingLine(ex)] : []),
    "",
    `§6Next: §f${nextAction(ex)}`,
  ];
  const extra = [...ex.issues.slice(1), ...ex.careWarnings.map((w) => w.text)].slice(0, 4);
  if (extra.length) lines.push("", "§7Also:", ...extra.map((t) => `§7- ${t}`));
  return lines.join("\n");
}

// Big predators (0.1.75): how keepers get in (the double Keeper Gate), the Holding Dens and who is shut
// in, the pride's ledges, and the danger to anyone inside.
function keeperLines(ex, sp) {
  const group = animalsIn(ex).filter((a) => a.speciesId === sp.id);
  const dens = densOf(ex);
  const shut = dens.filter((d) => d.held).length;
  const gate = ex.service?.length ? "§adouble Keeper Gate§7" : "§eno double Keeper Gate§7 (two Keeper Gates in a row, the inner one in the fence)";
  const ledges = sp.ledge && ex.ledgeCells !== undefined ? `; ${ex.ledgeCells} of ${ledgesNeeded(group, BALANCE.lion)} ledge blocks` : "";
  // Tigers: whose turn it is out, and the screened floor.
  const turns = sp.solitary ? turnsText(ex) : undefined;
  const privacy = sp.privacy && ex.screenCells !== undefined ? [`§fPrivacy: §7${ex.screenCells} of ${screensNeeded(group, BALANCE.tiger)} screened floor blocks (out of sight)`] : [];
  // Crocodiles: shore clearance, the basking bank, deep water, meals and rank.
  const croc = sp.basks ? crocLines(ex, sp, group) : [];
  return [`§fKeeper access: ${gate}, ${dens.length} Holding Den${dens.length === 1 ? "" : "s"} for ${densNeeded(sp, group)} needed${shut ? ` (${shut} shut in)` : ""}${ledges}`, ...(turns ? [`§f${turns}`] : []), ...privacy, ...croc, `§c${dangerLine(sp)}`];
}

function crocLines(ex, sp, group) {
  const C = BALANCE.croc;
  const out = [`§f${shoreLine(ex, C)}`];
  if (ex.sunBankCells !== undefined) out.push(`§fBasking bank: §7${ex.sunBankCells} of ${bankNeeded(group, C)} sunny bank blocks`);
  if (ex.deepWaterCells !== undefined) out.push(`§fDeep water: §7${ex.deepWaterCells} of ${deepNeeded(group, C)} spots to go under`);
  out.push(`§f${mealsLine(group, sp, dayOf(parkTime(), BALANCE.clock.dayLength), BALANCE.needs.drainPerDay.satiety)}`);
  const rank = crocRankLine(group);
  if (rank) out.push(`§f${rank}`);
  return out;
}

// Breeding (spec section 9): off, or on with what it's waiting for, so the rules are never hidden.
function breedingLine(ex) {
  if (!ex.breeding?.on) {
    const expecting = animalsIn(ex).find((a) => a.expecting);
    return `§fBreeding: §7off${expecting ? `; ${expecting.name} is still expecting (${expecting.expecting.daysLeft} park days)` : ""}`;
  }
  const s = breedingStatus(ex);
  const who = (ex.speciesIds?.length ?? 0) > 1 && ex.speciesId ? ` (${SPECIES[ex.speciesId].displayName}s, the first species here)` : "";
  return `§fBreeding${who}: §aon§7. ${s.reason}`;
}

function equipmentLine(ex) {
  const fx = fixturesOf(ex);
  const count = (t) => fx.filter((f) => f.type === t);
  const parts = [];
  const troughs = count("trough");
  const lava = troughs.filter((t) => t.liquid === "lava");
  const water = troughs.filter((t) => t.liquid !== "lava");
  if (water.length) parts.push(`${water.length} trough${water.length === 1 ? "" : "s"} (${water.reduce((n, t) => n + t.units, 0)} water)`);
  if (lava.length) parts.push(`${lava.length} lava trough${lava.length === 1 ? "" : "s"} (${lava.reduce((n, t) => n + t.units, 0)} lava)`);
  const baskets = count("basket");
  if (baskets.length) parts.push(`${baskets.length} food basket${baskets.length === 1 ? "" : "s"}`);
  const toys = count("toy");
  if (toys.length) parts.push(`${toys.length} toy${toys.length === 1 ? "" : "s"}`);
  const balls = count("ball");
  if (balls.length) parts.push(`${balls.length} ball${balls.length === 1 ? "" : "s"}`);
  const bones = count("bone");
  if (bones.length) parts.push(`${bones.length} blaze bone${bones.length === 1 ? "" : "s"}`);
  const skulls = count("skull");
  if (skulls.length) parts.push(`${skulls.length} wither skull ball${skulls.length === 1 ? "" : "s"}`);
  if (count("filter").length) parts.push("water filter");
  const coolers = count("cooler");
  if (coolers.length) parts.push(`cooling unit (${coolers.reduce((n, c) => n + c.units, 0)} cold)`);
  const heaters = count("heater");
  if (heaters.length) parts.push(`thermal regulator (${heaters.reduce((n, h) => n + h.units, 0)} heat)`);
  const dens = count("den");
  if (dens.length) parts.push(`${dens.length} ember den${dens.length === 1 ? "" : "s"}`);
  const burrows = count("burrow");
  if (burrows.length) parts.push(`${burrows.length} burrow shelter${burrows.length === 1 ? "" : "s"}`);
  const anchors = count("anchor");
  if (anchors.length) parts.push(`containment anchor (${anchors.reduce((n, a) => n + a.units, 0)} charge)`);
  const tunnels = count("tunnel");
  if (tunnels.length) parts.push(`${tunnels.length} rift tunnel${tunnels.length === 1 ? "" : "s"}`);
  const frames = count("frame");
  if (frames.length) parts.push(`${frames.length} climbing frame${frames.length === 1 ? "" : "s"}`);
  const mirrors = count("mirror");
  if (mirrors.length) parts.push(`${mirrors.length} flock mirror${mirrors.length === 1 ? "" : "s"}`);
  const scents = count("scent");
  if (scents.length) parts.push(`${scents.length} scent post${scents.length === 1 ? "" : "s"}`);
  const nests = count("nest");
  if (nests.length) parts.push(`${nests.length} nest box${nests.length === 1 ? "" : "es"}`);
  const roosts = count("roost");
  if (roosts.length) parts.push(`${roosts.length} perch${roosts.length === 1 ? "" : "es"}`);
  const holding = count("holding");
  if (holding.length) parts.push(`${holding.length} holding den${holding.length === 1 ? "" : "s"}`);
  return parts.join(", ") || "none";
}

export async function openExhibit(player, exId) {
  const ex = getExhibit(exId);
  if (!ex) return;
  const residents = animalsIn(ex);
  const form = new ActionFormData().title(ex.name).body(exhibitBody(ex));
  const actions = [];
  for (const a of residents) {
    const tag = a.juvenile ? ", young" : a.expecting ? ", expecting" : "";
    form.button(`${a.name}\n§8Welfare ${welfare(a)}${tag}`);
    actions.push(() => openAnimal(player, a.id));
  }
  form.button("Measure again");
  actions.push(async () => {
    if (!can(player, "build")) return message(player, denyText("build"));
    message(player, "§7Measuring...");
    await validate(ex.id);
    openExhibit(player, ex.id);
  });
  if (ex.speciesId && SPECIES[ex.speciesId].breeding) {
    form.button(ex.breeding?.on ? "Turn breeding off" : "Turn breeding on\n§8let a pair have young");
    actions.push(() => {
      toggleBreeding(player, ex.id);
    });
  }
  form.button("Rename");
  actions.push(() => renameExhibit(player, ex.id));
  if (!residents.length) {
    form.button("Remove exhibit");
    actions.push(() => confirmRemove(player, ex.id));
  }
  form.button("Close");
  actions.push(() => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

async function renameExhibit(player, exId) {
  if (!can(player, "build")) return message(player, denyText("build"));
  const ex = getExhibit(exId);
  const r = await show(player, new ModalFormData().title("Rename exhibit").textField("Name", "Rabbit Meadow", { defaultValue: ex.name }));
  if (!r) return;
  const fresh = getExhibit(exId);
  if (fresh) rename(fresh, String(r.formValues[0]).trim());
}

async function confirmRemove(player, exId) {
  if (!can(player, "build")) return message(player, denyText("build"));
  const r = await show(player, new MessageFormData().title("Remove exhibit?").body("The exhibit record is deleted. Your fences and blocks stay.").button1("Remove").button2("Keep"));
  if (r?.selection !== 0) return;
  const ex = getExhibit(exId);
  if (ex && removeExhibit(ex)) message(player, "§7Exhibit removed.");
  else message(player, "§cMove the animals out first.");
}

export async function openAnimal(player, animalId) {
  const ex = allExhibits().find((e) => e.animalIds.includes(animalId));
  const a = ex && animalsIn(ex).find((x) => x.id === animalId);
  if (!a) return;
  const species = SPECIES[a.speciesId];
  const worst = lowestNeed(a.needs);
  const w = welfare(a);
  const br = species.breeding;
  // Zebras: its place at the food, and whether it gets pushed off (its advice says so).
  const herd = species.feedRank ? animalsIn(ex).filter((b) => b.speciesId === a.speciesId) : [];
  const pushed = pushedOffIn(ex, species, herd).some((b) => b.id === a.id);
  const life = a.juvenile
    ? `§fYoung ${br.young}: §7grows up in ${a.juvenileDaysLeft} park day${a.juvenileDaysLeft === 1 ? "" : "s"}`
    : a.expecting
      ? species.nest
        ? `§dNesting: §7the egg hatches in ${a.expecting.daysLeft} park day${a.expecting.daysLeft === 1 ? "" : "s"}`
        : species.sandNest
        ? `§dGuarding her nest: §7the eggs hatch in ${a.expecting.daysLeft} park day${a.expecting.daysLeft === 1 ? "" : "s"}`
        : `§dExpecting: §7due in ${a.expecting.daysLeft} park day${a.expecting.daysLeft === 1 ? "" : "s"}`
      : "§fAdult";
  const body = [
    `§f${species.displayName}, ${species.manes ? (sexOf(a, species) === "male" ? `${a.mane ? "dark" : "light"} mane${a.juvenile ? " when he's grown" : ""}` : "no mane") : `${species.coats[a.coat]} coat`} · §7in ${ex.name}`,
    `${life}§7 · ${species.harem && !a.juvenile ? (sexOf(a, species) === "male" ? "stallion" : "mare") : species.manes && !a.juvenile ? (sexOf(a, species) === "male" ? "lion" : "lioness") : species.sexLook && species.solitary && !a.juvenile ? (sexOf(a, species) === "male" ? "tiger" : "tigress") : species.troop && !a.juvenile ? (sexOf(a, species) === "male" ? "silverback" : "female") : sexOf(a, species)}${species.sizes ? ` · ${lengthOf(bodyOf(a, species.breeding?.matureDays)).toFixed(1)} m long` : ""}`,
    ...(species.dangerous && isDenned(a.id) ? [`§fNow: §7shut in a Holding Den${a.juvenile ? " with its mother" : ""} (let ${a.juvenile ? "her" : "it"} out at the den, from outside the fence)`] : []),
    `§fWelfare: ${BAND_COLOR[band(w, BALANCE.needs.bands)]}${w}${a.ill ? " §c(unwell)" : ""}`,
    ...(species.nocturnal ? [nowLine(a, ex)] : []),
    ...(species.pink ? [pinkLine(a, BALANCE.flamingo)] : []),
    ...(species.feedRank ? [rankLine(a, herd, species, ex.animalIds, feedingPlacesFor(ex, species))] : []),
    "",
    needLine(a.needs),
    "",
    a.needs[worst] < BALANCE.needs.bands.healthy ? `§6Next: §f${adviceFor(worst, species, causesFor(ex, a.speciesId), pushed ? BALANCE.zebra.places : undefined)}.` : "§aHappy and healthy.",
  ];
  // Conservation (0.1.57): grown-ups can go back to the wild; the line says what still stops it.
  const release = a.juvenile ? undefined : checkRelease(a);
  if (release) body.push("", `${release.ok ? "§2" : "§7"}Conservation: §7${release.reason}`);
  const form = new ActionFormData().title(a.name).body(body.join("\n")).button("Rename");
  if (release) form.button("Release to the wild\n§8it leaves the park for good");
  form.button("Close");
  const r = await show(player, form);
  if (r?.selection === 0) await renameAnimalForm(player, a);
  else if (release && r?.selection === 1) await releaseForm(player, a, release);
}

// A nocturnal animal's page says what it is doing now (asleep, curled up, or up and about).
function nowLine(a, ex) {
  const s = nightState(a);
  return `§fNow: §7${s ? stateText(s.asleep, s.curled, isNocturnalHouse(ex, BALANCE)) : "not loaded (go nearer)"}`;
}

async function releaseForm(player, a, release) {
  if (!can(player, "care")) return message(player, denyText("care"));
  if (!release.ok) return message(player, `§e${release.reason}`);
  const species = SPECIES[a.speciesId];
  const B = BALANCE.conservation;
  const r = await show(
    player,
    new MessageFormData()
      .title(`Release ${a.name}?`)
      .body(`${a.name} goes into an empty ${CARRIERS[species.carrierProfile]?.label ?? "carrier"} from your inventory, bound for the wild. Let it out in its home wilds at least ${B.minDistance} blocks from the park centre; it leaves the park for good. The park earns ${B.reward} Zoo Coins and a better name with guests.\n\nChanged your mind on the way? Use the carrier inside an exhibit and it moves in there instead.`)
      .button1("Pack for release")
      .button2("Not now"),
  );
  if (r?.selection !== 0) return;
  packForRelease(player, a.id);
}

async function renameAnimalForm(player, a) {
  if (!can(player, "care")) return message(player, denyText("care"));
  const r = await show(player, new ModalFormData().title(`Rename ${a.name}`).textField(`Name (up to ${MAX_NAME} letters)`, a.name, { defaultValue: a.name }));
  if (!r) return;
  renameAnimal(a, r.formValues[0], player);
  openAnimal(player, a.id);
}

export function openFromEntity(player, entity) {
  const a = animalFromEntity(entity);
  if (a) openAnimal(player, a.id);
}

export function openNearest(player) {
  const ex = nearestExhibit(player.dimension.id, player.location, 48);
  if (ex) openExhibit(player, ex.id);
  else message(player, "§eNo exhibit nearby. Place an Exhibit Controller to start one.");
}
