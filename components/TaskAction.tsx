"use client";

import { useEffect, useRef } from "react";
import { FieldLabel } from "@/components/primitives";
import { getActionGuide } from "@/lib/ui/action-guides";
import { rationaleForTask } from "@/lib/ui/rationale";
import type { RationaleContext } from "@/lib/ui/rationale";
import type { BlockingContext, ScopedTask } from "@/lib/ui/scope";
import { taskState } from "@/lib/ui/workspace";
import styles from "./PlanWorkspace.module.css";

export function TaskAction({ task, tasks, completed, external, context, onClose, onToggle, onFindSupport }: {
  task: ScopedTask; tasks: ScopedTask[]; completed: ReadonlySet<string>; external: BlockingContext[]; context: RationaleContext;
  onClose: () => void; onToggle: (id: string, checked: boolean) => void;
  onFindSupport?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const guide = getActionGuide(task);
  const state = taskState(task, tasks, completed, external);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className={styles.dialog} onCancel={onClose} onClose={onClose} aria-labelledby="action-title">
    <div className="flex items-center justify-between gap-5 border-b border-ink pb-4">
      <FieldLabel>{task.category} / {state.status === "done" ? "Recorded complete" : state.status.replaceAll("_", " ")}</FieldLabel>
      <button type="button" autoFocus onClick={onClose} aria-label="Close action" className="flex h-11 w-11 items-center justify-center text-2xl">×</button>
    </div>
    <h2 id="action-title" className="mt-8 font-heading text-3xl font-semibold uppercase leading-tight">{task.title}</h2>
    <p className="mt-5 border-l-2 border-ink pl-4 text-base">{rationaleForTask(task, context)}</p>
    <p className="mt-5 text-sm text-ink-muted">{task.description}</p>
    {state.waitingOn.length > 0 && <p className="mt-6 border-y border-rule py-4 font-mono text-xs">WAITING ON: {state.waitingOn.join(" / ")}</p>}
    {guide && <>
      <section className="mt-8 border-t border-rule pt-5">
        <FieldLabel>{state.status === "in_progress" ? "Track your existing application" : "Where to do this"}</FieldLabel>
        <a href={guide.action.url} target="_blank" rel="noopener noreferrer" className="mt-3 block w-fit border-b border-accent py-2 text-sm font-medium">{guide.action.label} ↗</a>
        {state.status === "in_progress" && <p className="mt-3 text-sm text-ink-muted">Use the existing application reference to check status. Record the authority decision before proceeding.</p>}
        {guide.discover.length > 0 && <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">{guide.discover.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="border-b border-rule py-1 text-sm">{link.label} ↗</a>)}</div>}
        {onFindSupport && <button type="button" onClick={onFindSupport} className="mt-5 min-h-11 border-b border-accent font-mono text-xs uppercase">Find providers for this step →</button>}
      </section>
      <section className="mt-8 border-t border-rule pt-5"><FieldLabel>Before you apply or ask for a quote</FieldLabel><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{guide.whatToPrepare.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="mt-8 border-t border-rule pt-5"><FieldLabel>Time and fees</FieldLabel>
        {guide.publishedServiceTime ? <>
          <a href={guide.publishedServiceTime.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block w-fit border-b border-rule py-2 font-mono text-sm">{guide.publishedServiceTime.label} ↗</a>
          <p className="mt-3 text-xs text-ink-muted">{guide.publishedServiceTime.conditions}</p>
        </> : <p className="mt-3 text-sm">No case-specific duration is confirmed. Request a dated estimate that includes preparation, appointments and any rework.</p>}
        <p className="mt-3 text-xs text-ink-muted">Get authority fees, service fees and refundable deposits separately in writing. A published service duration does not cover the entire move.</p>
      </section>
      <section className="mt-8 border-t border-rule pt-5"><FieldLabel>What confirms this step</FieldLabel><p className="mt-3 text-sm">{guide.proofOfCompletion}</p>
        <label className="mt-5 flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" checked={state.status === "done"} disabled={state.status === "blocked" || task.status === "completed"} onChange={(event) => onToggle(task.id, event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-survey" />{task.status === "completed" ? "Confirmed in your intake. Revise the intake to change this status." : "I have this evidence. Record the step as complete."}</label>
        <p className="mt-2 text-xs text-ink-muted">This is your record, not an authority verification.</p>
      </section>
      <section className="mt-8 border-t border-rule pt-5"><FieldLabel>Source and conditions</FieldLabel><p className="mt-3 text-sm text-ink-muted">{guide.caveat}</p><a href={guide.source.url} target="_blank" rel="noopener noreferrer" className="mt-4 block w-fit border-b border-rule py-2 text-xs">{guide.source.title} ↗</a></section>
    </>}
  </dialog>;
}
