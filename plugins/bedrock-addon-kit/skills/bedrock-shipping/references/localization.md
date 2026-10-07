# Localization

Sources: Microsoft Learn "Preparing Raw Text for Localization", "Comprehensive Pack Contents" (languages list), "Introduction to Add Entity", "Add a Custom Die Block", "Create Custom Potions", "Crafting Item Catalog", "Packaging a Skin Pack", "Create a World Template", the cooperative add-on guidelines, MCTools `LANGFILES` rules, Mojang bedrock-samples `resource_pack/texts/` (vanilla 1.26.50), `@minecraft/server` 2.10.0 typings, 26.50 changelog. The basic key table also lives in `../../bedrock-world-content/references/camera-fog-text.md`; this page goes further.

## Files

| File | Where | Content |
|---|---|---|
| `texts/languages.json` | root `texts/` of every pack that has lang files (BP, RP, skin pack, world template) | JSON array of locale codes, e.g. `["en_US", "es_ES", "fr_FR"]` |
| `texts/<code>.lang` | same folder | one file per code listed in `languages.json` |
| `texts/language_names.json` | vanilla RP only | pairs `["en_US", "English (United States)"]`. Add-ons don't need it. Whether an add-on can add a new language through it: unverified. |

Rules (MCTools `LANGFILES101` to `105`):
- `languages.json` missing: warning. It must be valid JSON and must include `en_US` (error).
- Every code in `languages.json` needs its `.lang` file (error). A `.lang` not listed is an orphan (warning).
- `en_US.lang` is the fallback: "it's used as a fallback for translations when strings in other languages aren't available" (Learn: Introduction to Add Entity). Put every key in `en_US.lang` first.

## Locale codes and file names

The 29 locales in vanilla `languages.json` (same list as Learn's Comprehensive Pack Contents). File name = code + `.lang`.

| Code | Language (from vanilla `language_names.json`) | Code | Language |
|---|---|---|---|
| `en_US` | English (United States) | `nl_NL` | Nederlands (Nederland) |
| `en_GB` | English (United Kingdom) | `bg_BG` | Български (България) |
| `de_DE` | Deutsch (Deutschland) | `cs_CZ` | Čeština (Česko) |
| `es_ES` | Español (España) | `da_DK` | Dansk (Danmark) |
| `es_MX` | Español (México) | `el_GR` | Ελληνικά (Ελλάδα) |
| `fr_FR` | Français (France) | `fi_FI` | Suomi (Suomi) |
| `fr_CA` | Français (Canada) | `hu_HU` | Magyar (Magyarország) |
| `it_IT` | Italiano (Italia) | `id_ID` | Indonesia (Indonesia) |
| `ja_JP` | 日本語 (日本) | `nb_NO` | Norsk bokmål (Norge) |
| `ko_KR` | 한국어 (대한민국) | `pl_PL` | Polski (Polska) |
| `pt_BR` | Português (Brasil) | `sk_SK` | Slovenčina (Slovensko) |
| `pt_PT` | Português (Portugal) | `sv_SE` | Svenska (Sverige) |
| `ru_RU` | Русский (Россия) | `tr_TR` | Türkçe (Türkiye) |
| `zh_CN` | 中文(简体) | `uk_UA` | Українська (Україна) |
| `zh_TW` | 中文(繁體) | | |

Case matters in the file name as written (`en_US`, not `en_us`); whether the game matches case-insensitively on every platform is unverified, so copy the codes exactly.

## Line syntax

From Learn "Preparing Raw Text for Localization":

```
StringName=StringValue<TAB>### comment for the translator
```

| Part | Rule |
|---|---|
| Key | Starts at the beginning of the line and ends at the first `=`. Unique in the file. No spaces around `=`. |
| Value | Everything after the first `=` up to the terminator. Shown exactly as written: no quotes, no escaping. Quotes or trailing spaces show in game. |
| Terminator | `<TAB>#` ends the value. The tab must be U+0009; editors that turn tabs into spaces break it. Learn calls it "the required terminator for our parser" (Mojang's translation pipeline). Vanilla lang files have no terminators, so the game reads lines without one (one value per line). |
| Comment | Two more `#` after the terminator, then the text: `<TAB>###comment`. Comments are per line; translators see each line on its own, not the whole file. |
| Encoding | UTF-8 without BOM. "Processing will fail if the file is encoded in ANSI, UTF-8 BOM, UCS-2, or any other encoding." |
| One string per line | Don't split a sentence over several keys. If you must, put the full sentence in each line's comment. |

Full-line comments starting with `##` are widely used and the plugin's other skills mention them; Learn does not document them (unverified). Inside a value, a `#` that is not preceded by a tab is plain text (inferred from the terminator rule; unverified in game).

Learn's own examples on that page show a space where the tab belongs (the tab was lost in the web page); use a real tab.

Placeholders: vanilla uses `%s` and numbered `%1$s`, `%2$s` (for example `book.pageIndicator=Page %1$s of %2$s`). Numbered placeholders let a translation reorder arguments. Formatting codes (`§a`, `§l`, ...) are part of the value; say in the comment what each colour means (Learn asks you to explain "the intent of color codes").

## Keys

| Thing | Key | Source |
|---|---|---|
| Pack name / description | `pack.name`, `pack.description` (manifest `name`/`description` set to those keys) | Learn: world template and skin pack pages; vanilla convention |
| Block | `tile.<namespace>:<id>.name` | Learn: Add a Custom Die Block (`tile.demo:die.name=Die`) |
| Item without `minecraft:display_name` | `item.<namespace>:<id>` | Learn: Create Custom Potions (`item.demo:potion_bottle_full=...`) |
| Item or block with `minecraft:display_name` | whatever key you put in `value`, e.g. `item.ns.ruby.name` | Learn: `minecraft:display_name` reference ("may also be used to pull from the localization file by referencing a key") |
| Entity | `entity.<namespace>:<id>.name` | Learn: Introduction to Add Entity |
| Spawn egg | `item.spawn_egg.entity.<namespace>:<id>.name` | same |
| Crafting catalog group | the group `name` itself, namespaced: `ns:my_group=My Group` | Learn: Crafting Item Catalog |
| Skin pack | `skinpack.<serialize_name>`, `skin.<serialize_name>.<skin localization_name>` | Learn: Packaging a Skin Pack |
| Your own script/command text | `ns.<area>.<what>`, e.g. `ns.hud.coins` | cooperative guidelines: "use namespaced names for your .lang string replacement tokens" |

Always set `minecraft:display_name` with an explicit key on custom items and blocks. Since 26.50, "custom blocks and items without a display name component that use localization keys to chain translations ... will now consistently display as raw text unless a display name component is used" (26.50 changelog, MCPE-236819). The plugin's starters use `item.ns.gem.name` / `tile.ns.gem_block.name` with `minecraft:display_name`.

Never redefine vanilla keys (`item.diamond.name=...`): "Via .lang files, do not override the words used for vanilla strings" (cooperative guidelines).

Item, block, entity and spawn egg names belong in the **RP** `texts/`. The BP `texts/` only needs `pack.name` and `pack.description` for the BP (house layout from `bedrock-world-content`). Which pack's lang the server uses for text built on the server side: unverified; send translate keys and let each client resolve them.

## Text from scripts and commands

`RawMessage` (`@minecraft/server` 2.10.0): `text`, `translate`, `with` (`string[]` or a `RawMessage`), `score` (`{ name, objective }`), `rawtext` (array). `translate` "will get translated on the client" in the player's language, so one message serves every player in a multiplayer world.

```js
import { world } from "@minecraft/server";

// ns.hud.coins=Coins: %1$s
player.sendMessage({ translate: "ns.hud.coins", with: [String(coins)] });

// Mixed literal and translated parts
player.sendMessage({ rawtext: [{ text: "§e" }, { translate: "ns.welcome" }] });

// Nested translation: argument is itself translated (with accepts a RawMessage)
player.sendMessage({ translate: "ns.found", with: { rawtext: [{ translate: "item.ns.ruby.name" }] } });
```

`sendMessage`, `onScreenDisplay.setActionBar` / `setTitle`, form titles and buttons in `@minecraft/server-ui` accept `RawMessage` (their signatures say `RawMessage | string`; check `../../bedrock-scripting` and the typings for any other call). Commands use the same JSON: `tellraw @a {"rawtext":[{"translate":"ns.hud.coins","with":["5"]}]}`.

Don't build sentences from pieces in code (`"You found " + count + " " + name`): word order differs by language. Put the whole sentence in one key with placeholders.

## Translating safely

1. Freeze keys before translation. Changing a key breaks every translation of it; change the value instead.
2. Write `en_US.lang` complete, with a translator comment on every line that needs context: part of speech, gender and number of names, what each `%1$s` holds, what must stay untranslated (Learn's checklist).
3. Copy `en_US.lang` to each `<code>.lang` and translate only the text between `=` and the tab. Keep keys, placeholders, `§` codes and the `<TAB>###comment` tail intact (or drop the comment).
4. Add each code to `languages.json` in every pack that has that `.lang` (BP and RP both).
5. Check: every file UTF-8 without BOM; every key from `en_US.lang` present in each translation (a missing key falls back to English); same count of `%` placeholders per line; no tabs turned into spaces.
6. Test by switching the game language in Settings and reloading the world.

The example under `../templates/localization/` follows these rules for namespace `ns` in English, Spanish and French. Add it with `new-addon.mjs --add` (it renames `ns`, keeps one `.lang` per locale, copies the `pack.name` and `pack.description` lines into each, and lists every locale in `languages.json`), or copy the `BP/texts/` and `RP/texts/` folders by hand and replace `ns`.
