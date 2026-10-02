import { test } from "node:test";
import assert from "node:assert/strict";
import { knowledge } from "../lib/ui/knowledge";
import { actionGuidesByTaskId } from "../lib/ui/action-guides";
import { serviceCategories, serviceProviders, servicesFor } from "../lib/ui/services";

function httpsUrl(value: string): URL {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", value);
  assert.equal(url.username, "", value);
  assert.equal(url.password, "", value);
  return url;
}

test("knowledge supplies distinct actionable FAQs with primary sources and role filters", () => {
  assert.ok(knowledge.length >= 12 && knowledge.length <= 16);
  assert.equal(new Set(knowledge.map((entry) => entry.id)).size, knowledge.length);
  const primaryDomains = ["icp.gov.ae", "added.gov.ae", "u.ae", "doh.gov.ae", "adrec.gov.ae", "adek.gov.ae", "bankfab.com", "adcb.com", "addc.ae", "mofa.gov.ae", "mohre.gov.ae", "tax.gov.ae"];
  for (const entry of knowledge) {
    assert.ok(entry.question.endsWith("?"), entry.id);
    assert.ok(entry.answer.trim() && entry.action.label.trim() && entry.source.title.trim(), entry.id);
    assert.ok(entry.topics.length > 0 && entry.topics.every((topic) => topic.trim()), entry.id);
    assert.ok(entry.roles.length > 0 && entry.roles.every((role) => role === "founder" || role === "employee"), entry.id);
    for (const link of [entry.action, entry.source]) {
      const hostname = httpsUrl(link.url).hostname;
      assert.ok(primaryDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)), entry.id);
    }
  }
  for (const topic of ["licensing", "visa", "family", "insurance", "housing", "school", "banking", "budget", "documents", "arrival", "hiring", "tax"]) {
    assert.ok(knowledge.some((entry) => entry.topics.includes(topic)), topic);
  }
});

test("guidance preserves partner, school and commercial-provider distinctions", () => {
  const partner = knowledge.find((entry) => entry.id === "unmarried-partner");
  assert.ok(partner);
  assert.match(partner.answer, /independent visa route/);
  for (const id of ["family-documents", "family-sponsorship", "family-records", "family-residence"]) {
    assert.match(actionGuidesByTaskId[id].caveat, /unmarried partner/);
  }
  for (const id of ["family-school", "school"]) {
    assert.match(actionGuidesByTaskId[id].caveat, /before committing to a lease/);
    assert.match(actionGuidesByTaskId[id].source.url, /EN_1_2\.pdf$/);
  }
  for (const guide of Object.values(actionGuidesByTaskId)) {
    for (const link of [guide.action, ...guide.discover]) {
      assert.notEqual(httpsUrl(link.url).hostname, "taqyeem.mohre.gov.ae");
    }
  }
  assert.ok(actionGuidesByTaskId["business-bank"].discover.every((link) => link.label.includes("(example)")));
});

test("service catalog has sourced editorial entries across the requested categories", () => {
  assert.ok(serviceProviders.length >= 20 && serviceProviders.length <= 25);
  assert.equal(new Set(serviceProviders.map((provider) => provider.id)).size, serviceProviders.length);
  assert.equal(new Set(serviceCategories.map((category) => category.id)).size, serviceCategories.length);
  const categories = new Set(serviceCategories.map((category) => category.id));
  for (const provider of serviceProviders) {
    assert.ok(categories.has(provider.category), provider.id);
    assert.equal(provider.placement, "editorial", provider.id);
    assert.ok(provider.summary.trim() && provider.note?.trim(), provider.id);
    assert.ok(provider.roles.length > 0, provider.id);
    httpsUrl(provider.url);
    const source = httpsUrl(provider.sourceUrl);
    if (source.hostname.endsWith(".gov.ae")) {
      assert.equal(provider.kind, "official", provider.id);
    } else {
      assert.equal(provider.kind, "commercial", provider.id);
      assert.match(provider.note ?? "", /Commercial example, not endorsed or paid/, provider.id);
    }
  }
  for (const category of serviceCategories) {
    assert.ok(serviceProviders.some((provider) => provider.category === category.id), category.id);
  }
  for (const category of ["housing", "banking", "insurance"]) {
    assert.ok(serviceCategories.some((entry) => entry.id === category && entry.roles?.includes("employee")), category);
  }
  for (const category of serviceCategories) {
    const providers = serviceProviders.filter((provider) => provider.category === category.id);
    if (providers.every((provider) => provider.roles.length === 1 && provider.roles[0] === "founder")) {
      assert.deepEqual(category.roles, ["founder"], category.id);
    } else {
      assert.deepEqual(category.roles, ["founder", "employee"], category.id);
    }
  }
});

test("new planning task IDs have guides that distinguish route planning, entry and residence", () => {
  for (const id of ["partner-route", "family-home-shortlist", "founder-entry", "employee-entry", "family-entry", "family-residence", "partner-residence"]) {
    const guide = actionGuidesByTaskId[id];
    assert.ok(guide?.whatToPrepare.length, id);
    assert.ok(guide.proofOfCompletion && guide.source.url, id);
  }
  assert.match(actionGuidesByTaskId["partner-route"].caveat, /can start before permits/);
  assert.match(actionGuidesByTaskId["family-home-shortlist"].caveat, /Research can start before/);
  assert.match(actionGuidesByTaskId["employee-entry"].proofOfCompletion, /entered the UAE/);
  assert.match(actionGuidesByTaskId["founder-entry"].proofOfCompletion, /entered the UAE/);
  assert.match(actionGuidesByTaskId["founder-residence"].proofOfCompletion, /entry permission/);
  assert.match(actionGuidesByTaskId["family-sponsorship"].proofOfCompletion, /before travel/);
  assert.match(actionGuidesByTaskId["family-entry"].proofOfCompletion, /before travel/);
  assert.match(actionGuidesByTaskId["family-residence"].proofOfCompletion, /residence permit.*after arrival/);
  assert.match(actionGuidesByTaskId["partner-residence"].proofOfCompletion, /residence permit.*after arrival/);
});

test("published ICP timings retain service-card scope rather than predicting the full process", () => {
  const timings = Object.values(actionGuidesByTaskId).flatMap((guide) => guide.publishedServiceTime ? [guide.publishedServiceTime] : []);
  assert.equal(new Set(timings.map((timing) => timing.sourceUrl)).size, 3);
  for (const timing of timings) {
    assert.equal(timing.label, "ICP lists 2 days");
    assert.equal(httpsUrl(timing.sourceUrl).hostname, "icp.gov.ae");
    assert.match(timing.conditions, /service-card duration only/i);
    assert.match(timing.conditions, /categor/i);
    assert.doesNotMatch(timing.label, /48|working|guarantee/i);
  }
  for (const id of ["founder-entry", "employee-entry", "partner-route", "family-travel", "licence"]) {
    assert.equal(actionGuidesByTaskId[id].publishedServiceTime, undefined, id);
  }
  assert.match(actionGuidesByTaskId["establishment-card"].caveat, /authorized-service-provider/);
  assert.match(actionGuidesByTaskId["family-records"].proofOfCompletion, /ICP's requested checklist/);
  assert.doesNotMatch(serviceProviders.find((provider) => provider.id === "doh-insurance")?.summary ?? "", /\bHR\b/);
});

test("service filtering keeps founder work out of employee results and matches food-sector inputs", () => {
  const employee = servicesFor({ role: "employee", businessType: "restaurant_fnb" });
  assert.ok(employee.some((provider) => provider.category === "transport"));
  assert.ok(employee.some((provider) => provider.category === "moving"));
  assert.ok(employee.every((provider) => provider.roles.includes("employee")));
  assert.ok(employee.every((provider) => !["company-setup", "interiors", "recruitment", "food-approvals"].includes(provider.category)));
  const founder = servicesFor({ role: "founder", businessType: "restaurant_fnb" });
  assert.ok(founder.some((provider) => provider.category === "company-setup"));
  assert.ok(founder.some((provider) => provider.category === "interiors"));
  assert.ok(founder.some((provider) => provider.category === "food-approvals"));
  assert.deepEqual(servicesFor({ role: "founder", businessType: "Specialty coffee roastery with a caf\u00e9" }), founder);
  for (const businessType of [undefined, "", "tech_startup", "consultancy", "trading", "unrecognized business"]) {
    const matches = servicesFor({ role: "founder", businessType });
    assert.ok(matches.some((provider) => provider.category === "company-setup"));
    assert.ok(matches.every((provider) => !provider.sectors?.length), String(businessType));
  }
  assert.equal(serviceProviders.length, 25);
});
