import { heldItem, onlinePlayers, message } from "../platform/mc.js";
import { BLOCKS } from "../data/items.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { isAnchored } from "../equipment/rules.js";
import { getPark, parkOfRecord } from "../park/park.js";
import { RIFT, blinkSpot, landingOk, wildOffset, crossesFence } from "./riftRules.js";
import { isEndFence } from "../equipment/endFence.js";

// Rift Ferrets blink (M5 part 3, spec 5.4 "Short puzzle-route teleports"; section 10: anchors restrict
// zoo animals' teleport targets to validated positions in the assigned exhibit). Every half second,
// for the ferrets near players only: a zoo ferret whose exhibit has a charged Containment Anchor
// blinks now and then between the floor cells of the exhibit's last measurement, mostly along its
// route of Rift Tunnels (animals/riftRules.js), each landing checked again on the spot (room for its
// body, solid ground under it). Without charge, or without an anchor, it doesn't blink at all and the
// keeper is told (AC-11). No blink, zoo or wild, ever crosses an End Fence (0.1.56). A wild one blinks a few blocks away onto the end stone when someone who
// isn't sneaking and isn't holding Chorus Browse comes close, and now and then for the fun of it.
// Standing up on its hind legs to peer about is decided here too, and hiding is simply being inside
// a Rift Tunnel. What a ferret is doing goes to the client through its entity properties (rifted,
// hiding, peering) for its animations, and the Field Journal reads the same.

const RANGE = 48; // blocks from a player
const BAIT = new Set(["zoocraft:chorus_browse", "minecraft:chorus_fruit"]);
const HOLD = new Set([...BAIT, "zoocraft:stabilized_carrier", "zoocraft:stabilized_carrier_occupied"]);

const state = new Map(); // ferret entity id -> { until (blink cooldown), riftedUntil, peerUntil }
const warned = new Map(); // exhibit id -> tick of the last "no charge" message

// Every 10 ticks: the Rift Ferrets near players.
export function tickRift(now) {
  const seen = new Set();
  const players = onlinePlayers();
  for (const player of players) {
    let ferrets;
    try {
      ferrets = player.dimension.getEntities({ location: player.location, maxDistance: RANGE, families: ["rift_ferret"] });
    } catch {
      continue;
    }
    for (const f of ferrets) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      try {
        step(f, now, players);
      } catch {
        state.delete(f.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

function setProp(e, name, value) {
  if (e.getProperty(name) !== value) e.setProperty(name, value);
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) };
}

function dist3(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

// What is at a block, for landingOk: air, a passable block (a Rift Tunnel, grass), liquid or solid.
function kindAt(d, p) {
  let b;
  try {
    b = d.getBlock(p);
  } catch {
    return undefined;
  }
  if (!b) return undefined;
  if (b.isAir) return "air";
  if (b.isLiquid) return "liquid";
  if (PASSABLE_PATTERNS.some((r) => r.test(b.typeId))) return "passable";
  return "solid";
}

// Is there an End Fence (either half) at this cell?
function fenceAt(d) {
  return (c) => {
    try {
      return isEndFence(d.getBlock(c)?.typeId);
    } catch {
      return false;
    }
  };
}

function soundLanding(d, c) {
  return landingOk(kindAt(d, c), kindAt(d, { x: c.x, y: c.y + 1, z: c.z }), kindAt(d, { x: c.x, y: c.y - 1, z: c.z }));
}

function step(ferret, now, players) {
  let s = state.get(ferret.id);
  if (!s) {
    s = { until: now + RIFT.cooldownTicks, riftedUntil: 0, peerUntil: 0 };
    state.set(ferret.id, s);
    // Met (again): on its feet. Until 0.1.70 its "move" event removed the "still" group and with it
    // the walking speed itself (removing a component group removes its components outright), so a
    // ferret that had stood up to peer about could be left unable to walk; this gives it back.
    ferret.triggerEvent("zoocraft:move");
  }
  const d = ferret.dimension;
  const here = cellOf(ferret.location);
  // The pop after a blink, and standing up to peer about, each last a while.
  if (s.riftedUntil && now >= s.riftedUntil) {
    s.riftedUntil = 0;
    setProp(ferret, "zoocraft:rifted", false);
  }
  if (s.peerUntil && now >= s.peerUntil) {
    s.peerUntil = 0;
    setProp(ferret, "zoocraft:peering", false);
    ferret.triggerEvent("zoocraft:move");
  }
  // Hiding: inside a Rift Tunnel (it has no collision, so the ferret stands in its block).
  let hiding = false;
  try {
    hiding = d.getBlock(here)?.typeId === BLOCKS.tunnel;
  } catch {
    // unloaded
  }
  setProp(ferret, "zoocraft:hiding", hiding);
  if (s.riftedUntil || s.peerUntil) return;
  if (!hiding && ferret.isOnGround && Math.random() < RIFT.peerChance) {
    s.peerUntil = now + RIFT.peerTicks;
    setProp(ferret, "zoocraft:peering", true);
    ferret.triggerEvent("zoocraft:still");
    return;
  }
  if (now < s.until) return;
  const a = animalFromEntity(ferret);
  if (a) zooBlink(ferret, a, s, now, here, players);
  else wildBlink(ferret, s, now, here, players);
}

// A zoo ferret: only with a charged Containment Anchor, only onto the exhibit's measured floor.
function zooBlink(ferret, a, s, now, here, players) {
  if (a.location.kind !== "exhibit") return;
  const ex = getExhibit(a.location.id);
  const species = SPECIES[a.speciesId];
  if (!ex || !species?.anchor) return;
  if (Math.random() >= RIFT.zooChance) return;
  const d = ferret.dimension;
  // Someone close with a carrier or food in hand: stay put, so they can catch or feed it.
  for (const p of players) {
    if (p.dimension.id === d.id && HOLD.has(heldItem(p)?.typeId ?? "") && dist3(p.location, ferret.location) < RIFT.holdDist) return;
  }
  const fixtures = fixturesOf(ex);
  const anchors = fixtures.filter((f) => f.type === "anchor");
  if (!isAnchored(species, anchors)) return warn(ex, anchors.length > 0, now, players, d); // AC-11: no blinks, and say so
  const cells = cellsOf(ex.id);
  if (!cells) return;
  const tunnels = fixtures.filter((f) => f.type === "tunnel").map((f) => f.pos);
  const fenced = fenceAt(d);
  for (let i = 0; i < RIFT.tries; i++) {
    const spot = blinkSpot(cells, tunnels, here);
    if (!spot) return;
    if (soundLanding(d, spot) && !crossesFence(here, spot, fenced)) return blink(ferret, s, now, spot);
  }
}

// The anchor is out (or missing): the ferrets stay put, and the park members nearby hear why, once
// every couple of minutes per exhibit. The care warnings on the HUD and the clipboard say it too.
function warn(ex, hasAnchor, now, players, d) {
  if (now - (warned.get(ex.id) ?? -Infinity) < RIFT.warnEvery) return;
  warned.set(ex.id, now);
  const park = parkOfRecord(ex) ?? getPark();
  const text = hasAnchor
    ? `§eThe Containment Anchor in ${ex.name} has no charge: its Rift Ferrets have stopped blinking. Charge it with ender pearls.`
    : `§e${ex.name} has no Containment Anchor: its Rift Ferrets don't blink without one. Put one beside the floor and charge it with ender pearls.`;
  for (const p of players) if (park?.members[p.id] && p.dimension.id === d.id) message(p, text);
}

// A wild ferret: away from whoever came too close (unless they sneak or hold food), or now and then anyway.
function wildBlink(ferret, s, now, here, players) {
  const d = ferret.dimension;
  let near;
  for (const p of players) {
    if (p.dimension.id !== d.id) continue;
    const dist = dist3(p.location, ferret.location);
    const bait = BAIT.has(heldItem(p)?.typeId ?? "");
    if (bait && dist < 10) return; // being tempted: it comes to the food instead
    if (dist < RIFT.fleeDist && !p.isSneaking && !bait) near = p;
  }
  if (!near && Math.random() >= RIFT.wildChance) return;
  const fenced = fenceAt(d);
  for (let i = 0; i < RIFT.tries; i++) {
    const { dx, dz } = wildOffset(near?.location, ferret.location);
    for (const dy of [0, 1, -1, 2, -2]) {
      const c = { x: here.x + dx, y: here.y + dy, z: here.z + dz };
      if (soundLanding(d, c) && !crossesFence(here, c, fenced)) return blink(ferret, s, now, c);
    }
  }
}

function blink(ferret, s, now, c) {
  const d = ferret.dimension;
  const from = ferret.location;
  const to = { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
  fx(d, { x: from.x, y: from.y + 0.3, z: from.z });
  ferret.teleport(to, { keepVelocity: false });
  fx(d, { x: to.x, y: to.y + 0.3, z: to.z });
  setProp(ferret, "zoocraft:rifted", true);
  s.riftedUntil = now + RIFT.riftedTicks;
  s.until = now + RIFT.cooldownTicks;
}

// A puff of portal particles and the enderman's chime, at both ends of the blink.
function fx(d, loc) {
  for (const id of ["minecraft:mob_portal", "minecraft:endrod"]) {
    try {
      d.spawnParticle(id, loc);
    } catch {
      // a particle the game doesn't know: the sound still tells
    }
  }
  try {
    d.playSound("mob.endermen.portal", loc, { volume: 0.5, pitch: 1.5 });
  } catch {
    // unloaded
  }
}
