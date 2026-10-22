# Performance check test plan (0.1.96)

This version adds no animals or blocks. It adds a benchmark: `/zoocraft:benchmark build` builds a full park round you in a new world (20 exhibits with 100 animals of the 20 script-steered species, paths, 28 Viewing Points, 24 guest services, 5 Staff Rooms and the entrance), hires 10 keepers and opens it to 40 guests; `/zoocraft:benchmark run` then times the scripts and prints a readout. It also makes the slowest script loops lighter (the list is at the end). Only scripts changed, so leaving the world and going back in is enough; no Minecraft restart is needed.

You need:
- a new world: Superflat, Creative, cheats on (the benchmark won't build in a world that already has a park);
- nothing in your inventory.

| # | Do this | You should see |
|---|---|---|
| 1 | In the new world, stand still on the ground and type `/zoocraft:benchmark build`. | "Benchmark: building the park round you (about 120 x 120 blocks). Stay where you are." The park appears round you over a few seconds: an avenue running north to south, four rows of glass-fronted exhibits either side of it with a path along each row's front, and south of the last row the 5 Staff Room huts and the entrance gate. Then "blocks placed. Measuring the exhibits..." and "Benchmark park built: 20 exhibits (20 occupied), 100 animals, 10 keepers, 28 Viewing Points, 24 guest services. The park is open: guests arrive over the next minute." (Tutorial lines may come up too.) |
| 2 | Fly up and look round. | Every exhibit has its animals in it (Void Rays in the big aviary, lions, zebras, raccoons, red pandas, gorillas, crocodiles, tigers, the Nether and End animals in the smaller ones). Guests come in through the gate, about 3 at a time, up to 40, and walk the paths and stop at the Viewing Points. |
| 3 | Land back where you started and wait 2 minutes, not moving far. | The keepers come out of the huts and go into the exhibits to clean and fill feeders. Guests walk between exhibits. No lag you can feel. |
| 4 | Type `/zoocraft:benchmark run 60`, then keep still for a minute and don't open any menu. | "Benchmark: measuring for 60 seconds." A minute later the readout in chat: ticks per second, script time per tick (average, 95th percentile and worst), the park line (exhibits, animals, guests and keepers in view), saved data, and the 8 slowest loops. |
| 5 | Take a screenshot of the readout and send it to me. | (If it scrolled away, `/zoocraft:benchmark report` prints it again.) Ticks per second near 20 and an average of a few ms of script time a tick is what I'm hoping for. |
| 6 | Optional, for more detail: type `/script profiler start`, wait 30 seconds, then `/script profiler stop`. | Chat says where it saved a `.cpuprofile` file (on Windows it's in `%APPDATA%\Minecraft Bedrock\logs\`). Send me that file too: it shows which functions took the time on your PC. |
| 7 | Break one block of a Staff Room hut's wall (the huts south of the last row, either side of the entrance). | Within a few seconds: "The Staff Room at ... isn't a room any more." Put the block back: a few seconds later the room works again (use the Staff Room block to see "This Staff Room works"). |
| 8 | Walk along the paths for a minute in Survival. | Guests still set off to far exhibits and walk the paths there; the animals move as they did before. |
| 9 | In your own park world, type `/zoocraft:benchmark run 60` (it measures any park; it only builds in a new world). Send me that readout as well. | The same readout for your own park. |
| 10 | If you have a phone or tablet with Minecraft, do steps 1 to 5 there too. | The same readout; phones are slower, so the numbers there matter most. |
| 11 | Look at the content log. | No script or content errors. The full readout table is there too, on lines starting "benchmark:". |

## What changed

Nothing below changes what the park does: the same care, the same exhibit results, the same routes and ways. It's
when and how the work is done.

- Exhibit re-checks (every exhibit about every two minutes) are spread over the two minutes instead of several at once,
  each block is read once a check, and the results go in on a tick of their own.
- Guests' route searches wait their turn in one queue instead of each taking a slice of every tick, and run about a
  third quicker. The path network's rebuild is quicker too.
- Viewing Points are checked one at a time across the 30-second cycle instead of all on the same tick, and a point
  stops looking past the nearest exhibit once that exhibit settles which one it serves.
- The guest services (stands, benches, bins, donation boxes) are checked at a second of their own too.
- Staff Room and Gift Shop re-checks walk the room a slice at a time. Placing one or using its block still answers at
  once.
- The 10-second animal care step goes round the exhibits one per slice. Each exhibit's care is done in one go, every
  animal gets it once, and nothing is skipped or sped up when the game is busy.
- Zebras, lions, tigers and the other script-steered animals plan their ways about 2 to 6 times more cheaply (A*
  search instead of a flood), with the same length of way. A spot they can't reach is known at once.
- The lions' ledges are worked out once a check instead of every run of their loop.
- Clear Lava's burn check leaves out the mobs that can't burn anyway.

## On my model of the game

I ran the real scripts with this benchmark park in a modelled game, on QuickJS (the game's script engine), for 6000
ticks before and after the changes. Your PC's numbers will differ (the game's own block reads and entities cost what
they cost there), which is why steps 4 to 10 matter.

| Script time a tick | Before | After |
|---|---|---|
| Average | 8.6 ms | 7.4 ms |
| 95th percentile | 21 ms | 18 ms |
| 99th percentile | 46 ms | 28 ms |
| Worst tick | 693 ms | 88 ms |

The park ended the same both times: rating 91 (4.5 stars), 5 Staff Rooms working, 27 of 28 Viewing Points viewed,
24 guest services working.
