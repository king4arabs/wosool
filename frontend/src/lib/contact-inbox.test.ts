import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { inboxParams, replyHref } from "./contact-inbox"

test("inbox filters only send the filters that are set", () => {
  assert.deepEqual(inboxParams("", "", 1), { status: undefined, category: undefined, page: undefined })
  assert.deepEqual(inboxParams("open", "office-hours", 3), { status: "open", category: "office-hours", page: 3 })
})

test("reply link quotes the subject and cannot inject headers", () => {
  assert.equal(replyHref({ email: "layla@example.com", subject: "Founders dinner" }), "mailto:layla%40example.com?subject=Re%3A%20Founders%20dinner")
  const href = replyHref({ email: "a@example.com", subject: "Hi\r\nBcc: x@evil.test&body=y" })
  assert.ok(!/[\r\n]/.test(decodeURIComponent(href)))
  assert.ok(!href.includes("&body="))
  assert.equal(new URL(href).searchParams.get("subject"), "Re: Hi Bcc: x@evil.test&body=y")
})

test("inbox and contact form offer the same categories as the API", () => {
  const model = readFileSync(new URL("../../../backend/app/Models/ContactMessage.php", import.meta.url), "utf8")
  const form = readFileSync(new URL("../app/contact/page.tsx", import.meta.url), "utf8")
  const page = readFileSync(new URL("../app/admin/messages/page.tsx", import.meta.url), "utf8")
  const apiLabels = [...model.matchAll(/'([a-z-]+)' => \['([^']+)', '([^']+)'\]/g)].map(([, value, ar, en]) => ({ value, ar, en }))
  assert.equal(apiLabels.length, 6)
  for (const { value, ar, en } of apiLabels) {
    assert.ok(form.includes(`value: "${value}"`), `contact form is missing ${value}`)
    assert.ok(form.includes(`ar: ["${ar}"`), `contact form label for ${value} differs from the API: ${ar}`)
    assert.ok(form.includes(`en: ["${en}"`), `contact form label for ${value} differs from the API: ${en}`)
    assert.ok(page.includes(`"${value}"`), `inbox filter is missing ${value}`)
  }
})
