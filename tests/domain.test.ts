import { test } from "node:test";
import assert from "node:assert/strict";
import { demoPlanRequest } from "../lib/demo/data";
import { buildDemoPlan, getDemoNextAction } from "../lib/demo/plan";
import { validatePlan, nextActionRequestSchema } from "../lib/schemas/relocation";

test("demo plan reflects allowances and family rather than fixed fixture values", () => {
  const input = structuredClone(demoPlanRequest);
  input.companyPolicy.housingAllowanceAED = 90000;
  input.employee.family = [];
  const plan = buildDemoPlan(input);
  assert.equal(plan.readiness, 0);
  assert.match(plan.tasks.find((task) => task.id === "housing")!.description, /90000/);
  assert.ok(!plan.tasks.some((task) => task.id === "school"));
  assert.deepEqual(plan, buildDemoPlan(input));
});
test("next action skips blocked tasks and stops after completion", () => {
  const plan = buildDemoPlan(demoPlanRequest);
  assert.equal(getDemoNextAction(plan).taskId, "visa");
  plan.tasks.find((task) => task.id === "visa")!.status = "completed";
  assert.equal(getDemoNextAction(plan).taskId, "travel");
  plan.tasks.forEach((task) => { task.status = "completed"; });
  assert.equal(getDemoNextAction(plan).taskId, null);
});
test("dependency graph rejects duplicates, missing references and cycles", () => {
  for (const kind of ["duplicate", "missing", "cycle"]) {
    const plan = buildDemoPlan(demoPlanRequest);
    if (kind === "duplicate") plan.tasks[1].id = plan.tasks[0].id;
    if (kind === "missing") plan.tasks[0].dependsOn = ["missing"];
    if (kind === "cycle") plan.tasks[0].dependsOn = ["travel"];
    assert.throws(() => validatePlan(plan));
    assert.equal(nextActionRequestSchema.safeParse({ plan }).success, false);
  }
});
