# Obsidian Armor: test plan (0.1.158)

Austin, 2026-10-31: "Let's add some lava resistance armor that also lets you see in lava like our water one." On the
card he chose a full suit, then: "It should be crafted from obsidian. Call it obsidian armor" and "Helmet needs 5
obsidian like the helmet and tinted glass in the middle".

What it does:
- Wear all four pieces (helmet, chestplate, leggings, boots) and lava, fire and magma blocks can't hurt you. The suit
  keeps fire resistance on you while it is all on (topped up every half second, so it never runs out), and takes it
  away again when any piece comes off. A fire resistance potion's longer effect is never taken away.
- Three pieces or fewer do nothing against lava: it burns as usual. Standing in lava or burning with only some of the
  suit on, the action bar says "Obsidian Armor keeps the lava off only as a full set: 3 of 4 on". When the whole suit
  goes on it says "Obsidian Armor: lava and fire can't hurt you, and the helmet clears your view in lava".
- The helmet's tinted-glass visor clears the view in lava, as the Diving Helmet does in water: it puts its own lava fog
  on you (the `/fog` command's per-player fog stack, under the id `zoocraft_obsidian`). Mojang's lava fog ends 0.64
  blocks out (4 with fire resistance); the helmet's is clear for 8 blocks and fades out at 48, in the lava's own red.
  Only the lava fog changes. The helmet does this on its own, but without the rest of the suit you burn.
- As armour: protection 2, 7, 5 and 2 (16 in all: iron is 15, diamond 20), durability 300, 440, 410 and 360 (more than
  iron, less than diamond), mended with obsidian on an anvil, enchantable as armour.

Crafted on a crafting table or the Zoo Workshop, in the iron armour shapes with obsidian (24 obsidian for the set):

    Helmet        Chestplate    Leggings      Boots
    O O O         O . O         O O O         O . O
    O T O         O O O         O . O         O . O
                  O O O         O . O

    O = obsidian, T = tinted glass

On the cloud test server (Bedrock Dedicated Server 1.26.60, a simulated Survival player in a lava pool 3 deep, head
under the lava): the whole suit, 10 seconds under, health 20 the whole time, fire resistance held at 194 ticks, never
alight; out onto the stone, no flames. Three pieces (no boots): 20 health to 0 in about 5 seconds, killed by fire.
The `/fog` push of the helmet's fog succeeded. The fog itself can't be seen on a server (it has no screen), so steps
4 to 6 are the ones to look at.

New item, fog and armour files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a crafting table (or the Zoo Workshop) with obsidian and a tinted glass, or look in the creative menu under Equipment. | The Obsidian Helmet, Chestplate, Leggings and Boots: dark purple-black with violet specks; the helmet has an amber visor. |
| 2 | Put on all four (third person, F5). | Dark obsidian plates over head, body, arms and legs; the helmet open at the face under a band of amber glass. The action bar: "Obsidian Armor: lava and fire can't hurt you...". |
| 3 | Walk into lava in the Nether (or pour a lava bucket into a pit) and dive under. | No damage, no burning. |
| 4 | Look round with your head under the lava. | You can see through the lava for several blocks, fading out by about 48, instead of a red wall. |
| 5 | Take the boots off while standing in lava. | You start burning at once; the action bar says "...only as a full set: 3 of 4 on". Put them back on to stop. |
| 6 | Take the helmet off with your head under the lava (then get out). | The view goes back to the usual red wall within half a second. |
| 7 | Step out of the lava with the whole suit on. | No flames; nothing hurts. |
| 8 | Drink a fire resistance potion, put the suit on and take it off again. | The potion's fire resistance is still there. |
| 9 | Wear it in a fight until it's damaged, then put a piece on an anvil with obsidian. | It is mended. |
| 10 | Open the content log (Settings, Creator) after the steps above. | No lines about `obsidian`, `fog` or `attachable`. |
