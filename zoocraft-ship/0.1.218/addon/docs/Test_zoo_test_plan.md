# Test zoo test plan (0.1.104, fixed in 0.1.105 and 0.1.218)

Austin: "can you make a zoocrsft build command with the aluminum fences and a 100 x 100 zoo so I can test easier", then
"Make an exhibit for all of our current species in it, and make sure the animals are in it as well". `/zoocraft:build [size]`
builds a test zoo in one go on flat ground: the park claimed where you stand if there's none, an exhibit for every one of
the 34 species with its animals in it (147 animals), paths, Viewing Points, guest services, 5 Staff Rooms with keepers,
and round it all an Aluminum Fence ring with a gate in the middle of the north, east and west sides and the Park
Entrance Gate in the middle of the south side. The number you give is the smallest the ring may be (100 unless told):
34 exhibits need 142 x 142, so a smaller number grows to that and the build says so. Only scripts changed, so leaving
the world and going back in is enough (0.1.103's fence block needs its own full restart first, if it isn't in yet).

You need:
- a new world: Superflat, Creative, cheats on. (It also builds in a world whose park is claimed but still has no
  exhibits, round the Park Deed's spot. It refuses a park with exhibits and the benchmark's world.)
- 0.1.103 applied (the picket fence).

| # | Do this | You should see |
|---|---|---|
| 1 | In the new world, stand still and type `/zoocraft:build`. | "Zoo: building 34 exhibits inside a 142 x 142 Aluminum Fence round the Park Deed's spot (100 x 100 wouldn't hold them). Stay where you are." Over a few seconds the zoo appears round you: the silver picket fence ring with a gate in the middle of its north, east and west sides and the Park Entrance Gate in the middle of the south side; inside, an avenue running north to south with 5 rows of glass-fronted exhibits either side of it, a path along each row's front, and near the entrance the 5 Staff Room huts and the Ticket Booth. Then "blocks placed. Measuring the exhibits..." and "Test zoo built: 34 exhibits (34 occupied) with 147 animals, 6 keepers, 44 Viewing Points and 60 guest services, inside a 142 x 142 Aluminum Fence round X Z (100 x 100 wouldn't hold them): a gate in the middle of the north, east and west sides, the Park Entrance Gate in the middle of the south side. The park is open: guests arrive over the next minute." and a "Park edge" line saying the fence is closed. (The tutorial's lines come up too.) |
| 2 | Walk the rows. | Every species once, each exhibit named for its animals (the controller is behind the back wall): the benchmark's 20 (lions, tigers, crocodiles, gorillas, zebras, flamingos, raccoons, red pandas, owls, Crimson Grazers, Warped Geckos, Cinder Boars, Soul Moths, Quartz Beetles, End Hoppers, Shimmer Snails, Obsidian Crabs, Chorus Moths, Starback Tortoises, Void Rays) and 14 new ones: rabbits; otters and penguins with a pool (the penguins' bank is snow, with a Cooling Unit in the corner); capybaras with a pool at the front; deer under an oak canopy with a Hay Rack; giraffes with two Elevated Browse Feeders; elephants with a mud wallow and a Hay Rack; hedgehogs in a dark stone house with a tinted front, lit by red and purple Nocturnal Lamps, with a Burrow Shelter; Basalt Tortoises on basalt with magma pads, a Thermal Regulator and a Lava Trough; Ember Foxes on soul soil with Warm Ash, an Ember Den, a Thermal Regulator and a Lava Trough; Lava Rays in a lava pool with a Thermal Feeder set in the bank; Striders on lava with magma on the bank and warped fungus in the feeder; Chorus Deer on end stone under a brick canopy; Rift Ferrets on end stone with a Containment Anchor and two Rift Tunnels. The animals are in them, named. |
| 3 | Exhibit Clipboard on the hedgehogs, the Lava Rays, the Striders, the penguins and the Rift Ferrets. | Occupied, no red warnings; the hedgehogs' line says the nocturnal house is a nocturnal house ("yes", lamplight); the Lava Rays' Thermal Feeder holds Molten Plankton Feed; the Striders' feeder warped fungus; the Cooling Unit has ice; the Containment Anchor has charge. The grey notes are of the benchmark park's kind (a few floor blocks under lamps or perches). |
| 4 | Type `/zoocraft:build` again in the same world. | "This park already has exhibits. The test zoo needs an empty park: make a new Superflat world (Creative, cheats on) and run it there." Nothing changes. |
| 5 | In another new world, claim the park with the Park Deed, walk 30 blocks off, then `/zoocraft:build 160`. | The zoo builds round the deed's spot, not round you; the fence is 160 x 160 and the messages don't say it grew. The park is yours (you claimed it), funds 100,500 or so (the test zoo's 100,000 for the keepers' wages, as the benchmark's). |
| 6 | In another new world, `/zoocraft:build 30`. | It builds 142 x 142 (the smallest that holds every exhibit) and says 30 x 30 wouldn't hold them. |
| 7 | `/zoocraft:build 5` | "size must be 10 to 250". |
| 8 | Let a zoo run for a few minutes. | The 6 keepers (the Staff Rooms' cap in a normal park) walk out to the exhibits; guests come in at the entrance, up to the usual 6 in view; the Park Ledger's Park edge line says the fence is closed and counts about 19,600 blocks of ground (140 x 140 inside a 142 ring). Nothing escapes. |
| 9 | Your own park world with exhibits, and the benchmark's world. | Both refuse: step 4's message, and "This world holds the benchmark park. Make a new Superflat world (Creative, cheats on) and run it there." |
| 10 | `/zoocraft:benchmark build` in a new world. | As before 0.1.104: the same 20-exhibit park and readout (its blueprints and layout are untouched). |
| 11 | Open the content log after loading. | No errors for the build, the feeders, the fixtures or the fence. |

## 0.1.105

The first build on the laptop was refused with "the game won't take minecraft:snow_block": the penguins' bank used the Java name for the snow block (Bedrock's is minecraft:snow). The check that refused it is the one meant to: nothing was placed and the world was unchanged. Step 1 now builds; the penguins' pen has a snow bank on its east half.

## 0.1.218

On the laptop, `/zoocraft:build` in a new flat world did nothing for a while, then the game stopped with "The server
was shut down due to an unhandled scripting watchdog exception" (the content log: a 10012 ms hang in
`bench/parkPlan.js`, in packRows, under fitRing and planZoo). The game stops any script that runs 10 seconds without a
break. With 139 exhibits, planning the zoo took 6.8 seconds on the test server and over 10 on the laptop: for every
ring size it tried, it added up each row's width again exhibit by exhibit, finding each one by a search through all
139. It now keeps each row's width as it goes and sorts the exhibits once: the very same rows (the tests compare every
row with the old way's), in about 0.2 seconds on the test server.

Behind it was a second stop: the park's chunks didn't load ("Stay in the middle of the area and try again"). The test
zoo is 18 by 18 chunks now. One ticking area by command holds 100 chunks at most (and a world 10 of them), the
add-on's own ticking area 300 in all, and the build asked for two halves of 162 chunks: the game took neither. It now
asks for strips of whole chunk rows of 100 or fewer: four for the test zoo (`zoocraft_zoo_1` to `zoocraft_zoo_4`,
kept with the world so the zoo still ticks when you come back). Smaller builds are as before.

Two content log errors from the same session:
- `zoo_sulfur_cube.entity.json ... held_item_scale | child 'held_item_scale' not valid here`: the sulfur cube's client
  file now uses the game's own format (1.26.0), where held_item_scale is known (the game's own sulfur cube has it).
- `zoocraft:zoo_copper_golem ... Locator: Error: model already has a locator armor_offset.default_neck that doesn't
  exactly match ... in sitting(geometry.copper_golem.sitting)`: the game works that locator out from each pose's bones,
  and the sitting pose moves them. The sitting statue now uses the zoo's own copy of it
  (`geometry.zoocraft.copper_golem_sitting`): the game's sitting bones under `sit_` names, drawn as before, and the
  standing bones as the game has them, hidden while it sits, so the locator matches. The other poses are the game's.

A new model file: quit Minecraft completely and start it again. Then a new world: Superflat, Creative, cheats on.

On the test server (BDS 1.26.62.1, plains flat worlds, runs O, N and P, the bench player standing at 8000 -60 8000):
with 0.1.217 (run O) the plan took 6.8 and 6.5 seconds; with 0.1.218 (runs N and P) 0.15 to 0.2 seconds, and the command
returned in 0.2 to 0.4 seconds. All 324 chunks loaded within 9 ticks, in the four strips. The zoo built in 3 to 3.5
minutes: 139 exhibits (139 occupied), 357 animals, 6 keepers, 172 Viewing Points, 120 guest services, the park open.
With it running, the add-on's scripts took about 5 ms a tick (35 ms at the worst single moment) at 19.8 ticks a second.
Nothing from the add-on in the content log. The laptop is slower than the test server, so the build may take longer
there: stay where you are until it says it's done.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft completely, start it, turn the content log on (Settings, Creator) and make the new world. | No errors from the add-on: the sulfur cube's held_item_scale line and the copper golem's armor_offset.default_neck line are gone. |
| 2 | Stand still and type `/zoocraft:build`. | At once: "Zoo: building 139 exhibits inside a 271 x 271 Aluminum Fence round the Park Deed's spot (100 x 100 wouldn't hold them). Stay where you are." No long pause, no crash. On the test server the message came 0.2 to 0.4 seconds after the command. |
| 3 | Stay where you are until it's done. | "Blocks placed. Measuring the exhibits...", then the zoo built and its summary. On the test server, in 3 to 3.5 minutes: "Test zoo built: 139 exhibits (139 occupied) with 357 animals, 6 keepers, 172 Viewing Points and 120 guest services, inside a 271 x 271 Aluminum Fence ...". |
| 4 | Type `/tickingarea list`. | zoocraft_zoo_1, zoocraft_zoo_2, zoocraft_zoo_3 and zoocraft_zoo_4. On the test server exactly those four, and "4/10 ticking areas in use". |
| 5 | **Please check** (the test server draws nothing): in the Golem Yard, make a copper golem a statue as in `Golems_test_plan.md` row 9, then use an empty hand on it until it sits. | It sits as before 0.1.218, in the game's sitting pose. Nothing else drawn: no standing golem inside or above it. Standing, running and star statues and walking golems as before. |
| 6 | **Please check**: the sulfur cubes. | As before: see-through jelly outside, the core inside; the same size as before. |
