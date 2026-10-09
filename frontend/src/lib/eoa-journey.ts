import type { ApplicationFields } from './eoa'

export const applicationSteps: (keyof ApplicationFields)[][] = [
  ['preferred_track_id', 'founder_name', 'phone', 'founder_role'],
  ['company_name', 'company_website', 'city', 'country', 'sector', 'stage', 'revenue_amount', 'revenue_currency', 'revenue_year'],
  ['growth_objectives', 'support_needs'],
  ['privacy_consent', 'accuracy_confirmed', 'attendance_commitment'],
]

export function validateApplicationStep(fields: ApplicationFields, step: number, ar: boolean, year = new Date().getFullYear()) {
  const errors: Partial<Record<keyof ApplicationFields, string>> = {}
  for (const key of applicationSteps[step] ?? []) {
    const value = fields[key]
    if (key !== 'company_website' && (value === undefined || value === null || value === false || String(value).trim() === '')) {
      errors[key] = ar ? 'هذا الحقل مطلوب للمتابعة.' : 'Complete this field to continue.'
      continue
    }
    if (key === 'company_website' && value) {
      try { if (new URL(String(value)).protocol !== 'https:') throw new Error() }
      catch { errors[key] = ar ? 'أدخل رابطاً كاملاً يبدأ بـ https://.' : 'Enter a complete website address starting with https://.' }
    }
    if (key === 'revenue_amount' && (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 999999999999.99)) {
      errors[key] = ar ? 'أدخل مبلغ إيراد صالحاً لا يقل عن صفر.' : 'Enter a valid revenue amount of zero or more.'
    }
    if (key === 'revenue_year' && (!Number.isInteger(Number(value)) || Number(value) < 2000 || Number(value) > year)) {
      errors[key] = ar ? `أدخل سنة بين 2000 و${year}.` : `Enter a year between 2000 and ${year}.`
    }
    if (key === 'growth_objectives' && String(value ?? '').trim().length < 30) {
      errors[key] = ar ? 'وضّح أهدافك في 30 حرفاً على الأقل.' : 'Describe your goals in at least 30 characters.'
    }
  }
  return errors
}

export function eoaJourneyStage(status: string | undefined, verified: boolean, participantStatus?: string) {
  if (!verified) return 0
  if (participantStatus === 'enrolled' || status === 'enrolled') return 4
  if (participantStatus || ['accepted', 'onboarding'].includes(status ?? '')) return 3
  if (['submitted', 'under_review', 'interview', 'waitlisted', 'rejected'].includes(status ?? '')) return 2
  return 1
}
