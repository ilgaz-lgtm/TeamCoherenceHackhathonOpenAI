import { test } from "node:test";
import assert from "node:assert/strict";
import { demoPlanRequest, demoShortTermPlanRequest, demoShortTermRelocation, demoPersonas } from "../lib/demo/data";
import { buildDemoPlan, getDemoNextAction } from "../lib/demo/plan";
import { validatePlan, nextActionRequestSchema, relocationTaskSchema, generatedRelocationPlanSchema } from "../lib/schemas/relocation";
import { zodTextFormat } from "openai/helpers/zod";

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
test("rationale remains optional for older clients and is bounded", () => {
  const task = { ...buildDemoPlan(demoPlanRequest).tasks[0] };
  delete task.rationale;
  assert.ok(relocationTaskSchema.safeParse(task).success);
  assert.ok(relocationTaskSchema.safeParse({ ...task, rationale: "a".repeat(220) }).success);
  assert.equal(relocationTaskSchema.safeParse({ ...task, rationale: "a".repeat(221) }).success, false);
});
test("short-term persona has three tasks with visa and insurance retained", () => {
  const plan = buildDemoPlan(demoShortTermPlanRequest);
  assert.equal(plan.tasks.length, 3);
  assert.deepEqual(plan.tasks.map((task) => task.id), ["visa", "housing", "insurance"]);
  assert.match(plan.tasks[1].description, /1-bedroom/);
  assert.equal(getDemoNextAction(plan).taskId, "visa");
  assert.deepEqual(plan, demoShortTermRelocation.plan);
  assert.equal(demoPersonas[0].relocation.plan.tasks.length, 6);
  for (const persona of demoPersonas) for (const task of persona.relocation.plan.tasks) {
    assert.ok(task.rationale && task.rationale.length <= 220);
    assert.notEqual(task.rationale, task.description);
  }
});
test("single status alone does not remove immigration, travel or utilities tasks", () => {
  const input = structuredClone(demoShortTermPlanRequest);
  delete input.employee.assignment;
  assert.equal(buildDemoPlan(input).tasks.length, 5);
  input.employee.assignment = { durationDays: 60, accommodation: "self_arranged" };
  assert.equal(buildDemoPlan(input).tasks.length, 5);
  input.employee.assignment = { durationDays: 180, accommodation: "employer_managed" };
  assert.equal(buildDemoPlan(input).tasks.length, 5);
});
test("live structured-output schema requires rationale while public schema stays compatible", () => {
  const format = zodTextFormat(generatedRelocationPlanSchema, "relocation_plan");
  assert.equal(format.strict, true);
  const schema = format.schema as { properties: { tasks: { items: { required: string[] } } } };
  assert.ok(schema.properties.tasks.items.required.includes("rationale"));
  const plan = buildDemoPlan(demoPlanRequest);
  delete plan.tasks[0].rationale;
  assert.ok(validatePlan(plan));
  assert.equal(generatedRelocationPlanSchema.safeParse(plan).success, false);
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
