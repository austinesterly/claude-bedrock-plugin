// Breeding, juveniles and population control (spec section 9), as pure rules. Breeding is opt-in
// per exhibit. A pair starts expecting only with a compatible adult female and male (abstract
// records: parents and their young, or brothers and sisters, don't pair), room reserved for the
// young, food in the feeders, a sheltered corner, and good care for a couple of park days in a
// row; then the exhibit rests for a while after each birth. Births never pay money (spec: no
// automatic profit per newborn). The runtime side is animals/nursery.js.
// Nesting birds (flamingos, 0.1.72, species.nest) pair only in a flock: nest.flock grown-ups or more
// (Flock Mirrors make a small flock feel bigger), with mud to nest on at the water's edge (nest.sites,
// exhibits/geometry.js countShore) and, for a pink species, every grown-up rosy (animals/flamingoRules.js).
// Harems (zebras, 0.1.74, species.harem): one stallion with the mares. Two or more grown stallions with
// grown mares are rivals: they fight, and nobody breeds until the others go to a bachelor group.
// Prides (lions, 0.1.75, species.manes): a coalition of up to ctx.coalitionMax grown males with the
// lionesses; more males than that fight, and nobody breeds. A litter is br.litter to br.litterMax young
// (lions 1 to 3 cubs), as many as the group and the exhibit have room for (the check's `litter`).
// Solitary species (tigers, 0.1.76, species.solitary): grown ones loose together fight (ctx.clash), and a
// pair breeds only within ctx.introWindow park days of an introduction day, when the two were let out of
// their dens together (ctx.intro: { day, ids }, animals/tigerTurns.js). It's that pair that breeds.

// An animal's sex: stored on the record; a species whose coat shows it (deer: doe or buck) follows
// the coat; animals caught before breeding existed get a fixed one from their id.
export function sexOf(a, species) {
  if (a.sex) return a.sex;
  if (species?.sexByCoat) return species.sexByCoat[a.coat] ?? "female";
  let h = 0;
  for (const c of String(a.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 2 ? "male" : "female";
}

// Parent and young, or young of the same mother, never pair.
export function related(a, b) {
  const pa = a.parents ?? [];
  const pb = b.parents ?? [];
  return pa.includes(b.id) || pb.includes(a.id) || (pa.length > 0 && pa[0] === pb[0]);
}

export function findPair(animals, species) {
  const adults = animals.filter((a) => !a.juvenile && !a.ill && !a.expecting);
  const females = adults.filter((a) => sexOf(a, species) === "female");
  const males = animals.filter((a) => !a.juvenile && !a.ill && sexOf(a, species) === "male");
  for (const mother of females) for (const father of males) if (!related(mother, father)) return { mother, father };
  return undefined;
}

// Rival stallions (species.harem): two or more grown males in a group with grown females. A bachelor
// group (no mares) is no trouble, and nor is one stallion with his mares. Returns the males, or none.
export function rivalStallions(animals, species) {
  const grown = animals.filter((a) => !a.juvenile);
  const males = grown.filter((a) => sexOf(a, species) === "male");
  return males.length >= 2 && grown.length > males.length ? males : [];
}

// Young take part of an adult's space and food.
export function populationWeight(animals, juvenileWeight) {
  return animals.reduce((n, a) => n + (a.juvenile ? juvenileWeight : 1), 0);
}

export function shelterNeeded(usableArea, B) {
  return Math.max(B.shelterMin, Math.ceil(usableArea * B.shelterFraction));
}

export function hasShelter(ex, B) {
  return ex.coveredCells !== undefined && ex.coveredCells >= shelterNeeded(ex.usableArea, B);
}

// How big a flock feels to nesting birds: the grown-ups, each Flock Mirror adding nest.mirrorBirds more,
// up to twice the flock (a mirror can't make one bird a flock).
export function flockFeel(grown, mirrors, nest) {
  return grown + Math.min(mirrors * nest.mirrorBirds, grown);
}

function nameList(list) {
  const n = list.map((a) => a.name);
  return n.length <= 2 ? n.join(" and ") : `${n[0]}, ${n[1]} and ${n.length - 2} more`;
}

function days(n) {
  return `${n} park day${n === 1 ? "" : "s"}`;
}

/**
 * Can this exhibit's animals start expecting? The first rule that fails explains itself.
 * @param {{ on: boolean, species: object, animals: object[], state: string, usable: number,
 *   required: (population: number) => number, foodDays: number, coveredCells?: number,
 *   usableArea: number, goodDays: number, day: number, cooldownUntil: number,
 *   welfareOf: (a: object) => number, plural: string, issue?: string, mirrors?: number,
 *   nestSites?: number, pinkOf?: (a: object) => number, coalitionMax?: number, clash?: number,
 *   intro?: { day: number, ids: string[] }, introEvery?: number, introWindow?: number }} ctx
 *   coalitionMax: prides (lions) only: the most grown males with the lionesses
 *   clash, intro, introEvery, introWindow: solitary species (tigers) only: how many grown ones are loose
 *   together and fighting (0: none), the last introduction day and who met, how often they come round
 *   and how long after one a pair can breed
 *   issue: the exhibit's first problem (crowding, missing water...), if any
 *   mirrors, nestSites, pinkOf: nesting birds only (species.nest): the Flock Mirrors serving the exhibit,
 *   its nest sites (mud right beside the water), and a grown-up's shade (0 rosy)
 * @returns {{ ok: boolean, ready?: boolean, reason: string, pair?: object, litter?: number, expecting?: object, resting?: boolean }}
 *   ready: every rule but the run of good days holds (the daily step counts those days)
 */
export function breedingCheck(ctx, B) {
  const sp = ctx.species;
  const br = sp?.breeding;
  if (!br) return { ok: false, reason: "This species doesn't breed in the zoo yet." };
  if (!ctx.on) return { ok: false, reason: "Breeding is off." };
  const mother = ctx.animals.find((a) => a.expecting);
  if (mother) return { ok: false, expecting: mother, reason: sp.nest ? `${mother.name} is nesting: the egg hatches in ${days(mother.expecting.daysLeft)}.` : `${mother.name} is expecting: due in ${days(mother.expecting.daysLeft)}.` };
  if (ctx.day < ctx.cooldownUntil) return { ok: false, resting: true, reason: `Resting after the last birth: ${days(ctx.cooldownUntil - ctx.day)} to go.` };
  if (ctx.state !== "occupied") return { ok: false, reason: "The exhibit has to be enclosed and open first." };
  if (ctx.issue) return { ok: false, reason: `Fix the exhibit first: ${ctx.issue}` };
  const nest = sp.nest;
  if (nest) {
    const grown = ctx.animals.filter((a) => !a.juvenile).length;
    const mirrors = ctx.mirrors ?? 0;
    const feel = flockFeel(grown, mirrors, nest);
    if (feel < nest.flock) return { ok: false, reason: `${ctx.plural} nest only in a flock: ${nest.flock} or more grown-ups (now ${grown}${mirrors ? `, and ${mirrors} Flock Mirror${mirrors === 1 ? "" : "s"} make it feel like ${feel}` : ""}). A Flock Mirror at the water's edge makes a small flock feel bigger: each counts as ${nest.mirrorBirds} more, up to twice the flock.` };
  }
  if (sp.harem) {
    const rivals = rivalStallions(ctx.animals, sp);
    if (rivals.length) return { ok: false, reason: `${nameList(rivals)} fight over the mares: ${ctx.plural.toLowerCase()} breed in harems, one stallion with his mares. Move the other stallions to a bachelor group of their own (an exhibit with no mares).` };
  }
  if (sp.manes) {
    const most = ctx.coalitionMax ?? 2;
    const males = ctx.animals.filter((a) => !a.juvenile && sexOf(a, sp) === "male");
    if (males.length > most) return { ok: false, reason: `${nameList(males)}: too many males for one pride, they fight. A coalition of ${most} at most: move the others to an exhibit of their own.` };
  }
  if (sp.solitary && ctx.clash) return { ok: false, reason: `${ctx.clash} grown ${ctx.plural.toLowerCase()} are loose together and fighting: they live alone. Give each a Holding Den and they take turns out, one a park day.` };
  let pair = findPair(ctx.animals, sp);
  const able = ctx.animals.filter((a) => !a.juvenile && !a.ill);
  if (sp.solitary && able.some((a) => sexOf(a, sp) === "female" && !a.expecting) && able.some((a) => sexOf(a, sp) === "male")) {
    // Only the pair let out together on the last introduction day, and only for a while after it (if they're
    // related, they won't pair, and it says so).
    const every = ctx.introEvery ?? 4;
    const next = every - (((ctx.day % every) + every) % every);
    const met = ctx.intro && ctx.day - ctx.intro.day <= (ctx.introWindow ?? 2) ? ctx.intro.ids : [];
    const grown = (sex) => ctx.animals.find((a) => met.includes(a.id) && !a.juvenile && !a.ill && sexOf(a, sp) === sex && !(sex === "female" && a.expecting));
    const mother = grown("female");
    const father = grown("male");
    const when = next === every ? "today" : next === 1 ? "tomorrow" : `in ${days(next)}`;
    if (!mother || !father) return { ok: false, reason: `${ctx.plural} meet only to mate: on an introduction day (one park day in ${every}) a grown male and a tigress without cubs are let out of their dens together instead of taking turns, and for ${days(ctx.introWindow ?? 2)} after it they can breed. The next one is ${when}.` };
    if (related(mother, father)) return { ok: false, reason: `${mother.name} and ${father.name} met on the introduction day, but they're related: they won't pair.` };
    pair = { mother, father };
  }
  if (!pair) {
    const adults = ctx.animals.filter((a) => !a.juvenile);
    const f = adults.filter((a) => sexOf(a, sp) === "female").length;
    const m = adults.length - f;
    const why = f && m ? " Parents and their young, or brothers and sisters, won't pair; unwell animals wait until they're better." : "";
    return { ok: false, reason: `Needs an adult female and an adult male (now ${f} female and ${m} male adults).${why}` };
  }
  const max = sp.social.recommendedMax;
  if (ctx.animals.length + br.litter > max) return { ok: false, reason: `The group is full: ${max} is the most ${ctx.plural.toLowerCase()} for one exhibit. Move some to another exhibit first.` };
  const pop = populationWeight(ctx.animals, B.juvenileWeight) + br.litter * B.juvenileWeight;
  const need = Math.ceil(ctx.required(pop));
  if (ctx.usable < need) return { ok: false, reason: `No room for ${br.litter === 1 ? `a ${br.young}` : br.youngPlural}: with the young it needs ${need} usable blocks, the exhibit has ${ctx.usable}. Make it bigger or move an animal out.` };
  let litter = br.litter;
  while (litter < (br.litterMax ?? br.litter) && ctx.animals.length + litter + 1 <= max && ctx.usable >= Math.ceil(ctx.required(pop + B.juvenileWeight * (litter + 1 - br.litter)))) litter++;
  if (ctx.foodDays < B.minFoodDays) return { ok: false, reason: `Needs at least ${days(B.minFoodDays)} of food in the feeders (${ctx.foodDays.toFixed(1)} now).` };
  if (ctx.coveredCells === undefined) return { ok: false, reason: "Measure the exhibit again (Measure again, below) so its shelter can be counted." };
  const shelter = shelterNeeded(ctx.usableArea, B);
  if (ctx.coveredCells < shelter) return { ok: false, reason: `Needs a sheltered corner for the young: tree leaves or a roof over at least ${shelter} blocks of floor (${ctx.coveredCells} now).` };
  if (nest && ctx.nestSites === undefined) return { ok: false, reason: "Measure the exhibit again (Measure again, below) so its nest sites can be counted." };
  if (nest && ctx.nestSites < nest.sites) return { ok: false, reason: `Needs mud to nest on at the water's edge: at least ${nest.sites} mud blocks in the floor right beside the water (${ctx.nestSites} now). A water bottle on dirt makes mud.` };
  const pale = nest && sp.pink && ctx.pinkOf ? ctx.animals.filter((a) => !a.juvenile && ctx.pinkOf(a) > 0) : [];
  if (pale.length) return { ok: false, reason: `Every grown-up has to be rosy first: ${nameList(pale)} ${pale.length === 1 ? "isn't" : "aren't"} yet. Flamingo Pellets in a feeder they eat from turn them pinker every park day.` };
  const unhappy = ctx.animals.filter((a) => !a.juvenile).find((a) => a.ill || ctx.welfareOf(a) < B.welfareMin);
  if (unhappy) return { ok: false, reason: `Every adult needs welfare ${B.welfareMin} or more first (${unhappy.name} is ${ctx.welfareOf(unhappy)}${unhappy.ill ? ", unwell" : ""}).` };
  if (ctx.goodDays < B.goodDays) return { ok: false, ready: true, pair, litter, reason: `Everything is ready. Keep up the good care: ${ctx.goodDays} of ${days(B.goodDays)} in a row so far.` };
  return { ok: true, ready: true, pair, litter, reason: `${pair.mother.name} and ${pair.father.name} can start expecting.` };
}
