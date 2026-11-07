// Llamas, trader llamas and mules (0.1.193, module 12; research/vanilla_plan.md "0.1.193 llamas, trader llamas and mules:
// the design"): the rules, kept apart from the game so the tests can run them. All three are the game's own as zoo copies in
// the Paddock with horses and donkeys (entities/zoo_llama.json, zoo_trader_llama.json, zoo_mule.json). Here:
// - Carpets: a grown llama or trader llama wears the carpet used on it (the copy's property zoocraft:decor: 0 none, then the
//   game's 16 in its order); shears take it off and the carpet comes back (animals/llama.js).
// - Company: a species' herd mates of other kinds in the same exhibit (species.herdWith: llamas and trader llamas each
//   other; horses, donkeys and mules each other) count toward its company, up to its own most.
// - Catching a trader llama: on its wandering trader's lead it's the trader's; off it, the game has tamed it, and it can be
//   caught (species.freeTamed). A carpet on it can't come in the crate (the game's slot is out of a script's reach): the
//   first try says so (warnedLately).
// - Mules: no foals of their own (species.sterile); a horse and a donkey sharing a paddock can have one (species.crossBreed,
//   animals/breeding.js crossPair).

export const DECOR = "zoocraft:decor"; // the copy's
// The game's carpets in its order (the llama's decor textures), as the clipboard names them.
export const CARPETS = ["white", "orange", "magenta", "light blue", "yellow", "lime", "pink", "gray", "light gray", "cyan", "purple", "blue", "brown", "green", "red", "black"];

// The carpet item for decor `n` (1-16), or undefined.
export function carpetItem(n) {
  const c = CARPETS[n - 1];
  return c ? `minecraft:${c.replace(/ /g, "_")}_carpet` : undefined;
}

// Which decor a carpet item is (1-16), or 0 for anything else.
export function carpetDecor(typeId) {
  const i = CARPETS.findIndex((c) => `minecraft:${c.replace(/ /g, "_")}_carpet` === typeId);
  return i + 1;
}

export const WARN_MS = 60000; // a carpet warning holds a minute

// The crate's carpet warning for a tamed trader llama. `seen` maps "player:llama" keys to when the player was told. True when
// this one was told within the minute (the crate goes on, and the key is spent), else it notes the telling now. Old keys go.
export function warnedLately(seen, key, now) {
  for (const [k, t] of seen) if (now - t >= WARN_MS) seen.delete(k);
  if (seen.has(key)) {
    seen.delete(key);
    return true;
  }
  seen.set(key, now);
  return false;
}

// A species' company: its own kind, and its herd mates of other kinds there (species.herdWith), up to its own most (or its
// own number, if that's more already).
export function herdCompany(species, own, residents) {
  if (!species.herdWith) return own.length;
  const mates = residents.filter((r) => species.herdWith.includes(r.speciesId)).length;
  return Math.min(own.length + mates, Math.max(own.length, species.social.recommendedMax));
}

// Why a wild trader llama can't be caught (undefined when it can). `lead`: { holder: its lead holder's type id, holderId }
// when it's on a lead, else undefined. `playerId`: whoever is catching it.
export function traderLeadBlock(lead, playerId, name) {
  if (!lead) return undefined;
  if (lead.holder === "minecraft:wandering_trader") return `This ${name} is on its wandering trader's lead: it's the trader's. Cut the lead with shears and it's free to catch.`;
  if (lead.holder === "minecraft:player" && lead.holderId === playerId) return undefined;
  return `This ${name} is on someone's lead: leave it with them.`;
}

// The clipboard's line for one llama or trader llama: what it wears.
export function decorLine(a, species) {
  const n = a.decor ?? 0;
  if (n > 0 && CARPETS[n - 1]) return `§fDressed: §7in ${/^[aeiou]/.test(CARPETS[n - 1]) ? "an" : "a"} ${CARPETS[n - 1]} carpet (shears take it off)`;
  if (a.juvenile) return `§fDressed: §7too young for a carpet${species.freeTamed ? " (in its trader's blanket)" : ""}`;
  return `§fDressed: §7${species.freeTamed ? "in its trader's blanket" : "no carpet"} (use a carpet on it to dress it)`;
}

// The Field Journal's care notes.
export function llamaCareLines(sp) {
  const lines = [];
  if (sp.decor) {
    lines.push(`Carpets: use any of the 16 carpets on a grown one and it wears it, as the game's tamed llamas do; shears take it off again and give you the carpet back${sp.freeTamed ? ". Without one it wears its trader's blanket" : ""}`);
    lines.push("Wolves: as in the game, one spits at a wild wolf that gets within 10 blocks of it, if it can walk to it (one behind glass is out of reach)");
    lines.push(`Company: never alone, ${sp.social.minGroup} at least and up to ${sp.social.recommendedMax}; llamas and trader llamas count as each other's herd. Breeding: one ${sp.breeding.young} at a time`);
  }
  if (sp.sterile) {
    lines.push("Mules: the foal of a horse and a donkey, so a mule never has a foal of its own. In the zoo, with breeding on, a horse and a donkey of opposite sexes sharing a paddock can have one");
    lines.push(`Company: the horses and donkeys in its paddock count as its herd (mules seem to like horses best), up to ${sp.social.recommendedMax}`);
  }
  if (sp.crossBreed) lines.push("Mule foals: with breeding on, a horse and a donkey of opposite sexes sharing a paddock can have a mule foal, when there's no pair of the paddock's own kind");
  return lines;
}

// The Field Journal's catching line.
export function llamaCatchLine(sp, carrier) {
  if (sp.sterile) return `Catching: none live in the wild. Breed a tamed horse with a tamed donkey (golden carrots or golden apples) and their foal is a mule; once it's grown, with ${sp.baitText} in your inventory, use an empty ${carrier} on it. Or let a horse and a donkey have one in the zoo`;
  if (sp.freeTamed) return `Catching: they come with wandering traders, two on leads. On its trader's lead one is the trader's: cut the lead with shears and it's free (the game tames it then); with ${sp.baitText} in your inventory, use an empty ${carrier} on it. A carpet on it can't come in the crate: take it off first (sneak and use it to open its inventory). One carrying a chest is someone's pack animal: leave it with them`;
  return `Catching: herds of 4 to 6 on savannas and windswept hills. With ${sp.baitText} in your inventory, use an empty ${carrier} on a grown one. A tamed one is someone's: leave it with them`;
}
