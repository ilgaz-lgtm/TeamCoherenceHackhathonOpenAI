# Team Coherence

One full-stack Next.js App Router hackathon repository for establishing a company in Abu Dhabi and relocating its people. Keep this foundation simple: no database, authentication or real property API yet.

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

## Design language — "Blueprint"
The product looks like a technical drafting document, not a SaaS dashboard.
It draws two dependent layers: establishing the founder's Abu Dhabi company
(licensing, premises, banking), then relocating its people (visa, housing,
schooling, insurance, settling). A sponsored employee's residence process
depends on the establishment card, which depends on a valid company licence.
Do not imply every people task legally requires a lease or bank account.

### Tokens — CSS custom properties in app/globals.css
The approved Wusool reference supersedes the original Blueprint colors. The
reference HTML is read-only and is not part of this repository.
```
--paper:        #F4F1EA   /* page background, bone */
--paper-sunk:   #EAE5DA   /* recessed panels */
--paper-raised: #FAF8F3   /* task rooms, timeline surface */
--paper-offset: #E2DCCF   /* 3px paper edge */
--ink:          #1B1B1B   /* near-black */
--ink-soft:     #3A3630
--ink-muted:    #5E584C
--ink-faint:    #8C8576
--rule:         #C8C2B4   /* 1px hairlines — the workhorse border */
--rule-strong:  #1B1B1B
--accent:       #C8102E   /* red accent */
--survey:       #00732F   /* critical path */
--survey-muted: #7FA88E   /* blocked critical path */
--verified:     #00732F
--warn:         #C8102E
```

### Typography — IBM Plex family only, via next/font/google
- Headings: IBM Plex Sans Condensed, 600/700, uppercase. Use the approved
  clamp scales: question 34px–60px, plan 40px–76px, verdict 56px–124px,
  bridge 28px–52px, view 32px–52px. Keep letter spacing 0.
- Body: IBM Plex Sans, 400/500, 15–16px, line-height 1.55
- Labels, numbers, ids, costs: IBM Plex Mono, 500, uppercase for labels,
  `font-variant-numeric: tabular-nums` on every figure
- Arabic: IBM Plex Sans Arabic

### Geometry
- Border radius 0 by default, 2px absolute maximum. Never more.
- `1px solid var(--rule)` is the default separator everywhere.
- Spacing scale: 4, 8, 16, 24, 32, 48, 64.
- Plain paper is the default page field. The drafting grid remains opt-in.

### Depth
**No `box-shadow` anywhere in the codebase.** Elevation = hairline borders + a
3px offset paper edge on bottom and right + background shifts between
--paper-sunk / --paper / --paper-raised.

### Motion
- Entrances `cubic-bezier(0.2,0.8,0.2,1)`, exits `cubic-bezier(0.4,0,1,1)`
- Line drawing: SVG stroke-dashoffset, 500–800ms
- Question dissolve: opacity 1→0, blur 0→6px, translateY 0→-8px, 320ms
- Module reveal: 60ms stagger, fade + 12px rise, 400ms
- Everything respects `prefers-reduced-motion: reduce`

## BANNED — these read as default AI output and will fail the jury
Purple/indigo/violet gradients. Any multi-stop gradient background.
Glassmorphism, backdrop-blur, frosted panels. Inter, Geist, Poppins,
Montserrat, Space Grotesk. rounded-xl / rounded-2xl / rounded-full, pill
buttons. shadow-lg / shadow-xl / coloured glows. Floating blurred blobs,
aurora or mesh backgrounds. Emoji as icons. Three-column grids of identical
cards. Copy like "Supercharge", "Seamlessly", "Unlock", "Effortlessly",
"Your journey starts here", "Powered by AI".

## Voice
Second person, declarative, specific. Numbers before adjectives. Never hype.
Cover both the company-establishment and people-relocation layers, and explain
the dependency between them without confusing a workflow hold with a legal
requirement. Company example: "Your establishment card needs a valid licence
before your employee's sponsorship file can move." People example: "Your
30-day temporary stay may shift if the visa task waits on the establishment
card." Confirm current requirements with HR and the relevant authorities.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
