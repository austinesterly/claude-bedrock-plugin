# Glowhorn Stag: test plan (0.1.152)

The last animal of the Mythical Glade (module 9; the plan is research/mythical_plan.md). A great deer on an elk's frame
and at an elk's size (the "Elk-size" answer: about 1.6 blocks at the shoulder, 2.5 long), whose antlers glow bone-pale
to mint and turquoise, brighter at night, in the plain vanilla style. Both sexes carry antlers, as reindeer do: a Stag
(six points a side, a darker neck and ruff) and a Hind (smaller antlers, three points a side). A fawn is dappled, its
spots glowing faintly, with antler buds. Not dangerous: it hurts nobody.

New entity, model, skin, animation and particle files: quit Minecraft fully and start it again. Works in any world; wild
Glowhorn Stags live only in the Mythical Glade, so elsewhere use the Wild Glowhorn Stag Spawn Egg for the wild steps.

What its exhibit needs (the Exhibit Clipboard lists each): a tree trunk or a log (any wood) at the floor's edge or
standing in the floor, with three blocks of open floor in front of it, to rub their antlers on (without one comfort
can't rise above 50); grass in the floor (grazing gives part of their food: 30 grass blocks each, up to 40%); 160
blocks of floor for the first and 48 more for each other, 4 high (three need 256); Leafy Rations in a Basic Feeder or a
Hay Rack, 3 a park day each; a Water Trough. Herds of 2 to 8. Carried in a Livestock Crate. No research needed.

How it behaves: by day it grazes the grass, eats Leafy Rations at the feeder or the Hay Rack, and walks to a tree
trunk, stands three blocks from it facing it (stepping back first if its walk took it right up to the bark) and lowers
its head to rub its antlers on the bark, knocking on the wood. Now and then it stretches its neck up and bellows, a
puff of breath at its mouth. At dusk and dawn above all it lifts its head while its antlers flare with light and
glowing motes rise from them, with a soft chime. It lies down for short rests by day, and at night it lies down with
its antlers still alight and stays down till morning; it gets up within about 10 seconds of sunrise. Someone sprinting
within 6 blocks of a zoo stag startles it: it freezes, head up, with a snort. A fawn follows its mother, bleats now
and then and never rubs. Wild ones are wary: come within 14 blocks in Survival without sneaking and one stops, head up
and snorting, facing you, then bounds off till it is about 18 blocks away. Sneaking, or holding a Leafy Ration, you can
get close, and a Leafy Ration brings one over from 8 blocks. In the wild: only in the Mythical Glade, on grass, in small
herds of up to 4.

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, a world made for the test, seed 12345, a simulated player): four
  Wild Glowhorn Stags in a 33-block grass pen with four trunks (oak, birch, a 2 by 2 dark oak and a Mythwood log), the
  add-on's scripts running. The first run found two faults, fixed before shipping: the engine's walk to a trunk ends
  with the stag's body against the bark, too close to lower its antlers, so it rubbed only once in 2 minutes (now it
  steps back, facing the trunk, to the spot three blocks out, then rubs); and a stag that lay down for a rest late in
  the day stayed down after sunrise (the same in the Unicorn, fixed too). The second run, about 10 minutes of daylight
  and dusk: 18 rubs, every one with the trunk exactly three blocks ahead, square on, nothing in the way (birch 10,
  Mythwood 4, dark oak 3, oak 1), 9 of them after stepping back; grazing, bellowing and the glow; the glow came 4 times
  in 90 seconds of dusk against 3 times in 6 minutes of day. At midnight all four lay down (three within 7 seconds, the
  fourth within 26); at morning all four were up within 11 seconds. Sneaking up to 4 blocks: no alarm. A Leafy Ration
  held 7 blocks off: all four came over to 1 to 2.4 blocks within 5 seconds and stayed. No script errors.
- Running off, on the same server, on an open field of grass 97 blocks across, four stags and a keeper in Survival
  walking up from about 18 blocks, three times for each setup. As first built the herd noticed the keeper only at 5 to
  10 blocks, the keeper got within 1.4 to 5 blocks, and some stood their ground 5 to 12 blocks off for 8 seconds or
  more. Widening the range alone didn't help: the game ignores the run-off distance where it was set and keeps its
  default of 10 blocks, so a stag noticed at 12 never ran and others stopped about 11 off. With both distances set where
  the vanilla panda has them: 11 of 12 times a stag stopped, head up, at 12.7 to 13.6 blocks (the twelfth was lying
  down and got up), then ran; the keeper never got closer than 5 blocks, and they ended 17 to 26 blocks away while the
  keeper stood still.
- Wild spawns, on the same server: 6 minutes at each of two Mythical Glades brought 6 Wild Glowhorn Stags (four at the
  first, a pair at the second), both coats, every one in the glade on its grass; a Unicorn and a Dragon came in the
  same time.
- The park simulator (a 56-exhibit test zoo from /zoocraft:build, 43 checks, all pass, on two seeds): the exhibit and
  its measure (4 trunk blocks, 8 spots to rub from), the clipboard, no warning, comfort 90; a stag and two hinds with
  the right coats; grazing; rubbing three blocks from a trunk, facing it, with the knocks; left against the bark, it
  steps back (no more than 0.06 a tick, facing the trunk all the way) and ends exactly on the spot, then rubs; the
  bellow with its breath; the glow with motes and the chime; at night all lie down and stay down, by day all up; a
  sprinting keeper startles one, then it goes on; the Livestock Crate in and out; breeding and a fawn (small, dappled,
  never rubs, counted on the clipboard); the trees cut down: 0 spots in red, the warning that names the fix, comfort held
  at 50; a wild one startled by Bea in Survival, facing her, then off; not by her sneaking, nor while she holds a Leafy
  Ration. No errors.
- What can't be checked without a screen: how it looks in the game (the model, the two coats, the fawn and the glow at
  night), how it moves (the walk, the step back, the rub, the bellow, lying down and getting up) and the sounds.

| # | Do this | You should see |
|---|---|---|
| 1 | In a Creative world, `/zoocraft:build` (or in your own park, build a grass exhibit of 256 blocks or more with a tree or a log standing in it and three blocks of open floor in front of it, put Leafy Rations in a Hay Rack or Basic Feeder and add a Water Trough, measure it with the Habitat Marker, and release a stag and two hinds). | A "Glowhorn Stags" exhibit 18 by 17 on grass with two oak trees, a Hay Rack and a Basic Feeder of Leafy Rations, and a Water Trough. A stag and two hinds inside. |
| 2 | Look at them by day. | Big deer, clearly bigger than the park's Deer, with pale antlers tinged mint and turquoise; the stag's antlers bigger, with six points a side and a darker ruff, the hinds' smaller. |
| 3 | Watch them for a while. | They graze, eat at the Hay Rack and the feeder, and now and then walk to a tree, stand three blocks out facing the trunk (stepping back first if they walked right up to it) and lower their heads to rub their antlers on the bark, with knocks on wood. |
| 4 | Keep watching. | Now and then one stretches its neck up and bellows, with a puff of breath at its mouth. |
| 5 | `/time set 11500` (dusk) and watch. | Their antlers glow brighter as it gets dark; now and then one lifts its head while glowing motes rise from its antlers, with a soft chime. |
| 6 | `/time set night` and wait a little. | They lie down, antlers still alight, and stay down. `/time set day`: within about 10 seconds they get up again. |
| 7 | Use the Exhibit Clipboard on the exhibit. | Trunks to rub: the number of spots, green. A line for the fawns when there are any. |
| 8 | Cut down both trees, use the Habitat Marker inside again, wait a park day. | Trunks to rub 0 in red; a care warning that they rub their antlers on tree trunks, naming what to add; comfort no higher than 50. Plant a tree or set a log back and measure again. |
| 9 | Sprint past the fence close to one. | It freezes with its head up and snorts, then goes on. |
| 10 | With a Leafy Ration in your inventory, carry one in a Livestock Crate, then use the crate on the ground inside the exhibit. | It goes in the crate, and back out into its exhibit. |
| 11 | Turn breeding on and keep them well for a few park days. | One fawn, small and dappled with faintly glowing spots, following its mother and bleating now and then. It never rubs. |
| 12 | In a normal world, go to a Mythical Glade (the Field Journal's Places page points the way after the Park Guidebook research). | "You found a Mythical Glade" in the Field Journal, which now mentions Glowhorn Stags. Small herds wander among the giant trees, and at dusk their antlers glow. |
| 13 | Walk up to a wild herd in Survival without sneaking (or to ones from the Wild Glowhorn Stag Spawn Egg). | Within 14 blocks they stop, heads up, snorting and facing you, then bound off to about 18 blocks away. |
| 14 | Sneak up to them; then stand up holding a Leafy Ration. | Sneaking, they don't take fright. Holding a Leafy Ration, one within 8 blocks comes over to you. |
| 15 | Watch the Glowhorn Stags. | The Field Journal's tasks: spot one, watch one's antlers glow, watch one rub its antlers on a trunk, hear one bellow. |
| 16 | Open the content log (Settings, Creator) after the steps above. | No lines about `glowhorn`. |
