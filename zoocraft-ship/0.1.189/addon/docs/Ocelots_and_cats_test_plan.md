# Ocelots and cats: test plan (0.1.189)

The game's ocelot and cat as zoo animals. They look and sound like the game's own (the same models, the ocelot's spotted
coat, the cat's eleven coats and its two voices, classic and royal; they walk, creep, run, sit and lie down as the game's
do; meows and purrs). Ocelots sleep by day and are about at dusk and at night; cats nap on and off all day and night,
curled up and purring. A new one is shy: it runs from people until someone feeds it raw cod or salmon by hand (one time
in three, with hearts, as in the game). Then it trusts people, keeps that trust when it's moved, and a kitten born in the
zoo trusts from the start. Ocelots rest up on logs; cats sit on chests, the foot of beds and lit furnaces, and sometimes
nap there. Creepers keep away from both, as they do from the game's. They can't be hurt, never despawn, can't be tamed or
leashed, and don't hunt (they eat from the feeders).

How to catch one: find wild ocelots in a jungle, or a stray cat in a village (or the black cat at a swamp hut). Have raw
cod or salmon (or a Meat or Fish Ration) in your inventory and use an empty Small Carrier on one. A tamed cat is someone's
pet: leave it with them.

What ocelots want (an Ocelot Exhibit):
- Room: 30 blocks of floor for one or a pair and 12 more for each more, 4 blocks high.
- Cover: leaves or a roof over three tenths of the floor (they keep to thick cover).
- Logs: one on the floor for each ocelot (a log or a stripped log, open air over it) to rest up on.
- Food: Meat or Fish Rations in a feeder; a Scent Post, a Puzzle Feeder and a Hanging Food Basket for enrichment.
- Company: they live alone or as a pair (a pair and their kittens at most).

What cats want (a Cat House):
- Room: 12 blocks of floor for a pair and 4 more for each more, 3 blocks high, up to 6 cats.
- A roof over a quarter of the floor: a sheltered corner to sleep in.
- Seats: a chest, a bed or a lit furnace for each 2 cats, open air over it (a cold furnace doesn't count until it's lit).
- Food: Meat or Fish Rations; a Puzzle Feeder, a Climbing Frame and a Hanging Food Basket for enrichment.

A new animal: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name zoo_ocelot or zoo_cat. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Ocelots. | An exhibit 8 by 8 of grass behind glass walls: a jungle tree with its leaves 5 up over the back corner, a log lying on the floor and one standing, a Scent Post, a Puzzle Feeder, a Basic Feeder with a Hanging Food Basket over it, a Water Trough, and a pair of ocelots. The Exhibit Clipboard says "Logs to rest on: 3 of 2 needed" and "Trust people: 0 of 2", and has no warnings. |
| 3 | Watch them by day. | They're asleep, lying curled up, now and then on a log. On the test server they were asleep in 291 and 296 of 300 once-a-second looks over two and a half minutes. |
| 4 | `/time set night` and watch. | They're up and about, walking, and now and then they rest on a log. On the test server they were up in all 240 looks over 2 minutes, on a log in 23. |
| 5 | Switch to Survival, put everything out of your hand and walk in among them. | They keep away from you: they move off to the far side of the exhibit and stay there. On the test server, with the Bench player standing in the middle of the Ocelots, both went to the far corners, 5 blocks off; out in the open a shy ocelot or cat kept 9 to 11 blocks off. In Creative they don't mind you (no mob does). |
| 6 | Hold raw cod and use it on one, again and again. | A raw cod goes each time. One time in three it trusts you: hearts, and a message that it trusts you now and won't run from people any more. It stops running and follows the cod in your hand. The clipboard says "Trust people: 1 of 2". The Field Journal ticks off "spot one that trusts people". On the test server the first cod won an ocelot's trust in both runs, and a cat's after two or three (it's luck). |
| 7 | Walk to the Cat House. | A house 7 by 6 behind glass walls, an oak plank roof over the back corner, a bed, a chest, a Climbing Frame, a Puzzle Feeder, a Basic Feeder with a Hanging Food Basket over it, a Water Trough, and three cats (white, tuxedo, red). The clipboard says "Seats (chest, bed, lit furnace): 2 of 2 needed" and has no warnings. |
| 8 | Watch the cats for a few minutes. | They nap curled up (purring), wake, walk about and meow, and now and then one goes up onto the chest or the bed's foot, sits up on the middle of it a while, then naps there or gets down. On the test server they sat on the chest's middle within seconds and often napped there; one that came to it while another was on it lay down beside it instead; with the chest gone, one hopped up onto the bed's foot, sat there half a minute and then slept on it. The Field Journal ticks off "find one curled up asleep" and "see one sitting up on a chest, a bed or a furnace". |
| 9 | Break the chest and measure with the Habitat Marker. Then put a furnace in its place and measure again. | A warning that cats sit up on things, 2 needed and 1 now. With the furnace, the warning says it's a cold furnace (a cat sits on one only while it burns). Light it (fuel and something to smelt) and measure again: the warning goes. |
| 10 | `/summon creeper` inside the Ocelots, in Creative, and watch. | It keeps away from them, as the game's creepers keep away from ocelots and cats. On the test server, shut in with them, it moved off from 2.6 blocks to 4 to 6. |
| 11 | Turn breeding on with the Exhibit Clipboard, and run `/zoocraft:skip 600` three or four times. | A message that a kitten (or kittens) was born, and "Born in the zoo, the kitten trusts people from the start". It's a small grown one to look at. A few more skips and it's grown. |
| 12 | In Survival, catch a wild ocelot in a jungle (raw cod in your inventory, an empty Small Carrier) and use the carrier on the Ocelots' floor. Do the same with a stray cat in a village and the Cat House. | Each goes into the carrier and comes out a zoo animal, shy (it runs from you until you feed it). The cat keeps its coat and its voice. |
| 13 | Let one go back to the wild (Conservation, far from the park). | It comes out as the game's own. A cat keeps its voice; its coat is the game's pick (the game won't let an add-on set a cat's coat). |
| 14 | Open the Field Journal's Ocelot and Cat pages after spotting them. | Their care notes: sleep, rest (logs, or seats), cover or company, shy, breeding, and catching with raw cod or salmon. Tasks: an ocelot's spot one, find one napping, spot one that trusts people; a cat's spot one, find one curled up asleep, see one sitting up on a seat. |
