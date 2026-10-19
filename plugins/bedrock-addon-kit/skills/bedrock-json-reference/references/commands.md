# Commands

Generated 2026-10-19 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/command). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Documents and sub-objects (139)

### argument (argument)

Defines a single command argument (name and description) used in command documentation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | Name |
| `description` | stringArray |  | Description |

### cmd_aimassist (cmd_aimassist)

Enable Aim Assist

| Field | Type | Default | Notes |
|---|---|---|---|
| `players` | object |  | players See `type_selection`. |
| `set` |  |  | set |
| `x_angle` | object |  | x angle See `type_val`. |
| `y_angle` | object |  | y angle See `type_val`. |
| `max_distance` | object |  | max distance See `type_val`. |
| `target_mode` |  |  | target mode |
| `preset_id` | object |  | preset id See `type_id`. |
| `clear` |  |  | clear |

### cmd_allowlist (cmd_allowlist)

Manages the server allowlist.

| Field | Type | Default | Notes |
|---|---|---|---|
| `action` |  |  | The allowlist action to perform: add, remove, list, or reload. |
| `name` | object |  | The player name to add to or remove from the allowlist. See `type_id`. |

### cmd_camera (cmd_camera)

_since 1.20.30_

Transforms the camera for the selected player(s) to a different perspective.

> In 1.26.0, the experimental Creator Camera toggle adds the `play_spline` keyword to `/camera`, which plays a spline defined under `camera/splines/` in a behavior pack. Splines only play on the `minecraft:free` camera preset.

| Field | Type | Default | Notes |
|---|---|---|---|
| `players` | object |  | A target selector of players. See `type_selection`. |
| `set` |  |  | Applies a camera preset to the selected players, with optional position, rotation, easing, and offset settings. |
| `preset` |  |  | A camera preset defined in a camera JSON file. |
| `ease` |  |  | Signifies the start of a section for defining ease override parameters. |
| `easetime` | object |  | Specified time for the easing. See `type_val`. |
| `easetype` |  |  | Specified type of the easing to use. |
| `pos` |  |  | A subsection of the command for defining a position. |
| `position` | object |  | The position to locate the camera at. See `type_position_float`. |
| `rot` |  |  | Specifies a subsection of the command for defining a rotation. |
| `xrot` | object |  | x Rotation value See `type_rval`. |
| `yrot` | object |  | y Rotation value See `type_rval`. |
| `facing` |  |  | Specifies a facing section of the camera command. |
| `lookatentity` | object |  | A target selector to use for looking at an entity. See `type_selection`. |
| `lookatposition` | object |  | A position to look at. See `type_position_float`. |
| `default` |  |  | Specifies that the camera movement should be reset to its default parameters. |
| `attach_to_entity` |  |  | Attaches the camera to an entity so it follows that entity's movement. |
| `entity` | object |  | The target entity to attach to or focus on. See `type_selection`. |
| `detach_from_entity` |  |  | Detaches the camera from an entity it was previously attached to. |
| `targetentity` |  |  | Sets a target entity that the camera should continuously look at while maintaining its current position. |
| `targetcenteroffset` |  |  | Specifies an offset from the center of the target entity for the camera to look at. |
| `xtargetcenteroffset` | object |  | X offset from the center of a targeted entity See `type_val`. |
| `ytargetcenteroffset` | object |  | Y offset from the center of a targeted entity See `type_val`. |
| `ztargetcenteroffset` | object |  | Z offset from the center of a targeted entity See `type_val`. |
| `removetarget` |  |  | Removes the camera's target entity, so the camera no longer tracks any entity. |
| `view_offset` |  |  | Specifies a 2D offset from the camera's view center. |
| `xviewoffset` | object |  | X component of a view offset See `type_val`. |
| `yviewoffset` | object |  | Y component of a view offset See `type_val`. |
| `entity_offset` |  |  | entity_offset |
| `xentityoffset` | object |  | xEntityOffset See `type_val`. |
| `yentityoffset` | object |  | yEntityOffset See `type_val`. |
| `zentityoffset` | object |  | zEntityOffset See `type_val`. |
| `clear` |  |  | Clears all active camera changes and returns to the default camera. |
| `fade` |  |  | Applies a screen fade effect with optional timing and color. |
| `time` | object |  | Specifies the start of a time section of a camera command. See `type_time`. |
| `fadeinseconds` | object |  | Specifies a fade-in time value. See `type_val`. |
| `holdseconds` | object |  | Specifies the amount of time to hold the camera view. See `type_val`. |
| `fadeoutseconds` | object |  | Specifies the number of seconds to fade out the camera. See `type_val`. |
| `color` |  |  | Specifies the start of a color section of a camera set command. |
| `red` | object |  | Red component of a color value. Valid values are between 0 and 255. See `type_int`. |
| `green` | object |  | Green component of a color value. Valid values are between 0 and 255. See `type_int`. |
| `blue` | object |  | Blue component of a color value. Valid values are between 0 and 255. See `type_int`. |
| `fov_set` |  |  | since 1.21.110. Sets a custom field of view with optional easing. |
| `fov_value` | object |  | since 1.21.110. fov_value See `type_val`. |
| `foveasetime` | object |  | since 1.21.110. fovEaseTime See `type_val`. |
| `foveasetype` |  |  | since 1.21.110. fovEaseType |
| `fov_clear` |  |  | since 1.21.110. Resets the field of view back to the default value. |

### cmd_camerashake (cmd_camerashake)

Applies shaking to the players' camera with specified intensity and duration. Parameters: 'stop' or 'add' the effect, specify player (target), intensity (float, min 0.0 to max 4.0), seconds(float, min 0.01), and shakeType (positional or rotational). Must have `Allow Camera Shake` option turned on in user settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `action` |  |  | action |
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `intensity` | object |  | Optional. Default `0.5`. A `float` that specifies the camera shake intensity with values from [0, 4]. See `type_val`. |
| `seconds` | object |  | Optional. A `float` that specifies how long the camera will shake. Default: `1.0`. See `type_val`. |
| `shaketype` |  |  | Optional. Either `positional` or `rotational` camera shake type. Default: `positional`. |

### cmd_changesetting (cmd_changesetting)

Changes a setting on the dedicated server while it's running.

| Field | Type | Default | Notes |
|---|---|---|---|
| `setting` |  |  | setting |
| `value` | object |  | The value to set. See `type_boolean`. |
| `difficultyvalue` |  |  | The difficulty value to set. |
| `difficultyint` | object |  | The difficulty value as an integer (0=Peaceful, 1=Easy, 2=Normal, 3=Hard). See `type_int`. |

### cmd_clear (cmd_clear)

Clears items from player inventory.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | Player selector. May be a player name `string` or a [selected target](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) of type player. See `type_selection`. |
| `itemname` | object |  | The item to clear. Clears all items if no specified. Item`ID`or block id. See `type_item`. |
| `data` | object |  | The `item id` to be cleared. If not specified, all will be cleared. Default: `-1`. See `type_int`. |
| `maxcount` | object |  | An `integer` that specifies how many items to clear. Default: `-1`. See `type_int`. |

### cmd_clearspawnpoint (cmd_clearspawnpoint)

Removes the spawn point for a player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | The player whose checkpoint should be cleared. When using this command in a command block, a [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) or player name must be specified. When using this com… See `type_selection`. |

### cmd_clone (cmd_clone)

Clones a set of blocks from one region to another.

> As of 1.19.70, the legacy numeric block `data` value parameter is no longer supported. Use a block states array instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `begin` | object |  | A `vector` that specifies the location in `x`, `y`, and `z` coordinates of `float` type. See `type_position`. |
| `end` | object |  | A `vector` that specifies the location in `x`, `y`, and `z` coordinates of `float` type. See `type_position`. |
| `destination` | object |  | A `vector` that specifies the location in `x`, `y`, and `z` coordinates of `float` type. The lower northwest corner of the region being cloned. See `type_position`. |
| `maskmode` |  |  | An `enum` that filters the blocks being cloned. If type `masked`, copy non-air blocks. |
| `clonemode` |  |  | An `enum` that is one of type `force`, `move`, or `normal`. Default: `normal`. |
| `tilename` | object |  | An `enum` that must be the `block name` of the blocks that are to be cloned. See `type_block`. |
| `blockstates` |  |  | An `array` of block states. Specifies the block states to use for the cloned blocks. |

### cmd_controlscheme (cmd_controlscheme)

_since 1.21.90_

Sets or clears control schemes for the camera(s) of selected player(s).

| Field | Type | Default | Notes |
|---|---|---|---|
| `players` | object |  | A target selector of player(s). See `type_selection`. |
| `set` |  |  | set |
| `control_scheme` |  |  | The control scheme to apply. |
| `clear` |  |  | clear |

### cmd_damage (cmd_damage)

Apply damage to the specified entities. See more in the [Damage Command documentation](https://learn.microsoft.com/minecraft/creator/documents/commandsdamageintroduction).

| Field | Type | Default | Notes |
|---|---|---|---|
| `target` | object |  | Required. The target to damage. A player name or [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors). See `type_selection`. |
| `amount` | object |  | Required. Default `0`. An `integer` that specifies the amount of damage. See `type_int`. |
| `cause` |  |  | Optional. Default `none`. An `enum` of the damage cause. |
| `origin` |  |  | origin |
| `damager` | object |  | A `selector` that specifies which entity will be treated as dealing the damage to the target. Should be one entity or player. See `type_selection`. |

### cmd_daylock (cmd_daylock)

Locks and unlocks the day-night cycle.

| Field | Type | Default | Notes |
|---|---|---|---|
| `lock` | object |  | Default `true`. An `enum` of default `true` which locks daytime or `false`. See `type_boolean`. |

### cmd_deop (cmd_deop)

Revokes operator status from a player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | Required. Specifies which player to remove operator from. A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |

### cmd_dialogue (cmd_dialogue)

Opens NPC dialogue for a player. See the page on the [Dialogue documentation](https://learn.microsoft.com/en-us/minecraft/creator/documents/npcdialogue#dialogue-command) for more information.

| Field | Type | Default | Notes |
|---|---|---|---|
| `open` |  |  | open |
| `npc` | object |  | Required. The target for the NPC menu. Must be a [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) for an entity with type NPC. See `type_selection`. |
| `player` | object |  | Target to display menu. A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `scenename` | object |  | A `string` that specifies the scene file to run from the behavior pack. See `type_id`. |
| `change` |  |  | change |
| `players` | object |  | Target to display menu. A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |

### cmd_difficulty (cmd_difficulty)

Sets the difficulty level (Peaceful, Easy, Normal, Hard) using difficulty enum or integer.

| Field | Type | Default | Notes |
|---|---|---|---|
| `difficulty` | object |  | Set the difficulty using the Difficult enum: `p` or `peaceful`, `e` or `easy`, `n` or `normal`, `h` or `hard`. See `type_difficulty`. |

### cmd_effect (cmd_effect)

Add or clear status effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | The player to receive the effect. A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `mode` |  |  | Mode |
| `effect` | object |  | An `enum` to specify the effect being added or removed. See `type_effect`. |
| `seconds` | object |  | An `integer` that specifies the duration, in seconds, of this effect. Default: `30`. See `type_int`. |
| `amplifier` | object |  | An `integer` that may have been applied to this effect. Sample values range typically from 0 to 4. Default: `0`. See `type_int`. |
| `hideparticles` | object |  | A `Boolean` that specifies the visual representation of the effect. Default: `false`. See `type_boolean`. |

### cmd_enchant (cmd_enchant)

Adds an enchantment to a player's selected item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `enchantmentname` | object |  | An enum for the enchantment that is applied. See `type_enchant`. |
| `level` | object |  | Optional. An `integer` that specifies the enchantment level. See `type_int`. |
| `enchantmentid` | object |  | An integer ID for the enchantment that is applied. See `type_int`. |

### cmd_event (cmd_event)

Triggers an event for the specified entity or entities.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity` |  |  | entity |
| `target` | object |  | Required. A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify which entity the event is happening to. See `type_selection`. |
| `eventname` |  |  | Required. A `string` that specifies the in-game event. |

### cmd_execute (cmd_execute)

Executes a command on behalf of one or more entities. See more information in the [Popular Commands page](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#execute) and the [New Execute Syntax page](https://learn.microsoft.com/minecraft/creator/documents/commandsnewexecute).

> The modern subcommand syntax (`as`, `at`, `positioned`, `if`/`unless`, `facing`, `aligned`, `rotated`, `anchored`, `in`) released out of experimental in 1.19.50 and requires `min_engine_version` 1.19.50 or newer. Packs targeting older engine versions continue to use the legacy syntax.

> As of 1.19.70, the legacy numeric block `data` value parameter is no longer supported in block-targeting sub-commands. Use a block states array instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `subcommand` |  |  | Specifies the start of a section where a command to run is defined, using the context previously provided |
| `origin` | object |  | The target of the command to execute. Must be a player name or [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors). See `type_selection`. |
| `chainedcommand` |  |  | chainedCommand |
| `dimension` |  |  | dimension |
| `position` | object |  | A `vector` of where to run the command from. See `type_position_float`. |
| `secondary_subcommand` |  |  | secondary subcommand |
| `yaw` | object |  | Left-to-right rotation context of the command See `type_rval`. |
| `pitch` | object |  | Up-and-down rotation of the command See `type_rval`. |
| `anchor` |  |  | anchor |
| `axes` | object |  | axes See `type_id`. |
| `anchored` |  |  | anchored |
| `block` | object |  | Compares block to a given block `id`. See `type_block`. |
| `blockstates` |  |  | blockStates |
| `begin` | object |  | begin See `type_position`. |
| `end` | object |  | end See `type_position`. |
| `destination` | object |  | destination See `type_position`. |
| `scan_mode` |  |  | scan mode |
| `target` | object |  | target See `type_selection`. |
| `objective` |  |  | objective |
| `operation` | object |  | operation See `type_compareoperator`. |
| `source` | object |  | source See `type_selection`. |
| `matches` |  |  | matches |
| `range` | object |  | range See `type_fullintegerrange`. |
| `command` |  |  | A `string` of the command to run. Must be a valid command. |

### cmd_fill (cmd_fill)

Fills all or parts of a region with a specific block.

> As of 1.19.70, the legacy numeric block `data` value parameter is no longer supported. Use a block states array instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `from` | object |  | A vector that specifies the location in `x`, `y`, and `z` coordinates of `float` type. See `type_position`. |
| `to` | object |  | A `vector` that specifies the location in `x`, `y`, and `z` coordinates of `float` type. See `type_position`. |
| `tilename` | object |  | An `enum` of the block `id` of the block to fill the region with. See `type_block`. |
| `blockstates` |  |  | An array of block states. |
| `oldblockhandling` |  |  | oldBlockHandling |
| `replacetilename` | object |  | An `enum` of the type of the block `id` to replace in the fill region. See `type_block`. |
| `replaceblockstates` |  |  | An `array` of block states to replace. |

### cmd_fog (cmd_fog)

Add or remove fog settings file.

| Field | Type | Default | Notes |
|---|---|---|---|
| `victim` | object |  | A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify which player perceives the fog. See `type_selection`. |
| `mode` |  |  | Delete mode |
| `fogid` | object |  | A `string` that specifies the fog. See `type_id`. |
| `userprovidedid` | object |  | Required. A `string` that identifies the fog to use. See `type_id`. |

### cmd_function (cmd_function)

Runs commands found in the corresponding function file.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | object |  | Required. A command file path to a function located in a behavior pack. See `type_pathcommand`. |

### cmd_gamemode (cmd_gamemode)

Sets a player's game mode. See more in the [Popular Commands documentation](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#gamemode).

| Field | Type | Default | Notes |
|---|---|---|---|
| `gamemode` | object |  | Game mode enum See `type_gamemode`. |
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |

### cmd_gamerule (cmd_gamerule)

Sets or queries a game rule value. See more in the [Popular Commands documentation](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#gamerule).

| Field | Type | Default | Notes |
|---|---|---|---|
| `rule` |  |  | Boolean game rule setting |
| `value` | object |  | Boolean value See `type_boolean`. |

### cmd_gametest (cmd_gametest)

[Requires the Beta APIs experiment]. Configures various parameters for managing built-in or custom gametest framework tests.

| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` |  |  | mode |
| `testname` |  |  | testName |
| `rotationsteps` | object |  | rotationSteps See `type_int`. |
| `stoponfailure` | object |  | stopOnFailure See `type_boolean`. |
| `repeatcount` | object |  | repeatCount See `type_int`. |
| `tag` |  |  | tag |
| `width` | object |  | width See `type_int`. |
| `height` | object |  | height See `type_int`. |
| `depth` | object |  | depth See `type_int`. |

### cmd_give (cmd_give)

Gives an item to a player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `itemname` | object |  | An `enum` of the type of item to give. See `type_item`. |
| `amount` | object |  | Amount to give to player. Default: `1`. See `type_int`. |
| `data` | object |  | Optional. Fireworks related `data` required to give a firework type item. See `type_int`. |
| `components` | object |  | Optional. Specify if the item has components to call required component events. See `type_json_object`. |

### cmd_help (cmd_help)

Running `/help` in the chat by itself will list every command you can run. However, since there are so many, they have been divided up into several pages, where you are shown only one page at a time. Supplying a page number will change which page of commands to show. Whenever you want to know the usage and all of the syntaxes of a command, you can use /help followed by the name of the command. This can be helpful if you want an overview of the command. See more in the [Popular Commands documentation](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#help).

| Field | Type | Default | Notes |
|---|---|---|---|
| `command` |  |  | An optional `enum` that defines the command to be called. |
| `page` | object |  | Changes which page of commands to show. Numbers smaller than the pages will be page 1, and larger will be the last page. Default: `1`. See `type_int`. |

### cmd_hud (cmd_hud)

_since 1.20.80_

Configures whether elements of the on-screen display (alternately known as the 'heads up display', or 'HUD') are visible on the screen.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target` | object |  | Selector of the player(s) to toggle visibility for. See `type_selection`. |
| `visible` |  |  | State to change the HUD element visibility to. |
| `hud_element` |  |  | Specific HUD element to configure visibility for. |

### cmd_inputpermission (cmd_inputpermission)

_since 1.19.80_

Optionally enables or disables input permissions for a player.

> Added in 1.19.80. Sets or queries a player's camera or movement input permission; useful for cutscenes and non-interactive sequences.

| Field | Type | Default | Notes |
|---|---|---|---|
| `option` |  |  | option |
| `targets` | object |  | targets See `type_selection`. |
| `permission` |  |  | permission |
| `state` |  |  | state |

### cmd_kick (cmd_kick)

Kicks a player from the server.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `reason` | object |  | A `message` in plain text that explains why player was kicked. Default: `Kicked by an operator`. See `type_message_root`. |

### cmd_kill (cmd_kill)

Kills entities like players and mobs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target` | object |  | A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player or entity. See `type_selection`. |

### cmd_list (cmd_list)

Lists players on the server.

### cmd_locate (cmd_locate)

Finds the nearest specified biome or structure if it exists in the current dimension. Prints an error if it does not. See more in the [Popular Commands documentation](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#locate).

| Field | Type | Default | Notes |
|---|---|---|---|
| `subcommand` |  |  | subcommand |
| `structure` |  |  | structure |
| `usenewchunksonly` | object |  | A `Boolean` to specify whether to use new chunks only. Default: `false`. See `type_boolean`. |
| `biome` | object |  | biome See `type_biome`. |

### cmd_loot (cmd_loot)

Drops the given loot table into the specified inventory or into the world.

> In 1.21.60, the `mine` overload was fully released, allowing custom loot tables to be associated with custom blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target` |  |  | Specifies the `entity` that will be the source of the loot |
| `position` | object |  | A `vector` made up of x y z coordinates with `float` numbers. See `type_position_float`. |
| `source` |  |  | source |
| `loot_table` | object |  | Path to the loot table See `type_id`. |
| `<tool>|mainhand|offhand` |  |  | <tool>\|mainhand\|offhand |
| `entity` | object |  | Specifies the `entity` that will be the source of the loot See `type_selection`. |
| `targetblockposition` | object |  | A `vector` made up of x y z coordinates with `float` numbers. See `type_position_float`. |
| `players` | object |  | Specifies the `player` or `players` to give loot to. See `type_selection`. |
| `slottype` |  |  | Entity equipment slot |
| `slotid` | object |  | An `integer` to specify the slot. See `type_int`. |
| `count` | object |  | An `integer` that defines the number of slots to fill. See `type_int`. |
| `block` |  |  | block |

### cmd_me (cmd_me)

Displays a message about yourself.

> In 1.21.60, the message text supports input glyph replacement. For example, `:_input_key.jump:` is rendered as `JUMP` on keyboard or as a glyph on a gamepad.

| Field | Type | Default | Notes |
|---|---|---|---|
| `message` | object |  | A plain text or `string` that can include spaces and [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors)s. See `type_message_root`. |

### cmd_mobevent (cmd_mobevent)

Controls what mob events are allowed to run.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` |  |  | Required. An `enum` that specifies the events to control or query. Must be one of the following: `minecraft:ender_dragon_event`, `minecraft:pillager_patrols_event`, `minecraft:wandering_trader_event`, or `events_enabled`. |
| `value` | object |  | Optional. A `Boolean` that enables events (`true`) or disables them (`false`). Default: `false`. See `type_boolean`. |

### cmd_music (cmd_music)

Allows you to control playing music tracks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `action` |  |  | action |
| `trackname` | object |  | Required. A `string` to specify the track to play. Must be a single word such as `record.cat`. See `type_id`. |
| `volume` | object |  | A `float` number to specify the volume of the music track. See `type_val`. |
| `fadeseconds` | object |  | A `float` number that specifies the duration the track fades in or out. See `type_val`. |
| `repeatmode` |  |  | Optional. An `enum` that specifies how the music is played. Must be `play_once` (default) or `loop`. |

### cmd_op (cmd_op)

Grants operator status to a player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | Required. A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |

### cmd_packstack (cmd_packstack)

Prints client or server pack stack to chat

| Field | Type | Default | Notes |
|---|---|---|---|
| `stacktype` |  |  | stackType |
| `verbose` |  |  | verbose |
| `exclude-vanilla` |  |  | exclude-vanilla |

### cmd_particle (cmd_particle)

Creates a particle emitter

| Field | Type | Default | Notes |
|---|---|---|---|
| `effect` | object |  | A `string` that specifies the particle to create. See `type_id`. |
| `position` | object |  | A `vector` with `[x y z]` coordinates that specifies where to make the particle. Default: the position of the executor. See `type_position_float`. |

### cmd_permission (cmd_permission)

Reloads and applies permissions. This command is for use on a dedicated server only.

| Field | Type | Default | Notes |
|---|---|---|---|
| `action` |  |  | The permissions action to perform: list, set, or reload. |

### cmd_place (cmd_place)

Places a jigsaw structure, feature, or feature rule in the world.

| Field | Type | Default | Notes |
|---|---|---|---|
| `action` |  |  | action |
| `structure` |  |  | structure |
| `pos` | object |  | pos See `type_position`. |
| `ignorestartheight` | object |  | ignoreStartHeight See `type_boolean`. |
| `keepjigsaws` | object |  | keepJigsaws See `type_boolean`. |
| `includeentities` | object |  | includeEntities See `type_boolean`. |
| `liquidsettings` |  |  | liquidSettings |
| `pool` | object |  | pool See `type_pathcommand`. |
| `jigsawtarget` | object |  | jigsawTarget See `type_id`. |
| `maxdepth` | object |  | maxDepth See `type_int`. |
| `feature` |  |  | feature |
| `position` | object |  | position See `type_position`. |
| `featurerule` |  |  | featurerule |

### cmd_playanimation (cmd_playanimation)

Makes one or more entities play a one-off animation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity` | object |  | Required. A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the entity. See `type_selection`. |
| `animation` | object |  | Required. A `string` that is a single word or quoted `string` that refers to an animation name or an animation JSON file in a resource pack. See `type_id`. |
| `next_state` | object |  | next_state See `type_id`. |
| `blend_out_time` | object |  | blend_out_time See `type_val`. |
| `stop_expression` | object |  | stop_expression See `type_id`. |
| `controller` | object |  | Optional. A `string` that is an animation controller name or a new file defined in a resource pack. See `type_id`. |

### cmd_playsound (cmd_playsound)

Plays a sound.

| Field | Type | Default | Notes |
|---|---|---|---|
| `sound` | object |  | Required. A `string` that defines the sound. Should be defined in `sound.definitions.josn`. See `type_id`. |
| `player` | object |  | Optional. A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `position` | object |  | Optional. `Vector` [x y z] of the position sounds originate from. See `type_position_float`. |
| `volume` | object |  | Optional. A `float` that specifies the volume. Between 0.0 and 1.0. Below 1.0 diminishes the sound. 0 is inaudible. Default: `1.0`. See `type_val`. |
| `pitch` | object |  | Optional. A `float` that specifies the pitch. Must bet between 0.0 and 256. Default: `1.0`. See `type_val`. |
| `minimumvolume` | object |  | A `float` that specifies the volume. Between 0.0 and 1.0. Default: `0.0`. See `type_val`. |

### cmd_project (cmd_project)

This command contains additional tools for managing an Editor project. This command is available in Editor mode only.

| Field | Type | Default | Notes |
|---|---|---|---|
| `subcommand` |  |  | Signifies the start of an export-subcommand operation. |
| `exporttype` |  |  | exportType |

### cmd_recipe (cmd_recipe)

_since 1.20.30_

Supports unlocking of built-in (vanilla) recipes that a particular player can craft with.

| Field | Type | Default | Notes |
|---|---|---|---|
| `give` |  |  | give |
| `player` | object |  | player See `type_selection`. |
| `recipe` |  |  | recipe |
| `take` |  |  | take |

### cmd_reload (cmd_reload)

Reloads all function and script files from all behavior packs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `all` |  |  | since 1.21.30. When specified, causes players to quit the world and rejoin, and reloads all behavior and resource packs (not just function and script files). |

### cmd_reloadconfig (cmd_reloadconfig)

Reloads configuration files relating to variables, secrets, permissions, etc.

### cmd_reloadpacketlimitconfig (cmd_reloadpacketlimitconfig)

Reload packet limit config from file

### cmd_replaceitem (cmd_replaceitem)

Replaces items in inventories.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` |  |  | block |
| `position` | object |  | `Vector` [x y z] of the position of the block to modify. See `type_position`. |
| `slottype` |  |  | Entity equipment slot |
| `slotid` | object |  | An `integer` that sets the slot to be modified. Default: `0`. See `type_int`. |
| `itemname` | object |  | Specifies the item to be placed in the entity or block inventory slot. See `type_item`. |
| `amount` | object |  | An `integer` to specify the number of items to place in inventory. Default: `1`. See `type_int`. |
| `data` | object |  | An `integer` that specifies the item data for the items in the inventory. Default: `0`. See `type_int`. |
| `components` | object |  | A `JSON` object that supports `minecraft:can_place_on`, `minecraft:can_destroy`, `minecraft:item_lock`, and `minecraft:keep_on_death`. Default: `false`. See `type_json_object`. |
| `entity` |  |  | Entity equipment slot |
| `target` | object |  | Specifies the entity to modify, either a player name or a [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors). See `type_selection`. |
| `olditemhandling` |  |  | Either `destroy` to replace items in slot or `keep` to keep items instead of replacing them. |

### cmd_ride (cmd_ride)

Makes entities ride other entities, stops entities from riding, makes rides evict their riders, or summons rides or riders.

| Field | Type | Default | Notes |
|---|---|---|---|
| `riders` | object |  | Specifies riders using player name or [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors)s. See `type_selection`. |
| `mode` |  |  | mode |
| `ride` | object |  | Specifies the entity to ride on. A player name or [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors). See `type_selection`. |
| `teleportrules` |  |  | Either `teleport_ride` or `teleport_rider` (default). |
| `howtofill` |  |  | One of `if_group_fits` to check whether riders can ride and only makes them ride if possible. Or `until_full` which makes them ride until rides is full. Default: `until_full`. |
| `rides` | object |  | Specifies the ridden entities. Must be a player name or entity selector. See `type_selection`. |
| `entitytype` | object |  | Specifies entities to summon. Must be the name`ID`of something that can be summoned. See `type_entitytype`. |
| `spawnevent` | object |  | Specifies the in-game event to call the summoned entities. Must be a spawn event in behavior pack. See `type_id`. |
| `nametag` | object |  | Specifies the name of summoned entities. See `type_id`. |
| `riderules` |  |  | Ride rules |

### cmd_save (cmd_save)

Control or check how the game saves data to disk. This command is for use on a dedicated server only.

| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` |  |  | Either `save-all` or `save-all flush` to save chunks to server immediately. This freezes the servers. |

### cmd_say (cmd_say)

Sends a message in the chat to other players.

| Field | Type | Default | Notes |
|---|---|---|---|
| `message` | object |  | Plain text that can include spaces and selectors. See `type_message_root`. |

### cmd_schedule (cmd_schedule)

Schedules an action to be executed once an area is loaded, or after a certain amount of time.

| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` |  |  | An `enum` of either `append` to allow multiple schedules or `replace` to replace the default schedule. |
| `condition` |  |  | condition |
| `function` | object |  | Required. The function to run. See `type_pathcommand`. |
| `time` | object |  | Time integer See `type_int`. |
| `delaymode` |  |  | An `enum` of either `append` to allow multiple schedules or `replace` to replace the default schedule. |
| `from` | object |  | A `vector` [x y z] that specifies the rectangular area to load, along with `to`. See `type_position`. |
| `to` | object |  | A vector [x y z] that specifies the rectangular area to load, along with `from`. See `type_position`. |
| `type` |  |  | type |
| `center` | object |  | A `vector` [x y z] that specifies the center of a defined loaded area. See `type_position`. |
| `radius` | object |  | An `integer` that specifies the area as the number of chunks loaded in. Default: `0`. See `type_int`. |
| `name` | object |  | A `string` that defines the `tickingarea` where the command is added. See `type_id`. |
| `cleartype` |  |  | cleartype |

### cmd_scoreboard (cmd_scoreboard)

Tracks and displays scores for various objectives. See more information about its use in the [Scoreboards Objectives Commands documentation](/creator/documents/scoreboardintroduction#scoreboard-objectives-commands) page.

| Field | Type | Default | Notes |
|---|---|---|---|
| `category` |  |  | category |
| `action` |  |  | Scoreboard players num action |
| `objective` |  |  | Objective for the game to track |
| `criteria` |  |  | criteria |
| `displayname` | object |  | A `string` for the display name. Default: `<objective>`. See `type_id`. |
| `displayslot` |  |  | Scoreboard display slot sortable |
| `sortorder` |  |  | An `enum` of `ascending` or `descending`. |
| `playername` | object |  | A [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors), player selector, UUID, unique ID, or `*` for all of the score havers. See `type_selection`. |
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `min` |  |  | Min wildcard int |
| `max` |  |  | Max wildcard int |
| `count` | object |  | An `integer` to set the score to. See `type_int`. |
| `targetname` | object |  | A [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors), player selector, UUID, unique ID, or `*` for all of the score havers. See `type_selection`. |
| `targetobjective` |  |  | targetObjective |
| `operation` | object |  | A command operator of the `operation` to be applied. Must be `=`, `+=`, `-=`, `*=`, `/=`, `*/`, `<>`, `<`, or. `>`. See `type_operator`. |
| `selector` | object |  | A [target selector](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors), player selector, UUID, unique ID, or `*` for all of the source score havers to use as source inputs. See `type_selection`. |

### cmd_script (cmd_script)

Debugging options for script within Minecraft.

| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` |  |  | mode |
| `action` |  |  | action |
| `port` | object |  | port See `type_int`. |
| `host` | object |  | host See `type_id`. |

### cmd_scriptevent (cmd_scriptevent)

_since 1.20.30_

Causes an event to fire within script with the specified message ID and payload. This can be used to connect scripting with any location where commands are used.

| Field | Type | Default | Notes |
|---|---|---|---|
| `messageid` | object |  | Identifier of the message to send. This is custom and dependent on the kinds of behavior packs and content you may have installed within the world. See `type_id`. |
| `message` | object |  | Data component of the message to send. This is custom and dependent on the kinds of behavior packs and content you may have installed within the world. Message may not exceed 2048 characters in length. See `type_message_root`. |

### cmd_sendshowstoreoffer (cmd_sendshowstoreoffer)

Available on dedicated server only with administrator permissions. Specifies that a marketplace page should be opened up.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | Player to send the dialog to. See `type_selection`. |
| `redirecttype` |  |  | redirectType |
| `offerid` | object |  | offerId See `type_id`. |

### cmd_setblock (cmd_setblock)

Changes a block to another block.

> As of 1.19.70, the legacy numeric block `data` value parameter is no longer supported. Use a block states array (for example, `["color":"orange"]`) instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `position` | object |  | A `vector` [x y z] that defines the position of the block to change. See `type_position`. |
| `tilename` | object |  | An block name from the `enum` that specifies the new block. See `type_block`. |
| `blockstates` |  |  | The block states from the `enum` to use for the block to be set. |
| `oldblockhandling` |  |  | An `enum` of type `destroy`, `hollow`, `keep`, `outline`, or `replace`. Default: `replace`. |

### cmd_setmaxplayers (cmd_setmaxplayers)

Sets the maximum number of players for this game session.

| Field | Type | Default | Notes |
|---|---|---|---|
| `maxplayers` | object |  | An `integer` that defines the new max number of players. Subject to the maximum number of connections the game allows. See `type_int`. |

### cmd_setworldspawn (cmd_setworldspawn)

Sets the location where new players or players who die will spawn in the world.

| Field | Type | Default | Notes |
|---|---|---|---|
| `spawnpoint` | object |  | A `vector` [x y z] with `float` numbers that defines the world spawn. See `type_position_float`. |

### cmd_spawnpoint (cmd_spawnpoint)

Sets the spawn point for a player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `spawnpos` | object |  | A `vector` [x y z] of `floats` that defines the player's new spawn point. See `type_position_float`. |

### cmd_spreadplayers (cmd_spreadplayers)

Teleports entities to random locations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `x` | object |  | The initial `x` position of the player. See `type_rval`. |
| `z` | object |  | The initial `z` position of the player. See `type_rval`. |
| `spreaddistance` | object |  | The distance between players when they spawn. Default: `0.0`. See `type_val`. |
| `maxrange` | object |  | The furthest distance that players can spawn from each other. Default: `0.0`. See `type_val`. |
| `victim` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `maxheight` | object |  | The maximum height that players can spawn. Default: `0.0`. See `type_rval`. |

### cmd_stop (cmd_stop)

Stops the server. This command is for use on a dedicated server only.

### cmd_stopsound (cmd_stopsound)

Stops a sound.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `sound` | object |  | A `string` from the sound `enum` of the sound to stop. See `type_id`. |

### cmd_structure (cmd_structure)

Saves or loads a structure in the world. See examples of this command in use in the [Structure Blocks documentation](https://learn.microsoft.com/minecraft/creator/documents/structureblockstutorial#creating-structures-using-the-structure-command).

| Field | Type | Default | Notes |
|---|---|---|---|
| `action` |  |  | action |
| `name` | object |  | A `string` that specifies the name of the structure. May include a namespace. See `type_id`. |
| `from` | object |  | A `vector` used with `to` that specifies the opposing corners of a structure. See `type_position`. |
| `to` | object |  | A `vector` used with `from` that specifies the opposing corners of a structure. See `type_position`. |
| `includeentities` | object |  | A `Boolean` that specifies whether to save or load entities inside the structure. Default: `true`. See `type_boolean`. |
| `includeblocks` | object |  | A `Boolean` that specifies whether to save or load blocks inside the structure. Default: `true`. See `type_boolean`. |
| `rotation` |  |  | An `enum` of the rotation when loading in a structure. Must be one of `0_degrees`, `90_degrees`, `180_degrees`, or `270_degrees`. Default: `none`. |
| `mirror` |  |  | An `enum` that specifies the axis to mirror when loading a structure. Either `0_degrees`, `90_degrees`, `180_degrees`, or `270_degrees`. Default: `none`. |
| `waterlogged` | object |  | waterlogged See `type_boolean`. |
| `integrity` | object |  | A `float` that specifies the percentage likelihood a block will load. 100 loads all blocks, 0 loads none. Default: 100. See `type_val`. |
| `seed` | object |  | A `string` that specifies the seed when loading in a block with variable integrity. See `type_id`. |
| `animationmode` |  |  | An `enum` of `block_by_block` to load blocks in one at a time or `layer_by_layer` to load them in in layers. Default: `none`. |
| `animationseconds` | object |  | A `float` of the duration of the time to animate the structure loading in. Default: `0.0`. See `type_val`. |

### cmd_summon (cmd_summon)

Summons an entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entitytype` | object |  | An `enum` of the entity to be summoned. See `type_entitytype`. |
| `spawnpos` | object |  | A `vector` of `float` numbers for the position of the summoned entity. See `type_position_float`. |
| `yrot` | object |  | The `float` degrees `y` to rotate a player when teleporting. See `type_rval`. |
| `xrot` | object |  | The `float` degrees `x` to rotate a player when teleporting. See `type_rval`. |
| `spawnevent` |  |  | A `string` of the in-game event for the entity. |
| `nametag` | object |  | A `string` of the entity name tag. See `type_id`. |
| `facing` |  |  | facing |
| `lookatposition` | object |  | lookAtPosition See `type_position_float`. |
| `lookatentity` | object |  | lookAtEntity See `type_selection`. |

### cmd_tag (cmd_tag)

Manages tags stored in entities.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity` | object |  | The command's target. See `type_selection`. |
| `action` |  |  | Change the `tags` on an `entity` using the `TagChangeAction` Enums. |
| `name` |  |  | The `tag` name. |

### cmd_teleport (cmd_teleport)

Teleports entities to specific locations. Can also be written as `/tp`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `destination` | object |  | The `vector` [x y z] position to teleport entities to. See `type_position_float`. |
| `checkforblocks` | object |  | A `Boolean` value to prevent teleporting the player if the location they would end up in is occupied by blocks if `true`. Default: `false`. See `type_boolean`. |
| `yrot` | object |  | The `float` degrees `y` to rotate a player when teleporting. See `type_rval`. |
| `xrot` | object |  | The `float` degrees `x` to rotate a player when teleporting. See `type_rval`. |
| `facing` |  |  | facing |
| `lookatposition` | object |  | A `vector` [x y z] of where teleported entities should face. See `type_position_float`. |
| `lookatentity` | object |  | A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify which `entity` teleported entities should face. See `type_selection`. |
| `victim` | object |  | A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify which player is teleported. See `type_selection`. |

### cmd_tell (cmd_tell)

Sends a private message to one or more players.

> In 1.21.60, the message text supports input glyph replacement. For example, `:_input_key.jump:` is rendered as `JUMP` on keyboard or as a glyph on a gamepad.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target` | object |  | A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player to tell. See `type_selection`. |
| `message` | object |  | A `string` of the message. See `type_message_root`. |

### cmd_tellraw (cmd_tellraw)

Sends a JSON message to players.

> In 1.20.80, input key glyphs are better supported within the JSON message text.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target` | object |  | A `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player to tell. See `type_selection`. |
| `raw_json_message` | object |  | `JSON` that specifies the message to send. See `type_json_object`. |

### cmd_testfor (cmd_testfor)

Counts entities (players, mobs, items, etc.) matching specified conditions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `victim` | object |  | A name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify who or what is being counted. See `type_selection`. |

### cmd_testforblock (cmd_testforblock)

Tests whether a certain block is in a specific location.

> As of 1.19.70, the legacy numeric block `data` value parameter is no longer supported. Use a block states array instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `position` | object |  | Required. A `vector` of the location the block to test. See `type_position`. |
| `tilename` | object |  | Required. An `enum` of the block to test for. See `type_block`. |
| `blockstates` |  |  | Optional. The `block states` to match when testing. |

### cmd_testforblocks (cmd_testforblocks)

Tests whether the blocks in two regions match.

| Field | Type | Default | Notes |
|---|---|---|---|
| `begin` | object |  | A `vector` [x y z] that along with `end` of two opposite corners of a rectangular region to test for. See `type_position`. |
| `end` | object |  | Required. A `vector` [x y z] that along with `begin` of two opposite corners of a rectangular region to test for. See `type_position`. |
| `destination` | object |  | Required. A `vector` [x y z] of the lower northwest corner to test for. See `type_position`. |
| `mode` |  |  | Optional. Either `masked` where air blocks will match any destination, or default `all` which matches all blocks including air. |

### cmd_tickingarea (cmd_tickingarea)

Add, remove, or list ticking areas. See more information in the [Ticking Area documentation](https://learn.microsoft.com/minecraft/creator/documents/tickingareacommand).

| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` |  |  | mode |
| `from` | object |  | A `vector` [x y z] that along with `to` of two opposite corners of a rectangular region to test for. See `type_position`. |
| `to` | object |  | A `vector` [x y z] that along with `from` of two opposite corners of a rectangular region to test for. See `type_position`. |
| `name` | object |  | An optional `string` to specify the name of a ticking area. See `type_id`. |
| `preload` | object |  | A `Boolean` that queries the preload value. Default: `false`. See `type_boolean`. |
| `circle` |  |  | circle |
| `center` | object |  | A `vector` [x y z] that specifies the center of a defined loaded area. See `type_position`. |
| `radius` | object |  | An `integer` that specifies the area as the number of chunks loaded in. Between 0 and 4. See `type_int`. |
| `position` | object |  | A `vector` [x y z] of a point within the ticking area. See `type_position`. |
| `all-dimensions` |  |  | Specify `all-dimensions` to determine whether ticking areas in other dimensions are listed. |

### cmd_time (cmd_time)

Changes or queries the world's game time. See more in the [Popular Commands documentation](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#time).

| Field | Type | Default | Notes |
|---|---|---|---|
| `mode` |  |  | mode |
| `amount` | object |  | An `integer` of the time to add or set. Default: `0`. See `type_int`. |
| `time` |  |  | time |

### cmd_title (cmd_title)

Controls the text and behavior for screen titles using plain text.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `clear` |  |  | clear |
| `reset` |  |  | reset |
| `titlelocation` |  |  | An `enum` of `title`, `subtitle`, or `actionbar`. |
| `titletext` | object |  | A `plain text` `string` for the title text. See `type_message_root`. |
| `times` |  |  | times |
| `fadein` | object |  | The number of gameticks for the title to fade in. Default: `10`. See `type_int`. |
| `stay` | object |  | The number of gameticks for the title to stay. Default: `70`. See `type_int`. |
| `fadeout` | object |  | The number of gameticks for the title to fade out. Default: `20`. See `type_int`. |

### cmd_titleraw (cmd_titleraw)

Controls the text and behavior for screen titles using JSON messages.

> In 1.20.80, input key glyphs are better supported within the JSON message text.

| Field | Type | Default | Notes |
|---|---|---|---|
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player. See `type_selection`. |
| `clear` |  |  | clear |
| `reset` |  |  | reset |
| `titlelocation` |  |  | The location where the raw title will display. Uses the `TitleRawSet` Enums `title`, `subtitle`, or `actionbar`. |
| `raw_json_titletext` | object |  | A JSON `string` for the raw title text. See `type_json_object`. |
| `times` |  |  | times |
| `fadein` | object |  | The number of gameticks for the raw title to fade in. Default: `0`. See `type_int`. |
| `stay` | object |  | The number of gameticks for the raw title to stay. Default: `0`. See `type_int`. |
| `fadeout` | object |  | The number of gameticks for the raw title to fade out. Default: `0`. See `type_int`. |

### cmd_toggledownfall (cmd_toggledownfall)

Toggles the weather.

### cmd_transfer (cmd_transfer)

Transfers a player to another server.

| Field | Type | Default | Notes |
|---|---|---|---|
| `pfidormsa` | object |  | pfidOrMSA See `type_id`. |
| `server` | object |  | server See `type_id`. |
| `port` | object |  | port See `type_int`. |

### cmd_weather (cmd_weather)

Sets the weather in the environment. See more in the [Popular Commands documentation](https://learn.microsoft.com/minecraft/creator/documents/commandspopularcommands#weather).

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` |  |  | An `enum` of `clear`, `rain` (will cause snow in cold biomes), or `thunder` (will cause blizzard in cold biomes). |
| `duration` | object |  | An optional `integer` that will a random number between 300 and 900 seconds if not specified. See `type_int`. |
| `query` |  |  | query |

### cmd_wsserver (cmd_wsserver)

Attempts to connect to the websocket server on the provided URL.

| Field | Type | Default | Notes |
|---|---|---|---|
| `serveruri` | object |  | A `URI` of the server to connect to. Or use an empty `string` to disconnect. See `type_rawtext`. |

### cmd_xp (cmd_xp)

Adds or removes player experience.

| Field | Type | Default | Notes |
|---|---|---|---|
| `amount` | object |  | An `integer` of the experience to add to the player. May only be negative to remove xp. See `type_int`. |
| `player` | object |  | A player name `string` or [`target selector`](https://learn.microsoft.com/minecraft/creator/documents/commandsintroduction#target-selectors) to identify the player who should receive or lose xp. See `type_selection`. |

### overload (overload)

Defines a single overload (signature) for a command in command documentation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | int |  | Id |
| `header` | longFormString |  | Header |
| `description` | stringArray |  | Description |

### type_actor (type_actor)

Targets entities. Alias for SELECTION.

### type_biome (type_biome)

A biome identifier.

Example (Plains biome):
```json
"plains"
```

### type_block (type_block)

A block type identifier. Can include namespace or use short form for vanilla blocks.

> Vanilla blocks use 'minecraft:' namespace but it can be omitted.

Example (Stone block (vanilla)):
```json
"stone"
```

### type_blockname (type_blockname)

A block type identifier. Alias for BLOCK.

### type_blockpos (type_blockpos)

Block coordinates as integers. Does not accept decimal values.

Example (Current block position):
```json
"~ ~ ~"
```

### type_bool (type_bool)

A true or false value. Alias for BOOLEAN.

### type_boolean (type_boolean)

A true or false value.

Example (Yes/on/enabled):
```json
"true"
```

### type_camerapresetid (type_camerapresetid)

Named camera preset from behavior packs.

Example (Free-moving camera):
```json
"minecraft:free"
```

### type_clipmode (type_clipmode)

How to handle entity clipping during camera/spectator mode.

Example (Player clipping behavior):
```json
"player"
```

### type_compareoperator (type_compareoperator)

Operator for comparing values in scoreboard tests.

Example (Less than):
```json
"<"
```

### type_difficulty (type_difficulty)

The world difficulty level.

Example (No hostile mobs, health regenerates quickly):
```json
"peaceful"
```

### type_dimensiontype (type_dimensiontype)

A dimension identifier.

Example (The main world):
```json
"overworld"
```

### type_easetype (type_easetype)

Animation easing function for camera transitions.

Example (Constant speed):
```json
"linear"
```

### type_effect (type_effect)

A status effect (potion effect) identifier.

Example (Speed boost):
```json
"speed"
```

### type_enchant (type_enchant)

An enchantment identifier.

Example (Increased melee damage):
```json
"sharpness"
```

### type_enchantmenttype (type_enchantmenttype)

An enchantment identifier. Alias for ENCHANT.

### type_entity_type (type_entity_type)

An entity type identifier (mob, item, projectile, etc.).

Example (Pig mob):
```json
"pig"
```

### type_entitytype (type_entitytype)

An entity type identifier. Alias for ENTITY_TYPE.

### type_filepath (type_filepath)

A path to a file or resource.

### type_float (type_float)

A number that can include decimals.

Example (Zero):
```json
"0"
```

### type_fullintegerrange (type_fullintegerrange)

A range of integers, or a single integer.

Example (Between 1 and 10 inclusive):
```json
"1..10"
```

### type_gamemode (type_gamemode)

The player's game mode.

Example (Survival mode - gather resources, hunger, health):
```json
"survival"
```

### type_gamerule (type_gamerule)

A world setting that can be changed.

Example (Whether time passes):
```json
"doDaylightCycle"
```

### type_id (type_id)

A unique identifier string. Usually lowercase with underscores.

Example (Scoreboard objective name):
```json
"my_objective"
```

### type_int (type_int)

A whole number (no decimals).

Example (Zero):
```json
"0"
```

### type_integer (type_integer)

A whole number (no decimals). Alias for INT.

### type_item (type_item)

An item type identifier.

Example (Diamond item):
```json
"diamond"
```

### type_itemname (type_itemname)

An item type identifier. Alias for ITEM.

### type_json_object (type_json_object)

A JSON object with key-value pairs.

Example (Simple JSON object):
```json
"{\"key\":\"value\"}"
```

### type_message (type_message)

A text message.

### type_message_root (type_message_root)

A text message that will be displayed to players. Can include selector mentions that expand to entity names.

> When using selectors in messages, they are replaced with the names of matching entities.

Example (Simple text message):
```json
"Hello World!"
```

### type_objectivecriteria (type_objectivecriteria)

The criteria type for a scoreboard objective.

> Bedrock Edition only supports 'dummy' criteria

Example (Manual score changes only (most common)):
```json
"dummy"
```

### type_objectivename (type_objectivename)

Name of a scoreboard objective.

Example (Track player kills):
```json
"kills"
```

### type_operator (type_operator)

Mathematical operation for scoreboard calculations.

Example (Add value):
```json
"+="
```

### type_pathcommand (type_pathcommand)

Path to a function file within a behavior pack. Uses namespace:path format.

> Functions are .mcfunction files in the behavior pack's functions folder.

Example (Function 'setup' in namespace 'mypack'):
```json
"mypack:setup"
```

### type_player_selector (type_player_selector)

Targets one or more players. Similar to entity selector but only matches players.

Example (All players):
```json
"@a"
```

### type_position (type_position)

A 3D block position (integer coordinates).

Example (Absolute coordinates):
```json
"100 64 -200"
```

### type_position_float (type_position_float)

A 3D position in the world. Can use absolute coordinates, relative coordinates (~), or local coordinates (^).

> Coordinate types: Absolute (world coordinates), Relative (~ offset from execution position), Local (^ offset relative to entity's facing direction: left/right, up/down, forward/back)

Example (Current position (where command executes)):
```json
"~ ~ ~"
```

### type_postfixvalue (type_postfixvalue)

A value with a unit suffix.

Example (5 seconds):
```json
"5s"
```

### type_rawtext (type_rawtext)

A JSON text component for rich formatting. Used for titleraw, tellraw, etc.

> Raw text supports: text, translate, selector, score, and with (for parameters).

Example (Simple raw text):
```json
"{\"rawtext\":[{\"text\":\"Hello World\"}]}"
```

### type_relativefloat (type_relativefloat)

A number that can be relative to current value using ~.

Example (Absolute value of 10):
```json
"10"
```

### type_rgb (type_rgb)

Color value as red, green, blue components.

Example (Red):
```json
"255 0 0"
```

### type_rval (type_rval)

A rotation angle in degrees. Can be absolute or relative.

> For yaw (horizontal): 0=South, 90=West, 180=North, -90=East. For pitch (vertical): -90=up, 0=forward, 90=down.

Example (South (0°)):
```json
"0"
```

### type_selection (type_selection)

Targets one or more entities using selector syntax. Selectors start with @ followed by a letter indicating the type of selection.

Example (All players in the world):
```json
"@a"
```

### type_slotid (type_slotid)

Numeric slot index within a slot type.

Example (First slot in the container):
```json
"0"
```

### type_slottype (type_slottype)

Category of inventory or equipment slot.

Example (Main hand slot):
```json
"slot.weapon.mainhand"
```

### type_string (type_string)

A text value. May need quotes if it contains spaces.

Example (Simple text without spaces):
```json
"MyName"
```

### type_structuretype (type_structuretype)

A structure identifier for locate command.

Example (Village structure):
```json
"village"
```

### type_target (type_target)

Targets entities or players.

### type_time (type_time)

Time value in ticks or named time.

> A full day-night cycle is 24000 ticks (20 minutes real time). 1 tick = 0.05 seconds.

Example (Start of day (1000 ticks)):
```json
"day"
```

### type_val (type_val)

A numeric value.

### type_weather (type_weather)

The weather condition.

Example (Clear skies, sunny):
```json
"clear"
```

### type_xrot (type_xrot)

Vertical rotation (pitch) in degrees. -90 = looking up, 90 = looking down.

> Pitch is vertical look: 0=horizon, -90=up, 90=down

### type_yrot (type_yrot)

Horizontal rotation (yaw) in degrees.

> Yaw is horizontal rotation: 0=south, 90=west, 180/-180=north, -90=east

### value (value)

Defines a value used in command documentation (for example, an enum-like set of possible values).

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | Name |
| `description` | longFormString |  | Description |
