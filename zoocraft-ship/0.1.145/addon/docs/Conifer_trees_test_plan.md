# Overworld trees, part 2: test plan (0.1.145)

Module 8 (biomes), its fifth version, after 0.1.144's broadleaf forests. Austin's idea (2026-10-12): revamp the
Overworld's trees, bigger and more natural. His card (2026-10-30): replace the vanilla trees in new chunks. The plan and
what comes next: `research/biomes_plan.md`; what it rests on: `research/biomes_facts.md` ("Overworld trees").

What it is: in the conifer biomes, new land grows ZooCraft's conifers instead of vanilla's. They are spruce wood (spruce
logs and leaves), so they work as vanilla's do: axes, planks, saplings from the leaves.
- Taiga and snowy taiga: tall spruces (a layered cone, 15-18 high), great spruces (17-23), narrow firs, tall pines with a
  small crown on a bare trunk, now and then a 2-wide spruce, and some of vanilla's own spruces (one in 12 of those hung
  with vines, as vanilla); a fallen spruce now and then.
- Old growth pine taiga: giant pines (2-wide trunks, 24-31 high, a crown on top), tall pines and spruces, podzol round
  the giants as vanilla's.
- Old growth spruce taiga: giant spruces (2-wide, 21-31 high, a long cone), 2-wide spruces, great spruces and firs.
- Windswept forest: spruces, firs and pines, with a quarter of 0.1.144's oaks (round and tall).
- Snowy plains: now and then a lone spruce or fir, about as often as vanilla's.

The biomes themselves don't change (only the trees placed in them), so the animals that spawn there are the same as
before: wolves, foxes and rabbits as vanilla, ZooCraft's deer, owls and Amur tigers where they lived.

It only shows where the world is made fresh: a new world, or land you have never been to. Land already explored keeps
its trees. Saplings still grow vanilla trees. Snow settles on the new trees in snowy biomes as on vanilla's.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors.
- Every tree shape grown on a test platform and drawn from the side, beside vanilla's spruce, pine, mega spruce and mega
  pine.
- Trees in the same spots of the bench world, vanilla against ours, per 64 x 64 blocks of each biome: taiga 106 and 110, snowy taiga 110 and 105 (ours taller: median 16 high against 7); old growth pine taiga 80 and 74 (open ground 55% and 43%); old growth spruce taiga 82 and 61, with 20 and 25 of them 2-wide (open ground 38% and 33%; at 7 tries a chunk ours closed into a wall with 22% open, so it is 6); windswept forest 52 and 49 (open ground 74% and 64%); snowy plains over nine 128-block tiles, 26 spruces and 25.
- Leaf decay: leaves made with the world stay until a block near them changes; then leaves more than 4 blocks from a
  log (counted through leaves) fall, in vanilla trees too. On the test platform, the share of each tree's leaves over 4 from a log: ours 0-13% (tall spruce 4%, fir 0%, great spruce 13%, tall pine 8%, twin spruce 5%, giant spruce 12%, giant pine 0%); vanilla's spruce 8%, mega spruce 18%.
- Animals: two 4-minute passes with a simulated player at the same four spots (taiga, snowy taiga, old growth spruce, old growth pine), 0.1.144 against 0.1.145 (old growth spruce still at 7 a chunk): 143 and 151 in all; per spot 36/38, 28/31, 30/37, 49/45; wolves 9/12, foxes 14/14, rabbits 29/15 (most at the old growth pine spot, 24 and 13), ZooCraft deer 30/47, owls 7/6, okapis 3/3. The 3 penguins and 3 otters on 0.1.144 (none on 0.1.145) were on frozen river ice, where no trees grow: the runs' spread, not the trees.
- The tests (298), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the forests look as you walk through them.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or travel well past anywhere you have been). | The world loads as usual. |
| 2 | Find a taiga (/locate biome taiga), then a snowy taiga (/locate biome cold_taiga). | Tall spruces and firs of several shapes, many bigger than vanilla's, tall bare-trunked pines, some vanilla spruces, a fallen log now and then; snow on the trees in the snowy one. |
| 3 | Find an old growth pine taiga (/locate biome mega_taiga). | Giant pines on 2-wide trunks with their crowns high up, podzol round them, spruces and pines between. |
| 4 | Find an old growth spruce taiga (/locate biome redwood_taiga_mutated). | Giant spruces on 2-wide trunks with long cones, 2-wide spruces, firs. |
| 5 | Find a windswept forest (/locate biome extreme_hills_plus_trees) and snowy plains (/locate biome ice_plains). | Spruces, firs and pines with some oaks on the windswept hills; a lone spruce here and there on the snowy plains. |
| 6 | Cut the trunk of a giant spruce and wait a minute. | At most a few leaves fall; the cone doesn't fall apart. |
| 7 | Plant a spruce sapling and let it grow (or bone meal it). | A vanilla spruce (saplings are unchanged). |
| 8 | Walk from land you explored before 0.1.145 into new land. | The old land keeps its trees; the new trees start where the new land starts. |
| 9 | Spend a few minutes in a taiga and a snowy taiga. | Wolves, foxes, rabbits and ZooCraft's deer as before. |
| 10 | Open the content log (Settings, Creator) after the steps above. | No lines about `feature`, `tree` or `trees_feature`. |
