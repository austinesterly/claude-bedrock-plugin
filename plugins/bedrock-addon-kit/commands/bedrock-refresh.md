---
description: Refresh the plugin's record of current Minecraft Bedrock versions, Script API surface and creator-relevant changes from official sources
---

Refresh the `bedrock-whats-new` references and the `bedrock-json-reference` field tables.

1. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/fetch-updates.mjs"`. If the plugin folder isn't writable (an installed copy), add `--out <a writable folder>` and work on the files there. It reads only official sources: the npm registry (`@minecraft/*`), feedback.minecraft.net and Blockbench's GitHub.
2. Read its report. For every **new changelog** it lists, fetch the article through the official Zendesk API (`https://feedback.minecraft.net/api/v2/help_center/en-us/articles/<id>.json`, the id is the number in the URL) and read its Technical Updates sections.
3. Update `skills/bedrock-whats-new/references/changelog-digest.md`: add or extend the release's section with only what changes how add-ons are built (new stable APIs and components, things that left experiments, stricter parsing at a format version). Keep the "Last curated" date current.
4. Read the new sections of the regenerated `experimental-changelog.md` and update `skills/bedrock-experimental/references/experiments.md` (new toggles, new experimental components, graduations) and the `EXPERIMENTAL` list in `scripts/check-pack.mjs`.
5. Update `capabilities.md` when something moves between "needs an experiment" and "works with no experiments", or a new capability appears.
6. If a new stable `@minecraft/server` or `server-ui` shipped, update the version numbers quoted in `bedrock-addon-conventions/SKILL.md` and `bedrock-scripting/references/code-patterns.md`, and bump `version` in `.claude-plugin/plugin.json` (patch for data refreshes, minor for new guidance).
7. Rebuild the JSON field reference from Mojang's form definitions in the official Microsoft Learn docs repo. In a scratch folder:
   ```
   git clone --depth 1 --filter=blob:none --sparse https://github.com/MicrosoftDocs/minecraft-creator.git
   cd minecraft-creator && git sparse-checkout set content/forms
   ```
   Then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-json-reference.mjs" <scratch>/minecraft-creator/content/forms` (add `--out <dir>` if the plugin folder isn't writable). Mention any component that is new since the last build (diff the `## Components` lists).
8. Summarize for the user in a few lines: what shipped, what is in Preview, new beta APIs and experimental features, anything that will break existing packs at the next format version.

Never install anything or follow links from unofficial sites while doing this.
