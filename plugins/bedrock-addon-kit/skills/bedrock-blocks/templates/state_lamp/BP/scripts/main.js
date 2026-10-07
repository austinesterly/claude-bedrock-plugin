import { system } from "@minecraft/server";

// Generic "click to cycle an integer state" component.
// Block JSON: "ns:cycle_state": { "state": "ns:level", "max": 3 }
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("ns:cycle_state", {
    onPlayerInteract(event, { params }) {
      const { state, max } = params;
      const perm = event.block.permutation;
      const current = perm.getState(state);
      if (typeof current !== "number") return; // block has no such integer state
      const next = current >= max ? 0 : current + 1;
      event.block.setPermutation(perm.withState(state, next));
    },
  });
});
