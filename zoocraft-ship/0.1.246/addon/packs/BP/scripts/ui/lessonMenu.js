// Ailing Bot's lessons (0.1.246): the list on his menu, a lesson's page with "Finish the lesson", his Lesson Notes
// (given when a lesson with notes is finished, and again for the asking when none is carried), and the Lessons chapter
// of the player's Field Journal, where every finished lesson can be read again anywhere.
import { world, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { residentById } from "../data/residents.js";
import { LESSONS, BANDS, TOPICS } from "../data/lessons.js";
import { lessonState, withLesson, finishedLessons, lessonNote, lessonText } from "../residents/lessonRules.js";
import { bondOf, saveBond } from "../residents/bonds.js";
import { bondLine } from "../residents/bondRules.js";
import { countItem, message } from "../platform/mc.js";

export const TEACHER = "ailing_bot";

/** One Lesson Notes for a lesson into the player's inventory, or at their feet. Returns whether it dropped, or undefined. */
function giveNotes(player, lesson) {
  try {
    const stack = new ItemStack(lesson.notes, 1);
    const left = player.getComponent("minecraft:inventory")?.container?.addItem(stack);
    if (left) player.dimension.spawnItem(left, player.location);
    return Boolean(left);
  } catch {
    return undefined;
  }
}

/** Finishes a lesson for a player: recorded for good, and its notes handed over the first time. Returns { first, notes, dropped }. */
export function finishLesson(player, lesson) {
  const b = bondOf(TEACHER, player.id);
  const first = lessonState(lesson, b) === "open";
  if (lessonState(lesson, b) === "locked") return undefined;
  if (first) saveBond(withLesson(b, lesson.id, world.getDay()), player);
  const dropped = first && lesson.notes ? giveNotes(player, lesson) : undefined;
  return { first, notes: first && Boolean(lesson.notes) && dropped !== undefined, dropped: Boolean(dropped) };
}

/** Another Lesson Notes for a finished lesson, when the player carries none. Returns { dropped } or undefined. */
export function notesAgain(player, lesson) {
  if (!lesson.notes || lessonState(lesson, bondOf(TEACHER, player.id)) !== "done" || countItem(player, lesson.notes) > 0) return undefined;
  const dropped = giveNotes(player, lesson);
  return dropped === undefined ? undefined : { dropped };
}

async function lessonPage(player, lesson) {
  const res = residentById(TEACHER);
  for (;;) {
    const state = lessonState(lesson, bondOf(TEACHER, player.id));
    if (state === "locked") return;
    const needs = lesson.notes ? `\n\n§8The Workshop's recipe for it needs Lesson Notes from this lesson. He gives you more when you carry none.` : "";
    const form = new ActionFormData().title(lesson.title).body(`${lessonText(lesson, BANDS, TOPICS)}${needs}`);
    const ask = state === "done" && lesson.notes && countItem(player, lesson.notes) === 0;
    if (state === "open") form.button("Finish the lesson\n§8It goes in your Field Journal");
    if (ask) form.button("Ask for Lesson Notes\n§8You carry none");
    form.button("Back");
    const r = await show(player, form);
    if (r?.selection !== 0 || (state !== "open" && !ask)) return;
    if (state === "open") {
      const got = finishLesson(player, lesson);
      if (got?.first) message(player, `§f${res?.name ?? "Ailing Bot"}: §7"${bondLine(res, "lessonDone")}" §aLesson finished: ${lesson.title}.${got.notes ? ` He gives you Lesson Notes${got.dropped ? " §8(at your feet: your inventory is full)" : ""}§a.` : ""}`);
    } else {
      const again = notesAgain(player, lesson);
      if (again) message(player, `§f${res?.name ?? "Ailing Bot"}: §7"${bondLine(res, "notesAgain")}" §aHe gives you Lesson Notes${again.dropped ? " §8(at your feet: your inventory is full)" : ""}§a.`);
    }
  }
}

/** His lessons, from his menu. */
export async function lessonsMenu(player) {
  for (;;) {
    const b = bondOf(TEACHER, player.id);
    const done = finishedLessons(LESSONS, b).length;
    const form = new ActionFormData().title("Ailing Bot's lessons").body(`§7Lessons open as your friendship grows, and a finished lesson is yours for good: it becomes a page of your Field Journal.\n\n§fFinished: ${done} of ${LESSONS.length}`);
    for (const l of LESSONS) form.button(`${l.title}\n${lessonNote(l, b)}`);
    form.button("Back");
    const r = await show(player, form);
    const l = r?.selection === undefined ? undefined : LESSONS[r.selection];
    if (!l) return;
    if (lessonState(l, b) === "locked") message(player, `§7That lesson opens at ${l.at} friendship with Ailing Bot.`);
    else await lessonPage(player, l);
  }
}

/** How many lessons a player finished, for the Field Journal's button. */
export function lessonCount(player) {
  return finishedLessons(LESSONS, bondOf(TEACHER, player.id)).length;
}

/** The Field Journal's Lessons chapter: the finished ones, to read again anywhere. */
export async function journalLessons(player) {
  for (;;) {
    const mine = finishedLessons(LESSONS, bondOf(TEACHER, player.id));
    const form = new ActionFormData().title("Lessons").body(mine.length ? "§7What Ailing Bot has taught you." : "§7Nothing yet. Ailing Bot the teacher gives lessons from his menu once he lives by your zoo; each one you finish becomes a page here.");
    for (const l of mine) form.button(`${l.title}\n§8${TOPICS[l.topic]}`);
    form.button("Back");
    const r = await show(player, form);
    const l = r?.selection === undefined ? undefined : mine[r.selection];
    if (!l) return;
    await show(player, new ActionFormData().title(l.title).body(lessonText(l, BANDS, TOPICS)).button("Back"));
  }
}
