# Pack manifest

Generated 2026-10-12 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/packmanifest). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Documents and sub-objects (15)

### 3.0.0.Dependency (dependency)

Declares that this pack requires another pack or native module to function. Dependencies can reference other add-ons by UUID/version or native Script API modules like '@minecraft/server'. Minecraft ensures dependencies are loaded first.

| Field | Type | Default | Notes |
|---|---|---|---|
| `module_name` | string |  | Module Name |
| `uuid` |  |  | Uuid |
| `version` |  |  | **required** |

### 3.0.0.DropdownOption (dropdownoption)

A single option within a dropdown setting. Contains a unique identifier used by scripts and localized display text shown to players. Options are presented in the order defined.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | **required**. Name |
| `text` | string |  | **required**. Text |

### 3.0.0.DropdownSetting (dropdownsetting)

A dropdown selection setting that appears in the pack's world settings UI. Players choose from predefined options like game modes or difficulty presets. Each option has an internal ID and display text.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default` | string |  | **required**. Default |
| `name` | string |  | **required**. Name |
| `options` | objectArray |  | **required**. Options See `packmanifest/dropdownoption`. |
| `text` | string |  | **required**. Text |
| `type` | stringEnum |  | **required**. Type Values: `dropdown`, `label`, `multiselect`, `slider`, `toggle`. |

### 3.0.0.Header (header)

The header section of manifest.json containing the pack's identity: its name shown in the UI, description, unique UUID, and version. The min_engine_version field specifies the minimum Minecraft version required to load the pack.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_random_seed` | boolean |  | Allow Random Seed |
| `base_game_version` | string |  | Base Game Version |
| `description` | string |  | Description |
| `lock_template_options` | boolean |  | Lock Template Options |
| `min_engine_version` | string |  | Min Engine Version |
| `name` | string |  | **required**. Name |
| `pack_optimization_version` | string |  | Pack Optimization Version |
| `pack_scope` | string |  | Pack Scope |
| `platform_locked` | boolean |  | Platform Locked |
| `uuid` | string |  | **required**. Uuid |
| `version` | object |  | **required**. Version |

### 3.0.0.LabelSetting (labelsetting)

A read-only text label in the pack's world settings UI. Use labels to display instructions, section headers, or explanatory text between interactive settings. Labels don't have values—they're purely informational.

| Field | Type | Default | Notes |
|---|---|---|---|
| `text` | string |  | **required**. Text |
| `type` | stringEnum |  | **required**. Type Values: `dropdown`, `label`, `multiselect`, `slider`, `toggle`. |

### 3.0.0.Metadata (metadata)

Optional metadata about the pack including author names, license information, and URL. This information may be displayed in marketplace listings or pack details screens. Also includes generation tool info for debugging.

| Field | Type | Default | Notes |
|---|---|---|---|
| `authors` | stringArray |  | Authors |
| `generated_with` | object |  | Generated With |
| `license` | string |  | License |
| `product_type` | string |  | Product Type |
| `url` | string |  | Url |

### 3.0.0.Module (module)

Declares a module within the pack. Modules define what the pack contains: 'data' for behavior packs, 'resources' for resource packs, or 'script' for packs with JavaScript/TypeScript code. Script modules require an entry point file path.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | string |  | Description |
| `entry` | string |  | Entry |
| `language` | string |  | Language |
| `type` | string |  | **required**. Type |
| `uuid` | string |  | **required**. Uuid |
| `version` | object |  | **required**. Version |

### MultiSelectSetting (multiselectsetting)

| Field | Type | Default | Notes |
|---|---|---|---|
| `defaults` | stringArray |  | **required**. Defaults |
| `name` | string |  | **required**. Name |
| `options` | objectArray |  | **required**. Options See `packmanifest/dropdownoption`. |
| `text` | string |  | **required**. Text |
| `type` | stringEnum |  | **required**. Type Values: `dropdown`, `label`, `multiselect`, `slider`, `toggle`. |

### 3.0.0.NativeModuleDependency (nativemoduledependency)

Declares a dependency on a built-in Script API module such as '@minecraft/server', '@minecraft/server-ui', or '@minecraft/server-gametest'. The version string determines which API surface is available to your scripts.

| Field | Type | Default | Notes |
|---|---|---|---|
| `module_name` | string |  | **required**. Module Name |
| `optional` | boolean | `false` | Optional |
| `version` | object |  | **required**. Version |

### 3.0.0.PackDependency (packdependency)

References another add-on pack that must be present for this pack to work. Commonly used to link a behavior pack to its companion resource pack, or to depend on shared library packs. Uses UUID and version matching.

| Field | Type | Default | Notes |
|---|---|---|---|
| `uuid` | string |  | **required**. Uuid |
| `version` | object |  | **required**. Version |

### 3.0.0.PackManifestDocument (packmanifestdocument)

The root structure of a manifest.json file that defines an add-on pack. Every behavior pack and resource pack requires a manifest with a unique UUID, version info, and module declarations. This is the entry point Minecraft uses to identify and load your content.

| Field | Type | Default | Notes |
|---|---|---|---|
| `capabilities` | stringArray |  | Capabilities |
| `dependencies` | stringArray |  | Dependencies |
| `format_version` | int |  | **required**. Format Version |
| `has_education_metadata` | boolean |  | Has Education Metadata |
| `header` | object |  | **required**. Header See `packmanifest/header`. |
| `metadata` | object |  | Metadata See `packmanifest/metadata`. |
| `modules` | objectArray |  | **required**. Modules See `packmanifest/module`. |
| `settings` | stringArray |  | Settings |
| `subpacks` | objectArray |  | Subpacks See `packmanifest/subpack`. |

### 3.0.0.SemVersionProxy (semversionproxy)

Represents a semantic version number (major.minor.patch format). Minecraft uses these for pack versions, dependency version requirements, and API version targeting. Increment major for breaking changes, minor for features, patch for fixes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `buildMeta` | string | `""` | BuildMeta |
| `major` | int | `0` | Major |
| `minor` | int | `0` | Minor |
| `patch` | int | `0` | Patch |
| `preRelease` | string | `""` | PreRelease |

### 3.0.0.SliderSetting (slidersetting)

A numeric slider setting that appears in the pack's world settings UI. Allows players to adjust values like 'Difficulty Multiplier' or 'Spawn Rate' within defined min/max bounds. Scripts can read the chosen value at runtime.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default` | float |  | **required**. Default |
| `max` | float |  | **required**. Max |
| `min` | float |  | **required**. Min |
| `name` | string |  | **required**. Name |
| `step` | float |  | **required**. Step |
| `text` | string |  | **required**. Text |
| `type` | stringEnum |  | **required**. Type Values: `dropdown`, `label`, `multiselect`, `slider`, `toggle`. |

### 3.0.0.Subpack (subpack)

Defines a subpack option that players can choose in pack settings. Subpacks allow offering different quality levels (like HD vs SD textures) that map to memory tiers, letting players with lower-end devices select lighter alternatives.

| Field | Type | Default | Notes |
|---|---|---|---|
| `folder_name` | string |  | **required**. Folder Name |
| `memory_performance_tier` | int |  | **required**. Memory Performance Tier |
| `name` | string |  | **required**. Name |

### 3.0.0.ToggleSetting (togglesetting)

A boolean on/off setting that appears in the pack's world settings UI. Players can toggle features like 'Enable Hard Mode' or 'Show Tutorials' before entering a world. Scripts can read these values at runtime.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default` | boolean |  | **required**. Default |
| `name` | string |  | **required**. Name |
| `text` | string |  | **required**. Text |
| `type` | stringEnum |  | **required**. Type Values: `dropdown`, `label`, `multiselect`, `slider`, `toggle`. |
