import type { PlanRequest, RelocationTask, NextActionResponse, RelocationPlan } from "@/types/relocation";
import { validatePlan } from "../schemas/relocation";

export function buildDemoPlan({ companyPolicy: policy, employee }: PlanRequest): RelocationPlan {
  const task = (id: string, title: string, description: string, category: RelocationTask["category"], dependsOn: string[] = []): RelocationTask => ({
    id, title, description, category, status: "pending", priority: "high", dependsOn, dueDate: employee.startDate,
  });
  const compactStay = employee.family.length === 0
    && employee.assignment?.durationDays !== undefined
    && employee.assignment.durationDays <= 90
    && employee.assignment.accommodation === "employer_managed";
  if (compactStay) {
    const tasks = [
      { ...task("visa", "Confirm assignment immigration requirements", "Ask HR and the relevant authority to confirm the immigration route and required documents for this assignment.", "visa"),
        rationale: `Your ${employee.assignment!.durationDays}-day assignment still needs HR confirmation of the appropriate immigration route.` },
      { ...task("housing", "Confirm employer-arranged stay and arrival", `Confirm a ${employee.preferences.bedrooms}-bedroom serviced stay near ${policy.officeLocation}, within the AED ${policy.housingAllowanceAED} annual-equivalent housing cap; confirm utilities and flights within AED ${policy.flightAllowanceAED} with HR.`, "housing", ["visa"]),
        rationale: "Your short assignment uses employer-managed accommodation, so housing, utilities and arrival logistics can be coordinated together." },
      { ...task("insurance", "Confirm assignment health coverage", `Confirm eligibility and activation for: ${policy.healthInsuranceCoverage}.`, "insurance"),
        rationale: "You are moving without dependants, so HR needs to confirm coverage for you during the assignment." },
    ];
    return validatePlan({ readiness: 0, summary: `${employee.name}'s ${employee.assignment!.durationDays}-day Abu Dhabi assignment: employer-managed accommodation and no dependants create a shorter journey. Demo checklist; HR must confirm current requirements.`, tasks });
  }
  const tasks = [
    task("visa", "Confirm visa sponsorship and document checklist", policy.visaSponsorship ? "Ask HR to confirm sponsored visa steps and the current requirements with the relevant authority." : "Ask HR to confirm the immigration route and current requirements.", "visa"),
    task("travel", "Arrange flights and temporary accommodation", `Confirm flights within AED ${policy.flightAllowanceAED} and ${policy.temporaryAccommodationDays} days of temporary accommodation with HR.`, "travel", ["visa"]),
    task("housing", "Shortlist suitable housing", `Find ${employee.preferences.bedrooms}-bedroom homes within AED ${policy.housingAllowanceAED} annually near ${policy.officeLocation}; confirm current availability and commute.`, "housing"),
    task("insurance", employee.family.length ? "Confirm family health coverage" : "Confirm employee health coverage", `Confirm eligibility and activation for: ${policy.healthInsuranceCoverage}.`, "insurance"),
    task("settling", "Confirm utilities and telecom setup", "Ask the landlord and provider which tenancy documents are required before activation.", "settling", ["housing"]),
  ];
  if (employee.family.some((member) => member.relationship === "child")) tasks.push(task("school", "Shortlist schools and confirm admissions", `Confirm places, age eligibility and fees against the AED ${policy.schoolAllowanceAED} school allowance.`, "school"));
  const rationales: Record<RelocationTask["category"], string> = {
    visa: policy.visaSponsorship ? "Your employer offers visa sponsorship, so HR must confirm the document checklist for your profile." : "Your policy does not include visa sponsorship, so HR must confirm the appropriate immigration arrangements.",
    travel: `Your policy includes ${policy.temporaryAccommodationDays} days of temporary accommodation and AED ${policy.flightAllowanceAED} for flights before you settle.`,
    housing: `You requested ${employee.preferences.bedrooms} bedrooms and a commute of at most ${employee.preferences.maxCommuteMinutes} minutes to ${policy.officeLocation}.`.slice(0, 220),
    insurance: employee.family.length ? "You are relocating with dependants, so their eligibility must be confirmed alongside your own coverage." : "You are relocating alone, so HR must confirm your individual coverage and activation date.",
    settling: "Your housing is self-arranged, so utilities and telecom setup depend on confirming your tenancy documents.",
    school: "Your family includes a child, so school availability and admissions should inform your housing-area decision.",
  };
  tasks.forEach((item) => { item.rationale = rationales[item.category]; });
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
