import assert from "node:assert/strict"
import test from "node:test"
import { ApiError } from "./api"
import { readFounderSpotlight } from "./founder-spotlight-request"

const start = "d91ffa3c-9b25-4c71-a946-384bd5cf5aab"
const legacy = "The route v1/founders/discover/cards could not be found."

test("only a confirmed legacy router uses the existing public founder directory", async () => {
  const calls: string[] = []
  const result = await readFounderSpotlight(start, new AbortController().signal, async (path, params) => {
    calls.push(path)
    if (path === "/founders/discover/cards") {
      assert.deepEqual(params, { start })
      throw new ApiError(404, legacy)
    }
    assert.deepEqual(params, { page: 1, per_page: 24 })
    return { data: [] }
  })
  assert.deepEqual(calls, ["/founders/discover/cards", "/founders"])
  assert.deepEqual(result.data, [])
})

test("empty, withdrawn, denied, throttled, unavailable and aborted discovery never trigger another read", async () => {
  let calls = 0
  const signal = new AbortController().signal
  assert.deepEqual(await readFounderSpotlight(start, signal, async () => { calls++; return { data: [] } }), { data: [] })
  assert.equal(calls, 1)
  for (const [status, message, aborted] of [[404, "Not Found", false], [410, legacy, false], [403, legacy, false], [401, legacy, false],
    [429, legacy, false], [503, legacy, false], [404, legacy, true]] as const) {
    let tries = 0
    const controller = new AbortController()
    if (aborted) controller.abort()
    const error = new ApiError(status, message)
    await assert.rejects(readFounderSpotlight(start, controller.signal, async () => { tries++; throw error }), error)
    assert.equal(tries, 1)
  }
})
