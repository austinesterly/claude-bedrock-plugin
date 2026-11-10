// What residents teach by friendship (0.1.245). Terra's bands are Austin's (NPC Expansion spec, "Proposed friendship
// unlock structure": 0 basic environmental advice, 20 exhibit cleaning and waste-management knowledge, 40 the Portable
// Disposery recipe, 60 the Disposery recipe, 80 advanced environmental and waste-management knowledge). The words are
// ours, and every number in them is read from the game's own rules (balance.js), so the advice is true.
import { BALANCE } from "./balance.js";

const L = BALANCE.litter;
const S = BALANCE.staff;
const R = BALANCE.residents.work.research;

export const ADVICE = {
  terra: {
    button: "Clean zoo advice",
    title: "Terra's clean zoo advice",
    bands: [
      {
        at: 0,
        name: "Basic environmental advice",
        lines: [
          "Guests drop litter as they walk, and snacks make more. A Litter Bin catches it.",
          "Litter left on the paths costs you tidiness, and guests complain about messy paths.",
          "The Park Ledger's Finances page shows your services, tidy paths among them, and how much litter is lying about.",
        ],
      },
      {
        at: 20,
        name: "Exhibit cleaning and waste management",
        lines: [
          `A Litter Bin covers the paths within ${L.coverRange} blocks of it (${L.coverRise} up or down). With bins only by the gate, half the litter still lands on the paths; with every path covered, none does.`,
          `A bin holds ${L.binCapacity} litter. A keeper empties one that is three-quarters full, or you can empty it yourself by using it.`,
          `A Cleaning Rake used on a guest path sweeps up ${L.rakeSweeps} litter. Used on the floor inside an exhibit, it adds ${BALANCE.needs.rakeCleanliness} cleanliness.`,
          `An exhibit's cleanliness is on its controller's page. More animals in one exhibit dirty it faster, and a keeper cleans any exhibit under ${S.cleanBelow}.`,
        ],
      },
      {
        at: 40,
        name: "The Portable Disposery",
        lines: [
          "My plans for a Portable Disposery are yours: talk to me for them, and ask here if you need another.",
          "At a Zoo Workshop: the plans in the middle of the top row with an iron ingot each side, a bucket under the plans with an iron ingot each side, and a flint at the bottom.",
          "Use it, press the things you don't want, then press Dispose. Nothing goes until you do, and closing it keeps everything.",
        ],
      },
      {
        at: 60,
        name: "The Disposery",
        lines: [
          "My plans for a Disposery are yours too: talk to me for them, and ask here if you need another.",
          "At a Zoo Workshop: the plans, a cauldron and a furnace down the middle, with three iron ingots down each side.",
          "It holds as much as a chest. Sneak and use it to Dispose. Hit it twice to pick it up: what's inside drops out, nothing is lost.",
        ],
      },
      {
        at: 80,
        name: "Advanced environmental knowledge",
        lines: [
          "Raccoons knock Litter Bins over and drag the litter out. A Bin Latch keeps a bin shut.",
          `At my research site, plant waste in the chest (seeds, saplings, leaves, flowers) becomes bone meal: ${R.wasteCost} for one, and twice the bone meal once I'm at my most skilled.`,
          "Before you Dispose of plant waste, think of my chest: what grows can grow something else.",
        ],
      },
    ],
  },
};
