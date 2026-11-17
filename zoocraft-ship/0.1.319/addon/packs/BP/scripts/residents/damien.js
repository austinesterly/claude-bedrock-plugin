// Damien in the world (0.1.319; the rules and his words are residents/damienRules.js). The frozen wizard by the
// Overworld's Void Portal, his story, the player's choice, his exhibit, and his way into the village. His body
// (zoocraft:damien) is made from the quest record wherever a player is near: one of it, and strays go.
import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { log, reportError } from "../core/log.js";
import { message } from "../platform/mc.js";
import { show } from "../ui/forms.js";
import { talkTitle, talkInk, talkButton, portraitOf } from "../ui/talkRules.js";
import { talkScreenOn } from "../ui/residentMenu.js";
import { residentById } from "../data/residents.js";
import { insidePark } from "../park/park.js";
import { bondLine } from "./bondRules.js";
import { questHas, markQuest, questRecord, setQuest } from "./darian.js";
import { DARIAN_ID } from "./darianRules.js";
import { getResident, unpostResident, POST_STATE } from "./residents.js";
import { postSpot } from "./beefRules.js";
import { DAMIEN_ID, DAMIEN_BODY, EXHIBIT_KIT, PEN_FENCE, DAMIEN_LINES, PEN_TEXT, damienStage, hasBody, isFrozen, penPlan, penCheck, choicesAt } from "./damienRules.js";

const NEAR = 48; // a player this near his spot keeps his body there
const busy = new Set();
const lastUse = new Map();
let exhibitLine = 0;

const stage = () => damienStage(questRecord());
const dimOf = (id) => world.getDimension(id);

function blockId(d, p) {
  try {
    return d.getBlock(p)?.typeId;
  } catch {
    return undefined;
  }
}

function puff(d, at) {
  try {
    for (const up of [0.3, 1, 1.7]) d.spawnParticle("minecraft:mob_portal", { x: at.x, y: at.y + up, z: at.z });
    d.playSound("mob.endermen.portal", at, { volume: 0.7 });
  } catch {
    // nobody there to see it
  }
}

function bodies(d) {
  try {
    return d.getEntities({ type: DAMIEN_BODY });
  } catch {
    return [];
  }
}

function clearBodies(d, at) {
  for (const e of bodies(d)) {
    try {
      if (at) puff(d, e.location);
      e.remove();
    } catch {
      // gone already
    }
  }
}

/** His one body at his spot, as the spell has it: made if a player is near and it isn't there; any other goes. */
function keepBody(dm, st) {
  const d = dimOf(dm.d);
  let near = false;
  for (const p of world.getAllPlayers()) {
    if (p.dimension.id === dm.d && Math.hypot(p.location.x - dm.x, p.location.z - dm.z) <= NEAR) near = true;
  }
  if (!near) return;
  let mine;
  for (const e of bodies(d)) {
    const far = Math.hypot(e.location.x - dm.x, e.location.y - dm.y, e.location.z - dm.z);
    if (!mine && far < 4) mine = e;
    else e.remove();
  }
  if (!mine) {
    if (blockId(d, dm) === undefined) return; // the land isn't loaded yet
    mine = d.spawnEntity(DAMIEN_BODY, { x: dm.x, y: dm.y, z: dm.z });
  } else if (Math.hypot(mine.location.x - dm.x, mine.location.z - dm.z) > 0.6) {
    mine.teleport({ x: dm.x, y: dm.y, z: dm.z });
  }
  const frozen = isFrozen(st);
  if (mine.getProperty("zoocraft:frozen") !== frozen) {
    mine.setProperty("zoocraft:frozen", frozen);
    mine.triggerEvent(frozen ? "zoocraft:freeze" : "zoocraft:thaw");
  }
  if (frozen) {
    try {
      d.spawnParticle("zoocraft:frost_glint", { x: dm.x, y: dm.y + 1, z: dm.z });
    } catch {
      // nobody sees it
    }
  }
}

/** Where he is frozen: beside Darian at his post by the portal; else by the portal; else by a player back in the Overworld. */
function firstSpot() {
  const q = questRecord();
  const dar = getResident(DARIAN_ID);
  let anchor = dar?.state === POST_STATE ? { d: dar.dimension, ...dar.pos, darian: true } : q.portal ? { d: q.portal.d, x: q.portal.x, y: q.portal.y, z: q.portal.z } : undefined;
  let who;
  for (const p of world.getAllPlayers()) {
    if (anchor ? p.dimension.id === anchor.d && Math.hypot(p.location.x - anchor.x, p.location.z - anchor.z) <= 24 : p.dimension.id === "minecraft:overworld") who = who ?? p;
  }
  if (!who) return undefined;
  anchor = anchor ?? { d: who.dimension.id, ...who.location };
  const d = dimOf(anchor.d);
  if (blockId(d, anchor) === undefined) return undefined;
  const solid = (id) => id !== undefined && id !== "minecraft:air" && id !== "minecraft:water" && id !== "minecraft:lava" && id !== "zoocraft:void_portal" && id !== "zoocraft:giant_beef_block";
  const stand = (x, y, z) => solid(blockId(d, { x, y: y - 1, z })) && blockId(d, { x, y, z }) === "minecraft:air" && blockId(d, { x, y: y + 1, z }) === "minecraft:air";
  const at = postSpot(anchor, stand);
  return { d: anchor.d, x: at.x, y: at.y, z: at.z, darian: Boolean(anchor.darian) };
}

/** Every two seconds: his body kept where the quest record has him. */
export function tickDamien() {
  if (!questHas("DRAGON_TRANSFORMED")) return;
  const st = stage();
  let dm = questRecord().damien;
  if (!hasBody(st)) {
    // in the village: a resident now. A body left over (a world closed mid-change) goes.
    if (dm?.d) {
      clearBodies(dimOf(dm.d));
      setQuest({ damien: { state: "village" } });
    }
    return;
  }
  if (dm?.x === undefined) {
    const at = firstSpot();
    if (!at) return;
    dm = { state: "frozen", d: at.d, x: at.x, y: at.y, z: at.z };
    setQuest({ damien: dm });
    const d = dimOf(dm.d);
    puff(d, dm);
    const res = residentById(DARIAN_ID);
    for (const p of d.getPlayers({ location: dm, maxDistance: 48 })) {
      message(p, "§7A man all in black and white stands by the Void Portal, frozen to the spot.");
      if (at.darian) message(p, `§f${res?.name ?? "Darian"}: §7"${bondLine(res, "damienFrozen")}"`);
    }
    log(`damien: frozen at ${dm.d} ${dm.x} ${dm.y} ${dm.z}`);
  }
  keepBody(dm, st);
}

const said = (line, name = "The wizard") => `§f${name}: §7"${line}"`;

async function page(player, text, buttons) {
  const story = talkScreenOn();
  const ink = talkInk(story);
  const form = new ActionFormData().title(talkTitle("The wizard", story)).body(`${ink.say}"${text}"`);
  buttons.forEach((label, i) => form.button(talkButton(label, undefined, story), i === 0 && story ? portraitOf(DAMIEN_ID) : undefined));
  const r = await show(player, form);
  return r?.selection;
}

/** Darian, his watch over, goes home. */
function darianHome(player) {
  if (!unpostResident(DARIAN_ID)) return;
  const res = residentById(DARIAN_ID);
  message(player, `§f${res?.name ?? "Darian"}: §7"${bondLine(res, "damienSettled")}"`);
}

/** He joins the village: no body any more; he is unlocked as a resident and moves in as anyone does. */
function recruit(player, from) {
  const dm = questRecord().damien;
  if (dm?.d) clearBodies(dimOf(dm.d), true);
  setQuest({ damien: { state: "village" } });
  markQuest("DAMIEN_RECRUITED");
  message(player, said(from === "exhibit" ? DAMIEN_LINES.released : DAMIEN_LINES.joined));
  darianHome(player);
}

function kitCount(player) {
  let n = 0;
  try {
    const inv = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; inv && i < inv.size; i++) if (inv.getItem(i)?.typeId === EXHIBIT_KIT) n += 1;
  } catch {
    // the player has gone
  }
  return n;
}

function handKit(player) {
  if (kitCount(player)) return;
  const stack = new ItemStack(EXHIBIT_KIT, 1);
  try {
    const left = player.getComponent("minecraft:inventory")?.container?.addItem(stack);
    if (left) player.dimension.spawnItem(left, player.location);
  } catch {
    return;
  }
  message(player, "§7You have the Wizard's Exhibit Kit. Use it on the ground inside your zoo, where 5 by 5 blocks are flat and empty. He stays frozen here until then.");
}

async function talk(player) {
  let st = stage();
  if (st === "frozen") {
    for (const text of DAMIEN_LINES.reveal) if ((await page(player, text, ["Go on"])) === undefined) return;
    if (stage() === "frozen") markQuest("DAMIEN_REVEALED");
    st = stage();
  }
  for (let turn = 0; turn < 4; turn++) {
    const options = choicesAt(st);
    if (!options.length) return;
    const text = st === "revealed" ? (turn ? DAMIEN_LINES.mercyAgain : DAMIEN_LINES.mercy) : st === "sentenced" ? DAMIEN_LINES.sentenced : DAMIEN_LINES.exhibit[exhibitLine++ % DAMIEN_LINES.exhibit.length];
    if (st === "sentenced") handKit(player);
    const pick = await page(player, text, options.map((o) => o[1]));
    if (pick === undefined) return;
    if (stage() !== st) return; // someone else decided meanwhile
    const what = options[pick][0];
    if (what === "join") return recruit(player, st);
    if (what === "wait") {
      if (st === "exhibit") message(player, said(DAMIEN_LINES.left));
      return;
    }
    if (what === "exhibit") {
      setQuest({ damien: { ...questRecord().damien, state: "sentenced" } });
      handKit(player);
      return;
    }
    // "again": his story once more, then the choice
    for (const line of DAMIEN_LINES.reveal) if ((await page(player, line, ["Go on"])) === undefined) return;
    st = stage();
  }
}

/** A player used him. */
export async function damienTalk(player) {
  if (busy.has(player.id)) return;
  busy.add(player.id);
  try {
    await talk(player);
  } catch (error) {
    reportError("damien", error);
  } finally {
    busy.delete(player.id);
  }
}

/** The kit used on a block: his exhibit goes up round it and he is moved there. Returns "ok", or why not (penCheck). */
export function buildExhibit(player, block, face) {
  const d = block.dimension;
  const c = block.location;
  const plan = penPlan(c);
  const why = penCheck(c, {
    stage: stage(),
    face,
    inPark: (p) => insidePark(d.id, p),
    solid: (p) => {
      const id = blockId(d, p);
      return id !== undefined && id !== "minecraft:air" && id !== "minecraft:water" && id !== "minecraft:lava";
    },
    air: (p) => blockId(d, p) === "minecraft:air",
    players: d.getPlayers({ location: c, maxDistance: 8 }).map((p) => p.location),
  });
  if (why !== "ok") {
    message(player, PEN_TEXT[why]);
    return why;
  }
  for (const p of plan.fence) d.setBlockType(p, PEN_FENCE);
  const old = questRecord().damien;
  if (old?.d) clearBodies(dimOf(old.d), true);
  const dm = { state: "exhibit", d: d.id, x: plan.stand.x, y: plan.stand.y, z: plan.stand.z };
  setQuest({ damien: dm });
  markQuest("DAMIEN_EXHIBITED");
  puff(d, dm);
  keepBody(dm, "exhibit");
  try {
    const inv = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; inv && i < inv.size; i++) if (inv.getItem(i)?.typeId === EXHIBIT_KIT) inv.setItem(i, undefined);
  } catch {
    // the player let go of it
  }
  message(player, "§7The wizard stands in his exhibit: the spell is lifted, and the fence is closed. Use him to hear him.");
  darianHome(player);
  return "ok";
}

/** The Wizard's Exhibit Kit's custom component (zoocraft:wizard_exhibit_kit). */
export function exhibitKitComponent() {
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
          if (block.isValid) buildExhibit(player, block, face);
        } catch (error) {
          reportError("damien exhibit", error);
        }
      });
    },
  };
}

/** For the test bench and the logs. */
export function damienDebug() {
  const q = questRecord();
  const dm = q.damien;
  return { stage: stage(), damien: dm, bodies: dm?.d ? bodies(dimOf(dm.d)).map((e) => `${e.location.x.toFixed(1)},${e.location.y.toFixed(1)},${e.location.z.toFixed(1)} frozen ${e.getProperty("zoocraft:frozen")}`) : [] };
}
