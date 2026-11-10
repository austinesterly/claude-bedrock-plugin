// The woodlot's and the field's work on the world (0.1.225, stage D of Austin's residents spec: research/npc_spec_plan.md
// section 8), each read again from the world just before it changes anything. work.js workTask calls these once it
// has checked the site works, was measured a moment ago, the worker stands on its floor and can do the task, and the
// work chest is there. The only blocks they change:
// - cutTree: a tree that grew from a sapling here, read whole again (workRules.js treeAt), only its own logs, into the
//   chest first; then its stump replanted from the chest's saplings.
// - plantSapling: a sapling from the chest into bare soil on the floor, with nothing growing near.
// - harvestCrop: a ripe crop, what it gives into the chest first, then the same crop back to a seedling.
// - sowCrop: a seed from the chest into bare farmland.
// gatherItem picks up a sapling, stick or apple lying on the floor into the chest; it changes no block.
// research (0.1.244) is a study at a composter in reach: it changes no block either; with enough plant waste in the
// chest (g.wasteCost) it takes that and puts bone meal there instead.
// Each returns { ok: true, act, item, count, planted? } or { ok: false, why: "gone" | "skill" | "full" | "supplies" }.

import { world, ItemStack } from "@minecraft/server";
import { treeAt, pickSapling, roomFor, roomForAll, reachesBeside, reachesTree, isRipe, harvestDrops, seedIn, GATHER, PLANT_SOILS, SAPLING_LOG } from "./workRules.js";
import { reaches, isStation, wastePick, mealFor } from "./workRules.js";

const AIR = "minecraft:air";

/** A chest's slots as workRules.js reads them. */
export function slotsOf(container) {
  const out = [];
  for (let i = 0; i < container.size; i++) {
    const it = container.getItem(i);
    out.push(it ? { typeId: it.typeId, amount: it.amount, max: it.maxAmount } : undefined);
  }
  return out;
}

// Take n of an item out of a chest (it has them: counted first).
function take(container, typeId, n) {
  let left = n;
  for (let i = 0; i < container.size && left > 0; i++) {
    const it = container.getItem(i);
    if (!it || it.typeId !== typeId) continue;
    const k = Math.min(left, it.amount);
    left -= k;
    if (k >= it.amount) container.setItem(i, undefined);
    else {
      it.amount -= k;
      container.setItem(i, it);
    }
  }
  return left === 0;
}

function sound(d, id, p) {
  try {
    d.playSound(id, { x: p.x + 0.5, y: p.y + 0.5, z: p.z + 0.5 });
  } catch {
    // unloaded
  }
}

/** A grown tree beside the worker, whole: its logs into the chest, then its stump replanted from the chest. */
export function cutTree(ctx, task, skill, g) {
  const { d, container, typeAt, leafAt, box } = ctx;
  if (!reachesTree(task.stand, task.pos, g.cutReach ?? 1)) return { ok: false, why: "gone" };
  const t = treeAt(task.pos, typeAt, leafAt, box, g);
  // Only a tree that grew from a sapling seen here (ctx.tracked: where the woodlot saw them, or they were planted).
  if (!t.ok || !t.foot.some((f) => ctx.tracked.has(`${f.x},${f.y},${f.z}`))) return { ok: false, why: "gone" };
  if (t.big && skill < 2) return { ok: false, why: "skill" };
  if (!roomForAll(slotsOf(container), [{ typeId: t.type, count: t.logs.length }])) return { ok: false, why: "full" };
  for (let left = t.logs.length; left > 0; left -= 64) {
    if (container.addItem(new ItemStack(t.type, Math.min(64, left)))) return { ok: false, why: "full" };
  }
  for (const p of t.logs) d.getBlock(p)?.setType(AIR);
  sound(d, "dig.wood", task.pos);
  // The stump: four of its own saplings for a four-trunk tree, else one, from the chest; none there, it stays bare.
  const planted = [];
  const pick = pickSapling(slotsOf(container), t.sapling, t.big);
  if (pick) {
    const spots = pick.n === 4 ? t.foot : [t.foot[0]];
    if (spots.every((p) => typeAt(p.x, p.y, p.z) === AIR && PLANT_SOILS.has(typeAt(p.x, p.y - 1, p.z) ?? "")) && take(container, pick.item, spots.length)) {
      for (const p of spots) {
        d.getBlock(p)?.setType(pick.item);
        planted.push({ x: p.x, y: p.y, z: p.z, typeId: pick.item });
      }
    }
  }
  return { ok: true, act: "cut", item: t.type, count: t.logs.length, planted, foot: t.foot };
}

/** A sapling from the chest into bare soil beside the worker, with no trunk or sapling within g.spacing of it. */
export function plantSapling(ctx, task, skill, g) {
  const { d, container, typeAt } = ctx;
  const p = task.pos;
  if (!reachesBeside(task.stand, p) || !ctx.cells.has(`${p.x},${p.y},${p.z}`)) return { ok: false, why: "gone" };
  if (typeAt(p.x, p.y, p.z) !== AIR || typeAt(p.x, p.y + 1, p.z) !== AIR || !PLANT_SOILS.has(typeAt(p.x, p.y - 1, p.z) ?? "")) return { ok: false, why: "gone" };
  for (let dx = -g.spacing; dx <= g.spacing; dx++) for (let dz = -g.spacing; dz <= g.spacing; dz++) if (/_log$|_sapling$/.test(typeAt(p.x + dx, p.y, p.z + dz) ?? "")) return { ok: false, why: "gone" };
  const pick = pickSapling(slotsOf(container), undefined, false);
  if (!pick) return { ok: false, why: "supplies" };
  if (!take(container, pick.item, 1)) return { ok: false, why: "supplies" };
  d.getBlock(p)?.setType(pick.item);
  sound(d, "dig.grass", p);
  return { ok: true, act: "plant", item: pick.item, count: 1, planted: [{ x: p.x, y: p.y, z: p.z, typeId: pick.item }] };
}

/** A sapling, stick or apple lying on the woodlot's floor where the worker stands, into the chest. Changes no block. */
export function gatherItem(ctx, task) {
  const { container, cells } = ctx;
  let e;
  try {
    e = world.getEntity(task.entityId);
  } catch {
    e = undefined;
  }
  if (!e?.isValid) return { ok: false, why: "gone" };
  const stack = e.getComponent("minecraft:item")?.itemStack;
  if (!stack || !GATHER.has(stack.typeId)) return { ok: false, why: "gone" };
  const b = { x: Math.floor(e.location.x), y: Math.floor(e.location.y), z: Math.floor(e.location.z) };
  if (!cells.has(`${b.x},${b.y},${b.z}`) || !reachesBeside(task.stand, b)) return { ok: false, why: "gone" };
  if (!roomFor(slotsOf(container), stack.typeId, stack.amount)) return { ok: false, why: "full" };
  if (container.addItem(stack)) return { ok: false, why: "full" };
  e.remove();
  return { ok: true, act: "gather", item: stack.typeId, count: stack.amount };
}

/** A ripe crop beside the worker: what it gives into the chest, then the crop back to a seedling (replanted). */
export function harvestCrop(ctx, task, skill, g, random = Math.random) {
  const { d, container } = ctx;
  if (!reachesBeside(task.stand, task.pos)) return { ok: false, why: "gone" };
  const b = d.getBlock(task.pos);
  if (!b || !isRipe(b.typeId, b.permutation.getState("growth"))) return { ok: false, why: "gone" };
  const drops = harvestDrops(b.typeId, skill >= 2 ? g.expertBonus ?? 0 : 0, random);
  if (!roomForAll(slotsOf(container), drops)) return { ok: false, why: "full" };
  for (const it of drops) if (container.addItem(new ItemStack(it.typeId, it.count))) return { ok: false, why: "full" };
  b.setPermutation(b.permutation.withState("growth", 0));
  sound(d, "dig.grass", task.pos);
  return { ok: true, act: "harvest", item: drops[0]?.typeId, count: drops[0]?.count ?? 0 };
}

/** A seed from the chest into bare farmland beside the worker. */
export function sowCrop(ctx, task) {
  const { d, container, typeAt } = ctx;
  const p = task.pos;
  if (!reachesBeside(task.stand, p) || typeAt(p.x, p.y, p.z) !== AIR || typeAt(p.x, p.y - 1, p.z) !== "minecraft:farmland") return { ok: false, why: "gone" };
  const s = seedIn(slotsOf(container));
  if (!s || !take(container, s.item, 1)) return { ok: false, why: "supplies" };
  d.getBlock(p)?.setType(s.crop);
  sound(d, "dig.grass", p);
  return { ok: true, act: "sow", item: s.crop, count: 1 };
}

/**
 * A study at a composter in reach of the worker (0.1.244, the environmental researcher). With g.wasteCost of plant
 * waste in the chest and room for the bone meal, the waste is taken and the bone meal put there (act "compost");
 * otherwise it is a study alone (act "research"). The composter itself, and every other block, stays as it is.
 */
export function research(ctx, task, skill, g) {
  const { d, container, typeAt } = ctx;
  const p = task.pos;
  if (!reaches(task.stand, p) || !isStation(typeAt(p.x, p.y, p.z))) return { ok: false, why: "gone" };
  const slots = slotsOf(container);
  const pick = wastePick(slots, g.wasteCost ?? 7);
  const meal = mealFor(skill, g);
  if (pick) {
    // Room for the bone meal as the chest stands, before anything is taken (taking only makes more).
    if (roomFor(slots, "minecraft:bone_meal", meal) && pick.every((x) => take(container, x.typeId, x.n)) && !container.addItem(new ItemStack("minecraft:bone_meal", meal))) {
      sound(d, "block.composter.fill_success", p);
      return { ok: true, act: "compost", item: "minecraft:bone_meal", count: meal };
    }
  }
  sound(d, "block.composter.fill", p);
  return { ok: true, act: "research", count: 0 };
}

export const ACTS = { cut: cutTree, plant: plantSapling, gather: gatherItem, harvest: harvestCrop, sow: sowCrop, research };

/** A sapling's log, for the woodlot's record of what grew. */
export const logOf = (sapling) => SAPLING_LOG[sapling];
