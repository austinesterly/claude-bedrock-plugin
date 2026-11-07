# Withers: test plan (0.1.215)

The game's wither as a zoo mob in a tall Mob House pen, caught and kept the zombie's way. It looks and sounds like the
game's own (the same model at the same size, skin, three heads that turn, ribs and tail that sway, idle and hurt sounds).
In the zoo a wither never fires a skull, blows up, breaks a block or calls up wither skeletons, and it withers no one;
it has no boss bar and doesn't darken the sky. It drifts about low in its pen, just over the floor, as the game's own
does when it has no one to fight. It never despawns.

There are no wild withers: someone builds one from four soul sand or soul soil in a T with three wither skeleton skulls
on top. It charges up for 11 seconds (nothing hurts it), blows up, then flies about firing exploding skulls that wither
you; hurt, it breaks the blocks round it, and below half health it shrugs off arrows, calls up wither skeletons (not on
Easy) and dashes at you. Its health is 300 on Easy, 450 on Normal and 600 on Hard.

How to catch one (Mob Taming research): fill in the Field Journal first (spot one, then see one calmed: keep your eyes
on it for a few seconds; a zoo one counts). Wait for its blast, weaken it to a quarter of its health or less (75 on
Easy, 112.5 on Normal, 150 on Hard), look at it up close and use a Passivity Serum. It sparkles green, calms down and
stands dazed for a moment. A calmed one hangs where it was calmed, in the air too: hold a Bone Ration or a bone and it
comes down to you. Then, with a Bone Ration in your inventory, use an empty Mob Cage on it, and use the cage on the
floor inside its pen.

What they want (a pen beside a Mob House, a roof over it, at least 7 by 7 of floor for the first and 25 more blocks
each, 6 blocks of headroom):
- A soul sand valley's ground (soul sand or soul soil) under half the floor or more. Without it comfort can't rise
  above 55, and the Exhibit Clipboard says why.
- Bone Rations in a Basic Feeder (3 a day each: three heads); a Water Trough.
- One is happy alone; two share a pen well. Withers keep a pen to themselves.

They are never bred: catch more.

New mobs: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a wither. On the test server nothing from the add-on in any run (only the bench's own lines). |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk into the new tall Mob House. | Withers: soul sand with a soul soil patch behind glass, two withers, a Basic Feeder and a Hanging Food Basket of Bone Rations, and a Water Trough; no warnings on the Exhibit Clipboard. On the test server: ready, beside a working Mob House and shut in all round, the floor 99%, no warnings. |
| 3 | Watch them from the hall. **Please check this one: the test server draws nothing and plays no sound.** | Like the game's own: a black, three-headed skeleton with a ribcage and a tail, its heads turning to look about, its ribs and tail swaying; the game's wither calls now and then. No boss bar, the sky stays as it is, and no skulls fly. |
| 4 | Watch them for two minutes. | They drift about low in the pen, just over the floor, and never leave it. On the test server (two runs): 1,200 readings each over two minutes, all inside the pen and never more than 1.2 blocks over the floor; they crossed 6 to 9 blocks of the pen and went about 30 to 73 blocks each. |
| 5 | Open their Field Journal page and keep your eyes on one through the glass for a few seconds. | Spot one, see one calmed. A zoo one counts. On the test server the page filled from the hall. |
| 6 | Turn breeding on for the pen. | "This species doesn't breed in the zoo yet." On the test server: exactly that. After a park day their comfort rose from 71 to 90 with no care needed. |
| 7 | Without Mob Taming research, use a Passivity Serum on a weak one. | It asks for Mob Taming research first. |
| 8 | Build a wither in Survival (four soul sand or soul soil in a T, three wither skeleton skulls on top) and use the serum on it before it blows up, even after weakening it. | "It shakes the serum off: a wither just built is still charging up (the 11 seconds before it blows up, while nothing hurts it). Wait for its blast, then weaken it." On the test server (a wither the test player built from skulls): exactly that a second after it was built (61 of 450 health) and again 3 seconds after, weakened to 20. A wither from a spawn egg or `/summon` waits out its charge the same way (refused at under a second, 37 of 300, on Easy). |
| 9 | After its blast, use the serum on it at full health, and just above a quarter. | "It shakes the serum off. Weaken it first (a quarter of its health or less: 75 on Easy, 112.5 on Normal, 150 on Hard): withers fire exploding skulls that wither you, and below half health shrug off arrows and dash at you, so hit one up close." On the test server: exactly that at full health and at 113 (Normal), 75.5 (Easy) and 150.5 (Hard). |
| 10 | Weaken it to a quarter (75 on Easy, 112.5 on Normal, 150 on Hard) and use the serum. | "The wither sparkles green and calms down. It never attacks now (it never fires a skull, blows up, breaks a block or calls up wither skeletons, and it withers no one). Bring it to a pen in a Mob House: a Mob Cage carries it (with a Bone Ration in your inventory), or lead it holding one." It stands dazed for a moment. On the test server: exactly that on all three difficulties. |
| 11 | Calm one in the air, then stand on the ground about 8 blocks off holding a Bone Ration. | It hangs in the air where it was calmed until you hold the ration up, then comes down and over to you. On the test server: one 5 blocks up didn't move for 10 seconds; with a Bone Ration held on the ground 8 blocks off it came down at about 0.7 blocks a second and over to 2.1 blocks. One calmed on the ground came 7.5 to 2.1 blocks. |
| 12 | Use an empty Mob Cage on the calmed wither before you've watched one, then watch it, then use the cage with a Meat Ration, then with a Bone Ration, and put it in the Withers pen. | First "You don't know withers well enough to move one safely yet. Field Journal: spot one, wild or in a zoo; see one calmed with a passivity serum (or one in a zoo). Look at one for a few seconds to fill it in." With a Meat Ration: "You need a Bone Ration in your inventory to coax it in." With a Bone Ration: "<name> the Wither hopped into the carrier." Then "<name> is now living in Withers!". On the test server: exactly those ("Trio the Wither hopped into the carrier", "Trio is now living in Withers!"). |
