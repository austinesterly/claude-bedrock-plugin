// Field Journal (spec sections 4 and 8). Pure: plain records in, plain answers out.
// Each species has a discovery record: the observation tasks done so far. Levels follow the spec:
// unseen -> observed -> care notes -> transport eligible. Spotting one makes it observed; one
// behavior watched unlocks the care notes; all of them make it eligible to be moved.

import { SPECIES } from "../data/species.js";
import { projectById } from "../data/research.js";

export const LEVELS = ["Unseen", "Observed", "Care notes", "Ready to move"];

export const TASKS = {
  spot: { text: "Spot one, wild or in a zoo", done: "spotted one", seconds: 2, when: () => true },
  swim: { text: "Watch one swimming", done: "watched one swimming", seconds: 3, when: (e) => e.inWater },
  bank: { text: "Watch one out of the water, on the bank", done: "watched one on the bank", seconds: 3, when: (e) => e.onGround && !e.inWater },
  // Grazing, standing still (a zebra only while it really grazes: walking in file it holds still too).
  graze: { text: "Watch one grazing, standing still", done: "watched one grazing", seconds: 3, when: (e) => e.onGround && !e.inWater && e.still && e.grazing !== false },
  herd: { text: "Watch one with its herd, another close by", done: "watched one with its herd", seconds: 3, when: (e) => e.herd },
  browse: { text: "Watch one browsing, standing still", done: "watched one browsing", seconds: 3, when: (e) => e.onGround && !e.inWater && e.still },
  trunk: { text: "Watch one feeding with its trunk, standing still", done: "watched one feeding with its trunk", seconds: 3, when: (e) => e.onGround && !e.inWater && e.still },
  colony: { text: "Watch one with its colony, another close by", done: "watched one with its colony", seconds: 3, when: (e) => e.herd },
  bask: { text: "Watch one basking on a magma block, standing still", done: "watched one basking", seconds: 3, when: (e) => e.onGround && e.still && e.onMagma },
  gnaw: { text: "Watch one gnawing minerals off the rocks, standing still", done: "watched one gnawing at the rocks", seconds: 3, when: (e) => e.onGround && !e.inWater && e.still && !e.onMagma },
  sniff: { text: "Watch one sniffing the ground, standing still", done: "watched one sniffing the ground", seconds: 3, when: (e) => e.onGround && !e.inWater && e.still },
  prowl: { text: "Watch one trotting across soul soil or soul sand", done: "watched one trotting across soul soil", seconds: 2, when: (e) => e.onGround && !e.still && e.onSoul },
  glide: { text: "Watch one gliding through the lava (Clear Lava counts)", done: "watched one gliding through the lava", seconds: 3, when: (e) => e.inLava && !e.still },
  drift: { text: "Watch one drifting still at the lava surface (Clear Lava counts)", done: "watched one drifting at the surface", seconds: 3, when: (e) => e.inLava && e.still },
  stride: { text: "Watch one walking across the lava", done: "watched one striding across the lava", seconds: 3, when: (e) => e.inLava && !e.still },
  ashore: { text: "Watch one ashore, off the lava and off magma (it shivers and turns purple)", done: "watched one shivering ashore", seconds: 3, when: (e) => e.onGround && !e.inLava && !e.inWater && !e.onMagma },
  soar: { text: "Watch one gliding through the air", done: "watched one gliding", seconds: 3, when: (e) => e.flying },
  loop: { text: "Watch one loop the loop in the air", done: "watched one loop the loop", seconds: 1, when: (e) => e.looping },
  blink: { text: "Watch one blink through a rift", done: "watched one blink through a rift", seconds: 1, when: (e) => e.blinking },
  peer: { text: "Watch one stand up on its hind legs to look about", done: "watched one stand up to look about", seconds: 2, when: (e) => e.peering },
  // Nocturnal animals (0.1.62): awake and about (at night, or by day in a nocturnal house), and the ball they curl into.
  forage: { text: "Watch one awake and foraging (at night, or by day in a nocturnal house)", done: "watched one foraging", seconds: 3, when: (e) => e.awake && e.onGround && !e.inWater && !e.curled },
  curl: { text: "Watch one curl up into a ball (walk up to one that's awake)", done: "watched one curl up into a ball", seconds: 2, when: (e) => e.curled },
  // Climbers (raccoons, 0.1.71): up a tree or a Climbing Frame, and washing food at the water.
  climb: { text: "Watch one climb a tree or a Climbing Frame", done: "watched one climbing", seconds: 2, when: (e) => e.climbing },
  wash: { text: "Watch one washing its food at the water's edge", done: "watched one washing its food", seconds: 2, when: (e) => e.washing },
  // Flamingos (0.1.72): filter feeding in the shallows, resting on one leg, and the flock's displays.
  filter: { text: "Watch one filter feeding in the shallows, head upside down", done: "watched one filter feeding", seconds: 2, when: (e) => e.filtering },
  oneleg: { text: "Watch one resting on one leg", done: "watched one resting on one leg", seconds: 2, when: (e) => e.oneLeg },
  display: { text: "Watch a flock display by day: head-flagging, marching together or a wing salute", done: "watched a flock display", seconds: 2, when: (e) => e.displaying },
  // Zebras (0.1.74): the herd walking off in single file, and two grooming each other.
  file: { text: "Watch a herd walk off in single file (zebras set off every few minutes by day)", done: "watched a herd walk in single file", seconds: 2, when: (e) => e.inFile },
  groom: { text: "Watch two groom each other, side by side facing opposite ways", done: "watched two grooming each other", seconds: 2, when: (e) => e.grooming },
  // Lions (0.1.75): the pride lying up together, a scent investigated, and the roar at dusk and dawn.
  pile: { text: "Watch the pride lying up together, another close by (they rest most of the day)", done: "watched the pride lying up together", seconds: 3, when: (e) => e.lyingUp && e.herd },
  scent: { text: "Watch one investigate a scent: sniffing, the flehmen grimace, spraying or scraping (a Scent Post helps)", done: "watched one investigate a scent", seconds: 2, when: (e) => e.scenting },
  roar: { text: "Hear one roar, head low and jaws wide (at dusk and before dawn)", done: "heard one roar", seconds: 2, when: (e) => e.roaring },
  // Tigers (0.1.76): marking its ground on patrol, and a wild one's ambush (it freezes flat when looked at).
  mark: { text: "Watch one mark its ground: spraying with its tail up, rubbing its cheek, clawing high or scraping (on patrol, a Scent Post helps)", done: "watched one marking its ground", seconds: 2, when: (e) => e.marking },
  ambush: { text: "Catch a wild one stalking you, and watch it freeze flat when you look its way (keep looking: it gives up)", done: "caught one freezing in its ambush", seconds: 1, when: (e) => e.ambushing },
  // Crocodiles (0.1.77): basking with the jaws open, the death roll at a meal, a wild one lurking eyes-up.
  gape: { text: "Watch one bask with its jaws wide open (that's how it cools off)", done: "watched one basking, gaping", seconds: 3, when: (e) => e.gaping },
  roll: { text: "See a death roll: at a meal (about once a week) it takes the meat into the water and spins to tear it", done: "saw a death roll", seconds: 1, when: (e) => e.rolling },
  lurk: { text: "Spot a wild one lurking in the water with only its eyes and nostrils showing (from a safe distance)", done: "spotted one lurking", seconds: 2, when: (e) => e.lurking },
  // Red pandas (0.1.79): coming down a trunk head first, draped over a branch, curled up with the tail over the face.
  headfirst: { text: "Watch one come down a tree head first (its ankles turn round to grip)", done: "watched one coming down head first", seconds: 1, when: (e) => e.headDown },
  drape: { text: "Find one draped over a branch, legs and tail hanging, resting through the day", done: "found one draped over a branch", seconds: 3, when: (e) => e.draped },
  tailwrap: { text: "Find one asleep curled into a ball with its tail over its face (at night)", done: "found one curled up asleep", seconds: 3, when: (e) => e.tailWrapped },
};

export function levelOf(species, done) {
  const tasks = species.observe ?? ["spot"];
  const n = tasks.filter((t) => done.includes(t)).length;
  if (!done.includes("spot")) return 0;
  if (n >= tasks.length) return 3;
  return n >= 2 ? 2 : 1;
}

// The tasks this sighting counts towards: not done yet, and the animal is doing that now.
export function tasksSeen(species, done, sight) {
  return (species.observe ?? ["spot"]).filter((t) => !done.includes(t) && TASKS[t] && (t === "spot" || done.includes("spot")) && TASKS[t].when(sight));
}

// Add `step` seconds of watching to every (player, species, task) seen now; drop the rest, so the
// watching has to be unbroken. Returns the keys that just reached their time.
// Line of sight through lava. Clear Lava is a block, not a liquid, so the game's view raycast can stop
// at a pool's surface and never reach the Lava Ray inside it. `cells` are the blocks along the player's
// line of sight in order, each { x, y, z, open } (open: air or lava); `animals` are the lava-living
// animals nearby, [{ id, x, y, z }] (feet position). The id of the first animal within a block of the
// line before anything that isn't open, else undefined.
export function alongSight(cells, animals) {
  for (const c of cells) {
    if (!c.open) return undefined;
    for (const a of animals) {
      if (Math.abs(a.x - c.x - 0.5) <= 1 && Math.abs(a.y + 0.3 - c.y - 0.5) <= 1 && Math.abs(a.z - c.z - 0.5) <= 1) return a.id;
    }
  }
  return undefined;
}

export function watch(progress, seenKeys, step) {
  const finished = [];
  for (const key of [...progress.keys()]) if (!seenKeys.has(key)) progress.delete(key);
  for (const key of seenKeys) {
    const t = (progress.get(key) ?? 0) + step;
    const task = key.split("|")[2];
    if (t >= (TASKS[task]?.seconds ?? 2)) {
      progress.delete(key);
      finished.push(key);
    } else progress.set(key, t);
  }
  return finished;
}

// --- research (spec section 4: projects unlocked by observation, paid in parts and a few coins) ---

// Is a project open to the park: its journal needs met? `levels` maps species id -> level; `done`
// lists the projects researched so far (for `after`). `species` names the pages it wants: species
// id -> the level needed (1 observed, 3 ready to move). `releases` counts the animals returned to
// the wild (conservation, 0.1.57) for a project's `releases` need.
export function projectNeeds(project, levels, done = [], releases = 0) {
  const count = (min) => Object.values(levels).filter((l) => l >= min).length;
  const missing = [];
  const n = project.needs;
  if (n.observed && count(1) < n.observed) missing.push(`${n.observed} species observed (${count(1)} so far)`);
  if (n.ready && count(3) < n.ready) missing.push(`${n.ready} species ready to move (${count(3)} so far)`);
  for (const id of [].concat(n.after ?? [])) if (!done.includes(id)) missing.push(`${projectById(id)?.name ?? id} researched`);
  for (const [id, level] of Object.entries(n.species ?? {})) if ((levels[id] ?? 0) < level) missing.push(`${SPECIES[id]?.displayName ?? id} ${LEVELS[level].toLowerCase()}`);
  if (n.releases && releases < n.releases) missing.push(`${n.releases} animal${n.releases === 1 ? "" : "s"} released to the wild (${releases} so far)`);
  return missing;
}
