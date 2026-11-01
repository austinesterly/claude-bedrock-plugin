import { world } from "@minecraft/server";

const PREFIX = "[ZooCraft]";

// Content-log output (visible in Settings > Creator > Content Log, and in the VS Code debugger): something to look at.
export function log(message) {
  console.warn(`${PREFIX} ${message}`);
}

// Information (the startup counts and the like): console.log, in the content log only when it's set to show
// information, and in the VS Code debugger and a server's console.
export function info(message) {
  console.log(`${PREFIX} ${message}`);
}

// Chat line for every player tagged `zc_debug` (add it with `/tag @s add zc_debug`).
export function debug(message) {
  for (const player of world.getAllPlayers()) {
    if (player.hasTag("zc_debug")) player.sendMessage(`§8${PREFIX} ${message}`);
  }
}

// Report a caught error without letting one failure stop the whole tick loop.
export function reportError(where, error) {
  // Native errors often carry an empty stack message, so always include the error text itself.
  const detail = error && error.stack ? `${String(error)}\n${error.stack}` : String(error);
  console.error(`${PREFIX} ${where}: ${detail}`);
}
