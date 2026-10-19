# Skins and poses test plan (0.1.86)

Austin's report (2026-10-19, two screenshots): "Croc texture is messed up. Legs dont connect". The upper legs stuck up and out like wings and the lower legs floated below them.

- **Why the legs didn't connect.** The game turns a part about its z axis the opposite way to the preview tool the crocodile was drawn in, and when a part is turned about more than one axis it applies them in the opposite order (Blockbench's Bedrock code, the editor the game matches). The croc's upper legs are tilted 40 degrees about z to reach the elbow; in the game that tilt went up instead of down. The same mismatch had the flamingo's open wings pointing up, the Void Ray's resting wings curling up instead of draping, and the lion's, tiger's and zebra's rolls and wake-ups off.
- **Why the skin looked wrong.** The game also lays a box's skin out differently from those painters: each box's skin showed mirrored across the box, and its top and bottom front to back (so the croc's back bands didn't meet its sides). Mojang's own player model shows the game's layout: the right leg sits at -x and wears the skin's first strip.
- **What changed.** The poses of the nine animals drawn the old way (crocodile, lion, tiger, zebra, flamingo, hedgehog, raccoon, Void Ray, Lava Ray) are rewritten so the game shows them as designed; renders of the game's maths match the designs pixel for pixel in their resting poses. The skins of those animals, and of the chorus deer, ember fox, rift ferret, Blaze Bone and Wither Skull Ball (painted the same old way), are rewritten so every texel lands where it was drawn. The red panda, gorilla, owl, grazer and gecko (and the older animals) were already drawn the game's way, so they stay as they were, apart from two small slips: the otter's nose now sits at the front of its snout and the gecko's toe pads at the front of its feet.

Changed files: 4 models, 9 animation files and 45 skins in the resource pack; nothing in the behavior pack. **Full Minecraft restart after the build** (changed skins).

| # | Do this | You should see |
|---|---|---|
| 1 | Restart Minecraft, open the world, open the content log. | The usual ZooCraft startup lines, no errors. |
| 2 | On superflat, `/summon zoocraft:crocodile` and stand back. | Its legs are whole: the upper legs slope down and out from the body to the elbows and knees, the lower legs stand under them, the feet flat on the ground. No flaps sticking up. |
| 3 | Walk around it and look down on it. | The dark bands across its back run on down its sides; the scutes, eyes and nostrils sit along the top of the head and snout; the pale belly stays underneath. |
| 4 | Watch it walk, lie down and swim (a pond, or let it find water). | The legs stay joined through the walk; lying, the legs fold against the body; swimming, the legs tuck in along the sides. |
| 5 | Summon a lion, a tiger and a zebra; let them lie down and get up (wait, or `/time set 13000` for the night). | Lying down, rolling onto a side and getting up look natural, with no leg swinging through the body. Their stripes and manes run on across the tops of the boxes. |
| 6 | Summon a flamingo and wait for a wing salute (a group display, or just watch a while). | Folded, no wings stick up. In the salute the wings flick out to the sides and up, showing the black flight feathers. |
| 7 | Find a resting Void Ray (on a perch or a ledge). | Its wings drape down over the edge instead of curling up. |
| 8 | Look at a hedgehog, a raccoon and a Lava Ray. | Spines fan back over the hedgehog; the raccoon's mask and rings look right from above; the Lava Ray's glow pattern matches across its top. |
| 9 | Look at a red panda, a gorilla, an owl, a Crimson Grazer and a Warped Gecko on a wall. | Exactly as before (these were already right). The gecko on a wall on its left still lies belly to the wall. |
| 10 | Look closely at an otter's snout and a gecko's feet. | The otter's black nose is at the front of its snout; the gecko's pale toe pads are at the front of its feet. |
| 11 | Content log after a few minutes of play. | No script or content errors. |
