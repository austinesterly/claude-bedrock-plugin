# Content log test plan

What the content log should say, and what was done about the lines it said before. Turn the content log on in
Settings, Creator. Lines from other add-ons or from the game itself aren't the zoo's.

## 0.1.219

After `/zoocraft:build` on 0.1.218 the laptop's content log had 66,275 lines: 18 different errors, over and over, by
day and at night. None of them stops or slows the game, but the log should be clean. 17 came from the zoo's copies of
the game's mobs. Their looks use the game's own animations, and a few of those read values the game works out only for
its own mobs: a horse rearing, a chicken's wings, a witch's potion, a piglin or pillager aiming a crossbow, an iron
golem's swing and its poppy. For any other mob the game says the value is unknown, every frame the mob is on screen,
which is why there were thousands of each. Two look animations also ask a question only the game's own horses and
withers may ask (how far the head may turn; which of the three heads).

| Lines | Mobs | Error | What 0.1.219 does |
|---|---|---|---|
| 5 | horses, donkeys, mules, skeleton and zombie horses | `variable.stand_anim` (horse_v3) | Their copies set it to 0: the zoo's never rear (it read 0 before too). |
| 1 | the same | `query.head_y_rotation` "require a clamp value in degrees" | The zoo's own look animation: the head turns towards you at most 20 degrees each way. |
| 2 | chickens | `variable.wing_flap` (chicken) | The zoo's chicken works its wings out itself: folded on the ground, beating when it falls or jumps off. |
| 1 | witches | `variable.isholdingitem` (witch) | Set to 0: the zoo's never hold up a potion. |
| 2 | piglins and piglin brutes | `variable.attack_state` (piglin) | Set to 0: the zoo's never aim a crossbow. |
| 2 | pillagers | `variable.attack_state` (pillager) | The same. |
| 2 | withers | `query.head_x_rotation` "require a head-index" | The zoo's own look animation: the middle head looks up and down at you as before, the side heads stay level. |
| 2 | iron golems | `variable.attack_animation_tick`, `variable.offer_flower_tick` | Set to 0: the arms swing as they walk, as before. |
| 1 | void rays | `[Scripting][error] [ZooCraft] flight: the game ignored the pushes ...` | Not an error: when the game ignores a flier's pushes, the add-on moves it by short steps instead, as planned. It now shows as an information line. |

The build hired no keepers on the laptop either: "Keepers need a working Staff Room first. It isn't a closed room
yet." On the test server all five Staff Rooms of the test zoo work at once, every time: by day, and at night with
mobs about and difficulty normal. That same message is also what a Staff Room says when it was never measured
(its blocks weren't loaded when the build looked), so it doesn't tell which happened. Now the build measures a room
that doesn't count again, once a second for up to 10 seconds; the content log says what it found for each room
("Staff Rooms: ... works"); and a room that was never measured says "Part of the room isn't loaded. Come closer and
try again." instead.

A new animation file: quit Minecraft completely and start it again. Then a new world: Superflat, Creative, cheats on.

On the test server (BDS 1.26.62.1, a plains flat world at night, mobs spawning, difficulty normal, the bench player
in Creative at 8000 -60 8000, run S): the whole test zoo built in 3 minutes with 6 keepers, and the content log said
"[ZooCraft] zoo: Staff Rooms: 7972 -60 8128 works, 7980 -60 8128 works, 7988 -60 8128 works, 8012 -60 8128 works,
8020 -60 8128 works". The test server draws nothing, so it never shows the Molang lines: only the laptop's content log
can show they're gone. The fixes are in 17 of the zoo's client entities and a new animation file
(`animations/zoo_look_fixes.animation.json`), and the tests check them against the game's own files: every copy that
uses one of those animations now sets the value itself, and none asks the horses' or withers' head question.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft completely, start it, turn the content log on and make the new world. Stand still and type `/zoocraft:build`; stay where you are until it's done. | "Test zoo built: 139 exhibits (139 occupied) with 357 animals, 6 keepers, ...". In the content log, an information line "[ZooCraft] zoo: Staff Rooms: ..." with five rooms, each "works". |
| 2 | Walk round the zoo by day, then `/time set night` and walk round again, past the chickens, the horses, the iron golems, the witches, the piglins, the pillagers and the withers. | None of the 17 Molang lines above in the content log. If a void ray can't be pushed, at most an information line, not an error. |
| 3 | **Please check** (the test server draws nothing): the chickens. | Wings folded while they walk; beating when one falls or flutters down. |
| 4 | **Please check**: the horses, donkeys, mules, skeleton horses and zombie horses. | As before, but the head turns a little towards you when you're beside it (at most about 20 degrees). |
| 5 | **Please check**: the withers. | The middle head looks at you, up and down, as before; the two side heads stay level. |
| 6 | **Please check**: the iron golems, witches, piglins, piglin brutes and pillagers. | As before. The game draws the iron golem's held-out poppy only on its own golem (inferred), so the zoo's never hold one out. |
| 7 | If the build still hires no keepers. | Copy the "Staff Rooms:" line from the content log into the thread. |
