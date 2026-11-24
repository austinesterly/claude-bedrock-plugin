// Austin the resident's Prank Cam and VR Headset (0.1.366; his words 2026-11-23: "At level 60 he gives you a prank cam,
// you can place it anywhere you want, and you can use a VR headset to see what it sees"). Pure rules.

/** The way a cam looks, by the side its lens is on: the game's yaw (0 south, 90 west, 180 north, -90 east). */
export const CAM_YAW = { south: 0, west: 90, north: 180, east: -90 };

/** Where the lens is: the middle of the cam's block, at its lens height. */
export function lensOf(cam, g) {
  return { x: cam.x + 0.5, y: cam.y + g.lensHeight, z: cam.z + 0.5 };
}

/** How far a player is from a cam, in blocks. */
export function camDistance(pos, cam) {
  return Math.hypot(pos.x - (cam.x + 0.5), pos.y - cam.y, pos.z - (cam.z + 0.5));
}

/** The compass word from a player to a cam, for the list. */
export function camWay(pos, cam) {
  const dx = cam.x + 0.5 - pos.x;
  const dz = cam.z + 0.5 - pos.z;
  if (Math.hypot(dx, dz) < 2) return "here";
  const ns = dz < 0 ? "north" : "south";
  const ew = dx < 0 ? "west" : "east";
  if (Math.abs(dx) > 2 * Math.abs(dz)) return ew;
  if (Math.abs(dz) > 2 * Math.abs(dx)) return ns;
  return `${ns}-${ew}`;
}

/** The cams a headset can show: same dimension, within g.range, nearest first, each with its number and words. */
export function camsFor(cams, dimension, pos, g) {
  return cams
    .filter((c) => c.dimension === dimension)
    .map((c) => ({ cam: c, far: camDistance(pos, c) }))
    .filter((x) => x.far <= g.range)
    .sort((a, b) => a.far - b.far || a.cam.n - b.cam.n)
    .map((x) => ({ ...x, text: `Prank Cam ${x.cam.n}\n§8${Math.round(x.far)} blocks ${camWay(pos, x.cam)}` }));
}

/** The next cam's number: one more than the highest so far. */
export function nextCamNumber(cams) {
  return cams.reduce((n, c) => Math.max(n, c.n ?? 0), 0) + 1;
}

/** Why a view ends, or undefined to keep watching. */
export function viewEnds(v, g) {
  if (!v.camThere) return "gone";
  if (v.sneaking) return "off";
  if (v.dimension !== v.cam.dimension) return "far";
  if (camDistance(v.pos, v.cam) > g.range + g.slack) return "far";
  if (v.hurt) return "hurt";
  return undefined;
}

export const VIEW_TEXT = {
  none: "§eNo Prank Cam close enough. Place one, and stay within {range} blocks of it.",
  on: "§7You are watching §fPrank Cam {n}§7. Look around to turn it. §fSneak§7 to take the headset off.",
  off: "§7You take the headset off.",
  gone: "§eThat Prank Cam is gone. You take the headset off.",
  far: "§eYou are too far from that Prank Cam. You take the headset off.",
  hurt: "§eSomething hurt you. You take the headset off.",
};
