# WUSOOL — ONBOARDING FLOW SPEC (authoritative)

Extracted verbatim from the approved design reference. This file overrides any
earlier spec, including WUSOOL-SPEC-PLAN-C.md, whose Q0 was wrong.

The first question is ROLE, not company status. Everything branches from it.

---

## 1. The three sequences

Determined by `role`, then by `established`. Implement exactly this:

```
role = 'employee'
  → role, visaStage, allowance, moving, when, area              (6 questions)

role = 'founder' AND established = 'yes'
  → role, established, moving, when, area                       (5 questions)

role = 'founder' AND established = 'no'
  → role, established, build, pays, payroll, where,
    moving, when, area                                          (9 questions)
```

`established` is NOT asked of an employee. `build / pays / payroll / where`
are asked ONLY of a founder who is still setting the company up.

### Re-branching
When the answer to `role` or `established` changes, drop every stored answer
that is not in the new sequence, then jump to the first unanswered question.
Do not keep orphaned answers and do not reset answers that are still valid.

### Counter
`QUESTION 01 OF 09`, zero-padded. Before `role` is answered the total is
unknown, so render `QUESTION 01 OF —`.

---

## 2. The questions — text, options and consequence labels, verbatim

Format: `key` · question · note (optional)
Then each option: value · label · consequence label (right-aligned, mono)

### role
**Are you joining an employer, or setting up a company?**
*This one answer decides the shape of everything that follows.*
- `employee` · I am joining an employer · `PEOPLE ONLY`
- `founder` · I am setting up a company · `COMPANY + PEOPLE`

### visaStage  (employee only)
**Has your employer started your visa?**
*Your employer is your sponsor. Where they are in the process is where your plan begins.*
- `not_started` · Not yet · `PLAN STARTS AT ENTRY PERMIT`
- `filed` · Entry permit filed · `IN PROGRESS`
- `approved` · Entry permit approved · `MEDICAL NEXT`

### allowance  (employee only)
**Does your package include a housing allowance?**
- `yes` · Yes, a housing allowance · `SETS YOUR RENT BUDGET`
- `provided` · Housing is provided · `NO LEASE TO SIGN`
- `no` · No, rent comes from salary · `BUDGET FROM SALARY`

### established  (founder only)
**Is your company already established in the UAE?**
*A company without a UAE licence and establishment card cannot sponsor anyone yet.*
- `no` · No — I am setting it up · `BOTH LAYERS`
- `yes` · Yes — it already holds a UAE licence · `PEOPLE ONLY`

### build  (founder, not established)
**What are you building?**
- `restaurant_fnb` · Restaurant or food & beverage · `ADAFSA IN PATH`
- `consultancy` · Consultancy · `PROFESSIONAL LICENCE`
- `trading` · Trading · `COMMERCIAL LICENCE`
- `tech_startup` · Tech startup · `FREE ZONE VIABLE`

### pays  (founder, not established)
**Who pays you?**
*Whether you invoice UAE customers directly is what separates a mainland licence from a free-zone one.*
- `uae_domestic` · Customers in the UAE, invoiced directly · `MAINLAND LIKELY`
- `export_only` · Customers outside the UAE only · `FREE ZONE VIABLE`
- `international_remote` · International clients, delivered remotely · `FREE ZONE VIABLE`
- `mixed` · A mix of UAE and overseas · `MAINLAND LIKELY`

### payroll  (founder, not established) — STEPPER, not options
**How many people on payroll in year one?**
*Headcount decides the premises you need, and the premises decide the licence.*
Stepper, range 1–50, mono tabular numerals. Live note under the figure:
- 1–3 → `A FLEXI-DESK MAY COVER THIS — TODO(verify)`
- 4–7 → `A SMALL REGISTERED OFFICE IS LIKELY`
- 8+  → `DEDICATED FLOOR AREA — PREMISES BECOME A HIRING CONSTRAINT`

### where  (founder, not established)
**Where does the work happen?**
- `customer_facing` · Customers walk in · `ADDED MATTER`
- `office_only` · An office, no walk-ins · `EITHER ROUTE`
- `warehouse` · A warehouse or storage space · `ZONING CHECK`
- `remote` · Remote — no fixed premises · `FLEXI-DESK VIABLE`

### moving  (both tracks)
**Who is moving?**
- `solo` · Just me · `ONE VISA`
- `with_partner` · Me and a partner · `+ SPONSORSHIP`
- `with_family` · Me, a partner and children · `+ SCHOOL DEADLINE`

### when  (both tracks)
**When do you need to be here?**
- `2026-12-01` · December 2026 · `≈ DAY 60`
- `2027-02-01` · February 2027 · `≈ DAY 122`
- `2027-04-01` · April 2027 · `≈ DAY 181`
- `2027-08-01` · August 2027 · `SCHOOL INTAKE`

Compute the `≈ DAY n` labels from today rather than hardcoding them. Keep
`SCHOOL INTAKE` as written for the August option.

### area  (both tracks)
**Where would you like to live?**
*Commute is estimated to Al Maryah Island. Estimates only.*
- `reem` · Al Reem Island · `CITY · SHORT COMMUTE`
- `raha` · Al Raha Beach · `MID-DISTANCE · NEAR YAS`
- `khalifa` · Khalifa City · `VILLAS · LONGER DRIVE`
- `saadiyat` · Saadiyat Island · `SCHOOLS · CULTURAL DISTRICT`

---

## 3. Interaction

- One question per screen, full height. Question in Sans Condensed,
  `clamp(34px, 4.6vw, 60px)`, uppercase, `max-width: 18ch`.
- The note sits under the question, body size, muted.
- Options are ruled ledger rows: mono index `01`, label, a 1px leader line
  filling the remaining width, consequence label right-aligned in mono.
  No fill, no border box, no radius. Only the leader line reacts to hover.
- On select: the chosen row turns accent red; the others fade out
  (opacity → 0, blur 0 → 6px, translateY −8px) over 320ms. After 380ms the
  next question renders. Selection is locked during that window — a second
  click must do nothing.
- The chosen answer then appears in the **answer ledger** (left edge on wide
  screens, top on narrow), as `Q3 · PAYROLL · 9 on payroll`. Every ledger line
  is clickable and returns to that question. The current question's ledger line
  is accent red; the rest are ink.
- Empty ledger shows `Answers appear here.`
- Progress: one tick mark per question in the active sequence. Current tick
  accent, answered ticks ink, unanswered `--rule`.
- Keyboard: digits 1–9 select, Enter confirms focus, Backspace goes back one,
  arrows move focus within the radio group. Visible focus ring everywhere.
- Completing the last question routes straight to the plan.

---

## 4. Two demo personas — load directly, bypassing onboarding

```
FOUNDER:  role=founder, established=no, build=restaurant_fnb,
          pays=uae_domestic, payroll=9, where=customer_facing,
          moving=with_family, when=2027-04-01, area=saadiyat

EMPLOYEE: role=employee, visaStage=filed, allowance=yes,
          moving=with_partner, when=2026-12-01, area=reem
```

Header carries three controls: load founder, load employee, restart.
