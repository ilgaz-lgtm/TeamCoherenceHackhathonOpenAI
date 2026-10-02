import type { BlockingContext, ScopedTask } from "./scope";
import { taskState } from "./workspace";

const priority: Readonly<Record<string, number>> = {
  "family-documents": 0,
  "family-records": 0,
  "partner-route": 1,
  visa: 2,
  "founder-residence": 2,
  insurance: 3,
  "family-insurance": 3,
  "family-school": 4,
  school: 4,
  "family-home-shortlist": 5,
  "housing-search": 5,
  "employee-entry": 6,
  "founder-entry": 6,
  "residency-completion": 7,
  "family-sponsorship": 8,
  "family-entry": 8,
  "partner-residence": 8,
  "family-home": 9,
  housing: 5,
  "housing-tenancy": 9,
  "family-travel": 10,
  "family-residence": 11,
  "home-utilities": 12,
};

export function stepTitle(task: Pick<ScopedTask, "id" | "title">): string {
  const titles: Readonly<Record<string, string>> = {
    "family-documents": "Prepare family documents", "family-records": "Prepare family documents",
    "partner-route": "Confirm your partner's visa route", visa: "Get your entry permission",
    "founder-residence": "Get your entry permission", "family-school": "Secure a school place", school: "Secure a school place",
    "family-home-shortlist": "Find your home", "founder-entry": "Travel to Abu Dhabi", "employee-entry": "Travel to Abu Dhabi",
    "residency-completion": "Medical, residence and Emirates ID", "family-entry": "Get your family's entry permissions",
    "family-sponsorship": "Get your family's entry permissions", "family-travel": "Bring your family to Abu Dhabi",
    "family-residence": "Complete your family's residence", "home-utilities": "Connect utilities and mobile",
    settling: "Connect utilities and mobile",
  };
  if (task.id === "housing") return task.title === "Confirm employer housing" ? "Confirm your provided home" : "Find your home";
  if (task.id === "housing-tenancy") return task.title === "Obtain registered tenancy evidence" ? "Get your registered tenancy record" : "Sign and register your lease";
  if (task.id === "travel" && task.title === "Arrange remaining household arrivals") return "Bring your family to Abu Dhabi";
  return titles[task.id] ?? task.title;
}

export function stepPhase(task: ScopedTask): string {
  if (task.layer === "company") return "Company setup";
  if (task.layer === "team") return "First hires";
  if (["founder-entry", "employee-entry"].includes(task.id)) return "Your arrival";
  if (task.id === "residency-completion") return "After you land";
  if (["family-entry", "family-sponsorship", "partner-residence"].includes(task.id)) return "Before family travel";
  if (["family-travel", "travel"].includes(task.id)) return "Family arrival";
  if (task.id === "family-residence") return "After family arrival";
  if (["family-home", "housing-tenancy", "home-utilities", "settling"].includes(task.id)) return "Home & settling";
  return "Before you travel";
}

export function orderedSteps(tasks: readonly ScopedTask[]): ScopedTask[] {
  const remaining = tasks.map((task, index) => ({ task, index }));
  const included = new Set(tasks.map((task) => task.id));
  const ordered: ScopedTask[] = [];
  const placed = new Set<string>();
  while (remaining.length) {
    const eligible = remaining.filter(({ task }) => task.dependsOn.every((id) => !included.has(id) || placed.has(id)));
    eligible.sort((a, b) => (priority[a.task.id] ?? 100) - (priority[b.task.id] ?? 100) || a.index - b.index);
    const next = eligible[0];
    if (!next) throw new Error("The step sequence contains a dependency cycle.");
    ordered.push(next.task);
    placed.add(next.task.id);
    remaining.splice(remaining.indexOf(next), 1);
  }
  return ordered;
}

export function currentStep(steps: readonly ScopedTask[], all: ScopedTask[], completed: ReadonlySet<string>, waiting: ReadonlySet<string>, external: BlockingContext[] = []): ScopedTask | undefined {
  const unfinished = steps.filter((task) => !completed.has(task.id));
  return unfinished.find((task) => !waiting.has(task.id) && taskState(task, all, completed, external).status !== "blocked")
    ?? unfinished.find((task) => waiting.has(task.id) && taskState(task, all, completed, external).status !== "blocked")
    ?? unfinished[0];
}

export function validWaiting(tasks: readonly ScopedTask[], completed: ReadonlySet<string>, saved: readonly string[]): Set<string> {
  return new Set(saved.filter((id) => tasks.some((task) => task.id === id) && !completed.has(id)));
}
