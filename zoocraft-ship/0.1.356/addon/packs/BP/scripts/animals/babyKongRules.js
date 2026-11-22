// Baby Kong (0.1.356). Austin (2026-11-22): the Mysterious Egg hatches Baby Kong in the Acufend Incubator. "Baby Kong
// should be able to be put on the zoo exhibit, and he likes to be raised with the normal gorillas in the zoo. Then
// when he gets big enough, he wants to move out to his own exhibit where he can jump around".
// He is a zoo gorilla with `kong: true` on his record: young, he lives in the troop as any infant does; grown, he
// is bigger than a silverback, fights nobody and fathers nobody, wants an exhibit to himself, and leaps about it.
// Pure rules; numbers: BALANCE.babyKong.

export const KONG_PROP = "zoocraft:kong"; // the mob's look: 0 a gorilla, 1 Baby Kong, 2 Kong grown
export const BABY_NAME = "Baby Kong";
export const GROWN_NAME = "Kong";
export const isKong = (a) => Boolean(a?.kong);
export const grownKong = (a) => Boolean(a?.kong && !a.juvenile);
export const kongLook = (a) => (!a?.kong ? 0 : a.juvenile ? 1 : 2);
/** What his record starts with, out of the egg. */
export const kongExtra = (K) => ({ kong: true, juvenile: true, juvenileDaysLeft: K.growDays, sex: "male", name: BABY_NAME });
/** Grown, "Baby Kong" is "Kong"; a name the player gave him stays. */
export const grownName = (name) => (name === BABY_NAME ? GROWN_NAME : name);

/**
 * His care, from the troop's (`ctx` as animals.js gives every gorilla; `others`: the other animals in his exhibit).
 * Grown with company: never comfortable (ctx.troop false: the rivals' cap). Grown alone: not lonely.
 */
export function kongCare(a, ctx, others, social) {
  if (!grownKong(a)) return ctx;
  if (others > 0) return { ...ctx, troop: false };
  return { ...ctx, groupSize: Math.max(ctx.groupSize, social.minGroup) };
}

/** The clipboard's warnings for an exhibit holding him (`residents`: everyone in it, of any kind). */
export function kongWarnings(residents, W) {
  const out = [];
  for (const a of residents) {
    if (!a.kong) continue;
    const others = residents.filter((b) => b !== a);
    if (!a.juvenile && others.length) out.push({ severity: 2, text: W.wantsOwn.replace("{name}", a.name) });
    if (a.juvenile && !others.some((b) => !b.juvenile && !b.kong && b.speciesId === a.speciesId)) out.push({ severity: 1, text: W.wantsTroop.replace("{name}", a.name) });
  }
  return out;
}

/** The clipboard's line for him. */
export function kongLines(residents, W) {
  return residents.filter((a) => a.kong).map((a) => `§d${a.name}: §7${a.juvenile ? W.lineYoung : residents.length > 1 ? W.lineCrowded : W.lineOwn}`);
}

/**
 * Where he leaps to: a floor cell of his exhibit K.leap[0] to K.leap[1] blocks off, no more than K.step up or down,
 * the way through the air clear (`clear(point)`: room for him there). `cells`: [{x, y, z}] to pick from, `rnd`: 0..1.
 * Returns { to, height } or undefined.
 */
export function leapTarget(from, cells, rnd, clear, K) {
  for (let i = 0; i < K.tries && cells.length; i++) {
    const c = cells[Math.floor(rnd() * cells.length)];
    const to = { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
    const d = Math.hypot(to.x - from.x, to.z - from.z);
    if (d < K.leap[0] || d > K.leap[1] || Math.abs(to.y - from.y) > K.step) continue;
    const height = K.height[0] + (K.height[1] - K.height[0]) * ((d - K.leap[0]) / (K.leap[1] - K.leap[0]));
    let ok = true;
    for (let s = 1; s <= K.samples && ok; s++) ok = clear(leapPoint(from, to, s / K.samples, height));
    if (ok) return { to, height };
  }
  return undefined;
}

/** A point of the leap, f 0..1: straight across, an arc `height` over the straight line at its middle. */
export function leapPoint(from, to, f, height) {
  return { x: from.x + (to.x - from.x) * f, y: from.y + (to.y - from.y) * f + 4 * height * f * (1 - f), z: from.z + (to.z - from.z) * f };
}

/** How long a leap takes, in ticks. */
export const leapTicks = (from, to, K) => Math.round(K.ticks[0] + (Math.hypot(to.x - from.x, to.z - from.z) / K.leap[1]) * (K.ticks[1] - K.ticks[0]));
