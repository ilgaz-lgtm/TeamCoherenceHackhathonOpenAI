import type { PlanRequest, RelocationTask, NextActionResponse, RelocationPlan } from "@/types/relocation";
import { validatePlan } from "../schemas/relocation";

export function buildDemoPlan({ companyPolicy: policy, employee }: PlanRequest): RelocationPlan {
  const task = (id: string, title: string, description: string, category: RelocationTask["category"], dependsOn: string[] = []): RelocationTask => ({
    id, title, description, category, status: "pending", priority: "high", dependsOn, dueDate: employee.startDate,
  });
  const tasks = [
    task("visa", "Confirm visa sponsorship and document checklist", policy.visaSponsorship ? "Ask HR to confirm sponsored visa steps and the current requirements with the relevant authority." : "Ask HR to confirm the immigration route and current requirements.", "visa"),
    task("travel", "Arrange flights and temporary accommodation", `Confirm flights within AED ${policy.flightAllowanceAED} and ${policy.temporaryAccommodationDays} days of temporary accommodation with HR.`, "travel", ["visa"]),
    task("housing", "Shortlist suitable housing", `Find ${employee.preferences.bedrooms}-bedroom homes within AED ${policy.housingAllowanceAED} annually near ${policy.officeLocation}; confirm current availability and commute.`, "housing"),
    task("insurance", "Confirm family health coverage", `Confirm eligibility and activation for: ${policy.healthInsuranceCoverage}.`, "insurance"),
    task("settling", "Confirm utilities and telecom setup", "Ask the landlord and provider which tenancy documents are required before activation.", "settling", ["housing"]),
  ];
  if (employee.family.some((member) => member.relationship === "child")) tasks.push(task("school", "Shortlist schools and confirm admissions", `Confirm places, age eligibility and fees against the AED ${policy.schoolAllowanceAED} school allowance.`, "school"));
  return validatePlan({ readiness: 0, summary: `${employee.name}'s Abu Dhabi journey, based on employer allowances and family needs. Demo checklist; HR must confirm current requirements.`, tasks });
}

export function getDemoNextAction(plan: RelocationPlan): NextActionResponse {
  const completed = new Set(plan.tasks.filter((task) => task.status === "completed").map((task) => task.id));
  const candidates = plan.tasks.filter((task) => task.status !== "completed" && task.dependsOn.every((id) => completed.has(id)));
  const priority = { high: 0, medium: 1, low: 2 };
  candidates.sort((a, b) => priority[a.priority] - priority[b.priority]);
  const task = candidates[0];
  return task ? { taskId: task.id, reason: `${task.title}: all dependencies are complete; priority is ${task.priority}.` } : { taskId: null, reason: plan.tasks.every((task) => task.status === "completed") ? "All tasks are complete." : "No task is ready; review blocked dependencies." };
}
