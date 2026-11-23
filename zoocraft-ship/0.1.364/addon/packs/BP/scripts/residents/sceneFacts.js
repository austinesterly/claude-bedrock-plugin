// The facts of the moment a resident is spoken to, for their scenes (0.1.364; residents/sceneRules.js says what they
// are). Read once as a chat or their menu opens: the resident's state, the sky, the entities within a few blocks, the
// blocks at their feet, the player's hands and armor, their park. Everything is read inside try/catch: an unloaded
// chunk or a missing component leaves that fact false and the talk goes on.
import { world, EquipmentSlot } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { residentById, GIFT_TAGS } from "../data/residents.js";
import { allResidents } from "./residents.js";
import { getHome } from "./homes.js";
import { giftTagsOf, giftKind } from "./bondRules.js";
import { dayPart } from "./chatRules.js";
import { noFacts, heldKind, itemName } from "./sceneRules.js";
import { weatherNow } from "../core/weather.js";
import { parkById, withPark } from "../park/park.js";
import { allAnimals } from "../animals/animals.js";
import { guestDemand } from "../visitors/guests.js";
import { dim, onlinePlayers } from "../platform/mc.js";

const DOING = { inside: "home", leaving: "to_zoo", visiting: "zoo", returning: "to_home", following: "follow", staying: "stay", toWork: "work", working: "work", fromWork: "work", posted: "work", patrol: "work", guiding: "work" };
const PLACE = { "minecraft:overworld": "overworld", "minecraft:nether": "nether", "minecraft:the_end": "the_end", "zoocraft:fishing": "fishing", "zoocraft:acufend": "acufend" };
const HOSTILE = new Set(["zombie", "husk", "drowned", "skeleton", "stray", "bogged", "spider", "cave_spider", "witch", "enderman", "phantom", "pillager", "vindicator", "evoker", "ravager", "slime", "magma_cube", "blaze", "ghast", "wither_skeleton", "piglin_brute", "hoglin", "zoglin", "zombie_villager_v2", "silverfish", "guardian", "breeze", "warden", "vex", "shulker", "endermite"].map((n) => `minecraft:${n}`));
const FARM = new Set(["cow", "sheep", "pig", "chicken", "mooshroom", "goat", "horse", "donkey"].map((n) => `minecraft:${n}`));
const PETS = new Set(["minecraft:wolf", "minecraft:cat", "minecraft:parrot"]);
let speciesNames;
/** @type {[string, RegExp][]} */
const BLOCKS = [
  ["water", /^minecraft:(water|flowing_water)$/],
  ["lava", /^minecraft:(lava|flowing_lava)$/],
  ["fire", /^minecraft:(campfire|soul_campfire|fire|soul_fire)$/],
  ["crops", /^minecraft:(wheat|carrots|potatoes|beetroot|farmland|melon_stem|pumpkin_stem)$/],
  ["books", /^minecraft:(bookshelf|chiseled_bookshelf|lectern)$/],
  ["snow", /^minecraft:(snow|snow_layer|powder_snow)$/],
  ["flowers", /^minecraft:(dandelion|poppy|blue_orchid|allium|azure_bluet|red_tulip|orange_tulip|white_tulip|pink_tulip|oxeye_daisy|cornflower|lily_of_the_valley|sunflower|lilac|rose_bush|peony|torchflower|pink_petals|wildflowers|cactus_flower|flowering_azalea|spore_blossom)$/],
];

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** The facts for `player` talking to the resident `rec` now. `bond` is their friendship record BEFORE this chat. */
export function sceneFacts(player, rec, bond, opts = {}) {
  const g = BALANCE.residents.scenes;
  const f = noFacts();
  const pos = rec.pos;
  const today = world.getDay();
  f.t = world.getTimeOfDay();
  f.part = dayPart(f.t, BALANCE.residents.chats);
  f.weather = weatherNow();
  f.doing = opts.working ? "work" : DOING[rec.state] ?? "other";
  f.place = PLACE[rec.dimension] ?? "overworld";
  try {
    f.moon = world.getMoonPhase();
  } catch {
    f.moon = 2;
  }
  f.daysAway = bond?.talkDay === undefined ? 0 : Math.max(0, today - bond.talkDay);
  f.firstToday = bond?.talkDay !== today;
  let d;
  try {
    d = dim(rec.dimension);
  } catch {
    return f;
  }
  // the sky over them
  try {
    const top = d.getTopmostBlock({ x: Math.floor(pos.x), z: Math.floor(pos.z) });
    const roof = top ? top.location.y - pos.y : 0;
    f.outside = roof < 3 || rec.state === "inside";
    f.deep = roof >= 10 && rec.state !== "inside";
    f.high = pos.y >= 130 && roof < 3;
  } catch {
    // unloaded: the defaults
  }
  // who stands near
  try {
    if (!speciesNames) speciesNames = new Map(Object.values(SPECIES).map((s) => [s.entityType, s.displayName]));
    let nearest = Infinity;
    for (const e of d.getEntities({ location: pos, maxDistance: g.range })) {
      const id = e.typeId;
      if (id === "minecraft:creeper") f.near.creeper = f.near.hostile = true;
      else if (HOSTILE.has(id)) f.near.hostile = true;
      else if (id === "minecraft:villager_v2" || id === "minecraft:villager") f.near.villager = true;
      else if (FARM.has(id)) f.near.farm = true;
      else if (PETS.has(id)) {
        if (e.getComponent("minecraft:tameable")?.isTamed) f.near.pet = true;
      } else if (id === "zoocraft:guest") f.near.guests++;
      else if (speciesNames.has(id)) {
        const far = flat(e.location, pos);
        if (far < nearest) {
          nearest = far;
          f.near.species = speciesNames.get(id);
        }
      }
    }
  } catch {
    // unloaded
  }
  for (const o of allResidents()) {
    if (o.id === rec.id || o.dimension !== rec.dimension || o.state === "inside" || o.state === "asleep" || !o.pos) continue;
    if (flat(o.pos, pos) > g.range || Math.abs(o.pos.y - pos.y) > 4) continue;
    f.near.residents.push(o.id);
    f.near.others.push(residentById(o.id)?.name ?? "a neighbour");
  }
  for (const p of onlinePlayers()) {
    if (p.id === player.id || p.dimension.id !== rec.dimension) continue;
    if (flat(p.location, pos) <= g.range) f.near.players.push(p.name);
  }
  // what is at their feet
  try {
    const r = g.blockRange;
    const bx = Math.floor(pos.x), by = Math.floor(pos.y), bz = Math.floor(pos.z);
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) for (let y = -1; y <= 1; y++) {
      const id = d.getBlock({ x: bx + x, y: by + y, z: bz + z })?.typeId;
      if (!id || id === "minecraft:air") continue;
      for (const [k, rx] of BLOCKS) if (!f.blocks[k] && rx.test(id)) f.blocks[k] = true;
    }
  } catch {
    // unloaded
  }
  // the player
  try {
    const eq = player.getComponent("minecraft:equippable");
    const hand = eq?.getEquipment(EquipmentSlot.Mainhand);
    if (hand) {
      const res = residentById(rec.id);
      const liked = giftKind(res, giftTagsOf(hand.typeId, GIFT_TAGS)).kind === "liked";
      f.held = { kind: heldKind(hand.typeId, liked, Boolean(hand.getComponent("minecraft:food"))), item: itemName(hand.typeId) };
    }
    f.armored = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet].every((s) => Boolean(eq?.getEquipment(s)));
    f.hurt = (player.getComponent("minecraft:health")?.currentValue ?? 20) < 8;
    f.wet = Boolean(player.isInWater);
    f.sneaking = Boolean(player.isSneaking);
  } catch {
    // a component missing: those facts stay false
  }
  // their park
  try {
    const park = parkById(getHome(rec.homeId)?.parkId ?? rec.parkId);
    if (park) {
      f.park.open = Boolean(park.open && park.entrance);
      f.park.litter = park.litter ?? 0;
      f.park.stars = park.rating?.stars;
      f.park.coins = park.balance;
      withPark(park, () => {
        f.park.guests = guestDemand();
        f.park.sick = allAnimals().some((a) => (a.criticalSeconds ?? 0) > 0);
      });
    }
  } catch {
    // no park
  }
  return f;
}

/** The names a line's tokens take: the player's, the first neighbour or other player near, the animal, the item. */
export function sceneNames(player, f) {
  return { player: player.name, other: f.near.others.length === 1 ? f.near.others[0] : f.near.players[0], species: f.near.species, item: f.held.item };
}
