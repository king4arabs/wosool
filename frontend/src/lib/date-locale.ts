/**
 * Arabic dates on Wosool use the Gregorian calendar and Western digits ("10 نوفمبر 2026").
 *
 * A bare "ar-SA" tag lets the browser choose: Safari and older engines default it to the
 * Umm al-Qura (Hijri) calendar, and Chromium prints Arabic-Indic digits ("١٠ نوفمبر ٢٠٢٦")
 * beside counts that the site shows in Western digits. Pass every Arabic date and time through
 * this tag so the same moment reads the same way on every page and browser.
 */
export const ARABIC_DATE_LOCALE = "ar-SA-u-ca-gregory-nu-latn"

/** Intl locale tag for dates and times in the current language. */
export function dateLocale(arabic: boolean, english = "en-GB"): string {
  return arabic ? ARABIC_DATE_LOCALE : english
}

/**
 * The EO Riyadh Accelerator pages write Arabic numbers in Arabic-Indic digits ("٦ أشهر"), so their
 * dates keep those digits; the calendar is still pinned to Gregorian.
 */
export const EOA_ARABIC_DATE_LOCALE = "ar-SA-u-ca-gregory"

export function eoaDateLocale(arabic: boolean, english = "en-GB"): string {
  return arabic ? EOA_ARABIC_DATE_LOCALE : english
}
