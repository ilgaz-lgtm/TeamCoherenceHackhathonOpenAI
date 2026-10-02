import { postHandler } from "@/lib/api/handler";
import { nextActionRequestSchema } from "@/lib/schemas/relocation";
import { generateNextAction } from "@/lib/openai/orchestration";
export const runtime = "nodejs";
export const POST = postHandler(nextActionRequestSchema, ({ plan }) => generateNextAction(plan));
