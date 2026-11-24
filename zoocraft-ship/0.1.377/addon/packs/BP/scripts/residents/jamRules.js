// Jared's freestyles (0.1.377; Austin's notes for Jared, 24 Nov: "Jareds Occupation is at home he practices freestyles.
// Occasionally he will go to peoples homes to freestyle with them."). No engine calls here.

export const JAMMER = "jared";

/** Whether he may set off to a neighbour's now: not too many today, rested since the last, and the dice agree. */
export function jamReady(o, g, random = Math.random) {
  if (o.tripsToday >= g.perDay) return false;
  if (o.lastTick !== undefined && o.tick - o.lastTick < g.restSeconds * 20) return false;
  return random() < g.chance;
}

/** Whose home he goes to: a neighbour at home and free, not one he has been to today. Undefined with nobody. */
export function pickHost(hosts, today, random = Math.random) {
  const fresh = hosts.filter((id) => id !== JAMMER && !(today?.hosts ?? []).includes(id));
  return fresh.length ? fresh[Math.floor(random() * fresh.length)] : undefined;
}

// His bars: two lines each, about the zoo and his tall tales. Never an instruction to the player.
export const BARS = [
  ["Crocodile smile, I've been here a while,", "walked a whole mile in freestyle style."],
  ["Pufferfish puffed when I stepped in the room,", "blew up so big it could sweep like a broom."],
  ["Warden in the dark, yeah, he knows my name,", "we go way back, or at least that's my claim."],
  ["Gold on my chain and a beat in my head,", "I wrote this whole verse while I lay in my bed."],
  ["Lions on the left and the bears on the right,", "all of them listen when I sing at night."],
  ["Once rode a dolphin clear over the moon,", "true story, mostly, I'll prove it real soon."],
  ["Mailbox, doorstep, knock on the wood,", "came to your house 'cause the acoustics are good."],
  ["Penguins in tuxes, they're dressed for my show,", "front row seats in the ice and the snow."],
  ["Diamonds are shiny but rhymes shine more,", "left a few bars at the zookeeper's door."],
  ["Snakes make me nervous, I'm not gonna lie,", "I rap from a distance and wave them goodbye."],
  ["Paths made of gravel and paths made of stone,", "every last one of them leads to my home."],
  ["Elephant trumpet, that's brass in the band,", "wolves on the chorus, the best in the land."],
  ["Farm work is heavy, so I work with my voice,", "plough a whole field? Man, I'd rather rejoice."],
  ["Sun going down and the lanterns are lit,", "one more verse and then that's it."],
];

/** How a neighbour takes a bar, said about them, never by them. */
export const REACTIONS = ["{host} nods along.", "{host} claps to the beat.", "{host} taps a foot.", "{host} laughs out loud.", "{host} hums the hook back.", "{host} throws in a beat on the table."];

/** The next thing heard at a session: his bars and the neighbour's reactions, turn about. `n` counts from 0. */
export function jamBeat(n, host, random = Math.random) {
  if (n % 2 === 0) return { bar: BARS[Math.floor(random() * BARS.length)] };
  return { react: REACTIONS[Math.floor(random() * REACTIONS.length)].split("{host}").join(host) };
}
