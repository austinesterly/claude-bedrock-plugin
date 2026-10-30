# Overworld trees, part 3: test plan (0.1.146)

Module 8 (biomes), its sixth version, after 0.1.144's broadleaf forests and 0.1.145's conifers. Austin's idea
(2026-10-12): revamp the Overworld's trees, bigger and more natural. His card (2026-10-30): replace the vanilla trees in
new chunks. The plan and what comes next: `research/biomes_plan.md`; what it rests on: `research/biomes_facts.md`
("Overworld trees").

What it is: in the jungles, savannas and swamps, new land grows ZooCraft's trees instead of vanilla's. They are vanilla
wood (jungle, acacia and oak logs and leaves), so they work as vanilla's do: axes, planks, saplings from the leaves.
- Jungle: giant jungle trees on 2-wide vine-hung trunks, 28-32 high, with three or four tiers of crowns; emergents up
  to 34 high with their crowns above the rest; great jungle trees (20-26); tall and middle jungle trees on 1-wide trunks;
  cocoa pods on some of them; jungle bushes on the floor (a jungle log under oak leaves, as vanilla's); and some of
  vanilla's own jungle trees, a fallen one now and then.
- Sparse jungle: mostly the 1-wide jungle trees and bushes, far apart, as vanilla's.
- Bamboo jungle: bushes and a few big jungle trees among the bamboo.
- Savanna and savanna plateau: umbrella acacias (a leaning trunk, a wide flat crown and a smaller one on a side branch),
  tiered and great acacias (flat pads on side branches, up to 14 high), wide acacias, baobabs (a 2-wide trunk with small
  flat crowns), some of vanilla's acacias, and oaks, as vanilla's savanna has.
- Windswept savanna: a few acacias only, as vanilla's.
- Swamp: tall and big swamp oaks hung with long vines, cypresses (tall and narrow), giant 2-wide cypresses, wide live
  oaks with a vine-hung crown on every branch, and some of vanilla's swamp oaks. The oaks and cypresses grow in water up
  to 2 deep.
- Mangrove swamps keep vanilla's mangroves (the game makes those itself).

The biomes themselves don't change (only the trees placed in them), so the animals that spawn there are the same as
before: parrots, ocelots and pandas, horses and llamas, frogs and slimes as vanilla, and ZooCraft's animals where they lived.

It only shows where the world is made fresh: a new world, or land you have never been to. Land already explored keeps
its trees. Saplings still grow vanilla trees.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seed 12345): the whole behaviour pack
  loads with no content log errors.
- Every tree shape grown on a test platform (and the swamp ones in a pond) and drawn from the side, beside vanilla's
  mega jungle tree, jungle tree, jungle bush, acacia and swamp oak.
- Trees in the same spots of the bench world, vanilla against ours. Jungle, one 64 x 64 square: 75 and 45 per 64 x 64 (vanilla's are mostly small bushes; ours median 16 high against 8), open ground 23% and 18% (at 10 tries a chunk ours left 29% open, at 12 16%, so it is 11). Over many 64-block tiles: sparse jungle 23.6 and 24.2 per 64 x 64, bamboo jungle 33.7 and 31.6, savanna 15.7 and 15.1, windswept savanna 4.8 and 5.0. Swamp square: 28 and 33, open ground 70% and 67%. Mangrove swamps: the same mangroves.
- Leaf decay: leaves made with the world stay until a block near them changes; then leaves more than 4 blocks from a
  log (counted through leaves) fall, in vanilla trees too. On the test platform, the share of each tree's leaves over 4 from a log: ours 0-14% (jungle giant 10%, emergent 6%, tall 8%, middle 9%, bush 0%, acacias 6-14%, baobab 0%, swamp oaks 12-14%, cypress 0%, giant cypress 9%, live oak 0%); vanilla's mega jungle tree 29%, acacia 7-14%, swamp oak 15-16%. In the jungle square 10.5% of vanilla's leaves and 8.1% of ours.
- Animals: 4-minute passes with a simulated player at the same four spots (jungle, bamboo jungle, savanna, swamp), two with 0.1.145 and two with 0.1.146 (jungle at 12 tries a chunk, bamboo jungle 6; the final 11 and 7 sit between these and an earlier pass at 8 and 4, which had 91): 156 and 202 animals in all; per spot jungle 74/78, bamboo jungle 27/48, savanna 28/25, swamp 27/51; parrots 6/12, ocelots 9/15, pandas 2/3, frogs 0/8, ZooCraft catfish 37/34, deer 13/23, manatees 8/8, capybaras 5/8, gorillas 4/2, flamingos 5/5. Giraffes (none in the 0.1.146 passes) checked alone at the savanna spot with their weight raised to 100 for 6 minutes: 1 on 0.1.145 and 1 on 0.1.146.
- The tests (299), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the jungles, savannas and swamps look as you walk through them.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or travel well past anywhere you have been). | The world loads as usual. |
| 2 | Find a jungle (/locate biome jungle). | Giant jungle trees with tiers of crowns up vine-hung trunks, a few taller ones above the rest, smaller jungle trees, bushes on the floor, cocoa pods on some trees. |
| 3 | Find a sparse jungle (/locate biome jungle_edge) and a bamboo jungle (/locate biome bamboo_jungle). | Jungle trees and bushes far apart in the sparse one; bamboo with bushes and a few big trees in the other. |
| 4 | Find a savanna (/locate biome savanna) and a savanna plateau (/locate biome savanna_plateau). | Acacias with wide flat crowns and side crowns, taller tiered acacias, a baobab now and then, some vanilla acacias and oaks; still mostly open grass. |
| 5 | Find a swamp (/locate biome swampland). | Tall swamp oaks and narrow cypresses standing in the water and on the banks, long vines, wide live oaks, a 2-wide cypress now and then. |
| 6 | Find a mangrove swamp (/locate biome mangrove_swamp). | Vanilla's mangroves, as before. |
| 7 | Cut the trunk of a giant jungle tree and of an acacia and wait a minute. | At most a few leaves fall; the crowns don't fall apart. |
| 8 | Plant a jungle or acacia sapling and let it grow (or bone meal it). | A vanilla tree (saplings are unchanged). |
| 9 | Walk from land you explored before 0.1.146 into new land. | The old land keeps its trees; the new trees start where the new land starts. |
| 10 | Spend a few minutes in a jungle, a savanna and a swamp. | Parrots, ocelots, pandas, horses, llamas, frogs and ZooCraft's animals as before. |
| 11 | Open the content log (Settings, Creator) after the steps above. | No lines about `feature`, `tree` or `trees_feature`. |
