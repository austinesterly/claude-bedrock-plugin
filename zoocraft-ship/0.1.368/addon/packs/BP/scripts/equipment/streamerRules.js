// The StreamerPro and the Stream Reviewer (0.1.368; Austin's notes for Austin the resident, level 100: "you can use
// it to record videos and take pictures, you can even start your own live stream on it. The more viewers you get, the
// more zoocoins you generate. Viewers toon in to more dangerous and exciting streams. And will donate every once and
// a while, you can start building a following and try to get to 1 million live viewers. You are also given a device
// to review your streams"). A stream is counted in beats (balance.js streamer.beatTicks). Each beat what is round the
// streamer makes a score; viewers move toward what that score and the following draw; some viewers follow; viewers
// earn Zoo Coins; now and then one donates. A channel: { id (player id), followers, best (peak live viewers), goal
// (day the million was reached), streams: [last few], shots: [last few photos and clips] }.
// No engine calls here.

export const newChannel = (id) => ({ id, followers: 0, best: 0, streams: [], shots: [] });

/**
 * How exciting a moment is. `f`: { animals (zoo animals close by), dangerous (of them, the dangerous kinds), inExhibit
 * (standing in a dangerous exhibit with its animals out), hostiles, boss, hurt (lost health since the last beat), low
 * (health low), far (in another dimension), riding, host (Austin the resident close by) }. Returns { score, why: [words] }.
 */
export function excitement(f, g) {
  const w = g.score;
  const parts = [
    ["animals", Math.min(f.animals ?? 0, w.animalsMax) * w.animal],
    ["dangerous animals", Math.min(f.dangerous ?? 0, w.dangerousMax) * w.dangerous],
    ["inside a dangerous exhibit", f.inExhibit ? w.inExhibit : 0],
    ["monsters", Math.min(f.hostiles ?? 0, w.hostilesMax) * w.hostile],
    ["a boss", f.boss ? w.boss : 0],
    ["getting hurt", f.hurt ? w.hurt : 0],
    ["nearly dead", f.low ? w.low : 0],
    ["another world", f.far ? w.far : 0],
    ["riding", f.riding ? w.riding : 0],
    ["a collab with Austin", f.host ? w.host : 0],
  ].filter(([, n]) => n > 0);
  return { score: parts.reduce((s, [, n]) => s + n, 0), why: parts.sort((a, b) => b[1] - a[1]).map(([k]) => k) };
}

/** The live viewers a score and a following draw. */
export function drawOf(score, followers, g) {
  return Math.round(g.basePerScore * score + followers * Math.min(g.pullMax, score * g.pullPerScore));
}

/** The viewers a beat later: they come quicker than they go. */
export function viewersNext(viewers, draw, g) {
  const rate = draw > viewers ? g.joinRate : g.leaveRate;
  const next = viewers + (draw - viewers) * rate;
  return Math.max(0, draw > viewers ? Math.ceil(next) : Math.floor(next));
}

/** New followers from a beat's viewers (a whole number; `random` settles the fraction). */
export function followsFrom(viewers, g, random = Math.random) {
  const x = viewers * g.followRate;
  return Math.floor(x) + (random() < x - Math.floor(x) ? 1 : 0);
}

/** Zoo Coins a beat's viewers earn (may be a fraction: the stream adds them up). */
export function coinsFrom(viewers, g) {
  return Math.sqrt(Math.max(0, viewers)) * g.coinsPerRoot;
}

/** A donation this beat, or undefined: { coins, from, words }. */
export function donation(viewers, score, g, random = Math.random) {
  if (viewers < g.donate.minViewers) return undefined;
  if (random() >= Math.min(g.donate.chanceMax, g.donate.chance + viewers * g.donate.chancePerViewer)) return undefined;
  const top = g.donate.min + Math.sqrt(viewers) * g.donate.perRoot * (1 + score / g.donate.scoreHalf);
  const coins = Math.max(g.donate.min, Math.round(g.donate.min + random() * (top - g.donate.min)));
  const pick = (list) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
  return { coins, from: pick(DONORS), words: pick(score >= g.donate.wildScore ? WILD_WORDS : CALM_WORDS) };
}

export const DONORS = ["CreeperHugger", "xX_ZooFan_Xx", "llama_dad", "BigCroc88", "pandaLover", "notAVillager", "sandwichTiger", "OtterQueen", "blockhead42", "KeeperKev", "moss_goblin", "TheRealAxolotl"];
export const CALM_WORDS = ["love the zoo!", "say hi to the animals for me", "more animals please", "first time here, great stream", "this is so relaxing", "what's your favourite exhibit?"];
export const WILD_WORDS = ["GET OUT OF THERE", "I can't watch. I can't look away.", "do it again!!", "this is the best stream on the platform", "clip that!", "you are completely mad"];

/** One beat of a live stream. `s`: { viewers, peak, coins (fraction kept), earned, gained, beats, donated }. */
export function streamBeat(s, facts, followers, g, random = Math.random) {
  const ex = excitement(facts, g);
  const viewers = viewersNext(s.viewers, drawOf(ex.score, followers, g), g);
  const gained = followsFrom(viewers, g, random);
  const tip = donation(viewers, ex.score, g, random);
  const coins = s.coins + coinsFrom(viewers, g) + (tip?.coins ?? 0);
  const whole = Math.floor(coins);
  return {
    stream: { ...s, viewers, peak: Math.max(s.peak, viewers), coins: coins - whole, earned: s.earned + whole, gained: s.gained + gained, beats: s.beats + 1, donated: s.donated + (tip?.coins ?? 0), top: ex.score > (s.topScore ?? 0) ? ex.why[0] : s.top, topScore: Math.max(s.topScore ?? 0, ex.score) },
    pay: whole,
    gained,
    tip,
    score: ex.score,
    why: ex.why,
  };
}

export const newStream = (day) => ({ day, viewers: 0, peak: 0, coins: 0, earned: 0, gained: 0, beats: 0, donated: 0 });

/** The channel after a stream: its row kept (the last g.keep), the following and the best peak moved on. */
export function withStream(ch, s, g, day) {
  const row = { day: s.day, seconds: Math.round((s.beats * g.beatTicks) / 20), peak: s.peak, earned: s.earned, donated: s.donated, gained: s.gained, top: s.top };
  const best = Math.max(ch.best ?? 0, s.peak);
  return { ...ch, best, goal: ch.goal ?? (best >= g.goal ? day : undefined), streams: [row, ...(ch.streams ?? [])].slice(0, g.keep) };
}

/** A photo or a clip kept on the channel: { kind, day, what, score }. */
export function withShot(ch, shot, g) {
  return { ...ch, shots: [shot, ...(ch.shots ?? [])].slice(0, g.keepShots) };
}

/** What a photo or clip shows, in words. `seen`: the names of what is close by, nearest first. */
export function shotWords(seen) {
  if (!seen?.length) return "the view";
  const uniq = [...new Set(seen)];
  return uniq.length > 3 ? `${uniq.slice(0, 3).join(", ")} and more` : uniq.length > 1 ? `${uniq.slice(0, -1).join(", ")} and ${uniq[uniq.length - 1]}` : uniq[0];
}

/** 1,234,567 */
export const count = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** The line said in chat every few beats of a stream. */
export function liveLine(s, score, why) {
  const mood = score <= 0 ? "§8Nothing is happening. Viewers are leaving." : `§7They are here for: ${why.slice(0, 2).join(", ")}.`;
  return `§c● LIVE §f${count(s.viewers)} watching §8| §e${count(s.earned)} Zoo Coins §8| §a+${count(s.gained)} followers\n${mood}`;
}

/** The lines when a stream ends. */
export function endLines(s, ch, g) {
  const out = [`§fStream over after ${clock(Math.round((s.beats * g.beatTicks) / 20))}. Peak: §f${count(s.peak)} watching§f. Earned: §e${count(s.earned)} Zoo Coins§f${s.donated ? ` §8(${count(s.donated)} donated)` : ""}. New followers: §a${count(s.gained)}§f.`];
  out.push(`§7You have ${count(ch.followers)} followers. Best ever: ${count(ch.best)} watching live${ch.goal !== undefined ? " §6(you hit a million!)" : ` §8(goal: ${count(g.goal)})`}.`);
  return out;
}

/** The Stream Reviewer's first page. */
export function reviewText(ch, g) {
  const lines = [`§fFollowers: §a${count(ch.followers ?? 0)}`, `§fBest live audience: §f${count(ch.best ?? 0)} §8of ${count(g.goal)}`, ch.goal !== undefined ? `§6One million live viewers reached on day ${ch.goal}.` : `§7Goal: ${count(g.goal)} people watching at once.`, ""];
  if (!ch.streams?.length) lines.push("§7No streams yet. Use the StreamerPro and go live.");
  else {
    lines.push("§fYour last streams:");
    for (const r of ch.streams) lines.push(`§7Day ${r.day}, ${clock(r.seconds)}: peak §f${count(r.peak)}§7, §e${count(r.earned)} coins§7, §a+${count(r.gained)}§7${r.top ? ` §8(${r.top})` : ""}`);
  }
  return lines.join("\n");
}

/** The Stream Reviewer's photos and clips page. */
export function shotsText(ch) {
  if (!ch.shots?.length) return "§7No photos or clips yet. Take one with the StreamerPro.";
  return ch.shots.map((x) => `§f${x.kind === "clip" ? "Clip" : "Photo"}§7, day ${x.day}: ${x.what}${x.score > 0 ? ` §8(excitement ${x.score})` : ""}`).join("\n");
}
