# Team Coherence

One full-stack Next.js App Router hackathon repository for employer-led employee relocation to Abu Dhabi. Keep this foundation simple: no database, authentication or real property API yet.

## Concurrent ownership

- Frontend developer: `app/*` UI routes (excluding `app/api/*`), `components/*`, styling, onboarding, HR and employee dashboards.
- Backend developer: `app/api/*`, `lib/openai/*`, `lib/providers/*`, `lib/api/*`, prompts and orchestration.
- Shared contracts: `lib/schemas/relocation.ts`, `types/relocation.ts`, and `lib/demo/*`. Coordinate changes to these and root configuration before editing; add fields compatibly whenever possible.
- Work on `frontend` and `backend` branches from the same `main` foundation. Pull current main before starting; merge reviewed changes through GitHub PRs. Avoid changing the other developer's owned files unless the task needs it and coordination is explicit.

## Rules

- All OpenAI calls stay server-side, guarded by `server-only`. Use Responses API and Zod structured outputs.
- Never expose secrets in `NEXT_PUBLIC_*`, source, logs or Git. Only `.env.example` is tracked.
- Schemas are the source of truth; derive types with `z.infer`. UI code can import contracts and demo fixtures, never server provider/client modules.
- Keep `HousingProvider` as the adapter boundary. All current listings and commute estimates are fictional. Do not imply live availability or a Property Finder integration.
- Demo mode is deterministic and never calls OpenAI. Live mode requires explicit configuration and returns an error on upstream failure.
- Do not present generated immigration, insurance or school steps as verified current legal requirements. HR and relevant authorities must confirm them.
- No storage: requests are stateless; completion status must be sent back in the plan.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before committing backend changes. Add meaningful checks when behavior changes.
