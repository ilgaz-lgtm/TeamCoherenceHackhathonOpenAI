import { getActionGuide } from "./action-guides";
import type { ScopedTask } from "./scope";

type TimingText = {
  label: string;
  note: string;
  // This links the workflow guidance, not an official validation of the estimate.
  sourceUrl?: string;
};

export type TaskTiming = Readonly<TimingText & (
  | { basis: "indicative"; days: number; unit: "working-days" }
  | { basis: "published"; days: number; unit?: "working-days" | "calendar-days" }
  | { basis: "variable"; days?: never; unit?: never }
)>;

export type TimingTask = Pick<ScopedTask, "id"> & Partial<Pick<ScopedTask, "title" | "category">>;

export type PublishedTaskTiming = Extract<TaskTiming, { basis: "published" }>;

// Read-only approved reference: /Users/beyzanurates/Desktop/WUSOOL-DESIGN-REFERENCE.html.
// Preserve its exact d values as working-day planning allowances. Do not derive
// ranges, convert ICP's unspecified "2 Days", or use these as remaining time.
function indicative(days: number, note: string, scope?: string): TaskTiming {
  return {
    label: `${days} working days (indicative)${scope ? ` - ${scope}` : ""}`,
    days,
    unit: "working-days",
    basis: "indicative",
    note: `Approved prototype planning estimate; TODO(verify) for your case. ${note}`,
  };
}

function variable(label: string, note: string): TaskTiming {
  return { label, basis: "variable", note };
}

const entryPermission = indicative(8,
  "Reference B01: entry-permit planning after the sponsor and eligible route are confirmed. Document collection, route resolution and any separate work-permit approval can extend this. ICP lists 2 days for visa issuance once the applicable file requirements are met; it does not specify working or calendar days. That service time is separate from this planning allowance and from arrival or final residence.",
  "entry permission after route confirmation",
);
const healthCover = indicative(4,
  "Reference B08: arranging health cover. The insurer and responsible cover owner must confirm eligibility, named members and effective dates; underwriting and missing records can extend this. An estimate does not confirm active cover, and a household or staff cohort can have different activation dates.",
);
const schoolPlacement = indicative(90,
  "Reference B07: school-placement planning allowance, not an admissions deadline or guaranteed maximum. Places, age and record eligibility, assessments, intake dates and school decisions determine the actual schedule. Ask each school for its offer and outstanding enrolment requirements; do not assume an August cutoff.",
  "subject to school places and intake dates",
);
const travelPreparation = indicative(5,
  "Reference B09: arranging itineraries and arrival logistics after each traveller's entry permission is confirmed. Flight availability, household dates, accommodation and shipping quotes can extend this. This covers booking coordination, not time until physical arrival or freight delivery; do not add it again to the separate arrival-record task.",
  "travel preparation",
);
const homeLease = indicative(30,
  "Reference B06: one residential housing-workflow allowance covering search, agreement and tenancy registration. The separate shortlist has no additional numeric allowance; do not count this twice. Available homes, viewing dates, landlord terms, school fit and the address's registration route determine the schedule. Ask the landlord or broker for case-specific dates; this is not a tenancy-registration SLA.",
  "housing workflow including the shortlist",
);
const familyRecords: TaskTiming = {
  ...variable("MoFA only: 1–15 business days",
    "MoFA lists 1–3 business days for attestation through a provider inside the UAE, and up to 15 business days through a provider outside the UAE. These are attestation-service times, not the entire records step. Original collection, translation and prior certifications take additional time. Confirm which records ICP accepts and the route assigned by MoFA before applying.",
  ),
  sourceUrl: "https://www.mofa.gov.ae/en/services/attestation",
};
const physicalArrival = variable("Depends on your confirmed arrival date",
  "Use issued entry clearance and carrier confirmation to choose your flight and record actual entry. Ask your carrier and household for the arrival date. The reference's 5-day logistics allowance belongs to the travel-preparation task; it does not measure waiting until your flight or guarantee entry.",
);
const residenceCompletion = variable("Depends on appointments and the residence file",
  "Ask ICP and the responsible sponsor or case owner for the medical, biometrics and remaining file schedule after actual arrival. ICP lists 2 days for final residence-permit issuance once the applicable file requirements are met, without specifying working or calendar days. That service time excludes document preparation, medical and appointment waits, corrections and Emirates ID delivery; it is not a duration for this bundled task. Confirm the category; MOHRE categories use the Work Bundle.",
);
const partnerRoute = variable("Depends on ICP route and eligibility confirmation",
  "Ask ICP to resolve the applicable partner route and entry requirements, then obtain a case-specific estimate from the responsible sponsor or authority. Spouse sponsorship cannot be assumed for an unmarried partner. The prototype's family-sponsorship allowance does not time an unresolved independent route.",
);

const timingsByTaskId: Readonly<Record<string, TaskTiming>> = {
  "activity-scope": variable("Depends on activity-code confirmation",
    "Ask ADDED or your formation adviser how long checking your actual products and services will take. Reference A01 covers choosing the jurisdiction, not a separate activity-code review; its 3-day allowance is assigned only to legal-form.",
  ),
  "legal-form": indicative(3,
    "Reference A01: choosing the jurisdiction and licence route. Confirm that your activity, customers and ownership fit the selected route; this is a planning decision, not an authority approval SLA.",
  ),
  "trade-name": indicative(3,
    "Reference A02: trade-name reservation planning. The licensing authority must accept the name; a rejected name or missing details can extend this. This is not a published TAMM processing commitment.",
  ),
  "initial-approval": indicative(6,
    "Reference A03: initial-approval planning after the activity, form and name are ready. Confirm the authority's file checklist and decision time; additional reviews and corrections are separate.",
  ),
  "premises-spec": variable("Depends on your premises specification",
    "Ask your formation adviser or premises designer for a specification date based on your equipment, capacity and intended activity. Reference A04 does not separately time this design task.",
  ),
  "site-review": variable("Depends on site checks and reviewer availability",
    "Ask the licensing adviser and relevant site reviewers for a suitability-check date before committing to the premises. Viewings, layout changes and applicable food reviews need case-specific estimates; the lease allowance is not a site-approval SLA.",
  ),
  lease: indicative(14,
    "Reference A04: securing business premises and accepted tenancy evidence. Landlord negotiation, document readiness and the address's registration route determine the actual dates. Site selection and suitability checks are separate; confirm the accepted evidence before signing.",
  ),
  "food-approvals": variable("Depends on the applicable food reviews",
    "Ask ADDED and ADAFSA which reviews your activity and site need, and ask the designer or reviewer for dates. This task maps those reviews; reference A05's 14-day food-establishment approval allowance does not separately time mapping them or include fit-out changes and repeat inspections.",
  ),
  licence: indicative(10,
    "Reference A06: licence-issuance planning after the required formation records, tenancy evidence and applicable approvals are ready. Confirm the selected authority's checklist and decision time; this does not time the whole company setup.",
  ),
  "establishment-card": indicative(7,
    "Reference A07: establishment-card planning after a valid company licence. ICP lists 2 days for card issuance once the applicable file requirements are met, without specifying working or calendar days. Preparation, corrections and category-specific submission arrangements are separate; confirm the authorized channel with ICP. The 7-day allowance is a prototype estimate, not the published service duration or a renewal SLA.",
  ),
  "corporate-tax-review": variable("Depends on the tax review and any FTA filing",
    "Ask your tax adviser for the applicability-review date and the FTA for any required registration estimate after the file is ready. The prototype has no tax-task duration; a registration deadline is not a processing duration.",
  ),
  "business-bank": indicative(25,
    "Reference A08: business-account opening planning after company documents are ready. The bank's eligibility, ownership checks, requested evidence and account decision determine the actual schedule. Ask the selected bank for its estimate; account approval is not guaranteed.",
  ),
  "personal-bank": variable("Depends on the bank's checks and account route",
    "Ask the selected bank for an estimate after confirming resident or non-resident eligibility and the required identity and income records. Reference A08 is for a corporate account and does not time a personal account.",
  ),
  payroll: variable("Depends on salary dates and the payment provider",
    "Confirm the first pay date, funding availability and applicable payment setup with your payroll or payment provider. The prototype has no payroll-setup duration; the bank-account allowance does not time funding or WPS setup.",
  ),
  "founder-residence": entryPermission,
  "founder-entry": physicalArrival,
  "employee-entry": physicalArrival,
  "family-documents": familyRecords,
  "family-records": familyRecords,
  "family-sponsorship": entryPermission,
  "family-entry": entryPermission,
  "partner-route": partnerRoute,
  "residency-completion": residenceCompletion,
  "family-residence": residenceCompletion,
  "partner-residence": residenceCompletion,
  "family-school": schoolPlacement,
  school: schoolPlacement,
  "family-home-shortlist": variable("Depends on homes and viewing availability",
    "Ask brokers or lessors for current availability and viewing dates around your work and school options. Reference B06's 30-day housing allowance is assigned once to family-home and includes this shortlist; this is not another 30-day step.",
  ),
  "family-home": homeLease,
  "housing-tenancy": homeLease,
  housing: variable("Depends on homes and viewing availability",
    "Ask brokers or lessors for current availability, viewing dates and written terms. Reference B06's 30-day housing allowance is assigned once to housing-tenancy and includes this shortlist; this is not another 30-day step.",
  ),
  "family-insurance": healthCover,
  insurance: healthCover,
  "employee-coverage": healthCover,
  "family-travel": travelPreparation,
  travel: travelPreparation,
  "employee-arrivals": travelPreparation,
  "home-utilities": variable("Depends on the address and utility provider",
    "Ask the utility provider for account and connection dates after checking the tenancy route and address. Reference B10 combines utilities, mobile and driving-related settling tasks; it does not publish a separate utility-activation duration.",
  ),
  settling: indicative(10,
    "Reference B10: household settling planning, including utilities and telecom. Confirm the accepted tenancy route, identity records and each provider's appointment or activation dates. This is a shared planning allowance, not a utility or installation guarantee; the approved reference also includes driving-related setup that may not apply to you.",
  ),
  "first-hire-roles": variable("Depends on your hiring decisions",
    "Set a role-definition date with your hiring lead or recruitment provider based on the opening roster. The prototype has no recruiting or role-definition duration.",
  ),
  "work-permit-quota": variable("Depends on the employment authority's capacity review",
    "Ask MOHRE or the applicable free-zone employment authority for the capacity-review estimate for your employer file and occupations. ICP's card-issuance time does not time a work-permit quota decision.",
  ),
  "offers-contracts": variable("Depends on candidates and contract preparation",
    "Ask your hiring lead or recruitment provider for preparation and candidate-signing dates using the applicable authority's forms. The prototype has no offer or contract duration.",
  ),
  "employee-permits": variable("Depends on the work-permit route and authority",
    "Ask MOHRE or the applicable employment authority for a case-specific estimate after the employer file, capacity and candidate documents are ready. Reference B01 and ICP's visa-issuance service concern entry permission, not these work-permit applications or the entire staff move.",
  ),
  visa: entryPermission,
  "employer-premises": variable("Depends on the employer's premises route",
    "Ask HR for the accepted site and tenancy-evidence dates. A business lease estimate alone does not time all premises selection and approval checks.",
  ),
  "employer-licence": variable("Depends on the employer's licensing progress",
    "Ask HR for the licence decision date and outstanding approvals. The prototype licence-issuance allowance is not the time remaining on an employer setup whose stage is unknown.",
  ),
  "employer-card": variable("Depends on the employer's card readiness",
    "Ask HR to confirm the active ICP card or the applicable issuance or renewal estimate. ICP's 2-day issuance service is separate from employer document collection, licensing and renewal checks.",
  ),
  "employer-banking": variable("Depends on the employer's bank and payment setup",
    "Ask HR for the operating-account and payment-route dates. The prototype corporate-account allowance does not indicate progress or remaining time in the employer's existing file.",
  ),
};

// Reviewed on 2026-10-02: each ICP service card says "2 Days", with no day unit.
const verifiedIssuanceSources = new Set([
  "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e6d",
  "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e60",
  "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64",
]);

/** Display this issuance-only service time separately from task/path estimates. */
export function getPublishedTaskTiming(task: TimingTask): PublishedTaskTiming | undefined {
  if (!Object.prototype.hasOwnProperty.call(timingsByTaskId, task.id)) return undefined;
  if (task.id === "establishment-card" && task.title === "Verify establishment card") return undefined;
  const published = getActionGuide(task)?.publishedServiceTime;
  if (!published || !verifiedIssuanceSources.has(published.sourceUrl)) return undefined;
  return {
    label: "ICP lists 2 days (issuance only)",
    days: 2,
    basis: "published",
    note: `${published.conditions} This concerns issuance after the applicable file requirements are met. ICP does not specify working or calendar days; the unit is unconfirmed. Do not use this as the whole task duration or a working-day offset.`,
    sourceUrl: published.sourceUrl,
  };
}

function unmatchedTiming(task: TimingTask): TaskTiming {
  const contacts: Partial<Record<ScopedTask["category"], string>> = {
    visa: "your sponsor and the relevant immigration or employment authority",
    licensing: "the licensing authority or your formation adviser",
    premises: "the landlord, site reviewer or formation adviser",
    housing: "the landlord, broker or employer housing team",
    insurance: "the insurer or responsible cover owner",
    school: "the school's admissions team",
    travel: "the carrier or travel provider",
    settling: "the utility or telecom provider",
    banking: "the selected bank or payment provider",
    workforce: "your hiring lead, recruitment provider or applicable employment authority",
    tax: "your tax adviser or the FTA",
  };
  const contact = task.category ? contacts[task.category] : undefined;
  return variable("Provider estimate needed",
    `Ask ${contact ?? "the responsible provider or task owner"} for a start date and completion estimate once the required documents, appointments and preceding steps are ready. No approved duration matches this task; TODO(verify).`,
  );
}

/** Numeric days are scoped planning allowances, never elapsed/remaining time.
 * Variable tasks have no numeric offset; a path through one has an unknown wait.
 * Published issuance times stay in notes when the task includes other stages.
 */
export function getTaskTiming(task: TimingTask): TaskTiming {
  if (!Object.prototype.hasOwnProperty.call(timingsByTaskId, task.id)) return unmatchedTiming(task);

  let timing = timingsByTaskId[task.id];
  if (task.id === "housing" && task.title === "Confirm employer housing") {
    timing = indicative(7,
      "Reference B06 (employer-provided housing): confirming the address and move-in date with HR. This does not time finding a private lease, obtaining missing tenancy evidence or waiting until the scheduled move-in date. Ask HR to confirm those dates.",
      "employer housing confirmation",
    );
  } else if (task.id === "housing-tenancy" && task.title === "Obtain registered tenancy evidence") {
    timing = variable("Depends on HR's registered tenancy records",
      "Ask HR or the property's responsible registration provider when the accepted tenancy evidence will be available for the provided address. Reference B06's 7-day confirmation allowance belongs to housing; its 30-day private-home search allowance does not apply to this records request.",
    );
  } else if (task.id === "establishment-card" && task.title === "Verify establishment card") {
    timing = variable("Depends on card validity and any renewal",
      "Check the existing card with ICP and ask the responsible provider for any correction or renewal estimate. Reference A07's 7-day allowance and ICP's published 2 days concern issuance; they do not time this validity check or any renewal.",
    );
  }

  const guideIds: Readonly<Record<string, string>> = {
    "employer-premises": "site-review",
    "employer-licence": "licence",
    "employer-card": "establishment-card",
    "employer-banking": "business-bank",
  };
  const guide = getActionGuide({ id: guideIds[task.id] ?? task.id });
  const sourceUrl = timing.sourceUrl ?? guide?.publishedServiceTime?.sourceUrl ?? guide?.source.url;
  return sourceUrl ? { ...timing, sourceUrl } : { ...timing };
}

export function stepTimingLabel(task: TimingTask): string {
  const timing = getTaskTiming(task);
  if (timing.basis === "indicative") return `~${timing.days} working days`;
  if (timing.basis === "published") return timing.label;
  if (["family-records", "family-documents"].includes(task.id)) return timing.label;
  if (["residency-completion", "family-residence", "partner-residence"].includes(task.id)) return "Issuance: 2 days + appointments";
  if (["founder-entry", "employee-entry"].includes(task.id)) return "Your flight date";
  if (["family-home-shortlist", "housing"].includes(task.id)) return "Within the 30-working-day home search";
  if (task.id === "partner-route") return "ICP route confirmation";
  if (task.id === "home-utilities") return "Provider connection date";
  return "Confirm with the provider";
}
