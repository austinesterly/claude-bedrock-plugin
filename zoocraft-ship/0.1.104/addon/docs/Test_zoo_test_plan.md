# Test zoo test plan (0.1.104)

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
