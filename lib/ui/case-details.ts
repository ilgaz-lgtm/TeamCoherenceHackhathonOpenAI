export type CaseDetails = {
  name: string;
  businessName: string;
  businessType: string;
  employerName: string;
  workStartDate: string;
  workLocation: string;
  housingBudgetAED: string;
  bedrooms: string;
  commuteMinutes: string;
  childAge: string;
  partnerSponsorship: string;
  establishmentCardReady: string;
  plannedHires: string;
};

export const emptyDetails: CaseDetails = {
  name: "", businessName: "", businessType: "other", employerName: "", workStartDate: "", workLocation: "",
  housingBudgetAED: "", bedrooms: "", commuteMinutes: "", childAge: "",
  partnerSponsorship: "unknown", establishmentCardReady: "unknown", plannedHires: "0",
};

export function restoreCaseDetails(value: unknown): CaseDetails | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const result = { ...emptyDetails };
  for (const key of Object.keys(emptyDetails) as (keyof CaseDetails)[]) {
    if (record[key] !== undefined) {
      if (typeof record[key] !== "string") return undefined;
      result[key] = record[key];
    }
  }
  return result;
}

export function childAges(value: string): number[] | undefined {
  if (!value.trim()) return [];
  const ages = value.split(",").map((part) => Number(part.trim()));
  return ages.length <= 12 && value.split(",").every((part) => /^\d{1,2}$/.test(part.trim()))
    && ages.every((age) => age >= 0 && age <= 18) ? ages : undefined;
}

export function validCaseDetails(value: unknown, role: string, moving: string): value is CaseDetails {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (!Object.keys(emptyDetails).every((key) => typeof record[key] === "string")) return false;
  const details = value as CaseDetails;
  if (!details.name.trim() || details.name.length > 80) return false;
  if (!['spouse', 'independent', 'unknown'].includes(details.partnerSponsorship)) return false;
  if (!['yes', 'no', 'unknown'].includes(details.establishmentCardReady)) return false;
  if (role === "founder" && (!details.businessName.trim() || details.businessName.length > 100)) return false;
  if (!["restaurant_fnb", "consultancy", "trading", "tech_startup", "other"].includes(details.businessType)) return false;
  if (role === "employee" && (!details.employerName.trim() || details.employerName.length > 100
    || !/^\d{4}-\d{2}-\d{2}$/.test(details.workStartDate)
    || !Number.isFinite(Date.parse(`${details.workStartDate}T00:00:00Z`))
    || new Date(`${details.workStartDate}T00:00:00Z`).toISOString().slice(0, 10) !== details.workStartDate)) return false;
  const limits = { housingBudgetAED: [1, 10000000], bedrooms: [1, 10], commuteMinutes: [5, 180], plannedHires: [0, 50] };
  for (const [key, [min, max]] of Object.entries(limits)) {
    const input = details[key as keyof typeof limits];
    if (input && (!/^\d+$/.test(input) || Number(input) < min || Number(input) > max)) return false;
  }
  return details.workLocation.length <= 100 && (moving !== "with_family" || (childAges(details.childAge)?.length ?? 0) > 0);
}
