"use client";

import { useMemo, useState } from "react";
import { Annotation, FieldLabel, Figure, Rule, Sheet, SourceBadge, Stamp } from "@/components/primitives";
import { rationaleForTask } from "@/lib/ui/rationale";
import { blockingTasks, buildScopedTasks, companyIsEstablished } from "@/lib/ui/scope";
import type { ScopedTask } from "@/lib/ui/scope";
import type { Company, Employee, RelocationPlan } from "@/types/relocation";

type ScopeExperienceProps = {
  company: Company;
  employee: Employee;
  plan: RelocationPlan;
};

type TaskListProps = Omit<ScopeExperienceProps, "plan"> & {
  tasks: ScopedTask[];
  allTasks: ScopedTask[];
  completed: ReadonlySet<string>;
  established: boolean;
  onToggle: (id: string, checked: boolean) => void;
};

function TaskList({ tasks, allTasks, completed, company, employee, established, onToggle }: TaskListProps) {
  return (
    <ol className="mt-5 border-b border-rule">
      {tasks.map((task, index) => {
        const done = completed.has(task.id);
        const blockers = done ? [] : blockingTasks(task, allTasks, completed);
        const blocked = blockers.length > 0;
        const companyBlockers = task.layer === "people" ? blockers.filter((item) => item.layer === "company") : [];
        const cardBlocker = companyBlockers.find((item) => item.id === "establishment-card" || /establishment card/i.test(item.title));
        const otherCompanyCount = companyBlockers.length - (cardBlocker ? 1 : 0);
        const status = done ? "Complete" : blocked ? "Held" : task.status === "in_progress" ? "In progress" : "Ready";
        const reason = rationaleForTask(task, { company, employee, established });

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
                      {companyBlockers.length > 0
                        ? `Waiting on company setup${cardBlocker ? ` / ${cardBlocker.title}` : ""}${otherCompanyCount > 0 ? ` + ${otherCompanyCount} other ${otherCompanyCount === 1 ? "task" : "tasks"}` : ""}`
                        : `Waiting on ${blockers.map((item) => item.title).join(" / ")}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0 border-l-2 border-accent pl-4 md:pl-5">
              <FieldLabel>Why this appears</FieldLabel>
              <p className="mt-2 text-sm leading-relaxed text-ink">{reason}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ScopeExperience({ company, employee, plan }: ScopeExperienceProps) {
  const [established, setEstablished] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(plan.tasks.filter((task) => task.status === "completed").map((task) => task.id)),
  );
  const tasks = useMemo(
    () => buildScopedTasks(plan, established ?? companyIsEstablished(company)),
    [company, established, plan],
  );
  const companyTasks = tasks.filter((task) => task.layer === "company");
  const peopleTasks = tasks.filter((task) => task.layer === "people");
  const companyComplete = companyTasks.every((task) => completed.has(task.id));

  function selectScope(value: boolean) {
    setEstablished(value);
    setCompleted(new Set(plan.tasks.filter((task) => task.status === "completed").map((task) => task.id)));
  }

  function toggleTask(id: string, checked: boolean) {
    setCompleted((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
        // Removing a prerequisite also reopens completed downstream tasks.
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

  return (
    <>
      <section aria-labelledby="scope-question" className="border-b border-rule-strong py-10">
        <FieldLabel>01 / Company status</FieldLabel>
        <h2 id="scope-question" className="mt-3 max-w-2xl font-heading text-2xl font-semibold uppercase leading-tight text-ink sm:text-3xl">
          Is your company already established in the UAE?
        </h2>
        <fieldset className="mt-6 flex w-full max-w-xs border border-rule-strong">
          <legend className="sr-only">Is your company already established in the UAE?</legend>
          {([true, false] as const).map((value) => (
            <label key={String(value)} className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center border-r border-rule-strong text-sm font-medium last:border-r-0 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-survey ${established === value ? "bg-ink text-paper-raised" : "bg-paper-raised text-ink hover:bg-paper-sunk"}`}>
              <input
                type="radio"
                name="company-established"
                value={String(value)}
                checked={established === value}
                onChange={() => selectScope(value)}
                className="sr-only"
              />
              {value ? "Yes" : "No"}
            </label>
          ))}
        </fieldset>
      </section>

      {established !== null && (
        <div className="pt-10">
          <Sheet level="raised" titleBlock={`02 / ${established ? "Relocation file" : "Company and relocation file"}`} aria-label="Case file">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <FieldLabel>Employee / Employer</FieldLabel>
                <h2 className="mt-2 font-heading text-3xl font-semibold uppercase leading-tight text-ink sm:text-4xl">
                  {employee.name}
                </h2>
                <p className="mt-2 text-sm text-ink-muted">{employee.role} / {company.name}</p>
              </div>
              <Stamp>Sample data</Stamp>
            </div>
            <Rule className="my-8" />
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex flex-col items-start gap-2">
                <FieldLabel>Housing allowance / Year</FieldLabel>
                <Figure value={company.policy.housingAllowanceAED} format="aed" className="text-2xl text-ink sm:text-3xl" />
                <Annotation>Company policy / Annual cap</Annotation>
              </div>
              <div className="flex flex-col items-start gap-2">
                <FieldLabel>Start date</FieldLabel>
                <Figure value={employee.startDate} className="text-xl text-ink sm:text-2xl" />
                <Annotation>Employee record / Confirm with HR</Annotation>
              </div>
            </div>
            <Rule className="my-8" />
            <SourceBadge source="Demo company policy" />
          </Sheet>

          {companyTasks.length > 0 && (
            <section aria-labelledby="company-layer" className="pt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <FieldLabel>Layer A / Company</FieldLabel>
                  <h2 id="company-layer" className="mt-2 font-heading text-2xl font-semibold uppercase text-ink sm:text-3xl">Establish the company</h2>
                </div>
                <Annotation>Licence / Establishment card / Operations</Annotation>
              </div>
              <TaskList tasks={companyTasks} allTasks={tasks} completed={completed} established={established} company={company} employee={employee} onToggle={toggleTask} />
            </section>
          )}

          <section aria-labelledby="people-layer" className="pt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <FieldLabel>{established || companyComplete ? "Layer B / People" : "Layer B / People / Held until company setup"}</FieldLabel>
                <h2 id="people-layer" className="mt-2 font-heading text-2xl font-semibold uppercase text-ink sm:text-3xl">Relocate the people</h2>
              </div>
              <Annotation>{peopleTasks.length} tasks / {employee.name}</Annotation>
            </div>
            {!established && (
              <p className="mt-5 max-w-3xl border-l-2 border-survey pl-4 text-sm leading-relaxed text-ink">
                {company.policy.visaSponsorship
                  ? "Your sponsored residence process depends on the establishment card; ICP requires a valid licence before that card can be issued. "
                  : "Your employer has not confirmed a sponsorship route; HR must confirm which immigration steps apply. "}
                {companyComplete
                  ? "With company tasks marked complete in this sample, people tasks now follow their own dependencies."
                  : "Other people tasks are held here until company setup is complete."}
              </p>
            )}
            <TaskList tasks={peopleTasks} allTasks={tasks} completed={completed} established={established} company={company} employee={employee} onToggle={toggleTask} />
          </section>

          <p className="mt-10">
            <Annotation>Fictional demo data. Confirm current immigration, insurance, schooling and licensing requirements with HR and relevant authorities.</Annotation>
          </p>
        </div>
      )}
    </>
  );
}
