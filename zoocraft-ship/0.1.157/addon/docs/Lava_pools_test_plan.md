# Pools of lava in the Lava Falls: test plan (0.1.157)

Austin (2026-10-31): "I also want pools of lava in the lava falls biome as well".

What changes:
- The Lava Falls get pools of lava sunk into the floor of their caverns, here and there over the nylium and netherrack:
  3 to 10 blocks across, two deep in the middle, with a rim of bare netherrack and magma.
- They are made with the land, so they are there the moment you see it, and sealed: every lava block has rock or lava
  on all four sides and under it, so nothing runs off over the land. Break a block beside one and the lava flows into
  the hole, as lava does.
- They only form on level ground, so on rough ground a pool is smaller or isn't there at all. Roots, fungi and vines
  never stand on them.
- The falls from 0.1.155 still land in their own small pools; a fall that lands in one of the new pools pours into it.
- The Field Journal's Lava Falls page tells of the pools.

Only Nether land made from now on gets them: the Lava Falls you have already been to stay as they are. New
world-generation files: quit Minecraft completely and start it again.

Checked before shipping, on Mojang's server (Bedrock Dedicated Server 1.26.60, seed 12345, the whole behaviour pack), at
a big patch of the Lava Falls (x 352 to 447, z 2 to 97):
- Pools, the shipped files with orange concrete in place of lava (so ours can be told from the game's own lava): 21
  pools in the 36 chunks, 6 to 62 blocks of lava each, 3 to 10 blocks across (most 5 to 9), at heights 42 to 84, 241
  more blocks two deep. Every pool block had rock or pool on all four sides and rock or pool under it: none open to
  the air at the side or below. Rims: 295 netherrack, 134 magma, 21 nylium, 6 soul soil.
- When they are made: the same pools made in the first pass had nothing standing on them; made in later passes (after
  the warped forest's plants) they had sprouts, roots and fungi standing on them, so they are made in the first pass.
- With real lava (the shipped files as they are): lava on the land between heights 34 and 100: 3,131 blocks. The only
  plants standing on any of it: one warped forest twisting vine stack (2 blocks), which the game also grows over its
  own lava (6 over the game's lava at the cavern's top in the same patch). No content log lines about the pools.
- A picture of one from the bench world, drawn from the scan: `previews/lava_pools_0157.png`.
- The tests (316, among them a pool run on level, ledged and rough ground in three orders, each lava block checked
  sealed), the type check and the pack checker.
- What can't be checked without a screen: how they look in the game.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft completely and start it again. Open the world. | It loads as usual. |
| 2 | In the Nether, go well past anywhere you have been (1,000 blocks or more), or make a new world, then `/locate biome zoocraft:lava_falls` and go there. | Pools of lava sunk into the cavern floors here and there, glowing, with a rim of netherrack and magma, as well as the falls. |
| 3 | Walk round a pool (fire resistance helps). | Its edge is level with the floor; no lava runs out over the land, and no roots, fungi or vines stand on it. |
| 4 | Break a rim block next to the lava. | The lava flows into the hole, as lava does. |
| 5 | Open the Field Journal's Places page for the Lava Falls. | It tells of pools of lava ringed with magma sunk into the nylium. |
| 6 | Open the content log (Settings, Creator) after the steps above. | No lines about `lava_falls_pool`. |
