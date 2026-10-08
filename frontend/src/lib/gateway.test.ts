import assert from "node:assert/strict";
import test from "node:test";
import { verificationPath } from "./gateway";
const valid =
  "/api/v1/auth/email/verify/123/" +
  "a".repeat(40) +
  "?expires=1891456120&signature=" +
  "b".repeat(64);
test("verification preserves a correctly structured signed API path", () =>
  assert.equal(verificationPath(valid), valid));
test("verification refuses external destinations and malformed tokens", () => {
  for (const v of [
    null,
    "https://evil.test/" + valid,
    "//evil.test",
    "/api/v1/auth/logout",
    "/api/v1/auth/email/verify/1/hash?expires=2",
    valid.replace("expires=1891456120", "expires=oops"),
  ])
    assert.equal(verificationPath(v), null);
});
