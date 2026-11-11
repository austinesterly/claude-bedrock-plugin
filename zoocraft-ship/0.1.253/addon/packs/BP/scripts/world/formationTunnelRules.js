// Passages through the Exotic Formation (0.1.253, in place of 0.1.242's tunnels out from each hall's middle, which
// needed the halls to stand at set places). Austin, 2026-11-10: "do these caves naturally connect to vanilla caves?"
// The world digs them with the halls (features/formation_tunnel_*.json): winding lines through the biome at the
// halls' floor height, a few blocks wide, lined with a little Exotic Stone, joining the halls of a patch; the game's
// own caves open into the halls and the passages wherever they cross them, because the halls' shell is only laid
// over stone, never over a cave's air. These are their numbers, for the tests. No engine calls here.
import { BALANCE } from "../data/balance.js";

export const PASSAGES = BALANCE.formation.passages;
