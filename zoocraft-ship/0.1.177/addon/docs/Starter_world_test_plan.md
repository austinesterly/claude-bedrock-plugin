# The starter world: test plan (0.1.177)

A ready-made world to start ZooCraft in: "ZooCraft Starter World". You start outside the gate of an old, abandoned
wildlife park (the 0.1.176 old park) on open plains, facing it. Its Noticeboard by the cabin offers it to you; claim it
and the tutorial walks you through bringing it back to life.

- Survival, Normal, cheats off, no experiments (never turned on). Seed 2026. The world spawn is 20 64 -116, just
  outside the gate (20 -120); the park's middle is 20 -140.
- It carries no packs of its own: it uses the ZooCraft add-on you have installed (the same pack IDs).
- Saved with Minecraft 1.26.60, so it needs 1.26.60 or newer.
- Only the ground round the park was generated when it was made; the rest of the world generates from the seed as you
  explore, like any new world.

The add-on part of 0.1.177 is scripts only: reopening a world loads it (no full restart needed).

| # | Do this | You should see |
|---|---|---|
| 1 | Open the worlds list. | "ZooCraft Starter World", its picture the old park from above. |
| 2 | Open it (first time). | You're set down just outside the old park's gate, facing it. Two lines: "An old wildlife park lies at 20 -120. Use the Noticeboard by its gate to claim it and bring it back to life." and "Welcome to ZooCraft! Claim the old park at its Noticeboard, or use the Park Deed to start a park of your own somewhere else." The Park Deed is in your inventory. Survival. |
| 3 | Open the content log (Settings, Creator). | No errors that name oldpark, noticeboard or rabbits. |
| 4 | Walk through the gate. East of the plaza, by the cabin's door, use the Noticeboard. | It offers the old park: "Claim this old park". |
| 5 | Claim it. | "You claimed (name)'s Zoo, an old wildlife park! 500 Zoo Coins to start." and the line about the 6 breaks and the pen, then "Tutorial: Claim your park done!" and the next step. |
| 6 | Carry on with docs/Old_park_test_plan.md rows 4 to 9. | As there. A few wild rabbits are just west of the fence (if none are about, some appear there within 10 seconds while you're near). |
| 7 | Leave the world and come back. | You're where you left (not set down at the gate again), and no old park line: it's yours. |
| 8 | Instead of claiming it (a copy of the world), walk 30 blocks away and use the Park Deed there. | Your own park starts there as usual; the old park's Noticeboard still offers the old park to whoever comes. |
| 9 | Any other world, new or old. | Joining works as before ("Welcome to ZooCraft! Use the Park Deed to claim your wildlife park." in a new world); nobody is moved. |

