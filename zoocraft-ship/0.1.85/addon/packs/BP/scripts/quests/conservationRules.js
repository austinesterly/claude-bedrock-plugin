// Conservation releases (spec section 9: "complete a conservation release. Released or transferred
// individuals leave the active registry through a journaled transaction"; section 15: "Conservation
// releases require eligible animals, a species-appropriate release location or quest abstraction,
// good health, and a unique completion record. Rewards emphasize reputation and research, with
// bounded money rewards"; phase 5 "conservation quests"), pure: which animal may go, where it may be
// let out, what the park earns, and the conservation quest chain. The runtime side is
// quests/conservation.js; the carrier does the letting out (transport/carriers.js).

const DIM_NAME = { "minecraft:overworld": "the Overworld", "minecraft:nether": "the Nether", "minecraft:the_end": "the End" };

export function dimensionName(id) {
  return DIM_NAME[id] ?? id;
}

function days(n) {
  return `${n} park day${n === 1 ? "" : "s"}`;
}

// Where a species is let out, in words: its home ground.
export function groundText(species) {
  if (species.lavaSwimmer || species.lavaWalker) return "at the edge of a lava lake (lava or Clear Lava within 2 blocks)";
  if (species.endGround) return "on end stone";
  if (species.homeGround) return species.homeGround.text;
  if (species.nylium) return "on crimson nylium";
  if (species.cold) return "on snow or ice";
  return "on open ground";
}

// Is this ground right for the species? `ground` describes the block the carrier was used on:
// { id, isAir, isLiquid, lavaNear } (lavaNear: lava or Clear Lava within 2 blocks).
export function groundOk(species, ground) {
  if (species.lavaSwimmer || species.lavaWalker) return Boolean(ground.lavaNear);
  if (ground.isAir || ground.isLiquid) return false;
  if (species.endGround) return ground.id === "minecraft:end_stone";
  if (species.homeGround) return ground.id === species.homeGround.id;
  if (species.nylium) return ground.id === "minecraft:crimson_nylium";
  if (species.cold) return /snow|ice/.test(ground.id);
  return true;
}

/**
 * May this animal go to the wild? The first rule that fails explains itself (like breedingCheck).
 * @param {{ animal: object, species: object, welfare: number, daysInPark: number, level: number,
 *   residentsAfter: number, lastReleaseDay?: number, cooldownDays: number, day: number }} ctx
 *   level: the species' Field Journal level (2 = care notes); residentsAfter: animals left in its
 *   exhibit once it goes; lastReleaseDay: when the wild last took one of its species.
 * @returns {{ ok: boolean, reason: string }}
 */
export function releaseCheck(ctx, B) {
  const a = ctx.animal;
  const sp = ctx.species;
  if (a.juvenile) return { ok: false, reason: `${a.name} is still young: only grown-ups go back to the wild.` };
  if (a.expecting) return { ok: false, reason: `${a.name} is expecting: the young come first.` };
  if (a.ill) return { ok: false, reason: `${a.name} is unwell: nurse it back to health first.` };
  if (ctx.welfare < B.welfareMin) return { ok: false, reason: `${a.name} needs welfare ${B.welfareMin} or more to cope in the wild (${ctx.welfare} now).` };
  if (ctx.daysInPark < B.minDays) return { ok: false, reason: `${a.name} has been in the park ${days(ctx.daysInPark)}; the programme takes animals settled for ${days(B.minDays)}.` };
  if (ctx.level < 2) return { ok: false, reason: `Fill in the ${sp.displayName}'s Field Journal page to care notes first (watch them until two observations are ticked).` };
  if (sp.social?.prefersCompany && ctx.residentsAfter > 0 && ctx.residentsAfter < sp.social.minGroup) {
    return { ok: false, reason: `Releasing ${a.name} would leave ${ctx.residentsAfter} behind: ${sp.displayName.toLowerCase()}s like ${sp.social.minGroup} or more together. Release them together, or move one in first.` };
  }
  if (ctx.lastReleaseDay !== undefined && ctx.day < ctx.lastReleaseDay + ctx.cooldownDays) {
    return { ok: false, reason: `The wild took a ${sp.displayName} on park day ${ctx.lastReleaseDay + 1}; it takes the next one in ${days(ctx.lastReleaseDay + ctx.cooldownDays - ctx.day)}.` };
  }
  return { ok: true, reason: `${a.name} is ready for the wild: pack it in its carrier and let it out in ${dimensionName(sp.homeDimension)}, far from the park, ${groundText(sp)}.` };
}

/**
 * Is this the right place to let the animal out? `ctx`: { species, dimensionId, insidePark,
 * distance (blocks from the park centre in the park's dimension, Infinity elsewhere), ground
 * ({ id, isAir, isLiquid, lavaNear }), aboveFree (air above the ground block) }.
 * @returns {{ ok: boolean, reason: string }}
 */
export function siteCheck(ctx, B) {
  const sp = ctx.species;
  if (ctx.dimensionId !== sp.homeDimension) return { ok: false, reason: `A ${sp.displayName} belongs in ${dimensionName(sp.homeDimension)}: let it out there.` };
  if (ctx.insidePark) return { ok: false, reason: "Not inside the park: the wild starts beyond the park boundary." };
  if (ctx.distance < B.minDistance) return { ok: false, reason: `Too close to the park: at least ${B.minDistance} blocks from the park centre (${Math.round(ctx.distance)} now).` };
  if (!groundOk(sp, ctx.ground)) return { ok: false, reason: `A ${sp.displayName} is let out ${groundText(sp)}.` };
  if (!(sp.lavaSwimmer || sp.lavaWalker) && !ctx.aboveFree) return { ok: false, reason: "The block above has to be free." };
  return { ok: true, reason: "A good spot." };
}

// More guests a day for the park's reputation: a little per release, up to a cap.
export function guestBoost(count, B) {
  return Math.min(B.guestsCap, count * B.guestsPerRelease);
}

// Totals from the release records: { count, zooBorn, species: { id: n }, speciesCount, lastDay: { id: day } }.
export function summarize(releases) {
  const out = { count: 0, zooBorn: 0, species: {}, speciesCount: 0, lastDay: {} };
  for (const r of releases) {
    out.count += 1;
    if (r.zooBorn) out.zooBorn += 1;
    out.species[r.speciesId] = (out.species[r.speciesId] ?? 0) + 1;
    if (out.lastDay[r.speciesId] === undefined || r.day > out.lastDay[r.speciesId]) out.lastDay[r.speciesId] = r.day;
  }
  out.speciesCount = Object.keys(out.species).length;
  return out;
}

// The conservation quest chain (spec phase 5 "conservation quests"), after the caretaker tutorial,
// alongside the End expedition: from a thriving group to animals returned to the wild.
export const CONSERVATION_STEPS = [
  { id: "notes", title: "Earn a care notes page", hint: "Watch one species, wild or in the zoo, until its Field Journal page shows care notes (two observations ticked)." },
  { id: "thrive", title: "Raise a thriving group", hint: "An exhibit with 2 or more grown-ups, every one at welfare 70 or more, and nothing orange or red on its Exhibit Clipboard." },
  { id: "born", title: "Welcome a zoo-born animal", hint: "Turn breeding on with the Exhibit Clipboard: a pair in a ready, well-run exhibit has young after a few park days." },
  { id: "release", title: "Release an animal to the wild", hint: "On an animal's page in the Exhibit Clipboard, choose Release to the wild: a settled, healthy grown-up goes into its carrier. Let it out in its home wilds, far from the park." },
  { id: "homegrown", title: "Release a zoo-born animal", hint: "A youngster born in the park, grown up and settled, let out where its kind lives: the whole loop." },
  { id: "three", title: "Return three species to the wild", hint: "Release animals of three different species." },
  { id: "science", title: "Research Reintroduction Science", hint: "At the Research Desk, after the Park Guidebook and one release: 4 paper, a book, a compass and 180 Zoo Coins." },
];

// What the park has done, from a plain view of it: levels (Field Journal level by species id),
// exhibits ({ animalIds, careWarnings }), animals ({ juvenile, ill, parents, location }),
// welfareOf(animal), releases (records with speciesId and zooBorn), researched (project ids).
export function conservationFacts(view, B) {
  const housed = view.animals.filter((a) => a.location.kind === "exhibit");
  const thriving = (ex) => {
    const adults = housed.filter((a) => a.location.id === ex.id && !a.juvenile);
    return adults.length >= 2 && adults.every((a) => !a.ill && view.welfareOf(a) >= B.welfareMin) && !(ex.careWarnings ?? []).some((w) => w.severity >= 2);
  };
  const sum = summarize(view.releases);
  return {
    notes: Object.values(view.levels).some((l) => l >= 2),
    thrive: view.exhibits.some(thriving),
    born: view.animals.some((a) => a.parents?.length) || sum.zooBorn > 0,
    release: sum.count > 0,
    homegrown: sum.zooBorn > 0,
    three: sum.speciesCount >= 3,
    science: view.researched.includes("reintroduction_science"),
  };
}
