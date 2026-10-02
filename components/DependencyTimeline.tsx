"use client";

import { FieldLabel } from "@/components/primitives";
import type { BlockingContext, ScopedTask } from "@/lib/ui/scope";
import { taskState } from "@/lib/ui/workspace";
import { getActionGuide } from "@/lib/ui/action-guides";

export function DependencyTimeline({ tasks, completed, externalBlockers = [], onOpen }: { tasks: ScopedTask[]; completed: ReadonlySet<string>; externalBlockers?: BlockingContext[]; onOpen?: (id: string) => void }) {
  return (
    <section aria-label="Dependency map" className="mt-10 border-t border-rule pt-8">
      <FieldLabel>Dependency map</FieldLabel>
      <h2 className="mt-2 font-heading text-2xl font-semibold uppercase sm:text-3xl">What unlocks what</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">This map shows sequence, not processing-time estimates. Dates depend on authority decisions, provider availability and your own documents.</p>
      <div className="mt-8 border-b border-rule">
        {tasks.map((task, index) => {
          const state = taskState(task, tasks, completed, externalBlockers);
          const publishedTime = getActionGuide(task)?.publishedServiceTime;
          const waitingOn = state.waitingOn;
          const unlocks = tasks.filter((item) => item.dependsOn.includes(task.id)).map((item) => item.title);
          const status = state.status === "done" ? "Recorded complete" : state.status.replaceAll("_", " ");
          return (
            <div key={task.id} className="grid gap-3 border-t border-rule py-5 md:grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
              <span className="font-mono text-[11px] text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="font-mono text-[11px] uppercase text-ink-muted">{task.category} / {status}</span>
                <h3 className="mt-1 font-heading text-lg font-semibold uppercase">{onOpen ? <button type="button" onClick={() => onOpen(task.id)} className="min-h-11 text-left hover:underline">{task.title}</button> : task.title}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-mono text-[11px] uppercase text-ink-muted">{state.status === "done" ? "Evidence " : "Waiting on "}</span>{state.status === "done" ? "Recorded in your case" : waitingOn.length ? waitingOn.join(" / ") : state.status === "in_progress" ? "Authority decision on the filed application" : "Nothing; you can start now"}</p>
                {unlocks.length > 0 && <p><span className="font-mono text-[11px] uppercase text-ink-muted">Unlocks </span>{unlocks.join(" / ")}</p>}
                {publishedTime && <a href={publishedTime.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-xs underline">{publishedTime.label} · service only ↗</a>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
