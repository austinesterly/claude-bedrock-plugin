// 0.1.338: Transcending Vision and Dr. Foss's Lightning TNT Frequency Stick (Austin's NPC #29 spec, section 8). Pure
// rules; the runtime is world/vision.js, the numbers BALANCE.vision. Bedrock has no custom status effects, so the
// vision is kept by script on each player (seconds left, "zoocraft:vision_left"), shown by a faint violet haze and told
// in chat, never on screen. The stick is thrown; where it lands it goes off with a flash and a crack of thunder but
// breaks nothing, and every player within g.reach takes exactly one heart (2 points) and gets the vision. It drops
// where it landed, to be picked up and used again.

export const STICK_ITEM = "zoocraft:lightning_tnt_frequency_stick";
export const STICK_ENTITY = "zoocraft:frequency_stick";
export const VISION_KEY = "zoocraft:vision_left";
export const VISION_FOG = "zoocraft:fog_transcending";
export const VISION_FOG_TAG = "zc_vision";

/** m:ss for a number of seconds. */
export function clock(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Whether a player at `p` is caught by a stick going off at `at` (within g.reach blocks, the same dimension). */
export function caught(p, at, g) {
  return Math.hypot(p.x - at.x, p.y - at.y, p.z - at.z) <= g.reach;
}

/** The vision's seconds left after one more second, and what to say: "fading" once at g.warnAt, "ended" at 0. */
export function tickVision(left, g) {
  if (!(left > 0)) return { left: 0, say: undefined };
  const now = left - 1;
  return { left: now, say: now === 0 ? "ended" : now === g.warnAt ? "fading" : undefined };
}

/** The chat lines for the vision: started (or topped up), fading, ended, lost (by dying). */
export function visionText(kind, g, again = false) {
  if (kind === "start") return again ? `§dTranscending Vision §7renewed: ${clock(g.seconds)} again. The hidden world is still in view.` : `§dTranscending Vision§7 for ${clock(g.seconds)}: your frequency has shifted. What's hidden from ordinary eyes is in view. Look near the tallest tree in a jungle.`;
  if (kind === "fading") return `§dTranscending Vision§7 is fading: ${clock(g.warnAt)} left.`;
  if (kind === "ended") return "§dTranscending Vision§7 has worn off. Your frequency is your own again.";
  if (kind === "lost") return "§dTranscending Vision§7 left you when you died.";
  if (kind === "far") return "§7The stick went off too far away to shift your frequency. Throw it at your feet.";
  return "";
}
