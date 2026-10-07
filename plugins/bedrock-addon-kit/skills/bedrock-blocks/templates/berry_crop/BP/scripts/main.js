import { system } from "@minecraft/server";

// Grows the block one stage per random tick.
// Block JSON: "ns:crop_growth": { "state": "ns:growth", "max_stage": 3 }
// Random ticks follow the randomTickSpeed game rule, so growth is slow and uneven, like vanilla crops.
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("ns:crop_growth", {
    onRandomTick(event, { params }) {
      const { state, max_stage } = params;
      const perm = event.block.permutation;
      const stage = perm.getState(state);
      if (typeof stage !== "number" || stage >= max_stage) return;
      event.block.setPermutation(perm.withState(state, stage + 1));
    },
  });
});
