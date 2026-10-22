// Nocturnal animals and the nocturnal house (M6 part 3b, spec 5: "Hedgehog | Night foraging and
// curling | Small tunnels and nocturnal viewing"), pure. A nocturnal species (species.nocturnal)
// sleeps by Minecraft day and is up at night, so most guests only ever see it curled up. A nocturnal
// house turns that round, the way a real zoo's does (0.1.63, Austin: "a fully enclosed building with
// darkness at a certain level like a real zoo"): a building closed all round so no daylight reaches
// the floor, lit only by dim lamps (nothing brighter than balance.nocturnal.maxLight; the red and
// purple Nocturnal Lamps give exactly that), where the animals sleep at night and are up by day.
// The game's own light is the measure (exhibits/light.js reads the sky light and the light level on
// every floor block), so what the player sees is what counts. Everything here is visible to players:
// the clipboard says whether an exhibit is a nocturnal house and why not, the animal's page says what
// it is doing now, and the Field Journal says what the species does when. A Viewing Point doesn't
// count an animal that is asleep or standing in pitch dark (visitors/points.js), so the house and its
// lamps are what put them on show.

// The entities that declare zoocraft:asleep (entities/hedgehog.json, wild_hedgehog.json; a test checks the list): the
// others are never asleep or hidden in the dark, so a Viewing Point's look at them reads no property (0.1.96: it was
// two native calls an animal, every check).
export const SLEEPER_TYPES = new Set(["zoocraft:hedgehog", "zoocraft:wild_hedgehog"]);

// Should a nocturnal animal be asleep now? Outside a nocturnal house it sleeps by day; inside, at night.
export function sleepNow(night, nocturnalHouse) {
  return nocturnalHouse ? night : !night;
}

/**
 * The house measurement from the light on the floor cells: { sky, light } per usable block.
 * @param {{ sky: number, light: number }[]} readings
 * @param {number} [max] the brightest allowed: the Nocturnal Lamps' (balance.nocturnal.maxLight), or more for a night
 *   animal whose own light counts as dark (Soul Moths, 0.1.88: soul light, species.houseLight)
 * @returns {{ cells: number, daylit: number, bright: number, lit: number, brightest: number, max?: number }}
 *   daylit: blocks daylight reaches (sky light above 0); bright: blocks brighter than allowed;
 *   lit: blocks with any light at all (where guests can see); brightest: the highest light level;
 *   max: the limit, when it isn't the Nocturnal Lamps'.
 */
export function houseFromReadings(readings, balance, max = balance.nocturnal.maxLight) {
  const out = { cells: 0, daylit: 0, bright: 0, lit: 0, brightest: 0 };
  for (const r of readings) {
    out.cells++;
    if (r.sky > 0) out.daylit++;
    if (r.light > max) out.bright++;
    if (r.light > 0) out.lit++;
    if (r.light > out.brightest) out.brightest = r.light;
  }
  if (max !== balance.nocturnal.maxLight) out.max = max;
  return out;
}

// Is the exhibit a nocturnal house? Only once it has been measured for light (ex.house is set when
// a nocturnal species lives there): fully enclosed from daylight, and nothing too bright inside.
export function isNocturnalHouse(ex, balance) {
  const h = ex.house;
  return Boolean(h) && h.cells > 0 && h.daylit === 0 && h.bright === 0;
}

// Why an exhibit isn't a nocturnal house, in the player's terms.
export function houseProblems(house, balance) {
  const max = house?.max ?? balance.nocturnal.maxLight;
  if (!house || house.cells === 0) return ["not measured yet (measure the exhibit with the Habitat Marker)"];
  const out = [];
  if (house.daylit > 0) out.push(`daylight reaches ${house.daylit} of ${house.cells} blocks (a fully enclosed building: solid walls and roof all round, not glass or leaves, with the doors shut)`);
  if (house.bright > 0) out.push(`too bright on ${house.bright} block${house.bright === 1 ? "" : "s"}, brightest ${house.brightest} of ${max} allowed (${house.max ? "torches, lanterns and glowstone are too bright: light it with soul lanterns, soul torches or soul campfires, or Nocturnal Lamps" : "torches, lanterns and glowstone are too bright: light it with red or purple Nocturnal Lamps only"})`);
  return out;
}

// The clipboard's line for an exhibit with nocturnal residents (`plural`: "Hedgehogs"). `glows` (Warped Geckos): they
// glow, so guests see them in pitch dark too. In the Nether no daylight gets in anywhere (it has no sky light).
export function nocturnalLine(ex, plural, balance, glows = false) {
  const who = plural.toLowerCase();
  const h = ex.house;
  if (isNocturnalHouse(ex, balance)) {
    const dark = h.cells - h.lit;
    const why = ex.dimension === "minecraft:nether" ? "dark, and no daylight reaches the Nether" : "fully enclosed and dark: no daylight";
    const pitch = dark > 0 ? (glows ? ` §7(they glow, so guests see them in the dark too)` : ` §e(${dark} block${dark === 1 ? " is" : "s are"} pitch dark, where guests can't see them: add Nocturnal Lamps)`) : "";
    return `§fNocturnal house: §ayes §7(${why}, brightest spot ${h.brightest} of ${h.max ?? balance.nocturnal.maxLight} allowed; ${h.lit} of ${h.cells} blocks in lamplight): ${who} are up by day for the guests and sleep at night${pitch}`;
  }
  return `§fNocturnal house: §7no: ${houseProblems(h, balance).join("; ")}: ${who} sleep by day and are up at night, when Viewing Points don't count them. Fix it and measure again`;
}

// What a nocturnal animal is doing now, for the clipboard's animal page.
export function stateText(asleep, curled, nocturnalHouse) {
  if (asleep) return nocturnalHouse ? "asleep for the night, curled up (it's up by day in this nocturnal house)" : "asleep for the day, curled up (it's up at night; a nocturnal house turns that round)";
  if (curled) return "curled into a ball: someone walked up to it (sneak to get close)";
  return nocturnalHouse ? "awake, up by day in this nocturnal house" : "awake and foraging";
}
