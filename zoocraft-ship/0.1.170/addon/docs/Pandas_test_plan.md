# Pandas: test plan (0.1.170)

Module 12, the vanilla catalogue: its third part. Austin: "then lets go to the next module", and "Plan's picks" on the
order card (pandas now, polar bears next in 0.1.171: a zoo polar bear is dangerous, so it needs the big cats' den and
keeper rules). The design is in research/vanilla_plan.md ("0.1.170 pandas: the design").

What it does:
- A new zoo animal, the game's own panda: a zoo copy with exactly the game's look, cubs included, and the game's own
  panda sounds (a cub's, a worried one's and an aggressive one's too). Catch a wild one as any animal: spot it
  in the Field Journal and do its watching tasks: watch one sitting still in the bamboo, and find one whose gene shows.
  A cub can't be moved.
- Bait: some bamboo or a Leafy Ration in your inventory, and a Livestock Crate. Wild pandas are calm; a worried one keeps
  away from people (hold bamboo and it comes to you), and an aggressive one swats back if hit.
- Each panda keeps the gene that shows on it (the game's seven: normal, lazy, worried, playful, brown, weak,
  aggressive), and the Exhibit Clipboard says what it does: a lazy one lies about and ambles slowly; a worried one keeps
  away from people (not keepers or guests); a weak one has half the health (10); a brown one has
  the rare brown coat. A playful zoo panda has the playful look only: the game's roll flung a zoo panda up and out of its
  pen on the test server, so a zoo panda never rolls. A zoo panda never swats anyone.
- Room: 100 blocks of floor for the first and 30 for each more, 4 blocks of headroom. Alone or up to 4 together. Shade
  over at least 15% of the ground (a roof or leaves).
- A bamboo grove: 6 or more stalks of bamboo growing in the floor or beside it (plant bamboo on grass or dirt; it grows
  tall by itself). They browse it (forage enrichment), and they have cubs only with one. The Exhibit Clipboard counts
  the stalks.
- Food: Leafy Rations, or bamboo (it counts as a Leafy Ration) in a Basic Feeder, a Puzzle Feeder or a Hanging Food
  Basket. Bamboo dropped in by hand one picks up and sits to eat, as the game's pandas do (a treat: it doesn't fill the
  feeders). Water from a Water Trough. A Climbing Frame is something to climb.
- Breeding: one cub, grown in six park days; a cub takes a parent's gene.
- `/zoocraft:build`'s test zoo has a Pandas exhibit (73 exhibits): 13 by 12, walls 3 high, grass along the back with 8
  stalks of bamboo, an oak plank roof over a back corner, a Basic Feeder of Leafy Rations with a basket, a Climbing
  Frame and a Water Trough.

Fixed from Austin's content log (2026-11-01):
- "Locator: Error: model already has a locator armor_offset.default_neck ..." on the zoo wolf, fox, cow, pig and sheep
  (and the panda would have had it). The game makes that locator from each model's bone named "head" and pools the
  locators of all an animal's models; the game's baby models carry the head lower than the grown ones, so the two
  clashed. The zoo's animals now draw their young with the zoo's own copies of the game's baby models, the head bone
  named "Head": the same models, moved by the same animations (the game's own baby zombie works this way), and nothing
  left to clash. The game's own animals have the same clash; the game just doesn't report its own.
- "transform_to_item: Missing referenced asset bucket:1": the game's cow file names the milk bucket by its old number.
  The zoo cow names the milk bucket itself.
- The startup lines ("exhibits: 0 loaded", "animals: 0 registered" and the rest down to "ZooCraft Tycoon loaded") were
  sent as warnings. They're information now: the content log shows them only when it's set to show information.
  Anything that goes wrong is still a warning or an error.

On the cloud test server (Bedrock Dedicated Server 1.26.60, Easy, seed 12345, a simulated player; flat worlds at noon;
runs pb170a2, pb170c, pb170d2 with the panda alone, and pw170a with the whole add-on building its test zoo):
- The first run found two things, both fixed. Every zoo panda took the lazy gene's speed (0.07) and the weak gene's
  health (10), whatever its gene: an event that takes away component groups the panda never had muddled the rest. Each
  gene's event now only adds its own: lazy 0.07 and 20 health, weak 0.15 and 10, the rest 0.15 and 20, as the game's
  own. And the game's roll flung a zoo panda
  up and away (its height climbing about 0.06 a tick, 2.2 blocks a second sideways, out of any pen): a zoo panda never
  rolls now.
- A worried zoo panda walked 16 blocks away from the player in 15 seconds (4.3 blocks off at the start, 10.9 at the
  end); the normal, weak, aggressive and lazy ones stayed put.
- Bamboo dropped near them: a zoo panda and a wild one each picked it up and sat to eat it.
- Cubs sneezing over 4 minutes: 16 slime balls dropped; the cubs stayed on the ground, and the grown pandas beside them
  only hopped a block and a bit when startled.
- The test zoo built with the whole add-on: the Pandas exhibit measured ready with no issues, 146 blocks of floor, 31
  under the roof ("Animals: 2 · needs 130 usable blocks, has 146"), "Bamboo grove: 8 of 6 stalks growing in the floor
  or beside it (they browse it, and breed)", forage enrichment from the grove, a Basic Feeder of 30 Leafy Rations; with
  breeding on, the pair ready to breed. Bao (normal, 0.15, 20) and Mei (lazy, 0.07, 20).
- The startup lines are information now (the server's console shows them as INFO, not WARN). No content log lines
  about the pandas, the bamboo measure or their scripts.
- Not seen on the server (it draws and plays nothing): the looks, the cubs' models and the "Locator" lines (only a
  game client draws models), the sounds, the milk bucket. Those are in the steps below.

New entity and model files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Open any world with the add-on. Open the content log (Settings, Creator). | No "Locator" lines, no "bucket:1" line, and no "[ZooCraft]" startup lines (unless the log is set to show information). |
| 2 | Look at a zoo lamb, calf, piglet, wolf pup and fox kit (breed some, or use the test zoo of step 13 in a new world and wait for young). | Each looks just as before, the game's own baby; their heads still turn to look at you. |
| 3 | Use a bucket on a grown zoo cow. | A milk bucket. |
| 4 | Find wild pandas (bamboo jungles). Look at one with the Field Journal; do its tasks: one sitting in the bamboo, and one whose gene shows. | The page fills in; "Ready to move" at the end. |
| 5 | Hold a Livestock Crate and use it on a grown wild panda with no bamboo in your inventory. Then with bamboo. | "You need some bamboo or a Leafy Ration in your inventory to coax it in." Then it goes in (one bamboo is used). |
| 6 | Build a panda exhibit: 11 by 11 or so, walls, an oak plank roof (or leaves) over a corner, grass with 6 or more bamboo planted in it or beside it, a Basic Feeder of Leafy Rations or bamboo, a Water Trough. Use the Habitat Marker inside. Let 1 to 4 pandas out. | The Exhibit Clipboard: ready, a "Bamboo grove" line counting the stalks, and each panda's "Gene" line. Each looks as it did in the wild (a brown one stays brown). |
| 7 | Watch the pandas a few minutes. Drop a bamboo in from outside. | They sit about; one picks up the bamboo and sits to eat it. None rolls, and none leaves the pen. |
| 8 | Walk up to a worried panda (the clipboard says which). Hit an aggressive one. | The worried one keeps away from you. The aggressive one doesn't swat back. |
| 9 | Break bamboo stalks until fewer than 6 are left; measure again (Habitat Marker). | The grove line goes yellow ("with fewer there's no grove to browse, and no cubs"); the forage enrichment goes. Plant them back and measure: back to green. |
| 10 | Put bamboo in the Basic Feeder. | It goes in as Leafy Rations; they eat from it. |
| 11 | Turn breeding on (the Exhibit Clipboard) and keep them well for a few park days. | One cub, growing up in six park days, with a parent's gene. A cub sneezes now and then (a slime ball drops). |
| 12 | Release a panda back to the wild (a Conservation release). | The game's panda with the gene it had (a brown one is a brown wild panda). |
| 13 | In a new Superflat world, `/zoocraft:build`. | The Pandas exhibit with its pandas, measured ready, 8 stalks of bamboo in its grove. |
| 14 | Open the content log after the steps above. | No lines about `zoo_panda`, `zoo_cubs`, `bambooRules` or the bamboo measure. |
