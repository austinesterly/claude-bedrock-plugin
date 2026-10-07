# Geometry files and textures

Source: condensed from ArtsByKev's 36-video Blockbench playlist, checked against vanilla Bedrock 1.26.52 files and export tests in web Blockbench 5.2.1 (2026-09-27). Evidence tags: [vr] checked in vanilla files; [bb] checked by a Blockbench export test; [pack] shipped in a working add-on; (derived) worked out from verified rules; (unverified) nobody confirmed it. Citations like (b4 #16 [3:20]) point at the original video notes (batch, video, timestamp). `ns` = your namespace.

## 2. Geometry in files

### 2.1 What Blockbench writes [bb]

| technique | file result |
|---|---|
| cube placement | origin = min corner in file space ([-to.x, from.y, from.z]), size |
| cube pivot and rotation | pivot [-x,y,z], rotation [-rx,-ry,rz], about the cube's own pivot |
| bone | name, parent, pivot [-x,y,z], optional rest rotation [-rx,-ry,rz]; parents written first |
| inflate | "inflate": n, unchanged |
| box UV | "uv":[u,v]; mirrored cube "mirror": true |
| per-face UV | "uv":{"north":{"uv":[u,v],"uv_size":[w,h]},...}; a face with its texture removed is omitted; a mirrored face has negative uv_size |
| locator | on its bone, "locators":{"hand":[x,y,z]} (x negated); vanilla example {"lead_hold":[-6,15,1]} |
| format_version | Blockbench 5.2.1 writes 1.12.0 for box and per-face; the shipped-pack per-face generators wrote 1.16.0; both load |
| description | identifier, texture_width/height, visible_bounds_* (recomputed) |

Units and rounding
- Whole px, quarter px at worst. 22.5-degree rotation steps where possible (b1 #2). Round floats to 4 decimals (wb saw 1.6999999999999997).
- Never write a negative size: it renders inside-out (b1 #1 [4:30]).

Box UV footprint of a w x h x d cube at [u,v] is 2(w+d) wide by d+h tall [bb]:

| face | position | size |
|---|---|---|
| up | (u+d, v) | w x d |
| down | (u+d+w, v) | w x d |
| east | (u, v+d) | d x h |
| north | (u+d, v+d) | w x h |
| west | (u+d+w, v+d) | d x h |
| south | (u+2d+w, v+d) | w x h |

- Mirror swaps east and west and flips each face.
- Pack cubes in rows with no overlap (b2 #19 [4:43]: the next cube starts at v=28 under a 14-cube).

Other rules
- texture_width/height must equal the PNG, or every UV rescales (b1 #17).
- Blocks: a full block is origin [-8,0,-8], size [16,16,16] (b2 #18 [7:37]); block geometry is read only from models/blocks; one texture on every face = per-face UV with each face at [0,0], size 16.
- Vanilla 1.8.0 mobs.json fields are for reading only; don't write 1.8.0 geometry [vr] (texturewidth, bone mirror, neverRender, bind_pose_rotation, reset, child:parent).
- Formats in use [vr, pack]: geometry 1.12.0 or 1.16.0; animations 1.8.0; animation controllers 1.10.0; client entity 1.10.0; render controllers 1.8.0 (vanilla) or 1.10.0.

## 3. Textures (placeholders by script)

### 3.1 Five-tone hue-shifted ramp
Measured on his bevel tile (b3 #13 [2:07]):

| role | HSV | hex |
|---|---|---|
| highlight | 270/9/90 | #dbd0e5 |
| light | 247/9/75 | #afadbf |
| base | 220/7/63 | #9599a1 |
| shadow | 203/29/48 | #566c7a |
| deep shadow | 201/40/44 | #425f6f |

- Hue walks steadily, value climbs in near-equal steps, saturation highest in the shadows. Shadows cooler (teal/blue); lights warmer or violet. Never pure black or white (b3 #5, #13, #24).
- Generator ramp from a base (h,s,v), "-" = degrees toward about 210, "+" toward about 50 (violet for cool greys): deep (h-20, s+.20, v-.22); shadow (h-10, s+.10, v-.14); base; light (h+12, s-.06, v+.12); highlight (h+25, s-.10, v+.24). Clamp s to [.05, .9] and v to [.12, .94].
- Fire and glow: ramp the hue at full saturation, red #e00000 -> #f08000 -> yellow core (b3 #25 [16:25]).

### 3.2 Shading
- Per-face bevel, light from the upper left (b3 #13): row 0 and col 0 highlight; row/col 1 light; middle base; row/col n-2 shadow; row/col n-1 deep; top-right and bottom-left corners stay base; faces under 5 px keep only the outer highlight and the deep shadow.
- Whole-face values (b3 #12 [3:04], [6:25]; b2 #21 [7:40]): top face one step lighter, sides base, bottom and undersides one or two steps darker; a darker ring where a limb enters the body; protrusions dark at the root to light at the tip.
- Stepped vertical bands on side faces: 3-6 bands, each 8-12 % value darker toward the ground; whole px, no smooth ramps (b3 #24 [10:26], [12:27]). Keep accents (eyes, horns, glow) out of the pass.
- Pillow shading on large mob faces: 1 px rings darker toward the edges and more so in the corners, steps of only 3-8 % value, saturation up as value goes down (b3 #32 [4:37]). Never on tiling blocks.
- Fur: 1 light px over a dark run of 1-4 px, short-long-short-long rhythm, staggered one row per column; about 30 % dark, 40 % base, 25 % light (b3 #12 [0:41]).
- Palette discipline: 4-5 shades per material, 3 on hidden areas (b6 #8 [7:28]); reuse existing colours (b3 #32 [4:06]); eyes very dark blue, not black (b2 #21 [11:22]).

### 3.3 Seamless tiling (blocks)
- No border or bevel on the tile edge; it becomes a grid (b3 #5 [11:39]).
- Put bevelled shapes inside the tile; cracks and bricks run off one edge and back in on the opposite edge (b3 #13 [3:09]). Brick mortar is just one brick's deep shadow against the next one's highlight.
- Test by tiling 3x3 unrotated, and 5x5 with random 90-degree rotations and flips (b3 #5 [4:07]). Directional patterns only suit blocks that never rotate.
- Script check: the edge-column difference should be no larger than any interior neighbour difference.

### 3.4 UV discipline
- A texture fits only its own UV layout; the hoglin template scrambled (b3 #24 [15:08]). Generate every PNG from the geo's own uv values; re-export the layout before painting a changed model.
- Resizing a texture does not move UVs (b2 #18 [14:51]; b3 #25 [8:41]).
- Make the template first, then mirror. Faces hidden at rest still need colour.
- Self-test: harsh distinct colour per part (b3 #24 [3:04]).
- Density: 16 px per block beside vanilla; 32x looks uncanny (b3 #32 [12:00]). Power of two is tidy but not required; 96x96 works (b2 #21).

### 3.5 Placeholder recipe (script; starting numbers)
1. Canvas = texture_width x texture_height from the geo, RGBA, 1 texel per unit.
2. One base colour per part, then the 5-tone ramp (3.1).
3. Fill used faces at alpha 255: up = light, sides = base, down = shadow. Fill unused area loud magenta.
4. Side faces get 3 bands (4 if taller than 12 px), bottom band(s) one step darker.
5. Bevel faces of 4x4 or more (3.2); faces of 8 px or more get a second inner ring.
6. Noise on faces of 6 px or more: swap about 12 % of interior pixels to the adjacent step, in 2-3 px clumps, seeded by part name.
7. Contact rows one step darker; overhang undersides deep.
8. Features last, flat, no noise: eyes 1-2 px near #1a1a2e with one light px.
9. Paint mirrored and shared cubes once. Nearest-neighbour only.
10. Blocks: skip steps 4, 5 and 7 on tile edges, use 3 tones in clumps that wrap, and run the tiling test.

Blockbench's own template look is an OK quick placeholder: flat colour per face with a 1 px ring (b3 #10 [6:32]). Template colours: top white, bottom grey, north blue, back yellow, sides green/red (b3 #24 [2:02]).

### 3.6 Never do
- Pure #000 or #fff; a 1 px dark border on a tiling block; grey value-only shadows.
- Full-contrast per-pixel noise; smooth or anti-aliased gradients; bilinear scaling.
- Alpha 0 on used pixels of an opaque material: they render black (b3 #11 [1:02]). Only cut-outs get alpha, on an alphatest material.
- Mixed densities on one model; one texture shared by two different UV layouts; overwriting art someone else owns.

### 3.7 Animated textures
- Blocks: RP/textures/flipbook_textures.json entries look like {"flipbook_texture":"textures/blocks/x","atlas_tile":"<terrain key>","ticks_per_frame":n}, with optional frames, blend_frames and replicate. The PNG is a vertical strip (width x frames*width) [vr] (b3 #25).
- Entities: the render controller's uv_anim takes {"offset":[u,v],"scale":[1,1]}, in normalised units. creeper_armor steps 0.01 per tick: (Math.floor(query.life_time * 20.0) + query.frame_alpha) * 0.01 [vr]. Frame strip: v = math.mod(math.floor(q.life_time*fps), frames)/frames, with the cube's UV sized to one frame and texture_height = the whole strip. Molang has no %: batch 3's "% frames" is invalid. The strip formula is unverified in game.
- Frames: move the few pixels the eye tracks; the last frame leads into frame 1 (never repeat frame 1 at the end) (b3 #25 [16:19]); keep effects on their own small texture and material.

