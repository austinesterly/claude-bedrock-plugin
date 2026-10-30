# Overworld trees, part 1: test plan (0.1.144)

Module 8 (biomes), its fourth version. Austin's idea (2026-10-12): revamp the Overworld's trees, bigger and more
natural. His card (2026-10-30): replace the vanilla trees in new chunks (rather than growing ours among them). The plan
and what comes next: `research/biomes_plan.md`; what it rests on: `research/biomes_facts.md` ("Overworld trees").

What it is: in six biomes, new land grows ZooCraft's trees instead of vanilla's. They are made of vanilla wood (oak,
birch and dark oak logs and leaves, mushroom blocks), so everything you know about them still works: axes, planks,
saplings from the leaves, apples from oak leaves.
- Forest: oaks of four shapes (a round crown, a tall one with leafy limbs up the trunk, a big branching one like
  vanilla's big oak, a tall straight one) and tall and slim birches; now and then a fallen oak log; leaf litter round
  the trees; a bee nest on some, as vanilla.
- Flower forest: round and tall oaks, tall and slim birches, bee nests.
- Birch forest: tall birches (trunks 9-13), slim ones with a narrow crown, old ones with small leafy branches up the
  trunk, a few round oaks; fallen birch logs.
- Old growth birch forest: towering birches (trunks 15-20 with a long narrow crown on top), slim and old ones.
- Plains: now and then a lone oak, big and branching or round (about as often as vanilla's).
- Dark forest: great dark oaks (a 2-wide trunk with limbs, each limb with a crown of its own, under a wide roof),
  giant ones, some vanilla dark oaks, one in six hung with vines; huge brown and red mushrooms; some oaks and birches;
  leaf litter and tall grass round the trees.

The biomes themselves don't change (only the trees placed in them), so the animals that spawn there are the same as
before: wolves in forests, rabbits in flower forests, ZooCraft's wild animals where they lived.

It only shows where the world is made fresh: a new world, or land you have never been to. Land already explored keeps
its trees, so where old land meets new you can see a line where the trees change. Saplings still grow vanilla trees.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors, and a behaviour pack file named as a vanilla tree rule replaces that rule (with the
  rule kept but placing nothing, a forest square went from 302 tree tops to 2).
- Every tree shape grown on a test platform and drawn from the side; vanilla's huge mushrooms are game code (they grow
  nowhere from an add-on's list), so the mushrooms are our own, built from mushroom blocks.
- Trees in 64 by 64 block squares of the same bench world, vanilla then ours: forest 72 and 69 (trunks a median 5 and 9 blocks tall, the tallest 12 and 17), flower forest 42 and 34, old growth birch forest 69 and 61 (median 7 and 15, tallest 12 and 19), dark forest 72 and 65 (1 and 3 huge mushrooms, vines on trunks 386 and 484 blocks); on the plains a lone oak now and then. Ground open to the sky about as before: forest 50% and 36%, old growth birch 48% and 52%, dark forest 10% and 10%, flower forest 70% and 74%.
- Leaf decay: leaves made with the world stay until a block near them changes; then leaves more than 4 blocks from a
  log (counted through leaves) fall, in vanilla trees too. The first drafts had big crowns with up to two thirds of
  their leaves that far out, so the shapes were changed until they are no worse than vanilla's: leaves over 4 from a log, away from the squares' edges, vanilla then ours: forest 3.2% and 7.4%, old growth birch 0% and 5.2%, dark forest 5.8% and 8.6%, flower forest 5.3% and 4.8% (vanilla's own big oak has 15% and its dark oak 5-12%, grown on the platform).
- Animals, the same spots in a world with 0.1.143 and one with 0.1.144 (a player standing there, several runs of 4-5 minutes): forest deer 18 in 14 minutes and 32 in 24, wolves 1 and 6, cows, sheep, pigs and chickens 14 and 44; flower forest deer 9 in 9 minutes and 17 in 14, rabbits 2 and 1; old growth birch forest deer 12 in 14 minutes and 29 in 24; dark forest deer 2 and 3 in 4 minutes. Animals spawn under the new crowns too (sky light 12-14 where they appeared).
- The tests (297), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the forests look as you walk through them.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or travel well past anywhere you have been). | The world loads as usual. |
| 2 | Find a forest (/locate biome forest). | Oaks of several shapes, many bigger than vanilla's, some birches, leaf litter on the ground, a fallen log now and then, a bee nest on a tree here and there. |
| 3 | Find a birch forest, then an old growth birch forest (/locate biome birch_forest, then /locate biome birch_forest_mutated). | Tall birches; in the old growth one, birches towering 20 or more blocks with long narrow crowns. |
| 4 | Find a dark forest (/locate biome roofed_forest). | Big dark oaks with 2-wide trunks and limbs, a dense roof, vines on some trunks, huge red and brown mushrooms, leaf litter. |
| 5 | Find plains and a flower forest (/locate biome plains, /locate biome flower_forest). | A big lone oak now and then on the plains; oaks and birches among the flowers. |
| 6 | Cut the trunk of a big oak or dark oak and wait a minute. | At most the far tips of the crown fall as leaves decay, as with vanilla's big oaks; the crown doesn't fall apart. |
| 7 | Plant an oak sapling and let it grow (or bone meal it). | A vanilla oak (saplings are unchanged). |
| 8 | Walk from land you explored before 0.1.144 into new land. | The old land keeps its vanilla trees; the new trees start where the new land starts. |
| 9 | Spend a few minutes in a forest and in a flower forest. | Wolves in the forest, rabbits in the flower forest, as before. |
| 10 | Open the content log (Settings, Creator) after the steps above. | No lines about `feature`, `tree` or `trees_feature`. |
