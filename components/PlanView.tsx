"use client";

import { useEffect, useState } from "react";
import { FieldLabel, PlanDataGrid, Stamp, TaskRoomGrid } from "@/components/primitives";
import type { TaskRoomData } from "@/components/primitives/TaskRoom";
import { DependencyTimeline } from "@/components/DependencyTimeline";
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
import { reconcileCompleted, targetSummary, taskState } from "@/lib/ui/workspace";
import { formatAed } from "@/lib/ui/format";
import { serviceProviders } from "@/lib/ui/services";
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
  const [active, setActive] = useState("overview");
  const [openedTask, setOpenedTask] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [serviceCategory, setServiceCategory] = useState<string | undefined>();
  const signature = founder ? `founder:${props.answers.name}:${props.answers.businessName}` : `employee:${props.employee.name}:${props.answers.employerName}`;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (props.rememberCase && !props.sampleCase) {
      try {
        const saved: unknown = JSON.parse(readLocal("wusool.progress.v1") ?? "null");
        if (saved && typeof saved === "object" && "signature" in saved && saved.signature === signature && "completed" in saved && Array.isArray(saved.completed)) {
          setCompleted(reconcileCompleted(tasks, saved.completed.filter((id): id is string => typeof id === "string"), external));
          if ("shortlist" in saved && Array.isArray(saved.shortlist)) setShortlist(saved.shortlist.filter((id): id is string => typeof id === "string"));
        }
      } catch { /* Invalid records cannot override a fresh case. */ }
    }
    setLoaded(true);
    // Revised cases remount this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (loaded && props.rememberCase && !props.sampleCase) setSaveFailed(!writeLocal("wusool.progress.v1", JSON.stringify({ signature, completed: [...completed], shortlist })));
  }, [completed, shortlist, loaded, signature, props.rememberCase, props.sampleCase]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const name = founder ? props.answers.name : props.employee.name;
  const organisation = founder ? props.answers.businessName : props.answers.employerName;
  const target = targetSummary(props.answers.arrivalTarget, props.todayISO);
  const ready = tasks.filter((task) => ["ready", "in_progress"].includes(taskState(task, tasks, completed, external).status));
  const next = ready.find((task) => taskState(task, tasks, completed, external).status === "ready") ?? ready[0];
  const targetDate = props.answers.arrivalTarget || "Not set";
  const housing = founder ? props.housingBrief : {
    budget: props.answers.housingBudgetAED ?? (props.company.policy.housingAllowanceAED || undefined),
    bedrooms: props.employee.preferences.bedrooms || undefined, commuteMinutes: props.answers.maxCommuteMinutes || undefined, workLocation: props.company.policy.officeLocation,
  };
  const topics = [
    { id: "overview", label: "Your next steps" }, { id: "actions", label: "All actions" },
    ...(founder ? [{ id: "business", label: "Business services" }] : []),
    { id: "home", label: "Home & family" }, { id: "everyday", label: "Everyday life" },
    { id: "dependencies", label: "Dependencies" }, { id: "answers", label: "Questions & answers" },
  ];
  const relevantTasks = active === "home" ? tasks.filter((task) => ["housing", "school", "insurance", "settling", "travel"].includes(task.category)) : tasks;
  const visibleTasks = relevantTasks.filter((task) => {
    const state = taskState(task, tasks, completed, external);
    return (filter === "all" || filter === "ready" && ["ready", "in_progress"].includes(state.status) || filter === state.status)
      && `${task.title} ${task.category} ${task.description}`.toLowerCase().includes(query.toLowerCase());
  });
  const room = (task: ScopedTask): TaskRoomData => {
    const state = taskState(task, tasks, completed, external);
    const downstream = tasks.filter((item) => item.dependsOn.includes(task.id)).length;
    return { id: task.id, category: task.category, title: task.title, description: task.description, rationale: rationaleForTask(task, context), status: state.status, waitingOn: state.waitingOn, columns: downstream >= 2 ? 7 : task.category === "housing" || task.category === "school" ? 5 : 4, bridge: downstream >= 2 };
  };
  function rooms(items: ScopedTask[]): TaskRoomData[] {
    const weight = (task: ScopedTask) => tasks.filter((item) => item.dependsOn.includes(task.id)).length * 2 + (task.category === "school" ? 1 : 0);
    return items.map((task, index) => {
      const partner = items[index % 2 ? index - 1 : index + 1];
      const columns = !partner ? 12 : weight(task) === weight(partner) ? 6 : weight(task) > weight(partner) ? 7 : 5;
      return { ...room(task), columns };
    });
  }

  function toggleTask(id: string, checked: boolean) {
    setCompleted((previous) => {
      const proposed = new Set(previous);
      if (checked) proposed.add(id); else proposed.delete(id);
      return reconcileCompleted(tasks.map((task) => task.id === id && !checked ? { ...task, status: "pending" } : task), [...proposed], external);
    });
  }

  function exportCase() {
    const lines = [
      "WUSOOL / ABU DHABI", `Exported: ${props.todayISO}`, `${name} / ${organisation}`,
      `Role: ${props.viewerRole}`, `Arrival target: ${targetDate}`, `Area preference: ${props.answers.preferredArea || "Undecided"}`,
      `Annual rent budget: ${housing?.budget ? formatAed(housing.budget) : "Not confirmed"}`,
      `Bedrooms: ${housing?.bedrooms ?? "Undecided"} / Commute limit: ${housing?.commuteMinutes ? housing.commuteMinutes + " minutes" : "Undecided"}`,
      "", "ACTIONS", ...tasks.flatMap((task, index) => {
        const state = taskState(task, tasks, completed, external);
        const guide = getActionGuide(task);
        return [
          "", `${index + 1}. ${task.title} / ${state.status === "done" ? "Recorded complete" : state.status.replaceAll("_", " ")}`,
          rationaleForTask(task, context), task.description,
          ...(state.waitingOn.length ? [`Waiting on: ${state.waitingOn.join("; ")}`] : []),
          ...(guide ? [
            `Where: ${guide.action.label} - ${guide.action.url}`, `Prepare: ${guide.whatToPrepare.join("; ")}`,
            `Complete when: ${guide.proofOfCompletion}`,
            ...(guide.publishedServiceTime ? [`Time: ${guide.publishedServiceTime.label}. ${guide.publishedServiceTime.conditions}`] : ["Duration: confirm a dated estimate with the authority or provider."]),
            `Source: ${guide.source.title} - ${guide.source.url}`, guide.caveat,
          ] : []),
        ];
      }), "", "SHORTLISTED SERVICES",
      ...serviceProviders.filter((item) => shortlist.includes(item.id)).map((item) => `${item.name}: ${item.url}`),
      "", "Independent planning tool, not a government service. Confirm procedures with the issuing authority. Completion is your own record.",
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "wusool-case.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  const actionTask = tasks.find((task) => task.id === openedTask);
  const supportCategory = actionTask ? (
    actionTask.category === "housing" ? "housing" : actionTask.category === "banking" ? "banking" : actionTask.category === "insurance" ? "insurance"
    : actionTask.category === "travel" || actionTask.category === "settling" ? "moving"
    : founder && actionTask.category === "workforce" ? "recruitment"
    : founder && actionTask.id === "food-approvals" ? "food-approvals"
    : founder && actionTask.category === "premises" && /food|coffee|café|restaurant/i.test(props.answers.businessType) ? "interiors"
    : founder && ["licensing", "visa", "tax", "premises"].includes(actionTask.category) ? "company-setup" : undefined
  ) : undefined;
  function findSupport() {
    setActive(["company-setup", "interiors", "food-approvals", "recruitment"].includes(supportCategory ?? "") ? "business" : "everyday");
    setServiceCategory(supportCategory);
    setOpenedTask(null);
  }
  function navigate(id: string) {
    setActive(id);
    setServiceCategory(undefined);
    setQuery("");
    setFilter("all");
  }
  const quoteBrief = `${founder ? "Company setup" : "Relocation"} in Abu Dhabi. ${founder ? `Business: ${props.answers.businessType}. Year-one staff: ${props.answers.headcountYearOne}.` : "Employee relocation."} Target: ${targetDate}. Please confirm the scope, documents, authority fees separately from service fees, expected working days, exclusions, cancellation terms and the next available appointment.`;

  return <div className={styles.workspace} id="plan-view">
    <nav className={styles.nav} aria-label="Workspace sections">
      {topics.map((topic, index) => <button key={topic.id} type="button" aria-current={active === topic.id ? "page" : undefined} onClick={() => navigate(topic.id)}><span>{String(index + 1).padStart(2, "0")}</span>{topic.label}</button>)}
    </nav>
    <label className={styles.mobileNav}>Workspace
      <select value={active} onChange={(event) => navigate(event.target.value)} aria-label="Workspace section">{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}</select>
    </label>
    <div className={styles.body}>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink pb-6">
        <div><FieldLabel>{founder ? "Founder" : "Employee"} / Abu Dhabi</FieldLabel><h1 className="mt-2 font-heading text-3xl font-semibold uppercase leading-tight sm:text-4xl">{name}</h1><p className="mt-2 text-sm text-ink-muted">{organisation}</p></div>
        <div className="flex flex-wrap items-center gap-4">{props.sampleCase && <Stamp compact>Sample case</Stamp>}<button type="button" onClick={exportCase} className={`${styles.noPrint} min-h-11 border-b border-rule font-mono text-[11px] uppercase`}>Export case ↓</button></div>
      </header>
      {saveFailed && <p role="status" className="mt-4 text-sm">Your browser could not save progress. Export your case before closing this tab.</p>}
      {active === "overview" && <>
        <div className="mt-6"><PlanDataGrid cells={[
          { key: "target", label: "Arrival target", value: targetDate },
          { key: "count", label: "Your progress", value: `${completed.size} / ${tasks.length} recorded complete` },
          { key: "available", label: "Available to work on", value: `${ready.length} actions` },
          { key: "area", label: "Area preference", value: props.answers.preferredArea || "Open — choose against work and school" },
        ]} /></div>
        <section className="mt-8 grid gap-5 border-y border-ink py-6 md:grid-cols-[1.5fr_1fr]" aria-label="Next action">
          <div><FieldLabel>{next?.status === "in_progress" ? "Application in progress" : "Your next available action"}</FieldLabel>
            <h2 className="mt-3 font-heading text-3xl font-semibold uppercase leading-tight">{next?.title ?? (completed.size === tasks.length ? "All steps recorded" : "Resolve the blocking files")}</h2>
            <p className="mt-4 text-base">{next ? rationaleForTask(next, context) : "Review the evidence and confirm outstanding decisions with the issuing authority."}</p>
            {next && <button type="button" onClick={() => setOpenedTask(next.id)} className="mt-5 min-h-11 border-b border-accent font-mono text-xs uppercase">{next.status === "in_progress" ? "Track this file" : "Open the action and its channels"} →</button>}
          </div>
          <div className="border-t border-rule pt-4 md:border-t-0 md:border-l md:pl-5 md:pt-0"><FieldLabel>{target.label}</FieldLabel><p className="mt-3 text-sm text-ink-muted">{target.detail}</p><p className="mt-4 text-xs text-ink-muted">Processing times need authority confirmation. Ask service providers for a dated estimate with dependencies and exclusions.</p></div>
        </section>
        {external.length > 0 && <div className="mt-6 border-l-2 border-ink pl-4"><FieldLabel>Employer-owned blocking context</FieldLabel><p className="mt-2 text-sm">{external.filter((item) => /licence|card/.test(item.id)).map((item) => item.title).join(" → ")}</p></div>}
        <section className="mt-8"><div className="mb-4 flex flex-wrap items-baseline justify-between gap-3"><h2 className="font-heading text-xl font-semibold uppercase">Prepare in parallel</h2><button type="button" onClick={() => setActive("actions")} className="min-h-11 border-b border-rule font-mono text-[11px] uppercase">All actions →</button></div>
          <TaskRoomGrid tasks={rooms(ready.filter((task) => task.id !== next?.id).slice(0, 4))} onOpen={setOpenedTask} />
          {ready.length <= 1 && <p className="text-sm text-ink-muted">The dependency map names what must clear before the remaining actions open.</p>}
        </section>
        <section className="mt-8 grid gap-6 border-t border-rule pt-6 sm:grid-cols-[1.25fr_1fr]"><div><h2 className="font-heading text-xl font-semibold uppercase">Find support for the work</h2><p className="mt-3 text-sm text-ink-muted">{founder ? "Compare setup and PRO support, staffing and sector-specific services against your business brief." : "Find housing, health cover and everyday services before your first day in Abu Dhabi."}</p><button type="button" onClick={() => setActive(founder ? "business" : "everyday")} className="mt-4 min-h-11 border-b border-accent font-mono text-xs uppercase">Find service providers →</button></div><div><h2 className="font-heading text-xl font-semibold uppercase">Before choosing a home</h2><p className="mt-3 text-sm text-ink-muted">Budget: {housing?.budget ? `${formatAed(housing.budget)} / year` : "not confirmed"}. Bedrooms: {housing?.bedrooms ?? "undecided"}. Commute limit: {housing?.commuteMinutes ? `${housing.commuteMinutes} minutes` : "undecided"}.</p><button type="button" onClick={() => setActive("home")} className="mt-4 min-h-11 border-b border-rule font-mono text-xs uppercase">Open home & family →</button></div></section>
      </>}
      {(active === "actions" || active === "home") && <>
        <h2 className="mt-8 font-heading text-2xl font-semibold uppercase">{active === "home" ? "Home & family" : "Your actions"}</h2>
        {active === "home" && <p className="mt-3 text-sm text-ink-muted">{props.answers.preferredArea || "Area undecided"} · {housing?.budget ? `${formatAed(housing.budget)} annual rent brief` : "Rent budget unconfirmed"} · {housing?.bedrooms ? `${housing.bedrooms} bedrooms` : "Bedrooms undecided"}{housing?.commuteMinutes ? ` · ${housing.commuteMinutes}-minute commute limit` : ""} · Work location: {housing?.workLocation || "not chosen"}. Check actual routes and any school offer before committing to a lease.</p>}
        <div className="my-6 flex flex-wrap gap-4"><label className="flex flex-1 flex-col gap-2 text-xs text-ink-muted">Search actions<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 w-full min-w-40 border border-rule bg-paper-raised px-3 text-sm text-ink" /></label><label className="flex flex-col gap-2 text-xs text-ink-muted">Show<select value={filter} onChange={(event) => setFilter(event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-sm text-ink"><option value="all">All statuses</option><option value="ready">Ready / in progress</option><option value="blocked">Waiting on another step</option><option value="done">Recorded complete</option></select></label></div>
        {(founder ? ["company", "self", "team"] : ["people"]).map((layer) => {
          const items = visibleTasks.filter((task) => task.layer === layer);
          return items.length ? <section key={layer} className="mb-8"><FieldLabel>{layer === "company" ? "Layer A / Company" : layer === "team" ? "Layer B / First hires" : layer === "self" ? "Layer B / Your household" : "Layer B / Relocation"}</FieldLabel><TaskRoomGrid className="mt-4" tasks={rooms(items)} onOpen={setOpenedTask} /></section> : null;
        })}
        {visibleTasks.length === 0 && <p role="status" className="border-t border-rule py-6 text-sm">No actions match. Try a different status or search term.</p>}
      </>}
      {active === "dependencies" && <DependencyTimeline tasks={tasks} completed={completed} externalBlockers={external} onOpen={setOpenedTask} />}
      {(active === "business" || active === "everyday") && <ServiceBrowser key={`${active}-${serviceCategory ?? "all"}`} role={props.viewerRole} businessType={founder ? props.answers.businessType : undefined} mode={active} initialCategory={serviceCategory} quoteBrief={quoteBrief} shortlist={shortlist} onShortlist={(id) => setShortlist((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])} />}
      {active === "answers" && <KnowledgePanel role={props.viewerRole} />}
    </div>
    {actionTask && <TaskAction key={actionTask.id} task={actionTask} tasks={tasks} completed={completed} external={external} context={context} onClose={() => setOpenedTask(null)} onToggle={toggleTask} onFindSupport={supportCategory ? findSupport : undefined} />}
  </div>;
}
