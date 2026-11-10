# Exotic Formation test plan

The Exotic Formation is Austin's cave biome (2026-11-10): big open halls of dark blue stone with an ocean-blue glow,
goo pits, Spessartine Garnet ore, hanging Sunset Vines and strange plants. It comes in four versions: the caves
(0.1.234), garnet tools and armor, Midnight Owls, then shark people and their cave villages.

Things the cloud test server showed are marked (server). Looks and feel can only be checked in the game: those rows
are Austin's.

## 0.1.234: the caves

Needs a full restart of Minecraft (new blocks). The halls are made with the world, so they are only in land that
has never been loaded: use a new world, or travel somewhere new in an old one. Turn cheats on for the two commands.

| # | Do this | Expect |
|---|---------|--------|
| 1 | In a new world, run `/zoocraft:formation` | A line with how far the nearest hall is, where it is, and a `/tp` line. In every world one is under x 112, z 112 (server: the same arithmetic in the world's files and the script) |
| 2 | Run the `/tp @s 112 -37 112` line it gave (Creative is easiest the first time) | You stand in the middle of a hall about 130 blocks across and 30 high, walled, floored and roofed in dark blue Exotic Stone, with stone pillars (server) |
| 3 | Look at the chunk lines in the floor, walls and roof | No straight seams or missing rows: the hall is one smooth shape (server: scanned block by block) |
| 4 | Look around without a torch | It glows: Azure Crystal in the stone, bright blue goo, the vines and Goo Blooms. Dark between the lights. Looks: Austin's to judge |
| 5 | Look up at the Sunset Vines | They hang from the roof, 2 to 12 blocks long. Each starts yellow at the roof and runs through orange, red and purple to blue: the longer the vine, the more of the gradient shows (server: piece by piece) |
| 6 | Find a goo pit (bright blue, set into the floor) and walk in, in Survival | You sink slowly, no fall damage, slowed while in it (server). The goo is opaque, swirls, and can't be picked up or mined |
| 7 | Hold jump in the goo | You rise and come out over the rim. Feel: Austin's to judge (the server's test player can only tap jump: each tap lifted it) |
| 8 | Stay under the goo for 30 seconds | No harm: it is sticky, not deadly (ours; say if it should hurt or drown) |
| 9 | Mine Spessartine Garnet Ore (orange flecks in the dark stone) with an iron pickaxe or better | It drops a Spessartine Garnet. With a stone pickaxe or by hand it drops nothing, as diamond ore |
| 10 | Mine Exotic Stone with any pickaxe; mine Azure Crystal | Each drops itself. Azure Crystal placed anywhere lights like a torch |
| 11 | Break a Sunset Vine, hang it under a block of Exotic Stone, hang more under it | The first is yellow, each one under it the next colour down (server). Break the stone: the whole vine falls (server) |
| 12 | Pick the floor plants: Goo Bloom (glowing blue), Sunset Fern (orange and red), Midnight Cap (lilac mushroom) | Each drops itself and can be planted on Exotic Stone, stone, deepslate, moss, dirt or grass |
| 13 | Walk to the edge of the hall | The roof comes down to the floor. Vanilla caves may open into the hall: those are the ways in on foot |
| 14 | Content log (Settings, Creator) after all of the above | Nothing from ZooCraft (server: clean) |

Known and meant:
- Goo is a block that looks like a liquid. Add-ons can't make a real liquid, so it doesn't flow and can't be bucketed.
- Monsters spawn in the dark parts of the hall, as in any cave. The biome's own enemy (shark people) comes later.
- A hall next to the Deep Trench keeps a thick stone wall on that side, so the sea stays out (server).
- A vanilla geode or structure can poke into a hall, as they do into vanilla caves.

Ours, Austin's to change: one hall in about every fourth 320-block square; floors between y -39 and -27; the
plants' names and looks; Azure Crystal (the "ocean blue accent"); goo does no harm.
