# Wild spawning: test plan (0.1.134)

Austin, 2026-10-28: "start the generation of all of our mobs", then the card's pick "Wild spawning": test every
animal's natural spawning and fix any that never show up in their biomes. Every wild animal's spawn rule was tried on
Mojang's own server (Bedrock Dedicated Server 1.26.60, in the cloud, seed 12345) with a test player held in each biome,
by day and by night, first at the shipped rarity and then with every rule made very common (can it spawn at all?).
With 0.1.133's rules 32 of the 41 animals spawned. Nine never did, however common: the catfish, manatee, giant
stingray, jellyfish, anglerfish and goblin shark (a water rule needs a "where" flag beside "under water", or the game
never places it), the whale shark and the great white (their depth and light windows sat above the dark sea floor
where the game puts water animals), and the Basalt Tortoise (every spawn in the basalt deltas stands on netherrack, and
its rule only allowed basalt, blackstone and magma). 0.1.134 fixes all nine; on the server all 41 now spawn. Then every
animal was looked for at its shipped rarity, staying two to five minutes at a time where it lives: four were still too
rare to find (the anglerfish and goblin shark, whose dark water glow squid share, the whale shark and the Basalt
Tortoise, whose wide shell fits fewer spots), so they are more common now.

What changed (behaviour pack spawn rules only, no new files): quit Minecraft fully and start it again, then any world
works (spawning happens in loaded chunks anywhere; no new world needed). Animals appear 24 to 44 blocks from you, so
keep moving through the biome rather than standing still, and look round you, not at your feet.

| # | Do this | You should see |
|---|---|---|
| 1 | `/locate biome river`, `/tp` there by day and swim along the river for a few minutes. | Catfish schools on the riverbed (two to four together), otters on the banks, and now and then a manatee or two. Before 0.1.134 no catfish or manatee ever appeared. |
| 2 | `/locate biome lukewarm_ocean` (or warm_ocean), swim along near the floor. | Giant stingrays lying on the floor, hammerheads (up to three) and manatees in the shallows. |
| 3 | `/locate biome deep_lukewarm_ocean` and swim along the bottom for a while. | Whale sharks, alone and still rare (on the test server about one every five minutes), plus hammerheads and stingrays. A whale shark appears on the deep floor and swims up from there. |
| 4 | `/locate biome zoocraft:deep_trench`, swim along the cliff where the floor drops away. | Great whites and drifting jellyfish along the ledges. Great whites hunt: keep your distance in Survival. |
| 5 | Dive into the abyss to below about y 0 and swim over the dark floor (away from the sea lanterns). | Anglerfish (on the test server about one every two or three minutes) and, rarer, goblin sharks (about one in ten minutes): they keep to the dark (light 4 or less) and appear only within some 44 blocks of you, so they show up when you are deep. |
| 6 | In the Nether, `/locate biome basalt_deltas` and walk the deltas for a few minutes, over the patches of netherrack. | Basalt Tortoises, one or two at a time, on the netherrack (they never appeared before 0.1.134; still rarer than the Cinder Boars and Quartz Beetles round them, so give it several minutes). |
| 7 | In the Nether, find a big lava sea in the basalt deltas or nether wastes and stay over it for several minutes. | Lava Rays now and then, rising from the bottom of the lava among the striders. |
| 8 | `/locate biome beach` (a warm sand beach), then `/locate biome cold_taiga`, and look round each for a few minutes. | Flamingo flocks on the warm beach (as well as in swamps and mangroves). In snowy taiga, now and then a lone Amur tiger (its pale winter coat): very rare, like the jungle tiger. |
| 9 | Open the content log (Settings, Creator) after the steps above. | No lines about `spawn_rules` or `zoocraft:wild_`. |
