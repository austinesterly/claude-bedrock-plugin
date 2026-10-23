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
