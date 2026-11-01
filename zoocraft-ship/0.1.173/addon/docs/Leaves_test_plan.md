# Leaves of the Mythical Glade and the End's trees: test plan (0.1.173)

Austin (2026-11-01): the Mythical Glade's leaves flashed as he moved around, a texture problem that was hard to
describe (his screenshot at 318, 100, 720: pink leaves with flickering stripes and dark specks).

Why: the add-on's four leaf blocks (the glade's Mythwood and Moonwillow Leaves, the End's Whitewood Leaves from the
Chorus Meadow and White Willow Leaves from the Rift Willows) drew both sides
of every face. Two leaf blocks side by side each keep the face they share, because a see-through neighbour hides
nothing, so two faces sat in exactly the same place, both drawn, with their pictures mirrored. The screen picked
between them pixel by pixel, and the pick changed as the camera moved: flashing stripes (z-fighting). Mojang's answer
to a report of the same thing (MCPE-137976): two textures in one place flash with any render method. And past half the
render distance leaves are drawn solid, so the holes in the texture show their stored colour, which was black: far
canopies had dark specks that changed as they crossed that distance.

What changed: the four leaves draw only the side of each face turned towards you (the render method the game uses for
sugar cane and bamboo: see-through near, solid far), so of the two faces in one place only one is ever drawn. The holes
in their textures keep their see-through look up close and are now a darker shade of the leaf for the solid far look,
the way the game's own far leaf textures are made. Nothing else changed: same colours up close, same blocks, same trees.

New textures and block files: quit Minecraft fully and start it again. Works in any world; the leaves already in the
world update by themselves.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, and go to a Mythical Glade (318, 100, 720 in Austin's world). Walk and turn around near the pink Mythwood and teal Moonwillow trees. | The leaves stay still: no flashing stripes or flickering specks on any face as you move. |
| 2 | Look into a canopy through its gaps. | Leaves behind leaves, as before; no hollow trees. |
| 3 | Walk away until the trees are far off (past half your render distance), then walk back. | Far canopies look solid pink or teal with darker spots, not black specks, and nothing flashes when they turn see-through again as you come close. |
| 4 | In the End, visit a Chorus Meadow (Whitewood trees) and a Rift Willows patch (White Willow trees). | The same: steady leaves near, no black specks far. |
