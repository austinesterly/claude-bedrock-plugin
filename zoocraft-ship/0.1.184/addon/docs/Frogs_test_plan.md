# Frogs: test plan (0.1.184)

The game's frog as a zoo animal. It looks, sounds, hops, swims and croaks like the game's own (the same model and skins),
and leaps about its pond, onto lily pads most of all. It comes in the game's three looks: orange (temperate), green
(cold) and white (warm). A pair that mates lays frogspawn on the open water, beside a lily pad if there is one. The
frogspawn hatches into tadpoles (the game's tadpole, a mob of its own) that swim in the pond and graze it, and each grows
into a frog with the look of the pond's climate, as the game's tadpoles do. Rain gets a pair mating sooner.

How to catch one: find a wild frog (swamps and mangrove swamps). Have an Insect Ration in your inventory and use a Small
Carrier on it. Slimeballs still tempt them, but they aren't the bait.

What they want (a frog pond):
- Room: 36 blocks for the first frog and 18 for each more, 3 blocks of headroom. At least a quarter of it water (1 deep
  is enough) and half of it dry land, with a gentle edge to climb out. Some of the water open (nothing over it) for her
  frogspawn.
- Lily pads: a lily pad or big dripleaf on the water for every 2 frogs. Without them comfort can't rise above 60, and the
  tadpoles have nothing to graze.
- Cover: a fifth of the floor under tree leaves or a roof.
- Food: Insect Rations from a feeder on the land.
- Enrichment: a Hanging Food Basket of Insect Rations hung up to 4 blocks over the floor (they leap up at it). Under a
  tree's canopy is best, where a frog can't sit on it and leap higher. Or a Floating Toy in the pool.
- Walls high enough for their leaps: a frog leaps 4 blocks up onto the top of anything up to 8 blocks away. Walls,
  fences and gates need 5 blocks of height over anything a frog can sit on within 8 blocks of them: over the floor, a lily
  pad, a filter or a feeder. Walls 6 high are safe with filters and feeders 1 block high.

A new animal and a new block: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_frog, zoo_tadpole or frog_spawn. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Frog Pond. | A pool 1 deep with two lily pads on it, walls 6 high, a small oak tree's canopy over a back corner with a Hanging Food Basket of Insect Rations under it, a Water Filter by the water and a Basic Feeder of Insect Rations. The Exhibit Clipboard says "Frog pond: 2 lily pads, 1 needed" and how many spots of open water there are to lay on, and has no "No enrichment equipment" line. |
| 3 | Watch them for a few minutes. | They hop about, swim, croak now and then (the throat puffs out) and leap onto the lily pads, the filter and each other's spots. None gets out. |
| 4 | Take 5 blocks off the top of one wall's top row so it stands 5 high, and measure again with the Habitat Marker. | The clipboard says the pond isn't enclosed for frogs, and why (5 blocks over anything they sit on within 8 blocks). Put the blocks back and measure again: enclosed. |
| 5 | Break a lily pad so only one is left with two frogs, then put it back. | Nothing changes with 2 frogs (one pad is enough for 2). With 3 or more frogs and one pad, a warning that they need lily pads. |
| 6 | Turn breeding on with the Exhibit Clipboard, `/weather rain`, and run `/zoocraft:skip 1200` twice. | A message that the pair have mated and that she lays her frogspawn on the water (with where), and a Frog Spawn on the water there, beside a lily pad. |
| 7 | Walk onto the Frog Spawn, and break it. | You walk through it. Broken, it comes back (the eggs are the nursery's) and drops nothing. |
| 8 | `/zoocraft:skip 1200` twice more. | The frogspawn hatches (its sound): 2 to 6 tadpoles swim in the pond, a message names them, and the Frog Spawn is gone. |
| 9 | Watch the tadpoles. | They swim about the pool with the game's tadpole wiggle and never leave the water. |
| 10 | `/zoocraft:skip 1200` four or five times. | A message that each tadpole has grown its legs and hopped out as a frog, orange in a temperate pond (green in a cold biome, white in a warm one), with the game's grow-up sound. |
| 11 | In Survival, find a wild frog with an Insect Ration in your inventory and use an empty Small Carrier on it. Use the carrier in the Frog Pond. | It goes in, and comes out a zoo frog with the same look. |
| 12 | Let a zoo frog go back to the wild (Conservation, far from the park). | It comes out with its own look (orange, green or white). |
| 13 | Open the Field Journal's Frog page after spotting one. | Its care notes: A pond, Lily pads, Cover, Food, Breeding, and Catching with an Insect Ration. Tasks: spot one, watch one sit on a lily pad, watch one leap. |
