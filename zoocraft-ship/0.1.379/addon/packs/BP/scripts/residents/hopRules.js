// Carrot among the rabbits (0.1.379; Austin, 25 Nov: "Carrot occupation, tries to blend in with the bunnies in the
// exhibit and hop around with them. If you see her doing this, you can make her leave for the day, or you can let her
// do that."). On her visit to the zoo she gets into an exhibit that has rabbits and hops from spot to spot among them.
// A player who talks to her there may send her home for the day or let her be. Her friendship reward at 40 is the
// Diamond Carrot: brewed into an Awkward Potion it makes One with the Rabbits ("jump boost X3 and swiftness X3 for 8
// minutes"). No engine calls here.

export const HOPPER = "carrot";
export const HOP_WHY = "hop";
export const RABBIT = "zoocraft:zoo_rabbit";
export const DIAMOND_CARROT = "zoocraft:diamond_carrot";
export const RABBIT_POTION = "zoocraft:potion_one_with_rabbits";
export const RABBIT_BREW = "one_with_rabbits";
/** The potion's two effects: the game's own Jump Boost III and Speed III (amplifier 2), eight minutes. */
export const RABBIT_EFFECTS = [
  { effect: "jump_boost", amplifier: 2 },
  { effect: "speed", amplifier: 2 },
];
export const RABBIT_SECONDS = 480;

/** Whether she may get in among the rabbits now. */
export function canHop(o) {
  return Boolean(o.parkOpen) && o.state === "visiting" && Boolean(o.gatherable) && !o.held && o.sentDay !== o.day && o.time >= o.g.from && o.time < o.g.to;
}

/** Whether she stays in: the park open, still daytime, rabbits still there, not sent home today. */
export function keepsHopping(o) {
  return Boolean(o.parkOpen) && o.rabbits > 0 && o.sentDay !== o.day && o.time >= o.g.from && o.time < o.g.to;
}

/** Her next landing: a land cell `g.min` to `g.max` blocks from where she is and no more than a block up or down. */
export function nextHop(land, at, g, random = Math.random) {
  const near = land.filter((c) => {
    const d = Math.hypot(c.x + 0.5 - at.x, c.z + 0.5 - at.z);
    return d >= g.min && d <= g.max && Math.abs(c.y - at.y) <= 1;
  });
  if (!near.length) return undefined;
  const c = near[Math.min(near.length - 1, Math.floor(random() * near.length))];
  return { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
}

/** Where she is `k` (0 to 1) of the way through a hop: a straight line with an arc `height` blocks high over it. */
export function hopAt(from, to, k, height) {
  const t = Math.max(0, Math.min(1, k));
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t + Math.sin(Math.PI * t) * height, z: from.z + (to.z - from.z) * t };
}

/** The way she faces for a hop (the game's yaw: 0 is +z, -90 is +x). */
export function hopYaw(from, to) {
  return (Math.atan2(-(to.x - from.x), to.z - from.z) * 180) / Math.PI + 0;
}
