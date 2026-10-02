import type { Company, Employee } from "@/types/relocation";

export type ViewerRole = "founder" | "employee";
export type CustomerMarket = "uae-domestic" | "export" | "international";
export type PremisesNeed = "customer-facing" | "production-only" | "none";

export type FounderAnswers = {
  isEstablishedInUAE: boolean;
  name: string;
  businessName: string;
  businessType: string;
  customerMarket: CustomerMarket;
  headcountYearOne: number;
  premisesNeed: PremisesNeed;
  relocatingSelf: boolean;
  movingWithSpouse: boolean;
  movingWithChild: boolean;
  arrivalTarget?: string;
  preferredArea?: string;
};

export type EmployeeAnswers = {
  employerName: string;
  startDate: string;
  movingWithSpouse: boolean;
  movingWithChild: boolean;
  preferredArea: string;
  maxCommuteMinutes: number;
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
  arrivalTarget: "2027-04-01",
  preferredArea: "Saadiyat Island",
};

export const founderFamily = {
  spouse: "Omar",
  child: "Lina",
  childAge: 7,
} as const;

export function employeeAnswersFromFixture(company: Company, employee: Employee): EmployeeAnswers {
  return {
    employerName: company.name,
    startDate: employee.startDate,
    movingWithSpouse: employee.family.some((member) => member.relationship === "spouse"),
    movingWithChild: employee.family.some((member) => member.relationship === "child"),
    preferredArea: employee.preferences.preferredAreas[0] ?? "",
    maxCommuteMinutes: employee.preferences.maxCommuteMinutes,
  };
}
