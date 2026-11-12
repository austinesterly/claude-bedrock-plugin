// Friendship (0.1.223, stage C: research/npc_spec_plan.md section 7): each player's with each resident, kept in the
// "bonds" collection apart from where the resident lives, so moving out, a lost body or a reload never loses it.
// Records keyed `${residentId}|${playerId}`: { id, res, player, name (the player's, for pages), points, talkDay,
// giftDay, liked, disliked (gift tags they've liked or not from this player), talks, gifts }. The rules are
// residents/bondRules.js.
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { GIFT_TAGS } from "../data/residents.js";
import { newBond, tierOf, chat, gift, giftTagsOf, fakeGift } from "./bondRules.js";

const COL = "bonds";

const keyOf = (resId, playerId) => `${resId}|${playerId}`;

/** A player's friendship with a resident (a fresh one, not yet stored, when they've never met). */
export function bondOf(resId, playerId) {
  return db.get(COL, keyOf(resId, playerId)) ?? { id: keyOf(resId, playerId), res: resId, player: playerId, ...newBond() };
}

/** The tier of a player's friendship with a resident (0 Stranger to 4 Best Friend). */
export function tierWith(resId, playerId) {
  return tierOf(bondOf(resId, playerId).points, BALANCE.residents.bonds);
}

/** The best friendship any player has with a resident, as a tier: what friendship does at the zoo goes by it. */
export function bestTier(resId) {
  const g = BALANCE.residents.bonds;
  let best = 0;
  for (const b of db.all(COL)) if (b.res === resId) best = Math.max(best, tierOf(b.points, g));
  return best;
}

function store(b, player) {
  db.put(COL, { ...b, id: keyOf(b.res, b.player), name: player?.name ?? b.name });
}

/** A friendship record stored as it is (0.1.226: a work gift kept or handed over, residents/workGifts.js). */
export function saveBond(b, player = undefined) {
  store(b, player);
}

/** A chat between a player and a resident on `day` (bondRules.js chat), stored. Returns chat's answer. */
export function haveChat(player, res, day) {
  const b = bondOf(res.id, player.id);
  const r = chat(b, res, day, BALANCE.residents.bonds);
  store({ ...r.bond, res: res.id, player: player.id }, player);
  return r;
}

/** Whether a player's gift to a resident would count today (one a day). */
export function giftedToday(resId, playerId, day) {
  return bondOf(resId, playerId).giftDay === day;
}

/**
 * A gift of an item (`typeId`) from a player on `day` (bondRules.js gift), stored when it counts. The caller takes the
 * item only when the answer is ok. 0.1.267: `name` the item's own name, if it has one (a renamed one is a fake too).
 */
export function giveGift(player, res, typeId, day, name) {
  const b = bondOf(res.id, player.id);
  const tags = giftTagsOf(typeId, GIFT_TAGS);
  if (fakeGift(typeId, name)) tags.push("fake");
  const r = gift(b, res, tags, day, BALANCE.residents.bonds);
  if (r.ok) store({ ...r.bond, res: res.id, player: player.id }, player);
  return r;
}

/** Bench and test only: a player's friendship points with a resident set outright. */
export function setPoints(resId, player, points) {
  const b = bondOf(resId, player.id);
  store({ ...b, points }, player);
}
