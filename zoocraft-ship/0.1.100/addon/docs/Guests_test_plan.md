# Guests test plan (module 2: 0.1.97 to 0.1.100)

Module 2 of the remaining modules: guest lines, Nether and End visitors, amenities. The plan is
`research/guests_plan.md` in the ZooCraft Tychoon folder. Each build adds its own section here.

## 0.1.97: guest lines in a data file, and the benchmark fix

Only scripts changed: leave the world and go back in (no Minecraft restart).

The guests' lines now live in one file, `packs/BP/scripts/data/guestLines.js`, grouped by situation (each complaint,
on the way somewhere, a happy animal, a glum animal, no animals yet, and two new ones: a greeting just after a guest
comes in, and a goodbye on the way out). Your own lines can go straight into that file.

You need your own park world with the park open and a few guests about.

| # | Do this | You should see |
|---|---|---|
| 1 | Stand by the Park Entrance Gate and use (right-click, or tap) a guest who has just come in. | Now and then a greeting, such as "Right, where do we start?" or "Ooh, which way to the animals?". Other times the park's main complaint, or something about the nearest exhibit, as before. |
| 2 | Use a guest walking along a path to somewhere else. | "I'm on my way to ...", "Off to ..., over the paths." or "... ? This way, I think.", naming the exhibit, the snack stand or a bench. A line that starts with the place starts with a capital letter now. |
| 3 | Use a guest standing at a Viewing Point. | A line about one of the animals there by name ("Look at ... the ...!", or "... looks a bit glum." if it isn't doing well). |
| 4 | Wait for a guest to head for the gate (after a few minutes) and use them on the way out. | A goodbye, such as "What a day. We'll be back!". If the park has a complaint, sometimes the complaint instead. |
| 5 | Look at the content log. | No script errors. |

The benchmark (the performance check's test plan, `docs\Performance_test_plan.md`): the build no longer stops at the
first Litter Bin, it waits up to 30 real seconds for the park's ground to load, and it finds the ground under you even
if you're flying. In the world where the last build stopped half-way, `/zoocraft:benchmark build` now says that world
holds a half-built benchmark park: make another new Superflat world for it. If you want to see how a park 3 times the
size of yours runs, steps 1 to 5 of that plan in a new Superflat world give the readout.

## 0.1.98: Nether and End visitors

New guest skins: close Minecraft completely and start it again (leaving the world isn't enough for new textures).

Besides the everyday guests, Nether and End visitors now come: explorers dressed for the trip, Nether visitors in
orange heat suits with goggles, gloves and boots (3 looks), End visitors in violet research coats (3 looks). How
many follows the park's animals: the share of Nether visitors is the share of the species on show that come from
the Nether (a park with 2 Nether species of 8 sees about a quarter), the same for the End, the two together at most
60%. A park with no Nether or End animals sees only everyday guests. They have their own lines, and when one picks
where to walk next, an exhibit with an animal from its dimension counts double. They pay and rate the park like
everyone else. Tour followers and Expedition riders are drawn from the same mix.

You need a park with Nether or End animals on show, open, with a few guests about: your own park, or a benchmark
world (`docs\Performance_test_plan.md` steps 1 and 2 in a new Superflat world: its park has 5 Nether and 6 End
species of 20, and 40 guests).

| # | Do this | You should see |
|---|---|---|
| 1 | Open the Park Ledger. | A new line under "Guests say": **Visitors:** with the shares, for example "25% from the Nether, 30% from the End, the rest everyday guests (5 Nether and 6 End of 20 species on show)". With no Nether or End animals: "everyday guests (Nether and End animals on show bring Nether and End visitors)". |
| 2 | Watch the guests coming in through the gate for a minute or two. | Some in orange heat suits with goggles (over the eyes, or pushed up on the forehead; one with a hood), most with a pack on the back; some in long violet, lilac or dark purple coats with a green badge (the dark purple one with a hood). About as many of each as the Ledger says. The everyday guests look as before. |
| 3 | Use (right-click, or tap) a Nether visitor, then an End visitor. | The chat line starts with **Nether visitor:** or **End visitor:** instead of Guest:, and now and then the line is their own, for example "Goggles on. Let's find the Nether animals!" or "Notebook ready. Which way to the End animals?". Everyday guests still start with Guest:. |
| 4 | Use a Nether visitor at a Nether exhibit's Viewing Point (an End visitor at an End one). | Sometimes a line comparing the animal with the wild ones, such as "... the ... looks happier than the wild ones I've seen." At an exhibit from another dimension they say the everyday lines. |
| 5 | Follow a few themed visitors as they set off along the paths. | They head for their own dimension's exhibits more often than the everyday guests do (in the model: End visitors went to End exhibits about half the time, everyday guests about a quarter), but they still visit the others. |
| 6 | Go out of range and come back while a themed visitor walks to a far exhibit. | It comes back in the same look. |
| 7 | If you have a Tour Desk or an Expedition Platform with a tour or ride going: look at the followers and riders. | Some of them are Nether or End visitors too, and using one starts with Nether visitor: or End visitor:. |
| 8 | Look at the content log. | No script errors, and no missing texture (a guest drawn all black and purple). |

## 0.1.99: bins and benches by how much path they cover, and keepers empty the bins

Only scripts and the keeper's behaviour file changed: leave the world and go back in (no Minecraft restart).

- **Coverage:** a path block is covered by a Litter Bin when a working bin stands within 12 blocks of it (sideways,
  and 4 up or down), and by a Bench within 25 blocks. The count runs after each path walk and whenever a bin or
  bench is placed, broken, knocked over or stood up.
- **Litter:** the bins catch half the litter when they cover none of the paths (a bin by the gate) and all of it when
  they cover them all; the rest lands on the paths, as litter did when the bins were full. Until the first count after
  joining, they catch it all, as before.
- **Seating:** the seating part of the services counts 70% of itself with every bench in one corner, all of it with
  the paths covered.
- **Bonus:** bins near 90% of the paths, with enough of them for the guests, bring 2.5% more guests a day; benches the
  same. All such bonuses together stop at 10% (the next build adds lamps and planters).
- **Keepers:** a bin three-quarters full is a job for any keeper, after the exhibits' urgent jobs. A keeper near you
  comes along the path, walks to the bin and empties it; out of sight it's done after the usual time away. You can
  still empty a bin yourself by using it.

You need your own park, open, with Litter Bins, Benches and at least one keeper.

| # | Do this | You should see |
|---|---|---|
| 1 | Open the Park Ledger, then Finances. | Under Services, three new lines: **Litter Bins** (how many, how many the guests need, how much of the paths they're near, and how much of the litter they catch), **Benches** (the same, and what the seating counts for), and **Well-furnished park** (the bonus, or "no bonus yet"). Each says what would bring the bonus. |
| 2 | Put a new Litter Bin beside a stretch of path no bin is near, wait a few seconds and open Finances again. | The Litter Bins line shows more of the paths covered and more of the litter caught. |
| 3 | Break that bin (or knock one over by letting a raccoon out at night). | The coverage goes back down. |
| 4 | Fill the paths with bins (one every 20 or so blocks along every path) and enough benches, one every 40 or so blocks. | Both lines turn green with **+2.5% guests a day** each, and Well-furnished park shows +5%. |
| 5 | Wait for a bin to fill to three-quarters (its lid shows it nearly full), staying near it. | A keeper appears on the path a few blocks away, walks to the bin, and its status says "Working: empty the Litter Bin at ...", then "Done: Emptied the Litter Bin at ... (... litter)". The bin's lid shows it empty. |
| 6 | Talk to the keeper, or open the Staff Room. | The status names the bin by its position. |
| 7 | Look at the content log. | No script errors. |

## 0.1.100: Restrooms, Water Fountains, Path Lamps and Planters

New blocks: close Minecraft completely and start it again (leaving the world is not enough).

- **Four new blocks**, made at the Zoo Workshop and placed beside a path like the other guest services:
  - **Restroom** (2 blocks high, turns to face you): planks, blue dye and a bucket. Guests need one for every 30
    guests a day.
  - **Water Fountain**: stone bricks, iron nuggets and a bucket. One for every 100 guests a day.
  - **Path Lamp** (2 blocks high, makes 2): a glass pane, iron nuggets, a torch and an oak fence. Its lantern lights
    the paths within 8 blocks, so no monsters spawn on them.
  - **Planter** (makes 2): planks, bone meal and dirt. Flowers along the path.
- **Services:** the services score now has five parts: food 30%, seating 20%, tidy paths 20%, restrooms 15% and
  drinking water 15%. A park with no Restrooms or no Water Fountains counts that part at 50 (guests make do), so a
  park built before this one shows its services at 85 instead of 100 until it has them.
- **Bonus:** lamps lighting 80% of the paths bring 2.5% more guests a day, and planters near half the paths the same.
  All such bonuses together still stop at 10%.
- **Guests** walk to the restrooms and the water fountain like the snack stand, and say so ("Off to the restrooms,
  over the paths."). A park short of either has a new complaint and new lines.

You need your own park, open, with paths, a Zoo Workshop and the materials above.

| # | Do this | You should see |
|---|---|---|
| 1 | Open the Park Ledger, then Finances, before building anything new. | The Services line lists "restrooms" and "drinking water". Two new lines: **Restrooms: none (N needed): counts 50, guests make do** and the same for **Water Fountains**, each saying how many beside the paths bring it to 100. Two more lines under the bins and benches: **Path Lamps: 0 Path Lamps, lighting 0% of the paths at night** and **Planters: 0 Planters, near 0% of the paths**, each saying what brings the bonus. |
| 2 | At the Zoo Workshop, make one of each new block. | Restroom, Water Fountain, Path Lamp (2) and Planter (2), each with its own picture in the menu and in your hand. |
| 3 | Place a Restroom beside a path, facing the path. | A small teal-and-white restroom 2 blocks high with a door and a sign, facing you. Using it says "Restroom: open". Placing one where the block above isn't empty says it needs a clear space 2 blocks high. |
| 4 | Place a Water Fountain and a Path Lamp beside a path, and a Planter. | A stone fountain with a small spout, a lamp post with a lantern on top that lights the ground round it, and a box of flowers. Each says what it does when you use it. |
| 5 | Open Finances again after a few seconds. | Restrooms and Water Fountains show 1 and their score goes up (100 once there are enough). Path Lamps say how much of the paths they light at night, Planters how much they're near. |
| 6 | Put lamps along every path, about one every 16 blocks, and wait for night. | Path Lamps turn green with **+2.5% guests a day**. No monsters spawn on the lit paths. |
| 7 | Stand near a Restroom or Water Fountain while the park is open. | Guests walk over to it now and then. Talk to one on the way and it says where it's going. |
| 8 | Break the top half of a Restroom or a Path Lamp. | The whole thing comes down and drops one item. |
| 9 | Look at the content log. | No script errors. |
