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
