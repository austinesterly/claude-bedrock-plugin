# Upcoming and beta Script APIs (generated)

Generated on **2026-10-12** from the official `index.d.ts` typings on npm. Labels: **[next stable]** is in the `rc` build (ships in the next game release, works without experiments once it does); **[beta]** needs the Beta APIs experiment and a `-beta` module version in the manifest; **[beta module]** has no stable release at all. Search for `Type.member`.

## @minecraft/server

Stable 2.10.0, rc 2.11.0-rc.1.26.60-preview.30, beta 2.12.0-beta.1.26.60-preview.30. 85 names coming in the next stable, 247 beta-only.

### Dimension [next stable]

A class that represents a particular dimension (e.g., The End) within a world.

- `spawnXp(location: Vector3, amount: number): void`

### EntityIsTamedComponent [next stable]

When added, this component signifies that this entity is currently tamed.

- `readonly tamedToPlayer?: Player`
- `readonly tamedToPlayerId?: string`

### PlayerSoundOptions [next stable]

Additional options for how a sound plays for a player.

- `loopCount?: number`

### SoundInstance [next stable]

Represents a handle to a sound that has been played.

- `fade(duration: number, targetVolume: number): void`
- `pause(): void`
- `resume(): void`
- `seekTo(seconds: number): void`
- `setPitch(pitch: number): void`
- `setVolume(volume: number): void`

### StartupEvent [next stable]

- `readonly worldClockRegistry: WorldClockRegistry`

### TextPrimitive [next stable]

A primitive shape class that represents a text label in the world with a background.

- `lineGapHeight: number`

### TimeMarker [next stable] (new type)

- `readonly name: string` The identifier that represents this time marker.
- `readonly period?: number` The interval (in ticks) at which the time marker repeats.
- `readonly time: number` The time (in ticks) that the time marker occurs at on a world clock.

### TimeMarkerOptions [next stable] (new type)

- `name: string` The name that the time marker will have.
- `period?: number` The optional repeat period (in ticks) that the time marker will have.
- `time: number` The time (in ticks) that the time marker will occur at.

### World [next stable]

A class that wraps the state of a world - a set of dimensions and the environment of Minecraft.

- `getClock(name: string): WorldClock`

### WorldAfterEvents [next stable]

Contains a set of events that are available across the scope of the World.

- `readonly worldClockOnPaused: WorldClockOnPausedAfterEventSignal`
- `readonly worldClockOnResumed: WorldClockOnResumedAfterEventSignal`
- `readonly worldClockOnTimeMarker: WorldClockOnTimeMarkerAfterEventSignal`
- `readonly worldClockOnTimeModified: WorldClockOnTimeModifiedAfterEventSignal`

### WorldBeforeEvents [next stable]

A set of events that fire before an actual action occurs.

- `readonly worldClockOnRestart: WorldClockOnRestartBeforeEventSignal`

### WorldClock [next stable] (new type)

- `addTimeMarker(timeMarkerOptions: TimeMarkerOptions): void` Adds a new time marker to the world clock.
- `isPaused: boolean` Retrieves or sets whether the world clock is currently paused.
- `readonly name: string` The identifier that represents this world clock.
- `removeTimeMarker(timeMarker: string | TimeMarker): void` Removes an existing time marker from the world clock.
- `rewindTo(timeMarker: string | TimeMarker): void` Rewinds the world clock's time to the previous occurrence of the specified time marker.
- `set(timeMarker: string | TimeMarker): void` Sets the world clock's time to the specified time marker.
- `skipTo(timeMarker: string | TimeMarker): void` Skips the world clock's time to the next occurrence of the specified time marker.
- `time: number` Retrieves or sets the current time (in ticks) of the world clock.
- `readonly timeMarkers: TimeMarker[]` Retrieves the current time markers of the world clock.

### WorldClockAddTimeMarkerError [next stable] (new type)

### WorldClockEventOptions [next stable] (new type)

- `clock: string` The name of the clock that this event should fire for.

### WorldClockInvalidRegistryError [next stable] (new type)

### WorldClockInvalidTimeMarkerError [next stable] (new type)

### WorldClockNotFoundError [next stable] (new type)

### WorldClockOnPausedAfterEvent [next stable] (new type)

- `readonly clock: WorldClock` The world clock that was paused.

### WorldClockOnPausedAfterEventSignal [next stable] (new type)

- `subscribe(callback: (arg0: WorldClockOnPausedAfterEvent) => void, options?: WorldClockEventOptions): (arg0: WorldClockOnPausedAfterEvent) => void` Adds a callback that will be called when a world clock is paused.
- `unsubscribe(callback: (arg0: WorldClockOnPausedAfterEvent) => void): void` Removes a callback from being called when a world clock is paused.

### WorldClockOnRestartBeforeEvent [next stable] (new type)

- `cancel: boolean` If set to true, cancels the world clock restart event.
- `readonly clock: WorldClock` The world clock that is restarting.
- `newTime: number` The time that the world clock will be set to after it restarts.

### WorldClockOnRestartBeforeEventSignal [next stable] (new type)

- `subscribe(callback: (arg0: WorldClockOnRestartBeforeEvent) => void, options?: WorldClockEventOptions): (arg0: WorldClockOnRestartBeforeEvent) => void` Adds a callback that will be called when a world clock is restarting.
- `unsubscribe(callback: (arg0: WorldClockOnRestartBeforeEvent) => void): void` Removes a callback from being called when a world clock is restarting.

### WorldClockOnResumedAfterEvent [next stable] (new type)

- `readonly clock: WorldClock` The world clock that was resumed.

### WorldClockOnResumedAfterEventSignal [next stable] (new type)

- `subscribe(callback: (arg0: WorldClockOnResumedAfterEvent) => void, options?: WorldClockEventOptions): (arg0: WorldClockOnResumedAfterEvent) => void` Adds a callback that will be called when a world clock is resumed.
- `unsubscribe(callback: (arg0: WorldClockOnResumedAfterEvent) => void): void` Removes a callback from being called when a world clock is resumed.

### WorldClockOnTimeMarkerAfterEvent [next stable] (new type)

- `readonly clock: WorldClock` The world clock that hit a time marker.
- `readonly timeMarker: TimeMarker` The time marker that was hit by the world clock.

### WorldClockOnTimeMarkerAfterEventSignal [next stable] (new type)

- `subscribe(callback: (arg0: WorldClockOnTimeMarkerAfterEvent) => void, options?: WorldClockTimeMarkerEventOptions): (arg0: WorldClockOnTimeMarkerAfterEvent) => void` Adds a callback that will be called when a world clock's time hits a time marker.
- `unsubscribe(callback: (arg0: WorldClockOnTimeMarkerAfterEvent) => void): void` Removes a callback from being called when a world clock's time hits a time marker.

### WorldClockOnTimeModifiedAfterEvent [next stable] (new type)

- `readonly clock: WorldClock` The world clock that had its time modified.

### WorldClockOnTimeModifiedAfterEventSignal [next stable] (new type)

- `subscribe(callback: (arg0: WorldClockOnTimeModifiedAfterEvent) => void, options?: WorldClockEventOptions): (arg0: WorldClockOnTimeModifiedAfterEvent) => void` Adds a callback that will be called when a world clock's time is modified.
- `unsubscribe(callback: (arg0: WorldClockOnTimeModifiedAfterEvent) => void): void` Removes a callback from being called when a world clock's time is modified.

### WorldClockRegistrationError [next stable] (new type)

### WorldClockRegistrationOptions [next stable] (new type)

- `timeMarkers?: TimeMarkerOptions[]` Set of options to include time markers during world clock registration.

### WorldClockRegistry [next stable] (new type)

- `registerClock(name: string, registrationOptions?: WorldClockRegistrationOptions): void` Registers a new custom world clock.

### WorldClockReloadNewWorldClockError [next stable] (new type)

### WorldClockReloadTimeMarkerError [next stable] (new type)

### WorldClockRemoveMinecraftTimeMarkerError [next stable] (new type)

### WorldClockRewindError [next stable] (new type)

### WorldClockTimeMarkerEventOptions [next stable] (new type)

- `clock: string` The name of the world clock that this event should fire for.
- `timeMarker?: string` The name of the time marker that this event should fire for.

### WorldClockTimeMarkerNotFoundError [next stable] (new type)

### WorldSoundOptions [next stable]

Contains additional options for a playSound occurrence.

- `isBroadcast?: boolean`
- `loopCount?: number`

### BannerPattern [beta] (new type)

- `readonly color: string` The color to apply to this banner pattern.
- `readonly pattern: string` The pattern type (e.g.

### Block [beta]

Represents a block in a dimension.

- `canPlace(blockToPlace: BlockPermutation | BlockType | string, faceToPlaceOn?: Direction): boolean`
- `getMapColor(): RGBA`
- `hasScheduledNamedTick(eventName: string): boolean`
- `readonly isSolid: boolean`
- `removeScheduledNamedTick(eventName: string): void`
- `scheduleNamedTick(eventName: string, tickDelay: number): void`
- `trySetPermutation(permutation: BlockPermutation): boolean`

### BlockBoundingBoxUtils [beta] (new type)

- `static createValid(min: Vector3, max: Vector3): BlockBoundingBox` Create a validated instance of a BlockBoundingBox where the min and max components are guaranteed to be (min <= max)
- `static dilate(box: BlockBoundingBox, size: Vector3): BlockBoundingBox` Expand a BlockBoundingBox by a given amount along each axis.
- `static equals(box: BlockBoundingBox, other: BlockBoundingBox): boolean` Check if two BlockBoundingBox objects are identical
- `static expand(box: BlockBoundingBox, other: BlockBoundingBox): BlockBoundingBox` Expand the initial box object bounds to include the 2nd box argument.
- `static getCenter(box: BlockBoundingBox): Vector3` Calculate the center block of a given BlockBoundingBox object.
- `static getIntersection(box: BlockBoundingBox, other: BlockBoundingBox): BlockBoundingBox | undefined` Calculate the BlockBoundingBox which represents the union area of two intersecting BlockBoundingBoxes
- `static getSpan(box: BlockBoundingBox): Vector3` Get the Span of each of the BlockBoundingBox Axis components
- `static intersects(box: BlockBoundingBox, other: BlockBoundingBox): boolean` Check to see if two BlockBoundingBox objects intersect
- `static isInside(box: BlockBoundingBox, pos: Vector3): boolean` Check to see if a given coordinate is inside a BlockBoundingBox
- `static isValid(box: BlockBoundingBox): boolean` Check to see if a BlockBoundingBox is valid (i.e.
- `static translate(box: BlockBoundingBox, delta: Vector3): BlockBoundingBox` Move a BlockBoundingBox by a given amount

### BlockComponentNamedTickEvent [beta] (new type)

- `isName(eventName: string): boolean` Checks whether this named tick event has the specified name.

### BlockComponentNeighborChangedAfterEvent [beta] (new type)

- `getChanges(): NeighborChange[]` Returns the neighboring block changes for this event.

### BlockComponentRedstoneUpdateEvent [beta]

Contains information regarding a specific block redstone update event.

- `readonly firstUpdate: boolean`

### BlockComponentTypes [beta]

The types of block components that are accessible via function Block.getComponent.

- `EntityStorage = 'minecraft:entity_storage'`
- `RecipeCrafting = 'minecraft:recipe_crafting'`
- `RecipeProcessing = 'minecraft:recipe_processing'`
- `VibrationProperties = 'minecraft:vibration_properties'`

### BlockCustomComponent [beta]

Contains a set of events that will be raised for a block.

- `onNamedTick?: (arg0: BlockComponentNamedTickEvent, arg1: CustomComponentParameters) => void`
- `onNeighborChanged?: (arg0: BlockComponentNeighborChangedAfterEvent, arg1: CustomComponentParameters) => void`

### BlockEntityStorageComponent [beta] (new type)

- `static readonly componentId = 'minecraft:entity_storage'`
- `getEntities(): BlockEntityStorageInfo[]` Returns information about the entities stored in this block's entity storage.
- `release(entityId: string): Entity` Releases a stored entity from this block's entity storage and spawns it back into the world, at the same location it was when stored.
- `size(): number` Returns the number of entities stored in this block's entity storage by the current content pack.
- `store(entity: Entity): string` Serializes and stores an entity in this block's entity storage.
- `transfer(entityId: string, targetBlock: Block): void` Moves a stored entity from this block's entity storage to the target block's entity storage without releasing it into the world.

### BlockEntityStorageInfo [beta] (new type)

- `readonly definitionId: string` The entity's definition ID, such as `minecraft:pig`.
- `readonly uniqueId: string` The unique ID of the stored entity.

### BlockLocationIterator [beta]

A BlockLocationIterator returns the next block location of the block volume across which it is iterating.

- `isValid(): boolean`

### BlockRecipeCraftingComponent [beta] (new type)

- `static readonly componentId = 'minecraft:recipe_crafting'`
- `getCraftingContext(player: Player): RecipeCraftingContext | undefined` Gets the recipe crafting context for a player interacting with this block.
- `readonly players: Player[]` Returns an array of all players currently interacting with this block.

### BlockRecipeProcessingComponent [beta] (new type)

- `static readonly componentId = 'minecraft:recipe_processing'`
- `getInputItem(slot: number): ItemStack | undefined` Gets the item in the provided input slot.
- `getInputSlotEnabled(slot: number): boolean` Gets whether an input slot is enabled for recipe processing.
- `getOutputItem(): ItemStack | undefined` Gets the item produced by the current recipe processing inputs.
- `readonly inputSlotCount: number` The number of addressable input slots for getInputItem, setInputItem, setInputSlotEnabled, and getInputSlotEnabled.
- `setInputItem(slot: number, item?: ItemStack): void` Sets or clears an item in an input slot.
- `setInputSlotEnabled(slot: number, enabled: boolean): void`

### BlockVibrationPropertiesComponent [beta] (new type)

- `static readonly componentId = 'minecraft:vibration_properties'`
- `getCanDampenVibrations(): boolean` Gets whether this block can dampen vibrations.
- `getCanOccludeVibrations(): boolean` Gets whether this block can occlude vibrations.

### BlockVolumeBase [beta]

Base type for BlockVolumes.

- `getBoundingBox(): BlockBoundingBox`

### Camera [beta]

Contains methods relating to the active camera for the specified player.

- `setCameraWithEase(cameraPreset: string, easeOptions: EaseOptions): void`

### CarryOverBlockEntityDataFunction [beta] (new type)

- `readonly dynamicProperties: boolean` If true, and if the block entity had dynamic_properties, the function will copy the dynamic properties from the block entity to the dropped item.

### ChatSendAfterEvent [beta] (new type)

- `readonly message: string` Message that is being broadcast.
- `readonly sender: Player` Player that sent the chat message.
- `readonly targets?: Player[]` Optional list of players that will receive this message.

### ChatSendAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: ChatSendAfterEvent) => void): (arg0: ChatSendAfterEvent) => void` Adds a callback that will be called when new chat messages are sent.
- `unsubscribe(callback: (arg0: ChatSendAfterEvent) => void): void` Removes a callback from being called when new chat messages are sent.

### ChatSendBeforeEvent [beta] (new type)

- `cancel: boolean` If set to true in a beforeChat event handler, this message is not broadcast out.
- `readonly message: string` Message that is being broadcast.
- `readonly sender: Player` Player that sent the chat message.
- `targets?: Player[]` Optional list of players that will receive this message.

### ChatSendBeforeEventSignal [beta] (new type)

- `subscribe(callback: (arg0: ChatSendBeforeEvent) => void): (arg0: ChatSendBeforeEvent) => void` Adds a callback that will be called before new chat messages are sent.
- `unsubscribe(callback: (arg0: ChatSendBeforeEvent) => void): void` Removes a callback from being called before new chat messages are sent.

### CustomCommandErrorReason [beta]

Reason why custom command registration failed.

- `UnexpectedEnumName = 'UnexpectedEnumName'`

### CustomCommandParameter [beta]

Definition for each parameter expected by the custom command.

- `enumName?: string`

### DefinitionModifier [beta]

Contains a set of updates to the component definition state of an entity.

- `triggers: Trigger[]`

### Dimension [beta]

A class that represents a particular dimension (e.g., The End) within a world.

- `getGeneratedStructures(location: Vector3): (minecraftvanilladata.MinecraftFeatureTypes | string)[]`
- `getWeather(): WeatherType`
- `readonly poiManager: PoiManager`
- `stopAllSounds(): void`
- `stopSound(soundId: string): void`

### Entity [beta]

Represents the state of an entity (a mob, the player, or other moving objects like minecarts) in the world.

- `readonly target?: Entity`

### EntityBreathableComponent [beta]

Defines what blocks this entity can breathe in and gives them the ability to suffocate.

- `airSupply: number`
- `readonly canBreathe: boolean`

### EntityComponentTypes [beta]

The types of entity components that are accessible via function Entity.getComponent.

- `Npc = 'minecraft:npc'`

### EntityNpcComponent [beta] (new type)

- `static readonly componentId = 'minecraft:npc'`
- `defaultScene: string` The DialogueScene that is opened when players first interact with the NPC.
- `name: string` The name of the NPC as it is displayed to players.
- `skinIndex: number` The index of the skin the NPC will use.

### EquipmentSlot [beta]

The equipment slot of the mob.

- `Body = 'Body'`

### GameRule [beta]

Game rules.

- `PlayerWaypoints = 'playerWaypoints'`

### GameRules [beta]

Represents the game rules for a world experience.

- `playerWaypoints: PlayerWaypointsMode`

### InvalidRecipeError [beta] (new type)

- `readonly recipeId: string` The identifier of the invalid recipe.

### MessageReceiveAfterEvent [beta] (new type)

- `readonly id: string` The message identifier.
- `readonly message: string` The message.
- `readonly player: Player` The player who sent the message.

### NeighborChange [beta] (new type)

- `blockPermutation: BlockPermutation` The permutation of the neighboring block after its last change during the tick.
- `direction: Direction` Direction from the block receiving the event to the neighboring block that changed.
- `previousPermutation: BlockPermutation` The permutation of the neighboring block before its first change during the tick.

### PackSettingChangeAfterEvent [beta] (new type)

- `readonly settingName: string` The name of the setting.
- `readonly settingValue: string[] | boolean | number | string` The value of the setting.

### PackSettingChangeAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PackSettingChangeAfterEvent) => void): (arg0: PackSettingChangeAfterEvent) => void`
- `unsubscribe(callback: (arg0: PackSettingChangeAfterEvent) => void): void`

### Player [beta]

Represents a player within the world.

- `readonly chatDisplayName: string`
- `chatMessagePrefix?: string`
- `chatNamePrefix?: string`
- `chatNameSuffix?: string`
- `eatItem(itemStack: ItemStack): void`
- `getPing(): number`
- `getSplitScreenSlot(): PlayerSplitScreenSlot | undefined`
- `readonly persistentId: string`
- `postClientMessage(id: string, value: string): void`
- `stopAllSounds(): void`
- `stopSound(soundId: string): void`

### PlayerCraftRecipeAfterEvent [beta] (new type)

- `readonly block?: Block` The block where the recipe was crafted, if applicable.
- `readonly itemStack?: ItemStack` The item stack crafted by the player.
- `readonly player: Player` The player who crafted the recipe.

### PlayerCraftRecipeAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PlayerCraftRecipeAfterEvent) => void, options?: PlayerCraftRecipeEventOptions): (arg0: PlayerCraftRecipeAfterEvent) => void` Adds a callback that will be called when a player crafts a recipe.
- `unsubscribe(callback: (arg0: PlayerCraftRecipeAfterEvent) => void): void` Removes a callback from being called when a player crafts a recipe.

### PlayerCraftRecipeEventOptions [beta] (new type)

- `blockFilter?: BlockFilter` Filter for the block where the recipe is crafted.
- `itemFilter?: ItemFilter` Filter for the item crafted by the player.
- `playerFilter?: EntityFilter` Filter for the player crafting the recipe.

### PlayerCursorItemGrabAfterEvent [beta] (new type)

- `readonly item: ItemStack` The item stack moved to the player's cursor.
- `readonly player: Player` The player whose cursor item changed.

### PlayerCursorItemGrabAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PlayerCursorItemGrabAfterEvent) => void): (arg0: PlayerCursorItemGrabAfterEvent) => void` Adds a callback that is called when a player grabs an item from a container to their cursor.
- `unsubscribe(callback: (arg0: PlayerCursorItemGrabAfterEvent) => void): void` Removes a previously registered event callback.

### PlayerCursorItemReleaseAfterEvent [beta] (new type)

- `readonly item: ItemStack` The item stack from the player's cursor.
- `readonly player: Player` The player whose cursor item changed.

### PlayerCursorItemReleaseAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PlayerCursorItemReleaseAfterEvent) => void): (arg0: PlayerCursorItemReleaseAfterEvent) => void` Adds a callback that is called when a player releases an item from their cursor to a container.
- `unsubscribe(callback: (arg0: PlayerCursorItemReleaseAfterEvent) => void): void` Removes a previously registered event callback.

### PlayerItemAttackEntityBeforeEvent [beta] (new type)

- `readonly aimDirection?: Vector3` The normalized world-space direction used for the attack.
- `cancel: boolean` If set to true, the attack does not cause damage or other authoritative attack effects.
- `readonly itemStack?: ItemStack` A snapshot of the item held by the attacking player.
- `readonly player: Player` The player that initiated the attack.
- `readonly target: Entity` The entity targeted by the attack.

### PlayerItemAttackEntityBeforeEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PlayerItemAttackEntityBeforeEvent) => void): (arg0: PlayerItemAttackEntityBeforeEvent) => void` Adds a callback that runs before a player attacks an entity through an item interaction.
- `unsubscribe(callback: (arg0: PlayerItemAttackEntityBeforeEvent) => void): void` Removes a callback from this event signal.

### PlayerPlaceBlockBeforeEvent [beta] (new type)

- `cancel: boolean` If set to true, cancels the block place event.
- `readonly face: Direction` The face of the block that the new block is being placed on.
- `readonly faceLocation: Vector3` Location relative to the bottom north-west corner of the block where the new block is being placed onto.
- `readonly permutationToPlace: BlockPermutation` The block permutation that will be placed if the event is not cancelled.
- `readonly player: Player` Player that is placing the block for this event.

### PlayerPlaceBlockBeforeEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PlayerPlaceBlockBeforeEvent) => void, options?: BlockEventOptions): (arg0: PlayerPlaceBlockBeforeEvent) => void` Adds a callback that will be called before a block is placed by a player.
- `unsubscribe(callback: (arg0: PlayerPlaceBlockBeforeEvent) => void): void` Removes a callback from being called before an block is placed by a player.

### PlayerUseNameTagAfterEvent [beta] (new type)

- `entityNamed: Entity` The entity that was named by the player.
- `newName: string` The new name that the player has given to the entity.
- `player: Player` Handle to the player that used the name tag.
- `previousName?: string` The previous name of the entity before the player used the name tag.

### PlayerUseNameTagAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: PlayerUseNameTagAfterEvent) => void): (arg0: PlayerUseNameTagAfterEvent) => void` Subscribes the specified callback to a player use name tag after event.
- `unsubscribe(callback: (arg0: PlayerUseNameTagAfterEvent) => void): void` Removes the specified callback from a player use name tag after event.

### PlayerWaypointsMode [beta] (new type)

- `Everyone = 'Everyone'`
- `Off = 'Off'`

### PoiBlockInstance [beta] (new type)

- `readonly position: Vector3` Block position of this POI instance.
- `readonly tickets: number` Number of tickets currently available to be claimed from this POI instance.

### PoiBlockManager [beta] (new type)

- `addTemporary(position: Vector3, poi: PoiBlockType | string | number): void` Adds a block point of interest at a position.
- `at(position: Vector3): PoiBlockType | undefined` Gets the type of the block point of interest at a position.
- `exists(position: Vector3, filter: ((arg0: PoiBlockType) => boolean) | PoiNameFilter | PoiTagFilter): boolean` Tests whether a block point of interest at a position matches a type filter.
- `getInRange(filter: ((arg0: PoiBlockType) => boolean) | PoiNameFilter | PoiTagFilter, center: Vector3, blockRadius: number, occupancyFilter?: PoiBlockOccupancyFilter): PoiBlockInstance[]` Returns block points of interest that match the supplied type and occupancy filters within the specified distance of a location.
- `getInRangeSorted(filter: ((arg0: PoiBlockType) => boolean) | PoiNameFilter | PoiTagFilter, center: Vector3, blockRadius: number, occupancyFilter?: PoiBlockOccupancyFilter): PoiDistancePair[]` Returns block points of interest that match the supplied type and occupancy filters within an axis-aligned square centered on the specified location, sorted from nearest to farthest.
- `getInSquare(filter: ((arg0: PoiBlockType) => boolean) | PoiNameFilter | PoiTagFilter, center: Vector3, blockRadius: number, occupancyFilter?: PoiBlockOccupancyFilter): PoiBlockInstance[]` Returns block points of interest that match the supplied type and occupancy filters within an axis-aligned square centered on the specified location.
- `release(center: Vector3): boolean` Releases one previously claimed ticket at a block point of interest.
- `take(filter: ((arg0: PoiBlockType) => boolean) | PoiNameFilter | PoiTagFilter, center: Vector3, blockRadius: number): Vector3 | undefined` Claims one available ticket from a matching block point of interest within range.

### PoiBlockOccupancyFilter [beta] (new type)

- `Any = 'Any'` Includes POI instances regardless of their occupancy or available ticket count.
- `Full = 'Full'` Includes POI instances with no available tickets.
- `HasVacancy = 'HasVacancy'` Includes POI instances with at least one ticket available to be claimed.

### PoiBlockType [beta] (new type)

- `equals(other: PoiBlockType): boolean` Tests whether this object and another object describe the same POI type.
- `hasTag(tag: string): boolean` Tests whether the type has the provided tag attribute
- `readonly id: number` Numeric identifier of this POI type.
- `readonly name: string` Namespaced identifier of this POI type.
- `readonly tickets: number` Maximum number of tickets that can be claimed from each POI instance of this type.
- `readonly usableRange: number` Maximum range, in blocks, at which this POI type is considered usable.

### PoiDistancePair [beta] (new type)

- `distance: number` Squared three-dimensional distance, in blocks squared, from the query center to the POI position.
- `poi: PoiBlockInstance` POI instance at this distance.

### PoiManager [beta] (new type)

- `readonly blocks: PoiBlockManager` Provides access to block-based points of interest in the dimension.

### PoiNameFilter [beta] (new type)

- `name: string` Exact namespaced POI type identifier to match.

### PoiTagFilter [beta] (new type)

- `tags: string[]` Namespaced POI tags that a matching type must contain.

### PrimitiveShape [beta]

The base class for a text primitive.

- `defaultVisibleToAll: boolean`
- `hiddenFrom: Player[]`

### RecipeCraftingContext [beta] (new type)

- `getInputItem(slot: number): ItemStack | undefined` Gets the item in the provided input slot.
- `getOutputItem(): ItemStack | undefined` Gets the item produced by the currently selected recipe.
- `readonly inputSlotCount: number` The amount of addressable input slots for getInputItem and setInputItem.
- `readonly isValid: boolean` Whether this recipe crafting context is valid.
- `setInputItem(slot: number, item?: ItemStack): void` Sets or clears an item in an input slot.
- `setSelectedRecipe(recipeId: string): void` Selects a recipe for the current crafting operation.
- `readonly validRecipes: string[]` The identifiers of the recipes that are valid for the current input items.

### ServerMessageAfterEventSignal [beta] (new type)

- `subscribe(callback: (arg0: MessageReceiveAfterEvent) => void): (arg0: MessageReceiveAfterEvent) => void` Adds a callback that will be called when an internal message is passed.
- `unsubscribe(callback: (arg0: MessageReceiveAfterEvent) => void): void` Removes a callback from being called when an internal message is passed.

### SetBannerDetailsFunction [beta]

Loot item function that modifies the type of a banner that drops.

- `readonly baseColor: string`
- `readonly patterns: BannerPattern[]`

### SystemBeforeEvents [beta]

A set of events that fire before an actual action occurs.

- `readonly watchdogTerminate: WatchdogTerminateBeforeEventSignal`

### WatchdogTerminateBeforeEvent [beta] (new type)

- `cancel: boolean` If set to true, cancels the termination of the script runtime.
- `readonly terminateReason: WatchdogTerminateReason` Contains the reason why a script runtime is to be terminated.

### WatchdogTerminateBeforeEventSignal [beta] (new type)

- `subscribe(callback: (arg0: WatchdogTerminateBeforeEvent) => void): (arg0: WatchdogTerminateBeforeEvent) => void` Adds a callback that will be called when a script runtime is being terminated due to a violation of the performance watchdog system.
- `unsubscribe(callback: (arg0: WatchdogTerminateBeforeEvent) => void): void` Removes a callback from being called when a script runtime is being terminated due to a violation of the performance watchdog system.

### WatchdogTerminateReason [beta] (new type)

- `Hang = 'Hang'` Script runtime for a behavior pack is terminated due to non-responsiveness from script (a hang or infinite loop).
- `StackOverflow = 'StackOverflow'` Script runtime for a behavior pack is terminated due to a stack overflow (a long, and potentially infinite) chain of function calls.

### World [beta]

A class that wraps the state of a world - a set of dimensions and the environment of Minecraft.

- `allowCheats: boolean`
- `broadcastClientMessage(id: string, value: string): void`

### WorldAfterEvents [beta]

Contains a set of events that are available across the scope of the World.

- `readonly chatSend: ChatSendAfterEventSignal`
- `readonly messageReceive: ServerMessageAfterEventSignal`
- `readonly packSettingChange: PackSettingChangeAfterEventSignal`
- `readonly playerCraftRecipe: PlayerCraftRecipeAfterEventSignal`
- `readonly playerCursorItemGrab: PlayerCursorItemGrabAfterEventSignal`
- `readonly playerCursorItemRelease: PlayerCursorItemReleaseAfterEventSignal`
- `readonly playerUseNameTag: PlayerUseNameTagAfterEventSignal`

### WorldBeforeEvents [beta]

A set of events that fire before an actual action occurs.

- `readonly chatSend: ChatSendBeforeEventSignal`
- `readonly playerItemAttackEntity: PlayerItemAttackEntityBeforeEventSignal`
- `readonly playerPlaceBlock: PlayerPlaceBlockBeforeEventSignal`

## @minecraft/server-ui

Stable 2.2.0, rc 2.3.0-rc.1.26.60-preview.30, beta 2.4.0-beta.1.26.60-preview.30. 14 names coming in the next stable, 13 beta-only.

### ButtonOptions [next stable]

Options for configuring a button component.

- `imageDetails?: ImageDetails`

### DropdownOptions [next stable]

Options for configuring a dropdown component.

- `tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage`

### ImageDetails [next stable] (new type)

- `imagePackId: ObservableString | string` Identifier of the resource pack that provides the imageSrc asset.
- `imageSrc: ObservableString | string` Path to an image displayed.

### MessageBox [next stable]

A simple message form with two buttons and a text body.

- `button1WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox`
- `button2WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox`

### MessageBoxButtonOptions [next stable] (new type)

- `imageDetails?: ImageDetails` Details of an image to display alongside the button label.
- `tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage` Text shown in a tooltip when the player hovers over the button.

### SliderOptions [next stable]

Options for configuring a slider component.

- `tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage`

### TextFieldOptions [next stable]

Options for configuring a text field component.

- `tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage`

### TextOptions [next stable]

Options for configuring a text component (label or header).

- `tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage`

### ToggleOptions [next stable]

Options for configuring a toggle component.

- `tooltip?: ObservableString | ObservableUIRawMessage | string | UIRawMessage`

### ButtonData [beta] (new type)

- `label: ObservableString | ObservableUIRawMessage | string | UIRawMessage` The text label to display on the button.
- `onClick: () => void` A callback function that is invoked when the player clicks the button.
- `options?: ButtonOptions` Optional configuration for the button, such as a tooltip, disabled state, image, or visibility.

### CustomForm [beta]

A customizable data driven (DDUI) form that lets you add buttons, labels, toggles, dropdowns, sliders, text fields, and more.

- `multiButtonRow(buttons: ButtonData[], options?: MultiButtonRowOptions): CustomForm`

### CustomFormOptions [beta] (new type)

### MessageBox [beta]

A simple message form with two buttons and a text body.

- `button3WithOptions(label: ObservableString | ObservableUIRawMessage | string | UIRawMessage, options?: MessageBoxButtonOptions): MessageBox`

### MessageBoxBodyOptions [beta] (new type)

### MessageBoxOptions [beta] (new type)

- `showHorizontalButtons: boolean` Sets the desired layout for the buttons.

### MultiButtonRowOptions [beta] (new type)

- `visible?: boolean | ObservableBoolean` When false or bound to a false, the entire row is hidden.

### SliderOptions [beta]

Options for configuring a slider component.

- `fixedFormatDigits?: number | ObservableNumber`

## @minecraft/server-graphics

Stable 1.0.0, rc 1.0.0-rc.1.26.60-preview.23, beta 1.1.0-beta.1.26.60-preview.30. 0 names coming in the next stable, 0 beta-only.

## @minecraft/server-gametest

No stable release: everything here is **[beta module]** (1.0.0-beta.1.26.60-preview.30). For automated tests in test worlds.

### FenceConnectivity [beta module] (new type)

Returns information about whether this fence is connected to other fences in several directions.

- `readonly east: boolean` Represents whether this fence block is connected to another fence to the east (x + 1).
- `readonly north: boolean` Represents whether this fence block is connected to another fence to the north (z - 1).
- `readonly south: boolean` Represents whether this fence block is connected to another fence to the south (z + 1).
- `readonly west: boolean` Represents whether this fence block is connected to another fence to the west (x - 1).

### GameTestCompletedError [beta module] (new type)

- `readonly reason: GameTestCompletedErrorReason`

### GameTestCompletedErrorReason [beta module] (new type)

- `Cleanup = 'Cleanup'`
- `Done = 'Done'`

### GameTestError [beta module] (new type)

- `readonly context?: GameTestErrorContext`
- `readonly messageParameters: string[]`
- `readonly type: GameTestErrorType`

### GameTestErrorContext [beta module] (new type)

- `absolutePosition: minecraftserver.Vector3`
- `relativePosition: minecraftserver.Vector3`
- `tickCount: number`

### GameTestErrorType [beta module] (new type)

- `Assert = 'Assert'`
- `AssertAtPosition = 'AssertAtPosition'`
- `ExecutionTimeout = 'ExecutionTimeout'`
- `ExhaustedAttempts = 'ExhaustedAttempts'`
- `FailConditionsMet = 'FailConditionsMet'`
- `LevelStateModificationFailed = 'LevelStateModificationFailed'`
- `MethodNotImplemented = 'MethodNotImplemented'`
- `SimulatedPlayerOutOfBounds = 'SimulatedPlayerOutOfBounds'`
- `Unknown = 'Unknown'`
- `Waiting = 'Waiting'`

### GameTestSequence [beta module] (new type)

Executes a set of steps defined via chained .thenXyz methods, sequentially.

- `thenExecute(callback: () => void): GameTestSequence` Runs the given callback as a step within a GameTest sequence.
- `thenExecuteAfter(delayTicks: number, callback: () => void): GameTestSequence` After a delay, runs the given callback as a step within a GameTest sequence.
- `thenExecuteFor(tickCount: number, callback: () => void): GameTestSequence` Runs the given callback every tick for the given number of ticks.
- `thenFail(errorMessage: string): void` Causes the test to fail if this step in the GameTest sequence is reached.
- `thenIdle(delayTicks: number): GameTestSequence` Idles the GameTest sequence for the specified delayTicks.
- `thenSucceed(): void` Marks the GameTest a success if this step is reached in the GameTest sequence.
- `thenWait(callback: () => void): GameTestSequence` Executes the given callback every tick until it succeeds.
- `thenWaitAfter(delayTicks: number, callback: () => void): GameTestSequence` After a delay from the previous step, executes the given callback every tick until it succeeds.

### getPlayerSkin [beta module] (new type)

Returns data about a player's skin.

### LookDuration [beta module] (new type)

- `Continuous = 'Continuous'`
- `Instant = 'Instant'`
- `UntilMove = 'UntilMove'`

### MoveToOptions [beta module] (new type)

- `faceTarget?: boolean`
- `speed?: number`

### NavigationResult [beta module] (new type)

- `getPath(): minecraftserver.Vector3[]`
- `readonly isFullPath: boolean`

### PersonaArmSize [beta module] (new type)

- `Slim = 'Slim'`
- `Wide = 'Wide'`

### PersonaPieceType [beta module] (new type)

- `Arms = 'Arms'`
- `Back = 'Back'`
- `Body = 'Body'`
- `Bottom = 'Bottom'`
- `Capes = 'Capes'`
- `Dress = 'Dress'`
- `Eyes = 'Eyes'`
- `FaceAccessory = 'FaceAccessory'`
- `FacialHair = 'FacialHair'`
- `Feet = 'Feet'`
- `Hair = 'Hair'`
- `Hands = 'Hands'`
- `Head = 'Head'`
- `HighPants = 'HighPants'`
- `Hood = 'Hood'`
- `LeftArm = 'LeftArm'`
- `LeftLeg = 'LeftLeg'`
- `Legs = 'Legs'`
- `Mouth = 'Mouth'`
- `Outerwear = 'Outerwear'`
- `RightArm = 'RightArm'`
- `RightLeg = 'RightLeg'`
- `Skeleton = 'Skeleton'`
- `Skin = 'Skin'`
- `Top = 'Top'`

### PlayerPersonaPiece [beta module] (new type)

Data pertaining to a specific player Persona piece.

- `id: string`
- `isDefaultPiece?: boolean`
- `packId: string`
- `productId: string`
- `type: PersonaPieceType`

### PlayerSkinData [beta module] (new type)

Data pertaining to a player's configured skin.

- `armSize?: PersonaArmSize`
- `personaPieces?: PlayerPersonaPiece[]`
- `skinColor?: minecraftserver.RGB`

### register [beta module] (new type)

Registers a new GameTest function.

### registerAsync [beta module] (new type)

Registers a new GameTest function that is designed for asynchronous execution.

### RegistrationBuilder [beta module] (new type)

A utility class to set GameTest parameters for a test.

- `batch(batchName: string): RegistrationBuilder` Sets the batch for the test to run in.
- `maxAttempts(attemptCount: number): RegistrationBuilder` Sets the maximum number of times a test will try to rerun if it fails.
- `maxTicks(tickCount: number): RegistrationBuilder` Sets the maximum number of ticks a test will run for before timing out and failing.
- `padding(paddingBlocks: number): RegistrationBuilder` Size around the GameTest, in blocks, that should be reserved for the test when running multiple tests together.
- `required(isRequired: boolean): RegistrationBuilder` Whether this test is required to pass as part of its broader set of tests.
- `requiredSuccessfulAttempts(attemptCount: number): RegistrationBuilder` Sets the number of successful test runs to be considered successful.
- `rotateTest(rotate: boolean): RegistrationBuilder` If true, runs the test in all four rotations when run via /gametest runset.
- `setupTicks(tickCount: number): RegistrationBuilder` Sets the number of ticks for a test to wait before executing when the structure is spawned.
- `structureLocation(structureLocation: minecraftserver.Vector3, structureDimension?: minecraftserver.DimensionType | string): RegistrationBuilder` Overrides the default structure placement with a specific location and dimension.
- `structureName(structureName: string): RegistrationBuilder` Sets the name of the structure for a test to use.
- `tag(tag: string): RegistrationBuilder` Adds a tag to a test.

### SculkSpreader [beta module] (new type)

Implements a class that can be used for testing sculk spreading behaviors.

- `addCursorsWithOffset(offset: minecraftserver.Vector3, charge: number): void` Adds a cursor - which is a notional waypoint that the sculk will spread in the direction of.
- `getCursorPosition(index: number): minecraftserver.Vector3` Retrieves the current position of the specified cursor.
- `getNumberOfCursors(): number` Returns a number of overall cursors for this sculk spreader.
- `getTotalCharge(): number` Gets the total current charge of the sculk spreader.
- `readonly maxCharge: number` Gets the maximum charge of a sculk spreader.

### setAfterBatchCallback [beta module] (new type)

Sets a callback that is called after the batch gets called.

### setBeforeBatchCallback [beta module] (new type)

Sets a callback that is called before the batch gets called.

### SimulatedPlayer [beta module] (new type)

A simulated player can be used within GameTests to represent how a player moves throughout the world and to support testing of how entities and the environment will react to a player.

- `attack(): boolean` Causes the simulated player to make an attack 'swipe'.
- `attackEntity(entity: minecraftserver.Entity): boolean` Causes the simulated player to attack the provided target.
- `breakBlock(blockLocation: minecraftserver.Vector3, direction?: minecraftserver.Direction): boolean` Destroys the block at blockLocation, respecting the rules of the server player's game mode.
- `chat(message: string): void`
- `disconnect(): void` Simulates and performs a disconnection of the simulated player from the world.
- `dropSelectedItem(): boolean` Drops the simulated player's selected item
- `fly(): void` Causes the simulated player to start flying as though they were flying in creative mode.
- `giveItem(itemStack: minecraftserver.ItemStack, selectSlot?: boolean): boolean` Gives the simulated player a particular item stack.
- `glide(): boolean` Causes the simulated player to start gliding.
- `readonly headRotation: minecraftserver.Vector2` Rotation of the head across pitch and yaw angles.
- `interact(): boolean` Performs a raycast from the player’s head and interacts with the first intersected block or entity.
- `interactWithBlock(blockLocation: minecraftserver.Vector3, direction?: minecraftserver.Direction): boolean` Causes the simulated player to interact with a block.
- `interactWithEntity(entity: minecraftserver.Entity): boolean` Causes the simulated player to interact with a mob.
- `isSprinting: boolean` Returns whether the simulated player is sprinting.
- `jump(): boolean` Causes the simulated player to jump.
- `lookAtBlock(blockLocation: minecraftserver.Vector3, duration?: LookDuration): void` Rotates the simulated player's head/body to look at the given block location.
- `lookAtEntity(entity: minecraftserver.Entity, duration?: LookDuration): void` Rotates the simulated player's head/body to look at the given entity.
- `lookAtLocation(location: minecraftserver.Vector3, duration?: LookDuration): void` Rotates the simulated player's head/body to look at the given location.
- `move(westEast: number, northSouth: number, speed?: number): void` Orders the simulated player to walk in the given direction relative to the GameTest.
- `moveRelative(leftRight: number, backwardForward: number, speed?: number): void` Orders the simulated player to walk in the given direction relative to the player's current rotation.
- `moveToBlock(blockLocation: minecraftserver.Vector3, options?: MoveToOptions): void` Orders the simulated player to move to the given block location in a straight line.
- `moveToLocation(location: minecraftserver.Vector3, options?: MoveToOptions): void` Orders the simulated player to move to the given location in a straight line.
- `navigateToBlock(blockLocation: minecraftserver.Vector3, speed?: number): NavigationResult` Orders the simulated player to move to a specific block location using navigation.
- `navigateToEntity(entity: minecraftserver.Entity, speed?: number): NavigationResult` Will use navigation to follow the selected entity to within a one block radius.
- `navigateToLocation(location: minecraftserver.Vector3, speed?: number): NavigationResult` Orders the simulated player to move to a specific location using navigation.
- `navigateToLocations(locations: minecraftserver.Vector3[], speed?: number): void` Use navigation to follow the route provided via the locations parameter.
- `respawn(): boolean` Respawns the particular simulated player.
- `rotateBody(angleInDegrees: number): void` Causes the simulated player to turn by the provided angle, relative to the player's current rotation.
- `setBodyRotation(angleInDegrees: number): void` Causes the simulated player to turn to face the provided angle, relative to the GameTest.
- `setItem(itemStack: minecraftserver.ItemStack, slot: number, selectSlot?: boolean): boolean` Sets a particular item for the simulated player.
- `setSkin(options: PlayerSkinData): void` Updates information about the player's skin.
- `startBuild(slot?: number): void`
- `stopBreakingBlock(): void` Stops destroying the block that is currently being hit.
- `stopBuild(): void`
- `stopFlying(): void` Causes the simulated player to stop flying.
- `stopGliding(): void` Causes the simulated player to stop gliding.
- `stopInteracting(): void` Stops interacting with entities or blocks.
- `stopMoving(): void` Stops moving/walking/following if the simulated player is moving.
- `stopSwimming(): void` Causes the simulated player to stop swimming.
- `stopUsingItem(): minecraftserver.ItemStack | undefined` Stops using the currently active item.
- `swim(): void` Causes the simulated player to start swimming.
- `useItem(itemStack: minecraftserver.ItemStack): boolean` Causes the simulated player to use an item.
- `useItemInSlot(slot: number): boolean` Causes the simulated player to hold and use an item in their inventory.
- `useItemInSlotOnBlock(slot: number, blockLocation: minecraftserver.Vector3, direction?: minecraftserver.Direction, faceLocation?: minecraftserver.Vector3): boolean` Causes the simulated player to use an item in their inventory on a block.
- `useItemOnBlock(itemStack: minecraftserver.ItemStack, blockLocation: minecraftserver.Vector3, direction?: minecraftserver.Direction, faceLocation?: minecraftserver.Vector3): boolean` Causes the simulated player to use an item on a block.

### spawnSimulatedPlayer [beta module] (new type)

Spawns a simulated player that isn't associated to a specific Test.

### Tags [beta module] (new type)

These well-known tags can be used to classify different tests into suites to run.

- `static readonly suiteAll = 'suite:all'` Indicates that the tagged test should be a part of all suites.
- `static readonly suiteDebug = 'suite:debug'` Indicates that the tagged test should be a part of an internal (debug) test suite.
- `static readonly suiteDefault = 'suite:default'` Indicates that the tagged test should be a part of the default test suite.
- `static readonly suiteDisabled = 'suite:disabled'` Indicates that the tagged test should be a part of a suite of disabled tests.
- `static readonly suiteNextUpdate = 'suite:nextupdate'`

### Test [beta module] (new type)

Main class for GameTest functions, with helpers and data for manipulating the respective test.

- `assert(condition: boolean, message: string): void` Tests that the condition specified in _condition_ is true.
- `assertBlockPresent(blockType: minecraftserver.BlockType | string, blockLocation: minecraftserver.Vector3, isPresent?: boolean): void` Tests that a block of the specified type is present at the specified location.
- `assertBlockState(blockLocation: minecraftserver.Vector3, callback: (arg0: minecraftserver.Block) => boolean): void` Tests that a block has a particular state value at the specified location.
- `assertCanReachLocation(mob: minecraftserver.Entity, blockLocation: minecraftserver.Vector3, canReach?: boolean): void` Tests that an entity can reach a particular location.
- `assertContainerContains(itemStack: minecraftserver.ItemStack, blockLocation: minecraftserver.Vector3): void` Tests that a container (e.g., a chest) at the specified location contains a specified of item stack.
- `assertContainerEmpty(blockLocation: minecraftserver.Vector3): void` Tests that a container (e.g., a chest) at the specified location is empty.
- `assertEntityHasArmor(entityTypeIdentifier: string, armorSlot: number, armorName: string, armorData: number, blockLocation: minecraftserver.Vector3, hasArmor?: boolean): void` Tests that an entity has a specific piece of armor equipped.
- `assertEntityHasComponent(entityTypeIdentifier: string, componentIdentifier: string, blockLocation: minecraftserver.Vector3, hasComponent?: boolean): void` Tests that an entity has a particular component.
- `assertEntityInstancePresent(entity: minecraftserver.Entity, blockLocation: minecraftserver.Vector3, isPresent?: boolean): void` Depending on the value for isPresent, tests that a particular entity is present or not present at the specified location.
- `assertEntityInstancePresentInArea(entity: minecraftserver.Entity, isPresent?: boolean): void` Tests that an entity instance is present within the GameTest area.
- `assertEntityPresent(entityTypeIdentifier: string, blockLocation: minecraftserver.Vector3, searchDistance?: number, isPresent?: boolean): void` Depending on the value of isPresent, tests for the presence or non-presence of entity of a specified type at a particular location.
- `assertEntityPresentInArea(entityTypeIdentifier: string, isPresent?: boolean): void` Tests that an entity of a specified type is present within the GameTest area.
- `assertEntityState(blockLocation: minecraftserver.Vector3, entityTypeIdentifier: string, callback: (arg0: minecraftserver.Entity) => boolean): void` Tests that an entity (e.g., a skeleton) at the specified location has a particular piece of data.
- `assertEntityTouching(entityTypeIdentifier: string, location: minecraftserver.Vector3, isTouching?: boolean): void` Depending on the value of isTouching, tests that an entity of a specified type is touching or connected to another entity.
- `assertIsWaterlogged(blockLocation: minecraftserver.Vector3, isWaterlogged?: boolean): void` Depending on the value of isWaterlogged, tests that a block at a location contains water.
- `assertItemEntityCountIs(itemType: minecraftserver.ItemType | string, blockLocation: minecraftserver.Vector3, searchDistance: number, count: number): void` Tests that items of a particular type and count are present within an area.
- `assertItemEntityPresent(itemType: minecraftserver.ItemType | string, blockLocation: minecraftserver.Vector3, searchDistance?: number, isPresent?: boolean): void` Depending on the value of isPresent, tests whether a particular item entity is present or not at a particular location.
- `assertRedstonePower(blockLocation: minecraftserver.Vector3, power: number): void` Tests that Redstone power at a particular location matches a particular value.
- `destroyBlock(blockLocation: minecraftserver.Vector3, dropResources?: boolean): void` Destroys a block at a particular location.
- `fail(errorMessage: string): void` Marks the current test as a failure case.
- `failIf(callback: () => void): void` Runs the given callback.
- `getBlock(blockLocation: minecraftserver.Vector3): minecraftserver.Block` Gets a block at the specified block location.
- `getDimension(): minecraftserver.Dimension` Gets the dimension of this test.
- `getFenceConnectivity(blockLocation: minecraftserver.Vector3): FenceConnectivity` If the block at the specified block location is a fence, this returns a helper object with details on how a fence is connected.
- `getSculkSpreader(blockLocation: minecraftserver.Vector3): SculkSpreader | undefined` Retrieves a sculk spreader object that can be used to control and manage how sculk grows from a block.
- `getTestDirection(): minecraftserver.Direction` Returns the direction of the current test - see the minecraftserver.Direction enum for more information on potential values (north, east, south, west - values 2-5).
- `idle(tickDelay: number): Promise<void>` This asynchronous function will wait for the specified time in ticks before continuing execution.
- `isCleaningUp(): boolean` Returns whether or not the test is currently in the Clean Up step after running.
- `isCompleted(): boolean` Returns whether or not the test has already completed
- `killAllEntities(): void` Kills all entities within the GameTest structure.
- `onPlayerJump(mob: minecraftserver.Entity, jumpAmount: number): void`
- `pressButton(blockLocation: minecraftserver.Vector3): void` Presses a button at a block location.
- `print(text: string): void` Displays the specified message to all players.
- `pullLever(blockLocation: minecraftserver.Vector3): void` Pulls a lever at a block location.
- `pulseRedstone(blockLocation: minecraftserver.Vector3, duration: number): void` Sends a Redstone pulse at a particular location by creating a temporary Redstone block.
- `relativeBlockLocation(worldBlockLocation: minecraftserver.Vector3): minecraftserver.Vector3` From a BlockLocation, returns a new BlockLocation with coordinates relative to the current GameTest structure block.
- `relativeLocation(worldLocation: minecraftserver.Vector3): minecraftserver.Vector3` From a location, returns a new location with coordinates relative to the current GameTest structure block.
- `removeSimulatedPlayer(simulatedPlayer: SimulatedPlayer): void` Removes a simulated player from the world.
- `rotateDirection(direction: minecraftserver.Direction): minecraftserver.Direction` Returns a relative direction given the current rotation of the current test.
- `rotateVector(vector: minecraftserver.Vector3): minecraftserver.Vector3`
- `runAfterDelay(delayTicks: number, callback: () => void): void` Runs a specific callback after a specified delay of ticks
- `runAtTickTime(tick: number, callback: () => void): void` Runs the given callback after a delay of _tick_ ticks from the start of the GameTest.
- `runOnFinish(callback: () => void): void` Runs the given callback after the GameTest has completed regardless if the test passed, failed, or timed out.
- `setBlockPermutation(blockData: minecraftserver.BlockPermutation, blockLocation: minecraftserver.Vector3): void` Sets a block to a particular configuration (a BlockPermutation) at the specified block location.
- `setBlockType(blockType: minecraftserver.BlockType | string, blockLocation: minecraftserver.Vector3): void` Sets a block to a particular type at the specified block location.
- `setFluidContainer(location: minecraftserver.Vector3, type: minecraftserver.FluidType): void` For blocks that are fluid containers - like a cauldron - changes the type of fluid within that container.
- `setTntFuse(entity: minecraftserver.Entity, fuseLength: number): void` Sets the fuse of an explodable entity.
- `spawn(entityTypeIdentifier: string, blockLocation: minecraftserver.Vector3): minecraftserver.Entity` Spawns an entity at a location.
- `spawnAtLocation(entityTypeIdentifier: string, location: minecraftserver.Vector3): minecraftserver.Entity` Spawns an entity at a location.
- `spawnItem(itemStack: minecraftserver.ItemStack, location: minecraftserver.Vector3): minecraftserver.Entity` Spawns an item entity at a specified location.
- `spawnSimulatedPlayer(blockLocation: minecraftserver.Vector3, name?: string, gameMode?: minecraftserver.GameMode): SimulatedPlayer` Creates a new simulated player within the world.
- `spawnWithoutBehaviors(entityTypeIdentifier: string, blockLocation: minecraftserver.Vector3): minecraftserver.Entity` Spawns an entity at a location without any AI behaviors.
- `spawnWithoutBehaviorsAtLocation(entityTypeIdentifier: string, location: minecraftserver.Vector3): minecraftserver.Entity` Spawns an entity at a location without any AI behaviors.
- `spreadFromFaceTowardDirection(blockLocation: minecraftserver.Vector3, fromFace: minecraftserver.Direction, direction: minecraftserver.Direction): void` Tests that a particular item entity is present at a particular location.
- `startSequence(): GameTestSequence` Creates a new GameTestSequence - A set of steps that play out sequentially within a GameTest.
- `succeed(): void` Marks the current test as a success case.
- `succeedIf(callback: () => void): void` Runs the given callback.
- `succeedOnTick(tick: number): void` Marks the test as a success at the specified tick.
- `succeedOnTickWhen(tick: number, callback: () => void): void` Runs the given callback at _tick_ ticks after the start of the test.
- `succeedWhen(callback: () => void): void` Runs the given callback every tick.
- `succeedWhenBlockPresent(blockType: minecraftserver.BlockType | string, blockLocation: minecraftserver.Vector3, isPresent?: boolean): void` Depending on the condition of isPresent, tests for the presence of a block of a particular type on every tick.
- `succeedWhenEntityHasComponent(entityTypeIdentifier: string, componentIdentifier: string, blockLocation: minecraftserver.Vector3, hasComponent: boolean): void` Tests for the presence of a component on every tick.
- `succeedWhenEntityPresent(entityTypeIdentifier: string, blockLocation: minecraftserver.Vector3, isPresent?: boolean): void` Depending on the value of isPresent, tests for the presence of an entity on every tick.
- `triggerInternalBlockEvent(blockLocation: minecraftserver.Vector3, event: string, eventParameters?: number[]): void` Triggers a block event from a fixed list of available block events.
- `until(callback: () => void): Promise<void>` This asynchronous function will wait until the code in the specified callback successfully completes.
- `walkTo(mob: minecraftserver.Entity, blockLocation: minecraftserver.Vector3, speedModifier?: number): void` Forces a mob to walk to a particular location.
- `walkToLocation(mob: minecraftserver.Entity, location: minecraftserver.Vector3, speedModifier?: number): void` Forces a mob to walk to a particular location.
- `worldBlockLocation(relativeBlockLocation: minecraftserver.Vector3): minecraftserver.Vector3` From a BlockLocation with coordinates relative to the GameTest structure block, returns a new BlockLocation with coordinates relative to world.
- `worldLocation(relativeLocation: minecraftserver.Vector3): minecraftserver.Vector3` From a location with coordinates relative to the GameTest structure block, returns a new location with coordinates relative to world.

## @minecraft/server-admin

No stable release: everything here is **[beta module]** (1.0.0-beta.1.26.60-preview.30). Bedrock Dedicated Server only.

### AdminBeforeEvents [beta module] (new type)

- `readonly asyncPlayerJoin: AsyncPlayerJoinBeforeEventSignal` This event is fired before a player joins the world.

### AllowList [beta module] (new type)

Controls the allow list for the server.

- `add(playerDetails: AllowListEntryNameInfo | minecraftserver.Player, ignorePlayerLimit?: boolean): void` Adds a player to the server's allow list.
- `clear(): void` Clears the allow list, removing all entries.
- `contains(playerDetails: AllowListEntryNameInfo | minecraftserver.Player): boolean` Returns if the player is in the server's allow list.
- `enabled: boolean`
- `readonly entries: AllowListEntry[]` The list of entries in the allow list.
- `reloadFile(): void` Reloads the server's allow list from disk.
- `remove(playerDetails: AllowListEntryNameInfo | minecraftserver.Player): void` Removes a player from the server's allow list.

### AllowListEntry [beta module] (new type)

Represents an entry in the allow list.

- `ignoresPlayerLimit: boolean` Allows the player onto the server even when the server is at the player limit.
- `name?: string` The player's name.
- `xuid?: string` The player's xuid.

### AllowListEntryNameInfo [beta module] (new type)

Represents an entry to use with the allow list.

- `name?: string` The player's name.
- `xuid?: string` The player's xuid.

### AllowListFileReloadError [beta module] (new type)

An error that is thrown when the allow list file fails to reload.

### AllowListModificationError [beta module] (new type)

An error which is thrown when modifying the allow list has failed.

### AsyncPlayerJoinBeforeEvent [beta module] (new type)

The data available before a player joins the world.

- `allowJoin(): void` Call this to explicitly allow the player to join the server.
- `disallowJoin(reason?: string): void` Call this to disallow the player from joining the server.
- `disconnect(reason?: string): void` Deprecated - use AsyncPlayerJoinBeforeEvent.disallowJoin instead.
- `isValid(): boolean` Will return true if the player is still waiting to join the world.
- `readonly name: string` The player's name
- `readonly persistentId: string` An identifier that can be used to identify a player across sessions.
- `readonly splitScreenSlot?: minecraftserver.PlayerSplitScreenSlot` The split screen slot of the joining player or undefined if the player is not in a split screen session.

### AsyncPlayerJoinBeforeEventSignal [beta module] (new type)

- `subscribe(callback: (arg0: AsyncPlayerJoinBeforeEvent) => Promise<void>): (arg0: AsyncPlayerJoinBeforeEvent) => Promise<void>` Add a callback that's ran before a player joins the world.
- `unsubscribe(callback: (arg0: AsyncPlayerJoinBeforeEvent) => Promise<void>): boolean`

### beforeEvents [beta module] (new type)

### CannotDeopPlayerError [beta module] (new type)

An error which is thrown when attempting to deop a player which cannot have their permissions removed.

### CannotKickPlayerError [beta module] (new type)

An error which is thrown when attempting to kick a player who cannot be kicked.

### dedicatedServer [beta module] (new type)

A globally available, optional object that contains dedicated-server only apis.

### DedicatedServerUtils [beta module] (new type)

Contains apis that are only available when in Bedrock Dedicated Server.

- `readonly allowList: AllowList` Returns an object that manages the server's allow list.
- `readonly levelStorage: LevelStorage` Returns an object that manages the level's storage.
- `reloadCDNConfig(): void` Reloads the cdn configuration from disk.
- `reloadPermissions(): void` Reloads the permissions for the server from disk.
- `reloadScriptingConfig(): void` Reloads the script configuration for the server from disk.
- `stopServer(): void` Shuts down the dedicated server.

### deopPlayer [beta module] (new type)

Removes the player's op permissions.

### DisconnectedError [beta module] (new type)

An error that is thrown when trying to interact with a join event and the player is disconnected.

- `readonly id: string` The id of the player that was disconnected.

### kickPlayer [beta module] (new type)

Kicks a player from the server.

### LevelStorage [beta module] (new type)

Controls how the server saves to disk.

- `saveHold(): Promise<void>` Disables the server writing to the world files and begins creating a snapshot.
- `saveQuery(): Promise<LevelStorageQuerySnapshotFile[]>` Returns the path and size of every file in the current snapshot if a snapshot is being taken.
- `saveResume(): Promise<void>` Re-enables server writing world state to files and removes snapshot.

### LevelStorageQuerySnapshotFile [beta module] (new type)

Contains information about a file that was gathered during a snapshot.

- `readonly fileName: string` The path to the file in the snapshot.
- `readonly fileSize: number` The size of the file in the snapshot.

### LevelStorageSaveStateChangeError [beta module] (new type)

An error that is thrown when level storage save state management are used out of sequence or are repeated in an invalid way.

### opPlayer [beta module] (new type)

Gives the player op permissions.

### PlayerAlreadyOpError [beta module] (new type)

An error which is thrown when attempting to op a player that already has op permissions.

### secrets [beta module] (new type)

A globally available object that returns a list of dedicated-server configured secrets.

### SecretString [beta module] (new type)

This represents a placeholder object that represents a secret string.

### ServerSecrets [beta module] (new type)

A collection of server secrets defined in dedicated server configuration.

- `get(name: string): SecretString | undefined` Returns a SecretString that is a placeholder for a secret configured in a JSON file.
- `readonly names: string[]` A list of available, configured server secrets.

### ServerVariables [beta module] (new type)

A collection of server variables defined in dedicated server configuration.

- `get(name: string): unknown | undefined` Returns the value of variable that has been configured in a dedicated server configuration JSON file.
- `readonly names: string[]` A list of available, configured server variables.

### transferPlayer [beta module] (new type)

Transfer player to another server.

### TransferPlayerIpPortOptions [beta module] (new type)

Options when transferring a player to a server that supports direct host/port connections.

- `hostname: string` Hostname of the destination server.
- `port: number` Port of the destination server.

### TransferPlayerNetherNetOptions [beta module] (new type)

Options when transferring a player to a server that supports NetherNet connections.

- `netherNetId: string` NetherNet ID of the destination server.

### variables [beta module] (new type)

A globally available object that returns a list of dedicated-server configured variables.

## @minecraft/server-net

No stable release: everything here is **[beta module]** (1.0.0-beta.1.26.60-preview.30). Bedrock Dedicated Server only.

### beforeEvents [beta module] (new type)

### CloseAfterEventSignal [beta module] (new type)

- `subscribe(callback: (arg0: WebSocketClientCloseAfterEvent) => void): (arg0: WebSocketClientCloseAfterEvent) => void`
- `unsubscribe(callback: (arg0: WebSocketClientCloseAfterEvent) => void): void`

### http [beta module] (new type)

### HttpClient [beta module] (new type)

- `cancelAll(reason: string): void` Cancels all pending requests.
- `get(uri: string): Promise<HttpResponse>` Performs a simple HTTP get request.
- `request(config: HttpRequest): Promise<HttpResponse>` Performs an HTTP request.

### HttpHeader [beta module] (new type)

Represents an HTTP header - a key/value pair of meta-information about a request.

- `key: string` Key of the HTTP header.
- `value: minecraftserveradmin.SecretString | string` Value of the HTTP header.

### HttpRequest [beta module] (new type)

Main object for structuring a request.

- `addHeader(key: string, value: minecraftserveradmin.SecretString | string): HttpRequest` Adds an additional header to the overall list of headers used in the corresponding HTTP request.
- `body: minecraftserver.ISerializable | string` Content of the body of the HTTP request.
- `headers: HttpHeader[]` A collection of HTTP headers to add to the outbound request.
- `method: HttpRequestMethod` HTTP method (e.g., GET or PUT or PATCH) to use for making the request.
- `setBody(body: minecraftserver.ISerializable | string): HttpRequest` Updates the content of the body of the HTTP request.
- `setHeaders(headers: HttpHeader[]): HttpRequest` Replaces and applies a set of HTTP Headers for the request.
- `setMethod(method: HttpRequestMethod): HttpRequest` Sets the desired HTTP method (e.g., GET or PUT or PATCH) to use for making the request.
- `setTimeout(timeout: number): HttpRequest` Sets the maximum amount of time, in seconds, before the request times out and is cancelled.
- `timeout: number` Amount of time, in seconds, before the request times out and is abandoned.
- `uri: string` The HTTP resource to access.

### HttpRequestLimitExceededError [beta module] (new type)

An error thrown when the maximum number of concurrent HTTP requests has been reached.

- `readonly inFlightRequests: number` Number of requests already in flight when rejected.
- `readonly maxConcurrentRequests: number` Configured maximum concurrent HTTP requests.

### HttpRequestMethod [beta module] (new type)

- `Delete = 'Delete'` Represents the method for an HTTP DELETE request.
- `Get = 'Get'` Represents the method for an HTTP GET request.
- `Head = 'Head'` Represents the method for an HTTP HEAD request.
- `Patch = 'Patch'` Represents the method for an HTTP PATCH request.
- `Post = 'Post'` Represents the method for an HTTP POST request.
- `Put = 'Put'` Represents the method for an HTTP PUT request.

### HttpResponse [beta module] (new type)

Main object that contains result information from a request.

- `readonly body: string` Body content of the HTTP response.
- `deserialize(identifier: string): minecraftserver.ISerializable`
- `readonly headers: HttpHeader[]` A collection of HTTP response headers returned from the request.
- `readonly request: HttpRequest` Information that was used to formulate the HTTP response that this object represents.
- `readonly status: number` HTTP response code for the request.

### HttpStatusCode [beta module] (new type)

- `Accepted = 202`
- `AlreadyReported = 208`
- `BadGateway = 502`
- `BadRequest = 400`
- `ClientClosedRequest = 499`
- `ClientRequestTimeout = 498`
- `Conflict = 409`
- `ConnectionClosedWithoutResponse = 444`
- `Continue = 100`
- `Created = 201`
- `ExpectationFailed = 417`
- `FailedDependency = 424`
- `Forbidden = 403`
- `Found = 302`
- `GatewayTimeout = 504`
- `Gone = 410`
- `HttpVersionNotSupported = 505`
- `IMUsed = 226`
- `InsufficientStorage = 507`
- `InternalServerError = 500`
- `LengthRequired = 411`
- `Locked = 423`
- `LoopDetected = 508`
- `MethodNotAllowed = 405`
- `MisdirectedRequest = 421`
- `MovedPermanently = 301`
- `MultiStatus = 207`
- `MultipleChoices = 300`
- `NetworkAuthenticationRequired = 511`
- `NetworkConnectionTimeoutError = 599`
- `NoContent = 204`
- `NonAuthoritativeInformation = 203`
- `NotAcceptable = 406`
- `NotExtended = 510`
- `NotFound = 404`
- `NotImplemented = 501`
- `NotModified = 304`
- `OK = 200`
- `PartialContent = 206`
- `PayloadTooLarge = 413`
- `PaymentRequired = 402`
- `PermanentRedirect = 308`
- `PreconditionFailed = 412`
- `PreconditionRequired = 428`
- `Processing = 102`
- `ProxyAuthenticationRequired = 407`
- `RequestHeaderFieldsTooLarge = 431`
- `RequestTimeout = 408`
- `RequestURITooLong = 414`
- `RequestedRangeNotSatisfiable = 416`
- `ResetContent = 205`
- `SeeOther = 303`
- `ServiceUnavailable = 503`
- `SwitchingProtocols = 101`
- `TemporaryRedirect = 307`
- `TooEarly = 425`
- `TooManyRequests = 429`
- `Unauthorized = 401`
- `UnavailableForLegalReasons = 451`
- `UnprocessableEntity = 422`
- `UnsupportedMediaType = 415`
- `UpgradeRequired = 426`
- `UseProxy = 305`
- `VariantAlsoNegotiates = 506`

### InternalHttpRequestError [beta module] (new type)

An error thrown when a platform-level HTTP error occurs.

- `readonly errorCode: number`
- `readonly errorMessage: string`

### InternalWebSocketError [beta module] (new type)

An error thrown when a platform-level WebSocket error occurs.

- `readonly errorCode: number`
- `readonly errorMessage: string`

### MalformedUriError [beta module] (new type)

An error thrown when a malformed URI is used.

### MessageAfterEventSignal [beta module] (new type)

- `subscribe(callback: (arg0: WebSocketClientReceiveAfterEvent) => void): (arg0: WebSocketClientReceiveAfterEvent) => void`
- `unsubscribe(callback: (arg0: WebSocketClientReceiveAfterEvent) => void): void`

### NetworkBeforeEvents [beta module] (new type)

- `readonly packetReceive: PacketReceiveBeforeEventSignal`
- `readonly packetSend: PacketSendBeforeEventSignal`

### PacketEventOptions [beta module] (new type)

Options for events triggered by network packets.

- `ignoredPacketIds?: PacketId[]` If provided, packet IDs in this list will not trigger the event subscriptions.
- `monitoredPacketIds?: PacketId[]` If provided only packet IDs in this list will trigger the event subscriptions.

### PacketId [beta module] (new type)

Represents the unique type of network packet.

- `ActorEventPacket = 'ActorEventPacket'`
- `ActorPickRequestPacket = 'ActorPickRequestPacket'`
- `AddActorPacket = 'AddActorPacket'`
- `AddBehaviorTreePacket = 'AddBehaviorTreePacket'`
- `AddItemActorPacket = 'AddItemActorPacket'`
- `AddPaintingPacket = 'AddPaintingPacket'`
- `AddPlayerPacket = 'AddPlayerPacket'`
- `AddVolumeEntityPacket = 'AddVolumeEntityPacket'`
- `AgentActionEventPacket = 'AgentActionEventPacket'`
- `AgentAnimationPacket = 'AgentAnimationPacket'`
- `AnimateEntityPacket = 'AnimateEntityPacket'`
- `AnimatePacket = 'AnimatePacket'`
- `AnvilDamagePacket = 'AnvilDamagePacket'`
- `AutomationClientConnectPacket = 'AutomationClientConnectPacket'`
- `AvailableActorIdentifiersPacket = 'AvailableActorIdentifiersPacket'`
- `AvailableCommandsPacket = 'AvailableCommandsPacket'`
- `AwardAchievementPacket = 'AwardAchievementPacket'`
- `BiomeDefinitionListPacket = 'BiomeDefinitionListPacket'`
- `BlockActorDataPacket = 'BlockActorDataPacket'`
- `BlockEventPacket = 'BlockEventPacket'`
- `BlockPickRequestPacket = 'BlockPickRequestPacket'`
- `BookEditPacket = 'BookEditPacket'`
- `BossEventPacket = 'BossEventPacket'`
- `CameraAimAssistActorPriorityPacket = 'CameraAimAssistActorPriorityPacket'`
- `CameraAimAssistPacket = 'CameraAimAssistPacket'`
- `CameraAimAssistPresetsPacket = 'CameraAimAssistPresetsPacket'`
- `CameraInstructionPacket = 'CameraInstructionPacket'`
- `CameraPacket = 'CameraPacket'`
- `CameraPresetsPacket = 'CameraPresetsPacket'`
- `CameraShakePacket = 'CameraShakePacket'`
- `CameraSplinePacket = 'CameraSplinePacket'`
- `ChangeDimensionPacket = 'ChangeDimensionPacket'`
- `ChangeMobPropertyPacket = 'ChangeMobPropertyPacket'`
- `ChunkRadiusUpdatedPacket = 'ChunkRadiusUpdatedPacket'`
- `ClientCacheBlobStatusPacket = 'ClientCacheBlobStatusPacket'`
- `ClientCacheMissResponsePacket = 'ClientCacheMissResponsePacket'`
- `ClientCacheStatusPacket = 'ClientCacheStatusPacket'`
- `ClientCameraAimAssistPacket = 'ClientCameraAimAssistPacket'`
- `ClientMovementPredictionSyncPacket = 'ClientMovementPredictionSyncPacket'`
- `ClientToServerHandshakePacket = 'ClientToServerHandshakePacket'`
- `ClientboundAttributeLayerSyncPacket = 'ClientboundAttributeLayerSyncPacket'`
- `ClientboundCloseFormPacket = 'ClientboundCloseFormPacket'`
- `ClientboundControlSchemeSetPacket = 'ClientboundControlSchemeSetPacket'`
- `ClientboundDataDrivenUICloseScreenPacket = 'ClientboundDataDrivenUICloseScreenPacket'`
- `ClientboundDataDrivenUIReloadPacket = 'ClientboundDataDrivenUIReloadPacket'`
- `ClientboundDataDrivenUIShowScreenPacket = 'ClientboundDataDrivenUIShowScreenPacket'`
- `ClientboundDataStorePacket = 'ClientboundDataStorePacket'`
- `ClientboundDebugRendererPacket = 'ClientboundDebugRendererPacket'`
- `ClientboundMapItemDataPacket = 'ClientboundMapItemDataPacket'`
- `ClientboundMatchmakingStatePacket = 'ClientboundMatchmakingStatePacket'`
- `ClientboundPlayAudioContentPacket = 'ClientboundPlayAudioContentPacket'`
- `ClientboundStonecutterSetRecipePacket = 'ClientboundStonecutterSetRecipePacket'`
- `ClientboundTextureShiftPacket = 'ClientboundTextureShiftPacket'`
- `ClientboundUpdateSoundDataPacket = 'ClientboundUpdateSoundDataPacket'`
- `CodeBuilderPacket = 'CodeBuilderPacket'`
- `CodeBuilderSourcePacket = 'CodeBuilderSourcePacket'`
- `CommandBlockUpdatePacket = 'CommandBlockUpdatePacket'`
- `CommandOutputPacket = 'CommandOutputPacket'`
- `CommandRequestPacket = 'CommandRequestPacket'`
- `CompletedUsingItemPacket = 'CompletedUsingItemPacket'`
- `ContainerClosePacket = 'ContainerClosePacket'`
- `ContainerOpenPacket = 'ContainerOpenPacket'`
- `ContainerRegistryCleanupPacket = 'ContainerRegistryCleanupPacket'`
- `ContainerSetDataPacket = 'ContainerSetDataPacket'`
- `CorrectPlayerMovePredictionPacket = 'CorrectPlayerMovePredictionPacket'`
- `CraftingDataPacket = 'CraftingDataPacket'`
- `CreatePhotoPacket = 'CreatePhotoPacket'`
- `CreativeContentPacket = 'CreativeContentPacket'`
- `CurrentStructureFeaturePacket = 'CurrentStructureFeaturePacket'`
- `DeathInfoPacket = 'DeathInfoPacket'`
- `DebugInfoPacket = 'DebugInfoPacket'`
- `DimensionDataPacket = 'DimensionDataPacket'`
- `DisconnectPacket = 'DisconnectPacket'`
- `EditorNetworkPacket = 'EditorNetworkPacket'`
- `EduUriResourcePacket = 'EduUriResourcePacket'`
- `EducationSettingsPacket = 'EducationSettingsPacket'`
- `EmoteListPacket = 'EmoteListPacket'`
- `EmotePacket = 'EmotePacket'`
- `FeatureRegistryPacket = 'FeatureRegistryPacket'`
- `GameRulesChangedPacket = 'GameRulesChangedPacket'`
- `GameTestRequestPacket = 'GameTestRequestPacket'`
- `GameTestResultsPacket = 'GameTestResultsPacket'`
- `GraphicsOverrideParameterPacket = 'GraphicsOverrideParameterPacket'`
- `GuiDataPickItemPacket = 'GuiDataPickItemPacket'`
- `HurtArmorPacket = 'HurtArmorPacket'`
- `InteractPacket = 'InteractPacket'`
- `InventoryContentPacket = 'InventoryContentPacket'`
- `InventorySlotPacket = 'InventorySlotPacket'`
- `InventoryTransactionPacket = 'InventoryTransactionPacket'`
- `ItemRegistryPacket = 'ItemRegistryPacket'`
- `ItemStackRequestPacket = 'ItemStackRequestPacket'`
- `ItemStackResponsePacket = 'ItemStackResponsePacket'`
- `JigsawStructureDataPacket = 'JigsawStructureDataPacket'`
- `LabTablePacket = 'LabTablePacket'`
- `LecternUpdatePacket = 'LecternUpdatePacket'`
- `LegacyTelemetryEventPacket = 'LegacyTelemetryEventPacket'`
- `LessonProgressPacket = 'LessonProgressPacket'`
- `LevelChunkPacket = 'LevelChunkPacket'`
- `LevelEventGenericPacket = 'LevelEventGenericPacket'`
- `LevelEventPacket = 'LevelEventPacket'`
- `LevelSoundEventPacket = 'LevelSoundEventPacket'`
- `LocatorBarPacket = 'LocatorBarPacket'`
- `LoginPacket = 'LoginPacket'`
- `MapCreateLockedCopyPacket = 'MapCreateLockedCopyPacket'`
- `MapInfoRequestPacket = 'MapInfoRequestPacket'`
- `MobArmorEquipmentPacket = 'MobArmorEquipmentPacket'`
- `MobEffectPacket = 'MobEffectPacket'`
- `MobEquipmentPacket = 'MobEquipmentPacket'`
- `ModalFormRequestPacket = 'ModalFormRequestPacket'`
- `ModalFormResponsePacket = 'ModalFormResponsePacket'`
- `MotionPredictionHintsPacket = 'MotionPredictionHintsPacket'`
- `MoveActorAbsolutePacket = 'MoveActorAbsolutePacket'`
- `MoveActorDeltaPacket = 'MoveActorDeltaPacket'`
- `MovePlayerPacket = 'MovePlayerPacket'`
- `MovementEffectPacket = 'MovementEffectPacket'`
- `MultiplayerSettingsPacket = 'MultiplayerSettingsPacket'`
- `NetworkChunkPublisherUpdatePacket = 'NetworkChunkPublisherUpdatePacket'`
- `NetworkSettingsPacket = 'NetworkSettingsPacket'`
- `NetworkStackLatencyPacket = 'NetworkStackLatencyPacket'`
- `NpcDialoguePacket = 'NpcDialoguePacket'`
- `NpcRequestPacket = 'NpcRequestPacket'`
- `OnScreenTextureAnimationPacket = 'OnScreenTextureAnimationPacket'`
- `OpenSignPacket = 'OpenSignPacket'`
- `PacketViolationWarningPacket = 'PacketViolationWarningPacket'`
- `PartyChangedPacket = 'PartyChangedPacket'`
- `PartyDestinationCookieResponsePacket = 'PartyDestinationCookieResponsePacket'`
- `PhotoTransferPacket = 'PhotoTransferPacket'`
- `PlaySoundPacket = 'PlaySoundPacket'`
- `PlayStatusPacket = 'PlayStatusPacket'`
- `PlayerActionPacket = 'PlayerActionPacket'`
- `PlayerArmorDamagePacket = 'PlayerArmorDamagePacket'`
- `PlayerAuthInputPacket = 'PlayerAuthInputPacket'`
- `PlayerEnchantOptionsPacket = 'PlayerEnchantOptionsPacket'`
- `PlayerFogPacket = 'PlayerFogPacket'`
- `PlayerHotbarPacket = 'PlayerHotbarPacket'`
- `PlayerListPacket = 'PlayerListPacket'`
- `PlayerLocationPacket = 'PlayerLocationPacket'`
- `PlayerSkinPacket = 'PlayerSkinPacket'`
- `PlayerStartItemCooldownPacket = 'PlayerStartItemCooldownPacket'`
- `PlayerToggleCrafterSlotRequestPacket = 'PlayerToggleCrafterSlotRequestPacket'`
- `PlayerUpdateEntityOverridesPacket = 'PlayerUpdateEntityOverridesPacket'`
- `PositionTrackingDBClientRequestPacket = 'PositionTrackingDBClientRequestPacket'`
- `PositionTrackingDBServerBroadcastPacket = 'PositionTrackingDBServerBroadcastPacket'`
- `PrimitiveShapesPacket = 'PrimitiveShapesPacket'`
- `PurchaseReceiptPacket = 'PurchaseReceiptPacket'`
- `RecordStartedPacket = 'RecordStartedPacket'`
- `RefreshEntitlementsPacket = 'RefreshEntitlementsPacket'`
- `RemoveActorPacket = 'RemoveActorPacket'`
- `RemoveObjectivePacket = 'RemoveObjectivePacket'`
- `RemoveVolumeEntityPacket = 'RemoveVolumeEntityPacket'`
- `RequestAbilityPacket = 'RequestAbilityPacket'`
- `RequestChunkRadiusPacket = 'RequestChunkRadiusPacket'`
- `RequestNetworkSettingsPacket = 'RequestNetworkSettingsPacket'`
- `RequestPermissionsPacket = 'RequestPermissionsPacket'`
- `ResourcePackChunkDataPacket = 'ResourcePackChunkDataPacket'`
- `ResourcePackChunkRequestPacket = 'ResourcePackChunkRequestPacket'`
- `ResourcePackClientResponsePacket = 'ResourcePackClientResponsePacket'`
- `ResourcePackDataInfoPacket = 'ResourcePackDataInfoPacket'`
- `ResourcePackStackPacket = 'ResourcePackStackPacket'`
- `ResourcePacksInfoPacket = 'ResourcePacksInfoPacket'`
- `ResourcePacksReadyForValidationPacket = 'ResourcePacksReadyForValidationPacket'`
- `RespawnPacket = 'RespawnPacket'`
- `ScriptMessagePacket = 'ScriptMessagePacket'`
- `SendPartyDestinationCookiePacket = 'SendPartyDestinationCookiePacket'`
- `ServerPlayerPostMovePositionPacket = 'ServerPlayerPostMovePositionPacket'`
- `ServerPresenceInfoPacket = 'ServerPresenceInfoPacket'`
- `ServerSettingsRequestPacket = 'ServerSettingsRequestPacket'`
- `ServerSettingsResponsePacket = 'ServerSettingsResponsePacket'`
- `ServerStatsPacket = 'ServerStatsPacket'`
- `ServerStoreInfoPacket = 'ServerStoreInfoPacket'`
- `ServerToClientHandshakePacket = 'ServerToClientHandshakePacket'`
- `ServerboundCursorItemDragPacket = 'ServerboundCursorItemDragPacket'`
- `ServerboundDataDrivenScreenClosedPacket = 'ServerboundDataDrivenScreenClosedPacket'`
- `ServerboundDataStorePacket = 'ServerboundDataStorePacket'`
- `ServerboundDiagnosticsPacket = 'ServerboundDiagnosticsPacket'`
- `ServerboundLoadingScreenPacket = 'ServerboundLoadingScreenPacket'`
- `ServerboundMatchmakingCancelPacket = 'ServerboundMatchmakingCancelPacket'`
- `ServerboundPackSettingChangePacket = 'ServerboundPackSettingChangePacket'`
- `ServerboundRegisterAudioContentPacket = 'ServerboundRegisterAudioContentPacket'`
- `ServerboundStonecutterSetRecipePacket = 'ServerboundStonecutterSetRecipePacket'`
- `SetActorDataPacket = 'SetActorDataPacket'`
- `SetActorLinkPacket = 'SetActorLinkPacket'`
- `SetActorMotionPacket = 'SetActorMotionPacket'`
- `SetCommandsEnabledPacket = 'SetCommandsEnabledPacket'`
- `SetDefaultGameTypePacket = 'SetDefaultGameTypePacket'`
- `SetDifficultyPacket = 'SetDifficultyPacket'`
- `SetDisplayObjectivePacket = 'SetDisplayObjectivePacket'`
- `SetHealthPacket = 'SetHealthPacket'`
- `SetHudPacket = 'SetHudPacket'`
- `SetLastHurtByPacket = 'SetLastHurtByPacket'`
- `SetLocalPlayerAsInitializedPacket = 'SetLocalPlayerAsInitializedPacket'`
- `SetPassengerOfBlockPacket = 'SetPassengerOfBlockPacket'`
- `SetPlayerFurnaceOptionsPacket = 'SetPlayerFurnaceOptionsPacket'`
- `SetPlayerGameTypePacket = 'SetPlayerGameTypePacket'`
- `SetPlayerInventoryOptionsPacket = 'SetPlayerInventoryOptionsPacket'`
- `SetScorePacket = 'SetScorePacket'`
- `SetScoreboardIdentityPacket = 'SetScoreboardIdentityPacket'`
- `SetSpawnPositionPacket = 'SetSpawnPositionPacket'`
- `SetTimePacket = 'SetTimePacket'`
- `SetTitlePacket = 'SetTitlePacket'`
- `SettingsCommandPacket = 'SettingsCommandPacket'`
- `ShowCreditsPacket = 'ShowCreditsPacket'`
- `ShowProfilePacket = 'ShowProfilePacket'`
- `ShowStoreOfferPacket = 'ShowStoreOfferPacket'`
- `SimpleEventPacket = 'SimpleEventPacket'`
- `SimulationTypePacket = 'SimulationTypePacket'`
- `SpawnExperienceOrbPacket = 'SpawnExperienceOrbPacket'`
- `SpawnParticleEffectPacket = 'SpawnParticleEffectPacket'`
- `StartGamePacket = 'StartGamePacket'`
- `StopSoundPacket = 'StopSoundPacket'`
- `StructureBlockUpdatePacket = 'StructureBlockUpdatePacket'`
- `StructureTemplateDataRequestPacket = 'StructureTemplateDataRequestPacket'`
- `StructureTemplateDataResponsePacket = 'StructureTemplateDataResponsePacket'`
- `SubChunkPacket = 'SubChunkPacket'`
- `SubChunkRequestPacket = 'SubChunkRequestPacket'`
- `SubClientLoginPacket = 'SubClientLoginPacket'`
- `SyncActorPropertyPacket = 'SyncActorPropertyPacket'`
- `SyncWorldClocksPacket = 'SyncWorldClocksPacket'`
- `TakeItemActorPacket = 'TakeItemActorPacket'`
- `TextPacket = 'TextPacket'`
- `TickingAreasLoadStatusPacket = 'TickingAreasLoadStatusPacket'`
- `ToastRequestPacket = 'ToastRequestPacket'`
- `TransferPacket = 'TransferPacket'`
- `TrimDataPacket = 'TrimDataPacket'`
- `UnlockedRecipesPacket = 'UnlockedRecipesPacket'`
- `UpdateAbilitiesPacket = 'UpdateAbilitiesPacket'`
- `UpdateAdventureSettingsPacket = 'UpdateAdventureSettingsPacket'`
- `UpdateAttributesPacket = 'UpdateAttributesPacket'`
- `UpdateBlockPacket = 'UpdateBlockPacket'`
- `UpdateBlockSyncedPacket = 'UpdateBlockSyncedPacket'`
- `UpdateClientInputLocksPacket = 'UpdateClientInputLocksPacket'`
- `UpdateClientOptionsPacket = 'UpdateClientOptionsPacket'`
- `UpdateEquipPacket = 'UpdateEquipPacket'`
- `UpdatePlayerGameTypePacket = 'UpdatePlayerGameTypePacket'`
- `UpdateSoftEnumPacket = 'UpdateSoftEnumPacket'`
- `UpdateSubChunkBlocksPacket = 'UpdateSubChunkBlocksPacket'`
- `UpdateTradePacket = 'UpdateTradePacket'`
- `VoxelShapesPacket = 'VoxelShapesPacket'`

### PacketReceiveBeforeEventSignal [beta module] (new type)

- `subscribe(callback: (arg0: PacketReceivedBeforeEvent) => void, options?: PacketEventOptions): (arg0: PacketReceivedBeforeEvent) => void`
- `unsubscribe(callback: (arg0: PacketReceivedBeforeEvent) => void): void`

### PacketReceivedBeforeEvent [beta module] (new type)

Sent as the server receives a network packet from a client.

- `cancel: boolean`
- `readonly packetId: PacketId` The type of network packet.
- `readonly packetSize: number` The size of the network packet in bytes.
- `readonly sender?: minecraftserver.Player` Which client sent the network packet to the game server.

### PacketSendBeforeEvent [beta module] (new type)

Sent as the server sends a network packet to clients.

- `cancel: boolean`
- `readonly packetId: PacketId` The type of network packet.
- `readonly recipients: (minecraftserver.Player | undefined)[]` Which clients the network packet is being sent to.

### PacketSendBeforeEventSignal [beta module] (new type)

- `subscribe(callback: (arg0: PacketSendBeforeEvent) => void, options?: PacketEventOptions): (arg0: PacketSendBeforeEvent) => void`
- `unsubscribe(callback: (arg0: PacketSendBeforeEvent) => void): void`

### RequestBodyTooLargeError [beta module] (new type)

An error thrown when an network request body exceeds the configured size limit.

- `readonly maxBytes: number` Configured maximum body size in bytes.
- `readonly providedBytes: number` Request body size in bytes.

### SerializableParseError [beta module] (new type)

### TLSOnlyError [beta module] (new type)

An error thrown when secure URI scheme is required but a non-secure URI was provided.

- `readonly uri: string` URI that was rejected for not using secure scheme.

### UriNotAllowedError [beta module] (new type)

An error thrown when a network request targets a URI that is not in the configured allow list.

- `readonly uri: string` URI that was rejected because it is not allowed.

### websocket [beta module] (new type)

Used to manage WebSocket connections.

### WebSocket [beta module] (new type)

Used to manage WebSocket connections.

- `connect(uri: string, headers?: HttpHeader[]): Promise<WebSocketClient>` Attempts to connect a WebSocket client.

### WebSocketClient [beta module] (new type)

An active WebSocket client.

- `readonly afterEvents: WebSocketClientAfterEvents` Contains a set of events related to this WebSocket client.
- `close(): void` Closes the connection with the server.
- `readonly isOpen: boolean` Set to true if the socket is current connected to the server.
- `send(payload: string): void` Sends the provided payload to the server.

### WebSocketClientAfterEvents [beta module] (new type)

- `readonly close: CloseAfterEventSignal`
- `readonly message: MessageAfterEventSignal`

### WebSocketClientCloseAfterEvent [beta module] (new type)

- `readonly reason: WebSocketClientCloseReasons`

### WebSocketClientCloseReasons [beta module] (new type)

- `ClosedByClient = 1` The client has closed the socket.
- `ClosedByServer = 0` The server has closed the socket.
- `IncomingPayloadsTooLarge = 2` The client has received payloads whose body exceeds the configured maximum size allowed per tick so the client has closed the socket.

### WebSocketClientReceiveAfterEvent [beta module] (new type)

- `readonly message: string`

### WebSocketConnectionFailedError [beta module] (new type)

An error thrown when the connection with the WebSocket server has failed.

- `readonly errorCode: HttpStatusCode` The error code received when attempting to connect with the server.
- `readonly uri: string` The URI provided to make this connection attempt that failed.

### WebSocketLimitExceededError [beta module] (new type)

An error that is thrown when the maximum number of connected WebSockets is reached.

- `readonly connectedSockets: number` Number of WebSocket connections already active when rejected.
- `readonly maxConcurrentConnections: number` Configured maximum active WebSocket connections.

### WebSocketNotConnectedError [beta module] (new type)

An error thrown when attempting to use a WebSocket while the socket is not connected to a server.

## @minecraft/debug-utilities

No stable release: everything here is **[beta module]** (1.0.0-beta.1.26.60-preview.30). 

### collectPluginStats [beta module] (new type)

Collect type usage stats for each active script plugin/add-on.

### collectRuntimeStats [beta module] (new type)

Collect memory stats for script runtimes.

### DebugArrow [beta module] (new type)

The length of the arrow's head/tip.

- `headLength: number` Adds a new debug shape to the world.
- `headRadius: number` The radius of the arrow's head/tip.
- `headSegments: number` The number of segments for the base circle of the arrow's head/tip (default: 4).

### DebugBox [beta module] (new type)

A debug shape class that represents a box or cuboid.

- `bound: minecraftserver.Vector3` The bounding box of the shape.

### DebugCircle [beta module] (new type)

A debug shape class that represents a circle (2D).

### DebugCone [beta module] (new type)

A debug shape class that represents a cone.

- `height: number` The height of the cone.
- `numSegments: number` The number of segments used to approximate the circular base of the cone.
- `radii: minecraftserver.Vector2` The radii of the cone's circular base (x: bottom radius, y: top radius).

### DebugCylinder [beta module] (new type)

A debug shape class that represents a cylinder.

- `height: number` The height of the cylinder.
- `numSegments: number` The number of segments used to approximate the circular cross-section of the cylinder.
- `radii: minecraftserver.Vector2` The radii of the cylinder's circular cross-section (x: bottom radius, y: top radius).

### debugDrawer [beta module] (new type)

Debug Drawing class used to allow adding and removing wireframe shapes in world space.

### DebugDrawer [beta module] (new type)

Debug Drawing class used to allow adding and removing wireframe shapes in world space.

- `addShape(shape: DebugShape, dimension?: minecraftserver.Dimension): void` Adds a new debug shape to the world.
- `removeAll(): void` Removes all debug shapes from the world.
- `removeShape(shape: DebugShape): void` Removes an instance of a debug shape from the world.

### DebugEllipsoid [beta module] (new type)

A debug shape class that represents an ellipsoid.

- `radii: minecraftserver.Vector3` The radii of the ellipsoid along each axis (x, y, z).
- `segmentsPerAxis: number` The number of segments used to approximate the ellipsoid per axis.

### DebugLine [beta module] (new type)

A debug shape class that represents a line segment.

- `endLocation: minecraftserver.Vector3` The end location of the line segment.

### DebugPyramid [beta module] (new type)

A debug shape class that represents a pyramid.

- `depth?: number` The depth of the pyramid's base.
- `height: number` The height of the pyramid.
- `width: number` The width of the pyramid's base.

### DebugShape [beta module] (new type)

The base class for all debug shapes.

- `attachedTo?: minecraftserver.Entity` The entity this shape is attached to.
- `color: minecraftserver.RGBA` The color of the shape.
- `defaultVisibleToAll: boolean` Defaults to true.
- `readonly dimension: minecraftserver.Dimension` The dimension the shape is visible within.
- `readonly hasDuration: boolean` Returns true if the shape has a limited time span before being removed.
- `hiddenFrom: minecraftserver.Player[]` The list of players that this shape will be hidden from.
- `readonly location: minecraftserver.Vector3` The location of the shape.
- `maximumRenderDistance?: number` If defined, this distance will be used to determine how far away this shape will be rendered for each client.
- `remove(): void` Removes this shape from the world.
- `rotation: minecraftserver.Vector3` The rotation of the shape in degrees (Euler angles - [Pitch, Yaw, Roll]).
- `scale: number` The scale of the shape.
- `setLocation(location: minecraftserver.DimensionLocation | minecraftserver.Vector3): void` Set the location and dimension of the shape.
- `timeLeft?: number` The time left (in seconds) until this shape is automatically removed.
- `readonly totalTimeLeft?: number` The total initial time-span (in seconds) until this shape is automatically removed.
- `visibleTo: minecraftserver.Player[]` The list of players that this shape will be visible to.

### DebugSphere [beta module] (new type)

A debug shape class that represents a sphere.

### DebugText [beta module] (new type)

A debug shape class that represents a text label in the world with a background.

- `backfaceVisible: boolean` If set to true, the debug text will render the back-face of the background.
- `backgroundColorOverride?: minecraftserver.RGBA` The color of the background plate of the text.
- `depthTest: boolean` If set to true, the text will be hidden behind blocks or entities.
- `lineGapHeight: number` This value determines the gap between lines for the debug text.
- `setText(text: minecraftserver.RawMessage | string): void` Sets the text to display.
- `readonly text: minecraftserver.RawMessage | string` Get the text of the debug text shape.
- `textBackfaceVisible: boolean` If set to true, the debug text will render the back-face of the text.
- `useRotation: boolean` If set to true, the text will not face the camera and instead will use the rotation from the shape.

### DiagnosticsChartDisplayType [beta module] (new type)

The display type for the chart (e.g.

- `LineChart = 0` Represents a simple line graph chart where the X axis is time and the Y axis is the user driven data.
- `StackedBarChart = 2` Represents a line graph chart where the X axis is time and the Y axis is a collection of multiple the user driven data entries that are visually stacked on top of each other.
- `StackedLineChart = 1` Indicates that the view or stat has not been registered.

### DiagnosticsChartViewOptions [beta module] (new type)

Configuration options for registering a chart-based diagnostics view.

- `chartType: DiagnosticsChartDisplayType` The display type for the chart (e.g.
- `targetValue?: number` Optional target value to display as a reference line on the chart.
- `tickRange?: number` Optional number of ticks to display along the chart's time axis.
- `yAxisLabel?: string` Optional label for the chart's Y axis.

### DiagnosticsError [beta module] (new type)

Error thrown by diagnostics operations such as registering or pushing stats to a view.

- `readonly reason: DiagnosticsErrorReason` The reason code explaining why this diagnostics error was thrown.

### DiagnosticsErrorReason [beta module] (new type)

Reason codes for errors thrown by DiagnosticsManager and DiagnosticsView operations.

- `AlreadyRegistered = 'AlreadyRegistered'` Indicates that the view or stat has already been registered.
- `InvalidData = 'InvalidData'` Indicates an issue with the stats data pushed to the view, see message for details.
- `InvalidName = 'InvalidName'` Indicates that the view or stat name is invalid (likely the name is empty).

### diagnosticsManager [beta module] (new type)

Manages data, display tabs and views used by the Minecraft Bedrock Debugger VS Code extension for live diagnostics.

### DiagnosticsManager [beta module] (new type)

Manages data, display tabs and views used by the Minecraft Bedrock Debugger VS Code extension for live diagnostics.

- `addTab(tab: DiagnosticsTab): void` Adds an existing DiagnosticsTab instance to the live diagnostics display in the debugger
- `containsTab(tab: DiagnosticsTab): boolean` Returns whether the given tab is currently registered and used in the live diagnostics display.
- `containsView(view: DiagnosticsView): boolean` Returns whether the given view is currently registered and used by any tab in the live diagnostics display.
- `createTab(tabName: string): DiagnosticsTab` Creates a new DiagnosticsTab and adds it to the live diagnostics display in the debugger
- `createView(statName: string, options?: DiagnosticsChartViewOptions | DiagnosticsTableViewOptions): DiagnosticsView` Creates a new DiagnosticsView.
- `removeTab(tab: DiagnosticsTab): void` Removes a previously registered tab from the live diagnostics display in the debugger
- `readonly tabs: DiagnosticsTab[]` The list of currently registered diagnostic tabs (constrained to this pack).

### DiagnosticsStat [beta module] (new type)

Represents a single stat entry with a name and optional values to be pushed to a DiagnosticsView.

- `name: string` The name identifier for this stat entry.
- `values?: (number | string)[]` Optional array of numeric or string values associated with this stat entry.

### DiagnosticsTab [beta module] (new type)

Represents a tab that is displayed in the live diagnostics panel of the debugger.

- `addView(view: DiagnosticsView): void` Registers an existing diagnostics view under the given tab for display in the live diagnostics.
- `containsView(view: DiagnosticsView): boolean` Returns whether the given view is currently registered and used by this tab.
- `removeView(view: DiagnosticsView): void` Removes a diagnostics view from this tab.
- `readonly tabName: string` The name of the tab.
- `readonly views: DiagnosticsView[]` The list of views currently associated and displayed in this tab.

### DiagnosticsTableDisplayType [beta module] (new type)

The display type for the table (e.g.

- `MultiColumnTable = 1` A table of keys to multiple values.
- `Table = 0` A simple table of keys to values (2 columns).

### DiagnosticsTableViewOptions [beta module] (new type)

Configuration options for registering a table-based diagnostics view.

- `keyLabel?: string` Optional label for the key column of the table.
- `tableType: DiagnosticsTableDisplayType` The display type for the table (e.g.
- `valueLabels?: string[]` Optional array of labels for the value columns of the table.

### DiagnosticsView [beta module] (new type)

Represents a registered diagnostics view that can receive stat data to display in the live diagnostics panel in the debugger.

- `pushStats(stats: DiagnosticsStat[]): void` Pushes a new set of stats to this diagnostics view to be displayed.

### disableWatchdogTimingWarnings [beta module] (new type)

Disable watchdog slow and spike warnings per plugin.

### HandleCounts [beta module] (new type)

- `handleCounts: Record<string, number>`
- `name: string`
- `packId: string`
- `scriptModuleUUID: string`

### PluginStats [beta module] (new type)

- `plugins: HandleCounts[]`

### RuntimeStats [beta module] (new type)

- `arrayCount: number`
- `atomCount: number`
- `atomSize: number`
- `fastArrayCount: number`
- `fastArrayElementCount: number`
- `functionCodeSize: number`
- `functionCount: number`
- `functionLineCount: number`
- `functionSize: number`
- `memoryAllocatedCount: number`
- `memoryAllocatedLimit: number`
- `memoryAllocatedSize: number`
- `memoryUsedCount: number`
- `memoryUsedSize: number`
- `objectCount: number`
- `objectSize: number`
- `propertyCount: number`
- `propertySize: number`
- `stringCount: number`
- `stringSize: number`

