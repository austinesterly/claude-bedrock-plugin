// The StreamerPro and the Stream Reviewer in the game (0.1.368; rules equipment/streamerRules.js). Both are items
// used from the hand, anywhere. The StreamerPro's menu goes live or ends the stream (0.1.369: no photos or clips).
// While live, every beat counts what is round the streamer, and chat tells them how it is going: nothing is written
// on the screen. Zoo Coins go to the streamer's park. Channels are in "channels", keyed by player id.
import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { reportError } from "../core/log.js";
import { runLater, parkOf, withPark } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { message, onlinePlayers } from "../platform/mc.js";
import { show } from "../ui/forms.js";
import { animalFromEntity } from "../animals/animals.js";
import { isDangerous, isDenned } from "../animals/predators.js";
import { isInsideCells } from "../exhibits/exhibits.js";
import { residentBody } from "../residents/residents.js";
import { newChannel, newStream, streamBeat, withStream, liveLine, endLines, reviewText, count } from "./streamerRules.js";

const COL = "channels";
const G = () => BALANCE.streamer;
const BOSSES = new Set(["minecraft:ender_dragon", "minecraft:wither", "minecraft:warden", "minecraft:elder_guardian", "zoocraft:augustus_kong"]);

/** Live now: player id -> { stream, health, said (beats since chat), unpaid } */
const live = new Map();

const channelOf = (id) => db.get(COL, id) ?? newChannel(id);

function healthOf(player) {
  try {
    return player.getComponent("minecraft:health")?.currentValue ?? 20;
  } catch {
    return 20;
  }
}

const pretty = (typeId) => typeId.replace(/^[a-z_]+:/, "").replace(/_/g, " ");

/** What is round the player now: the facts the score is made of, and the names of what is in view. */
function look(player, before) {
  const g = G();
  const f = { animals: 0, dangerous: 0, inExhibit: false, hostiles: 0, boss: false, hurt: false, low: false, far: false, riding: false, host: false };
  const seen = [];
  try {
    const at = player.location;
    const cell = { x: Math.floor(at.x), y: Math.floor(at.y), z: Math.floor(at.z) };
    const mode = String(player.getGameMode()).toLowerCase();
    const atRisk = mode === "survival" || mode === "adventure"; // in creative nothing in an exhibit is a danger
    for (const e of player.dimension.getEntities({ location: at, maxDistance: g.range, excludeTypes: ["minecraft:player", "minecraft:item"] })) {
      if (BOSSES.has(e.typeId)) {
        f.boss = true;
        seen.push(pretty(e.typeId));
        continue;
      }
      const a = animalFromEntity(e);
      if (a) {
        const species = SPECIES[a.speciesId];
        f.animals++;
        seen.push(species?.displayName ?? pretty(e.typeId));
        if (isDangerous(species) && !a.juvenile && a.location?.kind === "exhibit" && !isDenned(a.id)) {
          f.dangerous++;
          if (atRisk && isInsideCells(a.location.id, cell, ["land", "water"])) f.inExhibit = true;
        }
        continue;
      }
      if (e.matches({ families: ["monster"] })) {
        f.hostiles++;
        seen.push(pretty(e.typeId));
      }
    }
    const hp = healthOf(player);
    f.hurt = before !== undefined && hp < before;
    f.low = hp <= g.lowHealth;
    f.far = player.dimension.id !== "minecraft:overworld";
    f.riding = Boolean(player.getComponent("minecraft:riding")?.entityRidingOn);
    const host = residentBody("austin");
    f.host = Boolean(host && host.dimension.id === player.dimension.id && Math.hypot(host.location.x - at.x, host.location.z - at.z) <= g.range);
    if (f.host) seen.push("Austin");
  } catch {
    // unloaded: a quiet beat
  }
  return { facts: f, seen };
}

function pay(player, v) {
  if (v.unpaid <= 0) return;
  const coins = v.unpaid;
  v.unpaid = 0;
  try {
    const park = parkOf(player);
    if (park) withPark(park, () => earn(coins, "StreamerPro: stream income", newId("stream")));
  } catch (error) {
    reportError("stream pay", error);
  }
}

function goLive(player) {
  if (live.has(player.id)) return;
  live.set(player.id, { stream: newStream(world.getDay()), health: healthOf(player), said: 0, unpaid: 0, last: system.currentTick });
  message(player, "§c● LIVE §fYou are streaming. Viewers come for danger and excitement; a quiet stream loses them. Use the StreamerPro again to end it.");
}

function endStream(player, why) {
  const v = live.get(player.id);
  if (!v) return;
  live.delete(player.id);
  pay(player, v);
  const g = G();
  const ch = withStream(channelOf(player.id), v.stream, g, world.getDay());
  db.put(COL, ch);
  if (why) message(player, `§7${why}`);
  for (const line of endLines(v.stream, ch, g)) message(player, line);
}

function beat(player, v) {
  const g = G();
  const ch = channelOf(player.id);
  const { facts } = look(player, v.health);
  v.health = healthOf(player);
  const b = streamBeat(v.stream, facts, ch.followers ?? 0, g);
  v.stream = b.stream;
  v.unpaid += b.pay;
  const hadGoal = (ch.best ?? 0) >= g.goal;
  const next = { ...ch, followers: (ch.followers ?? 0) + b.gained, best: Math.max(ch.best ?? 0, b.stream.peak) };
  if (!hadGoal && next.best >= g.goal) {
    next.goal = world.getDay();
    message(player, `§6ONE MILLION people are watching you live! You did it. Austin is going to lose his mind.`);
  }
  db.put(COL, next);
  if (b.tip) message(player, `§d${b.tip.from} donated ${count(b.tip.coins)} Zoo Coins: §f"${b.tip.words}"`);
  v.said++;
  if (v.said >= g.sayBeats) {
    v.said = 0;
    pay(player, v);
    message(player, liveLine(v.stream, b.score, b.why));
  }
}

/** Every second. */
export function tickStreams() {
  if (!live.size) return;
  const now = system.currentTick;
  const g = G();
  const here = new Map(onlinePlayers().map((p) => [p.id, p]));
  for (const [id, v] of [...live]) {
    const player = here.get(id);
    if (!player) {
      // gone from the world: the stream is over, kept on their channel
      live.delete(id);
      db.put(COL, withStream(channelOf(id), v.stream, g, world.getDay()));
      continue;
    }
    if (healthOf(player) <= 0) {
      endStream(player, "The stream cut out.");
      continue;
    }
    if (now - v.last < g.beatTicks) continue;
    v.last = now;
    try {
      beat(player, v);
    } catch (error) {
      reportError("stream beat", error);
    }
  }
}

async function streamerMenu(player) {
  const on = live.has(player.id);
  const ch = channelOf(player.id);
  const v = live.get(player.id);
  const body = on ? `§c● LIVE §f${count(v.stream.viewers)} watching\n§7${count(v.stream.earned)} Zoo Coins and ${count(v.stream.gained)} new followers so far.` : `§fFollowers: §a${count(ch.followers ?? 0)}\n§7Go live and the more people watch, the more Zoo Coins your park earns. They tune in for danger and excitement.`;
  const form = new ActionFormData().title("StreamerPro").body(body).button(on ? "End stream" : "Go live").button("Close");
  const a = await show(player, form);
  if (!a || a.selection !== 0 || !player.isValid) return;
  if (on) endStream(player);
  else goLive(player);
}

async function reviewerMenu(player) {
  await show(player, new ActionFormData().title("Stream Reviewer").body(reviewText(channelOf(player.id), G())).button("Close"));
}

const used = (open, what) => ({
  /** @param {import("@minecraft/server").ItemComponentUseEvent} e */
  onUse(e) {
    const player = e.source;
    if (!player) return;
    runLater(() => {
      if (player.isValid) open(player).catch((error) => reportError(what, error));
    });
  },
});
export const streamerComponent = () => used(streamerMenu, "streamerpro");
export const reviewerComponent = () => used(reviewerMenu, "stream reviewer");

/** For the test server. */
export function streamerDebug(player) {
  const v = live.get(player.id);
  return { live: v ? { ...v.stream, unpaid: v.unpaid } : undefined, channel: channelOf(player.id), facts: look(player, undefined) };
}
export function streamerTry(player, what, n) {
  if (what === "live") goLive(player);
  else if (what === "end") endStream(player);
  else if (what === "followers") db.put(COL, { ...channelOf(player.id), followers: n });
  else if (what === "beats") {
    const v = live.get(player.id);
    for (let i = 0; v && i < n; i++) beat(player, v);
  }
}
