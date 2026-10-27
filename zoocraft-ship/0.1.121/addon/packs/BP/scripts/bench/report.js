// The benchmark readout (0.1.96, spec 21: "Measure frame behavior, simulation step time, save size, and recovery
// time"), pure: a capture of script time per tick (core/perf.js), the real time between ticks, and what the park
// holds, in; the lines for chat and the content log out.
// Date.now() counts whole milliseconds, so one short loop run reads 0 or 1 ms; over many runs the average is right
// (a 0.3 ms run reads 1 about 3 times in 10), the worst tick and the 95th percentile are to the millisecond.

/** The p-th percentile (0-100) of a list of numbers; 0 for an empty list. */
export function percentile(xs, p) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))];
}

/**
 * Ticks per second from the real time between ticks: the average over the run, the slowest second, and the long ticks.
 * @param {number[]} gaps ms between one tick and the next
 */
export function tickRate(gaps) {
  const total = gaps.reduce((a, b) => a + b, 0);
  let slowest = Infinity;
  for (let i = 0; i + 20 <= gaps.length; i += 20) {
    const ms = gaps.slice(i, i + 20).reduce((a, b) => a + b, 0);
    slowest = Math.min(slowest, ms > 0 ? 20000 / ms : 20);
  }
  return {
    tps: total > 0 ? (gaps.length * 1000) / total : 20,
    slowest: Number.isFinite(slowest) ? slowest : total > 0 ? (gaps.length * 1000) / total : 20,
    longest: gaps.length ? Math.max(...gaps) : 0,
    over100: gaps.filter((g) => g > 100).length,
  };
}

/**
 * @param {{ ticks: number[], groups: Map<string, { total: number, runs: number, worst: number }> }} capture
 * @param {number[]} gaps
 * @param {{ seconds: number, parks?: number, exhibits: { total: number, occupied: number, ready: number, unsafe: number, other: number },
 *   animals: number, animalEntities: number, schools?: number, fish?: number, tanks?: number, guests: number, guestsAvg?: number, keepers: number, keepersShown: number,
 *   keepersAvg?: number, keepersPeak?: number, entities: number,
 *   saveBytes: number, loadMs?: number, version: string, top?: number }} park
 * @returns {{ chat: string[], log: string[], summary: object }}
 */
export function benchReport(capture, gaps, park) {
  const ticks = capture.ticks.length;
  const sum = capture.ticks.reduce((a, b) => a + b, 0);
  const rate = tickRate(gaps);
  const rows = [...capture.groups.entries()].map(([name, g]) => ({ name, perTick: g.total / Math.max(1, ticks), perRun: g.total / Math.max(1, g.runs), worst: g.worst, runs: g.runs, share: sum > 0 ? g.total / sum : 0 })).sort((a, b) => b.perTick - a.perTick || b.worst - a.worst);
  const summary = {
    version: park.version,
    seconds: park.seconds,
    parks: park.parks ?? 1,
    ticks,
    tps: round(rate.tps, 1),
    slowestSecondTps: round(rate.slowest, 1),
    longestTickMs: rate.longest,
    ticksOver100ms: rate.over100,
    scriptMsPerTick: round(sum / Math.max(1, ticks), 2),
    scriptP95: percentile(capture.ticks, 95),
    scriptP99: percentile(capture.ticks, 99),
    scriptMax: ticks ? Math.max(...capture.ticks) : 0,
    saveKB: round(park.saveBytes / 1024, 1),
    guests: park.guestsAvg ?? park.guests,
    keepersAtWork: park.keepersAvg ?? park.keepersShown,
    entities: park.entities,
    loadMs: park.loadMs,
  };
  const ex = park.exhibits;
  const head = [
    `§6ZooCraft benchmark §7(${park.version}, ${park.seconds} s, ${ticks} ticks)`,
    `§fTicks per second: §${rate.tps >= 19.5 ? "a" : rate.tps >= 17 ? "e" : "c"}${summary.tps}§f (slowest second ${summary.slowestSecondTps}; longest tick ${rate.longest} ms; ${rate.over100} over 100 ms)`,
    `§fScript time per tick: §${summary.scriptMsPerTick <= 5 ? "a" : summary.scriptMsPerTick <= 10 ? "e" : "c"}${summary.scriptMsPerTick} ms§f average, ${summary.scriptP95} ms at the 95th percentile, ${summary.scriptMax} ms worst (a tick is 50 ms for the whole game)`,
    `§f${(park.parks ?? 1) > 1 ? `${park.parks} parks` : "Park"}: ${ex.total} exhibits (${ex.occupied} occupied, ${ex.ready} ready${ex.unsafe ? `, §c${ex.unsafe} unsafe§f` : ""}${ex.other ? `, ${ex.other} not ready` : ""}), ${park.animals} animals (${park.animalEntities} in view${park.schools ? `; ${park.schools} of them schools of ${park.fish} fish in ${park.tanks} tank${park.tanks === 1 ? "" : "s"}` : ""}), ${park.guestsAvg ?? park.guests} guests in view, ${park.keepers} keepers (${park.keepersAvg ?? park.keepersShown} at work in view on average, ${park.keepersPeak ?? park.keepersShown} at most), ${park.entities} entities in all`,
    `§fSaved data: ${summary.saveKB} KB of world properties${park.loadMs !== undefined ? `; world start-up ${park.loadMs} ms of script` : ""}`,
  ];
  const top = rows.slice(0, park.top ?? 8).map((r) => `§7  ${r.name}: ${round(r.perTick, 3)} ms/tick (${round(r.perRun, 2)} ms a run, worst ${r.worst} ms, ${Math.round(r.share * 100)}%)`);
  const all = rows.map((r) => `  ${r.name.padEnd(16)} ${round(r.perTick, 3).toFixed(3).padStart(7)} ms/tick ${round(r.perRun, 2).toFixed(2).padStart(6)} ms/run worst ${String(r.worst).padStart(3)} ms runs ${String(r.runs).padStart(5)} ${(r.share * 100).toFixed(1).padStart(5)}%`);
  const strip = (s) => s.replace(/§./g, "");
  return {
    chat: [...head, "§fSlowest loops:", ...top, "§7The full table is in the content log (Settings > Creator > Content Log)."],
    log: [...head.map(strip), "Loops (time per tick over the run, per run, worst run, runs, share of script time):", ...all, `JSON ${JSON.stringify(summary)}`],
    summary,
  };
}

function round(n, places) {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}
