import fs from "node:fs"
import path from "node:path"

const allowedStatuses = new Set([
  "unverified",
  "verified-source-and-isolated-test",
  "verified-source-pending-hosted-test",
])

export function validateFeatureMap(map, root) {
  const problems = []
  if (map?.schema_version !== 1) problems.push("schema_version must be 1")
  if (map?.project !== "wosool") problems.push("project must be wosool")
  if (!Array.isArray(map?.features) || map.features.length === 0) problems.push("features must be a non-empty array")

  const ids = new Set()
  for (const feature of map?.features || []) {
    if (!/^([A-Z]+-)+[0-9]{3}$/.test(feature?.id || "")) problems.push(`invalid feature id: ${feature?.id || "missing"}`)
    if (ids.has(feature?.id)) problems.push(`duplicate feature id: ${feature.id}`)
    ids.add(feature?.id)
    if (!allowedStatuses.has(feature?.status)) problems.push(`invalid status for ${feature?.id || "missing"}`)
    if (!Array.isArray(feature?.states) || feature.states.length < 2) problems.push(`states missing for ${feature?.id || "missing"}`)

    for (const [label, relative] of Object.entries({
      entry_source: feature?.entry_point?.source,
      implementation: feature?.evidence?.implementation,
      test: feature?.evidence?.test,
    })) {
      if (typeof relative !== "string" || relative === "" || path.isAbsolute(relative) || relative.includes("..")) {
        problems.push(`${label} path invalid for ${feature?.id || "missing"}`)
      } else if (!fs.existsSync(path.join(root, relative))) {
        problems.push(`${label} path missing for ${feature?.id || "missing"}: ${relative}`)
      }
    }

    const source = feature?.entry_point?.source
    const value = feature?.entry_point?.value
    if (typeof source === "string" && typeof value === "string" && fs.existsSync(path.join(root, source))) {
      const contents = fs.readFileSync(path.join(root, source), "utf8")
      const token = feature.entry_point.type === "http" ? value.split("/").at(-1) : value
      if (!contents.includes(token)) problems.push(`entry point drift for ${feature.id}: ${value}`)
    }
  }

  return problems
}
