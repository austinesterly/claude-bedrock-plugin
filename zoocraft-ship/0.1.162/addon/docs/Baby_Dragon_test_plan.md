# Baby Dragon: test plan (0.1.162)

Module 10, bosses: the third boss. Austin: "then lets go to the next module". The design is in research/boss_plan.md.

What it does:
- Wild Baby Dragons live on the outer End islands (more than 800 blocks out from the middle of the End), one to an area.
  Walking there as a park member with no lair within 800 blocks gets one made 32 to 48 blocks away: a round clearing 17
  across of end stone with patches of end stone bricks, an obsidian pillar 3 by 3 and 8 high flecked with crying
  obsidian in its middle, the nest on top (a 7 by 7 platform of end stone bricks with an obsidian rim, purpur in its
  middle, low walls and end rods at its corners) and three short obsidian spikes round the back of the clearing. The
  dragon is put on its nest. If it goes missing, it comes back.
- It is about 6 blocks nose to tail with a 10-block wingspan: black scales, a dark violet belly, big glowing violet eyes.
  It flies by itself (no gravity) and never falls into the void.
- Calm: it perches on its nest asleep (curled up) or awake looking about, on its own clock (the End has no night); awake,
  now and then it breathes a plume of violet fire into the sky or growls. Now and then it takes off, circles its lair
  for 16 to 30 seconds and lands back on its nest.
- It fights when you hit it (an arrow counts), or when you walk within 7 blocks of the ground under it in Survival or
  Adventure without sneaking. Creative players and sneaking players are left alone. On its nest it rears up and
  screeches (2.6 seconds) and takes off; already flying, it hovers and roars. Its boss bar shows ("Baby Dragon").
- In the fight it circles you in the air 10 to 14 blocks out and 5 to 9 up, and every 2.5 seconds makes a move with a
  wind-up you can see:
  - the dive (6 to 26 blocks off): it hangs with its wings drawn back and screeches (0.9 s), then dives straight at the
    spot where you stood (step aside): 7 and about 3 blocks of knock back. It lands where it hit and shakes its head
    for 2 seconds: the time to hit it with a sword. Then it climbs back up.
  - the void bolt (6 to 28 off): it hovers and rears its head back (1 s), then spits a violet bolt straight at your
    chest: 5. It breaks nothing and fades after 4 seconds. It only spits when it has a clear line to you.
  - the wing gust (within 20): it swoops down in front of you, 3 up and 5 out, draws its wings up and beats them: 3
    and a strong push to everyone within 8 in front of it.
  - Mojang's difficulty scales the dive and the gust: on Easy the dive is 4.5 and the gust 2.5. The bolt is 5 on any
    difficulty.
- The void guard: a push that would throw you off the island (no ground within 24 blocks under the spot 4 blocks along
  it) is cut to a nudge.
- At half its energy it hovers with its wings wide and roars: everyone within 12 blocks, even well under it, is slowed
  (Slowness II, 3 seconds) and pushed back, and it is quicker after (a move every 1.5 seconds).
- It is never killed. Only a player's hits wear it down; at 30 of its 300 it glides down to the clearing at its pillar's
  foot and lies there panting, its bar gone, and nothing hurts it. Only now does the Dragon Crate work.
- Left alone (nobody within 32 blocks) for a minute it gets up rested and flies back to its nest. A fight also ends if
  you leave its lair, or after a minute with no hit from you.
- The Dragon Crate: Dragon Tracking research (Research Desk, after 5 ready exhibits: 8 purpur blocks, 2 eyes of ender,
  a compass, 300 coins), then 4 obsidian, 2 purpur blocks, 2 ender pearls and a Reinforced Crate at the Zoo Workshop
  (obsidian in the corners, purpur top and bottom middle, ender pearls at the sides, the crate in the middle). Used on
  a tired-out wild one with a Meat Ration in your inventory. With Dragon Tracking done, the Field Journal's Places page
  has "Baby Dragon Lairs" with the way to the nearest wild one.
- In a zoo it is calm, can't be hurt, and is a guest favourite. It lives as the Glade's Dragon does: a great roofed
  flight hall (900 blocks of floor for one, 300 more for a second, 16 blocks of headroom), End ground in the floor (100
  or more end stone blocks; Chorus Turf and Rift Turf count too; comfort stops at 55 without it), a Basic Feeder of Meat
  Rations (4 units a park day). No campfire needed: an empty hall is measured for flight once its floor has the end
  stone. It flies round its hall, lands to stand, bask, roar, breathe violet fire, eat and sleep. Alone or a pair.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated Survival player in the outer
End at 548 2048; a short calm cycle in two runs so it would come round in minutes):
- Lairs were made 32 to 48 blocks from the player, built in well under a second (one: 201 end stone and 31 end stone
  bricks of floor, the pillar, a nest of 20 obsidian, 20 end stone bricks and 5 purpur). The dragon sat on its nest.
- Calm: awake, asleep; up circling its lair and back down onto its nest, four times round over two runs, each landing
  in 5 to 6 seconds.
- Sneaking 6 blocks off on the floor under it in Survival: it stayed calm. Not sneaking: it screeched 2.6 seconds, took
  off and fought. 13 dives in one fight: 9 hit (4.5, pushed about 3 blocks) and it lay stunned 2 seconds after each;
  gusts hit for 2.5 and pushed 3.8 blocks; bolts hit for 5 from 7 to 11 blocks off.
- Angry under 150: it roared and the player had Slowness II. Worn down from 34: at 30 it stopped, its bar went off, it
  glided down to the clearing and lay panting; hits after did nothing; the crate check said yes.
- The player 40 blocks off: after a minute it got up rested (300), flew out from under its nest's rim, up over the nest
  and down onto it.
- Found and fixed on the server: it could hover stuck under its nest's rim (now it flies out and up first, and goes
  round anything it is stuck on); dives past its pillar gave up (now it dives only with a clear way); bolts spat from
  beside its pillar hit its own lair (now it spits only with a clear line, and starts no move while it is getting
  round something); a spike of the lair stood in its rest spot, so its glide down never arrived (the spikes now stand
  at the back); going slantwise past its pillar's corner it caught the corner and hung still (now it slides past
  along one way, and checks its way round in quarter-block steps); a bolt spat past its nest's rim clipped the rim's
  corner (now its path is checked closely enough to catch a graze); circling high over its nest, its angry roar missed the player
  11 blocks under it (it now reaches 16 up or down).
- Six more runs (E to J) checked those fixes and found the last ones, each fight logged step by step, with the dragon
  also put on purpose in the spots it had stuck in (beside its pillar, under its nest's rim):
  - Bolts: 44 of 47 hit the player (5 each, from 5 to 12 blocks off). Of the other three, one was spat while the test
    moved the dragon mid wind-up, and two clipped its nest's rim: one fixed in E (the wing gust's fallback bolt had no
    line check) and one in H (its line grazed the rim's corner; now the line is checked closely enough to catch a
    graze). Run J: 7 of 7 hit.
  - Dives: 13 of 16 hit for 4.5, and it lay stunned after each hit. Gusts: 26 of 30 hit for 2.5.
  - Wedged at its pillar's corner it once hung still for 2 seconds (G); now it slides past along one way. In H, I and
    J all twelve wedges got out within 4 seconds.
  - Angry: in H it circled 11 blocks over the player when it roared, and the roar missed (it reached only 10 up or
    down); now 16. In I and J the player was slowed (Slowness II).
  - Worn down to 30 it glided to its rest spot in 2.6 to 9 seconds (52 to 182 ticks) and lay there; with the player
    35 to 40 blocks off it got up rested after a minute (1204 to 1208 ticks) and was home on its nest in 8 to 9
    seconds. No script errors in any run.
- The test zoo (/zoocraft:build, now 59 exhibits in 220 x 220): the Baby Dragon's hall (31 x 31, end stone floor, 909
  end stone blocks counted) measured ready for flight with 16 blocks of headroom, no warnings; its dragon stood, basked,
  flew round its hall 6 to 12 blocks up, landed to eat and roar, flew again, landed and basked; 150 seconds, no errors.

New entity, item and texture files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | In Creative, look in the creative menu under Equipment, and for a spawn egg. | The Dragon Crate (an obsidian and purpur crate) and the Wild Baby Dragon Spawn Egg. |
| 2 | Survival, as a member of a park, go to the End and fly or bridge out to the outer islands (more than 800 blocks from the middle), and walk about a little on end stone. | Within a few seconds, 32 to 48 blocks away: a round end stone clearing with an obsidian pillar in the middle, a nest on top with end rods at its corners. A black baby dragon with glowing violet eyes on the nest. |
| 3 | Watch it from a distance for a few minutes. | It sleeps curled up, wakes and looks about, now and then breathes violet fire upward; sometimes it takes off, flies round its lair and lands back on its nest. |
| 4 | Walk up under it sneaking, right by the pillar. In Creative too. | It doesn't mind. |
| 5 | Stop sneaking within 7 blocks of the pillar's foot (or shoot it with an arrow). | It rears up and screeches, takes off; the boss bar "Baby Dragon" shows at the top. |
| 6 | Stay in the open and watch it circle. | Every few seconds: it hangs with its wings back and screeches, then dives at where you stood (step aside); or it hovers, rears its head back and spits a violet bolt at you; or it swoops down in front of you and beats its wings (a strong push). |
| 7 | After a dive, hit it with a sword while it shakes its head on the ground. | It takes the hits; then it climbs back up. |
| 8 | Stand at an island's edge and let it gust you. | You are pushed, but never off the island into the void. |
| 9 | Wear it down to half (a bow is easiest). | It hovers with its wings wide and roars; you are slowed and pushed back. It moves quicker after. |
| 10 | Keep hitting it. | At the last tenth it glides down to the clearing by its pillar and lies panting; the bar goes; hits do nothing. |
| 11 | Use a Dragon Crate on it with a Meat Ration in your inventory (after Dragon Tracking research). Before it is tired, try the crate too. | Tired: it goes in (the crate shows it's occupied). Not tired: "A Baby Dragon only goes into its crate once it is tired out...". |
| 12 | Another one: wear it down, then walk 40 blocks off and wait a minute. | It gets up, flies up and out from under its nest, and lands on the nest; its bar is full again when you next fight it. |
| 13 | Field Journal, Places, after Dragon Tracking. | "Baby Dragon Lairs" with the way to the nearest wild one. |
| 14 | Build a great roofed flight hall (30 x 30 floor, 16 blocks of headroom) with end stone in its floor (100 blocks or more) and a Basic Feeder of Meat Rations, and release it. `/zoocraft:build` also has one. | The Exhibit Clipboard shows the hall ready with End ground. It flies round its hall, lands, basks, roars, breathes violet fire, eats and sleeps. Guests like it. |
| 15 | Open the content log (Settings, Creator) after the steps above. | No lines about `boss`, `drake` or `dragons`. |
