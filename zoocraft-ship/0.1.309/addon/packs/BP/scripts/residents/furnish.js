// A resident sets their own workstation down in their house (0.1.309; the rule of where: furnishRules.js). Austin
// 2026-11-16: "Han should place his own hanvil when he moves in", and the same for Guido's Bow Case, so neither has to
// be crafted or carried in. Once for each house they live in: a block they set down is theirs and is never put down
// twice. Only ever into an open floor cell of their own house; nothing of the player's is moved or broken.
import { world } from "@minecraft/server";
import { getResident } from "./residents.js";
import { getHome } from "./homes.js";
import { residentById } from "../data/residents.js";
import { onlinePlayers, message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { pickSpot } from "./furnishRules.js";

const PROP = "zoocraft:furnished";
const AIR = "minecraft:air";
const makers = []; // { id, block, name, has(), placed(block), cleared(dimension, pos) }

/** What residents have set down: { <resident id>: { homeId, dimension, x, y, z } }. */
export function furnished() {
  try {
    const s = world.getDynamicProperty(PROP);
    return typeof s === "string" ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}
const save = (all) => world.setDynamicProperty(PROP, JSON.stringify(all));

/** Whether a block position is the workstation this resident set down themselves. */
export function isOwnStation(id, dimensionId, pos) {
  const f = furnished()[id];
  return Boolean(f && f.dimension === dimensionId && f.x === Math.floor(pos.x) && f.y === Math.floor(pos.y) && f.z === Math.floor(pos.z));
}

/** Registers a workstation a resident brings: `has()` true when they need none; `placed(block)` after it is set down; `cleared(dimension, pos)` before an old one is taken away. */
export function bringsStation(maker) {
  makers.push(maker);
}

function place(m, rec, home) {
  const d = world.getDimension(home.dimension);
  const y = home.stand.y;
  const b = home.bbox;
  const typeAt = (x, yy, z) => d.getBlock({ x, y: yy, z })?.typeId;
  if (typeAt(home.stand.x, y, home.stand.z) === undefined) return false; // not loaded: later
  const inside = (x, z) => x >= b.min.x && x <= b.max.x && z >= b.min.z && z <= b.max.z && typeAt(x, y + 1, z) === AIR && ![AIR, undefined].includes(typeAt(x, y - 1, z));
  const open = (x, z) => inside(x, z) && (typeAt(x, y, z) === AIR || /carpet$/.test(typeAt(x, y, z) ?? "")); // walked over
  const free = (x, z) => inside(x, z) && typeAt(x, y, z) === AIR; // bare: only such a cell is ever taken
  const spot = pickSpot(open, home.stand, home.door?.inside, free);
  const all = furnished();
  const old = all[m.id];
  if (old && old.homeId !== home.id && !m.keepOld) {
    // the one in the house they left comes with them
    try {
      const od = world.getDimension(old.dimension);
      const ob = od.getBlock(old);
      if (ob?.typeId === m.block) {
        m.cleared?.(od, old);
        ob.setType(AIR);
      }
    } catch {
      // out of reach: it stays where it was
    }
  }
  if (!spot) {
    if (!(old?.none && old.homeId === home.id)) {
      all[m.id] = { homeId: home.id, none: true }; // looked for again each time, said once
      save(all);
      for (const p of onlinePlayers()) message(p, `§7${residentById(m.id).name} found no free floor in the house for the ${m.name}. Clear a bare corner of the floor and it will be set down there.`);
    }
    return false;
  }
  const block = d.getBlock({ x: spot.x, y, z: spot.z });
  block.setType(m.block);
  all[m.id] = { homeId: home.id, dimension: home.dimension, x: spot.x, y, z: spot.z };
  save(all);
  m.placed?.(block);
  for (const p of onlinePlayers()) message(p, `§a${residentById(m.id).name} set the ${m.name} down in the house, at ${spot.x}, ${y}, ${spot.z}.`);
  return true;
}

/** Every few seconds: a resident living in a house they have set nothing down in yet does so, once it is loaded. */
export function tickFurnish() {
  for (const m of makers) {
    try {
      const rec = getResident(m.id);
      const home = rec ? getHome(rec.homeId) : undefined;
      if (!home?.bbox || !home.stand) continue;
      const f = furnished()[m.id];
      if (f?.homeId === home.id && !f.none) continue;
      if (!f && m.has?.()) {
        const all = furnished();
        all[m.id] = { homeId: home.id, had: true }; // they had one already (a player set it down before 0.1.309)
        save(all);
        continue;
      }
      place(m, rec, home);
    } catch (error) {
      reportError("furnish", error);
    }
  }
}
