import test from "node:test"
import assert from "node:assert/strict"
import { checkDeploymentEnvironment } from "./hosting-preflight.mjs"

const valid = {
  NEXT_PUBLIC_SITE_URL: "https://wosool.org",
  NEXT_PUBLIC_API_URL: "https://api.wosool.org",
  NEXT_PUBLIC_ENABLE_DEMO_CONTENT: "false",
}

test("accepts separate HTTPS website and API origins", () => {
  assert.deepEqual(checkDeploymentEnvironment(valid), {
    siteOrigin: "https://wosool.org",
    apiOrigin: "https://api.wosool.org",
  })
  assert.doesNotThrow(() => checkDeploymentEnvironment({
    ...valid,
    NEXT_PUBLIC_SITE_URL: "https://staging.wosool.org",
    NEXT_PUBLIC_API_URL: "https://api-staging.wosool.org",
  }))
})

test("rejects missing or insecure origins", () => {
  assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_API_URL: "" }), /NEXT_PUBLIC_API_URL/)
  assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_API_URL: "http:\/\/localhost:8000" }), /HTTPS origin/)
  assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_SITE_URL: "https://user:pass@wosool.org/" }), /HTTPS origin/)
  assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_API_URL: "https://api.wosool.org/api" }), /HTTPS origin/)
})

test("rejects demonstration data and a shared site/API origin", () => {
  assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_ENABLE_DEMO_CONTENT: "true" }), /explicitly false/)
  assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_API_URL: valid.NEXT_PUBLIC_SITE_URL }), /different origins/)
})
