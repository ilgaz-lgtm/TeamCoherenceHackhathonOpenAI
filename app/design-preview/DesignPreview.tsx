"use client";

import { useState } from "react";
import {
  AnswerLedger,
  BrandMark,
  CountStepper,
  DurationNote,
  IndependentFooter,
  OptionList,
  OptionRow,
  PlanDataGrid,
  TaskRoomGrid,
} from "@/components/primitives";
import type { LedgerEntry } from "@/components/primitives/AnswerLedger";
import type { TaskRoomData } from "@/components/primitives/TaskRoom";

type QuestionId = "build" | "pays";

const questions = {
  build: {
    title: "What are you building?",
    note: "The activity you choose determines which approvals sit between your premises and licence.",
    options: [
      { value: "restaurant_fnb", label: "Restaurant or food & beverage", consequence: "ADAFSA IN PATH" },
      { value: "consultancy", label: "Consultancy", consequence: "PROFESSIONAL LICENCE" },
      { value: "trading", label: "Trading", consequence: "COMMERCIAL LICENCE" },
      { value: "tech_startup", label: "Tech startup", consequence: "FREE ZONE VIABLE" },
    ],
  },
  pays: {
    title: "Who pays you?",
    note: "Whether you invoice UAE customers directly is what separates a mainland licence from a free-zone one.",
    options: [
      { value: "uae_domestic", label: "Customers in the UAE, invoiced directly", consequence: "MAINLAND LIKELY" },
      { value: "export_only", label: "Customers outside the UAE only", consequence: "FREE ZONE VIABLE" },
      { value: "international_remote", label: "International clients, delivered remotely", consequence: "FREE ZONE VIABLE" },
      { value: "mixed", label: "A mix of UAE and overseas", consequence: "MAINLAND LIKELY" },
    ],
  },
} as const;

const companyRooms: TaskRoomData[] = [
  {
    id: "A04",
    category: "premises",
    title: "Premises lease & Tawtheeq registration",
    description: "Sign a commercial lease and register it in Tawtheeq — Abu Dhabi’s system. Ejari is Dubai’s and does not apply.",
    rationale: "Walk-in customers make this an ADDED matter rather than a free zone one, which is what pulls tenancy registration onto the critical path.",
    status: "queued",
    columns: 7,
    rows: 2,
    critical: true,
    authority: "ADDED",
    estimateWorkingDays: { low: 10, high: 21 },
    provider: "Brokerage A · Brokerage B",
  },
  {
    id: "A05",
    category: "licensing",
    title: "Food establishment approval",
    description: "Apply to ADAFSA for food-establishment approval of the premises.",
    rationale: "Serving food puts ADAFSA between your tenancy and your licence. It inspects the kitchen inside the lease you signed in A04, so a layout change means a new inspection.",
    status: "queued",
    columns: 5,
    rows: 2,
    authority: "ADAFSA",
    estimateWorkingDays: { low: 10, high: 21 },
  },
  {
    id: "A07",
    category: "licensing",
    title: "Establishment card",
    description: "Register the company with ICP so it can sponsor residence visas.",
    rationale: "Your residence visa cannot open before the company holds an establishment card, so the licence date — not your start date — is what moves your family’s arrival.",
    status: "queued",
    columns: 7,
    rows: 2,
    critical: true,
    bridge: true,
    authority: "ICP",
    estimateWorkingDays: { low: 5, high: 11 },
  },
];

const peopleRooms: TaskRoomData[] = [
  {
    id: "B01",
    category: "visa",
    title: "Entry permit",
    description: "The company files your entry permit with ICP.",
    rationale: "The company is your sponsor. Until ICP issues its establishment card, there is no sponsor on file for the permit to name.",
    status: "blocked",
    columns: 5,
    waitingOn: ["Establishment card"],
    rootBlocker: "A07 ESTABLISHMENT CARD",
    authority: "ICP",
    estimateWorkingDays: { low: 6, high: 12 },
  },
  {
    id: "B04",
    category: "visa",
    title: "Residence visa",
    description: "Receive the residence visa linked to your Emirates ID.",
    rationale: "You become the company’s first sponsored resident. Every family visa after this one is sponsored by you, so your family’s dates inherit yours.",
    status: "blocked",
    columns: 7,
    rows: 2,
    waitingOn: ["Emirates ID biometrics", "Health cover"],
    rootBlocker: "A07 ESTABLISHMENT CARD",
    authority: "ICP",
    estimateWorkingDays: { low: 5, high: 11 },
  },
];

export function DesignPreview({ today }: { today: string }) {
  const [activeQuestion, setActiveQuestion] = useState<QuestionId>("pays");
  const [answers, setAnswers] = useState<Record<QuestionId, string | undefined>>({ build: "restaurant_fnb", pays: undefined });
  const [payroll, setPayroll] = useState(9);
  const question = questions[activeQuestion];
  const entries: LedgerEntry[] = (Object.keys(questions) as QuestionId[])
    .filter((id) => answers[id])
    .map((id, index) => ({
      id,
      number: `Q${index + 1}`,
      keyLabel: id === "build" ? "BUILDING" : "REVENUE",
      value: questions[id].options.find((option) => option.value === answers[id])?.label ?? "",
      onRevise: () => setActiveQuestion(id),
    }));

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-ink px-[clamp(20px,4vw,48px)] py-3.5">
        <BrandMark />
        <span className="font-heading text-[22px] font-bold uppercase">Wusool</span>
        <span className="font-arabic text-xl font-semibold leading-none">وصول</span>
        <span className="font-mono text-[11px] text-ink-muted sm:ml-2">ARRIVAL — IN THE RIGHT ORDER</span>
        <span className="ml-auto font-mono text-[10px] text-ink-muted">PREVIEW · SAMPLE CASE</span>
      </header>

      <div className="flex flex-col md:flex-row">
        <AnswerLedger entries={entries} activeId={activeQuestion} className="md:shrink-0" />
        <main className="flex min-w-0 flex-1 flex-col gap-7 px-[clamp(20px,5vw,80px)] py-[clamp(32px,6vh,72px)]">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="font-semibold text-accent">{activeQuestion === "build" ? "Q1" : "Q2"}</span>
            <span className="text-ink-muted">QUESTION {activeQuestion === "build" ? "01" : "02"} OF 02</span>
          </div>
          <h1 className="type-question max-w-[18ch]">{question.title}</h1>
          <p className="flex max-w-[720px] items-start gap-3 text-base leading-normal text-ink-soft">
            <span className="shrink-0 font-mono text-[11px] font-semibold text-accent">NOTE</span>
            <span className="mt-3 h-px w-9 shrink-0 bg-accent" aria-hidden="true" />
            <span>{question.note}</span>
          </p>
          <OptionList label={question.title} onBack={activeQuestion === "pays" ? () => setActiveQuestion("build") : undefined} className="w-full max-w-[980px]">
            {question.options.map((option, index) => (
              <OptionRow
                key={option.value}
                index={index + 1}
                label={option.label}
                consequence={option.consequence}
                selected={answers[activeQuestion] === option.value}
                onClick={() => setAnswers((current) => ({ ...current, [activeQuestion]: option.value }))}
              />
            ))}
          </OptionList>
          <div className="mt-4 flex flex-col gap-5 border-t border-ink pt-7">
            <span className="font-mono text-[11px] text-ink-muted">YEAR-ONE PAYROLL</span>
            <CountStepper label="staff on payroll" value={payroll} onChange={setPayroll} />
          </div>
        </main>
      </div>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 border-t border-ink px-[clamp(20px,4vw,48px)] py-[clamp(28px,5vh,56px)]">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-4">
            <span className="font-mono text-[11px] text-ink-muted">SHEET 01 · FOOD & BEVERAGE · NOT YET ESTABLISHED</span>
            <h2 className="type-plan max-w-[14ch]">Company first, then people.</h2>
            <p className="max-w-[56ch] text-lg leading-normal text-ink-soft">The licence date, not the start date, determines when a family can arrive.</p>
          </div>
          <div className="flex min-w-[280px] flex-1 basis-[460px] flex-col gap-3">
            <PlanDataGrid cells={[
              { key: "project", label: "PROJECT", value: "WUSOOL" },
              { key: "sheet", label: "SHEET", value: "01 OF 03" },
              { key: "company", label: "COMPANY", value: "Restaurant or food & beverage · name pending", span: 2 },
              { key: "person", label: "PERSON", value: "Founder · me, a partner and children", span: 2 },
              { key: "generated", label: "GENERATED", value: today },
              { key: "status", label: "SOURCE STATUS", value: "NOT YET VERIFIED" },
            ]} />
            <DurationNote />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-4 border-b border-ink pb-3">
            <h2 className="font-heading text-[28px] font-semibold uppercase">Layer A — Establish the company</h2>
            <span className="font-mono text-[11px] text-ink-muted">LICENSING · PREMISES · BANKING</span>
          </div>
          <TaskRoomGrid tasks={companyRooms} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-4 border-b border-ink pb-3">
            <h2 className="font-heading text-[28px] font-semibold uppercase">Layer B — Relocate the people</h2>
            <span className="font-mono text-[11px] text-ink-muted">A07 ESTABLISHMENT CARD → B01 ENTRY PERMIT</span>
          </div>
          <TaskRoomGrid tasks={peopleRooms} />
        </div>
      </section>
      <IndependentFooter />
    </div>
  );
}
