# Happy ghasts and nautiluses: test plan (0.1.196)

The game's happy ghast and nautilus as zoo animals. They look, sound and move like the game's own (the same models, skins
and animations).

Happy ghasts are hatched, not born: no sexes, no young, no Breeding switch. In the game a dried ghast block left in water
hatches into a ghastling in about 20 minutes, and it grows up in 20 minutes (or with 10 snowballs). Hatch one, let it grow,
and catch it. The zoo's float about slowly and follow anyone holding a snowball. Stand on one's back and it stops still,
squared up, until you get off, as in the game. No harness or riders in the zoo.

Nautiluses swim about slowly, idle in the water and follow anyone holding fish. The zoo's never hunt, charge or carry a
rider. They lay one egg at a time; it hatches into a small nautilus that stays in the tank.

How to catch them:
- Happy ghasts (a Reinforced Crate): never wild. With a snowball in your inventory, use an empty Reinforced Crate on a
  grown one. The crate refuses a ghastling (let it grow first) and one wearing a harness (take it off with shears first,
  with no one riding).
- Nautiluses (a Water Transport Tank): in every ocean but the frozen ones (cold ones only deep), alone, between Y 38 and
  58. With a pufferfish in your inventory, use an empty Water Transport Tank on a wild one. A tamed one is someone's: the
  tank refuses it.

Fill in the Field Journal first, as for every animal: spot one; happy ghasts, watch one float about and stand on one's
back; nautiluses, watch one swimming.

What they want:
- Happy ghasts (a Sky Pen): 256 blocks of floor for the first and 96 more each, walls and a roof with 12 blocks of air
  over the floor (they're 4 blocks across). Glass over half of the roof or more lets them see the sky (the game's heal
  faster under the open sky); with less, a warning, and their comfort stays at 55 or below. Snowballs or snow blocks from a
  feeder, and a Water Trough. To measure an empty pen as a Sky Pen, set a dried ghast on its floor first.
- Nautiluses (a Nautilus Tank): 16 water blocks for the first and 8 more each, all of the first's 16 two deep. Dim, as the
  trench tanks: a roof and solid or tinted-glass walls so no daylight reaches the water, nothing brighter than light 7.
  Fish fed in the water from an Aquarium Feeder (Fish Rations, raw cod, salmon, pufferfish or tropical fish). From Daw and
  Barord's husbandry of the nautilus: an aquarium for one is about 3 feet long, 18 inches wide and 2 feet deep, and "only
  enough light in the tank to view the animal".

New animals: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name a zoo happy ghast or nautilus. On the test server the logs were clean in all four runs. |
| 2 | Run `/zoocraft:build` in a new flat Creative world and walk to the Sky Pen and the Nautilus Tank. | A Sky Pen 17 by 17 with glass walls and a glass roof 12 blocks over the grass, a dried ghast in one corner, one happy ghast floating about; a dim Nautilus Tank 8 by 5 of water 2 deep behind a bank, two nautiluses swimming. No warnings on the Exhibit Clipboards. On the test server: both ready, no warnings; the pen 286 blocks with 12 of air, "Sky: 289 of 289 roof blocks glass"; the tank 40 water blocks, all 40 two deep, its brightest light 4. |
| 3 | Look at them closely. **Please check this one: the test server draws nothing.** | Each like the game's, the happy ghast without a harness, the nautilus without a saddle or armor. |
| 4 | Watch the happy ghast for half a minute, then hold a snowball near it. | It floats about slowly; it comes to the snowball. On the test server it floated 30 of 30 seconds. |
| 5 | Stand on its back (jump on from the wall, or fly onto it in Creative). Then step off. | It stops still and squares up while you stand there, and you stand on it; off its back it floats again. On the test server: still within half a second, the player standing 4 blocks over it for 8 seconds, then floating again. |
| 6 | Put stone over the whole roof (or most of it) and measure the pen with the Habitat Marker. | A warning that happy ghasts like the open sky, "Sky: 0 of 289 roof blocks glass", comfort falling toward 55. Glass back over half the roof: the warning goes. On the test server: the warning and the line, comfort 73 then 71 (on its way to 55); with 153 of 289 glass the warning went. |
| 7 | Catch the happy ghast out (Reinforced Crate), then measure the empty pen. | Still a Sky Pen (the dried ghast in the corner says so). Without a dried ghast an empty pen isn't one: putting a happy ghast in says to set a dried ghast on the floor. On the test server: the emptied pen, its dried ghast in place, took a caught happy ghast; one without (the first run) refused it with that message. Two new glass rooms 17 by 17: the one with a dried ghast measured 289 blocks with 12 of air, the one without as a plain walking exhibit. |
| 8 | Spawn a happy ghast with a spawn egg (some are ghastlings); try a Reinforced Crate on a ghastling, with a snowball in your inventory. | Refused: let it grow first. On the test server: "That's a ghastling: let it grow first (20 minutes, or feed it 10 snowballs), then catch it." |
| 9 | Put a harness on a grown one and try the crate; take the harness off with shears and try again. Put it in the Sky Pen. | First refused (take the harness off first); then it hops into the crate, and it lives in the pen. The Clipboard lists no sex. On the test server: refused in a harness, caught without, living in the pen, no sex. |
| 10 | Turn breeding on in the Sky Pen. | A message that happy ghasts aren't born: hatch one from a dried ghast in water, let it grow and catch it. On the test server: that message. |
| 11 | Find a nautilus in an ocean (or spawn one), and with a pufferfish in your inventory use a Water Transport Tank on it. Use the tank on the Nautilus Tank's bank. | It swims into the tank, then into the water of the Nautilus Tank. On the test server: the game's wild nautilus caught and living in the tank. |
| 12 | Tame a nautilus with pufferfish, then try the tank on it. | Refused: it's someone's pet. On the test server: refused. |
| 13 | Turn breeding on in the Nautilus Tank with a male and a female. | It says everything is ready and counts the park days of good care; later an egg, and a small nautilus hatches in the tank (half size). On the test server: "Everything is ready. Keep up the good care: 0 of 2 park days in a row so far." A zoo young one (the zoo's event) was half size and drawn with the grown model. **Please check the egg and the hatchling over a few park days.** |
| 14 | Open the Field Journal's pages, and watch each for a while. | Happy ghast: spot one, watch one float about, stand on one's back. Nautilus: spot one, watch one swimming. On the test server all five ticked from the zoo's own. |
