import { test } from "node:test";
import assert from "node:assert/strict";
import { childAges, emptyDetails, restoreCaseDetails, validCaseDetails } from "../lib/ui/case-details";
import { localTask } from "../lib/ui/scope";
import { reconcileCompleted, targetSummary, taskState } from "../lib/ui/workspace";

test("restored progress cannot clear a dependent action without its evidence chain", () => {
  const tasks = [localTask("licence", "Licence", "", "licensing", "company"), localTask("card", "Card", "", "licensing", "company", ["licence"]), localTask("residence", "Residence", "", "visa", "self", ["card"])];
  assert.deepEqual([...reconcileCompleted(tasks, ["card", "residence", "unknown"])], []);
  assert.deepEqual([...reconcileCompleted(tasks, ["licence", "card", "residence"])], ["licence", "card", "residence"]);
  assert.deepEqual([...reconcileCompleted(tasks, ["licence", "residence"])], ["licence"]);
});

test("employer-held entry permission has the same state in every workspace view", () => {
  const visa = localTask("visa", "Entry permit", "", "visa", "people");
  const external = [{ id: "employer-card", title: "Employer establishment card", description: "" }];
  assert.deepEqual(taskState(visa, [visa], new Set(), external), { status: "blocked", waitingOn: ["Employer establishment card"] });
  assert.equal(reconcileCompleted([visa], ["visa"], external).size, 0);
  assert.equal(taskState(visa, [visa], new Set(["visa"]), external).status, "done");
});

test("arrival target changes the date brief without fabricating a clearance prediction", () => {
  assert.equal(targetSummary("2026-12-01", "2026-10-02").days, 60);
  assert.equal(targetSummary("2026-10-01", "2026-10-02").label, "1 day past target");
  assert.equal(targetSummary("2026-10-02", "2026-10-02").label, "Target is today");
  assert.equal(targetSummary(undefined, "2026-10-02").days, undefined);
  assert.equal(targetSummary("not-a-date", "2026-10-02").days, undefined);
});

test("custom plans need no personal, company, employer name or work start date", () => {
  assert.ok(validCaseDetails(emptyDetails, "employee", "solo"));
  assert.ok(validCaseDetails(emptyDetails, "founder", "solo", "no"));
  assert.ok(validCaseDetails({ ...emptyDetails, businessType: "consultancy", plannedHires: "0" }, "founder", "solo", "yes"));
});

test("household intake accepts multiple children and preserves their ages and partner route", () => {
  const details = { ...emptyDetails, childAge: "7, 12", partnerSponsorship: "independent" };
  assert.deepEqual(childAges(details.childAge), [7, 12]);
  assert.ok(validCaseDetails(details, "employee", "with_family"));
  assert.ok(validCaseDetails(details, "founder", "with_family", "no"));
  assert.deepEqual(restoreCaseDetails(details), details);
  assert.ok(!validCaseDetails(emptyDetails, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, childAge: "7,," }, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, childAge: "19" }, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, partnerSponsorship: "partner" }, "employee", "with_family"));
  assert.deepEqual(childAges("0, 18"), [0, 18]);
});

test("established founders retain industry and card inputs and explicitly confirm hire count", () => {
  const details = { ...emptyDetails, businessType: "restaurant_fnb", establishmentCardReady: "yes", plannedHires: "3" };
  assert.ok(validCaseDetails(details, "founder", "solo", "yes"));
  assert.deepEqual(restoreCaseDetails(details), details);
  assert.ok(!validCaseDetails(emptyDetails, "founder", "solo", "yes"));
  assert.ok(!validCaseDetails({ ...details, businessType: "unrecognized" }, "founder", "solo", "yes"));
  assert.ok(!validCaseDetails({ ...details, establishmentCardReady: "assumed" }, "founder", "solo", "yes"));
  assert.ok(!validCaseDetails({ ...details, plannedHires: "51" }, "founder", "solo", "yes"));
  assert.equal(restoreCaseDetails({})?.plannedHires, "");
});

test("housing intake preserves useful preferences and allows unknown budgets and locations", () => {
  const details = { ...emptyDetails, housingBudgetAED: "120000", bedrooms: "3", commuteMinutes: "35", workLocation: "Yas Island" };
  assert.ok(validCaseDetails(details, "employee", "solo"));
  assert.ok(validCaseDetails(details, "founder", "solo", "no"));
  assert.deepEqual(restoreCaseDetails(details), details);
  assert.ok(validCaseDetails(emptyDetails, "employee", "solo"));
  assert.ok(!validCaseDetails({ ...details, housingBudgetAED: "0" }, "employee", "solo"));
  assert.ok(!validCaseDetails({ ...details, bedrooms: "1.5" }, "employee", "solo"));
  assert.ok(!validCaseDetails({ ...details, commuteMinutes: "-5" }, "employee", "solo"));
  assert.ok(!validCaseDetails({ ...details, workLocation: "x".repeat(101) }, "employee", "solo"));
});

test("legacy saved names and dates are discarded while mechanism inputs restore", () => {
  const previousCase = restoreCaseDetails({ name: "Avery", employerName: "Employer", workStartDate: "2026-11-10", childAge: "7" });
  assert.ok(validCaseDetails(previousCase, "employee", "with_family"));
  assert.deepEqual(previousCase, { ...emptyDetails, childAge: "7" });
  assert.equal(previousCase?.partnerSponsorship, "unknown");
  assert.equal(previousCase?.establishmentCardReady, "unknown");
  assert.deepEqual(restoreCaseDetails({ name: 42, businessName: "Old business", employerName: false, workStartDate: "2026-02-30" }), emptyDetails);
  assert.equal(restoreCaseDetails({ commuteMinutes: 42 }), undefined);
  assert.equal(restoreCaseDetails([]), undefined);
});
