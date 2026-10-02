import "server-only";
import { z } from "zod";
import { NextResponse } from "next/server";

export function postHandler<T>(schema: z.ZodType<T>, run: (input: T) => Promise<unknown>) {
  return async (request: Request) => {
    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Provide a valid JSON request body." } }, { status: 400 }); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Request does not match the API contract.", details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) } }, { status: 400 });
    try { return NextResponse.json(await run(parsed.data), { headers: { "Cache-Control": "no-store" } }); }
    catch { return NextResponse.json({ error: { code: "SERVICE_UNAVAILABLE", message: "Unable to complete request. Check server configuration or use DEMO_MODE=true." } }, { status: 503 }); }
  };
}
