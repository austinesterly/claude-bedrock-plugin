// Stage 2 of the rabbits' contest in the game (0.1.383; the rules are contest/tagRules.js): two minutes to catch
// rabbits on the parkour course. Enough of them and the runner qualifies for the final; too few, or leaving, and they
// are out.
import { system } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { message, onlinePlayers } from "../platform/mc.js";
import { CONTEST, SCREEN_FACE, SPOTS } from "./realmRules.js";
import { countRows } from "./raceRules.js";
import { CONTEST_RABBIT, COATS, freeSpots, caught, strayed, tagStep } from "./tagRules.js";
import { activeNow, setActive } from "./contestState.js";
import { contestDimension } from "./realm.js";

const K = () => BALANCE.contest;
const T = () => BALANCE.contest.tag;
const O = () => K().origin;
const at = (o) => ({ x: O().x + o.x, y: O().y + o.y, z: O().z + o.z });
const off = (l) => ({ x: l.x - O().x, y: l.y - O().y, z: l.z - O().z });

let game; // { id, caught, warned, horn, went, told }
/** @type {(player: any, how: string) => void} */
let onEnd = () => {};
/** @type {(d: any, rows: string[]) => void} */
let screen = () => {};
/** contest/race.js: what happens when a game ends (player, "won" | "lost" | "left"), and how the jumbotron is drawn. */
export function wireTag(ended, showScreen) {
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

function rabbits(d) {
  try {
    return d.getEntities({ type: CONTEST_RABBIT });
  } catch {
    return [];
  }
}

function clearRabbits(d) {
  for (const e of rabbits(d)) {
    try {
      e.remove();
    } catch {
      // gone
    }
  }
}

function letOut(d, spots) {
  for (const s of spots) {
    try {
      const e = d.spawnEntity(CONTEST_RABBIT, at({ x: s.x + 0.5, y: s.y, z: s.z + 0.5 }));
      e.triggerEvent(`zoocraft:coat_${Math.floor(Math.random() * COATS)}`);
    } catch (error) {
      reportError("contest rabbit", error);
    }
  }
}

function end(d, player, how) {
  game = undefined;
  setActive(undefined);
  if (d) {
    clearRabbits(d);
    screen(d, SCREEN_FACE);
  }
  onEnd(player, how);
}

/** The king starts stage 2 for a player who has qualified. */
export function startTag(player) {
  if (activeNow()) return false;
  const d = contestDimension();
  const a = SPOTS.arrive;
  try {
    player.teleport(at(a), { rotation: { x: 0, y: a.ry } });
  } catch (error) {
    reportError("contest start", error);
  }
  game = { id: player.id, caught: 0, warned: [], horn: system.currentTick + T().countdown * 20, went: false, told: false };
  setActive({ id: player.id, stage: 2 });
  if (d) {
    clearRabbits(d);
    screen(d, countRows(0));
  }
  const t = T();
  king(player, t.lines.rules.replace("{need}", String(t.need)).replace("{minutes}", String(t.seconds / 60)));
  message(player, `§7The horn blows in ${t.countdown} seconds. Run into a rabbit to catch it.`);
  return true;
}

/** Whether this player is playing tag now. */
export const tagging = (player) => game?.id === player.id;

/** Every 4 ticks. */
export function tickTag() {
  if (!game) return;
  const d = contestDimension();
  const player = onlinePlayers().find((p) => p.id === game.id);
  let here = false;
  try {
    here = Boolean(player) && player.dimension.id === CONTEST;
  } catch {
    here = false;
  }
  if (!here || !d) return end(d, player, "left");
  const t = T();
  const now = system.currentTick;
  const me = off(player.location);
  if (!game.went) {
    if (now < game.horn) return;
    game.went = true;
    play(player, "raid.horn", 1, 0.8);
    message(player, `§6§lGO! §r§f${t.rabbits} rabbits are loose. Catch ${t.need} or more.`);
    letOut(d, freeSpots(me, [], t.rabbits));
    return;
  }
  const step = tagStep(game, now - game.horn, t);
  if (step.done) {
    message(player, `§fTime! You caught §a${game.caught}§f rabbits. You needed ${t.need}.`);
    return end(d, player, step.done);
  }
  const all = rabbits(d);
  const where = [];
  let got = 0;
  for (const e of all) {
    let r;
    try {
      r = off(e.location);
    } catch {
      continue;
    }
    if (caught(me, r, t.reach)) {
      try {
        e.dimension.spawnParticle("minecraft:critical_hit_emitter", e.location);
        e.remove();
      } catch {
        // gone
      }
      got++;
      continue;
    }
    if (strayed(r)) {
      // off the field: put back on it, far from the player
      const s = freeSpots(me, where, 1)[0];
      try {
        if (s) e.teleport(at({ x: s.x + 0.5, y: s.y, z: s.z + 0.5 }));
      } catch {
        // gone
      }
      if (s) r = { x: s.x + 0.5, y: s.y, z: s.z + 0.5 };
    }
    where.push(r);
  }
  if (got) {
    game.caught += got;
    play(player, "random.pop", 1.2);
    screen(d, countRows(game.caught));
    if (game.caught >= t.need && !game.told) {
      game.told = true;
      play(player, "random.levelup", 1.2, 0.6);
      message(player, `§a${game.caught} rabbits! That is enough to qualify. §7Keep going: ${step.left} seconds left.`);
    } else message(player, `§a${game.caught} caught. §7${game.told ? "" : `You need ${t.need}. `}${step.left} seconds left.`);
  }
  if (where.length < t.rabbits) letOut(d, freeSpots(me, where, t.rabbits - where.length));
  if (step.warn !== undefined) {
    game.warned.push(step.warn);
    play(player, "note.hat", 1.4);
    message(player, `§e${step.left} seconds left!`);
  }
}

/** Bench only. */
export function tagDebug(player, what) {
  const d = contestDimension();
  if (what === "catch" && game?.went && d) {
    const e = rabbits(d)[0];
    if (e) player.teleport(e.location);
  }
  let n = -1;
  try {
    n = d ? rabbits(d).length : -1;
  } catch {
    n = -2;
  }
  return game ? { ...game, rabbits: n, left: game.went ? Math.ceil(T().seconds - (system.currentTick - game.horn) / 20) : undefined } : { rabbits: n };
}
