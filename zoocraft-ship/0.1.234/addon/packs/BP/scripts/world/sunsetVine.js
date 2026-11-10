// Sunset Vines (0.1.234). The world hangs them from the formations' roofs already coloured: yellow at the roof,
// through orange, red and purple to blue at the tip of the longest. One a player hangs takes the piece after the
// one it hangs from, so a hand-made vine shows the same sunset the longer it gets.
import { vinePiece } from "./formationRules.js";

export function sunsetVineComponent() {
  return {
    onPlace: ({ block }) => {
      try {
        const above = block.above();
        const piece = vinePiece(above?.typeId, above?.typeId === block.typeId ? Number(above.permutation.getState("zoocraft:seg")) : undefined);
        if (piece !== block.permutation.getState("zoocraft:seg")) block.setPermutation(block.permutation.withState("zoocraft:seg", piece));
      } catch {
        // Its chunk went away: it keeps the first colour.
      }
    },
  };
}
