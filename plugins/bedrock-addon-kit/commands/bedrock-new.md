---
description: Start a new Bedrock add-on from scratch (manifests with fresh UUIDs, BP/RP, script entry, lang, deploy helper), optionally with starter items, blocks, entities or any template from the plugin's skills
argument-hint: <folder> [name] [namespace]
---

Create a new add-on with the plugin's generator. Arguments: $ARGUMENTS

1. Work out the folder, the add-on's display name and a short lowercase namespace (2 to 12 letters, not `minecraft`). Ask only if the user gave none of them; otherwise pick sensible defaults and say which.
2. Run:
   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/new-addon.mjs" <folder> --name "<Name>" --ns <namespace> [--starter item,block,entity|none] [--add <template dir>]... [--no-script]
   ```
   `--add` takes any `templates/<example>` folder from the `bedrock-items`, `bedrock-blocks`, `bedrock-ui`, `bedrock-world-content` or `bedrock-dimensions-biomes` skills (list them with `ls "${CLAUDE_PLUGIN_ROOT}"/skills/*/templates`); the generator renames their `ns` namespace and merges texture, sound and lang files.
3. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <folder>/packs` and fix anything it reports.
4. Tell the user what was created and how to test it: `node tools/deploy.mjs` (or `--preview`) copies the packs into the game's development pack folders, then create a world with both packs.

The generator only writes files into the new folder. It installs nothing and needs no network.
