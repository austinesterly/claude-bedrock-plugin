import { getExhibit, controllerAt, validate } from "./exhibits.js";
import { can, denyText, getPark, insidePark, insideWords, withPark } from "../park/park.js";
import { message } from "../platform/mc.js";
import { emit } from "../core/events.js";

// Habitat Marker: first use it on an Exhibit Controller to pick the exhibit, then on the ground
// inside the enclosure. That point seeds the validator. The selection lives only in memory.

const selected = new Map(); // player id -> exhibit id

export function selectController(player, block) {
  if (!can(player, "build")) return message(player, denyText("build"));
  const ex = controllerAt(block.dimension.id, { x: block.x, y: block.y, z: block.z });
  if (!ex) return message(player, "§cThis controller has no exhibit record. Break it and place it again.");
  selected.set(player.id, ex.id);
  message(player, `§aSelected ${ex.name}. §fNow use the marker on the ground inside its fence.`);
}

export async function markGround(player, block) {
  // 0.1.114: the park the ground is in (the item handler's scope); kept across the await below.
  const park = getPark();
  if (!park) return message(player, "§eClaim a park with a Park Deed first.");
  if (!can(player, "build", park)) return message(player, denyText("build", park));
  const exId = selected.get(player.id);
  const ex = exId && getExhibit(exId);
  if (!ex) return message(player, "§eFirst use the marker on an Exhibit Controller.");
  if (block.dimension.id !== ex.dimension) return message(player, "§cThat's in a different dimension from the controller.");
  if (!insidePark(block.dimension.id, block.location)) return message(player, `§eExhibits must be ${insideWords()}.`);
  const seed = { x: block.x, y: block.y + 1, z: block.z };
  message(player, `§7Measuring ${ex.name}...`);
  const r = await validate(ex.id, seed);
  if (!r) return;
  withPark(park, () => {
    const fresh = getExhibit(ex.id);
    if (!fresh) return;
    emit("exhibitMarked", { exhibit: fresh, player });
    if (r.error) return message(player, `§c${r.error}`);
    if (fresh.issues.length) {
      message(player, `§6${fresh.name}: ${fresh.state === "ready" || fresh.state === "occupied" ? "ready, with notes" : "not ready yet"}.`);
      for (const issue of fresh.issues.slice(0, 3)) message(player, `§e- ${issue}`);
    } else {
      message(player, `§a${fresh.name} is ready! §f${fresh.usableArea} usable blocks.`);
    }
  });
}
