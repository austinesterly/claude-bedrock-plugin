# Container ("chest") UI

Players often ask for a "chest GUI": a grid of item slots used as a menu or as storage. Bedrock has no script API to open an arbitrary container screen. What exists:

| Approach | Stable? | Real item slots | Good for |
|---|---|---|---|
| Entity with `minecraft:inventory` (`container_type` such as `minecart_chest`) | Yes | Yes | Backpacks, storage carts, mailbox, shared stash |
| Custom block with `minecraft:block_entity.container` (1-54 slots) | **No**: Upcoming Creator Features experiment (26.30+, still experimental in 26.50/26.60) | Yes | Custom chests, machines (test worlds only) |
| Vanilla blocks (chest, barrel) you place and script around | Yes | Yes | Storage rooms, loot rooms |
| ActionForm restyled as a grid via JSON UI | Community, fragile (see `json-ui.md`) | No (buttons that look like slots) | Menus that look like a chest |
| Plain `ActionFormData` with item icons | Yes | No | Menus. **Default choice** |

If the goal is a **menu** (pick an option), use a form: buttons with item icons (`button("Diamond sword\n§750 coins", "textures/items/diamond_sword")`). If the goal is **storage** (move real items), use an entity or block container.

## Entity containers (stable)

BP entity component (field list from the generated reference, `../../bedrock-json-reference/references/entity-components.md`):

| Field | Default | Notes |
|---|---|---|
| `container_type` | `"none"` | `horse`, `minecart_chest`, `chest_boat`, `minecart_hopper`, `inventory`, `container`, `hopper` |
| `inventory_size` | 5 | Slots |
| `can_be_siphoned_from` | false | Hoppers can pull from it |
| `private` | false | true: inventory is not dropped on death |
| `restrict_to_owner` | false | Only the owner (or the entity itself) can open it |
| `additional_slots_per_strength` | 0 | Llama-style |

The vanilla chest minecart (`entities/chest_minecart.json`, 1.26.50) uses:
```json
"minecraft:inventory": { "can_be_siphoned_from": true, "inventory_size": 27, "container_type": "minecart_chest" }
```
and has no `minecraft:interact` component, so the container screen opens from the inventory component itself when a player interacts. A custom entity with the same component opens a chest-style screen the same way [community: confirmed widely for `minecart_chest`; test other `container_type` values, since `horse` and `inventory` behave differently].

Script access (stable 2.10.0):
```js
const inv = entity.getComponent("minecraft:inventory");   // EntityInventoryComponent
const c = inv.container;                                    // Container
c.size; c.emptySlotsCount; c.getItem(0); c.setItem(0, stack); c.addItem(stack);
c.moveItem(from, to, otherContainer); c.swapItems(a, b, otherContainer); c.transferItem(from, otherContainer);
c.getSlot(i);   // ContainerSlot: live view of one slot
```
`EntityInventoryComponent` read-only fields: `container`, `containerType`, `inventorySize`, `private`, `restrictToOwner`, `canBeSiphonedFrom`, `additionalSlotsPerStrength`. Player inventory is `player.getComponent("minecraft:inventory").container` (36 slots, 0-8 the hotbar).

Open/close events (stable 2.10.0):
```js
world.afterEvents.entityContainerOpened.subscribe((e) => {
  // e.entity: the container's entity, e.openSource.entity: who opened it (usually a player)
}, { entityFilter: { type: "ns:backpack" } });
world.afterEvents.entityContainerClosed.subscribe((e) => { /* e.entity, e.closeSource.entity */ });
// blocks: world.afterEvents.blockContainerOpened / blockContainerClosed (e.block, e.openSource / e.closeSource)
```
Options: `EntityContainerAccessEventOptions` = `{ entityFilter?: EntityFilter, accessSourceFilter?: { entityFilter?: EntityFilter } }`.

Also useful: `world.afterEvents.playerInventoryItemChange` (`player`, `slot`, `itemStack`, `beforeItemStack`, `inventoryType`) to react to the player's own inventory changes.

### "Chest menu" on an entity [community]

The common trick: a hidden or decorative entity with a 27-slot `minecart_chest` inventory, slots pre-filled with named "button" items; when a player takes an item, the script treats it as a click, gives nothing, and refills the slot.

- Detect clicks by comparing the container to its expected contents (on `entityContainerClosed`, or a short interval while open), and by watching `playerInventoryItemChange` for the button item landing in the player's inventory (then clear it).
- Weak points: items can be dropped or shift-clicked out, hoppers and other players can interact, a lagging server shows the item move before the script fixes it, and two players can open the same entity. Use one entity per player, `restrict_to_owner`, and set `stack.lockMode = ItemLockMode.slot` on button items (stable `ItemStack.lockMode`; whether a slot lock holds inside a non-player container is untested here, so verify it).
- Most add-ons are better served by a form. Use this only when real slots are the point.

### Backpack pattern (stable)

Per-player storage entity: spawn an `ns:backpack` entity (no model, no collision, `minecraft:inventory` 27 slots `minecart_chest`, `private: true`), keep its id in a player dynamic property, and teleport it to the player when they use the backpack item. On close, move it away or keep it tickable. Persist contents by keeping the entity alive (it saves with the world), not by serializing items (scripts can't fully serialize every `ItemStack`).

## Block containers (experimental)

`minecraft:block_entity` with `"container": { "slot_count": 1-54 }` (Learn block component page), plus `dynamic_properties`. Requires `format_version` 1.26.20+ and the **Upcoming Creator Features** experiment (1.26.30 notes); vanilla 1.26.50 already ships `ui/data_driven_container_screen.json` to draw it. Scripts reach a block's container through `block.getComponent("minecraft:inventory")` (`BlockInventoryComponent.container`, stable for vanilla containers). Don't ship this in normal worlds until it leaves the experiment; check `../../bedrock-whats-new/references/capabilities.md`.

## Vanilla blocks as storage

Place a real chest or barrel (`dimension.setBlockType`) and read it through `BlockInventoryComponent`. Works today, saves with the world, and players already know the screen. Keep players out by cancelling `world.beforeEvents.playerInteractWithBlock` (`e.cancel = true`) for players who shouldn't open it.
