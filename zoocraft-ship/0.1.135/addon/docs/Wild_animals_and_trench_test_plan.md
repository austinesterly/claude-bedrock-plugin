# Wild animals easy to find, and the Deep Trench 4 times as common: test plan (0.1.135)

Austin, 2026-10-29: "The biome looks great, it is way too rare, I only found one within 2000 X 2000 blocks of spawn.
Improve the spawn rate 4X. I also did not see a single custom animal in the wild".

Why no wild animals showed: they did spawn (the content log was clean and Mojang's own server made them), but
Minecraft lets only a few animals live in an area at once (about 4 in each 9 x 9 chunks), and ours shared those places
with cows, sheep, pigs and chickens. At their old weights they won about 1 place in 10 in forests, taigas and jungles
(1 in 5 in the savanna), and none of them lived on plains. On the cloud server (Bedrock Dedicated Server 1.26.60, seed 12345, two minutes by day in each of
14 land biomes) the old weights left 12 of our land animals still around, against 54 vanilla ones, and a zoo animal in only 7
of the 14 places; in the savanna 1 of the 13 animals that spawned was ours. With 0.1.135's weights: 29 of ours to 27
vanilla, in 11 of the 14 places, and 9 of the savanna's 13. More checks, four minutes a spot: deer at each of four more forest and taiga spots (at the flower forest, in the plains beside it), 20 of the 60 animals that spawned, about the third the weights give (bdstools w46F); a sunflower plains 7 deer of 14 animals (w44S); three jungle spots 18 of our capybaras, gorillas and tigers to 43 vanilla (w47J). In the sea (two and a half minutes at each of five
spots): 15 of our sea animals spawned before, 32 now. The lukewarm seas gave 5 before (manatees and a stingray) and
12 now (stingrays, manatees, hammerheads and a whale shark); over the trench's cliff, jellyfish, an anglerfish and
great whites where there were none.

The trench: a locate grid every 100 blocks over 8000 x 8000 blocks of the same world found the old setting covered
2.2% of the map, with 1 patch in the 2000 x 2000 round spawn (as Austin found). The deep and deep cold oceans it used
are only about 5% of the map, so even all of them gave only about twice as much, in fewer, merged patches. Now it also
takes part of the ordinary and cold oceans: 9.2% of the map (4.1 times), about 4 times as many patches of a size worth
finding (3.7 times those reaching 2 or more points of the grid, 4.4 times those reaching 5 or more), 12 patches round
spawn, and the nearest trench a median 736 blocks away (it was 1,248). Frozen seas keep their ice and the warm seas
stay the tropical animals'. Near a coast the abyss stops before the shore (columns whose floor is above y 50 are never
dug: checked on the server where a new patch meets a beach).

What changed: the spawn weights of 20 wild animals, the deer's biomes (plains too) and the trench biome's placement.
Quit Minecraft fully and start it again. The animals work in any world; the trench's new patches only appear in a NEW
world (or in ocean nobody has visited yet).

| # | Do this | You should see |
|---|---|---|
| 1 | In any world, `/locate biome savanna`, `/tp` there by day and look round for a minute or two, moving now and then. | Zebra herds, giraffes and elephants make up about half the animals (lion prides now and then): before 0.1.135 about 1 animal in 10. |
| 2 | `/locate biome forest`, `birch_forest`, `taiga` and `plains` in turn and look round each. | Deer herds in all four (plains are new), owls in taigas and dark forests: about 4 animals in 10, beside the cows, sheep, pigs and chickens. Flower forests have no deer (Minecraft doesn't count them as forests). |
| 3 | `/locate biome jungle`, then `bamboo_jungle`. | Gorillas and capybaras in the jungle, red pandas in the bamboo, now and then a tiger: about a quarter of the animals (the rest are mostly parrots, ocelots and pandas). |
| 4 | `/locate biome swampland`, then `mangrove_swamp`. | Flamingo flocks, capybaras and otters, and now and then a crocodile: more than half the animals. |
| 5 | `/locate biome ice_plains` (snowy plains). | Penguin groups. |
| 6 | `/locate biome lukewarm_ocean` and swim along near the floor; then `deep_lukewarm_ocean`. | Giant stingrays, manatees and hammerheads among the fish; whale sharks in the deep lukewarm sea. |
| 7 | Make a NEW world, then `/locate biome zoocraft:deep_trench` from spawn and from a few places a thousand blocks apart. | The nearest trench usually within about 700 blocks (it was about 1,250 on the test map), several within 2000 x 2000 blocks of spawn. Some now lie in ordinary and cold oceans, with the same abyss, cliffs, spires and glow. |
| 8 | Swim along a trench's cliff, then dive. | Jellyfish along the ledges far more often, and now and then a great white (keep your distance in Survival). |
| 9 | Open the content log (Settings, Creator) after the steps above. | No lines about `spawn_rules`, `deep_trench` or `zoocraft:wild_`. |
