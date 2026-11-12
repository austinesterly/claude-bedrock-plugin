// Red and blue amethyst in the game (0.1.274; the rules are fishing/amethystRules.js): budding blocks grow buds on
// random ticks, and the blocks drop what the game's amethyst drops. Their loot tables are empty and the drops come from
// here, because "needs a pickaxe", Fortune and Silk Touch can't be written in a custom block's loot table: to a player
// as they break one, and when one is blown up; set or filled away by a command, nothing (as the game's). A bud or
// cluster pops off when the block it grows from is broken or blown up (on the test server a placement filter never
// popped one, so it's done here).
import { world, system, ItemStack, GameMode, BlockPermutation, EquipmentSlot } from "@minecraft/server";
import { reportError } from "../core/log.js";
import { amethystOf, growSide, grownOn, dropsOf, silkTakesBack, growsFrom, STEP, FACE_STATE } from "./amethystRules.js";

/** The budding blocks' custom component (zoocraft:budding_amethyst): a random tick may grow a bud. */
export function buddingComponent() {
  return {
    /** @param {import("@minecraft/server").BlockComponentRandomTickEvent} e */
    onRandomTick(e) {
      const b = e.block;
      const a = amethystOf(b.typeId);
      if (a?.part !== "budding") return;
      const side = growSide(Math.random);
      if (!side) return;
      const [dx, dy, dz] = STEP[side];
      let n;
      try {
        n = b.dimension.getBlock({ x: b.location.x + dx, y: b.location.y + dy, z: b.location.z + dz });
      } catch {
        return; // that side isn't loaded
      }
      if (!n) return;
      let face;
      try {
        face = n.permutation.getState(/** @type {any} */ (FACE_STATE));
      } catch {
        face = undefined;
      }
      const next = grownOn(a.colour, side, n.typeId, face);
      if (!next) return;
      const wet = n.typeId === "minecraft:water" || n.typeId === "minecraft:flowing_water" || n.isWaterlogged;
      try {
        n.setPermutation(BlockPermutation.resolve(next, { [FACE_STATE]: side }));
        if (wet) n.setWaterlogged(true);
      } catch (error) {
        reportError("amethyst growth", error);
      }
    },
  };
}

/** The breaking player's held item, as the drop rules see it. */
function toolOf(player) {
  let creative = false;
  try {
    creative = player.getGameMode() === GameMode.Creative;
  } catch {
    creative = false;
  }
  let item;
  try {
    item = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  } catch {
    item = undefined;
  }
  let silk = false;
  let fortune = 0;
  try {
    const en = item?.getComponent("minecraft:enchantable");
    silk = (en?.getEnchantment("silk_touch")?.level ?? 0) > 0;
    fortune = en?.getEnchantment("fortune")?.level ?? 0;
  } catch {
    // no enchantments
  }
  let pickaxe = false;
  try {
    pickaxe = Boolean(item?.hasTag("minecraft:is_pickaxe"));
  } catch {
    pickaxe = false;
  }
  return { creative, pickaxe, silk, fortune };
}

function spawnDrops(dimension, at, drops) {
  for (const d of drops) {
    try {
      dimension.spawnItem(new ItemStack(d.item, d.count), { x: at.x + 0.5, y: at.y + 0.5, z: at.z + 0.5 });
    } catch (error) {
      reportError("amethyst drop", error);
    }
  }
}

/** The item the game dropped to Silk Touch where the game's amethyst drops nothing: taken back (now, or next tick). */
function takeBack(dimension, at, typeId) {
  const near = { x: at.x + 0.5, y: at.y + 0.5, z: at.z + 0.5 };
  const once = () => {
    try {
      for (const e of dimension.getEntities({ type: "minecraft:item", location: near, maxDistance: 1.5 })) {
        if (e.getComponent("minecraft:item")?.itemStack?.typeId !== typeId) continue;
        e.remove();
        return true;
      }
    } catch {
      // gone, or not loaded
    }
    return false;
  };
  if (!once()) system.run(once);
}

/**
 * The red and blue buds and clusters round a block that's gone which grew from it pop off, as the game's: broken as
 * a block is (its sound and bits), dropping what one broken by nothing held drops; one in water leaves its water.
 */
function popLoose(dimension, at) {
  for (const [face, [dx, dy, dz]] of Object.entries(STEP)) {
    const p = { x: at.x + dx, y: at.y + dy, z: at.z + dz };
    let b;
    try {
      b = dimension.getBlock(p);
    } catch {
      continue; // not loaded
    }
    if (!b || amethystOf(b.typeId)?.part !== "crystal") continue;
    let f;
    try {
      f = b.permutation.getState(/** @type {any} */ (FACE_STATE));
    } catch {
      f = undefined;
    }
    if (!growsFrom(String(f), [-dx, -dy, -dz])) continue;
    const id = b.typeId;
    const wet = b.isWaterlogged;
    try {
      dimension.runCommand(`setblock ${p.x} ${p.y} ${p.z} ${wet ? "water" : "air"} destroy`);
    } catch (error) {
      reportError("amethyst pop", error);
      continue;
    }
    spawnDrops(dimension, p, dropsOf(id, undefined, Math.random));
  }
}

/**
 * Buds and clusters pop off when the block they grow from is broken by a player or blown up; red and blue amethyst
 * blown up drops as if broken by nothing held. (A custom block's own break event comes for commands too, and
 * /setblock or /fill mustn't drop anything, so a blast is told by this event.)
 */
export function wireAmethyst() {
  world.afterEvents.playerBreakBlock.subscribe((e) => popLoose(e.dimension, e.block.location));
  world.afterEvents.blockExplode.subscribe((e) => {
    const id = e.explodedBlockPermutation.type.id;
    if (amethystOf(id)) spawnDrops(e.dimension, e.block.location, dropsOf(id, undefined, Math.random));
    popLoose(e.dimension, e.block.location);
  });
}

/** The custom component of every red and blue amethyst block (zoocraft:amethyst): its drops. */
export function amethystComponent() {
  return {
    /** @param {import("@minecraft/server").BlockComponentPlayerBreakEvent} e */
    onPlayerBreak(e) {
      if (!e.player) return;
      const id = e.brokenBlockPermutation.type.id;
      const tool = toolOf(e.player);
      if (silkTakesBack(id, tool)) takeBack(e.dimension, e.block.location, id);
      spawnDrops(e.dimension, e.block.location, dropsOf(id, tool, Math.random));
    },
  };
}
