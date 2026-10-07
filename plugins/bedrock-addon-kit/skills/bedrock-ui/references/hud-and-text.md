# HUD, on-screen text, camera, fog, text and localization

Everything here is stable `@minecraft/server` 2.10.0 or plain pack data, and works without JSON UI. Command syntax for `/title`, `/titleraw`, `/hud`, `/camera`, `/fog`, `/inputpermission`, `/scoreboard` is in `../../bedrock-json-reference/references/commands.md`.

## Titles, subtitles, action bar (`player.onScreenDisplay`)

`ScreenDisplay` (stable 2.10.0):

| Member | Signature | Notes |
|---|---|---|
| `setTitle` | `setTitle(title: (RawMessage \| string)[] \| RawMessage \| string, options?: TitleDisplayOptions): void` | Empty string clears the title |
| `updateSubtitle` | `updateSubtitle(subtitle: (RawMessage \| string)[] \| RawMessage \| string): void` | Only after a `setTitle` |
| `setActionBar` | `setActionBar(text: (RawMessage \| string)[] \| RawMessage \| string): void` | Line above the hotbar; fades after about 3 s |
| `setHudVisibility` | `setHudVisibility(visible: HudVisibility, hudElements?: HudElement[]): void` | `HudVisibility.Hide` / `.Reset`; omit the list for the whole HUD |
| `hideAllExcept` | `hideAllExcept(hudElements?: HudElement[]): void` | Cinematic mode in one call |
| `resetHudElementsVisibility` | `resetHudElementsVisibility(): void` | Undo all hiding |
| `getHiddenHudElements` | `getHiddenHudElements(): HudElement[]` | |
| `isForcedHidden` | `isForcedHidden(hudElement: HudElement): boolean` | |
| `isValid` | `readonly isValid: boolean` | |

`TitleDisplayOptions` = `{ fadeInDuration: number, stayDuration: number, fadeOutDuration: number, subtitle?: ... }`, all durations in **ticks** (20 per second). All three durations are required when you pass options.

`HudElement`: `PaperDoll`, `Armor`, `ToolTips`, `TouchControls`, `Crosshair`, `Hotbar`, `Health`, `ProgressBar`, `Hunger`, `AirBubbles`, `HorseHealth`, `StatusEffects`, `ItemText`.

Rules:
- **One owner per channel.** The action bar and title are a single slot per player: if two systems write it, they flicker. Route all action bar text through one module (`templates/hud-actionbar`).
- Re-send the action bar only when the text changes, plus a heartbeat about every 40 ticks so it doesn't fade. Never every tick for every player.
- Titles interrupt; use them for events (level up, round start), not for status.
- HUD hiding persists until reset. Call `resetHudElementsVisibility()` when a cutscene or minigame ends, and on `playerSpawn` if a crash could leave it hidden.
- Never hide `TouchControls` without giving touch players a way out.
- Hiding the HUD is a gameplay change for the player, not a security feature; the elements still exist.

## Chat and sounds

- `player.sendMessage(message: (RawMessage | string)[] | RawMessage | string)` and `world.sendMessage(...)`.
- `player.playSound(soundId, { volume?, pitch?, location? })` for UI clicks (`"random.click"`, `"random.orb"`, `"note.pling"`).

## Scoreboard sidebar

```js
import { world, DisplaySlotId, ObjectiveSortOrder } from "@minecraft/server";
const obj = world.scoreboard.getObjective("ns:coins") ?? world.scoreboard.addObjective("ns:coins", "Coins");
world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: obj, sortOrder: ObjectiveSortOrder.Descending });
obj.setScore(player, 120);
// clear: world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
```
- `DisplaySlotId`: `Sidebar`, `List` (pause/player list), `BelowName`.
- The display is shared by everyone in the world. Per-player "sidebar text" tricks (fake participants with formatted names) are community practice and fragile; prefer the action bar for per-player info.
- Scoreboards are a display. Keep the real data in dynamic properties (`../../bedrock-scripting/references/code-patterns.md`, section 5).

## Floating text in the world (text primitives)

`world.primitiveShapesManager` (stable 2.10.0):

```js
import { world, TextPrimitive } from "@minecraft/server";
const label = new TextPrimitive({ dimension: player.dimension, x: 0.5, y: 70, z: 0.5 }, "§eShop");
label.visibleTo = [player];          // empty array = everyone
label.maximumRenderDistance = 32;
label.depthTest = true;              // hide behind blocks (default false: always on top)
world.primitiveShapesManager.addText(label);
label.setText("§eShop §7(open)");
label.attachedTo = someEntity;       // follow an entity
label.remove();                      // or primitiveShapesManager.removeText(label)
```
- `TextPrimitive` fields: `text` (read), `setText`, `backgroundColorOverride?: RGBA`, `backfaceVisible`, `textBackfaceVisible`, `useRotation`, `depthTest`; inherited `color`, `scale`, `rotation`, `location`, `setLocation`, `attachedTo`, `visibleTo`, `maximumRenderDistance`, `timeLeft` (seconds), `remove()`.
- `primitiveShapesManager.maxShapes` caps the total. Keep handles in a `Map` and reuse them; shapes are not saved with the world, so re-create them after `worldLoad`.
- `TextPrimitive.lineGapHeight` is rc-only (2.11.0-rc).
- Better than name-tag entities for labels: no entity cost, per-player visibility.

## Input lock and camera (cinematic UI)

```js
import { InputPermissionCategory, EasingType, HudElement } from "@minecraft/server";
player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
player.onScreenDisplay.hideAllExcept([]);
player.camera.fade({ fadeTime: { fadeInTime: 0.5, holdTime: 0.5, fadeOutTime: 0.5 }, fadeColor: { red: 0, green: 0, blue: 0 } });
player.camera.setCamera("minecraft:free", {
  location: { x: 10, y: 80, z: 10 }, facingLocation: { x: 0, y: 70, z: 0 },
  easeOptions: { easeTime: 2, easeType: EasingType.InOutSine },
});
// ...later
player.camera.clear();
player.onScreenDisplay.resetHudElementsVisibility();
player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
```

`Camera` (stable 2.10.0): `setCamera(preset, options?)`, `setDefaultCamera(preset, easeOptions?)`, `clear()`, `fade(options?)`, `setFov(options?)`, `addShake(options)`, `stopShaking()`, `playAnimation(spline, options)`, `attachToEntity(options?)`, `isValid`.

| `setCamera` options type | Fields |
|---|---|
| `CameraSetPosOptions` | `facingLocation`, `location?`, `easeOptions?` |
| `CameraSetLocationOptions` | `location`, `easeOptions?` |
| `CameraSetRotOptions` | `rotation: Vector2`, `location?`, `easeOptions?` |
| `CameraSetFacingOptions` | `facingEntity`, `location?`, `easeOptions?` |
| `CameraTargetOptions` | `targetEntity`, `offsetFromTargetCenter?` |
| `CameraFixedBoomOptions` | `entityOffset?`, `viewOffset?` |

- `CameraFadeOptions.fadeTime` values are **seconds** (`CameraFadeTimeOptions` = `{ fadeInTime, holdTime, fadeOutTime }`); `fadeColor` is `RGB` with 0-1 channels.
- `EaseOptions` = `{ easeTime?, easeType?: EasingType }` (`Linear`, `InOutSine`, `OutBack`, `Spring`, and the other In/Out/InOut curves).
- `CameraShakeOptions` = `{ intensity, duration, type: CameraShakeType.Positional | Rotational }`.
- Built-in presets: `minecraft:first_person`, `minecraft:third_person`, `minecraft:third_person_front`, `minecraft:free`, `minecraft:follow_orbit`, `minecraft:fixed_boom`. Custom presets live in the BP at `cameras/presets/<name>.json`:
```json
{
  "format_version": "1.19.50",
  "minecraft:camera_preset": {
    "identifier": "ns:shop_cam",
    "inherit_from": "minecraft:free",
    "control_scheme": "camera_relative"
  }
}
```
  (Sample shape from the Learn "Control Schemes" page; the full preset field list is on the Learn Camera System pages, which are not in this checkout.)
- Camera splines from `camera/splines/` and `/camera ... play_spline` are behind the experimental Creator Camera toggle (1.26.0 notes). `playAnimation` with `CatmullRomSpline`/`LinearSpline` is in the stable typings.
- Always restore: camera, HUD, input permissions. Do it in a `finally`, and on `playerSpawn`.

## Fog (mood for menus and areas)

RP `fogs/<name>.json` defines `minecraft:fog_settings` (Learn "Fog in Resource Packs"); script controls the per-player stack via `player.fogSettings` (stable 2.10.0):

| Method | Notes |
|---|---|
| `push(fogId, tag?)` returns index | Max 16 entries; throws `FogSettingsError` on a bad id |
| `pop(tag?)` | Removes the newest entry (with that tag) |
| `remove(tag?)` | Removes all with the tag, or all |
| `setStack(fogIds, tag?)`, `getStack()`, `getTags()` | |

Fog pushed by command/script is saved per player and restored on world load, so always tag your entries (`"ns_shop"`) and remove them by tag.

## RawMessage, formatting codes, translation

`RawMessage` (server 2.10.0) = `{ text?, translate?, with?: string[] | RawMessage, rawtext?: RawMessage[], score?: { name?, objective? } }`. Forms, titles, action bar, chat and text primitives all take it. The JSON form (`{"rawtext":[...]}`) is what `/tellraw` and `/titleraw` take. The `selector` node exists only in command rawtext, not in the script `RawMessage` type.

```js
player.onScreenDisplay.setActionBar({ rawtext: [
  { translate: "ns.hud.coins", with: [String(coins)] },
  { text: "  §7|  " },
  { text: `Kills: ${kills}` },   // read scores in script and pass text; the score node also exists, test its name resolution
]});
```

Formatting codes (Learn "Raw Message JSON"): `§0`-`§9` and `§a`-`§f` are the classic colors; Bedrock adds the colors `§g` `§h` `§i` `§j` `§m` `§n` `§p` `§q` `§s` `§t` `§u` (so `§m`/`§n` are not strikethrough/underline here). Effects: `§k` obfuscated, `§l` bold, `§o` italic, `§r` reset. `§v`-`§z` have no visible effect. `\n` is a new line.

## Localization (`texts/*.lang`)

Both packs can carry `texts/en_US.lang` and `texts/languages.json` (`["en_US", "de_DE", ...]`). UI strings shown by scripts are looked up in the **resource pack** language files on each client, so put them in the RP.

```
ns.menu.title=Adventure Guide	#
ns.menu.shop=Shop	## Button that opens the item shop
ns.hud.coins=Coins: %s	## %s is the player's coin count, a number
```
- `key=value`, then a **tab** and `#` to end the value (Learn "Preparing raw text for localization"); `##` starts a translator comment. No spaces around `=`. UTF-8 without BOM.
- Arguments: `with: ["a", "b"]` fills `%s` in order, or positional `%1$s`, `%2$s` (vanilla 1.26.50 `en_US.lang` uses both: 665 lines with `%s`, 385 with `%1$s`). The Learn Raw Message page writes the slot as `%%1`. Test in game.
- In code, never build sentences from pieces in English order; pass a full key with arguments.
- Form titles, buttons, labels, `CustomForm` text and `MessageBox` text all accept `{ translate, with }`.
