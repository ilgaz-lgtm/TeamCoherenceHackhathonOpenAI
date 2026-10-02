import "server-only";
import OpenAI from "openai";

export function isDemoMode() {
  const value = process.env.DEMO_MODE ?? "true";
  if (value !== "true" && value !== "false") throw new Error("DEMO_MODE must be true or false");
  return value === "true";
}
export function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) throw new Error("Live mode requires OPENAI_API_KEY and OPENAI_MODEL");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20000, maxRetries: 1 });
}
