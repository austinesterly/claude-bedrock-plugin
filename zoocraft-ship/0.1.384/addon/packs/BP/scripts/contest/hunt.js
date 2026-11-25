// Stage 3 of the rabbits' contest in the game (0.1.384; the rules are contest/huntRules.js): Rabbit Hunt. Nineteen
// rabbit people and the player; a hunter picked at random every 15 seconds; whoever the hunter tags is out; the last
// one standing wins.
import { system } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { message, onlinePlayers } from "../platform/mc.js";
import { CONTEST, RABBIT_PERSON, SCREEN_FACE, SPOTS, FURS } from "./realmRules.js";
import { countRows } from "./raceRules.js";
import { OTHERS, HUNT_TAG, FUR_NAMES, startSpots, otherMove, tags, pickHunter } from "./huntRules.js";
import { activeNow, setActive } from "./contestState.js";
import { contestDimension } from "./realm.js";

const K = () => BALANCE.contest;
const H = () => BALANCE.contest.hunt;
const O = () => K().origin;
const at = (o) => ({ x: O().x + o.x, y: O().y + (o.y ?? 0), z: O().z + o.z });
const off = (l) => ({ x: l.x - O().x, y: l.y - O().y, z: l.z - O().z });
const EVERY = 2;

/** { id, others: [{ e, x, z, fur, yaw }], hunter: "player" | number | undefined, pickAt, tagFrom, horn, went } */
let hunt;
/** @type {(player: any, how: string) => void} */
let onEnd = () => {};
/** @type {(d: any, rows: string[]) => void} */
let screen = () => {};
export function wireHunt(ended, showScreen) {
  onEnd = ended;
  screen = showScreen;
}

const king = (player, text) => message(player, `§f${K().kingName}: §7"${text}"`);

function play(player, sound, pitch = 1, volume = 1) {
  try {
    player.playSound(sound, { pitch, volume });
  } catch {
    // none
  }
}

/** Any contestants left standing by an earlier game are taken off the field. */
export function clearContestants(d) {
  try {
    for (const e of d.getEntities({ type: RABBIT_PERSON, tags: [HUNT_TAG] })) e.remove();
  } catch {
    // not loaded
  }
}

function end(d, player, how) {
  hunt = undefined;
  setActive(undefined);
  if (d) {
    clearContestants(d);
    screen(d, SCREEN_FACE);
  }
  onEnd(player, how);
}

/** The king starts the final for a player who has qualified. */
export function startHunt(player) {
  if (activeNow()) return false;
  const d = contestDimension();
  if (!d) return false;
  const a = SPOTS.arrive;
  try {
    player.teleport(at(a), { rotation: { x: 0, y: a.ry } });
  } catch (error) {
    reportError("contest start", error);
  }
  clearContestants(d);
  const others = [];
  const spots = startSpots();
  for (let i = 0; i < OTHERS; i++) {
    const s = spots[i];
    const fur = i % FURS;
    try {
      const e = d.spawnEntity(RABBIT_PERSON, at({ x: s.x, y: 0, z: s.z }));
      e.addTag(HUNT_TAG);
      e.setProperty("zoocraft:fur", fur);
      others.push({ e, x: s.x, z: s.z, fur, yaw: 0 });
    } catch (error) {
      reportError("contest hunter", error);
    }
  }
  const h = H();
  hunt = { id: player.id, others, hunter: undefined, pickAt: 0, tagFrom: 0, horn: system.currentTick + h.countdown * 20, went: false };
  setActive({ id: player.id, stage: 3 });
  screen(d, countRows(others.length));
  king(player, h.lines.rules.replace("{others}", String(others.length)).replace("{every}", String(h.every)));
  message(player, `§7The horn blows in ${h.countdown} seconds. The hunter has HUNTER over their head. When it is you, chat says so: run into the others to tag them.`);
  return true;
}

export const hunting = (player) => hunt?.id === player.id;

function setHunter(d, player, who) {
  const h = H();
  const was = hunt.hunter;
  if (typeof was === "number" && hunt.others[was]) {
    try {
      hunt.others[was].e.nameTag = "";
    } catch {
      // gone
    }
  }
  hunt.hunter = who;
  hunt.pickAt = system.currentTick + h.every * 20;
  hunt.tagFrom = system.currentTick + h.grace * 20;
  play(player, "raid.horn", 1.3, 0.6);
  if (who === "player") message(player, `§c§lYOU are the hunter! §r§cRun into the others to tag them. ${h.every} seconds.`);
  else {
    const o = hunt.others[who];
    try {
      o.e.nameTag = "§c§lHUNTER";
    } catch {
      // gone
    }
    message(player, `§cThe hunter is a ${FUR_NAMES[o.fur]} rabbit. §7Keep away for ${h.every} seconds.`);
  }
}

function out(d, player, i, by) {
  const o = hunt.others[i];
  hunt.others[i] = undefined;
  try {
    d.spawnParticle("minecraft:critical_hit_emitter", { ...o.e.location, y: o.e.location.y + 1 });
    o.e.remove();
  } catch {
    // gone
  }
  const left = hunt.others.filter(Boolean).length;
  screen(d, countRows(left));
  play(player, by === "player" ? "random.orb" : "random.pop", 1);
  message(player, by === "player" ? `§aYou tagged a ${FUR_NAMES[o.fur]} rabbit! §7${left} left.` : `§7A ${FUR_NAMES[o.fur]} rabbit is tagged and out. ${left} left.`);
}

/** Every 2 ticks. */
export function tickHunt() {
  if (!hunt) return;
  const d = contestDimension();
  const player = onlinePlayers().find((p) => p.id === hunt.id);
  let here = false;
  try {
    here = Boolean(player) && player.dimension.id === CONTEST;
  } catch {
    here = false;
  }
  if (!here || !d) return end(d, player, "left");
  const h = H();
  const now = system.currentTick;
  if (!hunt.went) {
    if (now < hunt.horn) return;
    hunt.went = true;
    message(player, "§6§lGO!");
  }
  const me = off(player.location);
  const standing = () => hunt.others.map((o, i) => (o ? i : -1)).filter((i) => i >= 0);
  // a new hunter at the horn, every 15 seconds, and when the hunter is out
  if (hunt.hunter === undefined || now >= hunt.pickAt || (typeof hunt.hunter === "number" && !hunt.others[hunt.hunter])) {
    setHunter(d, player, pickHunter(["player", ...standing()], hunt.hunter));
  }
  const canTag = now >= hunt.tagFrom;
  const hunterIsPlayer = hunt.hunter === "player";
  const hunterPos = hunterIsPlayer ? me : hunt.others[hunt.hunter];
  // the others move
  for (const i of standing()) {
    const o = hunt.others[i];
    const isHunter = hunt.hunter === i;
    const prey = isHunter ? [me, ...standing().filter((j) => j !== i).map((j) => hunt.others[j])] : [];
    const m = otherMove(o, i, isHunter ? undefined : hunterPos, prey, now, h, EVERY);
    o.x = m.x;
    o.z = m.z;
    if (m.yaw !== undefined) o.yaw = m.yaw;
    try {
      o.e.setProperty("zoocraft:walking", m.moved);
      if (m.moved) o.e.teleport(at({ x: o.x, y: 0, z: o.z }), { rotation: { x: 0, y: o.yaw }, keepVelocity: false });
    } catch {
      // unloaded for a moment
    }
  }
  if (!canTag) return;
  if (hunterIsPlayer) {
    for (const i of standing()) if (tags(me, { ...hunt.others[i], y: 0 }, h.reach)) out(d, player, i, "player");
  } else {
    const hp = { ...hunt.others[hunt.hunter], y: 0 };
    if (tags(hp, me, h.reachOther)) {
      message(player, "§cTagged! The hunter got you.");
      return end(d, player, "lost");
    }
    for (const i of standing()) if (i !== hunt.hunter && tags(hp, { ...hunt.others[i], y: 0 }, h.reachOther)) out(d, player, i, "other");
    if (now % 8 < EVERY) {
      try {
        d.spawnParticle("minecraft:villager_happy", at({ x: hp.x, y: 2.4, z: hp.z }));
      } catch {
        // not loaded
      }
    }
  }
  if (standing().length === 0) return end(d, player, "won");
}

/** Bench only. */
export function huntDebug(player, what) {
  if (what === "start") startHunt(player);
  if (hunt && what === "me") {
    hunt.hunter = "player";
    hunt.pickAt = system.currentTick + 2000;
    hunt.tagFrom = 0;
  }
  if (hunt && what === "tag") {
    const o = hunt.others.find(Boolean);
    if (o) player.teleport(at({ x: o.x, y: 0, z: o.z }));
  }
  if (hunt && what === "up") player.teleport(at({ x: 18.5, y: 5, z: -3.5 }));
  return hunt ? { hunter: hunt.hunter, left: hunt.others.filter(Boolean).length, went: hunt.went, pos: hunt.others.filter(Boolean).slice(0, 4).map((o) => `${o.x.toFixed(1)},${o.z.toFixed(1)}`) } : undefined;
}
