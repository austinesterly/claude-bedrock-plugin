# Rigging and file-space rules

Source: condensed from ArtsByKev's 36-video Blockbench playlist, checked against vanilla Bedrock 1.26.52 files and export tests in web Blockbench 5.2.1 (2026-09-27). Evidence tags: [vr] checked in vanilla files; [bb] checked by a Blockbench export test; [pack] shipped in a working add-on; (derived) worked out from verified rules; (unverified) nobody confirmed it. Citations like (b4 #16 [3:20]) point at the original video notes (batch, video, timestamp). `ns` = your namespace.

## 0. Sign rules (verified)

File space: 16 units = 1 block. Front = -Z. The mob's left = +X, right = -X. Feet at y=0. origin and pivot are absolute model-space pixels, not relative to the parent [vr humanoid, b1 #9].

| Channel (file value) | Effect | Evidence |
|---|---|---|
| rotation X negative | a hanging limb swings forward (zombie arms -90, riding legs -72, holding -18) | [vr] |
| rotation X positive | tips an upright bone's top forward (head looks down); a hanging limb swings back; a knee folds the shin back; a forward jaw opens | [vr] look_at q.target_x_rotation; [bb] |
| rotation Y positive | turns the front (-Z) toward -X (the mob's right); sweeps a left (+X) sideways leg forward and a right leg back | [bb]; riding.legs [vr] |
| rotation Z positive | tips a bone's +Y end toward +X; raises a right-side (-X) horizontal wing or leg; lowers a left one; splays a hanging left arm inward | [bb]; humanoid.bob [vr]; antler guard |
| position X/Y/Z | same axes as geometry (+Y up, -Z forward, +X the mob's left) | [vr] sneaking legs [0,-3,4] move back |

- Mirroring left <-> right: rotation [x,-y,-z], position [-x,y,z], pivot/origin x -> -x; cube origin.x' = -(origin.x + size.x) [vr]; gaits also shift time by L/2 (b5 #31 [41:51]).
- Blockbench panels are NOT file values: the Element and Keyframe panels are X-mirrored. Export writes cube origin = [-to.x, from.y, from.z], pivot [-x,y,z], rotation [-rx,-ry,rz]; keyframes export as rotation [-x,-y,z] and position [-x,y,z] [bb]. So in the UI, +X swings a hanging limb forward and the left side sits at -X. Convert every number quoted from a video panel before it goes into a file. All recipes in section 4 are already in file values.
- Bone names: vanilla pairs animation `leftarm` with geometry `leftArm`, so matching is case-insensitive [vr]. Still keep exact lower snake_case.

## 1. Rigging

### 1.1 Hierarchy

Bones
- Only bones animate. Every cube goes in a named bone (b4 #4 [0:41]).
- Blockbench auto-wraps loose root cubes, reportedly in `bb_main` (unverified). Name bones yourself (b2 #19).
- Root: an empty `root` bone at [0,0,0] with no cubes. Whole-body bob, turn and squash go here (b4 #4 [8:34]; b2 #22 [3:50]).
- Legs hang off root, as siblings of body/torso, so a body lean or breath never lifts the feet (b4 #4 [8:34], #15 [0:55]; b6 #8). Vanilla player: root > waist > body > head/arms, with leftLeg/rightLeg on root [vr]. If a rig has legs under body, never rotate body; animate a `chest` child instead.
- Quadruped: root > body > head, all four legs under root (b4 #4 [12:18]). The head pivot goes where the neck meets the body's front top edge.

Borrowing vanilla animations means keeping vanilla bone names and pivots.
- Quadruped: leg0 = rear right (-X, z +7), leg1 = rear left, leg2 = front right, leg3 = front left [vr geometry.quadruped]. animation.quadruped.walk swings leg0 with leg3 (a trot).
- Humanoid: head, body, leftarm, rightarm, leftleg, rightleg.
- Choose the donor by its animation set and controller, not its look (b6 #8 [2:17], #26).

Pivots

| joint | pivot | source |
|---|---|---|
| hip | top centre of the leg cube (leg 4x14x4 at -4,0,-2 -> pivot -2,14,0) | b4 #4 [2:03] |
| shoulder | 1-2 px below the arm top, centred (vanilla arm top y 24, pivot 22) | [vr]; b4 #4 |
| neck | bottom centre of the head | b4 #4 |
| finger | base centre of the cross-section (-18.5,22,-1.5 for a 1x1x3 at -19,21.5,-4.5, UI coords) | b2 #20 [21:36] |
| one-way bend, end-to-end box segments | edge of the side that opens (kneecap side) | b2 #21 [18:40] |
| two-way bend | centre, plus 1 px overlap | (derived) |
| tentacle or neck chain | centre of the joint with the segment below | b6 #35 [3:47] |
| ankle | above the sole (3,3,1) | b4 #23 [0:30] |
| squashing bone | on the contact face (floor) | b4 #29 [8:46] |

Blockbench mechanics
- Add Group takes the selected cube's pivot, or 0,0,0 with nothing selected (b4 #4 [1:01]; b2 #20 [11:40]).
- Pivots do not follow a resize (b2 #19 [3:05]). Drag whole bones, not cubes (b4 #4 [5:30]).

Chains (tails, tentacles, necks, horns)
- Segment i's parent is segment i-1, pivoted at its own base, cube running outward (b1 #9 [22:42]; b4 #4 [15:00]).
- Don't Resolve a chain into cubes if it will animate.
- Rest bends go in bone `rotation`, which adds to the animation (b2 #20 [13:00]).
- 8-12-segment chains get a `_mid` bone halfway (b6 #35).
- Taper the last 3-4 segments by x0.85 each (b6 RB), or with inflate -0.1/-0.2/-0.3 (b1 #9 [17:52]).

Master bones
- Orbiting parts go under a master bone pivoted at the model centre; the master spins, each child tilts on its own pivot (b6 #35 [6:56]).
- Shared joints: re-parent, so one axle bone turns both wheels while each spins on its own bone (b6 #36 [7:39]).

Hiding gaps
- Small joint cubes at hip and ankle (b4 #23 [1:00]).
- Two 45-degree filler cubes, top and bottom, at neck or tail joints bending more than 20 degrees (b6 #8 [3:05]).
- Record each joint's clip-free range and clamp to it (b6 #35 [4:29]).

Naming
- Lower snake_case: left_*/right_*, *_tip, *_mid. Names must be unique.
- Flip X renames left_<->right_ and l_<->r_ (b4 #4 [7:33]; b2 #21 [0:42]) but can renumber children (right_back_leg_2 vs left_back_leg_4, b5 #31). A mirroring script must map by structure, not by string swap.

Mirror by script
- Build the left side and its texture/UV, then derive the right: pivot x -> -x; origin.x' = -(origin.x+size.x); rotation [x,-y,-z]; same uv plus "mirror": true (box UV).
- The right side then costs no texture space (snowman 112->96 b2 #21 [1:15]; spider 256->128 b5 #31 [7:41]).
- Blockbench writes Flip-X box cubes as "mirror": true, and mirrored per-face faces as a negative uv_size [bb].

Facing
- Front toward -Z (north) [vr: iron golem nose z -9.5, quadruped head z -14] (b2 #18 [2:05]; b5 #28 [17:24]).
- Centre on x=0, z=0, feet at y=0 (b1 #17 [3:48]). X-symmetry also allows mirror painting (b1 #9 [15:30]).

### 1.2 Large models (4-10 blocks)
- Build at 16 units/block; do not scale down. His showpiece was 954 cubes and about 90 bones (b6 #35 [1:38]). Swarm mobs drop tip bones (b5 #31: 37 -> 29).
- Build one of each repeated part, texture it, then copy (b6 #35 [0:47]). Radial parts: one wedge pivoted at the disc centre, N copies at 360/N (b6 #35 [8:18]).
- Enlarging a vanilla-rig mob by s: multiply every pivot and origin by s, then raise visible_bounds and the BP collision_box (b6 #26 [4:28]; unverified). Melee reach comes from collision WIDTH; don't also scale a reach multiplier.
- Texture: 16x-32x density on one 512-1024 sheet (his 128x gave 4096, b6 #35 [1:05]).

### 1.3 visible_bounds (blocks, in `description`)
- The mob is culled when its bounds box leaves the view; too small and it vanishes at the screen edge (b5 #28; unverified).
- Size to the ANIMATED extent (b6 RB step 6): width >= 2 x max horizontal reach + 1; height >= top including raised limbs + 1; offset [0, height/2, 0]. Pack examples: 7x10, 12x20, 8x4.
- Blockbench recomputes bounds on export (3 became 4, wb), so re-apply your own values after a round trip.

### 1.4 Inflate
- Grows or shrinks a cube about its centre by n px on every side; UV unchanged (b1 #1 [14:15]).
- Z-fighting: -0.001 on one of two coplanar cubes. Taper: -0.1/-0.2/-0.3 per segment, with chain pivots on the centre line (b1 #9 [17:52]).
- Overlay shells: vanilla hat +0.5; sleeves, pants and jacket +0.25 [vr]. The recipe for a fur or armour shell.

### 1.5 Arcs, rings, rounding (file space)
- Arc of straight segments of length L bending by step a (22.5 gives 16 segments per ring): toward +X, segment k has rotation Z = +k*a and pivot_k = pivot_(k-1) + L*(sin(k*a), cos(k*a), 0); toward -X negate Z and the x term; forward (YZ plane) rotation X = +k*a, pivot_k = pivot_(k-1) + L*(0, cos(k*a), -sin(k*a)); round to 4 decimals. Matches b1 #9 [10:55]: UI (-8,4) -> (-6.4693, 7.6955) at -22.5 becomes file (8,4) -> (6.4693, 7.6955) with Z -22.5 [bb].
- Disc: one zero-thickness plane with a circular alpha cut-out on an alphatest material (b1 #9 [14:25]).
- Rounded ball: a core cube inset 1 px, plus 1 px slabs per face, each ring inset one more px; keep the ground face flat and full size; up to 6 cubes per ring (b2 #20 [0:55]); inset by whole px or the slabs z-fight.

