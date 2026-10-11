import assert from "node:assert/strict";
import test from "node:test";
import { firstErrorStep, initialFormData, restoreDraft, validateStep } from "./application-form";

test("existing Arabic drafts preserve applicant details while normalizing API stage values", () => {
  const restored = restoreDraft(JSON.stringify({ full_name: "Founder", stage: "البذرة", sector: "التقنية الصحية", email: ["unexpected"], unknown: "discard" }));
  assert.equal(restored.full_name, "Founder");
  assert.equal(restored.stage, "Seed");
  assert.equal(restored.sector, "التقنية الصحية");
  assert.equal(restored.email, "");
  assert.equal(Object.hasOwn(restored, "unknown"), false);
});

test("corrupt or invalid drafts cannot break a new application", () => {
  for (const saved of [null, "not JSON", "null", "[]", JSON.stringify({ stage: "Unknown", sector: "Unknown" })]) {
    assert.deepEqual(restoreDraft(saved), initialFormData);
  }
});

test("server validation routes users back to the earliest affected form step", () => {
  assert.equal(firstErrorStep({ email: "Already applied", motivation: "Required" }), 1);
  assert.equal(firstErrorStep({ company_website: "Invalid URL", what_you_need: "Too long" }), 2);
  assert.equal(firstErrorStep({ what_you_offer: "Too long" }), 3);
});

test("validation checks optional server-limited answers as well as required answers", () => {
  const form = { ...initialFormData, motivation: "Meet and help other founders", what_you_offer: "a".repeat(1001) };
  assert.equal(validateStep(3, form, false).what_you_offer, "Use no more than 1000 characters.");
  assert.equal(validateStep(3, { ...form, what_you_offer: "a".repeat(1000) }, false).what_you_offer, undefined);
  assert.ok(validateStep(3, { ...form, motivation: " " }, true).motivation);
});

test("public profile links require a complete HTTP URL and email accepts surrounding whitespace", () => {
  const form = { ...initialFormData, full_name: "Founder", email: " founder@example.com ", phone: "+966123456789", location: "Riyadh" };
  assert.deepEqual(validateStep(1, { ...form, linkedin_url: "https://linkedin.com/in/founder" }, false), {});
  for (const linkedin_url of ["https://", "javascript:alert(1)", "linkedin.com/in/founder"]) {
    assert.ok(validateStep(1, { ...form, linkedin_url }, false).linkedin_url);
  }
});
