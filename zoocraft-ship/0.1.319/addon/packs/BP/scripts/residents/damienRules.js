// Damien (0.1.319; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, sections 5 phase 4 and 6): the
// Void Dragon's true self. Once the dragon has transformed, a wizard all in black and white stands frozen by the
// Overworld's Void Portal (Darian's spell). He can speak: using him starts the revelation, and then the player's
// choice: he joins the village (a resident like any other, data/residents.js "damien"), or he is put on exhibit in the
// zoo, where every time he is used he asks to be released, and can be. One Damien, ever: the world's quest record
// (residents/darianRules.js) says where he is, in `damien`: { state, d, x, y, z }.
// His full profile, what he likes, his work, his gifts and what comes with his friendship are NOT decided (the spec:
// TBD): none is made up here. No engine calls here.

export const DAMIEN_ID = "damien";
export const DAMIEN_BODY = "zoocraft:damien"; // the frozen and the exhibited wizard (the villager is a resident's body)
export const EXHIBIT_KIT = "zoocraft:wizard_exhibit_kit";
export const PEN_FENCE = "minecraft:nether_brick_fence";
export const PEN = { r: 2, height: 2 }; // the exhibit: a fence ring 5 by 5, he in the middle

/**
 * Where Damien's story stands: "none" (the dragon hasn't transformed), "frozen" (by the portal, his story untold),
 * "revealed" (told; no choice made), "sentenced" (to be exhibited; still by the portal till the kit is used),
 * "exhibit", "village".
 */
export function damienStage(rec) {
  const has = (s) => rec?.states?.[s] !== undefined;
  if (!has("DRAGON_TRANSFORMED")) return "none";
  if (has("DAMIEN_RECRUITED")) return "village";
  const st = rec?.damien?.state;
  if (st === "exhibit" || st === "sentenced") return st;
  return has("DAMIEN_REVEALED") ? "revealed" : "frozen";
}

/** Whether a body of his stands in the world at this stage, and whether the spell holds it. */
export const hasBody = (stage) => stage === "frozen" || stage === "revealed" || stage === "sentenced" || stage === "exhibit";
export const isFrozen = (stage) => stage === "frozen" || stage === "revealed" || stage === "sentenced";

/** The exhibit round the ground block `c`: its fence cells (a ring, one block up), the ground under it all, the room it needs. */
export function penPlan(c, k = PEN) {
  const fence = [];
  const ground = [];
  const room = [];
  for (let x = -k.r; x <= k.r; x++) {
    for (let z = -k.r; z <= k.r; z++) {
      ground.push({ x: c.x + x, y: c.y, z: c.z + z });
      for (let y = 1; y <= k.height; y++) room.push({ x: c.x + x, y: c.y + y, z: c.z + z });
      if (Math.max(Math.abs(x), Math.abs(z)) === k.r) fence.push({ x: c.x + x, y: c.y + 1, z: c.z + z });
    }
  }
  return { fence, ground, room, stand: { x: c.x + 0.5, y: c.y + 1, z: c.z + 0.5 }, corners: [[-k.r, -k.r], [-k.r, k.r], [k.r, -k.r], [k.r, k.r]].map(([x, z]) => ({ x: c.x + x, y: c.y, z: c.z + z })) };
}

/**
 * Whether the exhibit can go round the ground block `c`: "ok", or why not: "stage" (he isn't waiting for one), "top"
 * (the kit wasn't used on the top of a block), "park" (not all inside a zoo), "ground" (the 5 by 5 isn't solid
 * ground), "room" (something stands in it: only air is built into), "stand" (a player stands where the fence goes).
 * @param {{ stage: string, face: string, inPark: (p) => boolean, solid: (p) => boolean, air: (p) => boolean, players: {x:number,z:number,y:number}[] }} o
 */
export function penCheck(c, o, k = PEN) {
  if (o.stage !== "sentenced") return "stage";
  if (o.face !== "Up") return "top";
  const plan = penPlan(c, k);
  if (![c, ...plan.corners].every((p) => o.inPark(p))) return "park";
  if (!plan.ground.every((p) => o.solid(p))) return "ground";
  if (!plan.room.every((p) => o.air(p))) return "room";
  const near = (p) => Math.abs(p.x - (c.x + 0.5)) <= k.r + 0.8 && Math.abs(p.z - (c.z + 0.5)) <= k.r + 0.8 && Math.abs(p.y - (c.y + 1)) < 3;
  if (o.players.some(near)) return "stand";
  return "ok";
}

export const PEN_TEXT = {
  stage: "§7There is nobody waiting for an exhibit.",
  top: "§7Use the kit on the ground: on the top of a block.",
  park: "§cHis exhibit has to stand inside your zoo: all 5 by 5 blocks of it inside the park's fence.",
  ground: "§cHis exhibit needs flat, solid ground: 5 by 5 blocks round the block you use the kit on.",
  room: "§cSomething is in the way. The exhibit is built only into empty air: 5 by 5 blocks, two high.",
  stand: "§cStep back first: you (or someone) are standing where the fence goes.",
};

/** What he says. The story is the spec's section 6, in his words; each piece is one page of the talk screen. */
export const DAMIEN_LINES = {
  reveal: [
    "Wait. Please. I cannot move, but I can speak, so let me speak. I am not that beast. I never was.",
    "I come from the End. There I found a way to change my shape into other creatures, with the energy of End Crystals and the energy of the Void.",
    "It worked. I became one creature, then another, and I came back each time. Then I became the great dragon, and something went terribly wrong.",
    "I lost my mind to it. My thoughts, my will, all of it. I saw everything it did, and I remember everything. I could not stop any of it.",
    "I was trapped inside a ravenous beast. It went on terrorizing the world, and none of it was with my consent.",
    "When you weakened it, you broke its hold on me. I knew myself again. That is why I changed back into a wizard, and why I ran.",
  ],
  mercy: "I am begging you. Have mercy on me.",
  mercyAgain: "You have heard what I am. I beg you again: mercy.",
  sentenced: "An exhibit, then. I understand why. I only ask you to think on it once more.",
  exhibit: [
    "Please, let me out. I had no control over what the dragon destroyed. I promise you, I would never willingly have caused it.",
    "Release me, I ask you again. I could not stop the dragon. I would never have brought that ruin on anyone willingly. I promise.",
    "Will you let me go? It was the beast that burned and broke, and I had no say in it. I promise I would never have done it willingly.",
  ],
  left: "Then I will wait. I have had practice.",
  joined: "Thank you. I will not waste this. My name is Damien.",
  released: "Thank you. I meant every word of that promise. My name is Damien.",
};

/** What the player is offered at each stage: [id, label] in order. */
export function choicesAt(stage) {
  if (stage === "revealed") return [["join", "Let him join the village"], ["exhibit", "Put him on exhibit"], ["again", "Hear him again"]];
  if (stage === "sentenced") return [["join", "Let him join the village"], ["wait", "Keep to the exhibit"]];
  if (stage === "exhibit") return [["join", "Release him"], ["wait", "Leave him here"]];
  return [];
}
