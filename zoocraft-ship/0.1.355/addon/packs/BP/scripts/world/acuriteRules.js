// Acurite (0.1.355). Austin (2026-11-22): "There should be a resource found on the moon only when you are in the
// right frequency, it can be called acurite ... The acufend incubator can be made by putting one torch in the middle
// of 8 acurite. Besides the incubator, acurite can also create the gradient hugh glass, it is see through like glass,
// but hard as stone." And: "the mysterious egg can only be hatched if placed into an acufend incubator."
// Pure rules: where the moon's Acurite lies (the same for a world's seed, always), what it takes the place of, the
// incubator's stages. Numbers: BALANCE.acurite.

export const ACURITE = "zoocraft:acurite";
export const ACURITE_ORE = "zoocraft:acurite_ore";
export const HUE_GLASS = "zoocraft:hue_glass";
export const INCUBATOR = "zoocraft:acufend_incubator";
export const MYSTERIOUS_EGG = "zoocraft:mysterious_egg";
export const WAS = "zoocraft:was";
export const STAGE = "zoocraft:stage";

/**
 * The moon's own rock an Acurite seam shows in, by the number its block keeps (state zoocraft:was), so the rock goes
 * back just as it was when nobody on the frequency is near. Only ever added to at the end.
 */
export const MOON_ROCK = ["minecraft:tuff", "minecraft:blackstone", "minecraft:basalt", "minecraft:smooth_basalt", "minecraft:orange_terracotta", "minecraft:purple_terracotta", "minecraft:magenta_terracotta", "minecraft:hardened_clay", "minecraft:deepslate"];
export const rockIndex = (typeId) => MOON_ROCK.indexOf(typeId);

function mix(seed, a, b, c) {
  let h = (seed ^ 0x2c1b3c6d) >>> 0;
  for (const v of [a, b, c]) {
    h = Math.imul(h ^ (v | 0), 0x85ebca6b) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
  }
  return h;
}
const unit = (seed, a, b, c) => mix(seed, a, b, c) / 4294967296;

/**
 * The Acurite of one chunk: [{ x, z, deep }] columns (deep: the block under the top one too), a seam of g.seam[0] to
 * g.seam[1] columns side by side in about g.chance of the chunks; none in the others. Kept inside the chunk.
 */
export function seamCells(seed, cx, cz, g) {
  if (unit(seed, cx, cz, 1) >= g.chance) return [];
  const n = g.seam[0] + Math.floor(unit(seed, cx, cz, 2) * (g.seam[1] - g.seam[0] + 1));
  let x = 2 + Math.floor(unit(seed, cx, cz, 3) * 12), z = 2 + Math.floor(unit(seed, cx, cz, 4) * 12);
  const cells = [], seen = new Set();
  for (let i = 0; cells.length < n && i < n * 6; i++) {
    const k = `${x},${z}`;
    if (!seen.has(k)) {
      seen.add(k);
      cells.push({ x: cx * 16 + x, z: cz * 16 + z, deep: unit(seed, cx * 16 + x, cz * 16 + z, 5) < g.deep });
    }
    const d = Math.floor(unit(seed, cx * 31 + i, cz * 17 + i, 6) * 4);
    x = Math.max(0, Math.min(15, x + [1, -1, 0, 0][d]));
    z = Math.max(0, Math.min(15, z + [0, 0, 1, -1][d]));
  }
  return cells;
}

/** The chunks whose Acurite can be within `reach` of a spot. */
export function chunksNear(x, z, reach) {
  const out = [];
  for (let cx = Math.floor((x - reach) / 16); cx <= Math.floor((x + reach) / 16); cx++) for (let cz = Math.floor((z - reach) / 16); cz <= Math.floor((z + reach) / 16); cz++) out.push([cx, cz]);
  return out;
}

/**
 * Where a column's Acurite goes, from the blocks about its ground: `typeAt(y)` the block's type there (undefined: not
 * loaded). The top block of the moon's own rock with air over it, within g.look of `ground`; and the one under it for
 * a deep column, if that is moon rock too. [] where the top is anything else (a spike, something built, a hole dug).
 */
export function seamBlocks(cell, ground, typeAt, g) {
  for (let y = ground + g.look; y >= ground - g.look; y--) {
    const t = typeAt(y);
    if (t === undefined) return [];
    if (t === "minecraft:air") continue;
    if (t === ACURITE_ORE) return [];
    if (rockIndex(t) < 0 || typeAt(y + 1) !== "minecraft:air") return [];
    const out = [{ y, was: rockIndex(t) }];
    const u = typeAt(y - 1);
    if (cell.deep && u !== undefined && rockIndex(u) >= 0) out.push({ y: y - 1, was: rockIndex(u) });
    return out;
  }
  return [];
}

// ---- the incubator: zoocraft:stage 0 empty, 1..WARM the egg warming, READY it is ready to hatch
export const WARM = 4;
export const READY = WARM + 1;
export const nextStage = (s) => (s >= 1 && s < READY ? s + 1 : s);
/** What using the incubator does: "put" (an egg in hand, it empty), "empty", "warming", "ready". */
export function useOf(stage, heldId) {
  if (stage === 0) return heldId === MYSTERIOUS_EGG ? "put" : "empty";
  return stage >= READY ? "ready" : "warming";
}
