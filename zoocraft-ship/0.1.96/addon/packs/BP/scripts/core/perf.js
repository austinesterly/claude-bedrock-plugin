import { system } from "@minecraft/server";

// Script-time profiling (Mechanics 20: expose average and peak script time). Each tick group is
// wrapped with timed(); /zoocraft:status prints averages over the last 100 ticks and the worst tick.
// Date.now() has millisecond resolution, so short groups read as 0-1 ms per tick: the averages
// over 100 ticks are what matter.

const groups = new Map(); // name -> { total, peak, windowTotal, windowStart }
const WINDOW = 100;
// A benchmark capture (0.1.96, /zoocraft:benchmark run): each tick's script time over the timed groups, and each
// group's time, runs and worst run, from startCapture() till stopCapture().
let capture;
let loadMs; // the script time of starting the world (main.js worldLoad)

export function timed(name, fn) {
  const t0 = Date.now();
  try {
    fn();
  } finally {
    const dt = Date.now() - t0;
    let g = groups.get(name);
    if (!g) { g = { windowTotal: 0, avg: 0, peak: 0, windowPeak: 0, windowStart: system.currentTick }; groups.set(name, g); }
    g.windowTotal += dt;
    g.windowPeak = Math.max(g.windowPeak, dt);
    g.peak = Math.max(g.peak, dt);
    if (capture) note(name, dt);
    if (system.currentTick - g.windowStart >= WINDOW) {
      g.avg = g.windowTotal / (system.currentTick - g.windowStart);
      g.lastPeak = g.windowPeak;
      g.windowTotal = 0;
      g.windowPeak = 0;
      g.windowStart = system.currentTick;
    }
  }
}

export function perfReport() {
  const rows = [];
  let sum = 0;
  for (const [name, g] of groups) { sum += g.avg; rows.push(`${name} ${g.avg.toFixed(2)}ms avg, ${g.lastPeak ?? 0}ms peak (100 t), ${g.peak}ms worst`); }
  return { sum, rows };
}

export function resetPeaks() {
  for (const g of groups.values()) g.peak = 0;
}

function note(name, dt) {
  const now = system.currentTick;
  // A new tick: close the last one (and any ticks with no timed group at all).
  while (capture.tick < now) {
    capture.ticks.push(capture.sum);
    capture.sum = 0;
    capture.tick++;
  }
  capture.sum += dt;
  let g = capture.groups.get(name);
  if (!g) capture.groups.set(name, (g = { total: 0, runs: 0, worst: 0 }));
  g.total += dt;
  g.runs++;
  g.worst = Math.max(g.worst, dt);
}

/**
 * A system.runJob generator whose steps count in a benchmark capture (as "job:<name>"), so the readout has the flood
 * fills, path walks and route searches that run as jobs as well as the loops. Outside a capture it only passes the
 * steps through.
 * @template T
 * @param {string} name
 * @param {Generator<unknown, T, unknown>} gen
 * @returns {Generator<undefined, T, unknown>}
 */
export function* timedJob(name, gen) {
  const group = `job:${name}`;
  for (;;) {
    let r;
    if (capture) {
      const t0 = Date.now();
      try {
        r = gen.next();
      } finally {
        note(group, Date.now() - t0);
      }
    } else r = gen.next();
    if (r.done) return r.value;
    yield;
  }
}

export function startCapture() {
  capture = { start: system.currentTick, tick: system.currentTick, sum: 0, ticks: [], groups: new Map() };
}

/** @returns {{ start: number, ticks: number[], groups: Map<string, { total: number, runs: number, worst: number }> } | undefined} */
export function stopCapture() {
  const c = capture;
  capture = undefined;
  if (c) c.ticks.push(c.sum);
  return c;
}

export function capturing() {
  return Boolean(capture);
}

export function setLoadMs(ms) {
  loadMs = ms;
}

export function worldLoadMs() {
  return loadMs;
}
