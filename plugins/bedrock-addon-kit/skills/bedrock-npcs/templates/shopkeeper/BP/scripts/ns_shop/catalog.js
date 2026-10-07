// Shop catalog. `id` is stable (receipts store it); `price` is per bundle of `count` items.
// Icons are resource-pack texture paths without extension (vanilla paths work).

export const CATEGORIES = [
  {
    id: "food",
    name: "Food",
    icon: "textures/items/bread",
    offers: [
      { id: "bread", item: "minecraft:bread", count: 4, price: 5, name: "Bread", icon: "textures/items/bread" },
      { id: "apple", item: "minecraft:apple", count: 4, price: 6, name: "Apples", icon: "textures/items/apple" },
      { id: "carrot", item: "minecraft:carrot", count: 8, price: 6, name: "Carrots", icon: "textures/items/carrot" },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    icon: "textures/items/iron_pickaxe",
    offers: [
      { id: "iron_pickaxe", item: "minecraft:iron_pickaxe", count: 1, price: 40, name: "Iron Pickaxe", icon: "textures/items/iron_pickaxe" },
      { id: "iron_axe", item: "minecraft:iron_axe", count: 1, price: 35, name: "Iron Axe", icon: "textures/items/iron_axe" },
      { id: "iron_shovel", item: "minecraft:iron_shovel", count: 1, price: 20, name: "Iron Shovel", icon: "textures/items/iron_shovel" },
    ],
  },
  {
    id: "blocks",
    name: "Building",
    icon: "textures/blocks/brick",
    offers: [
      { id: "oak_planks", item: "minecraft:oak_planks", count: 32, price: 8, name: "Oak Planks", icon: "textures/blocks/planks_oak" },
      { id: "glass", item: "minecraft:glass", count: 16, price: 10, name: "Glass", icon: "textures/blocks/glass" },
      { id: "torch", item: "minecraft:torch", count: 16, price: 4, name: "Torches", icon: "textures/blocks/torch_on" },
    ],
  },
];

// What the vendor buys from players: price paid per `count` items.
export const BUYBACK = [
  { id: "sell_wheat", item: "minecraft:wheat", count: 8, price: 3, name: "Wheat", icon: "textures/items/wheat" },
  { id: "sell_coal", item: "minecraft:coal", count: 8, price: 4, name: "Coal", icon: "textures/items/coal" },
  { id: "sell_iron", item: "minecraft:iron_ingot", count: 1, price: 5, name: "Iron Ingot", icon: "textures/items/iron_ingot" },
];

export const MAX_BUNDLES = 10; // most bundles per purchase or sale
