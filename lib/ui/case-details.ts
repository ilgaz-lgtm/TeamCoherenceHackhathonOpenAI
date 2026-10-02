export type CaseDetails = {
  businessType: string;
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
  businessType: "other", workLocation: "",
  housingBudgetAED: "", bedrooms: "", commuteMinutes: "", childAge: "",
  partnerSponsorship: "unknown", establishmentCardReady: "unknown", plannedHires: "",
};

export function restoreCaseDetails(value: unknown): CaseDetails | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
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

export function validCaseDetails(value: unknown, role: string, moving: string, established?: string): value is CaseDetails {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!Object.keys(emptyDetails).every((key) => typeof record[key] === "string")) return false;
  const details = value as CaseDetails;
  if (!['spouse', 'independent', 'unknown'].includes(details.partnerSponsorship)) return false;
  if (!['yes', 'no', 'unknown'].includes(details.establishmentCardReady)) return false;
  if (!["restaurant_fnb", "consultancy", "trading", "tech_startup", "other"].includes(details.businessType)) return false;
  if (role === "founder" && established === "yes" && !details.plannedHires) return false;
  const limits = { housingBudgetAED: [1, 10000000], bedrooms: [1, 10], commuteMinutes: [5, 180], plannedHires: [0, 50] };
  for (const [key, [min, max]] of Object.entries(limits)) {
    const input = details[key as keyof typeof limits];
    if (input && (!/^\d+$/.test(input) || Number(input) < min || Number(input) > max)) return false;
  }
  return details.workLocation.length <= 100 && (moving !== "with_family" || (childAges(details.childAge)?.length ?? 0) > 0);
}
