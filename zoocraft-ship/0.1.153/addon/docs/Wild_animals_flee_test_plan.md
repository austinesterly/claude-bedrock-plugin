# Wild animals run off properly: test plan (0.1.153)

Six wild animals that should keep away from you let you walk right up to them: the Deer, the Chorus Deer, the
Flamingo, the Lush Okapi, the Unicorn and the Zebra. Found while building the Glowhorn Stag (0.1.152): the game reads
how far a wild animal runs (`max_flee`) and, in part, how close you may come (`max_dist`) only at the top of its "keep
away from" setting (`minecraft:behavior.avoid_mob_type`), as the vanilla panda has it. These six had them only in the
entry that names the player, so the game used its own defaults: they ran 10 blocks at most, and stopped as soon as they
were that far off. Now each has both at the top. Four of them also had a script that held them still or walked them
back toward you while you came up (a flamingo display or march, a zebra herd's walk in file, the okapi's long look, the
unicorn's rear), so those scripts now let them go.

Entity and script files change: quit Minecraft fully and start it again. Works in any world. Use each animal's Wild
Spawn Egg, or find them in the wild. Do the steps in Survival, standing up, with nothing they eat in your hand or
inventory: sneaking, or holding their food, they don't take fright (unchanged).

What each now does when you walk up to it:

| Animal | It moves off when you're within | It goes on till you're | What else changed |
|---|---|---|---|
| Deer | 10 blocks | 16 blocks off | |
| Chorus Deer | 10 blocks | 16 blocks off | |
| Flamingo | 8 blocks | 14 blocks off | It runs faster (1.8 times its walk, was 1.5). A flock's display or march stops when you're within 8, and none starts till you're 14 off. |
| Lush Okapi | 14 blocks (was 10) | 18 blocks off | It lifts its head with a snort for a second (was 2 to 3.5 seconds), then goes. |
| Unicorn | 10 blocks | 16 blocks off | It neighs and canters off at once (it used to rear first). Clear of you, it turns to face you and rears up, neighing, once. |
| Zebra | 8 blocks | 14 blocks off | A herd walking in file stops its walk, and no zebra walks back toward you to rejoin the herd till you're 14 off. |

The Glowhorn Stag (0.1.152) was built with this already: 14 blocks, then off till 18.

Tested so far, on the cloud test server (Bedrock Dedicated Server 1.26.60, the add-on's scripts running): an open field
of grass, four wild animals of one kind in a row about 20 blocks off, a simulated player in Survival walking up to the
nearest at walking speed (4.3 blocks a second) and stopping where it got to, the distance of each animal measured every
half second. "Closest" is the nearest the player got to any of them; "stood" adds up the time animals stood still
within their flee range while the player was close.

| Animal | Before (0.1.152) | After (0.1.153) |
|---|---|---|
| Deer | closest 1.8, 3 of 12 never moved, ended 7.7 to 16.2 off, stood 28 s | closest 6.2, all moved, ended 11.4 to 33.7 off, stood 0.5 s |
| Chorus Deer | closest 1.8, ended 5.8 to 30.0 off, stood 23 s | closest 6.3, ended 13.5 to 25.3 off, stood 0 s |
| Flamingo | closest 1.9, ended 4.9 to 12.9 off, stood 21 to 28.5 s | closest 3.1 (most 5 to 7), ended 9.9 to 20.3 off, stood 2.5 s in 24 |
| Lush Okapi | closest 1.2, ended 5.7 to 20.7 off, stood 52 s | closest 4.5 (half of them 7.3 or more), ended 17.1 to 31.0 off, stood 5 s |
| Unicorn | closest 0.7, ended 7.7 to 19.4 off, stood 46.5 s | closest 4.9 (half of them 11.7 or more), ended 16.0 to 30.8 off, stood 1 s |
| Zebra | closest 0.9, ended 6.1 to 14.6 off, stood 22.5 s | closest 4.1 in 24 (2.6 once in an earlier run of 16, a grazing one), ended 9.7 to 18.6 off, stood 5 s |

- With only the entity files fixed, the deer and chorus deer were already right, but the other four were not: the
  okapi's look and the unicorn's rear let the player reach 0.9 and 1.0, flamingo displays started about 9 blocks from
  the player, and a zebra herd's walk in file took zebras back to 3 blocks (one stood 32.5 seconds). The script fixes
  above came from those runs; the flamingo's march (a flock walking together) was the last one found.
- The game starts an animal's run about three quarters of a second after it notices you, so a fast walker can still get
  within 3 to 5 blocks of a grazing zebra or flamingo (an 8-block range) before it is away.
- Park simulator: the Unicorn scene's new wild steps (a neigh and off at once; held shy while the player is near; clear
  of her, it turns, faces her and rears, neighing; then up and off; sneaking or holding a Grain Ration, no fright) pass
  on two seeds; the Lush Okapi scene passes its wild steps. 307 tests, including the six animals' settings, the scripts'
  checks, and each script's ranges matching its entity's.
- What can't be checked without a screen: how the runs look in the game, and that the unicorn's look back reads well.

| # | Do this | You should see |
|---|---|---|
| 1 | Walk up to a few Wild Deer. | They move off once you're about 10 blocks away, at a run when you're close, and keep going till they're about 16 off. You can't walk right up to one. |
| 2 | In the End, walk up to a herd of Wild Chorus Deer. | The same: off at about 10 blocks, till about 16 off. |
| 3 | Walk up to a flock of Wild Flamingos by water, including one that is displaying (marching or flagging its wings). | Within about 8 blocks they run off quickly, the display stops, and they keep going till about 14 off. No display starts while you're closer than that. |
| 4 | Walk up to a Wild Lush Okapi. | Within about 14 blocks it lifts its head with a snort for a second, then moves off to about 18 blocks away. |
| 5 | Walk up to a Wild Unicorn, then stand still. | Within about 10 blocks it neighs and canters off at once, to about 16 blocks away. There, clear of you, it turns to face you and rears up, neighing, once, then goes on with what it was doing. |
| 6 | Walk up to a herd of Wild Zebras, including one walking in file. | Within about 8 blocks they move off and the file breaks up; they keep going till about 14 off, and none walks back toward you till then. |
| 7 | Sneak up to each; then stand up holding its food (Grain Ration, Chorus Browse, Flamingo Pellets, Leafy Ration). | Sneaking, none of them take fright. Holding their food, they come over to you. |
| 8 | Do the same with zoo animals of these kinds in their exhibits. | Nothing new: zoo ones don't keep away from you (the okapi and unicorn still look up at someone sprinting by). |
| 9 | Open the content log (Settings, Creator) after the steps above. | No lines about these animals. |
