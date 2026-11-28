import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { validateFeatureMap } from "./lib/feature-map.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const source = JSON.parse(fs.readFileSync(path.join(root, "docs/verification/feature-map.json"), "utf8"))

test("checked-in feature map has unique identities and live evidence paths", () => {
  assert.deepEqual(validateFeatureMap(source, root), [])
})

test("feature map drift gate rejects duplicate identities, missing evidence and entry drift", () => {
  const duplicate = structuredClone(source)
  duplicate.features.push(structuredClone(duplicate.features[0]))
  assert.match(validateFeatureMap(duplicate, root).join("\n"), /duplicate feature id/)

  const missing = structuredClone(source)
  missing.features[0].evidence.test = "backend/tests/Feature/MissingTest.php"
  assert.match(validateFeatureMap(missing, root).join("\n"), /test path missing/)

  const drift = structuredClone(source)
  drift.features[1].entry_point.value = "wosool:missing-command"
  assert.match(validateFeatureMap(drift, root).join("\n"), /entry point drift/)
})
