# Script API code patterns

Checked against the official `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0 typings (npm `latest` on 2026-10-06). `ns` = your namespace. Plain JS; the same code works as TypeScript.

## 1. Entry point and load order

```js
import { system, world } from "@minecraft/server";
import { registerCommands } from "./commands.js";
import { registerComponents } from "./components.js";
import { startLoops } from "./loops.js";

system.beforeEvents.startup.subscribe((init) => {
  registerComponents(init);   // init.itemComponentRegistry / init.blockComponentRegistry
  registerCommands(init);     // init.customCommandRegistry
  // init.dimensionRegistry.registerCustomDimension("ns:lab");  (stable in 2.10.0)
});

world.afterEvents.worldLoad.subscribe(() => {
  // First point where world, dimensions, players, scoreboards and dynamic properties are usable.
  startLoops();
});
```

## 2. Custom slash commands

```js
import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, system } from "@minecraft/server";

export function registerCommands(init) {
  init.customCommandRegistry.registerEnum("ns:mode", ["easy", "hard"]);
  init.customCommandRegistry.registerCommand(
    {
      name: "ns:give_coins",                     // namespace required
      description: "Give coins to players",
      permissionLevel: CommandPermissionLevel.GameDirectors,   // or .Any
      cheatsRequired: false,
      mandatoryParameters: [
        { name: "targets", type: CustomCommandParamType.PlayerSelector },
        { name: "amount", type: CustomCommandParamType.Integer },
      ],
      optionalParameters: [{ name: "ns:mode", type: CustomCommandParamType.Enum }],
    },
    (origin, targets, amount, mode) => {
      // origin: { sourceEntity, sourceBlock, initiator, sourceType }. Read-only context.
      if (amount <= 0) return { status: CustomCommandStatus.Failure, message: "amount must be positive" };
      system.run(() => { for (const p of targets) addCoins(p.id, amount); });
      return { status: CustomCommandStatus.Success };
    },
  );
}
```
- Parameter types: BlockType, Boolean, EntitySelector, EntityType, Enum, Float, Integer, ItemType, Location (`~ ~ ~` and `^` work, gives a Vector3), PlayerSelector, String.
- A new command needs a world re-entry; `/reload` isn't enough. Commands also run from command blocks (`origin.sourceType`).
- `CustomCommandPermissionLevel` and callbacks without the `origin` argument are from old previews.

## 3. Custom item and block components (V2)

```js
import { system, EquipmentSlot } from "@minecraft/server";

export function registerComponents(init) {
  init.itemComponentRegistry.registerCustomComponent("ns:feeder", {
    onUse(e, { params }) {                 // params = the JSON object under "ns:feeder"
      const player = e.source;
      system.run(() => {
        const equip = player.getComponent("minecraft:equippable");
        const stack = equip.getEquipment(EquipmentSlot.Mainhand);   // a copy
        if (!stack) return;
        stack.setLore([`Uses left: ${params.uses ?? 3}`]);
        equip.setEquipment(EquipmentSlot.Mainhand, stack);         // write the copy back
      });
    },
  });

  init.blockComponentRegistry.registerCustomComponent("ns:machine", {
    onPlayerInteract(e, { params }) { /* e.block, e.player, e.face */ },
    onTick(e) { /* needs "minecraft:tick" on the block */ },
  });
}
```
Item JSON (format 1.21.90+ takes component ids as keys; the old `minecraft:custom_components` list is rejected):
```json
"components": { "ns:feeder": { "uses": 3 }, "minecraft:max_stack_size": 1 }
```
- Item hooks: onUse, onUseOn, onConsume, onCompleteUse, onHitEntity, onMineBlock, onBeforeDurabilityDamage. Block hooks: onPlayerInteract, onTick, onRandomTick, onPlace, beforeOnPlayerPlace, onBreak, onPlayerBreak, onStepOn, onStepOff, onEntityFallOn, onRedstoneUpdate, onBlockStateChange, onEntity.
- `onUse` also fires alongside `onUseOn`; guard with `player.getBlockFromViewDirection()` if they must not both run.
- One item type has one icon. "Empty" and "full" versions of a tool are two item types you swap between.
- Item dynamic properties work only on non-stackable items (`max_stack_size: 1`).
- Prefer one component per block family with a `kind` parameter over one component per block.

## 4. Forms

Shared helper: retries UserBusy, never stacks forms per player.
```js
import { system } from "@minecraft/server";
import { FormCancelationReason } from "@minecraft/server-ui";

const open = new Set();
export async function showForm(player, form, tries = 6) {
  if (open.has(player.id)) return undefined;
  open.add(player.id);
  try {
    for (let i = 0; i < tries; i++) {
      const r = await form.show(player);
      if (r.canceled && r.cancelationReason === FormCancelationReason.UserBusy) { await system.waitTicks(8); continue; }
      return r;
    }
  } finally { open.delete(player.id); }
}
```
Classic forms:
```js
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
const menu = new ActionFormData().title("Shop").body("Pick one").button("Buy feed", "textures/items/wheat").button("Close");
const r = await showForm(player, menu);            // r.selection: 0-based index
const modal = new ModalFormData().title("Settings")
  .toggle("Music", { defaultValue: true })
  .slider("Price", 0, 100, { defaultValue: 10, valueStep: 5 })
  .dropdown("Mode", ["Easy", "Hard"], { defaultValueIndex: 0 });
const m = await showForm(player, modal);           // m.formValues in the order the controls were added
```
Data-Driven UI (`CustomForm`, stable since server-ui 2.1.0): controls bind to observables and update while the form is open.
```js
import { CustomForm, ObservableNumber, ObservableBoolean, ObservableString } from "@minecraft/server-ui";

const price = new ObservableNumber(10, { clientWritable: true });   // clientWritable: the player can change it
const open = new ObservableBoolean(true, { clientWritable: true });
const status = new ObservableString("Park open");
price.subscribe((v) => { status.setData(`Ticket price: ${v}`); });  // fires live, form still open

new CustomForm(player, "Park dashboard")
  .header("Tickets")
  .label(status)
  .slider("Price", price, 0, 100, { step: 5 })
  .toggle("Open to visitors", open)
  .dropdown("Theme", new ObservableNumber(0, { clientWritable: true }), [{ label: "Jungle", value: 0 }, { label: "Arctic", value: 1 }])
  .divider()
  .button("Save", () => save(player.id, price.getData(), open.getData()))
  .closeButton()
  .show();   // Promise<DataDrivenScreenClosedReason>: ClientClosed, ServerClosed, UserBusy
```
- Other builders: `spacer()`, `textField(label, ObservableString)`, `image(src, packId)`, `close()`, `isShowing()`.
- Confirm dialog: `new MessageBox(player, "Buy?").body("Costs 50").button1("Yes").button2("No").show()` resolves to `{ closeReason, selection }`.
- New in server-ui 2.3.0 (game 26.60): tooltips on controls and button icons (`ButtonOptions.imageDetails`, `MessageBox.button1WithOptions`). Check current-versions.md before using.
- Keep classic button text short (about 16 characters) and at most ~30 buttons per ActionForm.

## 5. Persistence with dynamic properties

```js
import { world } from "@minecraft/server";
const KEY = "ns:save";                       // string values cap at 32,767 bytes
const CHUNK = 30000;

export function saveJson(key, obj) {
  const s = JSON.stringify({ schemaVersion: 1, data: obj });
  const n = Math.ceil(s.length / CHUNK);
  world.setDynamicProperty(`${key}:n`, n);
  for (let i = 0; i < n; i++) world.setDynamicProperty(`${key}:${i}`, s.slice(i * CHUNK, (i + 1) * CHUNK));
}
export function loadJson(key) {
  const n = world.getDynamicProperty(`${key}:n`);
  if (typeof n !== "number") return undefined;
  let s = ""; for (let i = 0; i < n; i++) s += world.getDynamicProperty(`${key}:${i}`) ?? "";
  return JSON.parse(s);
}
```
- Characters are not bytes: keep non-ASCII text out of chunked saves, or chunk well under the cap.
- Cache in memory; write on change plus a bounded checkpoint (for example every 100 ticks if dirty), never every tick.
- Dynamic properties are keyed to the BP header UUID. Never change it.
- Entity properties (`minecraft:properties` in the BP entity) are for state the resource pack must read: at most 32 per entity type, enums up to 16 values, `client_sync: true` for render use. Use `entity.setProperty` / `getProperty`.
- Scoreboards are for display, not the source of truth.

## 6. Scheduling

```js
import { system } from "@minecraft/server";

function loop(name, interval, offset, fn) {
  system.runTimeout(() => {
    system.runInterval(() => {
      try { fn(); } catch (e) { console.warn(`[${name}] ${e?.stack ?? e}`); }
    }, interval);
  }, offset);
}
export function startLoops() {
  loop("fast", 5, 0, fastTick);       // input-ish, HUD
  loop("sim", 20, 3, simTick);        // per-second simulation
  loop("save", 100, 7, checkpoint);   // persistence
}

// Heavy work spread over ticks:
system.runJob((function* () {
  for (const pos of bigList) { placeOne(pos); yield; }
})());
```

## 7. Entity index and reconciliation

```js
import { world } from "@minecraft/server";
const live = new Map();   // recordId -> entity.id
world.afterEvents.entitySpawn.subscribe(({ entity }) => track(entity));
world.afterEvents.entityLoad.subscribe(({ entity }) => track(entity));
world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
  const rid = removedEntity.getDynamicProperty("ns:rid");
  if (rid) live.delete(rid);
});
function track(entity) {
  if (!entity.typeId.startsWith("ns:")) return;
  const rid = entity.getDynamicProperty("ns:rid");
  if (typeof rid !== "string") return;
  const prev = live.get(rid);
  if (prev && prev !== entity.id) { entity.remove(); return; }   // duplicate after a reload: keep one
  live.set(rid, entity.id);
}
// later: const e = world.getEntity(live.get(rid)); if (e?.isValid) ...
```
- Store ids across ticks, never `Entity` objects.
- `world.beforeEvents.entityHurt` (cancellable) and `entityHeal` exist in stable; in the hurt before-event, health already has the damage removed, and it fires for hits the hurt cooldown will ignore.
- `Entity.teleport` across dimensions throws while the entity has passengers (26.50).

## 8. Ticking areas (keep a region simulating with no player near)

```js
const id = "ns:area1";
if (!world.tickingAreaManager.hasTickingArea(id)) {
  world.tickingAreaManager.createTickingArea(id, { dimension, from, to })
    .then(() => system.run(() => { /* area is loaded now */ }));
}
```
Budget is limited world-wide (`chunkCount` / `maxChunkCount`, about 300 chunks by default). Often better: save a timestamp and compute catch-up when the chunk loads again.

## 9. HUD

- One module owns the action bar: `player.onScreenDisplay.setActionBar(text)` only when the text changes, plus a 40-tick heartbeat (it fades otherwise).
- Floating labels: `world.primitiveShapesManager` text primitives (stable) instead of name-tag entities.
- Cut cosmetic effects on weak devices with `player.clientSystemInfo`, but never change gameplay by device.
