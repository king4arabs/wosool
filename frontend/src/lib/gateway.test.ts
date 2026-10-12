import assert from "node:assert/strict";
import test from "node:test";
import { gatewayError, verificationPath } from "./gateway";
import { ApiError } from "./api";
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

test("gateway failures distinguish server and session errors from an unconfirmed network response", () => {
  assert.match(gatewayError(new ApiError(419, "CSRF token mismatch"), false), /session expired/);
  assert.match(gatewayError(new ApiError(500, "Internal Server Error"), true), /خطأ في الخدمة/);
  assert.match(gatewayError(new TypeError("Failed to fetch"), false), /could not be confirmed/);
});
