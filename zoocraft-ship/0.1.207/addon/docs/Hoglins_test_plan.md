# Hoglins and zoglins: test plan (0.1.207)

The game's hoglin and zoglin as zoo mobs, caught and kept the zombie's way. They look like the game's own (the same
models and skins) and make the game's sounds. In the zoo they never charge you or knock you back, a hoglin never turns
into a zoglin, and they never despawn. A zoglin is never hurt by fire.

Hoglins breed in the zoo, as the game's do: the one monster that does. With breeding on, a happy pair has a baby hoglin
(half the size, with the game's big baby head) that follows the grown ones about and grows up in 3 park days. Zoglins
never breed.

In the wild: hoglins in the Nether's crimson forests (they back away from warped fungus, Nether portals and respawn
anchors). Zoglins come only from hoglins: out of the Nether a hoglin shakes and turns into a zoglin after 15 seconds.
So calm a hoglin in the Nether (a calmed one never turns), or calm the zoglin it turns into.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds). Hit it till it has a quarter of its health or less (10 of 40), then use a Passivity Serum on
it, looking at it up close. Then use an empty Mob Cage on it, with a Fungal Ration in your inventory for a hoglin (craft
2 from a crimson fungus, a warped fungus and a nether wart) or a Meat Ration for a zoglin, and use the cage on the floor
inside its pen. Or hold the ration: it follows you.

What they want (a pen beside a Mob House, glass to the hall): at least 5 by 5 of floor for the first (10 more blocks
for each more); their rations from a Basic Feeder. Hoglins: a crimson forest's ground (crimson nylium) under half the
floor or more, and 2 or more crimson fungi growing in the pen; they like company (2 to 6). Zoglins: the Nether's ground
(netherrack or crimson nylium); Meat Rations. Without them comfort can't rise above 55, and the Exhibit Clipboard says
why. Hoglins and zoglins never share a pen.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a hoglin or a zoglin. On the test server nothing from the add-on in either run (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the two new Mob Houses. | Hoglins: crimson nylium with a netherrack patch and two crimson fungi against the back wall, a Basic Feeder of Fungal Rations. Zoglins: netherrack with a crimson nylium patch, a Basic Feeder of Meat Rations. Each behind glass, with a Hanging Food Basket and a Water Trough, and a pair inside. No warnings on the Exhibit Clipboard. On the test server: both ready, "Mob pen: beside a working Mob House", the hoglins' floor 78% crimson nylium and "Crimson fungi growing: 2", the zoglins' floor 99% the Nether's ground, no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Each like the game's own: the hoglin's pink-brown hide, tusks and mane, the zoglin's rotting pale hide and bare ribs. Their legs and ears swing as they walk and their heads turn to look. Now and then you hear their snorts and growls. |
| 4 | Take the crimson fungi out of the Hoglins pen and wait for the next check. | The Exhibit Clipboard: "Hoglins want 2 or more crimson fungi growing in their pen (0 now): they root about for it in the crimson forests, and the game's breed with it. Without them comfort can't rise above 55." Plant them back: the warning goes. On the test server: exactly that. |
| 5 | Open their Field Journal pages and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the pages filled from the hall. |
| 6 | Turn breeding on for the Zoglins pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that. |
| 7 | Turn breeding on for the Hoglins pen and keep the pen happy for a few park days. | "<mother> and <father> in Hoglins are expecting a baby hoglin! Due in 2 park days." Then "<mother> had a baby hoglin in Hoglins: <name>! Young need half an adult's space and food, a sheltered corner, and grow up in 3 park days." The baby is half the size with a big head, and follows the grown ones about. 3 park days later: "<name> in Hoglins is all grown up." On the test server: "Hogsworth and Bristleback in Hoglins are expecting a baby hoglin!", then "Hogsworth had a baby hoglin in Hoglins: Trufflehog!" (a baby at half size, 40 of 40 health, both parents on its record), "Trufflehog in Hoglins is all grown up." 3 park days later, and a second baby, Snortimer. |
| 8 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 9 | Use the serum on each at full health, and on a baby hoglin. | A hoglin: "It shakes the serum off. Weaken it first (a quarter of its health or less, 10 of 40): hoglins charge and knock you back, but back away from a warped fungus planted near them." A zoglin: "... (a quarter of its health or less, 10 of 40): zoglins charge and knock you back, and nothing keeps them off." The baby: "Leave the young ones be: the serum is too strong for a baby." On the test server: exactly those. |
| 10 | Weaken a wild hoglin to 10 of 40 (11 is refused) and use the serum, in the Overworld. | "The hoglin sparkles green and calms down. It never attacks now (it never charges you or knocks you back, and never turns into a zoglin)." It doesn't shake or turn. On the test server: refused at 11, calmed at 10, and never shook (a wild one beside it did). |
| 11 | Use an empty Mob Cage on it before you've watched it, then watch it, then use the cage with no ration, then with a Meat Ration, then with a Fungal Ration. | First "You don't know hoglins well enough to move one safely yet." Without a ration and with a Meat Ration: "You need a fungal ration in your inventory to coax it in." With a Fungal Ration: "<name> the Hoglin hopped into the carrier." On the test server: exactly those ("Bristleback the Hoglin hopped into the carrier"). |
| 12 | Use the full cage on the floor inside the Hoglins pen. | "<name> is now living in Hoglins!" On the test server: "Bristleback is now living in Hoglins!". |
| 13 | Leave a wild hoglin in the Overworld. | It shakes and turns into a zoglin after about 15 seconds (the game's). On the test server: it turned in 15 to 20 seconds, a zoglin that fire never hurts. |
| 14 | Weaken the zoglin to 10 of 40, calm it, cage it with a Meat Ration and put it in the Zoglins pen. | "The zoglin sparkles green and calms down. It never attacks now (it never charges you or knocks you back, and goes for no other mob)." Then "<name> is now living in Zoglins!" On the test server: refused at 40 and at 11, calmed at 10, "Rotfang the Zoglin hopped into the carrier", "Rotfang is now living in Zoglins!". |
| 15 | Try to put a calmed zoglin in the Hoglins pen. | "Hoglins: Zoglins don't share an exhibit with Hoglins. Zoglins keep an exhibit of their own." It stays in the cage. On the test server: exactly that, and both pens stayed without warnings. |

A wild hoglin out of the Nether turns into a zoglin after 15 seconds (the game's). A calmed or zoo one never does, and a
zoo baby hoglin never does either.
