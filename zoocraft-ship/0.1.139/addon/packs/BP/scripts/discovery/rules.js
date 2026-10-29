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
  // Gorillas (0.1.80): the chest-beat display, building a night nest, grooming (picking through the fur).
  chestbeat: { text: "Watch a silverback's display: he hoots, stands up and beats his chest, then slaps the ground", done: "watched a chest-beat display", seconds: 2, when: (e) => e.chestBeat },
  nightnest: { text: "Find one building its nest for the night, pulling branches in round it (at dusk)", done: "found one building its night nest", seconds: 3, when: (e) => e.nestBuilding },
  picking: { text: "Watch one grooming another, picking through its fur", done: "watched one grooming", seconds: 3, when: (e) => e.picking },
  // Owls (0.1.81): the hoot at dusk, a swoop onto food or prey, the pellet at dawn.
  hoot: { text: "Hear one hoot from its perch at dusk, the white throat puffed out (a pair answer each other)", done: "heard one hoot", seconds: 1, when: (e) => e.hooting },
  pounce: { text: "Watch one swoop down onto food or prey and mantle over it, wings spread (at night)", done: "watched one swoop onto its food", seconds: 2, when: (e) => e.pouncing },
  pellet: { text: "Watch one cough up a pellet (on its roost at dawn)", done: "watched one cough up a pellet", seconds: 1, when: (e) => e.pelleting },
  tailwrap: { text: "Find one asleep curled into a ball with its tail over its face (at night)", done: "found one curled up asleep", seconds: 3, when: (e) => e.tailWrapped },
  // Crimson Grazers (0.1.84): the herd's ring against a threat, rubbing on a crimson stem, lying chewing the cud.
  ring: { text: "See the herd form its ring: horns out, the young in the middle (walk toward a herd in Survival, then back off)", done: "saw the herd's ring", seconds: 1, when: (e) => e.ringing },
  rub: { text: "Watch one rub its flank against a crimson stem", done: "watched one rubbing on a stem", seconds: 2, when: (e) => e.rubbing },
  cud: { text: "Find one lying down chewing the cud (round noon)", done: "found one chewing the cud", seconds: 3, when: (e) => e.chewing },
  // Warped Geckos (0.1.85): clinging to a wall, the hunt for a moth, the call at dusk.
  cling: { text: "Watch one cling to a wall (or the glass), head up, head down or across", done: "watched one clinging to a wall", seconds: 3, when: (e) => e.clinging },
  hunt: { text: "See one stalk a moth along the wall and snap it up (at night, near an Insect Feeder)", done: "saw one hunt a moth", seconds: 1, when: (e) => e.hunting },
  call: { text: "Hear one call at dusk: a cluck, then a growl", done: "heard one call", seconds: 1, when: (e) => e.calling },
  // Cinder Boars (0.1.87): rooting with the snout, wallowing in mud, rubbing the mud off.
  root: { text: "Watch one root in the ground with its snout (Warm Ash, or soul soil in the wild)", done: "watched one rooting", seconds: 3, when: (e) => e.rooting },
  wallow: { text: "Find one wallowing in mud, rolling on its side (in the heat of the day)", done: "found one wallowing", seconds: 2, when: (e) => e.wallowing },
  scrub: { text: "Watch a muddy one rub the mud off against a rock or a wall", done: "watched one rub its mud off", seconds: 2, when: (e) => e.scrubbing },
  // Soul Moths (0.1.88): circling a soul light, the flip over one, sipping nectar.
  orbit: { text: "Watch one circle a soul light at night, banked with its back to the light", done: "watched one circle a soul light", seconds: 3, when: (e) => e.orbiting },
  tumble: { text: "See one flip over above a soul light (soul fire, a campfire or a torch on the floor) and drop", done: "saw one tumble over a light", seconds: 1, when: (e) => e.tumbling },
  sip: { text: "Watch one hover and sip nectar (at a Nectar Feeder, or from a Nectar Ration you hold up)", done: "watched one sip nectar", seconds: 2, when: (e) => e.sipping },
  // Quartz Beetles (0.1.89): digging into the bed or out of it, two males wrestling, the hiss.
  burrow: { text: "Watch one dig itself into the ground or out of it (Mineral Substrate; netherrack, soul soil or gravel in the wild)", done: "watched one burrow", seconds: 2, when: (e) => e.burrowing },
  wrestle: { text: "Watch two males wrestle at night: face to face, shoving, one flipped on its back", done: "watched two males wrestle", seconds: 2, when: (e) => e.wrestling },
  hiss: { text: "Walk right up to one on its feet in Survival and hear it hiss", done: "heard one hiss", seconds: 1, when: (e) => e.hissing },
  // End Hoppers (0.1.91): a leap, the zigzag escape, listening with the head on the ground.
  leap: { text: "Watch one leap (onto a Landing Pad, or up onto a block in the wild)", done: "watched one leap", seconds: 1, when: (e) => e.leaping },
  zigzag: { text: "Come close to a wild one in Survival and watch it get away in zigzag leaps", done: "watched one zigzag away", seconds: 0.5, when: (e) => e.zigzagging },
  listen: { text: "Watch one rest its head and ears on the ground, listening", done: "watched one listen", seconds: 2, when: (e) => e.listening },
  // Shimmer Snails (0.1.92): its glowing trail as it crawls, pulling into its shell, sealed in to rest.
  trail: { text: "Watch one crawl, leaving its glowing trail", done: "watched one lay its trail", seconds: 3, when: (e) => e.trailing },
  withdraw: { text: "Come close to one in Survival and watch it pull into its shell", done: "watched one pull in", seconds: 1, when: (e) => e.withdrawing },
  seal: { text: "Find one resting, sealed in its shell (a white seal over the mouth)", done: "found one sealed in", seconds: 1, when: (e) => e.sealedIn },
  // Obsidian Crabs (0.1.93): scraping a rock, digging itself in, rearing with its claws up.
  scrape: { text: "Watch one scrape minerals off a rock with its claws", done: "watched one scrape", seconds: 3, when: (e) => e.scraping },
  dig: { text: "Watch one dig itself in backwards", done: "watched one dig in", seconds: 2, when: (e) => e.digging },
  claws: { text: "Come at one in Survival and see it rear with its claws up", done: "saw one raise its claws", seconds: 1, when: (e) => e.rearing },
  // Chorus Moths (0.1.94): hovering at a chorus flower to sip, the warm-up shiver (and sip, above).
  flower: { text: "Watch one hover at a chorus flower and sip from it", done: "watched one sip at a chorus flower", seconds: 2, when: (e) => e.flowering },
  warmup: { text: "Watch one shiver its wings warm before it flies", done: "watched one warm up", seconds: 1, when: (e) => e.warming },
  // Starback Tortoises (0.1.95): basking warm, browsing (and pulling into its shell: withdraw, above).
  warm: { text: "Watch one bask to warm up, legs splayed and neck stretched out (on a Warm Pad, or in the open)", done: "watched one bask", seconds: 3, when: (e) => e.warmBasking },
  chorus: { text: "Watch one browse, neck stretched up, biting and tugging (at chorus, the feeder or Chorus Browse you hold)", done: "watched one browse", seconds: 3, when: (e) => e.chorusBrowsing },
  // Whale sharks (0.1.124): filter feeding, the huge mouth wide open (the entity's zoocraft:feeding property).
  gulp: { text: "Watch one filter feeding, slowed right down with its mouth wide open", done: "watched one filter feeding", seconds: 3, when: (e) => e.gulping },
  // Sharks (0.1.125): the great white's surge to the surface and the hammerhead's sweep over the floor (zoocraft:act).
  breach: { text: "Watch one surge up to the surface, jaws open", done: "watched one breach", seconds: 2, when: (e) => e.breaching },
  sweep: { text: "Watch one sweep the floor with its wide head", done: "watched one sweep the floor", seconds: 3, when: (e) => e.sweeping },
  // The trench (0.1.126): the goblin shark's jaws slung forward (zoocraft:act), the anglerfish's gaping lure (zoocraft:luring).
  lunge: { text: "Watch one shoot its jaws out to the tip of its snout", done: "watched one lunge its jaws", seconds: 2, when: (e) => e.lunging },
  lure: { text: "Watch one gape with its lure twitching over its mouth", done: "watched one fish with its lure", seconds: 2, when: (e) => e.luring },
  // The sand and the drift (0.1.127): a stingray buried in the sand (zoocraft:act), a jellyfish's flash (zoocraft:flashing).
  bury: { text: "Watch one lie buried in the sand with only its eyes showing", done: "watched one buried in the sand", seconds: 2, when: (e) => e.burying },
  flash: { text: "Watch one flash a ring of light round its bell", done: "watched one flash", seconds: 1, when: (e) => e.flashing },
  // The river and the lagoon (0.1.129): a catfish foraging on the floor, a manatee breathing at the surface (zoocraft:act).
  whiskers: { text: "Watch one creep along the floor nose down, sweeping its whiskers to taste the bottom", done: "watched one forage with its whiskers", seconds: 2, when: (e) => e.whiskering },
  breathe: { text: "Watch one rise and put its nostrils out of the water to breathe", done: "watched one come up to breathe", seconds: 1, when: (e) => e.breathing },
  // Lush Okapis (0.1.137): browsing with the tongue, washing an eye or an ear with it, licking clay (zoocraft:act).
  tongue: { text: "Watch one strip leaves with its long tongue", done: "watched one browse with its tongue", seconds: 2, when: (e) => e.tongueBrowsing },
  eyewash: { text: "Watch one wash its eye or ear with its tongue", done: "watched one wash with its tongue", seconds: 1, when: (e) => e.eyeWashing },
  clay: { text: "Watch one lick clay for its salt", done: "watched one lick clay", seconds: 2, when: (e) => e.clayLicking },
  // Earth Molebears (0.1.138): digging with the spade hands, sniffing with the star, standing up (zoocraft:act).
  spade: { text: "Watch one dig with its spade hands (into Burrow Soil, or itself into the cave floor)", done: "watched one dig with its spade hands", seconds: 2, when: (e) => e.spadeDigging },
  starnose: { text: "Watch one sniff the ground with its star nose", done: "watched its star nose at work", seconds: 2, when: (e) => e.starSniffing },
  rearup: { text: "Watch one stand up on its hind legs to sniff the air", done: "watched one stand up to sniff", seconds: 1, when: (e) => e.standingUp },
  // Skulkers (0.1.139): listening with its tendrils quivering, sniffing someone it walked over to, rising out of the
  // sculk (zoocraft:act).
  tendrils: { text: "Watch one stop to listen, its tendrils quivering and clicking", done: "watched one listen with its tendrils", seconds: 1, when: (e) => e.tendrilsListening },
  meet: { text: "Let one walk over and sniff you (move near it without sneaking)", done: "was sniffed by one", seconds: 1, when: (e) => e.sniffingSomeone },
  emerge: { text: "Watch one rise up out of the sculk", done: "watched one rise out of the sculk", seconds: 1, when: (e) => e.emerging },
};

// The best level any of several journals has reached, by species id (0.1.117: what a park knows is what any of its
// members knows). `journals` are levels maps, species id -> level.
export function bestLevels(speciesIds, journals) {
  return Object.fromEntries(speciesIds.map((id) => [id, journals.reduce((best, j) => Math.max(best, j[id] ?? 0), 0)]));
}

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
