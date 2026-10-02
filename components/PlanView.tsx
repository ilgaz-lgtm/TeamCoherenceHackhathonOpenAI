"use client";

import { useEffect, useState } from "react";
import { FieldLabel, Stamp } from "@/components/primitives";
import { MovingSteps } from "@/components/MovingSteps";
import { TaskAction } from "@/components/TaskAction";
import { ServiceBrowser } from "@/components/ServiceBrowser";
import { KnowledgePanel } from "@/components/KnowledgePanel";
import { getActionGuide } from "@/lib/ui/action-guides";
import { buildFounderTasks } from "@/lib/ui/founder-plan";
import type { EmployeeAnswers, FounderAnswers } from "@/lib/ui/personas";
import { rationaleForTask } from "@/lib/ui/rationale";
import type { RationaleContext } from "@/lib/ui/rationale";
import { buildEmployeeBlockingContext, buildEmployeeTasks } from "@/lib/ui/scope";
import type { ScopedTask } from "@/lib/ui/scope";
import { readLocal, writeLocal } from "@/lib/ui/storage";
import { validWaiting } from "@/lib/ui/steps";
import { getTaskTiming } from "@/lib/ui/timing";
import { reconcileCompleted, taskState } from "@/lib/ui/workspace";
import { formatAed } from "@/lib/ui/format";
import { serviceProviders } from "@/lib/ui/services";
import { MoveTimeSummary } from "@/components/MoveTimeSummary";
import type { Company, Employee, RelocationPlan } from "@/types/relocation";
import styles from "./PlanWorkspace.module.css";

type Common = { sampleCase?: boolean; rememberCase?: boolean; todayISO: string; housingBrief?: { budget?: number; bedrooms?: number; commuteMinutes?: number; workLocation?: string } };
type Props = Common & (
  | { viewerRole: "founder"; answers: FounderAnswers }
  | { viewerRole: "employee"; answers: EmployeeAnswers; company: Company; employee: Employee; plan: RelocationPlan }
);

export function PlanView(props: Props) {
  const founder = props.viewerRole === "founder";
  const tasks = founder ? buildFounderTasks(props.answers) : buildEmployeeTasks(props.plan, props.answers, props.company, props.employee);
  const external = founder ? [] : buildEmployeeBlockingContext(props.company, props.plan);
  const context: RationaleContext = founder ? { viewerRole: "founder", answers: props.answers } : { viewerRole: "employee", answers: props.answers, company: props.company, employee: props.employee };
  const [completed, setCompleted] = useState(() => reconcileCompleted(tasks, []));
  const [waiting, setWaiting] = useState(() => new Set(tasks.filter((task) => task.status === "in_progress").map((task) => task.id)));
  const [active, setActive] = useState("move");
  const [openedTask, setOpenedTask] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [serviceMode, setServiceMode] = useState<"business" | "everyday">("everyday");
  const [serviceCategory, setServiceCategory] = useState<string | undefined>();
  const signature = JSON.stringify({ role: props.viewerRole, answers: props.answers, housing: props.housingBrief });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (props.rememberCase && !props.sampleCase) {
      try {
        const saved: unknown = JSON.parse(readLocal("wusool.progress.v1") ?? "null");
        if (saved && typeof saved === "object" && "signature" in saved && saved.signature === signature && "completed" in saved && Array.isArray(saved.completed)) {
          const restored = reconcileCompleted(tasks, saved.completed.filter((id): id is string => typeof id === "string"), external);
          setCompleted(restored);
          if ("waiting" in saved && Array.isArray(saved.waiting)) setWaiting(validWaiting(tasks, restored, saved.waiting.filter((id): id is string => typeof id === "string")));
          if ("shortlist" in saved && Array.isArray(saved.shortlist)) setShortlist(saved.shortlist.filter((id): id is string => typeof id === "string"));
        }
      } catch { /* Invalid records cannot override a fresh case. */ }
    }
    setLoaded(true);
    // Revised cases remount this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (loaded && props.rememberCase && !props.sampleCase) setSaveFailed(!writeLocal("wusool.progress.v1", JSON.stringify({ signature, completed: [...completed], waiting: [...waiting], shortlist })));
  }, [completed, waiting, shortlist, loaded, signature, props.rememberCase, props.sampleCase]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const move = tasks.filter((task) => !founder || task.layer === "self");
  const company = tasks.filter((task) => task.layer === "company");
  const team = tasks.filter((task) => task.layer === "team");
  const targetDate = props.answers.arrivalTarget || "Not set";
  const housing = founder ? props.housingBrief : {
    budget: props.answers.housingBudgetAED ?? (props.company.policy.housingAllowanceAED || undefined),
    bedrooms: props.employee.preferences.bedrooms || undefined, commuteMinutes: props.answers.maxCommuteMinutes || undefined, workLocation: props.company.policy.officeLocation,
  };
  const topics = [
    { id: "move", label: "Your move" },
    ...(founder ? [{ id: "company", label: "Company setup" }] : []),
    { id: "services", label: "Find services" },
    { id: "answers", label: "Questions" },
  ];

  function toggleTask(id: string, checked: boolean) {
    setCompleted((previous) => {
      const proposed = new Set(previous);
      if (checked) proposed.add(id); else proposed.delete(id);
      return reconcileCompleted(tasks.map((task) => task.id === id && !checked ? { ...task, status: "pending" } : task), [...proposed], external);
    });
    setWaiting((previous) => new Set([...previous].filter((item) => item !== id)));
    if (checked) setOpenedTask(null);
  }
  function recordWaiting(id: string, value: boolean) {
    const task = tasks.find((item) => item.id === id);
    if (!task || taskState(task, tasks, completed, external).status === "blocked" || completed.has(id)) return;
    setWaiting((previous) => {
      const next = new Set(previous);
      if (value) next.add(id); else next.delete(id);
      return next;
    });
  }
  function supportCategory(task: ScopedTask) {
    return task.category === "housing" ? "housing" : task.category === "banking" ? "banking" : task.category === "insurance" ? "insurance"
      : task.category === "travel" || task.category === "settling" ? "moving"
      : founder && task.category === "workforce" ? "recruitment"
      : founder && task.id === "food-approvals" ? "food-approvals"
      : founder && task.category === "premises" && /food|coffee|café|restaurant/i.test(props.answers.businessType) ? "interiors"
      : founder && ["licensing", "visa", "tax", "premises"].includes(task.category) ? "company-setup" : undefined;
  }
  function findSupport(task: ScopedTask) {
    const category = supportCategory(task);
    if (!category) { setOpenedTask(task.id); return; }
    setServiceMode(["company-setup", "interiors", "food-approvals", "recruitment"].includes(category) ? "business" : "everyday");
    setServiceCategory(category);
    setActive("services");
    setOpenedTask(null);
  }
  function navigate(id: string) { setActive(id); setServiceCategory(undefined); }

  function exportCase() {
    const lines = [
      "WUSOOL / ABU DHABI", `Exported: ${props.todayISO}`, `Role: ${props.viewerRole}`, `Arrival target: ${targetDate}`,
      "", ...tasks.flatMap((task, index) => {
        const state = taskState(task, tasks, completed, external);
        const guide = getActionGuide(task);
        const timing = getTaskTiming(task);
        return ["", `${index + 1}. ${task.title} / ${state.status === "done" ? "Complete" : waiting.has(task.id) ? "Waiting for a reply" : state.status}`,
          rationaleForTask(task, context), task.description,
          `Time: ${timing.label}. ${timing.note}`,
          ...(state.waitingOn.length ? [`Waiting on: ${state.waitingOn.join("; ")}`] : []),
          ...(guide ? [`Where: ${guide.action.url}`, `Prepare: ${guide.whatToPrepare.join("; ")}`, `Complete when: ${guide.proofOfCompletion}`, `Source: ${guide.source.url}`] : []),
        ];
      }), "", "SHORTLISTED SERVICES",
      ...serviceProviders.filter((item) => shortlist.includes(item.id)).map((item) => `${item.name}: ${item.url}`),
      "", "Independent planning tool, not a government service. Confirm procedures with the issuing authority.",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "wusool-case.txt";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  const actionTask = tasks.find((task) => task.id === openedTask);
  const quoteBrief = `${founder && serviceMode === "business" ? `Company setup in Abu Dhabi. Business: ${props.answers.businessType}. Year-one staff: ${props.answers.headcountYearOne}.` : `Relocation in Abu Dhabi. Area: ${props.answers.preferredArea || "open"}. Annual home budget: ${housing?.budget ? formatAed(housing.budget) : "unconfirmed"}. Bedrooms: ${housing?.bedrooms || "open"}. Work location: ${housing?.workLocation || "unconfirmed"}. Commute limit: ${housing?.commuteMinutes ? housing.commuteMinutes + " minutes" : "open"}.`} Target: ${targetDate}. Please confirm scope, documents, authority and service fees separately, working days, exclusions and next availability.`;
  const sequenceProps = { all: tasks, completed, waiting, external, onComplete: (id: string) => toggleTask(id, true), onWaiting: recordWaiting, onDetails: setOpenedTask, onSupport: findSupport };

  return <div className={styles.workspace} id="plan-view">
    <nav className={styles.nav} aria-label="Plan sections">
      {topics.map((topic) => <button key={topic.id} type="button" aria-current={active === topic.id ? "page" : undefined} onClick={() => navigate(topic.id)}>{topic.label}</button>)}
    </nav>
    <div className={styles.body}>
      <header className={styles.planHeader}>
        <div><FieldLabel>{founder ? "Founder" : "Employee"} / Abu Dhabi</FieldLabel><h1>{active === "company" ? "Set up your business" : active === "services" ? "Find the right support" : active === "answers" ? "What you need to know" : "Your move, step by step"}</h1></div>
        <div className={styles.headerTools}>{props.sampleCase && <Stamp compact>Sample case</Stamp>}</div>
      </header>
      {saveFailed && <p role="status" className={styles.waiting}>Your browser could not save progress. Export your case before closing this tab.</p>}
      {active === "move" && <>
        <MoveTimeSummary items={move} all={tasks} completed={completed} external={external} targetDate={targetDate} todayISO={props.todayISO} />
        {external.length > 0 && <p className={styles.waiting}>Your employer must clear: {external.filter((item) => /licence|card/.test(item.id)).map((item) => item.title).join(" → ")}. Document, home and school research can start now.</p>}
        {founder && company.some((task) => ["licence", "establishment-card"].includes(task.id) && !completed.has(task.id)) && <div className={styles.companyGate}><p>Entry permission waits for your company licence and establishment card.</p><button type="button" onClick={() => navigate("company")}>Company setup →</button></div>}
        <MovingSteps key="move" items={move} {...sequenceProps} onCompany={founder ? () => navigate("company") : undefined} />
        <details className={styles.brief}><summary>Your home brief & saved steps</summary><p>{props.answers.preferredArea || "Area undecided"} · {housing?.budget ? `${formatAed(housing.budget)} / year` : "Budget undecided"} · {housing?.bedrooms ? `${housing.bedrooms} bedrooms` : "Bedrooms undecided"} · {housing?.commuteMinutes ? `${housing.commuteMinutes}-minute commute` : "Commute undecided"}.</p><button type="button" onClick={exportCase} className={styles.secondaryAction}>Export your steps ↓</button></details>
      </>}
      {active === "company" && <>
        <MoveTimeSummary items={company} all={tasks} completed={completed} external={external} targetDate={targetDate} todayISO={props.todayISO} />
        <MovingSteps key="company" items={company} {...sequenceProps} />
        {team.length > 0 && <details className={styles.brief}><summary>Your first {props.viewerRole === "founder" ? props.answers.headcountYearOne : ""} staff</summary><MovingSteps key="team" items={team} {...sequenceProps} /></details>}
      </>}
      {active === "services" && <>
        {founder && <div className={styles.serviceModes} aria-label="Service type">{([{ value: "everyday", label: "Everyday life" }, { value: "business", label: "For your business" }] as const).map((mode) => <button type="button" key={mode.value} aria-pressed={mode.value === serviceMode} onClick={() => { setServiceMode(mode.value); setServiceCategory(undefined); }}>{mode.label}</button>)}</div>}
        <ServiceBrowser key={`${serviceMode}-${serviceCategory ?? "all"}`} role={props.viewerRole} businessType={founder ? props.answers.businessType : undefined} mode={serviceMode} initialCategory={serviceCategory} quoteBrief={quoteBrief} shortlist={shortlist} onShortlist={(id) => setShortlist((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])} />
      </>}
      {active === "answers" && <KnowledgePanel role={props.viewerRole} />}
    </div>
    {actionTask && <TaskAction key={actionTask.id} task={actionTask} tasks={tasks} completed={completed} external={external} context={context} onClose={() => setOpenedTask(null)} onToggle={toggleTask} onFindSupport={supportCategory(actionTask) ? () => findSupport(actionTask) : undefined} />}
  </div>;
}
