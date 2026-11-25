// Stage 1 of the rabbits' contest in the game (0.1.382; the rules are contest/raceRules.js). The king takes a ticket,
// the horn blows, and ten flags come up one at a time on the parkour course. Touch them all inside the time and the
// runner qualifies; run out of time, or leave, and they are out and need another ticket from Carrot.
import { system, BlockVolume } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { message, countItem, takeItem, giveItem, onlinePlayers } from "../platform/mc.js";
import { show } from "../ui/forms.js";
import { TICKET } from "../residents/contestRules.js";
import { CONTEST, SCREEN_FACE, SPOTS, screenBoxes } from "./realmRules.js";
import { FLAGS, flagCells, touches, raceStep, countRows, kingSays } from "./raceRules.js";
import { contestDimension, onKingTalk } from "./realm.js";
import { progress, activeNow, setActive } from "./contestState.js";
import { startTag, tagging, wireTag } from "./tag.js";

const K = () => BALANCE.contest;
const R = () => BALANCE.contest.race;
const O = () => K().origin;
const at = (o) => ({ x: O().x + o.x, y: O().y + o.y, z: O().z + o.z });

/** The one race under way: { id, name, i, warned, horn (the tick it blows), went } or undefined. */
let race;
let swept = false; // flags left standing by a session that ended mid-race are cleared once

const king = (player, text) => message(player, `§f${K().kingName}: §7"${text}"`);

function play(player, sound, pitch = 1, volume = 1) {
  try {
    player.playSound(sound, { pitch, volume });
  } catch {
    // none
  }
}

function setCells(d, cells, air) {
  for (const c of cells) {
    try {
      d.setBlockType(at(c), air ? "minecraft:air" : c.id);
    } catch (error) {
      reportError("contest flag", error);
    }
  }
}

function showScreen(d, rows) {
  try {
    for (const b of screenBoxes(rows)) d.fillBlocks(new BlockVolume(at({ x: b.a[0], y: b.a[1], z: b.a[2] }), at({ x: b.b[0], y: b.b[1], z: b.b[2] })), b.id);
  } catch (error) {
    reportError("contest screen", error);
  }
}

function raiseFlag(d, player, i) {
  const f = FLAGS[i];
  setCells(d, flagCells(f), false);
  message(player, `§6Flag ${i + 1} of ${FLAGS.length}: §f${f.where}.`);
}

function sparkle(d, f) {
  const p = at(f);
  try {
    for (let up = 4; up <= 14; up += 2) d.spawnParticle("minecraft:villager_happy", { x: p.x + 0.5, y: p.y + up + Math.random(), z: p.z + 0.5 });
  } catch {
    // not loaded
  }
}

/** Every flag's cells cleared and the jumbotron's face back. */
function tidy(d) {
  for (const f of FLAGS) {
    for (const c of flagCells(f)) {
      try {
        const b = d.getBlock(at(c));
        if (b && b.typeId === c.id) b.setType("minecraft:air");
      } catch {
        // not loaded
      }
    }
  }
  showScreen(d, SCREEN_FACE);
}

function end(d, player, how) {
  race = undefined;
  setActive(undefined);
  if (d) tidy(d);
  if (!player) return;
  const lines = R().lines;
  if (how === "won") {
    play(player, "random.levelup", 1);
    progress.set(player.id, 2); // 0.1.383: on to stage 2 when they tell the king they are ready
    king(player, lines.won);
  } else {
    play(player, "note.bass", 0.6);
    king(player, how === "left" ? lines.left : lines.lost);
  }
}

// Stage 2 over (contest/tag.js).
function tagEnded(player, how) {
  if (!player) return;
  const lines = K().tag.lines;
  if (how === "won") {
    play(player, "random.levelup", 1);
    king(player, lines.won);
    giveItem(player, TICKET, 1); // stage 3 is not built yet: the ticket comes back
    message(player, "§7The Rabbit King hands your ticket back.");
  } else {
    play(player, "note.bass", 0.6);
    king(player, how === "left" ? R().lines.left : lines.lost);
  }
}

function start(player) {
  if (race || activeNow()) return king(player, R().lines.kingBusy);
  if (!takeItem(player, TICKET, 1)) return king(player, K().lines.kingNoTicket);
  const d = contestDimension();
  const a = SPOTS.arrive;
  try {
    player.teleport(at(a), { rotation: { x: 0, y: a.ry } }); // the start line, inside the loaded stadium
  } catch (error) {
    reportError("contest start", error);
  }
  race = { id: player.id, name: player.name, i: 0, warned: [], horn: system.currentTick + R().countdown * 20, went: false };
  setActive({ id: player.id, stage: 1 });
  if (d) showScreen(d, countRows(0));
  const lines = R().lines;
  king(player, lines.rules.replace("{flags}", String(FLAGS.length)).replace("{seconds}", String(R().seconds)));
  message(player, `§7The horn blows in ${R().countdown} seconds. Each flag is a pole with an orange flag under a column of green sparkles.`);
}

async function enterMenu(player) {
  const r = R();
  const form = new ActionFormData()
    .title(K().kingName)
    .body(r.lines.kingEnter.replace("{flags}", String(FLAGS.length)).replace("{seconds}", String(r.seconds)))
    .button("Give him the ticket and enter")
    .button("Not yet");
  const res = await show(player, form);
  if (res?.canceled || res?.selection !== 0) return;
  if (player.dimension.id !== CONTEST) return;
  start(player);
}

async function stage2Menu(player) {
  const t = K().tag;
  const form = new ActionFormData()
    .title(K().kingName)
    .body(t.lines.kingStage2.replace("{need}", String(t.need)).replace("{minutes}", String(t.seconds / 60)))
    .button("Start stage 2")
    .button("Not yet");
  const res = await show(player, form);
  if (res?.canceled || res?.selection !== 0) return;
  if (player.dimension.id !== CONTEST || progress.get(player.id) !== 2) return;
  if (!startTag(player)) return king(player, R().lines.kingBusy);
  progress.delete(player.id);
}

/** A word with the king. */
function kingTalk(player) {
  const a = activeNow();
  const what = kingSays({ ticket: countItem(player, TICKET) > 0, racing: a?.id === player.id, busy: Boolean(a) && a.id !== player.id, next: progress.get(player.id) });
  if (what === "kingEnter") return void enterMenu(player).catch((error) => reportError("contest king", error));
  if (what === "kingStage2") return void stage2Menu(player).catch((error) => reportError("contest king", error));
  king(player, what === "kingNoTicket" ? K().lines.kingNoTicket : R().lines[what]);
}

/** Whether this player is in the race now. */
export const racing = (player) => race?.id === player.id || tagging(player) || progress.has(player.id);

/** Every 4 ticks. */
export function tickRace() {
  const d = contestDimension();
  // qualified for the next stage, and gone from the stadium: out of the contest
  for (const id of [...progress.keys()]) {
    const p = onlinePlayers().find((q) => q.id === id);
    let here = false;
    try {
      here = Boolean(p) && p.dimension.id === CONTEST;
    } catch {
      here = false;
    }
    if (here) continue;
    progress.delete(id);
    if (p) king(p, R().lines.left);
  }
  if (!race) {
    if (!swept && d) {
      // a session that ended mid-race may have left a flag up
      try {
        if (d.getBlock(at(SPOTS.king))) {
          swept = true;
          tidy(d);
        }
      } catch {
        // not loaded yet
      }
    }
    return;
  }
  const player = onlinePlayers().find((p) => p.id === race.id);
  let here = false;
  try {
    here = Boolean(player) && player.dimension.id === CONTEST;
  } catch {
    here = false;
  }
  if (!here) return end(d, player, "left");
  const now = system.currentTick;
  if (!race.went) {
    if (now < race.horn) return;
    race.went = true;
    play(player, "raid.horn", 1, 0.8);
    message(player, "§6§lGO!");
    raiseFlag(d, player, 0);
    return;
  }
  const f = FLAGS[race.i];
  const o = O();
  const l = player.location;
  const step = raceStep(race, now - race.horn, touches({ x: l.x - o.x, y: l.y - o.y, z: l.z - o.z }, f, R().reach), R());
  if (step.touched) {
    setCells(d, flagCells(f), true);
    race.i = step.i;
    play(player, "random.orb", 1 + step.i * 0.05);
    showScreen(d, countRows(step.i));
    if (step.done === "won") return end(d, player, "won");
    message(player, `§a${step.i} of ${FLAGS.length} touched. §7${step.left} seconds left.`);
    raiseFlag(d, player, step.i);
    return;
  }
  if (step.done === "lost") return end(d, player, "lost");
  if (step.warn !== undefined) {
    race.warned.push(step.warn);
    play(player, "note.hat", 1.4);
    message(player, `§e${step.left} seconds left!`);
  }
  if (now % 8 < 4) sparkle(d, f);
}

export function wireRace() {
  onKingTalk(kingTalk);
  wireTag(tagEnded, showScreen);
}

/** Bench only. */
export function raceDebug(player, what) {
  if (what === "start") start(player);
  if (what === "flag" && race?.went) {
    const f = FLAGS[race.i];
    player.teleport(at({ x: f.x + 0.5, y: f.y, z: f.z + 1.5 }));
  }
  return race ? { ...race, left: race.went ? Math.ceil(R().seconds - (system.currentTick - race.horn) / 20) : undefined } : undefined;
}
