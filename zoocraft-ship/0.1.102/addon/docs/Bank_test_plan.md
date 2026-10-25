# Zoo Bank test plan (module 5: 0.1.102)

Module 5 of the remaining modules: the Bank, which turns the park's Zoo Coins into blocks. The plan is
`research/bank_plan.md` in the ZooCraft Tychoon folder, the research behind the prices `research/bank_facts.md`.

## 0.1.102: the Zoo Bank

New block: close Minecraft completely and start it again (leaving the world is not enough).

- **The Zoo Bank** is made at the Zoo Workshop from 1 gold ingot, 1 chest and 5 stone bricks: a plain pale stone
  block with a gold coin on each side and a gold rim on top.
- It works **inside the park**. Using it opens the Bank: search by name, the blocks you bought lately, and 13 groups
  to browse, 40 blocks to a page. Pick a block, pick how many, press Buy.
- **It only sells** (your answer, "Only sell"): it never buys blocks back.
- Each purchase is **one line in the ledger** ("Bank: 64 Oak Planks"); the coins come out first, then the blocks go
  into your inventory. Only the owner and managers can buy; keepers and visitors can look at the prices.
- **Prices** are whole Zoo Coins each: 1 for common blocks (stone, dirt, sand, planks, glass, concrete), what the
  ingredients cost for crafted ones (a bookshelf 17, a hopper 30), and set prices for valuable and rare ones (a block of
  diamond 1,080, a block of emerald 540, ancient debris 400, a beacon 4,021, a block of netherite 14,670). Packed ice
  is 4, as at the supply shop.
- **Never sold**: bedrock, barriers, command and structure blocks, jigsaw, light blocks, spawners and vaults, End
  portal frames, reinforced deepslate, the dragon egg, budding amethyst, infested blocks and the other blocks you can't
  get in survival. ZooCraft's own blocks aren't sold either (they're made at the Zoo Workshop).

Do these in your own park unless a step says otherwise. Note your Zoo Coins first; the steps spend a little.

| # | Do this | You should see |
|---|---|---|
| 1 | At the Zoo Workshop, make a Zoo Bank. | 1 Zoo Bank from 1 gold ingot, 1 chest and 5 stone bricks, with its stone-and-gold picture in the menu and in your hand. |
| 2 | Place it outside the park and use it. | Placing it says **This Zoo Bank is outside the park.** Using it says the same and opens nothing. Break it (it drops as a Zoo Bank). |
| 3 | Place it inside the park. | **Zoo Bank placed. Use it to buy blocks with the park's Zoo Coins.** |
| 4 | Use it. | The **Zoo Bank** menu: your Zoo Coins, a line saying it sells blocks but doesn't buy them back, **Search by name**, 13 groups (Stone and bricks, Wood, Natural ground, Colours, Glass and lights, Plants and farming, Copper, Ores and minerals, Redstone, Useful blocks, Ocean, Nether, End), each with how many blocks it holds and its price range, and **Close**. |
| 5 | Search by name: type `oak planks`. | A list starting **Oak Planks, 1 coin each**, then other planks. |
| 6 | Pick Oak Planks. | A **How many?** list: 1, 2, 4 ... 32, 1 stack (64), 2 stacks ... each with its cost, the last one saying **all that fits** (or **all the park can afford** if that's less). Below: 1 coin each, the room in your inventory and the park's coins. One stack is picked to start with. |
| 7 | Pick 1 stack (64) and press **Buy**. | **Bought 64 Oak Planks for 64 coins.** 64 oak planks in your inventory, the park's coins 64 lower. The Park Ledger's latest line: **Bank: 64 Oak Planks**, -64. |
| 8 | Use the Bank again. | A **Bought lately** button now, with Oak Planks in it. |
| 9 | Open **Ores and minerals** and pick **Block of Diamond** (with fewer than 1,080 coins). | **The park has N coins; one Block of Diamond costs 1,080 coins.** No purchase. |
| 10 | Open **Wood**. | Page 1 of several, 40 blocks, then **Next page** and **Back**. Next page shows page 2 with **Previous page** too. Back goes to the Bank's main menu. |
| 11 | Search for `logs`, `grey wool`, `torches` and `jack o lantern`. | Oak Log (and the other logs), Gray Wool, Torch and Jack o'Lantern come first. A search for `zzzz` says no block in the Bank is called that. |
| 12 | Fill your inventory, then try to buy Stone. | **Your inventory has no room for Stone.** Free one slot and leave 60 stone in another: the amounts stop at what fits. |
| 13 | Ask a visitor (or a second account with the visitor role) to use the Bank and pick a block. | They see the prices and the line saying only a manager or the owner can buy; picking a block says **Only a park manager or above can do that.** |
| 14 | In a new world, claim a park, turn sandbox mode on (Park Ledger, Settings) and buy 2 stacks of Block of Diamond. | The amounts say **free**. 128 blocks of diamond, the coins unchanged, and the ledger shows **Bank: 128 Block of Diamond (sandbox: free)** at 0. |
| 15 | Look at the content log. | No script errors. |

What it doesn't do (not asked for): buy blocks back, or cap how many rare blocks a day.
