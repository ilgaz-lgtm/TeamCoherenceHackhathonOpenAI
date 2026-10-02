"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlanView } from "@/components/PlanView";
import {
  AnswerLedger,
  BrandMark,
  CountStepper,
  IndependentFooter,
  OptionList,
  OptionRow,
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
  restaurant_fnb: "Specialty coffee roastery with a café",
  consultancy: "Consultancy",
  trading: "Trading",
  tech_startup: "Tech startup",
};

function founderPlanAnswers(answers: OnboardingAnswers): FounderAnswers {
  const market = answers.pays === "export_only" ? "export"
    : answers.pays === "international_remote" ? "international" : "uae-domestic";
  const premises = answers.where === "remote" ? "none"
    : answers.where === "customer_facing" ? "customer-facing" : "production-only";
  const established = answers.established === "yes";
  const moving = answers.moving;
  const businessType = businessTypes[String(answers.build)] ?? "Company already established";

  return {
    ...founderDemo,
    isEstablishedInUAE: established,
    businessName: established ? "Established UAE company"
      : answers.build === "restaurant_fnb" ? founderDemo.businessName : "Company name pending",
    businessType,
    customerMarket: market,
    headcountYearOne: established ? 0 : typeof answers.payroll === "number" ? answers.payroll : 1,
    premisesNeed: premises,
    relocatingSelf: true,
    movingWithSpouse: moving === "with_partner" || moving === "with_family",
    movingWithChild: moving === "with_family",
    arrivalTarget: String(answers.when ?? ""),
    preferredArea: areaNames[String(answers.area)] ?? "",
  };
}

function employeePlanAnswers(answers: OnboardingAnswers, company: Company, employee: Employee): EmployeeAnswers {
  return {
    employerName: company.name,
    startDate: employee.startDate,
    movingWithSpouse: answers.moving === "with_partner" || answers.moving === "with_family",
    movingWithChild: answers.moving === "with_family",
    preferredArea: areaNames[String(answers.area)] ?? "",
    maxCommuteMinutes: employee.preferences.maxCommuteMinutes,
    arrivalTarget: String(answers.when ?? ""),
    visaStage: String(answers.visaStage ?? "not_started"),
    housingArrangement: String(answers.allowance ?? "yes"),
  };
}

export function OnboardingExperience({ company, employee, plan, todayISO }: Props) {
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [currentKey, setCurrentKey] = useState<QuestionKey>("role");
  const [screen, setScreen] = useState<"onboarding" | "plan">("onboarding");
  const [selection, setSelection] = useState<{ key: QuestionKey; value: string | number } | null>(null);
  const [payrollDraft, setPayrollDraft] = useState(3);
  const [planVersion, setPlanVersion] = useState(0);
  const locked = useRef(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequence = sequenceFor(answers);
  const currentIndex = sequence.indexOf(currentKey);
  const currentQuestion = questions[currentKey];
  const options = optionsFor(currentKey, todayISO);

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
        setPlanVersion((version) => version + 1);
        setScreen("plan");
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
    setPlanVersion((version) => version + 1);
    setScreen("plan");
  }

  function restart() {
    cancelTransition();
    setAnswers({});
    setCurrentKey("role");
    setPayrollDraft(3);
    setScreen("onboarding");
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
        <nav aria-label="Demo controls" className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase">
          <button type="button" onClick={() => loadPersona(founderPersona)} className="min-h-10 border-b border-transparent hover:border-accent">Load founder</button>
          <button type="button" onClick={() => loadPersona(employeePersona)} className="min-h-10 border-b border-transparent hover:border-accent">Load employee</button>
          <button type="button" onClick={restart} className="min-h-10 border-b border-transparent hover:border-accent">Restart</button>
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
      ) : (
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-[clamp(20px,4vw,48px)] pb-16">
          {answers.role === "founder" ? (
            <PlanView key={planVersion} viewerRole="founder" answers={founderPlanAnswers(answers)} />
          ) : (
            <PlanView key={planVersion} viewerRole="employee" answers={employeePlanAnswers(answers, company, employee)} company={company} employee={employee} plan={plan} />
          )}
        </main>
      )}
      <IndependentFooter />
    </div>
  );
}
