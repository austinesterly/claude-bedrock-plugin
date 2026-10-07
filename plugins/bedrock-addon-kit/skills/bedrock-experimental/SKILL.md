---
name: bedrock-experimental
description: Use when someone wants upcoming Bedrock creator features, beta Script APIs (@minecraft/server beta, server-ui beta, server-gametest, server-admin, server-net, debug-utilities), Preview-only content, or anything behind an experiment toggle (Upcoming Creator Features, Beta APIs, RenderDragon Features for Creators, Voxel Shapes, drop previews), or asks whether something is stable yet.
---

# Upcoming, beta and experimental Bedrock features

Every feature in this plugin carries one of these labels. Always say which label applies when you use or recommend something.

| Label | Meaning | Works in a normal world? |
|---|---|---|
| **Stable** | In the current release with no toggle (the `latest` npm tag for scripts) | Yes |
| **Next stable** | In the `rc` module or the current Preview build without a toggle; ships with the next game release | After that release |
| **Beta API** | Needs the **Beta APIs** experiment plus a `-beta` module version in the manifest | No, test worlds only |
| **Experimental** | Needs an experiment toggle (usually **Upcoming Creator Features**) and often a minimum `format_version` | No, test worlds only |
| **Beta module** | Modules with no stable release at all: `server-gametest`, `server-admin`, `server-net` (dedicated server only), `debug-utilities` | Test worlds or dedicated servers |
| **Preview game feature** | A future game drop under its own experiment (for example "Drop 4 of 2026") | No |

## Where the data is

- `references/experiments.md` (curated): every current toggle, what it unlocks today, what recently graduated, and how to work with beta and experimental content safely.
- `../bedrock-whats-new/references/preview-api.md` (**generated** weekly): every next-stable and beta-only Script API name with its signature and first doc sentence, for `@minecraft/server`, `server-ui`, `server-graphics` and the beta modules. Search for `Type.member`.
- `../bedrock-whats-new/references/experimental-changelog.md` (**generated** weekly): the "Experimental ..." sections of every recent release and Preview changelog, word for word, plus each bullet that mentions an experiment or beta (graduations). Search it for a component or class name to see when it appeared and what toggle it needs.
- `../bedrock-json-reference/references/INDEX.md`: JSON components Mojang's definitions mark experimental. Those definitions lag the changelogs; the changelog wins when they disagree.

## How to work with it

1. Check the dates on the generated files. If they are more than about 14 days old, run `/bedrock-refresh` first.
2. Search `preview-api.md` and `experimental-changelog.md` for the name. Give the label, the toggle, the minimum format version, and the build it first appeared in.
3. For beta scripts, start the add-on with `/bedrock-new <folder> ... --beta` (or `node "${CLAUDE_PLUGIN_ROOT}/scripts/new-addon.mjs" <folder> --name ... --ns ... --beta`). That writes the beta module versions (for example `2.12.0-beta`), the matching Preview `min_engine_version`, and beta typings in `package.json`.
4. Keep experimental work separate from shipped content: a separate pack or branch, a separate test world, and a stable build whose manifest uses only `latest` versions. `/bedrock-check` warns about beta modules and experimental components it knows.
5. When a feature graduates (the changelog says "released from beta", "no longer requires ... experiment"), move it into the stable build at the version the changelog names.

## Safety

Getting Preview means installing Minecraft Preview, which is official, from the Xbox app, Microsoft Store, the Minecraft Launcher, or Google Play / TestFlight Beta. Only suggest those sources. Never install anything on the user's device yourself; ask first and let them do it.
