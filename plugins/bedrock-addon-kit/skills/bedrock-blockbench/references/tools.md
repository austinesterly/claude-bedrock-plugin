# Blockbench tools, scripting API and plugins

Source: condensed from ArtsByKev's 36-video Blockbench playlist, checked against vanilla Bedrock 1.26.52 files and export tests in web Blockbench 5.2.1 (2026-09-27). Evidence tags: [vr] checked in vanilla files; [bb] checked by a Blockbench export test; [pack] shipped in a working add-on; (derived) worked out from verified rules; (unverified) nobody confirmed it. Citations like (b4 #16 [3:20]) point at the original video notes (batch, video, timestamp). `ns` = your namespace.

## 6. Tools

### 6.1 Web Blockbench 5.2.1 from the browser pane [bb]
Only when this session has a browser automation tool and the user has web Blockbench open. Pass content inline (geo as an object, PNG as a data: URL) through that tool's JavaScript call. Fetches of 127.0.0.1 from the public site are blocked on purpose.
```
newProject(Formats.bedrock);
Codecs.bedrock.parse(geoObject, 'x.geo.json');
new Texture({name:'x.png'}).fromDataURL(pngDataUrl).add(false);
const g = new Group({name:'left_arm', origin:[-5,22,0], rotation:[0,0,0]}).init();   // UI coords!
new Cube({name:'c', from:[-8,12,-2], to:[-4,24,2], origin:[-6,18,0], inflate:0, mirror_uv:false}).addTo(g).init();
new Locator({name:'hand', position:[-6,12,0]}).addTo(g).init();
Canvas.updateAll();
const geo = Codecs.bedrock.compile({raw:true});
const a = new Animation({name:'animation.ns_x.walk', loop:'loop', length:1}).add(true);
a.getBoneAnimator(g).addKeyframe({channel:'rotation', time:0, interpolation:'catmullrom', data_points:[{x:10,y:0,z:0}]});
a.animators.effects ??= new EffectAnimator(a);   // not created by default
a.animators.effects.addKeyframe({channel:'particle', time:0.25, data_points:[{effect:'step', locator:'hand'}]});
const animJson = a.compileBedrockAnimation();
Timeline.setTime(t); Animator.preview();
```
- The API takes Blockbench-space values (X mirrored, rotation and keyframe X/Y negated). Load your own files with Codecs.bedrock.parse.
- Measure a pose with new THREE.Box3().setFromObject(cube.mesh).getCenter(v) after Animator.preview().
- Faces: cube.faces.north.uv = [u1,v1,u2,v2]; face.texture = null removes the face; Project.box_uv and cube.box_uv switch the mode.
- Close scratch projects with await project.close(true). Leave the user's own tabs alone.
- Screenshots: Screencam.screenshotPreview(Preview.selected) or Ctrl+P. Pose in a throwaway animation; use FOV 30-45 for proportions (b1 #3 [10:38]).

### 6.2 Plugins by task

| task | plugin |
|---|---|
| drop hidden faces | optimize |
| texture-bleed lines | plaster |
| mount seat and hitbox | seat_position |
| check pivots and bone links | bone_view |
| read the raw file | code_view |
| duplicate bone names | duplicate_renamer |
| easing | easings, easing_peasy |
| bake Molang to keys | bakery |
| quick AO on placeholders | baked_ambient_occlusion |
| 5-tone ramps | colour_gradient_generator |
| clumped noise | let_there_be_noise |
| judging foot slide | animated_platforms |
| block transforms | bedrock_block_transforms |

Retired, do not use: geenium_bedrock_entity_helper, animation_utils (Java).

### 6.3 Wizards
The Entity Wizard and Item Wizard give known-good rigs and attachables to diff against. Their behaviour JSON is old 1.16.0, so re-author it.

## 7. Corrections made while condensing the batch notes
1. Blockbench panels are X-mirrored. Every panel number quoted as file JSON needs converting: snowman lean, hip yaw, nod, spider keys.
2. R-QUAD: the lower-leg clamps were swapped, and +phase reversed the footfall order.
3. R-GLIDE: the bob was high at the centre (should be high at the extremes), the bank leaned outward, and the yaw faced away from the travel.
4. R-BIPED hip roll is -sin(p), not +sin(p).
5. R-ATTACK root weight-forward is Z -1, not +1.
6. R-MOUNT signs re-derived.
7. R-SPIDER: single expressions replace the multi-statement form; "tip hooks back" is really a downward curl.
8. +Z raises a right wing.
9. uv_anim: use math.mod, not %.
10. Walk trigger: a speed-weighted animate entry replaces > 0.05 booleans and query.ground_speed truthiness.

## 8. Working in the Blockbench app (for guiding a person)

From official Minecraft Creator Channel tutorials (OdZlKpLOkj4 Entity Wizard giraffe, Z27h1O5JTA4 cat, gKtvlLr7SR8 Creator Camp) and 2026 beginner tutorials (CountFrogg G9kINkTc_cQ animation, dQ-YQFDl6lo texturing).

Starting points
- **Minecraft Entity Wizard** (official, JannisX11 and Mojang; File > Plugins > search "Entity Wizard" > Install, then Tools > Minecraft Entity Wizard). Pages: Name (display name + `ns:name`), Appearance (copy a vanilla mob), Behavior (copy a vanilla mob's), Loot, Spawn egg colours, Export (folder, .mcaddon, or straight into the development pack folders; can merge into existing packs). Pick the donor by its animation set and behaviour, not its look (llama for a long neck, cat for small cats).
- Wizard clean-up: a donor with variants (llama, cat) brings `minecraft:variant` groups and render-controller texture arrays, so the clone spawns with random or pink-black textures. Collapse to one texture (`"textures": ["Texture.default"]`). Remove inherited taming, chests, riding and breeding you don't want. Its behaviour JSON is old (1.16.0), so re-author it at a current format version. Its export path hint is the old UWP folder.
- **mctools.dev** (Mojang's web Creator Tools): "start a project based on a mob", edit Properties / Components / Actions (events) / Visuals / Spawn / Loot, right-click a .geo > Download as Blockbench model, edit, drag the .bbmodel back in, "Save as a flat world with packs" for a quick test. Good for prototypes; keep the real project in a local folder.

Modes and keys
- Work in order: Edit, then UV, then Paint, then Animate.
- Edit: S resize, V move; Add Group (folder icon) takes the selected cube's pivot. Only groups (bones) animate; groups can't be created in Animate mode. Right-click > Rename.
- Paste an image into Blockbench > "Add it to this project" for a reference image. Alt + colour picker samples it.
- Paint: Create Texture first. B brush, E eraser, M rectangle select. Bucket fill mode "Face" fills one side, "Element" the whole cube. Shift-click draws a straight line from the last point (stripes, beak splits). Hide a cube with its eye icon to paint what's behind it. Toolbar numbers are size / opacity / softness; 1 / 100 / 100 blends a dark line into corners for fake roundness.
- New cubes start at UV 0,0 and overwrite paint: move each new UV island to free space first. Cubes that share a UV are painted together.
- Animate: + Add Animation, drag the blue end bar for length, right-click the animation > Loop Mode (Loop / Hold on Last Frame / Once = `true` / `"hold_on_last_frame"` / `false`). Keyframes marked "M" hold Molang.
- Export: File > Export > Export Bedrock Geometry (.geo.json); Textures panel > save icon; Animation menu > Save Animations (.animation.json).

Pixel-art method (Mickey Joe 4w_N8r4j2vc, plus the ramp in geometry-and-textures.md)
- Build a palette from a reference photo first (crop, blur, sample); a separate lighter palette for bellies and undersides.
- Light from the top-left: tops lightest, undersides darkest, a dark line under any overlap.
- Manual anti-aliasing with in-between palette colours, never transparency. Every pixel should show shape or material. Break up edge bleeding on purpose so it doesn't look plastic.
