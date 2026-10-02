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

## Design language — "Blueprint"
The product looks like a technical drafting document, not a SaaS dashboard.
The founder's company is literally being drawn.

### Tokens — CSS custom properties in app/globals.css
```
--paper:        #F4F1EA   /* page background, bone */
--paper-sunk:   #EAE5DA   /* recessed panels */
--paper-raised: #FBF9F4   /* panels above the sheet */
--ink:          #15212B   /* primary text, graphite blue */
--ink-muted:    #5A6B78
--ink-faint:    #8E9AA3   /* annotations, meta */
--rule:         #C8C2B4   /* 1px hairlines — the workhorse border */
--rule-strong:  #1E3A4C
--accent:       #D4551E   /* surveyor orange — ONE accent, used sparingly */
--accent-sunk:  #A8400F
--survey:       #2E6F7E   /* critical path only */
--verified:     #4A6B4F   /* source badges */
--warn:         #8A6D1F
```

### Typography — IBM Plex family only, via next/font/google
- Headings: IBM Plex Sans Condensed, 600, uppercase, letter-spacing 0.06em
- Body: IBM Plex Sans, 400/500, 15–16px, line-height 1.55
- Labels, numbers, ids, costs: IBM Plex Mono, 500, uppercase for labels,
  `font-variant-numeric: tabular-nums` on every figure
- Arabic: IBM Plex Sans Arabic

### Geometry
- Border radius 0 by default, 2px absolute maximum. Never more.
- `1px solid var(--rule)` is the default separator everywhere.
- Spacing scale: 4, 8, 16, 24, 32, 48, 64.
- Drafting grid background: 24px minor / 120px major, ink at 3% and 6% alpha.

### Depth
**No `box-shadow` anywhere in the codebase.** Elevation = hairline borders + a
1px offset paper edge on bottom and right + background shifts between
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
Correct tone: "Mainland licence. 12–18 working days. From AED 15,000. Required
because you invoice UAE customers directly."
