# Pillagers, vindicators, evokers and vexes: test plan (0.1.210)

The game's four raiders as zoo mobs, caught and kept the zombie's way. They look like the game's own (the same models
and skins) and make the game's sounds. In the zoo they never attack, never shoot, cast or summon, never join a raid and
never despawn. They are the Illager Camp: all four may share one pen.

Each keeps its gear: a pillager its crossbow (held at its side, never aimed), a vindicator its iron axe (stowed: its arms
stay crossed, as the game's does until it's angry), a vex its iron sword; an evoker has none and keeps its arms crossed.
A captain (the one leading a patrol or a raid, with the ominous banner) keeps its banner when it's calmed and caught; in
the zoo it never leads anyone. A vex drifts about its pen in the air (it never flies through walls in the zoo, and never
fades away, even one an evoker called up). A calmed vex hangs in the air where it was calmed, looking about, as the
game's own does when it has nothing to attack, until you hold up a Grain Ration.

In the wild: pillagers in patrols of 2 to 5 (after the world's fifth day, led by a captain) and at pillager outposts;
vindicators in woodland mansions and raids; evokers on the upper floors of woodland mansions and in raids; vexes only
when an evoker calls them up (3 at a time; the game's fade away within 2 minutes) or from a spawn egg.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds). Hit it till it has a quarter of its health or less (6 of 24 for the three illagers, 3.5 of 14
for a vex: be quick with one an evoker called up), then use a Passivity Serum on it, looking at it up close. Then use an
empty Mob Cage on it with a Grain Ration in your inventory, and use the cage on the floor inside its pen. A calmed one
also follows you while you hold a Grain Ration (a vex flies after it, up or down).

What they want (a pen beside a Mob House, glass to the hall, a roof over it):
- At least 5 by 5 of floor for the first (10 more blocks for each more) and 3 blocks of headroom.
- An outpost's or a woodland mansion's floor (dark oak planks, birch planks or cobblestone) under half the floor or
  more; without it comfort can't rise above 55, and the Exhibit Clipboard says why.
- Grain Rations from a Basic Feeder; a Water Trough.
- One is happy alone; up to 6 pillagers, 4 vindicators, 3 evokers or 6 vexes share a pen well, and any of the four may
  live together.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a pillager, vindicator, evoker or vex. On the test server nothing from the add-on in any run (only the bench's own lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the four new Mob Houses. | Pillagers: dark oak planks with a cobblestone patch, a pillager and a captain. Vindicators: dark oak planks with a birch patch, a vindicator and a captain. Evokers: birch planks with a dark oak patch, two evokers. Vexes: cobblestone with a dark oak patch, two vexes. Each with a Basic Feeder of Grain Rations, a Hanging Food Basket, a Water Trough, glass to the hall, no warnings on the Exhibit Clipboard. On the test server: all four ready, "Mob pen: beside a working Mob House, shut in all round and walled off from its hall", each floor 99% "an outpost's or a woodland mansion's floor", no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Like the game's own: the pillagers with their crossbows held at their sides; the vindicators with their arms crossed (no axe in sight); the evokers in their robes, arms crossed; the vexes small and winged, wings beating, each with a sword. The two captains (one pillager, one vindicator) carry the ominous banner where the game's captains do. Now and then their idle sounds. |
| 4 | Check what they hold. | On the test server (hasitem): each pillager a crossbow, each vindicator an iron axe, each vex an iron sword, the evokers nothing; the two captains also the ominous banner, in the chest slot, where the game's own captains carry it (minecraft:variant 1). |
| 5 | Watch the vexes for a minute. | They drift about the pen in the air, from the floor up to the roof, never through the walls or the roof. On the test server: 1,200 readings each over two minutes, all inside the pen, between the floor and the roof (y -60 to -56.8 under a roof at -56). |
| 6 | Open their Field Journal pages and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the pages filled from the hall for all four (the pillagers' only once the guests were out of the way: in the first run a guest stood right in front of the Bench and blocked its view). |
| 7 | Turn breeding on for each pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that, for all four. After a park day their comfort rose from 71 to 90 with no care needed. |
| 8 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 9 | Use the serum on a pillager at full health, and on a vex with more than a quarter of its health. | A pillager: "It shakes the serum off. Weaken it first (a quarter of its health or less, 6 of 24): pillagers shoot crossbow bolts from up to 8 blocks off, and a hurt one calls the rest of its patrol on you." A vex: "It shakes the serum off. Weaken it first (a quarter of its health or less, 3.5 of 14): vexes fly through walls and lunge with their swords, and one an evoker calls up fades away within 2 minutes, so be quick." On the test server: exactly those (the pillager at 24 and at 7, the vex at 4). |
| 10 | Find a patrol's captain (the one with the banner; in Creative a pillager spawned by the game's spawn_as_illager_captain), weaken it to 6 of 24 and use the serum. | "The pillager sparkles green and calms down. It never attacks now (its crossbow never shoots, and a captain keeps its ominous banner). Bring it to a pen in a Mob House: a Mob Cage carries it (with a Grain Ration in your inventory), or lead it holding one." It still carries its banner. On the test server: refused at 24 and at 7, calmed at 6, still variant 1 with the banner and the crossbow. |
| 11 | Use an empty Mob Cage on it before you've watched it, then watch it, then use the cage with a Meat Ration, then with a Grain Ration, and put it in the Pillagers pen. | First "You don't know pillagers well enough to move one safely yet. Field Journal: spot one, wild or in a zoo; see one calmed with a passivity serum (or one in a zoo). Look at one for a few seconds to fill it in." With a Meat Ration: "You need a Grain Ration in your inventory to coax it in." With a Grain Ration: "<name> the Pillager hopped into the carrier." Then "<name> is now living in Pillagers!", a captain still, banner and all. On the test server: exactly those ("Bolt the Pillager hopped into the carrier", "Bolt is now living in Pillagers!", coat 1, variant 1, the banner and the crossbow in the pen). |
| 12 | Calm a vindicator and an evoker at 6 of 24 each, watch them, cage them with a Grain Ration and put them in their pens. | The vindicator: "... It never attacks now (its arms stay crossed and its axe stowed, and a captain keeps its ominous banner). ..." The evoker: "... It never attacks now (it never raises fangs or calls up vexes). ..." On the test server: both calmed at 6, the vindicator keeping its axe; "Johnny is now living in Vindicators!", "Wololo is now living in Evokers!". |
| 13 | Calm a vex (3.5 of 14) and leave it for half a minute. | It hangs in the air where it was calmed and looks about; it never flies off. On the test server: a calmed vex (and one summoned calmed) traced every second for 40 seconds never moved. |
| 14 | Hold a Grain Ration about 8 blocks from the calmed vex. | It flies over to you. On the test server: it came 7.7 blocks to under a block from the player within 15 seconds. |
| 15 | Watch it, cage it with a Grain Ration and put it in the Evokers pen. | "<name> the Vex hopped into the carrier", then "<name> is now living in Evokers!": the four share a pen (the Illager Camp), with no warnings on the clipboard. On the test server: "Pester is now living in Evokers!", the pen then "Evoker+Vex" with no warnings. |
