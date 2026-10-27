# Deep ocean trench, ocean giants and river species: test plan (0.1.124 on)

Module 6b (Austin: "Deep ocean trench, ocean giants and river species", sharks dangerous, "whale sharks are passive",
"big glowing beautiful jelly fish ... they should drift very slowly"). 0.1.124 brings the Whale Shark, the first BIG
FISH: one named animal in a giant tank (not a school), caught one at a time in the Large Water Tank once Marine
Husbandry is researched, fed Fish Flakes from the Aquarium Feeder. New entity, item and texture files: quit Minecraft
fully and start it again before testing. `/zoocraft:build` makes the full zoo with the Whale Shark Tank in it (steps 1
to 3); steps 4 on work in any world with a park.

| # | Do this | You should see |
|---|---|---|
| 1 | New Superflat world (Creative, cheats on), `/zoocraft:build`. Walk to the Whale Shark Tank. | The biggest exhibit in the zoo: a glass-walled tank 32 x 21 of water 2 deep behind a dry bank, an Aquarium Feeder over the water, a Water Filter on the bank. One whale shark the length of a dozen blocks cruises slowly: a grey-blue back with pale spots in rows, a white belly, a wide flat head, a tall tail. It wears a name (Wanderer). |
| 2 | Watch it for a minute. | Every half minute or so it slows right down for 10 to 16 s with its mouth open (filter feeding), then cruises again. It never leaves the water and never attacks. |
| 3 | Open the Exhibit Controller. | "Animals: 1 · needs 600 usable blocks, has 672", "Ground: 32 dry, 672 water (672 deep)", an Aquarium Feeder among the equipment, no warning. The animal's page: "Wanderer the Whale Shark", "Food: 8 Fish Flakes a park day from the Aquarium Feeder", the needs, no breeding line. |
| 4 | Open the Field Journal, look at the whale shark for 3 s while it feeds. | The Whale Shark page: "spotted one" and "watched one filter feeding" ticked; the page fills as for any animal (two tasks). |
| 5 | Open the Research Desk. | "Marine Husbandry" listed after Veterinary Care: "The Large Water Tank can be used: it carries one big fish (a whale shark) to a giant tank." It needs Veterinary Care done and a Field Journal page on cod, 220, 8 glass, 4 prismarine shards and a book. |
| 6 | Craft the Large Water Tank at the Zoo Workshop: "GGG" glass, "GTG" with a Water Transport Tank in the middle, "IWI" iron ingots round a water bucket. Use it on the whale shark before Marine Husbandry is researched. | The item (stacks to 1, lore empty). Before the research: "The Large Water Tank needs Marine Husbandry research at the Research Desk first." |
| 7 | With the research done, hold Fish Flakes near the whale shark (it follows you a little), then use the empty Large Water Tank on it. | "Wanderer the Whale Shark is in the tank. Use it on the bank of a giant tank, beside the water." The mob is gone; the item is the Large Water Tank (with an animal) with "Wanderer the Whale Shark" in its lore. The exhibit page lists no animals. |
| 8 | Use the occupied tank on the Whale Shark Tank's bank (the dry row by the glass front). Then try it on dry ground away from any water. | "Checking Whale Shark Tank...", then "Wanderer the Whale Shark is now swimming in Whale Shark Tank!" and it is back in the water. On dry ground away from water: "No water near here to let it into: use the tank on the bank beside the water." |
| 9 | Build a tank of your own too small for it (say 10 x 10 x 2 of water) and let it in. | the room line ("Whale Shark need room to turn: water 2 blocks deep in at least 400 spots (now 100)" or the space line for 600 usable blocks) and the tank stays occupied. |
| 10 | Find a warm or lukewarm deep ocean (or `/summon zoocraft:wild_whale_shark` in deep water). | A wild whale shark cruising near the surface, alone, with the same feeding pauses; it despawns when you leave like other wild animals, and the Large Water Tank catches it the same way. |
| 11 | `/zoocraft:skip 1200` a few times with the whale shark in its tank. | The Aquarium Feeder goes down by about 8 units a park day; keepers top it up with Fish Flakes. Welfare stays high; it never breeds and never falls ill. The guests count the tank as a tank (the viewing line on the Exhibit Controller). |
