// Spessartine Garnet gear in the game (0.1.235; the rules are in equipment/garnetRules.js).
import { EquipmentSlot, GameMode } from "@minecraft/server";
import { GARNET_ARMOR, eased, owedToughness, armorCounts, keptShare, protectionPoints, hitWear, mineWear, useWear, pays } from "./garnetRules.js";

const SLOTS = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];

/** Garnet armor's toughness: before a blow lands on a player wearing any, the blow is eased by what the pieces owe. */
export function garnetHurt(e) {
  const who = e.hurtEntity;
  const cause = e.damageSource.cause;
  if (who?.typeId !== "minecraft:player" || !armorCounts(cause)) return;
  const eq = who.getComponent("minecraft:equippable");
  if (!eq) return;
  const pieces = SLOTS.map((s) => eq.getEquipment(s));
  const worn = pieces.map((it) => it?.typeId);
  if (!worn.some((id) => GARNET_ARMOR.includes(id))) return;
  let points = 0;
  for (const it of pieces) {
    const en = it?.getComponent("minecraft:enchantable");
    if (!en) continue;
    const levels = {};
    for (const x of en.getEnchantments()) levels[x.type.id.replace("minecraft:", "")] = x.level;
    points += protectionPoints(levels, cause);
  }
  const resistance = (who.getEffect("resistance")?.amplifier ?? -1) + 1;
  e.damage = eased(eq.totalArmor, eq.totalToughness, owedToughness(worn), e.damage, keptShare(points, resistance));
}

/** Wear `n` off the tool in the player's hand (each point only sometimes, with Unbreaking); it breaks at the end. */
function wear(player, id, n) {
  if (!(n > 0) || player.getGameMode() === GameMode.Creative) return;
  const eq = player.getComponent("minecraft:equippable");
  const item = eq?.getEquipment(EquipmentSlot.Mainhand);
  if (!item || item.typeId !== id) return;
  const d = item.getComponent("minecraft:durability");
  if (!d) return;
  const unbreaking = item.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level ?? 0;
  let cost = 0;
  for (let i = 0; i < n; i++) if (pays(unbreaking, Math.random())) cost++;
  if (!cost) return;
  if (d.damage + cost > d.maxDurability) {
    eq.setEquipment(EquipmentSlot.Mainhand, undefined);
    player.playSound("random.break");
    return;
  }
  d.damage += cost;
  eq.setEquipment(EquipmentSlot.Mainhand, item);
}

// Tilling and stripping: the block as it was when the player used the tool on it, looked at again once it is done.
const usedOn = new Map(); // player id -> { id, x, y, z, type }

export function garnetUseBefore(e) {
  const id = e.itemStack?.typeId;
  if (id !== "zoocraft:garnet_hoe" && id !== "zoocraft:garnet_axe") return;
  const { x, y, z } = e.block.location;
  usedOn.set(e.player.id, { id, x, y, z, type: e.block.typeId });
}

export function garnetUseAfter(e) {
  const was = usedOn.get(e.player.id);
  if (!was) return;
  usedOn.delete(e.player.id);
  const { x, y, z } = e.block.location;
  if (was.x !== x || was.y !== y || was.z !== z) return;
  wear(e.player, was.id, useWear(was.id, was.type, e.block.typeId));
}

/** The custom component on every Garnet tool. */
export function garnetToolComponent() {
  return {
    onBeforeDurabilityDamage: (e) => {
      if (e.itemStack) e.durabilityDamage = Math.min(e.durabilityDamage, hitWear(e.itemStack.typeId));
    },
    onMineBlock: (e) => {
      if (e.source?.typeId === "minecraft:player" && e.itemStack) wear(e.source, e.itemStack.typeId, mineWear(e.itemStack.typeId, e.minedBlockPermutation.type.id));
    },
  };
}
