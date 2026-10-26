import { world, system, DisplaySlotId } from "@minecraft/server";
import { getPark } from "../park/park.js";
import { coinsLabel } from "../park/rules.js";
import { BALANCE } from "../data/balance.js";
import { timeOfDay } from "../core/clock.js";
import { exhibitAt, nearestExhibit } from "../exhibits/exhibits.js";
import { ITEMS } from "../data/items.js";
import { heldItem } from "../platform/mc.js";
import { tutorialStatus } from "../quests/tutorial.js";
import { expeditionStatus } from "../quests/expedition.js";
import { conservationStatus } from "../quests/conservation.js";

// HUD (pattern from TwoDogs Zombies' hud.js): the only writer of the sidebar and of ZooCraft's
// action bar line. Text is sent only when it changes, plus a heartbeat so the action bar doesn't fade.
//   Sidebar: Zoo Coins, park day, rating, open/closed (display only; the ledger is the truth).
//   Action bar: the most urgent warning of the exhibit you're standing in or inspecting.

const OBJECTIVE = "zoocraft_park";
const HEARTBEAT = 40;
const lastBar = new Map(); // player id -> { text, tick }
let lastSidebar = "";

function sidebar() {
  const park = getPark();
  let obj = world.scoreboard.getObjective(OBJECTIVE);
  // 0.1.107 (Austin: "I also do not want the zoocraft park tab to be perminant on the screen, it should be togglable"):
  // the owner turns the sidebar off in Park settings. A scoreboard sidebar is the world's, not a player's, so it's
  // one switch for everyone in the park.
  if (!park || park.settings?.sidebar === false) {
    if (obj) world.scoreboard.removeObjective(OBJECTIVE);
    lastSidebar = "";
    return;
  }
  const t = timeOfDay(park.clock.seconds, BALANCE.clock.dayLength);
  const rows = [
    [coinsLabel(park), park.balance],
    [`§fPark day`, t.day],
    [`§fPark score`, park.rating.score],
    [park.open ? `§aGuests today` : `§7Closed · guests`, park.today.guests],
  ];
  const tut = tutorialStatus();
  if (tut.next) rows.push([`§bTutorial steps done`, tut.done]);
  const exp = expeditionStatus();
  if (exp.started && !exp.finished) rows.push([`§dEnd expedition steps`, exp.done]);
  const con = conservationStatus();
  if (con.started && !con.finished) rows.push([`§2Conservation steps`, con.done]);
  const sig = JSON.stringify(rows);
  if (sig === lastSidebar && obj) return;
  if (!obj) {
    obj = world.scoreboard.addObjective(OBJECTIVE, "§6ZooCraft Park");
    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: obj });
  }
  // Remove rows whose label changed (open/closed) so the sidebar never shows both.
  for (const p of obj.getParticipants()) if (!rows.some(([label]) => label === p.displayName)) obj.removeParticipant(p);
  for (const [label, value] of rows) obj.setScore(label, value);
  lastSidebar = sig;
}

function barFor(player) {
  const held = heldItem(player)?.typeId;
  const here = exhibitAt(player.dimension.id, player.location);
  const ex = here ?? (held === ITEMS.clipboard ? nearestExhibit(player.dimension.id, player.location, 24) : undefined);
  if (!ex) return "";
  const warn = ex.issues[0] ? { severity: 3, text: ex.issues[0] } : ex.careWarnings[0];
  const head = `§6${ex.name} §7· §f${ex.animalIds.length} animal${ex.animalIds.length === 1 ? "" : "s"}`;
  if (!warn) return `${head} §7· §aAll good`;
  const color = warn.severity >= 3 ? "§c" : warn.severity === 2 ? "§6" : "§e";
  return `${head} §7· ${color}${warn.text}`;
}

export function tickHud() {
  sidebar();
  const now = system.currentTick;
  for (const player of world.getAllPlayers()) {
    const text = barFor(player);
    const last = lastBar.get(player.id) ?? { text: "", tick: 0 };
    if (!text && !last.text) continue;
    if (text !== last.text || (text && now - last.tick >= HEARTBEAT)) {
      player.onScreenDisplay.setActionBar(text);
      lastBar.set(player.id, { text, tick: now });
    }
  }
}
