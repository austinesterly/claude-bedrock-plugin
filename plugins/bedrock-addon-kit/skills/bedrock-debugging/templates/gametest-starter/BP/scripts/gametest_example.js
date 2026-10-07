// GameTest starter. BETA MODULE, TEST WORLDS ONLY.
// Needs: "@minecraft/server-gametest" 1.0.0-beta and a -beta "@minecraft/server" in the BP manifest,
// the Beta APIs experiment, and cheats. See the template README. Never ship this file.
// Checked against @minecraft/server-gametest 1.0.0-beta.1.26.52-stable and 1.0.0-beta.1.26.60-preview.30.
//
// Run in game:
//   /gametest run ns_tests:block_place
//   /gametest runset ns_tests        (every test tagged "ns_tests")
//   /gametest clearall               (remove test structures and markers)
import { ItemStack } from "@minecraft/server";
import { register, registerAsync, Tags } from "@minecraft/server-gametest";

const CLASS = "ns_tests"; // test class: the part before ":" in /gametest run
const PEN = "ns:pen"; // loads BP/structures/ns/pen.mcstructure (build it once, see README)
const MOB = "minecraft:pig"; // swap for one of your own entities, for example "ns:critter"

// 1. Block placement: the simplest possible test. Coordinates are relative to the structure block.
register(CLASS, "block_place", (test) => {
  const at = { x: 1, y: 2, z: 1 };
  test.setBlockType("minecraft:stone", at);
  test.succeedWhenBlockPresent("minecraft:stone", at, true);
})
  .structureName(PEN)
  .maxTicks(40)
  .tag(CLASS)
  .tag(Tags.suiteDefault);

// 2. Entity survives: spawn a mob, wait, check it is still inside the test area.
registerAsync(CLASS, "mob_survives", async (test) => {
  test.spawn(MOB, { x: 2, y: 2, z: 2 });
  await test.idle(40);
  test.assertEntityPresentInArea(MOB, true);
  test.succeed();
})
  .structureName(PEN)
  .maxTicks(100)
  .tag(CLASS);

// 3. Simulated player: a fake player that can move, use items and attack.
register(CLASS, "sim_player", (test) => {
  const bot = test.spawnSimulatedPlayer({ x: 1, y: 2, z: 1 }, "ns_bot");
  bot.giveItem(new ItemStack("minecraft:apple", 1), true);
  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      bot.jump();
    })
    .thenExecuteAfter(10, () => {
      test.assert(bot.isValid, "simulated player should still exist");
    })
    .thenSucceed();
})
  .structureName(PEN)
  .maxTicks(60)
  .tag(CLASS);
