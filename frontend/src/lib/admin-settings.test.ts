import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { AdminSettingsResponse } from "./admin"
import {
  adminSettingsCopy,
  settingsFieldErrors,
  settingsFieldId,
  settingsFields,
  settingsLimits,
  settingsPayload,
  toSettingsForm,
  validateSettingsForm,
} from "./admin-settings"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/settings/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/SettingsController.php", import.meta.url), "utf8")

const loaded: AdminSettingsResponse = {
  general: {
    site_name: "Wosool",
    site_url: "https://wosool.org",
    site_description: "Founder community",
    timezone: "Asia/Riyadh",
    default_language: "ar",
    maintenance_mode: false,
    registration_open: true,
  },
  email: {
    from_name: "Wosool",
    from_email: "hello@wosool.org",
    reply_to: null,
    smtp_host: "smtp.resend.com",
    notifications: { weekly_digest: true, new_event_rsvp: false },
  },
  security: { require_2fa: true, session_timeout_minutes: 30, password_policy: "12+ characters", api_rate_limit: 100 },
}

test("admin settings copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminSettingsCopy.ar).sort(), Object.keys(adminSettingsCopy.en).sort())
  for (const [key, value] of Object.entries(adminSettingsCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(adminSettingsCopy.en)) assert.doesNotMatch(value, arabic, key)
})

test("the page follows the admin's language, labels every field and says the values are not applied", () => {
  assert.doesNotMatch(page, arabic, "page still has fixed Arabic text")
  assert.doesNotMatch(page, />\s*(Settings|Save Changes|General|Security|Loading settings…)\s*</, "page still has fixed English text")
  assert.match(page, /adminSettings\(locale\)/)
  assert.match(page, /copy\.notice/)
  assert.doesNotMatch(page, /\b(?:ml|mr|pl|pr|left|right)-\d/, "use logical spacing so RTL and LTR both work")
  for (const name of settingsFields) assert.match(page, new RegExp(`field\\("${name.replace(".", "\\.")}"`), `${name} has no labelled field`)
  assert.doesNotMatch(page, /toast\(err\.message|toast\(\w+\.message/, "raw API errors are not shown")
})

test("the form rules match the API's validation", () => {
  const rule = (field: string) => backend.match(new RegExp(`'${field.replace(".", "\\.")}' => \\[([^\\]]+)\\]`))?.[1] ?? ""
  for (const field of settingsFields) assert.ok(rule(field), `${field} is not validated by the API`)
  assert.match(rule("security.session_timeout_minutes"), new RegExp(`'min:${settingsLimits.sessionTimeout.min}', 'max:${settingsLimits.sessionTimeout.max}'`))
  assert.match(rule("security.api_rate_limit"), new RegExp(`'min:${settingsLimits.apiRateLimit.min}', 'max:${settingsLimits.apiRateLimit.max}'`))
  for (const field of ["general.site_name", "general.site_url", "email.from_name", "email.from_email", "security.password_policy"]) {
    assert.match(rule(field), /'required'/, field)
  }
  for (const field of ["general.site_description", "email.reply_to", "email.smtp_host"]) assert.match(rule(field), /'nullable'/, field)
})

test("invalid values are caught before sending, in the admin's language", () => {
  const form = {
    ...toSettingsForm(loaded),
    "general.site_name": "  ",
    "general.site_url": "wosool.org",
    "email.reply_to": "support at wosool",
    "security.session_timeout_minutes": "",
    "security.api_rate_limit": "2.5",
    "security.password_policy": "x".repeat(256),
  }
  const en = validateSettingsForm("en", form)
  assert.deepEqual(Object.keys(en).sort(), [
    "email.reply_to",
    "general.site_name",
    "general.site_url",
    "security.api_rate_limit",
    "security.password_policy",
    "security.session_timeout_minutes",
  ])
  assert.equal(en["security.session_timeout_minutes"], "Enter a whole number from 5 to 1440.")
  assert.match(validateSettingsForm("ar", form)["general.site_name"] ?? "", arabic)
  assert.deepEqual(validateSettingsForm("en", toSettingsForm(loaded)), {})
  assert.ok(validateSettingsForm("en", { ...toSettingsForm(loaded), "security.session_timeout_minutes": "4" })["security.session_timeout_minutes"])
  assert.equal(validateSettingsForm("en", { ...toSettingsForm(loaded), "general.site_name": "a".repeat(254) + "🚀" })["general.site_name"], undefined)
})

test("saving sends edited fields and returns the unedited settings unchanged", () => {
  const form = { ...toSettingsForm(loaded), "general.site_name": " Wosool Platform ", "email.reply_to": "  ", "security.api_rate_limit": "250" }
  const payload = settingsPayload(loaded, form)
  assert.equal(payload.general.site_name, "Wosool Platform")
  assert.equal(payload.email.reply_to, null)
  assert.equal(payload.security.api_rate_limit, 250)
  assert.equal(payload.security.session_timeout_minutes, 30)
  assert.equal(payload.general.timezone, "Asia/Riyadh")
  assert.equal(payload.general.registration_open, true)
  assert.deepEqual(payload.email.notifications, loaded.email.notifications)
  assert.equal(payload.security.require_2fa, true)
})

test("API validation errors land on their own field", () => {
  const errors = settingsFieldErrors({ "general.site_url": ["The general.site url field must be a valid URL."], "email.notifications": ["x"] }, "Rejected")
  assert.deepEqual(errors, { "general.site_url": "Rejected" })
  assert.deepEqual(settingsFieldErrors(undefined, "Rejected"), {})
  assert.equal(settingsFieldId("security.session_timeout_minutes"), "setting-security-session-timeout-minutes")
})
