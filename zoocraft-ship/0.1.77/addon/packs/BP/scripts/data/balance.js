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
  },
  // Mixed-species exhibits (0.1.61, exhibits/mixing.js): species of one community share an exhibit;
  // it is measured with the biggest resident's profile for everyone, and needs this much more room.
  mixing: {
    spaceFactor: 1.25, // "a quarter more room" (the clipboard and the Field Journal say so)
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
    // Journeys (0.1.60): guests walk the path network to far Viewing Points, stands and benches.
    walkSpeed: 0.11, // blocks per tick along a route (a little under a player's walk)
    tripAfterSeconds: [6, 20], // real seconds of strolling before a guest sets off somewhere else
    tripRange: 1200, // blocks: how far a journey may go (as the route runs; 0.1.64: across a 500-block park and back)
    routeReach: 2, // a spot counts as on the network when a reached path is this close sideways
    // Far travel (0.1.64): a guest out of every player's range walks on as a ghost and gets an entity
    // again when a player comes near; the route search is spread over ticks.
    maxGhosts: 12, // guests walking on out of sight at once
    searchPerTick: 500, // path blocks a route search looks at in one tick
  },
  // Guest services (spec sections 12 and 13): paths, Snack Stands, Benches, Litter Bins, Donation Boxes.
  paths: {
    maxNodes: 50000, // path blocks one walk may cover (0.1.64: enough to pave a 500-block park)
    perYield: 120, // path blocks walked per game tick slice
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
  },
  litter: {
    perGuest: 0.5,
    perSnack: 1,
    binCapacity: 32,
    scorePerUnit: 2, // tidiness lost per unit of litter on the paths
    max: 60, // litter on the paths stops piling up here
    rakeSweeps: 25, // litter one Cleaning Rake sweep picks up off a path
    rakeCooldown: 10, // park seconds between sweeps per player
  },
  donations: {
    perGuest: 1.5, // coins per guest at full coverage and perfect welfare
    range: 16, // a box counts within this many blocks of a working Viewing Point
    boxesForFull: 2,
  },
  services: {
    weights: { food: 0.4, seating: 0.3, litter: 0.3 },
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
    "zoocraft:stabilized_carrier": { price: 240, bundle: 1 },
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
    roomMinSize: 3, // a Staff Room is a building with at least this many blocks each way of open space inside
    roomMaxCells: 1500, // open space bigger than this is the outside, not a room
    roomRecheckSeconds: 120, // rooms are measured again this often (catches explosions and other edits)
  },
  rating: {
    weights: { welfare: 0.4, satisfaction: 0.25, variety: 0.2, operations: 0.15 },
    criticalCapStars: 2,
  },
  park: {
    radius: 500, // park boundary around the claim point (0.1.64, Austin: "scan within 500 blocks"; was 128)
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
    minDistance: 600, // blocks from the park centre: the wild starts past the park boundary (500)
    reward: 80, // Zoo Coins per release (bounded: one release per species per cooldown)
    guestsPerRelease: 0.02, // reputation: 2% more guests a day per release...
    guestsCap: 0.1, // ...up to 10%
    questReward: 250, // Zoo Coins, once, when the conservation chain is done
  },
};
