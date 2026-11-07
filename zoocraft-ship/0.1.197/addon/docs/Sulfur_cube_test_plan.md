# Sulfur cubes: test plan (0.1.197)

The game's sulfur cube as a zoo animal. It looks, sounds and moves like the game's own (the same model, skins and
animations): a large cube of jelly that hops about aimlessly. Drop a block near it, or give it one, and it picks it up and
holds it inside. Then it stops hopping and becomes a ball you can kick about, rolling as the block says (the game's: planks
a rubber ball, wool a beach ball, packed ice a hockey puck, a honeycomb block sticky, and so on). Give it another block to
swap; shears take it out. The zoo's never take TNT or a magma block (in the game TNT explodes inside one and a magma block
burns what it touches).

Sulfur cubes aren't born: in the game a large one splits into two small ones when it dies, and zoo animals never do. No
sexes, no young, no Breeding switch. Catch more.

How to catch them: in sulfur caves, underground under flat land (near swamps and deserts), 2 to 4 together. With a
slimeball in your inventory, use an empty Small Carrier on a large one with no block in it. The carrier refuses a small one
(let it grow first: 20 minutes, or feed it slimeballs) and one holding a block (take it out first with shears). Fill in the
Field Journal first, as for every animal: spot one, watch one hop about, see one holding a block.

What they want (a Sulfur Cave): 36 blocks of floor for the first two and 9 more for each after, 3 blocks high. Sulfur or
cinnabar (polished, bricks or chiseled too; not potent sulfur) under half of the floor or more, their caves' ground; with
less, a warning, and their comfort stays at 55 or below. Slimeballs or slime blocks from a feeder, and a Water Trough.
Enrichment: a Puzzle Feeder of slimeballs and a Hanging Food Basket of them.

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a zoo sulfur cube. On the test server the logs were clean in every run. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Sulfur Cave. | A Sulfur Cave 7 by 7 with a sulfur floor and a strip of cinnabar along the back, stone-brick walls with glass, a Puzzle Feeder and a Hanging Food Basket of slimeballs, a Water Trough, two sulfur cubes hopping about. No warnings on the Exhibit Clipboard, and its line "Ground: 46 floor blocks sulfur or cinnabar, 25 needed". On the test server: ready, 49 blocks of floor, that line, no warnings. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each like the game's large sulfur cube, the see-through jelly outside and the core inside. |
| 4 | Watch them for half a minute. | They hop about aimlessly, resting between hops. On the test server they moved 13 to 15 of 30 seconds, rising a block and a half, and went 6 to 8 blocks. |
| 5 | Drop a block of planks next to one (throw it from your hotbar). Then kick it. | It picks the planks up within a few seconds and holds them inside (the core hidden, the block showing), stops hopping, and rolls like a rubber ball when you hit or push it. On the test server: holding the planks (bouncy) within 15 seconds, its hopping stopped. |
| 6 | Hold white wool and use it on the other one; then use shears on it. | It takes the wool (a beach ball). Shears take it out: the wool drops beside it, and it hops again. A block dropped in the cave is picked up by the other cube if you don't take it. On the test server: wool taken (light), shears gave it back and it hopped 8.5 of 20 seconds; the other cube then picked the wool up. |
| 7 | Drop TNT and a magma block beside one. | Neither picks them up. On the test server both lay untouched for 15 seconds. |
| 8 | Break the floor and put stone down instead (or most of it), then measure the cave with the Habitat Marker. | A warning that sulfur cubes want their caves' ground (25 of the 49 blocks here; 0 now), the Clipboard line "(too little)", their comfort falling toward 55. Sulfur back over half the floor and measure again: the warning goes. On the test server: the warning and the line, comfort 75 then 73 (on its way to 55); with the sulfur back the warning went. |
| 9 | Turn breeding on in the Sulfur Cave. | A message that sulfur cubes aren't born: in the game a large one splits into two small ones when it dies, and zoo animals never do. The Clipboard lists no sex. On the test server: that message, no sex on either. |
| 10 | Find a small sulfur cube in a sulfur cave (or spawn one with a spawn egg until one is small), and with a slimeball in your inventory use an empty Small Carrier on it. | Refused: "That's a small sulfur cube: let it grow first (20 minutes, or feed it slimeballs), then catch it." On the test server: that message, the cube left where it was. |
| 11 | Give a large wild one a block (planks), then try the Small Carrier on it. | Refused: "This Sulfur Cube is holding a block: take it out first with shears, then catch it." On the test server: that message. |
| 12 | Use shears on it, then the Small Carrier again (a slimeball in your inventory). Use the carrier on the Sulfur Cave's floor. | It hops into the carrier, then into the cave, and lives there. On the test server: sheared, caught, living in the cave with no sex. |
| 13 | Open the Field Journal's Sulfur Cube page and watch one for a while; then drop a block by one. | Spot one, watch one hop about (one hop is enough), see one holding a block. On the test server all three ticked from the zoo's own: the hop a second after spotting one. |

Wild sulfur cubes spawned far from any player are gone at once (the game's despawn): look for them near you. Let go back to the
wild, a zoo one is the game's own large cube with no block (its spawn event; on the test server a large one, 8 health, no
block).
