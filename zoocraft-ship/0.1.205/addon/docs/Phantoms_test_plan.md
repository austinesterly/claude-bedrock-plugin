# Phantoms: test plan (0.1.205)

The game's phantom as a zoo mob, caught and kept the zombie's way. It looks like the game's own (the same model, skin,
flapping wings and grey smoke from its wing tips) and makes the game's sounds (its calls, its hurt sound, the flap of
its wings). In the zoo it never lands: it circles round and round under its pen's roof and every 10 to 20 seconds swoops
down low over the floor and climbs back up. It never bites, never burns in the sun and never despawns.

The game's own phantom can't do that in a pen: its circling goals sit it at the roof (the 0.1.204 test server). So the
zoo's phantoms are flown by the add-on, the way the Void Rays are, near players only (within 48 blocks of one). Further
off they hang still in the air till someone comes back.

In the wild: in the night sky over the Overworld, 1 to 4 at a time, over a player who hasn't slept in a bed (or died)
for three days or more and has nothing but open sky over them. They circle high, swoop down every 10 to 20 seconds to
bite, and burn in the daylight. Sleep in a bed and they stop coming. They keep away from cats and ocelots.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds). Hit it as it swoops at you till it has a quarter of its health or less (5 of 20), then use a
Passivity Serum on it as it swoops again, looking at it up close. It sparkles green and calms down, then comes down to
circle slowly about 2 blocks over the ground, right where it was calmed. Then, with a Meat Ration in your inventory,
use an empty Mob Cage on it, and use the cage on the floor inside its pen. Or hold a Meat Ration: it circles over your
head and follows you.

What they want (a tall pen beside a Mob House): at least 6 by 6 of floor for the first (12 more blocks for each more)
and 6 blocks of air over the floor, shut in all round with a roof; the dark (tinted glass to the hall, Nocturnal Lamps
for the guests to see them by); Meat Rations from a Basic Feeder. In light comfort can't rise above 50, and the Exhibit
Clipboard says why. They are never bred: catch more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a phantom. On the test server nothing from the add-on in either run (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the new Phantoms Mob House. | A tall house (walls 8 high), tinted glass from the hall into the pen, a stone floor with a coarse dirt patch, a red Nocturnal Lamp hung from the middle of the roof, a Basic Feeder of Meat Rations with a Hanging Food Basket and a Water Trough. Two phantoms in the air. No warnings on the Exhibit Clipboard. On the test server: ready, "Mob pen: beside a working Mob House", "Dark: yes", no warnings, both at 20 of 20 health. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Each like the game's own phantom: the dark blue-grey body, the glowing green eyes, the long flapping wings and tail, grey smoke trailing off its wing tips. You hear its wings flap and now and then its screech. Its body tips up as it climbs and down as it dives. |
| 4 | Watch them for a minute. | They glide round the pen under the roof, each on a ring of its own (one wider, one narrower and a block lower going the other way round), never touching the walls, and every 10 to 20 seconds one swoops down to just over the floor and climbs back. They never land and never leave the pen. On the test server, over 40 seconds: always inside the pen's air, at least 1.6 blocks from a wall and 0.9 under the roof, 4.4 blocks a second, 2 or 3 swoops each, never still. |
| 5 | Open their Field Journal page and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the page filled from the hall, through the tinted glass. |
| 6 | Turn breeding on for the pen. | "This species doesn't breed in the zoo yet." On the test server: the pen's breeding status said exactly that. |
| 7 | Without Mob Taming research, use a Passivity Serum on a weak phantom. | It asks for Mob Taming research first. |
| 8 | Stay awake three nights or more in Survival, stand out under the open sky at night, and use the serum on a phantom at full health as it swoops. | "It shakes the serum off. Weaken it first (a quarter of its health or less): hit it as it swoops at you, then use the serum when it swoops again." On the test server: exactly that. |
| 9 | Hit it as it swoops till it's down to 5 of 20 health or less, then use the serum on it as it comes at you again. | "The phantom sparkles green and calms down. It never attacks now (it never swoops at you or bites, and circles low)." It comes down and circles slowly about 2 blocks over the ground where it was calmed. On the test server: calmed at 5 of 20, then 1.8 to 2 blocks over the ground at 2 blocks a second, round its spot. One calmed 40 blocks up came down in about 15 seconds and circled 2 blocks over the ground. |
| 10 | Calm one, then use an empty Mob Cage on it before you've watched it. | The journal asks you to see one calmed first. On the test server: "You don't know phantoms well enough to move one safely yet." |
| 11 | Keep your eyes on the calmed one for a few seconds, then use the cage with no Meat Ration in your inventory, then with one. | Without: "You need a meat ration in your inventory to coax it in." With: "<name> the Phantom hopped into the carrier." On the test server: exactly those ("Insomnia the Phantom hopped into the carrier"). |
| 12 | Use the full cage on the floor inside the Phantoms pen. | "<name> is now living in Phantoms!" It rises off the floor and starts circling. On the test server: "Insomnia is now living in Phantoms!", then inside the pen's air and swooping. |
| 13 | Hold a Meat Ration near a calmed phantom, and walk. | It circles over your head and follows you. Put the ration away: it circles slowly where it is. On the test server it kept within 7 blocks of the Bench as the Bench walked 12 blocks, then circled where it was left. |

Wild phantoms far from any player despawn, and burn in the daylight (the game's). A calmed or zoo one never does.
