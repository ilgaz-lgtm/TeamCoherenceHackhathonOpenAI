import type { Company, Employee } from "@/types/relocation";

export type ViewerRole = "founder" | "employee";
export type CustomerMarket = "uae-domestic" | "export" | "international" | "mixed";
export type PremisesNeed = "customer-facing" | "production-only" | "office" | "warehouse" | "mixed" | "none";
export type PartnerSponsorship = "spouse" | "independent" | "unknown";

export type FounderAnswers = {
  isEstablishedInUAE: boolean;
  establishmentCardReady?: boolean;
  name: string;
  businessName: string;
  businessType: string;
  customerMarket: CustomerMarket;
  headcountYearOne: number;
  premisesNeed: PremisesNeed;
  relocatingSelf: boolean;
  movingWithSpouse: boolean;
  movingWithChild: boolean;
  partnerSponsorship?: PartnerSponsorship;
  spouseName?: string;
  childName?: string;
  childAge?: number;
  childAges?: number[];
  arrivalTarget?: string;
  preferredArea?: string;
};

export type EmployeeAnswers = {
  employerName: string;
  startDate: string;
  movingWithSpouse: boolean;
  movingWithChild: boolean;
  partnerSponsorship?: PartnerSponsorship;
  childAges?: number[];
  preferredArea: string;
  maxCommuteMinutes: number;
  housingBudgetAED?: number;
  arrivalTarget?: string;
  visaStage?: string;
  housingArrangement?: string;
};

export const founderDemo: FounderAnswers = {
  isEstablishedInUAE: false,
  name: "Maya Haddad",
  businessName: "Haddad Coffee Roastery & Café",
  businessType: "Specialty coffee roastery with a café",
  customerMarket: "uae-domestic",
  headcountYearOne: 9,
  premisesNeed: "customer-facing",
  relocatingSelf: true,
  movingWithSpouse: true,
  movingWithChild: true,
  partnerSponsorship: "spouse",
  spouseName: "Omar",
  childName: "Lina",
  childAge: 7,
  arrivalTarget: "2027-04-01",
  preferredArea: "Saadiyat Island",
};

export const founderFamily = {
  spouse: "Omar",
  child: "Lina",
  childAge: 7,
} as const;

export function childLabel(name?: string, age?: number, ages?: readonly number[]): string {
  const plural = (ages?.length ?? 0) > 1 || name?.trim() === "your children";
  const label = name?.trim() || (plural ? "your children" : "your child");
  if (plural) {
    const knownAges = ages?.filter((value) => Number.isFinite(value) && value >= 0) ?? [];
    if (!knownAges.length) return label;
    const ageList = knownAges.length === 1 ? String(knownAges[0]) : `${knownAges.slice(0, -1).join(", ")} and ${knownAges[knownAges.length - 1]}`;
    return `${label} (${knownAges.length === ages?.length ? "ages" : "known ages"} ${ageList})`;
  }
  const knownAge = ages === undefined ? age : ages[0];
  if (knownAge === undefined || !Number.isFinite(knownAge) || knownAge < 0) return label;
  return label === "your child" ? `your ${knownAge}-year-old child` : `${knownAge}-year-old ${label}`;
}

export function employeeAnswersFromFixture(company: Company, employee: Employee): EmployeeAnswers {
  return {
    employerName: company.name,
    startDate: employee.startDate,
    movingWithSpouse: employee.family.some((member) => member.relationship === "spouse"),
    movingWithChild: employee.family.some((member) => member.relationship === "child"),
    partnerSponsorship: employee.family.some((member) => member.relationship === "spouse") ? "spouse" : "unknown",
    childAges: employee.family.filter((member) => member.relationship === "child").map((member) => member.age),
    preferredArea: employee.preferences.preferredAreas[0] ?? "",
    maxCommuteMinutes: employee.preferences.maxCommuteMinutes,
  };
}
