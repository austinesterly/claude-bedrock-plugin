# Park fence test plan (module 3: 0.1.101, and the picket look of 0.1.103)

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

## 0.1.103: the Aluminum Fence as a block of silver pickets

Your photo of an ornamental aluminium fence, "The alumium fence can be a block, and it should look like this but
silver". Replaced block files, so close Minecraft completely and start it again (leaving the world is not enough).

- **The Aluminum Fence is a full block now**, placed like any block, with no arms to join up: a row of them is one
  long fence, and a corner is just two rows meeting. Each side is a see-through panel of silver pickets: a post at each
  edge with a flat grey cap, two bars across the top, one near the bottom, four pickets between. Two blocks side by
  side make a post the width of the photo's; a corner shows a post on both outer faces.
- **It still stands a block and a half high**, so animals can't jump it, and it still pens exhibits and marks the park's
  edge exactly as in 0.1.101. Nothing about the park's area, the gap messages or the tutorial changes.
- **The Aluminum Fence Gate matches**: two square silver posts with caps and a picket panel between them that swings
  open in two halves, as before.
- Fences placed before 0.1.103 show as the new block and still count for the park's fence; if one looks odd, break it
  and place it again.

| # | Do this | You should see |
|---|---|---|
| 1 | Make an Aluminum Fence and place one on open ground. | A block of silver pickets, see-through on every side: a post at each edge with a flat grey cap, two bars at the top, one bar near the bottom, four pickets between. It places like any block (aim at the ground or at a side of it). The picture in the menu and in your hand is the same block. |
| 2 | Place five in a row and walk along it. | One long fence with a post every block. Looking through the gaps at an angle you see the ground behind it, not a second row of pickets inside. From above, a thin silver rail along each side of the row. |
| 3 | Turn the row round a corner. | The corner block shows a post on both outer faces, and nothing shows inside the corner. |
| 4 | Try to jump over it from the ground. | You can't: it's a block and a half high. (From a block higher up you can, as with any fence.) |
| 5 | Use a fence with an empty hand. | **Aluminum Fence:** how the park's fence stands, then **A block of silver pickets that stands a block and a half high, so animals can't jump it; a row of them is one long fence.** |
| 6 | Put an Aluminum Fence Gate in the row and use it. | Two square silver posts with caps and a picket panel between them that matches the fence. Using it swings the two halves out toward you with a door sound and lets you through; using it again shuts it. |
| 7 | Place a fence against a stone block, and another beside an End Fence. | The fence's face against the stone isn't drawn (no flicker where they touch). The End Fence's arm reaches out to the fence. |
| 8 | In a park world, run the fence round the Park Deed's spot with one block out, then fill it. | The gap message, then **The Aluminum Fence closes round the park** (0.1.101 steps 7 and 8), unchanged. |
| 9 | In a world with Aluminum Fence from before 0.1.103. | The fence shows as the new block, the Park Ledger's Park edge line is as it was, and the park's area is unchanged. |
| 10 | Look at the content log. | No script errors. |

## 0.1.106: the park is exactly its fence

Austin (2026-10-26): "The zoo should just be where aluminum fences enclose. That way we are not scanning 500 blocks if its just 100 x 100." So:

- No park has a 500-block circle any more, however old it is. Until an Aluminum Fence closes round the Park Deed's spot, a park has no ground.
- No reach: fence any distance out counts, and the only ground worked over is the fence's own box and a one-block margin.
- Steps 1 and 3 above change: the Ledger's **Park edge** line for an unfenced park reads **No Aluminum Fence round the park yet: it has no ground until one closes round the Park Deed's spot (x y z)**, with nothing about 500 blocks, and the claim says the park will be the ground you fence in, with no distance.

| # | Do this | You should see |
|---|---|---|
| 1 | Join your own world from before 0.1.101 (a park that was never fenced). | Once, after the welcome line: **The park is only the ground inside its Aluminum Fence now: the 500-block circle is gone, so it has no ground until a fence closes round the Park Deed's spot.** The tutorial's **Fence in your park** step is open; each exhibit's clipboard says **Outside the park: the park has no ground until an Aluminum Fence closes round the Park Deed's spot**, and the animals in it carry on as before. |
| 2 | Run an Aluminum Fence round that park (the Park Deed's spot inside it), gates where you walk. | A few seconds after the last block: **The Aluminum Fence closes round the park**, the exhibits inside lose their Outside note, the tutorial step is done. |
| 3 | In a new Superflat world, `/zoocraft:build 200`. | The test zoo builds inside a 200 x 200 ring (nothing about a reach), closed, with the Park Entrance Gate as the entrance. |
| 4 | In that world, break one fence block 100 blocks from the Park Deed's spot. | **The Aluminum Fence has a gap near x y z (about 100 blocks ... of the Park Deed's spot)**, and the park keeps its last closed edge. Put it back: closed again. |

## 0.1.107: the fence drawn half a block tall, and the sidebar switch

Austin (2026-10-26): "the aluminum fences should only be half a block visually" and "I also do not want the zoocraft park tab to be perminant on the screen, it should be togglable". A full restart of Minecraft (block files changed), then:

| # | Do this | You should see |
|---|---|---|
| 1 | Look at an Aluminum Fence and its gate, shut and open. | Silver pickets, posts and rails only in the bottom half of the block; the black outline when you look at them is half a block tall too. |
| 2 | Try to walk or jump over the fence; watch an animal next to it. | Still blocked: the fence stops you and the animals a block and a half up, as before. |
| 3 | Park Deed, Settings: switch **ZooCraft Park sidebar on screen** off, then on again. | The coins, score, guests and park day panel leaves the right of the screen for everyone in the park, and comes back when it is on. The settings message says "sidebar off" or "sidebar on". |
| 4 | Let a flamingo or raccoon splash in water, then read the content log. | No "particles/water_splash.json ... variable.direction" lines. |
| 5 | `/zoocraft:build` in a new Superflat world. | The build hires 6 keepers and never says "hiring keeper 7". |

## 0.1.110: the fence as a thin panel, half a block wide

Austin (2026-10-26): "The aluminum fence should be a block and a half tall, but I meant that it should be half a block wide." A full restart of Minecraft, then:

| # | Do this | You should see |
|---|---|---|
| 1 | Place one Aluminum Fence on its own. | A post of silver pickets half a block wide, a block and a half tall, in the middle of the block, no lid. |
| 2 | Place fences in a row, round a corner, and against a stone block. | Each new fence appears already joined: arms reach to the fence, gate end or block beside it; a corner has two arms; nothing reaches toward open air. |
| 3 | Break a fence in the middle of a row. | Its two neighbours drop the arm that pointed at it. |
| 4 | Put an Aluminum Fence Gate in the row (it faces you); open and shut it. | The fences at its ends reach to its posts; the gate is a block and a half tall, its panel between two posts; open, the halves swing toward you and you walk through. |
| 5 | Jump at the fence; watch an animal next to it. | Still a block and a half of collision along the post and arms: nobody gets over. |
| 6 | Run `/zoocraft:build` in a new Superflat world. | The ring and the exhibits' fences are joined picket panels; the park closes as before. |

## 0.1.112: the fence loads again

Austin's content log on 0.1.111: "blocks/aluminum_fence.json | minecraft:selection_box: Invalid box size "origin" + "size", must be inside the following limit: Vec3(-8,0,-8) and Vec3(8,16,8)", the same for the gate, then both recipes "missing or invalid" and blocks.json "does not exist in the registry". Since 0.1.110 the outline you aim at was a block and a half tall, and the game refuses a whole block whose outline leaves it, so neither block loaded. The outline is now one block tall; the collision stays a block and a half. A block file changed: a full restart of Minecraft, then:

| # | Do this | You should see |
|---|---|---|
| 1 | Open the content log after loading the world. | No errors about aluminum_fence, aluminum_fence_gate, their recipes or blocks.json. |
| 2 | Look at the fence ring and the exhibits' fences in your world. | The silver picket panels are back where they were (not unknown blocks). |
| 3 | Craft Aluminum Fence and an Aluminum Fence Gate at the Zoo Workshop. | Both craft. |
| 4 | Aim at a fence and at a gate, break one and put it back. | The outline is the post (and its arms) one block high; it breaks and places as before. |
| 5 | Jump at the fence. | Still a block and a half of collision: you can't get over. |
