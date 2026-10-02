"use client";

import { useEffect, useState } from "react";
import { Annotation, FieldLabel, Figure, Rule, Sheet, SourceBadge, Stamp } from "@/components/primitives";
import { getActionGuide } from "@/lib/ui/action-guides";
import { buildFounderTasks } from "@/lib/ui/founder-plan";
import type { EmployeeAnswers, FounderAnswers } from "@/lib/ui/personas";
import { rationaleForTask } from "@/lib/ui/rationale";
import { DependencyTimeline } from "@/components/DependencyTimeline";
import type { RationaleContext } from "@/lib/ui/rationale";
import { blockingTasks, buildEmployeeBlockingContext, buildEmployeeTasks } from "@/lib/ui/scope";
import type { BlockingContext, ScopedTask } from "@/lib/ui/scope";
import type { Company, Employee, RelocationPlan } from "@/types/relocation";

type PlanViewProps =
  | { viewerRole: "founder"; answers: FounderAnswers; sampleCase?: boolean; rememberCase?: boolean }
  | { viewerRole: "employee"; answers: EmployeeAnswers; company: Company; employee: Employee; plan: RelocationPlan; sampleCase?: boolean; rememberCase?: boolean };

type TaskListProps = {
  tasks: ScopedTask[];
  allTasks: ScopedTask[];
  completed: ReadonlySet<string>;
  context: RationaleContext;
  externalBlockers?: BlockingContext[];
  onToggle: (id: string, checked: boolean) => void;
};

function ServiceSection({ id, title, intro, active, tasks, taskIds, fallbackId }: {
  id: string; title: string; intro: string; active: string; tasks: ScopedTask[]; taskIds: string[]; fallbackId?: string;
}) {
  const selected = taskIds.flatMap((taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    return task ? [{ id: task.id, title: task.title }] : [];
  });
  if (selected.length === 0 && fallbackId) selected.push({ id: fallbackId, title });
  return (
    <section id={id} className={active === id ? "mt-10 border-t border-rule pt-8" : "hidden"} aria-label={title}>
      <FieldLabel>{title}</FieldLabel>
      <h2 className="mt-2 font-heading text-2xl font-semibold uppercase sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">{intro}</p>
      <div className="mt-8 border-b border-rule">
        {selected.map((item) => {
          const guide = getActionGuide(item);
          if (!guide) return null;
          return (
            <div key={item.id} className="grid gap-5 border-t border-rule py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
              <div>
                <h3 className="font-heading text-xl font-semibold uppercase">{item.title}</h3>
                <p className="mt-3 text-sm text-ink-muted">{guide.caveat}</p>
                <a href={guide.action.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center border-b border-accent font-mono text-xs uppercase hover:text-accent">{guide.action.label} ↗</a>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">{guide.discover.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="border-b border-rule text-sm hover:border-accent">{link.label} ↗</a>)}</div>
              </div>
              <div className="md:border-l md:border-rule md:pl-6">
                <FieldLabel>Before you contact them</FieldLabel>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">{guide.whatToPrepare.map((item) => <li key={item}>{item}</li>)}</ul>
                <FieldLabel className="mt-5 block">What confirms completion</FieldLabel>
                <p className="mt-2 text-sm">{guide.proofOfCompletion}</p>
                <a href={guide.source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-mono text-[11px] uppercase text-ink-muted underline underline-offset-4 hover:text-accent">Source: {guide.source.title} ↗</a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TaskList({ tasks, allTasks, completed, context, externalBlockers = [], onToggle }: TaskListProps) {
  return (
    <ol className="mt-5 border-b border-rule">
      {tasks.map((task, index) => {
        const guide = getActionGuide(task);
        const done = completed.has(task.id);
        const blockers = done ? [] : blockingTasks(task, allTasks, completed);
        const employerHeld = !done && externalBlockers.length > 0 && task.id === "visa";
        const blocked = blockers.length > 0 || employerHeld;
        const status = done ? "Complete" : blocked ? "Held" : task.status === "in_progress" ? "In progress" : "Ready";
        const holdText = employerHeld
          ? `Waiting on ${externalBlockers.filter((item) => item.id.includes("licence") || item.id.includes("card")).map((item) => item.title).join(" / ")}`
          : `Waiting on ${blockers.map((item) => item.title).join(" / ")}`;

        return (
          <li id={`task-${task.id}`} key={task.id} className="grid scroll-mt-20 gap-4 border-t border-rule py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:gap-10">
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Mark ${task.title} complete`}
                  checked={done}
                  disabled={blocked}
                  onChange={(event) => onToggle(task.id, event.target.checked)}
                  className="mt-1.5 h-4 w-4 shrink-0 accent-survey disabled:cursor-not-allowed"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <FieldLabel>{String(index + 1).padStart(2, "0")} / {task.category}</FieldLabel>
                    <span className={`font-mono text-[11px] uppercase ${blocked ? "text-warn" : done ? "text-verified" : "text-survey"}`}>
                      {status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-semibold uppercase leading-tight text-ink">
                    {task.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{task.description}</p>
                  {blocked && (
                    <p className="mt-3 font-mono text-[11px] leading-5 text-warn">
                      {holdText.toUpperCase()}
                    </p>
                  )}
                  {guide && (
                    <details className="mt-5 border-t border-rule pt-3 text-sm">
                      <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase text-ink hover:text-accent">Where to do this / What to prepare</summary>
                      <div className="mt-5 space-y-5 pb-1">
                        <a href={guide.action.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-accent font-mono text-xs uppercase text-ink hover:text-accent">{guide.action.label} ↗</a>
                        {guide.discover.length > 0 && (
                          <div>
                            <FieldLabel>Explore and compare</FieldLabel>
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                              {guide.discover.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="border-b border-rule text-sm text-ink hover:border-accent hover:text-accent">{link.label} ↗</a>)}
                            </div>
                          </div>
                        )}
                        <div>
                          <FieldLabel>Prepare</FieldLabel>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">{guide.whatToPrepare.map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                        <div>
                          <FieldLabel>Completion evidence</FieldLabel>
                          <p className="mt-2 text-ink">{guide.proofOfCompletion}</p>
                        </div>
                        <p className="text-xs leading-relaxed text-ink-muted">{guide.caveat}</p>
                        <a href={guide.source.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] uppercase text-ink-muted underline underline-offset-4 hover:text-accent">Source: {guide.source.title} ↗</a>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0 border-l-2 border-accent pl-4 md:pl-5">
              <FieldLabel>Why this appears</FieldLabel>
              <p className="mt-2 text-sm leading-relaxed text-ink">{rationaleForTask(task, context)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function PlanSection({
  label,
  title,
  note,
  tasks,
  allTasks,
  completed,
  context,
  externalBlockers,
  onToggle,
}: TaskListProps & { label: string; title: string; note: string }) {
  if (tasks.length === 0) return null;

  return (
    <section aria-label={title} className="pt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <FieldLabel>{label}</FieldLabel>
          <h2 className="mt-2 font-heading text-2xl font-semibold uppercase text-ink sm:text-3xl">{title}</h2>
        </div>
        <Annotation>{note}</Annotation>
      </div>
      <TaskList tasks={tasks} allTasks={allTasks} completed={completed} context={context} externalBlockers={externalBlockers} onToggle={onToggle} />
    </section>
  );
}

export function PlanView(props: PlanViewProps) {
  const founder = props.viewerRole === "founder";
  const tasks = founder
    ? buildFounderTasks(props.answers)
    : buildEmployeeTasks(props.plan, props.answers, props.company, props.employee);
  const externalBlockers = founder ? [] : buildEmployeeBlockingContext(props.company, props.plan);
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(tasks.filter((task) => task.status === "completed").map((task) => task.id)),
  );
  const [activePanel, setActivePanel] = useState("plan");
  const [progressLoaded, setProgressLoaded] = useState(false);
  const progressSignature = founder
    ? `founder:${props.answers.name}:${props.answers.businessName}`
    : `employee:${props.employee.name}:${props.answers.employerName}`;

  // Local progress is available only after hydration; restore it once per plan mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (props.rememberCase && !props.sampleCase) {
      try {
        const saved = window.localStorage.getItem("wusool.progress.v1");
        if (saved) {
          const record: unknown = JSON.parse(saved);
          if (record && typeof record === "object" && "signature" in record && "completed" in record) {
            const progress = record as { signature: string; completed: unknown };
            if (progress.signature === progressSignature && Array.isArray(progress.completed)) {
              const taskIds = new Set(tasks.map((task) => task.id));
              setCompleted(new Set(progress.completed.filter((id): id is string => typeof id === "string" && taskIds.has(id))));
            }
          }
        }
      } catch {
        // Invalid local progress must not block the plan.
      }
    }
    setProgressLoaded(true);
  // The plan is remounted with a new key when the case changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!progressLoaded || !props.rememberCase || props.sampleCase) return;
    window.localStorage.setItem("wusool.progress.v1", JSON.stringify({ signature: progressSignature, completed: [...completed] }));
  }, [completed, progressLoaded, progressSignature, props.rememberCase, props.sampleCase]);
  const rationaleContext: RationaleContext = founder
    ? { viewerRole: "founder", answers: props.answers }
    : { viewerRole: "employee", answers: props.answers, company: props.company, employee: props.employee };
  const readyTasks = tasks.filter((task) => !completed.has(task.id) && blockingTasks(task, tasks, completed).length === 0 && !(externalBlockers.length > 0 && task.id === "visa"));
  const nextTask = readyTasks[0];
  const nextGuide = nextTask ? getActionGuide(nextTask) : undefined;

  function toggleTask(id: string, checked: boolean) {
    setCompleted((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
        let changed = true;
        while (changed) {
          changed = false;
          for (const task of tasks) {
            if (next.has(task.id) && blockingTasks(task, tasks, next).length > 0) {
              next.delete(task.id);
              changed = true;
            }
          }
        }
      }
      return next;
    });
  }

  const sectionProps = { allTasks: tasks, completed, context: rationaleContext, onToggle: toggleTask };
  const panelTabs = [
    { id: "plan", label: "Plan" }, { id: "timeline", label: "Dependencies" },
    { id: "housing", label: "Housing" }, { id: "schools", label: "Schools" },
    { id: "health", label: "Health cover" }, { id: "banking", label: "Banking" },
    { id: "moving", label: "Moving" }, { id: "settling", label: "Settling in" },
    { id: "package", label: "HR & package" },
  ].filter((tab) => (tab.id !== "schools" || tasks.some((task) => task.category === "school")) && (tab.id !== "package" || !founder));

  return (
    <div id="plan-view" className="pt-10">
      <nav aria-label="Plan sections" className="sticky top-0 z-10 mb-8 flex w-full gap-7 overflow-x-auto border-b border-rule bg-paper py-3 font-mono text-[11px] uppercase whitespace-nowrap">
        {panelTabs.map((tab, index) => (
          <button key={tab.id} type="button" aria-current={activePanel === tab.id ? "page" : undefined} onClick={() => setActivePanel(tab.id)} className={`shrink-0 border-b-2 pb-2 ${activePanel === tab.id ? "border-ink" : "border-transparent hover:border-accent"}`}>{String(index + 1).padStart(2, "0")} {tab.label}</button>
        ))}
      </nav>
      <div className={activePanel === "plan" ? "" : "hidden"}>
      {nextTask && nextGuide && (
        <section aria-label="Next action" className="mb-10 grid gap-5 border-y border-ink py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
          <div>
            <FieldLabel>Start here / Next available action</FieldLabel>
            <h2 className="mt-2 font-heading text-2xl font-semibold uppercase leading-tight sm:text-3xl">{nextTask.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">{rationaleForTask(nextTask, rationaleContext)}</p>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 md:border-l md:border-rule md:pl-8">
            <a href={nextGuide.action.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-accent font-mono text-xs uppercase hover:text-accent">{nextGuide.action.label} ↗</a>
            <p className="text-xs leading-relaxed text-ink-muted">Done when: {nextGuide.proofOfCompletion}</p>
            <a href={`#task-${nextTask.id}`} className="border-b border-rule font-mono text-[11px] uppercase hover:border-accent">See preparation and source ↓</a>
            {readyTasks.length > 1 && (
              <div className="mt-2 border-t border-rule pt-3">
                <FieldLabel>Also ready in parallel</FieldLabel>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {readyTasks.slice(1, 4).map((task) => <a key={task.id} href={`#task-${task.id}`} className="border-b border-rule text-xs text-ink hover:border-accent">{task.title} ↓</a>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
      <Sheet level="raised" titleBlock={`Plan file / ${founder ? "Founder" : "Employee"}`} aria-label="Case file">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <FieldLabel>{founder ? "Founder / Business" : "Employee / Employer"}</FieldLabel>
            <h2 className="mt-2 font-heading text-3xl font-semibold uppercase leading-tight text-ink sm:text-4xl">
              {founder ? props.answers.name : props.employee.name}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {founder ? props.answers.businessName : `${props.employee.role} / ${props.answers.employerName}`}
            </p>
            {founder && <Annotation className="mt-2 block">{props.answers.isEstablishedInUAE ? "Company established in the UAE" : "Company not yet established"}</Annotation>}
          </div>
          {props.sampleCase && <Stamp>Sample case</Stamp>}
        </div>
        <Rule className="my-8" />
        {founder && props.answers.isEstablishedInUAE ? (
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Company status</FieldLabel>
              <Figure value="Established" className="text-xl text-ink sm:text-2xl" />
              <Annotation>UAE licence already held / Founder intake</Annotation>
            </div>
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Arrival target</FieldLabel>
              <Figure value={props.answers.arrivalTarget ?? "Not set"} className="text-xl text-ink sm:text-2xl" />
              <Annotation>Target date / Not entry clearance</Annotation>
            </div>
          </div>
        ) : founder ? (
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Year-one team</FieldLabel>
              <Figure value={props.answers.headcountYearOne} className="text-2xl text-ink sm:text-3xl" />
              <Annotation>Planned staff / Founder decision</Annotation>
            </div>
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Customer market</FieldLabel>
              <Figure value={props.answers.customerMarket === "uae-domestic" ? "UAE domestic" : props.answers.customerMarket === "export" ? "Export" : "International"} className="text-xl text-ink sm:text-2xl" />
              <Annotation>Founder intake / Revenue route</Annotation>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>{props.answers.housingArrangement === "provided" ? "Housing" : props.answers.housingArrangement === "no" ? "Housing budget" : "Housing allowance / Year"}</FieldLabel>
              {props.answers.housingArrangement === "provided" || props.answers.housingArrangement === "no" ? (
                <Figure value={props.answers.housingArrangement === "provided" ? "Provided" : "From salary"} className="text-xl text-ink sm:text-2xl" />
              ) : props.company.policy.housingAllowanceAED > 0 ? (
                <Figure value={props.company.policy.housingAllowanceAED} format="aed" className="text-2xl text-ink sm:text-3xl" />
              ) : (
                <Figure value="To confirm" className="text-xl text-ink sm:text-2xl" />
              )}
              <Annotation>{props.answers.housingArrangement === "provided" ? "Employer package / Confirm tenancy" : props.answers.housingArrangement === "no" ? "No housing allowance / Salary-funded" : props.company.policy.housingAllowanceAED > 0 ? "Employer policy / Annual cap" : "Request written allowance from employer"}</Annotation>
            </div>
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Work start date</FieldLabel>
              <Figure value={props.answers.startDate} className="text-xl text-ink sm:text-2xl" />
              <Annotation>Employee record / Not entry clearance</Annotation>
            </div>
          </div>
        )}
        {!(founder && props.answers.isEstablishedInUAE) && (
          <div className="mt-7 border-t border-rule pt-5">
            <FieldLabel>Chosen arrival target</FieldLabel>
            <Figure value={props.answers.arrivalTarget ?? "Not set"} className="mt-2 block text-xl text-ink sm:text-2xl" />
            <Annotation className="mt-2 block">Planning target / Not a predicted clearance date</Annotation>
          </div>
        )}
        <Rule className="my-8" />
        {props.sampleCase ? <SourceBadge source={founder ? "Sample founder intake" : "Sample employer policy"} /> : <Annotation>Information from your intake / Requirements need authority confirmation</Annotation>}
      </Sheet>

      {founder ? (
        <>
          <PlanSection label="Layer A / Company" title="Establish the business" note={`${tasks.filter((task) => task.layer === "company").length} tasks / Company-owned`} tasks={tasks.filter((task) => task.layer === "company")} {...sectionProps} />
          <PlanSection label="Layer B / Founder" title="Move your household" note={`${tasks.filter((task) => task.layer === "self").length} tasks / Prepare now; residence after company card`} tasks={tasks.filter((task) => task.layer === "self")} {...sectionProps} />
          <PlanSection label="Layer B / First hires" title="Bring in your first team" note={`${tasks.filter((task) => task.layer === "team").length} tasks / Define roles now; permits after company card`} tasks={tasks.filter((task) => task.layer === "team")} {...sectionProps} />
        </>
      ) : (
        <>
          {externalBlockers.length > 0 && (
            <section aria-label="Employer setup context" className="pt-12">
              <FieldLabel>Layer A / Employer-owned context</FieldLabel>
              <h2 className="mt-2 font-heading text-2xl font-semibold uppercase text-ink sm:text-3xl">Employer setup blocks this move</h2>
              <p className="mt-5 max-w-3xl border-l-2 border-survey pl-4 text-sm leading-relaxed text-ink">
                ICP issues the establishment card only after a valid licence; your employer must complete that chain before your sponsored visa file opens.
              </p>
              <ol className="mt-5 border-b border-rule">
                {externalBlockers.map((item, index) => (
                  <li key={item.id} className="grid gap-2 border-t border-rule py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                    <FieldLabel>{String(index + 1).padStart(2, "0")} / {item.title}</FieldLabel>
                    <p className="text-sm leading-relaxed text-ink-muted">{item.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <PlanSection label="Layer B / Employee" title="Relocate to Abu Dhabi" note={`${tasks.length} tasks / ${props.employee.name}`} tasks={tasks} externalBlockers={externalBlockers} {...sectionProps} />
        </>
      )}

      </div>
      <div id="timeline" className={activePanel === "timeline" ? "" : "hidden"}>
        <DependencyTimeline tasks={tasks} completed={completed} />
      </div>
      <ServiceSection id="housing" title="Housing" intro="Compare current listings against your budget, commute and school needs. Confirm availability and verify tenancy records before paying." active={activePanel} tasks={tasks} taskIds={founder ? ["family-home"] : ["housing", "housing-tenancy"]} />
      <ServiceSection id="schools" title="Schools" intro="Check current places, admissions dates, curriculum and fees directly with each school before fixing a home area." active={activePanel} tasks={tasks} taskIds={["family-school", "school"]} />
      <ServiceSection id="health" title="Health cover" intro="Compare provider networks, effective dates and dependant eligibility before arrival." active={activePanel} tasks={tasks} taskIds={["family-insurance", "employee-coverage", "insurance"]} />
      <ServiceSection id="banking" title="Banking" intro="Compare account eligibility, services and fees directly with licensed banks. Example providers are not endorsements." active={activePanel} tasks={tasks} taskIds={["business-bank", "payroll"]} fallbackId={founder ? undefined : "personal-bank"} />
      <ServiceSection id="moving" title="Moving" intro="Book travel against confirmed permission and accommodation dates, not a target date alone." active={activePanel} tasks={tasks} taskIds={["family-travel", "employee-arrivals", "travel"]} />
      <ServiceSection id="settling" title="Settling in" intro="Use registered residential tenancy evidence to activate your home services." active={activePanel} tasks={tasks} taskIds={["home-utilities", "settling"]} />
      {!founder && <ServiceSection id="package" title="HR & package" intro="Get benefit amounts, policy limits and approval owners in writing from your employer." active={activePanel} tasks={tasks} taskIds={["visa", "travel", "housing", "insurance"]} />}

      <p className="mt-10">
        <Annotation>{props.sampleCase
          ? "Fictional example. Check current licensing, immigration and policy requirements with the relevant authorities."
          : "Personal planning record. Confirm requirements, eligibility and fees with each issuing authority before applying or paying."}</Annotation>
      </p>
    </div>
  );
}
