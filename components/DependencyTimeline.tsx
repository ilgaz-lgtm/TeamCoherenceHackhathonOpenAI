"use client";

import { FieldLabel } from "@/components/primitives";

type TimelineTask = { id: string; title: string; category: string; dependsOn: string[] };

export function DependencyTimeline({ tasks, completed }: { tasks: TimelineTask[]; completed: ReadonlySet<string> }) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  return (
    <section aria-label="Dependency map" className="mt-10 border-t border-rule pt-8">
      <FieldLabel>Dependency map</FieldLabel>
      <h2 className="mt-2 font-heading text-2xl font-semibold uppercase sm:text-3xl">What unlocks what</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">This map shows sequence, not processing-time estimates. Dates depend on authority decisions, provider availability and your own documents.</p>
      <div className="mt-8 border-b border-rule">
        {tasks.map((task, index) => {
          const waitingOn = task.dependsOn.filter((id) => !completed.has(id)).map((id) => byId.get(id)?.title ?? id);
          const unlocks = tasks.filter((item) => item.dependsOn.includes(task.id)).map((item) => item.title);
          const status = completed.has(task.id) ? "Complete" : waitingOn.length ? "Waiting" : "Ready";
          return (
            <div key={task.id} className="grid gap-3 border-t border-rule py-5 md:grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
              <span className="font-mono text-[11px] text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="font-mono text-[11px] uppercase text-ink-muted">{task.category} / {status}</span>
                <h3 className="mt-1 font-heading text-lg font-semibold uppercase">{task.title}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-mono text-[11px] uppercase text-ink-muted">Waiting on </span>{waitingOn.length ? waitingOn.join(" / ") : "Nothing; you can start now"}</p>
                {unlocks.length > 0 && <p><span className="font-mono text-[11px] uppercase text-ink-muted">Unlocks </span>{unlocks.join(" / ")}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
