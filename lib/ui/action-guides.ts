import type { ScopedTask } from "./scope";

export type GuideLink = { label: string; url: string };
// lastChecked records a review of the linked source page, not case-specific verification.
export type GuideSource = { title: string; url: string; lastChecked: string };

export type ActionGuide = {
  action: GuideLink;
  discover: readonly GuideLink[];
  whatToPrepare: readonly string[];
  proofOfCompletion: string;
  source: GuideSource;
  caveat: string;
};

const lastChecked = "2026-10-02";
const source = (title: string, url: string): GuideSource => ({ title, url, lastChecked });

const addedSetup = source("ADDED: Establishing your business", "https://www.added.gov.ae/en/set-up/establish-your-business");
const addedLicensing = source("ADDED: Licensing requirements", "https://www.added.gov.ae/en/set-up/establish-your-business/licensing-requirements");
const addedServices = { label: "Open ADDED licensing services", url: "https://www.added.gov.ae/en/set-up/eservices" };
const addedDiscovery = [{ label: "ADDED business setup", url: addedSetup.url }, { label: "ADDED licence types", url: addedLicensing.url }];
const adafsaDesign = source("ADAFSA: Food service design and equipment", "https://www.adafsa.gov.ae/CMS/Guidelines/Guideline%20No%20%286%29%20of%202019%20Food%20Service%20Design.pdf");
const icpCard = source("ICP: Issuing an Establishment Card", "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e6d");
const icpResidence = source("ICP: Issuing Residency Permit", "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64");
const icpVisa = source("ICP: Issuance of a Visa", "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e60");
const icpServices = { label: "ICP Smart Services", url: "https://smartservices.icp.gov.ae/" };
const ftaCorporateTax = source("FTA: Corporate Tax Registration", "https://tax.gov.ae/en/services/corporate.tax.registration.aspx");
const bankRegister = source("CBUAE: Licensing and register", "https://centralbank.ae/en/licensing/");
const mohreServices = { label: "MOHRE employer services", url: "https://taqyeem.mohre.gov.ae/en/services.aspx" };
const mohreDirectory = source("MOHRE: Human resources service directory", "https://www.mohre.gov.ae/assets/download/20680003/human-resources-services-eng.aspx");
const employerGuide = source("MOHRE: New Employers' Awareness Guide", "https://www.mohre.gov.ae/assets/download/3221206e/Awareness%20Guide%20for%20New%20Employers%20Companies%20-%20EN_639011571513592816.pdf.aspx");
const employmentGuide = source("UAE Government: Job offers and the employment process", "https://u.ae/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/expatriates-employment-in-private-sector");
const dohTools = source("DoH Abu Dhabi: Lists and tools", "https://www.doh.gov.ae/en/resources/Lists%20and%20Tools");
const insuranceSearch = { label: "Search health insurance products", url: "https://www.tamm.abudhabi/en/services/tamm-doh/insuranceproductssearch" };
const insuranceProviders = { label: "Find authorized health insurers", url: "https://www.tamm.abudhabi/wb/doh/authorized-insurance-providers?lang=en" };
const adekSchools = source("ADEK: Private schools", "https://adek.gov.ae/en/Education-System/Private-Schools");
const schoolFinder = { label: "Find schools and fees", url: "https://www.tamm.abudhabi/wb/get-education/schools?lang=en" };
const adrecDirectory = source("ADREC: Real estate directory", "https://adrec.gov.ae/en/directory");
const dariServices = source("DARI: Individual tenancy services", "https://services.dari.ae/individual-services/");
const adrecVerify = { label: "Verify tenancy document", url: "https://adrec.gov.ae/en/verify-document" };
const addcMoving = source("ADDC: Your guide to moving in", "https://www.addc.ae/en-US/residential/Pages/About-Moving-in.aspx");
const telecomRegulator = { label: "TDRA telecom providers", url: "https://tdra.gov.ae/en/media/press-release/2026/digital-infrastructure-and-the-digital-economy" };
const housingDiscovery = [
  { label: "Property Finder rentals (example)", url: "https://www.propertyfinder.ae/en/rent/abu-dhabi/properties-for-rent.html" },
  { label: "Bayut rentals (example)", url: "https://www.bayut.com/to-rent/property/abu-dhabi/" },
  { label: "Check professionals with ADREC", url: adrecDirectory.url },
  { label: "DARI tenancy services", url: dariServices.url },
  adrecVerify,
];
const recruitmentDiscovery = [
  { label: "MOHRE agency licensing", url: mohreServices.url },
  { label: "Ask MOHRE to confirm agency authorization", url: "https://tasheel.mohre.gov.ae/en/contact-us.aspx" },
  { label: "NADIA Global (example)", url: "https://www.nadiaglobal.com/" },
  { label: "TASC Outsourcing (example)", url: "https://tascoutsourcing.com/en" },
  { label: "Transguard Group (example)", url: "https://transguardgroup.com/" },
];
const insurerDiscovery = [
  insuranceProviders,
  { label: "DoH insurance tools", url: dohTools.url },
  { label: "Daman (example)", url: "https://www.damanhealth.ae/" },
  { label: "ADNIC (example)", url: "https://www.adnic.ae/web/guest/medical-insurance" },
];

export const actionGuidesByTaskId: Readonly<Record<string, ActionGuide>> = {
  "activity-scope": {
    action: addedServices,
    discover: addedDiscovery,
    whatToPrepare: ["Products and services you will sell", "Whether food is roasted, prepared, or served on site"],
    proofOfCompletion: "The selected activity codes are recorded in your ADDED application.",
    source: addedSetup,
    caveat: "ADDED must confirm that the selected codes cover your actual activities.",
  },
  "legal-form": {
    action: addedServices,
    discover: addedDiscovery,
    whatToPrepare: ["Selected activities", "Proposed owners and ownership shares", "Where and to whom you will sell"],
    proofOfCompletion: "Your chosen legal form and licence route are recorded in the formation application.",
    source: addedSetup,
    caveat: "The available forms and documents depend on the activity and ownership structure.",
  },
  "trade-name": {
    action: addedServices,
    discover: addedDiscovery,
    whatToPrepare: ["Preferred names in order", "Selected activities and legal form"],
    proofOfCompletion: "You have the trade-name reservation reference or approval notice.",
    source: addedLicensing,
    caveat: "A reserved name does not authorize trading.",
  },
  "initial-approval": {
    action: addedServices,
    discover: addedDiscovery,
    whatToPrepare: ["Trade-name reservation", "Activity and legal-form choices", "Owner and signatory details"],
    proofOfCompletion: "You have the initial-approval notice or application decision.",
    source: addedSetup,
    caveat: "Initial approval is one step before the final economic licence.",
  },
  "premises-spec": {
    action: { label: "Review ADDED location guidance", url: addedSetup.url },
    discover: [{ label: "Find real estate professionals", url: adrecDirectory.url }],
    whatToPrepare: ["Space and equipment needs", "Customer access and intended use", "Food preparation or roasting layout, if applicable"],
    proofOfCompletion: "A written site specification is ready to check against candidate premises.",
    source: addedSetup,
    caveat: "The specification is a planning document; the authority must confirm site suitability.",
  },
  "site-review": {
    action: { label: "Review ADDED location guidance", url: addedSetup.url },
    discover: [{ label: "Find real estate professionals", url: adrecDirectory.url }, { label: "ADAFSA food-service design guidance", url: adafsaDesign.url }],
    whatToPrepare: ["Candidate address and floor plan", "Selected activity codes", "Equipment and fit-out requirements"],
    proofOfCompletion: "You have a recorded suitability check for the proposed activity and address before signing.",
    source: addedSetup,
    caveat: "A viewing or broker statement alone does not confirm authority approval.",
  },
  lease: {
    action: { label: "Open DARI tenancy services", url: dariServices.url },
    discover: [{ label: "Find real estate professionals", url: adrecDirectory.url }, adrecVerify],
    whatToPrepare: ["Agreed business address and lease terms", "Owner or authorized lessor details", "Entity details requested for registration"],
    proofOfCompletion: "You have the signed tenancy document and its registration evidence where required.",
    source: dariServices,
    caveat: "Confirm the tenancy evidence your chosen licence route accepts before committing to the site.",
  },
  "food-approvals": {
    action: addedServices,
    discover: [{ label: "ADAFSA food-service design guidance", url: adafsaDesign.url }, { label: "ADDED licence types", url: addedLicensing.url }],
    whatToPrepare: ["Food activities and products", "Candidate address and layout", "Equipment and food-handling workflow"],
    proofOfCompletion: "You have the authority's list of applicable food reviews and the resulting decisions or approvals.",
    source: adafsaDesign,
    caveat: "The required reviews depend on the activity and site; confirm them with ADDED and ADAFSA.",
  },
  licence: {
    action: addedServices,
    discover: addedDiscovery,
    whatToPrepare: ["Initial approval and reserved name", "Formation documents", "Tenancy and additional approvals if requested"],
    proofOfCompletion: "You have the issued economic licence with its licence number and activity details.",
    source: addedLicensing,
    caveat: "ADDED determines the final document set for the selected licence route.",
  },
  "establishment-card": {
    action: { label: "Apply for the ICP establishment card", url: icpCard.url },
    discover: [icpServices],
    whatToPrepare: ["Valid trade licence", "Authorized signatory identity", "MOA or authorization letter if requested"],
    proofOfCompletion: "The electronic establishment card is issued in ICP with the company details.",
    source: icpCard,
    caveat: "Free-zone companies may need to submit through their free-zone authority.",
  },
  "corporate-tax-review": {
    action: { label: "Review FTA corporate tax registration", url: ftaCorporateTax.url },
    discover: [{ label: "FTA tax services", url: "https://tax.gov.ae/en/services.aspx" }],
    whatToPrepare: ["Issued trade licence and legal-form details", "Ownership and authorized-signatory records", "Company formation and tax-period information"],
    proofOfCompletion: "You have a recorded applicability and deadline review, plus an FTA registration number if registration is required.",
    source: ftaCorporateTax,
    caveat: "Confirm your company's obligation and deadline with the FTA or a qualified tax adviser; the task does not assume VAT registration.",
  },
  "business-bank": {
    action: { label: "Compare licensed banks", url: bankRegister.url },
    discover: [
      { label: "FAB business accounts", url: "https://www.bankfab.com/en-ae/business-banking/accounts" },
      { label: "ADCB business accounts", url: "https://www.adcb.com/en/business/products-solutions/account-services/default.aspx" },
    ],
    whatToPrepare: ["Issued trade licence and formation documents", "Owners' and signatories' identity documents", "Business activity and expected transaction information"],
    proofOfCompletion: "The chosen bank has confirmed an active business account and IBAN.",
    source: bankRegister,
    caveat: "Bank links are examples, not endorsements. Each bank sets its own eligibility, checks, and charges.",
  },
  "personal-bank": {
    action: { label: "Check licensed banks", url: bankRegister.url },
    discover: [
      { label: "FAB personal accounts (example)", url: "https://www.bankfab.com/en-ae/personal/accounts" },
      { label: "ADCB personal accounts (example)", url: "https://www.adcb.com/en/personal/accounts/default.aspx" },
    ],
    whatToPrepare: ["Identity and residence documents requested by the bank", "Salary and employer details if applying for a salary account", "Questions on minimum balance, transfers and fees"],
    proofOfCompletion: "The bank has confirmed an active personal account and IBAN in your name.",
    source: bankRegister,
    caveat: "These are examples, not endorsements. Account eligibility, required documents and fees vary by bank and residence status.",
  },
  payroll: {
    action: { label: "Review MOHRE payroll guidance", url: employerGuide.url },
    discover: [{ label: "Find licensed payment institutions", url: bankRegister.url }],
    whatToPrepare: ["Signed pay terms", "Salary dates and funding forecast", "Bank or payment-provider arrangements"],
    proofOfCompletion: "You have a funded salary schedule and a confirmed payment route for the first hires.",
    source: employerGuide,
    caveat: "Confirm whether and how WPS applies to your employer and licence route.",
  },
  "founder-residence": {
    action: { label: "Review ICP residence permit service", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Passport and identity records", "Licensed company and establishment-card details", "Documents for the residence category confirmed by ICP"],
    proofOfCompletion: "You have the ICP application decision or issued residence permit for the selected route.",
    source: icpResidence,
    caveat: "Owning a company does not by itself establish eligibility for a particular residence category.",
  },
  "family-documents": {
    action: { label: "Review ICP family residence requirements", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Family passports and photographs", "Marriage or birth records relevant to each person", "Translations or attestations if ICP requests them"],
    proofOfCompletion: "Each family member's requested identity and relationship documents are collected and checked against the current ICP list.",
    source: icpResidence,
    caveat: "Gathering documents does not grant entry or residence clearance; confirm the exact list with ICP.",
  },
  "family-sponsorship": {
    action: { label: "Review ICP residence permit service", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Your residence details", "Family passports and photographs", "Relationship documents requested for each person"],
    proofOfCompletion: "Each family member has an ICP application decision or issued permit.",
    source: icpResidence,
    caveat: "Confirm sponsor eligibility and the current document list for each family member with ICP.",
  },
  "family-school": {
    action: schoolFinder,
    discover: [{ label: "ADEK private schools", url: adekSchools.url }],
    whatToPrepare: ["Child's age and prior school records", "Preferred curriculum and area", "Questions on admissions and fees"],
    proofOfCompletion: "You have written placement or enrolment confirmation from the school.",
    source: adekSchools,
    caveat: "School places, admission criteria, and fees must be confirmed directly with the school.",
  },
  "family-home": {
    action: { label: "Find real estate professionals", url: adrecDirectory.url },
    discover: housingDiscovery,
    whatToPrepare: ["Household size and budget", "Preferred commute to work and school", "Proposed lease terms"],
    proofOfCompletion: "You have a signed tenancy contract and its registration evidence.",
    source: dariServices,
    caveat: "Listing portals are examples, not endorsements. Confirm availability and terms directly, then verify the tenancy with ADREC/DARI.",
  },
  "family-insurance": {
    action: insuranceSearch,
    discover: insurerDiscovery,
    whatToPrepare: ["Names of everyone needing cover", "Required effective dates", "Coverage and network questions"],
    proofOfCompletion: "The insurer or sponsor has supplied a policy schedule showing covered people and effective dates.",
    source: dohTools,
    caveat: "Insurers are examples, not endorsements. Confirm authorization with DoH and eligibility, benefits, exclusions, and activation with the insurer.",
  },
  "family-travel": {
    action: { label: "Check ICP visa service", url: icpVisa.url },
    discover: [icpServices],
    whatToPrepare: ["Passports", "Permit decisions and validity dates", "Household arrival and accommodation plan"],
    proofOfCompletion: "You have a confirmed itinerary aligned with each traveller's issued entry or residence route.",
    source: icpVisa,
    caveat: "Confirm entry conditions with ICP and the carrier before buying travel.",
  },
  "home-utilities": {
    action: { label: "Start ADDC move-in", url: addcMoving.url },
    discover: [{ label: "ADDC connection guidance", url: "https://www.addc.ae/en-US/residential/pages/HowToConnect.aspx" }, telecomRegulator],
    whatToPrepare: ["Residential address and tenancy details", "Tenant identity details", "Desired connection date"],
    proofOfCompletion: "You have the active water and electricity account confirmation for the home.",
    source: addcMoving,
    caveat: "A Tawtheeq registration may initiate the utility account; confirm the status with ADDC.",
  },
  "first-hire-roles": {
    action: mohreServices,
    discover: [...recruitmentDiscovery, { label: "MOHRE employer guide", url: employerGuide.url }],
    whatToPrepare: ["Opening roster and work locations", "Role duties and skills", "Expected start dates"],
    proofOfCompletion: "You have an approved first-hire role list with duties and start dates.",
    source: employerGuide,
    caveat: "Agencies are examples, not endorsements. Confirm each agency's authorization with MOHRE and occupation eligibility with the applicable authority.",
  },
  "work-permit-quota": {
    action: mohreServices,
    discover: [{ label: "MOHRE service directory", url: mohreDirectory.url }, { label: "MOHRE application inquiry", url: "https://inquiry.mohre.gov.ae/" }],
    whatToPrepare: ["Company licence and employer file", "Requested role count and occupations", "Establishment-card details if requested"],
    proofOfCompletion: "You have the authority's work-permit capacity or quota decision for the planned roles.",
    source: mohreDirectory,
    caveat: "A free-zone employer may use a different authority or process; verify the route first.",
  },
  "offers-contracts": {
    action: mohreServices,
    discover: [...recruitmentDiscovery, { label: "UAE Government employment guide", url: employmentGuide.url }],
    whatToPrepare: ["Role, pay, and work terms", "Candidate identity details", "Employer signatory details"],
    proofOfCompletion: "Each candidate has a signed offer and the required submission or contract record.",
    source: employmentGuide,
    caveat: "Agencies are examples, not endorsements. Confirm current authorization with MOHRE and use the forms required by your employment authority.",
  },
  "employee-permits": {
    action: mohreServices,
    discover: [{ label: "MOHRE service directory", url: mohreDirectory.url }, { label: "MOHRE application inquiry", url: "https://inquiry.mohre.gov.ae/" }],
    whatToPrepare: ["Employer file and quota decision", "Signed offers", "Candidate passports and role documents"],
    proofOfCompletion: "You have the permit decision or issued work-permit record for each hire.",
    source: mohreDirectory,
    caveat: "The permit route and required evidence depend on the employer's authority and each candidate.",
  },
  "employee-arrivals": {
    action: { label: "Check ICP visa service", url: icpVisa.url },
    discover: [icpServices],
    whatToPrepare: ["Each hire's permit decision", "Passport and travel dates", "Opening roster and arrival contact"],
    proofOfCompletion: "Each hire has a confirmed arrival itinerary matched to the approved permit route.",
    source: icpVisa,
    caveat: "Confirm entry clearance and carrier requirements before booking.",
  },
  "employee-coverage": {
    action: insuranceSearch,
    discover: insurerDiscovery,
    whatToPrepare: ["Names of first hires", "Planned cover start dates", "Policy benefits and provider network questions"],
    proofOfCompletion: "You have insurer confirmation of cover and effective dates for each hire.",
    source: dohTools,
    caveat: "Insurers are examples, not endorsements. Confirm authorization with DoH and policy terms with HR and the insurer.",
  },
  visa: {
    action: { label: "Review ICP entry-permit service", url: icpVisa.url },
    discover: [icpServices, { label: "MOHRE application inquiry", url: "https://inquiry.mohre.gov.ae/" }],
    whatToPrepare: ["Passport and identity records", "Signed employer offer or contract", "Family documents if dependants are moving"],
    proofOfCompletion: "HR has shared the approved entry permit or authority decision for your case.",
    source: icpVisa,
    caveat: "Your employer and the relevant authority must confirm the current route and checklist.",
  },
  "family-records": {
    action: { label: "Review ICP family residence requirements", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Family passports and photographs", "Marriage or birth records relevant to each person", "Translations or attestations if ICP requests them"],
    proofOfCompletion: "The family records requested for each person's file are collected and checked with HR.",
    source: icpResidence,
    caveat: "Document preparation does not mean family entry or residence has been approved.",
  },
  "residency-completion": {
    action: { label: "Review ICP residence permit service", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Approved entry permit", "Passport and identity details", "Medical and Emirates ID steps confirmed by HR and ICP"],
    proofOfCompletion: "You have the ICP residence-permit decision and records for the remaining steps requested in your case.",
    source: icpResidence,
    caveat: "The entry permit alone does not complete residence; confirm the remaining steps with HR and ICP.",
  },
  "family-residence": {
    action: { label: "Review ICP family residence service", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Your confirmed residence details", "Each dependant's passport and relationship documents", "HR's current checklist"],
    proofOfCompletion: "HR has shared the authority decision or issued permit for each family member's file.",
    source: icpResidence,
    caveat: "Your own entry permit or residence decision does not decide a family member's separate application.",
  },
  travel: {
    action: { label: "Check ICP visa service", url: icpVisa.url },
    discover: [icpServices],
    whatToPrepare: ["Authority decision and passport", "Employer flight and temporary-stay policy", "Proposed travel dates"],
    proofOfCompletion: "You have a confirmed itinerary and temporary-stay booking within the agreed employer policy.",
    source: icpVisa,
    caveat: "Confirm entry clearance and the employer's booking policy before purchasing travel.",
  },
  housing: {
    action: { label: "Find real estate professionals", url: adrecDirectory.url },
    discover: housingDiscovery,
    whatToPrepare: ["Budget and required bedrooms", "Commute and area preferences", "Move-in date and tenancy questions"],
    proofOfCompletion: "You have a dated shortlist with current availability and terms confirmed by the lessor or broker.",
    source: adrecDirectory,
    caveat: "Listing portals are examples, not endorsements. Confirm availability and commute directly, and use ADREC/DARI to verify professionals and tenancy records.",
  },
  "housing-tenancy": {
    action: { label: "Open DARI tenancy services", url: dariServices.url },
    discover: [{ label: "Check professionals with ADREC", url: adrecDirectory.url }, adrecVerify],
    whatToPrepare: ["Chosen address and agreed lease terms", "Tenant and lessor identity details", "Employer-provided tenancy record if the home is supplied"],
    proofOfCompletion: "You have the signed and registered residential tenancy record for the address.",
    source: dariServices,
    caveat: "A shortlist or employer address alone is not registered tenancy evidence; confirm the registration route with DARI.",
  },
  insurance: {
    action: insuranceSearch,
    discover: insurerDiscovery,
    whatToPrepare: ["Employer policy name", "Names of moving family members", "Expected cover start dates"],
    proofOfCompletion: "HR or the insurer has confirmed who is covered and each effective date in writing.",
    source: dohTools,
    caveat: "Insurers are examples, not endorsements. Confirm authorization with DoH and dependant eligibility or activation with HR and the insurer.",
  },
  settling: {
    action: { label: "Start ADDC move-in", url: addcMoving.url },
    discover: [{ label: "ADDC connection guidance", url: "https://www.addc.ae/en-US/residential/pages/HowToConnect.aspx" }, telecomRegulator],
    whatToPrepare: ["Signed tenancy and address", "Tenant identity details", "Preferred utility and telecom activation dates"],
    proofOfCompletion: "You have an active utility account and a telecom installation or service confirmation.",
    source: addcMoving,
    caveat: "The tenancy route and service area can change the utility steps; ask the telecom provider for its own checklist.",
  },
  school: {
    action: schoolFinder,
    discover: [{ label: "ADEK private schools", url: adekSchools.url }],
    whatToPrepare: ["Child's age and prior school records", "Preferred curriculum and areas", "Employer allowance terms if applicable"],
    proofOfCompletion: "You have written admissions or placement confirmation from the chosen school.",
    source: adekSchools,
    caveat: "Confirm current places, admission criteria, and fees directly with each school.",
  },
};

export function getActionGuide(task: Pick<ScopedTask, "id">): ActionGuide | undefined {
  return actionGuidesByTaskId[task.id];
}
