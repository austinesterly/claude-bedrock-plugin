import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { SPECIES } from "../data/species.js";
import { HABITAT_PROFILES } from "../data/profiles.js";
import { RATIONS, CARRIERS, rationPlural } from "../data/items.js";
import { BALANCE } from "../data/balance.js";
import { LEVELS, TASKS, levelOf } from "../discovery/rules.js";
import { doneTasks } from "../discovery/discovery.js";
import { releaseNote } from "../quests/conservation.js";
import { companyText, companions } from "../exhibits/mixing.js";
import { dangerLine } from "../animals/predatorRules.js";
import { wildLine } from "../animals/lionRules.js";
import { wildLine as tigerWildLine } from "../animals/tigerRules.js";
import { wildLine as crocWildLine } from "../animals/crocRules.js";
import { wildLine as gorillaWildLine } from "../animals/gorillaRules.js";
import { wildLine as owlWildLine } from "../animals/owlRules.js";
import { wildLine as mothWildLine } from "../animals/mothRules.js";
import { wildLine as beetleWildLine } from "../animals/beetleRules.js";
import { wildLine as hopperWildLine } from "../animals/hopperRules.js";
import { wildLine as snailWildLine } from "../animals/snailRules.js";

// Field Journal (spec section 16: "discovered species silhouettes, observation notes, habitat
// requirements, favorite enrichment"): one page per species, filled in by watching animals.

const COLOR = ["§8", "§7", "§e", "§a"];

// Favourite toys (species.toys): what to give and that nobody else plays with it.
const TOY_TEXT = {
  bone: "a Blaze Bone on the ground (bones and a blaze rod at the Zoo Workshop); only Ember Foxes play with it",
  skull: "a Wither Skull Ball on the ground (leather and a wither skeleton skull at the Zoo Workshop); only Basalt Tortoises play with it",
};

export async function fieldJournal(player) {
  const list = Object.values(SPECIES);
  const form = new ActionFormData().title("Field Journal").body("§7Look at an animal for a few seconds, wild or in a zoo, to fill in its page. A species has to be ready to move before you can catch a wild one.");
  for (const sp of list) {
    const lvl = levelOf(sp, doneTasks(sp.id));
    form.button(`${lvl ? sp.displayName : "???"}\n${COLOR[lvl]}${LEVELS[lvl]}`);
  }
  form.button("Close");
  const r = await show(player, form);
  if (!r || r.selection === undefined || !list[r.selection]) return;
  await speciesPage(player, list[r.selection]);
  return fieldJournal(player);
}

async function speciesPage(player, sp) {
  const done = doneTasks(sp.id);
  const lvl = levelOf(sp, done);
  const lines = [`${COLOR[lvl]}${LEVELS[lvl]}`, "", `§fWhere: §7${sp.where ?? "unknown"}`, "", "§fObservations:"];
  // Big predators (0.1.75): how dangerous they are is on the page from the first sighting.
  if (sp.dangerous) lines.splice(3, 0, `§c${dangerLine(sp)}`);
  if (sp.manes) lines.splice(4, 0, `§c${wildLine(BALANCE.lion)}`);
  if (sp.solitary) lines.splice(4, 0, `§c${tigerWildLine(BALANCE.tiger)}`);
  if (sp.basks) lines.splice(4, 0, `§c${crocWildLine(BALANCE.croc)}`);
  if (sp.troop) lines.splice(4, 0, `§c${gorillaWildLine(BALANCE.gorilla.bluff)}`);
  if (sp.roosts) lines.splice(4, 0, `§7${owlWildLine(BALANCE.owl)}`);
  if (sp.soulLight) lines.splice(4, 0, `§7${mothWildLine(BALANCE.moth)}`);
  if (sp.substrate) lines.splice(4, 0, `§7${beetleWildLine(BALANCE.beetle)}`);
  if (sp.pads) lines.splice(4, 0, `§7${hopperWildLine(BALANCE.hopper)}`);
  if (sp.crevices) lines.splice(4, 0, `§7${snailWildLine(BALANCE.snail)}`);
  for (const t of sp.observe ?? ["spot"]) lines.push(`${done.includes(t) ? "§a[x]" : "§7[ ]"} ${TASKS[t].text}`);
  if (lvl >= 2) {
    const prof = HABITAT_PROFILES[sp.habitatProfile];
    const food = Object.entries(RATIONS).filter(([, r]) => sp.dietTags.includes(r.diet)).map(([item]) => rationPlural(item));
    lines.push("", "§fCare notes:");
    lines.push(`§7Eats: ${food.join(", ")}, ${sp.rationUnitsPerParkDay} a day each`);
    if (sp.dietTags.includes("insect")) lines.push("§7Insect Rations grow in an Insect Hatchery (glass, rotten flesh, dirt and planks): a batch every minute or two, use it to take them out. The park shop sells them too");
    if (sp.dietTags.includes("meat")) lines.push(`§7Meat Rations: raw beef, mutton, porkchop, chicken or rabbit, one each, at a crafting table or the Zoo Workshop; the park shop sells them too. Zoos feed big cats a meat mix, bones and whole prey${sp.fasts ? `, and fast them one day a week: one park day in ${BALANCE.predators.fastEvery} the keepers don't feed them, and their hunger hardly drops that day` : ""}`);
    if (sp.dietTags.includes("fruit")) lines.push("§7Fruit Rations: apples, sweet berries, glow berries or melon slices at a crafting table or the Zoo Workshop. The park shop sells them too");
    if (sp.dietTags.includes("pellet")) lines.push("§7Flamingo Pellets: beetroot, dried kelp and a raw cod or salmon make 4, at a crafting table or the Zoo Workshop. The park shop sells them too");
    if (sp.dietTags.includes("grain")) lines.push("§7Grain Rations: 2 wheat make 2, a hay bale makes 9, at a crafting table or the Zoo Workshop. Zoos feed zebras mostly hay with a little grain mixed in, and that's what a Grain Ration is. The park shop sells them too");
    if (sp.pink) lines.push(`§7Pink: they get it from their food. A park day eating mostly Flamingo Pellets makes one pinker (+${BALANCE.flamingo.pinkUp} of 100); a day without fades it (-${BALANCE.flamingo.pinkDown}): rosy, then fading, then pale. Caught ones come in rosy; chicks are grey and grow up pale`);
    if (sp.wades) lines.push("§7Wading: they feed in the shallows, water 1 block deep, filter feeding with their heads upside down or stamping to stir food up, and rest on one leg in the shallows or on the bank. Deeper water they swim in");
    if (sp.rack) lines.push("§7Hay Rack: they eat from one too (sticks, planks and a hay bale at the Zoo Workshop), hung on the fence a block above their floor or stood on the floor. It holds hay: Grain or Leafy Rations");
    if (sp.graze) lines.push(`§7Grazing: ${sp.graze.perAnimal} grass blocks in the floor for each (a ${sp.breeding?.young ?? "young one"} half). With enough grass they get up to ${Math.round(sp.graze.share * 100)}% of their food grazing, so the feeders last longer; without it they're unsettled. Grass spreads onto dirt beside it in the light, and grazing never wears it away`);
    if (sp.harem) lines.push("§7Harems: one stallion with his mares and their foals. Two stallions with mares fight, and nobody is settled or breeds: keep the other stallions together in a bachelor group of their own (an exhibit with no mares), where they only spar. A colt that grows up in the harem becomes a rival: move him out");
    if (sp.feedRank) lines.push(`§7Rank at the food: the stallion first, then the mares in the order they came to the exhibit. With too few feeding places the lowest-ranking ones get pushed off the food: a Basic Feeder has room for ${BALANCE.zebra.places.feeder}, a Puzzle Feeder ${BALANCE.zebra.places.puzzle}, a Hay Rack ${BALANCE.zebra.places.rack}`);
    if (sp.harem) lines.push("§7On the move they walk off in single file: the mare with the youngest foal in front, each foal behind its mother, the stallion at the rear. Run at them and one barks the alarm, the herd gallops off together, then stops and looks back. Sneak to get close to a wild herd, or hold a Grain Ration");
    lines.push(`§7Space: ${prof.baseArea} blocks for the first, ${prof.extraArea} for each more; ${prof.minHeight} blocks of headroom`);
    if (sp.cover) lines.push(`§7${sp.cover.why === "shade" ? "Shade" : "Cover"}: over ${Math.round(sp.cover.minFraction * 100)}% of the ground, tree leaves 2 to ${prof.minHeight + BALANCE.cover.height - 1} blocks up or a roof at least ${prof.minHeight} blocks up`);
    if (sp.dangerous) {
      lines.push(`§7Holding Dens: one for each grown ${sp.displayName.toLowerCase()}${sp.dens?.spare ? ` and ${sp.dens.spare} spare (zoos give two cats three dens)` : ""}, set into the fence with the door facing in (stone bricks, iron and a tripwire hook at the Zoo Workshop). Worked from outside: call one in, let it out, or crate it from the den with a Reinforced Crate in hand. ${sp.dens?.cubsFollow ? "A tigress's cubs go in and come out with her" : `${(sp.breeding?.youngPlural ?? "cubs").replace(/^./, (c) => c.toUpperCase())} need no den: they're no danger, and stay out when the keepers go in`}`);
      lines.push(`§7Keepers go in only through a double Keeper Gate: two Keeper Gates in a row, ${BALANCE.predators.gates.pairMin} to ${BALANCE.predators.gates.pairMax} blocks apart, the inner one in the fence. Only one opens at a time. First they shift every grown ${sp.displayName.toLowerCase()} into a den and count them, and let them out after`);
      lines.push(`§7Crating: never loose. A zoo one from its Holding Den; a wild one only while it eats a ${RATIONS[sp.baitItem]?.label ?? "Meat Ration"} thrown down near it${sp.ape ? " (and one that got out of its exhibit the same way)" : ""}`);
    }
    if (sp.ledge) lines.push(`§7Resting up high: ${BALANCE.lion.ledgePerLion} ledge blocks for each grown lion, a floor block 1 or 2 higher than the floor beside it (a rock shelf, a log platform). They lie up there in the shade and look out`);
    if (sp.manes) lines.push(`§7A pride: lionesses and their cubs with one male, or a coalition of ${BALANCE.lion.coalitionMax} at most. More males fight, and nobody breeds. Males wear a light or a dark mane; a male cub grows his when he's grown`);
    if (sp.solitary) {
      lines.push(`§7Alone: tigers live alone, so only one grown tiger is out at a time (a tigress with her cubs counts as one). With more, give each a Holding Den: they take turns out, a different one each park day, the one going in called in first. Two loose together fight`);
      lines.push(`§7Introductions: tigers meet only to mate. With breeding on, one park day in ${BALANCE.tiger.introEvery} a grown male and a tigress without cubs are let out together; for ${BALANCE.tiger.introWindow} park days after it that pair can breed. Her cubs stay with her till they're grown, then get a den of their own`);
    }
    if (sp.privacy) lines.push(`§7Privacy: ${BALANCE.tiger.screenPerTiger} screened floor blocks for each grown tiger, a place out of sight: 2 or more blocks of rock, earth, leaves or a tree trunk round a floor block at head height (a boulder, a bank, bushes; glass and fences don't hide them). They rest there`);
    if (sp.solitary) lines.push("§7In the water: they swim across the pool with a dog paddle, the head up, and lie in the shallows up to the neck in the heat. They greet a keeper standing still at the fence with a chuff, a soft puff through the nose");
    if (sp.basks) {
      const C = BALANCE.croc;
      lines.push(`§7Basking bank: ${C.bankPerCroc} sunny bank blocks for each grown crocodile, within ${C.bankReach} blocks of the water, open to the sky, on grass, sand, mud or smooth stone (not gravel, cobblestone, raw stone or logs). They haul out by day and lie there with their jaws open; the biggest takes the spot nearest the water, and with too little bank the smallest go without`);
      lines.push(`§7Under the water: deep water (2 blocks) in ${C.deepPerCroc} spots for each grown one and ${C.deepPerYoung} for each young one, so all can go under at once without touching. They float with only the eyes, nostrils and a line of scutes out, sink backward to rest on the bottom, and spend the nights in the water`);
      lines.push(`§7Shore clearance: keepers must see into the water before going in, so keep the floor right beside the water clear (no grass, flowers, ferns, reeds or bushes, no feeder or trough at the edge) and the inner Keeper Gate at least ${C.gateToWater} blocks from the water. A crocodile can be lying right there`);
      lines.push(`§7Meals: grown ones eat about once a week (Meat Rations), a big meal, the biggest first; the young eat every day. At a meal one snaps the meat off the feeder, takes it into the water and death-rolls to tear it`);
      lines.push(`§7Rank: by size. A smaller one meeting a bigger one lifts its snout and gives way; males about one size face up, hissing. Each has its own size and tail crest, and males grow a third bigger with a broader head`);
      lines.push(`§7Nesting: with breeding on, she digs a nest in sand ${C.nestNear} to ${C.nestFar} blocks from the water, lays her eggs, fills it in and guards it, eating nothing. The warmth sets the sex: in full sun most hatchlings are males, in the shade all are females. She carries the hatchlings to the water in her jaws, and they keep near her. Males display at dawn and dusk: the head and tail lifted, a bellow, a slap of the jaws`);
    }
    if (sp.enrichmentTags.includes("scent")) lines.push("§7A Scent Post on the floor (a log, string and a fern at the Zoo Workshop): keepers rub new scents on it, and they sniff it, pull the flehmen face, rub their cheeks on it, claw it and spray it");
    if (sp.mud) lines.push(`§7Mud wallow: at least ${sp.mud.minCells} blocks of mud in the floor (a water bottle on dirt makes mud)`);
    if (sp.cold) lines.push("§7Cold: a Cooling Unit with ice beside the floor or the pool");
    if (sp.heat) lines.push(`§7Heat: a Thermal Regulator beside the floor, fuelled with charcoal or coal; without heat for ${Math.round(BALANCE.heater.graceSeconds / 60)} minutes they go to recovery holding`);
    if (sp.drinksLava) lines.push("§7Drink: lava, not water: a Lava Trough beside the floor, filled with lava buckets");
    if (sp.bask?.rest) lines.push(`§7Warm resting spots: at least ${sp.bask.minCells} magma blocks on the bank (they don't hurt the animal). Off the lava and off magma they shiver and turn purple`);
    else if (sp.bask) lines.push(`§7Basking pads: at least ${sp.bask.minCells} magma blocks in the floor (they don't hurt the animal)`);
    if (sp.ash) lines.push(`§7Ash bed: at least ${sp.ash.minCells} Warm Ash blocks in the floor to dig in (gravel or soul soil with charcoal)`);
    if (sp.endGround) lines.push(`§7End ground: at least ${sp.endGround.minCells} end stone blocks in the floor (bring it back from the End)`);
    if (sp.nylium) {
      const Z = BALANCE.grazer;
      lines.push(`§7Crimson ground: at least ${Z.nyliumCells} crimson nylium blocks in the floor (mine it with Silk Touch in a crimson forest, or bone meal netherrack beside some). They crop the nylium, roots and fungus head down`);
      lines.push("§7A rubbing stem: a crimson stem or hyphae standing on the floor (a huge crimson fungus grown inside works too), back from the walls. Now and then one walks over and rubs its flank and shoulder on it");
      lines.push("§7A herd: 3 to 8 together (alone or in twos they're uneasy), led by the oldest bull. Morning and afternoon they graze; round noon and at night they lie down together near the lead, chewing the cud or asleep, a calf by its mother");
      lines.push(`§7Food: Fungal Rations (crimson and warped fungus with nether wart, at the Zoo Workshop), ${sp.rationUnitsPerParkDay} a park day each, in a Basic Feeder. A crimson or warped fungus held up draws one over but doesn't feed it`);
      lines.push(`§7Warning: walk toward a herd in Survival (inside the exhibit, within ${Z.ringRangeZoo} blocks) and it forms a ring, horns out, the calves inside; come within ${Z.rushRange} and the nearest of them (a bull first) rushes you and stops short. Hurt one of a wild herd and it charges for real (2 hearts). Holding a Fungal Ration, you're no threat`);
    }
    if (sp.pads) {
      const H = BALANCE.hopper;
      lines.push(`§7A roof: they leap ${H.reachUp} blocks high, so a fence won't hold them. Close the exhibit over the top (glass is fine), with ${HABITAT_PROFILES[sp.habitatProfile].minHeight} blocks of air over the floor. The Exhibit Clipboard says where the air leads out, once a Landing Pad is inside and the exhibit is measured`);
      lines.push(`§7Landing Pads (3 purple wool over 3 end stone make 3, at the Zoo Workshop): ${H.minPads} or more, one for each hopper over ${H.minPads}, each with ${H.padClear} blocks of air over it, within a leap (${H.reachUp} blocks up, ${H.reachAcross} across) of the floor or of another pad; and one ${H.highMin} or more blocks over the floor, on a pillar. They leap from pad to pad, landing with all four feet together, and sit up on each to look round. Without them comfort can't rise above ${H.padComfortCap}`);
      lines.push(`§7Food: Chorus Browse in a Basic Feeder, ${sp.rationUnitsPerParkDay} a park day each. Hold one up and they hop over and sit up to sniff it`);
      lines.push("§7Their day: the End has no day or night, so they keep to bouts: out and about a while (leaping, foraging hunched on all fours, sitting up to look round, listening with the head and ears on the ground), then a nap standing asleep, the head tucked between the hind legs");
      lines.push(`§7A pup at a time: it keeps to the floor by its mother and doesn't leap. Walk up to one inside the exhibit in Survival (within ${H.startleRange} blocks, not sneaking) and it leaps to the pad farthest from you, or zigzags away across the floor`);
    }
    if (sp.crevices) {
      const N = BALANCE.snail;
      lines.push(`§7Crevices: one for each grown snail to rest in, sealed in its shell: a one-block gap at the foot of a wall, roofed over and walled on three sides, open onto the floor. Leave a block out at the foot of a wall two blocks thick, on the inside, or set two blocks a block apart against a wall with a block over them. With none free they rest against a wall, near each other. Too few and comfort can't rise above ${N.creviceComfortCap}`);
      lines.push(`§7Mineral Substrate: at least ${sp.mineralBed.minCells} blocks in the floor (4 gravel, a nether quartz and a bone meal make 4). They graze it, rasping at the rock with the head down, and lay their eggs in it. Without it comfort can't rise above ${N.bedComfortCap}`);
      lines.push(`§7Food: Mineral Pellets in a Basic Feeder, ${sp.rationUnitsPerParkDay} a park day each. Hold one up and one crawls over and reaches up at it`);
      lines.push("§7Their day: the End has no day or night, so they keep to bouts: out a while (crawling, grazing, eating, looking about with the eye stalks up, following each other's trails and touching tentacles when they meet), then back to a crevice, in head first and sealed in with a white seal over the shell's mouth");
      lines.push(`§7The trail: as they crawl they leave a glowing green-aqua trail that fades over ${Math.round(N.trailTicks / 20)} seconds, dimmer where they graze or eat. Walk up to one inside the exhibit in Survival (within ${N.zooStartleRange} blocks, not sneaking) and it pulls into its shell for a few seconds; keep at it and it gets used to you`);
      lines.push(`§7Any two can pair: each is male and female at once. With breeding on, one of a pair lays ${sp.breeding.litter} or ${sp.breeding.litterMax} eggs in the Mineral Substrate (${sp.breeding.eggBed} or more blocks); the hatchlings glow, crawl after their parent and grow up in ${sp.breeding.matureDays} park days`);
    }
    if (sp.clings) {
      const G = BALANCE.gecko;
      lines.push(`§7Walls to climb: they cling to the side of any whole block, glass too (not slabs, stairs, fences, panes or zoo equipment), head up, head down or across, and go over the top. ${G.wallFaces} wall faces for each: make the exhibit tall, with pillars or blocks to climb round. A grown male keeps low, within ${G.maleLow} blocks of the floor; females and young go higher`);
      lines.push("§7A roof: they climb glass and walls, so the exhibit has to be closed over the top (glass is fine). The Exhibit Clipboard counts the wall faces and says where the air leads out, once an Insect Feeder is inside and the exhibit is measured");
      lines.push("§7A hide each: by day they sleep tucked into a crack (a one-block gap in a wall, open on one side only) or a Burrow Shelter on the floor, out of sight; at dusk they come out and call, a cluck and then a growl. A nocturnal house (fully enclosed and dark, lit only by Nocturnal Lamps) turns that round, and in the Nether any dark exhibit does (no daylight gets in there): they glow, so guests see them in the dark");
      lines.push(`§7Food: Insect Rations (an Insect Hatchery grows them) in an Insect Feeder (string, a glass pane and planks at the Zoo Workshop), ${sp.rationUnitsPerParkDay} a park day each. At night a stocked one lets out a moth now and then: a gecko creeps up on it along the wall, freezes, and snaps it up`);
      lines.push("§7One grown male: two of them square up at night, bobbing their heads and growling. A female or two and the young get on with him");
      lines.push("§7Walk right up to one in Survival and it rises on its legs, mouth wide, hisses and runs off up the wall; no harm done. Hold an Insect Ration and they come down to you");
    }
    if (sp.wallow) {
      const O = BALANCE.boar;
      lines.push(`§7Ground to root in: at least ${sp.ash.minCells} Warm Ash blocks in the floor (gravel or soul soil with charcoal, at the Zoo Workshop). Morning and from the afternoon into the night they forage, snout down, ploughing the ash`);
      lines.push(`§7A wallow: at least ${sp.wallow.minCells} Thermal Mud blocks in the floor (4 mud, a soul soil and a snowball make 4). In the heat of the day each rolls in it and comes out muddy, then rubs the mud off against a rock or a wall at its side; without it the heat of the Thermal Regulator is too much for them`);
      lines.push("§7Strong walls: they break through wooden fences, gates and doors (with the mobGriefing game rule on). Stone, brick and nether brick walls and fences, iron bars, glass and the Keeper Gate hold them; the Exhibit Clipboard says where wood leads out");
      lines.push(`§7A sounder: sows and their striped piglets, 2 to 8, led by the oldest sow, and one grown boar at most (boars live apart). Late at night they sleep together. Food: Ember Rations or Fungal Rations, ${sp.rationUnitsPerParkDay} a park day each, in a Basic Feeder; a crimson fungus held up draws one over`);
      lines.push(`§7Warning: come within ${O.alertRange} blocks of her piglets in Survival (inside the exhibit, ${O.alertRangeZoo}) and their mother stands in your way, bristling; within ${O.bluffRange} she charges and stops short; within ${O.realRange}, or if you hurt one of a wild sounder, she means it (${O.sowDamage / 2} hearts; a boar's tusks ${O.boarDamage / 2}). Holding an Ember Ration, you're no threat`);
    }
    if (sp.soulLight) {
      const M = BALANCE.moth;
      lines.push(`§7Soul light: a soul lantern, soul torch, soul campfire or soul fire inside the house or on its walls. At night they circle it, banked hard with their backs to the light; under a hanging lantern one now and then climbs steeply until it stalls, and over a light on the floor one flips over and drops. Without one comfort can't rise above ${M.soulComfortCap} and they flit about restless`);
      lines.push(`§7Nectar: Nectar Rations (2 sugar and a honeycomb make 3, or 2 sugar and sweet berries make 2) in a Nectar Feeder (a glass pane, two cornflowers and a stick at the Zoo Workshop), ${sp.rationUnitsPerParkDay} a park day each. They hover at the dish, wings a blur, and sip through the long proboscis, at dusk first`);
      lines.push("§7Their day: by day at rest flat against a wall, head up and wings swept back, up high and near a light first; out at dusk, at the feeder and the lights through the night, back to a wall at dawn. A dark moth house (no daylight, nothing brighter than soul light) turns that round so guests see them fly by day; in the Nether any dark house does. They glow faintly, so guests see them in the dark");
      lines.push(`§7Caterpillars: a moth lays her eggs only where ${sp.breeding.hostPlants} or more Nether plants grow in the floor (crimson or warped roots, nether sprouts, crimson or warped fungi). The caterpillars crawl from plant to plant eating them, not from the feeder; for their last ${sp.breeding.pupaDays} park days each burrows into the floor as a pupa, and the moth that comes out pumps its wings out before it flies`);
      lines.push("§7Walk right up to one at rest in Survival and it lifts its forewings to flash the eyespots on its hindwings, then flies off to another wall. It does no harm. They keep an exhibit of their own (a Warped Gecko eats moths)");
    }
    if (sp.substrate) {
      const Q = BALANCE.beetle;
      lines.push(`§7A bed: at least ${sp.substrate.minCells} Mineral Substrate blocks in the floor (4 gravel, a nether quartz and a bone meal make 4, at a crafting table or the Zoo Workshop). By day each lies buried in it, only the quartz-plated back showing, now and then tunnelling a few blocks through it; without it comfort can't rise above ${Q.bedComfortCap}`);
      lines.push("§7A cave: a roof over the floor, 2 or more blocks up. They're night animals: out at dusk to the feeder, walking and eating through the night, back into the bed at dawn. A dark cave (no daylight, lit only by Nocturnal Lamps) turns that round so guests see them out by day");
      lines.push(`§7Food: Mineral Pellets in a Basic Feeder, ${sp.rationUnitsPerParkDay} a park day each. A Mineral Pellet or a nether quartz held up draws one over`);
      lines.push("§7Males: a male's horn is short, middling or long. Two that meet at night face off and tap horns: the one with the shorter horn backs off and is chased a few blocks; two with matched horns shove, and one pries the other up and flips him on his back. He kicks, rights himself and walks off. No harm done");
      lines.push(`§7Grubs: a female lays her eggs only in Mineral Substrate, ${sp.breeding.substrate} or more blocks. The grubs live buried in it and feed in it, not from the feeder, now and then curling up at the surface; for their last ${sp.breeding.pupaDays} park days each lies in a pupal cell, and the new beetle digs its way up out of the substrate`);
      lines.push(`§7Walk right up to one on its feet in Survival (within ${Q.hissRange} blocks) and it rears and hisses, then digs itself in if it's on its bed, or walks off. It does no harm`);
    }
    if (sp.den === "burrow") lines.push("§7Den: a Burrow Shelter on the floor to sleep in (sticks, hay and logs at the Zoo Workshop)");
    else if (sp.den) lines.push("§7Den: an Ember Den on the floor to curl up in");
    if (sp.nocturnal) lines.push(`§7Nocturnal: asleep by day and up at night, and a Viewing Point doesn't count one that's asleep or in pitch dark, so by day they aren't on show. A nocturnal house turns that round, like a real zoo's: a fully enclosed building (solid walls and roof all round, not glass; doors shut) so no daylight reaches the floor, lit only by red or purple Nocturnal Lamps (nothing brighter than light level ${BALANCE.nocturnal.maxLight}; torches and glowstone spoil the dark), and they are up by day and sleep at night. Guests see them in the lamplight. An awake one curls into a ball when you walk right up to it; sneak to get close`);
    if (sp.anchor) lines.push("§7Containment: a Containment Anchor beside the floor, charged with ender pearls (eyes of ender and popped chorus fruit work too). Their blinks land only inside the exhibit; without charge they stop blinking and are unsettled");
    if (sp.climbs) lines.push("§7Climbing: they climb fences, walls, bars, logs and hedges, and trees or anything else standing by a wall, and get out over the top. They can't grip glass or glass panes and can't hang under a roof: build the walls of glass, or add an overhang (a row of blocks sticking inward along the top of the wall), or roof the exhibit. The Exhibit Clipboard says whether an exhibit is climb-proof, and where one could get out");
    if (sp.climbTree) lines.push(`§7Something to climb: a climbing tree (a trunk 3 or more logs high standing on the floor) or a Climbing Frame (Zoo Workshop), back from the walls. ${sp.canopy ? "They climb up through the leaves onto the canopy" : "They climb up, look out from the top by day and nap up there at night"}`);
    if (sp.wash) lines.push(`§7Water to wash their food in: a pool in the floor, even ${sp.wash.minCells === 1 ? "one block" : `${sp.wash.minCells} blocks`}. They drink from it too`);
    if (sp.climbs && sp.wash) lines.push("§7Loose at night (wild, or out of their exhibit) they raid Litter Bins: one without a latch gets knocked over and its litter spills onto the paths. A Bin Latch on each bin (use one on it) keeps them out");
    if (sp.canopy) {
      const P = BALANCE.redpanda;
      lines.push(`§7Canopy: a continuous climbing route up in the trees, ${P.canopyPer} canopy blocks for each grown one: open blocks on top of leaves, logs or a Climbing Frame, 2 or more blocks up, that they reach by climbing a trunk (leaves with no trunk to climb don't count). At dawn and dusk they travel along it, stopping to look about; through the day they rest draped over a branch; they come down head first. The Exhibit Clipboard counts it`);
      lines.push("§7Nest Boxes: one for each grown one (planks and sticks at the Zoo Workshop), on the floor or up in a tree, level with a canopy block and right beside it. They sleep curled up inside with the head peeking out of the hole, and the cubs spend their first park day in one, twittering");
      lines.push("§7Heat: they suffer above about 25 C (above 27 C is dangerous). In a hot biome (desert, savanna, badlands) shade at least a third of the floor with leaves or a roof. In the heat they sprawl on a branch and pant; in the cold they curl up with the tail over the face");
      lines.push("§7Food: Leafy Rations (bamboo) in a Basic Feeder; they sit up and chew a stalk held in a paw. A wild one eats the bamboo where it grows");
      lines.push("§7Warning: walk right up to one on the ground in Survival and it stands up on its hind legs with its arms raised and hisses. It does no harm");
    }
    if (sp.troop) {
      const G = BALANCE.gorilla;
      lines.push(`§7A troop: one silverback (a grown male: bigger, a silver saddle on his back and a crest on his head) with his females and their young. Two silverbacks with the females fight, and nobody is settled or breeds: keep the other males in a bachelor group of their own (an exhibit with no females), ${G.bachelorMax} at most. A young male growing up in the troop becomes a rival: move him out`);
      lines.push(`§7Strong walls: they climb trees, Climbing Frames and fences, and pull themselves up onto anything ${G.reach} blocks above where they stand (a fence or wall block counts a block and a half). Build the walls ${Math.ceil(G.reach)} or more blocks high of solid blocks or glass, keep trees and frames back from them, and never fence them in with fences. The Exhibit Clipboard says whether they could get out, and where`);
      lines.push("§7No deep water: gorillas can't swim and drown in water 2 or more blocks deep. Water 1 block deep they wade in. A moat must be dry, or shallow");
      lines.push("§7Their day: feeding in the morning and the afternoon (sat up eating, browsing the leaves, working a Puzzle Feeder), a rest at midday while the young play, and at dusk each builds a nest, pulling branches in round it, and sleeps in it. The silverback leads: where he goes and rests, the troop follows. Females and the young climb; the silverback stays on the ground");
      lines.push(`§7Food: Leafy Rations (browse) are the better food; zoos give little fruit. A Fruit Ration thrown down near a wild one calms it while it eats. An infant rides on its mother's back its first ${G.rideDays} park days`);
      lines.push(`§7Warning: in the exhibit, in Survival, one stands up and beats its chest at you; keep coming and it charges and shoves. In the wild the silverback warns you off from ${G.bluff.displayRange} blocks: he hoots and beats his chest; within ${G.bluff.chargeRange} he charges and stops short. Back away and he lets you be; keep coming, or hurt one of his troop, and the charge is real`);
    }
    if (sp.roosts) {
      const O = BALANCE.owl;
      lines.push(`§7Perches (logs and sticks at the Zoo Workshop): ${O.minPerches} or more, on the floor, a log, a wall top or a ledge, open air above each. They use high and low ones: with no two Perches ${O.perchSpread} or more blocks apart in height, comfort can't rise above ${O.perchComfortCap}`);
      lines.push("§7A night bird: by day it roosts still on the highest Perch, eyes half shut, and opens them to watch anyone who comes near (the head turns right round to follow you). At dusk it hoots from its perch, a pair answering each other; at night it watches from a perch and flies silently to another, or swoops down to the feeder and mantles over the food, wings spread. At dawn it goes back to the roost and coughs up a pellet");
      lines.push(`§7Food: Meat Rations (zoos feed whole prey: mice, rats, chicks, quail), 1 a park day. Water: a Water Trough to drink and bathe in`);
      lines.push(`§7Breeding: a pair lays ${sp.breeding.litter} or ${sp.breeding.litterMax} eggs, only in a Nest Box (on the floor or a ledge), and the female sits on them. The owlets stay in the box their first ${O.nestDays} park days, begging when a parent comes near, then hop and flutter about the floor and the low perches`);
      lines.push(`§7Warning: come within ${O.displayRange} blocks of one on the ground, on a low perch or at its Nest Box, in Survival, and it spreads its wings in a half-circle, hissing and snapping its bill. It does no harm`);
    }
    if (sp.enrichmentTags.includes("manipulate")) lines.push("§7A Puzzle Feeder holding food they eat keeps them busy working the pegs (enrichment), and feeds them like a Basic Feeder");
    if (sp.tunnels) lines.push(`§7Tunnels: ${sp.tunnels.min} or more Rift Tunnels on the floor to blink between and hide in`);
    if (sp.anchor) lines.push("§7End Fence: they never blink across one, wild or in a zoo. Ring the pen with End Fences (end stone bricks and end rods at the Zoo Workshop; a block and a half high, so nothing jumps them) and a blink can't leave it");
    if (prof.onLava) lines.push(`§7Lava pool: at least ${Math.round(prof.minLavaFraction * 100)}% of the space lava to walk across (any depth) and ${Math.round(prof.minDryFraction * 100)}% bank to rest on. Lava sets wooden fences on fire: fence the pool with walls, nether brick fence or glass`);
    else if (prof.lava) lines.push(`§7Lava pool: at least ${Math.round(prof.minLavaFraction * 100)}% of the space lava, ${prof.minDeepLava} spots 2 deep to turn in, and a bank to stand on. Lava sets wooden fences on fire: fence the pool with walls, nether brick fence or glass`);
    if (sp.lavaWalker) lines.push("§7Feeding and warmth: warped fungus in a Basic Feeder on the bank. The lava keeps them warm: no Thermal Regulator or trough. They walk on real lava only: Clear Lava doesn't hold them up");
    if (sp.lavaSwimmer) lines.push("§7Feeding and warmth: Molten Plankton Feed in a Thermal Feeder at the pool's edge, level with the lava. The lava keeps them warm and they drink it: no Thermal Regulator or trough");
    if (sp.lavaSwimmer) lines.push("§7To watch them under the surface: fill the pool with Clear Lava (a lava bucket used on a Lava Filter). It burns and flows like lava");
    if (prof.amphibious) lines.push(`§7Water: at least ${Math.round(prof.minWaterFraction * 100)}% water, ${Math.round(prof.minDryFraction * 100)}% dry bank${prof.minDeepWater ? `, ${prof.minDeepWater} spots 2 deep` : ""}${prof.minShallowWater ? `, ${prof.minShallowWater} spots 1 deep ${prof.shallowUse ?? "to wade in"} (the ground right under the water)` : ""}`);
    if (prof.aerial && prof.nectar) lines.push(`§7Moth house: a roof and closed walls (they fly out of an open top), ${prof.minHeight} blocks of air over the floor, and a Nectar Feeder inside. Put the feeder in first, then measure with the Habitat Marker`);
    else if (prof.aerial && prof.minRoosts) lines.push(`§7Aviary: a roof and closed walls (they fly out of an open top), ${prof.minHeight} blocks of air over the floor, and ${prof.minRoosts} or more Perches inside. Place the Perches first, then measure with the Habitat Marker`);
    else if (prof.aerial) lines.push(`§7Flight room: a roof and closed walls (they fly out of an open top), ${prof.minHeight} blocks of air over the floor, and ${prof.minPerches} or more Void Perches floating up in the air to rest on (air under each). Float the perches first, then measure with the Habitat Marker`);
    lines.push(`§7Company: ${sp.social.prefersCompany ? `likes ${sp.social.minGroup} or more together` : sp.solitary ? "lives alone (they take turns out)" : "happy alone"}, up to ${sp.social.recommendedMax}${sp.solitary ? " in an exhibit" : ""}`);
    lines.push(`§7${companyText(sp, SPECIES)}${companions(sp.id, SPECIES).length ? ". A shared exhibit needs a quarter more room, and each species its own food and drink" : ""}`);
    lines.push(`§7Enjoys: ${sp.enrichmentTags.join(", ")}`);
    for (const t of sp.toys ?? []) if (TOY_TEXT[t]) lines.push(`§7Favourite toy: ${TOY_TEXT[t]}`);
    lines.push(`§7Travels in: a ${CARRIERS[sp.carrierProfile]?.label ?? "carrier"}`);
    const br = sp.breeding;
    if (br) {
      const B = BALANCE.breeding;
      lines.push(`§7Breeding (turn it on with the Exhibit Clipboard): an adult female and male, room and ${B.minFoodDays} park days of food for the young, a sheltered corner (leaves or a roof over ${Math.round(B.shelterFraction * 100)}% of the floor), every adult at welfare ${B.welfareMin} or more for ${B.goodDays} park days. ${br.litterMax ? `${br.litter} to ${br.litterMax} ${br.youngPlural}` : br.litter === 1 ? `One ${br.young}` : `${br.litter} ${br.youngPlural}`} after ${br.gestationDays} park day${br.gestationDays === 1 ? "" : "s"}; young grow up in ${br.matureDays}`);
      if (sp.nest) lines.push(`§7Nesting: only in a flock, ${sp.nest.flock} or more grown-ups (a Flock Mirror at the water's edge makes a small flock feel ${sp.nest.mirrorBirds} birds bigger, up to twice its size: glass panes and iron at the Zoo Workshop), every grown-up rosy, and ${sp.nest.sites} or more mud blocks in the floor right beside the water to nest on. The pair builds a mud nest there, then they take turns sitting on the egg, and feed the grey chick crop milk`);
    }
    lines.push(`§7${releaseNote(sp)}`);
  } else if (lvl === 1) lines.push("", "§8Care notes open after one more observation.");
  await show(player, new ActionFormData().title(lvl ? sp.displayName : "???").body(lines.join("\n")).button("Back"));
}
