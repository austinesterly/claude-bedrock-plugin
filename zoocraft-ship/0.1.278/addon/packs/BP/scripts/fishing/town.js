// The Shark People in the mythic towns (0.1.278), in the game; the rules are fishing/townRules.js. Every 40 ticks, for
// each town a player is on: anyone missing from their place is put there (the first time, all of them; one who died
// comes back the next day), never twice (a second one of the same place is taken away), and those at posts are turned
// back the way they face once nobody is near. A player coming into town is greeted once a day. Talking to one (the
// Talk button) gets a line in chat, never on screen (Austin, 12 Nov: no titles), and now and then a gift.
import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { message, isNight } from "../platform/mc.js";
import { FISHING, islandAt } from "./islandRules.js";
import { worldSeed, fishingDimension, islandRecord } from "./islands.js";
import { rodOf } from "./rodRules.js";
import { FOLK, ROLE_EVENT, folkSlots, townName, titleOf, comesBack, lineFor, giftFor, afterTalk, LINES, HURT, GREET, GREET_FIRST } from "./townRules.js";

const TOWNS = "sharkTowns"; // { id: the island's, dead: { slot: the day it died } }
const SEEN = "sharkFolkSeen"; // { id: "<island>|<player>", met: [slots], last: { slot: line }, elderGift, fish: { slot: day }, greeted: day }
const TOWN_P = "zoocraft:town";
const SLOT_P = "zoocraft:slot";
const NEAR = 10; // a post's person turns back to face its way only with no player this near
const SPAWNS_PER_PASS = 8;
const towns = new Map();
const hurtSaid = new Map();

/** The town on island `isl` once it's built: { isl, name, G, slots }. */
function townOf(isl) {
  if (!isl || isl.kind !== "mythic") return undefined;
  let t = towns.get(isl.id);
  if (t) return t;
  const rec = islandRecord(isl);
  if (rec?.state !== "built" || !rec.city) return undefined;
  t = { isl, name: townName(isl), G: rec.city.G, slots: folkSlots(isl, rec.city) };
  towns.set(isl.id, t);
  return t;
}

const dimId = (p) => {
  try {
    return p.dimension.id;
  } catch {
    return "";
  }
};

/** Whether the ground round x z is loaded far enough out for someone who lives there to be found if they're about. */
function loadedAround(d, x, z, r) {
  for (const [dx, dz] of [[0, 0], [-r, -r], [r, -r], [-r, r], [r, r]]) {
    if (!d.isChunkLoaded({ x: x + dx, y: 0, z: z + dz })) return false;
  }
  return true;
}

function folkOf(d, t) {
  const by = new Map();
  for (const e of d.getEntities({ type: FOLK, location: { x: t.isl.x, y: t.G, z: t.isl.z }, maxDistance: t.isl.r * 1.3 + 16 })) {
    try {
      if (e.getDynamicProperty(TOWN_P) !== t.isl.id) continue;
      const s = e.getDynamicProperty(SLOT_P);
      if (typeof s !== "number") continue;
      if (!by.has(s)) by.set(s, []);
      by.get(s).push(e);
    } catch {
      // gone
    }
  }
  return by;
}

const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

/** One pass over a town: missing people put in their places, twins taken away, posts faced. */
function tend(d, t, today) {
  const by = folkOf(d, t);
  const st = db.get(TOWNS, t.isl.id) ?? { id: t.isl.id, dead: {} };
  const players = d.getPlayers({ location: { x: t.isl.x, y: t.G, z: t.isl.z }, maxDistance: t.isl.r * 1.5 + 32 });
  let spawned = 0;
  for (const f of t.slots) {
    const list = by.get(f.slot) ?? [];
    if (list.length > 1) {
      list.sort((a, b) => dist2(a.location, f) - dist2(b.location, f));
      for (const extra of list.splice(1)) extra.remove();
    }
    const e = list[0];
    if (!e) {
      if (spawned >= SPAWNS_PER_PASS || !comesBack(st.dead?.[f.slot], today) || !loadedAround(d, f.x, f.z, 16)) continue;
      try {
        const n = d.spawnEntity(FOLK, { x: f.x, y: f.y, z: f.z }, { spawnEvent: ROLE_EVENT[f.role], initialRotation: f.yaw, initialPersistence: true });
        n.setDynamicProperty(TOWN_P, t.isl.id);
        n.setDynamicProperty(SLOT_P, f.slot);
        spawned++;
      } catch (error) {
        log(`shark town ${t.isl.id}: couldn't place ${f.role} ${f.slot}: ${error}`);
      }
      continue;
    }
    if (f.role === "resident") continue;
    // a post: back to facing its way once nobody's close (they look at whoever comes near)
    if (dist2(e.location, f) > 1.2 * 1.2 || players.some((p) => dist2(p.location, e.location) < NEAR * NEAR)) continue;
    const off = Math.abs((((e.getRotation().y - f.yaw) % 360) + 540) % 360 - 180);
    if (off > 20) e.teleport({ x: f.x, y: e.location.y, z: f.z }, { rotation: { x: 0, y: f.yaw }, keepVelocity: false });
  }
  if (spawned) log(`shark town ${t.isl.id} (${t.name}): ${spawned} townsfolk placed`);
}

function seenOf(t, player) {
  return db.get(SEEN, `${t.isl.id}|${player.id}`) ?? { id: `${t.isl.id}|${player.id}`, met: [] };
}

function say(player, f, text) {
  message(player, `§f${titleOf(f)}: §7"${text}"`);
}

/** Once a day, the townsperson nearest a player who has come inside the wall greets them. */
function greet(d, t, player, today) {
  const c = player.location;
  if (Math.hypot(c.x - t.isl.x, c.z - t.isl.z) > t.isl.r * 0.72) return;
  const seen = seenOf(t, player);
  if (seen.greeted === today) return;
  let best;
  for (const e of d.getEntities({ type: FOLK, location: c, maxDistance: 16 })) {
    const f = folkFor(t, e);
    if (f && (!best || dist2(e.location, c) < dist2(best.e.location, c))) best = { e, f };
  }
  if (!best) return;
  db.put(SEEN, { ...seen, greeted: today });
  const words = seen.greeted === undefined ? GREET_FIRST : GREET[Math.floor(Math.random() * GREET.length)];
  say(player, best.f, words.split("{town}").join(t.name));
}

/** The place `e` lives in, in its town. */
function folkFor(t, e) {
  try {
    if (e.getDynamicProperty(TOWN_P) !== t.isl.id) return undefined;
    return t.slots[/** @type {number} */ (e.getDynamicProperty(SLOT_P))];
  } catch {
    return undefined;
  }
}

function townOfEntity(e) {
  try {
    const id = e.getDynamicProperty(TOWN_P);
    if (typeof id !== "string") return undefined;
    const isl = islandAt(worldSeed(), e.location.x, e.location.z);
    return isl?.id === id ? townOf(isl) : undefined;
  } catch {
    return undefined;
  }
}

/** Every 40 ticks. */
export function tickTowns() {
  const d = fishingDimension();
  if (!d) return;
  const today = world.getDay();
  const done = new Set();
  for (const p of world.getAllPlayers()) {
    if (dimId(p) !== FISHING) continue;
    const t = townOf(islandAt(worldSeed(), p.location.x, p.location.z));
    if (!t) continue;
    if (!done.has(t.isl.id)) {
      done.add(t.isl.id);
      tend(d, t, today);
    }
    greet(d, t, p, today);
  }
}

const holdsRod = (player) => {
  try {
    const id = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)?.typeId ?? "";
    return id === "minecraft:fishing_rod" || Boolean(rodOf(id));
  } catch {
    return false;
  }
};

/** The Talk button on one of them: they turn to the player and say something; the Elder and the fishers may give. */
export function talkToFolk(player, e) {
  const t = townOfEntity(e);
  const f = t && folkFor(t, e);
  if (!f) return;
  const day = world.getDay();
  const seen = seenOf(t, player);
  const first = !seen.met.includes(f.slot);
  const line = lineFor(f, { town: t.name, first, night: isNight(), rod: holdsRod(player), last: seen.last?.[f.slot] }, Math.random);
  const gift = giftFor(f, seen, day, Math.random);
  const text = gift && !first && LINES[f.role].gift ? LINES[f.role].gift[Math.floor(Math.random() * LINES[f.role].gift.length)] : line.text;
  try {
    const dx = player.location.x - e.location.x;
    const dz = player.location.z - e.location.z;
    e.teleport(e.location, { rotation: { x: 0, y: (Math.atan2(-dx, dz) * 180) / Math.PI }, keepVelocity: false });
  } catch {
    // it moved on
  }
  say(player, f, text);
  try {
    player.playSound("mob.villager.haggle", { pitch: 0.8, volume: 0.8 });
  } catch {
    // no sound
  }
  if (gift) {
    try {
      const left = player.getComponent("minecraft:inventory")?.container?.addItem(new ItemStack(gift.item, gift.count));
      if (left) player.dimension.spawnItem(left, player.location);
    } catch (error) {
      log(`shark town: gift failed: ${error}`);
    }
  }
  db.put(SEEN, afterTalk(seen, f, day, line.key, gift));
}

/** Their deaths (so the place waits for the next day) and their words when hurt. */
export function wireTowns() {
  world.afterEvents.entityDie.subscribe(
    ({ deadEntity }) => {
      try {
        const id = deadEntity.getDynamicProperty(TOWN_P);
        const slot = deadEntity.getDynamicProperty(SLOT_P);
        if (typeof id !== "string" || typeof slot !== "number") return;
        const st = db.get(TOWNS, id) ?? { id, dead: {} };
        db.put(TOWNS, { ...st, dead: { ...(st.dead ?? {}), [slot]: world.getDay() } });
      } catch {
        // its place fills again on the next pass
      }
    },
    { entityTypes: [FOLK] },
  );
  world.afterEvents.entityHurt.subscribe(
    ({ hurtEntity, damageSource }) => {
      const p = damageSource.damagingEntity;
      if (p?.typeId !== "minecraft:player") return;
      const now = system.currentTick;
      if ((hurtSaid.get(hurtEntity.id) ?? -1e9) > now - 200) return;
      hurtSaid.set(hurtEntity.id, now);
      const t = townOfEntity(hurtEntity);
      const f = t && folkFor(t, hurtEntity);
      if (f) say(p, f, HURT[Math.floor(Math.random() * HURT.length)]);
    },
    { entityTypes: [FOLK] },
  );
}

/** For the test server: a town's people, by place. */
export function townDebug(isl) {
  const t = townOf(isl);
  const d = fishingDimension();
  if (!t || !d) return undefined;
  const by = folkOf(d, t);
  return { name: t.name, slots: t.slots.length, here: [...by.values()].reduce((n, l) => n + l.length, 0), by, t, dead: db.get(TOWNS, t.isl.id)?.dead ?? {} };
}
