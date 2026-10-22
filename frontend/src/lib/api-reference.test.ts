import { test } from "node:test"
import assert from "node:assert/strict"
import { apiEndpoints, arabicOperationCopy } from "./api-reference"
import { publicApiSpec } from "./public-api-spec"

const arabic = /[؀-ۿ]/

test("every public endpoint has an Arabic summary, and an Arabic description when the contract has one", () => {
  for (const [path, spec] of Object.entries(publicApiSpec.paths)) {
    const operation = spec.get as { operationId: string; description?: string }
    const copy = arabicOperationCopy[operation.operationId]
    assert.ok(copy, `${path} has no Arabic copy`)
    assert.match(copy.summary, arabic, path)
    assert.equal(Boolean(copy.description), Boolean(operation.description), `${path} description parity`)
    if (copy.description) assert.match(copy.description, arabic, path)
  }
})

test("Arabic rows use Arabic copy; English rows keep the OpenAPI wording; parameter names are unchanged", () => {
  const ar = apiEndpoints("ar"), en = apiEndpoints("en")
  assert.equal(ar.length, Object.keys(publicApiSpec.paths).length)
  const news = (rows: typeof ar) => rows.find(row => row.path === "/api/v1/news")!
  assert.equal(news(ar).summary, "قراءة الأخبار المنشورة")
  assert.equal(news(en).summary, "Read published news")
  assert.match(news(en).description ?? "", /per_page is clamped to 1–50/)
  assert.deepEqual(news(ar).parameters, news(en).parameters)
  assert.ok(news(en).parameters.includes("per_page"))
  assert.deepEqual(ar.find(row => row.path === "/api/health")!.parameters, [])
})
