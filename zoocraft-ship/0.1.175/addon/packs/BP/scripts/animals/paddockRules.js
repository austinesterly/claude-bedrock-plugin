// Horses and donkeys (0.1.175, module 12; research/vanilla_plan.md "0.1.175 horses and donkeys: the design"): the game's
// own kept in a paddock. Pure rules: the straight run to gallop in, grooming, the horse's coat and markings, the acts
// the client reads, and the clipboard, journal and warning lines. animals/paddock.js applies them in the world.

// The act the client reads (the entity property zoocraft:act): 0 its own life, 1 grazing (head down, standing still),
// 2 galloping round the paddock.
export const ACT = { life: 0, graze: 1, gallop: 2 };

// A horse's markings (the game's minecraft:mark_variant 0-4), as the clipboard names them.
export const MARKS = ["no markings", "white socks and blaze", "white patches", "white spots", "black spots"];

// The longest straight run of floor `width` blocks wide, along x or along z. `cells`: the floor's [x, z] columns.
export function longestRun(cells, width = 2) {
  const set = new Set(cells.map(([x, z]) => `${x},${z}`));
  const has = (x, z) => set.has(`${x},${z}`);
  // A spot of the run: `width` floor columns side by side across it.
  const wideX = (x, z) => {
    for (let k = 0; k < width; k++) if (!has(x, z + k)) return false;
    return true;
  };
  const wideZ = (x, z) => {
    for (let k = 0; k < width; k++) if (!has(x + k, z)) return false;
    return true;
  };
  let best = 0;
  for (const [x, z] of cells) {
    if (wideX(x, z) && !wideX(x - 1, z)) {
      let n = 0;
      while (wideX(x + n, z)) n++;
      best = Math.max(best, n);
    }
    if (wideZ(x, z) && !wideZ(x, z - 1)) {
      let n = 0;
      while (wideZ(x, z + n)) n++;
      best = Math.max(best, n);
    }
  }
  return best;
}

// The floor's columns from a measure's cells ("x,y,z" -> "land" | "water" | ...): the land ones, each column once.
export function floorColumns(cells) {
  const seen = new Set();
  const out = [];
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, , z] = k.split(",").map(Number);
    const c = `${x},${z}`;
    if (seen.has(c)) continue;
    seen.add(c);
    out.push([x, z]);
  }
  return out;
}

// Like the hay: a species without the need, or an exhibit not measured for it yet, always has its run.
export function hasRun(species, ex) {
  if (!species.run || ex.runLength === undefined) return true;
  return ex.runLength >= species.run.length;
}

// Groomed: brushed within `days` park days (one that has just arrived counts from when it came), or a keeper has the
// paddock on their round (keepers groom them).
export function isGroomed(a, now, kept, days, dayLength) {
  if (kept) return true;
  const at = a.groomedAt ?? a.createdAt;
  return at !== undefined && now - at < days * dayLength;
}

// The young take a parent's markings, as their coat.
export function foalMark(mother, father, roll) {
  return (roll < 0.5 || !father ? mother.mark : father.mark) ?? 0;
}

// What the act should be next, from what it is and how things stand. `r1`, `r2`: two random numbers in [0, 1).
// Returns { act, ticks } to start, or undefined to leave it.
export function nextAct(s, b, r1, r2) {
  if (s.act !== ACT.life) return undefined;
  if (s.grown && s.run && !s.inWater && r1 < b.gallopChance * (s.gallopFactor ?? 1)) return { act: ACT.gallop, ticks: b.gallopTicks };
  if (s.onGrass && !s.inWater && r2 < b.grazeChance) return { act: ACT.graze, ticks: b.grazeTicks };
  return undefined;
}

// --- the lines players read -----------------------------------------------------------------------------------------

export function runWarning(plural, species, ex, cap) {
  return { severity: 2, text: `${plural} need room to gallop: a straight run of open floor ${species.run.length} blocks long and 2 wide (${ex.runLength ?? 0} now). Without it comfort can't rise above ${cap}. Measure again with the Habitat Marker after.` };
}

export function groomWarning(names, cap, days) {
  return { severity: 1, text: `Needs grooming: ${names.join(", ")}. Use a brush on each one (every ${days === 1 ? "park day" : `${days} park days`}), or give a Staff Room's keeper this paddock on their round. Ungroomed, comfort can't rise above ${cap}.` };
}

// The clipboard's paddock line: the run, the stable corner's hay (`hayWanted` bales) and the grooming.
export function paddockLine(ex, runWanted, hayWanted, groomed, total, kept) {
  const run = ex.runLength === undefined ? "the run not measured yet" : `a straight run of ${ex.runLength} blocks${ex.runLength < runWanted ? ` §e(${runWanted} wanted)§7` : ""}`;
  const hay = ex.hayBales === undefined ? "hay not measured yet" : `${ex.hayBales} hay bale${ex.hayBales === 1 ? "" : "s"} under a roof${ex.hayBales < hayWanted ? ` §e(${hayWanted} needed)§7` : ""}`;
  const groom = kept ? "a keeper on its round grooms them" : `${groomed} of ${total} groomed (a brush on each one)`;
  return `§fPaddock: §7${run}; ${hay}; ${groom}`;
}

// The clipboard's line for one horse or donkey: groomed or not.
export function groomLine(ok, kept) {
  return ok ? `§fGroomed: §7${kept ? "by its keeper" : "yes"}` : "§fGroomed: §enot lately (use a brush on it)";
}

// The Field Journal's care lines (without the colour codes).
export function paddockCareLines(sp, b) {
  const lines = [];
  if (sp.run) lines.push(`Exercise: a straight run of open floor ${sp.run.length} blocks long and 2 wide to gallop along. With it one now and then gallops round the paddock; without it comfort can't rise above ${b.runComfortCap}`);
  if (sp.groom) lines.push(`Grooming: use a brush on each one at least every ${b.groomDays === 1 ? "park day" : `${b.groomDays} park days`} (it leans into the brush), or a keeper with the paddock on their round grooms them. Ungroomed, comfort can't rise above ${b.groomComfortCap}`);
  if (sp.run) lines.push(`Their day: they walk the paddock; on grass one now and then stops to graze with its head down, and with the run one now and then gallops round it a while${sp.run.gallop < 1 ? " (donkeys less often)" : ""}`);
  if (sp.marks) lines.push("Looks: a caught horse keeps its coat and markings, and a foal takes each after one parent or the other");
  return lines;
}

// The Field Journal's catching line.
export function paddockCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. A tamed one is someone's: leave it with them`;
}
