// Work gifts (0.1.226, stage E of Austin's residents spec, section 9: research/npc_spec_plan.md section 10), pure. A
// resident who is productive, happy and friendly enough sometimes keeps a gift from their job for a player: after a
// good shift at a Work Anchor site (Dave, Paola, Ron), or for the others with a job, after a happy zoo visit. It waits
// with that player's friendship (residents/bonds.js) until the player talks to them; they never come to hand it over.
// One waits at a time for each player, and after one is handed over the next can't be kept for g.cooldownDays.

/** A resident's table of work gifts (data/workGifts.js), by their `giftTable` or their occupation, or undefined. */
export function giftTableOf(res, tables) {
  return tables[res?.giftTable ?? res?.occupation ?? ""];
}

/** Whether a worker of this skill (undefined: not a site worker) and friendship tier may get a table entry. */
export function entryFits(entry, skill, tier) {
  const o = entry[4] ?? {};
  if (o.skill !== undefined && (skill ?? -1) < o.skill) return false;
  if (o.tier !== undefined && tier < o.tier) return false;
  return true;
}

/** One gift from a table for a worker of this skill and friendship tier: { item, count }, or undefined. */
export function rollGift(table, skill, tier, random = Math.random) {
  const fits = (table ?? []).filter((e) => entryFits(e, skill, tier));
  const total = fits.reduce((a, e) => a + e[3], 0);
  if (!total) return undefined;
  let r = random() * total;
  let pick = fits[fits.length - 1];
  for (const e of fits) {
    r -= e[3];
    if (r < 0) {
      pick = e;
      break;
    }
  }
  return { item: pick[0], count: pick[1] + Math.floor(random() * (pick[2] - pick[1] + 1)) };
}

/**
 * Whether a player's friendship (`bond`) with a resident may keep a new gift on `day`: Friend or closer, none waiting,
 * none kept today, and g.cooldownDays since the last was handed over.
 */
export function mayKeep(bond, tier, day, g) {
  if (tier < g.minTier || bond?.pending) return false;
  if (bond?.keptDay === day) return false;
  if (bond?.gotDay !== undefined && day - bond.gotDay < g.cooldownDays) return false;
  return true;
}

/** How likely a gift is kept for a player of this tier (g.chance by tier, a generous resident g.generousBonus more). */
export function keepChance(tier, res, g) {
  const c = g.chance[Math.min(g.chance.length - 1, tier)] ?? 0;
  return Math.min(1, c + (res?.traits?.includes("generous") ? g.generousBonus : 0));
}

/** Whether a resident's day earns a gift: why "work" (a good shift, mood at least g.workMood) or "day" (a visit). */
export function earns(why, mood, g) {
  return why === "work" ? mood >= g.workMood : why === "day" ? mood >= g.dayMood : false;
}

const SPEC_LINE = "I found something extra while working. Thought you might like it.";

/** What they say handing it over: their own workGift lines (data/residents.js), else the spec's line. */
export function giftWords(res, random = Math.random) {
  const own = res?.lines?.workGift;
  return own?.length ? own[Math.floor(random() * own.length)] : SPEC_LINE;
}
