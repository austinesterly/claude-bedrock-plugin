// Zach the singer's nights on the zoo paths (0.1.370, residents/buskRules.js). When night falls and the park is open he
// is posted on a random block of the path network ("sing"), his open guitar case and fried chicken stand beside him
// (one prop entity, never saved), and sings Austin's own recording. The park's guests are drawn to his spot (guests.js
// journey spots), the ones standing by tip into the case, and every few minutes he walks the paths to a new spot. At
// dawn, or when the park closes, the case is counted into the park's Zoo Coins and he goes home.
import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { residentById } from "../data/residents.js";
import { getResident, postResident, unpostResident, movePosted, residentHeld, POST_STATE } from "./residents.js";
import { bondLine } from "./bondRules.js";
import { BUSKER, BUSK_WHY, BUSK_SONG, CHICKEN, isFriday, weekday, showTime, pickSpot, standSpot, tips, pullOf, moodKey, chickenCheck } from "./buskRules.js";
import { currentNetwork } from "../visitors/network.js";
import { nearestNode, routeSearch, waypoints, feetAt, walkStep } from "../visitors/routes.js";
import { earn, spend } from "../economy/economy.js";
import { coinsText } from "../economy/bankRules.js";
import { newId } from "../core/ids.js";
import { getPark, parkAt, parkById, withPark, can, denyText } from "../park/park.js";
import { sandboxOn } from "../park/rules.js";
import { dim, onlinePlayers, message, giveItem } from "../platform/mc.js";
import { show } from "../ui/forms.js";

const G = () => BALANCE.busk;
const STAND = ENTITIES.buskStand;
let hold = false; // 0.1.374: a show with the player is on: he stays where he is till it ends
let s; // this night's show: { phase: "sing" | "plan" | "walk", until, spot, ... }; never saved

const posted = (rec) => rec?.state === POST_STATE && rec.post?.why === BUSK_WHY;

/** 0.1.374: his show with the player (residents/concert.js) keeps him at his spot, and lets him go again. */
export function holdShow(on) {
  hold = Boolean(on);
  if (s && !hold) s.until = system.currentTick + G().stay;
}

/** Whether he is out singing now. */
export function buskingNow() {
  return posted(getResident(BUSKER));
}

function standEntity() {
  const e = s?.standId && world.getEntity(s.standId);
  return e?.isValid ? e : undefined;
}

function dropStand() {
  try {
    standEntity()?.remove();
  } catch {
    // already gone
  }
  if (s) s.standId = undefined;
}

function nearPlayers(rec, range) {
  const out = [];
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id === rec.dimension && Math.hypot(p.location.x - rec.pos.x, p.location.z - rec.pos.z) <= range) out.push(p);
    } catch {
      // leaving
    }
  }
  return out;
}

function say(rec, key) {
  const res = residentById(BUSKER);
  const text = `§f${res.name}: §7"${bondLine(res, key)}"`;
  for (const p of nearPlayers(rec, G().sayRange)) message(p, text);
}

// The case is counted: what the guests dropped in at this spot goes to the park.
function payOut(rec) {
  const coins = Math.floor(s?.case ?? 0);
  if (!s || coins <= 0) return;
  s.case = 0;
  const park = parkById(rec.parkId);
  if (park) withPark(park, () => earn(coins, "Zach's guitar case: donations", newId("busk")));
}

function topAt(d) {
  return (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      if (b && /_slab$/.test(b.typeId)) return b.permutation.getState("minecraft:vertical_half") === "top" ? 1 : 0.5;
    } catch {
      // unloaded: a full block
    }
    return 1;
  };
}

function newShow(now) {
  return { phase: "sing", until: now + G().stay, case: 0, nextSong: now + 20, nextBeat: now + G().beat, nextLine: now + G().lineEvery, seq: (s?.seq ?? 0) + 1 };
}

function end(rec) {
  payOut(rec);
  dropStand();
  s = undefined;
  unpostResident(BUSKER);
}

function start(rec, park, now) {
  const cur = currentNetwork();
  if (!cur?.net?.size || cur.dimension !== park.entrance?.dimension) return;
  const node = pickSpot(cur.net.columns, undefined, Math.random, G());
  if (!node) return;
  const feet = feetAt(node, topAt(dim(cur.dimension)));
  if (!postResident(BUSKER, cur.dimension, feet, BUSK_WHY)) return;
  s = newShow(now);
  const day = world.getDay();
  const res = residentById(BUSKER);
  for (const p of onlinePlayers()) message(p, isFriday(day) ? `§e${res.name} is singing on the zoo paths tonight. It's Friday night, and he is amped.` : `§7${res.name} is singing on the zoo paths tonight (${weekday(day)}).`);
}

function sing(rec, now) {
  const g = G();
  const d = dim(rec.dimension);
  const near = nearPlayers(rec, g.hear);
  // the case and the stand, while someone is near enough to see them
  if (near.length && !standEntity()) {
    try {
      const at = standSpot(rec.pos, rec.yaw ?? 0, g);
      const e = d.spawnEntity(STAND, at);
      e.setRotation({ x: 0, y: rec.yaw ?? 0 });
      s.standId = e.id;
    } catch {
      // not loaded yet
    }
  } else if (!near.length && s.standId) dropStand();
  if (near.length && now >= s.nextSong) {
    s.nextSong = now + g.songTicks;
    try {
      d.playSound(BUSK_SONG, { x: rec.pos.x, y: rec.pos.y + 1.5, z: rec.pos.z }, { volume: g.volume });
    } catch {
      // unloaded
    }
  }
  if (now >= s.nextBeat) {
    s.nextBeat = now + g.beat;
    let guests = 0;
    try {
      guests = d.getEntities({ type: ENTITIES.guest, location: rec.pos, maxDistance: g.crowd }).length;
    } catch {
      // unloaded: nobody is counted
    }
    const got = tips(guests, isFriday(world.getDay()), Math.random, g);
    if (got > 0) {
      s.case += got;
      if (now >= (s.nextTipSay ?? 0)) {
        s.nextTipSay = now + g.tipSayEvery;
        for (const p of nearPlayers(rec, g.sayRange)) message(p, `§7A guest drops ${coinsText(got)} in Zach's guitar case.`);
      }
    }
  }
  if (near.length && now >= s.nextLine) {
    s.nextLine = now + g.lineEvery;
    say(rec, moodKey(world.getDay()));
  }
  if (now >= s.until && !hold) {
    // on to the next spot: plan the walk over the paths
    const cur = currentNetwork();
    const from = cur?.dimension === rec.dimension ? nearestNode(cur.net, { x: Math.floor(rec.pos.x), y: Math.floor(rec.pos.y), z: Math.floor(rec.pos.z) }, 2) : undefined;
    const to = from ? pickSpot(cur.net.columns, rec.pos, Math.random, g) : undefined;
    if (!from || !to || (to.x === from.x && to.z === from.z)) {
      s.until = now + g.stay;
      return;
    }
    s.phase = "plan";
    s.search = routeSearch(cur.net, from, to, BALANCE.paths.maxNodes, g.searchPerTick);
  }
}

function plan(rec, now) {
  const r = s.search.next();
  if (!r.done) return;
  s.search = undefined;
  const route = r.value;
  if (!route || route.length < 2) {
    s.phase = "sing";
    s.until = now + G().stay;
    return;
  }
  payOut(rec);
  dropStand();
  s.route = waypoints(route).map((n) => feetAt(n, topAt(dim(rec.dimension))));
  s.wp = 1;
  s.phase = "walk";
}

function walk(rec, now) {
  const target = s.route[s.wp];
  if (!target) {
    const keep = { case: s.case, seq: s.seq };
    s = { ...newShow(now), case: keep.case };
    movePosted(BUSKER, rec.pos, rec.yaw, false);
    return;
  }
  const next = walkStep(rec.pos, target, G().walkSpeed * 2); // this runs every other tick
  movePosted(BUSKER, { x: next.x, y: next.y, z: next.z }, next.yaw, true);
  if (next.arrived) s.wp++;
}

/** Every other tick. */
export function tickBusking() {
  const now = system.currentTick;
  const rec = getResident(BUSKER);
  if (!rec) {
    if (s) dropStand();
    s = undefined;
    return;
  }
  const park = parkById(rec.parkId);
  const on = Boolean(park?.open && park.entrance) && showTime(world.getTimeOfDay(), G());
  if (!posted(rec)) {
    if (s) dropStand();
    s = undefined;
    if (on && now % 40 < 2 && rec.state === "inside" && !residentHeld(BUSKER)) start(rec, park, now);
    return;
  }
  if (!on) return hold ? undefined : end(rec); // a show with the player is ended by concert.js first
  if (!s) s = newShow(now); // the world was reloaded mid-show: he sings on where he stands
  if (residentHeld(BUSKER)) {
    s.until += 2; // someone is talking to him: he waits
    return;
  }
  if (s.phase === "sing") sing(rec, now);
  else if (s.phase === "plan") plan(rec, now);
  else walk(rec, now);
}

/** His spot as a place the park's guests may walk to (visitors/guests.js), pulling harder than any other. */
export function buskSpots(net, dimensionId) {
  const rec = getResident(BUSKER);
  if (!s || s.phase !== "sing" || !posted(rec) || rec.dimension !== dimensionId) return [];
  const at = { x: Math.floor(rec.pos.x), y: Math.floor(rec.pos.y), z: Math.floor(rec.pos.z) };
  const node = nearestNode(net, at, 2);
  return node ? [{ id: `busk:${s.seq}`, ...at, node, what: "busk", pull: pullOf(isFriday(world.getDay()), G()) * (hold ? G().showPull : 1) }] : [];
}

function parkHere(player) {
  try {
    return parkAt(player.dimension.id, player.location) ?? getPark();
  } catch {
    return getPark();
  }
}

/** Buys one piece of fried chicken for the player. Returns the line to tell them. */
export function buyChicken(player, park = parkHere(player)) {
  const res = residentById(BUSKER);
  const price = G().chicken.price;
  const sayLine = (k) => `§f${res.name}: §7"${bondLine(res, k)}"`;
  if (!park) return "§7There's no park here to pay from.";
  if (!can(player, "spend", park)) return denyText("spend", park);
  const free = sandboxOn(park);
  const poor = `${sayLine("chickenPoor")} §cFried chicken costs ${coinsText(price)} and the park has ${coinsText(park.balance ?? 0)}.`;
  if (chickenCheck(park.balance, price, free) === "poor") return poor;
  const paid = withPark(park, () => spend(player, price, "Zach: fried chicken", newId("busk")));
  if (!paid?.ok) return poor;
  giveItem(player, CHICKEN, 1);
  return `${sayLine("chickenDone")} §aYou buy a piece of fried chicken.`;
}

/** His merchandise store: fried chicken and nothing else. Open at his stand, and on his menu while he is out singing. */
export async function chickenShop(player) {
  const res = residentById(BUSKER);
  if (!res || !buskingNow()) return;
  const park = parkHere(player);
  const free = Boolean(park && sandboxOn(park));
  const g = G().chicken;
  const body = [`§f${res.name}: §7"${bondLine(res, "chickenLook")}"`, "", !park ? "§7There's no park here to pay from." : free ? "§7Free in sandbox." : `§7Paid from the park's Zoo Coins. The park has ${coinsText(park.balance ?? 0)}.`];
  const form = new ActionFormData()
    .title("Zach's Merch")
    .body(body.join("\n"))
    .button(`Fried chicken: ${free ? "free" : coinsText(g.price)}\n§8Restores ${g.bars} hunger bars`)
    .button("Close");
  const got = await show(player, form);
  if (got?.selection !== 0) return;
  message(player, buyChicken(player, park));
}

/** For the test server. */
export function buskDebug() {
  const rec = getResident(BUSKER);
  return {
    day: weekday(world.getDay()),
    time: world.getTimeOfDay(),
    state: rec?.state,
    why: rec?.post?.why,
    pos: rec?.pos && { x: Math.round(rec.pos.x * 10) / 10, y: rec.pos.y, z: Math.round(rec.pos.z * 10) / 10 },
    show: s && { phase: s.phase, left: s.until - system.currentTick, case: s.case, stand: Boolean(standEntity()), wp: s.wp, route: s.route?.length, seq: s.seq },
  };
}
/** For the test server: on to the next spot now. */
export function buskHurry() {
  if (s?.phase === "sing") s.until = 0;
}
