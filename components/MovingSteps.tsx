"use client";

import { useEffect, useRef, useState } from "react";
import { getActionGuide, quickActionLinks } from "@/lib/ui/action-guides";
import type { BlockingContext, ScopedTask } from "@/lib/ui/scope";
import { currentStep, orderedSteps, stepPhase, stepTitle } from "@/lib/ui/steps";
import { getTaskTiming, stepTimingLabel } from "@/lib/ui/timing";
import { taskState } from "@/lib/ui/workspace";
import styles from "./PlanWorkspace.module.css";

export function MovingSteps({ items, all, completed, waiting, external, onComplete, onWaiting, onDetails, onSupport, onCompany }: {
  items: ScopedTask[]; all: ScopedTask[]; completed: ReadonlySet<string>; waiting: ReadonlySet<string>; external: BlockingContext[];
  onComplete: (id: string) => void; onWaiting: (id: string, value: boolean) => void;
  onDetails: (id: string) => void; onSupport: (task: ScopedTask) => void; onCompany?: () => void;
}) {
  const steps = orderedSteps(items);
  const current = currentStep(steps, all, completed, waiting, external);
  const [preview, setPreview] = useState<{ id: string; revision: string } | null>(null);
  const advance = useRef(false);
  const currentButton = useRef<HTMLButtonElement>(null);
  const revision = [...completed].sort().join(",") + ";" + [...waiting].sort().join(",");
  const active = preview?.revision === revision ? preview.id : current?.id;
  useEffect(() => {
    if (advance.current) {
      currentButton.current?.focus({ preventScroll: true });
      currentButton.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
      advance.current = false;
    }
  }, [current?.id]);

  function complete(id: string) {
    advance.current = true;
    setPreview(null);
    onComplete(id);
  }
  function wait(id: string, value: boolean) {
    advance.current = true;
    setPreview(null);
    onWaiting(id, value);
  }

  return <>
    <p className={styles.announcement} role="status">{current ? `Next: ${stepTitle(current)}` : "Every step is recorded complete. Keep the documents and authority decisions together."}</p>
    <ol className={styles.steps} aria-label="Ordered steps">
      {steps.map((task, index) => {
        const state = taskState(task, all, completed, external);
        const done = state.status === "done";
        const pendingReply = !done && waiting.has(task.id);
        const isCurrent = task.id === current?.id;
        const expanded = task.id === active;
        const guide = getActionGuide(task);
        const timing = getTaskTiming(task);
        const outside = task.dependsOn.some((id) => !items.some((item) => item.id === id) && !completed.has(id));
        return <li key={task.id} className={`${styles.step} ${isCurrent ? styles.stepCurrent : ""} ${done ? styles.stepDone : ""}`}>
          <button ref={isCurrent ? currentButton : undefined} type="button" className={styles.stepHeader} aria-expanded={expanded} aria-controls={`step-${task.id}`} aria-current={isCurrent ? "step" : undefined} onClick={() => setPreview({ id: expanded ? "" : task.id, revision })}>
            <span className={styles.stepNumber}>{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <span className={styles.stepHeading}><span className={styles.stepStatus}>{stepPhase(task)} · {done ? "Done" : state.status === "blocked" ? "Waiting on a step" : pendingReply ? "Waiting for a reply" : isCurrent ? "Do next" : "Upcoming"}</span><span className={styles.stepTitle}>{stepTitle(task)}</span></span>
            <span className={styles.stepTime}><span>{done ? "Complete" : stepTimingLabel(task)}</span><span>{expanded ? "−" : "+"}</span></span>
          </button>
          {expanded && <div id={`step-${task.id}`} className={styles.stepContent}>
            {state.waitingOn.length > 0 && <div className={styles.waiting}><p>Waiting on: {state.waitingOn.map((title) => { const blocker = all.find((item) => item.title === title); return blocker ? stepTitle(blocker) : title; }).join(" · ")}</p>{outside && onCompany && <button type="button" onClick={onCompany}>Open company setup →</button>}</div>}
            {guide && <>
              <div className={styles.stepWork}>
                <div><h3>You will need</h3><ul>{guide.whatToPrepare.map((item) => <li key={item}>{item}</li>)}</ul></div>
                <div><h3>Where to do it</h3>{quickActionLinks(task).map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.actionLink}>{link.label} ↗</a>)}<button type="button" onClick={() => onSupport(task)} className={styles.supportLink}>Get support →</button></div>
              </div>
              <details className={styles.timeDetails}><summary>About this duration</summary><p>{timing.note}</p>{timing.sourceUrl && <a href={timing.sourceUrl} target="_blank" rel="noopener noreferrer">Authority guidance ↗</a>}</details>
              <div className={styles.completion}>
                <p>{guide.proofOfCompletion}</p>
                <div className={styles.stepCommands}>
                  {!done && <button type="button" disabled={state.status === "blocked"} onClick={() => complete(task.id)} className={styles.primaryAction}>I have this — next step →</button>}
                  {!done && state.status !== "blocked" && <button type="button" onClick={() => wait(task.id, !pendingReply)} className={styles.secondaryAction}>{pendingReply ? "Resume this step" : "Waiting for a reply"}</button>}
                  <button type="button" onClick={() => onDetails(task.id)} className={styles.secondaryAction}>Documents & details</button>
                </div>
              </div>
            </>}
          </div>}
        </li>;
      })}
    </ol>
  </>;
}
