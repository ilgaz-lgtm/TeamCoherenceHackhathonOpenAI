import "server-only";
import type { HousingProvider } from "./housing-provider";
import type { PropertySearchRequest, PropertySearchResult } from "@/types/relocation";

const listings: PropertySearchResult[] = [
  { id: "reem-stay-01", providerId: "mock-housing", title: "Al Reem serviced one-bedroom stay", area: "Al Reem Island", bedrooms: 1, annualRentAED: 84000, estimatedCommuteMinutes: 15, description: "Fictional demo serviced stay with utilities; annual-equivalent price, subject to HR confirmation for a short assignment." },
  { id: "reem-01", providerId: "mock-housing", title: "Family apartment on Al Reem", area: "Al Reem Island", bedrooms: 3, annualRentAED: 155000, estimatedCommuteMinutes: 15, description: "Fictional demo listing with community facilities." },
  { id: "saadiyat-01", providerId: "mock-housing", title: "Saadiyat family residence", area: "Saadiyat Island", bedrooms: 3, annualRentAED: 175000, estimatedCommuteMinutes: 25, description: "Fictional demo listing near cultural attractions." },
  { id: "yas-01", providerId: "mock-housing", title: "Yas Island townhouse", area: "Yas Island", bedrooms: 3, annualRentAED: 170000, estimatedCommuteMinutes: 35, description: "Fictional demo townhouse." },
  { id: "reem-02", providerId: "mock-housing", title: "Compact Al Reem apartment", area: "Al Reem Island", bedrooms: 2, annualRentAED: 105000, estimatedCommuteMinutes: 15, description: "Fictional demo two-bedroom apartment." },
  { id: "saadiyat-02", providerId: "mock-housing", title: "Spacious Saadiyat villa", area: "Saadiyat Island", bedrooms: 4, annualRentAED: 260000, estimatedCommuteMinutes: 25, description: "Fictional demo four-bedroom villa." },
];

export class MockHousingProvider implements HousingProvider {
  readonly metadata = { id: "mock-housing", name: "Abu Dhabi Demo Housing", category: "housing", mode: "mock" } as const;
  async search(input: PropertySearchRequest) {
    // Commute estimates are only defined for ADGM in this mock dataset.
    if (input.officeArea.trim().toLowerCase() !== "adgm") return [];
    return listings.filter((listing) => listing.bedrooms >= input.bedrooms
      && listing.annualRentAED <= input.maxAnnualRentAED
      && listing.estimatedCommuteMinutes <= input.maxCommuteMinutes
      && (!input.preferredAreas.length || input.preferredAreas.some((area) => area.toLowerCase() === listing.area.toLowerCase())))
      .sort((a, b) => a.annualRentAED - b.annualRentAED).map((listing) => ({ ...listing }));
  }
}
