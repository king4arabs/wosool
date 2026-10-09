import { ApiError } from './api'

export type EoaTrack = { id: number; name_ar: string; name_en: string; description_ar?: string | null; description_en?: string | null; is_active?: boolean }
export type EoaPartner = {
  id: number
  name_en: string
  name_ar: string
  website: string
  logo_path: string
}
export type Organization = EoaPartner & {
  support_en: string
  support_ar: string
  source_url: string
  verified_at: string
  relationship_status: string
  relationship_evidence?: string
  logo_source_url?: string
}
export type EoaProgram = {
  tracks: EoaTrack[]
  program_id: number
  data_collection_open: boolean
  privacy_notice_ar: string | null
  privacy_notice_en: string | null
  privacy_notice_version: string | null
  applications_open: boolean
  local_status: string
  starts_at: string | null
  facts: {
    annual_global_fee_usd: number
    revenue_min_usd: number
    revenue_max_usd: number
    verified_at: string
  }
  local_fees: {
    local_fee_usd: number
    sponsor_contribution_usd: number
    participant_contribution_usd: number
  } | null
  partners: EoaPartner[]
  ecosystem: Organization[]
  contact_email: string | null
  public_message_en?: string | null
  public_message_ar?: string | null
  participation_terms_en: string | null
  participation_terms_ar: string | null
}
export type ApplicationFields = {
  preferred_track_id?: number | string
  founder_name?: string
  phone?: string
  founder_role?: string
  company_name?: string
  company_website?: string
  city?: string
  country?: string
  sector?: string
  stage?: string
  revenue_amount?: string | number
  revenue_currency?: string
  revenue_year?: string | number
  growth_objectives?: string
  support_needs?: string
  privacy_consent?: boolean
  accuracy_confirmed?: boolean
  attendance_commitment?: boolean
  locale?: string
}
export type EoaApplication = {
  track?: EoaTrack | null
  id: number
  status: string
  version: number
  fields: ApplicationFields
  updated_at: string
  submitted_at: string | null
  decision_reason: string | null
  internal_note?: string
  documents: { id: number; name: string; size: number }[]
}
export type Milestone = { title: string; due_date?: string; completed: boolean }
export type Session = {
  id: number
  title: string
  description?: string
  starts_at: string
  location?: string
  online_link?: string
  duration_minutes?: number
  cohort_id?: number | null
  session_type?: string
}
export type Participant = {
  track?: EoaTrack | null
  id: number
  status: string
  onboarding: { completed_at?: string }
  finance: {
    fee_status?: string
    global_confirmed?: boolean
    participant_amount_usd?: number
    sponsor_amount_usd?: number
  }
  group: {
    name: string
    meeting_link: string | null
    coach_name: string | null
  } | null
  sessions: Session[]
  registrations: number[]
  resources: { id: number; title: string; description: string; url: string }[]
  progress: {
    milestones: Milestone[] | null
    self_assessment: string | null
    mentor_feedback: string | null
  } | null
  attendance: { title: string; status: string; attended_at: string | null }[]
  announcements: { id: number; subject: string; body: string }[]
}
export const statusNames: Record<string, [string, string]> = {
  forming: ['قيد التشكيل', 'Forming'],
  active: ['نشط', 'Active'],
  completed: ['مكتمل', 'Completed'],
  cancelled: ['ملغى', 'Cancelled'],
  scheduled: ['مجدول', 'Scheduled'],
  draft: ['مسودة', 'Draft'],
  submitted: ['تم الإرسال', 'Submitted'],
  under_review: ['قيد المراجعة', 'Under review'],
  information_requested: ['مطلوب معلومات إضافية', 'Information requested'],
  interview: ['مقابلة', 'Interview'],
  accepted: ['قبول محلي أولي', 'Locally accepted'],
  waitlisted: ['قائمة الانتظار', 'Waitlisted'],
  rejected: ['لم يتم القبول', 'Not accepted'],
  onboarding: ['استكمال الانضمام', 'Onboarding'],
  enrolled: ['مشارك مسجل', 'Enrolled'],
  attended: ['حاضر', 'Attended'],
  absent: ['غائب', 'Absent'],
  excused: ['بعذر', 'Excused'],
  pending: ['معلق', 'Pending'],
  paid: ['مؤكد السداد', 'Payment confirmed'],
  sponsored: ['مدعوم', 'Sponsored'],
}
export function statusLabel(status: string, ar: boolean) {
  return statusNames[status]?.[ar ? 0 : 1] ?? status
}
export function errorText(error: unknown) {
  if (error instanceof ApiError) {
    const data = error.data as { errors?: Record<string, string[]> } | undefined
    return Object.values(data?.errors ?? {}).flat()[0] || error.message
  }
  return error instanceof Error
    ? error.message
    : 'Please try again / يرجى المحاولة مرة أخرى'
}
export function eligibility(amount: number, currency: string, owner: boolean) {
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    !['USD', 'SAR'].includes(currency)
  )
    return 'invalid'
  const usd = currency === 'SAR' ? amount / 3.75 : amount
  if (!owner) return 'review'
  if (usd >= 1000000) return 'membership'
  return usd >= 250000 ? 'potential' : 'review'
}

const applicationFieldNames: Record<string, [string, string]> = {
  preferred_track_id: ['المسار المفضل', 'Preferred track'],
  founder_name: ['اسم المؤسس', 'Founder name'],
  phone: ['رقم الهاتف', 'Phone'],
  founder_role: ['دور المؤسس', 'Founder role'],
  company_name: ['اسم الشركة', 'Company name'],
  company_website: ['موقع الشركة', 'Company website'],
  country: ['الدولة', 'Country'],
  city: ['المدينة', 'City'],
  sector: ['القطاع', 'Sector'],
  stage: ['مرحلة الشركة', 'Company maturity'],
  revenue_amount: ['الإيراد السنوي الإجمالي', 'Gross annual revenue'],
  revenue_currency: ['عملة الإيراد', 'Revenue currency'],
  revenue_year: ['سنة التقرير', 'Reporting year'],
  growth_objectives: ['أهداف النمو', 'Growth objectives'],
  support_needs: ['احتياجات الدعم', 'Support needs'],
  privacy_consent: ['الموافقة على معالجة البيانات', 'Data-processing consent'],
  accuracy_confirmed: ['تأكيد دقة البيانات', 'Accuracy confirmed'],
  attendance_commitment: ['الالتزام بالحضور', 'Attendance commitment'],
  locale: ['اللغة', 'Language'],
  consented_at: ['تاريخ الموافقة', 'Consent date'],
  privacy_notice_version: ['نسخة إشعار البيانات', 'Data notice version'],
}
export function applicationFieldLabel(field: string, ar: boolean) {
  return (
    applicationFieldNames[field]?.[ar ? 0 : 1] ?? field.replaceAll('_', ' ')
  )
}
export function applicationFieldValue(value: unknown, ar: boolean) {
  if (typeof value === 'boolean')
    return value ? (ar ? 'نعم' : 'Yes') : ar ? 'لا' : 'No'
  const names: Record<string, [string, string]> = {
    founder: ['مؤسس', 'Founder'],
    owner: ['مالك', 'Owner'],
    cofounder: ['شريك مؤسس', 'Co-founder'],
    operating: ['قائمة', 'Operating'],
    growing: ['تنمو', 'Growing'],
    scaling: ['تتوسع', 'Scaling'],
    ar: ['العربية', 'Arabic'],
    en: ['الإنجليزية', 'English'],
  }
  return names[String(value)]?.[ar ? 0 : 1] ?? String(value ?? '—')
}
