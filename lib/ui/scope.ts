import type { Company, RelocationPlan, RelocationTask } from "@/types/relocation";

export type TaskCategory = RelocationTask["category"] | "licensing" | "premises" | "banking";
export type TaskLayer = "company" | "people";

export type ScopedTask = Omit<RelocationTask, "category"> & {
  category: TaskCategory;
  rationale?: string;
  layer: TaskLayer;
  origin: "fixture" | "local";
};

const companyCategories = new Set<TaskCategory>(["licensing", "premises", "banking"]);

export function companyIsEstablished(company: Company): boolean {
  return (company as Company & { isEstablishedInUAE?: boolean }).isEstablishedInUAE ?? true;
}

function localCompanyTask(
  id: string,
  title: string,
  description: string,
  category: TaskCategory,
  dependsOn: string[] = [],
): ScopedTask {
  return {
    id,
    title,
    description,
    category,
    dependsOn,
    dueDate: null,
    status: "pending",
    priority: "high",
    layer: "company",
    origin: "local",
  };
}

const localCompanyTasks: ScopedTask[] = [
  localCompanyTask(
    "premises",
    "Confirm the premises route",
    "Ask the licensing authority whether this licence route needs a physical address and which tenancy evidence it accepts before signing a lease.",
    "premises",
  ),
  localCompanyTask(
    "licensing",
    "Secure the Abu Dhabi licence",
    "Confirm the suitable licence route and submit the company registration documents to the relevant authority.",
    "licensing",
  ),
  localCompanyTask(
    "establishment-card",
    "Obtain the establishment card",
    "After the licence is issued, ask ICP for the current establishment card requirements and submit the company documents.",
    "licensing",
    ["licensing"],
  ),
  localCompanyTask(
    "banking",
    "Open a company bank account",
    "Compare bank requirements and begin account opening with the issued company documents.",
    "banking",
    ["licensing"],
  ),
];

export function buildScopedTasks(plan: RelocationPlan, established: boolean): ScopedTask[] {
  const fixtureTasks: ScopedTask[] = plan.tasks.map((task) => ({
    ...task,
    layer: companyCategories.has(task.category) ? "company" : "people",
    origin: "fixture",
  }));
  const companyTasks = fixtureTasks.filter((task) => task.layer === "company");
  const peopleTasks = fixtureTasks.filter((task) => task.layer === "people");

  if (established) return peopleTasks;
  return [...(companyTasks.length > 0 ? companyTasks : localCompanyTasks), ...peopleTasks];
}

export function blockingTasks(
  task: ScopedTask,
  tasks: ScopedTask[],
  completed: ReadonlySet<string>,
): ScopedTask[] {
  const prerequisites = new Set(task.dependsOn);
  if (task.layer === "people" && tasks.some((item) => item.layer === "company")) {
    tasks.filter((item) => item.layer === "company").forEach((item) => prerequisites.add(item.id));
  }
  return tasks.filter((item) => prerequisites.has(item.id) && !completed.has(item.id));
}
