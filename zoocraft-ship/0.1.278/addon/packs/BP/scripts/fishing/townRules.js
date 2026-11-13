// The Shark People of the mythic towns (0.1.278; the towns themselves 0.1.277, fishing/islandRules.js mythicSites).
// Austin, 12 Nov: "there will be an advanced fishing civilization there. They are the shark people from the exotic
// formations, but they can speak, and are passive. Adjust their look to be more friendly as well." The rules, with no
// game in them: who lives where in a town and which way they face, their names and the town's, what they say and what
// they give. The game side is fishing/town.js; the folk are zoocraft:shark_folk (passive, by the game's own goals: a
// resident strolls near their house by day and goes in at night, the rest keep to their posts).
import { cityOf, hash, unit } from "./islandRules.js";

export const FOLK = "zoocraft:shark_folk";
/** The four kinds of townsfolk, in the order of the entity's zoocraft:role property (and its pictures). */
export const ROLES = Object.freeze(["resident", "fisher", "guard", "elder"]);
export const ROLE_EVENT = Object.freeze({ resident: "zoocraft:as_resident", fisher: "zoocraft:as_fisher", guard: "zoocraft:as_guard", elder: "zoocraft:as_elder" });
/** How far a resident strolls from their house (the entity's minecraft:home restriction_radius). */
export const STROLL = 8;

const NAMES = Object.freeze([
  "Marin", "Coral", "Finn", "Reef", "Tide", "Pearl", "Nerissa", "Kai", "Gill", "Delphine", "Brine", "Kelp", "Shelly", "Wade",
  "Morwen", "Dorado", "Caspian", "Ondine", "Rill", "Skerry", "Fathom", "Bay", "Cove", "Isla", "Marlo", "Ula", "Gale", "Spray",
  "Cerulea", "Merrow", "Tarpon", "Cobia", "Sable", "Mako", "Thresh", "Wahoo", "Lir", "Nami", "Ripple", "Sounder",
]);
const TOWN_FIRST = Object.freeze(["Pearl", "Coral", "Tide", "Shell", "Reef", "Gold", "Moon", "Sun", "Star", "Brine", "Kelp", "Wave"]);
const TOWN_LAST = Object.freeze(["haven", "crest", "harbor", "gate", "mere", "port", "reach", "spire", "crown", "hold"]);

/** The town's name, the same every time for that island (its people's word for it; nothing shows it but their talk). */
export function townName(isl) {
  const a = TOWN_FIRST[Math.floor(unit(hash(isl.s, 3, 3, 7)) * TOWN_FIRST.length)];
  const b = TOWN_LAST[Math.floor(unit(hash(isl.s, 3, 4, 7)) * TOWN_LAST.length)];
  return a + b;
}

/** The yaw (degrees, the game's: 0 faces +z) that faces along fx fz. */
export function yawAlong(fx, fz) {
  return Math.round((Math.atan2(-fx, fz) * 180) / Math.PI);
}

/**
 * Where each of a town's people lives and stands: [{ slot, role, x, y, z (the middle of the block they stand in, y their
 * feet), yaw, name }], from the island and the spots its build recorded (islands.js: houses' doors and their steps
 * outside, the piers' ends). In order: the Elder before the gold seat in the palace, facing its door; two guards either
 * side of the palace door and two either side of the gate outside, facing out; a fisher at each pier's end, facing the
 * column in the lagoon; one resident in each house, just inside the door, facing out of it.
 */
export function folkSlots(isl, spots) {
  const c = cityOf(isl);
  const { Q, Wr, gx, gz, G } = c;
  const W = (u, v) => [isl.x + u * gx - v * gz, isl.z + u * gz + v * gx];
  const uf = Q + 3;
  const ub = Wr - 5;
  const out = [];
  /** @param {string} role @param {number[]} at @param {number} y @param {number[]} face */
  const add = (role, [x, z], y, [fx, fz]) => out.push({ slot: out.length, role, x: x + 0.5, y, z: z + 0.5, yaw: yawAlong(fx, fz), name: "" });
  add("elder", W(-ub + 2, 0), G + 1 + 1 / 16, [gx, gz]);
  for (const v of [-2, 2]) add("guard", W(-uf + 1, v), G + 1, [gx, gz]);
  for (const v of [-2, 2]) add("guard", W(Wr + 3, v), G + 1, [gx, gz]);
  for (const [x, z] of spots.piers ?? []) add("fisher", [x, z], G + 1, [isl.x - x, isl.z - z]);
  for (const h of spots.houses ?? []) {
    const n = [h.step[0] - h.door[0], h.step[1] - h.door[1]];
    add("resident", [h.door[0] - n[0], h.door[1] - n[1]], G + 1, n);
  }
  const used = new Set();
  for (const f of out) {
    let k = Math.floor(unit(hash(isl.s, f.slot, 41, 7)) * NAMES.length);
    while (used.has(k)) k = (k + 1) % NAMES.length;
    used.add(k);
    f.name = NAMES[k];
  }
  return out;
}

/** How they're named when they speak: "Elder Marin", "Guard Finn", "Fisher Coral", or just the name. */
export function titleOf(f) {
  return f.role === "elder" ? `Elder ${f.name}` : f.role === "guard" ? `Guard ${f.name}` : f.role === "fisher" ? `Fisher ${f.name}` : f.name;
}

/** Whether a slot's person, gone, comes back now: at once if never seen dead, else the next day after. */
export function comesBack(deadDay, today) {
  return deadDay === undefined || today > deadDay;
}

// ---- what they say. `{town}` is the town's name. First meetings, then the rest picked at random, never the same line
// twice running; night lines join in at night, rod lines when the player holds a fishing rod.
export const LINES = Object.freeze({
  elder: {
    first: [
      "Welcome to {town}, dry-lander. Few find us, and fewer come in peace. Take this, a token of the sea's friendship.",
    ],
    any: [
      "Our people raised {town} when the sky was young. Every dome holds a family.",
      "Our cousins in the deep caves forgot the old songs. They bite first and never talk. We are not like them.",
      "The gold on our domes came up on our lines, a nugget at a time. Fishing is patience.",
      "We lit the causeway so no one walks home in the dark.",
      "They say a dry-lander named Jack makes portals of sea stone. Clever. None of them opens here, and we like it that way.",
      "The seat is for the Elder, but you may look at it. Gold, from the bottom of the sea.",
      "When the sea gives, we share. When it doesn't, we wait. It always gives again.",
      "The islands of this sky are many. Ours is the only one with a wall.",
    ],
    night: ["The lanterns keep the night small. Rest well, dry-lander.", "At night the town sleeps and the sea talks. Listen."],
    rod: ["You carry a rod. Then you are already one of us, a little."],
  },
  guard: {
    first: ["Welcome to {town}, traveller. The gate is open to friends, and you look like a friend."],
    any: [
      "Nothing comes through this gate but friends and the tide.",
      "I've stood this post for years. The best part is the sunset over the sea.",
      "Our cousins in the caves? We don't speak of them. They chose the dark.",
      "Mind the edge of the causeway. The water is deep under it.",
      "The Elder sits in the palace, past the lagoon. Go and say hello.",
      "No portal opens on {town}. You found us the hard way. Well done.",
      "If you see a boat on the sea, wave. It's probably my cousin.",
    ],
    night: ["Quiet night. Just the waves and the lanterns.", "The lanterns burn till morning. You're safe here."],
    rod: ["The fishers are on the piers in the lagoon, if you want company."],
  },
  fisher: {
    first: ["A dry-lander with sea legs! Here, have one from today's catch."],
    any: [
      "Down in your world, fish bite sooner in the rain, as long as there's open sky over you.",
      "A Lure book makes the fish come sooner. A Spoon on your rod does the same.",
      "Luck of the Sea brings up more treasure. So does a Spinnerbait, if you have a Tackle Box.",
      "An Artificial Worm does a little of both: sooner bites, better catches.",
      "Every island fishes different. Crystal islands bring up amethyst, the gold ones bring up the Nether's bits, the willow ones bring up shards.",
      "Off {town} we pull up prismarine, gold nuggets, nautilus shells. A conduit, once in a long while.",
      "Be patient. The sea pays those who wait.",
      "The lagoon is calm, but the big ones are out past the wall.",
      "Never fish under a roof. The fish can tell.",
    ],
    night: ["The fish don't sleep, so neither do I. Not much, anyway."],
    rod: ["Nice rod! Cast off the end of my pier. There's room for two."],
    gift: ["Take one from today's catch.", "Here, it's fresh. Well, it was."],
  },
  resident: {
    first: ["Oh! A dry-lander! Welcome to {town}. Mind the flowers."],
    any: [
      "Have you seen the palace? The Elder sits in the gold seat when there's news.",
      "The sailboats go out past the wall for the big fish. The little ones stay in the lagoon.",
      "We sing to the fish. They don't sing back. Yet.",
      "The beach is the best place to watch the sun go down.",
      "Ever been to the willow islands? Lovely. Too many trees for me, though.",
      "Our cousins in the caves aren't like us. If you meet them, run.",
      "My house is small, but it has a dome. Everyone in {town} has a dome.",
      "The sea lanterns in the lagoon were my grandmother's idea.",
      "Gold is lucky, they say. We have a lot of luck.",
    ],
    night: ["It's late. I'm going home. The lanterns will light your way.", "Goodnight, dry-lander."],
    rod: ["Going fishing? Ask the fishers on the piers. They know every fish by name."],
  },
});
/** What they say when hurt (to whoever did it). */
export const HURT = Object.freeze(["Ow! What was that for?", "Hey! We're friendly here!", "Please stop. We mean you no harm.", "That hurt!"]);
/** What the nearest says when a player comes into town, once a day: the first time, then the days after. */
export const GREET_FIRST = "A dry-lander! Welcome to {town}.";
export const GREET = Object.freeze(["Welcome back to {town}!", "Good day, dry-lander. Back in {town} again?", "Ah, our dry-lander friend. Welcome back."]);

/**
 * A line for `f` to say: { text, key } (key: which line, to keep from saying it twice running). ctx: { town, first,
 * night, rod, last }; `random` gives 0 to 1. A first meeting gets the first-meeting line.
 */
export function lineFor(f, ctx, random) {
  const L = LINES[f.role];
  const fill = (s) => s.split("{town}").join(ctx.town);
  if (ctx.first) return { text: fill(L.first[0]), key: "first" };
  const pool = [...L.any.map((s, i) => [`any${i}`, s])];
  if (ctx.night) pool.push(...L.night.map((s, i) => [`night${i}`, s]), ...L.night.map((s, i) => [`night${i}`, s]));
  if (ctx.rod) pool.push(...L.rod.map((s, i) => [`rod${i}`, s]), ...L.rod.map((s, i) => [`rod${i}`, s]));
  const fresh = pool.filter(([k]) => k !== ctx.last);
  const [key, text] = fresh[Math.min(fresh.length - 1, Math.floor(random() * fresh.length))];
  return { text: fill(text), key };
}

/**
 * What `f` gives the player now, or undefined: the Elder a nautilus shell the first time they meet (a token of
 * friendship), a fisher a cooked cod or salmon (one or two) once a day. `seen`: the player's record with this town
 * (elderGift: given; fish: { slot: the day } ).
 */
export function giftFor(f, seen, day, random) {
  if (f.role === "elder" && !seen.elderGift) return { item: "minecraft:nautilus_shell", count: 1, mark: "elder" };
  if (f.role === "fisher" && seen.fish?.[f.slot] !== day) {
    return { item: random() < 0.5 ? "minecraft:cooked_cod" : "minecraft:cooked_salmon", count: random() < 0.5 ? 1 : 2, mark: "fish" };
  }
  return undefined;
}

/** The player's record with a town after `f` spoke to them on `day` with line `key`, and gave `gift` (or not). */
export function afterTalk(seen, f, day, key, gift) {
  const met = seen.met?.includes(f.slot) ? seen.met : [...(seen.met ?? []), f.slot];
  const out = { ...seen, met, last: { ...(seen.last ?? {}), [f.slot]: key } };
  if (gift?.mark === "elder") out.elderGift = true;
  if (gift?.mark === "fish") out.fish = { ...(seen.fish ?? {}), [f.slot]: day };
  return out;
}
