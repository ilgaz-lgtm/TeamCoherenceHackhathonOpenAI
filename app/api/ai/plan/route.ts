import { postHandler } from "@/lib/api/handler";
import { planRequestSchema } from "@/lib/schemas/relocation";
import { generatePlan } from "@/lib/openai/orchestration";
export const runtime = "nodejs";
export const POST = postHandler(planRequestSchema, generatePlan);
