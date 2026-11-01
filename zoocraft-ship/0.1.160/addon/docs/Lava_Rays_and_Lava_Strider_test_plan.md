# Lava Rays in the Lava Falls and the Lava Strider Book: test plan (0.1.160)

Austin: "I am not seeing any lava rays in the lava falls biome, lets also add a lava strider enchantment for boots that
allows for normal speed travel in lava".

Why no rays were seen: the game only puts a spawn in lava within 44 blocks of a player. Standing on the Lava Falls land,
the lava that close is mostly the springs set into the roof and cliffs (single lava blocks in the rock) and the falling
streams, so the few rays the game spawned were inside the rock where nobody can see them; the lava sea is too far down.

What it does now:
- Every 10 seconds, for each player in the Lava Falls: wild Lava Rays near them that are out of sight (in a spring in
  the rock or in a falling stream) are moved to open lava close by, or taken away. With fewer than 4 about, one or two
  more are put in open lava you can see: a pool, a fall's pool or the lava sea, 8 to 26 blocks off and within 30.
- Only in the Lava Falls, only with mob spawning on. A ray you put down yourself (a spawn egg, a carrier) is left alone.
- The Lava Strider Book: Bedrock add-ons can't add enchantments of their own to the enchanting table or the anvil, so
  Lava Strider comes as a book. Craft it from a book, 4 magma cream and 4 warped fungus (magma cream in the corners,
  warped fungus on the sides, the book in the middle), on a crafting table or the Zoo Workshop. Put on the boots you
  want it on (any boots, their own enchantments kept), hold the book and use it: the boots get a grey "Lava Strider" line
  under their name, and the book is used up (not in Creative).
- Wearing boots with Lava Strider, you move through lava at your normal walking pace (about 4.3 blocks a second instead
  of 0.8). Take them off and lava is slow again. The lava still burns: wear Obsidian Armor or drink Fire Resistance.

On the cloud test server (Bedrock Dedicated Server 1.26.60, seed 12345, a simulated Survival player):
- Rays: a player standing on the land at 400 83 50 got 4 rays put in pools 12 to 26 blocks off in the first minute, and 4 were near 3 minutes in (2 in their pools, 2 out on the bank by them); at 365 85 85, with fewer pools, 7 put over 3 minutes and 4 near at the end; 4 rays put into springs in the rock 14 to 30 off: 2 moved at once to pools 14 blocks away, the 2 with no pool within 16 taken away. The game's own spawns go on too.
- Lava Strider: walking on the ground 4.27 blocks a second; in lava 2 deep 0.78 (Speed III 0.78 too: Speed doesn't
  touch lava); with the book's boots on 4.28 in lava; boots off, 0.78 again; the line stayed on the boots through
  taking them off and putting them on again; the book was used up in Survival.

A new item and texture: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | In the Nether, `/locate biome zoocraft:lava_falls` and go there. Walk about the land near the pools and the falls' pools, and look down at the lava sea from the cliffs. | Within a minute, Lava Rays gliding in the pools and the sea near you, where you can see them (up to about 4 near you at once). |
| 2 | Stand still somewhere for a few minutes. | More don't keep piling up: about 4 near you at most. |
| 3 | `/gamerule domobspawning false`, walk to another part of the Lava Falls. | No new rays put down. Turn it back on after (`/gamerule domobspawning true`). |
| 4 | Craft the Lava Strider Book (a book in the middle, magma cream in the corners, warped fungus on the 4 sides), on a crafting table or the Zoo Workshop. Or look under Equipment in the creative menu. | A red book with a molten emblem, shining like an enchanted book. |
| 5 | Use it with no boots on. | "Put on the boots you want to give Lava Strider to, then use the book." The book stays. |
| 6 | Put on any boots (diamond with Feather Falling, say) and use the book. | "Lava Strider added to your Diamond Boots..." with an anvil sound. The boots' tooltip has a grey "Lava Strider" line, their own enchantments still there. In Survival the book is gone. |
| 7 | Use a second book with the same boots on. | "These boots already have Lava Strider." The book stays. |
| 8 | With Fire Resistance (or Obsidian Armor), walk into a lava pool 2 deep with the boots on. | You walk through it about as fast as on land ("Lava Strider: you walk through lava at your normal pace" shows once). |
| 9 | Take the boots off and walk in the lava again. | Slow, as lava normally is. Put them back on: fast again. |
| 10 | Open the content log (Settings, Creator) after the steps above. | No lines about `lavarays` or `strider`. |
