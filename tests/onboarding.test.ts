import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyAnswer,
  dayFromToday,
  employeePersona,
  employeeSequence,
  establishedFounderSequence,
  firstUnanswered,
  founderPersona,
  newFounderSequence,
  optionsFor,
  payrollNote,
  questionTotal,
  questions,
  sequenceFor,
} from "../lib/ui/onboarding";

test("role is first and the three approved sequences have 6, 5 and 9 questions", () => {
  assert.deepEqual(sequenceFor({}), ["role"]);
  assert.equal(questionTotal({}), "—");
  assert.equal(questions.role.title, "Are you joining an employer, or setting up a company?");

  assert.deepEqual(sequenceFor(employeePersona), employeeSequence);
  assert.deepEqual(sequenceFor({ role: "founder", established: "yes" }), establishedFounderSequence);
  assert.deepEqual(sequenceFor(founderPersona), newFounderSequence);
  assert.deepEqual([employeeSequence.length, establishedFounderSequence.length, newFounderSequence.length], [6, 5, 9]);
  const employeeKeys: readonly string[] = employeeSequence;
  assert.ok(!employeeKeys.includes("established"));
});

test("changing role or establishment removes orphaned answers but keeps shared answers", () => {
  const employee = applyAnswer(founderPersona, "role", "employee");
  assert.deepEqual(Object.keys(employee).sort(), ["role", "moving", "when", "area"].sort());
  assert.equal(employee.moving, "with_family");
  assert.equal(firstUnanswered(employee), "visaStage");

  const established = applyAnswer(founderPersona, "established", "yes");
  assert.deepEqual(Object.keys(established).sort(), ["role", "established", "moving", "when", "area"].sort());
  assert.equal(firstUnanswered(established), undefined);

  const founder = applyAnswer(employeePersona, "role", "founder");
  assert.deepEqual(Object.keys(founder).sort(), ["role", "moving", "when", "area"].sort());
  assert.equal(firstUnanswered(founder), "established");
});

test("target labels use the current date and payroll notes match the approved bands", () => {
  assert.equal(dayFromToday("2026-12-01", "2026-10-02"), 60);
  assert.deepEqual(optionsFor("when", "2026-10-02").map((option) => option.consequence), [
    "≈ DAY 60", "≈ DAY 122", "≈ DAY 181", "SCHOOL INTAKE",
  ]);
  assert.equal(optionsFor("when", "2026-10-03")[0].consequence, "≈ DAY 59");
  assert.equal(payrollNote(3), "A FLEXI-DESK MAY COVER THIS — TODO(verify)");
  assert.equal(payrollNote(7), "A SMALL REGISTERED OFFICE IS LIKELY");
  assert.equal(payrollNote(8), "DEDICATED FLOOR AREA — PREMISES BECOME A HIRING CONSTRAINT");
});
