import test from "node:test"
import assert from "node:assert/strict"
import { checkDeploymentEnvironment, checkLocalBuildEnvironment } from "./hosting-preflight.mjs"

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

test("release builds reject loopback and wildcard origins even with HTTPS", () => {
  for (const host of ["localhost", "app.localhost", "127.0.0.1", "127.1.2.3", "[::1]", "0.0.0.0", "[::]"]) {
    assert.throws(() => checkDeploymentEnvironment({ ...valid, NEXT_PUBLIC_API_URL: `https://${host}` }), /NEXT_PUBLIC_API_URL/)
  }
})

test("local preview builds require explicit, separate loopback origins", () => {
  const local = { NEXT_PUBLIC_SITE_URL: "http://localhost:3000", NEXT_PUBLIC_API_URL: "http://localhost:8000" }
  assert.doesNotThrow(() => checkLocalBuildEnvironment(local))
  assert.throws(() => checkLocalBuildEnvironment({}), /loopback/)
  assert.throws(() => checkLocalBuildEnvironment(valid), /loopback/)
  assert.throws(() => checkLocalBuildEnvironment({ ...local, NEXT_PUBLIC_API_URL: "http://localhost:3000/" }), /different origins/)
  assert.throws(() => checkLocalBuildEnvironment({ ...local, NEXT_PUBLIC_API_URL: "http://localhost:8000/api" }), /loopback/)
})
