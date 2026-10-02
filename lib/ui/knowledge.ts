export type KnowledgeEntry = {
  id: string;
  topics: string[];
  roles: ("founder" | "employee")[];
  question: string;
  answer: string;
  action: { label: string; url: string };
  source: { title: string; url: string };
};

// Reviewed 2026-10-02. Confirm the applicable category and current checklist before filing.
export const knowledge: KnowledgeEntry[] = [
  {
    id: "licence-and-card", topics: ["company", "licensing", "visa"], roles: ["founder"],
    question: "Is my economic licence the same as my establishment card?",
    answer: "Your ICP establishment card records your company's immigration details and requires a valid trade licence. Keep the licence, ICP card and employment-authority file references separately. Ask ICP which category and authorized submission channel apply; its category terms include authorized-service-provider submission, and free-zone card requests go through the respective free-zone authority. A card alone does not approve an employee's work or residence permit.",
    action: { label: "Check ICP establishment-card requirements", url: "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e6d" },
    source: { title: "ICP: Issuing an Establishment Card", url: "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e6d" },
  },
  {
    id: "mainland-or-free-zone", topics: ["company", "licensing"], roles: ["founder"],
    question: "Do UAE customers automatically mean I need a mainland company?",
    answer: "Give ADDED and your proposed free zone the same activity, premises and customer-market brief. Ask how each route allows you to serve those customers and what extra permissions it needs. ADDED lists a dual licence for Abu Dhabi free-zone establishments operating outside the zone; eligibility still needs confirmation for your activity. Customer location alone does not settle the licence route.",
    action: { label: "Compare ADDED licence types", url: "https://www.added.gov.ae/en/set-up/establish-your-business/licensing-requirements" },
    source: { title: "ADDED: Licensing requirements", url: "https://www.added.gov.ae/en/set-up/establish-your-business/licensing-requirements" },
  },
  {
    id: "premises-before-lease", topics: ["company", "licensing", "housing"], roles: ["founder"],
    question: "Should I sign an office or cafe lease before selecting my licence?",
    answer: "Ask the licensing authority whether your actual activities need premises and whether the proposed address is suitable before committing to a lease. ADDED lists routes that can operate without physical office premises, while a customer-facing food site needs its own suitability review. Obtain the authority's required tenancy evidence and additional-approval checklist for your chosen route.",
    action: { label: "Check ADDED premises guidance", url: "https://www.added.gov.ae/en/set-up/establish-your-business" },
    source: { title: "ADDED: Establishing your business", url: "https://www.added.gov.ae/en/set-up/establish-your-business" },
  },
  {
    id: "unmarried-partner", topics: ["family", "visa", "arrival"], roles: ["founder", "employee"],
    question: "Can my unmarried partner move on my spouse visa?",
    answer: "The published family-sponsorship categories include a spouse; selecting a partner in your plan does not establish spouse eligibility. Ask ICP to assess an independent visa route for your unmarried partner, such as their own employment or another category they qualify for. Confirm their separate entry permission before booking travel; your approval does not approve theirs.",
    action: { label: "Check family sponsorship categories", url: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-family-members" },
    source: { title: "UAE Government: Residence visa for family members", url: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/residence-visa-for-family-members" },
  },
  {
    id: "family-sponsor-readiness", topics: ["family", "visa", "documents"], roles: ["founder", "employee"],
    question: "What should I confirm before starting my family's residence applications?",
    answer: "Ask ICP to confirm your sponsor category, residence validity, income evidence, suitable housing and proof of relationship for each person. Request the medical, insurance and document checklist for the applicable family category. Keep each person's application reference and decision; a collected document pack or your own entry permit does not complete their residence application.",
    action: { label: "Review ICP family residence requirements", url: "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64" },
    source: { title: "ICP: Issuing Residency Permit", url: "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64" },
  },
  {
    id: "insurance-network", topics: ["insurance", "family", "arrival"], roles: ["founder", "employee"],
    question: "How do I know my health cover works near my new home?",
    answer: "Request the policy summary, named-member list, effective dates and provider network from your insurer or employer, as applicable. Check nearby clinics and hospitals for your exact policy, plus copayments, prescriptions, exclusions and any approval requirements. Ask about each family member separately. The insurer's brand name alone does not show which facilities or treatments your policy covers.",
    action: { label: "Review DoH policy-documentation guidance", url: "https://www.doh.gov.ae/-/media/09AEC8C5B6D34AA88DE110F63641B863.ashx" },
    source: { title: "DoH: Healthcare Insurers Manual, policy documentation", url: "https://www.doh.gov.ae/-/media/09AEC8C5B6D34AA88DE110F63641B863.ashx" },
  },
  {
    id: "rent-before-payment", topics: ["housing", "budget"], roles: ["founder", "employee"],
    question: "What should I check before paying a rental deposit or advance rent?",
    answer: "Verify your broker through ADREC and request evidence that the lessor can rent the property. Get the rent instalments, payment recipient, refundable deposit terms, brokerage charges and registration arrangements in writing before paying. Keep receipts. Ask what is due at signing rather than assuming annual rent divided by twelve is your monthly cash requirement.",
    action: { label: "Check ADREC registered professionals", url: "https://adrec.gov.ae/en/directory" },
    source: { title: "ADREC: Real estate professionals directory", url: "https://adrec.gov.ae/en/directory" },
  },
  {
    id: "tenancy-evidence", topics: ["housing", "documents"], roles: ["founder", "employee"],
    question: "Does a listing or signed lease prove that my tenancy is registered?",
    answer: "Ask the lessor for the registration record required by the authority responsible for your address. For a contract covered by ADREC, use its document-verification tool with the tenancy contract number and check the returned address and parties. A portal listing, reservation or employer-provided address is not that evidence. Confirm the correct registration route before relying on it for another application.",
    action: { label: "Verify an ADREC tenancy document", url: "https://adrec.gov.ae/en/verify-document" },
    source: { title: "ADREC: Verify Document", url: "https://adrec.gov.ae/en/verify-document" },
  },
  {
    id: "school-before-lease", topics: ["school", "family", "housing"], roles: ["founder", "employee"],
    question: "Can I start school admissions before choosing a permanent home?",
    answer: "Contact schools before signing a lease and ask for places, grade placement, transport, fees and document deadlines. Obtain a written offer and its acceptance deadline before choosing a commute. Registration needs identity and school records; ADEK provides a temporary Emirates ID exception for eligible non-UAE transfer students with a parental undertaking. Ask your school how it applies and whether transfer records need attestation.",
    action: { label: "Review ADEK admissions requirements", url: "https://www.adek.gov.ae/-/media/Project/TAMM/ADEK/Policies/School-Policies/Teaching-and-Learning/ADEK_S_Student-Administrative-Affairs-Policy_EN_1_2.pdf" },
    source: { title: "ADEK: Student Administrative Affairs Policy, September 2025", url: "https://www.adek.gov.ae/-/media/Project/TAMM/ADEK/Policies/School-Policies/Teaching-and-Learning/ADEK_S_Student-Administrative-Affairs-Policy_EN_1_2.pdf" },
  },
  {
    id: "personal-account-eligibility", topics: ["banking", "arrival", "documents"], roles: ["founder", "employee"],
    question: "Must I wait for Emirates ID before asking a bank about an account?",
    answer: "Ask the bank which account matches your current resident or non-resident status and how it verifies identity. FAB's published personal savings eligibility includes non-residents, but its document and income checks still apply. Ask about minimum balances, transfers and cheque-book availability before applying. This is one bank's product example, not an endorsement or a guarantee of approval.",
    action: { label: "Check FAB savings eligibility (example)", url: "https://www.bankfab.com/en-ae/personal/accounts/savings-accounts/personal-savings-account" },
    source: { title: "FAB: Personal Savings Account eligibility and documents", url: "https://www.bankfab.com/en-ae/personal/accounts/savings-accounts/personal-savings-account" },
  },
  {
    id: "business-account-readiness", topics: ["company", "banking", "documents"], roles: ["founder"],
    question: "Does a company licence guarantee a business bank account?",
    answer: "Request the chosen bank's checklist before planning receipts or payroll around an account. ADCB's example includes licence records, owners and signatories, address evidence and formation or account-opening authority documents. Explain your expected currencies and cross-border transactions so the proposed account fits. Eligibility to apply is not approval; compare charges and restrictions directly. ADCB is a commercial example, not an endorsement.",
    action: { label: "Review ADCB business checklist (example)", url: "https://www.adcb.com/en/get-in-touch/faqs/accounts/business-choice-account-faq" },
    source: { title: "ADCB: Business Account FAQ", url: "https://www.adcb.com/en/get-in-touch/faqs/accounts/business-choice-account-faq" },
  },
  {
    id: "cash-before-arrival", topics: ["budget", "housing", "arrival"], roles: ["founder", "employee"],
    question: "Which costs should I confirm before deciding what cash to bring?",
    answer: "Build a dated cash schedule from written quotes: rent due at signing, refundable deposits, tenancy charges, utility setup, temporary accommodation and any school or document costs you need. Ask who pays each item and when reimbursement arrives. Check the utility route for your address. Keep unknown fees as TODO(verify), and keep refundable deposits separate from ongoing spending instead of assuming a universal relocation total.",
    action: { label: "Check utility move-in requirements", url: "https://www.addc.ae/en-US/residential/Pages/About-Moving-in.aspx" },
    source: { title: "ADDC: Your guide to moving in", url: "https://www.addc.ae/en-US/residential/Pages/About-Moving-in.aspx" },
  },
  {
    id: "document-attestations", topics: ["documents", "family", "visa", "school"], roles: ["founder", "employee"],
    question: "Which documents should I arrange while I am still abroad?",
    answer: "Get the receiving authority's list for your actual application, then check the attestation route with MOFA or the UAE mission in the issuing country. MOFA requests original documents in Arabic or English, or a legally certified translation, with the prior attestations required for that route. Ask separately about degrees, marriage or birth records and school transfer papers; do not assume every document uses the same process.",
    action: { label: "Check MOFA document attestation", url: "https://www.mofa.gov.ae/en/Services/Attestation" },
    source: { title: "MOFA: Attestation of Official Documents and Certificates", url: "https://www.mofa.gov.ae/en/Services/Attestation" },
  },
  {
    id: "arrival-clearance", topics: ["arrival", "visa"], roles: ["founder", "employee"],
    question: "Is my planned arrival date enough to book the move?",
    answer: "Treat your chosen date as a target. Ask ICP and, for employees, HR to confirm the issued entry permission, category, validity and remaining residence steps for each traveller; check boarding requirements with the carrier. A signed offer, application receipt or projected completion date is not an issued permit. Confirm booking-change terms before committing to travel or temporary accommodation.",
    action: { label: "Review ICP entry-permit service", url: "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e60" },
    source: { title: "ICP: Issuance of a Visa", url: "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e60" },
  },
  {
    id: "first-hire-authority", topics: ["company", "hiring", "visa"], roles: ["founder"],
    question: "What should I check before promising a first employee's start date?",
    answer: "Confirm your employment authority, employer-file status, capacity for the roles and the correct work-permit service before setting a firm start date. Ask MOHRE, or your free-zone authority where applicable, which offer, contract, qualification and payroll steps apply. Keep the immigration card and employment file distinct, and request the employee's authority decision rather than treating a recruitment agreement as a permit.",
    action: { label: "Review MOHRE employer services", url: "https://www.mohre.gov.ae/en/services/services-directory" },
    source: { title: "MOHRE: Services directory", url: "https://www.mohre.gov.ae/en/services/services-directory" },
  },
  {
    id: "tax-after-licensing", topics: ["company", "tax", "budget"], roles: ["founder"],
    question: "Should I review tax registration before the business makes a profit?",
    answer: "Ask the FTA or a qualified tax adviser to confirm corporate-tax registration and the applicable deadline from your entity details and incorporation date. Registration is a separate review from whether tax is payable; do not infer an exemption from a free-zone label or lack of profit. Prepare your licence, formation, ownership and signatory records. Review VAT separately against its own registration rules.",
    action: { label: "Review FTA corporate-tax registration", url: "https://tax.gov.ae/en/services/corporate.tax.registration.aspx" },
    source: { title: "FTA: Corporate Tax Registration", url: "https://tax.gov.ae/en/services/corporate.tax.registration.aspx" },
  },
];
