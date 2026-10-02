import { z } from "zod";

const text = z.string().trim().min(1).max(1000);
const money = z.number().nonnegative();
export const companyRelocationPolicySchema = z.object({
  housingAllowanceAED: money,
  schoolAllowanceAED: money,
  temporaryAccommodationDays: z.number().int().nonnegative(),
  healthInsuranceCoverage: text,
  visaSponsorship: z.boolean(),
  flightAllowanceAED: money,
  officeLocation: text,
  preferredAreas: z.array(text).max(20),
});
export const companySchema = z.object({ id: text, name: text, policy: companyRelocationPolicySchema });
export const familyMemberSchema = z.object({ name: text, relationship: z.enum(["spouse", "child"]), age: z.number().int().min(0).max(120) });
export const employeeSchema = z.object({
  id: text, companyId: text, name: text, nationality: text, movingFrom: text,
  role: text, startDate: z.iso.date(), family: z.array(familyMemberSchema).max(20),
  preferences: z.object({ bedrooms: z.number().int().min(0).max(10), maxCommuteMinutes: z.number().int().positive().max(180), preferredAreas: z.array(text).max(20) }),
});
export const relocationTaskSchema = z.object({
  id: text, title: text, description: text,
  category: z.enum(["visa", "housing", "school", "insurance", "travel", "settling"]),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["high", "medium", "low"]),
  dependsOn: z.array(text), dueDate: z.iso.date().nullable(),
});
export const relocationPlanSchema = z.object({ readiness: z.number().min(0).max(100), summary: text, tasks: z.array(relocationTaskSchema).max(40) });
export const relocationCaseSchema = z.object({ id: text, companyId: text, employeeId: text, destination: z.literal("Abu Dhabi"), plan: relocationPlanSchema });
export const serviceProviderSchema = z.object({ id: text, name: text, category: z.enum(["housing", "banking", "insurance", "school", "moving", "telecom"]), mode: z.enum(["mock", "live"]) });
export const propertySearchRequestSchema = z.object({
  bedrooms: z.number().int().min(0).max(10), maxAnnualRentAED: money,
  officeArea: text, maxCommuteMinutes: z.number().int().positive().max(180),
  preferredAreas: z.array(text).max(20),
});
export const propertySearchResultSchema = z.object({
  id: text, providerId: text, title: text, area: text,
  bedrooms: z.number().int().nonnegative(), annualRentAED: money,
  estimatedCommuteMinutes: z.number().nonnegative(), description: text,
});
export const housingSearchResponseSchema = z.object({ provider: serviceProviderSchema, results: z.array(propertySearchResultSchema) });
export const planRequestSchema = z.object({ companyPolicy: companyRelocationPolicySchema, employee: employeeSchema });
export const nextActionRequestSchema = z.object({ plan: relocationPlanSchema }).superRefine(({ plan }, ctx) => {
  try { validatePlan(plan); }
  catch { ctx.addIssue({ code: "custom", path: ["plan", "tasks"], message: "Task IDs must be unique and dependencies must form a valid acyclic graph." }); }
});
export const nextActionResponseSchema = z.object({ taskId: text.nullable(), reason: text });
export const apiErrorSchema = z.object({ error: z.object({ code: text, message: text, details: z.array(z.object({ path: z.string(), message: text })).optional() }) });

/** Reject invalid dependency graphs before the UI tries to render them. */
export function validatePlan(plan: z.infer<typeof relocationPlanSchema>) {
  const parsed = relocationPlanSchema.parse(plan);
  const tasks = new Map(parsed.tasks.map((task) => [task.id, task]));
  if (tasks.size !== parsed.tasks.length) throw new Error("Duplicate task IDs");
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) throw new Error("Cyclic dependencies");
    if (visited.has(id)) return;
    const task = tasks.get(id);
    if (!task) throw new Error("Unknown dependency");
    visiting.add(id);
    task.dependsOn.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  parsed.tasks.forEach((task) => visit(task.id));
  return parsed;
}
