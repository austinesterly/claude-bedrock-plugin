// Parrots in the game (0.1.188; the rules are animals/parrotRules.js, research/vanilla_plan.md "0.1.188 parrots: the
// design"). The game flies the zoo copy (its own goals and the copy's Perch to Perch one). The game's parrot dances and
// imitates by its engine, which a copy doesn't get, so every second, for each zoo parrot near a player:
// - Dancing: its aviary's jukeboxes (the measure's, ex.parrots.jukeboxSpots) are read; while one plays and the parrot is
//   within reach of it, it dances (the copy's zoocraft:dance event: its flying goals off and zoocraft:dancing on, which
//   the client draws as the game's dance), and stops when the track ends, the jukebox goes or it's out of reach. A dance
//   is music for the exhibit that park day (enrichment: animals.js).
// - Imitating: every imitateEvery ticks, one time in nearChance a parrot makes the sound of a monster within imitateRange
//   (the game's own or the zoo's copy of it, with the game's pitch and volume); with none near, one time in farChance a
//   monster's that isn't there, not on Peaceful. The Field Journal hears it a moment after (the HEARD property).
import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { dayFor } from "../park/park.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, noteMusic } from "../exhibits/exhibits.js";
import { imitationFor, farImitation, nearJukebox, JUKEBOX, HEARD } from "./parrotRules.js";
import { reportError } from "../core/log.js";

const TYPES = Object.values(SPECIES).filter((s) => s.dances).map((s) => s.entityType);
// Allays (0.1.194, species.duplicates) dance within their own reach and never imitate.
const ALLAYS = new Set(Object.values(SPECIES).filter((s) => s.duplicates).map((s) => s.entityType));
const DANCING = "zoocraft:dancing";
const reported = new Set();
let imitateAt = 0;

function tell(error) {
  const why = String(error);
  if (reported.has(why) || reported.size > 20) return;
  reported.add(why);
  reportError("parrot", error);
}

function isPlaying(d, spot) {
  try {
    const b = d.getBlock(spot);
    if (b?.typeId !== JUKEBOX) return false;
    return Boolean(b.getComponent("minecraft:record_player")?.isPlaying());
  } catch {
    return false; // not loaded
  }
}

function peaceful() {
  try {
    return String(world.getDifficulty()).toLowerCase() === "peaceful";
  } catch {
    return false;
  }
}

// Every 20 ticks: each zoo parrot near a player.
export function tickParrots(now) {
  if (!TYPES.length) return;
  const T = BALANCE.parrot;
  const imitating = now >= imitateAt;
  if (imitating) imitateAt = now + T.imitateEvery;
  const seen = new Set();
  const music = new Map(); // exhibit id -> the playing jukeboxes
  for (const player of onlinePlayers()) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, T.range, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        stepParrot(e, T, music, imitating);
      } catch (error) {
        tell(error);
      }
    }
  }
}

function stepParrot(e, T, music, imitating) {
  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  let spots = ex ? music.get(ex.id) : [];
  if (ex && !spots) {
    spots = (ex.parrots?.jukeboxSpots ?? []).filter((s) => isPlaying(e.dimension, s));
    music.set(ex.id, spots);
  }
  const allay = ALLAYS.has(e.typeId);
  const reach = allay ? { ...T, danceRadius: BALANCE.allay.danceRadius } : T;
  const dance = spots.some((s) => nearJukebox(e.location, s, reach)); // chicks too
  const dancing = e.getProperty(DANCING) === true;
  if (dance && !dancing) e.triggerEvent("zoocraft:dance");
  else if (!dance && dancing) e.triggerEvent("zoocraft:stop_dance");
  if (dance && ex) noteMusic(ex, dayFor(a));
  if (imitating && !allay) imitate(e, T);
}

function imitate(e, T) {
  const r = Math.random();
  if (r >= 1 / T.nearChance) return;
  let what;
  try {
    for (const o of e.dimension.getEntities({ location: e.location, maxDistance: T.imitateRange })) {
      if (o.id === e.id) continue;
      what = imitationFor(o.typeId);
      if (what) break;
    }
  } catch {
    // none read
  }
  // With none near: one time in farChance (nearChance of them already rolled), a monster that isn't there.
  if (!what && Math.random() < T.nearChance / T.farChance && !peaceful()) what = farImitation(Math.random());
  if (!what) return;
  e.dimension.playSound(what.sound, e.location, { pitch: what.pitch, volume: what.volume });
  e.setDynamicProperty(HEARD, Date.now());
}
