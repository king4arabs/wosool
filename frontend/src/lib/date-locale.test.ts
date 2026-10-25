import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import test from "node:test"
import { ARABIC_DATE_LOCALE, EOA_ARABIC_DATE_LOCALE, dateLocale, eoaDateLocale } from "./date-locale"
import { newsDate } from "./news-feed"
import { calendarDateLabel } from "./founder-calendar"
import { formatEoaDate } from "./eoa"

const instant = new Date("2026-11-10T20:30:00Z")

test("Arabic dates are Gregorian with Western digits", () => {
  const text = new Intl.DateTimeFormat(ARABIC_DATE_LOCALE, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(instant)
  assert.match(text, /^10 نوفمبر 2026$/)
  assert.doesNotMatch(text, /[٠-٩]/)
  const options = new Intl.DateTimeFormat(ARABIC_DATE_LOCALE).resolvedOptions()
  assert.equal(options.calendar, "gregory")
  assert.equal(options.numberingSystem, "latn")
})

test("dateLocale picks the Arabic tag or the given English tag", () => {
  assert.equal(dateLocale(true), ARABIC_DATE_LOCALE)
  assert.equal(dateLocale(false), "en-GB")
  assert.equal(dateLocale(false, "en-US"), "en-US")
  assert.equal(eoaDateLocale(true), EOA_ARABIC_DATE_LOCALE)
  assert.equal(eoaDateLocale(false), "en-GB")
})

test("EO Accelerator dates stay Gregorian and keep its Arabic-Indic digits", () => {
  assert.equal(new Intl.DateTimeFormat(EOA_ARABIC_DATE_LOCALE).resolvedOptions().calendar, "gregory")
  assert.equal(formatEoaDate("2026-11-10T21:30:00Z", true), "١١ نوفمبر ٢٠٢٦", "Riyadh is UTC+3")
})

test("shared date helpers print Western digits in Arabic", () => {
  assert.equal(newsDate("2026-10-22T09:00:00Z", "ar"), "22 أكتوبر 2026")
  assert.equal(calendarDateLabel("2026-11-10", "ar"), "10 نوفمبر")
})

test("no source file formats dates with a bare ar-SA tag (Hijri in Safari)", () => {
  const root = join(__dirname, "..")
  const offenders: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts") && name !== "date-locale.ts") {
        if (/["']ar-SA["']/.test(readFileSync(path, "utf8"))) offenders.push(relative(root, path))
      }
    }
  }
  walk(root)
  assert.deepEqual(offenders, [], "use dateLocale() or eoaDateLocale() from lib/date-locale")
})
