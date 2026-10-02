"use client";

import { useState } from "react";
import { PlanView } from "@/components/PlanView";
import { Annotation, FieldLabel } from "@/components/primitives";
import { employeeAnswersFromFixture, founderDemo, founderFamily } from "@/lib/ui/personas";
import type { EmployeeAnswers, FounderAnswers, ViewerRole } from "@/lib/ui/personas";
import type { Company, Employee, RelocationPlan } from "@/types/relocation";

type ScopeExperienceProps = {
  company: Company;
  employee: Employee;
  plan: RelocationPlan;
};

const inputClass = "mt-2 min-h-12 w-full border border-rule-strong bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-survey focus:outline-2 focus:outline-offset-2 focus:outline-survey";
const roleOptions: { role: ViewerRole; label: string; description: string }[] = [
  { role: "founder", label: "Founder", description: "I am setting up a company here" },
  { role: "employee", label: "Employee", description: "I am joining a company that is bringing me here" },
];

export function ScopeExperience({ company, employee, plan }: ScopeExperienceProps) {
  const [viewerRole, setViewerRole] = useState<ViewerRole | null>(null);
  const [founderAnswers, setFounderAnswers] = useState<FounderAnswers>({ ...founderDemo });
  const [employeeAnswers, setEmployeeAnswers] = useState<EmployeeAnswers>(() => employeeAnswersFromFixture(company, employee));
  const [planOpen, setPlanOpen] = useState(false);

  function chooseRole(role: ViewerRole) {
    setViewerRole(role);
    setPlanOpen(false);
  }

  function updateFounder(patch: Partial<FounderAnswers>) {
    setFounderAnswers((previous) => ({ ...previous, ...patch }));
    setPlanOpen(false);
  }

  function updateEmployee(patch: Partial<EmployeeAnswers>) {
    setEmployeeAnswers((previous) => ({ ...previous, ...patch }));
    setPlanOpen(false);
  }

  return (
    <>
      <section aria-labelledby="role-question" className="border-b border-rule-strong py-10">
        <FieldLabel>Q0 / Your role</FieldLabel>
        <h2 id="role-question" className="mt-3 max-w-2xl font-heading text-2xl font-semibold uppercase leading-tight text-ink sm:text-3xl">
          What brings you to Abu Dhabi?
        </h2>
        <fieldset className="mt-6 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">What brings you to Abu Dhabi?</legend>
          {roleOptions.map(({ role, label, description }) => (
            <label
              key={role}
              className={`flex min-h-24 cursor-pointer flex-col justify-center border border-rule-strong px-4 py-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-survey ${viewerRole === role ? "bg-ink text-paper-raised" : "bg-paper-raised text-ink hover:bg-paper-sunk"}`}
            >
              <input
                type="radio"
                name="viewer-role"
                value={role}
                checked={viewerRole === role}
                onChange={() => chooseRole(role)}
                className="sr-only"
              />
              <span className={`font-mono text-[11px] font-medium uppercase ${viewerRole === role ? "text-paper-raised" : "text-ink-muted"}`}>
                {label}
              </span>
              <span className="mt-1 text-sm leading-snug">{description}</span>
            </label>
          ))}
        </fieldset>
      </section>

      {viewerRole && (
        <form
          className="border-b border-rule-strong py-10"
          onSubmit={(event) => {
            event.preventDefault();
            setPlanOpen(true);
          }}
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <FieldLabel>Q1 / {viewerRole === "founder" ? "Founder intake" : "Employee intake"}</FieldLabel>
              <h2 className="mt-2 font-heading text-2xl font-semibold uppercase leading-tight text-ink sm:text-3xl">
                {viewerRole === "founder" ? founderAnswers.name : employee.name}
              </h2>
            </div>
            <Annotation>{viewerRole === "founder" ? founderAnswers.businessName : company.name} / Sample profile</Annotation>
          </div>

          {viewerRole === "founder" ? (
            <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="business-type">What kind of business are you building?</FieldLabel>
                <input
                  id="business-type"
                  type="text"
                  required
                  maxLength={100}
                  value={founderAnswers.businessType}
                  onChange={(event) => updateFounder({ businessType: event.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="customer-market">Who will pay you?</FieldLabel>
                <select
                  id="customer-market"
                  value={founderAnswers.customerMarket}
                  onChange={(event) => updateFounder({ customerMarket: event.target.value as FounderAnswers["customerMarket"] })}
                  className={inputClass}
                >
                  <option value="uae-domestic">UAE domestic customers</option>
                  <option value="export">Export customers</option>
                  <option value="international">International customers</option>
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="headcount">How many staff in year one?</FieldLabel>
                <input
                  id="headcount"
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={founderAnswers.headcountYearOne}
                  onChange={(event) => updateFounder({ headcountYearOne: Number(event.target.value) })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="premises-need">What premises do you need?</FieldLabel>
                <select
                  id="premises-need"
                  value={founderAnswers.premisesNeed}
                  onChange={(event) => updateFounder({ premisesNeed: event.target.value as FounderAnswers["premisesNeed"] })}
                  className={inputClass}
                >
                  <option value="customer-facing">Customer-facing premises</option>
                  <option value="production-only">Production-only premises</option>
                  <option value="none">No dedicated premises</option>
                </select>
              </div>
              <fieldset className="sm:col-span-2">
                <legend className="font-mono text-[11px] font-medium uppercase text-ink-muted">Are you relocating yourself?</legend>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                  {([true, false] as const).map((value) => (
                    <label key={String(value)} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="founder-relocating"
                        checked={founderAnswers.relocatingSelf === value}
                        onChange={() => updateFounder({ relocatingSelf: value })}
                        className="h-4 w-4 accent-survey"
                      />
                      {value ? "Yes" : "No"}
                    </label>
                  ))}
                </div>
              </fieldset>
              {founderAnswers.relocatingSelf && (
                <fieldset className="sm:col-span-2">
                  <legend className="font-mono text-[11px] font-medium uppercase text-ink-muted">Who is moving with you?</legend>
                  <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={founderAnswers.movingWithSpouse}
                        onChange={(event) => updateFounder({ movingWithSpouse: event.target.checked })}
                        className="h-4 w-4 accent-survey"
                      />
                      {founderFamily.spouse} / Spouse
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={founderAnswers.movingWithChild}
                        onChange={(event) => updateFounder({ movingWithChild: event.target.checked })}
                        className="h-4 w-4 accent-survey"
                      />
                      {founderFamily.child} / Child, {founderFamily.childAge}
                    </label>
                  </div>
                </fieldset>
              )}
            </div>
          ) : (
            <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="employer-name">Which employer is bringing you?</FieldLabel>
                <input
                  id="employer-name"
                  type="text"
                  required
                  value={employeeAnswers.employerName}
                  onChange={(event) => updateEmployee({ employerName: event.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="start-date">When do you start?</FieldLabel>
                <input
                  id="start-date"
                  type="date"
                  required
                  value={employeeAnswers.startDate}
                  onChange={(event) => updateEmployee({ startDate: event.target.value })}
                  className={inputClass}
                />
              </div>
              <fieldset className="sm:col-span-2">
                <legend className="font-mono text-[11px] font-medium uppercase text-ink-muted">Who is moving with you?</legend>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                  {employee.family.map((member) => (
                    <label key={member.name} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={member.relationship === "spouse" ? employeeAnswers.movingWithSpouse : employeeAnswers.movingWithChild}
                        onChange={(event) => updateEmployee(member.relationship === "spouse"
                          ? { movingWithSpouse: event.target.checked }
                          : { movingWithChild: event.target.checked })}
                        className="h-4 w-4 accent-survey"
                      />
                      {member.name} / {member.relationship === "child" ? `Child, ${member.age}` : "Spouse"}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <FieldLabel htmlFor="preferred-area">Where would you like to live?</FieldLabel>
                <select
                  id="preferred-area"
                  value={employeeAnswers.preferredArea}
                  onChange={(event) => updateEmployee({ preferredArea: event.target.value })}
                  className={inputClass}
                >
                  {employee.preferences.preferredAreas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="commute">Maximum commute to {company.policy.officeLocation}?</FieldLabel>
                <input
                  id="commute"
                  type="number"
                  min={1}
                  max={180}
                  required
                  value={employeeAnswers.maxCommuteMinutes}
                  onChange={(event) => updateEmployee({ maxCommuteMinutes: Number(event.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <button type="submit" style={{ color: "var(--paper-raised)" }} className="mt-8 min-h-12 border border-ink bg-ink px-6 py-2 text-sm font-medium hover:bg-rule-strong focus:outline-2 focus:outline-offset-2 focus:outline-survey">
            View plan
          </button>
        </form>
      )}

      {planOpen && viewerRole === "founder" && <PlanView viewerRole="founder" answers={founderAnswers} />}
      {planOpen && viewerRole === "employee" && (
        <PlanView viewerRole="employee" answers={employeeAnswers} company={company} employee={employee} plan={plan} />
      )}
    </>
  );
}
