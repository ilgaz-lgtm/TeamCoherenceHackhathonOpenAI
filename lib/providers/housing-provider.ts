import type { PropertySearchRequest, PropertySearchResult, ServiceProvider } from "@/types/relocation";

export interface HousingProvider {
  readonly metadata: ServiceProvider;
  search(input: PropertySearchRequest): Promise<PropertySearchResult[]>;
}
