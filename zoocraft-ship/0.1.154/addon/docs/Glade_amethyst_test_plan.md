# Glade amethyst stands up: test plan (0.1.154)

Austin's report (2026-10-31, with a screenshot): in the Mythical Glade the amethyst buds and clusters lie on their
sides. The glade's patches of amethyst place each bud and cluster facing up, but the game turned every one to face
west: the setting that lets a crystal go only onto an amethyst block (`may_attach_to`) also turns what it places, unless
it is told not to (`auto_rotate`, on unless set off). Now it is set off, so they stand up in new glade land.

For the glade land you have already been to, the glade stands them up as you walk about: every 5 seconds, while you're
in a Mythical Glade, each bud or cluster within 16 blocks of you (6 up and down) that lies facing west on an amethyst
block, or on a Mythwood root a tree grew in the patch's place, is stood up. It leaves alone any facing another way,
any on other ground, and any hung from an amethyst block or budding amethyst (so amethyst you build with, and a
geode's, stay as they are).

No new files: leave the world and open it again. Works in any world.

Checked before shipping, on the cloud test server (Bedrock Dedicated Server 1.26.60, the whole behaviour pack):
- New land: 36 patches of buds and clusters set on a cleared field. Before, 0 of 500 stood up (all faced west); with
  the setting off, 500 of 500 stood up. Turning it off with the other setting (`randomize_rotation`) did not help.
- Old land (a glade made by 0.1.153): a simulated player standing in it. Within 10 seconds a large bud laid west on
  amethyst, a cluster laid west on a Mythwood log, and one the world had grown on a tree's root all stood up; a bud
  facing north, a cluster on grass, a bud hung from budding amethyst and two clusters hung from an amethyst block
  stayed as they were. Round the player (33 x 13 x 33 blocks), all 43 crystals the world grew stood up; the 5 left
  were the test ones above.
- The tests (309), the type check and the pack checker.
- What can't be checked without a screen: how the patches look in the game.

| # | Do this | You should see |
|---|---|---|
| 1 | Leave the world and open it again. Go to the spot in your screenshot (-1085 117 -218), or any glade you have been to. | Within a few seconds the buds and clusters round you stand up, growing out of the top of the amethyst. |
| 2 | Walk on through the glade. | The same as you go: the ones round you stand up. |
| 3 | Go to glade land you have never been to (Field Journal's Places page, or /locate biome zoocraft:mythical_glade, then well past it). | The patches' buds and clusters stand up from the start. |
| 4 | Build a little amethyst wall in a glade and put a cluster on its side; put another on a geode's budding amethyst if you find one. | Both stay as you put them. |
| 5 | Open the content log (Settings, Creator) after the steps above. | No lines about amethyst or the glade. |
