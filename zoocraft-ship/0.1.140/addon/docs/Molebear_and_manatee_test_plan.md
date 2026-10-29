# The manatee's face and a bigger Earth Molebear: test plan (0.1.140)

Two things Austin asked for on 2026-10-29: "the manatee face. It looks bad", and "I want the mole bear to be 2X the size
it is and it should burrow 2x2 holes". On the card about its exhibit he chose "Large-animal room".

The manatee: the dark blotches and the green on its snout are gone. Its face is now a rounded muzzle with the upper lip
in two big soft lobes (a dark split down the middle, as a real manatee's), a few bristle dots, the nostrils on top,
small dark eyes with a light glint and a few wrinkles. Its body, flippers, tail and the algae on its back are as before.

The Earth Molebear: twice the size in every way (about 3 blocks long, its back about at your head; a cub 0.8 of the old
size), the same look. Its tunnels are 2 blocks wide and 2 high, up to 3 blocks deep, so at the end its whole body is
inside. What changes for its exhibit:
- Floor: the big animals' room, as the elephants': 256 blocks for the first and 80 more for each other (a pair 336). It
  keeps the 4 blocks of headroom it had, so a cave exhibit with a roof 4 blocks up is fine. An exhibit built for 0.1.138
  shows as too small until it is enlarged.
- The Burrow Soil bank: at least 3 blocks high and 4 wide (a 2 by 2 tunnel with soil on both sides and over it), 12 or
  more blocks of it beside the floor, and 3 blocks of open floor, 2 wide, in front of a face for it to stand on while it
  digs. A bank built for 0.1.138 (2 high) needs one more layer on top before they can dig it.
- Each digs at most 3 blocks deeper a park day (12 blocks of soil). Fill old tunnels in again to give them more.
- The tunnels it digs are floor now (2 high): they don't count as a low roof, so no warning about them.

New model, skin and entity files: quit Minecraft fully and start it again. Works in any world; a fresh `/zoocraft:build`
somewhere new has the bigger molebear exhibit (an old test zoo keeps its old, smaller one).

Checked before shipping:
- Mojang's server (Bedrock Dedicated Server 1.26.60, worlds made for the test): a molebear with the new 1.8-block body
  was put in front of a 3-high bank, the 2 by 2 slices in front of it set to air one after another and the molebear
  moved in a step at a time, as the game does it: three slices deep, it stayed exactly where it was put each time (0.000
  blocks off), on the ground, unhurt (24 of 24 health), held 10 seconds in the den at the end, and backed out to where it
  started. Twice, from two sides; every block round the tunnels was still Burrow Soil.
- The same server, its walk to the soil: from 3 to 5 blocks off it walked up to the bank and stopped where it could start
  digging (0.5 to 1.4 blocks from the spot); from 7 to 10 blocks off it often stopped short or wandered, with this big a
  body (the engine's walk was fine for the 0.9-block molebear). So now, when it has wanted to dig for 5 seconds and isn't
  at a face, it creeps over to the nearest face the exhibit measure found, in a straight line over open floor (up to 12
  blocks), nose down, then digs.
- The same server, the wild spawn rule with the bigger body: in 3 minutes at each of the four places 0.1.138 was checked at (the same world seed), 2 and then 4 Wild Earth Molebears spawned at the two ordinary deep caves, with 2 near the player at a time at both (the cap), and none in the lush cave or the deep dark. 0.1.138's smaller body had 7 at the first cave in the same time; either way there were 2 near you.
- The park simulator (a 52-exhibit test zoo from /zoocraft:build, 36 checks, all pass): the exhibit (348 blocks of floor,
  42 blocks of Burrow Soil beside it, 9 faces 2 wide), the clipboard, no warning; through the first park day the pair dug
  on their own (3 slices each) and came out; with the bank filled in again, a molebear by the middle face dug 3 slices of
  2 by 2 (12 blocks) straight in, every one closed in but for the way in, its body never touching the soil ahead, curled
  up in the den and backed out to where it started; the exhibit measured again with no low-roof warning for the tunnel;
  at another face it dug the one slice left that day and then no more until the next day; far off, it crept over to a
  face and dug; carried off mid-tunnel it left off. The wild one's steps as before. No errors.
- 293 tests (the 0.1.138 molebear test kept for the 1 by 1 rules, with its numbers moved to the new size; a new one for
  the 2 by 2 tunnels, the room in front, where its body stands, the tunnels' floor, the creep over, the new exhibit and
  the manatee's head).
- What can't be checked without a screen: how the manatee's face and the bigger molebear look in the game, and how it
  moves. The manatee's face was checked in renders that lay the skin out the way the game does.

| # | Do this | You should see |
|---|---|---|
| 1 | Find a manatee (the Manatee Lagoon of the test zoo, or `/summon zoocraft:manatee` in water) and look at its face up close. | A rounded grey muzzle with the upper lip in two soft lobes and a dark split down the middle, a few small bristle dots, two nostrils on top of the snout, small dark eyes with a light glint. No black blotches and no green on the face; a little green algae still on its back. |
| 2 | In a Creative world, `/zoocraft:build` somewhere new. | The "Earth Molebears" exhibit is bigger now (20 by 19 blocks), with a bank of Burrow Soil 8 wide, 4 deep and 3 high along the back wall. A pair inside. |
| 3 | Stand next to one. | Twice as big as before: about 3 blocks long, its back about at your head. Same grey or brown velvet, spade hands and pink star. |
| 4 | Watch the bank by day. | One goes to the bank (walking, or creeping over nose down from farther off), digs in with its spade hands, snaps up a grub, and crawls in: the hole is 2 blocks wide and 2 high. It digs on up to 3 blocks deep, curls up in the den at the end (its whole body inside), then backs out. Its nose meets the soil, its body never goes into it. |
| 5 | Look at a finished tunnel. | 2 wide, 2 high, up to 3 deep, Burrow Soil (or the wall) on both sides, above and at the end. Nothing else dug. |
| 6 | Use the Exhibit Clipboard. | Burrow Soil 42 of 12 and Faces to tunnel into 9, green (fewer faces after digging). No care warning about a low roof over its tunnels. |
| 7 | Watch over a park day. | Never more than 3 blocks deeper a day for each molebear (12 blocks of soil). |
| 8 | Your own molebear exhibit from 0.1.138: use the Habitat Marker on the ground inside again, then the Exhibit Clipboard. | Under 256 blocks of floor: "Too small: needs 256 usable blocks for one animal"; for a pair the Animals line says "needs 336 usable blocks". Enlarge it and measure again. A bank only 2 high shows 0 faces to tunnel into until you add a third layer on top; leave 3 blocks of open floor in front of it. |
| 9 | Turn breeding on and keep them well for a few park days. | Two cubs, a bit smaller than the old grown-ups, following their mother about. Cubs don't dig. |
| 10 | In a normal world, go down into a stone or deepslate cave below y 0 (or use the Wild Earth Molebear Spawn Egg). | Wild Earth Molebears, twice the size; they behave as before (dig themselves in when you come close, stand up to sniff if you sneak, come over for an Insect Ration). |
| 11 | Open the content log (Settings, Creator) after the steps above. | No lines about `molebear` or `manatee`. |
