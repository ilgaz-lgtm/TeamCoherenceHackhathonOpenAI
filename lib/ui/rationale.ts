import type { Company, Employee } from "@/types/relocation";
import { formatAed } from "@/lib/ui/format";
import type { ScopedTask, TaskCategory } from "@/lib/ui/scope";

type RationaleContext = {
  company: Company;
  employee: Employee;
  established: boolean;
};

function startDay(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

// Fixture IDs remain the source of truth; this map supplies copy until rationale enters the schema.
export function rationaleByTaskId({ company, employee, established }: RationaleContext): Record<string, string> {
  const start = startDay(employee.startDate);
  const child = employee.family.find((member) => member.relationship === "child");
  const stay = company.policy.temporaryAccommodationDays;
  const sponsored = company.policy.visaSponsorship;

  return {
    visa: sponsored
      ? established
        ? `Your ${start} start is not an entry clearance date; the sponsored visa outcome controls when your family can travel.`
        : `Your residence visa file waits on the establishment card, which ICP issues after a valid licence, so your ${start} start alone cannot set your family's arrival.`
      : `Your ${start} start is not an immigration clearance date, and without employer sponsorship HR must confirm which route could bring your family.`,
    travel: sponsored && !established
      ? `The establishment card holds your visa task, so your ${stay}-day temporary stay may need to shift beyond ${start}.`
      : `The visa task can move your ${stay}-day temporary stay, so booking only against ${start} could waste part of that allowance.`,
    housing: `Your ${employee.preferences.maxCommuteMinutes}-minute commute to ${company.policy.officeLocation} puts some ${employee.preferences.bedrooms}-bedroom homes outside reach even if they fit the ${formatAed(company.policy.housingAllowanceAED)} cap.`,
    insurance: child
      ? `Your ${child.age}-year-old dependant ${child.name} moves with you, so the employee cover start date does not settle when dependant cover begins.`
      : employee.family.length > 0
        ? `Your ${start} move includes a dependant, so the employee cover start date does not settle when their cover begins.`
        : `Your ${start} arrival may precede your first workday, so HR needs to check whether employee cover starts before that gap.`,
    settling: `Your ${start} arrival gives utility activation a deadline, while Shortlist suitable housing determines the address providers will use.`,
    school: child
      ? `${child.name} is ${child.age}, and your ${formatAed(company.policy.schoolAllowanceAED)} school allowance may not cover every available seat, so admissions can change which area works.`
      : `Your ${formatAed(company.policy.schoolAllowanceAED)} school allowance is recorded without a child in this case, so HR needs to confirm why admissions work was added.`,
    licensing: sponsored
      ? `ICP requires a valid licence before issuing your establishment card, so your employee's ${start} sponsorship timetable starts here.`
      : `Your ${start} move is tied to a company without an Abu Dhabi licence, so its setup dates must be settled before employer arrangements can be confirmed.`,
    premises: sponsored
      ? `Your ${start} sponsorship timetable can slip if an unaccepted lease has to be replaced before licensing can finish.`
      : `Your ${start} move may be disrupted if the employer must replace an unaccepted lease before it can operate from Abu Dhabi.`,
    "establishment-card": sponsored
      ? `A valid licence is ICP's input for your establishment card, which then supports the employee sponsorship file for ${start}.`
      : `ICP needs a valid licence before issuing your company's establishment card; your ${start} move needs HR to confirm whether that employer route applies.`,
    banking: `Your ${formatAed(company.policy.flightAllowanceAED)} flight allowance needs an employer payment route, so account setup affects when travel can be reimbursed.`,
  };
}

const canonicalIdByCategory: Partial<Record<TaskCategory, string>> = {
  visa: "visa",
  travel: "travel",
  housing: "housing",
  insurance: "insurance",
  settling: "settling",
  school: "school",
  licensing: "licensing",
  premises: "premises",
  banking: "banking",
};

export function rationaleForTask(task: ScopedTask, context: RationaleContext): string {
  const authored = task.rationale?.trim();
  if (authored) return authored;

  const fallback = rationaleByTaskId(context);
  const canonicalId = canonicalIdByCategory[task.category];
  return fallback[task.id] ?? (canonicalId ? fallback[canonicalId] : undefined) ??
    `Your ${startDay(context.employee.startDate)} start makes this task's completion date a scheduling input for HR and dependent bookings.`;
}
