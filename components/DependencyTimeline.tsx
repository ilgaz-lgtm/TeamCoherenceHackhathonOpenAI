"use client";

import { useMemo, useState } from "react";
type TimelineTask = { id: string; title: string; category: string; dependsOn: string[] };

const durations: Record<string, number> = { visa: 5, travel: 5, housing: 7, insurance: 4, school: 14, settling: 10 };
const green = new Set(["visa", "travel", "housing", "school"]);

function layout(tasks: TimelineTask[]) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const ends = new Map<string, number>();
  const visiting = new Set<string>();
  const endOf = (id: string): number => {
    if (ends.has(id)) return ends.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const task = byId.get(id);
    const start = task ? Math.max(0, ...task.dependsOn.map(endOf)) : 0;
    const end = start + (durations[task?.category ?? ""] ?? 5);
    visiting.delete(id); ends.set(id, end); return end;
  };
  return tasks.map((task) => { const end = endOf(task.id); const duration = durations[task.category] ?? 5; return { task, start: end - duration, end }; });
}

export function DependencyTimeline({ tasks }: { tasks: TimelineTask[] }) {
  const [active, setActive] = useState<string | null>(null);
  const rows = useMemo(() => layout(tasks), [tasks]);
  const maxDay = Math.max(100, Math.ceil(Math.max(...rows.map((row) => row.end), 0) / 10) * 10);
  const related = (id: string) => {
    const row = rows.find((item) => item.task.id === id);
    return new Set([id, ...(row?.task.dependsOn ?? []), ...rows.filter((item) => item.task.dependsOn.includes(id)).map((item) => item.task.id)]);
  };
  const highlighted = active ? related(active) : null;
  return <section aria-label="Dependency timeline" className="mt-12 border-t border-rule pt-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">02 / Timeline</span><h2 className="mt-2 type-view text-ink">Dependency timeline</h2><p className="mt-3 max-w-2xl text-sm text-ink-muted">Days from today. Hover a row to trace what it is waiting on. Durations are estimates pending verification.</p></div>
      <div className="font-mono text-[11px] uppercase text-ink-muted"><span className="mr-4 text-survey">■ Critical path</span><span>━ Task</span></div>
    </div>
    <div className="mt-8 overflow-x-auto border border-rule bg-paper-raised p-4">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[230px_minmax(520px,1fr)] border-b border-rule pb-3 font-mono text-[11px] text-ink-muted"><span>Task</span><div className="relative h-4">{Array.from({ length: maxDay / 10 + 1 }, (_, day) => <span key={day} className="absolute" style={{ left: `${(day * 10 / maxDay) * 100}%` }}>D{day * 10}</span>)}</div></div>
        {rows.map(({ task, start, end }) => { const isRelated = !highlighted || highlighted.has(task.id); return <button type="button" key={task.id} onMouseEnter={() => setActive(task.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(task.id)} onBlur={() => setActive(null)} className={`grid w-full grid-cols-[230px_minmax(520px,1fr)] items-center border-b border-rule py-3 text-left transition-opacity ${isRelated ? "opacity-100" : "opacity-25"}`}>
          <span className="pr-4"><span className="font-mono text-[11px] text-ink-muted">{task.id.toUpperCase()}</span><span className="ml-3 text-sm text-ink">{task.title}</span></span>
          <span className="relative h-6 bg-[repeating-linear-gradient(90deg,transparent,transparent_calc(10% - 1px),var(--rule)_10%)]"><span className={`absolute top-1 h-4 ${green.has(task.category) ? "bg-survey" : "bg-ink"}`} style={{ left: `${(start / maxDay) * 100}%`, width: `${Math.max(2, ((end - start) / maxDay) * 100)}%` }} /><span className="absolute top-1 ml-2 whitespace-nowrap font-mono text-[10px] text-ink-muted" style={{ left: `${((end + 1) / maxDay) * 100}%` }}>D{start}–{end}</span></span>
        </button>; })}
      </div>
    </div>
  </section>;
}
