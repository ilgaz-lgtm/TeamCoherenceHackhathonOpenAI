import type { Company, Employee, RelocationPlan, RelocationTask } from "@/types/relocation";
import type { EmployeeAnswers } from "@/lib/ui/personas";
import { formatAed } from "./format";

export type TaskCategory = RelocationTask["category"] | "licensing" | "premises" | "banking" | "workforce";
export type TaskLayer = "company" | "self" | "team" | "people";

export type ScopedTask = Omit<RelocationTask, "category"> & {
  category: TaskCategory;
  rationale?: string;
  layer: TaskLayer;
  origin: "fixture" | "local";
};

export type BlockingContext = {
  id: string;
  title: string;
  description: string;
};

const companyCategories = new Set<TaskCategory>(["licensing", "premises", "banking"]);

export function companyIsEstablished(company: Company): boolean {
  return (company as Company & { isEstablishedInUAE?: boolean }).isEstablishedInUAE ?? true;
}

export function localTask(
  id: string,
  title: string,
  description: string,
  category: TaskCategory,
  layer: TaskLayer,
  dependsOn: string[] = [],
): ScopedTask {
  return {
    id,
    title,
    description,
    category,
    layer,
    dependsOn,
    dueDate: null,
    status: "pending",
    priority: "high",
    origin: "local",
  };
}

export function buildEmployeeTasks(plan: RelocationPlan, answers: EmployeeAnswers, company: Company, employee: Employee): ScopedTask[] {
  const spouse = employee.family.find((member) => member.relationship === "spouse");
  const child = employee.family.find((member) => member.relationship === "child");
  const movingNames = [
    "you",
    ...(answers.movingWithSpouse && spouse ? [spouse.name] : []),
    ...(answers.movingWithChild && child ? [child.name] : []),
  ];
  const covered = movingNames.length === 1
    ? "you"
    : `${movingNames.slice(0, -1).join(", ")} and ${movingNames[movingNames.length - 1]}`;
  const descriptions: Record<string, string> = {
    visa: `Prepare your identity records${movingNames.length > 1 ? " and records for the family moving with you" : ""} for the employer-sponsored ICP application; track the decision before booking travel.`,
    travel: `Book flights within ${formatAed(company.policy.flightAllowanceAED)} and reserve ${company.policy.temporaryAccommodationDays} days of temporary accommodation after visa clearance.`,
    housing: answers.housingArrangement === "provided"
      ? "Confirm the provided address and move-in date with your employer; request the registered tenancy evidence for household services."
      : answers.housingArrangement === "no"
        ? `Set a rent budget from salary, then shortlist ${employee.preferences.bedrooms}-bedroom homes within ${answers.maxCommuteMinutes} minutes of ${company.policy.officeLocation}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`
        : `Shortlist ${employee.preferences.bedrooms}-bedroom homes within ${formatAed(company.policy.housingAllowanceAED)} annually and ${answers.maxCommuteMinutes} minutes of ${company.policy.officeLocation}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`,
    insurance: `Record the employer policy's effective health-cover dates for ${covered} before arrival.`,
    settling: "Use the signed residential tenancy to open utility and telecom accounts at your home address.",
    school: `Apply for a place for ${child?.name ?? "your child"}${child?.age ? `, ${child.age},` : ""} and compare tuition with the ${formatAed(company.policy.schoolAllowanceAED)} school allowance.`,
  };

  return plan.tasks
    .filter((task) => !companyCategories.has(task.category))
    .filter((task) => task.category !== "school" || answers.movingWithChild)
    .map((task) => ({
      ...task,
      title: task.id === "housing" && answers.housingArrangement === "provided" ? "Confirm employer housing"
        : task.id === "insurance" && !answers.movingWithSpouse && !answers.movingWithChild ? "Confirm health coverage"
          : task.title,
      description: descriptions[task.id] ?? task.description,
      dueDate: answers.startDate,
      status: task.id === "visa" && answers.visaStage === "filed" ? "in_progress"
        : task.id === "visa" && answers.visaStage === "approved" ? "completed" : task.status,
      layer: "people" as const,
      origin: "fixture" as const,
    }));
}

export function buildEmployeeBlockingContext(company: Company, plan: RelocationPlan): BlockingContext[] {
  if (companyIsEstablished(company)) return [];

  const fixtureCompanyTasks = plan.tasks.filter((task) => companyCategories.has(task.category));
  if (fixtureCompanyTasks.length > 0) {
    return fixtureCompanyTasks.map(({ id, title, description }) => ({ id, title, description }));
  }

  return [
    { id: "employer-premises", title: "Employer premises route", description: "The employer must settle the location evidence required by its licence route." },
    { id: "employer-licence", title: "Employer trade licence", description: "A valid trade licence is required before ICP issues an establishment card." },
    { id: "employer-card", title: "Employer establishment card", description: "The card links the licensed company to its sponsorship file." },
    { id: "employer-banking", title: "Employer banking", description: "The employer sets up its own operating and payment route." },
  ];
}

export function blockingTasks(
  task: ScopedTask,
  tasks: ScopedTask[],
  completed: ReadonlySet<string>,
): ScopedTask[] {
  const prerequisites = new Set(task.dependsOn);
  if (task.layer === "self" || task.layer === "team") {
    tasks.filter((item) => item.layer === "company").forEach((item) => prerequisites.add(item.id));
  }
  if (task.layer === "team") {
    tasks.filter((item) => item.layer === "self").forEach((item) => prerequisites.add(item.id));
  }
  return tasks.filter((item) => prerequisites.has(item.id) && !completed.has(item.id));
}
