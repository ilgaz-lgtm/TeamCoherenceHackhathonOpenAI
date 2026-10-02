import { test } from "node:test";
import assert from "node:assert/strict";
import { demoCompany, demoEmployee, demoRelocation } from "../lib/demo/data";
import { actionGuidesByTaskId, getActionGuide, quickActionLinks } from "../lib/ui/action-guides";
import { buildFounderTasks } from "../lib/ui/founder-plan";
import { employeeAnswersFromFixture, founderDemo } from "../lib/ui/personas";
import { buildEmployeeTasks } from "../lib/ui/scope";

const officialDomains = [
  "added.gov.ae", "adafsa.gov.ae", "icp.gov.ae", "centralbank.ae",
  "mohre.gov.ae", "u.ae", "doh.gov.ae", "tamm.abudhabi",
  "adek.gov.ae", "adrec.gov.ae", "dari.ae", "addc.ae",
  "tdra.gov.ae", "bankfab.com", "adcb.com", "propertyfinder.ae",
  "bayut.com", "nadiaglobal.com", "tascoutsourcing.com",
  "transguardgroup.com", "damanhealth.ae", "adnic.ae", "tax.gov.ae",
];

test("every current founder and employee task has a sourced action guide", () => {
  const employeeAnswers = employeeAnswersFromFixture(demoCompany, demoEmployee);
  const tasks = [
    ...buildFounderTasks(founderDemo),
    ...buildEmployeeTasks(demoRelocation.plan, employeeAnswers, demoCompany, demoEmployee),
  ];

  for (const task of tasks) {
    const guide = getActionGuide(task);
    assert.ok(guide, `Missing action guide for ${task.id}`);
    assert.ok(guide.whatToPrepare.length > 0, task.id);
    assert.ok(guide.proofOfCompletion.trim(), task.id);
    assert.ok(guide.caveat.trim(), task.id);
    assert.match(guide.source.lastChecked, /^\d{4}-\d{2}-\d{2}$/);
  }

  assert.equal(getActionGuide({ id: "unknown-task" }), undefined);
});

test("guide links stay on official authority and provider domains", () => {
  for (const [id, guide] of Object.entries(actionGuidesByTaskId)) {
    for (const link of [guide.action, ...guide.discover, guide.source]) {
      const url = new URL(link.url);
      assert.equal(url.protocol, "https:", `${id}: ${link.url}`);
      assert.ok(officialDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)), `${id}: ${link.url}`);
    }
  }
});

test("a practical step opens the relevant service, not only an authority directory", () => {
  const housing = quickActionLinks({ id: "housing", title: "Shortlist suitable housing" });
  assert.ok(housing.some((link) => new URL(link.url).hostname.endsWith("propertyfinder.ae")));
  assert.ok(housing.some((link) => new URL(link.url).hostname.endsWith("bayut.com")));
  assert.equal(quickActionLinks({ id: "housing", title: "Confirm employer housing" }).length, 1);
  assert.ok(quickActionLinks({ id: "family-records", title: "Gather family records" }).some((link) => link.url.includes("mofa.gov.ae")));
  assert.ok(quickActionLinks({ id: "residency-completion", title: "Residence" }).some((link) => link.url === "https://capitalhealth.ae/"));
  assert.ok(quickActionLinks({ id: "employee-entry", title: "Travel" }).some((link) => link.url === "https://www.etihad.com/en/flights/"));
});
