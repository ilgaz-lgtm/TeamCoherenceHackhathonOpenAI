import { test } from "node:test";
import assert from "node:assert/strict";
import { demoCompany, demoEmployee, demoRelocation } from "../lib/demo/data";
import { buildFounderTasks } from "../lib/ui/founder-plan";
import { employeeAnswersFromFixture, founderDemo } from "../lib/ui/personas";
import { buildEmployeeTasks } from "../lib/ui/scope";
import { getPublishedTaskTiming, getTaskTiming, stepTimingLabel } from "../lib/ui/timing";

test("current founder and employee branches have explicit timing guidance", () => {
  const employeeAnswers = employeeAnswersFromFixture(demoCompany, demoEmployee);
  const tasks = [
    ...buildFounderTasks(founderDemo),
    ...buildFounderTasks({ ...founderDemo, partnerSponsorship: "independent" }),
    ...buildFounderTasks({ ...founderDemo, partnerSponsorship: "unknown" }),
    ...buildFounderTasks({ ...founderDemo, isEstablishedInUAE: true }),
    ...buildEmployeeTasks(demoRelocation.plan, employeeAnswers, demoCompany, demoEmployee),
    ...buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, partnerSponsorship: "independent" }, demoCompany, demoEmployee),
    ...buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, partnerSponsorship: "unknown" }, demoCompany, demoEmployee),
    ...buildEmployeeTasks(demoRelocation.plan, { ...employeeAnswers, housingArrangement: "provided" }, demoCompany, demoEmployee),
  ];
  const ids = new Set(tasks.map((task) => task.id));
  for (const id of ["partner-route", "partner-residence", "family-residence", "family-entry", "family-sponsorship", "employee-permits", "corporate-tax-review"]) {
    assert.ok(ids.has(id), `Missing branch coverage for ${id}`);
  }
  for (const task of tasks) {
    const timing = getTaskTiming(task);
    assert.notEqual(timing.label, "Provider estimate needed", `Missing timing for ${task.id}`);
    assert.ok(timing.note.trim(), task.id);
    assert.ok(timing.sourceUrl?.startsWith("https://"), task.id);
    if (timing.basis === "variable") {
      assert.equal(timing.days, undefined, task.id);
    } else {
      assert.equal(timing.basis, "indicative", task.id);
      assert.equal(timing.unit, "working-days", task.id);
      assert.ok(Number.isInteger(timing.days) && timing.days > 0, task.id);
    }
  }
});

test("numeric mappings preserve exact approved planning days with their scopes", () => {
  const expected = {
    "legal-form": 3, "trade-name": 3, "initial-approval": 6, lease: 14,
    licence: 10, "establishment-card": 7, "business-bank": 25,
    "founder-residence": 8, visa: 8, "family-sponsorship": 8, "family-entry": 8,
    "family-school": 90, school: 90, "family-home": 30, "housing-tenancy": 30,
    "family-insurance": 4, insurance: 4, "employee-coverage": 4,
    "family-travel": 5, travel: 5, "employee-arrivals": 5, settling: 10,
  };
  for (const [id, days] of Object.entries(expected)) {
    const timing = getTaskTiming({ id });
    assert.equal(timing.days, days, id);
    assert.equal(timing.basis, "indicative", id);
    assert.equal(timing.unit, "working-days", id);
    assert.match(timing.label, new RegExp(`^${days} working days \\(indicative\\)`), id);
    assert.match(timing.note, /approved prototype planning estimate/i, id);
    assert.match(timing.note, /TODO\(verify\)/, id);
    assert.match(timing.note, /Reference [AB]\d{2}/, id);
  }
});

test("residence service time cannot become a full-process working-day duration", () => {
  for (const id of ["residency-completion", "family-residence", "partner-residence"]) {
    const timing = getTaskTiming({ id });
    assert.equal(timing.basis, "variable", id);
    assert.equal(timing.days, undefined, id);
    assert.equal(timing.unit, undefined, id);
    assert.match(timing.label, /appointments/i, id);
    assert.match(timing.note, /2 days for final residence-permit issuance/i, id);
    assert.match(timing.note, /without specifying working or calendar days/i, id);
    assert.match(timing.note, /medical and appointment waits/i, id);
    assert.match(timing.note, /Emirates ID delivery/i, id);
    assert.match(timing.note, /not a duration for this bundled task/i, id);
    assert.equal(timing.sourceUrl, "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e64");
  }
  assert.equal(getTaskTiming({ id: "establishment-card" }).days, 7);
  assert.equal(getTaskTiming({ id: "visa" }).days, 8);
  assert.match(getTaskTiming({ id: "establishment-card" }).note, /2 days for card issuance/);
  assert.match(getTaskTiming({ id: "visa" }).note, /2 days for visa issuance/);
  assert.equal(getTaskTiming({ id: "employee-permits" }).days, undefined);
  assert.match(getTaskTiming({ id: "employee-permits" }).note, /not these work-permit applications/i);
});

test("published ICP days preserve the unspecified unit and stay separate from offsets", () => {
  const sources = {
    "establishment-card": "64afe3c1035448005bd52e6d",
    visa: "64afe3c1035448005bd52e60",
    "founder-residence": "64afe3c1035448005bd52e60",
    "family-entry": "64afe3c1035448005bd52e60",
    "family-sponsorship": "64afe3c1035448005bd52e60",
    "residency-completion": "64afe3c1035448005bd52e64",
    "family-residence": "64afe3c1035448005bd52e64",
    "partner-residence": "64afe3c1035448005bd52e64",
  };
  for (const [id, serviceId] of Object.entries(sources)) {
    const published = getPublishedTaskTiming({ id });
    assert.ok(published, id);
    assert.equal(published.days, 2, id);
    assert.equal(published.basis, "published", id);
    assert.equal(published.unit, undefined, id);
    assert.match(published.label, /issuance only/, id);
    assert.match(published.note, /does not specify working or calendar days/, id);
    assert.match(published.note, /Do not use this as the whole task duration or a working-day offset/, id);
    assert.equal(published.sourceUrl, `https://icp.gov.ae/en/services-details/?serviceid=${serviceId}`, id);
    assert.notEqual(getTaskTiming({ id }).days, published.days, id);
  }
  for (const id of ["employee-permits", "school", "custom-task", "constructor", "__proto__"]) {
    assert.equal(getPublishedTaskTiming({ id }), undefined, id);
  }
  assert.equal(getPublishedTaskTiming({ id: "establishment-card", title: "Verify establishment card" }), undefined);
});

test("split tasks do not duplicate housing, route-decision or travel allowances", () => {
  for (const id of ["activity-scope", "family-home-shortlist", "housing", "founder-entry", "employee-entry"]) {
    assert.equal(getTaskTiming({ id }).days, undefined, id);
  }
  assert.equal(getTaskTiming({ id: "legal-form" }).days, 3);
  assert.equal(getTaskTiming({ id: "family-home" }).days, 30);
  assert.equal(getTaskTiming({ id: "housing-tenancy" }).days, 30);
  assert.equal(getTaskTiming({ id: "family-travel" }).days, 5);
  assert.equal(getTaskTiming({ id: "travel" }).days, 5);
  assert.match(getTaskTiming({ id: "family-home" }).label, /housing workflow including the shortlist/);
  assert.match(getTaskTiming({ id: "family-home" }).note, /do not count this twice/);
  assert.match(getTaskTiming({ id: "travel" }).note, /not time until physical arrival or freight delivery/);
});

test("provided housing and card verification do not inherit new-application durations", () => {
  const provided = getTaskTiming({ id: "housing", title: "Confirm employer housing" });
  assert.equal(provided.days, 7);
  assert.equal(provided.unit, "working-days");
  assert.match(provided.note, /not time finding a private lease/);
  assert.equal(getTaskTiming({ id: "housing-tenancy", title: "Obtain registered tenancy evidence" }).days, undefined);
  const existingCard = getTaskTiming({ id: "establishment-card", title: "Verify establishment card" });
  assert.equal(existingCard.basis, "variable");
  assert.equal(existingCard.days, undefined);
  assert.match(existingCard.note, /do not time this validity check or any renewal/);
});

test("school, household coverage and scheduling estimates stay explicitly conditional", () => {
  assert.match(getTaskTiming({ id: "school" }).note, /not an admissions deadline or guaranteed maximum/);
  assert.match(getTaskTiming({ id: "school" }).note, /Places, age and record eligibility, assessments, intake dates/);
  assert.match(getTaskTiming({ id: "school" }).note, /do not assume an August cutoff/);
  assert.match(getTaskTiming({ id: "insurance" }).note, /different activation dates/);
  assert.match(getTaskTiming({ id: "family-entry" }).label, /after route confirmation/);
  for (const id of ["partner-route", "family-records", "home-utilities", "work-permit-quota", "food-approvals"]) {
    assert.equal(getTaskTiming({ id }).basis, "variable", id);
    assert.equal(getTaskTiming({ id }).days, undefined, id);
  }
});

test("shared founder and employee notes name the responsible owner without assuming HR", () => {
  for (const id of ["family-insurance", "insurance", "employee-coverage"]) {
    const timing = getTaskTiming({ id });
    assert.equal(timing.days, 4, id);
    assert.match(timing.note, /insurer and responsible cover owner/, id);
    assert.doesNotMatch(timing.note, /\bHR\b/, id);
  }
  for (const id of ["residency-completion", "family-residence", "partner-residence"]) {
    const timing = getTaskTiming({ id });
    assert.match(timing.note, /responsible sponsor or case owner/, id);
    assert.doesNotMatch(timing.note, /\bHR\b|your employer/, id);
    assert.equal(timing.days, undefined, id);
  }
  const customCover = getTaskTiming({ id: "custom-cover", category: "insurance" });
  assert.match(customCover.note, /insurer or responsible cover owner/);
  assert.doesNotMatch(customCover.note, /\bHR\b/);
});

test("unmatched tasks and employer blockers need a concrete provider estimate", () => {
  for (const id of ["custom-task", "__proto__", "constructor", "toString"]) {
    const timing = getTaskTiming({ id, category: "school" });
    assert.equal(timing.label, "Provider estimate needed");
    assert.equal(timing.basis, "variable");
    assert.equal(timing.days, undefined);
    assert.equal(timing.sourceUrl, undefined);
    assert.match(timing.note, /school's admissions team/);
    assert.match(timing.note, /No approved duration matches/);
  }
  assert.match(getTaskTiming({ id: "custom-visa", category: "visa" }).note, /immigration or employment authority/);
  assert.match(getTaskTiming({ id: "custom-task" }).note, /responsible provider or task owner/);
  for (const id of ["employer-premises", "employer-licence", "employer-card", "employer-banking"]) {
    const timing = getTaskTiming({ id });
    assert.equal(timing.basis, "variable", id);
    assert.equal(timing.days, undefined, id);
    assert.match(timing.note, /Ask HR/, id);
  }
});

test("short step labels distinguish service-only times and shared workflow allowances", () => {
  const records = getTaskTiming({ id: "family-records" });
  assert.equal(records.days, undefined);
  assert.equal(records.sourceUrl, "https://www.mofa.gov.ae/en/services/attestation");
  assert.match(records.note, /inside the UAE/);
  assert.match(records.note, /outside the UAE/);
  assert.match(records.note, /not the entire records step/);
  assert.match(stepTimingLabel({ id: "family-records" }), /MoFA only/);
  assert.match(stepTimingLabel({ id: "residency-completion" }), /Issuance.*appointments/);
  assert.match(stepTimingLabel({ id: "housing" }), /Within.*home search/);
  assert.equal(stepTimingLabel({ id: "employee-entry" }), "Your flight date");
});
