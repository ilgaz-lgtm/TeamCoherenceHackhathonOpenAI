import type { ViewerRole } from "./personas";

export type ServiceCategoryId =
  | "transport" | "public-transit" | "groceries" | "meals" | "sim"
  | "vehicles" | "moving" | "company-setup" | "interiors"
  | "recruitment" | "food-approvals" | "housing" | "banking" | "insurance";

export type ServiceCategory = {
  id: ServiceCategoryId;
  label: string;
  roles?: ViewerRole[];
  sectors?: string[];
};

export type ServiceProvider = {
  id: string;
  category: ServiceCategoryId;
  name: string;
  summary: string;
  url: string;
  sourceUrl: string;
  roles: ViewerRole[];
  sectors?: string[];
  kind?: "official" | "commercial";
  placement: "editorial" | "sponsored";
  note?: string;
};

// Provider pages establish advertised coverage, not authorization or availability for your case.
export const serviceCategories: ServiceCategory[] = [
  { id: "transport", label: "Taxis & Rides", roles: ["founder", "employee"] },
  { id: "public-transit", label: "Buses & Route Planning", roles: ["founder", "employee"] },
  { id: "groceries", label: "Groceries", roles: ["founder", "employee"] },
  { id: "meals", label: "Food Delivery", roles: ["founder", "employee"] },
  { id: "sim", label: "Mobile & SIM", roles: ["founder", "employee"] },
  { id: "vehicles", label: "Renting & Buying a Car", roles: ["founder", "employee"] },
  { id: "moving", label: "Moving Your Home", roles: ["founder", "employee"] },
  { id: "housing", label: "Housing & Tenancy", roles: ["founder", "employee"] },
  { id: "banking", label: "Personal Banking", roles: ["founder", "employee"] },
  { id: "insurance", label: "Health & Insurance", roles: ["founder", "employee"] },
  { id: "company-setup", label: "Company Setup & PRO", roles: ["founder"] },
  { id: "interiors", label: "Cafe Design & Fit-Out", roles: ["founder"], sectors: ["restaurant_fnb"] },
  { id: "recruitment", label: "Recruitment", roles: ["founder"] },
  { id: "food-approvals", label: "Food Premises & Approvals", roles: ["founder"], sectors: ["restaurant_fnb"] },
];

export const serviceProviders: ServiceProvider[] = [
  {
    id: "abu-dhabi-taxi", category: "transport", name: "Abu Dhabi Taxi",
    summary: "Set your pickup and destination in the official Abu Dhabi Taxi app and select the vehicle you need.",
    url: "https://admobility.gov.ae/en/taxi-booking",
    sourceUrl: "https://admobility.gov.ae/en/taxi-booking",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official service; confirm pickup access, luggage space and child-seat arrangements before travelling.",
  },
  {
    id: "careem-rides", category: "transport", name: "Careem",
    summary: "Enter your Abu Dhabi pickup in Careem and compare the ride options shown for your destination.",
    url: "https://www.careem.com/en-AE/ride/",
    sourceUrl: "https://www.careem.com/en-AE/privacy-notice-ride/",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; available ride types, pickup coverage and child seats depend on the booking.",
  },
  {
    id: "uber-rides", category: "transport", name: "Uber",
    summary: "Use Uber's Abu Dhabi city page to check ride options, then enter your actual pickup and destination in the app.",
    url: "https://www.uber.com/global/en/r/cities/abu-dhabi-abu-dhabi-ae/",
    sourceUrl: "https://www.uber.com/global/en/r/cities/abu-dhabi-abu-dhabi-ae/",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; check current vehicle availability, pickup restrictions and family seating needs.",
  },
  {
    id: "hafilat", category: "public-transit", name: "Hafilat Smart Card",
    summary: "Check the Hafilat card options and recharge channels, then tap your card when boarding and leaving the bus.",
    url: "https://admobility.gov.ae/en/pb-bus-service/hafilat-cards",
    sourceUrl: "https://admobility.gov.ae/en/pb-bus-service/hafilat-cards",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official bus payment service; check the card type, concession eligibility and route you intend to use.",
  },
  {
    id: "darbi-route-planning", category: "public-transit", name: "Darbi / AD Maps",
    summary: "Open Abu Dhabi Mobility's journey-planning apps and compare public transport routes for your workplace and shortlisted homes.",
    url: "https://admobility.gov.ae/en/home",
    sourceUrl: "https://admobility.gov.ae/en/home",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official planning tools; Darbi plans journeys and Darb handles road tolls, so confirm the current route and service schedule.",
  },
  {
    id: "carrefour", category: "groceries", name: "Carrefour UAE",
    summary: "Select Abu Dhabi in Carrefour's store finder or set your delivery address before choosing groceries.",
    url: "https://www.carrefouruae.com/mafuae/en/n/c/clp_carrefour-store-finder-uae",
    sourceUrl: "https://www.carrefouruae.com/mafuae/en/n/c/clp_carrefour-store-finder-uae",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; stock, delivery coverage and checkout charges depend on your address.",
  },
  {
    id: "lulu", category: "groceries", name: "LuLu Hypermarket",
    summary: "Choose your UAE location on LuLu's site and check a nearby store or address-specific grocery delivery.",
    url: "https://gcc.luluhypermarket.com/en-ae/address/stores/",
    sourceUrl: "https://www.luluretail.com/media/news/",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; confirm your branch, delivery coverage and the final checkout total.",
  },
  {
    id: "noon-minutes", category: "groceries", name: "noon Minutes",
    summary: "Set your Abu Dhabi delivery pin in noon Minutes to see which groceries and household essentials can reach your address.",
    url: "https://minutes.noon.com/uae-en/",
    sourceUrl: "https://minutes.noon.com/",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; coverage, stock and delivery estimates vary by address and are not guarantees.",
  },
  {
    id: "talabat", category: "meals", name: "talabat",
    summary: "Choose your Abu Dhabi area on talabat and enter the building and delivery instructions before ordering a meal.",
    url: "https://www.talabat.com/uae/city/abu-dhabi",
    sourceUrl: "https://www.talabat.com/uae/city/abu-dhabi",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; check delivery charges and confirm allergy or dietary questions with the restaurant.",
  },
  {
    id: "deliveroo", category: "meals", name: "Deliveroo",
    summary: "Set your Abu Dhabi address on Deliveroo to compare restaurants serving your building.",
    url: "https://deliveroo.ae/",
    sourceUrl: "https://deliveroo.ae/en/restaurants/abu-dhabi/abu-dhabi-gate-city",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; the cited area is one coverage example, and your own address determines restaurant availability.",
  },
  {
    id: "eand-visitor-line", category: "sim", name: "e& UAE Visitor Line",
    summary: "Check e&'s Visitor Line requirements and bring the requested passport and visa records when obtaining a SIM.",
    url: "https://www.eand.ae/en/c/mobile/plans/visitor-line.html",
    sourceUrl: "https://www.eand.ae/en/c/mobile/plans/visitor-line.html",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; verify visitor eligibility and validity, and ask how to update the line with your Emirates ID after becoming resident.",
  },
  {
    id: "du-tourist-sim", category: "sim", name: "du Tourist SIM",
    summary: "Review du's tourist SIM or eSIM options and confirm the identity documents needed for your visitor status.",
    url: "https://www.du.ae/personal/mobile/prepaid-plans/tourist-sim/registration",
    sourceUrl: "https://www.du.ae/servlet/duaediscovery/common/images/html/prepaid-plantourist-information.html",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; check device compatibility, current registration rules and how to move to a resident line with a valid Emirates ID.",
  },
  {
    id: "hertz", category: "vehicles", name: "Hertz UAE",
    summary: "Select a listed Abu Dhabi Hertz branch and ask for the rental conditions that match your visitor or resident status.",
    url: "https://www.hertz.ae/en/car-rental-abu-dhabi",
    sourceUrl: "https://www.hertz.ae/en/car-rental-abu-dhabi",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; confirm accepted driving licence, age, deposit, insurance excess and toll charges before booking.",
  },
  {
    id: "avis", category: "vehicles", name: "Avis UAE",
    summary: "Choose an Abu Dhabi Avis pickup location and request a written rental checklist before reserving a car.",
    url: "https://www.avis.ae/avis-uae-car-hire-locations",
    sourceUrl: "https://www.avis.ae/avis-uae-car-hire-locations",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; confirm licence acceptance, deposit, additional drivers and return conditions for your selected branch.",
  },
  {
    id: "vehicle-registration", category: "vehicles", name: "Abu Dhabi Mobility / TAMM",
    summary: "Review the official vehicle ownership-transfer and registration services through TAMM before committing to a car purchase.",
    url: "https://admobility.gov.ae/en/vehicle-licensing-services",
    sourceUrl: "https://admobility.gov.ae/en/vehicle-licensing-services",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official service; verify your traffic file, identity, insurance and any inspection or mortgage-release requirements for the specific vehicle.",
  },
  {
    id: "darb-tolls", category: "vehicles", name: "Darb Tolling System",
    summary: "Review Abu Dhabi Mobility's Darb instructions and confirm who registers the vehicle and pays tolls before driving.",
    url: "https://admobility.gov.ae/en/darb-fees",
    sourceUrl: "https://admobility.gov.ae/en/darb-fees",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official road-toll service; for a rental, ask the rental company how tolls and administration charges are handled.",
  },
  {
    id: "allied-moving", category: "moving", name: "Allied Moving Services",
    summary: "Ask Allied's Abu Dhabi team for a move survey and itemized packing, transport and storage scope.",
    url: "https://www.allied.com/ae/domestic-moving/abu-dhabi-moving-services",
    sourceUrl: "https://www.allied.com/ae/domestic-moving/abu-dhabi-moving-services",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; confirm local versus international scope, customs responsibilities and cover for your own shipment.",
  },
  {
    id: "commitbiz", category: "company-setup", name: "Commitbiz",
    summary: "Ask Commitbiz's Abu Dhabi team for an itemized formation and PRO quote separating authority charges, provider work and its estimated schedule.",
    url: "https://www.commitbiz.com/contact-us",
    sourceUrl: "https://www.commitbiz.com/blog/your-guide-to-pro-services-in-abu-dhabi",
    roles: ["founder"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; confirm who files each application, authority charges and the handling of original documents, with no approval guarantee.",
  },
  {
    id: "design-infinity", category: "interiors", name: "Design Infinity",
    summary: "Share your cafe floor plan and equipment brief with Design Infinity's Abu Dhabi office and request an itemized fit-out quote and milestone schedule.",
    url: "https://design-infinity.com/portfolios/huawei-cafe/",
    sourceUrl: "https://design-infinity.com/portfolios/huawei-cafe/",
    roles: ["founder"], sectors: ["restaurant_fnb"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; the cited cafe is in Internet City, while the page lists an Abu Dhabi office; confirm local submissions, kitchen expertise and project fit.",
  },
  {
    id: "nadia-recruitment", category: "recruitment", name: "NADIA Global",
    summary: "Send NADIA your Abu Dhabi role descriptions and ask for a written recruitment brief and candidate-selection process.",
    url: "https://www.nadiaglobal.com/recruitment-agency-in-uae/",
    sourceUrl: "https://www.nadiaglobal.com/recruitment-agency-in-uae/",
    roles: ["founder"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; confirm agency authorization with MOHRE and agree fees, replacement terms and who employs each candidate.",
  },
  {
    id: "tasc-recruitment", category: "recruitment", name: "TASC Outsourcing",
    summary: "Send TASC your Abu Dhabi staffing brief and ask which direct-hire or outsourced-employment arrangement it proposes.",
    url: "https://tascoutsourcing.com/en",
    sourceUrl: "https://tascoutsourcing.com/en/thank-you-work-with-us-registration-received",
    roles: ["founder"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; the provider lists an Abu Dhabi office, but confirm current authorization, employer responsibilities and contract terms.",
  },
  {
    id: "adafsa-food-design", category: "food-approvals", name: "ADAFSA",
    summary: "Review ADAFSA's food-service design guidance with your designer before asking ADDED and ADAFSA which reviews your activity and site need.",
    url: "https://www.adafsa.gov.ae/CMS/Guidelines/Guideline%20No%20%286%29%20of%202019%20Food%20Service%20Design.pdf",
    sourceUrl: "https://www.adafsa.gov.ae/CMS/Guidelines/Guideline%20No%20%286%29%20of%202019%20Food%20Service%20Design.pdf",
    roles: ["founder"], sectors: ["restaurant_fnb"], kind: "official", placement: "editorial",
    note: "Official guidance dated 2019; confirm current requirements with the authorities, since a contractor's portfolio does not approve a food premises.",
  },
  {
    id: "adrec-housing", category: "housing", name: "ADREC Housing Checks",
    summary: "Check the broker's registration with ADREC and request the applicable tenancy registration evidence before paying for a home.",
    url: "https://adrec.gov.ae/en/directory",
    sourceUrl: "https://adrec.gov.ae/en/directory",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official directory; verify lessor authority, written rent instalments, deposit terms and the registration route for your specific address.",
  },
  {
    id: "fab-personal-banking", category: "banking", name: "FAB Personal Savings Account",
    summary: "Ask FAB whether its personal savings account suits your current resident or non-resident status and request the identity and income checklist.",
    url: "https://www.bankfab.com/en-ae/personal/accounts/savings-accounts/personal-savings-account",
    sourceUrl: "https://www.bankfab.com/en-ae/personal/accounts/savings-accounts/personal-savings-account",
    roles: ["founder", "employee"], kind: "commercial", placement: "editorial",
    note: "Commercial example, not endorsed or paid; published eligibility is not approval, so confirm minimum balances, charges and cheque-book availability.",
  },
  {
    id: "doh-insurance", category: "insurance", name: "DoH Health Insurance Tools",
    summary: "Use DoH's authorized-insurer tools to compare insurers, then ask your insurer or employer, as applicable, for your named cover and local provider network.",
    url: "https://www.doh.gov.ae/en/resources/Lists%20and%20Tools",
    sourceUrl: "https://www.doh.gov.ae/en/resources/Lists%20and%20Tools",
    roles: ["founder", "employee"], kind: "official", placement: "editorial",
    note: "Official tools; authorization does not establish your benefits, family coverage or activation, which must be checked against your policy.",
  },
];

function sectorFor(businessType?: string): string | undefined {
  const value = businessType?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (!value) return undefined;
  if (value === "restaurant_fnb" || /\b(coffee|cafe|roastery|roasting|restaurant|food|beverage|bakery|catering|fnb)\b/.test(value)) return "restaurant_fnb";
  if (value === "tech_startup" || /\b(tech|technology|software|saas)\b/.test(value)) return "tech_startup";
  if (/\b(consultancy|consulting)\b/.test(value)) return "consultancy";
  if (/\b(trading|retail|wholesale)\b/.test(value)) return "trading";
  return undefined;
}

export function servicesFor({ role, businessType }: { role: ViewerRole; businessType?: string }): ServiceProvider[] {
  const sector = sectorFor(businessType);
  return serviceProviders.filter((provider) => provider.roles.includes(role)
    && (!provider.sectors?.length || (sector !== undefined && provider.sectors.includes(sector))));
}
