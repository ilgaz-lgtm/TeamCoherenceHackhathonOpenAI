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
} from "@/lib/ui/onboarding";
import type { OnboardingAnswers, QuestionKey } from "@/lib/ui/onboarding";
import { founderDemo } from "@/lib/ui/personas";
import type { EmployeeAnswers, FounderAnswers } from "@/lib/ui/personas";
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

type CaseDetails = {
  name: string;
  businessName: string;
  employerName: string;
  workStartDate: string;
  workLocation: string;
  housingBudgetAED: string;
  bedrooms: string;
  commuteMinutes: string;
  childAge: string;
};

const emptyDetails: CaseDetails = {
  name: "", businessName: "", employerName: "", workStartDate: "", workLocation: "",
  housingBudgetAED: "", bedrooms: "", commuteMinutes: "", childAge: "",
};
const caseStorageKey = "wusool.case.v1";
const progressStorageKey = "wusool.progress.v1";

function founderPlanAnswers(answers: OnboardingAnswers, details: CaseDetails, sample: boolean): FounderAnswers {
  const market = answers.pays === "export_only" ? "export"
    : answers.pays === "international_remote" ? "international" : "uae-domestic";
  const premises = answers.where === "remote" ? "none"
    : answers.where === "customer_facing" ? "customer-facing" : "production-only";
  const established = answers.established === "yes";
  const moving = answers.moving;
  const businessType = sample ? founderDemo.businessType : businessTypes[String(answers.build)] ?? "Existing business";

  return {
    ...founderDemo,
    name: sample ? founderDemo.name : details.name.trim(),
    isEstablishedInUAE: established,
    businessName: sample ? founderDemo.businessName : details.businessName.trim(),
    businessType,
    customerMarket: market,
    headcountYearOne: established ? 0 : typeof answers.payroll === "number" ? answers.payroll : 1,
    premisesNeed: premises,
    relocatingSelf: true,
    movingWithSpouse: moving === "with_partner" || moving === "with_family",
    movingWithChild: moving === "with_family",
    spouseName: sample ? undefined : "your partner",
    childName: sample ? undefined : "your child",
    childAge: sample ? undefined : Number(details.childAge),
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
    maxCommuteMinutes: sample ? employee.preferences.maxCommuteMinutes : Number(details.commuteMinutes) || 30,
    housingBudgetAED: sample ? company.policy.housingAllowanceAED : Number(details.housingBudgetAED) || undefined,
    arrivalTarget: String(answers.when ?? ""),
    visaStage: String(answers.visaStage ?? "not_started"),
    housingArrangement: String(answers.allowance ?? "yes"),
  };
}

function customEmployeeData(company: Company, employee: Employee, answers: OnboardingAnswers, details: CaseDetails) {
  const family: Employee["family"] = [];
  if (answers.moving === "with_partner" || answers.moving === "with_family") {
    family.push({ name: "your partner", relationship: "spouse", age: 0 });
  }
  if (answers.moving === "with_family") {
    family.push({ name: "your child", relationship: "child", age: Number(details.childAge) });
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
        bedrooms: Number(details.bedrooms) || 1,
        maxCommuteMinutes: Number(details.commuteMinutes) || 30,
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
      const saved = window.localStorage.getItem(caseStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && "answers" in parsed && "details" in parsed) {
          const record = parsed as { answers: OnboardingAnswers; details: CaseDetails };
          const validDetails = record.details && Object.keys(emptyDetails).every((key) => typeof record.details[key as keyof CaseDetails] === "string");
          if ((record.answers?.role === "founder" || record.answers?.role === "employee") && validDetails && !firstUnanswered(record.answers)) {
            setAnswers(record.answers);
            setDetails(record.details);
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
    window.localStorage.setItem(caseStorageKey, JSON.stringify({ answers, details }));
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
    setPlanVersion((version) => version + 1);
    setScreen("plan");
  }

  function restart() {
    cancelTransition();
    window.localStorage.removeItem(caseStorageKey);
    window.localStorage.removeItem(progressStorageKey);
    setAnswers({});
    setDetails(emptyDetails);
    setSample(false);
    setRemember(false);
    setCurrentKey("role");
    setPayrollDraft(3);
    setScreen("onboarding");
  }

  function finishDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!remember) {
      window.localStorage.removeItem(caseStorageKey);
      window.localStorage.removeItem(progressStorageKey);
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
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-ink px-[clamp(20px,4vw,48px)] py-3.5">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div className="flex flex-col">
            <span className="font-heading text-[22px] font-bold uppercase leading-none">Wusool</span>
            <span lang="ar" dir="rtl" className="mt-0.5 w-fit font-arabic text-[12px] leading-none text-ink-muted">وصول</span>
          </div>
        </div>
        <nav aria-label="Example cases and new case" className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase">
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
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">These details are used on this device to build your case. Enter only what you know; missing policy amounts stay unverified.</p>
          <form onSubmit={finishDetails} className="mt-10 grid gap-6 border-t border-rule pt-8 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">Your name
              <input required maxLength={80} autoComplete="name" value={details.name} onChange={(event) => updateDetail("name", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
            </label>
            {answers.role === "founder" ? (
              <label className="flex flex-col gap-2 text-sm font-medium">Business name
                <input required maxLength={100} value={details.businessName} onChange={(event) => updateDetail("businessName", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
              </label>
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
                {answers.allowance === "yes" && (
                  <label className="flex flex-col gap-2 text-sm font-medium">Annual housing allowance (AED)
                    <input type="number" min="1" max="10000000" value={details.housingBudgetAED} onChange={(event) => updateDetail("housingBudgetAED", event.target.value)} placeholder="Leave empty if unknown" className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                  </label>
                )}
                {answers.allowance !== "provided" && (
                  <>
                    <label className="flex flex-col gap-2 text-sm font-medium">Bedrooms needed
                      <input type="number" min="1" max="10" value={details.bedrooms} onChange={(event) => updateDetail("bedrooms", event.target.value)} placeholder="If known" className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">Maximum commute (minutes)
                      <input type="number" min="5" max="180" value={details.commuteMinutes} onChange={(event) => updateDetail("commuteMinutes", event.target.value)} placeholder="If known" className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
                    </label>
                  </>
                )}
              </>
            )}
            {answers.moving === "with_family" && (
                <label className="flex flex-col gap-2 text-sm font-medium">Child&apos;s age
                <input required type="number" min="0" max="18" value={details.childAge} onChange={(event) => updateDetail("childAge", event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-ink" />
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
          {answers.role === "founder" ? (
            <PlanView key={planVersion} viewerRole="founder" answers={founderPlanAnswers(answers, details, sample)} sampleCase={sample} rememberCase={remember} />
          ) : (
            <PlanView key={planVersion} viewerRole="employee" answers={employeePlanAnswers(answers, company, employee, details, sample)} company={sample ? company : customEmployeeData(company, employee, answers, details).company} employee={sample ? employee : customEmployeeData(company, employee, answers, details).employee} plan={plan} sampleCase={sample} rememberCase={remember} />
          )}
        </main>
      )}
      <IndependentFooter />
    </div>
  );
}
