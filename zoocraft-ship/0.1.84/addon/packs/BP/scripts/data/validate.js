// Checks the data tables against each other at startup and in the unit tests, so a typo in a
// species entry fails loudly instead of producing an animal nobody can feed (spec section 5.5).

import { SPECIES } from "./species.js";
import { HABITAT_PROFILES } from "./profiles.js";
import { RATIONS, CARRIERS } from "./items.js";
import { BALANCE } from "./balance.js";
import { PROJECTS } from "./research.js";

export function validateData() {
  const errors = [];
  const diets = new Set(Object.values(RATIONS).map((r) => r.diet));
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.id !== key) errors.push(`${key}: id field is ${s.id}`);
    if (!s.id.startsWith("zoocraft:")) errors.push(`${key}: id must use the zoocraft namespace`);
    if (!HABITAT_PROFILES[s.habitatProfile]) errors.push(`${key}: unknown habitat profile ${s.habitatProfile}`);
    if (!CARRIERS[s.carrierProfile]) errors.push(`${key}: unknown carrier ${s.carrierProfile}`);
    for (const d of s.dietTags) if (!diets.has(d)) errors.push(`${key}: no ration feeds diet "${d}"`);
    if (s.baitItem && !RATIONS[s.baitItem]) errors.push(`${key}: bait ${s.baitItem} is not a ration`);
    if (!(s.rationUnitsPerParkDay > 0)) errors.push(`${key}: rationUnitsPerParkDay must be positive`);
    if (!s.names?.length) errors.push(`${key}: needs at least one default name`);
    const b = s.breeding;
    if (b && !(b.litter >= 1 && b.gestationDays >= 1 && b.matureDays >= 1 && b.cooldownDays >= 0 && b.juvenileScale > 0 && b.juvenileScale < 1 && b.young)) errors.push(`${key}: breeding entry is incomplete`);
    if (s.sexByCoat && s.sexByCoat.length !== s.coats.length) errors.push(`${key}: sexByCoat needs one entry per coat`);
    for (const t of s.toys ?? []) {
      const kind = BALANCE.enrichment.fromEquipment[t];
      if (!kind || !s.enrichmentTags.includes(kind)) errors.push(`${key}: toy ${t} gives no enrichment it enjoys`);
    }
    if (s.lavaSwimmer && !HABITAT_PROFILES[s.habitatProfile]?.lava) errors.push(`${key}: a lava swimmer needs a lava habitat profile`);
    if (s.lavaWalker && !HABITAT_PROFILES[s.habitatProfile]?.onLava) errors.push(`${key}: a lava walker needs a lava shore habitat profile`);
    if (Boolean(s.flies) !== Boolean(HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: a flyer needs an aerial habitat profile, and only a flyer can have one`);
    // Nesting birds (flamingos, 0.1.72): a flock, nest sites and mirrors, a wetland, and a park day building
    // before the egg (gestationDays 2 or more).
    const n = s.nest;
    if (n && !(n.flock >= 2 && n.sites >= 1 && n.mirrorBirds >= 0 && b?.gestationDays >= 2 && HABITAT_PROFILES[s.habitatProfile]?.amphibious)) errors.push(`${key}: a nesting species needs a flock, nest sites, a wetland profile and 2 or more days expecting`);
    if (s.pink && !Object.values(RATIONS).some((r) => r.pink && s.dietTags.includes(r.diet))) errors.push(`${key}: a pink species needs a pink ration it eats`);
    if (s.wades && !(HABITAT_PROFILES[s.habitatProfile]?.minShallowWater > 0)) errors.push(`${key}: a wader needs shallows in its habitat profile`);
    // Grazers, Hay Racks and harems (zebras, 0.1.74).
    if (s.graze && !(s.graze.perAnimal > 0 && s.graze.share > 0 && s.graze.share < 1)) errors.push(`${key}: a grazer needs grass for each animal and a share of its food from grazing below 1`);
    if (s.rack && !s.dietTags.some((d) => d === "grain" || d === "leafy")) errors.push(`${key}: a Hay Rack holds only Grain or Leafy Rations, and this species eats neither`);
    if (s.harem && s.sexByCoat) errors.push(`${key}: a harem species has stallions and mares in every coat`);
    // Big predators (lions, 0.1.75): crated in a Reinforced Crate, meat-eaters fed Meat Rations, Holding
    // Dens, and a litter range.
    // A gorilla (0.1.80) is baited with a Fruit Ration: the bait is whatever the species eats.
    if (s.dangerous && !(s.carrierProfile === "large" && s.dens && s.dens.spare >= 0 && s.dietTags.includes(RATIONS[s.baitItem]?.diet))) errors.push(`${key}: a dangerous species travels in a Reinforced Crate, is baited with a ration it eats and has Holding Dens`);
    if (b?.litterMax !== undefined && !(Number.isInteger(b.litterMax) && b.litterMax >= b.litter)) errors.push(`${key}: litterMax is a whole number, at least the litter`);
    if (s.manes && !s.sexByCoat) errors.push(`${key}: a maned species shows its males by its coat`);
    // Tigers (0.1.76): a solitary species takes turns out of its Holding Dens (a den each, cubs in with
    // their mother); its stripe patterns and its sex are on the mob (zoocraft:pattern_N, zoocraft:sex_N).
    if (s.solitary && !(s.dangerous && s.dens?.spare >= 0 && s.dens.cubsFollow && !s.social.prefersCompany)) errors.push(`${key}: a solitary species is dangerous, has a Holding Den each with the cubs following, and lives alone`);
    if (s.patterns !== undefined && !(Number.isInteger(s.patterns) && s.patterns >= 1 && s.sexLook && !s.sexByCoat)) errors.push(`${key}: patterns is a whole number, with the sex shown on the mob`);
    if (s.privacy && !s.solitary) errors.push(`${key}: privacy (screened floor) is for solitary species`);
    // Crocodiles (0.1.77): a basking bank and deep water to go under (an amphibious profile), shore clearance
    // for a dangerous species, meals about once a week, a size on the mob, and a sand nest.
    if ((s.basks || s.submerges) && !HABITAT_PROFILES[s.habitatProfile]?.amphibious) errors.push(`${key}: a basking bank and deep water need an amphibious habitat profile`);
    if (s.shoreClear && !s.dangerous) errors.push(`${key}: shore clearance is a keepers' rule for dangerous species`);
    if (s.meals && !(s.meals.every >= 1 && s.meals.at > 0 && s.meals.at < 100)) errors.push(`${key}: meals every 1 or more park days, eaten below a satiety between 0 and 100`);
    if (s.sizes !== undefined && !(Number.isInteger(s.sizes) && s.sizes >= 1 && s.sexLook)) errors.push(`${key}: sizes is a whole number, with the sex shown on the mob`);
    if (s.sandNest && !(s.sandNest.sites >= 1 && b?.gestationDays >= 2 && !s.nest)) errors.push(`${key}: a sand nest needs sites, 2 or more days expecting, and no flamingo nest`);
    // Red pandas (0.1.79): the canopy is counted by the climb measure, so a species that lives up in the trees climbs.
    if (s.canopy && !(s.climbs && s.climbTree)) errors.push(`${key}: a canopy is reached by climbing (climbs and climbTree)`);
    // Gorillas (0.1.80): the ape measure is its own (never with the raccoon's climb-proofing); a troop is one
    // male with the females, its sexes on the mob; an ape gets out only where it's dangerous to meet loose.
    if (s.ape && (s.climbs || !s.dangerous)) errors.push(`${key}: an ape is measured for strong walls (not climbs), and is dangerous`);
    if (s.troop && !(s.sexLook && !s.harem && !s.sexByCoat)) errors.push(`${key}: a troop shows its sexes on the mob (sexLook), and isn't a harem`);
    // Owls (0.1.81): a bird that roosts on Perches flies in an aviary that counts them; eggs in a Nest Box.
    if (s.roosts && !(s.flies && HABITAT_PROFILES[s.habitatProfile]?.minRoosts)) errors.push(`${key}: a bird that roosts on Perches flies (flies), in a profile that counts them (minRoosts)`);
    if (s.breeding?.nestBox && !s.roosts) errors.push(`${key}: eggs in a Nest Box are for the birds that roost (roosts)`);
    // Crimson Grazers (0.1.84): crimson ground and a rubbing stem are a Nether herd's, shown with its sexes on the mob.
    if ((s.nylium || s.rubStem) && !(s.heat && s.sexLook && s.social?.prefersCompany)) errors.push(`${key}: crimson ground and a rubbing stem are for a Nether herd (heat, sexLook, prefersCompany)`);
  }
  const fl = BALANCE.flamingo;
  if (!(fl.rosyAt > fl.fadingAt && fl.fadingAt > 0 && fl.rosyAt <= 100 && fl.pinkUp > 0 && fl.pinkDown > 0 && fl.pelletShare > 0 && fl.pelletShare <= 1)) errors.push("flamingo pink: rosy above fading, and a park day's gain and loss");
  if (!fl.bait.every((item) => RATIONS[item])) errors.push("flamingo bait must be rations");
  const zb = BALANCE.zebra;
  if (!zb.bait.every((item) => RATIONS[item])) errors.push("zebra bait must be rations");
  if (!(zb.places.feeder > 0 && zb.places.puzzle > 0 && zb.places.rack > 0 && zb.places.trough > 0)) errors.push("zebra feeding places: room for one or more at every feeder and trough");
  if (!(zb.pushedSatiety > 0 && zb.pushedSatiety < 100 && zb.rivalComfortCap > 0 && zb.rivalComfortCap < 100 && BALANCE.graze.comfortCap > 0)) errors.push("zebra caps: between 0 and 100");
  if (!(zb.easeTrot > zb.easeWalk && zb.easeWalk > 0)) errors.push("zebra runs ease down to a trot before a walk");
  const pd = BALANCE.predators;
  if (!(pd.danger.closeRange < pd.danger.strikeRange && pd.danger.strikeRange <= pd.danger.warnRange && pd.danger.reach < pd.danger.closeRange)) errors.push("predator danger: reach inside close, close inside strike, strike inside warn");
  if (!(pd.gates.pairMin >= 2 && pd.gates.pairMax >= pd.gates.pairMin && pd.fastEvery >= 2 && pd.fastDrain >= 0 && pd.fastDrain < 1)) errors.push("predators: gate pairs 2 or more blocks apart, a fast day at most every other day, a lower drain");
  const ln = BALANCE.lion;
  const tg = BALANCE.tiger;
  const cr = BALANCE.croc;
  const rp = BALANCE.redpanda;
  const ow = BALANCE.owl;
  const gz = BALANCE.grazer;
  if (!(gz.nyliumCells >= 1 && gz.nyliumComfortCap > 0 && gz.nyliumComfortCap < 100 && gz.rubComfortCap > 0 && gz.rubComfortCap < 100)) errors.push("grazer: nylium blocks to graze, caps between 0 and 100");
  if (!(gz.reach > gz.realShort && gz.realShort < gz.rushShort && gz.rushRange <= gz.ringRangeZoo && gz.ringRangeZoo <= gz.ringRange && gz.ringRange <= gz.grudgeRange && gz.ringPace > 0 && gz.rushPace > gz.ringPace && gz.rushPace < 1)) errors.push("grazer ring: a real rush ends within reach and a bluff short of it, the rush inside the ring's range, a rush faster than the shuffle into the ring, under a block a tick");
  const ph = ow.phases;
  if (!(ph.dusk[1] === ph.night[0] && ph.night[1] === ph.dawn[0] && ph.dusk[0] < ph.dusk[1] && ph.night[0] < ph.night[1] && ph.dawn[0] < ph.dawn[1])) errors.push("owl: dusk, night and dawn follow one another");
  for (const f of [ow.fly, ow.wildFly, ow.owletFly]) if (!(f.slow > 0 && f.slow < f.cruise && f.cruise < 1 && f.accel > 0 && f.brake > 0)) errors.push("owl flights: a slow start and end under the cruise, under a block a tick");
  if (!(ow.displayRange < ow.flushRange && ow.lowPerch >= 1 && ow.perchSpread >= 1 && ow.perchComfortCap > 0 && ow.perchComfortCap < 100 && ow.minPerches >= 1 && ow.nestDays >= 1)) errors.push("owl: the display inside the flush, a low perch a block or more, a spread of a block or more, a cap between 0 and 100");
  const go = BALANCE.gorilla;
  const gb = go.bluff;
  if (!(go.reach >= 1 && go.rivalComfortCap > 0 && go.rivalComfortCap < 100 && go.deepComfortCap > 0 && go.deepComfortCap < 100 && go.bachelorMax >= 2 && go.rideDays >= 1 && go.maxUp >= 2 && go.hug > 0 && go.hug < 0.5)) errors.push("gorilla: a reach of a block or more, caps between 0 and 100, a bachelor group of 2 or more, infants riding a day or more, climbs of 2 blocks or more, hugging inside the block");
  if (!(gb.reach < gb.stopShort && gb.stopShort < gb.closeRange && gb.closeRange < gb.chargeRange && gb.chargeRange < gb.displayRange && gb.displayTicks > 0 && gb.chargeTicks > 0)) errors.push("gorilla bluff: reach inside the stop, the stop inside close, close inside the charge, the charge inside the display");
  if (!(rp.canopyPer >= 1 && rp.canopyComfortCap > 0 && rp.canopyComfortCap < 100 && rp.nestComfortCap > 0 && rp.nestComfortCap < 100 && rp.shade > 0 && rp.shade < 1 && rp.shadeComfortCap > 0 && rp.shadeComfortCap < 100 && rp.tripMin >= 1 && rp.tripMax >= rp.tripMin && rp.canopyCells > rp.tripMax && rp.nestFront > 0 && rp.nestFront < 0.5)) errors.push("redpanda: canopy blocks for each, caps between 0 and 100, a share of the floor shaded, trips along the canopy it maps, a Nest Box front inside the block");
  if (!(cr.bankPerCroc >= 1 && cr.bankReach >= 1 && cr.deepPerCroc >= 1 && cr.deepPerYoung >= 0 && cr.bankComfortCap > 0 && cr.bankComfortCap < 100 && cr.submergeComfortCap > 0 && cr.submergeComfortCap < 100 && cr.nestNear >= 1 && cr.nestFar >= cr.nestNear && cr.sunMales >= 0 && cr.sunMales <= 1)) errors.push("croc: a bank and deep water for each, caps between 0 and 100, nest sites near the water, a share of males");
  if (!(cr.hunt.grabReach < cr.hunt.lungeRange && cr.hunt.lungeRange < cr.hunt.spotDay && cr.hunt.spotDay <= cr.hunt.spotNight && cr.hunt.landSnap < cr.hunt.landWarn && cr.hunt.landWarn <= cr.hunt.spotDay && cr.hunt.rolls >= 1)) errors.push("croc hunt: the grab inside the lunge, the lunge inside its spotting range, the snap inside the warning");
  if (!(tg.introEvery >= 2 && tg.introWindow >= 1 && tg.introWindow < tg.introEvery && tg.screenPerTiger >= 1 && tg.privacyComfortCap > 0 && tg.privacyComfortCap < 100 && tg.solitaryComfortCap > 0 && tg.solitaryComfortCap < tg.privacyComfortCap)) errors.push("tiger: an introduction every 2 or more park days, a window shorter than that, caps between 0 and 100 (fighting the lower)");
  if (!(tg.hunt.reach < tg.hunt.pounceRange && tg.hunt.pounceRange < tg.hunt.rushAny && tg.hunt.rushAny < tg.hunt.rushBack && tg.hunt.rushBack < tg.hunt.spotDay && tg.hunt.spotDay <= tg.hunt.spotNight)) errors.push("tiger hunt: reach inside the pounce, the pounce inside a rush, a rush inside its spotting range");
  if (!(ln.coalitionMax >= 1 && ln.ledgePerLion >= 1 && ln.ledgeComfortCap > 0 && ln.ledgeComfortCap < 100 && ln.coalitionComfortCap > 0 && ln.coalitionComfortCap < 100 && pd.dens.comfortCap > 0 && pd.dens.comfortCap < 100)) errors.push("lion caps: between 0 and 100, a coalition and a ledge each");
  const w = BALANCE.needs.weights;
  const sum = w.satiety + w.comfort + w.cleanliness + w.enrichment + w.social;
  if (Math.abs(sum - 1) > 1e-9) errors.push(`welfare weights sum to ${sum}, not 1`);
  const r = BALANCE.rating.weights;
  const rsum = r.welfare + r.satisfaction + r.variety + r.operations;
  if (Math.abs(rsum - 1) > 1e-9) errors.push(`rating weights sum to ${rsum}, not 1`);
  for (const item of Object.keys(BALANCE.shop)) {
    if (!RATIONS[item] && !Object.values(CARRIERS).some((c) => c.empty === item) && !BALANCE.cooler.ice[item] && !BALANCE.heater.fuel[item]) errors.push(`shop sells unknown item ${item}`);
  }
  const a = BALANCE.admission;
  if (!(a.min <= BALANCE.economy.admissionPrice && BALANCE.economy.admissionPrice <= a.max)) errors.push("default admission price is outside the Ticket Booth range");
  const sn = BALANCE.snacks;
  if (!(sn.min <= sn.defaultPrice && sn.defaultPrice <= sn.max)) errors.push("default snack price is outside the Snack Stand range");
  for (const [item, units] of Object.entries(BALANCE.snackFoods)) if (!(Number.isInteger(units) && units > 0)) errors.push(`snack food ${item} must give a whole number of snacks`);
  const tr = BALANCE.tours;
  if (!(tr.min <= tr.defaultPrice && tr.defaultPrice <= tr.max)) errors.push("default tour ticket price is outside the Tour Desk range");
  if (!(tr.stopsBase > 0 && tr.stopsPer > 0 && tr.stopsBase + tr.stopsPer * tr.maxStops >= 1)) errors.push("a full tour walk must sell every ticket its share allows");
  if (!(Number.isInteger(tr.groupSize) && tr.groupSize >= 1 && Number.isInteger(tr.toursPerGuide) && tr.toursPerGuide >= 1 && tr.followers <= tr.groupSize)) errors.push("tour groups: whole sizes, and no more shown than a group holds");
  const rd = BALANCE.ride;
  if (!(rd.min <= rd.defaultPrice && rd.defaultPrice <= rd.max)) errors.push("default ride price is outside the Expedition Platform range");
  if (!(Number.isInteger(rd.seats) && rd.seats >= 1 && Number.isInteger(rd.ridesPerDay) && rd.ridesPerDay >= 1 && Number.isInteger(rd.maxRays) && rd.maxRays >= 1)) errors.push("rides: whole seats, rides a day and rays per platform");
  if (!(rd.clearance > 0 && rd.minCruise > 0 && rd.skyClear >= rd.minCruise && rd.loopSpeed > 0 && rd.climbSpeed > 0)) errors.push("rides: the loop needs clearance, a cruise height within the open sky, and speeds");
  const rm = BALANCE.rays.mount;
  if (!(rm.speed > 0 && rm.rise > 0 && rm.turn > 0 && rm.tameChance > 0 && rm.tameChance <= 1)) errors.push("ray mounts: speed, rise, turn and a tame chance up to 1");
  const rc = BALANCE.rays.cities;
  if (!(rc.over[0] >= 1 && rc.over[1] >= rc.over[0] && rc.group[0] >= 1 && rc.group[1] >= rc.group[0] && rc.perCity >= rc.group[1] && rc.maxNear >= 1)) errors.push("End City rays: sensible heights, groups and caps");
  const sw = BALANCE.services.weights;
  if (Math.abs(sw.food + sw.seating + sw.litter - 1) > 1e-9) errors.push("services weights don't sum to 1");
  for (const p of PROJECTS) {
    if (!(p.cost > 0) || !Object.keys(p.items).length || !p.text) errors.push(`research ${p.id}: needs parts, a cost and a text`);
    for (const id of [].concat(p.needs.after ?? [])) if (!PROJECTS.some((q) => q.id === id)) errors.push(`research ${p.id}: opens after unknown project ${id}`);
    for (const [id, level] of Object.entries(p.needs.species ?? {})) {
      if (!SPECIES[id]) errors.push(`research ${p.id}: needs unknown species ${id}`);
      if (!(level >= 1 && level <= 3)) errors.push(`research ${p.id}: a species level is 1 to 3`);
    }
    if (p.needs.releases !== undefined && !(Number.isInteger(p.needs.releases) && p.needs.releases >= 1)) errors.push(`research ${p.id}: releases needed must be a whole number, 1 or more`);
  }
  const c = BALANCE.conservation;
  if (!(c.minDistance > BALANCE.park.radius)) errors.push("conservation.minDistance must reach past the park boundary");
  if (!(c.guestsPerRelease >= 0 && c.guestsCap >= c.guestsPerRelease)) errors.push("conservation guest boost: the cap must hold at least one release");
  return errors;
}
