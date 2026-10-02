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

  assert.equal(founderTasks.length, 25);
  assert.deepEqual(
    ["company", "self", "team"].map((layer) => founderTasks.filter((task) => task.layer === layer).length),
    [12, 7, 6],
  );
  assert.equal(employeeTasks.length, 6);
  assert.ok(employeeTasks.every((task) => task.layer === "people" && task.origin === "fixture"));
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
  assert.ok(!employeeTasks.some((task) => founderIds.has(task.id)));
});

test("layer A gates the founder's move and first hires", () => {
  const tasks = buildFounderTasks(founderDemo);
  const home = tasks.find((task) => task.id === "family-home")!;
  const permits = tasks.find((task) => task.id === "employee-permits")!;
  const companyIds = tasks.filter((task) => task.layer === "company").map((task) => task.id);
  const selfIds = tasks.filter((task) => task.layer === "self").map((task) => task.id);

  assert.ok(blockingTasks(home, tasks, new Set()).some((task) => task.id === "licence"));
  assert.ok(blockingTasks(permits, tasks, new Set()).some((task) => task.id === "founder-residence"));
  assert.ok(blockingTasks(home, tasks, new Set(companyIds)).every((task) => task.layer === "self"));
  assert.ok(blockingTasks(permits, tasks, new Set([...companyIds, ...selfIds])).every((task) => task.layer === "team"));
});

test("optional founder answers narrow the same persona without creating a third one", () => {
  const tasks = buildFounderTasks({ ...founderDemo, relocatingSelf: false, movingWithSpouse: false, movingWithChild: false });
  assert.ok(tasks.every((task) => task.layer !== "self"));
  assert.ok(tasks.some((task) => task.layer === "team"));
  assert.equal(buildFounderTasks({ ...founderDemo, premisesNeed: "none" }).some((task) => task.category === "premises"), false);
});

test("employee companion answers remove the school task and family-record action", () => {
  const solo = buildEmployeeTasks(
    employeePlan,
    { ...employeeAnswers, movingWithSpouse: false, movingWithChild: false },
    demoCompany,
    demoEmployee,
  );
  assert.ok(!solo.some((task) => task.id === "school"));
  assert.doesNotMatch(solo.find((task) => task.id === "visa")!.description, /family/);
});

test("rationales cover every rendered task, keep distinct role voice, and honor authored text", () => {
  const founderTasks = buildFounderTasks(founderDemo);
  const employeeTasks = buildEmployeeTasks(employeePlan, employeeAnswers, demoCompany, demoEmployee);
  const founderContext = { viewerRole: "founder" as const, answers: founderDemo };
  const employeeContext = { viewerRole: "employee" as const, answers: employeeAnswers, company: demoCompany, employee: demoEmployee };
  const founderCopy = founderTasks.map((task) => rationaleForTask(task, founderContext));
  const employeeCopy = employeeTasks.map((task) => rationaleForTask(task, employeeContext));
  assert.deepEqual(Object.keys(founderRationaleByTaskId(founderDemo)).sort(), founderTasks.map((task) => task.id).sort());
  assert.deepEqual(Object.keys(employeeRationaleByTaskId(employeeAnswers, demoCompany, demoEmployee)).sort(), employeeTasks.map((task) => task.id).sort());

  for (const rationale of [...founderCopy, ...employeeCopy]) {
    assert.ok(rationale.length < 220, rationale);
    assert.match(rationale, /\b(?:you|your)\b/i);
    assert.match(rationale, /\b(?:ADDED|ICP|MOHRE|seven|nine|two|thirty|eight|Obtain establishment card|Secure family home)\b|\d/i);
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
