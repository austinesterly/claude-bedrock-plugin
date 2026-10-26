# Several zoos in one world: test plan (0.1.114, the second park)

Austin: "People should be able to have their own zoos on a world, or work together." 0.1.114 lets a world hold any
number of parks. A Park Deed claims a park of your own anywhere outside every park's Aluminum Fence and 16 blocks or
more from another park's Deed spot; one park an owner (you can still be a manager or keeper of any number of others).
Each park has its own name, fence, entrance gate and Ticket Booth, path network and guests, coins, day, rating, clock,
staff, research, quests and ledger. The Park Ledger opens the park you stand in if you belong to it, else your own,
else one you belong to; every block's menu is the menu of the park the block stands in. Scripts only: leave the world
and join again. (0.1.117 brings each player their own Field Journal: the section at the end.)

You need: a Superflat world (Creative, cheats on) and a second player (a second device or account) for steps 7 to 13.
Steps 1 to 6 work alone. `/zoocraft:build` makes a full zoo in one go (docs/Test_zoo_test_plan.md).

| # | Do this | You should see |
|---|---|---|
| 1 | New world, `/zoocraft:build`. Open the Park Deed. | The zoo builds round you as in 0.1.104. The Ledger is titled "Park Ledger" with no park row: a world with one park looks exactly as before. |
| 2 | Walk 300 blocks away (outside the fence) and use the Park Deed. | "You already own Austin's Zoo. One park an owner; you can be a manager or keeper of other parks." Nothing is claimed. |
| 3 | `/zoocraft:status`. | One "park" line: "park: 100500 coins, ...". |
| 4 | Settings in the Ledger. | A "Park name" text field above the three toggles, holding "<you>'s Zoo". Change it to "Riverside" and submit: "...sidebar on. The park is Riverside." Open the Ledger again: still "Park Ledger" (one park, no row). |
| 5 | Stand inside your zoo and `/zoocraft:skip 600`. | "Ran 600 seconds of park time." The day advances as before. |
| 6 | `/zoocraft:grant 100`. | "Added 100 coins. Balance ...": your park's. |
| 7 | A second player (Bea) joins. | She is welcomed: "This world has a zoo already; its owner can make you a keeper or manager from the Park Ledger, or claim a park of your own with a Park Deed outside its fence." and gets a Park Deed. |
| 8 | Bea uses the Deed standing inside your fence. | "This spot is inside Riverside. Claim a park outside every park's Aluminum Fence." No menu. |
| 9 | Bea walks 10 blocks from your Deed spot (outside the fence if it's that close) and uses the Deed. | "This spot is too close to Riverside's Park Deed spot (x z). Claim a park at least 16 blocks from another park's spot." |
| 10 | Bea walks 400 blocks off and uses the Deed, "Claim here". | "You claimed Bea's Zoo! 500 Zoo Coins to start. Rename it in the Park Ledger's settings." Her Ledger is titled "Park Ledger: Bea's Zoo" and its first row says "Bea's Zoo (park 2 of 2 in this world)". Yours now says "Riverside (park 1 of 2 in this world)". |
| 11 | Bea `/zoocraft:build 100` where she stands. | Her zoo builds round her Deed spot inside its own fence ring; yours is untouched (same coins, exhibits, keepers). `/zoocraft:status` lists "park Riverside: ..." and "park Bea's Zoo: ...". Guests come to both entrances; each park's sidebar figures are its own, and the sidebar on screen names the park it shows on its top row (the park with the most members online; with one each, the first park). |
| 12 | Bea opens her Staff Room, Tour Desk, Research Desk, Zoo Bank, Gift Shop, Ticket Booth and the entrance gate. | Each menu is her park's: her coins, her keepers (6 of 6), her research. The same blocks in your park show yours. Her `/zoocraft:skip 300` runs only her clock (your park day doesn't move). |
| 13 | Bea tries to rename her park "Riverside" in settings. | "Another park is already called Riverside." Her park keeps its name. |
| 14 | You make Bea a keeper of Riverside from the Ledger's Members page. | "Bea is now a keeper of Riverside." Bea standing in Riverside opens the Deed: Riverside's Ledger (she belongs to it). Standing in her own: hers. Standing outside both: her own. |
| 15 | Bea builds an Aluminum Fence round her Deed spot that also goes round yours. | The fence's state line: "The Aluminum Fence closes round Riverside's Park Deed spot (x y z) too, so it isn't this park's fence: a park can't hold another park. Fence the two parks apart." Her park keeps its last closed edge. Take the fence back inside: it closes as usual. |
| 16 | In a world with several parks, place an Exhibit Controller outside any fence, then close a fence round it. | The exhibit joins the park whose fence holds it (its Ledger lists it; the other park's doesn't). |
| 17 | Open the content log after loading. | No errors. |

## 0.1.117: each player's own Field Journal

Austin: "Field journals should be individual unlocks." The Field Journal (the Park Ledger's "Field Journal" button) is
yours alone and goes with you to any park: watching an animal fills in your page, and the line goes to you only.
Catching a wild animal, releasing one to the wild and the Research Desk's locks read your own journal; the park's End
expedition and conservation programme count what any of its members knows. On your first join after the update, every
species in a park you belong to is filled in already; a member made later starts empty. Scripts only: leave the world
and join again. You need a second player for steps 4 to 9.

| # | Do | Expect |
|---|----|--------|
| 1 | Join a world that had a Field Journal before 0.1.117 (one with a zoo and pages filled in). | The content log says "discovery: the park's Field Journal (N species) is each member's own now: ... pages for M members" once, then "discovery: M Field Journals" on every load. Your Field Journal shows the same pages as before. |
| 2 | Join a world with a zoo of yours for the first time since the update. | "Field Journal: it's your own now, and goes with you to any park. N species your park keeps are filled in already." once; every species in your zoo shows "Ready to move". Leave and join again: no line. |
| 3 | Look at an animal you haven't got the page for (a wild one, or `/summon zoocraft:zebra` outside the park) for a few seconds. | "Field Journal: You spotted one: Zebra. Now: Observed. Next: watch one grazing, standing still." Your page fills in; nobody else's does. |
| 4 | Bea joins, and you make her a keeper from the Ledger's Members page. | Her Field Journal shows "???" and "Unseen" for every species, yours is unchanged. She hears nothing when you fill in a page, and you hear nothing when she does. |
| 5 | Bea opens her Field Journal in your park, then walks to her own park (or outside every fence) and opens it again. | The same pages everywhere: it's hers, not the park's. |
| 6 | Bea tries to crate a wild animal of a species you know and she doesn't (an empty carrier of the right kind in hand). | "You don't know zebras well enough to move one safely yet. Field Journal: spot one, wild or in a zoo; ..." You can crate it. |
| 7 | Bea opens the Research Desk in your park. | Projects that need the journal ("1 species ready to move", "3 species observed") are locked for her with "0 so far", open for you; a project done is done for everyone (it's the park's). |
| 8 | Bea opens a grown animal's page on the Exhibit Clipboard (one settled long enough, welfare 70 or more) of a species she hasn't the care notes for. | "Conservation: Fill in the Zebra's Field Journal page to care notes first ..."; on your Clipboard the same animal is "ready for the wild". |
| 9 | Bea watches that species until two observations are ticked, then opens the page again. | Now it can be released by her too. |
| 10 | The End expedition's "spot the End species" step, with you having spotted them and Bea not. | The step is done for the park (any member's journal counts). |
| 11 | Open the content log after loading. | No errors. |
