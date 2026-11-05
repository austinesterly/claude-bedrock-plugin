---
description: Check Bedrock behavior/resource packs for broken links the game never reports (ids, geometry, textures, animations, controllers, manifests)
argument-hint: "[pack or project folder]"
---

Run the Bedrock pack checker on `$ARGUMENTS` (if empty, use the current project folder):

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" $ARGUMENTS
```

It is read-only and needs only Node 18+. Then:
1. Group the findings by cause and fix the errors in the pack files, following the `bedrock-addon-conventions` and `bedrock-blockbench` skills (for example, rename the bone or the animation key so they match; never delete content to silence a check without saying so).
2. Re-run the checker until it reports no errors.
3. List the warnings you left, with one line each on why they're fine. The game's own animation and controller ids are already accepted, so a warning left means something to look at. Notes are things that are fine on purpose (such as a 2x skin); mention their count, and run with `--notes` only if the user wants them listed.
4. Remind the user that the checker can't see everything: they still need to load the world and read the content log.
