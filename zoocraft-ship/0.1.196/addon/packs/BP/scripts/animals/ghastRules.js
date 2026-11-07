// Happy ghasts (0.1.196, module 12; research/vanilla_plan.md "0.1.196 happy ghast and nautilus: the design"): the rules,
// kept apart from the game so the tests can run them. The game's happy ghast as a zoo copy (entities/zoo_happy_ghast.json):
// the game floats it about and stops it still while a player stands on its back (its sensor, on the zoo's
// zoocraft:can_move). Hatched, not born (species.hatched): the game's can't be bred, they hatch from a dried ghast left in
// water. The Sky Pen (profile sky_pen) is a flyer's room, walled and roofed; the open sky is glass over half of the roof
// or more (species.skyRoof), measured with the room's air (measureSkyRoof).

export const CAN_MOVE = "zoocraft:can_move"; // the copy's: false while a player stands on its back
export const WILD_CAN_MOVE = "minecraft:can_move"; // the game's own happy ghast's
export const DRIED_GHAST = "minecraft:dried_ghast";

// What lets the sky in: any glass block or pane (stained or tinted too).
export function isGlass(id) {
  return typeof id === "string" && id.startsWith("minecraft:") && id.includes("glass");
}

export function newSkyResult() {
  return { roof: 0, glass: 0 };
}

const key = (x, y, z) => `${x},${y},${z}`;

// The roof over the pen's air: for each column's top cell of air (no air cell above it), the block over it, and whether
// it's glass. typeAt(x, y, z) gives { id } or undefined (not loaded: not counted); cells: the flight measure's air.
/**
 * @param {(x: number, y: number, z: number) => ({ id: string } | undefined)} typeAt
 * @param {Map<string, string>} cells @param {{ cellsPerYield: number }} opts @param {{ roof: number, glass: number }} out
 */
export function* measureSkyRoof(typeAt, cells, opts, out) {
  let n = 0;
  for (const k of cells.keys()) {
    if (++n % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    if (cells.has(key(x, y + 1, z))) continue;
    const id = typeAt(x, y + 1, z)?.id;
    if (id === undefined) continue;
    out.roof++;
    if (isGlass(id)) out.glass++;
  }
  return out;
}

// The open sky (cause "skyView"): glass over the share of the roof the species asks; true until it's measured, and for
// everyone else.
export function hasSkyRoof(species, ex) {
  if (!species.skyRoof || !ex.skyRoof || ex.skyRoof.roof === 0) return true;
  return ex.skyRoof.glass / ex.skyRoof.roof >= species.skyRoof.minFraction;
}

// A dried ghast on the floor of an empty exhibit, or beside it (a Sky Pen in the making): the cells of a walking measure
// and the blocks round them. typeAt(x, y, z) gives the block's id or undefined.
const AROUND = [
  [0, 0, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
];
/** @param {(x: number, y: number, z: number) => (string | undefined)} typeAt @param {Map<string, string>} cells @param {number} cellsPerYield */
export function* driedGhastOn(typeAt, cells, cellsPerYield) {
  let n = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of AROUND) {
      if ((dx || dy || dz) && cells.has(key(x + dx, y + dy, z + dz))) continue;
      if (typeAt(x + dx, y + dy, z + dz) === DRIED_GHAST) return true;
      if (++n % cellsPerYield === 0) yield;
    }
  }
  return false;
}

// What the journal sees: a happy ghast floating about (moving at all: they're slow), or held still under a player.
/** @param {{ x: number, y: number, z: number }} v velocity */
export function floating(v) {
  return Math.hypot(v.x, v.y, v.z) > 0.004;
}

// ---------------- words ----------------

const HATCH = "the game's hatch from a dried ghast block left in water (about 20 minutes) as a ghastling, which grows up in 20 minutes or with 10 snowballs";

// A breeding check's answer: they hatch.
export function hatchedText(plural) {
  return `${plural} aren't born: ${HATCH}. Hatch one, let it grow and catch it.`;
}

export function ghastlingText() {
  return "§eThat's a ghastling: let it grow first (20 minutes, or feed it 10 snowballs), then catch it.";
}

export function harnessText(name) {
  return `§eThis ${name} wears a harness: take it off first (shears, with no one riding), then catch it.`;
}

// The warnings on the clipboard and the Habitat Marker.
export function ghastWarnings(ex, plural, species, T) {
  if (!species.skyRoof || hasSkyRoof(species, ex)) return [];
  const s = ex.skyRoof;
  return [{ severity: 2, text: `${plural} like the open sky: glass over ${Math.round(species.skyRoof.minFraction * 100)}% of their pen's roof or more (now ${s.glass} of ${s.roof} blocks). Until then their comfort can't rise above ${T.skyComfortCap}.` }];
}

// The Exhibit Clipboard's lines.
export function ghastLines(ex, living) {
  const sp = living.find((s) => s.skyRoof);
  if (!sp) return [];
  const s = ex.skyRoof;
  if (!s) return ["§fSky: §7not measured yet (use the Habitat Marker on the floor inside)"];
  return [hasSkyRoof(sp, ex) ? `§fSky: §a${s.glass} of ${s.roof} roof blocks glass§7 (the open sky over them)` : `§fSky: §7${s.glass} of ${s.roof} roof blocks glass (glass over ${Math.round(sp.skyRoof.minFraction * 100)}% of the roof or more: they like the open sky)`];
}

// The Field Journal's care notes.
export function ghastCareLines(sp, T, profile) {
  if (!sp.hatched) return [];
  return [
    `Their Sky Pen: walls and a roof like every flyer's, with ${profile.minHeight ?? 12} blocks of air over the floor (they're 4 blocks across). Glass over ${Math.round(sp.skyRoof.minFraction * 100)}% of the roof or more lets them see the sky (the game's heal faster under the open sky); less keeps their comfort at ${T.skyComfortCap} or below`,
    "An empty pen: set a dried ghast on its floor and measure it with the Habitat Marker, so the zoo knows it's a Sky Pen",
    "They float about slowly and follow anyone holding a snowball. Stand on one's back and it stops still, squared up, until you get off (the game's). No harness or riders in the zoo",
    `Food: snowballs or snow blocks from a feeder (the game's ghastlings eat snowballs to grow). A Water Trough as every animal`,
    `Young: none. ${hatchedText(sp.plural ?? `${sp.displayName}s`)}`,
  ];
}

export function ghastCatchLine(sp, carrier) {
  return `Catching: never wild: ${HATCH}. With ${sp.baitText} in your inventory, use an empty ${carrier} on a grown one (take off its harness first). Let one go and it's the game's own again`;
}
