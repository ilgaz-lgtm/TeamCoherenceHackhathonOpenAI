import { test } from "node:test";
import assert from "node:assert/strict";
import { demoCompany, demoEmployee, demoRelocation } from "../lib/demo/data";
import { buildFounderTasks } from "../lib/ui/founder-plan";
import { employeeAnswersFromFixture, founderDemo } from "../lib/ui/personas";
import { employeeRationaleByTaskId, founderRationaleByTaskId, rationaleForTask } from "../lib/ui/rationale";
import { blockingTasks, buildEmployeeBlockingContext, buildEmployeeTasks, companyIsEstablished } from "../lib/ui/scope";
import type { ScopedTask } from "../lib/ui/scope";

const employeeAnswers = employeeAnswersFromFixture(demoCompany, demoEmployee);
const employeePlan = demoRelocation.plan;

test("founder and employee get distinct task graphs", () => {
  const founderTasks = buildFounderTasks(founderDemo);
  const employeeTasks = buildEmployeeTasks(employeePlan, employeeAnswers, demoCompany, demoEmployee);

  assert.ok(founderTasks.length >= 31);
  assert.deepEqual(
    ["company", "self", "team"].map((layer) => founderTasks.filter((task) => task.layer === layer).length),
    [13, 12, 6],
  );
  assert.ok(employeeTasks.length >= 12);
  assert.ok(employeeTasks.every((task) => task.layer === "people"));
  assert.ok(employeeTasks.every((task) => task.dueDate === null));
  assert.deepEqual(
    employeeTasks.filter((task) => task.origin === "local").map((task) => task.id),
    ["family-records", "employee-entry", "residency-completion", "family-entry", "family-residence", "housing-tenancy"],
  );
  assert.ok(employeeTasks.every((task) => !/ask HR|confirm with HR/i.test(task.description)));
  assert.ok(founderTasks.every((task) => task.origin === "local"));

  for (const tasks of [founderTasks, employeeTasks]) {
    const ids = new Set(tasks.map((task) => task.id));
    assert.equal(ids.size, tasks.length);
    for (const task of tasks) {
      assert.ok(task.dependsOn.every((id) => ids.has(id)), `Missing dependency for ${task.id}`);
    }
  }

  const founderIds = new Set(founderTasks.map((task) => task.id));
  assert.ok(founderIds.has("licence") && founderIds.has("establishment-card") && founderIds.has("employee-permits"));
  const companyIds = new Set(founderTasks.filter((task) => task.layer === "company").map((task) => task.id));
  assert.ok(!employeeTasks.some((task) => companyIds.has(task.id)));
});

test("only named dependencies block founder tasks", () => {
  const tasks = buildFounderTasks(founderDemo);
  const blockers = (id: string, completed: ReadonlySet<string> = new Set()) => {
    const task = tasks.find((item) => item.id === id)!;
    return blockingTasks(task, tasks, completed).map((item) => item.id).sort();
  };

  for (const id of ["family-documents", "family-school", "family-insurance", "first-hire-roles"]) {
    assert.deepEqual(blockers(id), [], `${id} is preparatory work`);
  }
  assert.deepEqual(blockers("family-home"), ["family-home-shortlist", "family-school"]);
  assert.deepEqual(blockers("founder-residence"), ["establishment-card"]);
  assert.deepEqual(blockers("corporate-tax-review"), ["establishment-card"]);
  assert.deepEqual(blockers("family-sponsorship"), ["family-documents", "residency-completion"]);
  assert.deepEqual(blockers("family-travel"), ["family-sponsorship", "founder-residence"]);
  assert.deepEqual(blockers("work-permit-quota"), ["establishment-card"]);
  assert.deepEqual(blockers("offers-contracts"), ["first-hire-roles"]);
  assert.deepEqual(blockers("employee-permits"), ["establishment-card", "offers-contracts", "work-permit-quota"]);
  assert.deepEqual(blockers("employee-permits", new Set(["establishment-card", "offers-contracts"])), ["work-permit-quota"]);
  assert.deepEqual(blockers("employee-arrivals"), ["employee-permits"]);
});

test("founder corporate tax review appears once after the establishment card", () => {
  const tasks = buildFounderTasks(founderDemo);
  const reviews = tasks.filter((task) => task.id === "corporate-tax-review");
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].category, "tax");
  assert.match(reviews[0].description, /FTA.*if applicable/);
  assert.doesNotMatch(reviews[0].description, /AED|\b\d+\b/);
});

test("generic food businesses receive food approvals without coffee-specific tasks", () => {
  const tasks = buildFounderTasks({ ...founderDemo, businessType: "Food and beverage business", businessName: "Harbour Foods" });
  assert.ok(tasks.some((task) => task.id === "food-approvals"));
  assert.ok(tasks.find((task) => task.id === "licence")!.dependsOn.includes("food-approvals"));
  assert.ok(tasks.every((task) => !/coffee|roast|café|cafe/i.test(task.description)));
});

test("founder tasks use supplied spouse and child details", () => {
  const tasks = buildFounderTasks({ ...founderDemo, spouseName: "Amir", childName: "Nadia", childAge: 10 });
  assert.match(tasks.find((task) => task.id === "family-sponsorship")!.description, /Amir and Nadia/);
  assert.match(tasks.find((task) => task.id === "family-school")!.description, /10-year-old Nadia/);
  assert.match(tasks.find((task) => task.id === "family-home")!.description, /Nadia's school/);
  assert.match(tasks.find((task) => task.id === "family-insurance")!.description, /Amir and Nadia/);
  assert.match(tasks.find((task) => task.id === "family-documents")!.description, /Nadia/);
  assert.match(tasks.find((task) => task.id === "family-documents")!.description, /Amir/);
});

test("optional founder answers narrow the same persona without creating a third one", () => {
  const tasks = buildFounderTasks({ ...founderDemo, relocatingSelf: false, movingWithSpouse: false, movingWithChild: false });
  assert.ok(tasks.every((task) => task.layer !== "self"));
  assert.ok(tasks.some((task) => task.layer === "team"));
  assert.equal(buildFounderTasks({ ...founderDemo, premisesNeed: "none" }).some((task) => task.category === "premises"), false);
});

test("a founder with a confirmed licence and card sees only the people layer", () => {
  const tasks = buildFounderTasks({ ...founderDemo, isEstablishedInUAE: true, establishmentCardReady: true, headcountYearOne: 0 });
  const ids = new Set(tasks.map((task) => task.id));
  assert.ok(tasks.length > 0);
  assert.ok(tasks.every((task) => task.layer === "self"));
  assert.ok(tasks.every((task) => task.dependsOn.every((id) => ids.has(id))));
});

test("employee companion answers remove the school task and family-record action", () => {
  const solo = buildEmployeeTasks(
    employeePlan,
    { ...employeeAnswers, movingWithSpouse: false, movingWithChild: false },
    demoCompany,
    demoEmployee,
  );
  assert.ok(!solo.some((task) => task.id === "school"));
  assert.ok(!solo.some((task) => task.id === "family-residence"));
  assert.ok(!solo.some((task) => task.id === "family-records"));
  assert.doesNotMatch(solo.find((task) => task.id === "visa")!.description, /family/);
});

test("entry-permit approval leaves residence and family files pending", () => {
  const provided = buildEmployeeTasks(
    employeePlan,
    { ...employeeAnswers, visaStage: "approved", housingArrangement: "provided" },
    demoCompany,
    demoEmployee,
  );
  assert.equal(provided.find((task) => task.id === "visa")?.status, "completed");
  assert.equal(provided.find((task) => task.id === "residency-completion")?.status, "pending");
  assert.equal(provided.find((task) => task.id === "family-records")?.status, "pending");
  assert.equal(provided.find((task) => task.id === "family-residence")?.status, "pending");
  const completed = new Set(provided.filter((task) => task.status === "completed").map((task) => task.id));
  assert.deepEqual(blockingTasks(provided.find((task) => task.id === "employee-entry")!, provided, completed), []);
  assert.deepEqual(blockingTasks(provided.find((task) => task.id === "residency-completion")!, provided, completed).map((task) => task.id), ["employee-entry"]);
  assert.deepEqual(blockingTasks(provided.find((task) => task.id === "family-records")!, provided, completed), []);
  assert.deepEqual(
    blockingTasks(provided.find((task) => task.id === "family-residence")!, provided, completed).map((task) => task.id).sort(),
    ["family-entry", "residency-completion", "travel"],
  );
  assert.deepEqual(blockingTasks(provided.find((task) => task.id === "travel")!, provided, completed).map((task) => task.id), ["family-entry"]);
  assert.equal(provided.find((task) => task.id === "housing")?.title, "Confirm employer housing");
  assert.doesNotMatch(provided.find((task) => task.id === "housing")!.description, /Shortlist|AED/);
  assert.match(provided.find((task) => task.id === "housing-tenancy")!.description, /registered residential tenancy/);
  assert.doesNotMatch(provided.find((task) => task.id === "housing-tenancy")!.description, /Sign the chosen/);

  const salaryFunded = buildEmployeeTasks(
    employeePlan,
    { ...employeeAnswers, housingArrangement: "no" },
    demoCompany,
    demoEmployee,
  );
  assert.doesNotMatch(salaryFunded.find((task) => task.id === "housing")!.description, /allowance|AED/);
});

test("shortlisting cannot unlock household services without tenancy evidence", () => {
  const tasks = buildEmployeeTasks(employeePlan, employeeAnswers, demoCompany, demoEmployee);
  const settling = tasks.find((task) => task.id === "settling")!;
  const tenancy = tasks.find((task) => task.id === "housing-tenancy")!;
  assert.deepEqual(settling.dependsOn, ["housing-tenancy"]);
  assert.deepEqual(tenancy.dependsOn, ["housing", "school"]);
  assert.deepEqual(blockingTasks(settling, tasks, new Set(["housing"])).map((task) => task.id), ["housing-tenancy"]);
  assert.deepEqual(blockingTasks(settling, tasks, new Set(["housing", "housing-tenancy"])), []);
});

test("unknown employer policy figures and absent family names stay explicit", () => {
  const company = {
    ...demoCompany,
    policy: {
      ...demoCompany.policy,
      housingAllowanceAED: 0,
      flightAllowanceAED: 0,
      schoolAllowanceAED: 0,
      temporaryAccommodationDays: 0,
      officeLocation: "Not provided",
    },
  };
  const employee = { ...demoEmployee, family: [] };
  const tasks = buildEmployeeTasks(employeePlan, employeeAnswers, company, employee);
  for (const task of tasks) assert.doesNotMatch(task.description, /AED\s*0\b|\b0 days\b|\bNot provided\b/);
  assert.match(tasks.find((task) => task.id === "travel")!.description, /Confirm your flight allowance or budget/);
  assert.match(tasks.find((task) => task.id === "travel")!.description, /confirm how many days/);
  assert.match(tasks.find((task) => task.id === "housing")!.description, /Confirm your annual housing allowance/);
  assert.match(tasks.find((task) => task.id === "school")!.description, /your 8-year-old child.*confirm any school allowance/);
  assert.ok(tasks.findIndex((task) => task.id === "school") < tasks.findIndex((task) => task.id === "housing"));
  assert.match(tasks.find((task) => task.id === "insurance")!.description, /your spouse and your child/);
  assert.match(tasks.find((task) => task.id === "family-residence")!.description, /your spouse and your child/);
});

test("a moving child still receives school planning when the fixture lacks a child record", () => {
  const plan = { ...employeePlan, tasks: employeePlan.tasks.filter((task) => task.id !== "school") };
  const employee = { ...demoEmployee, family: [] };
  const tasks = buildEmployeeTasks(plan, { ...employeeAnswers, childAges: undefined }, demoCompany, employee);
  const school = tasks.find((task) => task.id === "school")!;
  assert.equal(school.origin, "local");
  assert.match(school.description, /your child/);
  assert.ok(tasks.findIndex((task) => task.id === "school") < tasks.findIndex((task) => task.id === "housing"));
  assert.deepEqual(blockingTasks(school, tasks, new Set()), []);
});

test("rationales cover every rendered task, keep distinct role voice, and honor authored text", () => {
  const founderTasks = buildFounderTasks(founderDemo);
  const employeeTasks = buildEmployeeTasks(employeePlan, employeeAnswers, demoCompany, demoEmployee);
  const founderContext = { viewerRole: "founder" as const, answers: founderDemo };
  const employeeContext = { viewerRole: "employee" as const, answers: employeeAnswers, company: demoCompany, employee: demoEmployee };
  const founderCopy = founderTasks.map((task) => rationaleForTask(task, founderContext));
  const employeeCopy = employeeTasks.map((task) => rationaleForTask(task, employeeContext));
  const founderRationales = founderRationaleByTaskId(founderDemo);
  assert.ok(founderTasks.every((task) => task.rationale || founderRationales[task.id]));
  const employeeRationales = employeeRationaleByTaskId(employeeAnswers, demoCompany, demoEmployee);
  assert.ok(employeeTasks.filter((task) => task.origin === "fixture").every((task) => employeeRationales[task.id]));
  assert.ok(employeeTasks.filter((task) => task.origin === "local").every((task) => task.rationale || employeeRationales[task.id]));

  for (const rationale of [...founderCopy, ...employeeCopy]) {
    assert.ok(rationale.length < 220, rationale);
    assert.match(rationale, /\b(?:you|your)\b/i);
  }
  for (const rationale of [...founderCopy, ...employeeCopy]) {
    const namedTask = [...founderTasks, ...employeeTasks].some((task) => rationale.toLowerCase().includes(task.title.toLowerCase()));
    assert.ok(namedTask || /\b(?:ADDED|ICP|MOHRE|FTA|ADREC|ADEK|seven|nine|two|thirty|eight)\b|\d/i.test(rationale), rationale);
  }
  assert.ok(founderCopy.every((copy) => !/\b(?:HR|allowance|Alex Morgan)\b/i.test(copy)));
  assert.ok(employeeCopy.every((copy) => !/\b(?:Maya|Haddad)\b/i.test(copy)));
  assert.ok([...founderCopy, ...employeeCopy].filter((copy) => /^Because you\b/i.test(copy)).length <= 10);

  const authored: ScopedTask = { ...employeeTasks[0], rationale: "ICP has already cleared your sponsorship file." };
  assert.equal(rationaleForTask(authored, employeeContext), authored.rationale);
  assert.throws(() => rationaleForTask({ ...employeeTasks[0], id: "unknown" }, employeeContext), /Missing employee rationale/);
});

test("an unestablished employer appears as blocking context, never as employee-owned tasks", () => {
  assert.equal(companyIsEstablished(demoCompany), true);
  assert.equal(buildEmployeeBlockingContext(demoCompany, employeePlan).length, 0);
  const unestablishedCompany = { ...demoCompany, isEstablishedInUAE: false };
  assert.equal(companyIsEstablished(unestablishedCompany), false);
  assert.ok(buildEmployeeBlockingContext(unestablishedCompany, employeePlan).some((task) => task.id === "employer-card"));
  assert.ok(buildEmployeeTasks(employeePlan, employeeAnswers, demoCompany, demoEmployee).every((task) => task.layer === "people"));
});
