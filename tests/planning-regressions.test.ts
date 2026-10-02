import assert from "node:assert/strict";
import { test } from "node:test";
import { demoCompany, demoEmployee, demoRelocation } from "../lib/demo/data";
import { buildFounderTasks } from "../lib/ui/founder-plan";
import { childLabel, employeeAnswersFromFixture, founderDemo } from "../lib/ui/personas";
import type { PartnerSponsorship } from "../lib/ui/personas";
import { employeeRationaleByTaskId, founderRationaleByTaskId, rationaleForTask } from "../lib/ui/rationale";
import { blockingTasks, buildEmployeeTasks } from "../lib/ui/scope";
import type { ScopedTask } from "../lib/ui/scope";

const employeeAnswers = employeeAnswersFromFixture(demoCompany, demoEmployee);

function taskById(tasks: ScopedTask[], id: string): ScopedTask {
  const task = tasks.find((item) => item.id === id);
  assert.ok(task, `Expected ${id}`);
  return task;
}

function assertAnchoredRationale(copy: string): void {
  assert.ok(copy.length < 220, copy);
  assert.match(copy, /\b(?:you|your)\b/i);
  assert.match(copy, /\b(?:ADDED|ICP|MOHRE|FTA|ADREC|ADEK|DARI|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirty)\b|\d|Secure school placement|Secure family home|Shortlist suitable housing|Confirm employer housing|Sign and register home tenancy|Obtain registered tenancy evidence|Sequence household arrival/);
}

function assertValidGraph(tasks: ScopedTask[]): void {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  assert.equal(byId.size, tasks.length, "Task IDs must be unique");
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(id: string): void {
    assert.ok(!visiting.has(id), `Dependency cycle at ${id}`);
    if (visited.has(id)) return;
    const task = byId.get(id);
    assert.ok(task, `Missing dependency ${id}`);
    visiting.add(id);
    for (const dependency of task.dependsOn) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const task of tasks) visit(task.id);
}

test("an existing licence leaves the founder and staff blocked on an unverified card", () => {
  for (const establishmentCardReady of [undefined, false]) {
    const tasks = buildFounderTasks({ ...founderDemo, isEstablishedInUAE: true, establishmentCardReady });
    const card = taskById(tasks, "establishment-card");
    assert.equal(card.layer, "company");
    assert.deepEqual(card.dependsOn, []);
    assert.ok(!tasks.some((task) => task.id === "licence"));
    for (const id of ["founder-residence", "work-permit-quota", "employee-permits"]) {
      assert.ok(taskById(tasks, id).dependsOn.includes("establishment-card"));
      assert.ok(blockingTasks(taskById(tasks, id), tasks, new Set()).includes(card));
    }
    assertValidGraph(tasks);
  }
  const verified = buildFounderTasks({ ...founderDemo, isEstablishedInUAE: true, establishmentCardReady: true });
  assert.ok(!verified.some((task) => task.id === "establishment-card"));
  assert.ok(verified.every((task) => !task.dependsOn.includes("establishment-card")));
  assertValidGraph(verified);
});

test("a formation plan retains licence and card even if incompatible readiness was supplied", () => {
  const tasks = buildFounderTasks({ ...founderDemo, establishmentCardReady: true });
  assert.deepEqual(taskById(tasks, "establishment-card").dependsOn, ["licence"]);
  assertValidGraph(tasks);
});

test("independent partners are excluded from sponsored children files in both personas", () => {
  const founder = buildFounderTasks({ ...founderDemo, partnerSponsorship: "independent", spouseName: "Independent Partner", childName: "Dependent Child" });
  assert.match(taskById(founder, "partner-route").description, /Independent Partner.*independent/);
  assert.doesNotMatch(taskById(founder, "family-sponsorship").description, /Independent Partner/);
  assert.match(taskById(founder, "family-sponsorship").description, /Dependent Child/);
  assert.ok(taskById(founder, "family-travel").dependsOn.includes("partner-route"));
  assert.ok(taskById(founder, "family-travel").dependsOn.includes("family-sponsorship"));

  const employee = buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, partnerSponsorship: "independent" }, demoCompany, demoEmployee);
  for (const id of ["family-entry", "family-residence"]) {
    assert.match(taskById(employee, id).description, /Jamie/);
    assert.doesNotMatch(taskById(employee, id).description, /Sam/);
  }
  assert.ok(!taskById(employee, "partner-route").dependsOn.includes("residency-completion"));
  assert.deepEqual(taskById(employee, "travel").dependsOn, ["visa", "family-entry", "partner-route"]);
  assertValidGraph(founder);
  assertValidGraph(employee);
});

test("omitted partner status resolves documents and eligibility without asserting spouse sponsorship", () => {
  const founder = buildFounderTasks({ ...founderDemo, partnerSponsorship: undefined, movingWithChild: false, spouseName: "your partner" });
  const employee = buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, partnerSponsorship: undefined, movingWithChild: false }, demoCompany, demoEmployee);
  for (const tasks of [founder, employee]) {
    const route = taskById(tasks, "partner-route");
    assert.match(route.description, /identity and relationship documents.*eligibility.*independent route/);
    assert.doesNotMatch(route.description, /marriage|married|spouse/);
    assert.ok(!tasks.some((task) => ["family-sponsorship", "family-entry", "family-residence"].includes(task.id)));
    assertValidGraph(tasks);
  }
});

test("an employee's approved permit cannot clear family travel or later residence", () => {
  const tasks = buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, visaStage: "approved" }, demoCompany, demoEmployee);
  const completed = new Set(["visa"]);
  assert.deepEqual(blockingTasks(taskById(tasks, "employee-entry"), tasks, completed), []);
  assert.deepEqual(blockingTasks(taskById(tasks, "travel"), tasks, completed).map((task) => task.id), ["family-entry"]);
  assert.deepEqual(taskById(tasks, "residency-completion").dependsOn, ["employee-entry"]);
  assert.deepEqual(taskById(tasks, "family-entry").dependsOn, ["residency-completion", "family-records"]);
  assert.ok(taskById(tasks, "family-residence").dependsOn.includes("travel"));
  assert.ok(!taskById(tasks, "travel").dependsOn.includes("family-residence"));
  assert.equal(taskById(tasks, "family-residence").status, "pending");
  assertValidGraph(tasks);

  for (const id of ["employee-entry", "residency-completion", "family-records", "family-entry"]) completed.add(id);
  assert.deepEqual(blockingTasks(taskById(tasks, "travel"), tasks, completed), []);
  assert.deepEqual(blockingTasks(taskById(tasks, "family-residence"), tasks, completed).map((task) => task.id), ["travel"]);
});

test("founder entry clearance precedes actual arrival and final residence before family sponsorship", () => {
  const tasks = buildFounderTasks(founderDemo);
  const clearance = taskById(tasks, "founder-residence");
  assert.match(clearance.description, /completes on issued entry clearance/);
  assert.deepEqual(taskById(tasks, "founder-entry").dependsOn, ["founder-residence"]);
  assert.deepEqual(taskById(tasks, "residency-completion").dependsOn, ["founder-entry"]);
  assert.deepEqual(taskById(tasks, "family-sponsorship").dependsOn, ["residency-completion", "family-documents"]);
  assert.ok(taskById(tasks, "family-travel").dependsOn.includes("family-sponsorship"));
  assert.ok(!taskById(tasks, "family-travel").dependsOn.includes("family-residence"));
  assert.ok(taskById(tasks, "family-residence").dependsOn.includes("family-travel"));
  assertValidGraph(tasks);
  const solo = buildFounderTasks({ ...founderDemo, movingWithSpouse: false, movingWithChild: false });
  assert.deepEqual(taskById(solo, "family-travel").dependsOn, ["founder-residence"]);
  assert.deepEqual(taskById(solo, "founder-entry").dependsOn, ["founder-residence", "family-travel"]);
  assertValidGraph(solo);
});

test("school placement gates a binding tenancy while housing research remains available", () => {
  const founder = buildFounderTasks(founderDemo);
  assert.deepEqual(taskById(founder, "family-home-shortlist").dependsOn, []);
  assert.deepEqual(blockingTasks(taskById(founder, "family-home"), founder, new Set(["family-home-shortlist"])).map((task) => task.id), ["family-school"]);
  for (const housingArrangement of ["yes", "no", "provided"]) {
    const tasks = buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, housingArrangement }, demoCompany, demoEmployee);
    assert.deepEqual(taskById(tasks, "housing").dependsOn, []);
    assert.deepEqual(taskById(tasks, "school").dependsOn, []);
    assert.deepEqual(blockingTasks(taskById(tasks, "housing-tenancy"), tasks, new Set(["housing"])).map((task) => task.id), housingArrangement === "provided" ? [] : ["school"]);
    assert.deepEqual(taskById(tasks, "settling").dependsOn, ["housing-tenancy"]);
    assertValidGraph(tasks);
  }
});

test("plural children use every supplied age and unknown ages stay unknown", () => {
  const answers = { ...founderDemo, childName: "your children", childAge: 4, childAges: [4, 11] };
  assert.match(taskById(buildFounderTasks(answers), "family-school").description, /your children \(ages 4 and 11\)/);
  assert.match(founderRationaleByTaskId(answers)["family-school"], /your children \(ages 4 and 11\)/);
  const employee = { ...demoEmployee, family: [
    { name: "your child 1", relationship: "child" as const, age: 4 },
    { name: "your child 2", relationship: "child" as const, age: 11 },
  ] };
  const employeeOptions = { ...employeeAnswers, movingWithSpouse: false, childAges: [4, 11] };
  const tasks = buildEmployeeTasks(demoRelocation.plan, employeeOptions, demoCompany, employee);
  assert.match(taskById(tasks, "school").description, /your children \(ages 4 and 11\)/);
  assert.match(taskById(tasks, "family-entry").description, /your child 1 and your child 2/);
  assert.match(taskById(tasks, "insurance").description, /you, your child 1 and your child 2/);
  const withPartner = buildEmployeeTasks(demoRelocation.plan, { ...employeeOptions, movingWithSpouse: true, partnerSponsorship: "unknown" }, demoCompany, employee);
  assert.match(taskById(withPartner, "insurance").description, /you, your partner, your child 1 and your child 2/);
  assert.doesNotMatch(taskById(withPartner, "insurance").description, /partner and your child 1 and your child 2/);
  assert.match(employeeRationaleByTaskId(employeeOptions, demoCompany, employee).school, /ages 4 and 11/);

  const unknownFounder = { ...founderDemo, spouseName: undefined, childName: undefined, childAge: undefined, childAges: undefined };
  const unknownEmployee = { ...demoEmployee, family: [] };
  const unknownAnswers = { ...employeeAnswers, childAges: undefined };
  const unknownCopy = [
    taskById(buildFounderTasks(unknownFounder), "family-school").description,
    founderRationaleByTaskId(unknownFounder)["family-school"],
    taskById(buildEmployeeTasks(demoRelocation.plan, unknownAnswers, demoCompany, unknownEmployee), "school").description,
    employeeRationaleByTaskId(unknownAnswers, demoCompany, unknownEmployee).school,
  ].join(" ");
  assert.doesNotMatch(unknownCopy, /\d+-year-old|seven|eight|Lina|Jamie|undefined|NaN/);
  assert.equal(childLabel("your children", undefined, []), "your children");
  assert.equal(childLabel("your child", 7, []), "your child");
});

test("zero preference sentinels request known values instead of inventing bedroom or commute requirements", () => {
  const employee = { ...demoEmployee, preferences: { ...demoEmployee.preferences, bedrooms: 0 } };
  const answers = { ...employeeAnswers, maxCommuteMinutes: 0 };
  const tasks = buildEmployeeTasks(demoRelocation.plan, answers, demoCompany, employee);
  const rationale = employeeRationaleByTaskId(answers, demoCompany, employee).housing;
  for (const copy of [taskById(tasks, "housing").description, rationale]) {
    assert.doesNotMatch(copy, /(?:0|zero)-bedroom|0-minute|0 minutes/);
    assert.match(copy, /bedroom count/);
    assert.match(copy, /confirm/);
    assert.match(copy, /commute limit/);
  }
});

test("supplied employee commute and employer cap retain their concrete rationale", () => {
  const copy = employeeRationaleByTaskId(employeeAnswers, demoCompany, demoEmployee).housing;
  assert.match(copy, /^The 25-minute ADGM commute narrows three-bedroom homes within your AED 180 000 cap/);
  assertAnchoredRationale(copy);
});

test("office, warehouse and mixed customers keep their intended planning scope", () => {
  for (const premisesNeed of ["office", "warehouse", "mixed"] as const) {
    const answers = { ...founderDemo, businessType: "Technology services", premisesNeed, customerMarket: "mixed" as const };
    const tasks = buildFounderTasks(answers);
    const copy = founderRationaleByTaskId(answers);
    assert.match(taskById(tasks, "legal-form").description, /both UAE domestic and international/);
    assert.match(copy["legal-form"], /both UAE domestic and international/);
    assert.match(taskById(tasks, "premises-spec").description, premisesNeed === "office" ? /office/ : premisesNeed === "warehouse" ? /warehouse/ : /office, storage/);
    assert.match(copy["premises-spec"], premisesNeed === "office" ? /office/ : premisesNeed === "warehouse" ? /warehouse/ : /combined office, storage/);
    assert.doesNotMatch(copy["premises-spec"], /customer-facing/);
    assertValidGraph(tasks);
  }
});

test("generated rationales stay below 220 characters with long names and unknown dates", () => {
  const longName = "A long legitimate household member name ".repeat(20).trim();
  const founderAnswers = { ...founderDemo, spouseName: longName, childName: longName, businessType: longName };
  const founderContext = { viewerRole: "founder" as const, answers: founderAnswers };
  for (const task of buildFounderTasks(founderAnswers)) {
    const copy = rationaleForTask(task, founderContext);
    assert.ok(copy.trim());
    assert.ok(copy.length < 220, `${task.id}: ${copy}`);
  }
  assert.match(rationaleForTask(taskById(buildFounderTasks(founderAnswers), "family-school"), founderContext), /your 7-year-old child/);
  for (const copy of Object.values(founderRationaleByTaskId(founderAnswers))) assert.ok(copy.length < 220, copy);

  const employee = { ...demoEmployee, family: demoEmployee.family.map((member) => ({ ...member, name: longName })) };
  for (const startDate of ["", "unknown", "2026-02-30", "2026-13-01", "2026-11-02"]) {
    const answers = { ...employeeAnswers, startDate };
    const context = { viewerRole: "employee" as const, answers, company: demoCompany, employee };
    for (const task of buildEmployeeTasks(demoRelocation.plan, answers, demoCompany, employee)) {
      const copy = rationaleForTask(task, context);
      assert.ok(copy.trim());
      assert.ok(copy.length < 220, `${task.id}: ${copy}`);
    }
    const copy = employeeRationaleByTaskId(answers, demoCompany, employee);
    assert.match(copy.visa, startDate === "2026-11-02" ? /2 November/ : /unconfirmed work start/);
    for (const rationale of Object.values(copy)) assert.ok(rationale.length < 220, rationale);
  }
});

test("rationales fit normal maximum UI payloads and long policy text", () => {
  const maxName = "N".repeat(80);
  const founderAnswers = { ...founderDemo, name: maxName, spouseName: maxName, childName: maxName, childAge: 18, headcountYearOne: 50 };
  for (const task of buildFounderTasks(founderAnswers)) {
    assert.ok(rationaleForTask(task, { viewerRole: "founder", answers: founderAnswers }).length < 220, task.id);
  }
  const company = { ...demoCompany, policy: { ...demoCompany.policy, officeLocation: "W".repeat(100), housingAllowanceAED: 10000000, healthInsuranceCoverage: "P".repeat(1000) } };
  const employee = { ...demoEmployee, preferences: { ...demoEmployee.preferences, bedrooms: 10 }, family: demoEmployee.family.map((member) => ({ ...member, name: maxName })) };
  for (const housingArrangement of ["yes", "no", "provided"]) {
    for (const maxCommuteMinutes of [0, 180]) {
      const answers = { ...employeeAnswers, startDate: "2026-09-30", maxCommuteMinutes, housingArrangement, childAges: [18, 7] };
      const context = { viewerRole: "employee" as const, answers, company, employee };
      for (const task of buildEmployeeTasks(demoRelocation.plan, answers, company, employee)) {
        const copy = rationaleForTask(task, context);
        assert.ok(copy.length < 220, `${task.id}: ${copy}`);
      }
      for (const copy of Object.values(employeeRationaleByTaskId(answers, company, employee))) assert.ok(copy.length < 220, copy);
    }
  }
});

test("authored rationale is preserved character-for-character including external long copy", () => {
  const task = buildFounderTasks(founderDemo)[0];
  const context = { viewerRole: "founder" as const, answers: founderDemo };
  for (const rationale of ["  Your authored rationale.\n", "Your externally authored rationale. ".repeat(20)]) {
    assert.equal(rationaleForTask({ ...task, rationale }, context), rationale);
  }
});

test("all household variants preserve valid task graphs and remove absent companions", () => {
  const partnerStates: (PartnerSponsorship | undefined)[] = [undefined, "unknown", "spouse", "independent"];
  for (const partnerSponsorship of partnerStates) {
    for (const movingWithSpouse of [false, true]) {
      for (const movingWithChild of [false, true]) {
        const household = { partnerSponsorship, movingWithSpouse, movingWithChild };
        const founder = buildFounderTasks({ ...founderDemo, ...household, isEstablishedInUAE: true });
        const employee = buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, ...household }, demoCompany, demoEmployee);
        assertValidGraph(founder);
        assertValidGraph(employee);
        const founderContext = { viewerRole: "founder" as const, answers: { ...founderDemo, ...household, isEstablishedInUAE: true, childName: undefined, childAge: undefined, childAges: undefined, spouseName: undefined } };
        for (const task of buildFounderTasks(founderContext.answers)) assertAnchoredRationale(rationaleForTask(task, founderContext));
        const employeeContext = { viewerRole: "employee" as const, answers: { ...employeeAnswers, ...household, startDate: "", maxCommuteMinutes: 0, childAges: undefined }, company: demoCompany, employee: { ...demoEmployee, family: [], preferences: { ...demoEmployee.preferences, bedrooms: 0 } } };
        for (const task of buildEmployeeTasks(demoRelocation.plan, employeeContext.answers, employeeContext.company, employeeContext.employee)) assertAnchoredRationale(rationaleForTask(task, employeeContext));
        if (!movingWithChild) {
          assert.ok(!founder.some((task) => task.id === "family-school"));
          assert.ok(!employee.some((task) => task.id === "school"));
          assert.deepEqual(taskById(employee, "housing-tenancy").dependsOn, ["housing"]);
        }
        if (!movingWithSpouse) {
          assert.ok(!founder.some((task) => task.id === "partner-route"));
          assert.ok(!employee.some((task) => task.id === "partner-route"));
        }
        if (!movingWithSpouse && !movingWithChild) {
          assert.deepEqual(taskById(employee, "employee-entry").dependsOn, ["visa", "travel"]);
          assert.deepEqual(taskById(employee, "residency-completion").dependsOn, ["employee-entry"]);
        }
      }
    }
  }
});
