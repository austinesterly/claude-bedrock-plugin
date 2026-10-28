import { system, CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus } from "@minecraft/server";
import { db } from "./persistence/db.js";
import { SCHEMA_VERSION } from "./persistence/store.js";
import { perfReport, resetPeaks } from "./core/perf.js";
import { skipTime, allParks, parkName, parkOf, withPark, forEachPark, forPlayer } from "./park/park.js";
import { earn } from "./economy/economy.js";
import { allExhibits } from "./exhibits/exhibits.js";
import { allAnimals } from "./animals/animals.js";
import { newId } from "./core/ids.js";
import { worldBackend } from "./platform/mc.js";
import { rayReport } from "./animals/rayReport.js";
import { startBuild, startRun, lastReport } from "./bench/benchmark.js";
import { startZooBuild } from "./bench/zooBuild.js";
import { ZOO_SIZE } from "./bench/zooPlan.js";
import { BALANCE } from "./data/balance.js";
import { trenchStatus } from "./world/trench.js";

// Slash commands. Testing tools need cheats-level permission (Game Directors).

function reply(origin, text) {
  const who = origin.sourceEntity;
  system.run(() => (who && "sendMessage" in who ? who.sendMessage(text) : console.warn(text)));
}

export function registerCommands(init) {
  const reg = init.customCommandRegistry;

  reg.registerCommand(
    { name: "zoocraft:status", description: "ZooCraft: park, records and script timing", permissionLevel: CommandPermissionLevel.GameDirectors, cheatsRequired: false },
    (origin) => {
      system.run(() => {
        // 0.1.114: a line a park (every park's figures; the counts are the world's).
        const parks = allParks();
        const perf = perfReport();
        const quarantined = ["park", "animals", "exhibits", "equipment", "transfers", "ledger"].filter((c) => worldBackend.get(`zoocraft:db:${c}:quarantined`));
        const lines = [
          `§6ZooCraft status §7(schema ${SCHEMA_VERSION})`,
          ...(parks.length ? parks.map((park) => `park${parks.length > 1 ? ` ${parkName(park)}` : ""}: ${park.balance} coins, ${park.clock.seconds}s active, open=${park.open}`) : ["park: not claimed"]),
          `exhibits ${db.all("exhibits").length}, animals ${db.all("animals").length}, transfers ${db.all("transfers").length}, ledger ${db.all("ledger").length}`,
          `deep trench: ${trenchStatus().seen} chunks looked at, ${trenchStatus().waiting} waiting, ${trenchStatus().regions} regions carved`,
          `script ${perf.sum.toFixed(2)} ms/tick avg`,
          ...perf.rows.map((r) => `§7${r}`),
          quarantined.length ? `§cquarantined: ${quarantined.join(", ")}` : "§7no quarantined data",
        ];
        reply(origin, lines.join("\n"));
        resetPeaks();
      });
      return { status: CustomCommandStatus.Success };
    },
  );

  // 0.1.69: what the flight script sees of the Void Rays near you (where each is, what it is doing,
  // whether its last step moved it), to find out why a ray isn't flying.
  reg.registerCommand(
    { name: "zoocraft:rays", description: "ZooCraft: what the Void Rays near you are doing", permissionLevel: CommandPermissionLevel.GameDirectors, cheatsRequired: false },
    (origin) => {
      system.run(() => {
        const who = origin.sourceEntity;
        const lines = who && who.typeId === "minecraft:player" ? rayReport(who) : ["Run it as a player, near the rays."];
        reply(origin, ["§6Void Rays", ...lines].join("\n"));
      });
      return { status: CustomCommandStatus.Success };
    },
  );

  // M0 save test: run it, save and quit, reopen, run it again. The count must go up by one each time.
  reg.registerCommand(
    { name: "zoocraft:selftest", description: "ZooCraft: save/reload test record", permissionLevel: CommandPermissionLevel.GameDirectors, cheatsRequired: false },
    (origin) => {
      system.run(() => {
        const rec = db.get("selftest", "counter") ?? { id: "counter", runs: 0, history: [] };
        rec.runs += 1;
        rec.history = [...rec.history.slice(-4), new Date().toISOString()];
        db.put("selftest", rec);
        db.flush("selftest");
        reply(origin, `§aSelf-test run ${rec.runs} saved (revision ${rec.revision}). Save and quit, reopen, and run it again: it should say run ${rec.runs + 1}.`);
      });
      return { status: CustomCommandStatus.Success };
    },
  );

  reg.registerCommand(
    {
      name: "zoocraft:skip",
      description: "ZooCraft test: run N seconds of park time now",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: true,
      mandatoryParameters: [{ name: "seconds", type: CustomCommandParamType.Integer }],
    },
    (origin, seconds) => {
      if (seconds <= 0 || seconds > 24000) return { status: CustomCommandStatus.Failure, message: "seconds must be 1 to 24000" };
      system.run(() => {
        // 0.1.114: the runner's park (parkOf), else every park (the command block case).
        const who = origin.sourceEntity;
        const park = who?.typeId === "minecraft:player" ? parkOf(who) : undefined;
        if (park) withPark(park, () => skipTime(seconds));
        else forEachPark(() => skipTime(seconds));
        reply(origin, `§7Ran ${seconds} seconds of park time${park && allParks().length > 1 ? ` in ${parkName(park)}` : ""}.`);
      });
      return { status: CustomCommandStatus.Success };
    },
  );

  // 0.1.96: the benchmark. "build" builds a full park round you in a new Superflat world ("build 2", 0.1.118: two parks,
  // the second 300 blocks east); "run" measures any park for `seconds` (60 unless told) and prints the readout; "report"
  // prints the last readout again.
  reg.registerEnum("zoocraft:bench_action", ["build", "run", "report"]);
  reg.registerCommand(
    {
      name: "zoocraft:benchmark",
      description: "ZooCraft test: build the benchmark park (or 2), or measure the script time",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: true,
      mandatoryParameters: [{ name: "zoocraft:bench_action", type: CustomCommandParamType.Enum }],
      optionalParameters: [{ name: "number", type: CustomCommandParamType.Integer }], // run: seconds; build: parks
    },
    (origin, action, number) => {
      const seconds = number;
      const who = origin.sourceEntity;
      if (!who || who.typeId !== "minecraft:player") return { status: CustomCommandStatus.Failure, message: "Run it as a player." };
      if (action === "run" && seconds !== undefined && (seconds < 5 || seconds > 600)) return { status: CustomCommandStatus.Failure, message: "seconds must be 5 to 600" };
      if (action === "build" && number !== undefined && (number < 1 || number > 2)) return { status: CustomCommandStatus.Failure, message: "parks must be 1 or 2" };
      system.run(() => {
        if (action === "report") return reply(origin, (lastReport() ?? ["§eNo benchmark run yet: /zoocraft:benchmark run"]).join("\n"));
        const why = forPlayer(who, () => (action === "build" ? startBuild(who, number ?? 1) : startRun(who, seconds ?? BALANCE.benchmark.runSeconds)));
        if (why) reply(origin, `§c${why}`);
      });
      return { status: CustomCommandStatus.Success };
    },
  );

  // 0.1.104 (Austin: "a zoocraft build command with the aluminum fences and a 100 x 100 zoo so I can test easier",
  // "Make an exhibit for all of our current species in it, and make sure the animals are in it as well"): a test
  // zoo in one go on flat ground: the park claimed where you stand if there's none, an exhibit for every species
  // with its animals, paths, Viewing Points, services, Staff Rooms and keepers, inside an Aluminum Fence `size`
  // columns a side (100 unless told, more when the exhibits need it) with a gate in the middle of each side and the
  // Park Entrance Gate to the south (bench/zooBuild.js).
  reg.registerCommand(
    {
      name: "zoocraft:build",
      description: "ZooCraft test: build a zoo with every species inside an Aluminum Fence (size a side; 100, or what fits)",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: true,
      optionalParameters: [{ name: "size", type: CustomCommandParamType.Integer }],
    },
    (origin, size) => {
      const who = origin.sourceEntity;
      if (!who || who.typeId !== "minecraft:player") return { status: CustomCommandStatus.Failure, message: "Run it as a player." };
      if (size !== undefined && (size < ZOO_SIZE.min || size > ZOO_SIZE.max)) return { status: CustomCommandStatus.Failure, message: `size must be ${ZOO_SIZE.min} to ${ZOO_SIZE.max}` };
      system.run(() => {
        const why = forPlayer(who, () => startZooBuild(who, size ?? ZOO_SIZE.default));
        if (why) reply(origin, `§c${why}`);
      });
      return { status: CustomCommandStatus.Success };
    },
  );

  reg.registerCommand(
    {
      name: "zoocraft:grant",
      description: "ZooCraft test: add Zoo Coins",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: true,
      mandatoryParameters: [{ name: "coins", type: CustomCommandParamType.Integer }],
    },
    (origin, coins) => {
      if (coins <= 0 || coins > 100000) return { status: CustomCommandStatus.Failure, message: "coins must be 1 to 100000" };
      system.run(() => {
        // 0.1.114: the runner's park (parkOf).
        const who = origin.sourceEntity;
        const r = who?.typeId === "minecraft:player" ? forPlayer(who, () => earn(coins, "Test grant", newId("grant"))) : earn(coins, "Test grant", newId("grant"));
        reply(origin, r.ok ? `§aAdded ${coins} coins. Balance ${r.balance}.` : "§cClaim a park first.");
      });
      return { status: CustomCommandStatus.Success };
    },
  );
}
