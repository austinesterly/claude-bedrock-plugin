// The exotic islands' extras (0.1.284; Austin, 14 Nov: "make there be a fog whenever you are on the island", "there
// should also be some loot at the exotic items in barrels. Something that hints the mythical fishing island should be
// there as well"): the island's mist, and the Gilded Sea Chart from its barrel, which says where the Shark People's
// town is. Pure: no engine calls.

/** The exotic island's mist (RP/fogs/willow_isle_fog_setting.json) and its place on the player's fog stack. */
export const ISLE_FOG = "zoocraft:fog_willow_isle";
export const ISLE_FOG_TAG = "zoocraft_willow_isle";

/** The /fog commands that take a player from `was` (true, false, or null: not known yet) to `want`; none if no change. */
export function isleFogCommands(was, want) {
  if (was === want) return [];
  const out = [`fog @s remove ${ISLE_FOG_TAG}`];
  if (want) out.push(`fog @s push ${ISLE_FOG} ${ISLE_FOG_TAG}`);
  return out;
}

/** The chart, and its custom component. */
export const CHART = "zoocraft:gilded_sea_chart";
export const CHART_COMPONENT = "zoocraft:sea_chart";

const WAYS = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"];
/** The way from one spot to another, in words (east is +x, south is +z). */
export function wayTo(from, to) {
  const a = Math.atan2(to.z - from.z, to.x - from.x);
  return WAYS[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
}

/**
 * What the chart says (a chat line, never a title): where the nearest mythic island is from the reader in the fishing
 * sky, or, read anywhere else, where it is in that sky. `town` { x, z } or undefined.
 */
export function chartLine(from, town, inSky) {
  if (!town) return "§7The chart's ink has run. No golden city is marked near here.";
  if (!inSky) return `§6The chart shows a walled city of golden domes on a ring of sand, far out in the fishing sky, at x ${town.x}, z ${town.z}. §7Read it again out there for the way.`;
  const far = Math.round(Math.hypot(town.x - from.x, town.z - from.z));
  if (far < 80) return "§6The chart's golden city is here. You have found the Shark People's town.";
  return `§6The chart shows a walled city of golden domes on a ring of sand: about ${far} blocks to the ${wayTo(from, town)} of you, at x ${town.x}, z ${town.z}.`;
}
