# The asset pass: test plan (0.1.179)

The last version of module 13 checked the whole add-on's files and the test zoo on the test server:

- **The pack checker's 156 warnings**: none is a bug. 128 name vanilla animations, all in Mojang's own 1.26.60 files;
  14 are drawings made at twice Minecraft's size on purpose; 12 are animation states that switch at once the way the
  game's own do; one is a size written the way the game's own sheep writes it. The last one named a vanilla sheep
  animation the zoo sheep never played: gone (155 left).
- **Textures**: about 176 of the 800 an add-on should use (Mojang's guidance), 2,172 files of the 2,500 an add-on
  should stay under, 17.1 MB of the 25 MB. Nothing unused but six young-animal models kept since 0.1.172 (files are
  never deleted on your computer, and they do nothing).
- **The text**: every animal, item and block has its name; no line is missing or doubled.
- **The whole test zoo on the test server** (76 exhibits, 225 animals, 5 minutes running): no errors in the log.
  15 exhibits showed a warning on the Clipboard, and each was looked at block by block:
  - 8 said "N blocks of floor are under a roof ... Raise the roof", though their roofs were high enough. Every one of
    those blocks was the top of something standing on the floor (a trough, a feeder's basket, a Thermal Regulator, a
    perch, a lamp, a campfire, a sculk block) or the floor under a Void Perch hanging in the air. Those no longer count:
    the warning is only for floor where the roof (or something hanging from it) really is too low.
  - 7 said "No enrichment equipment": the test zoo's Soul Sloths, Earth Molebears, Skulkers, cows, pigs, sheep and
    chickens get a Hanging Food Basket over their feeder.
  - The hedgehogs' lamps hung 3 blocks up, inside their headroom: they stand on the floor by the walls now. The Soul
    Moths' lantern hangs over their campfire instead of over the floor. The Chorus Moths' lamp stands the right way up.
  - The tigers' "loose together and fighting" was the test player standing 130 blocks away: tigers walk to their dens
    only with a player within 56 blocks. Standing by them, one went into her Holding Den within a minute.

Scripts and one edited file: leaving the world and joining again is enough.

| # | Do this | You should see |
|---|---|---|
| 1 | An exhibit with walls 4 high, a roof at 5 and a Water Trough inside, for owls (4 blocks of headroom). Measure it and open the Clipboard. | No "blocks of floor are under a roof" line. Before, the trough's top counted as 1 such block. |
| 2 | Put a roof 3 blocks up over a 2 by 2 corner of the same exhibit and measure again. | "4 blocks of floor are under a roof or blocks lower than 4 blocks, so owls can't use them. Raise the roof to 4 blocks." The Clipboard's Ground line says 4 too low to use. |
| 3 | A Void Ray hall with Void Perches hanging in the air. Measure it. | No "under a roof" line for the floor under the perches. Each floating perch still takes its column of floor, as before (the usable floor is the same as 0.1.178's). |
| 4 | A Basic Feeder with a Hanging Food Basket on it, in a hall roofed at exactly the animals' headroom. | No "under a roof" line for the basket's top. |
| 5 | `/zoocraft:build` in a new Superflat world. Walk round with the Clipboard. | No "under a roof" and no "No enrichment equipment" warnings. Soul Sloths, Earth Molebears, Skulkers, cows, pigs, sheep and chickens each have a basket over the feeder. |
| 6 | The test zoo's hedgehog house. | Four Nocturnal Lamps standing on the floor by the walls (three red, one purple, the right way up). The Clipboard: a nocturnal house, every block lit. |
| 7 | The test zoo's Soul Moths. | The soul lantern hangs over the soul campfire. The moths circle under it, over the campfire and in front of the torch. |
| 8 | The test zoo's Chorus Moths. | The purple lamp in the corner stands up (before it was upside down). |
| 9 | The test zoo's tigers, standing by their exhibit. | Within a minute one tiger walks into a Holding Den; the Clipboard's Turns line says who is out today. |
| 10 | Zoo sheep, grown and young. | They walk, graze and look round as before; the content log has nothing new. |
