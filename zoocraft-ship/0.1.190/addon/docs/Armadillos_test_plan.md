# Armadillos: test plan (0.1.190)

The game's armadillo as a zoo animal. It looks and sounds like the game's own (the same model and skin, its walk, its
roll-up into a ball, its peek out and its unroll, its sounds). It rolls up for the same things as the game's: a player
sprinting or riding within 7 blocks, a hit, undead coming near. While the threat stays it peeks out now and then; a few
seconds after it's gone it unrolls. A hit rolls it up but does no harm. A grown one sheds a scute every 5 to 10 minutes,
and a brush gets one more. It can't be hurt, never despawns, can't be leashed, and doesn't breed by spider eyes (zoo
breeding decides young).

How to catch one: find them in savannas and badlands. Have a spider eye or an Insect Ration in your inventory and use an
empty Small Carrier on one.

What armadillos want (an Armadillo Exhibit):
- Room: 20 blocks of floor for one or a pair and 6 more for each more, 2 blocks high.
- Ground: sand or red sand under three tenths of the floor, soft to dig in. Without it comfort can't rise above 60.
- A Burrow Shelter on the floor to sleep in, and 2 or more blocks of Burrow Soil to dig in.
- Warmth: in a snowy or frozen biome, a Thermal Regulator beside the floor with charcoal or coal in it. Without it
  comfort can't rise above 40.
- Food: Insect Rations or spider eyes in a feeder; a Puzzle Feeder and a Hanging Food Basket for enrichment.
- Company: mostly alone, up to 4 together.

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_armadillo. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk (don't run) to the Armadillos. | An exhibit 6 by 6 of sand behind glass walls, a strip of coarse dirt along the back, Burrow Soil in the front corner, a Burrow Shelter, a Puzzle Feeder, a Basic Feeder with a Hanging Food Basket over it, a Water Trough, and a pair of armadillos walking about. The Exhibit Clipboard says "Ground: 25 floor blocks sand, 11 needed" and has no warnings. |
| 3 | Stand among them without running. | They stay unrolled and walk about. On the test server, with the Bench player standing in the middle of their floor for 5 seconds, neither rolled up. |
| 4 | Sprint past them, within 7 blocks (Creative or Survival). | Both roll up into a ball at once and stay rolled up while you sprint near. Now and then one peeks out. On the test server both rolled up within a second, in Creative and in Survival, and one or the other peeked out 3 times in 30 seconds. The Field Journal ticks off "see one roll up into a ball" and "see a rolled-up one peek out of its ball". |
| 5 | Stop sprinting and stand still. | A few seconds later they unroll and walk again. On the test server both were unrolled 4 seconds after the Bench stopped. |
| 6 | In Survival, hit one. | It rolls up into a ball and takes no harm (its health stays full; no red flash). It unrolls a few seconds later if you don't sprint. On the test server it rolled up at once, kept all 12 of its health and was unrolled 4 seconds later. (The game's own stays rolled up while the one who hit it is near; a zoo armadillo takes no harm, so the game doesn't count you as having hurt it.) |
| 7 | Hold a brush and use it on a grown one. | A scute drops (and the brush loses some of its use). On the test server the scute went straight into the Bench's inventory, it was standing so close. |
| 8 | Ride a tamed horse past them, within 7 blocks. | They roll up, as the game's do. On the test server a wild one and a zoo one both rolled up at once when the Bench got on a horse 7 blocks off. |
| 9 | `/summon husk` beside them. | They roll up while the husk is near and unroll after it's gone. On the test server the zoo one rolled up as soon as the husk came, 4 blocks off. |
| 10 | Leave them a while (10 minutes or so) and look on their floor. | Scutes lying about on their floor: a grown one sheds one every 5 to 10 minutes. On the test server two scutes lay on their floor between 8.5 and 10.5 minutes after the pair were put down; a pup left 12 minutes in the open shed none. |
| 11 | Break 20 of the sand blocks (put grass or dirt there) and measure with the Habitat Marker. | A warning that armadillos need soft ground to dig in: sand under 30% of the floor, how many blocks are needed and how many there are now. Put the sand back and measure again: the warning goes. |
| 12 | Build an Armadillo exhibit in a snowy biome (snowy plains, a grove, a snowy taiga) and measure. | A warning that they're cold: put a Thermal Regulator beside the floor and fuel it. The clipboard's ground line says it's a snowy biome and cold. Put one in with charcoal: the warning goes and the line says "kept warm". Not in a plain taiga or anywhere warmer. |
| 13 | Turn breeding on with the Exhibit Clipboard and run `/zoocraft:skip 600` three or four times. | A message that a pup was born. It's a small grown one to look at, and it sheds no scutes and can't be brushed until it's grown. |
| 14 | In Survival, catch a wild armadillo in a savanna (a spider eye in your inventory, an empty Small Carrier) and use the carrier on the Armadillos' floor. Then let one go back to the wild (Conservation, far from the park). Open the Field Journal's Armadillo page. | It goes into the carrier and comes out a zoo armadillo; let go, it's the game's own again, grown. The page has its care notes (rolling up, ground, den, warmth, scutes, breeding) and catching with a spider eye or an Insect Ration. Tasks: spot one, see one roll up into a ball, see a rolled-up one peek out of its ball. |
