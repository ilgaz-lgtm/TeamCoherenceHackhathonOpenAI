import type { z } from "zod";
import type * as schemas from "@/lib/schemas/relocation";

export type Company = z.infer<typeof schemas.companySchema>;
export type CompanyRelocationPolicy = z.infer<typeof schemas.companyRelocationPolicySchema>;
export type Employee = z.infer<typeof schemas.employeeSchema>;
export type FamilyMember = z.infer<typeof schemas.familyMemberSchema>;
export type RelocationCase = z.infer<typeof schemas.relocationCaseSchema>;
export type RelocationTask = z.infer<typeof schemas.relocationTaskSchema>;
export type RelocationPlan = z.infer<typeof schemas.relocationPlanSchema>;
export type ServiceProvider = z.infer<typeof schemas.serviceProviderSchema>;
export type PropertySearchRequest = z.infer<typeof schemas.propertySearchRequestSchema>;
export type PropertySearchResult = z.infer<typeof schemas.propertySearchResultSchema>;
export type PlanRequest = z.infer<typeof schemas.planRequestSchema>;
export type NextActionRequest = z.infer<typeof schemas.nextActionRequestSchema>;
export type NextActionResponse = z.infer<typeof schemas.nextActionResponseSchema>;
export type HousingSearchResponse = z.infer<typeof schemas.housingSearchResponseSchema>;
export type ApiError = z.infer<typeof schemas.apiErrorSchema>;
