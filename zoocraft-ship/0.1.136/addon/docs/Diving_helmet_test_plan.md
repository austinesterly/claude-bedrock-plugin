# Diving Helmet: test plan (0.1.136)

Austin, 2026-10-29: "We need to create a helmet that let's you see in water easily." On the card he chose "Sight only":
it lets you see, it doesn't let you breathe (a turtle shell or a potion of water breathing still does that).

Why water is hard to see in: the game draws the water fog from the biome. Mojang's water fog ends 60 blocks out, and
every time your head goes under it starts at almost nothing (0.01 blocks) and only clears over 30 seconds. Deep water
and water at night are dark too.

What the helmet does while you wear it:
- It puts its own water fog on you (the `/fog` command's per-player fog stack, under the id `zoocraft_diving`): clear for
  the first 16 blocks and fading out at 128, at once, with no 30-second murk on going under. In the Deep Trench it keeps
  the trench's teal colour, so the abyss still looks like itself, just far clearer. Only the water fog changes: the air
  and lava fogs stay the biome's.
- It gives night vision while your head is under the water, topped up every half second so it never reaches its last
  10 seconds (when it blinks), and takes it away again when you come up or take the helmet off. A night vision potion's
  longer effect is never taken away.
- Taken off, the fog is removed within half a second.

On the cloud test server (Bedrock Dedicated Server 1.26.60, a simulated Survival player in a glass box of water): worn
on dry land, no night vision; head under the water, night vision (293 ticks left 2 seconds in, 292 after 8); out of the
water, gone within 2 seconds; back in, back; helmet off under the water, gone; a 3-minute potion kept on coming up.
The fog itself can't be seen on a server (it has no screen), so steps 3 to 6 are the ones to look at.

The item: worn on the head with protection 2 and 275 durability (the turtle shell's numbers), mended with copper ingots
on an anvil, enchantable as a helmet. Crafted on a crafting table or the Zoo Workshop from 5 copper ingots in a
helmet's shape round a glass pane:

    C C C
    C G C        C = copper ingot, G = glass pane

New item, fog and model files: quit Minecraft fully and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a crafting table with 5 copper ingots and a glass pane (or look in the creative menu under Equipment, Helmets). | The Diving Helmet: a copper dome with a round glass window. |
| 2 | Hold it, then put it on (right-click with it, or drag it to the head slot). | In the hand: the flat icon. Worn (third person, F5): a copper diving helmet over your head with a round window in front, glass side ports, a valve on top and a brass collar. |
| 3 | Wearing it, jump into an ocean by day and look round. | Clear water at once (no murky first seconds), seeing far across the sea floor. |
| 4 | Take it off under the water (or swim in without it). | The usual murky water fog comes back within half a second. |
| 5 | Put it back on and swim down into deep water, or swim at night. | Bright as day (night vision) while your head is under; no night vision icon blinking. |
| 6 | Come up out of the water. | Night vision gone within a second; the air looks as usual. |
| 7 | Drink a night vision potion, put the helmet on, dive and come up again. | The potion's night vision is still there after you come up. |
| 8 | Wearing it, swim in a Deep Trench (`/locate biome zoocraft:deep_trench`). | The trench's teal water, but clear far down the cliff, and bright. |
| 9 | Stay under the water wearing it. | You still run out of air as usual (sight only). |
| 10 | Wear it until it's damaged, then put it on an anvil with a copper ingot. | It is mended. |
| 11 | Open the content log (Settings, Creator) after the steps above. | No lines about `diving_helmet`, `fog` or `attachable`. |
