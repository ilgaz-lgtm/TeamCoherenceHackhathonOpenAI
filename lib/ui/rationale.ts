import type { Company, Employee } from "@/types/relocation";
import { formatAed, formatNumber } from "./format";
import { founderFamily } from "./personas";
import type { EmployeeAnswers, FounderAnswers } from "./personas";
import type { ScopedTask } from "./scope";

export type RationaleContext =
  | { viewerRole: "founder"; answers: FounderAnswers }
  | { viewerRole: "employee"; answers: EmployeeAnswers; company: Company; employee: Employee };

const smallNumbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

function countText(value: number): string {
  if (value === 30) return "thirty";
  return smallNumbers[value] ?? formatNumber(value);
}

function initialCapital(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}

function startDay(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? "you";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function founderRationaleByTaskId(answers: FounderAnswers): Record<string, string> {
  const count = countText(answers.headcountYearOne);
  const countUpper = initialCapital(count);
  const coffee = /coffee|roaster|café|cafe/i.test(answers.businessType);
  const spouse = answers.movingWithSpouse;
  const child = answers.movingWithChild;
  const familyNames = joinNames([
    ...(spouse ? [founderFamily.spouse] : []),
    ...(child ? [`${countText(founderFamily.childAge)}-year-old ${founderFamily.child}`] : []),
  ]);

  return {
    "activity-scope": coffee
      ? "Two revenue streams, roasted coffee and café service, must appear in your ADDED activity selection before you file."
      : `ADDED's activity selection must cover ${answers.businessType.trim()} before you file, or your licence will describe the wrong business.`,
    "legal-form": answers.customerMarket === "uae-domestic"
      ? "ADDED's licence route must let you sell to UAE domestic customers; an export-only route will not cover your café counter."
      : `ADDED's licence route must fit your ${answers.customerMarket === "export" ? "export" : "international"} customers, so legal form comes before the final filing.`,
    "trade-name": coffee
      ? "ADDED’s trade-name reservation gives your roastery and café one legal identity across the licence, lease and bank file."
      : "ADDED’s trade-name reservation gives your business one legal identity across the licence, lease and bank file.",
    "initial-approval": `${countUpper} first-year staff turn the licence date into a hiring constraint; ADDED’s initial approval is the checkpoint before you commit to the final filing.`,
    "premises-spec": coffee && answers.premisesNeed === "customer-facing"
      ? `${countUpper} staff, roasting equipment and a customer-facing café make your premises a production site and a shop, not just an address.`
      : `${countUpper} planned staff and your ${answers.premisesNeed === "production-only" ? "production" : "customer-facing"} activity determine the space you must verify before leasing.`,
    "site-review": coffee
      ? "A landlord’s floor plan does not prove your roasting and café uses are accepted at that address; ADDED’s activity requirements settle the licence fit."
      : "A landlord’s floor plan does not prove your chosen activity is accepted at that address; ADDED’s requirements settle the licence fit.",
    lease: coffee
      ? "ADDED needs an accepted business location in your café licence file, so the tenancy is a formation input rather than a later fit-out choice."
      : "ADDED needs an accepted business location in your licence file, so the tenancy is a formation input rather than a later fit-out choice.",
    "food-approvals": "ADDED’s activity-specific approval list decides which food authority reviews your roastery and café; the list, not a generic restaurant checklist, governs the fit-out.",
    licence: `ICP requires a valid licence before issuing your establishment card, so ${count} staff cannot enter the sponsorship chain on a signed lease alone.`,
    "establishment-card": `The establishment card carries your licence number into ICP’s employer services; without it, your first ${count} staff have no company sponsorship file.`,
    "business-bank": coffee
      ? `${countUpper} salaries and daily café receipts require a company payment route; your personal account is not the operating account for this business.`
      : `${countUpper} salaries and customer receipts require a company payment route; your personal account is not the operating account for this business.`,
    payroll: `${countUpper} year-one hires make your business account a pay-run dependency; a licence does not move salaries to their accounts.`,
    "founder-residence": "The licence identifies you as an owner, so ICP’s residence route must be chosen for a founder rather than for an employee you hire.",
    "family-sponsorship": spouse && child
      ? "Omar and seven-year-old Lina depend on the status under which you reside; their applications follow your own residence decision, not the café lease."
      : `${familyNames} depends on your ICP residence status; their application follows that decision, not the business lease.`,
    "family-school": "An offered seat for seven-year-old Lina fixes the school-run radius before you commit to a home lease.",
    "family-home": child && coffee
      ? "Seven-year-old Lina’s school location and your café commute compete for the same address; a lease chosen on commute alone closes off her school options."
      : child
        ? "Seven-year-old Lina’s school location and your business commute compete for the same address; a lease chosen on commute alone closes off her school options."
        : "Your ADDED-licensed business location does not settle the residential commute; that second address still needs its own lease decision.",
    "family-insurance": spouse && child
      ? "You, Omar and seven-year-old Lina need effective cover from arrival; a policy that starts with the café opening leaves a gap."
      : `You${spouse ? ` and ${founderFamily.spouse}` : ""}${child ? ` and ${founderFamily.child}` : ""} need cover from your ICP residence date; a policy that starts with the business opening leaves a gap.`,
    "family-travel": coffee && (spouse || child)
      ? "ICP cannot open your residence file before 'Obtain establishment card' is done; the family’s arrival follows that gate, not your café opening."
      : "ICP cannot open your residence file before 'Obtain establishment card' is done; your arrival follows that gate, not your business opening.",
    "home-utilities": coffee
      ? "The Secure family home task produces the residential address for your utilities; the café’s commercial lease cannot substitute for it."
      : "The Secure family home task produces the residential address for your utilities; a business lease cannot substitute for it.",
    "first-hire-roles": coffee
      ? `${countUpper} year-one roles span your roastery and café service; work-permit files cannot start from an undifferentiated headcount.`
      : `${countUpper} year-one roles span your operations; work-permit files cannot start from an undifferentiated headcount.`,
    "work-permit-quota": `MOHRE’s work-permit capacity sets how many of your ${count} planned hires enter processing together; the rota cannot assume all ${count} clear at once.`,
    "offers-contracts": coffee
      ? `The first ${count} work-permit files need role-aligned offers, so a generic café contract creates a mismatch you must correct.`
      : `The first ${count} work-permit files need role-aligned offers, so a generic contract creates a mismatch you must correct.`,
    "employee-permits": `A valid licence and establishment card put your company on the employer side of the file; MOHRE cannot process your first ${count} permits against an unregistered venture.`,
    "employee-arrivals": coffee
      ? `Permit approval, not your café opening date, determines when the first ${count} hires can join the rota.`
      : `Permit approval, not your business opening date, determines when the first ${count} hires can start.`,
    "employee-coverage": `${countUpper} year-one hires will not all enter on the same date, so your staff policy must start cover per hire, not at your opening.`,
  };
}

export function employeeRationaleByTaskId(
  answers: EmployeeAnswers,
  company: Company,
  employee: Employee,
): Record<string, string> {
  const start = startDay(answers.startDate);
  const spouse = employee.family.find((member) => member.relationship === "spouse");
  const child = employee.family.find((member) => member.relationship === "child");
  const travellers = joinNames([
    ...(answers.movingWithSpouse && spouse ? [spouse.name] : []),
    ...(answers.movingWithChild && child ? [child.name] : []),
  ]);
  const covered = joinNames([
    ...(answers.movingWithSpouse && spouse ? [spouse.name] : []),
    ...(answers.movingWithChild && child ? [`${countText(child.age)}-year-old ${child.name}`] : []),
  ]);
  const stay = countText(company.policy.temporaryAccommodationDays);
  const bedrooms = countText(employee.preferences.bedrooms);

  return {
    visa: `${start} is a work start, not an entry clearance date; your sponsored visa outcome sets when ${travellers} can travel.`,
    travel: `${initialCapital(stay)} days of temporary accommodation start with arrival, so a visa delay consumes the allowance if you book from the ${start} work date.`,
    housing: `The ${answers.maxCommuteMinutes}-minute ADGM commute narrows ${bedrooms}-bedroom homes within your ${formatAed(company.policy.housingAllowanceAED)} cap; a cheaper listing outside that radius still fails the brief.`,
    insurance: `The company’s “${company.policy.healthInsuranceCoverage.toLowerCase()}” policy lists ${covered}, but your ${start} start date does not establish when their cover begins.`,
    settling: `A residential tenancy, not the ${start} work start, gives utilities the address they use to open your household accounts.`,
    school: `An offered seat for ${countText(child?.age ?? 8)}-year-old ${child?.name ?? "Jamie"} fixes the school-run radius, so you shortlist housing around the school rather than reverse that order.`,
  };
}

export function rationaleByTaskId(context: RationaleContext): Record<string, string> {
  return context.viewerRole === "founder"
    ? founderRationaleByTaskId(context.answers)
    : employeeRationaleByTaskId(context.answers, context.company, context.employee);
}

export function rationaleForTask(task: ScopedTask, context: RationaleContext): string {
  const authored = task.rationale?.trim();
  const rationale = authored || rationaleByTaskId(context)[task.id];
  if (!rationale) throw new Error(`Missing ${context.viewerRole} rationale for task ${task.id}`);
  if (rationale.length >= 220) throw new Error(`Rationale exceeds 219 characters for task ${task.id}`);
  return rationale;
}
