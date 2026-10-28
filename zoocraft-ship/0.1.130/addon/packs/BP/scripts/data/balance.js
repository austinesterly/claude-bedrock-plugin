// Balance values (spec sections 2, 7, 10, 13). Proposed defaults: tune here, never in module code.

export const BALANCE = {
  clock: {
    dayLength: 1200, // active park seconds per park day (20 real minutes)
    simEvery: 10, // welfare aggregation cadence, park seconds
    visitorEvery: 60, // guest arrivals cadence, park seconds
  },
  economy: {
    startingFunds: 500,
    admissionPrice: 10,
    demandTarget: 20, // admissions per park day for a small, well-run park
    ledgerKeep: 2000, // newest ledger entries kept (they are also the replay guard)
  },
  needs: {
    // Drain per park day with no support.
    drainPerDay: { satiety: 25, cleanliness: 20, enrichment: 15 },
    // Comfort and social move toward their target by this much per park day.
    adjustPerDay: 50,
    weights: { satiety: 0.25, comfort: 0.25, cleanliness: 0.2, enrichment: 0.15, social: 0.15 },
    // Lower bound of each band; below "urgent" is critical.
    bands: { healthy: 60, attention: 35, urgent: 20 },
    illAfterCriticalSeconds: 600, // half a park day of critical care
    startNeeds: { satiety: 80, comfort: 70, cleanliness: 90, enrichment: 70, social: 70 },
  },
  care: {
    playEnrichment: 20, // hand play with an empty hand
    playCooldown: 120, // park seconds per animal
    rakeCleanliness: 50, // per Cleaning Rake use
    rakeCooldown: 60, // park seconds per exhibit
    exhibitDirtPerExtraAnimal: 0.25, // cleanliness drains faster per extra resident
  },
  feeder: {
    capacity: 32, // ration units
    lowAt: 8,
  },
  // Exhibit equipment (spec sections 7 and 10).
  trough: {
    capacity: 16, // water units
    bucketUnits: 8, // one water bucket
    unitsPerAnimalPerDay: 1,
    lowAt: 4,
    dryComfortCap: 50, // comfort can't rise above this without drinking water
  },
  basket: {
    capacity: 8, // ration units
    unitsPerDay: 1, // one ration a park day keeps a basket interesting, however many animals
  },
  // Breeding (spec section 9): opt-in per exhibit. Young count as part of an animal for space
  // and food, and need a sheltered corner (tree leaves or a roof over some of the floor).
  breeding: {
    juvenileWeight: 0.5, // share of an adult's space a youngster needs
    juvenileFeed: 0.5, // share of an adult's rations a youngster eats
    welfareMin: 60, // every adult at least this (the healthy band)
    goodDays: 2, // park days of good care in a row before a pair starts expecting
    minFoodDays: 2, // park days of food in the feeders
    shelterFraction: 0.1, // of the usable floor, under leaves or a roof
    shelterMin: 2, // blocks, for small exhibits
  },
  // Quiet cover (deer, spec section 5.2): trees or a roof over part of the exhibit's ground.
  cover: {
    height: 8, // blocks above the animals' headroom to look for leaves or a roof
    comfortCap: 60, // comfort can't rise above this without enough cover
  },
  // Cooling Unit (penguins, spec item list: cold-habitat support). Units are cold days' worth of ice.
  cooler: {
    capacity: 32,
    lowAt: 4,
    unitsPerDay: 2, // per exhibit, however many animals
    warmComfortCap: 40, // comfort can't rise above this for a cold species without a stocked unit
    ice: { "minecraft:snow": 1, "minecraft:ice": 2, "minecraft:packed_ice": 6, "minecraft:blue_ice": 18 },
  },
  // Thermal Regulator (Nether wing, spec section 10: "Nether exhibit heat supply"). Units are warm
  // days' worth of fuel. Without heat a Nether animal is never comfortable, and after the recovery
  // window it goes to recovery holding (spec: "warns immediately, gives a recovery window, then sends
  // animals to recovery holding"). It never sets anything alight.
  heater: {
    capacity: 32,
    lowAt: 4,
    unitsPerDay: 2, // per exhibit, however many animals
    coldComfortCap: 30, // comfort can't rise above this for a Nether species without heat
    graceSeconds: 600, // park seconds without heat (half a park day) before recovery holding
    fuel: { "minecraft:charcoal": 2, "minecraft:coal": 2, "minecraft:blaze_rod": 6, "minecraft:coal_block": 18 },
  },
  // Basking pads (Basalt Tortoise, spec section 5.3: "Hot stones, basalt ground"): magma blocks in the
  // exhibit floor.
  bask: {
    comfortCap: 55, // comfort can't rise above this without enough magma blocks
  },
  // Ash bed (Ember Fox, spec section 5.3: "Ash bed, den, heat supply"): Warm Ash blocks in the floor.
  ash: {
    comfortCap: 55, // comfort can't rise above this without enough Warm Ash
  },
  // Den (Ember Fox): an Ember Den on the exhibit floor.
  den: {
    comfortCap: 55, // comfort can't rise above this without a den
  },
  // Mud wallow (elephants, spec section 5.2): blocks of vanilla mud in the exhibit floor.
  mud: {
    comfortCap: 55, // comfort can't rise above this without enough mud
  },
  // End ground (Chorus Deer, spec section 5.4): end stone in the exhibit floor.
  endGround: {
    comfortCap: 55, // comfort can't rise above this without enough end stone
  },
  // Containment Anchor (Rift Ferrets, spec section 10 and the items list): charged with ender pearls.
  // While it has charge the ferrets' blinks land only inside their exhibit; without charge they stop
  // blinking and are unsettled (comfort capped), and the keeper is told (AC-11).
  anchor: {
    capacity: 24,
    lowAt: 4,
    unitsPerDay: 2, // per exhibit, however many animals
    comfortCap: 45, // comfort can't rise above this for a rift species without a charged anchor
    charge: { "minecraft:ender_pearl": 6, "minecraft:ender_eye": 12, "minecraft:popped_chorus_fruit": 2 },
  },
  // Rift Tunnels (Rift Ferrets, spec 5.4 "hiding tunnels"): blocks on the floor to blink between and hide in.
  tunnel: {
    comfortCap: 55, // comfort can't rise above this without enough tunnels
  },
  // Climbers (raccoons, 0.1.71; exhibits/geometry.js floodClimb): an exhibit is climb-proof when a
  // climber can't get out over the walls. It follows a climber this many blocks above the highest
  // floor (and below the lowest): walls taller than that keep them in.
  climb: {
    rise: 24,
  },
  // Something to climb (raccoons): a climbing tree (a trunk 3 or more logs high standing on the floor)
  // or a Climbing Frame.
  climbTree: {
    comfortCap: 55, // comfort can't rise above this without one
  },
  // Water to wash food in (raccoons): a pool in the floor, even one block.
  wash: {
    comfortCap: 60, // comfort can't rise above this without it
  },
  // Raccoons (animals/raccoon.js). Times in ticks (20 a second); [a, b] is anywhere from a to b.
  raccoon: {
    bait: ["zoocraft:fruit_ration"], // held this close (8 blocks) by someone, a raccoon stops what it's doing for them
    scraps: 4, // litter a raccoon drags out of a bin it knocks over, on top of what was in it
    newsRange: 64, // blocks: park members this close to a bin hear about a raid
    warnEvery: 2400, // ticks between "tried the latched bin" messages for one bin
    interestTicks: 400, // it looks for one kind of thing for this long to twice this long
    otherChance: 0.15, // each half second: does something else it happens to be beside
    coolTicks: 60, // a rest between two things it does
    maxUp: 8, // blocks: the highest it climbs a trunk
    maxDown: 24, // blocks: the furthest it goes on down the outside after climbing out (then it lets go)
    hug: 0.18, // blocks toward the trunk it sits while it clings, so its paws are on the bark
    gripTicks: 4, // onto the bark at the foot of the trunk, and off it at the bottom
    climbTicks: 8, // per block up
    downTicks: 6, // per block down, head first
    acrossTicks: 6, // per block over the top and along it
    dropTicks: 2, // per block of a drop with nothing to hold
    pauseChance: 0.4, // a stop to cling partway up a tall trunk
    pauseTicks: 50,
    topTicks: [200, 500], // looking out from the top, by day
    sleepTicks: [600, 1200], // a nap on top, at night
    clingTicks: [80, 200], // clinging under a leafy crown
    washTicks: [100, 200],
    puzzleTicks: [160, 320],
    rummageTicks: 60, // at a Litter Bin before it tips or gives up
    scrapsTicks: 80, // picking through a spilled bin
    escapeChance: 0.25, // each half second near the start of the way out of an exhibit that isn't climb-proof (they're escape artists)
    escapeReach: 2, // blocks from the start of the way out
  },
  // Flamingos (animals/flamingo.js, animals/flamingoRules.js). Times in ticks (20 a second); [a, b] is
  // anywhere from a to b.
  flamingo: {
    bait: ["zoocraft:flamingo_pellets"], // held this close (8 blocks) by someone, a flamingo stops what it's doing for them
    shyRange: 8, // blocks: a wild flock walks away from anyone this close who isn't sneaking (the entity's avoid_mob_type)
    // Pink (a.pink, 0 to 100): rosy from rosyAt, fading from fadingAt, else pale. A park day eating mostly
    // Flamingo Pellets (pelletShare of what it ate, or more) adds pinkUp; any other park day takes pinkDown.
    rosyAt: 70,
    fadingAt: 35,
    pinkUp: 34,
    pinkDown: 20,
    pelletShare: 0.5,
    // A flock's mood lasts moodTicks. By day it displays now and then (keen: breeding on with a flock big
    // enough to nest, or a Flock Mirror; wild; any other zoo flock); otherwise it wades or rests.
    displayChance: { keen: 0.45, wild: 0.2, other: 0.1 },
    wadeChance: { day: 0.65, night: 0.35 },
    moodTicks: [600, 1200],
    marchEvery: [160, 320], // between two marches while the flock displays
    marchSteps: [3, 6], // blocks out before the turn
    marchTicks: 9, // per block of a march
    walkTicks: 10, // per block, walking over to its nest or its chick
    walkSteps: 12, // blocks: further than this, the engine walks it there
    coolTicks: 30, // a rest between two things it does
    feedTicks: [100, 220], // filter feeding, head upside down
    stampTicks: [60, 120], // treading the bottom to stir food up
    preenTicks: [80, 160],
    restTicks: [240, 600], // on one leg (a chick lies down)
    flagTicks: [60, 120], // head-flagging
    saluteTicks: [30, 50], // the wing salute
    buildTicks: [100, 200], // scraping mud onto the nest
    tendChance: 0.3, // each half second, the chance a parent goes over to build the nest up
    sitTicks: 1200, // one turn sitting on the egg (a minute)
    cropEvery: 1200, // a chick is fed crop milk this often
    cropReach: 8, // blocks: a parent this close comes over to feed it
    cropTicks: 100,
  },
  // Broad grazing (zebras, 0.1.74, species.graze): grass blocks in the exhibit floor.
  graze: {
    comfortCap: 55, // comfort can't rise above this without enough grass
  },
  // Zebras (animals/zebra.js, animals/zebraRules.js). Times in ticks (20 a second); [a, b] is anywhere
  // from a to b; distances in blocks.
  zebra: {
    // Feeding places (equid guidance: forage in several places, so the low-ranking ones get theirs): how
    // many grown zebras eat at once at a Basic Feeder, a Puzzle Feeder and a Hay Rack, and drink at a
    // Water Trough.
    places: { feeder: 2, puzzle: 1, rack: 4, trough: 2 },
    pushedSatiety: 50, // a zebra pushed off the food gets what the others leave: satiety no higher than this
    rivalComfortCap: 45, // comfort can't rise above this for any zebra while rival stallions share the mares
    bait: ["zoocraft:grain_ration"], // held this close (8 blocks) by someone, a zebra stops what it's doing for them
    shyRange: 8, // a wild herd moves off from anyone this close who isn't sneaking (the entity's avoid_mob_type)
    // A herd's mood lasts moodTicks: grazing, trekking off in single file now and then, resting (more
    // around midday).
    moodTicks: [600, 1200],
    restChance: { day: 0.2, midday: 0.45 },
    trekChance: 0.3,
    herdReach: 16, // wild zebras this close together are one herd
    // Startled: someone sprinting up who isn't sneaking (this close to a zoo herd; further off in the
    // wild), a hurt zebra, or (a zoo herd, each half second) now and then nothing at all.
    startleRange: 6,
    wildStartleRange: 16,
    randomStartle: 0.0005,
    barkTicks: 24, // the first to notice barks, the rest stop and look; then they run
    startleTicks: 200, // the whole fright: the bark, the run and the stare
    runSteps: [8, 12], // blocks they gallop off (the stallion 3 fewer, so he ends up nearest the threat)
    wildRunSteps: [14, 22],
    easeTrot: 2, // blocks before the end of a run that it slows to a trot
    easeWalk: 0.6, // and to a walk
    stareTicks: [80, 140], // stopped, turned round, staring back at the threat
    calmTicks: 600, // after a fright a herd stays calm this long
    // Grazing: a rest between two things it does, then grazing a while (and a slow step or two on), now
    // and then up to a feeder with a free place, or the trough. One walking about that comes up against
    // another stops there and grazes (or, the herd not grazing, stands stopTicks).
    coolTicks: [40, 160],
    stopTicks: [40, 80],
    feedChance: 0.15,
    drinkChance: 0.08,
    grazeChance: 0.6,
    stepChance: 0.6,
    grazeTicks: [100, 260],
    feedTicks: [160, 320],
    drinkTicks: [80, 140],
    walkSteps: 400, // blocks of a way through the exhibit, at most
    wildWalkSteps: 24, // in the wild
    wildNodes: 600, // blocks looked at for a way in the wild, at most (each one read from the world)
    // Foals: nursing at the mother's left flank (nurseSide: blocks to her left and ahead), keeping within
    // foalStray blocks of her, playing in bursts.
    nurseEvery: [1200, 2400],
    nurseTicks: [100, 200],
    nurseSide: [0.5, 0.05],
    foalStray: 6,
    playChance: 0.25,
    playTicks: [40, 80],
    playSoundEvery: 60,
    imprintRange: 3, // a newborn's first park day, its mother drives off any grown-up this close
    // The stallion herds a straggler (this far out from the others) back in; greetings; fights between
    // rival stallions (one walks up to the other from as far as rivalReach blocks) and sparring between
    // bachelors. Each comes round when its time is up and those in it are free (standing about, or
    // grazing: they look up from the grass for it); when they aren't, it's tried again tryAgain later.
    tryAgain: [60, 140],
    rivalReach: 24,
    herdEvery: [600, 1200],
    strayDist: 8,
    greetEvery: [800, 1600],
    greetTicks: [60, 100],
    fightEvery: [1200, 2400],
    sparEvery: [800, 1600],
    fightTicks: [80, 120],
    sparTicks: [100, 160],
    kickTicks: 24, // the kick out behind that ends a fight
    // Single file: blocks between one and the next (a foal closer behind its mother). In the wild they
    // walk off wildTrekSteps blocks; in a zoo to the water, a feeder or across the exhibit (trekReach
    // blocks away at least). A trek ends after trekTicks however far it got.
    fileGap: { adult: 3, foal: 2 },
    wildTrekSteps: [16, 24],
    trekReach: 8,
    trekTicks: 900,
    // Resting: a share of the grown-ups pair up (grooming side by side facing opposite ways, the partner
    // groomSide blocks to the left and ahead; or resting head to tail, restSide), the others doze; one may
    // lie down (lieChance), maybe for a roll in the dust (rollChance, rollAfter ticks after it settles),
    // then up and a shake.
    pairShare: 0.3,
    groomSide: [0.85, 0.9],
    restSide: [0.8, 0.55],
    groomTicks: [200, 400],
    restPairTicks: [300, 600],
    dozeTicks: [200, 500],
    lieChance: 0.5,
    lieTicks: [400, 900],
    rollChance: 0.5,
    rollAfter: 40,
    shakeTicks: 36,
    // Night: one stands watch (a turn of watchTicks); the others lie down, now and then flat out asleep.
    watchTicks: [600, 1200],
    sleepChance: 0.025,
    sleepTicks: [400, 1200],
    // Sounds, one herd's worth at a time: tearing grass, a snort or a whinny.
    eatEvery: 60,
    idleEvery: [400, 800],
    // How long the client takes to lie down, get up, roll, fall asleep and wake (gen/zebra_anim.py), so
    // nothing changes under it.
    downTicks: 48,
    upTicks: 46,
    rollTicks: 76,
    toSleepTicks: 30,
    wakeTicks: 26,
  },
  // Big predators (0.1.75: lions; 0.1.76: tigers; 0.1.77: crocodiles; animals/predators.js,
  // animals/predatorRules.js, research/predators_plan.md). Times in ticks (20 a second); distances in blocks.
  predators: {
    // Inside a dangerous exhibit ("Warn, then swipe"): a loose animal this close to a player in Survival
    // or Adventure warns (crouched, ears flat, a growl); stay within strikeRange for warnTicks (sneaking:
    // sneakWarnTicks), or come within closeRange, and it charges for up to chargeTicks; within reach it
    // swipes once (3 hearts and a shove), then backs off for backTicks (missBackTicks after a miss).
    danger: { warnRange: 8, leaveSlack: 4, strikeRange: 5, closeRange: 2.5, warnTicks: 60, sneakWarnTicks: 120, chargeTicks: 40, reach: 1.8, damage: 6, knock: 1.2, lift: 0.35, backTicks: 200, missBackTicks: 100 },
    // Holding Dens: an animal called in comes within callTicks or the call lapses; a keeper gives up
    // shifting them after shiftSeconds (park seconds); too few dens caps comfort.
    dens: { callTicks: 600, shiftSeconds: 90, comfortCap: 60 },
    // The double Keeper Gate: the outer gate 2 to 4 blocks from the inner one, in line with it.
    gates: { pairMin: 2, pairMax: 4 },
    // A Meat Ration thrown down: wild predators within range go to it, and stay calm calmTicks after eating.
    bait: { range: 16, calmTicks: 300, releaseCalmTicks: 600 }, // a released one: 30 s to walk away
    // Fast days: big cats fasted one park day in fastEvery (keepers skip their feed that day, as zoos do);
    // that day their satiety drains at fastDrain of the usual rate, so it's no hardship.
    fastEvery: 7,
    fastDrain: 0.25,
  },
  // Lions (animals/lion.js, animals/lionRules.js). Times in ticks; [a, b] is anywhere from a to b.
  lion: {
    // The pride's mood through the day, by weight: resting (lions rest 20 hours of the 24, most around
    // midday), social (head rubs, licking), patrol (the fence walk, scent marking), the roaring chorus
    // (at dusk and before dawn) and the cubs' play. A mood lasts moodTicks.
    moods: {
      day: { rest: 6, social: 2, patrol: 1, roar: 0, play: 1 },
      midday: { rest: 9, social: 1, patrol: 0.3, roar: 0, play: 0.5 },
      dusk: { rest: 2, social: 2, patrol: 3, roar: 3, play: 2 },
      night: { rest: 4, social: 2, patrol: 3, roar: 1, play: 1 },
      dawn: { rest: 2, social: 2, patrol: 2, roar: 3, play: 1 },
    },
    moodTicks: [1200, 2400],
    prideReach: 16, // wild lions this close together are one pride
    // Resting together: side by side, touching (gap blocks between bodies, rows rowGap apart, perRow to a
    // row), a grown male maleOff blocks off the end of the pile.
    pile: { gap: 0.8, rowGap: 2.4, perRow: 4, maleOff: 3 },
    ledgePerLion: 2, // ledge blocks (a floor block 1 or 2 higher than the floor beside it) for each grown lion
    ledgeComfortCap: 60, // comfort can't rise above this without enough ledges
    coalitionMax: 2, // grown males a pride holds; more fight
    coalitionComfortCap: 45, // comfort can't rise above this while too many males share the pride
    coolTicks: [60, 200], // a pause between two things it does
    lieTicks: [600, 1600],
    sleepChance: 0.45, // a rest flat out asleep (on its side, or now and then on its back) rather than on its chest
    backChance: 0.2,
    yawnChance: 0.15,
    nurseChance: 0.5, // a lioness with cubs nurses them in her rest
    nurseTicks: [300, 600],
    socialTicks: [80, 160],
    scentTicks: [80, 140],
    roarTicks: 240, // a bout of roaring (each roar a few seconds, then grunts)
    playTicks: [120, 240],
    feedChance: 0.12,
    drinkChance: 0.08,
    feedTicks: [200, 400],
    drinkTicks: [80, 160],
    besideGap: 0.8, // blocks between two rubbing heads or licking
    suckleGap: 0.9, // a cub suckling, from its mother's middle
    cubStray: 6, // a cub keeps this close to its mother
    patrolReach: 10, // a patrol walk without a Scent Post goes this far
    backOff: 6, // after a swipe it backs off this far
    walkSteps: 400, // blocks of a way through the exhibit, at most
    wildWalkSteps: 24,
    wildNodes: 1200, // a way search's cells, at most: enough for wildWalkSteps across open ground on the diagonal
    chaseSteps: 32, // a charge plans this far ahead, at most
    chaseNodes: 2100, // enough for chaseSteps on the diagonal (a pride 16 blocks off, hurt from 24)
    idleEvery: [300, 700], // a grunt or a moan now and then
    // The wild hunt (Austin, 2026-10-15: "Also make them very dangerous in the wild"): a pride spots
    // anyone in Survival or Adventure within spotDay blocks by day and spotNight at dusk, by night and at
    // dawn (sneaking: sneakFactor of that), stalks for up to stalkTicks, charges from chargeRange (6 blocks
    // a second, faster than a sprint), and bites and swipes (damage 8: 4 hearts) every biteTicks within
    // reach. A male holds back roaring for maleHoldTicks first. It keeps after them until they're
    // leaveSlack blocks beyond its spotting range; after chaseTicks of charging it rests restTicks.
    // Hurt by someone, it and its pride go after them for hurtTicks. Stalking, the lionesses fan out
    // flankDeg apart round the one they're after, so the charge comes from several sides.
    hunt: { spotDay: 16, spotNight: 24, sneakFactor: 0.5, leaveSlack: 8, chargeRange: 8, reach: 1.8, stalkTicks: 200, maleHoldTicks: 80, damage: 8, biteTicks: 30, knock: 0.4, lift: 0.2, hurtTicks: 600, chaseTicks: 400, restTicks: 300, growlRange: 12, tellEvery: 600, flankDeg: 45 },
  },
  // Tigers (0.1.76; animals/tiger.js, animals/tigerRules.js, animals/tigerTurns.js). Times in ticks; [a, b]
  // is anywhere from a to b; distances in blocks.
  tiger: {
    // A tiger's mood through the day, by weight (each its own: they live alone): resting (a zoo tiger sleeps
    // a third of the day and rests another quarter: Biolatti et al. 2016), patrol (the boundary walk and
    // marking), swim (across the pool and out), soak (lying in the shallows, mostly in the midday heat),
    // roar (rare: tigers call far less than lions) and play (a tigress's cubs). No pool: no swim; no
    // shallows: no soak; no cubs: no play.
    moods: {
      day: { rest: 6, patrol: 2, swim: 1, soak: 1, roar: 0, play: 1 },
      midday: { rest: 6, patrol: 0.3, swim: 1.5, soak: 3, roar: 0, play: 0.5 },
      dusk: { rest: 2, patrol: 4, swim: 1, soak: 0.3, roar: 0.6, play: 2 },
      night: { rest: 4, patrol: 3, swim: 0.5, soak: 0, roar: 0.2, play: 1 },
      dawn: { rest: 2, patrol: 3, swim: 1, soak: 0, roar: 0.6, play: 1 },
    },
    moodTicks: [1200, 2400],
    coolTicks: [60, 200], // a pause between two things it does
    lieTicks: [600, 1600],
    sleepChance: 0.5, // a rest flat out asleep (on its side, or now and then on its back) rather than on its chest
    backChance: 0.15,
    groomChance: 0.25, // a rest spent licking its paws and face
    groomTicks: [120, 240],
    yawnChance: 0.15,
    nurseChance: 0.5, // a tigress with cubs nurses them in her rest
    nurseTicks: [300, 600],
    socialTicks: [60, 120], // a cub sitting by its mother while she marks or calls
    scentTicks: [80, 140],
    rollTicks: [80, 140], // rolling on its back in the grass
    soakTicks: [600, 1400],
    roarTicks: 160, // a long "aaonh" or two
    playTicks: [120, 240],
    feedChance: 0.12,
    drinkChance: 0.1,
    feedTicks: [200, 400],
    drinkTicks: [80, 160],
    // Chuffing (prusten: soft puffs through the nose, the friendly greeting): to a player standing still at
    // the fence within chuffRange, at most once in chuffEvery; a tigress to her cubs; one let out of its den.
    chuffRange: 6,
    chuffEvery: 600,
    chuffTicks: 40,
    sparTicks: [60, 100], // two grown tigers loose together rear up and swat, then break off a while
    sparRest: [200, 400],
    suckleGap: 0.9, // a cub suckling, from its mother's middle
    cubStray: 6, // a cub keeps this close to its mother
    patrolReach: 10, // a patrol walk without a Scent Post goes this far
    backOff: 6, // after a swipe it backs off this far
    walkSteps: 400, // blocks of a way through the exhibit, at most
    wildWalkSteps: 24,
    wildNodes: 1200,
    chaseSteps: 32,
    chaseNodes: 2100,
    idleEvery: [400, 900], // a grunt or a moan now and then
    // The turns and introductions (animals/tigerTurns.js): one park day in introEvery, while breeding is on,
    // a grown male and a tigress without cubs are let out together; breeding needs one in the last
    // introWindow park days (tigers meet only to mate: AZA, introductions during oestrus and for breeding).
    introEvery: 4,
    introWindow: 2,
    // Privacy (AZA: "rock outcroppings, hills, and foliage" to get out of sight): screened floor blocks for
    // each grown tiger; fewer caps comfort. Two grown tigers loose together cap it lower.
    screenPerTiger: 6,
    privacyComfortCap: 60,
    solitaryComfortCap: 40,
    // The wild ambush (Austin, 2026-10-15: "Also make them very dangerous in the wild"; animals/tigerRules.js
    // huntStep): it spots anyone in Survival or Adventure within spotDay blocks by day and spotNight at
    // dusk, by night and at dawn (sneaking: sneakFactor of that) and keeps after them till they're
    // leaveSlack beyond. It creeps up only while their back is turned (more than lookDeg off its way);
    // looked at, it freezes flat (grass rustles within rustleRange), and stared at for stareTicks it gives
    // up for giveUpTicks (the Sundarbans masks). From rushBack blocks behind them, or rushAny whatever, it
    // rushes (7 blocks a second) for up to rushTicks, then rests restTicks; within pounceRange it leaps on
    // them once a rush (pounceDamage 10: 5 hearts, a hard shove), and within reach it bites (damage 8)
    // every biteTicks. Hurt by someone, it goes for them for hurtTicks.
    hunt: { spotDay: 20, spotNight: 28, sneakFactor: 0.5, leaveSlack: 10, lookDeg: 50, stareTicks: 160, giveUpTicks: 600, rushBack: 10, rushAny: 6, pounceRange: 4, reach: 1.8, pounceDamage: 10, pounceKnock: 1.4, pounceLift: 0.45, damage: 8, biteTicks: 30, knock: 0.4, lift: 0.2, rushTicks: 80, restTicks: 300, hurtTicks: 600, tellEvery: 600, rustleRange: 10 },
  },
  // Crocodiles (0.1.77; animals/croc.js, animals/crocRules.js). Times in ticks; [a, b] is anywhere from a to b;
  // distances in blocks.
  croc: {
    // A crocodile's mood for a while, by weight: bask (on the sunny bank, gaping: Cott 1961, "the hours from
    // 9:00 a.m. to 4:00 p.m. continuously basking with their jaws open"), shade (gaping in the shade at the
    // hottest time), halfout (lying at the waterline, the back end in the water), float (eyes up), submerge
    // (resting on the bottom), swim (cruising along the shore) and display (a grown male at dawn and dusk with
    // a female about). Nights are in the water; rain keeps them in it too.
    moods: {
      day: { bask: 6, shade: 0, halfout: 2, float: 2, submerge: 1, swim: 1, display: 0 },
      midday: { bask: 2, shade: 3, halfout: 3, float: 2, submerge: 2, swim: 0.5, display: 0 },
      dusk: { bask: 0.5, shade: 0, halfout: 1, float: 4, submerge: 1, swim: 2, display: 3 },
      night: { bask: 0, shade: 0, halfout: 0.5, float: 5, submerge: 2, swim: 2, display: 0 },
      dawn: { bask: 1, shade: 0, halfout: 1, float: 3, submerge: 1, swim: 2, display: 3 },
    },
    moodTicks: [1200, 2400],
    coolTicks: [40, 160], // a pause between two things it does
    lieTicks: [600, 1600],
    floatTicks: [400, 1200],
    driftEvery: [200, 500], // floating, it drifts to another spot now and then
    underTicks: [400, 1200], // resting on the bottom
    slidePace: 1.6, // blocks a second, the belly slide down the bank
    displayTicks: 280, // two of the client's 7 s display cycles
    rubChance: 0.3, // a male displaying in the breeding season goes to rub jaws with a female floating near
    rubRange: 8,
    rubTicks: 200,
    meetRange: 3, // two grown ones this close: the smaller gives way (the snout lift)
    meetChance: 0.5,
    meetEvery: 1200,
    snoutTicks: 50,
    feedTicks: 52, // reared up snapping the meat off the feeder (two jerks)
    rollTicks: 70, // the death roll, tearing the meat (about 1.6 rolls a second: Fish et al. 2007)
    swallowTicks: 48, // the head tossed up three times (the client's 2.4 s)
    mealShowTicks: 2400, // a meal is played for players within 2 minutes of it
    digTicks: 240, // digging the nest with the hind feet
    guardTicks: [600, 1400], // lying by it
    guardLeave: 0.1, // now and then a while in the water near it
    crecheRange: 6, // the young keep this close to their mother
    chirpChance: 0.04,
    chirpTicks: 40,
    backOff: 6, // after a snap it backs off this far
    walkSteps: 400,
    wildWalkSteps: 24,
    wildNodes: 1200,
    chaseSteps: 32,
    chaseNodes: 2100,
    // The exhibit (crocRules.js): a sunny basking bank, bankPerCroc blocks within bankReach of the water for
    // each grown crocodile ("at least one land basking area per crocodile": SA DENR), open to the sky (sky
    // blocks up) and not rough; spots bankGap apart (one lies across 3 or 4 blocks). The smallest go without
    // when there are too few: their comfort is capped at bankComfortCap. Deep water for all to go under at once
    // without touching (SA DENR; GB 2025 A3.40): deepPerCroc spots 2 deep for each grown one and deepPerYoung for
    // each young one, or comfort is capped at submergeComfortCap. Shore clearance: the inner Keeper Gate at
    // least gateToWater blocks from the water.
    bankPerCroc: 4,
    bankReach: 3,
    bankGap: 2.5,
    sky: 12,
    bankComfortCap: 55,
    deepPerCroc: 4,
    deepPerYoung: 1,
    submergeComfortCap: 50,
    gateToWater: 4,
    // The nest: sand or red sand floor nestNear to nestFar blocks from the water ("a few metres from the
    // bank"); in full sun about sunMales of the hatchlings are males (34 C: about 81%, Hutton 1987), shaded
    // all females; the dug-open nest stays nestHatchedDays after the hatching.
    nestNear: 2,
    nestFar: 5,
    sunMales: 0.8,
    nestHatchedDays: 2,
    // The wild (Austin, 2026-10-15: "Also make them very dangerous in the wild"; crocRules.js huntStepCroc): it
    // spots anyone in Survival or Adventure within spotDay blocks by day and spotNight at dusk, by night and at
    // dawn (sneaking: sneakFactor of that), keeping after them till they're leaveSlack beyond. From the water it
    // stalks under the surface (stalkPace blocks a second), up to look every checkEvery for checkTicks; within
    // lungeRange of it and lungeWater of the water it lunges (lungePace blocks a second, lungeTicks), and within
    // grabReach at the end it bites (biteDamage), holds on, drags them in (dragPace, up to dragTicks) and rolls
    // (rolls times, one every rollEvery, rollDamage each); hit, it lets go and backs off letGoTicks; a miss,
    // missTicks. A swimmer it chases at swimChase. On land: within landWarn it gapes and hisses, within
    // landSnap it lunges; hurt there it chases (landChasePace) up to landChaseTicks, no further than landReach
    // from the water. Hurt by someone, it goes for them for hurtTicks.
    hunt: { spotDay: 12, spotNight: 18, sneakFactor: 0.5, leaveSlack: 6, stalkPace: 1.5, checkEvery: 80, checkTicks: 30, lungeRange: 5, lungeWater: 3, lungePace: 8, lungeTicks: 14, grabReach: 2.2, biteDamage: 8, dragPace: 2, dragTicks: 80, rolls: 3, rollEvery: 20, rollDamage: 3, letGoTicks: 200, missTicks: 100, swimChase: 5, landWarn: 6, landSnap: 3, landReach: 6, landChasePace: 3.5, landChaseTicks: 60, hurtTicks: 600, tellEvery: 600 },
  },
  // Red pandas (0.1.79; animals/redpanda.js, animals/pandaRules.js). Times in ticks; [a, b] is anywhere from a
  // to b; distances in blocks. The day (world time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000
  // midnight): active at dawn, at dusk and for a spell around midnight (crepuscular, with a smaller peak near
  // midnight: Bugler et al. 2023), resting through the day, asleep through the night.
  redpanda: {
    dawn: [22500, 1500],
    dusk: [11000, 13500],
    midnight: [17000, 19000],
    // The exhibit: canopyPer canopy blocks for each grown one (up in the trees, reached by climbing), a Nest Box
    // for each, and in a hot biome (hotTags) shade over `shade` of the floor; without them comfort stays under
    // the caps (heat above 27 C is critical for them: the AZA manual, so the shade cap is the lowest).
    canopyPer: 6,
    canopyComfortCap: 55,
    nestComfortCap: 55,
    hotTags: ["desert", "savanna", "mesa"],
    shade: 1 / 3,
    shadeComfortCap: 45,
    nestDays: 1, // cubs stay in the Nest Box their first park day
    bait: ["zoocraft:leafy_ration"], // held this close (8 blocks) by someone, a red panda stops what it's doing for them
    interestTicks: 400, // how long it heads for something (a tree, the feeder, a Nest Box) before giving up
    coolTicks: 60, // a pause between two things it does
    // Climbing (the raccoon's legs, animals/climbRules.js): at most maxUp blocks up a trunk, hug blocks off the
    // bark, gripTicks to take hold, climbTicks a block up, downTicks a block down (head first), acrossTicks a
    // block along the canopy; a pause on the way up now and then (pauseChance, pauseTicks); clinging to the
    // trunk where it can't get onto the canopy (clingTicks).
    maxUp: 10,
    hug: 0.18,
    gripTicks: 4,
    climbTicks: 9,
    downTicks: 7,
    acrossTicks: 7,
    pauseChance: 0.3,
    pauseTicks: 50,
    clingTicks: [80, 200],
    // Up on the canopy: it maps canopyCells blocks of it; active, it makes `trips` trips along it, each tripMin
    // to tripMax blocks, stopping to look about (lookTicks); resting or asleep, it lies there restTicks
    // (draped over a branch by day, curled up at night, sprawled panting in the heat), or goes into a Nest Box
    // beside the canopy (nestNight at night, nestDay by day; nestTicks to get in). drapeShift: how far toward the
    // edge it lies, so its legs and tail hang over.
    canopyCells: 96,
    trips: [1, 3],
    tripMin: 3,
    tripMax: 12,
    lookTicks: [60, 160],
    restTicks: [1200, 2400],
    nestNight: 0.7,
    nestDay: 0.3,
    nestTicks: 10,
    drapeShift: 0.25,
    // In the Nest Box: its head out of the hole. The box's front is nestFront in front of its middle, the back of
    // a grown one's head headBack in front of its own middle (gen/redpanda.py), its floor nestFloor up.
    nestFront: 0.1875,
    headBack: 0.179,
    nestFloor: 0.0625,
    // On the ground: sat up at the feeder chewing bamboo (eatTicks), grooming (groomTicks), a cub's play
    // (playTicks), each started now and then (actChance); lying down where it is with nowhere to climb
    // (groundRestChance, groundRestTicks).
    eatTicks: [160, 300],
    groomTicks: [100, 200],
    playTicks: [100, 200],
    actChance: 0.25,
    groundRestChance: 0.1,
    groundRestTicks: [600, 1200],
    // The warning: someone in Survival or Adventure within standRange of one on the ground makes it stand up on
    // its hind legs, arms up, hissing (standTicks), at most once every standCool. It does no harm. A wild one
    // goes up a tree when someone comes within shyRange.
    standRange: 2,
    standTicks: 50,
    standCool: 300,
    shyRange: 8,
    // Getting out of an exhibit that isn't climb-proof (as the raccoon's): within escapeReach of the way out,
    // escapeChance each look; dropTicks a block dropping, at most maxDown blocks.
    escapeReach: 2,
    escapeChance: 0.2,
    dropTicks: 2,
    maxDown: 24,
  },
  // Gorillas (0.1.80; animals/gorilla.js, animals/gorillaRules.js). Times in ticks; [a, b] is anywhere from a
  // to b; distances in blocks.
  gorilla: {
    // The ape measure (exhibits/geometry.js floodApe): how far above its feet one pulls itself up onto a top
    // (a silverback's reach is about 2.4 m standing; EAZA 2024: non-climbable walls 4 m or higher).
    reach: 3.5,
    // The troop: one silverback with the females and young; two grown males with females fight (comfort
    // can't rise above rivalComfortCap); a bachelor group of males only gets on with bachelorMax at most.
    bachelorMax: 4,
    rivalComfortCap: 45,
    // They can't swim: water 2 or more deep anywhere in the exhibit keeps comfort under deepComfortCap.
    deepComfortCap: 40,
    rideDays: 2, // an infant rides on its mother's back this many park days
    // The troop's mood through the day, by weight (gorillaRules.js dayPart, pickMood): feeding in the morning,
    // a midday rest in day nests while the young play, feeding again, night nests built before dusk, asleep
    // through the night. A mood lasts moodTicks.
    moods: {
      morning: { feed: 6, travel: 2, social: 2 },
      midday: { rest: 6, social: 3, feed: 1 },
      afternoon: { feed: 5, travel: 2, social: 2, rest: 1 },
      nesting: { nest: 1 },
      night: { sleep: 1 },
    },
    moodTicks: [900, 1800],
    troopReach: 16, // wild gorillas this close together are one troop
    restRing: 2.2, // resting round the silverback this far off
    follow: 8, // the troop keeps within this of him; further and one goes to him
    travelReach: 12, // a travel goes this far at most
    coolTicks: [40, 160], // a pause between two things it does
    eatTicks: [300, 600],
    browseTicks: [200, 400],
    puzzleTicks: [300, 600],
    groomTicks: [200, 400],
    restTicks: [600, 1200],
    sitTicks: [100, 300],
    nestTicks: 200, // building its nest, then asleep in it
    playTicks: [100, 240],
    topTicks: [200, 500], // sat on top of a trunk or a Climbing Frame
    climbChance: 0.3, // a female or a young one in a social mood goes up a trunk or a Climbing Frame
    displayChance: 0.04, // a silverback's chest-beat display, each thing he does
    // Climbing (feet first both ways): at most maxUp blocks up; hug blocks off the bark (a grown one's middle);
    // gripTicks to take hold, climbTicks a block up, downTicks a block down, acrossTicks a block along the top.
    maxUp: 6,
    hug: 0.18,
    gripTicks: 6,
    climbTicks: 10,
    downTicks: 10,
    acrossTicks: 10,
    // Walking: the longest way in an exhibit (blocks) and in the wild (and the search's size there); a charge
    // or a chase is a short way at a time.
    walkSteps: 400,
    wildWalkSteps: 24,
    wildNodes: 1200,
    chaseSteps: 24,
    chaseNodes: 1600,
    // Getting out of an exhibit without strong walls (the ape measure's way out): within escapeReach of its
    // start, escapeChance each look; dropTicks a block dropping, at most maxDown blocks.
    escapeReach: 2,
    escapeChance: 0.1,
    dropTicks: 3,
    maxDown: 24,
    idleEvery: [300, 700], // a contented grumble now and then
    // A wild silverback's bluff (Austin's card, "Bluff"; gorillaRules.js bluffStep): within displayRange of
    // someone in Survival or Adventure he hoots and beats his chest (displayTicks); still within chargeRange
    // he charges and stops stopShort off; within closeRange, or after they hurt one of the troop (for
    // hurtTicks), the charge is real: a shove for `damage` within reach. Then he lets them be (backTicks;
    // missBackTicks when he missed). tellEvery: how often a player is told what's happening.
    bluff: { displayRange: 10, leaveSlack: 4, chargeRange: 6, closeRange: 3, stopShort: 2.5, reach: 1.8, displayTicks: 80, chargeTicks: 40, standTicks: 100, backTicks: 400, missBackTicks: 200, damage: 6, knock: 1.4, lift: 0.35, hurtTicks: 600, tellEvery: 600 },
  },
  // Owls (0.1.81; animals/owl.js, animals/owlRules.js). Times in ticks; [a, b] is anywhere from a to b; distances
  // in blocks; speeds in blocks a tick.
  owl: {
    // The night bird's day (world time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight): the twilights
    // it hoots in and goes out or comes back, the night between; the rest is day, roosting.
    phases: { dusk: [11800, 13800], night: [13800, 22200], dawn: [22200, 23950] },
    // Flights: a take-off gathering speed (accel), a cruise of a few wingbeats (flapTicks) and a glide (glideTicks),
    // slowing to land (brake), feet first over the last landStretch. About 6 m/s in an aviary, 8 in the wild;
    // an owlet just out of the box only flutters.
    fly: { cruise: 0.32, slow: 0.04, accel: 0.03, brake: 0.035, landStretch: 1.2, takeoffStretch: 1, flapTicks: 16, glideTicks: 14 },
    wildFly: { cruise: 0.42, slow: 0.04, accel: 0.035, brake: 0.04, landStretch: 1.4, takeoffStretch: 1.2, flapTicks: 14, glideTicks: 20 },
    owletFly: { cruise: 0.14, slow: 0.03, accel: 0.02, brake: 0.025, landStretch: 0.8, takeoffStretch: 0.6, flapTicks: 30, glideTicks: 4 },
    maxNodes: 6000, // the most air blocks one search for a way looks through
    retryTicks: 200, // no way to where it wanted: it looks again after this
    // The aviary (AZA 2019: perches at varied heights): 2 Perches or more, the highest and the lowest perchSpread
    // or more apart, else comfort stays under perchComfortCap. A Perch lowPerch or less over the floor is low.
    minPerches: 2,
    perchSpread: 2,
    perchComfortCap: 50,
    lowPerch: 2,
    // By day: roosting, eyes half shut (open, watching, with someone within wakeRange), preening now and then.
    wakeRange: 5,
    preenChance: 0.03,
    preenTicks: [80, 160],
    // Dusk: a bout of hoots (bout of them, hootGap apart, the first after firstHoot), its mate answering within
    // `answer`; now and then one in the night too.
    bout: [4, 8],
    firstHoot: [20, 200],
    hootGap: [120, 220],
    answer: [25, 50],
    hootTicks: 40,
    hootVolume: 2.5,
    nightHootChance: 0.01,
    // The night: watching from a perch a while, then off: to the feeder (feedChance, at most once a mealGap),
    // mantling over the food (eatTicks), or to another perch. At dawn, a pellet.
    watchTicks: [300, 700],
    feedChance: 0.35,
    mealGap: 2400,
    eatTicks: [160, 260],
    pelletTicks: 50,
    // The threat display at someone in Survival or Adventure this close (on the ground, a low perch or in the
    // Nest Box), and how long before it can display again.
    displayRange: 3,
    displayTicks: 80,
    displayCool: 160,
    // Owlets: their first nestDays park days in the Nest Box, begging (begChance a look) at a parent; then hops of
    // up to owletRange about the floor and the low perches, owletHop apart.
    nestDays: 2,
    begChance: 0.3,
    owletRange: 5,
    owletHop: [200, 500],
    // The wild: a Meat Ration within baitRange draws it down to land baitLand from you; it roosts and hops among
    // treetops within treeRange of where it was found (treeSamples columns looked at), pounces on the ground
    // within pounceRange (pounceChance of a night move, there for pounceTicks), and someone within flushRange of
    // it up a tree (or still by it after the display) sends it to a tree fleeMin or more from them.
    baitRange: 12,
    baitLand: 2,
    treeRange: 16,
    treeSamples: 40,
    pounceChance: 0.3,
    pounceRange: 10,
    pounceTicks: [100, 160],
    flushRange: 4,
    fleeMin: 10,
  },
  // Crimson Grazers (0.1.84; animals/grazer.js, animals/grazerRules.js; on the musk ox, research/nether_facts.md).
  // Times in ticks; [a, b] is anywhere from a to b; distances in blocks. The day (world time of day: 0 sunrise,
  // 6000 noon, 12000 sunset, 18000 midnight): grazing through the morning and the afternoon, lying down together
  // round noon (chewing the cud) and through the night (mostly asleep).
  grazer: {
    morning: [23000, 5000],
    midday: [5000, 7000],
    afternoon: [7000, 12500],
    // The exhibit: nyliumCells crimson nylium blocks in the floor and a crimson stem to rub on; without them
    // comfort stays under the caps.
    nyliumCells: 16,
    nyliumComfortCap: 55,
    rubComfortCap: 60,
    bait: ["zoocraft:fungal_ration", "minecraft:crimson_fungus", "minecraft:warped_fungus"], // held this close (8 blocks) by someone, a grazer stops what it's doing for them, and they aren't a threat
    interestTicks: 400, // how long it heads for something (the feeder, a stem) before choosing again
    coolTicks: 60, // a pause between two things it does
    actChance: 0.3, // grazing: the chance each half second that it stops to crop where it stands
    grazeTicks: [100, 240],
    eatTicks: [120, 240],
    rubTicks: [80, 160],
    restTicks: [600, 1200],
    restNear: 4, // lying down within this of the lead (a calf of its mother), or anywhere after interestTicks
    gruntChance: 0.006,
    // The herd: wild grazers within herdRange of another are one herd. The ring (the musk ox's defence) forms
    // against someone in Survival or Adventure within ringRange of a grown one (a zoo herd: inside the exhibit
    // and within ringRangeZoo), and breaks up ringCalmTicks after they've gone. Places: the grown ones round the
    // middle ringSpacing apart (at least ringMin out), the young ringYoung from it; gliding there at ringPace a tick.
    herdRange: 32, // as far as the follow goal looks for the lead (search_range 32): a stray within it is pulled back
    ringRange: 8,
    ringRangeZoo: 6,
    ringCalmTicks: 100,
    ringMin: 2,
    ringSpacing: 1.8,
    ringYoung: 0.5,
    ringHold: 3, // once ringed, they hold it while the threat stays within this much more of the ring range
    strayRange: 10, // a herd member this far from its lead stops going to feeders and stems, and follows it back
    ringGap: 1.5, // the front of the ring stays this far from the threat (the middle draws back from someone among them)
    ringPace: 0.12,
    // The rush: the bull nearest someone within rushRange of the ring runs at them at rushPace a tick, stopping
    // rushShort from them (its nose a block off), at most once every rushCool. At someone who hurt one of a wild
    // herd (grudgeTicks; the ring forms against them within grudgeRange) it runs right up (realShort) and shoves:
    // shoveDamage (2 hearts), knock and lift, if they're within reach. Not in Peaceful.
    rushRange: 3,
    rushPace: 0.3,
    rushShort: 2.2,
    rushCool: 160,
    stampTicks: 20, // with no room to lunge (someone right at the ring, or something in the way) it stamps where it stands
    grudgeTicks: 1200,
    grudgeRange: 16,
    realShort: 1.4,
    reach: 1.8,
    shoveDamage: 4,
    knock: 1.0,
    lift: 0.3,
    tellEvery: 600,
  },
  // Warped Geckos (0.1.85; animals/gecko.js, animals/geckoRules.js; on the New Caledonian giant gecko,
  // research/nether_facts.md). Times in ticks; [a, b] is anywhere from a to b; distances in blocks, speeds in blocks
  // a tick. The day (world time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight): out at dusk, calling;
  // climbing and hunting through the night; back to its hide at dawn, asleep there by day. A nocturnal house turns
  // it a half-day round.
  gecko: {
    phases: { dusk: [11800, 13800], night: [13800, 22200], dawn: [22200, 23950] },
    // The exhibit: wallFaces wall faces to cling to for each gecko, a hide each (a crack or a Burrow Shelter), one
    // grown male; without them comfort stays under the caps. The wall measure keeps where the first crackKeep cracks are.
    wallFaces: 16,
    wallsComfortCap: 55,
    hideComfortCap: 60,
    rivalComfortCap: 50,
    crackKeep: 32,
    bait: ["zoocraft:insect_ration"], // held this close (8 blocks) by someone, a gecko comes down to the floor for them, and they aren't a threat
    walk: 0.06,
    run: 0.16,
    stalk: 0.02, // creeping the last move up to a moth
    limit: 900, // spots a route search looks at
    zooUp: 6, // an exhibit not measured for its walls yet: routes keep to its floor's box and this far up
    wildReach: 10, // a wild one keeps within wildReach of where it was met, wildDown below and wildUp above
    wildDown: 6,
    wildUp: 12,
    // The night: a grown male keeps within maleLow of the floor (the males hold the lower branches); each move
    // wanderMin to wanderMax steps; between moves it clings still for watchTicks. Each time it chooses, now and then
    // it calls (callChance; callTicks, then callRest still) or licks an eye (lickChance; lickTicks).
    maleLow: 2,
    wanderMin: 3,
    wanderMax: 14,
    watchTicks: [100, 300],
    callChance: 0.05,
    callTicks: 40,
    callRest: [100, 200],
    lickChance: 0.15,
    lickTicks: [30, 50],
    // By day: asleep sleepTicks at a time; one that found no hide looks again after hideLook.
    sleepTicks: [400, 800],
    hideLook: 1200,
    // Moths: at night a stocked Insect Feeder lets one out every mothEvery, onto a wall within mothReach of it; it
    // stays mothTicks. A gecko within mothRange goes for it, creeping the last move; a freeze (freezeTicks), the snap
    // (snapTicks), a lick of the lips. A wild one draws a moth to its glow now and then (wildMothChance).
    mothEvery: [300, 700],
    mothTicks: 600,
    mothReach: 3,
    mothRange: 10,
    wildMothChance: 0.03,
    freezeTicks: 20,
    snapTicks: 10,
    // Rivals: two grown males within rivalRange at night bob their heads at each other (bobTicks), at most once every rivalCool.
    rivalRange: 3,
    bobTicks: 60,
    rivalCool: 600,
    // Someone in Survival or Adventure within threatRange (not tempting it): the threat (threatTicks), then it runs
    // off and up (a score of up to fleeUp blocks up, and away from them, within fleeMax moves); not again for threatCool.
    threatRange: 2,
    threatTicks: 30,
    threatCool: 200,
    fleeUp: 3,
    fleeMax: 12,
    // An exhibit whose air leads out: at night, escapeChance each time it chooses, it climbs out (up to escapeReach
    // past the walls; a search of escapeLimit spots), and the park members hear where.
    escapeChance: 0.05,
    escapeReach: 4,
    escapeLimit: 2000,
  },
  // Cinder Boars (0.1.87; animals/boar.js, animals/boarRules.js; on the wild boar, research/nether_facts.md). Times in
  // ticks; [a, b] is anywhere from a to b; distances in blocks. The day (world time of day: 0 sunrise, 6000 noon,
  // 12000 sunset, 18000 midnight): foraging through the morning and from the afternoon into the night, wallowing in
  // the heat of the day, asleep late at night.
  boar: {
    morning: [23000, 3000],
    midday: [3000, 9000],
    afternoon: [9000, 18000],
    // Without Thermal Mud enough in the floor (species.wallow) comfort stays under this: the heat is too much for them.
    wallowComfortCap: 50,
    bait: ["zoocraft:ember_ration", "zoocraft:fungal_ration", "minecraft:crimson_fungus"], // held this close (8 blocks) by someone, a boar stops what it's doing for them, and they aren't a threat
    interestTicks: 400, // how long it heads for something (the feeder, ground to root in, a rock to rub on) before choosing again
    seekTicks: 800, // mud, or a rock to rub on, it can't get to in this long: it gives up for now
    coolTicks: 60, // a pause between two things it does
    actChance: 0.3, // foraging: the chance each half second that it stops to root where it stands
    rootTicks: [100, 240],
    eatTicks: [120, 240],
    wallowTicks: [120, 240],
    rubTicks: [80, 160],
    restTicks: [600, 1200],
    sleepTicks: [1200, 2400],
    restNear: 4, // lying down within this of the lead (a piglet of its mother), or anywhere after interestTicks
    muddyTicks: 3600, // the mud coat dries and flakes off after 3 minutes
    gruntChance: 0.006,
    // The sounder: wild sows and young within sounderRange of another are one sounder (a wild grown boar lives alone);
    // one strayRange from its lead stops going to things and follows it back.
    sounderRange: 24,
    strayRange: 10,
    // The sow's defence (boarRules.js defenceStep; Forestry England): someone in Survival or Adventure within
    // alertRange of a piglet (a zoo sounder: inside the exhibit and within alertRangeZoo) and her mother trots between
    // them (guardGap from the piglets toward them; the piglets huddle behind her) and stands alert. Within bluffRange
    // of her or a piglet she charges and stops short (bluffShort from them); within realRange, or at someone who hurt
    // one of a wild sounder (grudgeTicks; within grudgeRange), for real: right up (realShort) and, within reach,
    // sowDamage (a grown boar boarDamage) and a knockback. At most one charge every chargeCool; calm again calmTicks
    // after they've gone. Glides at trotPace and chargePace a tick. Nothing in Peaceful. Standing guardGap in front of
    // her piglets, she is that much nearer the threat than they are: the bluff starts about 5.5 from them, the real
    // charge about 3.5.
    alertRange: 8,
    alertRangeZoo: 7,
    bluffRange: 4,
    realRange: 2,
    calmTicks: 100,
    guardGap: 1.5,
    huddle: 0.8,
    trotPace: 0.16,
    chargePace: 0.35,
    bluffShort: 2.2,
    realShort: 1.2,
    reach: 1.8,
    chargeCool: 100,
    sowDamage: 3,
    boarDamage: 4,
    knock: 0.9,
    lift: 0.3,
    grudgeTicks: 1200,
    grudgeRange: 16,
    // A wild boar, or a sow without piglets about, trots off walkOff blocks from someone within shyRange, and again
    // each time they're that near once shyAgain has gone by: it keeps its distance.
    shyRange: 6,
    walkOff: 5,
    shyAgain: 40,
    tellEvery: 600,
    buttTellEvery: 6000, // the butting news (mobGriefing off: the wood holds) at most this often an exhibit
    // Getting out through wood (the boar measure's way out): a grown one picking what to do next goes to try it one
    // time in probeChance (pigs test their fences); within escapeReach of its start, escapeChance each look; it butts
    // the wooden block buttTicks first and, through, trots on outRun blocks before it stops to forage.
    probeChance: 0.15,
    escapeReach: 2,
    escapeChance: 0.1,
    buttTicks: 40,
    outRun: 6,
  },
  // Soul Moths (0.1.88, animals/moth.js, animals/mothRules.js; research/nether_pair_plan.md): the hawk moth's day (world
  // time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a moth house turns it a half-day round): out at
  // dusk, at the lights and the feeder through the night, back to a wall at dawn, at rest by day.
  moth: {
    phases: { dusk: [12000, 13500], night: [13500, 22500], dawn: [22500, 24000] },
    // Flights (blocks a tick): quick and short in a moth house (about 3 m/s), faster in the wild; a caterpillar's crawl.
    fly: { cruise: 0.14, slow: 0.03, accel: 0.02, brake: 0.025 },
    wildFly: { cruise: 0.2, slow: 0.03, accel: 0.025, brake: 0.03 },
    crawl: { cruise: 0.02, slow: 0.008, accel: 0.004, brake: 0.004 },
    maxNodes: 4000, // the most air blocks one search for a way looks through
    retryTicks: 200, // no way to where it wanted: it looks again after this
    // Round a soul light (Fabian et al. 2024: a moth keeps its back to the light): a circle orbitRadius blocks out,
    // `under` blocks below a hanging light, `over` above one on the floor, `out` from a wall torch; orbitSpeed blocks a
    // tick for orbitTicks, orbitGap or more behind the next one round it (closer, it slows); now and then (a chance each
    // second) a stall climbing toward a light above (stallRise high, stallTicks long) or an inversion over one below
    // (invertDrop deep, invertTicks long).
    orbitRadius: [0.9, 1.4],
    under: 1.2,
    over: 1.3,
    out: 1.3,
    orbitSpeed: 0.08,
    orbitTicks: [160, 400],
    orbitGap: 0.8,
    stallChance: 0.12,
    stallRise: 0.8,
    stallTicks: 30,
    invertChance: 0.12,
    invertDrop: 0.9,
    invertTicks: 30,
    // At night, by turns: the feeder (sipChance once sipGap ticks have passed since it last sipped; at dusk half that,
    // and the feeder first), a light (orbitChance), a flit to a block up to flitRange away; a hover between.
    sipGap: 1200,
    sipChance: 0.5,
    sipTicks: [80, 160],
    orbitChance: 0.7,
    flitRange: 4,
    hoverTicks: [20, 80],
    // By day up a wall: restMin or more over the floor, high first, and lightBonus more within lightNear of a soul light.
    restMin: 1,
    lightNear: 3,
    lightBonus: 2,
    // The startle display at someone in Survival or Adventure this close to one at rest (flashTicks), then off to a
    // wall fleeMin or more from them.
    flashRange: 1.5,
    flashTicks: 40,
    fleeMin: 3,
    soulComfortCap: 40, // without a soul light comfort can't rise above this
    // The young: a caterpillar crawls to a host plant within larvaRange and munches it (munchTicks), resting between
    // (larvaRest); burrowing in takes burrowTicks; a new moth pumps its wings out for emergeTicks. The measure keeps
    // where the first plantKeep host plants are.
    larvaRange: 8,
    larvaRest: [60, 200],
    munchTicks: [100, 240],
    burrowTicks: 60,
    emergeTicks: 120,
    plantKeep: 64,
    // The wild: wall spots looked for within wildRange of home (wildSamples tries); the soul lights round home found by
    // a scan r blocks out, `down` and `up` from it, perTick blocks a tick; a Nectar Ration held within baitRange draws
    // one over to hover baitGap from their hands.
    wildRange: 8,
    wildSamples: 24,
    // With no wall near home by day (a flat field): up to wildSearches flights searchRange blocks off to look further,
    // then down onto the ground to rest (0.1.90).
    wildSearches: 3,
    searchRange: [10, 16],
    wildScan: { r: 10, down: 4, up: 6, perTick: 300 },
    baitRange: 10,
    baitGap: 1.2,
  },
  // Quartz Beetles (0.1.89, animals/beetle.js, animals/beetleRules.js; research/nether_pair_plan.md): the rhinoceros
  // beetle's day (world time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a dark cave turns it a
  // half-day round): it digs out at dusk and goes to the feeder, walks, eats and wrestles through the night, goes back
  // to its bed at dawn and lies buried in it by day.
  beetle: {
    phases: { dusk: [12000, 13500], night: [13500, 22500], dawn: [22500, 24000] },
    // Out walking: now and then (feederChance each interestTicks or so) it heads for the feeder. At dawn it gives up
    // the walk to its bed after seekTicks and stands still restTicks before it looks again.
    interestTicks: 400,
    feederChance: 0.3,
    seekTicks: 600,
    restTicks: 600,
    eatTicks: [100, 200],
    // Into the bed and out of it (ticks); buried, now and then (a chance each half second) it tunnels tunnelNear to
    // tunnelFar blocks through the bed in a straight line, tunnelPace blocks a tick.
    digTicks: 50,
    emergeTicks: 50,
    tunnelChance: 0.01,
    tunnelNear: 2,
    tunnelFar: 5,
    tunnelPace: 0.04,
    // The script's walking (blocks a tick): a step onto the bed or into place, the scurry off (backing off, walking
    // off), the chase; it rests coolTicks after anything it did before the engine walks it again.
    stepPace: 0.05,
    scurryPace: 0.08,
    chasePace: 0.065,
    chaseShort: 1.0, // the chase ends this far short of where the loser stopped
    backOff: 3, // blocks the loser goes off
    walkOff: 3, // blocks it walks off from someone it hissed at, off its bed
    coolTicks: 40,
    // The hiss: someone in Survival or Adventure within hissRange of one on its feet (not holding its food or a
    // carrier), at most once each hissAgain; hissTicks long. On its bed it then digs in and stays in hideTicks.
    hissRange: 2,
    hissAgain: 200,
    hissTicks: 40,
    hideTicks: 600,
    // A new beetle out of its pupa walks about newOutTicks before it goes to bed, whatever the time.
    newOutTicks: 600,
    // Two grown males within meetRange: a chance each half second they wrestle, once each wrestleCool for a pair.
    // faceGap apart, they face off (faceTicks), then (matched horns) shove (shoveTicks); the winner pries (pryTicks)
    // and the loser lies flipped (flipTicks), then rights himself (rightTicks).
    meetRange: 2.5,
    wrestleChance: 0.25,
    wrestleCool: 1200,
    faceGap: 0.9,
    faceTicks: [40, 80],
    shoveTicks: [40, 80],
    flipTicks: [60, 100],
    pryTicks: 20,
    rightTicks: 20,
    // The grubs, buried in the bed: a curl up at the surface now and then (peekChance, peekTicks), a tunnel of a block
    // or two (grubTunnelChance, grubTunnel blocks, grubPace blocks a tick); one out of the bed looks each grubLook
    // ticks for a bed cell within grubReach to crawl to.
    peekChance: 0.005,
    peekTicks: [40, 80],
    grubTunnelChance: 0.01,
    grubTunnel: 2,
    grubPace: 0.02,
    grubLook: 100,
    grubReach: 6,
    // Held up, these draw one over (the entities' tempt): its food, or a nether quartz.
    bait: ["zoocraft:mineral_pellets", "minecraft:quartz"],
    // Without Mineral Substrate enough in the floor (species.substrate) comfort can't rise above this.
    bedComfortCap: 50,
  },
  // End Hoppers (0.1.91, animals/hopper.js, animals/hopperRules.js; research/end_plan.md): the springhare's leaps with a
  // jerboa's escape. The End has no day or night, so it keeps to bouts: up and about activeTicks, then a nap of napTicks
  // where it is.
  hopper: {
    activeTicks: [800, 1800],
    napTicks: [400, 800],
    // Up and about, what it does next (weights): a run of leaps (to the pads, or across the floor), foraging, sitting up
    // to look round, listening with its head on the ground, hopping about where the engine takes it (walkTicks). Each act
    // lasts its ticks; walking to the feeder it gives up after interestTicks; after anything it did, coolTicks before
    // it chooses again.
    choices: { circuit: 0.35, forage: 0.25, sit: 0.15, listen: 0.1, walk: 0.15 },
    walkTicks: [100, 200],
    forageTicks: [60, 140],
    sitTicks: [20, 60],
    listenTicks: [60, 100],
    eatTicks: [60, 120],
    interestTicks: 300,
    coolTicks: 20,
    // A leap: it crouches crouchTicks, then flies an arc of baseTicks and ticksPerBlock more each block across (within
    // leapTicks), peaking arcPeak over the higher end and arcPeakPerBlock more each block; it lands (landTicks). Every
    // point of the arc has ground within voidLook blocks under it (never out over the void).
    crouchTicks: 10,
    baseTicks: 10,
    ticksPerBlock: 2.5,
    leapTicks: [15, 25],
    arcPeak: 0.8,
    arcPeakPerBlock: 0.1,
    landTicks: 8,
    voidLook: 8,
    // A leap's reach, from where it stands to where it lands: reachUp blocks up, reachAcross across, dropMax down (a
    // rock-wallaby lands from drops twice its leap).
    reachUp: 3,
    reachAcross: 5,
    dropMax: 6,
    // A run of leaps in a zoo: circuitLeaps of them from pad to pad, each time a chance floorChance it goes back down
    // instead. Across the floor (no pad to leap to): floorAcross blocks.
    circuitLeaps: [2, 5],
    floorChance: 0.3,
    floorAcross: [2, 4],
    // The Landing Pads: one counts with padClear blocks of air over it, within a leap of the floor or of another pad
    // that counts; one standing highMin or more over the floor is a high one. minPads or more, one for each grown
    // hopper over that, and a high one; without them comfort can't rise above padComfortCap.
    padClear: 3,
    highMin: 2,
    minPads: 3,
    padComfortCap: 50,
    // In the wild: up onto ground wildUp blocks higher, wildAcross blocks off, with wildClear blocks of air over it;
    // with nothing higher, down off a height or across flat ground flatAcross blocks.
    wildUp: [1, 3],
    wildAcross: [2, 5],
    flatAcross: [2, 4],
    wildClear: 2,
    // Getting away from someone in Survival or Adventure, not sneaking (nor holding its food or a carrier): a wild one
    // within fleeRange, one in a zoo within startleRange inside its exhibit. The zigzag: darts (zooDarts in a zoo)
    // darts of dartAcross blocks, each turned dartTurn degrees off the straight way from where they are then, left and
    // right by turns, dartGap ticks on the ground between; a dart is a low quick leap (dartPeak, dartBase and
    // dartPerBlock ticks, within dartTicks), so it draws away from someone walking after it (0.1.91 mock world: darts
    // of 9 to 14 ticks, 3 apart, let them walk up onto it). Boxed in, it doubles back past them. Once they're
    // watchFrom or more off (in a zoo, out of its startle) it sits up watchTicks watching them (nearer, it keeps
    // going, up to dartsMax darts), and goes again if they come comeOn blocks nearer, or within startleRange.
    fleeRange: 6,
    startleRange: 3,
    darts: [3, 5],
    zooDarts: [2, 3],
    dartAcross: [2.5, 4],
    dartTurn: [20, 60],
    dartGap: 1,
    dartPeak: 0.45,
    dartBase: 3,
    dartPerBlock: 1.25,
    dartTicks: [6, 9],
    watchFrom: 5,
    dartsMax: 12,
    comeOn: 1,
    watchTicks: [40, 80],
    // A held Chorus Browse: within sniffReach (the tempt stops 1.5 blocks off) it sits up and sniffs, sniffTicks at a
    // time.
    sniffReach: 2,
    sniffTicks: 30,
    // The game moving it by the push: told to move minWant or more and moving less than movedShare of it, slowTicks
    // ticks running, it's carried by teleport from then on.
    minWant: 0.04,
    movedShare: 0.25,
    slowTicks: 2,
    idleSoundChance: 0.02,
  },
  // Shimmer Snails (0.1.92, animals/snail.js, animals/snailRules.js; research/end_plan.md): the rock snails' crevices and
  // grazing, Quantula's glowing trail. The End has no day or night, so it keeps to bouts: out outTicks, then sealed in
  // its shell restTicks at its resting place.
  snail: {
    outTicks: [1800, 3000],
    restTicks: [800, 1600],
    // Out, what it does next (weights): crawl about (crawlAcross blocks), graze (the Mineral Substrate within grazeReach,
    // or the end stone in the wild, grazeTicks), feed (at the feeder, eatTicks), look about (lookTicks), follow another's
    // fresh trail (touchTicks touching tentacles when it catches up). After anything, coolTicks before it chooses again.
    choices: { crawl: 0.3, graze: 0.25, feed: 0.15, look: 0.15, follow: 0.25 },
    crawlAcross: [2, 5],
    grazeTicks: [120, 240],
    eatTicks: [120, 240],
    lookTicks: [60, 120],
    touchTicks: 40,
    coolTicks: 20,
    grazeReach: 10,
    // Crawling (blocks a tick): pace grown, youngPace a hatchling (0.2 and 0.12 blocks a second: the slowest thing in the
    // park), turning turn degrees a tick; up a step's face climbPace a tick, down off one dropPace a tick. Its ways:
    // walkSteps blocks at most (wildSteps in the wild), looking through zooNodes (wildNodes) cells.
    pace: 0.01,
    youngPace: 0.006,
    turn: 6,
    climbPace: 0.03,
    dropPace: 0.05,
    walkSteps: 40,
    zooNodes: 4000,
    wildSteps: 16,
    wildNodes: 600,
    // Resting: within restReach blocks across and restRise up or down (snailRules.js restOrder); a wall's foot within
    // gatherReach of where another rests first. The wild look reads scanChunk cells a half second. Turned back on its way
    // homeTries times, it rests where it is.
    restReach: 8,
    restRise: 2,
    gatherReach: 2,
    scanChunk: 300,
    homeTries: 3,
    // Pulling in: someone in Survival or Adventure, not sneaking (nor holding its food or a carrier), within
    // startleRange of a wild one (zooStartleRange inside its exhibit), coming on comeOn blocks or more since it last
    // looked (it looks at everyone within watchRange): in withdrawTicks, out again in emergeTicks. Each time again within
    // habitWindow ticks habitFactor of the time before (withdrawMin at least); after habitAfter times it stops pulling in
    // for them until they've left it alone habitWindow ticks.
    startleRange: 3,
    zooStartleRange: 2,
    watchRange: 6,
    comeOn: 0.5,
    withdrawTicks: [80, 160],
    withdrawMin: 20,
    emergeTicks: 30,
    habitFactor: 0.6,
    habitAfter: 4,
    habitWindow: 1200,
    // A held Mineral Pellet within baitRange: it crawls to a block reachFrom blocks from them and reaches up at it,
    // reachTicks at a time.
    baitRange: 6,
    reachFrom: [0.8, 1.8],
    reachTicks: 40,
    // The trail: a mark every markEvery blocks it crawls, kept trailTicks (the particle fades over as long); grazing or
    // eating a dim one (feedBright) under its head every feedMarkEvery ticks; a hatchling's youngBright. Another's marks
    // laid within trailFresh ticks and within followReach blocks are a trail to follow; within touchReach of it at the
    // end, they touch.
    markEvery: 0.2,
    trailTicks: 900,
    trailFresh: 600,
    followReach: 3,
    touchReach: 0.9,
    // Crawling, another grown one within giveWay blocks ahead: it waits for the way to clear, waitTicks at most, then
    // goes round where it was, avoidTicks.
    giveWay: 0.6,
    waitTicks: 60,
    avoidTicks: 400,
    feedMarkEvery: 40,
    feedBright: 0.5,
    youngBright: 0.7,
    // A hatchling keeps within youngNear[1] blocks of its parent.
    youngNear: [1, 3],
    crawlSoundChance: 0.02,
    // The crevice measure keeps where the first creviceKeep crevices are. Without a crevice each (species.crevices), or
    // Mineral Substrate enough (species.mineralBed), comfort can't rise above these.
    creviceKeep: 32,
    creviceComfortCap: 50,
    bedComfortCap: 50,
  },
  // Obsidian Crabs (0.1.93, animals/crab.js, animals/crabRules.js; research/end_plan.md): the coconut crab's burrow and
  // bouts, the true crabs' sideways walk, the rock crabs' scraping. The End has no day or night, so it keeps to bouts:
  // out outTicks, then dug in restTicks (digging in over digTicks, out over emergeTicks).
  crab: {
    outTicks: [2400, 3600],
    restTicks: [600, 1200],
    digTicks: 60,
    emergeTicks: 30,
    // Out, what it does next (weights): walk about side-on (walkAcross blocks), scrape a rock face within rockReach (or
    // the ground, scrapeTicks), feed (at the Mineral Feeder, eatTicks), sift (in ground it can dig, the Mineral
    // Substrate within siftReach in a zoo, siftTicks), look about (lookTicks). After anything, coolTicks before it
    // chooses again. Scraping or eating it stands scrapeGap blocks from its cell's middle toward the rock or the feeder.
    choices: { walk: 0.3, scrape: 0.3, feed: 0.15, sift: 0.1, look: 0.15 },
    walkAcross: [3, 6],
    scrapeTicks: [100, 200],
    eatTicks: [100, 200],
    siftTicks: [80, 140],
    lookTicks: [60, 100],
    coolTicks: 20,
    rockReach: 8,
    siftReach: 8,
    scrapeGap: 0.15,
    // Walking (blocks a tick): pace side-on (a block a second), forwardPace forward (the last forwardLast blocks up to a
    // rock, the feeder or a held pellet), scuttlePace bolting (3 a second), youngPace a crablet; turning turn degrees a
    // tick; up a step's face climbPace a tick, down off one dropPace a tick. Its ways: walkSteps blocks at most
    // (wildSteps in the wild), looking through zooNodes (wildNodes) cells.
    pace: 0.05,
    forwardPace: 0.03,
    scuttlePace: 0.15,
    youngPace: 0.03,
    forwardLast: 1,
    turn: 12,
    climbPace: 0.08,
    dropPace: 0.1,
    walkSteps: 40,
    zooNodes: 4000,
    wildSteps: 16,
    wildNodes: 600,
    // Resting: within restReach blocks across and restRise up or down (crabRules.js restOrder). The wild looks read
    // scanChunk cells a half second. Turned back on its way homeTries times, it rests where it is.
    restReach: 8,
    restRise: 2,
    scanChunk: 300,
    homeTries: 3,
    // Someone in Survival or Adventure, not sneaking (nor holding its food or a carrier), coming at it comeOn blocks or
    // more since it last looked (it looks at everyone within watchRange): within startleRange of a wild one
    // (zooStartleRange inside its exhibit) it rears rearTicks; within boltRange (zooBoltRange), or hitting it, it bolts
    // boltAcross blocks (in a zoo to its burrow) and digs in hideTicks.
    watchRange: 8,
    startleRange: 4,
    boltRange: 2,
    zooStartleRange: 3,
    zooBoltRange: 1.5,
    comeOn: 0.5,
    rearTicks: [30, 50],
    boltAcross: [4, 8],
    hideTicks: [200, 400],
    // Face-offs: two grown ones out within faceOffRange both rear faceOffTicks; the smaller sidles sidleAcross blocks off.
    // Not the same two again for faceOffCool ticks.
    faceOffRange: 1.5,
    faceOffTicks: 40,
    faceOffCool: 600,
    sidleAcross: [2, 4],
    // A held Mineral Pellet within baitRange (it smells them): it walks to a block reachFrom blocks from them and reaches
    // up at it, reachTicks at a time.
    baitRange: 10,
    reachFrom: [0.8, 1.6],
    reachTicks: 40,
    // Walking, another grown one within giveWay blocks ahead: it waits for the way to clear, waitTicks at most, then goes
    // round where it was, avoidTicks.
    giveWay: 0.8,
    waitTicks: 40,
    avoidTicks: 300,
    // A crablet keeps within youngNear[1] blocks of its mother.
    youngNear: [1, 3],
    stepSoundChance: 0.04,
    // The rock measure keeps where the first rockKeep rock faces are. Without rock enough (species.rockFaces), or Mineral
    // Substrate enough to dig into (species.burrows), comfort can't rise above these.
    rockKeep: 64,
    rockComfortCap: 50,
    burrowComfortCap: 50,
  },
  // Chorus Moths (0.1.94, animals/chorusMoth.js, animals/chorusMothRules.js; research/end_pair_plan.md): the elephant
  // hawk-moth's bouts (ticks), out boutFly working its way round the chorus flowers, then boutRest at rest on a wall,
  // folded into an arrowhead. In a dim house and in the wild at any hour; in a bright house only at dusk and through the
  // night (world time of day: 0 sunrise, 12000 sunset).
  chorusMoth: {
    phases: { dusk: [12000, 13500], night: [13500, 22500], dawn: [22500, 24000] },
    boutFly: [2400, 3600],
    boutRest: [800, 1600],
    // Before every flight from rest it shivers its wings warm (warmTicks; a real one shivers for minutes in the cool);
    // startled, startleWarm, then off; not startled again for startleGap after.
    warmTicks: [60, 100],
    startleWarm: 20,
    startleGap: 100,
    // Flights (blocks a tick): quick and short in a moth house (about 2.5 m/s), faster in the wild; a caterpillar's crawl.
    fly: { cruise: 0.12, slow: 0.025, accel: 0.02, brake: 0.025 },
    wildFly: { cruise: 0.18, slow: 0.025, accel: 0.025, brake: 0.03 },
    crawl: { cruise: 0.018, slow: 0.007, accel: 0.004, brake: 0.004 },
    maxNodes: 4000, // the most air blocks one search for a way looks through
    retryTicks: 200, // no way to where it wanted: it looks again after this
    // Out, by turns: a chorus flower (flowerChance; hoverTicks at it, never one of the last recentFlowers again while
    // there are others, one it found no way to left flowerSkip ticks), the feeder (sipChance once sipGap ticks have
    // passed since it last sipped; sipTicks at the dish), a flit to a block up to flitRange away; a hover between
    // (pauseTicks).
    flowerChance: 0.75,
    hoverTicks: [60, 160],
    recentFlowers: 3,
    flowerSkip: 600,
    sipGap: 1200,
    sipChance: 0.5,
    sipTicks: [80, 160],
    flitRange: 4,
    pauseTicks: [10, 40],
    // At rest up a wall: restMin or more over the floor, high first. Someone in Survival or Adventure, not sneaking,
    // this close to one at rest startles it off to a wall fleeMin or more from them.
    restMin: 1,
    startleRange: 1.5,
    fleeMin: 3,
    // Without chorus flowers enough (species.chorusFlowers), or low light (species.lowLight), comfort can't rise above
    // these. The measure keeps where the first flowerKeep flowers and plantKeep chorus plants on the floor are.
    flowerComfortCap: 50,
    dimComfortCap: 50,
    flowerKeep: 48,
    plantKeep: 64,
    // The young: a caterpillar crawls to chorus within larvaRange and munches it (munchTicks), resting between
    // (larvaRest); someone within rearRange makes it rear (rearTicks, not again for rearGap after); burrowing in takes
    // burrowTicks; a new moth pumps its wings out for emergeTicks.
    larvaRange: 8,
    larvaRest: [60, 200],
    munchTicks: [100, 240],
    rearRange: 1.5,
    rearTicks: 40,
    rearGap: 60,
    burrowTicks: 60,
    emergeTicks: 120,
    // The wild: wall spots looked for within wildRange of home (wildSamples tries; with none at all, wildSearches
    // flights searchRange blocks out, then the ground); the chorus flowers round home found by a scan r blocks out,
    // `down` and `up` from it (up the chorus trees), perTick blocks a tick, the first wildFlowerKeep kept, looked for
    // again every `every` ticks (chorus grows, and flowers get placed or broken); never a flight
    // with no ground within voidLook blocks under it (the void); a Nectar Ration held within baitRange draws one over to
    // hover baitGap from their hands.
    wildRange: 8,
    wildSamples: 24,
    wildSearches: 3,
    searchRange: [10, 16],
    wildScan: { r: 10, down: 6, up: 14, perTick: 300, every: 1200 },
    wildFlowerKeep: 24,
    voidLook: 24,
    baitRange: 10,
    baitGap: 1.2,
  },
  // Starback Tortoises (0.1.95, animals/starback.js, animals/starbackRules.js; research/end_pair_plan.md): the Indian star
  // tortoise's day as bouts (the End has no day or night): restTicks under its low roof, drawn halfway in, then out
  // outTicks, basking warm and browsing.
  starback: {
    restTicks: [1800, 3000],
    outTicks: [3600, 6000],
    // Warmth (0 to 1, the script's): met at `start`; basking on a Warm Pad up padRise a tick (full in about 45 seconds),
    // in the open openRise (a third as fast) to openMax at most; at rest down restFall a tick, out outFall (a little
    // faster: cooled about 2 minutes after a full bask), to floor at least. It basks till `basked` (in the open, openMax) and browses till it has cooled to
    // `cooled`. A bask lasts baskMaxTicks at most.
    warm: { start: [0.25, 0.45], floor: 0.2, padRise: 0.0011, openRise: 0.00037, openMax: 0.7, restFall: 0.00015, outFall: 0.00025, basked: 0.9, cooled: 0.35 },
    baskMaxTicks: 2400,
    baskReach: 6,
    // Browsing: browseTicks at a chorus (or at the feeder, eatTicks: once a bout, by feedChance; or grazing the ground,
    // eatTicks, grazeStep blocks on each time, where there's no chorus), pauseTicks between, never back to the last
    // recentPlants. In the wild it looks for chorus within wildReach blocks, scanChunk cells a half second. It stands
    // browseGap blocks from its cell's middle toward the chorus or the feeder (short of it: a female is 0.7 wide).
    browseTicks: [200, 400],
    eatTicks: [100, 200],
    grazeStep: [2, 4],
    pauseTicks: [40, 120],
    lookTicks: [60, 100],
    recentPlants: 2,
    feedChance: 0.35,
    wildReach: 8,
    scanChunk: 300,
    browseGap: 0.12,
    coolTicks: 20,
    // Walking (blocks a tick): pace a quarter block a second, youngPace a hatchling; turning turn degrees a tick; down off
    // a step dropPace a tick (climbPace is the snail's crawl's: it never climbs). Its ways: walkSteps blocks at most
    // (wildSteps in the wild), looking through zooNodes (wildNodes) cells.
    pace: 0.0125,
    youngPace: 0.0075,
    turn: 3,
    climbPace: 0.02,
    dropPace: 0.05,
    walkSteps: 40,
    zooNodes: 4000,
    wildSteps: 16,
    wildNodes: 600,
    // Resting: within restReach blocks across and restRise up or down (starbackRules.js restOrder). Turned back on its
    // way homeTries times, it rests where it is.
    restReach: 8,
    restRise: 2,
    homeTries: 3,
    // Someone in Survival or Adventure, not sneaking (nor holding its food or a carrier), coming on comeOn blocks or more
    // since it last looked (it looks at everyone within watchRange), within startleRange of a wild one
    // (zooStartleRange inside its exhibit): it pulls into its shell withdrawTicks (a hit, hitTicks), then the head comes
    // out over peekTicks and it looks about lookTicks.
    watchRange: 8,
    startleRange: 3,
    zooStartleRange: 1.5,
    comeOn: 0.5,
    withdrawTicks: [120, 240],
    hitTicks: [300, 500],
    peekTicks: 60,
    // A held Chorus Browse or chorus fruit within baitRange: it plods to a block reachFrom blocks from them and nibbles
    // at it, baitTicks at a time.
    baitRange: 8,
    reachFrom: [0.8, 1.6],
    baitTicks: 40,
    // Walking, another within giveWay blocks ahead: it waits for the way to clear, waitTicks at most, then goes round
    // where it was, avoidTicks.
    giveWay: 0.8,
    waitTicks: 60,
    avoidTicks: 300,
    stepSoundChance: 0.02,
    // Nesting: she digs nestTicks, pats it flat patTicks; with no Mineral Substrate free, she looks again after nestRetry.
    // The father comes to her within courtRange and grunts courtTicks.
    nestTicks: 400,
    patTicks: 120,
    nestRetry: 1200,
    courtTicks: 120,
    courtRange: 12,
    // The tortoise measure keeps where the first `keep` chorus, pads and retreat cells are. Without chorus enough
    // (species.endPlants), Warm Pads enough (species.warmPads) or a retreat big enough (species.retreat), comfort can't
    // rise above these.
    keep: 64,
    plantComfortCap: 50,
    padComfortCap: 50,
    retreatComfortCap: 50,
  },
  enrichment: {
    perCategoryPerDay: 12, // enrichment restored per park day by each kind of enrichment
    fromEquipment: { basket: "forage", toy: "swim", ball: "manipulate", bone: "dig", skull: "manipulate", frame: "climb", puzzle: "manipulate", scent: "scent" }, // what each piece of equipment offers (a puzzle feeder only while it holds food the species eats; climbing trees count as climb too)
    // Nether toys (Austin, 0.1.46) count only for the species that list them in species.toys: a
    // Blaze Bone for Ember Foxes, a Wither Skull Ball for Basalt Tortoises.
    speciesToys: ["bone", "skull"],
  },
  filter: {
    unfilteredWaterDirt: 1.0, // without a working filter, dirt grows by this times the water share
  },
  recovery: {
    perDay: 60, // needs restored per park day at a Recovery Station
    holdAfterCriticalSeconds: 1200, // a park day of critical care sends an animal to recovery holding
  },
  keeperGate: {
    closeAfterTicks: 60, // gates swing shut by themselves after 3 seconds
  },
  // Ticket Booth pricing (spec sections 12 and 13). The fair price rises with the park's stars.
  admission: {
    min: 0,
    max: 40,
    fairBase: 10,
    fairPerStar: 2, // a 5-star park can charge 20
    valueLossPerCoin: 8, // value satisfaction lost per coin over the fair price
    demandPerCoinOver: 0.03,
    demandPerCoinUnder: 0.02,
    demandBonusMax: 1.2,
    demandFloor: 0.4,
    complaintBelow: 60, // a satisfaction factor under this is a complaint
  },
  ticketBooth: {
    pairRange: 8, // blocks from the Park Entrance Gate
  },
  viewing: {
    range: 24, // blocks from a Viewing Point to the animals it can show
    besideRange: 3, // a point this close to an exhibit's box belongs to that exhibit
    memorySeconds: 300, // animals out of sight this long (park seconds) and the point stops counting
    seenBase: 40, // viewing score of a seen exhibit: seenBase + seenWelfare * welfare
    seenWelfare: 0.6,
    unseenWelfare: 0.4, // glimpses over the fence
    maxAnimalsChecked: 8,
    favourite: 1.25, // a guest favourite's exhibit (species.favourite: manatees, 0.1.129): its view counts this much more
  },
  // Mixed-species exhibits (0.1.61, exhibits/mixing.js): species of one community share an exhibit;
  // it is measured with the biggest resident's profile for everyone, and needs this much more room.
  mixing: {
    spaceFactor: 1.25, // "a quarter more room" (the clipboard and the Field Journal say so)
  },
  // Sharks (0.1.125; animals/shark.js, animals/sharkRules.js): a loose shark warned by a swimmer in its tank circles them
  // circleRadius blocks out and circleDepth under, circleStep radians a step (every 10 ticks), rushes at pace.rush blocks
  // a tick (6 a second, trench_facts.md: a great white sprints at 6.7 m/s), bites within reach (the predators' danger
  // block lands it) and backs off backOff blocks. A thrown Fish Ration: it swims to it at pace.bait; blocked baitTries
  // steps in a row (the ration on the bank), it gives up on that one.
  shark: { circleRadius: 4, circleDepth: 0.6, circleStep: 0.5, backOff: 8, reach: 0.9, baitTries: 3, pace: { circle: 0.16, rush: 0.3, back: 0.18, bait: 0.2 } },
  // Giant Stingrays (0.1.127, animals/ray.js): every settleEvery ticks one goes down to the sand (a glide of pace blocks a
  // tick, given up after settleTimeout ticks), lies buried buryFor ticks, and bursts out early when someone comes within
  // burstRange blocks; with no sand to go to it looks again after retry ticks. In a tank it picks among the `near` closest
  // measured sand spots; in the wild it looks under itself and searchTries columns up to `search` blocks round it, down to
  // `depth` blocks. Without sand enough under the water its comfort can't rise above sandComfortCap.
  ray: { settleEvery: [800, 1800], buryFor: [300, 600], retry: 400, settleTimeout: 400, burstRange: 2.5, pace: 0.05, reach: 0.5, near: 8, search: 6, searchTries: 12, depth: 24, sandComfortCap: 50 },
  // Jellyfish (0.1.127, animals/jelly.js): one flashes when someone is within bumpRange blocks of it.
  jelly: { bumpRange: 2.5 },
  // Catfish (0.1.129, animals/catfish.js): every forageEvery ticks one goes down to the floor under it (no more than depth
  // blocks down; given up after downTimeout ticks, looking again after retry), gliding pace.down blocks a tick, and creeps
  // along it pace.creep blocks a tick for forageFor ticks, its heading wandering up to `swing` radians a tick (a slow meander,
  // never a twitch), and at a wall, a drop or the water's edge turning round on the spot turnRate radians a tick; belly: how
  // far over the floor it lies; reach: how close a glide gets (all the way, so it never jumps the last bit).
  catfish: { forageEvery: [600, 1400], forageFor: [160, 320], retry: 300, downTimeout: 200, depth: 12, belly: 0.05, reach: 0.05, swing: 0.04, turnRate: 0.15, pace: { down: 0.06, creep: 0.03 } },
  // Manatees (0.1.129, animals/manatee.js): a breath every breathEvery ticks (3 to 5 minutes; the first after firstBreath),
  // held breathFor ticks with the feet breathDepth under the surface (a calf's that times its size), rising pace.rise
  // blocks a tick through no more than `up` blocks of water (given up after riseTimeout); a graze every grazeEvery ticks
  // (and soon after a breath, afterBreath) for grazeFor ticks at one of the `near` closest measured seagrass spots (in the
  // wild the seagrass under it or searchTries columns up to `search` blocks round it, down to `depth`), going down at
  // pace.down (given up after downTimeout). Held ones are put back when they drift more than `drift`. Without seagrass
  // enough in the water comfort can't rise above seagrassComfortCap. Its glides go all the way (reach), so it never jumps the
  // last bit.
  manatee: { breathEvery: [3600, 6000], firstBreath: [600, 2400], breathFor: [40, 80], breathDepth: 0.6, up: 12, riseTimeout: 400, grazeEvery: [600, 1400], afterBreath: [100, 300], grazeFor: [200, 400], near: 8, search: 6, searchTries: 12, depth: 16, downTimeout: 400, retry: 300, reach: 0.05, drift: 0.2, pace: { rise: 0.08, down: 0.06 }, seagrassComfortCap: 55 },
  // The Deep Trench (0.1.130, world/trench.js and trenchRules.js): trench lines join points on a grid every `cell`
  // blocks (each joined east and south by chance), bent up to `warp` blocks by noise changing over warpScale
  // and wiggling `wiggle` blocks over wiggleScale; a trench
  // is halfWidth (give or take widthVary) blocks either side of its line, flat over the middle `flat` of that at
  // `bottom` (give or take bottomVary) and its walls rising straight to `top`, where the floor cuts them off. Columns
  // whose floor is above maxFloor are never carved; kelp and seagrass go up to plantsTop. The biome is read at biomeY,
  // the floor found from rayFrom down. Chunks within `radius` of a player are carved (looked for every 20 ticks, main.js),
  // no more than maxQueued waiting; the chunks looked at are forgotten past seenMax (the record keeps the carved ones).
  trench: {
    biome: "zoocraft:deep_trench",
    cell: 100, eastChance: 0.4, southChance: 0.3, warp: 16, warpScale: 80, wiggle: 5, wiggleScale: 24,
    halfWidth: 12, widthVary: 3, widthScale: 60, flat: 0.3, bottom: -48, bottomVary: 4, bottomScale: 30, top: 44,
    maxFloor: 50, plantsTop: 58, biomeY: 50, rayFrom: 60, radius: 2, maxQueued: 12, seenMax: 20000,
  },
  // Aquariums (0.1.119, module 6; animals/schoolRules.js, transport/carriers.js packSchool): a Water Transport Tank used
  // on a wild fish takes it and its kind within catchRange blocks (up to the species' school.max); an Aquarium Feeder
  // holds feederCapacity units of Fish Flakes (a school of 16 eats 2 a park day, so a full one lasts 48). A school's
  // shown fish are respawned when they go missing, checked every refillEvery ticks.
  aquarium: {
    catchRange: 6,
    feederCapacity: 96,
    refillEvery: 100,
    varietyBonus: 0.25, // a tank's viewing score, up by this a species beyond the first (0.1.121)...
    varietyMax: 1, // ...to at most double
  },
  // Nocturnal animals (0.1.62, 0.1.63; animals/nightRules.js): a nocturnal house is a fully enclosed
  // building, with no daylight reaching the floor and nothing brighter than maxLight inside (the
  // Nocturnal Lamps give 7; torches and glowstone give 14 to 15); there its animals are up by day and
  // sleep at night, instead of the other way round.
  nocturnal: {
    maxLight: 7, // the brightest light level allowed on the floor of a nocturnal house
    startleRange: 2.5, // blocks: someone this close who isn't sneaking makes an awake hedgehog curl up
    startleTicks: 80, // how long it stays curled (4 seconds)
  },
  // Insect Hatchery (0.1.62, equipment/hatchery.js): grows Insect Rations on its own, a batch every
  // minute or two (the block's own tick), up to this many batches; use it to take them out.
  hatchery: {
    batches: 3,
    rationsPerBatch: 2,
  },
  guests: {
    max: 6, // visible guests at once, the rest are numbers
    perAdmissions: 4, // one visible guest per this many expected admissions a day
    spawnRange: 48, // only near players
    minSpawnDistance: 8, // not right in front of someone
    lifetimeSeconds: [200, 400], // real seconds a visible guest stays before heading for the gate
    arrivalSeconds: 6, // real seconds between two arrivals at most
    atGateShare: 0.8, // share of new guests who arrive through the entrance gate
    watchRange: 3, // blocks from a working Viewing Point's standing spot where a guest stops to watch
    watchSeconds: [10, 20], // real seconds a guest watches the animals from a Viewing Point
    leaveSeconds: 60, // real seconds a leaving guest has to reach the gate before vanishing out of sight
    greetSeconds: 40, // real seconds after arriving that a guest may still greet you (0.1.97)
    // Nether and End visitors (0.1.98, visitors/visitorMix.js): their shares follow the species on show.
    themedCap: 0.6, // the Nether and End visitors together at most this share, so everyday guests always come
    themedPull: 2, // a themed visitor counts an exhibit with an animal from its dimension this many times when it picks where to walk
    // Journeys (0.1.60): guests walk the path network to far Viewing Points, stands and benches.
    walkSpeed: 0.11, // blocks per tick along a route (a little under a player's walk)
    tripAfterSeconds: [6, 20], // real seconds of strolling before a guest sets off somewhere else
    tripRange: 1200, // blocks: how far a journey may go (as the route runs; 0.1.64: across a 500-block park and back)
    routeReach: 2, // a spot counts as on the network when a reached path is this close sideways
    // Far travel (0.1.64): a guest out of every player's range walks on as a ghost and gets an entity
    // again when a player comes near; the route search is spread over ticks.
    maxGhosts: 12, // guests walking on out of sight at once
    searchPerTick: 200, // path blocks a route search looks at in one job slice (0.1.96: was 500, about 15 ms in the game's script engine; the searches queue in one job, core/jobs.js)
  },
  // Guest services (spec sections 12 and 13): paths, Snack Stands, Benches, Litter Bins, Donation Boxes.
  paths: {
    maxNodes: 50000, // path blocks one walk may cover (0.1.64: enough to pave a 500-block park)
    perYield: 60, // path blocks walked in one job slice (0.1.96: was 120, about 1500 block reads; the game runs more slices when a tick has time)
    startRange: 3, // path blocks this close to the Park Entrance Gate start the walk
    reach: 2, // a feature counts when a reached path is this close sideways
    recheckSeconds: 30, // real seconds between walks when nothing changed (0.1.64: the map fills in as players roam)
    frontierRange: 40, // blocks: a player this near the first unchecked edge sets off another walk at once
    tutorialBlocks: 5, // path blocks from the entrance that finish the tutorial step
  },
  snacks: {
    capacity: 64, // snacks a stand holds
    defaultPrice: 4,
    min: 1,
    max: 15,
    fair: 4, // guests' idea of a fair snack price
    shareAtFair: 0.35, // share of guests who buy one at the fair price
    sharePerCoinOver: 0.03,
    sharePerCoinUnder: 0.03,
    shareMax: 0.5,
    wholesaleBundle: 8, // snacks bought from the supply line at once
    wholesaleCost: 2, // coins per snack bought in
    guestsPerStand: 30, // expected daily guests one stand serves
    refundItem: "minecraft:bread", // a broken stand hands back bread for its stock
    refundPerItem: 2,
  },
  // Vanilla food a keeper can stock a Snack Stand with: snacks per item.
  snackFoods: {
    "minecraft:bread": 2,
    "minecraft:cookie": 1,
    "minecraft:apple": 1,
    "minecraft:melon_slice": 1,
    "minecraft:baked_potato": 2,
    "minecraft:pumpkin_pie": 3,
    "minecraft:cake": 6,
    "minecraft:sweet_berries": 1,
  },
  seating: {
    guestsPerBench: 8, // expected daily guests per bench
    minBenches: 2,
    // Coverage (0.1.99): a path block with a working Bench within coverRange blocks sideways and coverRise up or down
    // is covered (25: half of Inclusive Mobility's 50 m most between seats); the seating part counts spreadBase of
    // itself with every bench in one corner, all of it with the paths covered.
    coverRange: 25,
    coverRise: 4,
    spreadBase: 0.7,
  },
  litter: {
    perGuest: 0.5,
    perSnack: 1,
    binCapacity: 32,
    scorePerUnit: 2, // tidiness lost per unit of litter on the paths
    max: 60, // litter on the paths stops piling up here
    rakeSweeps: 25, // litter one Cleaning Rake sweep picks up off a path
    rakeCooldown: 10, // park seconds between sweeps per player
    // Coverage (0.1.99): a path block with a working Litter Bin within coverRange blocks sideways and coverRise up or
    // down is covered (12: Keep America Beautiful's litterers were on average 9 m from a bin); binnedBase of the
    // litter reaches the bins with bins only by the gate, all of it with the paths covered; the rest lands on the paths.
    coverRange: 12,
    coverRise: 4,
    binnedBase: 0.5,
    minBins: 1, // bins a park needs at least (more for a day's litter: serviceRules.js binsNeeded)
  },
  // Restrooms and Water Fountains (0.1.100, research/guests_facts.md): two more parts of the services score, by how many
  // there are against one for every `guestsPer` expected daily guests (`min` at least). None at all counts `none` (guests
  // make do, so parks built before 0.1.100 don't drop to nothing), all that's needed 100. Fountains serve a guest in
  // seconds, so codes ask for far fewer of them than toilets (the IPC's outdoor venues: a drinking fountain per 1,000
  // people, a toilet per 40 to 75).
  restrooms: { guestsPer: 30, min: 1, none: 50 },
  drinks: { guestsPer: 100, min: 1, none: 50 },
  // Path Lamps and Planters (0.1.100): a path block with a working one within coverRange blocks sideways and coverRise up
  // or down is covered. A lamp's lantern (light 15) leaves every path block it covers at light 1 or more, so no monsters
  // spawn there (Bedrock since 1.18: block light 0 only), and lamps 16 blocks apart light a whole path.
  lamps: { coverRange: 8, coverRise: 2 },
  planters: { coverRange: 8, coverRise: 2 },
  // A well-furnished park (0.1.99): an amenity covering `cover` of the paths, with enough of them for the guests,
  // brings `guests` more guests a day; all together at most `cap` (0.1.100: lamps lighting 80% of the paths, planters
  // near half of them).
  amenities: {
    cap: 0.1,
    bins: { cover: 0.9, guests: 0.025 },
    benches: { cover: 0.9, guests: 0.025 },
    lamps: { cover: 0.8, guests: 0.025 },
    planters: { cover: 0.5, guests: 0.025 },
  },
  donations: {
    perGuest: 1.5, // coins per guest at full coverage and perfect welfare
    range: 16, // a box counts within this many blocks of a working Viewing Point
    boxesForFull: 2,
  },
  services: {
    weights: { food: 0.3, seating: 0.2, litter: 0.2, restrooms: 0.15, drinks: 0.15 }, // 0.1.100 (was food 0.4, seating 0.3, litter 0.3)
  },
  // Gift Shop (spec section 12: shops): a building the players make, like the Staff Room, that a
  // guest path reaches. Guests buy souvenirs on the way out; more after a memorable visit.
  giftShop: {
    capacity: 64, // souvenirs a shop holds
    defaultPrice: 8,
    min: 1,
    max: 30,
    fair: 8, // guests' idea of a fair souvenir price
    shareAtFair: 0.25, // share of guests who buy one at the fair price after a perfect visit
    sharePerCoinOver: 0.02,
    sharePerCoinUnder: 0.015,
    shareMax: 0.4,
    welfareFloor: 0.4, // even unhappy animals sell a few souvenirs
    varietyBase: 0.5, // one kind of animal on view: 75% of the sales; two or more: all of them
    varietyPerSpecies: 0.25,
    wholesaleBundle: 8, // souvenirs bought from the supply line at once
    wholesaleCost: 4, // coins per souvenir bought in
    refundItem: "minecraft:paper", // a broken shop hands back paper for its stock
    refundPerItem: 1,
    roomMinSize: 3, // the shop building needs this n x n x n of open space inside
    roomMaxCells: 1500,
    roomRecheckSeconds: 120,
    roomCellsPerYield: 50, // the re-measure after an edit and the regular one run as a job, this many blocks of the walk a slice (0.1.96)
  },
  // Guided tours (0.1.65, spec section 13: tours are park revenue): a Tour Desk on the guest side that
  // a path reaches, Tour Guides hired there, tickets sold as a share of the visitors (a fair price,
  // fewer buyers per coin over it, more buyers the more stops the walk makes), and a walk along the
  // path network to every exhibit with a working Viewing Point and back.
  tours: {
    defaultPrice: 6,
    min: 1,
    max: 25,
    fair: 6, // guests' idea of a fair ticket price
    shareAtFair: 0.2, // share of guests who buy a ticket at the fair price when the walk shows the whole park
    sharePerCoinOver: 0.02,
    sharePerCoinUnder: 0.015,
    shareMax: 0.35,
    stopsBase: 0.4, // a walk with one stop sells 55% of that, four stops or more all of it
    stopsPer: 0.15,
    groupSize: 8, // ticket holders one guide takes round at once
    toursPerGuide: 6, // tours one guide leads in a park day (so a guide sells 48 seats a day)
    guideWage: 30, // coins per guide per park day
    guidesPerDesk: 2, // guides each Tour Desk employs
    maxGuides: 6,
    maxStops: 6, // exhibits one walk visits at most (nearest first)
    maxLength: 1200, // route blocks a walk may be, there and back
    walkSpeed: 0.1, // blocks per tick the guide walks (a little under a guest)
    talkSeconds: 8, // real seconds the guide talks at each stop
    talkRange: 12, // blocks: players this close hear the guide
    restSeconds: 20, // real seconds a guide rests at the desk between groups
    followers: 3, // ticket holders shown walking behind the guide (the rest are numbers)
    followGap: 24, // ticks each follower trails the one before
    spawnRange: 48, // the guide and group are shown while a player is this close
    replanSeconds: 60, // real seconds between plans of a desk's walk when nothing changed
    deskRecheckSeconds: 30, // real seconds between re-checks of a desk's path and standing spot
  },
  // Void Rays (0.1.66, Austin's ideas 5 and 7): giant adults, taming and riding the wild ones, more
  // of them near End Cities. The client scale and collision boxes live in the entity files; these
  // are the script's numbers.
  rays: {
    mount: {
      speed: 0.3, // blocks per tick a ridden tamed ray flies at full forward input
      strafe: 0.18, // blocks per tick sideways
      rise: 0.16, // blocks per tick straight up while the jump button is held
      climb: 0.22, // how much of the rider's look pitch becomes climb or dive when flying forward
      turn: 12, // degrees per tick the ray turns toward where the rider looks
      range: 48, // blocks: tamed rays this close to a player are steered (a ridden one always is)
      callRange: 24, // blocks: a player holding Chorus Browse this close calls a tamed ray over
      dropHeight: 4, // blocks over the ground: a rider getting off higher than this floats down
      floatTicks: 200, // slow falling given to a rider who gets off high up
      tameChance: 0.3, // chance each Chorus Browse tames a wild ray (the entity's tameable probability)
    },
    cities: {
      everySeconds: 30, // real seconds between checks per player in the End
      shulkerRange: 48, // blocks: a shulker this close means an End City is about
      rayRange: 64, // blocks: wild rays this close count toward the cap
      maxNear: 6, // wild rays near a city at most
      perCity: 8, // rays one city gets in a session at most (a city is a 64-block square)
      over: [6, 12], // blocks over a shulker a new ray appears
      group: [1, 2], // rays per spawn
    },
  },
  // The Void Ray Expedition (0.1.66, Austin's idea 7): an Expedition Platform sells rides over the
  // park's exhibits on the zoo's own Void Rays, assigned to the ride at the platform.
  ride: {
    defaultPrice: 10,
    min: 1,
    max: 40,
    fair: 10, // guests' idea of a fair ride price
    shareAtFair: 0.15, // share of guests who buy a ride at the fair price
    sharePerCoinOver: 0.012,
    sharePerCoinUnder: 0.01,
    shareMax: 0.25,
    seats: 4, // guests one ray carries (the entity's seats)
    ridesPerDay: 6, // rides one ray makes in a park day at most
    maxRays: 3, // rays one platform may have assigned
    restSeconds: 30, // real seconds a ray rests on its platform between rides
    boardSeconds: 6, // real seconds the ray waits on the platform while its riders climb on
    hoverSeconds: 5, // real seconds it hovers over each exhibit
    clearance: 8, // blocks over the highest exhibit on the loop it cruises
    minCruise: 12, // blocks over the platform at least
    skyClear: 16, // blocks of open sky the platform needs above it
    loopSpeed: 0.2, // blocks per tick on the loop (a little faster than a free ray)
    climbSpeed: 0.12, // blocks per tick straight up or down over the platform
    reach: 1.5, // blocks: close enough to a waypoint to take the next
    maxStops: 6, // exhibits one loop flies over at most (nearest first)
    maxLeg: 160, // blocks: an exhibit farther than this from the platform is left out
    spawnRange: 64, // blocks: the ray and its riders are shown while a player is this close
    welfareMin: 60, // a ray below this welfare (the "healthy" band) stays in its exhibit
  },
  // Things players can stock a Gift Shop with: souvenirs per item (plush toys, postcards, prints).
  giftItems: {
    "minecraft:white_wool": 2,
    "minecraft:light_gray_wool": 2,
    "minecraft:gray_wool": 2,
    "minecraft:black_wool": 2,
    "minecraft:brown_wool": 2,
    "minecraft:red_wool": 2,
    "minecraft:orange_wool": 2,
    "minecraft:yellow_wool": 2,
    "minecraft:lime_wool": 2,
    "minecraft:green_wool": 2,
    "minecraft:cyan_wool": 2,
    "minecraft:light_blue_wool": 2,
    "minecraft:blue_wool": 2,
    "minecraft:purple_wool": 2,
    "minecraft:magenta_wool": 2,
    "minecraft:pink_wool": 2,
    "minecraft:paper": 1,
    "minecraft:painting": 3,
  },
  shop: {
    // Park menu vendor, in Zoo Coins. `sell` is what the shop pays back per item (rations only).
    "zoocraft:leafy_ration": { price: 2, bundle: 8, sell: 1 },
    "zoocraft:fish_ration": { price: 3, bundle: 8, sell: 1 },
    "zoocraft:small_carrier": { price: 30, bundle: 1 },
    "zoocraft:livestock_crate": { price: 60, bundle: 1 },
    "zoocraft:reinforced_crate": { price: 120, bundle: 1 },
    "minecraft:packed_ice": { price: 4, bundle: 8 }, // for Cooling Units
    "zoocraft:mineral_pellets": { price: 3, bundle: 8, sell: 1 },
    "zoocraft:ember_ration": { price: 4, bundle: 8, sell: 1 },
    "zoocraft:molten_plankton": { price: 4, bundle: 8, sell: 1 },
    "minecraft:warped_fungus": { price: 3, bundle: 8 }, // for Striders; it grows on warped nylium, so the shop doesn't buy it back
    "zoocraft:thermal_carrier": { price: 180, bundle: 1 },
    "minecraft:charcoal": { price: 2, bundle: 8 }, // for Thermal Regulators
    "zoocraft:chorus_browse": { price: 4, bundle: 8, sell: 1 },
    "zoocraft:insect_ration": { price: 4, bundle: 8, sell: 1 }, // for hedgehogs; an Insect Hatchery grows them for free
    "zoocraft:fruit_ration": { price: 3, bundle: 8, sell: 1 }, // for raccoons
    "zoocraft:flamingo_pellets": { price: 3, bundle: 8, sell: 1 }, // for flamingos
    "zoocraft:grain_ration": { price: 3, bundle: 8, sell: 1 }, // for zebras
    "zoocraft:meat_ration": { price: 4, bundle: 8, sell: 1 }, // for lions, tigers and crocodiles
    "zoocraft:fungal_ration": { price: 3, bundle: 8, sell: 1 }, // for Crimson Grazers
    "zoocraft:nectar_ration": { price: 3, bundle: 8, sell: 1 }, // for Soul Moths and Chorus Moths
    "zoocraft:stabilized_carrier": { price: 240, bundle: 1 },
  },
  // The Zoo Bank (0.1.102, research/bank_plan.md): Zoo Coins for blocks. The prices are in data/bankPrices.js.
  bank: {
    pageSize: 40, // blocks to a page of a group or a search
    recentKeep: 6, // blocks remembered in each player's "bought lately"
  },
  // Keepers (spec section 14). Wages follow the spec's example day (section 13).
  staff: {
    keeperWage: 40, // coins per keeper per park day
    maxKeepers: 6,
    keepersPerRoom: 2, // keepers each Staff Room can house
    exhibitsPerKeeper: 4,
    roomCapacity: 256, // ration units one Staff Room holds
    buyBundle: 16, // rations bought straight into a Staff Room at once (shop price)
    visibleRange: 48, // with a player this close to a job, the keeper walks there and does it in view
    reach: 3, // blocks from the job where a keeper can work
    travelSeconds: 30, // active seconds to get to a job before giving up on it for now
    workSeconds: 4, // refilling a feeder, basket or trough
    cleanSeconds: 10, // raking an exhibit
    awaySeconds: 20, // a job done out of sight takes this long
    lingerSeconds: 10, // a keeper seen working stays this long after the last job before leaving
    retrySeconds: 60, // a job a keeper gave up on waits this long
    feedBelowDays: 1, // keepers refill feeders holding less than this many days of food
    cleanBelow: 60, // and clean exhibits below this cleanliness
    binEmptyAt: 0.75, // and empty Litter Bins this full (0.1.99, park-wide: any keeper, after the exhibits' urgent jobs)
    binApproach: 6, // blocks along the path from a bin where a keeper seen emptying it comes in
    roomMinSize: 3, // a Staff Room is a building with at least this many blocks each way of open space inside
    roomMaxCells: 1500, // open space bigger than this is the outside, not a room
    roomRecheckSeconds: 120, // rooms are measured again this often (catches explosions and other edits)
    roomCellsPerYield: 50, // the re-measure after an edit and the regular one run as a job, this many blocks of the walk a slice (0.1.96)
  },
  rating: {
    weights: { welfare: 0.4, satisfaction: 0.25, variety: 0.2, operations: 0.15 },
    criticalCapStars: 2,
  },
  park: {
    // The fenced park area (0.1.101, park/fence.js): Aluminum Fence closed round the Park Deed's spot is the park, and
    // a park has no ground until its fence closes (Austin, 2026-10-25: "Required"). 0.1.106 (Austin, 2026-10-26: "The
    // zoo should just be where aluminum fences enclose. That way we are not scanning 500 blocks if its just 100 x
    // 100"): the 500-block circle older parks kept and the 500-block reach on the fence are gone; the fence's own box
    // is all that's ever worked over.
    fenceSettleTicks: 60, // the area is worked out 3 seconds after the last fence change
    fenceCellsPerSlice: 4000, // fill cells a job slice
    // 0.1.114 (several parks a world): a new park's Park Deed spot has to be this far (blocks, each way) from every
    // other park's spot, so two fences can't both be "the fence round the spot".
    spotGap: 16,
  },
  tutorial: {
    reward: 100, // Zoo Coins, once, when the last step is done
    maxKitClaims: 3, // replacement starter kits per park, one per park day
    kit: [
      { item: "zoocraft:exhibit_controller", amount: 1 },
      { item: "zoocraft:habitat_marker", amount: 1 },
      { item: "zoocraft:basic_feeder", amount: 1 },
      { item: "zoocraft:small_carrier", amount: 1 },
      { item: "zoocraft:leafy_ration", amount: 4 },
    ],
  },
  // Research effects that aren't one of the numbers above (research/research.js reads them; the
  // project texts in data/research.js say the same in words).
  research: {
    parkGuidebook: { guests: 0.1 }, // more guests a day
    endGuidebook: { guests: 0.1 }, // more guests a day while an End animal is on show
    anchorTuning: { capacity: 48, unitsPerDay: 1 }, // Containment Anchors after Anchor Tuning
    reintroduction: { cooldownDays: 2 }, // the wild takes the next animal of a species sooner
  },
  // The End expedition (quests/expeditionSteps.js): the campaign chain after the tutorial.
  expedition: {
    reward: 300, // Zoo Coins, once, when the last step is done
  },
  // Conservation releases (spec sections 9 and 15; M6): who may go back to the wild and what it earns.
  conservation: {
    welfareMin: 70, // an animal copes in the wild at this welfare or more
    minDays: 3, // park days settled in the park before it may go
    cooldownDays: 4, // the wild takes one animal of a species this often (Reintroduction Science: 2)
    minDistance: 600, // blocks from the Park Deed's spot, for a park with no fence closed yet (it has no edge to measure from)
    beyondFence: 100, // a fenced park (0.1.101): at least this many blocks beyond its fence
    reward: 80, // Zoo Coins per release (bounded: one release per species per cooldown)
    guestsPerRelease: 0.02, // reputation: 2% more guests a day per release...
    guestsCap: 0.1, // ...up to 10%
    questReward: 250, // Zoo Coins, once, when the conservation chain is done
  },
  // Exhibit measurements (exhibits.js serviceValidations, every 2 seconds; 0.1.96).
  validation: {
    startsPerRun: 2, // measurements started each run (edits first): a park re-checked all at once lagged
    sweepRuns: 60, // each occupied exhibit is re-checked once every this many runs (2 minutes)
  },
  // The benchmark park (0.1.96, bench/): a full park to time the script loops with. Its park record carries these,
  // and only there do they lift the usual caps (guests.max and staff.maxKeepers).
  benchmark: {
    guests: 40, // visible guests at once
    keepers: 10, // the Staff Rooms house this many
    arrivalSeconds: 2, // real seconds between two arrivals at most (the guest loop runs every 2 seconds)
    arrivals: 3, // guests who arrive at once (40 in about half a minute once the Viewing Points have been checked)
    runSeconds: 60, // how long /zoocraft:benchmark run measures unless told
    startCleanliness: 50, // each exhibit starts under staff.cleanBelow, so the keepers have work to show
  },
};
