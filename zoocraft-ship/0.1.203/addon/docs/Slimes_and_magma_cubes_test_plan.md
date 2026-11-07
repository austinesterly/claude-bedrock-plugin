# Slimes and magma cubes: test plan (0.1.203)

The game's slime and magma cube as zoo mobs, caught and kept the spider's way, each keeping its size (small, medium or
large). Each looks, sounds and hops like the game's own (the same models, skins and sounds; it stretches as it leaves the
ground and squashes flat as it lands, a magma cube's layers pull apart as it springs). In the zoo they never attack,
chase anyone, split or despawn.

In the wild:

- Slimes: swamps and mangrove swamps on dark nights (most on a full moon, none on a new moon), and deep underground
  (below y 40) in slime chunks, one chunk in ten, in any light; and the spawners of some trial chambers. They hurt you by
  touch (the small ones don't). Killed, a large one splits into medium ones and a medium one into small ones.
- Magma cubes: the Nether in any light, most in the basalt deltas; the spawners of a treasure bastion. They leap high
  (a large one 4 blocks) and hurt you by touch; fire, lava and falls never hurt them. They split as slimes do.

How to catch them (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed). Weaken one to a
quarter of its health or less: a large one to 4 of 16 (a sword hit or two), a medium one punched down to 1 of 4 (a sword
splits it); a small one (1 health) calms as it is. Look at it up close and use a Passivity Serum: it sparkles green and
calms down, the same size. Then, with its food in your inventory (a slimeball for a slime, magma cream for a magma cube),
use an empty Mob Cage on the calmed one, and use the cage on the floor inside its pen.

What they want (a pen beside a Mob House):

- Slimes: swamp ground (mud, muddy mangrove roots or clay) under half the floor or more. Slimeballs.
- Magma cubes: Nether ground (netherrack, basalt of any kind, blackstone or magma blocks) under half the floor or more,
  and headroom for a large one's leap. Magma cream.
- Each from a Basic Feeder. No dark needed.

Without its floor comfort can't rise above 55, and the Exhibit Clipboard says what's missing. They are never bred: catch
more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a slime or a magma cube. On the test server nothing from the add-on in any run (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the two new pens beside their Mob Houses. | Slimes: mud with a clay patch behind glass. Magma Cubes: basalt with a blackstone patch behind glass, a taller pen (walls 6 high). A Basic Feeder (slimeballs, magma cream), a Hanging Food Basket and a Water Trough in each. Three in each pen: a small, a medium and a large one. No warnings on the Exhibit Clipboard: the pen beside a working Mob House and the floor "99%". On the test server: both ready with exactly those lines and no warnings, each pen's three at variant 1, 2 and 4 (small, medium, large) with 1, 4 and 16 health. |
| 3 | Watch them hop. **Please check this one: the test server draws nothing and plays no sound.** | Each like the game's own: a slime green and see-through with its core and face inside, a magma cube dark with glowing cracks. Each stretches tall as it leaves the ground and squashes flat as it lands, a magma cube's layers pull apart as it springs; each hop squelches (a small one's higher). They never chase you. |
| 4 | Watch them for a minute or two. | They hop about the floor: slimes often and low, magma cubes after a wait and high (a large one about 4 blocks). They stay in the pen at the same size. On the test server (run P, open pens): the copies rose as high as the game's (slimes 1.25 blocks; magma cubes 1.8, 2.5 and 4.15 by size) and hopped about as often. In the test zoo all six stayed in their pens, at their sizes and full health, for over 2 minutes. |
| 5 | Open their Field Journal pages and watch them. | Each: spot one, see one calmed. A zoo one counts. On the test server: both pages filled from watching zoo ones, and from wild ones calmed in run B. |
| 6 | Break the slimes' mud and put dirt down instead, then measure with the Habitat Marker. | A warning that slimes want swamp ground under 50% of their floor, the Clipboard's floor line, comfort falling toward 55. Put the mud back and measure again: the warning goes. The same for the magma cubes' basalt. On the test server: "Slimes want swamp ground (mud, muddy mangrove roots or clay) under 50% of their floor or more (21% now)", the clay patch alone; back, 99% and no warning. The magma cubes: "...Nether ground (netherrack, basalt of any kind, blackstone or magma blocks)... (21% now)", then 99%. |
| 7 | Turn breeding on in each pen. | "This species doesn't breed in the zoo yet." On the test server: that message for both. |
| 8 | In a swamp at night (or with a slime you find), with Mob Taming researched, try an empty Mob Cage on a wild one, then use a Passivity Serum on a large one at full health. | The cage: "This animal isn't part of the zoo catalogue yet." (the wild one isn't calmed). The serum: "It shakes the serum off. Weaken it first (a quarter of its health or less)." and you keep the serum. On the test server: both messages, the serum kept. |
| 9 | Hit the large one down to 4 health or less, then use the serum. | "The slime sparkles green and calms down. It never attacks now (and it keeps its size: small, medium or large). Bring it to a pen in a Mob House: a Mob Cage carries it (with a slimeball in your inventory), or lead it holding one." It stays large, with the health it had. On the test server: calmed at 4 of 16, the calmed one large with 4 of 16. |
| 10 | Use an empty Mob Cage on the calmed slime before its Field Journal page says you saw one calmed, then with no slimeball, then with one. | "You don't know slimes well enough to move one safely yet...". Look at it a few seconds and the page fills in. Without the slimeball: "You need a slimeball in your inventory to coax it in." With it: "...hopped into the carrier." Use the cage on the floor in the Slimes pen: "...is now living in Slimes!" It comes out large. On the test server: calmed out of sight, those three messages in turn, then "Blobby is now living in Slimes!", large (16 health) in the pen. |
| 11 | Punch a medium slime down: at 2 health use the serum, then at 1. Catch it. | At 2 of 4 it shakes the serum off; at 1 it calms, medium, and comes out medium in the pen. On the test server: exactly that ("Goo is now living in Slimes!", medium, 4 health in the pen). |
| 12 | Use the serum on a small slime as it is (it has 1 health), and catch it. | It calms and comes out small. On the test server: calmed at 1 of 1, "Splodge is now living in Slimes!", small in the pen. |
| 13 | In the Nether (a basalt delta), weaken a large magma cube to 4 health or less (its fire immunity means no burning; hit it), use the serum and catch it with magma cream in your inventory. Try its cage in the Slimes' pen, then in its own. | At full health it shakes the serum off; at 4 it calms ("...(and it keeps its size: small, medium or large)... with some magma cream in your inventory"). The Slimes' pen refuses it: "Magma Cubes don't share an exhibit with Slimes. Magma Cubes keep an exhibit of their own." Its own: "...is now living in Magma Cubes!", large. On the test server: exactly that ("Magmo is now living in Magma Cubes!", large, 16 health in the pen). |
| 14 | Calm a small magma cube as it is and catch it. | It calms and comes out small. On the test server: "Lavalamp is now living in Magma Cubes!", small in the pen beside the large one. |
| 15 | Punch a calmed slime or magma cube till it dies. | It doesn't split: nothing comes out (the game splits only its own). On the test server: a large calmed slime and magma cube killed left nothing, while the game's large slime killed beside them split into two medium ones. |
| 16 | Watch a zoo sulfur cube hop (it was fixed in this version). **Please check this one: the test server draws nothing.** | It stretches as it leaves the ground and squashes as it lands, with its jump and landing sounds, like the game's. Before 0.1.203 it hopped stiffly and silently: the game keeps its squish for its own cubes (on the test server it changed on every one of the game's slimes, magma cubes and sulfur cubes, never on a zoo copy). |

Wild ones far from any player despawn (the game's): look for them near you. A zoo one let go comes out calmed, at its size.
