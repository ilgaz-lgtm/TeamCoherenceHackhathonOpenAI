export const employeeSequence = ["role", "visaStage", "allowance", "moving", "when", "area"] as const;
export const establishedFounderSequence = ["role", "established", "moving", "when", "area"] as const;
export const newFounderSequence = ["role", "established", "build", "pays", "payroll", "where", "moving", "when", "area"] as const;

export type QuestionKey = typeof newFounderSequence[number] | typeof employeeSequence[number];
export type OnboardingAnswers = Partial<Record<QuestionKey, string | number>>;

export type QuestionOption = {
  value: string;
  label: string;
  consequence: string;
};

type QuestionDefinition = {
  title: string;
  note?: string;
  options?: readonly QuestionOption[];
};

export const questions: Record<QuestionKey, QuestionDefinition> = {
  role: {
    title: "Are you joining an employer, or setting up a company?",
    note: "This one answer decides the shape of everything that follows.",
    options: [
      { value: "employee", label: "I am joining an employer", consequence: "PEOPLE ONLY" },
      { value: "founder", label: "I am setting up a company", consequence: "COMPANY + PEOPLE" },
    ],
  },
  visaStage: {
    title: "Has your employer started your visa?",
    note: "Your employer is your sponsor. Where they are in the process is where your plan begins.",
    options: [
      { value: "not_started", label: "Not yet", consequence: "PLAN STARTS AT ENTRY PERMIT" },
      { value: "filed", label: "Entry permit filed", consequence: "IN PROGRESS" },
      { value: "approved", label: "Entry permit approved", consequence: "MEDICAL NEXT" },
    ],
  },
  allowance: {
    title: "Does your package include a housing allowance?",
    options: [
      { value: "yes", label: "Yes, a housing allowance", consequence: "SETS YOUR RENT BUDGET" },
      { value: "provided", label: "Housing is provided", consequence: "NO LEASE TO SIGN" },
      { value: "no", label: "No, rent comes from salary", consequence: "BUDGET FROM SALARY" },
    ],
  },
  established: {
    title: "Is your company already established in the UAE?",
    note: "A company without a UAE licence and establishment card cannot sponsor anyone yet.",
    options: [
      { value: "no", label: "No — I am setting it up", consequence: "BOTH LAYERS" },
      { value: "yes", label: "Yes — it already holds a UAE licence", consequence: "PEOPLE ONLY" },
    ],
  },
  build: {
    title: "What are you building?",
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
  payroll: {
    title: "How many people on payroll in year one?",
    note: "Headcount decides the premises you need, and the premises decide the licence.",
  },
  where: {
    title: "Where does the work happen?",
    options: [
      { value: "customer_facing", label: "Customers walk in", consequence: "ADDED MATTER" },
      { value: "office_only", label: "An office, no walk-ins", consequence: "EITHER ROUTE" },
      { value: "warehouse", label: "A warehouse or storage space", consequence: "ZONING CHECK" },
      { value: "remote", label: "Remote — no fixed premises", consequence: "FLEXI-DESK VIABLE" },
    ],
  },
  moving: {
    title: "Who is moving?",
    options: [
      { value: "solo", label: "Just me", consequence: "ONE VISA" },
      { value: "with_partner", label: "Me and a partner", consequence: "+ SPONSORSHIP" },
      { value: "with_family", label: "Me, a partner and children", consequence: "+ SCHOOL DEADLINE" },
    ],
  },
  when: {
    title: "When do you need to be here?",
  },
  area: {
    title: "Where would you like to live?",
    note: "Commute is estimated to Al Maryah Island. Estimates only.",
    options: [
      { value: "reem", label: "Al Reem Island", consequence: "CITY · SHORT COMMUTE" },
      { value: "raha", label: "Al Raha Beach", consequence: "MID-DISTANCE · NEAR YAS" },
      { value: "khalifa", label: "Khalifa City", consequence: "VILLAS · LONGER DRIVE" },
      { value: "saadiyat", label: "Saadiyat Island", consequence: "SCHOOLS · CULTURAL DISTRICT" },
    ],
  },
};

function targetDates(todayISO: string) {
  const [year, month] = todayISO.split("-").map(Number);
  return [2, 4, 6, 10].map((offset) => {
    const date = new Date(Date.UTC(year, month - 1 + offset, 1));
    return {
      value: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(date),
    };
  });
}

export const founderPersona: OnboardingAnswers = {
  role: "founder",
  established: "no",
  build: "restaurant_fnb",
  pays: "uae_domestic",
  payroll: 9,
  where: "customer_facing",
  moving: "with_family",
  when: "2027-04-01",
  area: "saadiyat",
};

export const employeePersona: OnboardingAnswers = {
  role: "employee",
  visaStage: "filed",
  allowance: "yes",
  moving: "with_partner",
  when: "2026-12-01",
  area: "reem",
};

export function sequenceFor(answers: OnboardingAnswers): readonly QuestionKey[] {
  if (answers.role === "employee") return employeeSequence;
  if (answers.role === "founder") {
    if (answers.established === "yes") return establishedFounderSequence;
    if (answers.established === "no") return newFounderSequence;
    return ["role", "established"];
  }
  return ["role"];
}

export function applyAnswer(answers: OnboardingAnswers, key: QuestionKey, value: string | number): OnboardingAnswers {
  const updated = { ...answers, [key]: value };
  const active = new Set<QuestionKey>(sequenceFor(updated));
  if (updated.role === "founder" && updated.established === undefined) {
    active.add("moving");
    active.add("when");
    active.add("area");
  }
  return Object.fromEntries(
    Object.entries(updated).filter(([candidate]) => active.has(candidate as QuestionKey)),
  ) as OnboardingAnswers;
}

export function firstUnanswered(answers: OnboardingAnswers): QuestionKey | undefined {
  return sequenceFor(answers).find((key) => answers[key] === undefined);
}

export function questionTotal(answers: OnboardingAnswers): string {
  if (answers.role === "employee") return "06";
  if (answers.role === "founder" && answers.established === "yes") return "05";
  if (answers.role === "founder" && answers.established === "no") return "09";
  return "—";
}

export function dayFromToday(targetISO: string, todayISO: string): number {
  return Math.round((Date.parse(`${targetISO}T00:00:00Z`) - Date.parse(`${todayISO}T00:00:00Z`)) / 86_400_000);
}

export function optionsFor(key: QuestionKey, todayISO: string): readonly QuestionOption[] {
  if (key === "when") {
    return targetDates(todayISO).map(({ value, label }) => ({
      value,
      label,
      consequence: value.slice(5, 7) === "08" ? "SCHOOL INTAKE" : `≈ DAY ${dayFromToday(value, todayISO)}`,
    }));
  }
  return questions[key].options ?? [];
}

export function payrollNote(count: number): string {
  if (count <= 3) return "A FLEXI-DESK MAY COVER THIS — TODO(verify)";
  if (count <= 7) return "A SMALL REGISTERED OFFICE IS LIKELY";
  return "DEDICATED FLOOR AREA — PREMISES BECOME A HIRING CONSTRAINT";
}

export function answerLabel(key: QuestionKey, value: string | number, todayISO: string): string {
  if (key === "payroll") return `${value} on payroll`;
  return optionsFor(key, todayISO).find((option) => option.value === value)?.label ?? String(value);
}
