// 0.1.344: Dr. Foss's Acufend expedition in the game (the rules are residents/fossRules.js; Austin's NPC #29 spec,
// sections 9, 14 and 15). At 100 friendship he tells a player of Acufend and asks them along (ui/residentMenu.js asks;
// "Not yet" keeps the offer open). Once they've said yes he comes through the Acufend portal after them, walks where
// they walk a few blocks behind, and keeps back from the fight with Augustus Kong. With Kong beaten, the Frequency
// Friends' statue can be taken (a relic block used, or broken in creative): its blocks go, the statue item is handed
// over, and the Frequency Friends flood the great chamber. Ordinary weapons don't touch them; they never leave the
// cave. Back in the Overworld with it, Dr. Foss comes out of the portal after them: "Keep that one. You've earned
// it." The statue stands up where its owner uses it (on the top of a block, 3 by 3 by 7 of clear space), and comes
// down whole for its owner. Kept in the "fossExpedition" collection; nothing is written on the screen.
import { world, system, ItemStack, ListBlockVolume } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { log, reportError } from "../core/log.js";
import { message } from "../platform/mc.js";
import { residentById } from "../data/residents.js";
import { bondOf } from "./bonds.js";
import { bondLine } from "./bondRules.js";
import { getResident, postResident, unpostResident, movePosted, talkHeld, POST_STATE } from "./residents.js";
import { acuCave, acufendDimension } from "../world/acufend.js";
import { ACUFEND } from "../world/acufendRules.js";
import { RELIC_BLOCKS } from "../world/acufendCaveRules.js";
import { kongBeaten, kongAwake } from "../world/augustusKong.js";
import { FF_ENTITY, SEEN } from "../world/jungleVillageRules.js";
import {
  FOSS_ID, STATUE_ITEM, STATUE_GEN, AMBUSH_TAG, TALE, CLEAR, newExpedition, answerOf, onIt, withAnswer, takeWhy, withTaken, withHome,
  withPlaced, withPicked, stampOk, statueBlocks, inStatue, placeWhy, progressKey, trailAdd, companionStep, heldBack, ambushPlan,
  friendTooFar, inCave, feetIn,
} from "./fossRules.js";

const COL = "fossExpedition";
const K = () => BALANCE.fossExpedition;
const OVERWORLD = "minecraft:overworld";

/** Dr. Foss along in Acufend: { leader (player id), trail, at, yaw, walking, kong (said), beaten (seen) } */
let comp;
/** Home with the statue: { player (id), from (where they came out), spot (where he comes out), posted, start } */
let back;
/** The Frequency Friends coming for their statue: { L, plan, i, start, lastNear, said, told, stopped } */
let ambush;
/** Players on the expedition in Acufend now: id -> { since, first (where they arrived), cave (said) } */
const trips = new Map();
const lastUse = new Map();
let lastLog = -1e9;
let lastSweep = 0;

const rec = () => db.get(COL, "exp") ?? newExpedition();
const save = (r) => db.put(COL, r);
const hyp = (x, z) => Math.hypot(x, z);
const feetOf = (p) => ({ x: p.location.x, y: p.location.y, z: p.location.z });

function say(players, key) {
  const res = residentById(FOSS_ID);
  if (!res) return;
  const line = bondLine(res, key);
  for (const p of players) message(p, `§f${res.name}: §7"${line}"`);
}

function blockId(d, p) {
  try {
    return d.getBlock(p)?.typeId;
  } catch {
    return undefined;
  }
}

function puff(d, at) {
  try {
    for (const up of [-0.4, 0.3, 1]) d.spawnParticle("minecraft:mob_portal", { x: at.x, y: at.y + up, z: at.z });
  } catch {
    // nobody there to see it
  }
}

function sound(d, id, at, volume = 1) {
  try {
    d.playSound(id, at, { volume });
  } catch {
    // a sound is never worth an error
  }
}

function hand(player, stack) {
  let left = stack;
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    left = c ? c.addItem(stack) : stack;
  } catch {
    left = stack;
  }
  if (left) {
    try {
      player.dimension.spawnItem(left, player.location);
    } catch {
      return undefined; // the player has gone
    }
  }
  return Boolean(left);
}

/** This world's statue as an item, stamped with its taking. */
function statueStack(r) {
  const s = new ItemStack(STATUE_ITEM, 1);
  s.setDynamicProperty(STATUE_GEN, r.statue.gen);
  try {
    s.setLore(["§7From Acufend's great cave"]);
  } catch {
    // no lore, no matter
  }
  return s;
}

/** Whether a player carries this world's statue. */
function carries(player, r) {
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; c && i < c.size; i++) {
      const it = c.getItem(i);
      if (it?.typeId === STATUE_ITEM && stampOk(r, it.getDynamicProperty(STATUE_GEN))) return true;
    }
  } catch {
    // unreadable: not now
  }
  return false;
}

function onGround(p) {
  try {
    return p.isOnGround && !p.isFlying && !p.isGliding && !p.isSwimming;
  } catch {
    return false;
  }
}

// ---- his offer (ui/residentMenu.js asks)

/** Whether he has told this player of Acufend (his 100 friendship story). */
export function expeditionTold(player) {
  return bondOf(FOSS_ID, player.id)?.rewards?.[TALE] !== undefined;
}

/** Whether he has told them and they haven't answered yet: he asks before his menu. */
export function offerUnanswered(player) {
  return expeditionTold(player) && answerOf(rec(), player.id) === undefined;
}

/** Whether this player is on the expedition, or has finished it. */
export function expeditionAnswer(player) {
  return answerOf(rec(), player.id);
}

/** Their answer: yes, or not yet (he asks again whenever they like). */
export function answerOffer(player, yes) {
  save(withAnswer(rec(), player.id, player.name, yes, world.getDay()));
}

/** The key of what he says of the expedition when asked about it, for this player. */
export function expeditionLine(player) {
  return progressKey(rec(), player.id, Boolean(kongBeaten()));
}

// ---- Dr. Foss along in Acufend

function endCompanion() {
  comp = undefined;
  const f = getResident(FOSS_ID);
  if (f?.state === POST_STATE && f.post?.why === "expedition") unpostResident(FOSS_ID);
}

function stepCompanion(now, r, players) {
  const on = players.filter((p) => onIt(r, p.id));
  for (const p of on) if (!trips.has(p.id)) trips.set(p.id, { since: now, first: feetOf(p), cave: false });
  for (const id of [...trips.keys()]) if (!on.some((p) => p.id === id)) trips.delete(id);
  if (!on.length) {
    if (comp) endCompanion();
    return;
  }
  const g = K().companion;
  let leader = comp && on.find((p) => p.id === comp.leader);
  if (!leader) leader = [...on].sort((a, b) => (trips.get(a.id)?.since ?? 0) - (trips.get(b.id)?.since ?? 0))[0];
  const trip = trips.get(leader.id);
  const L = acuCave();
  // "we're close": the first time on a trip they near the statue
  if (L && trip && !trip.cave && hyp(leader.location.x - L.statue.x, leader.location.z - L.statue.z) < K().caveLine) {
    trip.cave = true;
    if (comp) say(on, "expCave");
  }
  const foss = getResident(FOSS_ID);
  if (!foss) return; // no Dr. Foss in this world (no home): the expedition goes on without him
  if (!comp) {
    if (now - trip.since < g.arriveTicks) return; // he comes through after them
    if (foss.state === POST_STATE && foss.post?.why !== "expedition" && foss.post?.why !== "back") return; // posted for something else
    if (!postResident(FOSS_ID, ACUFEND, trip.first, "expedition")) return;
    comp = { leader: leader.id, trail: [], at: { ...trip.first }, yaw: 0, walking: false, kong: false, beaten: Boolean(kongBeaten()) };
    back = undefined;
    say(on, "expArrive");
  }
  if (foss.state !== POST_STATE || foss.dimension !== ACUFEND) {
    comp = undefined; // sent off some other way: he comes back next tick
    return;
  }
  if (comp.leader !== leader.id) {
    comp.leader = leader.id;
    comp.trail = [];
  }
  if (onGround(leader)) comp.trail = trailAdd(comp.trail, feetOf(leader), g);
  const beaten = Boolean(kongBeaten());
  if (kongAwake() && !comp.kong) {
    comp.kong = true;
    say(on, "expKong");
  }
  if (beaten && !comp.beaten) {
    comp.beaten = true;
    say(on, "expKongBeaten");
  }
  if (talkHeld(FOSS_ID)) return; // standing for someone's menu
  const hold = (p) => !beaten && Boolean(L) && heldBack(p, L.statue, g);
  const step = companionStep(comp.at, comp.trail, feetOf(leader), hold, g);
  comp.trail = step.trail;
  const moved = Math.abs(step.pos.x - comp.at.x) + Math.abs(step.pos.y - comp.at.y) + Math.abs(step.pos.z - comp.at.z) > 1e-4;
  const turned = Math.abs(((step.yaw - comp.yaw + 540) % 360) - 180) > 8;
  if (moved || turned || step.walking !== comp.walking) {
    const d = acufendDimension();
    if (step.jump && d) puff(d, comp.at);
    movePosted(FOSS_ID, step.pos, step.yaw, step.walking);
    if (step.jump && d) puff(d, step.pos);
    comp.at = { ...step.pos };
    comp.yaw = step.yaw;
    comp.walking = step.walking;
  }
}

// Home with the statue: he comes out of the portal after them, says so, stands by them a while, then goes home.
// Where he comes out beside a player still standing where they came out (in the portal): open ground two steps off,
// in front of them first, never in the portal itself
function besideSpot(p, from) {
  let a0 = 0;
  try {
    const v = p.getViewDirection();
    a0 = Math.atan2(v.z, v.x);
  } catch {
    // facing east
  }
  const d = p.dimension;
  const open = (id) => id === "minecraft:air" || id === "minecraft:light_block" || CLEAR.has(id);
  for (let i = 0; i < 8; i++) {
    const a = a0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 4);
    const x = Math.floor(from.x + Math.cos(a) * 2), z = Math.floor(from.z + Math.sin(a) * 2);
    for (let y = Math.floor(from.y) + 1; y >= Math.floor(from.y) - 2; y--) {
      const under = blockId(d, { x, y: y - 1, z });
      if (open(blockId(d, { x, y, z })) && open(blockId(d, { x, y: y + 1, z })) && under && !open(under) && !/water|lava|portal/.test(under)) return { x: x + 0.5, y, z: z + 0.5 };
    }
  }
  return from;
}

function stepBack(now) {
  const b = back;
  if (!b) return;
  const p = world.getAllPlayers().find((x) => x.id === b.player);
  const g = K().back;
  if (!b.posted) {
    if (!p || p.dimension.id !== b.d) {
      back = undefined;
      return;
    }
    const d = hyp(p.location.x - b.from.x, p.location.z - b.from.z);
    if (!b.spot && d >= 1.5 && onGround(p)) b.spot = feetOf(p);
    if (d < 3 && now - b.start < 100) return;
    const spot = b.spot ?? besideSpot(p, b.from);
    if (!postResident(FOSS_ID, b.d, spot, "back")) {
      back = undefined;
      return;
    }
    b.posted = now;
    b.at = { ...spot };
    say([p], "expHome");
    return;
  }
  const f = getResident(FOSS_ID);
  const far = !p || p.dimension.id !== b.d || hyp(p.location.x - b.at.x, p.location.z - b.at.z) > g.leave;
  if (far || now - b.posted > g.ticks || f?.state !== POST_STATE || f.post?.why !== "back") {
    back = undefined;
    if (f?.state === POST_STATE && f.post?.why === "back") unpostResident(FOSS_ID);
    return;
  }
  if (!talkHeld(FOSS_ID) && now % 10 === 0) movePosted(FOSS_ID, b.at, (Math.atan2(-(p.location.x - b.at.x), p.location.z - b.at.z) * 180) / Math.PI, false);
}

/** The statue is in the Overworld for the first time, with this player: the expedition is done. */
function homeComing(player, now, placed = false) {
  const r = rec();
  if (r.home) return;
  save(withHome(r, player.id, player.name, world.getDay()));
  log(`foss: the statue is home with ${player.name}`);
  comp = undefined;
  const f = getResident(FOSS_ID);
  if (!f || placed) {
    if (f) say([player], "expHome"); // (put up before he came back with them: the word from him all the same)
    return;
  }
  back = { player: player.id, d: player.dimension.id, from: feetOf(player), spot: undefined, posted: 0, start: now };
}

// ---- the statue in the cave: taken once Kong is beaten

const TAKE_WHY = {
  stranger: "§7The statue hums under your hand, but it won't move for you. Dr. Foss would know what it is.",
  guarded: "§7Augustus Kong guards the statue. Nobody takes it while he stands.",
  gone: "§7The statue won't move.",
};

function takeStatue(player, d, L) {
  const r = rec();
  const why = takeWhy(r, player.id, Boolean(kongBeaten()));
  if (why !== "ok") {
    message(player, TAKE_WHY[why]);
    return false;
  }
  d.fillBlocks(new ListBlockVolume(statueBlocks(L.statue).map(({ x, y, z }) => ({ x, y, z }))), "minecraft:air", { blockFilter: { includeTypes: RELIC_BLOCKS } });
  const next = withTaken(r, player.id, player.name, world.getDay());
  save(next);
  const dropped = hand(player, statueStack(next));
  const top = { x: L.statue.x + 0.5, y: L.statue.y + 3, z: L.statue.z + 0.5 };
  puff(d, top);
  sound(d, "random.orb", top, 1);
  sound(d, "mob.warden.heartbeat", top, 2);
  message(player, `§7You lift the statue. It is lighter than it looks, and it hums, louder and louder.${dropped ? " §8(at your feet: your inventory is full)" : ""}`);
  log(`foss: ${player.name} took the statue`);
  const on = d.getPlayers().filter((p) => onIt(next, p.id) || p.id === player.id);
  if (getResident(FOSS_ID)?.post?.why === "expedition") say(on, "expTaken");
  startAmbush(L);
  return true;
}

async function askTake(player, d, L) {
  const r = rec();
  const why = takeWhy(r, player.id, Boolean(kongBeaten()));
  if (why !== "ok") {
    message(player, TAKE_WHY[why]);
    return;
  }
  const a = await show(player, new MessageFormData().title("The Frequency Friends' statue").body("Gold and emerald, as tall as a tree, humming under your hand.\n\nTake it? Its people won't let it go quietly.").button1("Take it").button2("Leave it"));
  if (a?.selection !== 0) return;
  if (!player.isValid || player.dimension.id !== ACUFEND) return;
  takeStatue(player, d, L);
}

// ---- the Frequency Friends come for it

function startAmbush(L) {
  const now = system.currentTick;
  ambush = { L, plan: ambushPlan(L, K().ambush, Math.random), i: 0, start: now + K().ambush.delay, lastNear: now, said: false, told: new Set(), stopped: false };
}

function endAmbush() {
  ambush = undefined;
  const d = acufendDimension();
  if (!d) return;
  try {
    for (const e of d.getEntities({ type: FF_ENTITY, tags: [AMBUSH_TAG] })) {
      puff(d, e.location);
      e.remove();
    }
  } catch {
    // gone with the land
  }
}

function spawnFriend(d, s) {
  const x = Math.floor(s.x), z = Math.floor(s.z);
  const top = Math.floor(s.y) + 3;
  try {
    if (!d.isChunkLoaded({ x, y: top, z })) return false;
  } catch {
    return false;
  }
  const ids = [];
  for (let y = top; y >= top - 12; y--) ids.push(blockId(d, { x, y, z }));
  const y = feetIn(ids, top);
  if (y === undefined) return false;
  const at = { x: s.x, y, z: s.z };
  const e = d.spawnEntity(FF_ENTITY, at);
  e.addTag(AMBUSH_TAG);
  e.setProperty(SEEN, true); // drawn for everyone: in their own home they are at full frequency
  e.triggerEvent("zoocraft:ambush");
  puff(d, at);
  sound(d, "mob.endermen.portal", at, 0.6);
  return true;
}

function stepAmbush(now) {
  const d = acufendDimension();
  if (!d) return;
  const a = ambush;
  if (!a) {
    // left over from before a restart: they go (nothing of an ambush is kept)
    if (now - lastSweep >= 200) {
      lastSweep = now;
      if (d.getPlayers().length) for (const e of d.getEntities({ type: FF_ENTITY, tags: [AMBUSH_TAG] })) e.remove();
    }
    return;
  }
  const g = K().ambush;
  while (a.i < a.plan.length && now >= a.start + a.plan[a.i].at) {
    try {
      spawnFriend(d, a.plan[a.i]);
    } catch {
      // that one doesn't come
    }
    a.i++;
  }
  const players = d.getPlayers();
  if (a.i > 0 && !a.said) {
    a.said = true;
    const near = players.filter((p) => inCave(a.L, p.location, g.near));
    sound(d, "mob.warden.heartbeat", { x: a.L.statue.x + 0.5, y: a.L.statue.y + 3, z: a.L.statue.z + 0.5 }, 3);
    if (getResident(FOSS_ID)?.post?.why === "expedition") say(near, "expAmbush");
    else for (const p of near) message(p, "§dFrequency Friends pour out of the passages, humming furiously. Ordinary weapons can't touch them: get out of the cave!");
  }
  if (now % 10) return;
  if (players.some((p) => inCave(a.L, p.location, g.near))) a.lastNear = now;
  for (const e of d.getEntities({ type: FF_ENTITY, tags: [AMBUSH_TAG] })) {
    if (!friendTooFar(a.L, e.location, g)) continue;
    // they never leave the cave
    puff(d, e.location);
    e.remove();
    if (!a.stopped) {
      a.stopped = true;
      for (const p of players) if (hyp(p.location.x - a.L.mouth.x, p.location.z - a.L.mouth.z) < 64) message(p, "§dThe Frequency Friends stop at the mouth of the cave and hum after you, low and angry.");
    }
  }
  if (now - a.lastNear > g.forget) endAmbush();
}

/** A player hit one of them: a word, once an ambush (ordinary weapons don't touch them: the spec's immunity is kept). */
function friendHit(player, target) {
  if (!ambush || ambush.told.has(player.id)) return;
  ambush.told.add(player.id);
  message(player, "§7Your blow passes straight through it. Ordinary weapons can't touch the Frequency Friends. Run!");
}

/** A player using one of them (main.js asks first): true if it was one come for the statue. */
export function ambushInteract(player, target) {
  if (target?.typeId !== FF_ENTITY || !target.hasTag(AMBUSH_TAG)) return false;
  message(player, "§dThe Frequency Friend shrieks a high, angry note and reaches for the statue.");
  return true;
}

// ---- the statue at home: stood up where its owner uses it, taken down whole by them

const PLACE_WHY = {
  face: "§7Stand the statue on the ground: use it on the top of a block.",
  acufend: "§7Not here. In Acufend its people would only take it back. Carry it home first.",
  stamp: "§7This statue doesn't hum. Only the one from Acufend's great cave will stand.",
  room: "§7The statue needs clear space 3 wide, 3 deep and 7 tall on top of the block you use it on.",
};

function placeStatue(player, block, face) {
  const r = rec();
  const d = block.dimension;
  const c = player.getComponent("minecraft:inventory")?.container;
  const slot = player.selectedSlotIndex;
  const it = c?.getItem(slot);
  if (!c || it?.typeId !== STATUE_ITEM) return "gone";
  const base = { x: block.location.x, y: block.location.y + 1, z: block.location.z };
  const why = placeWhy({ face, inAcufend: d.id === ACUFEND, stampOk: stampOk(r, it.getDynamicProperty(STATUE_GEN)), base, idAt: (p) => blockId(d, p) });
  if (why !== "ok") {
    message(player, PLACE_WHY[why]);
    return why;
  }
  const blocks = statueBlocks(base);
  const present = [...new Set(blocks.map((b) => blockId(d, b)))].filter((id) => CLEAR.has(id));
  for (const type of RELIC_BLOCKS) {
    const cells = blocks.filter((b) => b.block === type).map(({ x, y, z }) => ({ x, y, z }));
    if (cells.length) d.fillBlocks(new ListBlockVolume(cells), type, { blockFilter: { includeTypes: present } });
  }
  c.setItem(slot, undefined);
  const next = withPlaced(r, { d: d.id, ...base }, player.id, player.name);
  save(next);
  const mid = { x: base.x + 0.5, y: base.y + 3, z: base.z + 0.5 };
  puff(d, mid);
  sound(d, "random.anvil_land", mid, 0.6);
  log(`foss: ${player.name} stood the statue up at ${d.id} ${base.x} ${base.y} ${base.z}`);
  if (!r.home && d.id === OVERWORLD) homeComing(player, system.currentTick, true);
  return "ok";
}

function pickUp(player, by) {
  const r = rec();
  const s = r.statue;
  if (s?.state !== "placed") return false;
  const d = world.getDimension(s.d);
  d.fillBlocks(new ListBlockVolume(statueBlocks(s).map(({ x, y, z }) => ({ x, y, z }))), "minecraft:air", { blockFilter: { includeTypes: RELIC_BLOCKS } });
  const next = withPicked(r, player.id, player.name, world.getDay());
  save(next);
  const dropped = hand(player, statueStack(next));
  puff(d, { x: s.x + 0.5, y: s.y + 3, z: s.z + 0.5 });
  sound(d, "random.pop", { x: s.x + 0.5, y: s.y + 1, z: s.z + 0.5 }, 1);
  message(player, `§7The statue comes down in one piece${by === "break" ? "" : " into your hands"}. Use it on the top of a block to stand it up again.${dropped ? " §8(at your feet: your inventory is full)" : ""}`);
  return true;
}

async function askPickUp(player) {
  const s = rec().statue;
  if (s?.state !== "placed") return;
  if (s.byId !== player.id) {
    message(player, `§7This statue is ${s.by ?? "someone else"}'s. Only they can move it.`);
    return;
  }
  const a = await show(player, new MessageFormData().title("The Frequency Friends' statue").body("Take the statue down? It comes down in one piece, and stands up again wherever you use it.").button1("Take it down").button2("Leave it"));
  if (a?.selection !== 0 || !player.isValid) return;
  if (rec().statue?.state === "placed" && rec().statue.byId === player.id) pickUp(player, "ask");
}

/** One of the statue's blocks used: in the cave, taking it; where it stands, taking it down. */
function relicUsed(player, block) {
  const r = rec();
  const d = block.dimension;
  const at = block.location;
  const s = r.statue;
  if (s?.state === "placed" && s.d === d.id && inStatue(s, at)) return askPickUp(player);
  if (d.id !== ACUFEND || s?.state !== "cave") return;
  const L = acuCave();
  if (L && inStatue(L.statue, at)) return askTake(player, d, L);
}

/** One of the statue's blocks broken (in creative): taken as a whole, or put back. */
function relicBroken(player, d, at, perm) {
  const r = rec();
  const s = r.statue;
  if (s?.state === "placed" && s.d === d.id && inStatue(s, at)) {
    pickUp(player, "break");
    return;
  }
  const L = d.id === ACUFEND ? acuCave() : undefined;
  if (!L || !inStatue(L.statue, at) || s?.state !== "cave") return;
  if (takeStatue(player, d, L)) return;
  try {
    d.getBlock(at)?.setPermutation(perm); // not theirs to take: it is whole again
  } catch {
    // unloaded
  }
}

/** The relic blocks' custom component (zoocraft:relic): the statue's, in the cave or at home. */
export function relicComponent() {
  return {
    /** @param {import("@minecraft/server").BlockComponentPlayerInteractEvent} e */
    onPlayerInteract(e) {
      const player = e.player;
      const block = e.block;
      if (!player || !block) return;
      const now = system.currentTick;
      if (now - (lastUse.get(player.id) ?? -100) < 10) return; // a held button asks once
      lastUse.set(player.id, now);
      system.run(() => {
        try {
          if (block.isValid) relicUsed(player, block);
        } catch (error) {
          reportError("foss statue", error);
        }
      });
    },
  };
}

/** The statue item's custom component (zoocraft:frequency_statue): used on the top of a block, it stands there. */
export function statueItemComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseOnEvent} e */
    onUseOn(e) {
      const player = /** @type {import("@minecraft/server").Player} */ (e.source);
      const block = e.block;
      const face = String(e.blockFace);
      if (!player || !block || player.typeId !== "minecraft:player") return;
      const now = system.currentTick;
      if (now - (lastUse.get(player.id) ?? -100) < 10) return;
      lastUse.set(player.id, now);
      system.run(() => {
        try {
          if (block.isValid) placeStatue(player, block, face);
        } catch (error) {
          reportError("foss statue", error);
        }
      });
    },
  };
}

// ---- every tick

/** Every second: the statue home with someone, and Dr. Foss where he should be after a restart. */
function reconcile(now, r) {
  if (r.statue?.state === "carried" && !r.home) {
    for (const p of world.getAllPlayers()) {
      try {
        if (p.dimension.id === OVERWORLD && carries(p, r)) {
          homeComing(p, now);
          break;
        }
      } catch {
        // gone
      }
    }
  }
  const f = getResident(FOSS_ID);
  if (f?.state === POST_STATE && f.post?.why === "expedition" && !comp) unpostResident(FOSS_ID); // nobody on it in Acufend now
  if (f?.state === POST_STATE && f.post?.why === "back" && !back) unpostResident(FOSS_ID);
}

export function tickFossExpedition(now) {
  try {
    const r = rec();
    const d = acufendDimension();
    const players = d ? d.getPlayers() : [];
    if (players.length || comp) stepCompanion(now, r, players);
    stepBack(now);
    stepAmbush(now);
    if (now % 20 === 9) reconcile(now, r);
  } catch (error) {
    if (now - lastLog > 600) log(`foss expedition: ${error}`);
    lastLog = now;
  }
}

export function wireExpedition() {
  world.afterEvents.playerDimensionChange.subscribe((e) => {
    try {
      if (e.fromDimension.id !== ACUFEND || e.toDimension.id === ACUFEND) return;
      const r = rec();
      const p = e.player;
      if (r.statue?.state === "carried" && !r.home && e.toDimension.id === OVERWORLD && carries(p, r)) {
        homeComing(p, system.currentTick);
        return;
      }
      // back without it: a word from him, if he was along with them
      if (comp?.leader === p.id && onIt(r, p.id)) {
        system.runTimeout(() => say([p], "expBack"), 40);
      }
    } catch (error) {
      reportError("foss expedition", error);
    }
  });
  world.afterEvents.entityHitEntity.subscribe(
    (e) => {
      try {
        if (e.damagingEntity?.typeId === "minecraft:player" && e.hitEntity.hasTag(AMBUSH_TAG)) friendHit(e.damagingEntity, e.hitEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: ["minecraft:player"] },
  );
  world.afterEvents.playerBreakBlock.subscribe((e) => {
    const perm = e.brokenBlockPermutation;
    if (!RELIC_BLOCKS.includes(perm.type.id)) return;
    const at = e.block.location;
    const d = e.dimension;
    const player = e.player;
    system.run(() => {
      try {
        relicBroken(player, d, at, perm);
      } catch (error) {
        reportError("foss statue", error);
      }
    });
  });
  world.afterEvents.playerLeave.subscribe((e) => {
    lastUse.delete(e.playerId);
    trips.delete(e.playerId);
  });
}

// ---- for testing

/** /zoocraft:fossreset: the expedition as if never begun (answers forgotten; a standing statue comes down; the cave's is put back where it is loaded). */
export function resetExpedition() {
  const r = rec();
  const s = r.statue;
  let note = "";
  if (s?.state === "placed") {
    try {
      world.getDimension(s.d).fillBlocks(new ListBlockVolume(statueBlocks(s).map(({ x, y, z }) => ({ x, y, z }))), "minecraft:air", { blockFilter: { includeTypes: RELIC_BLOCKS } });
    } catch {
      note = " The standing statue was out of reach: break it in creative.";
    }
  }
  endAmbush();
  comp = undefined;
  back = undefined;
  const f = getResident(FOSS_ID);
  if (f?.state === POST_STATE && (f.post?.why === "expedition" || f.post?.why === "back")) unpostResident(FOSS_ID);
  db.put(COL, newExpedition());
  const L = acuCave();
  const d = acufendDimension();
  if (L && d && s?.state !== "cave") {
    try {
      for (const type of RELIC_BLOCKS) {
        const cells = statueBlocks(L.statue).filter((b) => b.block === type).map(({ x, y, z }) => ({ x, y, z }));
        d.fillBlocks(new ListBlockVolume(cells), type, { blockFilter: { includeTypes: ["minecraft:air"] } });
      }
    } catch {
      note += " The cave's statue is out of reach: stand near it in Acufend and run this again.";
    }
  }
  return `The expedition is as it was before anyone set out.${note}`;
}

/** For the test server. */
export function expeditionDebug() {
  const r = rec();
  const f = getResident(FOSS_ID);
  return {
    players: r.players, statue: r.statue, home: r.home ?? null,
    foss: f ? { state: f.state, why: f.post?.why ?? null, d: f.dimension, pos: f.pos } : null,
    comp: comp ? { leader: comp.leader, trail: comp.trail.length, at: comp.at, walking: comp.walking, kong: comp.kong, beaten: comp.beaten } : null,
    back: back ? { player: back.player, posted: back.posted, spot: back.spot ?? null } : null,
    ambush: ambush ? { i: ambush.i, of: ambush.plan.length, start: ambush.start, lastNear: ambush.lastNear, stopped: ambush.stopped } : null,
    trips: [...trips.entries()].map(([id, t]) => ({ id, since: t.since, cave: t.cave })),
  };
}

/** Bench only: a player takes the statue without the question (a simulated player can't answer a form). */
export function benchTake(player) {
  const L = acuCave();
  const d = acufendDimension();
  return L && d ? takeStatue(player, d, L) : false;
}

/** Bench only: the statue stood up on a block, by a player holding it in their selected slot. */
export function benchPlace(player, block) {
  return placeStatue(player, block, "Up");
}

/** Bench only: taken down by its owner without the question. */
export function benchPickUp(player) {
  const s = rec().statue;
  return s?.state === "placed" && s.byId === player.id ? pickUp(player, "ask") : false;
}

/** /zoocraft:fossstatue: the runner on the expedition with the statue in hand, as if just taken (the cave's goes, where it is loaded). */
export function giveTestStatue(player) {
  let r = rec();
  if (r.statue?.state === "placed") return "The statue stands somewhere already: take it down first (use it).";
  r = withAnswer(r, player.id, player.name, true, world.getDay());
  if (r.statue?.state === "cave") {
    const L = acuCave();
    const d = acufendDimension();
    try {
      if (L && d) d.fillBlocks(new ListBlockVolume(statueBlocks(L.statue).map(({ x, y, z }) => ({ x, y, z }))), "minecraft:air", { blockFilter: { includeTypes: RELIC_BLOCKS } });
    } catch {
      // out of reach: it stands on in the cave, and won't move (the world's statue is the one in hand)
    }
  }
  r = withTaken(r, player.id, player.name, world.getDay());
  save(r);
  hand(player, statueStack(r));
  return "You have the Frequency Friends' statue. In the Overworld, use it on the top of a block to stand it up.";
}
