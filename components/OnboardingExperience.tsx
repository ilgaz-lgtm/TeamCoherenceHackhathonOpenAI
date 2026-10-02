"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { PlanView } from "@/components/PlanView";
import {
  AnswerLedger,
  BrandMark,
  CountStepper,
  IndependentFooter,
  OptionList,
  OptionRow,
  FieldLabel,
} from "@/components/primitives";
import {
  answerLabel,
  applyAnswer,
  employeePersona,
  firstUnanswered,
  founderPersona,
  optionsFor,
  payrollNote,
  questionTotal,
  questions,
  sequenceFor,
  validOnboardingAnswers,
} from "@/lib/ui/onboarding";
import type { OnboardingAnswers, QuestionKey } from "@/lib/ui/onboarding";
import { founderDemo } from "@/lib/ui/personas";
import type { EmployeeAnswers, FounderAnswers } from "@/lib/ui/personas";
import { childAges, emptyDetails, restoreCaseDetails, validCaseDetails } from "@/lib/ui/case-details";
import type { CaseDetails } from "@/lib/ui/case-details";
import { readLocal, removeLocal, writeLocal } from "@/lib/ui/storage";
import type { Company, Employee, RelocationPlan } from "@/types/relocation";
import styles from "./OnboardingExperience.module.css";

type Props = {
  company: Company;
  employee: Employee;
  plan: RelocationPlan;
  todayISO: string;
};

const areaNames: Record<string, string> = {
  reem: "Al Reem Island",
  raha: "Al Raha Beach",
  khalifa: "Khalifa City",
  saadiyat: "Saadiyat Island",
};

const businessTypes: Record<string, string> = {
  restaurant_fnb: "Food and beverage business",
  consultancy: "Consultancy",
  trading: "Trading",
  tech_startup: "Tech startup",
};

const caseStorageKey = "wusool.case.v1";
const progressStorageKey = "wusool.progress.v1";

function founderPlanAnswers(answers: OnboardingAnswers, details: CaseDetails, sample: boolean): FounderAnswers {
  const market = answers.pays === "export_only" ? "export"
    : answers.pays === "international_remote" ? "international" : answers.pays === "mixed" ? "mixed" : "uae-domestic";
  const premises = answers.where === "remote" ? "none"
    : answers.where === "customer_facing" ? "customer-facing" : answers.where === "office_only" ? "office" : "warehouse";
  const established = answers.established === "yes";
  const moving = answers.moving;
  const businessType = sample ? founderDemo.businessType : businessTypes[String(established ? details.businessType : answers.build)] ?? "Existing business";

  return {
    ...founderDemo,
    name: sample ? founderDemo.name : details.name.trim(),
    isEstablishedInUAE: established,
    businessName: sample ? founderDemo.businessName : details.businessName.trim(),
    businessType,
    customerMarket: market,
    headcountYearOne: established ? Number(details.plannedHires) : typeof answers.payroll === "number" ? answers.payroll : 1,
    premisesNeed: premises,
    relocatingSelf: true,
    movingWithSpouse: moving === "with_partner" || moving === "with_family",
    movingWithChild: moving === "with_family",
    spouseName: sample ? founderDemo.spouseName : "your partner",
    childName: sample ? founderDemo.childName : (childAges(details.childAge)?.length ?? 0) > 1 ? "your children" : "your child",
    childAge: sample ? founderDemo.childAge : childAges(details.childAge)?.[0],
    childAges: sample ? founderDemo.childAges : childAges(details.childAge),
    partnerSponsorship: sample ? "spouse" : details.partnerSponsorship as "spouse" | "independent" | "unknown",
    establishmentCardReady: sample ? false : details.establishmentCardReady === "unknown" ? undefined : details.establishmentCardReady === "yes",
    arrivalTarget: String(answers.when ?? ""),
    preferredArea: areaNames[String(answers.area)] ?? "",
  };
}

function employeePlanAnswers(answers: OnboardingAnswers, company: Company, employee: Employee, details: CaseDetails, sample: boolean): EmployeeAnswers {
  return {
    employerName: sample ? company.name : details.employerName.trim(),
    startDate: sample ? employee.startDate : details.workStartDate,
    movingWithSpouse: answers.moving === "with_partner" || answers.moving === "with_family",
    movingWithChild: answers.moving === "with_family",
    preferredArea: areaNames[String(answers.area)] ?? "",
    maxCommuteMinutes: sample ? employee.preferences.maxCommuteMinutes : Number(details.commuteMinutes) || 0,
    housingBudgetAED: sample ? company.policy.housingAllowanceAED : Number(details.housingBudgetAED) || undefined,
    arrivalTarget: String(answers.when ?? ""),
    visaStage: String(answers.visaStage ?? "not_started"),
    housingArrangement: String(answers.allowance ?? "yes"),
    partnerSponsorship: sample ? "spouse" : details.partnerSponsorship as "spouse" | "independent" | "unknown",
    childAges: sample ? undefined : childAges(details.childAge),
  };
}

function customEmployeeData(company: Company, employee: Employee, answers: OnboardingAnswers, details: CaseDetails) {
  const family: Employee["family"] = [];
  if (answers.moving === "with_partner" || answers.moving === "with_family") {
    if (details.partnerSponsorship === "spouse") family.push({ name: "your spouse", relationship: "spouse", age: 0 });
  }
  if (answers.moving === "with_family") {
    const ages = childAges(details.childAge) ?? [];
    ages.forEach((age, index) => family.push({ name: ages.length === 1 ? "your child" : `your child ${index + 1}`, relationship: "child", age }));
  }
  const budget = Number(details.housingBudgetAED) || 0;
  return {
    company: {
      ...company,
      id: "your-employer",
      name: details.employerName.trim(),
      policy: {
        ...company.policy,
        housingAllowanceAED: answers.allowance === "yes" ? budget : 0,
        schoolAllowanceAED: 0,
        temporaryAccommodationDays: 0,
        healthInsuranceCoverage: "Not provided",
        flightAllowanceAED: 0,
        officeLocation: details.workLocation.trim() || "your workplace",
      },
    },
    employee: {
      ...employee,
      id: "you",
      companyId: "your-employer",
      name: details.name.trim(),
      role: "Employee",
      startDate: details.workStartDate,
      family,
      preferences: {
        bedrooms: Number(details.bedrooms) || 0,
        maxCommuteMinutes: Number(details.commuteMinutes) || 0,
        preferredAreas: areaNames[String(answers.area)] ? [areaNames[String(answers.area)]] : [],
      },
    },
  };
}

export function OnboardingExperience({ company, employee, plan, todayISO }: Props) {
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [details, setDetails] = useState<CaseDetails>(emptyDetails);
  const [sample, setSample] = useState(false);
  const [remember, setRemember] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [currentKey, setCurrentKey] = useState<QuestionKey>("role");
  const [screen, setScreen] = useState<"onboarding" | "details" | "plan">("onboarding");
  const [selection, setSelection] = useState<{ key: QuestionKey; value: string | number } | null>(null);
  const [payrollDraft, setPayrollDraft] = useState(3);
  const [planVersion, setPlanVersion] = useState(0);
  const locked = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequence = sequenceFor(answers);
  const currentIndex = sequence.indexOf(currentKey);
  const currentQuestion = questions[currentKey];
  const options = optionsFor(currentKey, todayISO);

  // Restore opt-in browser storage after hydration so server HTML stays deterministic.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = readLocal(caseStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && "answers" in parsed && "details" in parsed) {
          const record = parsed as { answers: OnboardingAnswers; details: CaseDetails };
          const restored = restoreCaseDetails(record.details);
          if (validOnboardingAnswers(record.answers) && validCaseDetails(restored, String(record.answers.role), String(record.answers.moving))) {
            setAnswers(record.answers);
            setDetails(restored);
            setRemember(true);
            setScreen("plan");
          }
        }
      }
    } catch {
      // A malformed local record must not block a fresh intake.
    }
    setStorageReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!storageReady || !remember || sample || screen !== "plan") return;
    // Persistence failure is a user-visible result of the browser storage side effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!writeLocal(caseStorageKey, JSON.stringify({ answers, details }))) setStorageError(true);
  }, [answers, details, remember, sample, screen, storageReady]);

  const cancelTransition = useCallback(() => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = null;
    locked.current = false;
    setSelection(null);
  }, []);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const goBack = useCallback(() => {
    if (locked.current || screen !== "onboarding") return;
    const active = sequenceFor(answers);
    const index = active.indexOf(currentKey);
    if (index > 0) {
      const previous = active[index - 1];
      if (previous === "payroll") setPayrollDraft(typeof answers.payroll === "number" ? answers.payroll : 3);
      setCurrentKey(previous);
    }
  }, [answers, currentKey, screen]);

  const selectAnswer = useCallback((value: string | number) => {
    if (locked.current || screen !== "onboarding") return;
    locked.current = true;
    setSelection({ key: currentKey, value });
    transitionTimer.current = setTimeout(() => {
      const updated = applyAnswer(answers, currentKey, value);
      const branchChanged = (currentKey === "role" || currentKey === "established") && answers[currentKey] !== value;
      const active = sequenceFor(updated);
      const next = branchChanged ? firstUnanswered(updated) : active[active.indexOf(currentKey) + 1];
      setAnswers(updated);
      setSelection(null);
      locked.current = false;
      transitionTimer.current = null;
      if (next) {
        if (next === "payroll") setPayrollDraft(typeof updated.payroll === "number" ? updated.payroll : 3);
        setCurrentKey(next);
      } else {
        setScreen("details");
      }
    }, 380);
  }, [answers, currentKey, screen]);

  useEffect(() => {
    if (screen !== "onboarding") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || locked.current) return;
      if (event.key === "Backspace") {
        event.preventDefault();
        goBack();
      } else if (/^[1-9]$/.test(event.key) && currentKey !== "payroll") {
        const chosen = optionsFor(currentKey, todayISO)[Number(event.key) - 1];
        if (chosen) {
          event.preventDefault();
          selectAnswer(chosen.value);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentKey, goBack, screen, selectAnswer, todayISO]);

  function loadPersona(persona: OnboardingAnswers) {
    cancelTransition();
    setAnswers({ ...persona });
    setSample(true);
    setRemember(false);
    setPlanVersion((version) => version + 1);
    setScreen("plan");
  }

  function restart() {
    cancelTransition();
    removeLocal(caseStorageKey);
    removeLocal(progressStorageKey);
    setAnswers({});
    setDetails(emptyDetails);
    setSample(false);
    setRemember(false);
    setStorageError(false);
    setCurrentKey("role");
    setPayrollDraft(3);
    setScreen("onboarding");
  }

  function finishDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validCaseDetails(details, String(answers.role), String(answers.moving))) return;
    if (!remember) {
      removeLocal(caseStorageKey);
      removeLocal(progressStorageKey);
    }
    setSample(false);
    setPlanVersion((version) => version + 1);
    setScreen("plan");
  }

  function updateDetail(key: keyof CaseDetails, value: string) {
    setDetails((previous) => ({ ...previous, [key]: value }));
  }

  function revise(key: QuestionKey) {
    if (locked.current) return;
    if (key === "payroll") setPayrollDraft(typeof answers.payroll === "number" ? answers.payroll : 3);
    setCurrentKey(key);
    setScreen("onboarding");
  }

  const ledgerEntries = sequence.flatMap((key, index) => {
    const value = answers[key];
    return value === undefined ? [] : [{
      id: key,
      number: `Q${index + 1}`,
      keyLabel: key.toUpperCase(),
      value: answerLabel(key, value, todayISO),
      onRevise: () => revise(key),
    }];
  });

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-ink px-[clamp(20px,4vw,48px)] py-3">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div className="flex flex-col">
            <span className="font-heading text-[22px] font-bold uppercase leading-none">Wusool</span>
            <span lang="ar" dir="rtl" className="mt-0.5 w-fit font-arabic text-[12px] leading-none text-ink-muted">وصول</span>
          </div>
        </div>
        <nav aria-label="Example cases and new case" className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-0 font-mono text-[10px] uppercase sm:text-[11px]">
          <button type="button" onClick={() => loadPersona(founderPersona)} className="min-h-10 border-b border-transparent hover:border-accent">Example founder</button>
          <button type="button" onClick={() => loadPersona(employeePersona)} className="min-h-10 border-b border-transparent hover:border-accent">Example employee</button>
          <button type="button" onClick={restart} className="min-h-10 border-b border-transparent hover:border-accent">New case</button>
        </nav>
      </header>

      {screen === "onboarding" ? (
        <div className="flex min-w-0 flex-1 flex-col md:flex-row">
          <AnswerLedger entries={ledgerEntries} activeId={currentKey} className="md:shrink-0" />
          <main className={`${styles.screen} min-w-0 flex-1`}>
            <div className={styles.questionContent}>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="font-semibold text-accent">Q{currentIndex + 1}</span>
                <span className="text-ink-muted">QUESTION {String(currentIndex + 1).padStart(2, "0")} OF {questionTotal(answers)}</span>
              </div>
              <h1 className="type-question mt-8 max-w-[18ch]">{currentQuestion.title}</h1>
              {currentQuestion.note && (
                <p className="mt-5 max-w-[720px] text-base leading-normal text-ink-muted">{currentQuestion.note}</p>
              )}

              {currentKey === "payroll" ? (
                <div className="mt-10 flex flex-col items-start gap-6">
                  <CountStepper label="people on payroll" value={payrollDraft} min={1} max={50} onChange={setPayrollDraft} />
                  <p aria-live="polite" className="font-mono text-[11px] uppercase text-ink-muted">{payrollNote(payrollDraft)}</p>
                  <button type="button" onClick={() => selectAnswer(payrollDraft)} disabled={Boolean(selection)} className="min-h-11 border-b border-ink px-1 font-mono text-xs uppercase hover:border-accent hover:text-accent">Continue →</button>
                </div>
              ) : (
                <OptionList label={currentQuestion.title} onBack={currentIndex > 0 ? goBack : undefined} className="mt-10 w-full">
                  {options.map((option, index) => (
                    <OptionRow
                      key={option.value}
                      index={index + 1}
                      label={option.label}
                      consequence={option.consequence}
                      selected={selection?.key === currentKey ? selection.value === option.value : answers[currentKey] === option.value}
                      disabled={Boolean(selection)}
                      onClick={() => selectAnswer(option.value)}
                      className={`${selection?.key === currentKey ? styles.optionLeaving : ""} ${selection?.key === currentKey && selection.value !== option.value ? styles.optionUnchosen : ""}`}
                    />
                  ))}
                </OptionList>
              )}
            </div>
            <div className={styles.progress} aria-label={`Question ${currentIndex + 1} of ${questionTotal(answers)}`}>
              {sequence.map((key, index) => (
                <span key={key} className={`${styles.tick} ${index === currentIndex ? styles.tickCurrent : answers[key] !== undefined ? styles.tickAnswered : ""}`} aria-hidden="true" />
              ))}
            </div>
          </main>
        </div>
      ) : screen === "details" ? (
        <main className="mx-auto w-full max-w-[900px] flex-1 px-[clamp(20px,4vw,48px)] py-12">
          <FieldLabel>Case details</FieldLabel>
          <h1 className="type-question mt-4">Make this plan yours.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">Enter what you know. Unknown budgets and preferences stay open; nothing is submitted to an authority or provider.</p>
          <form onSubmit={finishDetails} className="mt-10 grid gap-6 border-t border-rule pt-8 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">Your name
              <input required maxLength={80} autoComplete="name" value={details.name} onChange={(event) => updateDetail("name", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
            </label>
            {answers.role === "founder" ? (
              <><label className="flex flex-col gap-2 text-sm font-medium">Business name
                <input required maxLength={100} value={details.businessName} onChange={(event) => updateDetail("businessName", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
              </label>
              {answers.established === "yes" && <>
                <label className="flex flex-col gap-2 text-sm font-medium">Main business activity
                  <select value={details.businessType} onChange={(event) => updateDetail("businessType", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3">
                    <option value="other">Other / not specified</option>{Object.entries(businessTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">Does the company also hold an active establishment card?
                  <select value={details.establishmentCardReady} onChange={(event) => updateDetail("establishmentCardReady", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3">
                    <option value="unknown">Not confirmed</option><option value="no">No</option><option value="yes">Yes, active card confirmed</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">New hires you will sponsor
                  <input type="number" required min="0" max="50" value={details.plannedHires} onChange={(event) => updateDetail("plannedHires", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3" />
                </label>
              </>}
              <label className="flex flex-col gap-2 text-sm font-medium">Business site or district
                <input maxLength={100} value={details.workLocation} onChange={(event) => updateDetail("workLocation", event.target.value)} placeholder="Leave empty if not chosen" className="min-h-11 border border-rule bg-paper-raised px-3" />
              </label>
              </>
            ) : (
              <>
                <label className="flex flex-col gap-2 text-sm font-medium">Employer name
                  <input required maxLength={100} value={details.employerName} onChange={(event) => updateDetail("employerName", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">Work start date
                  <input required type="date" value={details.workStartDate} onChange={(event) => updateDetail("workStartDate", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">Work location
                  <input maxLength={100} value={details.workLocation} onChange={(event) => updateDetail("workLocation", event.target.value)} placeholder="Office or district, if known" className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                </label>
                {answers.allowance !== "provided" && (
                  <label className="flex flex-col gap-2 text-sm font-medium">{answers.allowance === "yes" ? "Annual housing allowance (AED)" : "Annual home rent budget (AED)"}
                    <input type="number" min="1" max="10000000" value={details.housingBudgetAED} onChange={(event) => updateDetail("housingBudgetAED", event.target.value)} placeholder="Leave empty if unknown" className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                  </label>
                )}
              </>
            )}
            {answers.role === "founder" && <label className="flex flex-col gap-2 text-sm font-medium">Annual home rent budget (AED)
              <input type="number" min="1" max="10000000" value={details.housingBudgetAED} onChange={(event) => updateDetail("housingBudgetAED", event.target.value)} placeholder="Leave empty if unknown" className="min-h-11 border border-rule bg-paper-raised px-3" />
            </label>}
            {(answers.role === "founder" || answers.allowance !== "provided") && <>
              <label className="flex flex-col gap-2 text-sm font-medium">Bedrooms needed
                <input type="number" min="1" max="10" value={details.bedrooms} onChange={(event) => updateDetail("bedrooms", event.target.value)} placeholder="Leave empty if undecided" className="min-h-11 border border-rule bg-paper-raised px-3" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">Maximum commute (minutes)
                <input type="number" min="5" max="180" value={details.commuteMinutes} onChange={(event) => updateDetail("commuteMinutes", event.target.value)} placeholder="Leave empty if undecided" className="min-h-11 border border-rule bg-paper-raised px-3" />
              </label>
            </>}
            {(answers.moving === "with_partner" || answers.moving === "with_family") && <label className="flex flex-col gap-2 text-sm font-medium">Partner&apos;s entry route
              <select value={details.partnerSponsorship} onChange={(event) => updateDetail("partnerSponsorship", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3">
                <option value="unknown">Not confirmed — resolve with ICP</option><option value="spouse">Spouse — family sponsorship route</option><option value="independent">Separate employment or other independent route</option>
              </select>
            </label>}
            {answers.moving === "with_family" && (
              <label className="flex flex-col gap-2 text-sm font-medium">Children&apos;s ages (comma separated)
                <input required inputMode="text" pattern="[0-9 ,]+" value={details.childAge} onChange={(event) => { updateDetail("childAge", event.target.value); event.target.setCustomValidity(childAges(event.target.value)?.length ? "" : "Enter ages from 0 to 18, separated by commas."); }} placeholder="For example: 7, 12" className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
              </label>
            )}
            <label className="flex items-center gap-3 text-sm sm:col-span-2">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-survey" />
              Remember this case and progress on this device
            </label>
            <div className="flex items-end gap-5 sm:col-span-2">
              <button type="button" onClick={() => revise(sequence[sequence.length - 1])} className="min-h-11 border-b border-rule font-mono text-xs uppercase">Back</button>
              <button type="submit" className="min-h-11 border-b border-ink px-1 font-mono text-xs uppercase hover:border-accent hover:text-accent">Build my plan →</button>
            </div>
          </form>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-[clamp(20px,4vw,48px)] pb-16">
          {!sample && (
            <div className="flex flex-wrap gap-6 border-b border-rule py-4 font-mono text-[11px] uppercase">
              <button type="button" onClick={() => revise("role")} className="min-h-10 border-b border-transparent hover:border-accent">Revise answers</button>
              <button type="button" onClick={() => setScreen("details")} className="min-h-10 border-b border-transparent hover:border-accent">Edit case details</button>
            </div>
          )}
          {storageError && <p role="status" className="mt-4 text-sm text-ink-muted">This browser could not save your case. Keep this tab open or export your case before closing it.</p>}
          {answers.role === "founder" ? (
            <PlanView key={planVersion} viewerRole="founder" answers={founderPlanAnswers(answers, details, sample)} sampleCase={sample} rememberCase={remember} todayISO={todayISO} housingBrief={{ budget: Number(details.housingBudgetAED) || undefined, bedrooms: Number(details.bedrooms) || undefined, commuteMinutes: Number(details.commuteMinutes) || undefined, workLocation: details.workLocation.trim() || undefined }} />
          ) : (
            <PlanView key={planVersion} viewerRole="employee" answers={employeePlanAnswers(answers, company, employee, details, sample)} company={sample ? company : customEmployeeData(company, employee, answers, details).company} employee={sample ? employee : customEmployeeData(company, employee, answers, details).employee} plan={plan} sampleCase={sample} rememberCase={remember} todayISO={todayISO} />
          )}
        </main>
      )}
      <IndependentFooter />
    </div>
  );
}
