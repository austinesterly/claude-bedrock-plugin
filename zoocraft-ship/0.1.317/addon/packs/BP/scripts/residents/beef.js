// The dragon's bait, in the game (0.1.317; the rules are residents/beefRules.js; Austin's NPC #27 spec, friendship 80).
// A player who was asked and carries 64 Raw Beef talks to Darian: he takes it, the pieces float up over his head, circle
// and join into the Giant Beef, which the player is handed. Used on a block near the lit Void Portal it hangs there as
// a 3 by 3 by 3 block of beef, and Darian comes to stand by the portal. Breaking it takes it down whole, as the item.
// Nothing is written on the screen; Darian speaks in chat.
import { world, system, ItemStack, ListBlockVolume } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { log, reportError } from "../core/log.js";
import { message } from "../platform/mc.js";
import { residentById } from "../data/residents.js";
import { bondOf } from "./bonds.js";
import { bondLine } from "./bondRules.js";
import { questHas, markQuest, questRecord, setQuest } from "./darian.js";
import { DARIAN_ID } from "./darianRules.js";
import { getResident, postResident, unpostResident, residentHeld } from "./residents.js";
import { BEEF, GIANT_BEEF, GIANT_BEEF_BLOCK, BEEF_PIECE, BEEF_SHOW, CUT, CUT_PIECES, takePlan, beefCentre, beefCells, hangCheck, postSpot, piecePos, corePos } from "./beefRules.js";

const K = () => BALANCE.darian.beef;
/** The cutscene under way: { playerId, t (-1: waiting for the talk to close), waited, pieces, show, handle } */
let cut;
const lastUse = new Map();

function say(player, key) {
  const res = residentById(DARIAN_ID);
  message(player, `§f${res?.name ?? "Darian"}: §7"${bondLine(res, key)}"`);
}

function hand(player, stack) {
  let left = stack;
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    left = c ? c.addItem(stack) : stack;
  } catch {
    left = stack;
  }
  if (left) {
    try {
      player.dimension.spawnItem(left, player.location);
    } catch {
      return false; // the player has gone
    }
  }
  return true;
}

function puff(d, at) {
  try {
    for (const up of [-0.4, 0.3, 1]) d.spawnParticle("minecraft:mob_portal", { x: at.x, y: at.y + up, z: at.z });
    d.playSound("mob.endermen.portal", at, { volume: 0.7 });
  } catch {
    // nobody there to see it
  }
}

function endCut() {
  if (!cut) return;
  for (const e of [...cut.pieces, cut.show]) {
    try {
      if (e?.isValid) e.remove();
    } catch {
      // gone already
    }
  }
  system.clearRun(cut.handle);
  cut = undefined;
}

function stepCut() {
  const c = cut;
  if (!c) return;
  try {
    const rec = getResident(DARIAN_ID);
    if (!rec) return endCut();
    const d = world.getDimension(rec.dimension);
    const head = { x: rec.pos.x, y: rec.pos.y + 2, z: rec.pos.z };
    if (c.t < 0) {
      // not while his words are still on the screen
      c.waited += 1;
      if (residentHeld(DARIAN_ID) && c.waited < 600) return;
      for (let i = 0; i < CUT_PIECES; i++) c.pieces.push(d.spawnEntity(BEEF_PIECE, { x: head.x, y: head.y - 0.6, z: head.z }));
      puff(d, head);
      c.t = 0;
    }
    const joined = CUT.rise + CUT.circle + CUT.gather;
    if (c.t < joined) {
      for (let i = 0; i < c.pieces.length; i++) {
        const p = piecePos(i, c.t, head);
        const e = c.pieces[i];
        if (p && e?.isValid) e.teleport(p);
      }
    } else if (c.t === joined) {
      for (const e of c.pieces) if (e?.isValid) e.remove();
      c.pieces = [];
      const core = corePos(head);
      c.show = d.spawnEntity(BEEF_SHOW, { x: core.x, y: core.y - 1.5, z: core.z });
      puff(d, core);
    } else if (c.t >= joined + CUT.show) {
      const player = world.getAllPlayers().find((p) => p.id === c.playerId);
      const core = corePos(head);
      endCut();
      if (!player || questHas("GIANT_BEEF_CREATED")) return; // the player left: Darian makes it when they next talk
      puff(d, core);
      if (!hand(player, new ItemStack(GIANT_BEEF, 1))) return;
      markQuest("GIANT_BEEF_CREATED");
      say(player, "beefMade");
      return;
    }
    c.t += 1;
  } catch (error) {
    // the land went from under it: he makes it when they next talk
    log(`darian: the beef cutscene stopped: ${error}`);
    endCut();
  }
}

function startCut(player) {
  if (cut) return;
  cut = { playerId: player.id, t: -1, waited: 0, pieces: [], show: undefined, handle: system.runInterval(stepCut, 1) };
}

/**
 * A player talks to a resident (residents/rewards.js, before their rewards): Darian takes the 64 Raw Beef he asked
 * this player for, and the cutscene begins; or he makes the Giant Beef he was kept from making (the world closed).
 */
export function beefTalk(player, res) {
  if (res?.id !== DARIAN_ID) return;
  try {
    if (questHas("BEEF_DELIVERED")) {
      if (!questHas("GIANT_BEEF_CREATED")) startCut(player);
      return;
    }
    if (!questHas("BEEF_REQUESTED") || bondOf(res.id, player.id)?.rewards?.beef_request === undefined) return;
    const c = player.getComponent("minecraft:inventory")?.container;
    if (!c) return;
    const stacks = [];
    for (let i = 0; i < c.size; i++) stacks.push(c.getItem(i));
    const plan = takePlan(stacks, BEEF, K().count);
    if (!plan) return;
    for (const { slot, amount } of plan) {
      if (amount === 0) c.setItem(slot, undefined);
      else {
        const it = /** @type {ItemStack} */ (stacks[slot]);
        it.amount = amount;
        c.setItem(slot, it);
      }
    }
    markQuest("BEEF_DELIVERED");
    startCut(player);
  } catch (error) {
    reportError("darian beef", error);
  }
}

function blockId(d, p) {
  try {
    return d.getBlock(p)?.typeId;
  } catch {
    return undefined;
  }
}

const WHY = {
  created: "§7This is not the bait Darian made.",
  portal: "§7The Giant Beef hangs near the lit Void Portal. There is no lit Void Portal yet.",
  dimension: "§7The Giant Beef hangs near the lit Void Portal, and that is not in this dimension.",
  far: "§7Too far from the Void Portal. Hang the Giant Beef within 16 blocks of it.",
  room: "§7The Giant Beef needs a clear space 3 blocks wide, long and tall beyond the block you use it on.",
  hung: "§7The Giant Beef is hung already.",
};

/**
 * Hangs the Giant Beef against the face of the block a player used it on. Returns "ok", or why not (beefRules.js
 * hangCheck, or "hung").
 */
export function hangBeef(player, block, face) {
  const d = block.dimension;
  const q = questRecord();
  const c = beefCentre(block.location, face);
  const why = q.beef ? "hung" : hangCheck(c, { created: questHas("GIANT_BEEF_CREATED"), portal: q.portal, dimension: d.id, air: (p) => blockId(d, p) === "minecraft:air" }, K());
  if (why !== "ok") {
    message(player, WHY[why]);
    return why;
  }
  const cells = beefCells(c);
  d.fillBlocks(new ListBlockVolume(cells), GIANT_BEEF_BLOCK, { blockFilter: { includeTypes: ["minecraft:air"] } });
  try {
    // the one there is goes, in creative too
    const inv = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; inv && i < inv.size; i++) {
      if (inv.getItem(i)?.typeId !== GIANT_BEEF) continue;
      inv.setItem(i, undefined);
      break;
    }
  } catch {
    // the player let go of it
  }
  setQuest({ beef: { d: d.id, x: c.x, y: c.y, z: c.z, day: world.getDay() } });
  markQuest("GIANT_BEEF_PLACED");
  try {
    d.playSound("random.pop", c, { volume: 1 });
  } catch {
    // no sound, no matter
  }
  // Darian comes to stand by the portal, beside the player
  const inBeef = new Set(cells.map((p) => `${p.x},${p.y},${p.z}`));
  const solid = (id) => id !== undefined && id !== "minecraft:air" && id !== "minecraft:water" && id !== "minecraft:lava" && id !== "zoocraft:void_portal";
  const stand = (x, y, z) => solid(blockId(d, { x, y: y - 1, z })) && blockId(d, { x, y, z }) === "minecraft:air" && blockId(d, { x, y: y + 1, z }) === "minecraft:air" && !inBeef.has(`${x},${y},${z}`) && !inBeef.has(`${x},${y + 1},${z}`);
  if (postResident(DARIAN_ID, d.id, postSpot(player.location, stand))) say(player, "beefUp");
  return "ok";
}

/** The Giant Beef item's custom component (zoocraft:giant_beef): use it on a block near the lit Void Portal. */
export function giantBeefComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseOnEvent} e */
    onUseOn(e) {
      const player = /** @type {import("@minecraft/server").Player} */ (e.source);
      const block = e.block;
      const face = /** @type {any} */ (e.blockFace);
      if (!player || !block) return;
      const now = system.currentTick;
      if (now - (lastUse.get(player.id) ?? -100) < 10) return; // a held button asks once
      lastUse.set(player.id, now);
      system.run(() => {
        try {
          if (block.isValid) hangBeef(player, block, face);
        } catch (error) {
          reportError("darian beef", error);
        }
      });
    },
  };
}

/**
 * The hung Giant Beef comes down whole (a player broke a block of it): its blocks go, the item goes to that player (or
 * drops where it hung), and Darian goes home. Returns whether there was one.
 */
export function takeDownBeef(player) {
  const b = questRecord().beef;
  if (!b) return false;
  const d = world.getDimension(b.d);
  try {
    d.fillBlocks(new ListBlockVolume(beefCells(b)), "minecraft:air", { blockFilter: { includeTypes: [GIANT_BEEF_BLOCK] } });
  } catch (error) {
    reportError("darian beef", error);
  }
  setQuest({ beef: undefined });
  const stack = new ItemStack(GIANT_BEEF, 1);
  if (!player || !hand(player, stack)) {
    try {
      d.spawnItem(stack, { x: b.x + 0.5, y: b.y, z: b.z + 0.5 });
    } catch {
      // unloaded: it is lost with the land
    }
  }
  unpostResident(DARIAN_ID);
  if (player) message(player, "§7The Giant Beef comes down in one piece. Hang it again near the Void Portal.");
  return true;
}

export function wireBeef() {
  world.afterEvents.playerBreakBlock.subscribe((e) => {
    if (e.brokenBlockPermutation.type.id !== GIANT_BEEF_BLOCK) return;
    const at = e.block.location;
    const b = questRecord().beef;
    if (!b || b.d !== e.dimension.id || Math.abs(at.x - b.x) > 1 || Math.abs(at.y - b.y) > 1 || Math.abs(at.z - b.z) > 1) return;
    system.run(() => takeDownBeef(e.player));
  });
  world.afterEvents.playerLeave.subscribe((e) => lastUse.delete(e.playerId));
}

/** For the test server. */
export function beefDebug() {
  return { cut: cut ? { t: cut.t, waited: cut.waited, pieces: cut.pieces.length, show: Boolean(cut.show) } : undefined, beef: questRecord().beef };
}
