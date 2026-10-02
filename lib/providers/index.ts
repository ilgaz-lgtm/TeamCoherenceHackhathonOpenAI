import "server-only";
import type { HousingProvider } from "./housing-provider";
import { MockHousingProvider } from "./mock-housing-provider";

// Replace this adapter with a real provider without changing callers.
export const housingProvider: HousingProvider = new MockHousingProvider();
