# Experimental and upcoming features in recent changelogs (generated)

Generated on **2026-10-12** from feedback.minecraft.net (official Zendesk API). Each release lists its "Experimental ..." sections word for word, then other bullets that mention an experiment or beta (often a feature graduating out of an experiment). Newest first. Toggle names are as Mojang writes them in world settings > Experiments.

## Minecraft Beta & Preview - 26.60.29 (2026-09-30)

Source: https://feedback.minecraft.net/hc/en-us/articles/49274834093453-Minecraft-Beta-Preview-26-60-29

### Experimental Features

#### Drop 4 of 2026

##### Biomes

- The Ice Cave is a new cave biome that generates under the colder biomes in the Overworld. It consists mainly of Packed Ice and Calcite
  - Features terrain composed primarily of Packed Ice and Calcite
  - Icicles generate hanging from the ceiling
  - Large icicles made of Packed Ice generate on the ground and hanging from the ceiling
  - Patches of Snow occasionally generates on the ground
  - Ores generate embedded in pockets of Stone and Deepslate
  - Dirt and Granite do not generate in this biome
  - Glow Lichen does not generate in this biome
  - In addition to the mobs that normally spawn in caves, Strays and Frostbites can also spawn here
  - Ice Crystals occasionally generate on the ground
  - Ice Caves appear under biomes with low temperature

##### Blocks

- Ice Crystals are the only light source found in Ice Caves, as there is no Glow Lichen there. They can generate naturally on top of Packed Ice blocks
  - A new crystal-like block similar to Amethyst Clusters
  - Breaks if the support block is removed
  - It emits light and can be placed in any direction
  - Known issue: Ice Crystals are currently smaller than intended
- Icicles can be found all over the ceiling of ice caves. They generate under blocks of packed ice. If light levels are high enough, there is a chance they will drop and cause damage to anyone or anything unlucky enough to be hit by it
  - A new speleothem-like block similar to Dripstone and Sulfur Spikes
  - Can naturally grow up to 5 blocks long when pointing downward
  - Only grows in areas without nearby light sources and outside the Nether
  - Damages entities when it falls and deals extra damage to entities that land on it
  - Breaks when exposed to nearby light sources or while in the Nether, except for its base block

##### Freezing Mob Effect

- The Freezing Effect will cause players to shake, reduce their jump height, and eventually deal damage
  - Causes those affected to slowly become frozen as if in Powdered Snow for its duration
  - Leather Armor will keep them from becoming freezing, just like with Powder Snow, but will not keep the effect from being applied and will not remove the effect
  - Mobs will take additional damage from Freezing while they are affected by the mob effect
    - Mobs that are vulnerable to freezing have a five times multiplier to the damage taken
  - Lingering Potion, Splashing Potion, and Potion of Freezing can be brewed using Ice Balls
  - Arrow of Freezing can be crafted by dipping Arrows into a Cauldron filled with Potion of Freezing

##### Frostbite

- The Frostbite is a zombie variant that can throw ice balls. However, what they really like is to get close to you and use melee attacks that cause the Freezing Effect
  - A new Zombie variant
  - Spawns in cold/icy biomes
  - Switches between melee and ranged combat based on target distance and whether they have Ice Balls; melee attacks apply Freezing, while ranged attacks throw Ice Balls
  - Uses Zombie-style melee animations and dedicated Ice Ball throwing animations for both adult and baby variants
  - Transforms into a Zombie when underwater for long enough
  - Drops Rotten Flesh and Ice Balls
  - It can stand on top of Powder Snow
  - It is immune to freezing and does not get slowed by the Freezing effect or Powder Snow
  - Zombies and Husks now transform into Frostbites when inside Powder Snow

##### Ice Ball

- Ice balls are the projectile weapon of choice for the Frostbite. They deal a small amount of damage and have knockback
  - A new projectile that can be thrown by the Frostbite
  - Deals 4 damage to entities it hits, scaling down with velocity
  - Breaks on impact with blocks or entities, creating a particle effect and sound

##### Sounds

- Added custom sounds for Ice block

### Experimental Technical Updates

#### API

- Added the world.beforeEvents.playerItemAttackEntity event in beta to let scripts cancel an attack initiated through a player item interaction before it causes authoritative attack effects
- Added class BlockRecipeProcessingComponent to beta for accessing recipe processing inputs and output (initially supporting the crafter block)
- Added beta Script API access to the minecraft:vibration_properties block component, including methods to read whether vibrations can be dampened or occluded
- Added class PlayerCursorItemGrabAfterEventSignal to beta
- Added class PlayerCursorItemGrabAfterEvent to beta
- Added class PlayerCursorItemReleaseAfterEventSignal to beta
- Added class PlayerCursorItemReleaseAfterEvent to beta
- Added property WorldAfterEvents.playerCursorItemGrab to beta
- Added property WorldAfterEvents.playerCursorItemRelease to beta

#### Blocks

- Added an optional title field to container in the minecraft:block_entity block component, accepting literal text or localization keys of 1 to 256 characters with Upcoming Creator Features enabled; omitting the field leaves the container heading blank
- Data-driven container titles now stay on one line and truncate with ... when needed in Classic and Pocket UI, including after localization
- Added the experimental minecraft:enchantment_power_transmitter block component, which defines whether a block can transmit enchantment power. If set to true and a block with this component is placed in the 1 block gap between an enchantment table and a bookshelf, the enchantment table will remain powered by the bookshelf
- Requires format version 1.26.60 and the Upcoming Creator Features experiment
- Added the experimental minecraft:vibration_properties block component, which defines whether a custom block dampens or occludes vibrations through the dampen_vibrations and occlude_vibrations properties
  - Requires format version 1.26.60 and the Upcoming Creator Features experiment
- Added the experimental minecraft:neighbor_change block component, which lets creators configure which neighboring block changes trigger the neighbor change after event for block custom components. Requires format version 1.26.60 and Upcoming Creator Features
{ "format_version": "1.26.60", "minecraft:block": { "description": { "identifier": "demo:neighbor_listener_all" }, "components": { "minecraft:neighbor_change": { "neighbor_directions": ["all"] // "up", "down", "north", "west", "east", "south" also acceptable }, "demo:neighbor_change_listener": {} } } }
- Added the beta onNeighborChanged event for custom block components
  - Use minecraft:neighbor_change.neighbor_directions to choose which neighboring directions trigger the event.
  - Call BlockComponentNeighborChangedAfterEvent.getChanges to get the neighboring block changes.
  - For each tick, the game queues one event for each listening block with neighbor changes. Changes from different ticks create separate events, even if delivery is delayed.
  - Each chunk queues at most 4,096 events and delivers at most 100 events per tick. New events are dropped while the queue is full.
  - BlockComponentNeighborChangedAfterEvent.getChanges returns one NeighborChange for each direction that changed during the tick.
  - If one direction changes more than once during a tick, previousPermutation contains the permutation before the first change and blockPermutation contains the permutation after the last change. Intermediate permutations are not included.
  - NeighborChange.direction points from the listening block to the neighbor that changed.
  - BlockComponentNeighborChangedAfterEvent.block is a live handle to the listening block. The permutations returned by getChanges are snapshots of the changed neighbor.
  - If the block does not have minecraft:neighbor_change, changes from all neighboring directions can trigger the event.

### Other experiment and beta mentions

- Removed the Creator World Clocks Features experiment
- /time of commands no longer require the Creator World Clocks Features experiment
- New /time commands no longer require the Creator World Clocks Features experiment
- Released WorldClockRegistry from beta to v2.11.0 in @minecraft/server
- Released WorldClock from beta to v2.11.0 in @minecraft/server
- Released TimeMarker from beta to v2.11.0 in @minecraft/server
- Released WorldClockRegistrationOptions from beta to v2.11.0 in @minecraft/server
- Released TimeMarkerOptions from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnTimeModifiedAfterEvent from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnTimeModifiedAfterEventSignal from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnPausedAfterEvent from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnPausedAfterEventSignal from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnResumedAfterEvent from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnResumedAfterEventSignal from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnTimeMarkerAfterEvent from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnTimeMarkerAfterEventSignal from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnRestartBeforeEvent from beta to v2.11.0 in @minecraft/server
- Released WorldClockOnRestartBeforeEventSignal from beta to v2.11.0 in @minecraft/server
- Released WorldClockEventOptions from beta to v2.11.0 in @minecraft/server
- Released WorldClockTimeMarkerEventOptions from beta to v2.11.0 in @minecraft/server
- Released WorldClockRegistrationError from beta to v2.11.0 in @minecraft/server
- Released WorldClockReloadNewWorldClockError from beta to v2.11.0 in @minecraft/server
- Released WorldClockReloadTimeMarkerError from beta to v2.11.0 in @minecraft/server
- Released WorldClockInvalidRegistryError from beta to v2.11.0 in @minecraft/server
- Released WorldClockNotFoundError from beta to v2.11.0 in @minecraft/server
- Released WorldClockTimeMarkerNotFoundError from beta to v2.11.0 in @minecraft/server
- Released WorldClockAddTimeMarkerError from beta to v2.11.0 in @minecraft/server
- Released WorldClockRemoveMinecraftTimeMarkerError from beta to v2.11.0 in @minecraft/server
- Released WorldClockInvalidTimeMarkerError from beta to v2.11.0 in @minecraft/server
- Released WorldClockRewindError from beta to v2.11.0 in @minecraft/server
- Released StartupEvent.worldClockRegistry from beta to v2.11.0 in @minecraft/server
- Released World.getClock from beta to v2.11.0 in @minecraft/server

## Minecraft Beta & Preview - 26.60.28 (2026-09-22)

Source: https://feedback.minecraft.net/hc/en-us/articles/49076913532557-Minecraft-Beta-Preview-26-60-28

### Experimental Technical Updates

#### API

- Added the `minecraft:entity_storage` block component behind `beta`
  - It is only present on blocks defined with a `minecraft:block_entity` component with `entity_storage` set to `true`
  - It provides the methods `store`, `transfer`, `release`, `getEntities` and `size`
  - Up to 4 entities can be stored in a single block
  - Storage and API is compartmentalized per content pack, but the 4 entities limit applies globally

#### Blocks

`minecraft:collision_box` will no longer accept single box objects from v1.26.60 onwards in favor of only using arrays. For example, this component...
`{ "format_version": "1.26.20", "minecraft:block": { "description": { "identifier": "test:block_v1_26_20", }, "components": { "minecraft:collision_box": { "origin": [ 0, 0, 0 ], "size": [16, 24, 16] } } } } `
... needs to be transformed into this format:
`{ "format_version": "1.26.60", "minecraft:block": { "description": { "identifier": "test:block_v1_26_60", }, "components": { "minecraft:collision_box": [ { "origin": [ 0, 0, 0 ], "size": [16, 24, 16] } ] } } } `
- `minecraft:collision_box` now supports min/max coordinates in addition to origin/size with the "Upcoming Creator Features" experiment toggled.
- The engine will upgrade any `origin`/`size` coordinates into `min`/`max` internally.
`{ "format_version": "1.26.60", "minecraft:block": { "description": { "identifier": "test:block_v1_26_60" }, "components": { "minecraft:collision_box": [ { "min": [ 4, 0, 0 ], "max": [16, 24, 8] } ] } } } `
- Added a new boolean field `entity_storage` inside the `minecraft:block_entity` component, only supported with `Experimental Upcoming Creator Features` toggled ON

###### Coordinate System Differences

Origin/Size Min/Max Reference point `[0, 0, 0]` Bottom-middle on the front of the block Bottom-left corner on the front of the block X and Z coordinate range `-8` to `8` `0` to `16` Y coordinate range `0` to `24` `0` to `24` X-axis direction Mirrored, follows geometry system Not mirrored, follows voxel shape system

###### Manual Conversion

- Center `origin` by shifting the original X and Z values by +8.
- Add `size` to the adjusted origin, normalize the results, and calculate the `min` and `max` points between both corners.
- The last step is to mirror both points on the X axis. a. Take the maximum X value from `min` and subtract it from 16. b. Take the minimum X value from `max` point and subtract it from 16.
`origin = [-8, 0, -8] size = [12, 24, 8] adjustedOrigin = origin + [8, 0, 8] = [0, 0, 0] tempMin = min(adjustedOrigin, adjustedOrigin + size) = [0, 0, 0] tempMax = max(adjustedOrigin, adjustedOrigin + size) = [12, 24, 8] min = [16 - tempMax.x, tempMin.y, tempMin.z] = [4, 0, 0] max = [16 - tempMin.x, tempMax.y, tempMax.z] = [16, 24, 8] `
To verify the conversion, check that subtracting `min` from `max` equals the absolute value of the original `size` on each axis.

#### Graphical

- Under the RenderDragon Features for Creators Experiment:
  - Improved point light ranking
  - Introduced a system that inversely phases out block lighting when point lights phase in

### Other experiment and beta mentions

- Released `EntityIsTamedComponent.tamedToPlayer` and `EntityIsTamedComponent.tamedToPlayerId` from beta to stable in `@minecraft/server` v2.11.0
- Renamed `PoiBlockType.has` to `PoiBlockType.hasTag` in `beta`

## Minecraft Beta & Preview - 26.60.24 (2026-09-16)

Source: https://feedback.minecraft.net/hc/en-us/articles/48940953884173-Minecraft-Beta-Preview-26-60-24

### Experimental Technical Updates

#### API

- Added property `hiddenFrom` to `DebugShape` and `PrimitiveShape`.
- Added property `defaultVisibleToAll` to `DebugShape` and `PrimitiveShape`.

##### DDUI

Added support for multi button row at message box in beta. Button layout could be vertical or horizontal.
- New interface `MessageBoxOptions`.
  - Field `showHorizontalButtons: boolean;`. Sets the desired layout for the buttons, true for horizontal, false for vertical. Default value is false.
- Class `MessageBox`.
  - New constructor optional parameter `options?: MessageBoxOptions`. '
  - New method `button3WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox`. Allows to add a third button to the message box.

#### Blocks

- Introducing a new block event that custom components can listen to, `onNamedTick`
  - A block can schedule a named tick with `Block.scheduleNamedTick`, which takes a name and tick delay as parameters.
  - A block can check if at least one named tick is already scheduled with `Block.hasScheduledNamedTick`, which takes a name as sole parameter.
  - A block can remove all scheduled named ticks matching a name with `removeScheduledNamedTick`, which takes a name as sole parameter.
  - When handling the event from `onNamedTick`, `BlockComponentNamedTickEvent.isName` can be leveraged to filter out events based on their name.
  - Named ticks are grouped by content packs, two content packs can schedule the same named tick, but `BlockComponentNamedTickEvent.isName` will return differently based on the content pack calling the method.
  - Up to 4 named ticks can be scheduled at a given time on the same block position.
  - The name of a scheduled named tick cannot be longer than 31 characters.
  - Changing the block at a position wipes its scheduled named ticks.
  - Changing the permutation at a position does not wipe its scheduled named ticks.
  - The named tick API is behind beta.

#### Graphical

- Fixed a bug where point lights would not cast shadows in the Nether or deep underground

### Other experiment and beta mentions

- Released `SoundInstance.setVolume`, `SoundInstance.setPitch`, `SoundInstance.fade`, `SoundInstance.seekTo`, `SoundInstance.pause`, and `SoundInstance.resume` from beta to scripts version `2.11.0`
- Released the `loopCount` option on `PlayerSoundOptions` and `WorldSoundOptions` from beta to scripts version `2.11.0`
- Released server sound definitions from beta with format version `1.26.60`
- `sound_event` now accepts the name of any sound event defined in `sound_definitions.json`, in addition to the built-in sound event names, starting with format version `1.26.50` and no longer requires the Upcoming Creator Features experiment
- `attack_miss`, `attack_hit`, and `attack_critical_hit` now accept the name of any sound event defined in `sound_definitions.json`, in addition to the built-in sound event names, starting with format version `1.26.50` and no longer requires the Upcoming Creator Features experiment
- `start_sound` now accepts the name of any sound event defined in `sound_definitions.json`, in addition to the built-in sound event names, starting with format version `1.26.50` and no longer requires the Upcoming Creator Features experiment

## Minecraft: Bedrock Edition 26.50 Changelog - Wilderness Bound (2026-09-11)

Source: https://feedback.minecraft.net/hc/en-us/articles/48826825649933-Minecraft-Bedrock-Edition-26-50-Changelog-Wilderness-Bound

### Experimental Technical Updates

#### API

- Added lineHeightOverride property to both TextPrimitive and DebugText. .
- Changed the following beta APIs in @minecraft/server-admin
  - Changed arguments for AllowList.add() take an AllowListEntryNameInfo and boolean to allow this player to ignore player limits when joining the server.
  - Changed arguments for AllowList.contains() to take an AllowListEntryNameInfo
  - Changed arguments for AllowList.remove() to take an AllowListEntryNameInfo
  - Added property ignoresPlayerLimit to AllowListEntry
  - Added new AllowListEntryNameInfo
- Added new tech and support for using scripting to interface with the VS Code debugger live diagnostics:
  - Added class DiagnosticsManager to access the new debugger diagnostics tech.
  - Added class DiagnosticsTab, used to represent a tab view in the debugger live diagnostics page.
  - Added class DiagnosticsView, used to represent a single display view within a tab.
  - Added class DiagnosticsStat for representing data to be used with the live diagnostics.
  - Added class DiagnosticsError for diagnostics related errors.
- Added WorldClock class to @minecraft/server in beta
  - Has properties for name, time, and isPaused to retrieve state of the world clock
- Added WorldClockRegistry class to @minecraft/server in beta
  - Has a registerClock function to allow registrations of new world clocks during startup
- Added WorldClockRegistrationError class to @minecraft/server in beta. This is thrown by WorldClockRegistry.registerClock when registration of a world clock fails
- Added WorldClockReloadNewWorldClockError class to @minecraft/server in beta. This is thrown when trying to register a new world clock after reloading scripts
- Added WorldClockInvalidRegistryError class to @minecraft/server in beta. This is thrown when trying to register world clocks outside of the BeforeStartupEvent
- Added WorldClockNotFoundError class to @minecraft/server in beta. This is thrown by World.getClock when a world clock does not exist
- Added WorldClockRegistry to BeforeStartupEvent in beta
- Added getClock function to the World class in beta
- Scripting websockets no longer send a ping packet to the socket server every second, this now send every 45 seconds.
- The minecraft:server_sound_definitions payload in sounds/sound_definitions.json now accepts an optional broadcast_range field on each definition specifying an XZ range in blocks. When set, a broadcast play sound is delivered to players within this range of the sound
- Added TimeMarker class to @minecraft/server in beta
  - Has properties for name, time, and period
- Added WorldClockRegistrationOptions interface to @minecraft/server in beta
- Added TimeMarkerOptions interface to @minecraft/server in beta
- Added WorldClockReloadTimeMarkerError class to @minecraft/server in beta. This is thrown when an existing world clock has an invalid time marker after reloading scripts
- Added WorldClockAddTimeMarkerError class to @minecraft/server in beta. This is thrown by a WorldClock.addTimeMarker when adding a time marker fails
- Added WorldClockRemoveMinecraftTimeMarkerError class to @minecraft/server in beta. This is thrown by WorldClock.removeTimeMarker when trying to remove a time marker with the minecraft: namespace
- Added WorldClockInvalidTimeMarkerError class to @minecraft/server in beta. This is thrown when trying to access data on an invalid time marker minecraft: namespace
- Added WorldClockTimeMarkerNotFoundError class to @minecraft/server in beta. This is thrown by a WorldClock when a time marker does not exist
- Added WorldClockRewindError class to @minecraft/server in beta. This is thrown by WorldClock.rewindTo when the world clock's current time is behind the time marker's first occurrence
- Added WorldClockOnTimeModifiedAfterEvent class to @minecraft/server in beta
  - This event is fired when a world clock's time is directly changed through scripting or commands
- Added WorldClockOnTimeModifiedAfterEventSignal class to @minecraft/server in beta
- Added WorldClockOnPausedAfterEvent class to @minecraft/server in beta
  - This event is fired when a world clock is paused
- Added WorldClockOnPausedAfterEventSignal class to @minecraft/server in beta
- Added WorldClockOnResumedAfterEvent class to @minecraft/server in beta
  - This event is fired when a world clock is resumed
- Added WorldClockOnResumedAfterEventSignal class to @minecraft/server in beta
- Added WorldClockOnTimeMarkerAfterEvent class to @minecraft/server in beta
  - This event is fired when a world clock's time hits a time marker
- Added WorldClockOnTimeMarkerAfterEventSignal class to @minecraft/server in beta
- Added WorldClockOnRestartBeforeEvent class to @minecraft/server in beta
  - This event is fired when a world clock ticks at the maximum time and is about to restart
  - the newTime property on the event can be optionally set to set a custom restart time for the world clock
- Added WorldClockOnRestartBeforeEventSignal class to @minecraft/server in beta
- Added WorldClockEventOptions interface to @minecraft/server in beta
  - Has a clock property to filter out which clock the event should fire for
- Added WorldClockTimeMarkerEventOptions interface to @minecraft/server in beta
  - Has a clock property to filter out which clock the event should fire for
  - Has an optional timeMarker property to filter out which time marker the event should fire for

##### BlockUtilityTasks

- Added the optional directionMask parameter to floodSearch for restricting traversal directions

##### ChatSendBeforeEvent

- The targets property can now be modified to control which players receive the chat message

##### DDUI

- Fixed input and HUD delay after closing Data Driven UI screens
- Added support to show icons for buttons.
- Changed interface DropdownOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface SliderOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface TextFieldOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface TextOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface ToggleOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed class MessageBox
  - Added function button1WithOptions
  - button1WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox
  - Added function button2WithOptions
  - button2WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox
- Changed interface ButtonOptions
  - Added property imageDetails
  - imageDetails?: ImageDetails
- Added interface ImageDetails
- export interface ImageDetails { imagePackId: ObservableString | string; imageSrc: ObservableString | string; }
- Added interface MessageBoxButtonOptions
- export interface MessageBoxButtonOptions { imageDetails?: ImageDetails; tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage; }
- Fixed wrapping for labels and headers when using large texts with no spaces between. [JIRA MCPE-241081] Fix for players when leaving world while having a DDUI screen is open, becoming soft-locked when re-joining.

##### EntityIsTamedComponent

- Added read-only tamedToPlayer and tamedToPlayerId properties to beta that return the player and player id that tamed the entity

##### SoundDurationInfo

- The playback position now restarts at the beginning of each iteration when a looping sound repeats, and a looping sound's duration is only considered complete after all of its iterations have played

##### WorldAfterEvents

- Added the worldClockOnTimeModified event signal to @minecraft/server in beta. This is used to subscribe to world clock time modified events
- Added the worldClockOnPaused event signal to @minecraft/server in beta. This is used to subscribe to world clock paused events
- Added the worldClockOnResumed event signal to @minecraft/server in beta. This is used to subscribe to world clock resumed events
- Added the worldClockOnTimeMarker event signal to @minecraft/server in beta. This is used to subscribe to world clock time marker events

##### WorldBeforeEvents

- Added the worldClockOnRestart event signal to @minecraft/server in beta. This is used to subscribe to world clock restart events

##### WorldClock

- Added timeMarkers property in beta
- Added addTimeMarker function in beta
- Added removeTimeMarker function in beta
- Added set function in beta
- Added skipTo function in beta
- Added rewindTo function in beta

##### WorldClockRegistry

- Added registrationOptions parameter to registerClock function to optionally create time markers during registration in beta

#### Blocks

- Blocks defined with the minecraft:multi_block trait cannot also define the minecraft:random_offset component if the multi-block direction field is horizontal :
- Added the container field to the minecraft:block_entity block component, which gives a custom block a container that holds up to 54 item stacks, persists with the world, drops its contents when the block is broken, and opens a container screen when the block is used
- Replacing a custom block whose minecraft:block_entity declares a container with a different block definition rebuilds its block entity, so the outgoing block drops its container contents rather than handing them to the new block
- Added scripting access to custom block inventories provided by minecraft:block_entity containers

#### Commands

- Add new /time of sub-command for modifying world clocks under the Creator World Clocks Features experiment
  - /time of <clock> add <time> - Adds time to the clock. Cannot result in a negative time
  - /time of <clock> set <time> - Sets the clock to the specified time. Cannot be set to negative.
  - /time of <clock> set <timemarker> (next|previous|stay) - Sets the clock to the occurrence of the time marker. Cannot result in a negative time
  - /time of <clock> pause - Pauses the clock
  - /time of <clock> resume - Resumes the clock
  - /time of <clock> query time - Outputs the clock's current time

#### Features

- Add scripting API to query Points of Interest (POI) in the current dimension

#### Gameplay

- Added the 'Creator World Clocks Features' experiment toggle
- Custom dimension heights defined in a dimension JSON file can once again span the full -512 to 512 block range instead of being capped to the default Overworld heights of -64 to 320 (MCPE-241528)
- Added experimental support for defining point-of-interest types and hierarchical tags in behavior packs
- Added a beta Script API for querying and managing registered points in the current dimension
- Added /locate poi for locating registered points by type or tag

#### Graphical

- Fixed Book and Quill's lighting value when on a Lectern when Block Light Quality is set to Volumetric Lights or above
  - Fixed an issue that caused the brightness of some point lights to oscillate

### Other experiment and beta mentions

- Added @minecraft/server version 2.11.0-beta
- Released interface BlockQueryOptions from beta to v2.10.0
- Released function BlockVolumeBase.getClosest from beta to v2.10.0
- Released function BlockVolumeBase.getFarthest from beta to v2.10.0
- Released function Camera.addShake from beta to V2.10.0
- Released function Camera.stopShaking from beta to V2.10.0
- Released interface CameraShakeOptions from beta to V2.10.0
- Released enum CameraShakeType from beta to V2.10.0
- Released class EntityTamedEventOptionsfrom beta to v2.10.0
- Released class EntityTamedAfterEvent from beta to v2.10.0
- Released class EntityTamedAfterEventSignal from beta to v2.10.0
- Released class EntityTamedBeforeEvent from beta to v2.10.0
- Released class EntityTamedBeforeEventSignal from beta to v2.10.0
- Released interface EntityTamedEventOptions from beta to v2.10.0
- Released property WorldAfterEvents.entityTamed from beta to v2.10.0
- Released property WorldBeforeEvents.entityTamed from beta to v2.10.0
- Moved BlockInstrumentComponent from beta into 2.10.0.
- Released class EntityStartSneakingAfterEvent from beta to v2.10.0
- Released class EntityStartSneakingAfterEventSignal from beta to v2.10.0
- Released class EntityStopSneakingAfterEvent from beta to v2.10.0
- Released class EntityStopSneakingAfterEventSignal from beta to v2.10.0
- Released interface EntitySneakingChangedEventOptions from beta to v2.10.0
- Released property WorldAfterEvents.entityStartSneaking from beta to v2.10.0
- Released property WorldAfterEvents.entityStopSneaking from beta to v2.10.0
- Released Player.fogSettings from beta to v2.10.0
- Released class FogSettings from beta to v2.10.0
- Released class FogSettingsError from beta to v2.10.0
- Released class BlockDynamicPropertiesComponent from beta to V2.10.0.
- Released class ItemBlockDynamicPropertiesComponent from beta to V2.10.0.
- Releasing PrimitiveShapesManager.getShapes from beta to 2.10.0.
- Releasing PrimitiveShapeQueryOptions from beta to 2.10.0.
- Released version 1.0.0 of @minecraft/server-graphics, promoting the module and all of its APIs out of beta
- Moved the cloneBlocks method from beta to v2.10.0, allowing regions of blocks to be cloned from one area of a dimension to another with support for clone modes and an optional block filter
- Added a new multiselect pack setting type, letting pack authors declare a list of options - Molang can query for active options in the multiselect via query.is_pack_setting_selected - world.getPackSettings() now can return an array of strings for multiselect options in @minecraft/server beta - PackSettingsChangeAfterEvent.settingValue now can be an array of strings for multiselect options in @minecraft/server beta
- The block component minecraft:block_entity no longer requires the experimental toggle from format version 1.26.20 onward.
- Released horizontal multi-blocks, these are blocks defined with the minecraft:multi_block trait with a direction field that is horizontal. Upcoming Creator Features experiment is still required for them if format_version is less than 1.26.50
- Moved Block Light Quality Video Settings out of the RenderDragon Features for Creators Experiment
- Some options still require the RenderDragon Features for Creators Experiment
- Released minecaft:sound block component out of experimental

## Minecraft Beta & Preview - 26.60.22/23 (2026-09-08)

Source: https://feedback.minecraft.net/hc/en-us/articles/48740748263565-Minecraft-Beta-Preview-26-60-22-23

### Experimental Technical Updates

#### API

##### DDUI

- Fixed labels removing all whitespace adjacent to formatting codes.
- Added support for multi button row at custom forms in beta.
- New interface `ButtonData`.
  - Field `label: ObservableString | ObservableUIRawMessage | string | UIRawMessage`. Text to display.
  - Field `onClick: () => void`. Action to execute when button is pressed.
  - Field `options?: ButtonOptions`. Additional configuration for the button.
- Class `CustomForm`.
  - New method `multiButtonRow(buttons: ButtonData[], options?: MultiButtonRowOptions): CustomForm;`. Adds a multi button row.'
    - Parameter `buttons` is an array that allows maximum three elements.
    - Parameter `options` contains additional configuration for the row, like visibility.

#### Commands

- Added new overloads to the `/time` command for more control of the Overworld clock under the Creator World Clocks Features experiment
  - `/time pause` - Pauses the Overworld clock
  - `/time resume` - Resumes the Overworld clock
  - `/time query time` - Outputs the Overworld clock's current time
- Replaced `/time set <TimeSpec>` with `/time set <TimeMarker> (next|previous|stay)` under the Creator World Clocks Features experiment
  - Sets the Overworld clock to the occurrence of the time marker. By default this is `next` and works the same as the old `TimeSpec` variation

## Minecraft Beta & Preview - 26.60.21 (2026-09-02)

Source: https://feedback.minecraft.net/hc/en-us/articles/48602411551629-Minecraft-Beta-Preview-26-60-21

### Experimental Technical Updates

#### API

- Custom restart time set in `WorldClockOnRestartBeforeEvent` now properly overrides Overworld clock
- Changes `LevelStorage.saveHold()` to return a `Promise<void>` which resolves when the hold has finished processing in `@minecraft/server-admin` in `beta`
- Changes `LevelStorage.saveQuery()` to return a `Promise<LevelStorageQuerySnapshotFile[]>` which resolves when the query has finished processing in `@minecraft/server-admin` in `beta`
- Changes `LevelStorage.saveResume()` to return a `Promise<void>` which resolves when the resume has finished processing in `@minecraft/server-admin` in `beta`
- Added `class PlayerCraftRecipeAfterEvent` to `beta`
- Added `class PlayerCraftRecipeAfterEventSignal` to `beta`
- Added `interface PlayerCraftRecipeEventOptions` to `beta`
- Added `property WorldAfterEvents.playerCraftRecipe` to `beta`
- Added `class BlockRecipeCraftingComponent` to `beta` for accessing the slots/recipe relating to player crafting UIs (currently only `minecraft:stonecutter_block`)
- Added `class RecipeCraftingContext` to `beta`
- Added `class InvalidRecipeError` to `beta`

##### Server-ui

- Released version 2.3.0 of `@minecraft/server-ui`.
- Added 2.4.0 beta of `@minecraft/server-ui`.

#### Custom Dimensions

- Added the `minecraft:clouds` component, letting custom dimensions configure the height at which clouds render. No component means clouds do not render.

#### Graphical

- Fixed a bug where ghost lights would exist when rapidly removing point light blocks
- Introduced new metrics when deciding point light importance
- Improved light ranking when deciding point light importance
- Introduced score easing during point light ranking

### Other experiment and beta mentions

- Added `@minecraft/server` version 2.12.0-beta
- Releasing `TextPrimitive.lineGapHeight` from beta to 2.11.0.
- Released `Dimension.spawnXp` from beta to scripts version `2.11.0`

## Minecraft Beta & Preview - 26.50.26/27 (2026-08-18)

Source: https://feedback.minecraft.net/hc/en-us/articles/48228443785101-Minecraft-Beta-Preview-26-50-26-27

### Experimental Technical Updates

#### API

- Added `TimeMarker` class to `@minecraft/server` in beta
  - Has properties for `name`, `time`, and `period`
- Added `WorldClockRegistrationOptions` interface to `@minecraft/server` in beta
- Added `TimeMarkerOptions` interface to `@minecraft/server` in beta
- Added `WorldClockReloadTimeMarkerError` class to `@minecraft/server` in beta. This is thrown when an existing world clock has an invalid time marker after reloading scripts
- Added `WorldClockAddTimeMarkerError` class to `@minecraft/server` in beta. This is thrown by a `WorldClock.addTimeMarker` when adding a time marker fails
- Added `WorldClockRemoveMinecraftTimeMarkerError` class to `@minecraft/server` in beta. This is thrown by `WorldClock.removeTimeMarker` when trying to remove a time marker with the `minecraft:` namespace
- Added `WorldClockInvalidTimeMarkerError` class to `@minecraft/server` in beta. This is thrown when trying to access data on an invalid time marker `minecraft:` namespace
- Added `WorldClockTimeMarkerNotFoundError` class to `@minecraft/server` in beta. This is thrown by a `WorldClock` when a time marker does not exist
- Added `WorldClockRewindError` class to `@minecraft/server` in beta. This is thrown by `WorldClock.rewindTo` when the world clock's current time is behind the time marker's first occurrence
- Added `WorldClockOnTimeModifiedAfterEvent` class to `@minecraft/server` in beta
  - This event is fired when a world clock's time is directly changed through scripting or commands
- Added `WorldClockOnTimeModifiedAfterEventSignal` class to `@minecraft/server` in beta
- Added `WorldClockOnPausedAfterEvent` class to `@minecraft/server` in beta
  - This event is fired when a world clock is paused
- Added `WorldClockOnPausedAfterEventSignal` class to `@minecraft/server` in beta
- Added `WorldClockOnResumedAfterEvent` class to `@minecraft/server` in beta
  - This event is fired when a world clock is resumed
- Added `WorldClockOnResumedAfterEventSignal` class to `@minecraft/server` in beta
- Added `WorldClockOnTimeMarkerAfterEvent` class to `@minecraft/server` in beta
  - This event is fired when a world clock's time hits a time marker
- Added `WorldClockOnTimeMarkerAfterEventSignal` class to `@minecraft/server` in beta
- Added `WorldClockOnRestartBeforeEvent` class to `@minecraft/server` in beta
  - This event is fired when a world clock ticks at the maximum time and is about to restart
  - the `newTime` property on the event can be optionally set to set a custom restart time for the world clock
- Added `WorldClockOnRestartBeforeEventSignal` class to `@minecraft/server` in beta
- Added `WorldClockEventOptions` interface to `@minecraft/server` in beta
  - Has a `clock` property to filter out which clock the event should fire for
- Added `WorldClockTimeMarkerEventOptions` interface to `@minecraft/server` in beta
  - Has a `clock` property to filter out which clock the event should fire for
  - Has an optional `timeMarker` property to filter out which time marker the event should fire for

##### DDUI

- Fixed wrapping for labels and headers when using large texts with no spaces between. (MCPE-241081) Fix for players when leaving world while having a DDUI screen is open, becoming soft-locked when re-joining.

##### EntityIsTamedComponent

- Added read-only `tamedToPlayer` and `tamedToPlayerId` properties to `beta` that return the player and player id that tamed the entity

##### WorldAfterEvents

- Added the `worldClockOnTimeModified` event signal to `@minecraft/server` in beta. This is used to subscribe to world clock time modified events
- Added the `worldClockOnPaused` event signal to `@minecraft/server` in beta. This is used to subscribe to world clock paused events
- Added the `worldClockOnResumed` event signal to `@minecraft/server` in beta. This is used to subscribe to world clock resumed events
- Added the `worldClockOnTimeMarker` event signal to `@minecraft/server` in beta. This is used to subscribe to world clock time marker events

##### WorldBeforeEvents

- Added the `worldClockOnRestart` event signal to `@minecraft/server` in beta. This is used to subscribe to world clock restart events

##### WorldClock

- Added `timeMarkers` property in beta
- Added `addTimeMarker` function in beta
- Added `removeTimeMarker` function in beta
- Added `set` function in beta
- Added `skipTo` function in beta
- Added `rewindTo` function in beta

##### WorldClockRegistry

- Added `registrationOptions` parameter to `registerClock` function to optionally create time markers during registration in beta

#### Blocks

- Added the `container` field to the `minecraft:block_entity` block component, which gives a custom block a container that holds up to 54 item stacks, persists with the world, drops its contents when the block is broken, and opens a container screen when the block is used
- Replacing a custom block whose `minecraft:block_entity` declares a `container` with a different block definition rebuilds its block entity, so the outgoing block drops its container contents rather than handing them to the new block
- Added scripting access to custom block inventories provided by `minecraft:block_entity` containers

#### Commands

- Add new `/time of` sub-command for modifying world clocks under the Creator World Clocks Features experiment
  - `/time of <clock> add <time>` - Adds time to the clock. Cannot result in a negative time
  - `/time of <clock> set <time>` - Sets the clock to the specified time. Cannot be set to negative.
  - `/time of <clock> set <timemarker> (next|previous|stay)` - Sets the clock to the occurrence of the time marker. Cannot result in a negative time
  - `/time of <clock> pause` - Pauses the clock
  - `/time of <clock> resume` - Resumes the clock
  - `/time of <clock> query time` - Outputs the clock's current time

#### Gameplay

- Custom dimension heights defined in a dimension JSON file can once again span the full -512 to 512 block range instead of being capped to the default Overworld heights of -64 to 320 (MCPE-241528)
- Added experimental support for defining point-of-interest types and hierarchical tags in behavior packs
- Added a beta Script API for querying and managing registered points in the current dimension
- Added `/locate poi` for locating registered points by type or tag

### Other experiment and beta mentions

- Releasing `PrimitiveShapesManager.getShapes` from beta to 2.10.0.
- Releasing `PrimitiveShapeQueryOptions` from beta to 2.10.0.
- Moved the `cloneBlocks` method from `beta` to `v2.10.0`, allowing regions of blocks to be cloned from one area of a dimension to another with support for clone modes and an optional block filter

## Minecraft Beta & Preview - 26.50.25 (2026-08-11)

Source: https://feedback.minecraft.net/hc/en-us/articles/48053406322829-Minecraft-Beta-Preview-26-50-25

### Experimental Technical Updates

#### API

- Scripting websockets no longer send a ping packet to the socket server every second, this now send every 45 seconds.

### Other experiment and beta mentions

- Released version 1.0.0 of `@minecraft/server-graphics`, promoting the module and all of its APIs out of beta
- `world.getPackSettings()` now can return an array of strings for multiselect options in `@minecraft/server` beta
- `PackSettingsChangeAfterEvent.settingValue` now can be an array of strings for multiselect options in `@minecraft/server` beta
- Released horizontal multi-blocks, these are blocks defined with the `minecraft:multi_block` trait with a `direction` field that is horizontal. Upcoming Creator Features experiment is still required for them if `format_version` is less than 1.26.50

## Minecraft Beta & Preview - 26.50.24 (2026-08-05)

Source: https://feedback.minecraft.net/hc/en-us/articles/47907593889677-Minecraft-Beta-Preview-26-50-24

### Experimental Technical Updates

#### API

- Added new tech and support for using scripting to interface with the VS Code debugger live diagnostics:
  - Added class DiagnosticsManager to access the new debugger diagnostics tech.
  - Added class DiagnosticsTab, used to represent a tab view in the debugger live diagnostics page.
  - Added class DiagnosticsView, used to represent a single display view within a tab.
  - Added class DiagnosticsStat for representing data to be used with the live diagnostics.
  - Added class DiagnosticsError for diagnostics related errors.
- Added WorldClock class to @minecraft/server in beta
  - Has properties for name, time, and isPaused to retrieve state of the world clock
- Added WorldClockRegistry class to @minecraft/server in beta
  - Has a registerClock function to allow registrations of new world clocks during startup
- Added WorldClockRegistrationError class to @minecraft/server in beta. This is thrown by WorldClockRegistry.registerClock when registration of a world clock fails
- Added WorldClockReloadNewWorldClockError class to @minecraft/server in beta. This is thrown when trying to register a new world clock after reloading scripts
- Added WorldClockInvalidRegistryError class to @minecraft/server in beta. This is thrown when trying to register world clocks outside of the BeforeStartupEvent
- Added WorldClockNotFoundError class to @minecraft/server in beta. This is thrown by World.getClock when a world clock does not exist
- Added WorldClockRegistry to BeforeStartupEvent in beta
- Added getClock function to the World class in beta

##### BlockUtilityTasks

- Added the optional directionMask parameter to floodSearch for restricting traversal directions

#### Features

- Add scripting API to query Points of Interest (POI) in the current dimension

#### Graphical

- Fixed Book and Quill's lighting value when on a Lectern when Block Light Quality is set to Volumetric Lights or above
  - Fixed an issue that caused the brightness of some point lights to oscillate

### Other experiment and beta mentions

- The block component minecraft:block_entity no longer requires the experimental toggle from format version 1.26.20 onward.
- Released minecaft:sound block component out of experimental

## Minecraft: Bedrock Edition 26.40 (2026-07-31)

Source: https://feedback.minecraft.net/hc/en-us/articles/47787720931213-Minecraft-Bedrock-Edition-26-40

### Drop 3 Experimental Features

#### Abandoned Camp

- The Abandoned Camp structure is a new kind of structure which can be found in the following biomes:
  - Meadow
  - Cherry Grove
  - Forest
  - Birch Forest
  - Old Growth Birch Forest
  - Flower Forest
  - Windswept Forest
  - Dappled Forest
  - Taiga
  - Snowy Taiga
  - Old Growth Spruce Taiga
  - Old Growth Pine Taiga
  - Sparse Jungle
  - Bamboo Jungle
  - Swamp
  - Savanna
  - Wooded Badlands
  - Pale Garden
- Each of these biomes has its own variant of the structure with design based on that biome
- Certain structure pieces are generic for all biome variants of the structure
- Various Chests and Barrels with loot can be found at Abandoned Camps
- Abandoned camp now generates in Pale Garden and Flower Forest biomes (MCPE-240024) (MCPE-240045)
- Straw Beds can now be found in Abandoned Camps
- Updated Abandoned Camps to place procedural trees
- Fixed wrong potion names in the loot tables for the Abandoned Camp

#### Dappled Forest

- The Dappled Forest is a new type of forest biome which can be found near cold biomes
- Poplar Trees and fallen Poplar Trees generate here
- Shelf Mushrooms can be found here, placed on Poplar Trees and fallen Poplar Trees
- Red Shrubs generate here
- The following passive and neutral mobs spawn in the Dappled Forest, using their cold variants where applicable:
  - Sheep
  - Chicken
  - Cow
  - Pig
  - Rabbit
  - Fox
- A Dappled Forest variant of the new Abandoned Camp structure can be found here
- Changed biome fog settings to match other forest biomes
- Updated Orange, Red & Yellow Poplar Leaves MERS textures

#### Graphical

- Added opaque versions to the Poplar leaves to fix black background issue (MCPE-240020)
- Added hinges to Poplar door icon. Also removed 3 pixels from top door texture that didn't match the palette
- Fixed Poplar sign texture to follow other sign assets

#### Poplar Trees

- Added the Poplar Tree to the game
  - A new type of tree in the Dappled Forest which comes in three color variations:
  - Red Poplar Leaves
  - Orange Poplar Leaves
  - Yellow Poplar Leaves
- Each variant of the tree has its own variant of falling leaf particles matching the color of the leaves
- Poplar Leaves drop Poplar Saplings which will randomly grow into any of the three different variants
- Poplar Saplings can be found in trades with Wandering Trader
- Shelf Mushrooms and Leaf Litter naturally generates on and around Poplar Trees
- The trunk of the trees are made of Poplar Logs
- Poplar Logs can be crafted into a new set of Poplar wood blocks
- Forest ambience sounds are tied to the Poplar Leaf blocks
- Known issue: Some Vibrant Visuals settings are currently not being applied correctly to Poplar Leaf blocks

#### Red Shrub

- Red Shrub is a new type of decorative plant block that can be found in small patches in the Dappled Forest
- Can be used in the Composter
- Using Bone Meal on a Red Shrub grows a Red Shrub in a random adjacent space if possible

#### Shelf Mushroom

- A new type of mushroom that generates on Poplar Trees and fallen Poplar Trees
- Can be found in two sizes, small and large
- A small Shelf Mushroom can be grown into a large Shelf Mushroom using Bone Meal
- A large Shelf Mushroom drops two Shelf Mushroom items when broken
- Can be used like other mushrooms to make Stews
- Can be found in trades with Wandering Trader
- Shelf Mushroom has a slight bounciness when stepped on, similar to Beds

#### Sounds

- Updated ambient sounds for Poplar leaf blocks
- Added custom sound events for Red Shrubs and Poplar leaf blocks

#### Blocks

- Added Wool Stair blocks and Wool Slab blocks of the following colors:
  - Black
  - Blue
  - Brown
  - Cyan
  - Gray
  - Green
  - Light Blue
  - Light Gray
  - Lime
  - Magenta
  - Orange
  - Pink
  - Purple
  - Red
  - White
  - Yellow

#### Cushion

- The Cushion is an item that the player can place in the world and interact with to sit on
- Can be crafted in 16 colored variants
- Cushions are crafted using 3 Wool Slabs of the same color
- Known Issue: Cushions aren't currently generating in the Abandoned Camps, but can be found in the creative inventory

##### Cushion Placement Rules

- A cushion can be placed on any flat surface
- Cushions always align horizontally to the grid, but vertically sit on top of the supporting surface
- Cushions cannot move
- Cushions break if the supporting block is removed
- Cushions do not have collision and can overlap with other objects (except other cushions)

#### Straw Bed

- Straw Bed is a new type of bed which can be used to sleep through the night without setting your spawn point
- It can only be used once and will be destroyed after use
- It can not be used in the Nether or The End and will be destroyed if you try to sleep on it there
- It is crafted using 3 Hay Bales and will give you 4 Straw Beds

### Experimental Technical Updates

#### Add-Ons

- Improved the experimental JSON document upgrader: configuration parsing errors are now surfaced through the upgrader's error logging, errors that abort an upgrade are recorded in the error log, and files found outside of a pack are ignored instead of failing the run

#### API

- Added a new loot function CarryOverBlockEntityDataFunction with a single boolean field "dynamic_properties" behind beta
- Added ItemBlockDynamicPropertiesComponent item component behind beta
  - It may be retrieved on an item that resulted from a carry_over_block_entity_data loot function
  - It has two methods, get and totalByteCount which work like their block component counterparts
- Added EntityStartSneakingAfterEvent and EntityStartSneakingAfterEventSignal to beta.
- Added EntityStopSneakingAfterEvent and EntityStopSneakingAfterEventSignal to beta.
- Added clear() to AllowList in @minecraft/server-admin in beta
- Added setVolume, setPitch, fade, and seekTo methods to SoundInstance in beta
- Added loopCount option to PlayerSoundOptions and WorldSoundOptions in beta
- Infinitely-looping sounds (loopCount: -1) stop automatically when the last SoundInstance reference is dropped; retain the handle to keep the sound playing
- Added enum CameraShakeType to beta
- Added interface CameraShakeOptions to beta
- Added function Camera.addShake to beta
- Added function Camera.stopShaking to beta
- Added class EntityTamedAfterEvent to beta
- Added class EntityTamedAfterEventSignal to beta
- Added interface EntityTamedEventFilter to beta
- Added property WorldAfterEvents.entityTamed to beta
- Added interface BlockQueryOptions to beta
- Changed Dimension.getBlocks in beta to accept BlockQueryOptions instead of BlockFilter which adds support for closest, farthest, and location options
- SoundInstance in beta now exposes a soundEventId property that reports the sound event the instance was started with
- SoundInstance in beta now exposes a recipient property that returns the Player the sound was played for, or undefined for broadcast sounds
- SoundInstance in beta now exposes a durationInfo property that returns a SoundDurationInfo when the underlying sound definition includes duration information, otherwise undefined
- Added SoundDurationInfo in beta with a duration property, an isActive property, and a getPlaybackPosition() getter that returns the elapsed playback time in seconds
- SoundInstance now exposes an id property that returns a unique identifier for the instance
- WorldAfterEvents in beta now exposes a soundCompleted signal with a soundInstanceId property that matches the id of the SoundInstance that completed that fires when a tracked sound's declared duration elapses
- Added API for minecraft:instrument_sound component
  - it has a getInstrumentName function to get the assigned instrument given a valid facing Direction
  - it has a playInstrumentSound function to play the instrument sound assinged to a given valid facing Direction
  - the component can be obtained from any custom or vanilla block; if a block does not have the component explicitly defined, then a component with the default sounds will be returned
- Fixed PlayerStartBreakingBlock and PlayerCancelBreakingBlock from firing when a block can't be broken by item in creative
- Changed property name playfabId on Player class to persistentId in @minecraft/server in beta.
- Added property splitScreenSlot to @minecraft/server-admin's AsyncPlayerJoinBeforeEvent in beta
- Added enum PlayerScriptScreenSlot to @minecraft/server in 2.9.0
- Added method getSplitScreenSlot to @minecraft/server's Player in beta
- Changed beta method getPing of @minecraft/server's Player to have restricted execution privilege
- Added BlockVolumeBase.getClosest to beta. Returns the closest N block positions in a volume to a given location sorted by distance
- Added BlockVolumeBase.getFarthest to beta. Returns the farthest N block positions in a volume from a given location sorted by distance
- Added class EntityTamedBeforeEvent to beta
- Added class EntityTamedBeforeEventSignal to beta
- Added property WorldBeforeEvents.entityTamed to beta
- Added SoundDefinition class to beta with read-only soundEventId and durationInfo properties
- Added SoundDefinitionDurationInfo interface to beta with a duration property
- Added SoundDefinitionFilter interface to beta with optional minDuration and maxDuration properties
- Added SoundDefinitionRegistry class to beta with a getDefinitions method that returns the loaded sound definitions, optionally narrowed by a filter
- Added World.soundDefinitionRegistry property to beta that provides read-only access to the sound definitions loaded for the world
- Player.playSound now accepts a SoundDefinition in addition to a sound id string in beta
- Added SoundDefinition class to beta with read-only soundEventId and durationInfo properties
- Added SoundDefinitionDurationInfo interface to beta with a duration property
- Added SoundDefinitionFilter interface to beta with optional minDuration and maxDuration properties
- Added SoundDefinitionRegistry class to beta with a getDefinitions method that returns the loaded sound definitions, optionally narrowed by a filter
- Added World.soundDefinitionRegistry property to beta that provides read-only access to the sound definitions loaded for the world
- Player.playSound now accepts a SoundDefinition in addition to a sound id string in beta
- The minecraft:server_sound_definitions payload in sounds/sound_definitions.json now accepts an optional music_info block on each definition with optional genres (array of strings), moods (array of strings), artist (string), and title (string) fields that describe the music content of the sound
- The minecraft:server_sound_definitions payload now accepts an optional tags map on each definition where each entry is a tag name mapped to either a single string value or an array of string values, letting behavior packs attach arbitrary metadata to a server sound definition
}, "music_info": { "genres": ["electronic", "ambient"], "moods": ["calm"], "artist": "Some Artist", "title": "My Cool Song" }, "tags": { "category": "background", "regions": ["overworld", "nether"]
- Added new beta interface SoundDefinitionMusicInfo with optional genres, moods, artist, and title properties describing the music content of a sound definition
- Added new optional beta property SoundDefinition.musicInfo exposing the music metadata declared on a server sound definition
- Added new optional beta property SoundDefinition.tags exposing the arbitrary tag metadata declared on a server sound definition
- Added new optional beta properties on SoundDefinitionFilter for filtering by music metadata and tags: genres, moods, artists, titles, and tags. All comparisons are case-insensitive. An omitted field does not filter; a non-empty array matches when any provided value overlaps the definition's values
- Added getShapes method on PrimitiveShapesManager.
- Added interface PrimitiveShapeQueryOptions for use with getShapes.
- Added AllowListEntry to @minecraft/server-admin with optional name and xuid properties in beta
- AllowList changes in @minecraft/server-admin all in beta
  - Added entries: AllowListEntry[] property
  - Changed add() to accept either a Player or AllowListEntry and removed accepting string as parameter. Adds InvalidArgumentError to this function when AllowListEntry has both name and xuid properties set to undefined.
  - Changed remove() to accept either a Player or AllowListEntry and removed accepting string as parameter. Adds InvalidArgumentError to this function when AllowListEntry has both name and xuid properties set to undefined.
  - Changed contains() to accept either a Player or AllowListEntry and removed accepting string as parameter. Adds InvalidArgumentError to this function when AllowListEntry has both name and xuid properties set to undefined.
- Added new beta enum CloneMode with values Copy, ForceCopy, and Move that specifies how blocks are cloned between regions

##### Dimension

- Added cloneBlocks method to beta that clones a region of blocks from one area of the dimension to another, with support for clone modes and an optional block filter

##### SoundDurationInfo

- The playback position now reflects calls to SoundInstance.seekTo
- While a sound is paused via SoundInstance.pause, the playback position no longer advances; SoundInstance.resume continues from where it was paused

#### Blocks

- When applying a "minecraft:sixteen_way_rotation" value via console command, autocomplete suggestions will now correctly show numbers 0-15. Sixteen-way placement direction block trait now applies its rotation with the same orientation as existing Cardinal Direction and Facing Direction traits.
- Added some trait restrictions for blocks with the minecraft:multi_block trait
  - Cannot also define the minecraft:connection trait
  - Cannot also define the minecraft:placement_position trait
  - If the minecraft:placement_direction is defined, only the minecraft:cardinal_direction state is allowed to be enabled
  - The component minecraft:geometry cannot define n_way_visual_rotation for multi-blocks
  - Cannot also define the minecraft:block_entity component
- Each pack now has its own 1KBytes block dynamic properties limit instead of being global
  - Storage structure was updated, your saved properties will be lost
- Block-entity's dynamic-properties are now serialized in a readable NBT format, similar to their item-stack and entity counterparts
- Block-entity's dynamic-properties stored on an item-stack can now be modified through the new set method
- Block dynamic properties are now bucketed by manifest-UUID rather than module-UUID
- Added support for y_rotation_offset when using the minecraft:sixteen_way_rotation placement direction block trait.
- Added horizontal "direction" support for the minecraft:multi_block trait. These new directions "north", "south", "west", "east" still require Upcoming Creator Features experiment to be enabled. When placing horizontal multi-blocks if one or more parts go into an unloaded LevelChunk then the placement of all parts is delayed until both LevelChunks are loaded, delayed placement actions are persistent and saved to Level storage until they are executed. If placing the horizontal multi-block in a structure template, and then rotating the structure, the block parts will only rotate properly if the multi-block is also defined with the minecraft:placement_direction trait enabling the minecraft:cardinal_direction state, otherwise the multi-block parts will not respect the structures rotation

##### Voxel Shapes

- Added occlusion voxel shapes for one-arm, two-arm, three-arm, four-arm, and full-arm wall connections. These shapes will be applied to all Wall variations when the Voxel Shapes experiment is enabled. These shapes improve face culling so that hidden faces of custom blocks are correctly removed when attached to different Wall geometries: single posts, wall runs, corners, T-junctions, intersections, and wall clusters

##### DDUI

- Fixing default behavior for close button bellow DDUI custom forms
  - Default visibility value is false

#### Editor

- Removed and replaced uses of minecraft/server CompoundBlockVolume in the Experimental API with the beta minecraft/server-editor RelativeVolumeListBlockVolume

#### Items

- Added a new loot function "carry_over_block_entity_data" with a single boolean field "dynamic_properties" defaulted to false
  - When looting a block with a block-entity and dynamic-properties, it will try to carry its dynamic-properties over to the created item-stack
  - Requires "Upcoming Creator Features Experiment"

#### Jigsaw Structures

- A Jigsaw Structure's layout will now be persisted to disk if any intersecting chunks are saved. This makes partially saved Jigsaw Structures less prone to breaking because of configuration changes. The feature will be incrementally rolled out to online devices and Realms.

#### Sounds

- Added a new minecraft:server_sound_definitions payload to sounds/sound_definitions.json that lets behavior packs declare server-side sound definitions for sounds played from script
- Each definition can include an optional duration_info with a seconds length and a mode that controls how playback time is tracked
- A mode of game_time means the duration is tracked by ticks
- A mode of real_time means the duration is tracked by wall-clock time
Example:
{ "format_version": "beta", "minecraft:server_sound_definitions": [ { "sound_event_name": "creatorpack:my_cool_song", "duration_info": { "mode": "game_time", "seconds": 180.0 } }, { "sound_event_name": "creatorpack:my_other_song", "duration_info": { "mode": "real_time", "seconds": 12.5 } }, { "sound_event_name": "creatorpack:ambient_loop" } ] }
- Fixed a crash that occurred when loading a behavior pack containing a sounds/sound_definitions.json file with the minecraft:server_sound_definitions payload
- Added minecaft:sound block component
  - it requires format version 1.26.20 and Experimental Upcoming Creator Features
  - it can be used to assign a set of sounds to block and its permutations similar to sound field in blocks.json
  - blocks.json overrides values of minecraft:sound component, including values in all permutations
{ "format_version": "1.26.20", "minecraft:block": { "description": { "identifier": "test:test_block" }, "components": { "minecraft:sound": { "sound": "glass" } } } }

#### User Interface

- Removed the Point Light Shadow Quality slider and merged its functionality into the Point Light Quality slider. These sliders are available only when the "RenderDragon Features for Creators" experiment toggle is enabled for Vibrant Visuals.

### Other experiment and beta mentions

- Custom stairs can now form corners with vanilla stairs outside of Beta
- The "Bounce" music disc can now be found in abandoned mineshafts when the "Villager Trade Rebalancing" experiment is enabled
- The Marketplace Pass accordion is now hidden when the player is in any beta
- When the player is in a beta on PlayStation, Nintendo or iOS, the "Get more" Marketplace button is hidden as well
- The Marketplace Pass accordion is now hidden when the player is in any beta
- When the player is in a beta on PlayStation or iOS, the "Get more" Marketplace button is hidden as well
- Added @minecraft/server version 2.10.0-beta
- Moved nameplateDepthTested and nameplateRenderDistance from beta to V2.8.0
- Moved SoundInstance class from beta to V1.2.0.
- Moved SoundInstance.stop from beta to V2.9.0.
- Moved Player.playSound returning a SoundInstance from beta to V1.2.0.
- Moved Dimension.playSound returning a SoundInstance from beta to V1.11.0.
- Released Block.getParts from beta to scripts version 2.9.0
- Changed EntityFogComponent -> FogSettings, EntityFogComponentError -> FogSettingsError, and added fogSettings property to Player in @minecraft/server beta. FogSettings is functionally identical to EntityFogComponent but is no longer accessed via Entity.getComponent, use Player.fogSettings instead.
- Released class PlayerStartBreakingBlockAfterEvent from beta to v2.9.0
- Released class PlayerStartBreakingBlockAfterEventSignal from beta to v2.9.0
- Released class PlayerCancelBreakingBlockAfterEvent from beta to v2.9.0
- Released class PlayerCancelBreakingBlockAfterEventSignal from beta to v2.9.0
- Released interface PlayerBreakingBlockEventOptions from beta to v2.9.0
- Renamed Dimension.findClosestBiome to Dimension.calculateClosestBiomeFromSeed and released from beta to scripts version 2.9.0
- Released BiomeSearchOptions from beta to scripts version 2.9.0
- Released LootItem.conditions in @minecraft/server v2.9.0 (moved from beta to stable)
- Released minecraft:multi_block trait. However, for the field "direction" horizontal directions will still require Upcoming Creator Features experiment
- N-way rotation on geometry components no longer requires upcoming creator features experiment
- minecraft:sixteen_way_rotation state on placement direction block trait no longer requires upcoming creator features experiment
- Released the minecraft:instrument_sound component from experimental.
- Vanilla blocks defined with shapes in the shapes/ folder now use voxel-shape based culling without requiring the Voxel Shapes experiment. This will allow custom blocks using voxel-shapes to attempt to cull against any vanilla block with a voxel-shape
- The component is no longer in Beta
- Updated item schema validation so minecraft:item.components now requires at least one component entry for item documents in v1_26_30 and beta

## Minecraft Beta & Preview - 26.50.22 (2026-07-28)

Source: https://feedback.minecraft.net/hc/en-us/articles/47702557761805-Minecraft-Beta-Preview-26-50-22

### Experimental Technical Updates

#### API

- Changed the following beta APIs in @minecraft/server-admin
  - Changed arguments for AllowList.add() take an AllowListEntryNameInfo and boolean to allow this player to ignore player limits when joining the server.
  - Changed arguments for AllowList.contains() to take an AllowListEntryNameInfo
  - Changed arguments for AllowList.remove() to take an AllowListEntryNameInfo
  - Added property ignoresPlayerLimit to AllowListEntry
  - Added new AllowListEntryNameInfo

##### ChatSendBeforeEvent

- The targets property can now be modified to control which players receive the chat message

##### DDUI

- Fixed input and HUD delay after closing Data Driven UI screens

### Other experiment and beta mentions

- Removed the experimental toggle for Drop 3 2026 features and made them available by default
- Released class EntityStartSneakingAfterEvent from beta to v2.10.0
- Released class EntityStartSneakingAfterEventSignal from beta to v2.10.0
- Released class EntityStopSneakingAfterEvent from beta to v2.10.0
- Released class EntityStopSneakingAfterEventSignal from beta to v2.10.0
- Released interface EntitySneakingChangedEventOptions from beta to v2.10.0
- Released property WorldAfterEvents.entityStartSneaking from beta to v2.10.0
- Released property WorldAfterEvents.entityStopSneaking from beta to v2.10.0
- Released Player.fogSettings from beta to v2.10.0
- Released class FogSettings from beta to v2.10.0
- Released class FogSettingsError from beta to v2.10.0
- Released class BlockDynamicPropertiesComponent from beta to V2.10.0.
- Released class ItemBlockDynamicPropertiesComponent from beta to V2.10.0.

## Minecraft Beta & Preview - 26.50.20 (2026-07-21)

Source: https://feedback.minecraft.net/hc/en-us/articles/47534782342797-Minecraft-Beta-Preview-26-50-20

### Drop 3 Experimental Features

#### Abandoned Camp

- Cushions now generate inside Abandoned Camps with the correct position, rotation, and color
- Abandoned Camps now generate the variant matching their biome instead of the generic Forest variant in specialized forest biomes
- Secret Chests in Abandoned Camps can now contain their intended Diamond and Potion loot and no longer generate Oxidized Copper Chains instead

#### Accessibility

- Added localized closed captions for jumping and landing on Poplar Leaves (MCPE-240465)

#### Blocks

- Poplar Saplings can now be composted (MCPE-240015)
- Shelf Mushrooms now burn correctly when exposed to lava
- Wool Stairs and Wool Slabs no longer conduct Redstone signals (MCPE-240018)
- Fixed the stretched mining/cracking overlay when mining a Straw Bed (MCPE-240484)
- Players will no longer fall through a Shelf Mushroom when growing it whilst standing upon it
- Red Shrubs can now be snowlogged
- Added breaking particles to the Shelf Mushroom

#### Cushion

- Players can now place Cushions next to each other when aiming the crosshair close to an already placed Cushion
- Players are no longer moved into the ground when a Cushion they are sitting on is destroyed by Lava
- Collecting any ingredient from a Cushion recipe now unlocks it in the Recipe Book and displays the recipe unlock Toast notification
- Cushion name is now correctly translated (MCPE-240461)
- Nudged the Cushion placement downwards slightly (MCPE-240468)
- Increased the sitting height on the Cushion by one texel (MCPE-240499)

#### Graphical

- Fixed poplar sign UI texture to be in parity with Java
- Fixed Hay Bale to be symmetrical (MCPE-240723)
- Fixed Poplar log top to have the correct color palette

#### Mobs

- Wolves spawned in Dappled Forests now use the Pale Wolf variant
- Wandering Traders can now offer Poplar Logs

### Experimental Technical Updates

#### API

- Added lineHeightOverride property to both TextPrimitive and DebugText. .

##### DDUI

Added support to show icons for buttons.
- Changed interface DropdownOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface SliderOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface TextFieldOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface TextOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed interface ToggleOptions
  - Added property tooltip in beta
  - tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage
- Changed class MessageBox
  - Added function button1WithOptions
  - button1WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox
  - Added function button2WithOptions
  - button2WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox
- Changed interface ButtonOptions
  - Added property imageDetails
  - imageDetails?: ImageDetails
- Added interface ImageDetails
- export interface ImageDetails { imagePackId: ObservableString | string; imageSrc: ObservableString | string; }
- Added interface MessageBoxButtonOptions
- export interface MessageBoxButtonOptions { imageDetails?: ImageDetails; tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage; }

##### SoundDurationInfo

- The playback position now restarts at the beginning of each iteration when a looping sound repeats, and a looping sound's duration is only considered complete after all of its iterations have played

#### Blocks

- Blocks defined with the minecraft:multi_block trait cannot also define the minecraft:random_offset component if the multi-block direction field is horizontal :

#### Gameplay

- Added the 'Creator World Clocks Features' experiment toggle

### Other experiment and beta mentions

- Added @minecraft/server version 2.11.0-beta
- Released interface BlockQueryOptions from beta to v2.10.0
- Released function BlockVolumeBase.getClosest from beta to v2.10.0
- Released function BlockVolumeBase.getFarthest from beta to v2.10.0
- Released function Camera.addShake from beta to V2.10.0
- Released function Camera.stopShaking from beta to V2.10.0
- Released interface CameraShakeOptions from beta to V2.10.0
- Released enum CameraShakeType from beta to V2.10.0
- Released class EntityTamedEventOptionsfrom beta to v2.10.0
- Released class EntityTamedAfterEvent from beta to v2.10.0
- Released class EntityTamedAfterEventSignal from beta to v2.10.0
- Released class EntityTamedBeforeEvent from beta to v2.10.0
- Released class EntityTamedBeforeEventSignal from beta to v2.10.0
- Released interface EntityTamedEventOptions from beta to v2.10.0
- Released property WorldAfterEvents.entityTamed from beta to v2.10.0
- Released property WorldBeforeEvents.entityTamed from beta to v2.10.0
- Moved BlockInstrumentComponent from beta into 2.10.0.
- Moved Block Light Quality Video Settings out of the RenderDragon Features for Creators Experiment
- Some options still require the RenderDragon Features for Creators Experiment
