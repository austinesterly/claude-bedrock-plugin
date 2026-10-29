# Earth Molebear and Burrow Soil: test plan (0.1.138)

The second animal of the cave wing (module 7; the plan is research/cave_plan.md). A fantasy animal: an American black
bear's body at its real size (its back about 0.9 blocks up, about 1.5 blocks long), with a mole's big flat spade hands
(palms turned out, pale claws along the front) and velvet fur, and the star-nosed mole's pink star of rays round its
nose. Two coats, Slate (dark grey) and Loam (warm brown); cubs have their own skin. Drawn in the plain vanilla style.
It lives in the ordinary caves deep down, sniffs out grubs with its star, snaps them up in a blink, digs with a
breaststroke of its hands, stands up on its hind legs to sniff the air like a bear, and curls up to sleep at night.

New entity, block, model, skin and animation files: quit Minecraft fully and start it again. Works in any world; a
superflat world has no caves, so there use the Wild Earth Molebear Spawn Egg for the wild steps.

Burrow Soil (new block, Nature tab): 2 dirt, a gravel and a clay ball make 4, at a crafting table or the Zoo Workshop.
It is the only thing a zoo molebear digs.

What its exhibit needs (the Exhibit Clipboard lists each): 100 blocks of floor for the first and 30 more for each other
(a pair 130); 8 or more blocks of Burrow Soil beside the floor, as a bank to tunnel into: at least two blocks high and
three wide, so a block in its face has Burrow Soil or a solid block on both sides, above and behind; Insect Rations in a
Basic Feeder or an Insect Feeder, 3 a park day each, less with faces to dig (the grubs it digs up give up to 25% of its
food, with a face for each grown one); a Water Trough. Alone, or a pair with their two cubs. Without the Burrow Soil
its comfort can't rise above 50, and the care warnings say so.

How it digs (only in a zoo): it walks up to a face of the bank, digs in, snaps up a grub, crawls in and digs on, a block
at a time, straight in at floor level, until it meets something that isn't Burrow Soil, the 4th block, or a block whose
sides, top, bottom or back aren't solid; then it curls up in the den at the end for a while, gets up and backs out.
Every dug block becomes air (a tunnel a block high), closed in on every side but the way in, so nothing falls in and no
tunnel joins another or opens anywhere else. It never digs anything but Burrow Soil, never more than a block outside
its exhibit's floor area, and at most 4 blocks a park day for each grown one; cubs don't dig. Fill tunnels with Burrow
Soil again now and then: dug blocks no longer count.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, a simulated player): the shipped spawn rule put 7 wild molebears in the first ordinary deep cave in 3 minutes, never more than 2 there at a time; none in a lush cave, and none in the deep dark (by a deep dark site its one molebear was on tuff just outside it). Told to dig,
  it walked to the bank and stopped beside a face (in about 6 seconds from 7 blocks, and from the side); the dug
  Burrow Soil turned to air, and moved into a block-high tunnel 2 blocks deep it stayed there, unhurt, and came back out.
- The park simulator (a 51-exhibit test zoo from /zoocraft:build, 31 checks, all pass): the exhibit and its measure (22
  blocks of Burrow Soil beside the floor, 9 faces), the clipboard, no warning; a molebear at the middle face shuffled to
  it, dug in, snapped up grubs, crawled in, dug 3 blocks to the wall, curled up in the den, got up and backed out to
  where it started; only those 3 blocks changed, closed in all round but the way in; the exhibit measured again (21 and
  6); at another face it dug the one block left that day, and then no more until the next park day; carried off
  mid-tunnel it left off. A wild one on stone dug itself in from a Survival player within 5 blocks, stayed in while
  they stood there and climbed out when they went; sneaking up, it stood up to sniff; an Insect Ration held brought it
  over. The Deep Caves: nothing on a superflat floor under the sky, found under a stone roof. No errors.
- What can't be checked without a screen: how it looks and moves (steps 2 to 5) and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, mark an exhibit as above and release an Earth Molebear pair). | An "Earth Molebears" exhibit: a bank of Burrow Soil along the back wall (7 wide, 3 deep, 2 high), a feeder with Insect Rations, a water trough. A pair inside. |
| 2 | Look at the two. | Bear-sized animals (their backs about at your waist), in grey or brown velvet fur, with big flat spade hands turned outwards and a pink star round the nose whose rays flicker. |
| 3 | Watch them for a few minutes by day. | One sniffs along the ground with its star (sniffing sounds); one stands up on its hind legs to sniff the air; one snaps Insect Rations up at the feeder. |
| 4 | Keep watching the bank. | One walks to the bank and digs in with a breaststroke of its spade hands (digging sounds, grit flying), snaps up a grub in a blink (a crunch), crawls into the hole and digs on to the back wall (3 blocks in, from the front), curls up at the end for a while, then backs out. The tunnel stays: a hole a block high. |
| 5 | `/time set night` and wait a little. | They curl up and sleep. `/time set day`: they get up. |
| 6 | Watch the bank over a park day. | Never more than 4 blocks dug a day for each molebear. Nothing but Burrow Soil is ever dug: not the walls, floor or anything outside. No tunnel breaks into another or out of the bank. |
| 7 | In Survival, sprint past close to them (within 6 blocks). | One stands up on its hind legs to look at you. |
| 8 | Use the Exhibit Clipboard on the exhibit. | Burrow Soil (22 of 8) and Faces to tunnel into (9: grubs dug up are 25% of their food), green; a line for cubs when there are some. After tunnels are dug both numbers go down; fill the tunnels with Burrow Soil and they come back. |
| 9 | Craft Burrow Soil: 2 dirt, a gravel and a clay ball at a crafting table. | 4 Burrow Soil (Nature tab in Creative). It breaks quickly, with a gravel sound. |
| 10 | Turn breeding on and keep them well for a few park days. | Two cubs, a third of the size, following their mother about. Cubs don't dig. |
| 11 | Break all the Burrow Soil, then use the clipboard and wait a park day. | Burrow Soil 0 of 8 in red; a care warning that they need 8 or more blocks of Burrow Soil; comfort no higher than 50. Put it back afterwards. |
| 12 | Try to carry one in a Reinforced Crate before Cave Expeditions, then after it. | Before: "Carrying an Earth Molebear needs Cave Expeditions research at the Research Desk first." After: it goes in the crate and back out into its exhibit. |
| 13 | After Cave Expeditions, open the Field Journal's Places page. | A Deep Caves line saying where to look (anywhere in the Overworld below y 0, away from the lush caves and the deep dark). |
| 14 | In a normal (not superflat) world, go down into a stone or deepslate cave below y 0, away from lush caves and the deep dark. | "You found the Deep Caves" in the Field Journal. Wild Earth Molebears on the cave floor, alone (at most 2 near you underground). |
| 15 | In Survival, walk up to a wild one (or one from the Wild Earth Molebear Spawn Egg, on stone, deepslate, tuff, gravel or dirt). | Within 10 blocks it stands up to sniff at you; within 5 it digs itself into the ground (it sinks until only its back and star show, with a digging sound and grit), and stays in while you're near; walk away and it climbs back out. The cave floor itself is never changed. |
| 16 | Sneak up to a wild one. Then hold an Insect Ration. | Sneaking: it stands up to sniff at you and doesn't dig in. Holding an Insect Ration: it comes over from 8 blocks. |
| 17 | Watch a wild one. | The Field Journal's tasks: spot it, watch it dig with its spade hands, watch its star nose at work, watch it stand up to sniff. |
| 18 | Open the content log (Settings, Creator) after the steps above. | No lines about `molebear` or `burrow_soil`. |
