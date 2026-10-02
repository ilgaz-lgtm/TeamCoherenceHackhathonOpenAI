import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { createOpenAIClient, isDemoMode } from "./client";
import { planInstructions, nextActionInstructions } from "./prompts";
import { relocationPlanSchema, nextActionResponseSchema, validatePlan } from "@/lib/schemas/relocation";
import { buildDemoPlan, getDemoNextAction } from "@/lib/demo/plan";
import type { PlanRequest, RelocationPlan } from "@/types/relocation";

export async function generatePlan(input: PlanRequest) {
  if (isDemoMode()) return buildDemoPlan(input);
  const response = await createOpenAIClient().responses.parse({
    model: process.env.OPENAI_MODEL!, instructions: planInstructions,
    input: JSON.stringify(input), text: { format: zodTextFormat(relocationPlanSchema, "relocation_plan") }, store: false,
  });
  if (!response.output_parsed) throw new Error("No structured plan returned");
  return validatePlan(response.output_parsed);
}
export async function generateNextAction(plan: RelocationPlan) {
  validatePlan(plan);
  if (isDemoMode()) return getDemoNextAction(plan);
  const response = await createOpenAIClient().responses.parse({
    model: process.env.OPENAI_MODEL!, instructions: nextActionInstructions,
    input: JSON.stringify(plan), text: { format: zodTextFormat(nextActionResponseSchema, "next_action") }, store: false,
  });
  const result = nextActionResponseSchema.parse(response.output_parsed);
  const completed = new Set(plan.tasks.filter((task) => task.status === "completed").map((task) => task.id));
  const eligible = plan.tasks.filter((task) => task.status !== "completed" && task.dependsOn.every((id) => completed.has(id)));
  if (result.taskId === null ? eligible.length > 0 : !eligible.some((task) => task.id === result.taskId)) throw new Error("Invalid next action");
  return result;
}
