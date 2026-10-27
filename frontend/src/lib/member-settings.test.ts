import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { memberSettingKeys, memberSettingLabel, memberSettingsCopy } from "./member-settings"

const arabic = /[؀-ۿ]/
const backendDefaults = readFileSync(new URL("../../../backend/app/Models/UserSetting.php", import.meta.url), "utf8")

test("every preference the API stores is listed, and nothing else", () => {
  for (const [group, keys] of Object.entries(memberSettingKeys)) {
    const block = backendDefaults.match(new RegExp(`'${group}' => \\[([\\s\\S]*?)\\]`))?.[1] ?? ""
    const apiKeys = [...block.matchAll(/'([a-z_]+)' =>/g)].map((m) => m[1]).sort()
    assert.deepEqual([...keys].sort(), apiKeys, group)
  }
})

test("each preference has a written label in Arabic and English", () => {
  for (const key of Object.values(memberSettingKeys).flat()) {
    const ar = memberSettingLabel("ar", key)
    const en = memberSettingLabel("en", key)
    assert.match(ar, arabic, key)
    assert.doesNotMatch(en, arabic, key)
    assert.doesNotMatch(en, /_/, key)
    assert.match(en, /^[A-Z]/, key)
  }
})

test("an unknown key from a newer API stays readable", () => {
  assert.equal(memberSettingLabel("en", "new_feature_alerts"), "new feature alerts")
})

test("settings page copy has the same keys in both languages, Arabic in Arabic", () => {
  assert.deepEqual(Object.keys(memberSettingsCopy.ar).sort(), Object.keys(memberSettingsCopy.en).sort())
  for (const value of Object.values(memberSettingsCopy.ar)) assert.match(value, arabic)
})

test("the settings page renders labels from the dictionary, not raw keys or English literals", () => {
  const page = readFileSync(new URL("../app/dashboard/settings/page.tsx", import.meta.url), "utf8")
  assert.doesNotMatch(page, /replaceAll\("_"/)
  assert.doesNotMatch(page, />\s*(Account Settings|Display Name|Notification Preferences|Save Settings)\s*</)
  assert.doesNotMatch(page, /\bmr-2\b/)
})

test("dashboard navigation names the accelerator in the visitor's language", () => {
  const layout = readFileSync(new URL("../app/dashboard/layout.tsx", import.meta.url), "utf8")
  assert.doesNotMatch(layout, />EO Riyadh Accelerator</)
  assert.doesNotMatch(layout, /alt="Wosool logo"/)
})
