// Goo in buckets and cauldrons (0.1.237; rules in world/gooRules.js). Austin: "Let's also allow the vanilla bucket to
// pick up goo ... if you dip the leather gauntlets in a cauldron of goo, you get sticky gauntlets." Goo is a block that
// can't be aimed at, so an empty bucket scoops the goo it points at the way it scoops Clear Lava
// (equipment/lavaFilter.js). A Goo Bucket pours a block of goo, or fills an empty cauldron: the game's cauldron can't
// hold a liquid of ours, so it becomes a Goo Cauldron (the same shape, three dips' worth), and a plain cauldron again
// when the goo is used up.
import { system, ItemStack, GameMode, BlockPermutation } from "@minecraft/server";
import { heldItem, setHeldItem, giveItem, message } from "../platform/mc.js";
import { cellsAlong } from "../animals/glide.js";
import { runLater } from "../park/park.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { GOO, GOO_BUCKET, GOO_CAULDRON, STICKY_GAUNTLETS, afterDip, cauldronUse, scoopPick } from "../world/gooRules.js";

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function offset(pos, face) {
  const f = String(face).toLowerCase();
  const d = { up: [0, 1, 0], down: [0, -1, 0], north: [0, 0, -1], south: [0, 0, 1], west: [-1, 0, 0], east: [1, 0, 0] }[f] ?? [0, 1, 0];
  return { x: pos.x + d[0], y: pos.y + d[1], z: pos.z + d[2] };
}

const mid = (pos) => ({ x: pos.x + 0.5, y: pos.y + 0.5, z: pos.z + 0.5 });
function sound(dimension, id, pos) {
  try {
    dimension.playSound(id, mid(pos));
  } catch {
    // only for show
  }
}

/** One bucket of the stack in hand becomes `typeId` (in creative the bucket stays and the new one is added). */
function swapOne(player, stack, typeId) {
  if (creative(player)) return giveItem(player, typeId, 1);
  if (stack.amount > 1) {
    stack.amount -= 1;
    setHeldItem(player, stack);
    giveItem(player, typeId, 1);
  } else setHeldItem(player, new ItemStack(typeId, 1));
}

function cauldron(level) {
  return BlockPermutation.resolve(GOO_CAULDRON, { "zoocraft:level": level });
}

/** An empty plain cauldron (no water, lava, snow or potion in it). */
function emptyCauldron(block) {
  if (block?.typeId !== "minecraft:cauldron") return false;
  try {
    return (block.permutation.getState("fill_level") ?? 0) === 0;
  } catch {
    return false;
  }
}

// --- An empty bucket scoops up the goo it's pointed at ---
const lastScoop = new Map();
const through = (id) => id !== GOO && PASSABLE_PATTERNS.some((r) => r.test(id));
/**
 * The click arrives as a plain use (nothing solid in reach behind the goo) or as a use on the block behind it; both
 * come here (main.js). The goo taken is the first on the player's line of sight, through air and plants; a player
 * standing in goo with none in sight takes the goo around their legs.
 */
export function scoopGoo(player) {
  const last = lastScoop.get(player.id) ?? -100;
  if (system.currentTick - last < 5) return true; // one scoop per click (use and use-on both arrive)
  const d = player.dimension;
  const cells = cellsAlong(player.getHeadLocation(), player.getViewDirection(), 6);
  const ids = [];
  let own;
  try {
    for (const c of cells) {
      const b = d.getBlock(c);
      if (!b) break;
      ids.push(b.isAir ? "" : b.typeId);
    }
    const feet = player.location;
    for (const dy of [1, 0]) {
      const c = { x: Math.floor(feet.x), y: Math.floor(feet.y) + dy, z: Math.floor(feet.z) };
      if (!own && d.getBlock(c)?.typeId === GOO) own = c;
    }
  } catch {
    return false;
  }
  const i = scoopPick(ids, through, own ? ids.length : -1);
  if (i < 0) return false;
  const c = i < ids.length ? cells[i] : own;
  lastScoop.set(player.id, system.currentTick);
  runLater(() => {
    const stack = heldItem(player);
    if (stack?.typeId !== "minecraft:bucket" || d.getBlock(c)?.typeId !== GOO) return;
    d.getBlock(c)?.setType("minecraft:air");
    swapOne(player, stack, GOO_BUCKET);
    sound(d, "bucket.fill_water", c);
  });
  return true;
}

// --- Goo Bucket: pour a block of goo, or fill an empty cauldron ---
// The game's cauldron takes the click before the bucket's own onUseOn is asked (measured), so filling one goes by the
// interact event (main.js), and pouring by onUseOn.
const lastFill = new Map();
export function gooIntoCauldron(player, block, stack) {
  if (stack?.typeId !== GOO_BUCKET || !emptyCauldron(block)) return false;
  const last = lastFill.get(player.id) ?? -100;
  if (system.currentTick - last < 5) return true;
  lastFill.set(player.id, system.currentTick);
  const dimension = block.dimension;
  const pos = block.location;
  runLater(() => {
    const b = dimension.getBlock(pos);
    if (!emptyCauldron(b) || heldItem(player)?.typeId !== GOO_BUCKET) return;
    b.setPermutation(cauldron(3));
    sound(dimension, "cauldron.fillwater", pos);
    if (!creative(player)) setHeldItem(player, new ItemStack("minecraft:bucket", 1));
  });
  return true;
}

export function gooBucketComponent() {
  return {
    onUseOn(e) {
      const player = e.source;
      const dimension = e.block.dimension;
      if (e.block.typeId === GOO_CAULDRON || e.block.typeId === "minecraft:cauldron") return; // cauldrons: above and below
      const pos = offset(e.block.location, e.blockFace);
      runLater(() => {
        const b = dimension.getBlock(pos);
        if (!b || heldItem(player)?.typeId !== GOO_BUCKET) return;
        if (!b.isAir) return message(player, "§eThere's no room for the goo there.");
        b.setType(GOO);
        sound(dimension, "bucket.empty_water", pos);
        if (!creative(player)) setHeldItem(player, new ItemStack("minecraft:bucket", 1));
      });
    },
  };
}

// --- Goo Cauldron: dip Leather Gauntlets, take the goo back out, or top it up ---
export function gooCauldronComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      const block = e.block;
      if (!player) return;
      const stack = heldItem(player);
      const level = block.permutation.getState("zoocraft:level") ?? 3;
      const use = cauldronUse(stack?.typeId, level);
      const d = block.dimension;
      const pos = block.location;
      if (use === "dip") {
        setHeldItem(player, new ItemStack(STICKY_GAUNTLETS, 1));
        const left = afterDip(level);
        if (left > 0) block.setPermutation(cauldron(left));
        else block.setType("minecraft:cauldron");
        sound(d, "cauldron.takewater", pos);
        try {
          d.spawnParticle("zoocraft:goo_bubble", { x: pos.x + 0.5, y: pos.y + 1.05, z: pos.z + 0.5 });
        } catch {
          // only for show
        }
        return message(player, "§bSticky Gauntlets. §fWear them in your off hand. Click a wall to hold on to it, click a block higher up to climb, jump to hop off and sneak to let go. §7They never wear out.");
      }
      if (use === "scoop") {
        block.setType("minecraft:cauldron");
        swapOne(player, stack, GOO_BUCKET);
        return sound(d, "bucket.fill_water", pos);
      }
      if (use === "fill") {
        block.setPermutation(cauldron(3));
        if (!creative(player)) setHeldItem(player, new ItemStack("minecraft:bucket", 1));
        return sound(d, "cauldron.fillwater", pos);
      }
      message(player, `§bGoo Cauldron §7(${level} of 3): §fdip Leather Gauntlets in it to make Sticky Gauntlets.`);
    },
  };
}
