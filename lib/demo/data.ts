import { companySchema, employeeSchema, relocationCaseSchema } from "../schemas/relocation";
import { buildDemoPlan } from "./plan";

// Fictional fixtures, safe to import from UI code; no server credentials here.
export const demoCompany = companySchema.parse({
  id: "company-coherence", name: "Coherence Technologies",
  policy: { housingAllowanceAED: 180000, schoolAllowanceAED: 45000,
    temporaryAccommodationDays: 30, healthInsuranceCoverage: "Employee and dependants",
    visaSponsorship: true, flightAllowanceAED: 12000, officeLocation: "ADGM",
    preferredAreas: ["Al Reem Island", "Saadiyat Island"] },
});
export const demoEmployee = employeeSchema.parse({
  id: "employee-alex", companyId: demoCompany.id, name: "Alex Morgan",
  nationality: "British", movingFrom: "London", role: "Engineering Lead", startDate: "2026-11-02",
  family: [{ name: "Sam", relationship: "spouse", age: 35 }, { name: "Jamie", relationship: "child", age: 8 }],
  preferences: { bedrooms: 3, maxCommuteMinutes: 25, preferredAreas: ["Al Reem Island", "Saadiyat Island"] },
});
export const demoPlanRequest = { companyPolicy: demoCompany.policy, employee: demoEmployee };
export const demoRelocation = relocationCaseSchema.parse({
  id: "relocation-alex", companyId: demoCompany.id, employeeId: demoEmployee.id,
  destination: "Abu Dhabi", plan: buildDemoPlan(demoPlanRequest),
});
export const demoHousingRequest = { bedrooms: 3, maxAnnualRentAED: 180000, officeArea: "ADGM", maxCommuteMinutes: 25, preferredAreas: ["Al Reem Island", "Saadiyat Island"] };

// Separate assignment policy; the original employer policy is unchanged.
export const demoShortTermPolicy = companySchema.shape.policy.parse({
  ...demoCompany.policy, housingAllowanceAED: 90000, schoolAllowanceAED: 0,
  temporaryAccommodationDays: 60, healthInsuranceCoverage: "Employee only during the assignment",
  flightAllowanceAED: 4000, preferredAreas: ["Al Reem Island"],
});
export const demoShortTermEmployee = employeeSchema.parse({
  id: "employee-maya", companyId: demoCompany.id, name: "Maya Patel",
  nationality: "Indian", movingFrom: "Mumbai", role: "Junior Data Analyst", startDate: "2026-11-02",
  family: [], assignment: { durationDays: 60, accommodation: "employer_managed" },
  preferences: { bedrooms: 1, maxCommuteMinutes: 20, preferredAreas: ["Al Reem Island"] },
});
export const demoShortTermPlanRequest = { companyPolicy: demoShortTermPolicy, employee: demoShortTermEmployee };
export const demoShortTermRelocation = relocationCaseSchema.parse({
  id: "relocation-maya", companyId: demoCompany.id, employeeId: demoShortTermEmployee.id,
  destination: "Abu Dhabi", plan: buildDemoPlan(demoShortTermPlanRequest),
});
export const demoShortTermHousingRequest = { bedrooms: 1, maxAnnualRentAED: 90000, officeArea: "ADGM", maxCommuteMinutes: 20, preferredAreas: ["Al Reem Island"] };
export const demoPersonas = [
  { id: "alex", label: "Family relocation", companyPolicy: demoCompany.policy, employee: demoEmployee, relocation: demoRelocation, housingRequest: demoHousingRequest },
  { id: "maya", label: "Short-term assignment", companyPolicy: demoShortTermPolicy, employee: demoShortTermEmployee, relocation: demoShortTermRelocation, housingRequest: demoShortTermHousingRequest },
];
