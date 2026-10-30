# The Lava Falls: test plan (0.1.141)

Module 8 (biomes), the first of its versions. Austin's idea (2026-10-12): a Nether biome for the Lava Ray "with lava
falls, glowstone, and the warped forest atmosphere so the blue contrasts with the orange". On the card about see-through
lava he chose "Real lava". The plan and what comes next: `research/biomes_plan.md`; what it rests on:
`research/biomes_facts.md`.

What it is: a new Nether biome, the Lava Falls, in place of part of the Nether wastes and basalt deltas (about one
eighth of the Nether in all). Blue warped nylium over netherrack, with the warped forest's fungi, roots, sprouts and
twisting vines; wide lava seas with magma under them; lava pouring from the roof and the cliffs into the lava seas;
glowstone hanging from the roof; the warped forest's blue haze, drifting blue spores and its sounds. Lava Rays spawn
there far more than anywhere else (and Warped Geckos on the nylium). The Field Journal's Places page has it, and after
Heat Systems research it points the way to the nearest from wherever you are in the Nether.

A biome only appears where the Nether is made fresh: a new world, or parts of the Nether you have never been to (far
from where you have been). Places you have already explored don't change. New block and biome files: quit Minecraft
fully and start it again.

How the falls work: the game never makes lava flow that was placed while the world is made, so the roof and cliffs get a
Lava Spring block (it looks just like netherrack). The first time you come near, each spring turns into lava and pours
down into the lava sea, or into plain netherrack if its lava wouldn't fall at least 8 blocks into the lava sea (so the
falls never flood the ground you walk on). Each fall is a plus of five streams, like any lava source in the open.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors. In a 6 by 6 chunk area of the biome (the biome 460 of 576 samples): blue warped
  nylium and magma sea floors, 420 twisting vines, 315 nether sprouts, 241 warped wart blocks, 63 roots, 16 fungi and
  their stems, and 178 glowstone blocks. Every spring had turned into lava or netherrack (none left).
- The falls: lava a script or a command sets doesn't flow on that server until a block next to it changes; with the
  block it pours into set and cleared in the same tick, 5 of 5 springs poured at once. With the shipped number of
  springs (4 tries in the roof and 4 in the cliffs a chunk), one cavern over a lava sea got 15 falls of 13 to 20 blocks
  (about one every two chunks of the biome). 16 and 24 tries had made 31 (a rain of lava), 2 and 3 made 11.
- How common: a grid of 6,561 points over 4,000 by 4,000 blocks of the Nether: the Lava Falls covers 13.3% of it in 97
  patches; from any point the nearest is a median 243 blocks away (Nether blocks). From 0,0 the game's own "nearest
  biome" search found one at x 32, z -96 at once, which is what the Places page uses.
- The Lava Rays: 5 minutes over a Lava Falls lava sea (a simulated player held 19 blocks over it, as in the 0.1.134 checks): 4 Wild Lava Rays spawned, in the lava, and no striders. Over a Nether wastes lava sea in the same world for the same time: no rays, 1 strider.
- The tests (294), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how it looks (the fog, the spores, the glow of the falls) and sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or use one whose Nether you have barely explored) and go to the Nether. | Nothing different by the portal unless a Lava Falls patch is right there. |
| 2 | Before Heat Systems research, open the Field Journal's Places page. | A Lava Falls line: "not found yet. Somewhere in the Nether. Heat Systems (Research Desk) points the way to the nearest." |
| 3 | After Heat Systems (or in a Creative world with it done), open the Places page in the Nether. | The Lava Falls line with where to look and "The nearest from where you stand: about N blocks to the (direction) (x .., z ..)". In the Overworld it says "The way to the nearest shows here when you are in the Nether". |
| 4 | Walk the way it says (or `/locate biome zoocraft:lava_falls`). | Blue warped nylium and warped fungi, blue haze and spores, the warped forest's sounds, glowstone hanging from the roof, and lava seas with lava pouring into them from the roof and the cliffs. |
| 5 | Stand in it. | "You found the Lava Falls" in the Field Journal: Lava Rays glide under its lava seas more than anywhere. |
| 6 | Watch the falls as you come close for the first time. | Each pours from the roof (or a cliff) down into the lava sea. None pours onto the ground you walk on. |
| 7 | Wait by a lava sea (stay on the shore, out of the falls). | Lava Rays gliding under the lava, far more than in the Nether wastes; striders too. Hold Molten Plankton Feed at the shore: a ray comes to look. |
| 8 | Look at a Lava Ray's Field Journal page. | Where: "The Lava Falls in the Nether most of all, and lava lakes in basalt deltas and the Nether wastes". |
| 9 | Open the content log (Settings, Creator) after the steps above. | No lines about `lava_falls` or `lava_spring`. |
