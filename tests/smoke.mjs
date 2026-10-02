import assert from "node:assert/strict";
const base = process.env.BASE_URL || "http://localhost:3000";
async function get(path) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  return response.json();
}
async function post(path, body, expectedStatus = 200) {
  const response = await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  assert.equal(response.status, expectedStatus, path);
  return response.json();
}
const company = await get("/api/demo/company");
const employee = await get("/api/demo/employee");
const relocation = await get("/api/demo/relocation");
const personas = await get("/api/demo/personas");
assert.equal(personas.length, 2);
const maya = personas.find((persona) => persona.id === "maya");
const mayaPlan = await post("/api/ai/plan", { companyPolicy: maya.companyPolicy, employee: maya.employee });
assert.deepEqual(mayaPlan, maya.relocation.plan);
assert.equal(mayaPlan.tasks.length, 3);
assert.ok(mayaPlan.tasks.every((task) => task.rationale && task.rationale.length <= 220));
assert.equal((await post("/api/providers/housing/search", maya.housingRequest)).results.length, 1);
const request = { companyPolicy: company.policy, employee };
const plan = await post("/api/ai/plan", request);
assert.deepEqual(plan, relocation.plan);
assert.deepEqual(plan, await post("/api/ai/plan", request));
assert.equal((await post("/api/ai/next-action", { plan })).taskId, "visa");
const completed = structuredClone(plan);
completed.tasks.forEach((task) => { task.status = "completed"; });
assert.equal((await post("/api/ai/next-action", { plan: completed })).taskId, null);
const invalid = structuredClone(plan);
invalid.tasks[0].dependsOn = ["missing"];
await post("/api/ai/next-action", { plan: invalid }, 400);
const housing = { bedrooms: 3, maxAnnualRentAED: 180000, officeArea: "ADGM", maxCommuteMinutes: 25, preferredAreas: ["Al Reem Island", "Saadiyat Island"] };
const result = await post("/api/providers/housing/search", housing);
assert.equal(result.provider.mode, "mock");
assert.equal(result.results.length, 2);
assert.equal((await post("/api/providers/housing/search", { ...housing, maxAnnualRentAED: 1000 })).results.length, 0);
assert.equal((await post("/api/providers/housing/search", { ...housing, officeArea: "Unknown" })).results.length, 0);
for (const path of ["/api/ai/plan", "/api/ai/next-action", "/api/providers/housing/search"]) {
  assert.equal((await post(path, {}, 400)).error.code, "VALIDATION_ERROR");
  const response = await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_JSON");
}
console.log("PASS: all seven endpoints, both personas, demo determinism, validation, dependency handling and housing filters");
