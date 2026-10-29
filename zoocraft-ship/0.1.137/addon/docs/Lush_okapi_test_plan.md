# Lush Okapi and Cave Expeditions: test plan (0.1.137)

The first animal of the cave wing (module 7; the plan is research/cave_plan.md). The okapi is a real animal (the
giraffe's only living relative, a shy browser of the Congo forest), drawn at its real size in the plain vanilla style:
1.5 blocks at the shoulder, about 2.5 long, its head carried at about 2. Chocolate brown with white stripes on the rump
and legs, a grey-white face and big ears; a male has two short furred horns (ossicones); a tuft of moss along the crest
is its one lush touch. It lives in lush caves, browses azalea, dripleaf and glow berries with its long dark tongue,
licks clay for the salt, and lies down at night.

New entity, model, skin and animation files: quit Minecraft fully and start it again. Works in any world (lush caves are
a vanilla biome); a superflat world has no caves, so there use the Wild Lush Okapi Spawn Egg for the wild steps.

What its exhibit needs (the Exhibit Clipboard lists each): 100 blocks of floor for the first and 30 more for each other
(a pair 130); 8 or more moss blocks in the floor (moss carpet on the floor counts); lush plants beside the floor to
browse, at its level or up to 2 blocks above (azalea or flowering azalea bushes, azalea leaves, big or small dripleaf,
glow berry vines), 2 for each grown one and 2 at least; a clay block or more in the floor (or under the edge of a pool)
to lick; trees, leaves or a roof over a tenth of the floor; Leafy Rations in a Basic Feeder or an Elevated Browse Feeder
(it reaches both), 3 a park day each, less with plants to browse (they give up to 30% of its food); a Water Trough. One
grown male to an exhibit. Without the lush ground its comfort can't rise above 50, without the clay above 60, and the
care warnings say what's missing.

Cave Expeditions (Research Desk): opens with 3 species "ready to move" in the Field Journal; 2 lanterns, 4 copper ingots,
a compass and 200 Zoo Coins. It lets a Reinforced Crate carry a Lush Okapi, and the Field Journal's Places page then
points the way to the nearest lush cave.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test, a simulated player): the shipped spawn
  rule put a wild okapi in a lush cave within 2 minutes; a wild one walked off from a Survival player standing still
  (in 4 to 7 seconds) and from one walking up (in about 1.4 seconds), let a sneaking player close, and came to about
  2 blocks of a player holding a Leafy Ration; walking to a lush plant it stopped 1.3 blocks from it, to a trunk 1.3,
  and onto a clay block in 3 seconds from 4 blocks away (7 seconds from 11); a calf walked to its mother (to 1.4 to 1.6
  blocks) when she was tagged for nursing and not to another okapi; the lush cave search found real lush caves in 5 to
  9 ms. The content log of a world with the whole add-on was clean.
- The park simulator (a 50-exhibit test zoo from /zoocraft:build): the exhibit, its measure (36 moss, 7 plants, 2 clay,
  8 trunk faces), the clipboard, no warnings with everything there and both warnings with the moss and clay dug out
  (comfort capped at 50); browsing (facing the bush), licking, grooming, the male's neck rub and his flehmen near the
  female, lying down at night and up by day, a Leafy Ration getting one up; the calf born in the best-covered spot,
  lying hidden, getting up to nurse while its mother licks it, lying down again, and following her after its first
  park day; the Reinforced Crate refused before Cave Expeditions and working after. It found two things, both fixed:
  a mother lying down stayed lying while her calf nursed (she now gets up and waits for it), and a newborn calf could
  take a step off its hiding spot before lying down.
- What can't be checked without a screen: how it looks and moves (steps 2 to 6) and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, mark an exhibit as above and release a Lush Okapi pair). | A "Lush Okapis" exhibit: a moss floor in a back corner under a moss roof with glow berry vines, two azalea bushes, a big dripleaf, an oak trunk under azalea leaves, two clay blocks, a feeder. A pair inside. |
| 2 | Look at the two. | Life-size okapis (a little taller than you at the head), brown with white-striped rumps and legs, grey-white faces, a moss tuft on the crest. The male (Ituri) has two short horns, the female (Epulu) none. They walk with both legs on one side moving together (the okapi's pacing walk). |
| 3 | Watch them for a few minutes by day. | One walks to a bush, faces it and strips the leaves with its dark tongue (a leaf rustle); one stands on the clay and licks it; one reaches its tongue up to its eye or ear; the male rubs his neck on the oak trunk; near the female he lifts his head and curls his lip. In between they wander. |
| 4 | `/time set night` and wait a little. | They lie down, legs folded. `/time set day`: they get up again. |
| 5 | At night, hold a Leafy Ration close to one lying down. | It gets up and comes over to you. |
| 6 | In Survival, sprint past close to them (within 6 blocks). | One freezes, head up and ears turning, with a snort, then walks off. |
| 7 | Use the Exhibit Clipboard on the exhibit. | Lines for Moss (36 of 8), Lush plants to browse (7 of 4: 30% of their food) and Clay lick (yes), all green. |
| 8 | Turn breeding on and keep them well for a few park days. | A calf is born lying in the most covered spot (under the roof or the leaves), legs tucked; it stays there its first park day. Now and then it gets up with a bleat and walks to its mother, who stops what she's doing (getting up if lying down) and waits; it nurses with its head under her while she licks it, then goes back and lies down again. After its first park day it follows her about. |
| 9 | Dig out the moss and the clay, then use the clipboard and wait a park day. | Moss 0 of 8 and Clay lick none in red; care warnings saying they live on lush ground and lick clay; comfort no higher than 50. Put them back afterwards. |
| 10 | Try to carry one in a Reinforced Crate before Cave Expeditions. | "Carrying a Lush Okapi needs Cave Expeditions research at the Research Desk first." |
| 11 | Do Cave Expeditions at the Research Desk, then carry one in the crate and release it back in its exhibit. | It goes in the crate, then "is now living in Lush Okapis!". |
| 12 | In a normal (not superflat) world, open the Field Journal's Places page after Cave Expeditions. | A Lush Caves line: where to look (under azalea trees) and "The nearest from where you stand: about N blocks to the (direction) (x, z), below the surface". `/locate biome lush_caves` should agree. |
| 13 | Go down into that lush cave. | "You found the Lush Caves" in the Field Journal; the Places page now shows where you found it, with its height. Wild okapis there, alone (one at a time, at most 2 near you underground). |
| 14 | In Survival, walk up to a wild one (or one from the Wild Lush Okapi Spawn Egg). Then sneak up to it. Then hold a Leafy Ration. | Walking: within 10 blocks it lifts its head with a snort and walks off. Sneaking: it lets you close. Holding a Leafy Ration: it comes over from 8 blocks. |
| 15 | Watch a wild one in its lush cave. | The Field Journal's tasks: spot it, watch it strip leaves with its tongue, wash its eye or ear with its tongue, and lick clay. |
| 16 | Open the content log (Settings, Creator) after the steps above. | No lines about `okapi`. |
