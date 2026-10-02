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

test("household intake accepts multiple children and rejects corrupt dates or preferences", () => {
  const details = { ...emptyDetails, name: "Avery", employerName: "Employer", workStartDate: "2026-11-10", childAge: "7, 12" };
  assert.deepEqual(childAges(details.childAge), [7, 12]);
  assert.ok(validCaseDetails(details, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, workStartDate: "2026-02-30" }, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, childAge: "7,," }, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, commuteMinutes: "-5" }, "employee", "with_family"));
  assert.ok(!validCaseDetails({ ...details, childAge: "19" }, "employee", "with_family"));
  const previousCase = restoreCaseDetails({ name: "Avery", employerName: "Employer", workStartDate: "2026-11-10", childAge: "7" });
  assert.ok(validCaseDetails(previousCase, "employee", "with_family"));
  assert.equal(previousCase?.partnerSponsorship, "unknown");
  assert.equal(previousCase?.establishmentCardReady, "unknown");
  assert.equal(restoreCaseDetails({ name: 42 }), undefined);
});
