# Park fence test plan (module 3: 0.1.101)

Module 3 of the remaining modules: the fenced park area. The plan is `research/fence_plan.md` in the ZooCraft Tychoon
folder, the research behind it `research/fence_facts.md`.

## 0.1.101: the Aluminum Fence and the fenced park

New blocks: close Minecraft completely and start it again (leaving the world is not enough).

- **Two new blocks**, made at the Zoo Workshop:
  - **Aluminum Fence**: 4 copper ingots and 2 iron nuggets make 16. Silver metal, the shape of a vanilla fence. It
    joins other Aluminum Fences, Aluminum Fence Gates, walls, other fences and solid blocks beside it, and stands a
    block and a half high, so animals can't jump it. It pens an exhibit like any other fence.
  - **Aluminum Fence Gate**: 2 copper ingots and 4 iron nuggets make 1. Opens and shuts when used.
- **The park is the ground inside its fence.** Once an Aluminum Fence closes all the way round the Park Deed's spot
  (where the park was claimed), every block inside it, at every height, is the park, however odd its shape, up to 500
  blocks from the spot. Gates and the Park Entrance Gate count as part of the fence. The park's edge is worked out a few
  seconds after the last fence block is placed or broken.
- **New parks need the fence** (your answer, "Required"): a park claimed from now on has no ground until its fence
  closes, and the tutorial's step after the Zoo Workshop is "Fence in your park".
- **Your park as it is keeps its 500-block circle** until you fence it. Nothing about it changes until then. If you're
  past the tutorial's Zoo Workshop step, the fence step is marked done.
- **A gap** (a missing block, or two fences that only touch at a corner) means the fence isn't closed. The park keeps
  its last closed edge and every member is told roughly where the gap is.
- What follows the fence: exhibits, Viewing Points, guest services, the Gift Shop, Tour Desks, Expedition Platforms,
  the Park Entrance Gate and the guests' paths all stop at it. Animals let out for conservation have to go at least 100
  blocks beyond the fence.

Steps 1 and 2 are in your own park. The rest are best done in a new world, so your park's edge doesn't move while you
try them.

| # | Do this | You should see |
|---|---|---|
| 1 | In your own park, open the Park Ledger. | A new line: **Park edge: No Aluminum Fence round the park: it's the 500 blocks round the Park Deed's spot until a fence closes round it.** The tutorial doesn't ask for a fence. Everything else as before. |
| 2 | At the Zoo Workshop, make Aluminum Fence and an Aluminum Fence Gate. | 16 Aluminum Fences from 4 copper ingots and 2 iron nuggets, and 1 gate from 2 copper ingots and 4 iron nuggets, each with its own silver picture in the menu and in your hand. |
| 3 | In a new world, use the Park Deed to claim a park. | The claim says the park will be the ground you fence in round where you stand, up to 500 blocks out. The Ledger says **No Aluminum Fence round the park yet: it has no ground until one closes round the Park Deed's spot (x y z), up to 500 blocks out.** |
| 4 | Build a Zoo Workshop, then look at the tutorial. | The next step is **Fence in your park**, saying what to craft and to run the fence all the way round the spot where you claimed the park. |
| 5 | Place a few Aluminum Fences in a row, one beside a stone block and one beside a vanilla fence. Use one with an empty hand. | They join each other, the stone and the vanilla fence with two rails, like vanilla fences. You can't jump over them. Using one says how the park's fence stands. |
| 6 | Put an Aluminum Fence Gate in the row and use it. | It joins the fences on both sides, swings open with a door sound and lets you through; using it again shuts it. |
| 7 | Run the fence round the spot where you claimed the park, say 20 blocks out each way, but leave one block out. | A few seconds after the last fence block, the action bar says **The Aluminum Fence has a gap near x y z (about N blocks east of the Park Deed's spot)**, pointing at the block you left out. |
| 8 | Fill the gap. | A few seconds later every member gets **The Aluminum Fence closes round the park: everything inside it, at every height, is the park now (N blocks of ground).** The Ledger's Park edge line says the same. The tutorial's fence step is done. |
| 9 | Take out 5 fence blocks and put a Park Entrance Gate in their place, with the fence running up to its pillars. | The fence is closed with the gate in it (if you took more than a few seconds, you're told of the gap first, then that it closes). The gate is the park's entrance, and using it offers to open the park. |
| 10 | Outside the fence, place an Exhibit Controller, use the Exhibit Marker on it and then on the ground beside it. Place a Viewing Point out there too and use it. | The marker says exhibits must be inside the park's Aluminum Fence. The Viewing Point says it's outside the park. |
| 11 | Break one fence block. | A few seconds later every member is told the fence has a gap there and the park keeps its last closed edge until it's mended. Mend it, and everyone is told it closes round the park again. |
| 12 | Break the block at one corner of the ring, so the two sides only touch diagonally. | It counts as a gap, at that corner (an animal or guest could slip through). Put it back. |
| 13 | Run a second ring of fence further out, round the first. | Once it closes, the park is everything inside the outer ring; the inner ring is just a fence inside the park. |
| 14 | In another new world, type `/zoocraft:benchmark build`, wait a minute, then `/zoocraft:benchmark run 60`. | The benchmark park now has an Aluminum Fence round it with a gate on the entrance side, and the build says the fence closes round the park. The readout's ticks per second and script time are what 0.1.100 gave within a little either way. |
| 15 | Look at the content log. | No script errors. |

A Park Entrance Gate placed before 0.1.101 counts as part of the fence once it's the park's entrance (it's added when
the world loads) or once it's placed again.
