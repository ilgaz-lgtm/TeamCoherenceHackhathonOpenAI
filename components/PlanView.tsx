"use client";

import { useState } from "react";
import { Annotation, FieldLabel, Figure, Rule, Sheet, SourceBadge, Stamp } from "@/components/primitives";
import { buildFounderTasks } from "@/lib/ui/founder-plan";
import type { EmployeeAnswers, FounderAnswers } from "@/lib/ui/personas";
import { rationaleForTask } from "@/lib/ui/rationale";
import { DependencyTimeline } from "@/components/DependencyTimeline";
import type { RationaleContext } from "@/lib/ui/rationale";
import { blockingTasks, buildEmployeeBlockingContext, buildEmployeeTasks } from "@/lib/ui/scope";
import type { BlockingContext, ScopedTask } from "@/lib/ui/scope";
import type { Company, Employee, RelocationPlan } from "@/types/relocation";

type PlanViewProps =
  | { viewerRole: "founder"; answers: FounderAnswers }
  | { viewerRole: "employee"; answers: EmployeeAnswers; company: Company; employee: Employee; plan: RelocationPlan };

type TaskListProps = {
  tasks: ScopedTask[];
  allTasks: ScopedTask[];
  completed: ReadonlySet<string>;
  context: RationaleContext;
  externalBlockers?: BlockingContext[];
  onToggle: (id: string, checked: boolean) => void;
};

function TaskList({ tasks, allTasks, completed, context, externalBlockers = [], onToggle }: TaskListProps) {
  return (
    <ol className="mt-5 border-b border-rule">
      {tasks.map((task, index) => {
        const done = completed.has(task.id);
        const blockers = done ? [] : blockingTasks(task, allTasks, completed);
        const companyBlockers = blockers.filter((item) => item.layer === "company");
        const householdBlockers = blockers.filter((item) => item.layer === "self");
        const employerHeld = !done && externalBlockers.length > 0;
        const blocked = blockers.length > 0 || employerHeld;
        const status = done ? "Complete" : blocked ? "Held" : task.status === "in_progress" ? "In progress" : "Ready";
        const holdText = employerHeld
          ? "Waiting on employer licence and establishment card"
          : task.layer === "self" && companyBlockers.length > 0
            ? `Waiting on company setup / ${companyBlockers.length} tasks`
            : task.layer === "team" && (companyBlockers.length > 0 || householdBlockers.length > 0)
              ? companyBlockers.length > 0 && householdBlockers.length > 0
                ? `Waiting on company setup (${companyBlockers.length}) and your move (${householdBlockers.length})`
                : `Waiting on ${companyBlockers.length > 0 ? "company setup" : "your move"} / ${companyBlockers.length + householdBlockers.length} tasks`
              : `Waiting on ${blockers.slice(0, 2).map((item) => item.title).join(" / ")}${blockers.length > 2 ? ` + ${blockers.length - 2} more` : ""}`;

        return (
          <li key={task.id} className="grid gap-4 border-t border-rule py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] md:gap-10">
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
                      {holdText}
                    </p>
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
  const rationaleContext: RationaleContext = founder
    ? { viewerRole: "founder", answers: props.answers }
    : { viewerRole: "employee", answers: props.answers, company: props.company, employee: props.employee };

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

  return (
    <div id="plan-view" className="pt-10">
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
          <Stamp>Sample case</Stamp>
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
              ) : (
                <Figure value={props.company.policy.housingAllowanceAED} format="aed" className="text-2xl text-ink sm:text-3xl" />
              )}
              <Annotation>{props.answers.housingArrangement === "provided" ? "Employer package / No lease to sign" : props.answers.housingArrangement === "no" ? "No housing allowance / Salary-funded" : "Employer policy / Annual cap"}</Annotation>
            </div>
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Work start date</FieldLabel>
              <Figure value={props.answers.startDate} className="text-xl text-ink sm:text-2xl" />
              <Annotation>Employee record / Not entry clearance</Annotation>
            </div>
          </div>
        )}
        <Rule className="my-8" />
        <SourceBadge source={founder ? "Sample founder intake" : "Sample employer policy"} />
      </Sheet>

      {founder ? (
        <>
          <PlanSection label="Layer A / Company" title="Establish the business" note={`${tasks.filter((task) => task.layer === "company").length} tasks / Company-owned`} tasks={tasks.filter((task) => task.layer === "company")} {...sectionProps} />
          <PlanSection label="Layer B / Founder" title="Move your household" note={`${tasks.filter((task) => task.layer === "self").length} tasks / ${props.answers.isEstablishedInUAE ? "Company established" : "After company setup"}`} tasks={tasks.filter((task) => task.layer === "self")} {...sectionProps} />
          <PlanSection label="Layer B / First hires" title="Bring in your first team" note={`${tasks.filter((task) => task.layer === "team").length} tasks / After your move`} tasks={tasks.filter((task) => task.layer === "team")} {...sectionProps} />
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

      {!founder && <DependencyTimeline tasks={props.plan.tasks} />}

      <p className="mt-10">
        <Annotation>{founder
          ? "Fictional founder case. Check current licensing and immigration requirements with ADDED, ICP and the applicable authority."
          : "Fictional employee case. Employer policy figures are sample data; check current requirements with the relevant authorities."}</Annotation>
      </p>
    </div>
  );
}
