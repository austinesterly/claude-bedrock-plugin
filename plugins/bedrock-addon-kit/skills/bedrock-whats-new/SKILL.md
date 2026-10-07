---
name: bedrock-whats-new
description: Use when someone asks what's new in Minecraft Bedrock, what creators can or can't do in the current version, whether a feature or API is stable or still experimental/beta, which @minecraft/server or server-ui version to use, or before pinning any Bedrock version number.
---

# What's new in Bedrock, and what creators can do

Files in `references/`:
- `current-versions.md` (**generated**): current stable game, the release in Preview, npm versions of every `@minecraft/*` module on the latest / rc / beta channels, Blockbench version, latest changelog links. Check its date first.
- `api-surface.md` (**generated**): which Script API names are stable, which arrive with the next release (rc), and which are beta-only.
- `changelog-digest.md` (curated): creator-relevant changes per release, including stricter-parsing breaks by format version.
- `preview-api.md` (**generated**): every next-stable and beta-only Script API name with its signature and doc sentence, including the beta-only modules.
- `experimental-changelog.md` (**generated**): the experimental sections of every recent changelog, word for word, plus graduations.
- For toggles and how to build with beta or experimental features, use the `bedrock-experimental` skill.
- `capabilities.md` (curated): what an add-on can do today without experiments, what needs an experiment, and what isn't possible, with the workaround.

## How to answer

1. Read `current-versions.md`. If its date is more than about 14 days old, or the user asks about something newer than it, refresh first: run `node "${CLAUDE_PLUGIN_ROOT}/scripts/fetch-updates.mjs"` (official sources only: npm registry, feedback.minecraft.net, Blockbench's GitHub) and read what it prints. If the plugin folder is read-only (an installed copy), pass `--out <some writable dir>` and read the files from there.
2. For "is X stable?": search `api-surface.md` for the class or member. Stable means it's in the `latest` typings. In "Coming in the next stable" means wait for the next release or test in Preview. In "Beta-only" means it needs the Beta APIs experiment.
3. For JSON components and features, use `changelog-digest.md` and `capabilities.md`, and then the official docs (Microsoft Learn) for exact field shapes.
4. Say which version your answer is true for ("as of 26.52 stable, checked 2026-10-06"), and name anything that is only in Preview.

## Keeping this current

- `/bedrock-refresh` regenerates the generated files and walks through any new changelogs to update `changelog-digest.md` and `capabilities.md`.
- A weekly routine in the project that built this plugin runs the same refresh and publishes the updated plugin.
- Release rhythm: a game release (and a new stable Script API) about every 6 to 7 weeks, Preview builds weekly. Schema tightening lands in Preview first, at the next format_version.

## Sources (official only)

- Release changelogs: https://feedback.minecraft.net/hc/en-us/sections/360001186971
- Beta and Preview changelogs: https://feedback.minecraft.net/hc/en-us/sections/360001185332
- npm typings: https://www.npmjs.com/package/@minecraft/server and https://www.npmjs.com/package/@minecraft/server-ui
- Microsoft Learn creator docs: https://learn.microsoft.com/en-us/minecraft/creator/
- Vanilla files: https://github.com/Mojang/bedrock-samples (tagged per release)
- Minecraft Creator Channel (official YouTube) for feature walk-throughs
