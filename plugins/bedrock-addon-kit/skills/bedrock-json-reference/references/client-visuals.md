# Particles, cameras, visuals, resource files

Generated 2026-10-26 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/client_particles, camera, visual, resource, client_misc, client_deferred_rendering). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Components (12)

`minecraft:atmosphere_settings`, `minecraft:color_grading_identifier`, `minecraft:color_grading_settings`, `minecraft:dimension_bounds`, `minecraft:generation`, `minecraft:geometry`, `minecraft:lighting_settings`, `minecraft:pbr_fallback_settings`, `minecraft:point_light_settings`, `minecraft:shadow_settings`, `minecraft:water_identifier`, `minecraft:water_settings`

### minecraft:atmosphere_settings

Customize atmospherics effects

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | format_version |
| `minecraft:atmosphere_settings` |  |  | minecraft:atmosphere_settings |

### minecraft:color_grading_identifier

Set the identifier used for color grading in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Color Grading JSON schemas under the "color_grading" directory. Biomes without this component will have default color_grading settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color_grading_identifier` |  |  | **required**. Identifier of color_grading definition to use |

### minecraft:color_grading_settings

Minecraft's color grading system allows for many degrees of customization of the final image. You can control the saturation, contrast, gain, and offset of pixels per RGB channel. This can be done on a global scale regardless of pixel luminance, or it can be done on a more fine-grained scale with unique sets of parameters for shadows, midtones and highlights.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | format_version |
| `minecraft:color_grading_settings` |  |  | minecraft:color_grading_settings |

### minecraft:dimension_bounds

_since 1.21.40_

Defines the min and max height bounds for a dimension.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | Max |
| `min` | int |  | Min |

### minecraft:generation

Specifies the world generation type.

| Field | Type | Default | Notes |
|---|---|---|---|
| `generator_type` | string |  | Generator Type |

### minecraft:geometry

Specifies the geometry description identifier to use to render this block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | The geometry description identifier to use to render this block. This identifier must match an existing geometry identifier in any of the currently loaded resource packs. |
| `bone_visibility` | keyedBooleanCollection |  | Defines the visibility of individual bones in the geometry file. Note that all bones default to 'true,' so bones should only be defined if they are being set to 'false.' Including bones set to 'true' will work the same as the default. |

### minecraft:lighting_settings

Lighting Settings

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | format_version |
| `minecraft:lighting_settings` |  |  | minecraft:lighting_settings |

### minecraft:pbr_fallback_settings

Struct PBRFallbackConfig PBRFallbackConfigSettings Client Deferred Rendering

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | format_version |
| `minecraft:pbr_fallback_settings` |  |  | minecraft:pbr_fallback_settings |

### minecraft:point_light_settings

Struct PointLightConfig PointLightConfigSettings Client Deferred Rendering

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | format_version |
| `minecraft:point_light_settings` |  |  | minecraft:point_light_settings |

### minecraft:shadow_settings

Struct ShadowStylizationConfig ShadowStylizationConfigSettings Client Deferred Rendering

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | format_version |
| `minecraft:shadow_settings` |  |  | minecraft:shadow_settings |

### minecraft:water_identifier

Set the identifier used for rendering water in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Water JSON schemas under the "water" directory. Biomes without this component will have default water settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `water_identifier` |  |  | **required**. Identifier of water definition to use |

### minecraft:water_settings

Struct WaterConfig WaterConfigSettingsV1 Client Deferred Rendering

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | [editor(readonly:true)] |
| `minecraft:water_settings` |  |  | minecraft:water_settings |

## Documents and sub-objects (100)

### Color Proxy (color_proxy)

Defines color gradients with smooth interpolation for particle effects. Use this to create particles that change color over their lifetime—from bright flames fading to smoke, magical auras shifting hues, or explosion flashes dimming over time. The gradient maps time points to colors, while the interpolant expression controls which color to sample.

| Field | Type | Default | Notes |
|---|---|---|---|
| `gradient` | keyedStringCollection |  | **required**. Gradient |
| `interpolant` | keyedStringCollection |  | **required**. Interpolant |

### DirectionSettings Proxy (directionsettings_proxy)

Controls the initial direction and velocity of emitted particles. Direction settings determine whether particles spray outward from the emitter, inward toward its center, or follow a custom vector defined by Molang expressions. This affects effects like explosions (outward), implosions (inward), or directional streams like breath attacks and water flows.

| Field | Type | Default | Notes |
|---|---|---|---|
| `custom_direction` | keyedStringCollection |  | Custom Direction |
| `min_speed_threshold` | float | `0` | Min Speed Threshold |
| `mode` | stringEnum |  | **required**. Mode Values: `custom`, `derive_from_velocity`. |

### emitter_initialization (emitter_initialization)

Defines Molang expressions that run when the emitter is created and on each update. Useful for initializing and updating emitter variables.

| Field | Type | Default | Notes |
|---|---|---|---|
| `creation_expression` | molang | `0` | Molang expression run once when the emitter is created. Use this to initialize variables. |
| `per_update_expression` | molang | `0` | Molang expression run each frame while the emitter is active. Use this to update variables based on time or other conditions. |

### emitter_lifetime_events proxy (emitter_lifetime_events_proxy)

Controls emitter lifetime events like creation and expiration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `creation_event` | stringArray | `[]` | Creation Event |
| `expiration_event` | stringArray | `[]` | Expiration Event |
| `looping_travel_distance_events` | objectArray | `[]` | Looping Travel Distance Events See `client_particles/emitter_lifetime_events_travel_distance_events`. |
| `timeline` | stringArray | `{}` | Timeline |
| `travel_distance_events` | stringArray | `{}` | Travel Distance Events |

### emitter_lifetime_events travel_distance_events (emitter_lifetime_events_travel_distance_events)

Triggers particle events when the emitter has traveled a specified distance. Useful for trail effects that change behavior—such as a projectile leaving a smoke trail that intensifies as it travels, or a mob's footsteps spawning dust particles at regular intervals as it walks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `distance` | float |  | **required**. Distance |
| `effects` | stringArray |  | **required**. Effects |

### emitter_lifetime_expression (emitter_lifetime_expression)

Controls when the emitter activates and expires using Molang expressions. The activation expression starts particle emission when it evaluates to non-zero, and the expiration expression stops it. This enables dynamic effects tied to entity state—like flames that only appear when an entity is on fire, or magic particles that pulse with the caster's mana.

| Field | Type | Default | Notes |
|---|---|---|---|
| `activation_expression` | molang | `1` | When the expression is non-zero, the emitter is activated. Can be a number or Molang expression. |
| `expiration_expression` | molang | `0` | When the expression is non-zero, the emitter expires. Can be a number or Molang expression. |

### emitter_lifetime_looping (emitter_lifetime_looping)

Creates repeating particle effects that cycle between active and dormant phases. The emitter runs for the active_time duration, pauses for sleep_time, then repeats indefinitely. Perfect for ambient effects like bubbling cauldrons, flickering torches, pulsing enchantment glows, or creature breathing animations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `active_time` | molang | `0` | The time in seconds that the emitter is active. Can be a number or Molang expression. |
| `sleep_time` | molang | `0` | The time in seconds that the emitter sleeps between active periods. Can be a number or Molang expression. |

### emitter_lifetime_once (emitter_lifetime_once)

Creates a single-burst particle effect that runs once and stops. The emitter activates for the specified active_time duration, emits particles, then terminates. Ideal for impact effects like explosions, block breaking, critical hits, potion splashes, and other momentary visual feedback.

| Field | Type | Default | Notes |
|---|---|---|---|
| `active_time` | molang | `0` | The time in seconds that the emitter is active. Can be a number or Molang expression. |

### emitter_local_space proxy (emitter_local_space_proxy)

Controls whether particles inherit emitter position and rotation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `position` | boolean | `false` | Position |
| `rotation` | boolean | `false` | Rotation |
| `velocity` | boolean | `false` | Velocity |

### emitter_rate_instant (emitter_rate_instant)

Spawns all particles in a single instant burst when the emitter activates. Unlike steady emission that spawns particles over time, this creates an immediate cloud of particles—perfect for explosions, block destruction debris, potion splash impacts, ender teleportation effects, and any effect that needs an instantaneous particle release.

| Field | Type | Default | Notes |
|---|---|---|---|
| `num_particles` | molang |  | **required**. The number of particles to emit. Can be a number or Molang expression. |

### emitter_rate_manual (emitter_rate_manual)

Allows manual control over particle emission through events rather than automatic spawning. Particles are only created when explicitly triggered via Molang or particle events, up to the max_particles limit. Useful for effects that should only spawn under specific conditions, like damage indicators, pickup sparkles, or script-controlled visual feedback.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_particles` | molang |  | **required**. The maximum number of particles that can exist at once. Can be a number or Molang expression. |

### emitter_rate_steady (emitter_rate_steady)

Continuously spawns particles at a consistent rate over time. The spawn_rate controls how many particles appear per second, while max_particles limits the total active count. This is the most common emission mode, used for ongoing effects like torch flames, mob auras, weather effects, potion bubbles, and ambient environmental particles.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_particles` | molang |  | **required**. The maximum number of particles that can exist at once. Can be a number or Molang expression. |
| `spawn_rate` | molang |  | **required**. The number of particles to spawn per second. Can be a number or Molang expression. |

### emitter_shape_box (emitter_shape_box)

Emits particles from random positions within a rectangular box volume. Define the box using half_dimensions (distance from center to each edge) and offset from the emitter. Particles can emit outward from spawn points, inward toward center, or in custom directions. Ideal for area effects like smoke filling a room, rain in a region, or magic barriers.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | string |  | The direction of particle emission. Can be a string ('inwards' or 'outwards'), or an array of [x, y, z] Molang expressions. |
| `half_dimensions` | molangArray |  | **required**. The half dimensions of the box, as [x, y, z] Molang expressions or numbers. |
| `offset` | molangArray | `[0,0,0]` | The offset from the emitter position, as [x, y, z] Molang expressions or numbers. |
| `surface_only` | boolean | `false` | Surface Only |

### emitter_shape_custom (emitter_shape_custom)

Emits particles from positions calculated by custom Molang expressions. Unlike preset shapes, this gives complete control over spawn locations using math expressions that can create rings, spirals, waves, or any procedural pattern. Use the offset expressions to define X, Y, Z coordinates relative to the emitter for complex artistic effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | molangArray | `[0,0,0]` | The direction of particle emission, as [x, y, z] Molang expressions or numbers. |
| `offset` | molangArray | `[0,0,0]` | The offset from the emitter position, as [x, y, z] Molang expressions or numbers. |

### emitter_shape_disc (emitter_shape_disc)

Emits particles from random positions on a flat circular disc. Configure the radius and plane normal to control disc size and orientation. Surface_only restricts spawns to the disc edge for ring effects. Perfect for ground-based effects like summoning circles, shockwaves, splash impacts, and aura rings around entities.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | string |  | The direction of particle emission. Can be a string ('inwards' or 'outwards'), or an array of [x, y, z] Molang expressions. |
| `offset` | molangArray | `[0,0,0]` | The offset from the emitter position, as [x, y, z] Molang expressions or numbers. |
| `plane_normal` | string | `[0,1,0]` | The normal vector of the disc plane. Can be 'x', 'y', 'z', or an array of [x, y, z] values. |
| `radius` | molang | `1` | The radius of the disc. Can be a number or Molang expression. |
| `surface_only` | boolean | `false` | Surface Only |

### emitter_shape_entity_aabb (emitter_shape_entity_aabb)

Emits particles from random positions within the attached entity's axis-aligned bounding box. The emission volume automatically scales with entity size, making it perfect for body-covering effects like burning, freezing, poison clouds, healing auras, or damage feedback that should wrap around creatures of any size.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | string |  | The direction of particle emission. Can be a string ('inwards' or 'outwards'), or an array of [x, y, z] Molang expressions. |
| `surface_only` | boolean | `false` | Surface Only |

### emitter_shape_point (emitter_shape_point)

Emits all particles from a single point in space, offset from the emitter origin. This is the simplest and most common emission shape—all particles spawn at the same location and spread outward based on their initial velocity. Used for torches, candles, sparks, magic projectile cores, and any effect with a focused emission source.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | molangArray |  | The direction of particle emission, as [x, y, z] Molang expressions. |
| `offset` | molangArray | `[0,0,0]` | The offset from the emitter position, as [x, y, z] Molang expressions. |

### emitter_shape_sphere (emitter_shape_sphere)

Emits particles from random positions within a spherical volume. Configure the radius to set sphere size and surface_only to restrict spawns to the outer shell. Direction can be inward, outward, or custom. Ideal for explosions, magical orbs, bubble columns, mob spawn effects, and any effect needing uniform 3D distribution.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | string |  | The direction of particle emission. Can be a string ('inwards' or 'outwards'), or an array of [x, y, z] Molang expressions. |
| `offset` | molangArray | `[0,0,0]` | The offset from the emitter position, as [x, y, z] Molang expressions or numbers. |
| `radius` | molang | `1` | The radius of the sphere. Can be a number or Molang expression. |
| `surface_only` | boolean | `false` | Surface Only |

### Molang expression (molang_expression)

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | **required**. Expression |
| `version` | int |  | **required**. Version |

### particle_appearance_billboard (particle_appearance_billboard)

Controls how particle sprites render and orient toward the camera. The facing_camera_mode determines billboard behavior: 'lookat_xyz' always faces the camera (classic sprites), 'rotate_y' only rotates vertically (tall flames), and direction modes align with particle velocity (arrows, sparks). Size controls particle dimensions using Molang for dynamic scaling.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | object |  | Direction |
| `facing_camera_mode` | string |  | The facing mode of the billboard. Controls how the particle faces the camera. Values: `lookat_xyz`, `lookat_y`, `lookat_direction`, `rotate_xyz`, `rotate_y`, `direction_x`, `direction_y`, `direction_z`, `emitter_transform_xy`, `emitter_transform_xz`, `emitter_transform_yz`. |
| `size` | molangArray |  | **required**. The size of the particle billboard, as [width, height] using Molang expressions or numbers. |
| `uv` | object |  | Uv |

### particle_appearance_billboard flipbook_data (particle_appearance_billboard_flipbook_data)

Enables sprite sheet animation for particle billboards, cycling through frames over the particle's lifetime. Configure the texture grid dimensions, animation speed, and whether to loop or stretch timing. Essential for animated particles like animated flames, water splashes with frames, explosion sequences, and any particle using multi-frame textures.

| Field | Type | Default | Notes |
|---|---|---|---|
| `base_UV` | keyedStringCollection |  | **required**. Base UV |
| `frames_per_second` | float | `0` | Frames Per Second |
| `loop` | boolean | `false` | Loop |
| `max_frame` | keyedStringCollection |  | **required**. Max Frame |
| `size_UV` | numberArray | `[1,1]` | Size UV |
| `step_UV` | numberArray | `[0,0]` | Step UV |
| `stretch_to_lifetime` | boolean | `false` | Stretch To Lifetime |

### particle_appearance_billboard_flipbook_data_1.21.0 (particle_appearance_billboard_flipbook_data_1.21.0)

Particle Appearance Billboard Flipbook Data 1.21.0 Misc

| Field | Type | Default | Notes |
|---|---|---|---|
| `base_UV` |  |  | base_UV |
| `size_UV` |  |  | size_UV |
| `step_UV` |  |  | step_UV |
| `max_frame` |  |  | max_frame |
| `loop` | boolean |  | loop |
| `frames_per_second` | float |  | frames_per_second |
| `stretch_to_lifetime` | boolean |  | stretch_to_lifetime |

### particle_appearance_tinting (particle_appearance_tinting)

Applies color tinting to particle textures, from simple solid colors to complex gradients. Use hex colors for static tints, RGBA arrays with Molang for dynamic colors, or gradient objects to blend between colors over particle lifetime. Essential for flames fading orange-to-gray, magical auras shifting colors, or any effect needing color variation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color` | molangArray |  | **required**. The color of the particle, can be a hex color string (like '#RRGGBB'), an array of [r, g, b, a] values (numbers or Molang), or an object with gradient and interpolant. |

### particle_curve_bezier_chain (particle_curve_bezier_chain)

Creates smooth, organic animation curves using chained bezier segments. Unlike linear curves, bezier chains produce natural-feeling motion with acceleration and deceleration. Define control nodes that the curve passes through, with automatic smooth interpolation between them. Used for lifelike particle behaviors like gentle floating, heartbeat pulses, or wind gusts.

| Field | Type | Default | Notes |
|---|---|---|---|
| `input` | keyedStringCollection |  | **required**. Input |
| `nodes` | object |  | **required**. Nodes |
| `type` | string |  | **required**. Type |

### particle_curve_bezier_chain node_proxy (particle_curve_bezier_chain_node_proxy)

Defines a control point in a bezier chain curve, specifying position and slope at that point. Multiple nodes chain together to create smooth curves for animating particle properties over time. Each node's slope controls how smoothly values transition to neighboring nodes, enabling organic motion like bobbing, pulsing, or easing effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `left_slope` | float |  | Left Slope |
| `left_value` | float |  | Left Value |
| `right_slope` | float |  | Right Slope |
| `right_value` | float |  | Right Value |
| `slope` | float |  | Slope |
| `value` | float |  | Value |

### particle_curve_linear (particle_curve_linear)

Creates animation curves using linear interpolation between keyframe values. Define input range and corresponding output values; the curve linearly blends between adjacent keyframes. Simpler than bezier curves but effective for straightforward animations like size growing, alpha fading, or color shifting over particle lifetime.

| Field | Type | Default | Notes |
|---|---|---|---|
| `horizontal_range` | keyedStringCollection | `1` | Horizontal Range |
| `input` | keyedStringCollection |  | **required**. Input |
| `nodes` | keyedStringCollection |  | **required**. Nodes |
| `type` | string |  | **required**. Type |

### particle_document (particle_document)

A resource pack particle effect definition document for Minecraft Bedrock Edition. This describes the complete JSON file structure including format_version and the particle_effect wrapper. Particles use a component-based system with emitters controlling spawn rate and shape, and particle components controlling appearance and motion.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of this particle effect file. Use '1.10.0' or later for the modern particle system. |
| `particle_effect` | object |  | **required**. The particle effect definition containing description and components. See `client_particles/particle_effect`. |

### particle_effect (particle_effect)

Defines a particle effect that can be spawned by entities, blocks, or scripts. Particle effects use a component-based system with emitters (controlling spawn rate and shape), appearance (billboard rendering and colors), and motion (physics and collision).

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | **required**. Components See `client_particles/particle_effect_component`. |
| `curves` | object |  |  |
| `description` | object |  | **required**. The description MUST contain an identifier and basic_render_parameters. See `client_particles/particle_effect_description`. |
| `events` | object |  | Events See `client_particles/particle_event_node`. |

### particle_effect basic_render_parameters (particle_effect_basic_render_parameters)

The parameters MUST contain a material and texture.

| Field | Type | Default | Notes |
|---|---|---|---|
| `material` | string |  | **required**. The material used for rendering the particle effect. |
| `texture` | string |  | **required**. The texture path used for the particle effect. |

### particle_effect component (particle_effect_component)

Container for all particle effect components that define behavior and appearance. Components control every aspect of particle effects: emitter shape and rate, particle lifetime and motion, visual appearance and colors, collision responses, and event triggers. Combine components to build complex effects from reusable, modular pieces.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:emitter_initialization` | object |  | Minecraft Emitter Initialization See `client_particles/emitter_initialization`. |
| `minecraft:emitter_lifetime_events` | object |  | Minecraft Emitter Lifetime Events |
| `minecraft:emitter_lifetime_expression` | object |  | Minecraft Emitter Lifetime Expression See `client_particles/emitter_lifetime_expression`. |
| `minecraft:emitter_lifetime_looping` | object |  | Minecraft Emitter Lifetime Looping See `client_particles/emitter_lifetime_looping`. |
| `minecraft:emitter_lifetime_once` | object |  | Minecraft Emitter Lifetime Once See `client_particles/emitter_lifetime_once`. |
| `minecraft:emitter_local_space` | object |  | Minecraft Emitter Local Space |
| `minecraft:emitter_rate_instant` | object |  | Minecraft Emitter Rate Instant See `client_particles/emitter_rate_instant`. |
| `minecraft:emitter_rate_manual` | object |  | Minecraft Emitter Rate Manual See `client_particles/emitter_rate_manual`. |
| `minecraft:emitter_rate_steady` | object |  | Minecraft Emitter Rate Steady See `client_particles/emitter_rate_steady`. |
| `minecraft:emitter_shape_box` | object |  | Minecraft Emitter Shape Box See `client_particles/emitter_shape_box`. |
| `minecraft:emitter_shape_custom` | object |  | Minecraft Emitter Shape Custom See `client_particles/emitter_shape_custom`. |
| `minecraft:emitter_shape_disc` | object |  | Minecraft Emitter Shape Disc See `client_particles/emitter_shape_disc`. |
| `minecraft:emitter_shape_entity_aabb` | object |  | Minecraft Emitter Shape Entity Aabb See `client_particles/emitter_shape_entity_aabb`. |
| `minecraft:emitter_shape_point` | object |  | Minecraft Emitter Shape Point See `client_particles/emitter_shape_point`. |
| `minecraft:emitter_shape_sphere` | object |  | Minecraft Emitter Shape Sphere See `client_particles/emitter_shape_sphere`. |
| `minecraft:particle_appearance_billboard` | object |  | Minecraft Particle Appearance Billboard See `client_particles/particle_appearance_billboard`. |
| `minecraft:particle_appearance_lighting` | object |  | Minecraft Particle Appearance Lighting |
| `minecraft:particle_appearance_tinting` | object |  | Minecraft Particle Appearance Tinting See `client_particles/particle_appearance_tinting`. |
| `minecraft:particle_expire_if_in_blocks` | stringArray |  | List of block identifiers. Particles will expire when they are in any of these blocks. |
| `minecraft:particle_expire_if_not_in_blocks` | stringArray |  | List of block identifiers. Particles will expire when they are NOT in any of these blocks. |
| `minecraft:particle_initial_speed` | molang |  | The initial speed of particles. Can be a number, Molang expression, or array of [x, y, z] speeds. |
| `minecraft:particle_initial_spin` | object |  | Minecraft Particle Initial Spin See `client_particles/particle_initial_spin`. |
| `minecraft:particle_initialization` | object |  | Minecraft Particle Initialization See `client_particles/particle_initialization`. |
| `minecraft:particle_kill_plane` | molangArray |  | A plane (A, B, C, D coefficients) that kills particles when they cross it. Defined as an array of 4 numbers [A, B, C, D] where Ax + By + Cz + D = 0. |
| `minecraft:particle_lifetime_events` | object |  | Minecraft Particle Lifetime Events |
| `minecraft:particle_lifetime_expression` | object |  | Minecraft Particle Lifetime Expression See `client_particles/particle_lifetime_expression`. |
| `minecraft:particle_motion_collision` | object |  | Minecraft Particle Motion Collision See `client_particles/particle_motion_collision`. |
| `minecraft:particle_motion_dynamic` | object |  | Minecraft Particle Motion Dynamic See `client_particles/particle_motion_dynamic`. |
| `minecraft:particle_motion_parametric` | object |  | Minecraft Particle Motion Parametric See `client_particles/particle_motion_parametric`. |

### particle_effect description (particle_effect_description)

The description MUST contain an identifier and basic_render_parameters.

| Field | Type | Default | Notes |
|---|---|---|---|
| `basic_render_parameters` | object |  | **required**. The parameters MUST contain a material and texture. See `client_particles/particle_effect_basic_render_parameters`. |
| `identifier` | string |  | **required**. Identifier |

### particle_event_node (particle_event_node)

Defines actions triggered by particle events like spawning, collision, or expiration. Event nodes can run Molang expressions to modify variables, spawn nested particle effects, play sounds, or control emitter state. Chain multiple effects together for complex reactions like explosions spawning secondary debris particles.

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | keyedStringCollection | `0` | Expression |
| `log` | string | `""` | Log |
| `particle_effect` | object | `{"effect":"","pre_effect_expression":0,"type":null}` | Particle Effect See `client_particles/particle_visual_effect_event`. |
| `randomize` | objectArray |  | Randomize See `client_particles/particle_event_random_node`. |
| `sequence` | objectArray |  | Sequence See `client_particles/particle_event_node`. |
| `sound_effect` | object |  | Sound Effect See `client_particles/particle_sound_effect_event`. |

### particle_event_random_node (particle_event_random_node)

Triggers one of several possible effects randomly when a particle event fires, with weighted probability. Assign weights to different event outcomes for varied responses—like impacts sometimes spawning sparks, sometimes dust, with configurable chances. Adds natural variation to effects without needing complex Molang logic.

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | keyedStringCollection | `0` | Expression |
| `log` | string | `""` | Log |
| `particle_effect` | object | `{"effect":"","pre_effect_expression":0,"type":null}` | Particle Effect See `client_particles/particle_visual_effect_event`. |
| `randomize` | objectArray |  | Randomize See `client_particles/particle_event_random_node`. |
| `sequence` | objectArray |  | Sequence See `client_particles/particle_event_node`. |
| `sound_effect` | object |  | Sound Effect See `client_particles/particle_sound_effect_event`. |
| `weight` | float |  | **required**. Weight |

### particle_initial_spin (particle_initial_spin)

Sets the starting rotation angle and spin velocity for each particle. Initial rotation provides random orientation variety, while spin_rate creates continuous rotation during the particle's lifetime. Use for debris that tumbles, leaves spinning as they fall, sparks that twist, or any particle needing rotational motion.

| Field | Type | Default | Notes |
|---|---|---|---|
| `rotation` | keyedStringCollection | `0` | Rotation |
| `rotation_rate` | keyedStringCollection | `0` | Rotation Rate |

### particle_initialization (particle_initialization)

Runs Molang expressions when each individual particle spawns to initialize per-particle variables. Unlike emitter_initialization which runs once per emitter, this executes for every particle—enabling randomized properties, unique trajectories, or per-particle state that persists through the particle's lifetime.

| Field | Type | Default | Notes |
|---|---|---|---|
| `per_render_expression` | keyedStringCollection | `0` | Per Render Expression |
| `per_update_expression` | keyedStringCollection | `0` | Per Update Expression |

### particle_lifetime_expression (particle_lifetime_expression)

Controls individual particle lifetimes using Molang expressions. The max_lifetime sets the absolute duration limit, while expiration_expression can terminate particles early when conditions are met (like leaving a certain area). Enables dynamic particle populations that respond to game state beyond simple time-based expiration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `expiration_expression` | molang | `0` | When the expression is non-zero, the particle expires. Can be a number or Molang expression. |
| `max_lifetime` | molang |  | The maximum lifetime of the particle in seconds. Can be a number or Molang expression. |

### particle_motion_collision (particle_motion_collision)

Enables particle collision with world geometry. Configure collision radius, bounce coefficient (how much velocity is retained), friction to slow sliding, and whether to expire on impact. Essential for physical particles like rain hitting ground, debris bouncing off surfaces, or arrows embedding in blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `coefficient_of_restitution` | float | `0` | Coefficient Of Restitution |
| `collision_drag` | float | `0` | Collision Drag |
| `collision_radius` | float |  | **required**. Collision Radius |
| `enabled` | keyedStringCollection | `1` | Enabled |
| `events` | objectArray |  | Events |
| `expire_on_contact` | boolean | `false` | Expire On Contact |

### particle_motion_collision_event (particle_motion_collision_event)

Defines the event triggered when a particle collides with a block or surface. Reference particle events by name to spawn secondary effects, play sounds, or modify particle state on impact. Creates reactive effects like sparks bouncing off walls, water droplets splashing, or projectile impacts spawning debris.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | **required**. Event |
| `min_speed` | float | `2` | Min Speed |

### particle_motion_dynamic (particle_motion_dynamic)

Applies physics simulation to particle movement including gravity, acceleration, and air resistance. Linear acceleration adds constant force (gravity pulls down, wind pushes sideways), while drag slows particles over time. Rotation acceleration and drag control spinning. Creates natural-feeling motion for smoke rising, debris falling, or leaves drifting.

| Field | Type | Default | Notes |
|---|---|---|---|
| `linear_acceleration` | molangArray | `[0,0,0]` | The linear acceleration of particles, as [x, y, z] Molang expressions or numbers. |
| `linear_drag_coefficient` | molang | `0` | The drag coefficient applied to particle motion. Can be a number or Molang expression. |
| `rotation_acceleration` | molang | `0` | The rotation acceleration. Can be a number or Molang expression. |
| `rotation_drag_coefficient` | molang | `0` | The rotation drag coefficient. Can be a number or Molang expression. |

### particle_motion_parametric (particle_motion_parametric)

Controls particle position and rotation using Molang expressions evaluated each frame, overriding physics simulation. Position is relative to emitter origin, allowing mathematical motion patterns like orbits, waves, spirals, or any path describable through equations. Ideal for magical effects, precise choreographed motion, or synchronized particle formations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | molangArray |  | Direction of particle motion, as [x, y, z] Molang expressions. |
| `relative_position` | molangArray |  | Position offset relative to the particle emitter, as [x, y, z] Molang expressions. |
| `rotation` | keyedStringCollection |  | Rotation |

### particle_sound_effect_event (particle_sound_effect_event)

Plays a sound effect when triggered by particle events like spawning, collision, or expiration. Reference sounds defined in sound_definitions.json using their identifier. Synchronizes audio with visual particle moments—sparks crackling, explosions booming, or magical effects chiming for immersive multi-sensory feedback.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event_name` | string |  | **required**. Event Name |

### particle_visual_effect_event (particle_visual_effect_event)

Spawns another particle effect when triggered by particle events, enabling cascading visual sequences. Reference other particle effects by identifier to create chains like explosions spawning embers, impacts creating dust clouds, or magical projectiles trailing sparkles. Builds complex layered effects from simpler reusable components.

| Field | Type | Default | Notes |
|---|---|---|---|
| `effect` | string |  | **required**. Effect |
| `pre_effect_expression` | keyedStringCollection | `0` | Pre Effect Expression |
| `type` | stringEnum |  | **required**. Type Values: `emitter`, `emitter_bound`, `particle`, `particle_with_velocity`. |

### ParticleLifetimeEvents Proxy (particlelifetimeevents_proxy)

Controls particle lifetime events like creation and expiration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `creation_event` | stringArray | `[]` | Creation Event |
| `expiration_event` | stringArray | `[]` | Expiration Event |
| `timeline` | stringArray |  | Timeline |

### UV Proxy (uv_proxy)

Controls UV texture mapping and flipbook animation for particles.

| Field | Type | Default | Notes |
|---|---|---|---|
| `flipbook` | object |  | Flipbook See `client_particles/particle_appearance_billboard_flipbook_data`. |
| `texture_height` | int | `1` | Texture Height |
| `texture_width` | int | `1` | Texture Width |
| `uv` | keyedStringCollection |  | Uv |
| `uv_size` | keyedStringCollection |  | Uv Size |

### cameraaimassistcategoriesdefinition (cameraaimassistcategoriesdefinition)

_since 1.21.70_

CameraAimAssistCategoriesDefinition

| Field | Type | Default | Notes |
|---|---|---|---|
| `categories` |  |  | List of categories used by Camera Aim-Assist 'minecraft:aim_assist_preset'. |

### cameraaimassistcategorydefinition (cameraaimassistcategorydefinition)

_since 1.21.70_

CameraAimAssistCategoryDefinition

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | Name of the Aim-Assist Category used during lookup. |
| `priorities` |  |  | The set of priorities used when determining aim-assist selection. |

### cameraaimassistcategorypriorities (cameraaimassistcategorypriorities)

_since 1.21.70_

CameraAimAssistCategoryPriorities

| Field | Type | Default | Notes |
|---|---|---|---|
| `entities` |  |  | Optional. Map of Entity identifiers to Aim-Assist targeting priority. Larger numbers have greater priority. |
| `blocks` |  |  | Optional. Map of Block identifiers to Aim-Assist targeting priority. Larger numbers have greater priority. |
| `block_default` | int |  | Optional. Default Aim-Assist targeting priority used for Blocks not found in 'blocks'. |
| `entity_default` | int |  | Optional. Default Aim-Assist targeting priority used for Entities not found in 'entities'. |

### cameraaimassistpresetdefinition (cameraaimassistpresetdefinition)

_since 1.21.70_

CameraAimAssistPresetDefinition

| Field | Type | Default | Notes |
|---|---|---|---|
| `item_settings` |  |  | Optional. Map of Item identifiers to Aim-Assist Category names found in the specified 'categories'. |
| `liquid_targeting_list` |  |  | Optional. List of item identifiers that will target liquid blocks with aim-assist when being held. |
| `identifier` | string |  | Namespaced identifier for Camera Aim-Assist preset. Namespace and name must be separated by a ':'. |
| `default_item_settings` | string |  | Optional. Default Aim-Assist Category used for Items not found in 'item_settings'. |
| `exclusion_list` |  |  | Optional. List of block/entity identifiers to exclude from aim assist targeting. |
| `hand_settings` | string |  | Optional. Aim-assist Category used for an empty hand. |

### minecraft_aim_assist_categories (minecraft_aim_assist_categories)

_since 1.21.70_

Aim Assist Categories

> Aim assist supports projectiles starting in 1.21.110.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | Version of the JSON schema for this file. Aim-assist categories requires at least version 1.21.50. |
| `minecraft:aim_assist_categories` |  |  | A single Camera Aim-Assist Categories Definition. |

### minecraft_aim_assist_preset (minecraft_aim_assist_preset)

_since 1.21.70_

Aim Assist Preset

> Aim assist supports projectiles starting in 1.21.110.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | Version of the JSON schema for this file. Aim-assist preset requires at least version 1.21.50. |
| `minecraft:aim_assist_preset` |  |  | A single Camera Aim-Assist Preset Definition. |

### actor_animation (actor_animation.v1.8.0)

Defines keyframe animations for entity bones. Animations can transform bones with position, rotation, and scale changes over time. They support timeline-based keyframes, Molang expressions, looping, and can be blended together using animation controllers.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `animations` | keyedObjectCollection |  | **required**. Animations |

### actor_animation_controller (actor_animation_controller.v1.10.0)

Animation controllers are state machines that control which animations play and when. They support states with animations, transitions based on Molang conditions, particle effects, and sound effects. Each state can blend between animations and trigger events on entry and exit.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `animation_controllers` | keyedObjectCollection |  | **required**. Animation Controllers |

### actor_resource_definition (actor_resource_definition.v1.10.0)

Defines an entity client resource definition document with format_version 1.10.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Specifies the format version of this client entity definition. Determines which features and syntax are available. |
| `minecraft:client_entity` | object |  | Defines the client-side rendering properties for an entity, including textures, geometry, animations, and render controllers. |
| `minecraft:attachable` | object |  | Attachable |

### actor_resource_definition (actor_resource_definition.v1.26.0)

_since 1.26.0_

> In format_version 1.26.0 and higher, the `pre_animation` and `initialize` Molang script fields on `minecraft:client_entity` support multi-line `{}` brace scope delimiters.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `minecraft:client_entity` | object |  | Client Entity |
| `minecraft:attachable` | object |  | Attachable |

### actor_resource_definition (actor_resource_definition.v1.8.0)

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `minecraft:(client_entity|attachable)` | object |  | **required**. (client Entity\|attachable) |

### block_reference (block_reference.v1.10.0)

Defines a block reference object as used by resource pack client definitions (format_version 1.10.0).

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | **required**. Name |
| `states` | object |  | **required**. States |

### chance_information (chance_information.v1.14.0)

Specifies a probability as a fraction with numerator and denominator (format_version 1.14.0).

| Field | Type | Default | Notes |
|---|---|---|---|
| `numerator` | int |  | **required**. Numerator |
| `denominator` | int |  | **required**. Denominator |

### geometry (geometry.v1.12.0)

Modern geometry format using the 'minecraft:geometry' array pattern. Supports per-face UV mapping, cube rotation, and improved locator definitions. This is the recommended format for new content.

| Field | Type | Default | Notes |
|---|---|---|---|
| `debug` | boolean |  | Debug |
| `format_version` | version |  | **required**. Format Version |
| `minecraft:geometry` | objectArray |  |  |

### geometry (geometry.v1.14.0)

Defines a geometry document (bones, cubes, and UV mappings) with format_version 1.14.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `debug` | boolean |  | Debug |
| `minecraft:geometry` | objectArray |  |  |

### geometry (geometry.v1.16.0)

Defines a geometry document (bones, cubes, and UV mappings) with format_version 1.16.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `debug` | boolean |  | Debug |
| `minecraft:geometry` | objectArray |  |  |

### geometry (geometry.v1.19.30)

Defines a geometry document (bones, cubes, and UV mappings) with format_version 1.19.30.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `debug` | boolean |  | Debug |
| `minecraft:geometry` | objectArray |  |  |

### geometry (geometry.v1.21.0)

Defines a geometry document (bones, cubes, and UV mappings) with format_version 1.21.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `debug` | boolean |  | Debug |
| `minecraft:geometry` | objectArray |  |  |

### geometry (geometry.v1.26.40)

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `debug` | boolean |  | Debug |
| `minecraft:geometry` | objectArray |  |  |

### geometry (geometry.v1.8.0)

Legacy geometry format using box-mapped UVs. This format uses the 'geometry.<name>' pattern for model definitions. For newer projects, consider using format version 1.12.0 or later which supports per-face UV mapping.

| Field | Type | Default | Notes |
|---|---|---|---|
| `debug` | boolean |  | Debug |
| `format_version` | version |  | **required**. Format Version |
| `geometry.[a-zA-Z0-9_.'-:]+` | object |  | **required**. + Geometry |
| `bones.reset` | boolean |  | deprecated. When true, resets the bone to its bind pose before applying animations. This property has been deprecated in newer geometry format versions. |
| `bones.inflate` | float |  | deprecated. Expands or shrinks the bone's cubes. This property has been deprecated in newer geometry format versions. |

### persona_actor_animation (persona_actor_animation.v1.8.0)

Defines a persona actor animation document with format_version 1.8.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `animations` | keyedObjectCollection |  | **required**. Animations |

### render_controller (render_controller.v1.8.0)

Render controllers define how entities are visually rendered, including which geometry, textures, and materials to use. They support arrays for dynamic selection based on Molang expressions, part visibility toggling, UV animations, and color tinting.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `render_controllers` | keyedObjectCollection |  | **required**. Render Controllers |

### texture_set (texture_set.v1.21.30)

Defines a PBR texture set document with format_version 1.21.30.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `minecraft:texture_set` | object |  | **required**. Texture Set |

### audio_item_properties (audio_item_properties)

Defines audio volume and weight settings for sound playback.

| Field | Type | Default | Notes |
|---|---|---|---|
| `definitions` | keyedObjectCollection |  |  |

### blocks_resource (blocks_resource)

The blocks.json file in a resource pack defines texture and sound mappings for blocks. Each block entry maps a block identifier to its visual and audio properties.

> This file uses block identifiers as dynamic keys. The format_version field is the only fixed field; all other properties are block-specific entries.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | The format version of the blocks.json file. Can be an array like [1, 1, 0] or a string like '1.1.0'. |

### flipbook_textures (flipbook_textures)

The flipbook_textures.json file defines animated textures for blocks. Each entry specifies a texture that cycles through frames at a specified rate. Located at textures/flipbook_textures.json in resource packs.

> This file is a JSON array at the root level, with each element being a flipbook texture definition.

Example (fire):
```json
{
 "flipbook_texture": "textures/blocks/fire_0",
 "atlas_tile": "fire_0",
 "ticks_per_frame": 3
}
```

### item_texture (item_texture)

The item_texture.json file defines the texture atlas for item textures. It maps texture names to texture file paths, allowing items to reference textures by name. Located at textures/item_texture.json in resource packs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `resource_pack_name` | string |  | **required**. The name of the resource pack this atlas belongs to. |
| `texture_name` | string | `"atlas.items"` | **required**. The name of the texture atlas. Typically 'atlas.items' for item textures. |
| `padding` | int |  | The padding in pixels between textures in the atlas to prevent bleeding. |
| `num_mip_levels` | int |  | The number of mipmap levels to generate for the atlas. |
| `texture_data` | keyedObjectCollection |  | **required**. A collection of texture definitions keyed by texture name. Each entry maps a texture name to its source file(s). |

Example (apple):
```json
{
 "textures": [
  "textures/items/apple"
 ]
}
```

### languages (languages)

The languages.json file is a simple array of locale codes that specifies which language translations are available in this resource pack. Located at texts/languages.json in resource packs.

> This file is a JSON array at the root level, containing string locale codes. Each locale code corresponds to a .lang file in the texts/ folder that provides translations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `0` | string |  | A locale code identifying a language translation (e.g., en_US, de_DE, ja_JP). |

Example (example):
```json
[
 "en_US",
 "en_GB",
 "de_DE",
 "es_ES",
 "es_MX",
 "fr_FR",
 "fr_CA",
 "it_IT",
 "ja_JP",
 "ko_KR",
 "pt_BR",
 "pt_PT",
 "ru_RU",
 "zh_CN",
 "zh_TW",
 "nl_NL",
 "bg_BG",
 "cs_CZ",
 "da_DK",
 "el_GR",
 "fi_FI",
 "hu_HU",
 "id_ID",
 "nb_NO",
 "pl_PL",
 "sk_SK",
 "sv_SE",
 "tr_TR",
 "uk_UA"
]
```

### music_definitions (music_definitions)

The music_definitions.json file defines which music tracks play in different biomes and game states. Each key is a biome or game state identifier that maps to music event configuration. Located at sounds/music_definitions.json in resource packs.

> This file is a JSON object where each key is a biome identifier (e.g., 'forest', 'desert', 'hell') or game state ('menu', 'creative', 'credits') and each value contains event_name, min_delay, and max_delay properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `biome_music` | keyedObjectCollection |  | Music configuration keyed by biome identifier or game state (e.g., 'forest', 'desert', 'menu', 'creative', 'credits'). |

Example (forest):
```json
{
 "event_name": "music.overworld.forest",
 "max_delay": 180,
 "min_delay": 60
}
```

### render_controller_set (render_controller_set)

Defines geometry, materials, and textures for entity rendering.

| Field | Type | Default | Notes |
|---|---|---|---|
| `render_controllers` | keyedObjectCollection |  |  |

### render_controller_set_geometry (render_controller_set_geometry)

Defines geometry selection logic for entity rendering.

| Field | Type | Default | Notes |
|---|---|---|---|
| `render_controllers` | keyedObjectCollection |  |  |

### render_controller_set_materials (render_controller_set_materials)

Defines material selection logic for entity rendering.

| Field | Type | Default | Notes |
|---|---|---|---|
| `render_controllers` | keyedObjectCollection |  |  |

### render_controller_set_misc (render_controller_set_misc)

Controls part visibility for entity rendering.

| Field | Type | Default | Notes |
|---|---|---|---|
| `render_controllers` | keyedObjectCollection |  |  |

### render_controller_set_textures (render_controller_set_textures)

Defines texture selection logic for entity rendering.

| Field | Type | Default | Notes |
|---|---|---|---|
| `render_controllers` | keyedObjectCollection |  |  |

### sound_definitions (sound_definitions)

_since 1.14.0_

Defines sound events and their associated audio files. This file maps sound event identifiers to one or more sound files that can play when that event is triggered. Located at sounds/sound_definitions.json in resource packs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version | `"1.14.0"` | **required**. The format version of the sound definitions file. Should be '1.14.0' or higher. |
| `sound_definitions` | keyedObjectCollection |  | **required**. A collection of sound event definitions, where each key is a sound event identifier (e.g., 'mob.zombie.say') and the value defines which sounds can play for that event. |

Example (sound_definitions/mob.imitate.blaze):
```json
{
 "category": "neutral",
 "sounds": [
  {
   "name": "sounds/mob/blaze/breathe1",
   "volume": 0.2
  },
  {
   "name": "sounds/mob/blaze/breathe2",
   "volume": 0.2
  }
 ]
}
```

### sounds (sounds)

The sounds.json file defines sound events, entity sounds, block sounds, and interactive sounds for a resource pack. This is the legacy sound configuration file; for newer projects, consider using sound_definitions.json instead.

> The sounds.json file is a comprehensive sound configuration file that has been used since early versions of Bedrock Edition. For newer sound definitions with format versioning, consider using sound_definitions.json instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `individual_event_sounds` | object |  | Defines individual sound events that can be triggered by various game actions. |
| `block_sounds` | keyedObjectCollection |  | Defines sounds that play when interacting with blocks (breaking, placing, stepping). |
| `entity_sounds` | object |  | Defines sounds for entities, including defaults and entity-specific overrides. |
| `interactive_sounds` | object |  | Defines sounds for interactive elements like UI and special blocks. |
| `individual_named_sounds` | object |  | Defines named sounds that can be referenced directly. |

### terrain_texture (terrain_texture)

The terrain_texture.json file defines the texture atlas for block textures. It maps texture names to texture file paths, allowing blocks to reference textures by name. Located at textures/terrain_texture.json in resource packs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `resource_pack_name` | string |  | **required**. The name of the resource pack this atlas belongs to. |
| `texture_name` | string | `"atlas.terrain"` | **required**. The name of the texture atlas. Typically 'atlas.terrain' for block textures. |
| `padding` | int | `8` | The padding in pixels between textures in the atlas to prevent bleeding. |
| `num_mip_levels` | int | `4` | The number of mipmap levels to generate for the atlas. |
| `texture_data` | keyedObjectCollection |  | **required**. A collection of texture definitions keyed by texture name. Each entry maps a texture name to its source file(s). |

Example (stone):
```json
{
 "textures": [
  "textures/blocks/stone"
 ]
}
```

### texture_list (texture_list)

The texture_list.json file is a simple array of texture paths that should be included in the resource pack. This file helps the game identify which textures are available. Located at textures/texture_list.json in resource packs.

> This file is a JSON array at the root level, containing string paths to texture files relative to the resource pack root. File extensions are typically omitted.

Example (example):
```json
[
 "textures/blocks/stone",
 "textures/items/apple",
 "textures/entity/pig/pig"
]
```

### Box (box)

Defines a 3D bounding box with min and max coordinates.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` |  |  | **required**. Max |
| `min` |  |  | **required**. Min |

### Color Proxy (color_proxy)

Defines a color gradient with interpolation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `gradient` |  |  | **required**. Gradient |
| `interpolant` |  |  | **required**. Interpolant |

### ConstantHeightProviderType (constantheightprovidertype)

Constant anchor point

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. HeightProviderType |
| `value` |  |  | **required**. Constant anchor point |

### constantintprovider (constantintprovider)

Specifies a constant integer

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | Provider Type |
| `value` | int |  | Constant value |

### coordinate_range (coordinate_range)

Represents the scatter distrubution over a coordinate (x/y/z), can also be built by an expression.

| Field | Type | Default | Notes |
|---|---|---|---|
| `distribution` | string |  | Type of distribution. Supported distributions are defined by "Random Distribution Type". |
| `extent` |  |  | Lower and upper bound (inclusive) of the scatter range, as an offset from the input point to scatter around. |
| `grid_offset` | int |  | When the distribution type is grid, defines the offset along this axis. |
| `step_size` | int |  | When the distribution type is grid, defines the distance between steps along this axis. |

### DimensionPaddingRange (dimensionpaddingrange)

Specifies the padding for the top and bottom of the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `bottom` | int |  | The padding from the bottom of the world |
| `top` | int |  | The padding from the top of the world |

### DirectionSettings Proxy (directionsettings_proxy)

Controls direction settings for effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `custom_direction` |  |  | Custom Direction |
| `min_speed_threshold` | float |  | Min Speed Threshold |
| `mode` | string |  | **required**. Particle Appearance Billboard Direction Settings Mode |

### DirectPoolAlias (directpoolalias)

Pool alias for a Direct target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Direct pool |
| `target` |  |  | **required**. Target pool |

### expressionnode (expressionnode)

ExpressionNode

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | expression |
| `version` | int |  | version |

### expressionnode_stringrepresentation (expressionnode_stringrepresentation)

:StringRepresentation

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | expression |
| `version` | int |  | version |

### filter_group (filter_group)

Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `4150989894` |  |  | Filter Test |

### Foliage Color Map (foliage_color_map)

Object specifying a color map for foliage instead of a specific color.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color_map` | string |  | **required**. Color map from textures/colormap to determine color of foliage. |

### Grass Color Map (grass_color_map)

Object specifying a color map for grass instead of a specific color.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color_map` | string |  | **required**. Color map from textures/colormap to determine color of grass. |

### Shape (shape)

Defines a shape composed of boxes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `boxes` |  |  | **required**. Boxes See `misc/box`. |

### sharedtypes_intrange (sharedtypes_intrange)

SharedTypes IntRange

| Field | Type | Default | Notes |
|---|---|---|---|
| `min` | int |  | min |
| `max` | int |  | max |

### trigger (trigger)

Trigger

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | event |
| `target` | string |  | Filter target subject |
| `condition` |  |  | condition |

### UV Proxy (uv_proxy)

Controls UV texture mapping and flipbook animation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `flipbook` |  |  | Flipbook See `client_misc/particle_appearance_billboard_flipbook_data`. |
| `texture_height` | int |  | Texture Height |
| `texture_width` | int |  | Texture Width |
| `uv` |  |  | Uv |
| `uv_size` |  |  | Uv Size |

### VoxelShapeFile (voxelshapefile)

Defines a voxel shape with description and geometry.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` |  |  | **required**. Description See `misc/description`. |
| `shape` |  |  | **required**. Shape See `misc/shape`. |
