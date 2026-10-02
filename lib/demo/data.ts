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
