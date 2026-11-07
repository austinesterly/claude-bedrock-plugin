# Strays, bogged, parched and wither skeletons: test plan (0.1.201)

The game's stray, bogged, parched and wither skeleton as zoo mobs, caught and kept the zoo skeleton's way. Each looks,
sounds and moves like the game's own (the same model, skin, clothes, animations and sounds). In the zoo they never
attack or shoot, never burn in the sun and never despawn. A wither skeleton is the game's size (taller than a player),
holds its stone sword and is never hurt by fire. A bogged keeps its look from the wild: one sheared of its mushrooms
stays bare through the Mob Cage into the zoo, the rest keep their mushrooms.

In the wild:

- Strays: snowy places at night, out under the open sky (snowy plains, ice spikes, frozen rivers, snowy slopes, the
  frozen and jagged peaks), in place of most of the skeletons there, one or two at a time. A skeleton kept in powder
  snow shakes and becomes one.
- Bogged: swamps and mangrove swamps at night, on the surface (under thick mangrove leaves even by day), in place of
  some of the skeletons there, one or two at a time; and the spawners of trial chambers. Shears take their mushrooms off
  for good.
- Parched: deserts at night, out under the open sky, in place of a third of the skeletons there, one or two at a time.
  They never burn in the sun. One rides behind the husk on a camel husk jockey.
- Wither skeletons: Nether fortresses only, two or three at a time in the dark (and a wither calls up a few when it is
  hurt below half). Fire and lava don't hurt them. A Mob Cage carries one home through a portal.

How to catch them (Mob Taming research), the skeleton's way: fill in the Field Journal first (spot one, then see one
calmed). Weaken one to a quarter of its health or less (5 of 20 for a stray or a wither skeleton, 4 of 16 for a bogged
or a parched), look at it up close and use a Passivity Serum: it sparkles green and calms down. Then, with a Bone Ration
in your inventory, use an empty Mob Cage on the calmed one, and use the cage on the floor inside its pen.

What they want (a pen beside a Mob House, as the skeleton's):

- Strays: frozen ground (snow blocks, packed ice, blue ice or ice) under half the floor or more.
- Bogged: swamp ground (mud, muddy mangrove roots or clay) under half the floor or more, and 3 or more mushrooms (brown
  or red) planted on the floor.
- Parched: desert ground (sand, red sand or sandstone of any cut) under half the floor or more. They share a pen with
  husks (the Desert Tomb); the husks want their own Meat Rations there too.
- Wither skeletons: a fortress floor (nether bricks of any kind) under half the floor or more, and the dark (no
  daylight, nothing brighter than light 7: Nocturnal Lamps).
- Bone Rations in a Basic Feeder.

Without its floor (or a bogged without its mushrooms) comfort can't rise above 55 (a wither skeleton without the dark:
50), and the Exhibit Clipboard says what's missing. They are never bred (as the skeleton): catch more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a stray, a bogged, a parched or a wither skeleton (no "Locator" lines either: the stray's and the bogged's clothes are now part of one model each). On the test server nothing from the add-on in any of the three runs (only the bench's own lines and the add-on's loading lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the four new pens beside their Mob Houses. | Strays: snow with a patch of packed ice behind glass. Bogged: mud with a patch of clay, four mushrooms (two brown, two red), behind tinted glass under a red Nocturnal Lamp. Parched: sand with a patch of smooth sandstone behind glass. Wither Skeletons: nether bricks with a patch of red nether bricks behind tinted glass under a red Nocturnal Lamp. A Basic Feeder of Bone Rations, a Hanging Food Basket and a Water Trough in each, two in each pen. No warnings on the Exhibit Clipboard: the pen beside a working Mob House, each floor "99%", the bogged's "Mushrooms: 4 in the pen", the wither skeletons' "Dark: yes". On the test server: all four ready with exactly those lines and no warnings. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each like the game's own: strays in their ragged frosted clothes, the bogged mossy green, the parched bleached pale, the wither skeletons black and tall with a stone sword. Of the two bogged, one has mushrooms on its head and one is bare (sheared). The clothes move with the arms and legs as the game's do. They make the game's stray, bogged, parched and wither skeleton sounds. |
| 4 | Watch them for a minute (by day, behind glass). | They wander about, never burning in the sun (the strays and bogged behind glass in daylight too). On the test server all eight stayed in their pens at full health with no fire through 45 seconds at noon; the wither skeletons read scale 1.2 and fire immune, the bogged pair one with mushrooms and one sheared. |
| 5 | Open their Field Journal pages and watch them. | Each: spot one, see one calmed. A zoo one counts. On the test server: all four pages filled from watching zoo ones (the bogged's when the Bench's look caught one standing in the mud: its first short look missed), and again from wild ones caught at night. |
| 6 | Break the strays' snow and put stone down instead, then measure with the Habitat Marker. | A warning that strays want frozen ground under 50% of their floor, the Clipboard's floor line in red, comfort falling toward 55. Put the snow back and measure again: the warning goes. On the test server: the warning ("21% now": the packed ice patch alone), the floor line "21%"; with the snow back, 99% and no warning. |
| 7 | Swap the wither skeletons' Nocturnal Lamp for glowstone and measure again. | A warning that wither skeletons like the dark, the line "Dark: no: too bright", their comfort held to 50 or below. The lamp back: the warning goes. On the test server: "Dark: no: too bright on 39 blocks, brightest 12 of 7 allowed", comfort held to 50; with the Nocturnal Lamp back, "Dark: yes" and no warning. |
| 8 | Take the bogged's mushrooms out and measure again. | "Bogged want 3 or more mushrooms (brown or red) in their pen (0 now): planted on the floor, as they grow in a swamp. Without them comfort can't rise above 55." and the line "Mushrooms (brown or red): 0 in the pen". On the test server: that warning and that line. |
| 9 | Turn breeding on in each pen. | "This species doesn't breed in the zoo yet." On the test server: that message for all four. |
| 10 | At night find a stray. With Mob Taming researched, use a Passivity Serum on one at full health. | "It shakes the serum off. Weaken it first (a quarter of its health or less)." and you keep the serum. On the test server: that message, the serum kept. |
| 11 | Hit it down to 5 health or less, then use the serum. | "The stray sparkles green and calms down. It never attacks now. Bring it to a pen in a Mob House: a Mob Cage carries it (with a Bone Ration in your inventory), or lead it holding one." On the test server: calmed at 4 health. |
| 12 | Use an empty Mob Cage on the calmed stray before its Field Journal page says you saw one calmed, then with no Bone Ration, then with one. | "You don't know strays well enough to move one safely yet...". Look at it a few seconds and the page fills in. Without the ration: "You need a bone ration in your inventory to coax it in." With it: "...hopped into the carrier." Use the cage on the floor in the Strays pen: "...is now living in Strays!" On the test server: calmed out of sight, the cage was refused with "You don't know strays well enough to move one safely yet..."; after a few seconds' look the page filled in; without the ration "You need a bone ration in your inventory to coax it in."; with it caught, then "Frostbone is now living in Strays!". |
| 13 | Find a bogged at night and shear it, then weaken it and calm it. | The serum's message says "(it keeps its mushrooms, or its bare head if it was sheared)". The calmed one stays bare. Catch it with a Bone Ration and put it in the Bogged pen: still bare in the zoo. A bogged that wasn't sheared keeps its mushrooms the same way. On the test server: the game's own shearing event on a wild bogged left it sheared; calmed at 3 health, the calmed one sheared (variant 1); caught and placed, the zoo one sheared (coat 1); an unsheared one calmed, caught and placed kept its mushrooms (coat 0). |
| 14 | Calm and catch a parched and a wither skeleton the same way and put them in their pens. | Each lives in its pen. The wither skeleton keeps its stone sword and never burns. On the test server: a parched calmed at 3 health, caught and living in Parched; a wither skeleton calmed at 4 health ("its sword never strikes"), caught and living in Wither Skeletons, scale 1.2 and fire immune in the zoo as in the wild. (The test server can't read what a mob holds: the sword is for your eyes, row 3.) |
| 15 | Calm and catch a husk and use the cage in the Parched pen; then, with only the four new pens built, calm a skeleton and use a Mob Cage on it. | The husk lives with the parched (the Desert Tomb). The skeleton is refused: no pen takes it (strays, bogged, parched and wither skeletons each keep a pen of their own; skeletons share with zombies and zombie villagers, the Crypt). On the test server: "Gritmaw is now living in Parched!", with the Clipboard asking for the husk's own food ("Wrong food: Husks eat Meat Rations." and a Hanging Food Basket with Meat Rations): give a shared pen both feeders. With a stray living in Strays, the cage wouldn't take the calmed skeleton at all: "Every exhibit already holds a species Skeletons don't share with. Build a new exhibit for a Skeleton." |
| 16 | Find a camel husk jockey in a desert at night (a husk in front, a parched behind). Weaken the parched and use the serum. | It calms down and comes off the camel husk. On the test server: the game's own camel husk jockey carried a husk in front and a parched behind; the calmed parched came down beside it on the ground, the husk still riding. |

Wild ones far from any player despawn (the game's): look for them near you. A zoo one let go is the game's own.
