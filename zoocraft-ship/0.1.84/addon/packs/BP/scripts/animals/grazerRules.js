// Crimson Grazers (0.1.84, the Nether trio), pure: the day's moods, the herd and its lead, the ring of horns
// against a threat and the rush, the rubbing stem, the crimson ground, and what an exhibit needs. Spec 5.3:
// "crimson_grazer | Stocky six-legged fungal herbivore | Herd browsing and fungus rubbing | Crimson ground,
// fungal feed, herd shelter". The game side is animals/grazer.js; the ground and stem counts are the walking
// measure's (exhibits/geometry.js summarize). A fantasy animal built on the musk ox (research/nether_facts.md):
// herds of 8 to 24 that form a ring with the young inside and horns out when threatened, the bulls in front.

// The grazer mobs, found by type (0.1.70: never by family alone).
export const GRAZER_TYPES = ["zoocraft:crimson_grazer", "zoocraft:wild_crimson_grazer"];

// What a grazer is doing (its zoocraft:act entity property): the client plays the matching animation and the
// Field Journal watches for it.
export const ACT = { none: 0, graze: 1, rub: 2, rest: 3, chew: 4, ring: 5, rush: 6 };

// The tag the script puts on the herd's lead; the others' follow_mob goal follows the mob carrying it.
export const LEAD_TAG = "zoocraft:herd_lead";

// What it crops where it stands (the floor under it, or the plant in its block): crimson and warped nylium,
// roots, fungus and sprouts; grass too, so a herd kept in the Overworld still grazes.
const GRAZE = /^minecraft:(crimson_nylium|warped_nylium|crimson_roots|warped_roots|crimson_fungus|warped_fungus|nether_sprouts|grass_block|short_grass|tall_grass)$/;
export function grazeable(blockId) {
  return GRAZE.test(blockId ?? "");
}

// The rubbing stems (a huge crimson fungus's trunk), by block id.
const STEM = /^minecraft:(stripped_)?crimson_(stem|hyphae)$/;
export function isRubStem(blockId) {
  return STEM.test(blockId ?? "");
}

// ---------------- the day ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight. A range [a, b] may run past
// midnight's wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// "graze" through the morning and the afternoon (cropping, at the feeder, rubbing on a stem), "rest" round
// noon (lying down together chewing the cud) and "sleep" through the night (lying down, mostly asleep). Musk
// oxen alternate feeding and resting through the day; the Nether has no day, but the park clock does.
export function moodAt(timeOfDay, T) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  if (within(t, T.morning) || within(t, T.afternoon)) return "graze";
  return within(t, T.midday) ? "rest" : "sleep";
}

// What it goes looking for next while grazing (the engine walks it there; animals/grazer.js does the rest
// when it arrives): cropping where it stands mostly, the feeder when there's food it eats, now and then a
// crimson stem to rub on, or a wander.
export function pickInterest({ feeder, stem, calf }, random = Math.random) {
  const pool = ["graze", "graze", "graze", "wander"];
  if (feeder) pool.push("feeder", "feeder");
  if (stem && !calf) pool.push("rub");
  return pool[Math.floor(random() * pool.length)];
}

// Resting: asleep (eyes shut) or chewing the cud (head up). By night mostly asleep, round noon mostly chewing.
export function restAct(mood, random = Math.random) {
  return random() < (mood === "sleep" ? 0.75 : 0.3) ? ACT.rest : ACT.chew;
}

// ---------------- the herd ----------------
// The lead of a herd: the oldest grown bull, else the oldest grown cow, else anyone. members: [{ id, male,
// adult, age }] (age: larger is older; the order breaks ties).
export function leadOf(members) {
  if (!members.length) return undefined;
  const rank = (m) => (m.adult ? 2 : 0) + (m.male ? 1 : 0);
  let best = members[0];
  for (const m of members) {
    const r = rank(m);
    const b = rank(best);
    if (r > b || (r === b && (m.age ?? 0) > (best.age ?? 0))) best = m;
  }
  return best.id;
}

// Wild herds: the grazers near each other, linked within `range` blocks (one link is enough). list: [{ id, x, z }].
// Returns a list of herds (lists of ids), the biggest first.
export function herdsOf(list, range) {
  const parent = new Map(list.map((m) => [m.id, m.id]));
  const find = (id) => {
    while (parent.get(id) !== id) {
      parent.set(id, parent.get(parent.get(id)));
      id = parent.get(id);
    }
    return id;
  };
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (Math.hypot(list[i].x - list[j].x, list[i].z - list[j].z) <= range) parent.set(find(list[i].id), find(list[j].id));
    }
  }
  const groups = new Map();
  for (const m of list) {
    const r = find(m.id);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(m.id);
  }
  return [...groups.values()].sort((a, b) => b.length - a.length);
}

// ---------------- the ring ----------------
// Which way an animal faces to look along ({ dx, dz }), as a Minecraft yaw in degrees.
export function yawTo(dx, dz) {
  return Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0; // + 0 turns -0 into 0
}

// Where each one stands in the ring against a threat at `threat` ({ x, z }): the grown ones evenly round the
// herd's middle, facing out, the first place toward the threat (the bulls first: they take the front); the
// young in the middle, close together. A threat already among them: the middle draws back from it, so the
// front place stays ringGap short of it. members: [{ id, x, z, adult, male }].
// Returns Map id -> { x, z, yaw }.
export function ringPlaces(members, threat, T) {
  const out = new Map();
  if (!members.length) return out;
  let cx = members.reduce((s, m) => s + m.x, 0) / members.length;
  let cz = members.reduce((s, m) => s + m.z, 0) / members.length;
  const grown = members.filter((m) => m.adult).sort((a, b) => Number(b.male) - Number(a.male));
  const young = members.filter((m) => !m.adult);
  const n = grown.length;
  const radius = Math.max(T.ringMin, (n * T.ringSpacing) / (2 * Math.PI));
  const gap = radius + T.ringGap;
  const off = Math.hypot(cx - threat.x, cz - threat.z);
  if (off < gap) {
    const [ux, uz] = off > 1e-6 ? [(cx - threat.x) / off, (cz - threat.z) / off] : [1, 0];
    cx = threat.x + ux * gap;
    cz = threat.z + uz * gap;
  }
  const toward = Math.atan2(threat.z - cz, threat.x - cx);
  // Bulls take the places nearest the threat: place 0 faces it, then alternately either side of it.
  const order = [];
  for (let k = 0; k < n; k++) order.push(k === 0 ? 0 : k % 2 ? Math.ceil(k / 2) : -k / 2);
  grown.forEach((m, k) => {
    const a = toward + (order[k] * 2 * Math.PI) / Math.max(1, n);
    const x = cx + Math.cos(a) * radius;
    const z = cz + Math.sin(a) * radius;
    out.set(m.id, { x, z, yaw: yawTo(Math.cos(a), Math.sin(a)) });
  });
  young.forEach((m, k) => {
    const a = (k * 2 * Math.PI) / Math.max(1, young.length);
    const r = young.length > 1 ? T.ringYoung : 0;
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;
    out.set(m.id, { x, z, yaw: yawTo(threat.x - x, threat.z - z) });
  });
  return out;
}

// The rush: the grown bull of the ring nearest the threat (a cow when there's no bull), if the threat is within
// T.rushRange of it. members as for ringPlaces.
export function rusherOf(members, threat, range) {
  let best;
  let bestD = Infinity;
  for (const m of members) {
    if (!m.adult) continue;
    const d = Math.hypot(m.x - threat.x, m.z - threat.z) - (m.male ? 0.5 : 0);
    if (d < bestD) {
      bestD = d;
      best = m;
    }
  }
  return best && bestD <= range ? best.id : undefined;
}

// Where a rush ends: straight at the threat from `from`, stopping `short` blocks before it (a bluff), or at
// the threat (a real one, `short` 0.9: right up to them). Returns { x, z, yaw, length }.
export function rushTo(from, threat, short) {
  const dx = threat.x - from.x;
  const dz = threat.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  const go = Math.max(0, len - short);
  return { x: from.x + (dx / len) * go, z: from.z + (dz / len) * go, yaw: yawTo(dx, dz), length: go };
}

// Straight-line steps from `from` to `to` at `pace` blocks a tick (at least one step).
export function stepsAlong(from, to, pace) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const n = Math.max(1, Math.ceil(len / pace));
  const out = [];
  for (let k = 1; k <= n; k++) out.push({ x: from.x + ((to.x - from.x) * k) / n, z: from.z + ((to.z - from.z) * k) / n });
  return out;
}

// ---------------- rubbing ----------------
// Facing to rub a flank on a stem in direction `dir` ({ x, z }, one of the four): side on to it, the stem at
// its left. The rub animation's body roll (z -9) tips its back toward the model's -x, which is the mob's left
// (a model faces -z and the game turns it to face the mob's way: facing +z, the model's -x is world +x, and
// facing +z in Minecraft, +x is on the left).
export function rubYaw(dir) {
  return yawTo(-dir.z, dir.x);
}

// ---------------- what the exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Crimson ground: balance.grazer.nyliumCells blocks of crimson nylium in the floor.
export function hasNylium(species, ex, T) {
  if (!species.nylium || ex.nyliumCells === undefined) return true;
  return ex.nyliumCells >= T.nyliumCells;
}

// A rubbing stem: at least one crimson stem or hyphae standing beside the floor.
export function hasRubStem(species, ex) {
  if (!species.rubStem || ex.stemCount === undefined) return true;
  return ex.stemCount >= 1;
}

// The care warnings: crimson ground and a stem to rub on. (Too few for a herd is the social need's: welfare.js
// socialTarget and its advice.)
export function grazerWarnings(ex, plural, T) {
  const out = [];
  if (ex.nyliumCells !== undefined && ex.nyliumCells < T.nyliumCells) out.push({ severity: 2, text: `${plural} need crimson ground underfoot: at least ${T.nyliumCells} crimson nylium blocks in the exhibit floor (${ex.nyliumCells} now). Bring it back from a crimson forest with a Silk Touch tool, or bone meal netherrack beside some.` });
  if (ex.stemCount !== undefined && ex.stemCount < 1) out.push({ severity: 2, text: `${plural} rub their flanks on huge fungus stems: stand a crimson stem (or a column of them) on the floor, back from the walls. A huge crimson fungus grown inside works too.` });
  return out;
}

// The clipboard's lines: the crimson ground and the stems.
export function grazerLines(ex, residents, T) {
  const lines = [];
  lines.push(ex.nyliumCells !== undefined ? `§fCrimson ground: §7${ex.nyliumCells} of ${T.nyliumCells} crimson nylium blocks` : "§fCrimson ground: §7not measured yet: use the Habitat Marker on the ground inside again");
  lines.push(ex.stemCount !== undefined ? `§fRubbing stems: §7${ex.stemCount}${ex.stemCount ? "" : " §c(need one)"}` : "§fRubbing stems: §7not measured yet");
  lines.push(`§fHerd: §7${residents.length} (${grown(residents)} grown)`);
  return lines;
}
