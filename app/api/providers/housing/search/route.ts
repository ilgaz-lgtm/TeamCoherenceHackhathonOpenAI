import { postHandler } from "@/lib/api/handler";
import { propertySearchRequestSchema, housingSearchResponseSchema } from "@/lib/schemas/relocation";
import { housingProvider } from "@/lib/providers";
export const runtime = "nodejs";
export const POST = postHandler(propertySearchRequestSchema, async (input) => housingSearchResponseSchema.parse({ provider: housingProvider.metadata, results: await housingProvider.search(input) }));
