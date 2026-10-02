# Wusool

An employer-specific Abu Dhabi relocation platform foundation for a one-day OpenAI hackathon. Company policy and employee/family profiles become a structured journey; a replaceable housing adapter searches fictional property listings.

## Persona handover for frontend

Existing Alex exports and the three original demo endpoints remain available. New browser-safe exports from `lib/demo/data`: `demoShortTermEmployee`, `demoShortTermPolicy`, `demoShortTermPlanRequest`, `demoShortTermRelocation`, `demoShortTermHousingRequest`, and `demoPersonas`. `GET /api/demo/personas` returns the two-persona array, with each item containing `id`, `label`, `companyPolicy`, `employee`, `relocation`, and `housingRequest`.

Alex has a family, a three-bedroom preference and six tasks. Maya Patel is a junior analyst with no dependants on a 60-day assignment, a one-bedroom preference and three tasks. Maya's assignment-specific allowance is AED 90,000 annual-equivalent; Alex's policy remains unchanged. Short-term housing pricing is a fictional annual equivalent, not a verified booking rate.

`RelocationTask.rationale?: string` explains why a task applies to this employee, at most 220 characters. Existing tasks without rationale remain valid, so the UI can retain its fallback map. Both generated demo plans populate rationale. Live output uses a separate required-rationale schema to comply with OpenAI strict Structured Outputs.

`Employee.assignment` is optional: `{ durationDays, accommodation: "self_arranged" | "employer_managed" }`. Only assignments of at most 90 days, with no dependants and explicit employer-managed accommodation, use the compact demo journey. Housing, utilities and arrival logistics are combined; visa and insurance checks remain. Single status or a junior role alone does not trigger task removal.

Use each persona's `companyPolicy` and `employee` together when calling `/api/ai/plan`, and its `housingRequest` for property search. No UI files were changed for this backend handover; update product branding to Wusool on the frontend branch.

## Run locally

Use Node.js 20.9+ and npm. Clone this repository, then:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: use `Copy-Item .env.example .env.local`. Open http://localhost:3000. Demo mode defaults to true even without an environment file or API key.

Next.js is the latest stable version resolved at scaffold time (16.3.8), with dependencies locked in `package-lock.json`. TypeScript 6 and ESLint 9 match the lint plugins' supported peer versions. Dev and build use webpack because Turbopack's CSS-worker spawning is blocked in the Windows sandbox used for this scaffold.

To enable live AI, set `DEMO_MODE=false`, `OPENAI_API_KEY`, and `OPENAI_MODEL` in `.env.local`. Choose a model available to your account that supports Structured Outputs. The official OpenAI SDK uses Responses API `responses.parse` with `zodTextFormat`: https://developers.openai.com/api/docs/guides/structured-outputs. The client is initialized only for live requests, and response storage is disabled. Live calls have a timeout and one retry; failures return 503, never a silently substituted demo response. Restart the server after environment changes.

## Layout and team workflow

```text
app/                    UI routes, layout and styling (frontend)
app/api/                Route Handlers (backend)
components/             UI components (frontend)
lib/schemas/            Shared Zod request/response contracts
types/relocation.ts     Inferred shared domain types
lib/demo/               Browser-safe fixtures and deterministic planning
lib/openai/             Server-only client, prompts and orchestration
lib/providers/          Housing interface and server-only mock adapter
lib/api/                Request validation and error handling
tests/                  Domain checks and production HTTP smoke script
```

Frontend may import `demoCompany`, `demoEmployee`, `demoRelocation`, `demoPlanRequest`, and `demoHousingRequest` from `lib/demo/data` to build without waiting on backend. Shared types are in `types/relocation.ts`. Do not import server modules into client components.

Developer 2 works on `backend`; Developer 1 works on `frontend`. Both branch from `main`; merge via PRs. Coordinate shared contracts and root configuration; see `AGENTS.md`. There is no persistence or auth: every request carries its input and does not save a case. This scaffold is intended for local demo use; production access controls and persistence are future work.

## API contracts

Successful requests return JSON directly, without a `data` wrapper.

| Method | Endpoint | Request | Response |
| --- | --- | --- | --- |
| GET | `/api/demo/company` | none | `Company` (includes `policy`) |
| GET | `/api/demo/employee` | none | `Employee` (family includes spouse/children) |
| GET | `/api/demo/relocation` | none | `RelocationCase` (includes `plan`) |
| GET | `/api/demo/personas` | none | Array of both persona fixture bundles |
| POST | `/api/ai/plan` | `{ companyPolicy, employee }` (`PlanRequest`) | `{ readiness, summary, tasks }` (`RelocationPlan`) |
| POST | `/api/ai/next-action` | `{ plan }` (`NextActionRequest`) | `{ taskId: string \| null, reason }` |
| POST | `/api/providers/housing/search` | `PropertySearchRequest` | `{ provider, results }` |

Dates are `YYYY-MM-DD`. Task `dueDate` may be null; `dependsOn` references other task IDs. Status values: `pending`, `in_progress`, `completed`. Readiness ranges 0–100; initial demo tasks are pending, so readiness is 0. Next action respects dependencies and priority. All-completed plans return null. Duplicate IDs, missing dependencies and cycles are rejected.

Errors: malformed JSON or invalid inputs return 400; upstream/configuration/invalid AI output errors return 503. Shape: `{ error: { code, message, details?: [{ path, message }] } }`. Do not assume raw SDK errors are exposed.

```json
{
  "bedrooms": 3,
  "maxAnnualRentAED": 180000,
  "officeArea": "ADGM",
  "maxCommuteMinutes": 25,
  "preferredAreas": ["Al Reem Island", "Saadiyat Island"]
}
```

Housing bedrooms means **at least** the requested count; budget and commute are inclusive maximums. Empty preferred areas means any area. Mock commute estimates only cover ADGM; other offices return an empty list. Listings are fictional, not current market quotes. Replace the adapter exported from `lib/providers/index.ts` with a real `HousingProvider` later.

Demo plans incorporate policy allowances and add school tasks for children. They are presentation fixtures, not verified legal advice or a rules engine for current Abu Dhabi requirements.

## Verify

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

With the server running in demo mode, run `node tests/smoke.mjs` in another terminal (optional `BASE_URL` overrides localhost:3000). This exercises all seven endpoints, both personas, deterministic plans, invalid JSON/schema requests, dependency validation and housing filters. Live AI calls require your key and are not exercised by the demo checks.
