# Residents: test plan (0.1.182)

Named people who live in houses you build and walk to your zoo every day (module 6c, idea 15). This first version has
four stand-in residents while Austin's own list of residents is on its way: Rosie Fernwood (a gardener), Captain
Brindle (a retired sailor), Pip Hollow (a kid) and Dr. Amara Vale (an explorer). Each has their own look, a short bio,
likes and dislikes, and things to say.

How a home works:
- Build a house: a closed room with at least 3 x 3 x 3 blocks of open space inside, not counting the bed. Walls, a
  floor and a roof all round (the Staff Room's rule).
- Put a bed inside and a door in one of its walls.
- Craft a Resident Mailbox at the Zoo Workshop (a chest over an oak fence) and place it inside the house, or against
  one of its outside walls. The player who places it owns the home.
- Lay a path from outside the front door to a zoo. Inside a zoo's fence, the door's path has to join the zoo's guest
  paths. Outside every fence, path blocks from the door have to reach the path by the zoo's Park Entrance Gate (up to
  4000 path blocks long). Path blocks are the ones the guests walk on: gravel, dirt path, bricks, planks and the rest.
- Use the mailbox. It says whether the home is ready and, if not, what's missing. A ready home with nobody in it
  offers three residents; pick one and they move in straight away.

Their day, by the time of day:
- Night (from 13000): in bed, lying down. Sunrise (23000): up, at home.
- Morning: each sets off at their own time between 1000 and 3000. They open their front door, step out, shut it
  behind them, walk the path to the gate and go in, paying the zoo's admission like a guest (once a day). In the zoo
  they walk the guest paths from Viewing Point to bench to snack stand, stopping a while at each.
- Evening (from 11500): back home the same way, in through the door, and to bed at nightfall.
- If the zoo is closed they stay home. If the house stops working (bed or door gone, a wall open) they go home and
  wait outside the door until it's fixed. Sleeping through the night wakes them as the morning comes.
- Far from every player they carry on without a body, and appear where they've got to when a player comes near.

New block and new entity: quit Minecraft completely and start it again. Works in any world.

| # | Do this | You should see |
|---|---|---|
| 1 | Quit Minecraft fully, start it, open a world with the add-on, open the content log (Settings, Creator). | No errors or warnings that name resident or resident_mailbox. |
| 2 | Open the Zoo Workshop. | A Resident Mailbox recipe: a chest over an oak fence. Craft one. It looks like a blue mailbox on a wooden post with a red flag. |
| 3 | In a zoo world (`/zoocraft:build` in a new flat Creative world is quickest), build a small stone house a few blocks outside the Park Entrance Gate: 4 wide, 3 deep, 3 high inside. Put a bed and a door in it. Place the mailbox inside. | A chat line: Resident Mailbox placed, and what a home needs. |
| 4 | Use the mailbox before laying a path. | The mailbox says no path leads from the front door to a zoo. The checklist shows the house, the bed and the door ticked, the path not. |
| 5 | Lay gravel (or any path block) from outside the front door to the path by the gate. Use the mailbox again (or press Check the home again, wait a moment, and use it again). | "This home is ready", and the path goes to your zoo. Three residents to pick from, each with a line about them. |
| 6 | Pick one and press Invite. | They appear at the front door outside, open it, walk in, shut it, and stand inside. Their name shows over their head. The mailbox now says who lives here and what they're doing. |
| 7 | Talk to them (use them). | Their page: something they say, their bio, where they live, what they're doing now, their likes and dislikes. |
| 8 | `/time set 1000` and wait a minute or two (or `/time set 3500`). | They open the door, step out, shut it, walk the path to the gate and in. The zoo's guests today go up by one and its takings by the admission price. In the zoo they walk the paths to a Viewing Point or bench and stop a while, then on to another. |
| 9 | Walk far away (over 64 blocks) and come back. | They're further along than when you left. |
| 10 | `/time set 11500`. | They walk back to the gate, out along the path, in at the door (it opens and shuts) and stand inside. |
| 11 | `/time set 13000`. | They walk to the bed and lie down on it, head on the pillow. |
| 12 | `/time set 0` (or sleep the night through). | They get up. |
| 13 | While they're out at the zoo, break the bed. | The mailbox says the house has no bed. They come home and wait outside the door. Put a bed back: they go in. |
| 14 | Close the zoo (Park menu) in the morning. | They stay at home. |
| 15 | Ask them to move out from the mailbox (only the player who placed it can). | They're gone, and the mailbox offers residents again. |
| 16 | Break the mailbox. | The home and its resident are gone. |
| 17 | Place a second mailbox in the same house. | It says another home already uses the house's bed: each home needs its own bed. |
| 18 | Build a house inside the zoo's fence with its door on the zoo's paths. | Its resident goes straight onto the zoo's paths from the door and pays as they step out. |
