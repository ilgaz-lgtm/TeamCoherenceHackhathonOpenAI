import type { BlockingContext, ScopedTask } from "./scope";
import { blockingTasks } from "./scope";
import { dayFromToday } from "./onboarding";

export function taskState(task: ScopedTask, tasks: ScopedTask[], completed: ReadonlySet<string>, external: BlockingContext[] = []) {
  if (completed.has(task.id)) return { status: "done" as const, waitingOn: [] as string[] };
  const waitingOn = blockingTasks(task, tasks, completed).map((item) => item.title);
  if (task.id === "visa" && external.length) {
    waitingOn.push(...external.filter((item) => /licence|card/.test(item.id)).map((item) => item.title));
  }
  return { status: waitingOn.length ? "blocked" as const : task.status === "in_progress" ? "in_progress" as const : "ready" as const, waitingOn };
}

export function reconcileCompleted(tasks: ScopedTask[], saved: readonly string[], external: BlockingContext[] = []): Set<string> {
  const confirmed = new Set(tasks.filter((task) => task.status === "completed").map((task) => task.id));
  const completed = new Set([...confirmed, ...saved.filter((id) => tasks.some((task) => task.id === id))]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const task of tasks) {
      if (completed.has(task.id) && !confirmed.has(task.id)) {
        const withoutTask = new Set(completed);
        withoutTask.delete(task.id);
        if (taskState(task, tasks, withoutTask, external).status === "blocked") {
          completed.delete(task.id);
          changed = true;
        }
      }
    }
  }
  return completed;
}

export function targetSummary(target: string | undefined, today: string) {
  const days = target ? dayFromToday(target, today) : NaN;
  if (!Number.isFinite(days)) return { label: "Target not set", detail: "Choose an arrival date to brief providers.", days: undefined };
  const label = days < 0 ? `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} past target` : days === 0 ? "Target is today" : `${days} ${days === 1 ? "day" : "days"} to target`;
  return { label, detail: "Entry clearance, a usable home and school placement are separate gates. Confirm their dates before booking.", days };
}
