// Research projects at the Research Desk (spec section 4). A project opens when the Field Journal
// shows enough species (`needs`), then costs crafted parts and a few Zoo Coins, and is done at once.
// Each one changes a number the rest of the game reads through research/research.js.

export const PROJECTS = [
  {
    id: "bulk_feeders",
    name: "Bulk Feeders",
    text: "Basic Feeders hold 48 ration units instead of 32.",
    needs: { ready: 1 },
    items: { "minecraft:iron_ingot": 4, "minecraft:hopper": 1 },
    cost: 100,
  },
  {
    id: "park_guidebook",
    name: "Park Guidebook",
    text: "A guidebook for visitors: 10% more guests come each day.",
    needs: { observed: 3 },
    items: { "minecraft:paper": 8, "minecraft:ink_sac": 2 },
    cost: 120,
  },
  {
    id: "keeper_training",
    name: "Keeper Training",
    text: "Keepers look after 6 exhibits each instead of 4, and work a quarter faster.",
    needs: { ready: 2 },
    items: { "minecraft:book": 2, "minecraft:writable_book": 1 },
    cost: 150,
  },
  {
    id: "heat_systems",
    name: "Heat Systems",
    text: "Nether animals: Thermal Carriers can carry them. Build a Thermal Regulator for their exhibit first.",
    needs: { ready: 3 },
    items: { "minecraft:magma_cream": 2, "minecraft:copper_ingot": 4 },
    cost: 200,
  },
  {
    id: "dimensional_preparation",
    name: "Dimensional Preparation",
    text: "End animals: Stabilized Carriers can carry them. Lay end stone in their exhibit floor first.",
    needs: { ready: 4 },
    items: { "minecraft:ender_pearl": 2, "minecraft:obsidian": 4, "minecraft:ender_eye": 1 },
    cost: 250,
  },
  {
    id: "veterinary_care",
    name: "Veterinary Care",
    text: "Animals in recovery holding get better twice as fast.",
    needs: { ready: 3 },
    items: { "minecraft:book": 2, "minecraft:golden_carrot": 2 },
    cost: 150,
  },
  // Big fish (0.1.124, module 6b): the Large Water Tank carrier for sharks, rays and the like opens after Veterinary Care
  // and a Field Journal page on a school of fish (the player has kept a tank).
  {
    id: "marine_husbandry",
    name: "Marine Husbandry",
    text: "The Large Water Tank can be used: it carries one big fish (a whale shark, or a shark while it eats a thrown Fish Ration) to its tank.",
    needs: { after: "veterinary_care", species: { "zoocraft:zoo_cod": 1 } },
    items: { "minecraft:glass": 8, "minecraft:prismarine_shard": 4, "minecraft:book": 1 },
    cost: 220,
  },
  // The End research (spec phase 4 "End research quests"): each opens after an earlier project and
  // a page of the Field Journal (`after`, `species`: id -> level needed).
  {
    id: "anchor_tuning",
    name: "Anchor Tuning",
    text: "Containment Anchors hold 48 charge instead of 24 and use 1 charge a park day instead of 2.",
    needs: { after: "dimensional_preparation", species: { "zoocraft:rift_ferret": 3 } },
    items: { "minecraft:ender_pearl": 4, "minecraft:redstone": 8, "minecraft:glowstone_dust": 4 },
    cost: 240,
  },
  {
    id: "end_guidebook",
    name: "End Guidebook",
    text: "A guidebook to the End wing: 10% more guests come each day while an End animal is on show.",
    needs: { after: "park_guidebook", species: { "zoocraft:chorus_deer": 1, "zoocraft:void_ray": 1, "zoocraft:rift_ferret": 1 } },
    items: { "minecraft:paper": 8, "minecraft:chorus_fruit": 4, "minecraft:ink_sac": 2 },
    cost: 200,
  },
  // Conservation (spec phase 5, M6): opens after the Park Guidebook and the first release (`releases`).
  {
    id: "reintroduction_science",
    name: "Reintroduction Science",
    text: "Released animals settle in faster: the wild takes the next animal of a species after 2 park days instead of 4.",
    needs: { after: "park_guidebook", releases: 1 },
    items: { "minecraft:paper": 4, "minecraft:book": 1, "minecraft:compass": 1 },
    cost: 180,
  },
];

export function projectById(id) {
  return PROJECTS.find((p) => p.id === id);
}
