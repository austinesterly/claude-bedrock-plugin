# Pathing, routes and schedules

Sources: Learn entity reference tables (`../../bedrock-json-reference/references/entity-ai-goals.md`, `entity-components.md`, `entity-filters-and-events.md`), vanilla `bee.json`, `villager_v2.json`, `wandering_trader.json`, `iron_golem.json` (v1.26.50.4), the stable `@minecraft/server` 2.10.0 typings, and the 26.40-26.60 changelogs. Working code: `templates/patrol-guard` (routes) and `templates/town-schedule` (day and night).

## The short version

- **There is no stable script API that makes a mob walk to a point.** Movement comes from JSON AI goals. Script picks which goals are active (`triggerEvent`, `setProperty`) and watches the result.
- The goal that walks to a place you choose is `minecraft:behavior.move_to_block` (a block type you put there). The goal that walks back to where the mob spawned is `minecraft:behavior.go_home`.
- Day and night switching is JSON: `minecraft:scheduler` with `hourly_clock_time` filters (the vanilla villager pattern).

## AI goals for routes

| Goal | Moves toward | Key fields | Events |
|---|---|---|---|
| `minecraft:behavior.move_to_block` | Nearest (or random) block of `target_blocks` within `search_range` / `search_height` | `goal_radius`, `target_offset`, `target_block_filters`, `target_selection_method` (`nearest`/`random`), `tick_interval`, `start_chance`, `stay_duration` (ticks) | `on_reach`, `on_stay_completed` (vanilla bee: arrays of `{event, target}`) |
| `minecraft:behavior.go_home` | Its spawn position (needs `minecraft:home`, as vanilla bees have) | `goal_radius`, `calculate_new_path_radius`, `interval` (1/interval chance per tick) | `on_home`, `on_failed` |
| `minecraft:behavior.move_towards_home_restriction` | Back inside the `minecraft:home` radius | `speed_multiplier` | |
| `minecraft:behavior.random_stroll` | A random spot | `xz_dist`, `y_dist`, `interval` | |
| `minecraft:behavior.move_to_random_block` | A random block within `block_distance` | `within_radius` | |
| `minecraft:behavior.move_to_poi` | A POI: `bed`, `jobsite`, `meeting_area` | `poi_type` | Village POIs need `minecraft:dweller` (villager system) |
| `minecraft:behavior.move_to_village` / `stroll_towards_village` / `move_through_village` | Village areas | | Village system |
| `minecraft:behavior.move_indoors` | Indoors | `timeout_cooldown` | |
| `minecraft:behavior.follow_mob` | Another mob | `search_range`, `stop_distance`, `filters` (which mobs), `preferred_actor_type`, `use_home_position_restriction` | Default filter excludes players and same-type mobs |
| `minecraft:behavior.follow_owner` / `follow_parent` / `follow_caravan` | Owner (tamed), parent, caravan leader | | |
| `minecraft:behavior.move_towards_target` | Its attack target | `within_radius` | |
| `minecraft:behavior.work` | Its villager jobsite | `active_time`, `on_arrival` | Villager system |
| `minecraft:behavior.sleep` | Its villager bed | | Villager system |

`move_to_block` and the goals above had stricter schemas from 1.26.40; use the field names in the table exactly. `follow_mob` interrupts navigation whenever it stops or its group is removed (26.50).

### Navigation and path costs

`minecraft:navigation.walk` decides what a path may use: `avoid_water`, `avoid_damage_blocks`, `avoid_sun`, `avoid_portals`, `blocks_to_avoid`, `can_open_doors` (also add `minecraft:annotation.open_door`), `can_pass_doors` (default true), `can_break_doors`, `can_jump` (default true), `can_path_over_water`, `can_swim`, `can_sink`, `can_walk`, `can_float`, `is_amphibious`. Script can read the same flags from `EntityNavigationWalkComponent` (all read-only).

`minecraft:preferred_path` makes routes follow roads (vanilla villager adult): `default_block_cost` 3, `jump_cost` 20, `preferred_path_blocks` `[ { "blocks": ["grass_path"], "cost": 0 }, { "blocks": ["cobblestone", ...], "cost": 1 } ]`, `max_fall_blocks`. Stricter schema at 1.26.50.

Pathfinding is short-range: break long routes into stops a few dozen blocks apart, each with a clear ground path from the last.

## Routes: posts plus move_to_block (stable, used by `templates/patrol-guard`)

1. Pick one marker block type per leg (the template uses red, lime and light blue glazed terracotta). Build each into the floor along the route.
2. One component group per leg, each holding a `move_to_block` for that leg's block, with `target_offset [0, 1, 0]` (stand on top), `goal_radius` 1.5 and a `stay_duration`.
3. Each leg's `on_stay_completed` fires the next leg's event, which swaps groups and sets an int property `ns:leg`. That is a complete loop with no script.
4. Lay posts so the *nearest* post of the next color is the next stop; `search_range` bounds how far it looks.
5. Script glue (`ns_patrol.js`): if `ns:leg` hasn't changed for 30 s and the guard hasn't fought, trigger the next leg (a post is missing or unreachable). Combat goals run at higher priority and the leg resumes afterwards on its own.

To observe arrivals in script: `world.afterEvents.dataDrivenEntityTrigger.subscribe(cb, { entityTypes: ["ns:patrol_guard"], eventTypes: ["ns:go_leg_b"] })`.

Variations: use custom marker blocks (an invisible-looking floor block) so builds never trigger it by accident; `target_block_filters` narrows candidates (vanilla bee tests `is_waterlogged`).

## Script-driven waypoints: what 2.10.0 has

| API | What it does | Use for routes? |
|---|---|---|
| `entity.triggerEvent("ns:go_leg_b")` | Runs a JSON event (swap goal groups) | **Yes**: the main lever |
| `entity.setProperty("ns:leg", 1)` / `getProperty` | Entity properties (int, float, bool, enum) that JSON filters can test | **Yes**: state the JSON reads (`int_property` / `enum_property` filters) |
| `world.afterEvents.dataDrivenEntityTrigger` | Fires when an entity runs a JSON event; `entity`, `eventId` | **Yes**: hear `on_reach` / `on_stay_completed` |
| `entity.teleport(loc, { facingLocation, checkForBlocks, keepVelocity, rotation, dimension })` / `tryTeleport` (returns false instead of moving into blocks) | Moves instantly | Fallback only (below) |
| `entity.applyImpulse(vector)` / `clearVelocity()` / `getVelocity()` | Adds to velocity; throws `ArgumentOutOfBoundsError` on bad vectors | No: AI movement and friction fight it. Good for knockback and launches |
| `entity.lookAt(location)` / `setRotation({ x, y })` | Turns the entity | Facing only |
| `getComponent("minecraft:movement")` | `EntityMovementComponent` (an attribute: `currentValue`, `setCurrentValue`, `resetToDefaultValue`) | Changes speed, not direction |
| `getComponent("minecraft:navigation.walk")` | Read-only nav flags | No |

Not in stable 2.10.0: any `moveTo`, `navigateTo` or path API for entities, `minecraft:home` position setting, and `Entity.target` (beta, read-only). The `navigateToLocation`, `navigateToBlock`, `moveToLocation` family exists only on `SimulatedPlayer` in `@minecraft/server-gametest` (a test-only module with no stable release), so it doesn't apply to NPC entities.

### Teleport stepping (last resort)

```js
// Moves `npc` a small step toward `goal` every tick. No pathfinding: it walks through
// nothing, climbs nothing, and gives up when blocked. Keep routes flat and clear.
function stepToward(npc, goal, speed = 0.18) {
  const p = npc.location;
  const dx = goal.x - p.x, dz = goal.z - p.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.3) return true;                        // arrived
  const s = Math.min(speed, d);
  const next = { x: p.x + (dx / d) * s, y: p.y, z: p.z + (dz / d) * s };
  npc.tryTeleport(next, { facingLocation: { x: goal.x, y: p.y + 1.6, z: goal.z }, checkForBlocks: true });
  return false;                                    // tryTeleport returns false when the step is blocked
}
```
- Run it from one `system.runInterval` for all moving NPCs, not one interval per NPC.
- Give the entity no movement goals while stepping (a `ns:scripted_move` group without `random_stroll`), or the AI pulls it back.
- Whether the walk animation plays (`q.modified_move_speed` after teleports) is unverified; drive a `ns:walking` property from script and animate on that if not.
- Teleports are sent to clients as position jumps; at 20 steps per second it looks like sliding. Prefer goals whenever a block marker is acceptable.

### Following an invisible marker (unverified)

Another idea: spawn an invisible, non-colliding marker entity at the next waypoint and give the NPC `behavior.follow_mob` with `filters` matching the marker's family; teleport the marker ahead as the NPC arrives. Nothing in the official docs says `follow_mob` accepts a stationary, AI-less entity as a target. Test before relying on it.

## Day and night schedules

### `minecraft:scheduler` (vanilla villager pattern, used by `templates/town-schedule`)

```json
"minecraft:scheduler": {
  "min_delay_secs": 0,
  "max_delay_secs": 10,
  "scheduled_events": [
    { "event": "ns:start_work", "filters": { "all_of": [
      { "test": "hourly_clock_time", "operator": ">=", "value": 0 },
      { "test": "hourly_clock_time", "operator": "<", "value": 11000 } ] } },
    { "event": "ns:go_home", "filters": { "all_of": [
      { "test": "hourly_clock_time", "operator": ">=", "value": 11000 },
      { "test": "hourly_clock_time", "operator": "<", "value": 24000 } ] } }
  ]
}
```
- Fields (Learn): `scheduled_events` (array or single object), `min_delay_secs`, `max_delay_secs`. Learn's generated description adds: "If any filter criteria overlap the first defined event will be picked."
- `hourly_clock_time` compares "the current 24 hour time with an int value in the range [0, 24000]". Vanilla villagers work 0-8000, gather 8000-10000, go home 11000-12000 and sleep 12000-24000. The script `TimeOfDay` enum has `Day` 1000, `Noon` 6000, `Sunset` 12000, `Night` 13000, `Midnight` 18000, `Sunrise` 23000 (`world.getTimeOfDay()`).
- Each event swaps component groups (`ns:work_shift` / `ns:night_home`) and sets an enum property for the resource pack or script.
- How often the scheduler re-fires an event whose filter still matches isn't documented; make the events idempotent (re-adding the current group is harmless).

### Other time triggers

| Trigger | Notes |
|---|---|
| `minecraft:environment_sensor` with `{ "test": "is_daytime", "value": false }` | Fires its event while the filter holds; pair two triggers (day, night) and guard each with an `enum_property` test so it fires once per change. Vanilla iron golem uses `is_daytime` |
| `clock_time` filter | Older float form (0.0 noon, 0.25 sunset, 0.5 midnight, 0.75 sunrise); Learn calls `hourly_clock_time` its updated version |
| `minecraft:timer` | Fixed delays (`time` is `{min,max}` at 1.26.50) |
| Script | `system.runInterval` reading `world.getTimeOfDay()` and calling `triggerEvent` on loaded NPCs; needed only for rules JSON can't express (weather, calendars) |

## Keeping NPCs loaded

Entities outside ticking chunks don't move, don't run goals and can't be targeted by `/dialogue open`. `minecraft:persistent` stops despawning, not unloading.

| Tool | Notes |
|---|---|
| `/tickingarea add <from> <to> [name] [preload]`, `add circle <center> <radius 0-4 chunks>`, `remove`, `remove_all`, `list` | Up to 10 per world (Learn). `preload` loads it with the world |
| Script `world.tickingAreaManager` | `createTickingArea(id, { dimension, from, to })` (Promise), `hasTickingArea`, `removeTickingArea`, `hasCapacity`, `chunkCount` / `maxChunkCount` |
| `minecraft:tick_world` (`radius`, `never_despawn`, `distance_to_players`) | Documented on Learn, used by no vanilla 1.26.50 entity; behavior unverified |
| Catch-up | Store the time an NPC was last seen (`entityLoad` / `entityRemove`) and jump it to where it should be when its chunk loads again (`teleport` to work or home) |

Ticking areas are a shared budget; give one to a town square, not to every NPC.

## Tethering an NPC to a home

```json
"minecraft:home": { "restriction_type": "random_movement", "restriction_radius": 6 },
"minecraft:behavior.move_towards_home_restriction": { "priority": 5, "speed_multiplier": 0.6 }
```
- `restriction_type`: `none` (only remembers the spot, enough for `go_home`), `random_movement` (wandering stays inside; vanilla wandering trader radius 16, bee 22), `all_movement` (every goal stays inside; it can always walk back). Needs format_version 1.21.40 or later; stricter at 1.26.50.
- `home_block_list`: the restriction lifts if none of those blocks is at the home position any more.
- The `home_distance` filter (1.21.60) tests distance to home: use it in an `environment_sensor` to fire "too far, go back" events.
- The home is where the entity spawned. Script can't set it in 2.10.0; to move an NPC's home, spawn a new one there (copy its dynamic properties) and remove the old one.
- Don't put a radius-limited `minecraft:home` on an NPC that must walk to a far work spot: `all_movement` blocks the trip. Use `restriction_type: none` plus `go_home` at night (as `templates/town-schedule` does).

## Common mistakes

- Expecting `teleport` to path: it moves in a straight line through nothing and doesn't animate walking.
- One marker block type for a multi-stop loop with `nearest`: the NPC bounces between the two closest posts.
- Removing the group that holds `minecraft:movement` to freeze: the component is gone after the group returns. Freeze by swapping goal groups.
- Using `clock_time` and `hourly_clock_time` values interchangeably (float 0-1 vs int 0-24000, different zero point).
- A scheduler event that also removes the base movement components.
