// Damien's spells (0.1.329; the rules are residents/protectorRules.js). While he is up and about with a body (a player
// near), every half second he looks round him for the game's enemy mobs and kills them on the spot: a pale beam from his
// hand, a burst where it lands. Nothing is broken by it (no blast); the mob drops what it always drops. A zoo animal, a
// mob in an exhibit or the Mob House's pens, and a named, leashed or tamed one are left alone.
import { system } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { exhibitAt } from "../exhibits/exhibits.js";
import { message } from "../platform/mc.js";
import { allResidents, residentBody } from "./residents.js";
import { beamPoints } from "./wandRules.js";
import { spellTargets, spellSays } from "./protectorRules.js";

const RID = "zoocraft:rid"; // a zoo animal's record id (animals/animals.js)
const OFF = new Set(["asleep", "away", "posted"]); // asleep, off in the End, standing guard somewhere: no spells
let lastSay;
let struck = 0;

function mobOf(e) {
  let leashed = false;
  let tamed = false;
  let zoo = false;
  try {
    leashed = Boolean(e.getComponent("minecraft:leashable")?.isLeashed);
  } catch {
    leashed = false;
  }
  try {
    tamed = Boolean(e.getComponent("minecraft:tameable")?.isTamed);
  } catch {
    tamed = false;
  }
  try {
    zoo = e.getDynamicProperty(RID) !== undefined || exhibitAt(e.dimension.id, e.location) !== undefined;
  } catch {
    zoo = true; // can't tell: leave it be
  }
  return { e, typeId: e.typeId, pos: e.location, named: Boolean(e.nameTag), leashed, tamed, zoo };
}

function say(body, res) {
  const g = BALANCE.residents.spells;
  if (!spellSays(lastSay, system.currentTick, g)) return;
  const pool = res.lines?.spell;
  if (!pool?.length) return;
  lastSay = system.currentTick;
  const line = pool[Math.floor(Math.random() * pool.length)];
  try {
    for (const p of body.dimension.getPlayers({ location: body.location, maxDistance: g.sayRange })) message(p, `§f${res.name}: §7"${line}"`);
  } catch {
    // nobody there
  }
}

function strike(body, mob, res) {
  const d = body.dimension;
  const from = { x: body.location.x, y: body.location.y + 1.5, z: body.location.z };
  const at = mob.location;
  const to = { x: at.x, y: at.y + 0.8, z: at.z };
  try {
    for (const p of beamPoints(from, to, 0.5, 60)) d.spawnParticle("zoocraft:void_spell", p);
    d.spawnParticle("zoocraft:void_spell_burst", to);
    d.playSound("mob.evocation_illager.cast_spell", from, { volume: 0.8, pitch: 1.2 });
  } catch {
    // only for show
  }
  try {
    if (!mob.kill()) return;
  } catch {
    return;
  }
  struck++;
  say(body, res);
}

/** Every 10 ticks: each resident who casts (Damien), awake and near a player, strikes the enemies round him. */
export function tickProtector() {
  const g = BALANCE.residents.spells;
  for (const rec of allResidents()) {
    const res = residentById(rec.id);
    if (!res?.spells || OFF.has(rec.state)) continue;
    const body = residentBody(rec.id);
    if (!body) continue;
    let mobs;
    try {
      mobs = body.dimension.getEntities({ families: ["monster"], location: body.location, maxDistance: g.range + 1 });
    } catch {
      continue;
    }
    if (!mobs.length) continue;
    for (const m of spellTargets(mobs.map(mobOf), body.location, g)) strike(body, m.e, res);
  }
}

/** For the test server: how many he has struck since the world opened. */
export function protectorDebug() {
  return { struck };
}
