---
name: bedrock-blockbench
description: Use when modelling, rigging, texturing or animating Minecraft Bedrock entities, blocks or attachables in Blockbench, or when writing .geo.json, .animation.json, animation controllers, render controllers or client entity files by hand or by script.
---

# Blockbench for Bedrock

Read the reference file for the task before writing numbers into a file:

| Task | Read |
|---|---|
| Building a rig: bone hierarchy, pivots, names, mirroring, big models, visible bounds | `references/rigging.md` |
| Writing .geo.json by script, Box UV footprints, placeholder or final textures, flipbooks | `references/geometry-and-textures.md` |
| Idle, walk (biped, quadruped, spider), wings, glide, attacks, impacts, tails, mounts; Molang | `references/animation-recipes.md` |
| Client entity, animation controllers, keyframe effects, render controllers, seats, attachables, "why is it invisible / pink / in bind pose" | `references/wiring-and-debugging.md` |
| Guiding a person through the Blockbench app, Entity Wizard, mctools.dev, plugins, driving web Blockbench from script | `references/tools.md` |

## The ten rules that cause most broken models

1. **File space:** 16 units = 1 block, model faces **-Z (north)**, the mob's left is **+X**, feet at y=0, centred on x=0/z=0. `origin` and `pivot` are absolute model-space pixels.
2. **Blockbench panels are X-mirrored relative to the file.** Export writes cube origin `[-to.x, from.y, from.z]`, pivot `[-x,y,z]`, rotation `[-rx,-ry,rz]`; keyframes export as rotation `[-x,-y,z]`, position `[-x,y,z]`. Convert any number read off a video or the UI before it goes into JSON. All recipes in the references are already in file values.
3. **Only bones animate.** Every cube sits in a named bone; an empty `root` bone at 0,0,0 carries whole-body motion.
4. **Legs hang off `root`, as siblings of `body`,** so a body lean or breath never lifts the feet. If a rig has legs under body, animate a `chest` child instead of body.
5. **Pivot on the hinge:** top centre of a leg, neck base for the head, 1-2 px below the top of an arm. Pivots don't follow resizes.
6. **Names are a contract:** lower snake_case, unique, `left_*`/`right_*`. Bones named `head` get `animation.common.look_at_target`. Flip X can renumber children, so mirror by structure, not by string swap.
7. **Walk is weighted, not a boolean:** drive legs from `q.modified_distance_moved * 38.17` in Molang and add `{"walk": "math.clamp(q.modified_move_speed * 2.5, 0, 1)"}` to `scripts.animate`. Raw speed is tiny for slow walkers.
8. **Loops:** last keyframe equals the first and sits exactly at `animation_length`; one-shots use `"loop": "hold_on_last_frame"`. Molang trig takes degrees; Molang has no `%` (use `math.mod`).
9. **`texture_width/height` must equal the PNG,** paths have no extension, forward slashes, exact case. Opaque materials render alpha-0 pixels black; cut-outs need `entity_alphatest`.
10. **The game never reports broken string joins:** BP identifier = RP identifier; `geometry.default` names a real geo; `scripts.animate` and controller states name keys of `animations`; effect names are keys of `particle_effects`/`sound_effects`; locators exist. Run the checker (below) every time.

## Workflow

1. Pick a vanilla donor by its animation set and behaviour (see `references/tools.md`), or start from the rig templates in `references/rigging.md`.
2. Block out at whole-pixel sizes (quarter pixels at worst), 22.5-degree rest rotations, front toward -Z.
3. Rig: root > body > head, legs under root; chains nested segment by segment with pivots at each base.
4. UV: Box UV for vanilla-style mobs; lay out islands with no overlap; generate the texture from the geo's own UVs.
5. Texture: 4-5 tone hue-shifted ramps, light from the upper left, no pure black or white, 16 px per block next to vanilla.
6. Animate: idle (Molang on `q.life_time`), walk (distance-driven Molang), then one-shots through a controller with `blend_transition` on every state.
7. Wire: client entity (format 1.10.0), render controller (`controller.render.default` unless swapping textures), sounds and particles.
8. Check: `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <BP> <RP>`, then test in game with the content log open.

## Performance

- Blocks: at most ~50 cubes per block model. Block textures and item icons at most 256x256; entity textures stay under 2048x2048, and vanilla-sized mobs use 64x64 or 128x128.
- Every texture variant is another full copy in memory; prefer one texture plus scale or a small overlay for babies and colour morphs, or one atlas with `uv_anim`.
- Large showpiece models are fine at 16 units/block (one tested model had 954 cubes and ~90 bones), but drop tip bones on mobs that appear in crowds.
