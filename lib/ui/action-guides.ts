import type { ScopedTask } from "./scope";

export type GuideLink = { label: string; url: string };
// lastChecked records a review of the linked source page, not case-specific verification.
export type GuideSource = { title: string; url: string; lastChecked: string };
export type PublishedServiceTime = { label: string; sourceUrl: string; conditions: string };

export type ActionGuide = {
  action: GuideLink;
  discover: readonly GuideLink[];
  whatToPrepare: readonly string[];
  proofOfCompletion: string;
  source: GuideSource;
  caveat: string;
  publishedServiceTime?: PublishedServiceTime;
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
const icpCardTime: PublishedServiceTime = {
  label: "ICP lists 2 days",
  sourceUrl: icpCard.url,
  conditions: "Service-card duration only; document collection, licence issuance, corrections and appointment waits are separate. Confirm the applicable category with ICP.",
};
const icpVisaTime: PublishedServiceTime = {
  label: "ICP lists 2 days",
  sourceUrl: icpVisa.url,
  conditions: "Visa-issuance service-card duration only, not the full move or work-permit process. Category eligibility, document collection, required MOHRE approval and corrections are separate; confirm the applicable category with ICP.",
};
const icpResidenceTime: PublishedServiceTime = {
  label: "ICP lists 2 days",
  sourceUrl: icpResidence.url,
  conditions: "Residence-permit service-card duration only, not arrival, medical or appointment waits, document collection, corrections or Emirates ID delivery. Confirm the applicable category; MOHRE categories use the Work Bundle.",
};
const icpServices = { label: "ICP Smart Services", url: "https://smartservices.icp.gov.ae/" };
const ftaCorporateTax = source("FTA: Corporate Tax Registration", "https://tax.gov.ae/en/services/corporate.tax.registration.aspx");
const bankRegister = source("CBUAE: Licensing and register", "https://centralbank.ae/en/licensing/");
const mohreDirectory = source("MOHRE: Services directory", "https://www.mohre.gov.ae/en/services/services-directory");
const mohreServices = { label: "Review MOHRE employer services", url: mohreDirectory.url };
const employerGuide = source("MOHRE: New Employers' Awareness Guide", "https://www.mohre.gov.ae/assets/download/3221206e/Awareness%20Guide%20for%20New%20Employers%20Companies%20-%20EN_639011571513592816.pdf.aspx");
const employmentGuide = source("UAE Government: Job offers and the employment process", "https://u.ae/information-and-services/jobs/employment-in-the-private-sector/job-offers-and-work-permits-and-contracts/expatriates-employment-in-private-sector");
const familyResidence = source("UAE Government: Residence visa for family members", "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-family-members");
const dohTools = source("DoH Abu Dhabi: Lists and tools", "https://www.doh.gov.ae/en/resources/Lists%20and%20Tools");
const insuranceSearch = { label: "Search health insurance products", url: "https://www.tamm.abudhabi/en/services/tamm-doh/insuranceproductssearch" };
const insuranceProviders = { label: "Find authorized health insurers", url: "https://www.tamm.abudhabi/wb/doh/authorized-insurance-providers?lang=en" };
const adekSchools = source("ADEK: Private schools", "https://adek.gov.ae/en/Education-System/Private-Schools");
const adekAdmissions = source("ADEK: Student Administrative Affairs Policy (September 2025)", "https://www.adek.gov.ae/-/media/Project/TAMM/ADEK/Policies/School-Policies/Teaching-and-Learning/ADEK_S_Student-Administrative-Affairs-Policy_EN_1_2.pdf");
const schoolFinder = { label: "Find schools and fees", url: "https://www.tamm.abudhabi/wb/get-education/schools?lang=en" };
const adrecDirectory = source("ADREC: Real estate directory", "https://adrec.gov.ae/en/directory");
const dariServices = source("DARI: Individual tenancy services", "https://services.dari.ae/individual-services/");
const adrecVerify = { label: "Verify tenancy document", url: "https://adrec.gov.ae/en/verify-document" };
const addcMoving = source("ADDC: Your guide to moving in", "https://www.addc.ae/en-US/residential/Pages/About-Moving-in.aspx");
const telecomRegulator = { label: "TDRA licensed telecom providers", url: "https://tdra.gov.ae/en/About/tdra-sectors/telecommunication/departments/regulatory-affairs-department/licensing" };
const housingDiscovery = [
  { label: "Property Finder rentals (example)", url: "https://www.propertyfinder.ae/en/rent/abu-dhabi/properties-for-rent.html" },
  { label: "Bayut rentals (example)", url: "https://www.bayut.com/to-rent/property/abu-dhabi/" },
  { label: "Check professionals with ADREC", url: adrecDirectory.url },
  { label: "DARI tenancy services", url: dariServices.url },
  adrecVerify,
];
const recruitmentDiscovery = [
  { label: "MOHRE agency licensing", url: mohreServices.url },
  { label: "Ask MOHRE to confirm agency authorization", url: "https://www.mohre.gov.ae/en/contact-us" },
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
    caveat: "Check activities, premises and customer access with ADDED and the proposed free zone; dual licensing may be an option. Available forms depend on your activity and ownership.",
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
    action: { label: "Check ICP card submission route", url: icpCard.url },
    discover: [icpServices],
    whatToPrepare: ["Valid trade licence", "Authorized signatory Emirates ID or Unified Number, as applicable", "MOA or authorization letter if requested"],
    proofOfCompletion: "An active electronic establishment card is confirmed in ICP with matching company details and validity; keep the existing card if it is already valid.",
    source: icpCard,
    publishedServiceTime: icpCardTime,
    caveat: "The ICP immigration card is separate from the economic licence and MOHRE employer file; it does not grant an employee permit. ICP lists authorized-service-provider submission for initial approval and card issuance in its category terms, and free-zone requests through the respective free-zone authority. Confirm your category and authorized channel with ICP; a commercial PRO listing is not proof of authorization.",
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
      { label: "FAB business accounts (example)", url: "https://www.bankfab.com/en-ae/business-banking/accounts" },
      { label: "ADCB business account checklist (example)", url: "https://www.adcb.com/en/get-in-touch/faqs/accounts/business-choice-account-faq" },
    ],
    whatToPrepare: ["Issued trade licence and formation documents", "Owners' and signatories' identity documents", "Business activity and expected transaction information"],
    proofOfCompletion: "The chosen bank has confirmed an active business account and IBAN.",
    source: bankRegister,
    caveat: "Bank links are examples, not endorsements. A licence or ICP card does not guarantee an account; ask each bank for its eligibility, ownership checks, transaction restrictions and charges.",
  },
  "personal-bank": {
    action: { label: "Check licensed banks", url: bankRegister.url },
    discover: [
      { label: "FAB savings account eligibility (example)", url: "https://www.bankfab.com/en-ae/personal/accounts/savings-accounts/personal-savings-account" },
      { label: "ADCB personal accounts (example)", url: "https://www.adcb.com/en/personal/accounts/default.aspx" },
    ],
    whatToPrepare: ["Identity and residence documents requested by the bank", "Salary and employer details if applying for a salary account", "Questions on minimum balance, transfers and fees"],
    proofOfCompletion: "The bank has confirmed an active personal account and IBAN in your name.",
    source: bankRegister,
    caveat: "These are examples, not endorsements. Ask about resident or non-resident eligibility, identity checks and fees for the specific account; neither approval nor a cheque book is guaranteed.",
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
    action: { label: "Review ICP founder entry route", url: icpVisa.url },
    discover: [icpServices, { label: "Review residence categories", url: icpResidence.url }],
    whatToPrepare: ["Passport and identity records", "Licensed company and establishment-card details", "Documents for the residence category confirmed by ICP"],
    proofOfCompletion: "ICP has confirmed the applicable founder route and issued the required entry permission, with its category and validity checked before travel.",
    source: icpVisa,
    publishedServiceTime: icpVisaTime,
    caveat: "Owning a company does not by itself establish visa eligibility. Entry clearance is not final residence; complete the remaining steps after your own arrival.",
  },
  "founder-entry": {
    action: { label: "Check ICP entry requirements", url: icpVisa.url },
    discover: [icpServices],
    whatToPrepare: ["Passport and issued entry permission or confirmed eligibility", "Permitted arrival dates and carrier requirements", "Arrival contact and temporary accommodation"],
    proofOfCompletion: "You have entered the UAE within your permitted dates and retained the entry record needed for your residence file.",
    source: icpVisa,
    caveat: "A booking or submitted application does not record your arrival. Confirm permission with ICP before travelling; your entry does not clear family travel or complete residence.",
  },
  "family-documents": {
    action: { label: "Review ICP family residence requirements", url: icpResidence.url },
    discover: [icpServices, { label: "Check family sponsorship categories", url: familyResidence.url }],
    whatToPrepare: ["Family passports and photographs", "Marriage or birth records relevant to each person", "Translations or attestations if ICP requests them"],
    proofOfCompletion: "Each family member's requested identity and relationship documents are collected and checked against the current ICP list.",
    source: icpResidence,
    caveat: "An unmarried partner is not automatically eligible as a spouse. Ask ICP about a separate visa route for your partner and confirm each person's document list.",
  },
  "partner-route": {
    action: { label: "Check partner entry and residence categories", url: icpResidence.url },
    discover: [icpServices, { label: "Check family sponsorship categories", url: familyResidence.url }, mohreServices],
    whatToPrepare: ["Partner's passport and identity records", "Relationship evidence if applying as a spouse", "Employment or independent-route details and questions for ICP"],
    proofOfCompletion: "Your partner's eligible route and responsible sponsor or authority are recorded, and their issued entry permission or case-specific eligibility has been confirmed before travel.",
    source: familyResidence,
    caveat: "Route planning can start before permits, but travel needs confirmed entry clearance. An unmarried partner is not automatically eligible as a spouse; their route still needs its own approval.",
  },
  "family-sponsorship": {
    action: { label: "Review ICP residence permit service", url: icpResidence.url },
    discover: [icpServices, { label: "Check family sponsorship categories", url: familyResidence.url }],
    whatToPrepare: ["Your residence details", "Family passports and photographs", "Relationship documents requested for each person"],
    proofOfCompletion: "Each eligible family member has issued entry permission or a case-specific eligibility confirmation, with the category and validity checked before travel.",
    source: icpResidence,
    publishedServiceTime: icpVisaTime,
    caveat: "Confirm sponsor eligibility with ICP; entry clearance is separate from residence completion after arrival. Spouse sponsorship does not automatically cover an unmarried partner; arrange a separate eligible route before booking their move.",
  },
  "family-school": {
    action: schoolFinder,
    discover: [{ label: "ADEK private schools", url: adekSchools.url }],
    whatToPrepare: ["Child's age, passport and prior school records", "Transfer certificate and attestation requirements for the country of transfer", "Questions on places, fees, transport and admission deadlines"],
    proofOfCompletion: "You have the school's written offer, acceptance deadline and outstanding registration requirements.",
    source: adekAdmissions,
    caveat: "Start admissions enquiries before committing to a lease. An offer is not completed enrolment; ask the school about residency evidence and any applicable Emirates ID exception.",
  },
  "family-home": {
    action: { label: "Find real estate professionals", url: adrecDirectory.url },
    discover: housingDiscovery,
    whatToPrepare: ["Household size and budget", "School offer and commute options", "Written rent payment schedule, deposit terms and lessor authorization"],
    proofOfCompletion: "You have a signed tenancy contract and its registration evidence.",
    source: dariServices,
    caveat: "Listing portals are examples, not endorsements. Verify the broker's registration and lessor's authority before paying; obtain receipts and check the applicable tenancy registration route.",
  },
  "family-home-shortlist": {
    action: { label: "Check real estate professionals with ADREC", url: adrecDirectory.url },
    discover: housingDiscovery,
    whatToPrepare: ["Household size and cash budget", "Workplace and school enquiry locations", "Area preferences and questions on availability, rent instalments and deposits"],
    proofOfCompletion: "You have a dated home shortlist with lessor or broker contact details, proposed payment terms and work or school commute checks.",
    source: adrecDirectory,
    caveat: "Research can start before a school offer or permit. A shortlist is not a lease; verify the broker, lessor authority and school fit before paying or signing. Portals are examples, not endorsements.",
  },
  "family-insurance": {
    action: insuranceSearch,
    discover: insurerDiscovery,
    whatToPrepare: ["Names of everyone needing cover", "Required effective dates", "Policy benefits, hospital network, exclusions and copayment questions"],
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
    caveat: "Tawtheeq may initiate the utility account. ADDC lists a separate move-in application for properties outside Tawtheeq or ADGM; confirm the route and account status for your address.",
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
    caveat: "An ICP card does not establish MOHRE work-permit capacity. Confirm the employer file and role capacity with MOHRE, or the applicable free-zone employment authority.",
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
    proofOfCompletion: "You have the approved, issued work-permit record for each hire under the applicable employment authority.",
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
    caveat: "Insurers are examples, not endorsements. Confirm authorization with DoH and each hire's policy terms with the insurer.",
  },
  visa: {
    action: { label: "Review ICP entry-permit service", url: icpVisa.url },
    discover: [icpServices, { label: "MOHRE application inquiry", url: "https://inquiry.mohre.gov.ae/" }],
    whatToPrepare: ["Passport and identity records", "Signed employer offer or contract", "Family documents if dependants are moving"],
    proofOfCompletion: "HR has shared your issued entry permit or case-specific entry eligibility confirmation, with its category and validity checked.",
    source: icpVisa,
    publishedServiceTime: icpVisaTime,
    caveat: "A signed offer, target arrival date or submitted application is not entry clearance. Ask HR and ICP to confirm the issued permit's category and validity before booking.",
  },
  "employee-entry": {
    action: { label: "Check ICP entry requirements", url: icpVisa.url },
    discover: [icpServices],
    whatToPrepare: ["Passport and issued entry permission or confirmed eligibility", "HR-confirmed permitted arrival dates", "Carrier requirements, arrival contact and temporary accommodation"],
    proofOfCompletion: "You have entered the UAE within your permitted dates and retained the entry record needed for your residence file.",
    source: icpVisa,
    caveat: "A planned date or submitted application is not clearance. Confirm permission with HR and ICP before travelling; entry does not complete residence or authorize work by itself.",
  },
  "family-entry": {
    action: { label: "Review ICP family entry-permit service", url: icpVisa.url },
    discover: [icpServices, { label: "Check family sponsorship categories", url: familyResidence.url }],
    whatToPrepare: ["Primary sponsor's residence and eligibility evidence", "Each eligible spouse or child's passport and relationship records", "Insurance and supporting documents requested by ICP"],
    proofOfCompletion: "Each travelling family member has issued entry permission or a case-specific eligibility confirmation, with the category and validity checked before travel.",
    source: icpVisa,
    publishedServiceTime: icpVisaTime,
    caveat: "Your residence does not approve family entry. Confirm each person's separate permission before booking; an unmarried partner needs an eligible independent route unless ICP confirms otherwise.",
  },
  "family-records": {
    action: { label: "Review ICP family residence requirements", url: icpResidence.url },
    discover: [icpServices, { label: "Check family sponsorship categories", url: familyResidence.url }],
    whatToPrepare: ["Family passports and photographs", "Marriage or birth records relevant to each person", "Translations or attestations if ICP requests them"],
    proofOfCompletion: "The family records requested for each person's file are collected and checked against ICP's requested checklist.",
    source: icpResidence,
    caveat: "An unmarried partner needs their own eligible visa route; spouse sponsorship is not automatic. Document preparation does not approve entry or residence.",
  },
  "residency-completion": {
    action: { label: "Review ICP residence permit service", url: icpResidence.url },
    discover: [icpServices],
    whatToPrepare: ["Entry permission and actual UAE entry record", "Passport and identity details", "Medical and Emirates ID steps confirmed by ICP and your employer, if applicable"],
    proofOfCompletion: "You have the issued ICP residence permit and the identity records requested in your case.",
    source: icpResidence,
    publishedServiceTime: icpResidenceTime,
    caveat: "The entry permit alone does not complete residence; confirm the remaining steps with ICP and your employer, if applicable.",
  },
  "partner-residence": {
    action: { label: "Review ICP residence permit service", url: icpResidence.url },
    discover: [icpServices, mohreServices],
    whatToPrepare: ["Partner's confirmed route and issued entry permission", "Actual UAE entry record, passport and identity documents", "Medical, insurance and Emirates ID steps requested for their route"],
    proofOfCompletion: "Your partner has an issued residence permit and the identity records requested for their own confirmed route after arrival.",
    source: icpResidence,
    publishedServiceTime: icpResidenceTime,
    caveat: "An unmarried partner is not automatically eligible as a spouse dependant. Entry clearance alone does not complete their independent or otherwise confirmed residence route.",
  },
  "family-residence": {
    action: { label: "Review ICP family residence service", url: icpResidence.url },
    discover: [icpServices, { label: "Check family sponsorship categories", url: familyResidence.url }],
    whatToPrepare: ["Primary sponsor's valid residence details", "Each eligible dependant's entry permission, UAE entry record, passport and relationship documents", "Medical, insurance and Emirates ID steps confirmed by ICP and the employer, if applicable"],
    proofOfCompletion: "Each eligible family member has an issued residence permit and the requested identity records after arrival.",
    source: icpResidence,
    publishedServiceTime: icpResidenceTime,
    caveat: "Your own permit does not approve another person's application. Confirm family eligibility with ICP; an unmarried partner is not automatically a spouse dependant.",
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
    whatToPrepare: ["Budget and required bedrooms", "School shortlist and commute preferences", "Written rent instalments, deposit/refund terms, brokerage charges and lessor authorization"],
    proofOfCompletion: "You have a dated shortlist with current availability and terms confirmed by the lessor or broker.",
    source: adrecDirectory,
    caveat: "Listing portals are examples, not endorsements. Verify the registered broker and lessor's authority before paying; ask for written terms and receipts. Annual rent alone does not show the cash due at signing.",
  },
  "housing-tenancy": {
    action: { label: "Open DARI tenancy services", url: dariServices.url },
    discover: [{ label: "Check professionals with ADREC", url: adrecDirectory.url }, adrecVerify],
    whatToPrepare: ["Chosen address and agreed lease terms", "Tenant and lessor identity details", "Employer-provided tenancy record if the home is supplied"],
    proofOfCompletion: "You have the signed tenancy record and registration evidence accepted for this address.",
    source: dariServices,
    caveat: "Confirm the registration route with DARI or the authority responsible for the address. Use ADREC's verification tool for contracts it covers; a listing or employer address is not tenancy evidence.",
  },
  insurance: {
    action: insuranceSearch,
    discover: insurerDiscovery,
    whatToPrepare: ["Employer policy schedule and provider network", "Names of everyone needing cover", "Effective dates, benefits, exclusions, copayments and prescription needs"],
    proofOfCompletion: "HR or the insurer has confirmed who is covered and each effective date in writing.",
    source: dohTools,
    caveat: "Insurers are examples, not endorsements. Ask HR and the insurer to confirm each person's cover, activation and local provider network; an insurer name alone does not confirm access or family cover.",
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
    whatToPrepare: ["Child's age, passport and prior school records", "Transfer certificate and country-specific attestation questions", "Curriculum, fees, transport and employer allowance questions"],
    proofOfCompletion: "You have the school's written offer, acceptance deadline and outstanding registration requirements.",
    source: adekAdmissions,
    caveat: "Start admissions enquiries before committing to a lease. Places depend on the school's requirements and capacity; confirm residency documents and any applicable Emirates ID exception.",
  },
};

export function getActionGuide(task: Pick<ScopedTask, "id">): ActionGuide | undefined {
  return actionGuidesByTaskId[task.id];
}
