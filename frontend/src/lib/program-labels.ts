import type { Program } from "../types"

type Locale = "ar" | "en"
type Label = { ar: string; en: string }

/** Programs are stored with English text and short codes (admin form, `eoa:install`); there are no Arabic columns. */
const CATEGORY_LABELS: Record<string, Label> = {
  onboarding: { ar: "التهيئة", en: "Onboarding" },
  circles: { ar: "دوائر المؤسسين", en: "Founder circles" },
  "peer-learning": { ar: "التعلّم بين الأقران", en: "Peer learning" },
  growth: { ar: "النمو", en: "Growth" },
  fundraising: { ar: "جمع التمويل", en: "Fundraising" },
  accelerator: { ar: "مسرّعة أعمال", en: "Accelerator" },
  mentorship: { ar: "الإرشاد", en: "Mentorship" },
}

const STAGE_LABELS: Record<string, Label> = {
  idea: { ar: "مرحلة الفكرة", en: "Idea" },
  "pre-seed": { ar: "ما قبل البذرة", en: "Pre-seed" },
  seed: { ar: "البذرة", en: "Seed" },
  "series-a": { ar: "السلسلة A", en: "Series A" },
  "series-b": { ar: "السلسلة B", en: "Series B" },
  "series-b+": { ar: "السلسلة B+", en: "Series B+" },
  "series-c": { ar: "السلسلة C", en: "Series C" },
  growth: { ar: "النمو", en: "Growth" },
  "scale-up": { ar: "التوسّع", en: "Scale-up" },
}

/**
 * The one program the platform installs itself (`php artisan eoa:install`); wording follows the /eoa page.
 * Each Arabic value replaces only the installer's own English default, so an administrator's edit is always shown.
 */
const INSTALLED_PROGRAM_ARABIC: Record<string, { name: [string, string]; description: [string, string] }> = {
  "eo-riyadh-accelerator": {
    name: ["EO Riyadh Accelerator", "مسرّعة EO الرياض"],
    description: [
      "Wosool digital gateway for EO Riyadh Accelerator. Saudi Founders. Global Connections. Extraordinary Growth.",
      "اعمل على النقد والاستراتيجية والفريق والتنفيذ مع أصحاب أعمال آخرين ضمن دفعة مسرّعة EO الرياض لمدة ستة أشهر.",
    ],
  },
}

const arabicScript = /[؀-ۿ]/

export function programCode(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "-")
}

/** "peer_learning" → "Peer learning"; text that already reads as words is kept as written. */
function humanize(value: string): string {
  const text = value.trim()
  if (!/^[a-z0-9]+([-_][a-z0-9]+)*$/.test(text)) return text
  const words = text.replace(/[-_]+/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function label(table: Record<string, Label>, value: string, locale: Locale): string {
  const known = table[programCode(value)]
  if (known) return known[locale]
  return arabicScript.test(value) ? value.trim() : humanize(value)
}

export function programCategoryLabel(category: string, locale: Locale): string {
  return label(CATEGORY_LABELS, category, locale)
}

export function programStageLabel(stage: string, locale: Locale): string {
  return label(STAGE_LABELS, stage, locale)
}

const UNITS: Record<string, { one: string; two: string; few: string; many: string; en: string }> = {
  day: { one: "يوم واحد", two: "يومان", few: "أيام", many: "يومًا", en: "day" },
  week: { one: "أسبوع واحد", two: "أسبوعان", few: "أسابيع", many: "أسبوعًا", en: "week" },
  month: { one: "شهر واحد", two: "شهران", few: "أشهر", many: "شهرًا", en: "month" },
  year: { one: "سنة واحدة", two: "سنتان", few: "سنوات", many: "سنةً", en: "year" },
}

/**
 * "6 weeks" → "6 أسابيع", "2 weeks" → "أسبوعان", "12 months" → "12 شهرًا".
 * Anything that is not "<number> <day|week|month|year>" is shown as entered.
 */
export function programDurationLabel(duration: string, locale: Locale): string {
  const match = duration.trim().match(/^(\d{1,3})\s*(day|week|month|year)s?$/i)
  if (!match) return duration.trim()
  const count = Number(match[1])
  const unit = UNITS[match[2].toLowerCase()]
  if (locale === "en") return `${count} ${unit.en}${count === 1 ? "" : "s"}`
  if (count === 1) return unit.one
  if (count === 2) return unit.two
  if (count >= 3 && count <= 10) return `${count} ${unit.few}`
  return `${count} ${unit.many}`
}

/** Card-ready program in the selected language. `category` keeps its code so filtering stays stable. */
export function localizeApiProgram(program: Program, locale: Locale): Program {
  const installed = locale === "ar" ? INSTALLED_PROGRAM_ARABIC[program.slug] : undefined
  const unlessEdited = (value: string, [installerDefault, arabic]: [string, string]) => value.trim() === installerDefault ? arabic : value
  return {
    ...program,
    ...(installed && { name: unlessEdited(program.name, installed.name), description: unlessEdited(program.description, installed.description) }),
    duration: program.duration ? programDurationLabel(program.duration, locale) : "",
    targetStage: program.targetStage.map(stage => programStageLabel(stage, locale)),
  }
}
