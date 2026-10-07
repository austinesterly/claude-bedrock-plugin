# Pack settings, subpacks and world templates

Manifest field tables: `../../bedrock-json-reference/references/manifest.md`. Manifest basics (UUIDs, dependencies, format 2 vs 3): `bedrock-addon-conventions`. Working file: `../templates/pack-settings/RP/manifest.json`. With `new-addon.mjs --add <that template>` the generator copies its `settings` into the new RP manifest, upgrades that manifest to format 3, and keeps the generated UUIDs, so the `<rp-header-uuid>` placeholders never reach the pack.

## Pack settings (options players change in the pack's settings screen)

Defined in the manifest `settings` array (1-50 entries). This is the manifest **format_version 3** schema (versions are strings like `"1.0.0"`). Whether format 2 manifests accept toggle/slider/dropdown settings is not documented (the Learn subpack page shows a `label` setting in a non-v3 manifest), so use format 3.

```json
{
  "format_version": 3,
  "header": {
    "name": "My Add-on RP",
    "description": "Resource pack with pack settings",
    "uuid": "<rp-header-uuid>",
    "version": "1.0.0",
    "min_engine_version": "1.26.50"
  },
  "modules": [ { "type": "resources", "uuid": "<rp-module-uuid>", "version": "1.0.0" } ],
  "settings": [
    { "type": "label", "text": "Visual options for My Add-on." },
    { "type": "toggle", "name": "ns:show_sparkles", "text": "Show sparkle particles", "default": true },
    { "type": "slider", "name": "ns:particle_density", "text": "Particle density", "min": 0, "max": 4, "step": 1, "default": 2 },
    { "type": "dropdown", "name": "ns:theme", "text": "Colour theme", "default": "ruby",
      "options": [ { "name": "ruby", "text": "Ruby" }, { "name": "emerald", "text": "Emerald" } ] },
    { "type": "multiselect", "name": "ns:hud_parts", "text": "HUD extras", "defaults": [ "coins" ],
      "options": [ { "name": "coins", "text": "Coin counter" }, { "name": "compass", "text": "Compass" } ] }
  ]
}
```
Replace both `<...-uuid>` placeholders with fresh UUIDs before loading.

| type | Required fields | Rules |
|---|---|---|
| `label` | `text` | Heading/explanation only |
| `toggle` | `name`, `text`, `default` (bool) | |
| `slider` | `name`, `text`, `min`, `max`, `step` (> 0), `default` | Numbers |
| `dropdown` | `name`, `text`, `default` (option name), `options` (2-20 `{name, text}`) | |
| `multiselect` | `name`, `text`, `defaults` (list, ≤20), `options` (2-20) | Added 1.26.50 |

- `name` must be namespaced and must not start with `minecraft:` (schema pattern).
- `text` is the label shown to the player. Whether it accepts a lang key is not documented; plain text is safe.

### Reading settings

Molang, **resource packs only** (client side):

| Query | Returns |
|---|---|
| `query.get_pack_setting('ns:particle_density')` | Slider value (float) |
| `query.is_pack_setting_enabled('ns:show_sparkles')` | Toggle (bool) |
| `query.is_pack_setting_selected('ns:theme', 'emerald')` | Dropdown or multiselect option selected (bool) |

Use them anywhere RP Molang runs: render controllers (swap a texture by theme), animation controllers, particle expressions (`activation_expression` to hide a particle, `num_particles` scaled by the slider), client entity `scripts.pre_animation`.
```json
"minecraft:emitter_rate_instant": { "num_particles": "4 * query.get_pack_setting('ns:particle_density')" }
```
```json
"textures": [ "query.is_pack_setting_selected('ns:theme', 'emerald') ? Texture.emerald : Texture.default" ]
```

Script (server): `world.getPackSettings()` returns a map of setting name to value:
```js
import { world } from "@minecraft/server";
const settings = world.getPackSettings();
const showSparkles = settings["ns:show_sparkles"];
```
Behavior-pack logic that needs a setting should read it this way; BP JSON has no pack-setting query. 1.26.30 fixed settings being lost when an older cached copy of the pack had none.

## Subpacks (player-selectable variants of a resource pack)

A subpack overlays files on top of the RP. Layout:
```
RP/
  manifest.json
  textures/...               (base files)
  subpacks/
    low/  textures/...       (only the files that differ)
    high/ textures/...
```
Manifest:
```json
"subpacks": [
  { "folder_name": "low",  "name": "Low detail",  "memory_performance_tier": 0 },
  { "folder_name": "high", "name": "High detail", "memory_performance_tier": 2 }
]
```
- Format 3: `folder_name`, `name`, `memory_performance_tier` (0-5, all required). Older format 2 manifests use `memory_tier` instead.
- The player picks one in the pack's settings screen. A `label` setting can explain the choices.
- Subpacks swap files, they can't run logic. For options that change behaviour, use pack settings.

## World templates (.mctemplate)

A world shipped as a template, with packs attached:
```
MyWorld/
  manifest.json            (module "type": "world_template")
  level.dat, db/ ...       (the saved world)
  world_icon.jpeg          (800x450)
  texts/en_US.lang         (pack.name=..., pack.description=...)
  texts/languages.json     ([ "en_US" ])
  behavior_packs/<pack>/   resource_packs/<pack>/
  world_behavior_packs.json   world_resource_packs.json
```
Zip the folder's contents (not the folder) and rename to `.mctemplate`. A `.mcaddon` is just a zip of `.mcpack`s (BP + RP); see `bedrock-shipping` for packaging (`scripts/package-addon.mjs` builds both).

## Common mistakes

- Setting names without a namespace, or with `minecraft:`: the manifest fails validation.
- Dropdown `default` that isn't one of the option names.
- Reading a pack setting with Molang in BP JSON: the queries are client-only.
- Integer versions (`[1, 0, 0]`) mixed into a format 3 manifest; v3 uses strings.
- Renaming a setting in an update: treat it as a new setting (the saved choice is keyed by `name`).
