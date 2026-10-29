# Skulker: test plan (0.1.139)

The third animal of the cave wing (module 7; the plan is research/cave_plan.md). A fantasy animal of the deep dark: the
warden's shape and senses, but gentle and smaller (1.9 blocks to the top of its head, just taller than you), drawn in
the plain vanilla style. Dark teal hide with sculk patches; its ribs, its heart and the two tendrils on its head glow
(the warden's own glow material), and the heart beats slowly. It is blind: it hears you move. It never attacks
anything.

New entity, model, skin and animation files: quit Minecraft fully and start it again. Works in any world; a superflat
world has no deep dark, so there use the Wild Skulker Spawn Egg for the wild steps.

What its exhibit needs (the Exhibit Clipboard lists each): the dark (no daylight on the floor, so solid walls and a roof,
tinted glass to look through, and nothing brighter than light 7: a sculk catalyst, glow lichen or Nocturnal Lamps;
torches, lanterns and soul lanterns are too bright); 8 or more blocks of sculk in the floor; no sculk shrieker in or
beside the floor (sculk sensors are fine); 100 blocks of floor for the first and 30 more for each other (a pair 130);
Insect Rations in a Basic Feeder or an Insect Feeder, 3 a park day each; a Water Trough. Alone, or a pair with their one
sculkling. Without the dark or the sculk its comfort can't rise above 50; with a shrieker, above 30. Sculk only drops
itself when mined with Silk Touch; Ancient City chests hold it, and a sculk catalyst spreads it where mobs die.

How it behaves: by day it wanders, sits, stands still listening with its tendrils, or eats at the feeder; at night it
digs itself into the sculk to rest (sitting instead where there is no sculk under it). Move within 8 blocks of one
without sneaking and it stops (rising out of the sculk first if it was resting), its tendrils quivering and clicking and
its heart racing, then walks over to you and leans in to sniff you. Then it calms down, goes on its way and pays no heed
to sounds for about 20 seconds. Sneaking, you are never heard. In the wild it lives only in the deep dark, very rarely.
The first time you walk into an Ancient City, one is somewhere near, resting out of sight.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, a simulated player): a mob with the
  Skulker's walk-over (the engine's follow_mob, after a player the script tags) walked 14 blocks straight to the player
  and stopped about a block away. In real Ancient Cities the city check scored 76 to 95 (24 needed) and 0 in the plain
  deep dark and in an ordinary cave, in 4 to 5 ms; places out of the player's sight were found 14 to 22 blocks off.
  The spawn rule: in 3 minutes at each of four places, one Wild Skulker in the plain deep dark, none in two Ancient
  Cities (their floors are not sculk or deepslate; the city check puts one there instead) and none in an ordinary
  deep cave. Light readings: a closed stone room 0 day and night; a sculk catalyst 6 (fine), a soul lantern 10 and a
  torch 14 (too bright).
- The park simulator (a 52-exhibit test zoo from /zoocraft:build, 33 checks, all pass): the exhibit and its measure (140
  blocks of sculk, no shrieker; no daylight, brightest light 5), the clipboard, no warning, comfort high; a player
  walking up was heard: the Skulker listened, its heart raced, it walked up to her (2 blocks) and sniffed her, then calmed
  down and paid her steps no heed; sneaking she was never heard; a shrieker set into the floor was found, warned about,
  and held comfort at 30; at night it dug into the sculk, stayed down, and rose out of it and listened when she walked
  close. The plain deep dark: the Deep Dark found, no city. An Ancient City (deepslate tiles, bricks and gray carpet
  under a roof): found, the heartbeat, and a Wild Skulker put resting 19 blocks off behind a wall, out of sight; walking
  in again put no second one. No errors.
- What can't be checked without a screen: how it looks in the game (above all the glow of its ribs, heart and tendrils,
  drawn with the warden's glow material, which I could only check in my own renders), how it moves, and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, build a dark house as above and release a Skulker pair). | A "Skulkers" exhibit: a dark stone house with a tinted glass front, a sculk floor, a sculk catalyst glowing faintly in a corner, a sculk sensor, a feeder with Insect Rations and a water trough. A pair inside. |
| 2 | Look at the two through the glass (and from inside). | Tall dark-teal animals shaped like small wardens, a little taller than you, with glowing blue-green ribs, a glowing heart that beats slowly, and two glowing tendrils on the head. The glow shows even in the dark. |
| 3 | In Survival, walk into the house without sneaking, within 8 blocks of one. | It stops, its tendrils quiver and click (warden listening sounds), its heart beats fast; then it walks over to you and leans in to sniff you (sniff sound). Then it calms down and wanders off; for about 20 seconds it ignores your steps. It never hurts you. |
| 4 | Sneak about close to them. | They never hear you. |
| 5 | `/time set night` and wait a little. | They dig into the sculk (a digging sound), sinking until only the head and tendrils show. One standing off the sculk sits down instead. |
| 6 | Walk close to one dug in. | It rises out of the sculk (an emerging sound), listens, and comes over to sniff you. `/time set day`: they get up. |
| 7 | Use the Exhibit Clipboard on the exhibit. | Dark: yes (dimly lit; they glow, so guests see them). Sculk: 140 of 8, green. Sculk shriekers: none (sculk sensors are fine). A line for the sculkling when there is one. |
| 8 | Put a sculk shrieker into the floor, use the Habitat Marker on the ground inside again, wait a park day. | Sculk shriekers 1 in red; a care warning that a shrieker frightens them; comfort falls to 30. Take it out and measure again. |
| 9 | Put a torch inside, measure again, wait a park day. | Dark: no; a care warning that they live in the dark; comfort no higher than 50. Take it out and measure again. |
| 10 | Turn breeding on and keep them well for a few park days. | One sculkling at half size, following its mother about. |
| 11 | Try to carry one in a Reinforced Crate before Cave Expeditions, then after it. | Before: "Carrying a Skulker needs Cave Expeditions research at the Research Desk first." After: it goes in the crate and back out into its exhibit. |
| 12 | After Cave Expeditions, open the Field Journal's Places page. | A Deep Dark line with the way to the nearest one, and an Ancient Cities line saying where to look. |
| 13 | In a normal (not superflat) world, go down into the deep dark (under mountains, below y 0: sculk everywhere). | "You found the Deep Dark" in the Field Journal. Wild Skulkers here are very rare: at most one near you. |
| 14 | While you belong to a zoo, walk into an Ancient City (in the deep dark, at about y -50). | "You found an Ancient City" in the Field Journal and "Somewhere close by in the dark, a heart beats slowly", with a faint heartbeat. A Wild Skulker rests somewhere 12 to 24 blocks off, out of your sight. Leave and come back: no second one at the same city. |
| 15 | Walk up to the wild one (or one from the Wild Skulker Spawn Egg). Then hold an Insect Ration. | It listens and walks over to sniff you, as in step 3. Holding an Insect Ration: it comes over from 8 blocks. |
| 16 | Watch the Skulkers. | The Field Journal's tasks: spot one, watch it listen with its tendrils, let it sniff you, watch it rise out of the sculk. |
| 17 | Open the content log (Settings, Creator) after the steps above. | No lines about `skulker`. |
