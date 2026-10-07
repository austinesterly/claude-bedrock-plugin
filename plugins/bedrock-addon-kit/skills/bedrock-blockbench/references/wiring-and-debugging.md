# Wiring a model into Bedrock, and why it breaks

Source: condensed from ArtsByKev's 36-video Blockbench playlist, checked against vanilla Bedrock 1.26.52 files and export tests in web Blockbench 5.2.1 (2026-09-27). Evidence tags: [vr] checked in vanilla files; [bb] checked by a Blockbench export test; [pack] shipped in a working add-on; (derived) worked out from verified rules; (unverified) nobody confirmed it. Citations like (b4 #16 [3:20]) point at the original video notes (batch, video, timestamp). `ns` = your namespace.

## 5. Wiring into Bedrock

### 5.1 String joins the game never reports (b5 #28)
1. BP identifier = RP client identifier.
2. geometry.default = a geo identifier.
3. textures.default = a path with no extension, forward slashes, exact case.
4. render_controllers[] = defined controllers.
5. scripts.animate names and controller-state names = keys of `animations`.
6. Those values = defined ids.
7. Animation `effect` names = keys of particle_effects / sound_effects.
8. `locator` = a locator on a bone.

### 5.2 Client entity (1.10.0) template
```
{"format_version":"1.10.0","minecraft:client_entity":{"description":{
 "identifier":"ns:x","materials":{"default":"entity_alphatest"},
 "textures":{"default":"textures/entity/ns_x/x"},"geometry":{"default":"geometry.ns_x"},
 "render_controllers":["controller.render.default"],
 "spawn_egg":{"base_color":"#35353E","overlay_color":"#7426D9"},
 "scripts":{"initialize":[],"pre_animation":[],
  "animate":["idle","look_at_target",{"walk":"math.clamp(q.modified_move_speed * 2.5, 0, 1)"},"general"]},
 "animations":{"idle":"animation.ns_x.idle","walk":"animation.ns_x.walk",
  "look_at_target":"animation.common.look_at_target","general":"controller.animation.ns_x.general"},
 "particle_effects":{"step":"ns:x_dust"},"sound_effects":{"bite":"ns.x.bite"}}}}
```
- animation.common.look_at_target drives the bone named `head` [vr].
- scripts.animate needs format 1.10.0 or later; the `animation_controllers` field is 1.8.0 only.
- Materials: entity, entity_alphatest (cut-outs), entity_alphablend, entity_emissive. Names are unverifiable since 1.26.5101, because the material files are zero bytes.
- BP side: collision_box is in blocks; minecraft:scale scales the render.
- Don't copy the wizard's 1.16.0 behaviour files or its "enable GameTest" advice (b6 #27).

### 5.3 Animation controllers (1.10.0)
```
"controller.animation.ns_x.general":{"initial_state":"idle","states":{
 "idle":{"animations":["idle"],"transitions":[{"attack":"q.is_delayed_attacking"}],"blend_transition":0.2,"blend_via_shortest_path":true},
 "attack":{"animations":["attack"],"transitions":[{"idle":"q.all_animations_finished"}],"blend_transition":0.2,"blend_via_shortest_path":true,
  "particle_effects":[{"effect":"step","locator":"mouth"}]}}}
```
- States use SHORT names (b5 #28 [13:17]).
- Put blend_transition (and blend_via_shortest_path) on EVERY state [vr]. The creeper tutorial's idle -> walk snapped without it.
- Controller-state particle_effects with a locator are vanilla practice and proven.
- Prefer a speed-weighted walk in animate over a walk state. Use states for modes (glide/flap, idle/attack, ridden/free).
- q.all_animations_finished is unverified here.

### 5.4 Keyframe events
Blockbench writes [bb]:
```
"particle_effects":{"0.25":{"effect":"step","locator":"foot_l","pre_effect_script":"v.x = 1;"}}
"sound_effects":{"0.2917":{"effect":"bite"}}
"timeline":{"0.4167":"v.hit = 1;"}
```
- An empty effect is dropped on export, which is why b5 #33 got {}.
- `effect` is the SHORT name from the entity's maps. Sound ids live in sound_definitions.json; particle ids come from the particle file's description.identifier.
- Put locators on the moving bone.
- Unverified in game: vanilla never uses animation-level effects. Controller-state effects are the proven path, so test one keyframe event first. Events re-fire every loop.

### 5.5 Render controllers
- Default = controller.render.default. Write your own only for swaps and layers.
- Texture arrays: "arrays":{"textures":{"Array.skins":["Texture.a",...]}}, "textures":["Array.skins[query.variant]"] (cat). Geometry arrays: Array.geos[query.is_sheared] (sheep) [vr].
- Layers: several textures with a layering material (villager_v2 uses Material.masked), or more render controllers [vr].
- Other keys: part_visibility, overlay_color, uv_anim, light_color_multiplier, ignore_lighting, is_hurt_color / on_fire_color, filter_lighting.
- Every Texture.<key> must exist in the entity's textures map.

### 5.6 Seats and rideables [vr]
- minecraft:rideable keys: seat_count, family_types ["player"], interact_text, crouching_skip_interact; seats {position, min_rider_count, max_rider_count, lock_rider_rotation, rotate_rider_by, third_person_camera_radius, camera_relax_distance_smoothing}; dismount_mode "on_top_center", on_rider_enter_event / on_rider_exit_event, pull_in_entities.
- Seat height sits 0.1-0.5 blocks under the saddle surface. Pig: box 0.9, seat 0.63. Horse seat 1.1. Camel 1.905 on a 2.375 box. Tune with the seat_position plugin.
- Steering: ground input_ground_controlled (horse); item item_controllable + behavior.controlled_by_player + boostable (pig).
- Rider pose is the player's sit and can't be changed. Options (b6 #36 [9:33]): rotate_rider_by -90, a lower seat, or hide the rider and draw a posed stand-in.
- Rig: root > body (seat locator) + truck_front > wheels + truck_back. Visible bounds count the rider. A creature mount gets a `saddle` bone at the seat, and drops head-look while q.has_rider.

### 5.7 Attachables
- Vanilla chestplate: minecraft:attachable 1.10.0 with item, materials (armor / armor_enchanted), textures (+ glint), geometry.player.armor.chestplate, parent_setup "variable.chest_layer_visible = 0.0;", animation.armor.chestplate.offset.
- Armour geometry uses the WEARER's bone names. Put your cubes in child bones (b6 #7 [1:02]).
- Held items: a root_item bone posed by first_person_hold / third_person_hold (b6 #7 [4:48]).
- One shipped pack found attachable animations inert in six probes and shipped none; a later pack made them work. Test one attachable animation in game before building many.

### 5.8 Why a model breaks: checklist
Nothing renders
- Parse failure: comment keys, BOM, trailing comma, smart quotes. (The game tolerates `//` comments, but many tools don't; leave them out.)
- Unknown BP component or wrong value shape.
- Wrong client format: scripts.animate below 1.10.0, or animation_controllers at 1.10.0.
- Undefined render controller. Block geometry outside models/blocks. BP and RP id sets don't match. geometry.default unresolved.
- Missing bone parent, duplicate bone names, or a negative size. visible_bounds too small. Wrong material name.

Magenta/black: texture path has .png, backslashes, wrong case, or the file is missing; or a render controller names a Texture key missing from the map.

Renders wrong
- PNG size differs from texture_width/height. UV off the sheet or overlapping. Coplanar cubes z-fighting.
- Not built facing -Z (check: the head centroid z should be less than the body's).
- Left/right twins renumbered. Transparent pixels on an opaque material. Mirrored rest rotations pointing the wrong way.

Bind pose only
- An animation names a missing bone, or an `animations` value is undefined. Animations declared but none played. A short name is missing from `animations`.
- Controller initial_state or a transition target is not a state. A borrowed animation reads a variable nothing sets.
- A bare-number keyframe ("scale": 1.5, which Blockbench writes).
- Walk never plays because q.modified_move_speed is tiny.
- Loop seam: last key differs from first, or last time differs from animation_length.
- Mirrored gait forgot to negate Y or Z (check: right = left shifted L/2 with [x,-y,-z], within 0.5 degrees).

Effects missing: effect not a key of the maps; locator undefined; particle or sound id undefined; empty {} maps.

Packs not applied: reused uuids, or BP dependency differs from RP header uuid. Deployed to the UWP com.mojang folder; the GDK build reads %APPDATA%\Minecraft Bedrock. Edits not picked up by a running world: re-enter it.

Guards worth building
- `scripts/check-pack.mjs` in this plugin covers: strict JSON parse, BP/RP id parity, geometry and texture resolution, short-name and controller-state resolution, bone existence, texture size, UV bounds, loop seams and manifest UUID parity.
- Not covered by the checker, so check by hand or by a project script: visible bounds cover the animated extent; left/right twins match; alpha scan on opaque materials; mirrored tracks match; locators named in effects exist on a bone; no empty effect maps.

