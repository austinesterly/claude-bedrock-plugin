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
| 13 | Walk to the edge of the hall | The roof comes down to the floor. The hall is sealed in a shell of Exotic Stone: a vanilla cave only opens into it by chance. From 0.1.242 its tunnels are the ways in and out on foot (see that section) |
| 14 | Content log (Settings, Creator) after all of the above | Nothing from ZooCraft (server: clean) |

Known and meant:
- Goo is a block that looks like a liquid. Add-ons can't make a real liquid, so it doesn't flow and can't be bucketed.
- Monsters spawn in the dark parts of the hall, as in any cave. The biome's own enemy (shark people) comes later.
- A hall next to the Deep Trench keeps a thick stone wall on that side, so the sea stays out (server).
- A vanilla geode or structure can poke into a hall, as they do into vanilla caves.

Ours, Austin's to change: one hall in about every fourth 320-block square; floors between y -39 and -27; the
plants' names and looks; Azure Crystal (the "ocean blue accent"); goo does no harm.

## 0.1.235: Spessartine Garnet tools and armor

Needs a full restart of Minecraft (new items). Austin asked for these to equal diamond "in durability and all other
stats", so every row marked (server) was measured side by side with the diamond item on the test server.

| # | Do this | Expect |
|---|---------|--------|
| 1 | At a crafting table, make each piece with Spessartine Garnets in diamond's recipe shapes (sticks for the tools) | Garnet Sword, Pickaxe, Axe, Shovel, Hoe, Helmet, Chestplate, Leggings, Boots |
| 2 | Look at the icons, hold each tool, wear the armor (third person: F5) | Orange and red garnet with dark handles; the helmet has a blue band. Looks: Austin's to judge |
| 3 | Hit a mob with each tool | Sword 8, pickaxe 6, axe 7, shovel 5, hoe 6: diamond's damage (server) |
| 4 | Mine obsidian, diamond ore, stone, logs, dirt with the matching tool | Same time and same drops as diamond; obsidian drops (server: 60 kinds of block compared) |
| 5 | Till dirt with the hoe, strip a log and scrape copper with the axe, dig a path with the shovel | All work, and each costs the tool 1, as diamond (server) |
| 6 | Watch a tool's bar as you mine and fight | 1 a block (the sword 2), 2 a hit (the sword 1), nothing for grass and flowers: diamond's wear (server). 1,561 uses; armor 363 / 528 / 495 / 429 |
| 7 | Wear the full suit and take hits | 20 armor points, and the same damage taken as full diamond for any blow, also mixed with other armor, with Protection and with Resistance (server: exact to three places) |
| 8 | Enchant them at a table and mend them on an anvil with Spessartine Garnets | Enchants like diamond (10); each gem mends a quarter |

Known differences from diamond:
- A Garnet Sword cuts leaves, vines, cocoa, pumpkins and melons a touch faster than a diamond one (4 ticks against 5
  for leaves). The game only takes whole numbers there, and the choice was a touch faster or a touch slower.
- The armor's toughness is done by a script just before a blow lands (custom armor can't carry toughness itself), so
  the tooltip shows armor points but no toughness line.
- No netherite upgrade: garnet gear can't go in a smithing table. Say if it should.

## 0.1.236: garnet gear on diamond's exact shapes

Needs a full restart of Minecraft (changed pictures). Austin, 2026-11-10: "The armor and tools should match the
diamond armor and tools EXACTLY, the only difference is the colors." Every garnet icon and both worn armor layers are
now the game's diamond pictures with only the diamond-coloured pixels turned to garnet's reds and ambers: same
outline, same handles, same shading, pixel for pixel. Nothing else changed: the numbers were already diamond's.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Put a diamond and a garnet tool of each kind side by side in the hotbar | The same shape exactly; teal on one, red and amber on the other |
| 2 | Wear garnet armor next to an armor stand in diamond (F5) | The same plates and trim; only the color differs. No blue band on the helmet any more |

Still not diamond's, because the game won't let an add-on item do it: a garnet sword cuts leaves and vines a touch
faster (speed 2 where diamond's is 1.5: only whole numbers are taken), and the armor's tooltip has no toughness line
(the toughness itself is there, measured). No netherite upgrade (Austin's to ask for).

## 0.1.237: the goo update (drowning, bubbles, buckets, the Goo Cauldron, Sticky Gauntlets)

Needs a full restart of Minecraft (new items, a new block, a new particle). Austin, 2026-11-10: "Goo should start to
drown you. Let's make goo bubble as well, and pop and stuff. Let's also allow the vanilla bucket to pick up goo, and
goo can be used to form sticky gauntlets. Gauntlets are crafted from leather, and if you dip the leather gauntlets in
a cauldron of goo, you get sticky gauntlets. These have unlimited durability, and they allow players to climb up
walls" and "You can equip sticky gauntlets by putting them in your off hand". Rows marked (server) were measured on
the test server; how it looks, sounds and feels in the hand is Austin's to judge.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | In survival, wade into a goo pit and let your head go under | A line of air over the hotbar ("Air oooooooooo") runs down as in water: about 15 seconds of breath, then a heart every second (server: first harm at tick 316, then every 20). Hold jump to rise out; the air comes back in a few seconds |
| 2 | The same with Water Breathing, or in creative | No harm (server) |
| 3 | Stand by a goo pool and watch and listen | Bubbles swell on the surface and pop, with a soft pop sound; more of them around you while you wade |
| 4 | Aim an empty bucket at goo and use it | A Goo Bucket; that block of goo is gone (server) |
| 5 | Use the Goo Bucket on the ground | A block of goo there; the bucket is empty again (server). Goo doesn't flow: it stays where it is poured |
| 6 | Use the Goo Bucket on an empty cauldron | A Goo Cauldron, full (server). A cauldron with water in it is left alone (server) |
| 7 | Craft Leather Gauntlets: leather, gap, leather over leather, string, leather | Leather Gauntlets |
| 8 | Use the Leather Gauntlets on the Goo Cauldron | Sticky Gauntlets, and the goo drops a third. Three dips empty it and it is a plain cauldron again (server) |
| 9 | Use an empty bucket on a full Goo Cauldron; a Goo Bucket on a part-full one | The goo comes back out; the cauldron is topped up (server) |
| 10 | Put the Sticky Gauntlets in your off hand, walk up to any wall and hold jump | You climb the wall steadily (server: 0.142 blocks a tick, about 3 blocks a second). Keep holding jump and push forward at the top: one push carries you over the edge (server) |
| 11 | On the wall: sneak; then let go of everything | Sneaking, you hang still. With nothing held you slide down slowly (server: 1.2 blocks a second) and land unhurt (server) |
| 12 | Jump once beside a wall with the gauntlets on, without holding jump | A plain hop: the wall doesn't grab you (server) |
| 13 | Fall off something high next to a wall | The gauntlets catch the wall and you slide the rest of the way; no fall harm (server) |
| 14 | Use the gauntlets for a long time | They never wear out: there is no durability bar |

Ours to choose, Austin's to change: Leather Gauntlets cost 4 leather and 1 string; a cauldron of goo makes 3 pairs;
climbing speed, sliding speed, and that sneaking hangs still; goo drowns players only (not mobs); a Goo Cauldron gives
a little light. Known: the Sticky Gauntlets are not drawn on the arms (the off hand shows them as a held item); while
on a wall the Slow Falling icon shows (it is what makes letting go safe).

## 0.1.238: Midnight Owls

Needs a full restart of Minecraft (a new mob). Austin, 2026-11-10: "Let's also add midnight owls to the biome. They
are dark black, with bright blue eyes, they are the size of the players, they are not dangerous."

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Go into an Exotic Formation hall (`/zoocraft:formation` points to one) and wait half a minute | Up to 5 Midnight Owls in the hall (server: 5 after 50 seconds), each appearing at least 12 blocks from you |
| 2 | Look at one | A black owl as tall as you, with ear tufts and big bright blue eyes that shine in the dark and blink every few seconds |
| 3 | Watch them a while | They fly about the hall with slow wingbeats, land on the floor and ledges, and turn their heads to look at you when you come close (server: flying and landing) |
| 4 | Listen | Now and then one hoots: two low notes |
| 5 | Walk right up to one, hit one | They never attack, whatever you do (they have no attack at all) |
| 6 | Watch one that lands in a goo pit | It lifts back out within a few seconds (server) |
| 7 | Leave the hall and come back | Owls far from every player go away on their own; the hall fills up again when you return |

Ours to choose, Austin's to change: 5 owls a hall; 20 health; they don't run from players. A spawn egg (Midnight Owl
Spawn Egg) is in creative. Next (Austin's pick, 18:36Z): catching them for the zoo, a Field Journal page and an exhibit.

## 0.1.239: the Midnight Owl in the zoo

Needs a full restart of Minecraft (a new mob: the zoo's owl). Austin's card, 2026-11-10: "Zoo animal too".

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Open the Field Journal and find the Midnight Owl | Its page: where it lives (the Exotic Formation's halls), that it is harmless, what it eats (Meat Rations), its Reinforced Crate, its Owl Cavern, and two tasks: spot one, and watch one with another close by |
| 2 | Build an Owl Cavern: at least 64 blocks of floor (8 by 8) for two owls and 24 more for each one after, 6 blocks of air high, walled and roofed like every flyer's room, with a feeder of Meat Rations and water | The exhibit takes Midnight Owls |
| 3 | In an Exotic Formation hall, look at an owl for a few seconds, then at one with another close by | The Field Journal fills in both tasks and says "Ready to move" (server). Before that, a crate is refused with a line saying what to watch for (server) |
| 3b | With a Meat Ration in your inventory, use a Reinforced Crate on a wild Midnight Owl | "... the Midnight Owl hopped into the carrier" (server: the crate comes back occupied and the Meat Ration is used up) |
| 4 | Use the full crate in your Owl Cavern | "... is now living in Owl Cavern!" (server). The owl comes out: the same black owl with shining blue eyes, flying about its cavern and landing; it stays put and can't be hurt |
| 5 | Keep a male and a female, fed and comfortable | 1 or 2 owlets after 4 park days: half-size owls that grow up in 8 |
| 6 | Run `/zoocraft:build` in a test world | The test zoo has an Owl Cavern with two Midnight Owls in it (server: 140 exhibits, all occupied) |

Ours to choose, Austin's to change: the cavern's size, 2 Meat Ration units a park day, groups of 2 to 6, the breeding
times, the names. Known: the zoo owl has no special needs yet beyond space, food, water and a Hanging Food Basket.

## 0.1.240: Shark People

Needs a full restart of Minecraft (a new mob). Austin, 2026-11-10: "This biome should be dangerous and have shark
people as the enemy mob".

| # | Do this | You should see |
|---|---------|----------------|
| 1 | In a world on Easy, Normal or Hard, go into an Exotic Formation hall (`/zoocraft:formation` points at the nearest) and wait | Shark People turn up around the hall, one every 15 seconds or so, never right beside you: up to 3 on Easy, 5 on Normal, 7 on Hard (server: 3 on Easy) |
| 2 | Look at one | A steel-blue person with a shark's head, a pale belly, ocean-blue bands on its arms, a fin on its back and a tail; its jaw hangs open now and then. Yours to judge: the look and how it moves |
| 3 | Let one see you (28 blocks) | It comes at you, arms out and jaw snapping, faster than a zombie, and bites: 4 on Easy, 6 on Normal, 9 on Hard (server, Easy: 4 a bite, a bare player down in four bites) |
| 4 | Stand by a goo pit with one in it, or lead one through a pit | It swims where you sink: up through the goo, over the rim on your side and on at you (server: out of a pit 3 deep in 2 seconds, then biting) |
| 5 | Sink into a goo pit with one near | It dives after you |
| 6 | Kill one | 0 to 2 raw cod, some experience, and now and then (1 in 20, a player's kill only) a Spessartine Garnet |
| 7 | Set the world to Peaceful while in a hall | Within 5 seconds they are gone, and none come |
| 8 | Leave the hall | They are gone when you come back later, as the game's own monsters are, and new ones turn up |
| 9 | Creative: the Shark Person Spawn Egg | It places one anywhere |

Ours to choose, Austin's to change: 30 health, 6 damage, how many a hall holds, how often they come, the drops, and
that they come whatever the light (the halls are lit by their crystals and goo, so torches don't keep them out). They
go only for players: not Midnight Owls, zoo animals or residents. Their sounds are the game's drowned, pitched down.
Their cave villages come next (0.1.241).

## 0.1.241: the Shark People's cave villages

Needs a full restart of Minecraft (new world-generation files). Austin, 2026-11-10: "shark people as the enemy mob,
they can also have little cave villages in these biomes". Villages are built by the world as it generates, so they
are only in land first visited on 0.1.241 or later: use a new world, or travel to a hall nobody has been near.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Run `/zoocraft:formation` | The hall's place as before, and now "Its Shark People's village is round x ..., z ..." (server: 136, 88 on seed 12345) |
| 2 | Go to the hall and walk to that place (about 34 blocks from the hall's middle) | A round plaza paved in prismarine with a blue soul campfire in the middle and four dark posts topped with glowing Azure Crystal (server: campfire at 136, -39, 88) |
| 3 | Look around the plaza | Up to four huts, one on each side, 5 blocks from the plaza, each with its door facing the campfire: dark prismarine walls with a glowing crystal window in the other three, a prismarine roof. Homes have a fin on the roof; one hut is the storehouse, with a crystal on top (server: three huts on seed 12345; the fourth's place is taken by an amethyst geode) |
| 4 | Go into a home | A soul lantern hanging from the roof, a bed of dried kelp, a barrel |
| 5 | Go into the storehouse | A sea lantern in the roof, two barrels |
| 6 | Open a barrel | Loot, new each barrel: fish, leather, string, bones, prismarine shards, dried kelp, Azure Crystal, now and then Spessartine Garnets or a bucket (server: 1 garnet, 2 bones, 4 cod, 6 salmon in one) |
| 7 | Watch the plaza from across the hall (Easy, Normal or Hard) | About half of the hall's Shark People turn up on the plaza, round the fire (server: all three stayed round it) |
| 8 | Look where huts meet the cave | No chunk lines: nothing cut off straight, nothing hanging. A hut is left out where a goo pit, a pillar or a low roof is in its way |
| 9 | Break and take things | It is all ordinary blocks: yours to mine, loot and move into |

Yours to judge: how the village looks in the game (the preview picture is drawn from the server's blocks with flat
colours for the game's own blocks). Ours to choose, Austin's to change: the huts' shape and blocks (prismarine, for
the sea), one village a hall, the loot, and that the village has no villagers of its own beyond the Shark People.

## 0.1.242: tunnels out of the halls

Needs a full restart of Minecraft (new world-generation files). Austin, 2026-11-10: "do these caves naturally
connect to vanilla caves?" (his card: "Tunnels out") and "I think it would be cool if a cave exited to a deep sea
trench, we should keep that in the game". Tunnels are dug by the world as it generates, so they are only in land
first visited on 0.1.242 or later: use a new world, or travel to a hall nobody has been near.

| # | Do this | You should see |
|---|---------|----------------|
| 1 | Run `/zoocraft:formation` | The hall and village as before, and now "N tunnels lead out of it; the longest (L blocks) ends near x y z" (server, seed 12345: 2 tunnels, the longest 115 blocks, ending near 273 -36 115) |
| 2 | In the hall, walk the edge and look for a gap in the wall at floor level | 2 to 4 tunnels a hall, evenly round it: each starts as a cut in the hall's floor just inside its edge, about 4 blocks wide and 4 high |
| 3 | Walk into one | It winds from side to side and stays level. For the first stretch its walls are Exotic Stone, then plain stone and deepslate. It runs about 90 blocks past the hall (shorter where it would leave the hall's 320-block square of the map) |
| 4 | Follow it to where it breaks into another cave | Where a tunnel crosses a vanilla cave the two are simply joined: that is a way in and out on foot (server, seed 12345: the east tunnel cuts through a lush cave 20 to 45 blocks past the hall) |
| 5 | Follow one that ends in bare stone | Some tunnels meet no cave: they end as a dead end. Dig on, or try the next tunnel |
| 6 | Find a hall beside a Deep Trench and follow the tunnel on that side | The tunnel ends at a wall of sea water: the trench. Swim out and you are in the trench's side, deep under the sea. The sea runs a few blocks into the tunnel's mouth and no further (server: 7 blocks along the floor, still the same 10 minutes later; a mouth right beside a hall left the hall dry) |
| 7 | Look along a tunnel for straight cuts every 16 blocks | None: the tunnel is one smooth winding tube |
| 8 | Content log after all of the above | Nothing from ZooCraft (server: clean) |

Ours to choose, Austin's to change: 2 to 4 tunnels a hall, their size (about 4 wide, 4 high), their length (90
blocks past the hall) and that they run level. Level matters where one meets the sea: water runs downhill for
ever but only 7 blocks over a level floor, so the sea stays in the tunnel's mouth and never reaches the hall. The hall itself keeps 10 blocks back from a trench, as before. Not every tunnel reaches a cave: it depends on what the world put
around the hall (server, seed 12345: of the test hall's two tunnels the east one joins a lush cave and the west one touches a small water-filled cave near its end).
