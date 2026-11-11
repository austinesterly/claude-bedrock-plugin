// Jaylen's Hairline Painting (0.1.254; Austin's NPC Expansion spec: at 100/100 friendship "he unlocks the ability for
// that player to paint their own hairline"; the spec leaves the interface, the looks and the method open, so the
// styles, the colours and the head-slot wearable are ours, Austin's to change). A painted hairline is a wearable in
// the helmet slot: one item for each style in each colour, put on and wiped off at Jaylen's menu. No gold: he
// dislikes it. No engine calls here.

export const HAIRLINE = { resident: "jaylen", ability: "hairline", at: 100, prefix: "zoocraft:hairline_" };

// `front` is how many rows of the forehead are painted, column by column across the face (8 columns); `side` the same
// along the side of the head from the face backwards; `back` the rows painted on the back; `bolt` a zigzag left bare
// on the face and the sides.
export const HAIRLINE_STYLES = [
  { id: "lineup", name: "Sharp Line-Up", front: [2, 2, 2, 2, 2, 2, 2, 2], side: [2, 2, 5, 5, 4, 4, 4, 4], back: 4 },
  { id: "round", name: "Round Edge", front: [3, 2, 1, 1, 1, 1, 2, 3], side: [3, 3, 4, 4, 4, 4, 4, 4], back: 4 },
  { id: "peak", name: "Widow's Peak", front: [1, 1, 2, 3, 3, 2, 1, 1], side: [1, 2, 3, 4, 4, 4, 4, 4], back: 4 },
  { id: "bolt", name: "Lightning Bolt", front: [3, 3, 3, 3, 3, 3, 3, 3], side: [3, 3, 5, 5, 4, 4, 4, 4], back: 4, bolt: true },
];

export const HAIRLINE_COLOURS = [
  { id: "black", name: "Black", rgb: [30, 26, 28] },
  { id: "brown", name: "Brown", rgb: [94, 60, 38] },
  { id: "red", name: "Red", rgb: [156, 60, 36] },
  { id: "white", name: "White", rgb: [234, 234, 238] },
  { id: "diamond", name: "Diamond", rgb: [92, 218, 208] },
];

/** The item for a style in a colour. */
export const hairlineItem = (style, colour) => `${HAIRLINE.prefix}${style}_${colour}`;

/** Whether an item is a painted hairline. */
export const isHairline = (typeId) => typeof typeId === "string" && typeId.startsWith(HAIRLINE.prefix);

/** { style, colour } (the data entries) of a painted hairline's item, or undefined. */
export function hairlineOf(typeId) {
  if (!isHairline(typeId)) return undefined;
  const rest = typeId.slice(HAIRLINE.prefix.length);
  const style = HAIRLINE_STYLES.find((s) => rest.startsWith(`${s.id}_`));
  const colour = style && HAIRLINE_COLOURS.find((c) => rest === `${style.id}_${c.id}`);
  return style && colour ? { style, colour } : undefined;
}

/** Whether this player may paint their hairline: earned for good once, or at the friendship it takes. */
export function canPaint(bond, at = HAIRLINE.at) {
  return bond?.rewards?.[HAIRLINE.ability] !== undefined || (bond?.points ?? 0) >= at;
}

/**
 * What to do with what is on the player's head before painting: "paint" (bare, or a hairline to paint over),
 * "move" (a helmet that fits in the inventory goes there first) or "full" (a helmet and no room: nothing changes).
 */
export function headPlan(headTypeId, hasRoom) {
  if (!headTypeId || isHairline(headTypeId)) return "paint";
  return hasRoom ? "move" : "full";
}
