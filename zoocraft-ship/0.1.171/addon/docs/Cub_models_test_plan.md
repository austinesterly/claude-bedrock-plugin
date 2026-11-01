# The cubs' models: test plan (0.1.171)

Austin's content log after 0.1.170 (2026-11-01 15:49Z) still had a line like this for the zoo wolf, fox, cow, panda, pig
and sheep: "Locator: Error: model already has a locator armor_offset.default_neck that doesn't exactly match the one
wanting to be added - skipping new definition in default(geometry.wolf)". 0.1.170's change (the cub models' head bone
named "Head") didn't stop it: the game matches bone names without regard to case.

What the lines mean: the game gives each of an animal's models a neck point for armour and capes (none of the zoo's
animals wears either) and keeps one per animal. The game's new baby models (Minecraft 26.10) carry it lower than the
grown models, so each grown model's neck point was refused and logged. Nothing looked or moved wrong; it was only the log.

What changed: the one zoo animal with the game's baby model that logs nothing on Austin's machine is the zoo zombie (and
the Calm Zombie). The six now match it in the two ways they differed: each client entity file is the newer format the
game's own zombie file uses (1.26.0), and each cub model's body bone is named "Body", as on the game's baby zombie. The
cubs look and move exactly as before. Polar bears move to 0.1.172.

If a Locator line is still there after this, the next build stops using separate cub models (cubs become small copies
of the grown model, as before Minecraft 26.10), which can't clash.

New model and client entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open any world with the add-on, and open the content log (Settings, Creator). | No "Locator" lines (none for zoo_wolf, zoo_fox, zoo_cow, zoo_panda, zoo_pig or zoo_sheep). |
| 2 | Look at a zoo lamb, calf, piglet, wolf pup, fox kit and panda cub (breed some, or a new world's test zoo from `/zoocraft:build`). | Each looks as before: the game's own baby. Heads turn to look at you; a pup and a kit sit; a panda cub sneezes now and then. |
| 3 | Look at grown zoo wolves, foxes, cows, pandas, pigs and sheep. | As before: wolves sit and shake, foxes sleep and pounce, pandas sit and eat, sheep graze, a sheared sheep looks sheared. |
