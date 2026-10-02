import assert from "node:assert/strict";
import test from "node:test";
import { founderDemo } from "../lib/ui/personas";
import { buildFounderTasks } from "../lib/ui/founder-plan";
import { currentStep, orderedSteps, validWaiting } from "../lib/ui/steps";
import { reconcileCompleted } from "../lib/ui/workspace";

test("relocation sequence keeps every future step visible and dependencies before dependents", () => {
  const all = buildFounderTasks(founderDemo);
  const move = all.filter((task) => task.layer === "self");
  const ordered = orderedSteps(move);
  assert.equal(ordered.length, move.length);
  for (const task of ordered) for (const dependency of task.dependsOn) {
    if (move.some((item) => item.id === dependency)) assert.ok(ordered.findIndex((item) => item.id === dependency) < ordered.indexOf(task));
  }
  assert.equal(ordered[0].id, "family-documents");
});

test("completing the current step moves to the next usable step without clearing its blockers", () => {
  const all = buildFounderTasks(founderDemo);
  const ordered = orderedSteps(all.filter((task) => task.layer === "self"));
  const completed = reconcileCompleted(all, []);
  const first = currentStep(ordered, all, completed, new Set());
  assert.ok(first);
  completed.add(first.id);
  const second = currentStep(ordered, all, completed, new Set());
  assert.notEqual(second?.id, first.id);
  assert.notEqual(second?.id, "founder-residence");
  assert.equal(completed.has("founder-residence"), false);
});

test("a pending authority reply frees independent preparation, not dependent approval", () => {
  const all = buildFounderTasks(founderDemo);
  const ordered = orderedSteps(all.filter((task) => task.layer === "self"));
  const completed = reconcileCompleted(all, []);
  const first = currentStep(ordered, all, completed, new Set());
  assert.ok(first);
  const waiting = validWaiting(all, completed, [first.id, "not-a-task"]);
  assert.equal(waiting.size, 1);
  assert.notEqual(currentStep(ordered, all, completed, waiting)?.id, first.id);
  assert.equal(completed.has(first.id), false);
  completed.add(first.id);
  assert.equal(validWaiting(all, completed, [...waiting]).size, 0);
});
