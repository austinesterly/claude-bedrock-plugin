# The Lava Falls look like lava falls: test plan (0.1.155)

Austin's report (2026-10-31): he used `/locate` to find the Lava Falls in the Nether, and the places it gave looked
like normal warped forests. Why: in 0.1.141 the falls started only from the roof right over the lava sea (springs were
tried only from y 32 to 44, and kept only where their lava fell into the lava sea). `/locate` points at the biome's
land, mostly high caverns well over the lava sea, and there were no falls there, only blue nylium, fungi and a little
glowstone.

What changes in new Nether land:
- Lava pours all through the biome's caverns: springs are tried in the roof anywhere from y 32 to 110 (10 tries a
  chunk, was 4) and in the cliffs from y 36 to 100 (16, was 4). Each is set into the rock and pours one stream out of
  its open face, so the falls are single, tall streams (many of 30 to 60 blocks), not a plus of five.
- A fall onto the ground lands in a pool of lava it lets into the ground first: up to 5 blocks across and 2 deep in the
  middle, sunk into level ground and sealed all round and underneath, with magma here and there round its rim and the
  plants over it cleared. Where there's no level ground for a pool (a slope, a drop right beside it, a hollow under
  it), that spring stays netherrack, so lava never runs loose across the land. Falls into the lava sea are as before.
- More and bigger glowstone hanging from the roof (8 clusters a chunk, was 4; 20 blocks a cluster, was 14).

Only Nether land made from now on changes. Land you have already been to keeps how it looks (its springs all turned
long ago). To see it: a new world, or travel well past where you've explored in the Nether (1,000 blocks or more) and
use `/locate biome zoocraft:lava_falls` from there. Quit Minecraft fully and start it again after the update.

Checked before shipping, on Mojang's server (Bedrock Dedicated Server 1.26.60, seed 12345, the whole behaviour pack): a
big patch of the biome with open land (x 352 to 447, z 2 to 97, 90% Lava Falls), made fresh by 0.1.154 and by 0.1.155
in two worlds, then read block by block:
- Falls: 3 with 0.1.154 (none on the land), 61 with 0.1.155. 96 springs made a pool and a fall onto the land, 35 a
  fall into the lava sea; 232 stayed netherrack (no level ground under them, or no drop).
- Loose lava (lava over the lava sea, lying on the ground with an open side): 25 blocks with 0.1.154 and 26 with
  0.1.155, the same few spots in both (the game's own lava springs); none at the new pools.
- Glowstone: 1,152 blocks with 0.1.154, 4,303 with 0.1.155.
- No content log errors.
- Pictures of the same cavern before and after: `previews/lava_falls_0155.png`.
- The tests (312: 300 made-up rough grounds, every pool sealed), the type check and the pack checker.
- What can't be checked without a screen: how it looks in the game (the glow, the haze) and how it runs on your
  computer while new land is made.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully and start it again. Make a new world (or travel 1,000 blocks or more past where you've been in the Nether). | The game loads as usual. |
| 2 | `/locate biome zoocraft:lava_falls` and go there. | Blue nylium and warped fungi under a high roof, with tall falls of lava pouring from the roof and the cliffs, and glowstone hanging all over the roof. |
| 3 | Walk up to a fall that lands on the ground (stay back: it's lava). | It pours into a small round pool of lava sunk into the ground, with magma here and there round its edge. The lava stays in the pool. |
| 4 | Look round the edges of a few pools, and down slopes near them. | No lava running off across the ground. |
| 5 | Find a lava sea in the biome. | Falls pouring into it from the roof, as before. |
| 6 | Open the content log (Settings, Creator) after the steps above. | No lines about `lava_falls` or `lava_spring`. |
