// Goats (0.1.180, module 12; research/vanilla_plan.md "0.1.180 goats: the design"): the game's own kept on a rocky
// mountain exhibit. Pure rules: the rock ledges (which count, the lookout), the strong walls' wording, a leap's reach
// and its pick, a head-butt's pairing, the acts the client reads, and the clipboard, journal and warning lines.
// animals/goat.js applies them in the world; exhibits.js measures the ledges (ledgeReport) on the goats' own walk, which
// leaps up to leapUp blocks onto what is beside it, fences and closed gates too (geometry.js floodTerrestrial, opts.rise
// and opts.leapFences), and keeps it as ex.goat: { enclosed, escape, ledges, high, top, spots }.
// Sources: Defra's Code of recommendations for the welfare of livestock goats (2023): para 16 "Goats have a tendency to
// jump and clamber. Fencing should be strong enough and of sufficient height (at least 1.2m)"; para 2 shelter, "Many
// breeds of goat require more protection from inclement weather than cattle or sheep"; para 3 "Goats, being gregarious
// animals, prefer to live in social groups". The test server (2026-11-05): the game's own goats leapt out of walls 2 to
// 8 blocks high, up to 10.8 blocks over the floor, so the zoo goat's leaps are these, onto the ledges measured inside.

// The act the client reads (the entity property zoocraft:act): 0 its own life, 1 in a leap, 2 on a ledge looking out,
// 3 butting heads (the head bows: the game's ram animation).
export const ACT = { life: 0, leap: 1, perch: 2, butt: 3 };

// Its body: the game's goat is 0.9 wide and 1.3 high; a leap's arc is checked clear for this much.
export const BODY = { half: 0.45, height: 1.3 };

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// The ledge measure. `cells`: the goats' walk ("x,y,z" -> "land" | ...: where one stands, feet height); `rockAt(x, y,
// z)`: is that block rock (data/blocks.js ROCK_PATTERNS); `openAt(x, y, z)`: is that cell open air. A ledge is a floor
// cell on rock with a drop of T.ledgeDrop or more beside it (the cells beside it open from its feet down past its own
// floor block: no floor there within the drop). Its height is over the lowest floor of the exhibit. Returns { ledges,
// high, top, spots: [[x, y, z, height]] } (spots: the highest first, up to T.spotKeep of them).
export function ledgeReport(cells, rockAt, openAt, T) {
  const land = [];
  let low = Infinity;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    land.push([x, y, z]);
    if (y < low) low = y;
  }
  const spots = [];
  for (const [x, y, z] of land) {
    if (!rockAt(x, y - 1, z)) continue;
    let edge = false;
    for (const [dx, dz] of DIRS) {
      let open = true;
      for (let d = 0; d <= T.ledgeDrop && open; d++) open = openAt(x + dx, y - d, z + dz);
      if (open) {
        edge = true;
        break;
      }
    }
    if (edge) spots.push([x, y, z, y - low]);
  }
  spots.sort((a, b) => b[3] - a[3]);
  const high = spots.filter((s) => s[3] >= T.lookout).length;
  return { ledges: spots.length, high, top: spots.length ? spots[0][3] : 0, spots: spots.slice(0, T.spotKeep) };
}

// Ledges a herd of `n` needs: perGoat for each, minLedges at least.
export function ledgesNeeded(n, T) {
  return Math.max(T.minLedges, T.perGoat * n);
}

// Like the hay: a species without the need, or an exhibit not measured for it yet, always has its ledges.
export function hasLedges(species, ex, n, T) {
  if (!species.rockLedges || ex.goat === undefined) return true;
  return ex.goat.ledges >= ledgesNeeded(n, T) && ex.goat.high >= 1;
}

// ---------------- the leaps ----------------

// Within a leap of `from` (where it stands, its feet cell) to `to`: up to leapUp blocks up, leapDown down, leapAcross
// across (cell to cell), and not straight up or down.
export function withinReach(from, to, T) {
  const across = Math.hypot(to.x - from.x, to.z - from.z);
  const dy = to.y - from.y;
  return across >= 1 && across <= T.leapAcross && dy <= T.leapUp && dy >= -T.leapDown;
}

// The ledges it could leap to from `here` ({ x, y, z }, its feet cell), not the one it stands on and none another goat
// holds (`held`: set of "x,y,z"): the highest first, so most often it picks the highest it can reach (highChance), else
// one at random. `spots`: [[x, y, z, height]]. Returns the spot, or undefined.
export function pickLedge(spots, here, held, T, random = Math.random) {
  const near = spots.filter(([x, y, z]) => !(x === here.x && y === here.y && z === here.z) && !held.has(`${x},${y},${z}`) && withinReach(here, { x, y, z }, T));
  if (!near.length) return undefined;
  if (random() < T.highChance) {
    const top = Math.max(...near.map((s) => s[1]));
    const best = near.filter((s) => s[1] === top);
    return best[Math.floor(random() * best.length)];
  }
  return near[Math.floor(random() * near.length)];
}

// What a goat does next on its own life, from how things stand (`s`: { act, grown, onLedge, ledges, inWater }) and two
// random numbers in [0, 1). Returns "leap" (onto a ledge), "off" (back down from one), or undefined.
export function nextMove(s, T, r1, r2) {
  if (s.act !== ACT.life || !s.grown || s.inWater || !s.ledges) return undefined;
  if (s.onLedge) return r1 < T.onChance ? "leap" : r2 < T.offChance ? "off" : undefined;
  return r1 < T.leapChance ? "leap" : undefined;
}

// Where one on a ledge leaps back down to: the floor of its exhibit (`cells`, the walking measure's "x,y,z" -> kind)
// within a leap of `here` and lower than it, not a ledge (`ledgeKeys`, a set of "x,y,z"), with no other goat there or
// going there (`held`). In a random order (`random`); the caller tries them until one's arc is clear.
export function offSpots(cells, here, ledgeKeys, held, T, random = Math.random) {
  const out = [];
  const r = Math.ceil(T.leapAcross);
  for (let dx = -r; dx <= r; dx++)
    for (let dz = -r; dz <= r; dz++)
      for (let dy = -T.leapDown; dy <= -1; dy++) {
        const c = { x: here.x + dx, y: here.y + dy, z: here.z + dz };
        const k = `${c.x},${c.y},${c.z}`;
        if (cells.get(k) !== "land" || ledgeKeys.has(k) || held.has(k) || !withinReach(here, c, T)) continue;
        out.push(c);
      }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The way one on a ledge looks out: toward the drop beside it (`openAt(x, y, z)`: open air), the first of the four ways
// that opens a block down; undefined if none does. As a direction { dx, dz }.
export function dropSide(here, openAt) {
  for (const [dx, dz] of DIRS) if (openAt(here.x + dx, here.y, here.z + dz) && openAt(here.x + dx, here.y - 1, here.z + dz)) return { dx, dz };
  return undefined;
}

// Two grown goats on their own life, close enough to butt heads: the nearest pair within buttRange, each in no more
// than one. `goats`: [{ id, x, y, z }]. Returns [[a, b], ...].
export function buttPairs(goats, T) {
  const pairs = [];
  const used = new Set();
  const close = [];
  for (let i = 0; i < goats.length; i++)
    for (let j = i + 1; j < goats.length; j++) {
      const a = goats[i];
      const b = goats[j];
      const d = Math.hypot(a.x - b.x, a.z - b.z);
      if (d <= T.buttRange && d >= T.buttMin && Math.abs(a.y - b.y) < 0.6) close.push([d, a, b]);
    }
  close.sort((p, q) => p[0] - q[0]);
  for (const [, a, b] of close) {
    if (used.has(a.id) || used.has(b.id)) continue;
    used.add(a.id);
    used.add(b.id);
    pairs.push([a, b]);
  }
  return pairs;
}

// --- the lines players read -----------------------------------------------------------------------------------------

export function ledgeWarning(plural, n, ex, T, cap) {
  const L = ex.goat ?? { ledges: 0, high: 0, top: 0 };
  return { severity: 2, text: `${plural} need rock ledges to leap onto: the tops of rock blocks (stone, cobblestone, andesite, granite, deepslate, tuff...) with a drop of ${T.ledgeDrop} or more beside them, ${ledgesNeeded(n, T)} for the ${n} here, one of them ${T.lookout} or more blocks over the floor as a lookout. Found ${L.ledges}${L.ledges ? `, the highest ${L.top} up` : ""}. Without them comfort can't rise above ${cap}. Measure again with the Habitat Marker after.` };
}

// Not enclosed for goats: where the walk found a way out (`at`, or undefined: the measure couldn't say).
export function wallsIssue(plural, at, T) {
  return `Not enclosed for goats: ${plural.toLowerCase()} leap ${T.leapUp} blocks up, so walls, fences and gates need ${T.leapUp + 1} blocks of height over anything a goat can stand on beside them (over a gate, leave one block of air to walk through and build on up from there).${at ? ` They could get out near ${at.x} ${at.y} ${at.z}.` : ""}`;
}

// The clipboard's mountain line: the ledges, the lookout, the shelter's hay (`hayWanted` bales) and the keeper (`kept`:
// one with the exhibit on their round makes it a petting farm). Not enclosed for goats, the ledges don't count (the walk
// that found them got out, onto the wall tops and beyond) and there are no leaps: the line says so instead.
export function mountainLine(ex, n, hayWanted, kept, T) {
  const L = ex.goat;
  const ledges = L === undefined ? "the ledges not measured yet" : L.enclosed === false ? "§enot enclosed for goats, so no leaps§7" : `${L.ledges} rock ledge${L.ledges === 1 ? "" : "s"}${L.ledges < ledgesNeeded(n, T) ? ` §e(${ledgesNeeded(n, T)} wanted)§7` : ""}, ${L.high ? `a lookout ${L.top} up` : `§eno lookout ${T.lookout} up§7`}`;
  const hay = ex.hayBales === undefined ? "hay not measured yet" : `${ex.hayBales} hay bale${ex.hayBales === 1 ? "" : "s"} under a roof${ex.hayBales < hayWanted ? ` §e(${hayWanted} needed)§7` : ""}`;
  return `§fMountain: §7${ledges}; ${hay}; ${kept ? "a keeper on its round makes it a petting farm" : "no keeper on its round"}`;
}

// The clipboard's line for one goat: a screamer or not.
export function screamLine(coat) {
  return coat === 1 ? "§fVoice: §7a screamer (it screams where others bleat)" : "§fVoice: §7bleats";
}

// The Field Journal's care lines (without the colour codes).
export function goatCareLines(sp, T, cap) {
  if (!sp.rockLedges) return [];
  return [
    `Strong walls: goats leap ${T.leapUp} blocks up, so walls, fences and gates need ${T.leapUp + 1} blocks of height over anything a goat can stand on beside them (over a gate, one block of air to walk through, then blocks on up)`,
    `Rock ledges: the tops of rock blocks with a drop of ${T.ledgeDrop} or more beside them, ${T.perGoat} for each goat (${T.minLedges} at least), one a lookout ${T.lookout} or more blocks up. Without them comfort can't rise above ${cap}`,
    "Their day: they walk the rocks; now and then one leaps onto a ledge (the highest it can reach, most often) and stands looking out, and two grown ones sometimes butt heads in play",
    "Milk: a bucket on a grown one, as a cow. A screamer (about 1 in 50) screams where others bleat, and a kid takes after one parent or the other",
  ];
}

// The Field Journal's catching line.
export function goatCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild ones live high on snowy slopes and peaks, and a screamer stays a screamer`;
}
