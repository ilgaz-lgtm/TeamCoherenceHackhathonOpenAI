import type { Company, Employee, RelocationPlan, RelocationTask } from "@/types/relocation";
import type { EmployeeAnswers } from "@/lib/ui/personas";
import { formatAed } from "./format";

export type TaskCategory = RelocationTask["category"] | "licensing" | "premises" | "banking" | "workforce" | "tax";
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

const companyCategories = new Set<TaskCategory>(["licensing", "premises", "banking", "tax"]);

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
  const hasFamily = answers.movingWithSpouse || answers.movingWithChild;
  const childName = child?.name ?? "your child";
  const officeLocation = company.policy.officeLocation === "Not provided" ? "your work location" : company.policy.officeLocation;
  const movingNames = [
    "you",
    ...(answers.movingWithSpouse ? [spouse?.name ?? "your spouse"] : []),
    ...(answers.movingWithChild ? [childName] : []),
  ];
  const covered = movingNames.length === 1
    ? "you"
    : `${movingNames.slice(0, -1).join(", ")} and ${movingNames[movingNames.length - 1]}`;
  const descriptions: Record<string, string> = {
    visa: "Prepare your identity records for the employer-sponsored entry-permit application; track ICP approval before booking travel.",
    travel: `${company.policy.flightAllowanceAED > 0
      ? `Book flights within ${formatAed(company.policy.flightAllowanceAED)}`
      : "Confirm your flight allowance or budget with your employer before booking"} and ${company.policy.temporaryAccommodationDays > 0
      ? `reserve ${company.policy.temporaryAccommodationDays} days of temporary accommodation`
      : "confirm how many days of temporary accommodation your employer provides"} after entry-permit clearance.`,
    housing: answers.housingArrangement === "provided"
      ? "Confirm the provided address and move-in date with your employer."
      : answers.housingArrangement === "no"
        ? `Set a rent budget from salary, then shortlist ${employee.preferences.bedrooms}-bedroom homes within ${answers.maxCommuteMinutes} minutes of ${officeLocation}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`
        : company.policy.housingAllowanceAED > 0
          ? `Shortlist ${employee.preferences.bedrooms}-bedroom homes within ${formatAed(company.policy.housingAllowanceAED)} annually and ${answers.maxCommuteMinutes} minutes of ${officeLocation}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`
          : `Confirm your annual housing allowance with your employer, then shortlist ${employee.preferences.bedrooms}-bedroom homes within ${answers.maxCommuteMinutes} minutes of ${officeLocation}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`,
    insurance: `Record the employer policy's effective health-cover dates for ${covered} before arrival.`,
    settling: "Use the signed residential tenancy to open utility and telecom accounts at your home address.",
    school: `Apply for a place for ${childName === "your child" && child?.age !== undefined ? `your ${child.age}-year-old child` : childName}${childName !== "your child" && child?.age !== undefined ? `, ${child.age},` : ""} and ${company.policy.schoolAllowanceAED > 0
      ? `compare tuition with the ${formatAed(company.policy.schoolAllowanceAED)} school allowance`
      : "confirm any school allowance with your employer"}.`,
  };

  const tasks = plan.tasks
    .filter((task) => !companyCategories.has(task.category))
    .filter((task) => task.category !== "school" || answers.movingWithChild)
    .map((task) => ({
      ...task,
      title: task.id === "visa" ? "Obtain entry permit"
        : task.id === "housing" && answers.housingArrangement === "provided" ? "Confirm employer housing"
        : task.id === "insurance" && !answers.movingWithSpouse && !answers.movingWithChild ? "Confirm health coverage"
          : task.title,
      description: descriptions[task.id] ?? task.description,
      dependsOn: task.id === "settling" ? ["housing-tenancy"] : task.dependsOn,
      dueDate: null,
      status: task.id === "visa" && answers.visaStage === "filed" ? "in_progress"
        : task.id === "visa" && answers.visaStage === "approved" ? "completed" : task.status,
      layer: "people" as const,
      origin: "fixture" as const,
    }))
    .flatMap((task): ScopedTask[] => {
      if (task.id === "visa") {
        const residence: ScopedTask = {
          ...localTask(
            "residency-completion",
            "Complete residence steps",
            "After entry-permit approval, confirm and complete any remaining medical, Emirates ID and residence steps with your employer and ICP.",
            "visa",
            "people",
            ["visa"],
          ),
          rationale: "Your approved ICP entry permit does not complete the later residence process; confirm each remaining step with your employer.",
        };
        if (!hasFamily) return [task, residence];
        const familyRecords: ScopedTask = {
          ...localTask(
            "family-records",
            "Gather family residence records",
            `Gather identity and relationship records for ${movingNames.slice(1).join(" and ")} while your own permit and residence steps are in progress.`,
            "visa",
            "people",
          ),
          rationale: "Your family records can be prepared while ICP handles your own permit; preparation does not complete their residence files.",
        };
        const familyResidence: ScopedTask = {
          ...localTask(
            "family-residence",
            "Complete family residence files",
            `Confirm the separate entry and residence requirements for ${movingNames.slice(1).join(" and ")} with your employer and ICP after your own residence route is complete.`,
            "visa",
            "people",
            ["residency-completion", "family-records"],
          ),
          rationale: "Your family's ICP residence files need their own decisions after your residence route is settled; your entry permit does not complete theirs.",
        };
        return [task, familyRecords, residence, familyResidence];
      }
      if (task.id === "housing") {
        const tenancy: ScopedTask = {
          ...localTask(
            "housing-tenancy",
            answers.housingArrangement === "provided" ? "Obtain registered tenancy evidence" : "Sign and register home tenancy",
            answers.housingArrangement === "provided"
              ? "Request the signed, registered residential tenancy record for your employer-provided address before arranging household services."
              : "Sign the chosen residential lease and obtain registered tenancy evidence before arranging household services.",
            "housing",
            "people",
            ["housing"],
          ),
          rationale: "Your signed, registered residential tenancy gives utilities an address; a housing shortlist does not open household accounts.",
        };
        return [task, tenancy];
      }
      return [task];
    });
  if (answers.movingWithChild && !tasks.some((task) => task.id === "school")) {
    const schoolTask = {
      ...localTask(
        "school",
        "Shortlist schools and confirm admissions",
        descriptions.school,
        "school",
        "people",
      ),
    };
    const housingIndex = tasks.findIndex((task) => task.id === "housing");
    tasks.splice(housingIndex < 0 ? tasks.length : housingIndex, 0, schoolTask);
  }
  if (answers.movingWithChild) {
    const schoolIndex = tasks.findIndex((task) => task.id === "school");
    const housingIndex = tasks.findIndex((task) => task.id === "housing");
    if (schoolIndex > housingIndex && housingIndex >= 0) {
      const [schoolTask] = tasks.splice(schoolIndex, 1);
      tasks.splice(housingIndex, 0, schoolTask);
    }
  }
  return tasks;
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
  return tasks.filter((item) => prerequisites.has(item.id) && !completed.has(item.id));
}
