// Sulfur cubes (0.1.197, module 12; research/vanilla_plan.md "0.1.197 sulfur cube: the design"): the rules, kept apart
// from the game so the tests can run them. The game's large sulfur cube as a zoo copy (entities/zoo_sulfur_cube.json):
// the game hops it about, has it pick up a block lying near it (or take one given) and hold it inside, moving as the
// block says (the game's archetypes, on the zoo's zoocraft:sulfur_cube_archetype), and shears take it out. The zoo's
// never take TNT or a magma block. Split, not born (species.splits): the game's large cube splits into two small ones
// when it dies, and zoo animals never do. The Sulfur Cave (profile sulfur_cave): sulfur or cinnabar underfoot
// (species.sulfurFloor), counted by the exhibit measure (ex.sulfurCells).

export const BLOCK = "zoocraft:sulfur_cube_archetype"; // the copy's: which block it holds ("none": none)
export const WILD_BLOCK = "minecraft:sulfur_cube_archetype"; // the game's own sulfur cube's

// Sulfur caves' ground: sulfur and cinnabar, natural or cut (polished, bricks, chiseled). Not potent sulfur (its gas gives
// nausea), slabs, stairs, walls or spikes.
export const SULFUR_PATTERNS = [/^minecraft:(polished_|chiseled_)?(sulfur|cinnabar)(_bricks)?$/];
export function isSulfurGround(id) {
  return typeof id === "string" && SULFUR_PATTERNS.some((r) => r.test(id));
}

// The game's archetypes the zoo's take (the server's item tags minecraft:sulfur_cube_archetype_<name>, read on the test
// server), each with what the game calls it and a few of its blocks. TNT (explosive) and a magma block (hot) aren't here:
// the zoo's never take them.
export const ARCHETYPES = {
  bouncy: { ball: "a rubber ball", blocks: "planks, logs or wood" },
  regular: { ball: "a football", blocks: "dirt, grass, mud, clay, concrete powder or a coal or bone block" },
  slow_bouncy: { ball: "a slow bouncer", blocks: "stone, sulfur, cinnabar, bricks, terracotta, concrete or ore" },
  slow_flat: { ball: "a medicine ball", blocks: "a block of iron, gold, copper or netherite, or iron, gold or copper ore" },
  fast_flat: { ball: "a golf ball", blocks: "moss, coral, sponge, dried kelp, pumpkins, melons, hay or froglights" },
  light: { ball: "a beach ball", blocks: "wool" },
  fast_sliding: { ball: "a hockey puck", blocks: "packed ice, blue ice or a snow block" },
  slow_sliding: { ball: "a curling stone", blocks: "mushroom blocks, mycelium, wart blocks or a shroomlight" },
  sticky: { ball: "sticky", blocks: "a honeycomb block" },
  high_resistance: { ball: "heavy", blocks: "soul sand or soul soil" },
};

// Holding a block: any archetype but none (the property's default).
export function holdsBlock(value) {
  return typeof value === "string" && value !== "none";
}

// A small cube: the game's variant 1 (2 is the large one), or the young flag.
export function isSmallCube(variant, baby) {
  return Boolean(baby) || variant === 1;
}

// What the journal sees: one hopping about (moving at all: it hops), with no block in it.
/** @param {{ x: number, y: number, z: number }} v velocity */
export function hopping(v) {
  return Math.hypot(v.x, v.y, v.z) > 0.02;
}

export function sulfurNeeded(species, ex) {
  return Math.ceil((ex.usableArea ?? 0) * (species.sulfurFloor?.share ?? 0));
}

// Sulfur or cinnabar enough underfoot (cause "sulfur"): true until it's measured, and for everyone else.
export function hasSulfurFloor(species, ex) {
  if (!species.sulfurFloor || ex.sulfurCells === undefined) return true;
  return ex.sulfurCells >= sulfurNeeded(species, ex);
}

// ---------------- words ----------------

// A breeding check's answer: they split.
export function splitText(plural) {
  return `${plural} aren't born: in the game a large one splits into two small ones when it dies, and zoo animals never do. Catch more (a small one grows in 20 minutes, or sooner with slimeballs).`;
}

export function smallCubeText() {
  return "§eThat's a small sulfur cube: let it grow first (20 minutes, or feed it slimeballs), then catch it.";
}

export function blockHeldText(name) {
  return `§eThis ${name} is holding a block: take it out first with shears, then catch it.`;
}

// The warnings on the clipboard and the Habitat Marker.
export function cubeWarnings(ex, plural, species, T) {
  if (!species.sulfurFloor || hasSulfurFloor(species, ex)) return [];
  return [{ severity: 2, text: `${plural} want their caves' ground: sulfur or cinnabar (polished, bricks or chiseled too) under at least ${Math.round(species.sulfurFloor.share * 100)}% of the floor (${sulfurNeeded(species, ex)} of the ${ex.usableArea} blocks here; ${ex.sulfurCells ?? 0} now). Until then their comfort can't rise above ${T.floorComfortCap}. Measure again with the Habitat Marker after.` }];
}

// The Exhibit Clipboard's line.
export function cubeLines(ex, living) {
  const sp = living.find((s) => s.sulfurFloor);
  if (!sp) return [];
  if (ex.sulfurCells === undefined) return ["§fGround: §7not measured yet (use the Habitat Marker on the floor inside)"];
  const need = sulfurNeeded(sp, ex);
  return [`§fGround: §7${ex.sulfurCells} floor blocks sulfur or cinnabar, ${need} needed${ex.sulfurCells < need ? " §e(too little)§7" : ""}`];
}

// The Field Journal's care notes.
export function cubeCareLines(sp, T, profile) {
  if (!sp.splits) return [];
  const balls = Object.values(ARCHETYPES).map((a) => `${a.blocks} make one ${a.ball}`).join("; ");
  return [
    `Their Sulfur Cave: ${profile.baseArea ?? 36} blocks of floor for the first ${profile.firstGroup ?? 2} and ${profile.extraArea ?? 9} more each, ${profile.minHeight ?? 3} blocks high, with sulfur or cinnabar (polished, bricks or chiseled too) under ${Math.round((sp.sulfurFloor?.share ?? 0.5) * 100)}% of the floor or more, their caves' ground. With less their comfort stays at ${T.floorComfortCap} or below`,
    "Blocks: one picks up a block lying near it, or takes one you give it, and holds it inside. Then it stops hopping and you can kick it about, and it rolls as the block says (the game's): " + balls + ". Give it another to swap; shears take it out",
    "Never TNT or a magma block: the zoo's won't take them (in the game TNT explodes in one and a magma block burns what it touches)",
    "Food: slimeballs or slime blocks from a feeder (the game's small ones grow on slimeballs). A Water Trough as every animal",
    "Breeding: none. In the game a large one splits into two small ones when it dies, and zoo animals never do",
  ];
}

export function cubeCatchLine(sp, carrier) {
  return `Catching: with ${sp.baitText} in your inventory, use an empty ${carrier} on a large one with no block in it. A small one grows first; one holding a block keeps it (take it out with shears)`;
}
