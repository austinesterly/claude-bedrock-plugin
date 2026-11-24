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
 * The camera's shots. `s`: { outside, stage, croc (where the nearest crocodile is, or undefined) }, all feet
 * positions at block centres. Each is { location, rotation }.
 */
export function shotOf(name, s, g) {
  const eye = (p) => ({ x: p.x, y: p.y + 1.5, z: p.z });
  // away from the exhibit, as seen from the way in
  const ox = s.outside.x - s.stage.x;
  const oz = s.outside.z - s.stage.z;
  const len = Math.hypot(ox, oz) || 1;
  const ux = ox / len;
  const uz = oz / len;
  let location;
  let target;
  if (name === "live" || name === "out") {
    // from outside, back from the fence and a little to the side, on him at the way in
    const back = name === "live" ? g.cam.back : g.cam.back - 1;
    location = { x: s.outside.x + ux * back - uz * 1.5, y: s.outside.y + g.cam.up, z: s.outside.z + uz * back + ux * 1.5 };
    target = eye(s.outside);
  } else if (name === "in") {
    // over the way in, looking down on him inside
    location = { x: s.outside.x, y: s.outside.y + g.cam.high, z: s.outside.z };
    target = eye(s.stage);
  } else if (name === "film") {
    // from further in, close on his face (he looks into the exhibit)
    location = { x: s.stage.x - ux * g.cam.close, y: s.stage.y + 1.7, z: s.stage.z - uz * g.cam.close };
    target = eye(s.stage);
  } else {
    // "chase": from the side, him and the crocodiles in one picture
    const c = s.croc ?? { x: s.stage.x - ux * 6, y: s.stage.y, z: s.stage.z - uz * 6 };
    const mid = { x: (s.stage.x + c.x) / 2, y: s.stage.y + 0.8, z: (s.stage.z + c.z) / 2 };
    const ax = c.x - s.stage.x;
    const az = c.z - s.stage.z;
    const al = Math.hypot(ax, az) || 1;
    location = { x: mid.x - (az / al) * g.cam.side, y: s.stage.y + g.cam.up, z: mid.z + (ax / al) * g.cam.side };
    target = mid;
  }
  return { location, rotation: lookAt(location, target) };
}

/**
 * The scene, beat by beat: [{ at (ticks from the start), beat }]. "run" has no time of its own: it comes when a
 * crocodile is within g.close of him, or g.chaseMax ticks after the steak; the beats after it count from then.
 */
export function sceneBeats(g) {
  const t = g.beats;
  return {
    before: [
      { at: 0, beat: "start" },
      { at: t.live, beat: "live" },
      { at: t.enter, beat: "enter" },
      { at: t.film, beat: "film" },
      { at: t.steak, beat: "steak" },
    ],
    after: [
      { at: 0, beat: "run" },
      { at: t.made, beat: "made" },
      { at: t.end, beat: "end" },
    ],
  };
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
