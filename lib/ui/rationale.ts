import type { Company, Employee } from "@/types/relocation";
import { formatAed, formatNumber } from "./format";
import { childLabel } from "./personas";
import type { EmployeeAnswers, FounderAnswers } from "./personas";
import type { ScopedTask } from "./scope";

export type RationaleContext =
  | { viewerRole: "founder"; answers: FounderAnswers }
  | { viewerRole: "employee"; answers: EmployeeAnswers; company: Company; employee: Employee };

const smallNumbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

function countText(value: number): string {
  if (!Number.isFinite(value)) return "unconfirmed";
  if (value === 30) return "thirty";
  return smallNumbers[value] ?? formatNumber(value);
}

function compactLabel(value: string | undefined, fallback: string, limit = 32): string {
  const label = value?.trim();
  return label && label.length <= limit ? label : fallback;
}

function initialCapital(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function startDay(date: string): string {
  const normalized = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return "";
  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parsed);
}

function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? "you";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function founderRationaleByTaskId(answers: FounderAnswers): Record<string, string> {
  const count = compactLabel(countText(answers.headcountYearOne), "planned", 18);
  const countUpper = initialCapital(count);
  const coffee = /coffee|roaster|café|cafe/i.test(answers.businessType);
  const spouse = answers.movingWithSpouse;
  const sponsoredPartner = spouse && answers.partnerSponsorship === "spouse";
  const child = answers.movingWithChild;
  const spouseName = compactLabel(answers.spouseName, sponsoredPartner ? "your spouse" : "your partner");
  const childFallback = (answers.childAges?.length ?? 0) > 1 || answers.childName?.trim() === "your children" ? "your children" : "your child";
  const childName = compactLabel(answers.childName, childFallback);
  const childDescription = compactLabel(childLabel(childName, answers.childAge, answers.childAges), childFallback, 48);
  const businessType = compactLabel(answers.businessType, "your intended business activities", 64);
  const premisesDescription = {
    "customer-facing": "customer-facing",
    "production-only": "production",
    office: "office",
    warehouse: "warehouse and storage",
    mixed: "combined office, storage and operating",
    none: "remote",
  }[answers.premisesNeed];
  const familyNames = joinNames([
    ...(sponsoredPartner ? [spouseName] : []),
    ...(child ? [childDescription] : []),
  ]);

  return {
    "activity-scope": coffee
      ? "Two revenue streams, roasted coffee and café service, must appear in your ADDED activity selection before you file."
      : `ADDED's activity selection must cover ${businessType} before you file, or your licence will describe the wrong business.`,
    "legal-form": answers.customerMarket === "mixed"
      ? "Your ADDED licence route must cover both UAE domestic and international customers; confirm both markets against the selected activities before filing."
      : answers.customerMarket === "uae-domestic"
      ? `ADDED's licence route must let you sell to UAE domestic customers; an export-only route will not cover your ${coffee ? "café counter" : "domestic sales"}.`
      : `ADDED's licence route must fit your ${answers.customerMarket === "export" ? "export" : "international"} customers, so legal form comes before the final filing.`,
    "trade-name": coffee
      ? "ADDED’s trade-name reservation gives your roastery and café one legal identity across the licence, lease and bank file."
      : "ADDED’s trade-name reservation gives your business one legal identity across the licence, lease and bank file.",
    "initial-approval": `${countUpper} first-year staff turn the licence date into a hiring constraint; ADDED’s initial approval is the checkpoint before you commit to the final filing.`,
    "premises-spec": coffee && answers.premisesNeed === "customer-facing"
      ? `${countUpper} staff, roasting equipment and a customer-facing café make your premises a production site and a shop, not just an address.`
      : `${countUpper} planned staff and your ${premisesDescription} activity determine the space you must verify before leasing.`,
    "site-review": coffee
      ? "A landlord’s floor plan does not prove your roasting and café uses are accepted at that address; ADDED’s activity requirements settle the licence fit."
      : "A landlord’s floor plan does not prove your chosen activity is accepted at that address; ADDED’s requirements settle the licence fit.",
    lease: coffee
      ? "ADDED needs an accepted business location in your café licence file, so the tenancy is a formation input rather than a later fit-out choice."
      : "ADDED needs an accepted business location in your licence file, so the tenancy is a formation input rather than a later fit-out choice.",
    "food-approvals": `ADDED’s activity-specific approval list decides which food authority reviews your ${coffee ? "roastery and café" : "food business"}; that list governs the fit-out.`,
    licence: `ICP requires a valid licence before issuing your establishment card, so ${count} staff cannot enter the sponsorship chain on a signed lease alone.`,
    "establishment-card": answers.isEstablishedInUAE
      ? "Your existing licence does not confirm an active ICP establishment card; verify the company sponsorship record before residence or staff permit work proceeds."
      : `The establishment card carries your licence number into ICP’s employer services; without it, your first ${count} staff have no company sponsorship file.`,
    "business-bank": coffee
      ? `${countUpper} salaries and daily café receipts require a company payment route; your personal account is not the operating account for this business.`
      : `${countUpper} salaries and customer receipts require a company payment route; your personal account is not the operating account for this business.`,
    payroll: `${countUpper} year-one hires make your business account a pay-run dependency; a licence does not move salaries to their accounts.`,
    "founder-residence": "ICP's issued entry permission clears your founder arrival; final residence steps follow your physical entry under the confirmed route.",
    "family-sponsorship": `Your ICP status determines the eligible sponsorship route for ${familyNames}; confirm their individual applications after your own status decision.`,
    "family-school": `ADEK placement decisions for ${childDescription} set your school-run radius before you commit to a home lease.`,
    "family-home": child
        ? `The 'Secure school placement' decision for ${childDescription} and your business commute set the home area before you sign a lease.`
        : "Your ADDED-licensed business location does not settle the residential commute; that second address still needs its own lease decision.",
    "family-insurance": `The 'Sequence household arrival' dates set effective cover for ${joinNames(["you", ...(spouse ? [spouseName] : []), ...(child ? [childDescription] : [])])}; confirm policy start dates before booking.`,
    "family-travel": "Your household arrival needs the confirmed ICP entry permissions for each traveller, including any separate partner route; the company licence alone does not clear travel.",
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
    "employee-coverage": `${countUpper} year-one hires make the ${coffee ? "café" : "business"} opening date an unsafe proxy for cover; your staff policy must follow each approved hire date.`,
  };
}

export function employeeRationaleByTaskId(
  answers: EmployeeAnswers,
  company: Company,
  employee: Employee,
): Record<string, string> {
  const start = startDay(answers.startDate);
  const workDate = start ? `${start} work start` : "unconfirmed work start";
  const spouse = employee.family.find((member) => member.relationship === "spouse");
  const children = employee.family.filter((member) => member.relationship === "child");
  const partnerName = compactLabel(spouse?.name, answers.partnerSponsorship === "spouse" ? "your spouse" : "your partner");
  const childFallback = children.length > 1 || (answers.childAges?.length ?? 0) > 1 ? "your children" : "your child";
  const childName = children.length > 1 ? childFallback : compactLabel(children[0]?.name, childFallback);
  const childDescription = compactLabel(childLabel(childName, undefined, answers.childAges ?? children.map((member) => member.age)), childFallback, 48);
  const covered = joinNames([
    "you",
    ...(answers.movingWithSpouse ? [partnerName] : []),
    ...(answers.movingWithChild ? [childDescription] : []),
  ]);
  const stay = compactLabel(countText(company.policy.temporaryAccommodationDays), "your allotted", 24);
  const homeCount = compactLabel(countText(employee.preferences.bedrooms), "confirmed", 18);
  const homes = employee.preferences.bedrooms > 0 ? `${homeCount}-bedroom homes` : "homes with a bedroom count you confirm";
  const workplace = compactLabel(company.policy.officeLocation === "Not provided" ? undefined : company.policy.officeLocation, "your workplace");
  const commuteKnown = answers.maxCommuteMinutes > 0 && answers.maxCommuteMinutes <= 180;
  const commute = commuteKnown
    ? workplace === "your workplace" ? `${answers.maxCommuteMinutes}-minute commute to your workplace` : `${answers.maxCommuteMinutes}-minute ${workplace} commute`
    : `commute limit you confirm for ${workplace}`;
  const hasHousingCap = company.policy.housingAllowanceAED > 0;
  const housingCap = compactLabel(formatAed(company.policy.housingAllowanceAED), "stated housing", 24);
  const rentBudget = answers.housingArrangement === "no" ? "your salary-funded rent budget"
    : hasHousingCap ? `your ${housingCap} annual employer cap` : "your rent budget confirmed with the employer";
  const healthScope = company.policy.healthInsuranceCoverage === "Not provided" ? null : company.policy.healthInsuranceCoverage;

  return {
    visa: `ICP entry permission, not your ${workDate}, clears your arrival. Each accompanying person needs their own eligible entry route.`,
    travel: answers.movingWithSpouse || answers.movingWithChild
      ? "Each traveller's ICP entry permission gates your household travel; your own arrival can precede family sponsorship or a partner route."
      : company.policy.temporaryAccommodationDays > 0
        ? `${initialCapital(stay)} days of temporary accommodation start with arrival; book against your issued ICP entry permission and ${workDate}.`
        : `Your ${workDate} does not grant entry clearance; book against your issued ICP permission and confirm the accommodation policy.`,
    housing: answers.housingArrangement === "provided"
      ? "ADREC tenancy verification checks your provided address record; request registered evidence from your employer before household services."
      : !commuteKnown || employee.preferences.bedrooms <= 0
        ? `ADREC tenancy checks do not establish affordability; confirm the bedroom count, work location, commute limit and ${rentBudget} before judging a home.`
      : answers.housingArrangement === "no"
        ? `The ${commute} narrows ${homes}; set your rent budget from salary before committing to a lease.`
        : hasHousingCap
          ? `The ${commute} narrows ${homes} within your ${housingCap} cap; a cheaper listing outside that radius still fails your brief.`
          : `The ${commute} narrows ${homes}; get your housing cap in writing before judging any listing affordable.`,
    insurance: healthScope
      ? healthScope.length <= 32
        ? `The policy lists ${healthScope}; confirm cover for ${covered} against your ICP entry date.`
        : `ICP entry dates do not confirm effective cover for ${covered}; get your policy scope and start date from the employer.`
      : `ICP entry dates do not confirm effective cover for ${covered}; get your policy scope and start date from the employer.`,
    settling: `The '${answers.housingArrangement === "provided" ? "Obtain registered tenancy evidence" : "Sign and register home tenancy"}' task supplies your household address record; complete tenancy evidence before utility setup.`,
    school: answers.housingArrangement === "provided"
      ? `ADEK options near your employer-provided address need confirmed places and admission eligibility for ${childDescription}.`
      : `ADEK school options for ${childDescription} need confirmed placement and admission eligibility before you sign a home lease; research homes in parallel.`,
  };
}

export function rationaleByTaskId(context: RationaleContext): Record<string, string> {
  return context.viewerRole === "founder"
    ? founderRationaleByTaskId(context.answers)
    : employeeRationaleByTaskId(context.answers, context.company, context.employee);
}

export function rationaleForTask(task: ScopedTask, context: RationaleContext): string {
  if (task.rationale?.trim()) return task.rationale;
  const rationale = rationaleByTaskId(context)[task.id];
  if (!rationale) throw new Error(`Missing ${context.viewerRole} rationale for task ${task.id}`);
  if (rationale.length >= 220) throw new Error(`Rationale exceeds 219 characters for task ${task.id}`);
  return rationale;
}
