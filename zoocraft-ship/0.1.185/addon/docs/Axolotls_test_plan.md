# Axolotls: test plan (0.1.185)

The game's axolotl as a zoo animal. It looks, sounds and swims like the game's own (the same model and skins) and walks
along the bottom of its tank. It comes in the game's five colours: pink, cyan, gold, brown and the rare blue. A pair
breeds once the tank has its water plants: she lays her eggs on them and one hatches. A young one takes a parent's
colour, or now and then (1 in 1200, the game's own chance) it's blue. Young ones are drawn as small grown ones.

How to catch one: find a wild axolotl (the water of lush caves, over clay). Have an Insect Ration in your inventory and
use an empty Water Transport Tank on it. A bucket of tropical fish still tempts them, but it isn't the bait.

What they want (an axolotl tank):
- Room: 16 blocks of water for the first and 4 for each more, most of the exhibit water (a bank or rim round it, inside
  the walls, where you stand to use the Habitat Marker). 1 deep is enough: they live on the bottom.
- Water plants: seagrass or kelp growing in 2 of the tank's water blocks for each (a young one half). Bone meal on sand or
  dirt under the water grows seagrass. They hide among the plants out of the light, forage there (their enrichment) and
  lay their eggs on them. Without enough comfort can't rise above 60, and they won't breed.
- The floor: bare, sand, clay or stone under the water, never gravel (they swallow it). Gravel caps comfort at 60.
- Food: Insect Rations from an Aquarium Feeder over the water (the Aquarium Feeder now takes Insect Rations too).

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_axolotl. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Axolotl Tank. | A tank of water 2 deep with a bank along the back, sand under the water, a patch of seagrass, walls 3 high, a Water Filter on the bank and an Aquarium Feeder of Insect Rations over the water. The Exhibit Clipboard says "Axolotl tank: 8 water blocks with plants, 4 needed; no gravel" and has no warnings. |
| 3 | Watch them for a few minutes. | Pink, cyan, gold or brown: they swim about the tank, rest, and walk along the bottom with the game's walk. None gets out. |
| 4 | Break a block of the sand under the water, put gravel there, and measure again with the Habitat Marker. | A warning that axolotls swallow gravel, with where. Put sand back and measure again: the warning goes. |
| 5 | Break the seagrass so only 3 water blocks have it, and measure again. | A warning that they need water plants (4 for the two here). Put it back (bone meal on the sand under the water) and measure again: the warning goes. |
| 6 | Turn breeding on with the Exhibit Clipboard, and run `/zoocraft:skip 1200` three or four times. | A message that the pair have mated and that she lays her eggs on the water plants. |
| 7 | `/zoocraft:skip 1200` twice more. | Her eggs hatch: a message names the young one and its colour, and it swims in the tank, small, with the grown one's look. |
| 8 | `/zoocraft:skip 1200` five times. | A message that it's all grown up, and it's full size. |
| 9 | Fill the Aquarium Feeder with Insect Rations, then try a Meat Ration. | The Insect Rations go in. The Meat Ration doesn't (an Aquarium Feeder holds Fish Flakes, Fish Rations, Leafy Rations or Insect Rations only). |
| 10 | In Survival, find a wild axolotl with an Insect Ration in your inventory and use an empty Water Transport Tank on it. Use the tank on the bank of the Axolotl Tank, beside the water. | It swims into the tank ("Water Transport Tank (occupied)"), and comes out a zoo axolotl with the same colour, in the water. |
| 11 | Let a zoo axolotl go back to the wild (Conservation, far from the park). | It comes out as the game's own, in a colour the game picks (pink, cyan, gold or brown). |
| 12 | Open the Field Journal's Axolotl page after spotting one. | Its care notes: A tank, Water plants, The floor, Food, Breeding, and Catching with an Insect Ration. Tasks: spot one, watch one walk along the bottom under the water. |
