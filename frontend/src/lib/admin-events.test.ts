import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import type { AdminEvent } from "./admin"
import {
  adminEventsCopy,
  emptyEventForm,
  eventFieldErrors,
  eventFormats,
  eventModes,
  eventOptionLabel,
  eventOrganizerTypes,
  eventPayload,
  eventStartLabel,
  eventStatuses,
  eventStatusFlows,
  eventTypes,
  eventVisibilities,
  toEventForm,
  validateEventForm,
} from "./admin-events"

const arabic = /[؀-ۿ]/
const page = readFileSync(new URL("../app/admin/events/page.tsx", import.meta.url), "utf8")
const backend = readFileSync(new URL("../../../backend/app/Http/Controllers/Api/Admin/EventController.php", import.meta.url), "utf8")

const groups = [
  ["format", eventFormats],
  ["mode", eventModes],
  ["status", eventStatuses],
  ["status_flow", eventStatusFlows],
  ["organizer_type", eventOrganizerTypes],
  ["visibility", eventVisibilities],
] as const

test("admin events copy has the same keys in Arabic and English, each in its own language", () => {
  assert.deepEqual(Object.keys(adminEventsCopy.ar).sort(), Object.keys(adminEventsCopy.en).sort())
  // Time zone names (Asia/Riyadh) and JSON examples are code, so only the prose must be Arabic.
  for (const [key, value] of Object.entries(adminEventsCopy.ar)) assert.match(value, arabic, key)
  for (const [key, value] of Object.entries(adminEventsCopy.en)) assert.doesNotMatch(value, arabic, key)
  for (const [group, values] of [...groups, ["type", eventTypes]] as const) {
    for (const value of values) {
      assert.match(eventOptionLabel("ar", group, value), arabic, `${group}.${value}`)
      assert.doesNotMatch(eventOptionLabel("en", group, value), arabic, `${group}.${value}`)
    }
  }
  assert.equal(eventOptionLabel("en", "status", "unknown-code"), "unknown-code")
})

test("option codes match the values the API accepts", () => {
  const accepted = (field: string) => backend.match(new RegExp(`'${field}' => \\[[^\\]]*Rule::in\\(\\[([^\\]]+)\\]\\)`))?.[1].match(/'([^']+)'/g)?.map((item) => item.slice(1, -1))
  for (const [group, values] of groups) assert.deepEqual(accepted(group)?.sort(), [...values].sort(), group)
  const types = backend.match(/EVENT_TYPES = \[([\s\S]*?)\];/)?.[1].match(/'([^']+)'/g)?.map((item) => item.slice(1, -1))
  assert.deepEqual(types, [...eventTypes])
})

test("an existing event opens with its times in its own time zone, whatever the device zone", () => {
  const event = {
    id: 1, title: "Founder dinner", slug: "founder-dinner", location: "Riyadh", type: "Founder Dinner", format: "in-person", status: "upcoming",
    starts_at: "2026-12-01T16:00:00+00:00", ends_at: "2026-12-01T19:30:00+00:00", registration_deadline: "2026-11-30T20:59:00+00:00",
    timezone: "Asia/Riyadh", is_public: true, requires_rsvp: true, targeting_rules: {}, rsvp_settings: { reminders: [24] },
  } as unknown as AdminEvent
  const form = toEventForm(event)
  assert.equal(form.starts_at, "2026-12-01T19:00")
  assert.equal(form.ends_at, "2026-12-01T22:30")
  assert.equal(form.registration_deadline, "2026-11-30T23:59")
  assert.equal(form.targeting_rules, "")
  assert.match(form.rsvp_settings, /"reminders"/)
  const dubai = toEventForm({ ...event, timezone: "Asia/Dubai" })
  assert.equal(dubai.starts_at, "2026-12-01T20:00")
  assert.equal(dubai.timezone, "Asia/Dubai")
  assert.equal(toEventForm({ ...event, timezone: "Not/AZone" }).timezone, "Asia/Riyadh")
  // Early short type codes open on the current type the API accepts; others stay as stored.
  assert.equal(toEventForm({ ...event, type: "wosool" }).type, "Wosool Event")
  assert.equal(toEventForm({ ...event, type: "partner" }).type, "Partner Event")
  assert.equal(toEventForm({ ...event, type: "private" }).type, "private")
})

test("the list shows the start in the event's time zone and names a zone that is not Riyadh", () => {
  const riyadh = eventStartLabel("en", { starts_at: "2026-12-01T16:00:00+00:00", timezone: "Asia/Riyadh" })
  assert.deepEqual(riyadh, { date: "1 Dec 2026", time: "19:00" })
  assert.equal(eventStartLabel("en", { starts_at: "2026-12-01T16:00:00+00:00", timezone: "Europe/London" })?.time, "16:00 (Europe/London)")
  assert.match(eventStartLabel("ar", { starts_at: "2026-12-01T16:00:00+00:00", timezone: null })!.date, arabic)
  assert.equal(eventStartLabel("en", { starts_at: "not a date", timezone: null }), null)
})

test("validation reports each problem on its field in the page language", () => {
  const valid = { ...emptyEventForm, title: "Demo day", location: "Riyadh", starts_at: "2026-12-01T19:00" }
  assert.deepEqual(validateEventForm("en", valid), {})
  const blank = validateEventForm("ar", emptyEventForm)
  assert.deepEqual(Object.keys(blank).sort(), ["location", "starts_at", "title"])
  for (const message of Object.values(blank)) assert.match(message!, arabic)
  const errors = validateEventForm("en", {
    ...valid,
    ends_at: "2026-12-01T18:59",
    registration_deadline: "2026-12-01T19:01",
    timezone: "Riyadh",
    google_maps_url: "maps.google.com/x",
    virtual_link: "javascript:alert(1)",
    max_attendees: "0",
    capacity_limit: "100001",
    short_description: "x".repeat(501),
    targeting_rules: "{not json",
    ai_settings: "42",
  })
  assert.deepEqual(Object.keys(errors).sort(), ["ai_settings", "capacity_limit", "ends_at", "google_maps_url", "max_attendees", "registration_deadline", "short_description", "targeting_rules", "timezone", "virtual_link"])
  assert.deepEqual(validateEventForm("en", { ...valid, ends_at: valid.starts_at, registration_deadline: valid.starts_at, rsvp_settings: "[]", max_attendees: "100000" }), {})
})

test("the payload sends wall-clock times with their zone and parsed settings, never raw text", () => {
  const payload = eventPayload({
    ...emptyEventForm,
    title: "  Demo day ",
    location: " Riyadh ",
    starts_at: "2026-12-01T19:00",
    timezone: " ",
    max_attendees: "40",
    gallery_images: "https://a.example/1.jpg, https://a.example/2.jpg",
    tags: "demo, investors",
    rsvp_settings: "{\"reminders\": [24]}",
  })
  assert.equal(payload.title, "Demo day")
  assert.equal(payload.location, "Riyadh")
  assert.equal(payload.slug, undefined)
  assert.equal(payload.starts_at, "2026-12-01T19:00")
  assert.equal(payload.timezone, "Asia/Riyadh")
  assert.equal(payload.ends_at, null)
  assert.equal(payload.registration_deadline, null)
  assert.equal(payload.max_attendees, 40)
  assert.equal(payload.capacity_limit, null)
  assert.equal(payload.virtual_link, null)
  assert.deepEqual(payload.gallery_images, ["https://a.example/1.jpg", "https://a.example/2.jpg"])
  assert.deepEqual(payload.tags, ["demo", "investors"])
  assert.deepEqual(payload.rsvp_settings, { reminders: [24] })
  assert.deepEqual(payload.targeting_rules, {})
})

test("API validation errors map to form fields", () => {
  const errors = eventFieldErrors({ slug: ["The slug has already been taken."], "tags.1": ["Too long."], image_url: ["Bad"], unknown: ["x"], ends_at: [] }, "Check this field.")
  assert.deepEqual(errors, { slug: "The slug has already been taken.", tags: "Too long.", cover_image_url: "Bad", ends_at: "Check this field." })
  assert.deepEqual(eventFieldErrors(null, "x"), {})
})

test("the page follows the admin's language, labels every field and uses logical spacing", () => {
  assert.match(page, /useLocale\(\)/)
  assert.match(page, /<Label htmlFor=\{eventFieldId\(name\)\}>/)
  assert.doesNotMatch(page, /placeholder="/, "visible labels, not placeholders, name the editor fields")
  assert.doesNotMatch(page, /[؀-ۿ]/, "page text comes from the copy in admin-events.ts")
  assert.doesNotMatch(page, /\b(text-left|pl-\d|pr-\d|ml-\d|mr-\d|left-\d)\b/)
  assert.doesNotMatch(page, /JSON\.parse|toLocaleTimeString|err\.message/)
  assert.match(page, /role="search"/)
  assert.doesNotMatch(page, /<h1/)
})
