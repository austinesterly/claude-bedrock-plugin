# Ravagers: test plan (0.1.211)

The game's ravager as a zoo mob, caught and kept the zombie's way. It looks like the game's own (the same model and
skin, walking and working its jaw) and makes the game's sounds. In the zoo it never rams, bites or roars, never
tramples crops or leaves, never carries a rider, never joins a raid and never despawns. It joins the Illager Camp:
pillagers, vindicators, evokers, vexes and ravagers may all share one pen.

In the wild ravagers come only with raids, from the third wave (on Normal another in the fifth with a pillager riding
it; on Hard an evoker or a vindicator rides one too). In Creative a spawn egg makes one.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds; a ravager is big, so you spot it from further off). Hit it till it has a quarter of its health
or less (25 of 100: block its bite with a shield and it may be stunned for 2 seconds), then use a Passivity Serum on
it, looking at it up close. If something rides it, the rider gets off, still wild. The calmed ravager stands dazed for
a moment, then use an empty Mob Cage on it with a Grain Ration in your inventory, and use the cage on the floor inside
its pen. A calmed one also follows you while you hold a Grain Ration.

What it wants (a pen beside a Mob House, glass to the hall, a roof over it):
- At least 5 by 5 of floor for the first (10 more blocks for each more) and 3 blocks of headroom.
- An outpost's or a woodland mansion's floor (dark oak planks, birch planks or cobblestone) under half the floor or
  more; without it comfort can't rise above 55, and the Exhibit Clipboard says why.
- Grain Rations from a Basic Feeder; a Water Trough.
- One is happy alone; two share a pen well, and it may live with pillagers, vindicators, evokers and vexes.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a ravager. On the test server nothing from the add-on in any run (only the bench's own lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the new Mob House, Ravagers. | Birch planks with a cobblestone patch, two ravagers, a Basic Feeder of Grain Rations, a Hanging Food Basket, a Water Trough, glass to the hall, no warnings on the Exhibit Clipboard. On the test server: ready, "Mob pen: beside a working Mob House, shut in all round and walled off from its hall", the floor 99% "an outpost's or a woodland mansion's floor", no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Like the game's own: big grey beasts with horns, walking with their heads low and working their jaws; now and then the game's ravager grunt. |
| 4 | Watch them for two minutes. | They lumber about the pen and never leave it. On the test server: 1,200 readings each over two minutes, all inside the pen; they walked 33 and 51 blocks. |
| 5 | Turn mob griefing on (`/gamerule mobgriefing true`) and put a row of leaves along one wall inside the pen. Watch for two minutes. | The leaves stay. On the test server: 6 oak leaves along the west wall, both ravagers pressed up against them and one stood on top of them, and all 6 were still there after two minutes. |
| 6 | Open their Field Journal page and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the page filled from the hall. |
| 7 | Turn breeding on for the pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that. After a park day their comfort rose from 71 to 90 with no care needed. |
| 8 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 9 | Use the serum on a ravager at full health, and at 26 of 100. | "It shakes the serum off. Weaken it first (a quarter of its health or less, 25 of 100): ravagers ram and bite hard and throw you back; block a bite with a shield and it may be stunned for 2 seconds, then it roars." On the test server: exactly that, at 100 and at 26. |
| 10 | Weaken it to 25 of 100 and use the serum. | "The ravager sparkles green and calms down. It never attacks now (it never rams, bites or roars, and never tramples crops or leaves). Bring it to a pen in a Mob House: a Mob Cage carries it (with a Grain Ration in your inventory), or lead it holding one." It stands dazed for a moment. On the test server: calmed at 25, slowed for its daze, then free to move. |
| 11 | Use an empty Mob Cage on it before you've watched it, then watch it, then use the cage with a Meat Ration, then with a Grain Ration, and put it in the Ravagers pen. | First "You don't know ravagers well enough to move one safely yet. Field Journal: spot one, wild or in a zoo; see one calmed with a passivity serum (or one in a zoo). Look at one for a few seconds to fill it in." With a Meat Ration: "You need a Grain Ration in your inventory to coax it in." With a Grain Ration: "<name> the Ravager hopped into the carrier." Then "<name> is now living in Ravagers!". On the test server: exactly those ("Tusk the Ravager hopped into the carrier", "Tusk is now living in Ravagers!"). From 24 blocks away the test player spotted a ravager and saw it calmed straight off (a pillager that far off it didn't), so in that run the journal was full before the first cage. |
| 12 | Calm a ravager with a pillager riding it (in Creative a raid's fifth wave, or `/summon ravager ~ ~ ~ minecraft:spawn_with_pillager_rider`). | The pillager gets off and stays wild (it still shoots). On the test server: the pillager was riding before the serum, and after it stood on the ground, wild, its crossbow in hand; the calmed ravager had no rider. |
| 13 | Hold a Grain Ration about 8 blocks from the calmed ravager. | It walks over to you. On the test server: it came from 7.9 blocks to 2.4 blocks within 3 seconds and stopped there. |
| 14 | Cage it with a Grain Ration and put it in the Pillagers pen. | "<name> is now living in Pillagers!": they share a pen (the Illager Camp), with no warnings on the clipboard. On the test server: "Trample is now living in Pillagers!", the pen then "Pillager+Ravager" with no warnings, both floors 99%. |
