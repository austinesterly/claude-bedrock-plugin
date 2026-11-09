# Residents: test plan (0.1.182, 0.1.217, 0.1.220, 0.1.221)

Named people who live in houses you build and walk to your zoo every day (module 6c, idea 15). This first version has
four stand-in residents while Austin's own list of residents was on its way (0.1.220 has his ten, below): Rosie Fernwood (a gardener), Captain
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

## 0.1.217: likes, dislikes and moods

What each resident likes and dislikes now steers their day and how they feel (research/npc_plan.md section 9). The
four stand-ins are the same people; Austin's own list of residents can change any of the numbers here.

What they notice, once a day each:
- On the way in at the gate: Path Lamps or Planters along half the paths or more, litter on the paths (20 or more) or
  clean paths (5 or less), a busy park (60 guests a day or more) or a quiet one (10 or fewer), and the admission
  against what guests think is fair (a high price, or a bargain).
- At each Viewing Point they stop at, its animals by kind: big cats, birds, reptiles, fish, Nether animals, End
  animals, mythical animals, boss animals, Mob House mobs, farm animals. At each bench, Snack Stand (with food in it),
  restroom or fountain they stop at, that.

Their mood: every visit starts at 3 of 5 hearts. Each like they come across adds a heart, each dislike takes one away
(0 to 5): miserable, unhappy, a bit glum, fine, happy, delighted. A day they stay home keeps the mood they had.
- Liked exhibits and amenities are picked 3 times as often on their walk round; disliked ones a third as often.
- Heading home in the evening, at 4 hearts they put 5 coins in the Donation Boxes and at 5 hearts 10 (a generous
  resident twice that), once a day, if the park has a working Donation Box near a Viewing Point.
- Each heart over 3 among the park's residents adds a point to the park rating's score (out of 100: 10 points are half
  a star), 5 points at most. Unhappy residents don't take it down; they just don't tip, and say why.
- Talked to after a visit, now and then they say what pleased or bothered them that day (a chatty one more often).
- New in the data: what each resident is known for. Rosie Fernwood is an early riser (off to the zoo between 200 and
  1000, before the others), Captain Brindle is chatty, Dr. Amara Vale is generous.

No new blocks or entities: a world reload is enough (a full restart is fine too). Works in any world.

On the test server (BDS 1.26.62.1, plains flat worlds, runs R and R2): the test zoo (flamingos, cod, ember foxes and
chorus deer), two stone houses south of the Park Entrance Gate (5 by 3 by 5 inside, a bed, a door, a Resident Mailbox,
a gravel path to the gate), Rosie Fernwood (likes planters and birds, dislikes litter) and Dr. Amara Vale (likes Nether
and End animals, dislikes crowds) moved in, their days run by the clock.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log (Settings, Creator). | No errors or warnings from the add-on. On the test server nothing from the add-on in either run. |
| 2 | Build a home and pick a resident (rows 3 to 6 above). Talk to them before they've been to the zoo. **Please check the pages: the test server can't open menus.** | Their page now has "Mood: fine (3 of 5 hearts)", "No visit to the zoo yet." and, for Rosie, "Known for being: an early riser". On the test server both homes were ready (the bed, the door, a way of 4 path points to the gate) and both moved in at 3 hearts. |
| 3 | Let a night pass and watch them set off in the morning. | Rosie leaves first, by 1000; the others between 1000 and 3000. On the test server, on the second day at 500, Rosie (her time 415) was off while Dr. Vale (her time 1120) was still at home; Dr. Vale set off at 1200. |
| 4 | Follow them round the zoo. | Each exhibit with animals they like makes them happier (once a day each). On the test server Rosie went to 4 hearts at the flamingos (birds); Dr. Vale to 4 at the chorus deer (End) and 5 at the ember foxes (Nether). |
| 5 | Talk to one after they've been to a liked exhibit. | Their page: "Mood: happy (4 of 5 hearts)" and "Today: pleased by birds". Now and then (about one time in three) they talk about it: "The birds were singing their hearts out today." On the test server exactly those words; Dr. Vale: "delighted (5 of 5 hearts)", "pleased by End animals and Nether animals", "The End animals behaved just as my notes say." |
| 6 | In the evening, after they've gone home, open the Park Ledger's Finances. | "Dr. Amara Vale gave 20 coins at the Donation Boxes" (5 hearts, generous) and "Rosie Fernwood gave 5 coins at the Donation Boxes" (4 hearts), once a day each. On the test server exactly those two, as they left the zoo. |
| 7 | Open the Park Ledger. | "Residents: 2 living by the park, adding 3 to the rating's score" and a Residents (2) button: each with their mood word and what they're doing; picking one opens their page. On the test server the rating's score went from 88 to 93 with the residents adding 3 (Dr. Vale 2, Rosie 1). |
| 8 | Let litter pile up on the paths (don't empty the bins or sweep), and watch Rosie come in next morning. | She's bothered by it at the gate: a heart down. Her page: "Today: pleased by birds; bothered by litter", and now and then "Litter everywhere today. It made me so cross." At 3 hearts she doesn't tip. On the test server, with 30 litter on the paths: 2 hearts at the gate, 3 after the flamingos, exactly those words, no tip from her (Dr. Vale's 20 came in), and the residents adding 2. |
| 9 | Sweep the paths and watch the next day. | Each day starts again at 3 hearts. On the test server, the next day with the paths swept, Rosie started again at 3 at the gate and went to 4 at the flamingos; Dr. Vale kept the day before's 5 while she was at home, and started again at 3 when she came in. |
| 10 | Make them unhappy (for Dr. Vale a busy park, for Captain Brindle a high admission) and talk to them. | Their mood drops and they say what bothered them. Their everyday lines no longer say "today" ("Crowds make it hard to take proper notes." in place of "Far too many people about today."). On the test server the tests check every resident's lines; a busy park and a high price only in the tests. |
| 11 | At night. | Home and asleep in their beds, as before. On the test server both asleep in their beds at 13500 each night. |

## 0.1.220: Austin's residents (his spec, stage A)

Austin's ten residents replace the four stand-ins (his spec: research/ZooCraft_Tycoon_Custom_NPC_Spec.md; the plan:
research/npc_spec_plan.md). Their names, unlock goals, likes, dislikes and attributes are kept in his own words; what
he hasn't decided yet (Austin's and Zach's dislikes, every job but Dave's) is left out.

| Resident | Moves in once the zoo has |
|---|---|
| Austin | 2 different species on display |
| Zach | 3 different species on display |
| Sheila | 7 animals on display |
| Carrot | 4 rabbits on display |
| Ron | 5 different species on display |
| Jared | 7 different species on display |
| Amanda | 4 giant pandas on display |
| Paola | 2 young animals on display at once |
| Dave | 2 different cave animals on display (bat, axolotl, glow squid, cave spider, silverfish, warden, Lush Okapi, Earth Molebear, Skulker) |
| Teddy | 10 exhibits with animals in them |

What's new:
- "On display" means a zoo animal living in an exhibit that works, in any park of the world (the Mob House's pens are
  exhibits too). Wild mobs and animals in crates or holding don't count; a school of fish counts its fish.
- Once a resident's goal is met they're unlocked for good, even if the animals go later, and everyone in the world is
  told: "Sheila can move in now! (7 animals on display.) Give them a home: ...".
- The Resident Mailbox is the home's anchor and now has **Move-in ON / OFF** (only whoever placed it can switch it).
  A new mailbox starts ON. Turning it off never makes anyone move out.
- With Move-in ON, a home that's ready (the room, the bed, the door, the path to the zoo) and empty gets the first
  unlocked resident who has no home, by day only (sunrise to late afternoon), one at a time. Its owner can still pick
  any of those waiting from the mailbox instead. The mailbox only offers unlocked residents.
- With nobody unlocked yet, the mailbox shows the three goals nearest to done; the Park Ledger's Residents button is
  always there and lists everyone still to move in, with how far the zoo is towards each goal.
- The four stand-ins (Rosie Fernwood, Captain Brindle, Pip Hollow, Dr. Amara Vale) move out of an older world when it
  loads, and their homes are free for Austin's residents.
- Nothing hurts a resident (as before). If a body is killed anyway (`/kill`), they're back home at once, as a player
  comes back at their bed: asleep in it at night, up beside it by day, with nothing about them changed.
- Ten looks. Austin's is drawn from his own character; Sheila, Carrot, Ron, Dave and Teddy from the spec's words;
  Zach, Jared, Amanda and Paola have a plain look until Austin's pictures come. Preview:
  previews/residents/residents_0220.png (shared folder).
- New in their page: what they like and don't like, and what they're known for, in Austin's words; Dave's job
  (miner; work comes in a later version). Sheila is Talkative, so she talks about her day more often.

Six new skin files: quit Minecraft completely and start it again.

On the test server (BDS 1.26.62.1, plains flat worlds, runs A and B): the test zoo with rabbits (4), flamingos (10),
cod (a school of 12), bats (3) and axolotls (2); stone houses south of the Park Entrance Gate (5 by 3 by 5 inside, a
bed, a door, a Resident Mailbox, a gravel path to the gate).

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log (Settings, Creator). | No errors or warnings from the add-on. On the test server nothing from the add-on in either run. |
| 2 | Open a world where stand-ins lived. | They've moved out; their mailboxes say nobody lives there yet. On the test server a stand-in's record in a home was gone at start-up, and with Move-in ON the first resident waiting moved in 2 seconds later. |
| 3 | In a new world, build a zoo bit by bit and watch the chat. | A message as each resident's goal is met. On the test server, while the zoo was built: Sheila first (the flamingos made 7 animals), then Austin, Zach, Carrot, Ron and Dave (bats and axolotls); Jared stayed at 5 of 7, Teddy 5 of 10, Amanda 0 of 4, Paola 0 of 2. |
| 4 | Open the Park Ledger's Residents. **Please check the menus: the test server can't open them.** | Everyone not living anywhere yet: "Sheila: can move in. They need an empty home with its Resident Mailbox set to Move-in ON." or "Jared: 7 different species on display (5 of 7)". |
| 5 | Build a house, path it to the zoo and place a Resident Mailbox in it, by day. | "Resident Mailbox placed (Move-in ON)." Once the house checks out, the first unlocked resident moves in by themselves: "Sheila has moved into the house at x, y, z!" On the test server 2.5 seconds after the mailbox. |
| 6 | Use a mailbox (yours). **Please check.** | "Move-in: ON" with a button to turn it OFF. In an empty ready home, who can move in, or the three goals nearest to done. Someone else's mailbox has no switch. |
| 7 | Build a second house and turn its Move-in OFF straight away. | Nobody moves in by themselves; picking from the mailbox still works, and it only offers unlocked residents. On the test server nobody moved in while it was OFF; it offered Carrot, Zach and Austin. |
| 8 | Turn it ON at night. | Nobody arrives till morning. On the test server, ON at 18000: nobody; at 1000 Austin moved in within 5 seconds. |
| 9 | Talk to a resident. **Please check.** | "Likes:", "Doesn't like:" and "Known for being:" in Austin's words; for Dave "Job: miner". Austin and Zach: "Doesn't like: not known yet". |
| 10 | Look at each resident. **Please check: the test server draws nothing.** | Austin like his character (light brown hair, charcoal hoodie, blue shorts, white socks and trainers); Sheila gray-haired in a lavender cardigan; Carrot in a gray bunny suit (the ears down the back); Ron white-haired, smiling; Dave ginger in overalls and a yellow hard hat; Teddy in a dark suit with a moustache and glasses. |
| 11 | `/kill` a resident by day, then one at night. | By day they're straight back home beside their bed; at night asleep in it. One of them each time. On the test server: killed at the zoo by day, back by the bed; killed in bed at night, asleep in bed; one body both times. |
| 12 | Lose the animals that met someone's goal. | They stay unlocked. On the test server all the rabbits killed: Carrot still unlocked (0 of 4). |

## 0.1.221: jobs, shifts and better looks

Austin gave each resident a job and left who works by day or by night to us:

| Resident | Job | Works |
|---|---|---|
| Austin | zoo influencer | days |
| Zach | singer | nights |
| Sheila | retired | - |
| Carrot | bunny rehabilitator | days (she dislikes darkness) |
| Ron | farmer | days |
| Jared | singer | nights |
| Amanda | geologist | days |
| Paola | tree chopper | days |
| Dave | miner | nights (he dislikes sunlight) |
| Teddy | mayor | days |

What's new:
- Their page and the mailbox's offer show the job ("Job: singer (works nights)", "Job: retired"), and each bio says it.
  The shifts don't change their day yet: night routines come in stage B.
- Zach redrawn after the singer Austin named (a dark knit cap, a full bushy dark beard, an olive flannel shirt, jeans,
  boots); Jared after the other singer he named (short black dreadlocks with a few blue tips, an oversized gray hoodie
  with the hood down, a silver chain and pendant, light ripped jeans, white trainers).
- Dressed for their jobs: Ron's straw hat and green flannel; Amanda's khaki field vest over a white T-shirt, cargo
  trousers and hiking boots; Paola's red and black buffalo-check flannel and work boots; Teddy's gold mayor's sash.
  Preview: previews/residents/residents_0221.png (shared folder).

Changed skin files: quit Minecraft completely and start it again.

| # | Do this | You should see |
|---|---|---|
| 1 | Open a world with the add-on and the content log. | No errors or warnings from the add-on. On the test server nothing from the add-on (run B again on 0.1.221: the same unlocks, move-in and comeback as 0.1.220). |
| 2 | Look at Zach and Jared. **Please check: the test server draws nothing.** | Zach in his knit cap with a full dark beard; Jared with short dreadlocks (blue tips at the back), a gray hoodie and a chain. |
| 3 | Look at Ron, Amanda, Paola and Teddy. **Please check.** | Ron's straw hat, Amanda's field vest, Paola's red and black check flannel, Teddy's gold sash. |
| 4 | Talk to a resident, or open a mailbox's offer. **Please check.** | "Job: singer (works nights)" for Zach and Jared, "Job: retired" for Sheila, "Job: mayor (works days)" for Teddy, and so on. |
