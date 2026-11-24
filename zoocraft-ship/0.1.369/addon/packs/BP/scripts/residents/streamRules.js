// Austin the resident's big livestream (0.1.367; Austin's character notes, level 80). At 80 friendship, with
// crocodiles on exhibit, he asks to go into their exhibit for his stream. Yes: the player is in the scene with him.
// No: he does it anyway, and the player then confronts him: "that was cool", or he is never allowed in the zoo again.
// Banned, he films at the park gate every day and that player's friendship with him is 0; letting him back in gives
// the friendship back. One record for the world: { id, state, by, prev: { <player id>: points } }.
// No engine calls here.

export const STREAM_ID = "stream";
export const STREAMER = "austin";
export const STREAM_SPECIES = "zoocraft:crocodile";
/** none: not asked yet. asked: he asked, no answer yet. confront: he went in against a No. done. banned. */
export const STREAM_STATES = ["none", "asked", "confront", "done", "banned"];

export const newStream = () => ({ id: STREAM_ID, state: "none", prev: {} });
export const streamState = (r) => (STREAM_STATES.includes(r?.state) ? r.state : "none");

/** He has asked (kept until answered). */
export function withAsked(r) {
  return streamState(r) === "none" ? { ...r, state: "asked" } : r;
}

/** The scene has played: with the player (yes) it is done, against their No it waits for the confrontation. */
export function withPlayed(r, together) {
  return { ...r, state: together ? "done" : "confront" };
}

/** The confrontation's answer: cool, or banned by that player (their friendship then is kept to give back). */
export function withConfront(r, cool, playerId, points) {
  if (streamState(r) !== "confront") return r;
  if (cool) return { ...r, state: "done" };
  return { ...r, state: "banned", by: playerId, prev: { ...(r.prev ?? {}), [playerId]: Math.max(0, points ?? 0) } };
}

/** Let back in: done, and nothing more to give back. */
export function withUnban(r) {
  return streamState(r) === "banned" ? { ...r, state: "done", by: undefined, prev: {} } : r;
}

/** The friendship a player gets back when he is let in again: what they had, or what they have built since if more. */
export function pointsBack(r, playerId, now) {
  return Math.max(r?.prev?.[playerId] ?? 0, now ?? 0);
}

/** Whether a reward of his waits on the stream (`needs: "crocs"`): crocodiles on exhibit, and not asked before. */
export function streamGate(reward, crocs, state) {
  if (reward?.needs !== "crocs") return true;
  return crocs && (state === "none" || state === "asked");
}

const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** The rotation that looks from `from` at `to`: { x (pitch, down is positive), y (yaw, south is 0) }. */
export function lookAt(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const flat = Math.hypot(dx, dz);
  return { x: (-Math.atan2(dy, flat) * 180) / Math.PI + 0, y: flat < 1e-6 ? 0 : (Math.atan2(-dx, dz) * 180) / Math.PI + 0 }; // + 0: never -0
}

/**
 * Where he stands inside: the land cell nearest to `g.stepIn` blocks in from the way in (`inside`), and where the
 * player stands with him: the land cell next to it nearest the way in. `land` is a list of cells. Undefined with no land.
 */
export function pickStage(land, inside, g) {
  let best;
  let bestS = Infinity;
  for (const c of land) {
    if (Math.abs(c.y - inside.y) > 1) continue;
    const s = Math.abs(d2(c, inside) - g.stepIn);
    if (s < bestS) {
      best = c;
      bestS = s;
    }
  }
  if (!best) return undefined;
  let beside;
  let besideD = Infinity;
  for (const c of land) {
    const d = d2(c, best);
    if (c.y !== best.y || d < 1 || d > 1.5) continue;
    const back = d2(c, inside);
    if (back < besideD) {
      beside = c;
      besideD = back;
    }
  }
  return { stage: best, beside: beside ?? best };
}

/** The crocodiles that come: the `g.crocs` nearest to the stage. `crocs`: [{ id, pos }]. */
export function pickCrocs(crocs, stage, g) {
  return [...crocs].sort((a, b) => d2(a.pos, stage) - d2(b.pos, stage)).slice(0, g.crocs);
}

/** How near the nearest of them is (Infinity with none). */
export function nearest(crocs, stage) {
  return crocs.reduce((m, c) => Math.min(m, d2(c.pos, stage)), Infinity);
}

/**
 * 0.1.369 (Austin: "half the time your view is being blocked by the walls around it"): a shot is a list of places to
 * try, best first; the game takes the first with nothing between it and what it must show (livestream.js casts the
 * rays). `s`: { outside, stage, croc (where the nearest crocodile is, or undefined), ux, uz (the unit way from the
 * stage out to the way in) }. Returns { tries: [{ location, rotation }], see: [points every try must see] }.
 */
export function shotPlan(name, s, g) {
  const eye = (p) => ({ x: p.x, y: p.y + 1.5, z: p.z });
  const turn = (bx, bz, deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: bx * Math.cos(a) - bz * Math.sin(a), z: bx * Math.sin(a) + bz * Math.cos(a) };
  };
  const ring = (center, bx, bz, dists, heights, look) => {
    const out = [];
    for (const deg of g.cam.angles) {
      for (const d of dists) {
        for (const h of heights) {
          const t = turn(bx, bz, deg);
          const location = { x: center.x + t.x * d, y: center.y + h, z: center.z + t.z * d };
          out.push({ location, rotation: lookAt(location, look) });
        }
      }
    }
    return out;
  };
  const croc = s.croc ?? { x: s.stage.x - s.ux * 6, y: s.stage.y, z: s.stage.z - s.uz * 6 };
  const crocEye = { x: croc.x, y: croc.y + 0.5, z: croc.z };
  if (name === "live" || name === "out") {
    // in front of him where he stands outside the way in, looking back at him and the exhibit behind
    return { tries: ring(s.outside, s.ux, s.uz, name === "live" ? [4, 3, 5] : [3, 4, 2.2], [1.8, 2.6, 1.3], eye(s.outside)), see: [eye(s.outside)] };
  }
  if (name === "in") {
    // behind him, inside: his back and the exhibit ahead
    return { tries: ring(s.stage, s.ux, s.uz, [3, 2.2, 1.5], [2.3, 3, 1.7], eye(s.stage)), see: [eye(s.stage)] };
  }
  if (name === "crocs") {
    // over his shoulder at the nearest crocodile
    return { tries: ring(s.stage, s.ux, s.uz, [1.4, 2.2, 0.8], [2.3, 3, 3.8], crocEye), see: [crocEye] };
  }
  if (name === "face") {
    // from further in, close on his face
    return { tries: ring(s.stage, -s.ux, -s.uz, [2.4, 3.2, 1.8], [1.7, 2.2, 2.8], eye(s.stage)), see: [eye(s.stage)] };
  }
  // "chase": from the side, him and the crocodiles in one picture
  const mid = { x: (s.stage.x + croc.x) / 2, y: s.stage.y + 0.8, z: (s.stage.z + croc.z) / 2 };
  const ax = croc.x - s.stage.x;
  const az = croc.z - s.stage.z;
  const al = Math.hypot(ax, az) || 1;
  return { tries: ring(mid, -az / al, ax / al, [g.cam.side, g.cam.side - 2, g.cam.side - 4, 2], [2.6, 3.6, 4.6], mid), see: [eye(s.stage), crocEye] };
}

/** How long a line stays up before the next thing happens, in ticks: longer lines longer (Austin: "people cannot read that quick"). */
export function readTicks(text, g) {
  return Math.round(Math.max(g.read.min, Math.min(g.read.max, g.read.base + String(text ?? "").length * g.read.perChar)));
}

/** The scene's steps in order. `together`: the player is in it. `gate`: the exhibit has Keeper Gates to run out by. */
export function sceneSteps(together, gate) {
  const steps = ["live", "enter", "crocs", "face", "steak", "chase"];
  return together && gate ? [...steps, "escape", "made", "end"] : [...steps, "run", "made", "end"];
}

/** Whether the player has arrived where the scene starts: within g.arrive blocks of the way in. */
export function arrived(pos, outside, g) {
  return Math.hypot(pos.x - outside.x, pos.z - outside.z) <= g.arrive && Math.abs(pos.y - outside.y) <= 6;
}

/** The escape: out when they are no longer inside and are as far from the stage as the way in is. */
export function escaped(pos, inside, s) {
  return !inside && Math.hypot(pos.x - s.stage.x, pos.z - s.stage.z) >= Math.hypot(s.outside.x - s.stage.x, s.outside.z - s.stage.z) - 1;
}

/** Whether the crocodiles are near enough, or it has gone on long enough, for him to run. */
export function timeToRun(sinceSteak, near, g) {
  return sinceSteak >= g.chaseMin && (near <= g.close || sinceSteak >= g.chaseMax);
}

/** Banned: whether he is at the gate now (by day; a time of day in ticks). */
export function atGate(timeOfDay, g) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  return t >= g.gateFrom && t < g.gateTo;
}

/** One of `lines`, not the one said last when there is another. */
export function pickLine(lines, last, random = Math.random) {
  if (!lines?.length) return undefined;
  const pool = lines.length > 1 ? lines.filter((x) => x !== last) : lines;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
