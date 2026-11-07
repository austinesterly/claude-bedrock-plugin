// Nautiluses (0.1.196, module 12; research/vanilla_plan.md "0.1.196 happy ghast and nautilus: the design"): the rules,
// kept apart from the game so the tests can run them. The game's nautilus as a zoo copy (entities/zoo_nautilus.json): the
// game's tame one, swimming on its own, never hunting, charging or ridden. Its tank (profile nautilus_tank) is Daw and
// Barord's aquarium for one nautilus scaled to the game's shell, dim (species.lowLight, the trench tanks' rule: "only
// enough light in the tank to view the animal").

// The Field Journal's care notes.
export function nautilusCareLines(sp, T, profile) {
  if (!sp.nautilus) return [];
  return [
    `Their tank: ${profile.baseArea} water blocks for the first and ${profile.extraArea} more each, all of the first's water 2 deep or more (an aquarium for one is 6 shells long, 3 wide and 4 deep). Keep it dim: they live deep, and bright light stresses them (light ${T.maxLight} or less on the water)`,
    "They swim about slowly, idle in the water and follow anyone holding fish. The zoo's never hunt or charge, and no one rides them",
    "Food: fish fed in the water (an Aquarium Feeder): Fish Rations, raw cod, salmon, pufferfish or tropical fish",
    "Young: one egg at a time; it hatches into a small nautilus that stays in the tank",
  ];
}

export function nautilusCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory (a wild one follows pufferfish). Wild ones swim alone in the oceans between Y 38 and 58 (not frozen ones; cold ones only deep). A tamed one is someone's. Let one go and it's the game's own again`;
}
