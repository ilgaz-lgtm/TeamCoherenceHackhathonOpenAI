import type { Company, Employee, RelocationPlan, RelocationTask } from "@/types/relocation";
import type { EmployeeAnswers } from "@/lib/ui/personas";
import { childLabel } from "./personas";
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

function listPeople(names: string[]): string {
  if (names.length < 2) return names[0] ?? "your household";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

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
  const children = employee.family.filter((member) => member.relationship === "child");
  const hasFamily = answers.movingWithSpouse || answers.movingWithChild;
  const sponsoredPartner = answers.movingWithSpouse && answers.partnerSponsorship === "spouse";
  const separatePartner = answers.movingWithSpouse && !sponsoredPartner;
  const hasSponsoredFamily = sponsoredPartner || answers.movingWithChild;
  const partnerName = spouse?.name.trim() || (sponsoredPartner ? "your spouse" : "your partner");
  const childNames = children.map((member) => member.name.trim() || "your child");
  const childName = childNames.length > 0 ? childNames.join(" and ") : (answers.childAges?.length ?? 0) > 1 ? "your children" : "your child";
  const schoolChildren = childLabel(children.length > 1 ? "your children" : childName, undefined, answers.childAges ?? children.map((member) => member.age));
  const officeLocation = company.policy.officeLocation === "Not provided" ? "your work location" : company.policy.officeLocation;
  const homeSize = employee.preferences.bedrooms > 0 ? `${employee.preferences.bedrooms}-bedroom homes` : "homes with a bedroom count you confirm";
  const commute = answers.maxCommuteMinutes > 0 ? `within ${answers.maxCommuteMinutes} minutes of ${officeLocation}` : `around ${officeLocation} after confirming your commute limit`;
  const sponsoredNames = listPeople([
    ...(sponsoredPartner ? [partnerName] : []),
    ...(answers.movingWithChild ? childNames.length > 0 ? childNames : [childName] : []),
  ]);
  const companionNames = [
    ...(answers.movingWithSpouse ? [partnerName] : []),
    ...(answers.movingWithChild ? childNames.length > 0 ? childNames : [childName] : []),
  ];
  const covered = listPeople(["you", ...companionNames]);
  const descriptions: Record<string, string> = {
    visa: "Prepare your identity records for the employer-sponsored entry-permit application; track ICP approval before booking travel.",
    travel: `${company.policy.flightAllowanceAED > 0
      ? `Book flights within ${formatAed(company.policy.flightAllowanceAED)}`
      : "Confirm your flight allowance or budget with your employer before booking"} and ${company.policy.temporaryAccommodationDays > 0
      ? `reserve ${company.policy.temporaryAccommodationDays} days of temporary accommodation`
      : "confirm how many days of temporary accommodation your employer provides"} after each traveller's entry permission is recorded.`,
    housing: answers.housingArrangement === "provided"
      ? "Confirm the provided address and move-in date with your employer."
      : answers.housingArrangement === "no"
        ? `Set a rent budget from salary, then shortlist ${homeSize} ${commute}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`
        : company.policy.housingAllowanceAED > 0
          ? `Shortlist ${homeSize} within ${formatAed(company.policy.housingAllowanceAED)} annually, ${commute}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`
          : `Confirm your annual housing allowance with your employer, then shortlist ${homeSize} ${commute}.${answers.preferredArea.trim() ? ` Start with ${answers.preferredArea.trim()}.` : ""}`,
    insurance: `Record the employer policy's effective health-cover dates for ${covered} before arrival.`,
    settling: "Use the signed residential tenancy to open utility and telecom accounts at your home address.",
    school: `Confirm placement and admission eligibility for ${schoolChildren} from their records and ${company.policy.schoolAllowanceAED > 0
      ? `compare tuition with the ${formatAed(company.policy.schoolAllowanceAED)} school allowance`
      : "confirm any school allowance with your employer"}.`,
  };

  const tasks = plan.tasks
    .filter((task) => !companyCategories.has(task.category))
    .filter((task) => task.category !== "school" || answers.movingWithChild)
    .map((task) => ({
      ...task,
      title: task.id === "visa" ? "Obtain entry permit"
        : task.id === "travel" && hasFamily ? "Arrange remaining household arrivals"
        : task.id === "housing" && answers.housingArrangement === "provided" ? "Confirm employer housing"
        : task.id === "housing" ? "Shortlist suitable housing"
        : task.id === "insurance" && !answers.movingWithSpouse && !answers.movingWithChild ? "Confirm health coverage"
          : task.title,
      description: descriptions[task.id] ?? task.description,
      dependsOn: task.id === "settling" ? ["housing-tenancy"]
        : task.id === "travel" ? ["visa", ...(hasSponsoredFamily ? ["family-entry"] : []), ...(separatePartner ? ["partner-route"] : [])]
        : task.id === "housing" || task.id === "school" ? [] : task.dependsOn,
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
            "After your own arrival, confirm and complete any remaining medical, Emirates ID and residence steps with your employer and ICP.",
            "visa",
            "people",
            ["employee-entry"],
          ),
          rationale: "ICP entry approval does not complete your later residence process; confirm each remaining step with your employer after arrival.",
        };
        const ownEntry: ScopedTask = {
          ...localTask(
            "employee-entry",
            "Arrange your own entry and arrival",
            hasFamily
              ? "Use your issued entry permit to arrange and record your own arrival. Confirm whether dependants must arrive later while you complete residence steps."
              : "After arranging flights, use your issued entry permit to enter and record your own arrival before completing residence steps.",
            "travel",
            "people",
            hasFamily ? ["visa"] : ["visa", "travel"],
          ),
          rationale: hasFamily
            ? "ICP entry permission can clear your own arrival before family travel when sponsorship needs completed residence; confirm the sequence with your employer."
            : "ICP entry permission and booked flights do not record your arrival; confirm entry before completing the later residence steps.",
        };
        if (!hasFamily) return [task, ownEntry, residence];
        const familyRecords: ScopedTask = {
          ...localTask(
            "family-records",
            "Gather family residence records",
            `Gather identity records for ${listPeople(companionNames)}${hasSponsoredFamily ? ` and relationship records for ${sponsoredNames}` : ""}; confirm ICP's accepted document checklist and any partner eligibility still to resolve.`,
            "visa",
            "people",
          ),
          rationale: "Prepare your family records while ICP handles your own permit; preparation does not complete their residence files.",
        };
        const householdTasks: ScopedTask[] = [task, familyRecords, ownEntry, residence];
        if (hasSponsoredFamily) {
          householdTasks.push({
            ...localTask(
              "family-entry",
              "Confirm family sponsorship and entry permissions",
              `Confirm sponsorship eligibility and the permitted entry route for ${sponsoredNames} with your employer and ICP; record each issued entry permission before their travel.`,
              "visa",
              "people",
              ["residency-completion", "family-records"],
            ),
            rationale: "Confirm your sponsored family's eligible route and each ICP entry decision before travel; your own permit does not clear theirs.",
          });
          const familyResidence: ScopedTask = {
            ...localTask(
              "family-residence",
              "Complete family residence files",
              `After ${sponsoredNames} arrive, confirm and complete their remaining residence requirements with your employer and ICP.`,
              "visa",
              "people",
              ["residency-completion", "family-entry", "travel"],
            ),
            rationale: "Your family's ICP residence files need their own decisions after your residence route is settled; your entry permit does not complete theirs.",
          };
          householdTasks.push(familyResidence);
        }
        if (separatePartner) {
          householdTasks.push({
            ...localTask(
              "partner-route",
              answers.partnerSponsorship === "independent" ? "Confirm partner independent entry route" : "Resolve partner eligibility and entry route",
              answers.partnerSponsorship === "independent"
                ? `Confirm ${partnerName}'s independent entry route and record their issued entry permission with ICP before booking their travel.`
                : `Review ${partnerName}'s identity and relationship documents with ICP, resolve sponsorship eligibility or an independent route, and record their entry permission before booking travel.`,
              "visa",
              "people",
              ["family-records", ...(answers.partnerSponsorship === "independent" ? [] : ["residency-completion"])],
            ),
            rationale: "Resolve your partner's eligible ICP route and entry permission; a partner answer alone does not establish spouse sponsorship.",
          }, {
            ...localTask(
              "partner-residence",
              "Complete partner residence route",
              `After ${partnerName} arrives, confirm and complete the remaining residence steps for their resolved route with ICP.`,
              "visa",
              "people",
              ["partner-route", "travel"],
            ),
            rationale: "ICP entry clearance and the later residence outcome are separate decisions under your partner's confirmed route.",
          });
        }
        return householdTasks;
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
            ["housing", ...(answers.movingWithChild && answers.housingArrangement !== "provided" ? ["school"] : [])],
          ),
          rationale: answers.housingArrangement === "provided"
            ? "Your 'Confirm employer housing' task settles the address; registered tenancy evidence is still needed before you open home services."
            : "The 'Shortlist suitable housing' task selects your candidates; a signed, registered tenancy supplies the address record for home services.",
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
