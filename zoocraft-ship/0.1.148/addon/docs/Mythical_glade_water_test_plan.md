# Mythical Glade water: test plan (0.1.148)

Module 9 (the Mythical biome), its second version. Austin's idea 10 (2026-10-15) asked for "glistening waterfalls" in
the glade; the plan (`research/mythical_plan.md`) gave this version glowing pools and springs that pour down as falls.

What it is, in new glade land only:
- **Glowing pools**: round, uneven pools of turquoise water one to two blocks deep, let into level turf. Their basin and
  rim are calcite with amethyst, sea lanterns glow in the floor, lily pads float on top and amethyst clusters grow on
  the rim. They sit in the open ground between the giant trees.
- **Waterfalls**: springs in the glade's cliffs. When the land is first loaded, each spring pours water out of the cliff
  face if the drop below it is at least 4 blocks; else it stays rock.
- **Glow lichen** on the cliff faces and overhangs just under the turf.
- One new block, the Glade Spring (it looks like stone and turns into water or rock within a couple of seconds; you
  should never need to see it).

It only shows where the world is made fresh: a new world, or glade land you have never been to.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, seeds 12345 and 777, the glade
  made widespread): the whole behaviour pack loads with no content log errors.
- Pools (last two worlds, a pool tried in every chunk between the giants' rooms): 27 placed, every one sealed (no water face open), all let into turf, 24 on the flat lake land and 3 on the hilly land; none on or beside a lake (one has a 3-block puddle two blocks out). Earlier test worlds caught pools on ponds and rims running into lakes; the checks that stop them are in this build. The shipped add-on tries half those chunks.
- Falls: 12 of 13 springs on the hilly world poured, falls 6 to 37 blocks high; the other had no drop and turned to dirt. The flat world has no cliffs, so no springs.
- The tests (301), the type check and the pack checker (no new warnings).
- What can't be checked without a screen: how the glow and the falls look in the game, day and night.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again (a new block). Make a new world, or go well past anywhere you have been. | The world loads as usual. |
| 2 | Go to a Mythical Glade (Field Journal's Places page, or /locate biome zoocraft:mythical_glade). | The glade, as in 0.1.147. |
| 3 | Look on the level ground between the giant trees. | Small round pools set into the turf, rimmed with white calcite and purple amethyst, lily pads on top. |
| 4 | Look into a pool (at night if you can). | Sea lanterns glowing in the floor under the water; no water spilling out over the grass. |
| 5 | Look along the glade's cliffs and steep slopes. | Here and there a waterfall pouring out of the cliff face and running away down the slope; glow lichen on the rock. |
| 6 | Wait a few seconds by a fall when you first arrive. | It starts pouring within a couple of seconds of the land loading; then it is ordinary water. |
| 7 | Walk from glade land you explored before 0.1.148 into new glade land. | The old land is unchanged; pools and falls only in the new land. |
| 8 | Open the content log (Settings, Creator) after the steps above. | No lines about `glade`, `pool`, `spring`, `structure` or `feature`. |
