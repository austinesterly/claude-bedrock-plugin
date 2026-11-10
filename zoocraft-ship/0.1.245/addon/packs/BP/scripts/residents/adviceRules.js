// A resident's advice by friendship (0.1.245; Austin's NPC Expansion spec: Terra's knowledge unlocks in bands of
// friendship). The advice itself is data/residentAdvice.js. No engine calls here.

/** The bands a friendship has opened, and the next one still closed: { open: [band], next: band | undefined }. */
export function adviceFor(advice, points) {
  const p = points ?? 0;
  const bands = advice?.bands ?? [];
  return { open: bands.filter((b) => p >= b.at), next: bands.find((b) => p < b.at) };
}

/** The advice page's words for a friendship. */
export function adviceText(advice, points) {
  const { open, next } = adviceFor(advice, points);
  const parts = open.map((b) => `§f${b.name}\n§7${b.lines.join("\n")}`);
  if (next) parts.push(`§8At ${next.at} friendship: ${next.name.toLowerCase()}.`);
  return parts.join("\n\n");
}
