import { test } from "node:test";
import assert from "node:assert/strict";
import { connectGuidance, connectProblem, type ConnectProblem } from "./opportunity-connect";

const verified = { email_verified_at: "2026-10-01T00:00:00Z" };

test("each API refusal maps to its own next step", () => {
  assert.equal(connectProblem(401, null, null), "sign_in");
  assert.equal(connectProblem(429, null, verified), "rate_limited");
  assert.equal(connectProblem(409, { message: "Applications are unavailable." }, verified), "closed");
  assert.equal(connectProblem(404, null, verified), "unavailable");
  assert.equal(connectProblem(422, { reason: "profile_incomplete" }, verified), "profile_incomplete");
  assert.equal(connectProblem(422, { message: "The given data was invalid." }, verified), "unavailable");
  assert.equal(connectProblem(403, { reason: "profile_pending" }, verified), "profile_pending");
  assert.equal(connectProblem(403, { reason: "profile_inactive" }, verified), "profile_inactive");
  assert.equal(connectProblem(500, null, verified), "failed");
});

test("middleware 403s are told apart: unverified email, suspended profile, not a member", () => {
  // Laravel's `verified` middleware refuses before membership is checked.
  assert.equal(connectProblem(403, { message: "Your email address is not verified." }, { email_verified_at: null }), "verify_email");
  assert.equal(connectProblem(403, { message: "Your founder profile must be active to access the community." }, verified), "profile_inactive");
  assert.equal(connectProblem(403, { message: "Member access is required." }, verified), "membership");
  assert.equal(connectProblem(403, null, verified), "membership");
  // The signed-in user may not have loaded yet when the button is pressed.
  assert.equal(connectProblem(403, { message: "Your email address is not verified." }, null), "verify_email");
  assert.equal(connectProblem(403, { message: "Member access is required." }, null), "membership");
  assert.equal(connectProblem(403, { message: "Your founder profile must be active to access the community.", reason: "profile_pending" }, verified), "profile_pending");
});

test("guidance has Arabic and English copy and only internal links", () => {
  const problems: ConnectProblem[] = ["sign_in", "verify_email", "membership", "profile_incomplete", "profile_pending", "profile_inactive", "closed", "unavailable", "rate_limited", "failed"];
  for (const problem of problems) {
    const ar = connectGuidance(problem, true);
    const en = connectGuidance(problem, false);
    assert.match(ar.message, /[؀-ۿ]/, problem);
    assert.doesNotMatch(en.message, /[؀-ۿ]/, problem);
    assert.notEqual(ar.message, en.message);
    assert.equal(ar.links.length, en.links.length, problem);
    for (const link of [...ar.links, ...en.links]) assert.match(link.href, /^\/[a-z]/, problem);
  }
});

test("an unverified member is not sent to the membership application", () => {
  const guidance = connectGuidance("verify_email", false);
  assert.ok(!guidance.links.some((link) => link.href === "/apply"));
  assert.match(guidance.message, /email/i);
  assert.deepEqual(connectGuidance("profile_incomplete", false).links.map((l) => l.href), ["/dashboard/profile"]);
  assert.deepEqual(connectGuidance("membership", true).links.map((l) => l.href), ["/apply"]);
});
