// Subject 10's cure, in the game (0.1.299; the rules: residents/cureRules.js). The world keeps one record,
// `cure:subject_10`, once she is cured; as the world loads it makes her Aurora again.
import { world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { residentById } from "../data/residents.js";
import { CHATS } from "../data/residentChats.js";
import { bondOf } from "./bonds.js";
import { setPortraitAs } from "../ui/talkRules.js";
import { talkWith } from "../ui/residentMenu.js";
import { CURE, isCured, cureCheck, applyCure } from "./cureRules.js";

const COL = "cure";

function become() {
  applyCure(residentById(CURE.resident), CHATS[CURE.resident]);
  setPortraitAs(CURE.resident, CURE.portrait);
}

/** As the world loads: cured before, she is Aurora. */
export function loadCure() {
  try {
    if (db.get(COL, CURE.resident)) become();
  } catch (err) {
    reportError("cure load", err);
  }
}

/** Whether this is the potion on her (main.js asks before her menu opens). */
export const isCureUse = (held, residentId) => held === CURE.item && residentId === CURE.resident;

/** A player uses a Potion of Life on her body. */
export function usePotionOn(player, body) {
  try {
    const res = residentById(CURE.resident);
    if (!res || !player.isValid || !body.isValid) return;
    const what = cureCheck({ cured: isCured(), points: bondOf(CURE.resident, player.id).points }, BALANCE.residents.bonds.max);
    if (what === "already") return message(player, `§e${res.name}: §fI'm me again already, thanks to you. Keep that one safe.`);
    if (what === "notYet") return message(player, `§e${res.name}: §fIs that... no. I can't take it yet. I need to trust someone with all of me first. §7(She must be your best friend: ${BALANCE.residents.bonds.max} friendship.)`);
    const inv = player.getComponent("minecraft:inventory")?.container;
    const slot = player.selectedSlotIndex;
    const held = inv?.getItem(slot);
    if (!inv || held?.typeId !== CURE.item) return;
    inv.setItem(slot, undefined);
    db.put(COL, { id: CURE.resident, day: world.getDay(), by: player.id });
    become();
    body.setProperty("zoocraft:who", res.look);
    body.nameTag = res.name;
    try {
      body.dimension.spawnParticle("minecraft:totem_particle", { x: body.location.x, y: body.location.y + 1, z: body.location.z });
      body.dimension.playSound("random.totem", body.location, { volume: 0.7 });
    } catch {
      // no show
    }
    for (const p of world.getPlayers()) message(p, "§aThe Potion of Life works. Subject 10 is human again. Her name is Aurora.");
    talkWith(player, CURE.resident);
  } catch (err) {
    reportError("cure", err);
  }
}
