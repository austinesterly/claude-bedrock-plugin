# Endermen and shulkers: test plan (0.1.209)

The game's enderman and shulker as zoo mobs, caught and kept the zombie's way. They look like the game's own (the same
models and skins: the enderman's long black limbs and purple eyes, the shulker's purpur shell in its 17 colours) and make
the game's sounds. In the zoo they never attack, never take blocks, never shoot and never despawn.

An enderman walks about its pen and now and then blinks: it vanishes in a puff of purple and turns up somewhere else in
the same pen, 3 to 10 blocks off, with the game's teleport sound. It never blinks out of its pen, and never while you
stand close by holding a Mob Cage or Chorus Browse (so you can catch or feed it). A shulker never moves: it sits in its
shell, peeks out for a second or two now and then (with the game's open and close sounds) and turns its head to watch
you. It keeps the colour it had in the wild (wild ones are the purpur colour; a Creative player can dye one, as in the game). Neither breeds in the zoo (the game's never do).

In the wild: endermen everywhere in the End (in fours), in the Overworld's dark (light 0, 1 or 2 at a time), and in
the Nether's warped forests, Nether wastes and soul sand valleys. Shulkers on the walls of the End cities and in their
End ships, out on the End's outer islands (through an End gateway).

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds). Hit it till it has a quarter of its health or less (an enderman 10 of 40: wear a carved
pumpkin so it doesn't come for you when you look at it, and hit it by hand, as arrows never hit one; a shulker 7.5 of
30: hit it while its shell is open), then use a Passivity Serum on it, looking at it up close. Then use an empty Mob
Cage on it with Chorus Browse in your inventory, and use the cage on the floor inside its pen. A calmed enderman also
follows you while you hold Chorus Browse; a shulker can only be carried.

What they want (a pen beside a Mob House, glass to the hall):
- Endermen: at least 5 by 5 of floor for the first (10 more blocks for each more) and 3 blocks of headroom (they are
  almost 3 tall); the End's ground (end stone, end stone bricks or obsidian) under half the floor or more; Chorus
  Browse from a Basic Feeder; a Water Trough. One is happy alone; up to 4 share a pen well.
- Shulkers: the same size of pen; an End city's floor (purpur blocks, purpur pillars or end stone bricks) under half
  the floor or more; Chorus Browse; a Water Trough. One is happy alone; up to 6 share a pen well.
- Without their floor comfort can't rise above 55, and the Exhibit Clipboard says why. Endermen and shulkers never
  share a pen.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name an enderman or a shulker. On the test server nothing from the add-on in either run (only the bench's own lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the two new Mob Houses. | Endermen: end stone with an obsidian patch, a Basic Feeder of Chorus Browse, a Water Trough, two endermen. Shulkers: purpur with an end stone brick patch, a Basic Feeder of Chorus Browse, a Water Trough, two shulkers (one the purpur colour, undyed, and one lime). Each behind glass with a Hanging Food Basket. No warnings on the Exhibit Clipboard. On the test server: both ready, "Mob pen: beside a working Mob House", each floor 99% its own blocks, no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | The endermen like the game's own: tall and black with purple eyes, walking with their long arms swinging a little, heads turning to look; they never open their mouths in the scary face and never carry a block. The shulkers: shut purpur shells, the lime one lime, peeking open a little for a second or two every few seconds and shutting again, with the game's soft open and close sounds, their heads turning to you. Now and then you hear the endermen's idle sounds and the shulkers' ambient one. |
| 4 | Watch an enderman for a minute. | Every half minute or so it vanishes in purple particles and reappears 3 to 10 blocks off, always on the floor of its own pen, with the teleport sound. On the test server: 6 blinks in 2 minutes, all inside the pen, landing on end stone or obsidian 3.2 to 10 blocks off with open room for the whole body; both endermen stayed inside their pen in every reading. |
| 5 | Stand by the glass inside the pen holding a Mob Cage (or Chorus Browse) for a minute, then put it away. | No blinks while you hold it; they start again once it's put away. On the test server: 0 blinks in 60 seconds holding a Mob Cage within 6 blocks, 3 in the next 60 seconds empty-handed. |
| 6 | Watch a shulker for a minute. | It never moves from its spot. On the test server it never moved in any reading, and kept its colour (undyed and lime). |
| 7 | Open their Field Journal pages and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the pages filled from the hall. |
| 8 | Turn breeding on for each pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that, for both. |
| 9 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 10 | Use the serum on each at full health. | An enderman: "It shakes the serum off. Weaken it first (a quarter of its health or less, 10 of 40): an enderman you look in the eyes comes for you (not while you wear a carved pumpkin on your head), and arrows never hit one." A shulker: "... (a quarter of its health or less, 7.5 of 30): hit it while its shell is open (shut, it shrugs off most hits), and dodge its bullets: they make you float up." On the test server: exactly those. |
| 11 | Weaken a wild enderman to 10 of 40 (11 is refused) and use the serum. | "The enderman sparkles green and calms down. It never attacks now (it never comes for you when you look at it, and never teleports away or takes blocks). Bring it to a pen in a Mob House: a Mob Cage carries it (with Chorus Browse in your inventory), or lead it holding one." On the test server: refused at 40 and at 11, calmed at 10. |
| 12 | Use an empty Mob Cage on it before you've watched it, then watch it, then use the cage with nothing, then with a Meat Ration, then with Chorus Browse. | First "You don't know endermen well enough to move one safely yet." With nothing and with a Meat Ration: "You need Chorus Browse in your inventory to coax it in." With Chorus Browse: "<name> the Enderman hopped into the carrier." On the test server: exactly those ("Gangle the Enderman hopped into the carrier"). |
| 13 | Use the full cage on the floor inside the Endermen pen. | "<name> is now living in Endermen!" On the test server: "Gangle is now living in Endermen!", and it walked and blinked about the pen. |
| 14 | Dye a wild shulker in Creative (lime here: only a Creative player's dye takes, as in the game), weaken it to 7.5 of 30 (8 is refused), calm it, watch it, then use the cage with a Meat Ration, then with Chorus Browse, and put it in the Shulkers pen. | "The shulker sparkles green and calms down. It never attacks now (it never shoots its bullets, and never teleports away). Bring it to a pen in a Mob House: a Mob Cage carries it (with Chorus Browse in your inventory). It never moves on its own." With a Meat Ration: "You need Chorus Browse in your inventory to coax it in." Then "<name> the Shulker hopped into the carrier" and "<name> is now living in Shulkers!", still lime. On the test server: refused at 30 and at 8, calmed at 7.5 still lime, "Lidsworth the Shulker hopped into the carrier", "Lidsworth is now living in Shulkers!", lime (coat 10) in the zoo and sitting still. An undyed one calmed at 7 stayed undyed. |
| 15 | Hold Chorus Browse near a calmed enderman. | It walks over to you. On the test server: it was 12 blocks off when the Chorus Browse came out; 10 seconds later it was 2 blocks from the player. A calmed shulker stays where it is. |
| 16 | Try to put a calmed enderman in the Shulkers pen while a shulker lives there. | "Shulkers: Endermen don't share an exhibit with Shulkers. Endermen keep an exhibit of their own." It stays in the cage. On the test server: exactly that, and both pens stayed without warnings. |
