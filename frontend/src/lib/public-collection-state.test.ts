import test from "node:test"
import assert from "node:assert/strict"
import { ApiError } from "./api"
import { beginCollection, failCollection, initialCollection, receiveCollection } from "./public-collection-state"

const initial = () => initialCollection<{ id: number; name?: string }>("/founders\u0000ar")
const pageOne = () => receiveCollection(initial(), { data: [{ id: 1, name: "Public" }], meta: { last_page: 2, total: 2 } }, 1)

test("loading and successful empty responses never authorize snapshot restoration", () => {
  assert.equal(initial().snapshotAllowed, false)
  const empty = receiveCollection(initial(), { data: [], meta: { total: 0 } }, 1)
  assert.equal(empty.snapshotAllowed, false)
  assert.equal(empty.loading, false)
  assert.deepEqual(empty.items, [])
  assert.equal(failCollection(beginCollection(empty, 1), new ApiError(503, "Outage")).snapshotAllowed, false)
})

test("initial network/server outages permit a snapshot; retries hide it while checking", () => {
  for (const error of [new TypeError("Network error"), new Error("Invalid JSON"), new ApiError(500, "Error"), new ApiError(503, "Outage")]) {
    const failed = failCollection(initial(), error)
    assert.equal(failed.snapshotAllowed, true)
    assert.equal(beginCollection(failed, 1).snapshotAllowed, false)
    assert.equal(receiveCollection(beginCollection(failed, 1), { data: [] }, 1).snapshotAllowed, false)
  }
})

test("all client errors block snapshots, including denial, withdrawal, validation and throttling", () => {
  for (const status of [400, 401, 403, 404, 410, 422, 429]) {
    const failed = failCollection(initial(), new ApiError(status, "Unavailable"))
    assert.equal(failed.snapshotAllowed, false)
    // A later outage must not undo the authoritative response within this collection.
    assert.equal(failCollection(beginCollection(failed, 1), new ApiError(503, "Outage")).snapshotAllowed, false)
  }
  assert.equal(failCollection(initial(), null).snapshotAllowed, false)
})

test("denial on a later page clears loaded records/counts and retries from page one", () => {
  const failed = failCollection(beginCollection(pageOne(), 2), new ApiError(403, "Denied"))
  assert.deepEqual(failed.items, [])
  assert.deepEqual(failed.meta, {})
  assert.equal(failed.nextPage, null)
  assert.equal(failed.failedPage, 1)
  assert.equal(failed.snapshotAllowed, false)
})

test("later-page outages retain live records and retry that page without snapshot mixing", () => {
  const failed = failCollection(beginCollection(pageOne(), 2), new ApiError(503, "Outage"))
  assert.deepEqual(failed.items, [{ id: 1, name: "Public" }])
  assert.equal(failed.failedPage, 2)
  assert.equal(failed.snapshotAllowed, false)
  const recovered = receiveCollection(beginCollection(failed, 2), { data: [{ id: 1, name: "Updated" }, { id: 2 }], meta: { last_page: 2, total: 2 } }, 2)
  assert.deepEqual(recovered.items, [{ id: 1, name: "Updated" }, { id: 2 }])
  assert.equal(recovered.nextPage, null)
  assert.equal(recovered.error, null)
})

test("a new resource starts isolated; page-one retries reset stale counts", () => {
  const retry = beginCollection(pageOne(), 1)
  assert.deepEqual(retry.items, [])
  assert.deepEqual(retry.meta, {})
  assert.equal(retry.nextPage, null)
  assert.equal(failCollection(retry, new TypeError("offline")).snapshotAllowed, false)
  const other = initialCollection("/news\u0000en")
  assert.deepEqual(other.items, [])
  assert.equal(other.snapshotBlocked, false)
})
