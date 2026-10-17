// How a script-flown ray moves each tick (0.1.70). Rays glide by the game's own physics: a small
// push (impulse) a tick, as they flew from 0.1.51 to 0.1.65, which is what Austin called "amazing".
// 0.1.69 moved them by teleport steps instead, thinking the game ignored the pushes; the real fault
// was that the rays had lost their family and were never steered at all (animals/flight.js
// wakeWild). The steps stay as a fallback: every push into open air is checked against how far the
// ray really went, and if the pushes carry a ray less than a quarter of the way for a second, the
// game is ignoring them for that ray, so from then on it moves by short steps into open air, says so
// in the content log once, and /zoocraft:rays shows it.

const BODY = 0.45; // blocks above its position the ray's back reaches
export const PUSH_CHECK = { samples: 20, minCommanded: 1.5, minShare: 0.25 };

// Pure: the places to try for a step `v` from `pos`, in order.
export function stepOptions(pos, v) {
  const to = { x: pos.x + v.x, y: pos.y + v.y, z: pos.z + v.z };
  return [to, { x: to.x, y: pos.y, z: to.z }, { x: pos.x, y: to.y, z: pos.z }];
}

// Pure: one push checked. `w` is a ray's running tally { cmd, got, n }; `want` how far the last push
// should have carried it, `got` how far it went. Returns "ignored" when a full window shows the
// pushes aren't moving it, "ok" when a full window shows they are, else undefined (still counting).
export function tallyPush(w, want, got, check = PUSH_CHECK) {
  w.cmd += want;
  w.got += Math.min(got, want * 2);
  w.n += 1;
  if (w.n < check.samples) return undefined;
  const verdict = w.cmd >= check.minCommanded && w.got < w.cmd * check.minShare ? "ignored" : "ok";
  w.share = w.cmd > 0 ? w.got / w.cmd : 1;
  w.cmd = 0;
  w.got = 0;
  w.n = 0;
  return verdict;
}

function airAt(d, p) {
  try {
    const b = d.getBlock({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });
    return Boolean(b && b.isAir);
  } catch {
    return false; // unloaded or out of the world
  }
}

function openAt(d, p) {
  return airAt(d, p) && airAt(d, { x: p.x, y: p.y + BODY, z: p.z });
}

const watch = new Map(); // entity id -> { from, want, cmd, got, n, share, stepping }
const last = new Map(); // entity id -> { tick, how, moved, blocked, still } (for /zoocraft:rays)
const ignoredNotes = []; // "x y z" of rays switched to steps, for the report

function watchOf(id) {
  let w = watch.get(id);
  if (!w) {
    w = { from: undefined, want: 0, cmd: 0, got: 0, n: 0, share: undefined, stepping: false };
    watch.set(id, w);
  }
  return w;
}

// Move `entity` by `v` this tick, facing `rotation` (or as it faces now). `onIgnored(text)` is told
// once if the pushes turn out to be ignored for it. Returns whether it was moved.
export function flyStep(entity, v, rotation, tick = 0, onIgnored = undefined) {
  const p = entity.location;
  const w = watchOf(entity.id);
  // How far did last tick's push carry it? (Only pushes into open air count, and a jump of 4 blocks
  // or more is a teleport by something else, not a push.)
  if (!w.stepping && w.from && w.want > 0.02) {
    const got = Math.hypot(p.x - w.from.x, p.y - w.from.y, p.z - w.from.z);
    if (got < 4 && tallyPush(w, w.want, got) === "ignored") {
      w.stepping = true;
      const where = `${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}`;
      ignoredNotes.push(where);
      if (onIgnored) onIgnored(`the game ignored the pushes for the ${String(entity.typeId).replace(/^.*:/, "").replace(/_/g, " ")} at ${where} (it went ${Math.round((w.share ?? 0) * 100)}% of the way); it now moves by short steps`);
    }
  }
  w.from = { x: p.x, y: p.y, z: p.z };
  w.want = 0;
  if (Math.hypot(v.x, v.y, v.z) < 0.0005) {
    if (!w.stepping) entity.clearVelocity();
    if (rotation) entity.setRotation(rotation);
    last.set(entity.id, { tick, how: w.stepping ? "step" : "push", moved: false, still: true });
    return false;
  }
  if (w.stepping) {
    const rot = rotation ?? entity.getRotation();
    for (const t of stepOptions(p, v)) {
      if (!openAt(entity.dimension, t)) continue;
      entity.teleport(t, { rotation: rot, keepVelocity: false });
      last.set(entity.id, { tick, how: "step", moved: true });
      return true;
    }
    if (rotation) entity.setRotation(rotation);
    last.set(entity.id, { tick, how: "step", moved: false, blocked: true });
    return false;
  }
  const open = openAt(entity.dimension, { x: p.x + v.x, y: p.y + v.y, z: p.z + v.z });
  entity.clearVelocity();
  entity.applyImpulse({ x: v.x, y: v.y, z: v.z });
  if (rotation) entity.setRotation(rotation);
  w.want = open ? Math.hypot(v.x, v.y, v.z) : 0;
  last.set(entity.id, { tick, how: "push", moved: open, blocked: !open });
  return true;
}

export function lastStep(id) {
  return last.get(id);
}

// How the pushes are doing for a ray: { stepping, share (of the last full window), samples (so far
// in this window) }.
export function pushState(id) {
  const w = watch.get(id);
  return w ? { stepping: w.stepping, share: w.share, samples: w.n } : undefined;
}

export function ignoredPushes() {
  return [...ignoredNotes];
}

export function forgetStep(id) {
  last.delete(id);
  const w = watch.get(id);
  // A ray found to ignore pushes stays on steps for the session; the rest start their check over.
  if (w && !w.stepping) watch.delete(id);
  else if (w) w.from = undefined;
}
