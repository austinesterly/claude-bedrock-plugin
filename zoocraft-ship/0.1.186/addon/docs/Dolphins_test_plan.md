# Dolphins: test plan (0.1.186)

The game's dolphin as a zoo animal. It looks and sounds like the game's own (the same model, skin and swirl in the
water), swims the whole depth of its pool (often down by the floor, as the game's own do), leaps out of the water now and
then, swims alongside you when you swim, and keeps to its pod. It can't drown: the game's own dolphins drown in deep pools
(a known Minecraft bug: they don't get up to breathe), so the zoo's breathe underwater too.
A pair breeds: one calf, born in the water, drawn as a small grown one.

How to catch one: research Marine Husbandry for the Large Water Tank. Find wild dolphins in an ocean that isn't frozen.
Have a Fish Ration, a raw cod or a raw salmon in your inventory and use an empty Large Water Tank on one.

What they want (a dolphin pool):
- Room: 275 blocks of water for up to five dolphins and 75 more for each more (the European aquarium association's
  standard, at a block a metre: the game's dolphin is a real one's size). An 18 by 16 pool holds five. A bank or rim round
  the water inside the walls, where you stand to use the Habitat Marker.
- Deep and wide: somewhere in it, a stretch of water 8 by 8 blocks and 4 deep to dive and turn in. Without it comfort
  can't rise above 60.
- Air: they breathe at the surface, so at least half the water must be open to the air (nothing right over it). A glass
  roof on the water caps comfort at 60 too.
- Company: they live in pods, so keep at least two together.
- Food: Fish Rations from an Aquarium Feeder over the water.
- Enrichment: a Floating Toy on the water (use it aiming at the pool) and a Hanging Food Basket of Fish Rations. With
  neither they get bored and, after a few park days, unwell.
- Walls: any wall holds them (on the test server their leaps took them half a block out of the water at most).

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_dolphin. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Dolphin Pool. | A pool 18 by 16 of water 4 deep (its top a block over the ground, so a flat world's bedrock stays under it), a raised bank along the back, walls 3 over the water, a Water Filter and a Hanging Food Basket of Fish Rations on the bank, an Aquarium Feeder of Fish Rations over the water and a Floating Toy on it. The Exhibit Clipboard says "Dolphin pool: 16 by 16 of water 4 deep (8 by 8 needed); 287 of 288 water blocks open to the air" and has no warnings. |
| 3 | Watch them for a few minutes. | They swim about the pool, up and down its depth, with the swirl behind them. Now and then one leaps out of the water (a jump sound, an arc about half a block over the water, a splash) and back in a few blocks on, never toward a wall. None gets out. |
| 4 | Swim in the pool beside one. | It swims alongside you (the Field Journal ticks off "swim with them"). |
| 5 | Fill part of the pool in so no stretch 8 by 8 is 4 deep (for example sand across the middle 2 blocks down), and measure again with the Habitat Marker. | A warning that dolphins need room to dive and turn, with the widest stretch now. Take the sand out and measure again: the warning goes. |
| 6 | Put glass on top of the water over more than half the pool and measure again. | A warning that they breathe air and too little of the water is open. Take the glass away and measure again: it goes. |
| 7 | Turn breeding on with the Exhibit Clipboard, and run `/zoocraft:skip 1200` a few times. | A message that the pair have mated. |
| 8 | `/zoocraft:skip 1200` five or six times more. | A calf is born in the water: it's small, with the grown one's look, and swims with its mother. |
| 9 | `/zoocraft:skip 1200` six or seven times more. | A message that it's all grown up, and it's full size. |
| 10 | Fill the Aquarium Feeder with Fish Rations. | They go in, and the dolphins eat from it. |
| 11 | In Survival, research Marine Husbandry, find wild dolphins, and with a raw cod in your inventory use an empty Large Water Tank on one. Use the tank on the bank of the Dolphin Pool, beside the water. | It swims into the tank, and comes out a zoo dolphin in the water. |
| 12 | Let a zoo dolphin go back to the wild (Conservation, far from the park). | It comes out as the game's own dolphin, grown. |
| 13 | Open the Field Journal's Dolphin page after spotting one. | Its care notes: A pool, Deep and wide, Air, Company, Food, Play, Breeding, and Catching with a Fish Ration, raw cod or raw salmon. Tasks: spot one, watch one leap out of the water, swim with them. |
