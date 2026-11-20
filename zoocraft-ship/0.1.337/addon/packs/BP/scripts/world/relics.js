// 0.1.337: Dr. Foss's archaeology at run time (the rules: world/relicRules.js, the numbers BALANCE.relics). A find in
// natural stone broken in survival with a pickaxe or the Rock Hammer is an extra drop: the stone drops as ever. The
// Sifting Pan sifts sand and gravel; the Magnifying Glass looks over a find held in the other hand. A natural stone a
// player sets down is remembered (for the session, the last g.placedKept of them), so it never gives a find. The day's
// finds are kept on each player ("zoocraft:relic_day": "day:n"), the kinds looked over in "zoocraft:relics_seen".
import { world, GameMode, ItemStack, EquipmentSlot } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { message, later } from "../platform/mc.js";
import { isRelicStone, toolKind, rollFind, countToday, isSiftable, siftOnce, relicOf, noteSeen, examineText, SIFTING_PAN } from "./relicRules.js";
import { paidWear } from "../fishing/rodRules.js";
import { mineWear } from "../equipment/garnetRules.js";

const DAY_KEY = "zoocraft:relic_day";
const SEEN_KEY = "zoocraft:relics_seen";
const placed = new Set(); // "dim|x|y|z" of natural stone a player set down (oldest first, at most g.placedKept)
const keyOf = (dimId, p) => `${dimId}|${p.x}|${p.y}|${p.z}`;
const stats = { rolls: 0, finds: 0, sifts: 0, looks: 0 };

const survival = (player) => {
  try {
    const m = player.getGameMode();
    return m === GameMode.Survival || m === GameMode.Adventure;
  } catch {
    return false;
  }
};

/** playerPlaceBlock (after), anywhere: a natural stone a player sets down never gives a find. */
export function relicPlaced(e) {
  if (!isRelicStone(e.block?.typeId)) return;
  placed.add(keyOf(e.dimension.id, e.block.location));
  if (placed.size > BALANCE.relics.placedKept) placed.delete(placed.values().next().value);
}

function enchantLevel(item, id) {
  try {
    return item?.getComponent("minecraft:enchantable")?.getEnchantment(id)?.level ?? 0;
  } catch {
    return 0;
  }
}

/** playerBreakBlock (after), anywhere: maybe a find, dropped where the block was. */
export function relicBroken(e) {
  const typeId = e.brokenBlockPermutation?.type?.id;
  if (!isRelicStone(typeId)) return;
  const was = placed.delete(keyOf(e.dimension.id, e.block.location));
  const player = e.player;
  const item = e.itemStackBeforeBreak;
  let tags = [];
  try {
    tags = item?.getTags() ?? [];
  } catch {
    tags = [];
  }
  const day = world.getDay();
  let today = 0;
  try {
    today = countToday(player.getDynamicProperty(DAY_KEY), day);
  } catch {
    today = 0;
  }
  stats.rolls++;
  const relic = rollFind({ typeId, y: e.block.location.y, tool: toolKind(item?.typeId, tags), silk: enchantLevel(item, "silk_touch") > 0, placed: was, survival: survival(player), today }, BALANCE.relics);
  if (!relic) return;
  stats.finds++;
  try {
    player.setDynamicProperty(DAY_KEY, `${day}:${today + 1}`);
  } catch {
    // the count is only a guard
  }
  const at = { x: e.block.location.x + 0.5, y: e.block.location.y + 0.5, z: e.block.location.z + 0.5 };
  try {
    e.dimension.spawnItem(new ItemStack(relic.id, 1), at);
    e.dimension.playSound("random.orb", at, { volume: 0.7, pitch: 0.8 });
    e.dimension.spawnParticle("minecraft:villager_happy", at);
  } catch (err) {
    reportError("relicBroken", err);
    return;
  }
  message(player, `§6A find in the stone: §f${relic.name}§7. Dr. Foss would want to hear about this.`);
}

/** Wear `n` off the item `id` in the player's main hand (each point only sometimes, with Unbreaking); it breaks at the end. */
function wear(player, id, n) {
  if (!(n > 0) || !survival(player)) return;
  const eq = player.getComponent("minecraft:equippable");
  const item = eq?.getEquipment(EquipmentSlot.Mainhand);
  if (!item || item.typeId !== id) return;
  const dur = item.getComponent("minecraft:durability");
  if (!dur) return;
  const cost = paidWear(n, enchantLevel(item, "unbreaking"), Math.random);
  if (!cost) return;
  if (dur.damage + cost > dur.maxDurability) {
    eq.setEquipment(EquipmentSlot.Mainhand, undefined);
    try {
      player.playSound("random.break");
    } catch {
      // a sound only
    }
    return;
  }
  dur.damage += cost;
  eq.setEquipment(EquipmentSlot.Mainhand, item);
}

/** The Rock Hammer: it wears as a pickaxe does, a point for each block that doesn't break at a touch. */
export function rockHammerComponent() {
  return {
    onMineBlock: (e) => {
      if (e.source?.typeId === "minecraft:player" && e.itemStack) wear(e.source, e.itemStack.typeId, mineWear(e.itemStack.typeId, e.minedBlockPermutation.type.id));
    },
  };
}

/** The Sifting Pan: used on sand or gravel, sifts that block away for what was in it. A point of wear for each sift. */
export function siftingPanComponent() {
  return {
    onUseOn(e) {
      const player = e.source;
      if (!player || !isSiftable(e.block?.typeId)) return;
      const pos = { ...e.block.location };
      const d = e.block.dimension;
      later(() => {
        try {
          const b = d.getBlock(pos);
          if (!b || !isSiftable(b.typeId)) return;
          b.setType("minecraft:air");
          stats.sifts++;
          const got = siftOnce();
          const at = { x: pos.x + 0.5, y: pos.y + 0.5, z: pos.z + 0.5 };
          d.playSound("item.brush.brushing.sand.complete", at);
          if (got) d.spawnItem(new ItemStack(got, 1), at);
          const relic = relicOf(got);
          if (relic) message(player, `§6A find in the sand: §f${relic.name}§7.`);
          wear(player, SIFTING_PAN, 1);
        } catch (err) {
          reportError("siftingPan", err);
        }
      });
    },
  };
}

/** The Magnifying Glass: says what the find in the other hand is, and how many kinds this player has looked over. */
export function magnifyingGlassComponent() {
  return {
    onUse(e) {
      const player = e.source;
      if (!player) return;
      let id;
      try {
        id = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand)?.typeId;
      } catch {
        id = undefined;
      }
      let seen = [];
      try {
        seen = noteSeen(player.getDynamicProperty(SEEN_KEY), id);
        if (relicOf(id)) player.setDynamicProperty(SEEN_KEY, seen.join(","));
      } catch (err) {
        reportError("magnifyingGlass", err);
      }
      stats.looks++;
      for (const line of examineText(id, seen)) message(player, line);
    },
  };
}

/** Bench: what has happened this session. */
export function relicDebug() {
  return { ...stats, placed: placed.size };
}
