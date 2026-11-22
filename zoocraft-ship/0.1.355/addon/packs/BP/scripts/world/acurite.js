// Acurite on the moon (0.1.355; rules in acuriteRules.js). Bedrock shows every player the same blocks, so "only when
// you are in the right frequency" is done as the hidden villages are (Austin's "Shared reveal"): while a player with
// the Transcending Vision is near, the moon's seams of Acurite show in its rock; when none is near, each goes back to
// the rock it was. A block of it mined is written down, so that place never has Acurite again.
import { BlockPermutation } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { reportError } from "../core/log.js";
import { onlinePlayers } from "../platform/mc.js";
import { hasVision } from "./vision.js";
import { acufendDimension, acuWalk, acuSeedNow } from "./acufend.js";
import { ACURITE_ORE, MOON_ROCK, WAS, seamCells, chunksNear, seamBlocks } from "./acuriteRules.js";

const G = () => BALANCE.acurite;
const MINED = "acuriteMined";
const ACUFEND = "zoocraft:acufend";
const stats = { shown: 0, hidden: 0, mined: 0, looks: 0 };
/** chunk "cx,cz" -> its seam's columns; chunk -> Set of "x,y,z" mined there */
const seams = new Map();
const mined = new Map();
let walk;

const ckey = (cx, cz) => `${cx},${cz}`;
function minedIn(cx, cz) {
  const k = ckey(cx, cz);
  let m = mined.get(k);
  if (!m) {
    m = new Set(db.get(MINED, k)?.cells ?? []);
    mined.set(k, m);
  }
  return m;
}

function seers(d) {
  const out = [];
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id === d.id && hasVision(p)) out.push(p.location);
    } catch {
      // left
    }
  }
  return out;
}

/** Every two seconds: the seams near each player on the frequency shown in the rock. Nobody on it in Acufend: nothing. */
export function tickAcurite() {
  const d = acufendDimension();
  if (!d) return;
  let who;
  try {
    who = seers(d);
  } catch {
    return;
  }
  if (!who.length) return;
  walk ??= acuWalk();
  if (!walk) return;
  const g = G();
  const seed = acuSeedNow();
  let perm;
  for (const at of who) {
    for (const [cx, cz] of chunksNear(at.x, at.z, g.show)) {
      const k = ckey(cx, cz);
      let cells = seams.get(k);
      if (!cells) {
        cells = seamCells(seed, cx, cz, g);
        seams.set(k, cells);
      }
      if (!cells.length) continue;
      const gone = minedIn(cx, cz);
      for (const c of cells) {
        if (Math.hypot(c.x + 0.5 - at.x, c.z + 0.5 - at.z) > g.show) continue;
        const ground = walk.ground(c.x, c.z);
        if (ground === undefined) continue;
        stats.looks++;
        try {
          const typeAt = (y) => d.getBlock({ x: c.x, y, z: c.z })?.typeId;
          for (const s of seamBlocks(c, ground, typeAt, g)) {
            if (gone.has(`${c.x},${s.y},${c.z}`)) continue;
            perm ??= BlockPermutation.resolve(ACURITE_ORE);
            d.getBlock({ x: c.x, y: s.y, z: c.z })?.setPermutation(perm.withState(/** @type {any} */ (WAS), s.was));
            stats.shown++;
          }
        } catch {
          // not loaded there: the next look
        }
      }
    }
  }
}

/** The Acurite block's own component: its tick (back to rock when nobody on the frequency is near), its mining written down. */
export function acuriteComponent() {
  return {
    onTick(e) {
      try {
        const b = e.block;
        const g = G();
        if (b.dimension.id === ACUFEND && seers(b.dimension).some((l) => Math.hypot(l.x - b.x, l.z - b.z) <= g.hide)) return;
        const was = Number(b.permutation.getState(WAS) ?? 0);
        b.setPermutation(BlockPermutation.resolve(MOON_ROCK[was] ?? MOON_ROCK[0]));
        stats.hidden++;
      } catch (err) {
        reportError("acurite.tick", err);
      }
    },
    onPlayerBreak(e) {
      try {
        const { x, y, z } = e.block.location;
        if (e.dimension.id !== ACUFEND) return;
        const cx = Math.floor(x / 16), cz = Math.floor(z / 16);
        const m = minedIn(cx, cz);
        m.add(`${x},${y},${z}`);
        db.put(MINED, { id: ckey(cx, cz), cells: [...m] });
        stats.mined++;
      } catch (err) {
        reportError("acurite.break", err);
      }
    },
  };
}

/** For the test server. */
export function acuriteDebug() {
  return { ...stats, chunks: seams.size, minedChunks: mined.size };
}
