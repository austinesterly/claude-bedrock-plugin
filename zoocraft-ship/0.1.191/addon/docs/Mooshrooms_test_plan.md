# Mooshrooms: test plan (0.1.191)

The game's mooshroom as a zoo animal. It looks and sounds like the game's own (the same model and skins, red or brown,
its walk and its sounds). The game draws the mushrooms on its back itself, so the zoo draws its own: three on the back
and one on the head, red or brown to match, in the game's own mushroom pictures, none on calves. A grown one gives milk
to a bucket and mushroom stew to a bowl; a brown one fed a flower by hand gives a suspicious stew the next time. A
lightning strike near one turns a red one brown and a brown one red, and does it no harm. It can't be hurt, never
despawns, can't be leashed or shorn, and doesn't breed by wheat (zoo breeding decides young).

How to catch one: find them in the Mushroom Fields (islands of mycelium out at sea). Have wheat or a Grain Ration in
your inventory and use an empty Livestock Crate on one.

What mooshrooms want (a Farmyard, with the farm animals if you like):
- Room: 48 blocks of floor for the first and 16 more for each more, 3 blocks high.
- Mycelium: 12 mycelium blocks in the floor for each (a calf half). With enough they graze it for up to half their food,
  so the feeders last longer; without it comfort can't rise above 55. Mycelium comes with Silk Touch, and spreads from
  mycelium onto dirt beside it.
- Hay bedding, as the farm animals: hay bales under a roof, 1 for every 2 animals (2 at least).
- Food: Grain Rations or wheat in a Hay Rack, as the cows. Water from a Water Trough.
- Company: 2 to 8 together.

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_mooshroom, and no "Locator" error. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Mooshrooms, beside the Cows. | A yard 12 by 10 of mycelium behind glass, the barn corner (a plank roof over 3 hay bales), a Hay Rack with a Hanging Food Basket over it, a Water Trough, a red and a brown mushroom on the floor, and three mooshrooms: two red, one brown. The Exhibit Clipboard says "Mycelium: 115 mycelium blocks, 36 needed; 2 red, 1 brown" and has no warnings. On the test server the measure counted 115 of the 119 floor blocks, 3 hay bales. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each looks like the game's mooshroom: a red one with three red mushrooms on its back and one on its head, a brown one with brown ones. The head's mushroom turns with the head when it looks about. The mushrooms stand on the back, not floating and not sunk in. |
| 4 | In Survival, use an empty bucket on a grown one. | The bucket fills with milk. On the test server it did at once. |
| 5 | Use a bowl on a grown one. | You get a mushroom stew. On the test server a red one's bowl gave mushroom stew. |
| 6 | Hold a poppy (or another small flower) and use it on the brown one. Then a bowl on it, then another bowl. | A puff of smoke as it eats the flower. The first bowl gives a suspicious stew, the second plain mushroom stew. On the test server: the poppy eaten, a suspicious stew, then mushroom stew. |
| 7 | Use a poppy on a red one. | Nothing: only a brown one eats a flower, as the game's. On the test server the poppy stayed in hand. |
| 8 | Use shears on one. | Nothing happens (on the game's own, shears cut off its mushrooms and it turns into a cow, so a zoo mooshroom isn't shorn). |
| 9 | In Creative, run `/gamerule dofiretick false`, then `/summon lightning_bolt` right beside a red one, a few blocks from the others. | It turns brown and takes no harm. The Exhibit Clipboard's line now counts one red fewer and one brown more. Summon one beside a brown one: it turns red. Leave the world and come back: they keep their new colours. On the test server a red one struck turned brown, a brown one red, both at full health, a neighbour 4.6 blocks off unchanged, and the zoo's record followed; put down again from their records they kept the new colours. |
| 10 | Break mycelium blocks until fewer than 36 are left (put dirt there) and measure with the Habitat Marker. | A warning that mooshrooms graze mycelium, how many blocks are needed and how many there are now. Put the mycelium back (Silk Touch) and measure again: the warning goes. |
| 11 | Turn breeding on with the Exhibit Clipboard and run `/zoocraft:skip 600` three or four times. | A message that a calf was born. It's a small grown one with a big head, the colour of a parent, and no mushrooms on it. A bucket or a bowl on it does nothing. On the test server a calf gave nothing to a bucket. |
| 12 | In Survival, catch a wild mooshroom in the Mushroom Fields (wheat in your inventory, an empty Livestock Crate) and use the crate on the Mooshrooms' floor. | It goes into the crate and comes out a zoo mooshroom of the same colour. |
| 13 | Let one go back to the wild (Conservation, far from the park). | It's the game's own again, grown, in its colour. On the test server, let go by the same spawn the crate uses, 4 red and 4 brown all came out grown and in their colours. (Like the game's own, a wild one far from every player may despawn.) |
| 14 | Open the Field Journal's Mooshroom page. | Its care notes (mycelium, red or brown, no shears; bedding, milking, stew, the petting farm) and catching with wheat or a Grain Ration. Tasks: spot one, watch one grazing, find a herd. On the test server spotting one ticked the first. |
