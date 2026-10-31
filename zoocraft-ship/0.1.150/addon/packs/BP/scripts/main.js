import { system, world, ItemStack } from "@minecraft/server";
import { log, reportError } from "./core/log.js";
import { loop } from "./core/scheduler.js";
import { on, emit } from "./core/events.js";
import { db } from "./persistence/db.js";
import { validateData } from "./data/validate.js";
import { ITEMS, BLOCKS, ENTITIES, carrierByItem } from "./data/items.js";
import { speciesForWild } from "./data/species.js";
import { getPark, tickClock, can, denyText, insidePark, notePlayer, roleOf, parkEdge, forEachPark, scopedComponent, scopedItem, atBlock, forPlayer, forRecord, parksOf, memberOfAny, parkName, membersOnline, runLater, parkOfRecord, withPark, parkOf } from "./park/park.js";
import { welcomeText } from "./park/rules.js";
import { gateComponent, gatePartComponent } from "./park/gate.js";
import { aluminumFenceComponent, aluminumGateComponent, tickFence, initFence } from "./park/fence.js";
import { isPathBlock } from "./data/blocks.js";
import { initExhibits, controllerPlaced, controllerBroken, controllerAt, exhibitAt, blockChanged, serviceValidations, clean } from "./exhibits/exhibits.js";
import { selectController, markGround } from "./exhibits/marker.js";
import { initAnimals, watch, isZooAnimal, play, animalFromEntity, renameAnimal, fishFromBucket, bucketFor, bucketOut } from "./animals/animals.js";
import { initNursery } from "./animals/nursery.js";
import { pack, repack, release, reconcileTransport, crateFromDen } from "./transport/carriers.js";
import { feederComponent } from "./equipment/feeder.js";
import { fixtureComponent, keeperGateComponent, placeToy, placeGroundToy, pickUpToy, isToyEntity, trackToy, toyGone } from "./equipment/fixtures.js";
import { lavaFilterComponent, clearLavaBucketComponent, scoopClearLava } from "./equipment/lavaFilter.js";
import { endFenceComponent, fenceBlockChanged, initEndFence } from "./equipment/endFence.js";
import { tickLavaSwim, tickClearLavaBurn } from "./animals/lavaSwim.js";
import { tickFlight } from "./animals/flight.js";
import { tickRift } from "./animals/rift.js";
import { tickNight } from "./animals/night.js";
import { tickRaccoons, tickRaccoonMoves } from "./animals/raccoon.js";
import { tickFlamingos, tickFlamingoMoves, initFlamingos } from "./animals/flamingo.js";
import { tickZebras, tickZebraMoves, initZebras } from "./animals/zebra.js";
import { holdingDenComponent, tickPredators, initPredators } from "./animals/predators.js";
import { tickLions, tickLionMoves, initLions } from "./animals/lion.js";
import { tickTigers, tickTigerMoves, initTigers } from "./animals/tiger.js";
import { tickTurns } from "./animals/tigerTurns.js";
import { tickCrocs, tickCrocMoves, initCrocs } from "./animals/croc.js";
import { tickSharks, tickSharkMoves, initSharks } from "./animals/shark.js";
import { tickRays, tickRayMoves } from "./animals/ray.js";
import { tickJellies } from "./animals/jelly.js";
import { tickCatfish, tickCatfishMoves } from "./animals/catfish.js";
import { tickManatees, tickManateeMoves } from "./animals/manatee.js";
import { tickPlaces } from "./world/places.js";
import { lavaSpringComponent } from "./world/lavaFalls.js";
import { gladeSpringComponent } from "./world/gladeFalls.js";
import { tickRedPandas, tickRedPandaMoves } from "./animals/redpanda.js";
import { tickGorillas, tickGorillaMoves, initGorillas } from "./animals/gorilla.js";
import { tickOwls, tickOwlMoves } from "./animals/owl.js";
import { tickGrazers, tickGrazerMoves, initGrazers } from "./animals/grazer.js";
import { tickGeckos, tickGeckoMoves } from "./animals/gecko.js";
import { tickBoars, tickBoarMoves, initBoars } from "./animals/boar.js";
import { tickMoths, tickMothMoves } from "./animals/moth.js";
import { tickBeetles, tickBeetleMoves } from "./animals/beetle.js";
import { tickHoppers, tickHopperMoves } from "./animals/hopper.js";
import { tickSnails, tickSnailMoves, initSnails } from "./animals/snail.js";
import { tickCrabs, tickCrabMoves, initCrabs } from "./animals/crab.js";
import { tickChorusMoths, tickChorusMothMoves } from "./animals/chorusMoth.js";
import { tickStarbacks, tickStarbackMoves, initStarbacks } from "./animals/starback.js";
import { tickOkapis } from "./animals/okapi.js";
import { tickMolebears } from "./animals/molebear.js";
import { tickSkulkers, tickAncientCities } from "./animals/skulker.js";
import { tickUnicorns } from "./animals/unicorn.js";
import { tickDragons, tickDragonMoves } from "./animals/dragon.js";
import { tickDivingHelmets } from "./equipment/divingHelmet.js";
import { tickMeadows, watchMeadowSpawns } from "./world/meadow.js";
import { tickGlade } from "./world/glade.js";
import { hatcheryComponent } from "./equipment/hatchery.js";
import { initClearLavaFlow, flowAround, clearLavaFlowComponent, tickClearLavaFlow } from "./equipment/clearLavaFlow.js";
import { initVisitors, ratingNow } from "./visitors/visitors.js";
import { pointComponent } from "./visitors/points.js";
import { tickGuests, guestLoaded, clearGuests, talk, tickJourneys } from "./visitors/guests.js";
import { serviceComponent, servicePartComponent, sweepPath } from "./visitors/services.js";
import { tickPaths, pathsDirty } from "./visitors/network.js";
import { initTours, tickTours, tickTourWalk, tourDeskComponent, tourLoaded, talkToGuide, deskPlaced, isTourGuest } from "./visitors/tours.js";
import { tourMenu } from "./ui/tourMenu.js";
import { initRides, tickRides, tickRideFly, tickRideSafety, platformComponent, platformPlaced, rideLoaded, isRideGuest } from "./visitors/rides.js";
import { rideMenu } from "./ui/rideMenu.js";
import { tickMounts, tamedRay } from "./animals/mount.js";
import { tickCitySpawns } from "./animals/endCities.js";
import { initTutorial, tickTutorial } from "./quests/tutorial.js";
import { tickExpedition } from "./quests/expedition.js";
import { tickConservation } from "./quests/conservation.js";
import { initStaff, tickStaff, staffRoomComponent, keeperLoaded, talkToKeeper, staffBlockChanged, roomPlaced } from "./staff/staff.js";
import { staffMenu } from "./ui/staffMenu.js";
import { initDiscovery, tickDiscovery, grandfatherPlayer } from "./discovery/discovery.js";
import { tickPrance } from "./animals/prance.js";
import { researchDeskComponent } from "./research/research.js";
import { researchMenu } from "./ui/researchMenu.js";
import { giftShopComponent, shopBlockChanged, shopPlaced } from "./visitors/giftShop.js";
import { giftShopMenu } from "./ui/giftShopMenu.js";
import { bankComponent, bankPlaced } from "./economy/bank.js";
import { bankMenu } from "./ui/bankMenu.js";
import { tickHud } from "./ui/hud.js";
import { openExhibit, openFromEntity, openNearest } from "./ui/clipboard.js";
import { openDeed, holding, boothMenu, standMenu } from "./ui/parkMenu.js";
import { registerCommands } from "./commands.js";
import { recordingRegistry } from "./bench/benchmark.js";
import { setLoadMs } from "./core/perf.js";
import { heldItem, message, onlinePlayers } from "./platform/mc.js";

// Catch attempts arrive twice (entity interaction and item use) and repeat while use is held,
// so one attempt per player per half second.
const lastCatch = new Map();
function catchCooldown(player) {
  const last = lastCatch.get(player.id) ?? -100;
  if (system.currentTick - last < 10) return true;
  lastCatch.set(player.id, system.currentTick);
  return false;
}

// Placing, scooping or flowing Clear Lava changes the ground like building does.
function groundChanged(dimensionId, pos) {
  blockChanged(dimensionId, pos);
  pathsDirty(dimensionId, pos);
}
// A bucket poured or scooped Clear Lava: the lava there and around it starts to flow (or dry up).
function lavaPoured(dimensionId, pos) {
  groundChanged(dimensionId, pos);
  flowAround(world.getDimension(dimensionId), pos);
}

// ZooCraft Tycoon entry point. Startup registers components and commands (no world access yet);
// worldLoad starts the modules in dependency order: core -> persistence -> data -> park ->
// exhibits -> animals -> transport -> visitors -> ui.
//
// 0.1.114 (several parks a world, park/park.js): every handler here runs for one park. A block's or item's component
// is registered scoped (scopedComponent, scopedItem: the park the block stands in, else the player's), a player's
// interaction runs forPlayer or for the animal's park, a world block event atBlock, and the park loops run once a
// park (forEachPark). Work put off with runLater keeps the scope it was put off in.

system.beforeEvents.startup.subscribe((init) => {
  const itemRegistry = init.itemComponentRegistry;
  const items = { registerCustomComponent: (name, component) => itemRegistry.registerCustomComponent(name, scopedItem(component)) };
  const blockRegistry = recordingRegistry(init.blockComponentRegistry); // the benchmark builder runs their onPlace (bench/)
  const blocks = { registerCustomComponent: (name, component) => blockRegistry.registerCustomComponent(name, scopedComponent(component)) };

  items.registerCustomComponent("zoocraft:park_deed", {
    onUse: (e) => {
      const player = e.source;
      runLater(() => openDeed(player));
    },
  });
  items.registerCustomComponent("zoocraft:habitat_marker", {
    onUseOn: (e) => {
      if (e.block.typeId === BLOCKS.controller) return; // the controller's own interact handles it
      const player = e.source;
      const block = e.block;
      if (player.typeId === "minecraft:player") runLater(() => markGround(player, block));
    },
  });
  items.registerCustomComponent("zoocraft:clipboard", {
    onUse: (e) => {
      const player = e.source;
      runLater(() => {
        const look = player.getBlockFromViewDirection({ maxDistance: 6 });
        if (look?.block.typeId === BLOCKS.controller) return; // opened by the controller
        openNearest(player);
      });
    },
  });
  items.registerCustomComponent("zoocraft:cleaning_rake", {
    onUseOn: (e) => {
      const player = e.source;
      const block = e.block;
      runLater(() => {
        if (!can(player, "care")) return message(player, denyText("care"));
        const ex = exhibitAt(block.dimension.id, { x: block.x, y: block.y + 1, z: block.z });
        if (ex) return clean(player, ex);
        // On a guest path: sweep up litter.
        if (isPathBlock(block.typeId) && insidePark(block.dimension.id, block.location)) return sweepPath(player);
        message(player, "§eUse the rake on the ground inside an exhibit, or on a guest path to sweep up litter.");
      });
    },
  });
  items.registerCustomComponent("zoocraft:floating_toy", {
    onUse: (e) => {
      const player = e.source;
      runLater(() => placeToy(player, exhibitAt));
    },
  });
  items.registerCustomComponent("zoocraft:enrichment_ball", {
    onUse: (e) => {
      const player = e.source;
      runLater(() => placeGroundToy(player, exhibitAt, ITEMS.enrichmentBall));
    },
  });
  // Blaze Bone and Wither Skull Ball: the held item says which toy goes down.
  items.registerCustomComponent("zoocraft:nether_toy", {
    onUse: (e) => {
      const player = e.source;
      const itemId = e.itemStack?.typeId;
      runLater(() => placeGroundToy(player, exhibitAt, itemId));
    },
  });
  items.registerCustomComponent("zoocraft:clear_lava_bucket", clearLavaBucketComponent(lavaPoured));
  items.registerCustomComponent("zoocraft:carrier", {
    // Backup for catching: the client only sends an entity interaction when the mob offers one
    // for the held item, so an empty carrier pointed at a rabbit can arrive here as a plain use.
    onUse: (e) => {
      const player = e.source;
      runLater(() => {
        const held = heldItem(player);
        if (!held || carrierByItem(held.typeId)?.full !== false) return;
        if (catchCooldown(player)) return;
        const target = player.getEntitiesFromViewDirection({ maxDistance: 5 }).map((hit) => hit.entity).find((ent) => ent.isValid && (speciesForWild(ent.typeId) || isZooAnimal(ent)));
        if (!target) message(player, "§eLook at an animal up close, then use the carrier.");
        else if (isZooAnimal(target)) repack(player, target);
        else pack(player, target);
      });
    },
    onUseOn: (e) => {
      const player = e.source;
      const block = e.block;
      runLater(() => release(player, block).catch((err) => reportError("release", err)));
    },
  });

  blocks.registerCustomComponent("zoocraft:exhibit_controller", {
    onPlace: (e) => {
      const block = e.block;
      runLater(() => {
        const { exhibit, reconnected } = controllerPlaced(block);
        if (reconnected) for (const p of membersOnline(parkOfRecord(exhibit) ?? getPark())) message(p, `§a${exhibit.name} reconnected to its new controller.`);
      });
    },
    onPlayerInteract: (e) => {
      const player = e.player;
      if (!player) return;
      const block = e.block;
      runLater(() => {
        if (heldItem(player)?.typeId === ITEMS.habitatMarker) return selectController(player, block);
        const ex = controllerAt(block.dimension.id, { x: block.x, y: block.y, z: block.z });
        if (ex) openExhibit(player, ex.id);
      });
    },
    onPlayerBreak: (e) => {
      const dimId = e.block.dimension.id;
      const pos = { x: e.block.x, y: e.block.y, z: e.block.z };
      const player = e.player;
      runLater(() => {
        const ex = controllerBroken(dimId, pos);
        if (ex && player) message(player, `§e${ex.name} lost its controller. Its animals are safe; place a controller nearby to reconnect.`);
      });
    },
  });
  blocks.registerCustomComponent("zoocraft:feeder", feederComponent());
  blocks.registerCustomComponent("zoocraft:fixture", fixtureComponent());
  blocks.registerCustomComponent("zoocraft:hatchery", hatcheryComponent());
  blocks.registerCustomComponent("zoocraft:lava_filter", lavaFilterComponent());
  blocks.registerCustomComponent("zoocraft:clear_lava_flow", clearLavaFlowComponent());
  // The Lava Falls' springs (0.1.141) belong to no park: registered unscoped.
  blockRegistry.registerCustomComponent("zoocraft:lava_spring", lavaSpringComponent());
  blockRegistry.registerCustomComponent("zoocraft:glade_spring", gladeSpringComponent());
  blocks.registerCustomComponent("zoocraft:keeper_gate", keeperGateComponent());
  blocks.registerCustomComponent("zoocraft:holding_den", holdingDenComponent());
  blocks.registerCustomComponent("zoocraft:end_fence", endFenceComponent());
  blocks.registerCustomComponent("zoocraft:aluminum_fence", aluminumFenceComponent());
  blocks.registerCustomComponent("zoocraft:aluminum_fence_gate", aluminumGateComponent());
  blocks.registerCustomComponent("zoocraft:guest_point", pointComponent());
  blocks.registerCustomComponent("zoocraft:guest_service", serviceComponent());
  blocks.registerCustomComponent("zoocraft:guest_service_part", servicePartComponent());
  // The Zoo Workshop is a crafting table for zoo equipment; the script only notes it was built.
  blocks.registerCustomComponent("zoocraft:zoo_workshop", {
    onPlace: () => runLater(() => emit("workshopPlaced", {})),
  });
  blocks.registerCustomComponent("zoocraft:staff_room", staffRoomComponent(staffMenu));
  blocks.registerCustomComponent("zoocraft:research_desk", researchDeskComponent(researchMenu));
  blocks.registerCustomComponent("zoocraft:gift_shop", giftShopComponent(giftShopMenu));
  blocks.registerCustomComponent("zoocraft:bank", bankComponent(bankMenu));
  blocks.registerCustomComponent("zoocraft:tour_desk", tourDeskComponent(tourMenu));
  blocks.registerCustomComponent("zoocraft:expedition_platform", platformComponent(rideMenu));
  blocks.registerCustomComponent("zoocraft:entrance_gate", gateComponent());
  blocks.registerCustomComponent("zoocraft:entrance_gate_part", gatePartComponent());

  registerCommands(init);
});

// A fish bucket emptied into an aquarium (0.1.119): the fish joins the tank's school of its kind (animals.js
// fishFromBucket decides; a fish that appears anywhere else is left alone).
world.afterEvents.entitySpawn.subscribe(({ entity, cause }) => {
  if (cause === "Loaded" || !speciesForWild(entity.typeId)?.school) return;
  runLater(() => {
    try {
      fishFromBucket(entity);
    } catch (err) {
      reportError("fishFromBucket", err);
    }
  });
});

// Endermen spawning on a Chorus Meadow's ground are sent away (0.1.142, world/meadow.js).
watchMeadowSpawns();

// Entity interactions: catching wild animals, playing with and inspecting zoo animals.
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
  const held = e.itemStack?.typeId;
  const target = e.target;
  const player = e.player;
  const carrier = held && carrierByItem(held);
  // The park the action is for: the animal's own (a zoo animal, through its record), else the player's.
  const animalPark = () => (isZooAnimal(target) ? parkOfRecord(animalFromEntity(target)) : undefined);
  const scoped = (fn) => () => withPark(animalPark() ?? parkOf(player), fn);
  if (carrier && !carrier.full && speciesForWild(target.typeId)) {
    e.cancel = true;
    runLater(scoped(() => target.isValid && !catchCooldown(player) && pack(player, target)));
    return;
  }
  // An empty carrier on one of the park's own animals picks it up again (an escapee, or a move).
  if (carrier && !carrier.full && isZooAnimal(target)) {
    e.cancel = true;
    runLater(scoped(() => target.isValid && !catchCooldown(player) && repack(player, target)));
    return;
  }
  if (isToyEntity(target)) {
    e.cancel = true;
    runLater(() => {
      if (!target.isValid) return;
      atBlock(target.dimension.getBlock(target.location) ?? { dimension: target.dimension, location: target.location }, player, () => {
        if (!can(player, "care")) return message(player, denyText("care"));
        pickUpToy(player, target);
      });
    });
    return;
  }
  if (target.typeId === ENTITIES.guest) {
    e.cancel = true;
    runLater(() => {
      if (!target.isValid) return;
      atBlock({ dimension: target.dimension, location: target.location }, player, () => {
        const r = ratingNow();
        talk(player, target, r.complaint, r.services.detail);
      });
    });
    return;
  }
  if (target.typeId === ENTITIES.keeper) {
    e.cancel = true;
    runLater(scoped(() => target.isValid && talkToKeeper(player, target)));
    return;
  }
  // A water bucket on a shown zoo fish (0.1.121): the fish leaves its school in a fish bucket (animals.js bucketOut);
  // the game's own pickup knows only its own fish types, so the script does it.
  if (held === "minecraft:water_bucket" && bucketFor(target.typeId)) {
    e.cancel = true;
    runLater(scoped(() => target.isValid && bucketOut(player, target)));
    return;
  }
  if (target.typeId === ENTITIES.tourGuide) {
    e.cancel = true;
    runLater(scoped(() => target.isValid && talkToGuide(player, target)));
    return;
  }
  if (isZooAnimal(target)) {
    // A vanilla name tag renames the animal; the name goes into its record once the game applies it.
    if (held === "minecraft:name_tag") {
      if (!withPark(animalPark() ?? parkOf(player), () => can(player, "care"))) {
        e.cancel = true;
        runLater(scoped(() => message(player, denyText("care"))));
        return;
      }
      system.runTimeout(
        scoped(() => {
          const a = target.isValid ? animalFromEntity(target) : undefined;
          if (a && target.nameTag && target.nameTag !== a.name) renameAnimal(a, target.nameTag, player);
        }),
        2,
      );
      return;
    }
    if (held === ITEMS.clipboard) {
      e.cancel = true;
      runLater(scoped(() => openFromEntity(player, target)));
    } else if (!held) {
      e.cancel = true;
      runLater(scoped(() => target.isValid && play(player, target)));
    } else if (target.typeId === "zoocraft:void_ray") {
      e.cancel = true; // a zoo ray carries riders only from the Expedition Platform (visitors/rides.js)
    }
  }
});

// An empty bucket pointed at Clear Lava scoops it up (it's a block, so the bucket can't on its own).
// The click can arrive as a plain use or as a use on the block behind the lava.
world.beforeEvents.itemUse.subscribe((e) => {
  if (e.itemStack?.typeId === "minecraft:bucket" && scoopClearLava(e.source, lavaPoured)) e.cancel = true;
});
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
  if (e.itemStack?.typeId === "minecraft:bucket" && scoopClearLava(e.player, lavaPoured)) e.cancel = true;
});
// Water (or anything else) put down from a bucket next to Clear Lava: the lava re-checks itself.
world.afterEvents.playerInteractWithBlock.subscribe((e) => {
  if (!e.beforeItemStack?.typeId.endsWith("bucket")) return;
  const f = String(e.blockFace).toLowerCase();
  const d = { up: [0, 1, 0], down: [0, -1, 0], north: [0, 0, -1], south: [0, 0, 1], west: [-1, 0, 0], east: [1, 0, 0] }[f] ?? [0, 0, 0];
  const l = e.block.location;
  flowAround(e.block.dimension, { x: l.x + d[0], y: l.y + d[1], z: l.z + d[2] });
});

world.afterEvents.entityLoad.subscribe(({ entity }) => {
  trackToy(entity);
  if (!isTourGuest(entity.id) && !isRideGuest(entity.id)) guestLoaded(entity); // a guest behind a Tour Guide or on a ray is that module's
  keeperLoaded(entity);
  tourLoaded(entity);
  rideLoaded(entity);
});
world.afterEvents.entityDie.subscribe(({ deadEntity }) => toyGone(deadEntity));
// A wild Void Ray taking to its feeder (its tameable component's tame_event) tells the feeder.
world.afterEvents.dataDrivenEntityTrigger.subscribe(
  ({ entity, eventId }) => {
    if (eventId === "zoocraft:on_tame") tamedRay(entity);
  },
  { entityTypes: ["zoocraft:wild_void_ray"], eventTypes: ["zoocraft:on_tame"] },
);

world.afterEvents.playerBreakBlock.subscribe((e) => {
  atBlock(e.block, e.player, () => {
    flowAround(e.dimension, e.block.location); // Clear Lava beside it flows into the gap
    blockChanged(e.dimension.id, e.block.location);
    pathsDirty(e.dimension.id, e.block.location);
    staffBlockChanged(e.dimension.id, e.block.location);
    shopBlockChanged(e.dimension.id, e.block.location);
    fenceBlockChanged(e.dimension.id, e.block.location); // End Fences beside it drop their arm
  });
});
world.afterEvents.playerPlaceBlock.subscribe((e) => {
  atBlock(e.block, e.player, () => {
    flowAround(e.dimension, e.block.location); // a block put into flowing Clear Lava cuts it off
    blockChanged(e.dimension.id, e.block.location);
    pathsDirty(e.dimension.id, e.block.location);
    staffBlockChanged(e.dimension.id, e.block.location);
    shopBlockChanged(e.dimension.id, e.block.location);
    fenceBlockChanged(e.dimension.id, e.block.location); // End Fences beside it reach out to it
    if (e.block.typeId === BLOCKS.staffRoom) roomPlaced(e.player, e.block);
    if (e.block.typeId === BLOCKS.giftShop) shopPlaced(e.player, e.block);
    if (e.block.typeId === BLOCKS.tourDesk) deskPlaced(e.player, e.block);
    if (e.block.typeId === BLOCKS.platform) platformPlaced(e.player, e.block);
    if (e.block.typeId === BLOCKS.bank) bankPlaced(e.player, e.block);
  });
});

// Joining: every player is noted (so an owner can set roles for offline players), a park's members hear their role
// in each park they belong to, and a player who belongs to no park gets one Park Deed the first time they join
// (0.1.114: whether or not the world has a park already; one park an owner, any number a world).
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn) return;
  notePlayer(player);
  grandfatherPlayer(player); // 0.1.117: the first join since the Field Journal became each player's own
  const mine = parksOf(player);
  for (const park of mine) {
    const several = mine.length > 1 || !memberOfAny(player);
    message(player, `${several ? `§6${parkName(park)}: §f` : ""}${welcomeText(roleOf(player.id, park), park.settings)}`);
    // 0.1.106 (Austin: "The zoo should just be where aluminum fences enclose"): a park from before 0.1.101 kept a
    // 500-block circle until it was fenced. Its record still says so; the first member in hears it once, then it's gone.
    if (park.radius !== undefined) {
      delete park.radius;
      delete park.needsFence;
      db.put("park", park);
      if (parkEdge(park) !== "fence") message(player, "§eThe park is only the ground inside its Aluminum Fence now: §fthe 500-block circle is gone, so it has no ground until a fence closes round the Park Deed's spot. Exhibits outside a fence still work for their animals; guests reach them again once the fence is round them.");
    }
  }
  if (mine.length) return;
  const others = db.col("park").size > 0;
  if (others) message(player, "§6Welcome to ZooCraft! §fThis world has a zoo already; its owner can make you a keeper or manager from the Park Ledger, or claim a park of your own with a Park Deed outside its fence.");
  if (db.get("players", player.id)?.gotDeed) return;
  db.put("players", { ...db.get("players", player.id), id: player.id, gotDeed: true });
  player.getComponent("minecraft:inventory")?.container?.addItem(new ItemStack(ITEMS.parkDeed, 1));
  if (!others) message(player, "§6Welcome to ZooCraft! §fUse the Park Deed to claim your wildlife park.");
});

world.afterEvents.worldLoad.subscribe(() => {
  const loadStart = Date.now();
  initEndFence((id) => world.getDimension(id));
  try {
    const errors = validateData();
    for (const err of errors) log(`DATA ERROR: ${err}`);
    initExhibits();
    initAnimals();
    initNursery();
    initFlamingos();
    initZebras();
    initPredators();
    initLions();
    initTigers();
    initCrocs();
    initSharks();
    initGorillas();
    initGrazers();
    initBoars();
    initSnails();
    initCrabs();
    initStarbacks();
    initVisitors();
    initTutorial();
    initStaff();
    initTours();
    initRides();
    initDiscovery();
    initFence();
    initClearLavaFlow(groundChanged);
    reconcileTransport();
    on("animalOutside", ({ animal, exhibit }) => {
      for (const p of membersOnline(parkOfRecord(exhibit) ?? getPark())) message(p, `§c${animal.name} is outside ${exhibit.name}! Check the fence.`);
    });
    on("animalToHolding", ({ animal, why }) => {
      log(`${animal.name} moved to recovery holding (${why})`);
      if (why !== "unwell") return;
      for (const p of membersOnline(parkOfRecord(animal) ?? getPark())) {
        message(p, `§c${animal.name} was too unwell to stay on show and went to recovery holding. §fA Recovery Station nurses it back; then bring it back from the Park Ledger.`);
      }
    });
    on("openHolding", ({ player }) => forPlayer(player, () => holding(player)));
    on("crateFromDen", ({ player, den }) => crateFromDen(player, den));
    on("openBooth", ({ player, booth }) => boothMenu(player, booth));
    on("openStand", ({ player, stand }) => standMenu(player, stand));
    clearGuests();
  } catch (error) {
    reportError("startup", error);
  }
  setLoadMs(Date.now() - loadStart); // the benchmark readout's start-up time
  loop("clock", 20, 0, tickClock);
  loop("hud", 10, 3, tickHud);
  loop("watch", 100, 5, watch);
  loop("validate", 40, 7, serviceValidations);
  loop("save", 200, 11, () => db.checkpoint());
  loop("tutorial", 40, 13, () => forEachPark(tickTutorial));
  loop("expedition", 40, 27, () => forEachPark(tickExpedition));
  loop("conservation", 40, 35, () => forEachPark(tickConservation));
  loop("guests", 40, 17, () => forEachPark(tickGuests));
  loop("journeys", 1, 6, tickJourneys);
  loop("paths", 40, 19, () => forEachPark(tickPaths));
  loop("fence", 20, 25, tickFence);
  loop("staff", 40, 23, () => forEachPark(tickStaff));
  loop("tours", 40, 21, () => forEachPark(tickTours));
  loop("tourwalk", 1, 8, tickTourWalk);
  loop("rides", 40, 22, () => forEachPark(tickRides));
  loop("ridefly", 1, 9, tickRideFly);
  loop("ridesafety", 5, 12, tickRideSafety);
  loop("mounts", 1, 10, () => tickMounts(system.currentTick));
  loop("cities", 200, 33, () => tickCitySpawns(system.currentTick));
  loop("discovery", 10, 29, tickDiscovery);
  loop("prance", 10, 31, () => tickPrance(system.currentTick));
  loop("lavaswim", 1, 2, () => tickLavaSwim(system.currentTick));
  loop("flight", 1, 4, () => tickFlight(system.currentTick));
  loop("rift", 10, 33, () => tickRift(system.currentTick));
  loop("night", 10, 39, () => tickNight(system.currentTick));
  loop("raccoons", 10, 41, () => tickRaccoons(system.currentTick));
  loop("raccoonmove", 1, 14, tickRaccoonMoves);
  loop("flamingos", 10, 43, () => tickFlamingos(system.currentTick));
  loop("flamingomove", 1, 16, tickFlamingoMoves);
  loop("zebras", 10, 45, () => tickZebras(system.currentTick));
  loop("zebramove", 1, 18, tickZebraMoves);
  loop("predators", 10, 47, () => tickPredators(system.currentTick));
  loop("lions", 10, 49, () => tickLions(system.currentTick));
  loop("lionmove", 1, 20, tickLionMoves);
  loop("tigers", 10, 51, () => tickTigers(system.currentTick));
  loop("tigermove", 1, 22, tickTigerMoves);
  loop("tigerturns", 40, 53, tickTurns);
  loop("crocs", 10, 57, () => tickCrocs(system.currentTick));
  loop("crocmove", 1, 24, tickCrocMoves);
  loop("sharks", 10, 75, () => tickSharks(system.currentTick));
  loop("sharkmove", 1, 38, tickSharkMoves);
  loop("redpandas", 10, 59, () => tickRedPandas(system.currentTick));
  loop("redpandamove", 1, 26, tickRedPandaMoves);
  loop("gorillas", 10, 61, () => tickGorillas(system.currentTick));
  loop("gorillamove", 1, 28, tickGorillaMoves);
  loop("owls", 10, 63, () => tickOwls(system.currentTick));
  loop("owlmove", 1, 30, tickOwlMoves);
  loop("grazers", 10, 65, () => tickGrazers(system.currentTick));
  loop("grazermove", 1, 32, tickGrazerMoves);
  loop("geckos", 10, 67, () => tickGeckos(system.currentTick));
  loop("geckomove", 1, 34, tickGeckoMoves);
  loop("boars", 10, 69, () => tickBoars(system.currentTick));
  loop("boarmove", 1, 36, tickBoarMoves);
  loop("moths", 10, 71, () => tickMoths(system.currentTick));
  loop("mothmove", 1, 38, tickMothMoves);
  loop("beetles", 10, 73, () => tickBeetles(system.currentTick));
  loop("beetlemove", 1, 40, tickBeetleMoves);
  loop("hoppers", 10, 75, () => tickHoppers(system.currentTick));
  loop("hoppermove", 1, 42, tickHopperMoves);
  loop("snails", 10, 77, () => tickSnails(system.currentTick));
  loop("snailmove", 1, 44, tickSnailMoves);
  loop("crabs", 10, 79, () => tickCrabs(system.currentTick));
  loop("crabmove", 1, 46, tickCrabMoves);
  loop("chorusmoths", 10, 81, () => tickChorusMoths(system.currentTick));
  loop("chorusmothmove", 1, 48, tickChorusMothMoves);
  loop("starbacks", 10, 83, () => tickStarbacks(system.currentTick));
  loop("starbackmove", 1, 50, tickStarbackMoves);
  loop("rays", 10, 85, () => tickRays(system.currentTick)); // Giant Stingrays down to the sand (0.1.127)
  loop("raymove", 1, 52, tickRayMoves);
  loop("jellies", 10, 87, tickJellies); // a jellyfish's flash when someone swims close (0.1.127)
  loop("catfish", 10, 89, () => tickCatfish(system.currentTick)); // catfish foraging on the floor (0.1.129)
  loop("catfishmove", 1, 54, tickCatfishMoves);
  loop("manatees", 10, 91, () => tickManatees(system.currentTick)); // manatees breathing and grazing (0.1.129)
  loop("manateemove", 1, 56, tickManateeMoves);
  loop("okapis", 10, 99, () => tickOkapis(system.currentTick)); // Lush Okapis browsing, licking clay, nursing (0.1.137)
  loop("molebears", 10, 101, () => tickMolebears(system.currentTick)); // Earth Molebears tunnelling, sniffing, hiding (0.1.138)
  loop("skulkers", 10, 103, () => tickSkulkers(system.currentTick)); // Skulkers listening, walking over to sniff, resting in sculk (0.1.139)
  loop("ancientCities", 20, 107, () => tickAncientCities(system.currentTick)); // a park member walking into an Ancient City (0.1.139)
  loop("unicorns", 10, 113, () => tickUnicorns(system.currentTick)); // Unicorns grazing the glowing flowers, dipping their horns, rearing (0.1.149)
  loop("dragons", 10, 115, () => tickDragons(system.currentTick)); // Dragons flying round their hall, landing to bask, roar and breathe fire (0.1.150)
  loop("dragonmove", 1, 58, () => tickDragonMoves(system.currentTick));
  // The Deep Trench's abyss is made with the world since 0.1.133 (features/ and feature_rules/trench_*): no digging job.
  loop("places", 40, 95, tickPlaces); // the Field Journal's Places: found the Deep Trench (0.1.130)
  loop("diving", 10, 97, tickDivingHelmets); // the Diving Helmet's clear water and night vision (0.1.136)
  loop("meadows", 20, 109, tickMeadows); // the End patches' fog, particles, sounds and names (Chorus Meadow 0.1.142, Rift Willows 0.1.143); endermen sent away from the meadows
  loop("glade", 20, 111, tickGlade); // the Mythical Glade's motes, chimes and name on screen (0.1.147)
  loop("lavaburn", 5, 37, tickClearLavaBurn);
  loop("lavaflow", 1, 0, tickClearLavaFlow);
  log("ZooCraft Tycoon loaded");
});
