# The young of the zoo's farm and forest animals: test plan (0.1.172)

Austin's content log had a line like this for the zoo wolf, fox, cow, panda, pig and sheep: "Locator: Error: model
already has a locator armor_offset.default_neck that doesn't exactly match the one wanting to be added - skipping new
definition in default(geometry.wolf)". The game gives each of an animal's models a generated neck point (for armour and
capes, which none of these animals wears) and keeps one per animal. The game's new baby models (Minecraft 26.10) have a
different skeleton from the grown ones, so each grown model's neck point was refused and logged. Nothing looked or
moved wrong; it was only the log.

What didn't work: 0.1.170 renamed the cub models' head bone (the game ignores case in bone names); 0.1.171 matched the
zoo zombie's file format and bone names (his paste of 19:21Z still had every line).

What changed in 0.1.172: these six animals no longer have a separate baby model. Their young are drawn with the grown
model at half size (a panda cub at 0.4), the way the game drew all its young before 26.10, with the old bigger head.
Every model each animal has now shares one skeleton. Why that is enough, from Austin's own log: the zoo chicken has two
grown models (the ordinary one and the cold one) with one skeleton and different shapes, and it logs nothing.

What looks different: the young. A lamb, calf, piglet, wolf pup, fox kit or panda cub is a small copy of its parent
with a bigger head, coloured like its parent (the 26.10 baby skins went with the baby models). The grown animals look
and move exactly as before. Polar bears move to 0.1.173 and will be built the same way.

New and changed model, animation and client entity files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open any world with the add-on, and open the content log (Settings, Creator). | No "Locator" lines (none for zoo_wolf, zoo_fox, zoo_cow, zoo_panda, zoo_pig or zoo_sheep). |
| 2 | Look at a zoo lamb, calf, piglet, wolf pup, fox kit and panda cub (breed some, or a new world's test zoo from `/zoocraft:build`). | Each is a small copy of its parent with a bigger head. Heads turn to look at you; a lamb grazes; a pup and a kit sit; a kit sleeps curled up; a panda cub sneezes now and then. |
| 3 | Look at grown zoo wolves, foxes, cows, pandas, pigs and sheep. | As before: wolves sit and shake, foxes sleep and pounce, pandas sit and eat, sheep graze, a sheared sheep looks sheared, warm and cold cows and pigs keep their coats. |
