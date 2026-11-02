import type { AdminApplication } from "./admin"
import type { Locale } from "./locale"

export const applicationStatuses: AdminApplication["status"][] = ["submitted", "reviewing", "request_more_info", "approved", "rejected", "waitlisted"]

const ar = {
  title: "مراجعة طلبات العضوية",
  intro: "راجع بيانات المتقدم، اعتمد الطلب، ثم أرسل الدعوة إلى بريده الإلكتروني.",
  refresh: "تحديث",
  totalAll: "إجمالي الطلبات",
  waiting: "بانتظار الإجراء",
  searchLabel: "ابحث بالاسم أو البريد أو الشركة أو القطاع",
  statusFilter: "حالة الطلب",
  allStatuses: "كل الحالات",
  search: "بحث",
  listTitle: "الطلبات",
  applicant: "المتقدم",
  company: "الشركة",
  status: "الحالة",
  submittedAt: "تاريخ التقديم",
  action: "إجراء",
  review: "مراجعة",
  empty: "لا توجد طلبات تطابق البحث.",
  loadFailed: "تعذر تحميل الطلبات. حاول مرة أخرى.",
  pagination: "صفحات الطلبات",
  previous: "السابق",
  next: "التالي",
  dialogTitle: "مراجعة طلب",
  dialogDescription: "معلومات المتقدم وحالة الطلب وإرسال دعوة التفعيل.",
  fullName: "الاسم الكامل",
  email: "البريد",
  phone: "الهاتف",
  location: "الموقع",
  companyWebsite: "موقع الشركة",
  sector: "القطاع",
  stage: "المرحلة",
  linkedin: "لينكدإن",
  referralSource: "مصدر الإحالة",
  referrerName: "اسم المُحيل",
  lastReview: "آخر مراجعة",
  notReviewed: "لم تُراجَع بعد",
  founderPhoto: "صورة المؤسس",
  companyLogo: "شعار الشركة",
  position: "الدور",
  country: "الدولة",
  foundedYear: "سنة التأسيس",
  teamSize: "حجم الفريق",
  founderBio: "نبذة المؤسس",
  companyDescription: "نبذة الشركة",
  motivation: "سبب الانضمام",
  offer: "ما يقدمه للمجتمع",
  need: "ما يحتاجه",
  inviteLink: "رابط الدعوة",
  invitePending: "يظهر الرابط بعد اعتماد الطلب وإرسال الدعوة",
  copy: "نسخ",
  inviteAccepted: "قُبلت رسالة الدعوة للإرسال:",
  adminNotes: "ملاحظات الإدارة",
  adminNotesPlaceholder: "سبب القرار وخطوة المتابعة",
  close: "إغلاق",
  resendInvite: "إعادة إرسال الدعوة",
  sendInvite: "إرسال دعوة التفعيل",
  save: "حفظ",
  saved: "حُفظ الطلب.",
  savedMailFailed: "حُفظ الطلب، لكن تعذر إرسال إشعار البريد.",
  saveFailed: "تعذر حفظ الطلب.",
  noInviteYet: "لا يوجد رابط دعوة بعد. اعتمد الطلب وأرسل الدعوة أولًا.",
  copied: "نُسخ رابط الدعوة.",
  copyFailed: "تعذر نسخ الرابط.",
  inviteQueued: "قُبلت رسالة الدعوة للإرسال.",
  inviteFailed: "تعذر إرسال الدعوة.",
  "status.submitted": "جديد",
  "status.reviewing": "قيد المراجعة",
  "status.request_more_info": "مطلوب معلومات إضافية",
  "status.approved": "مقبول",
  "status.rejected": "مرفوض",
  "status.waitlisted": "قائمة الانتظار",
}

type Copy = typeof ar

const en: Copy = {
  title: "Membership applications",
  intro: "Review the applicant's details, approve the application, then email them an invitation.",
  refresh: "Refresh",
  totalAll: "All applications",
  waiting: "Awaiting action",
  searchLabel: "Search by name, email, company or sector",
  statusFilter: "Application status",
  allStatuses: "All statuses",
  search: "Search",
  listTitle: "Applications",
  applicant: "Applicant",
  company: "Company",
  status: "Status",
  submittedAt: "Submitted",
  action: "Action",
  review: "Review",
  empty: "No applications match this search.",
  loadFailed: "Applications could not be loaded. Try again.",
  pagination: "Application pages",
  previous: "Previous",
  next: "Next",
  dialogTitle: "Review application",
  dialogDescription: "Applicant details, application status and the activation invitation.",
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  location: "Location",
  companyWebsite: "Company website",
  sector: "Sector",
  stage: "Stage",
  linkedin: "LinkedIn",
  referralSource: "Referral source",
  referrerName: "Referred by",
  lastReview: "Last review",
  notReviewed: "Not reviewed yet",
  founderPhoto: "Founder photo",
  companyLogo: "Company logo",
  position: "Role",
  country: "Country",
  foundedYear: "Founded",
  teamSize: "Team size",
  founderBio: "Founder bio",
  companyDescription: "Company description",
  motivation: "Why they want to join",
  offer: "What they can offer",
  need: "What they need",
  inviteLink: "Invitation link",
  invitePending: "The link appears after the application is approved and the invitation is sent",
  copy: "Copy",
  inviteAccepted: "Invitation accepted for delivery:",
  adminNotes: "Admin notes",
  adminNotesPlaceholder: "Reason for the decision and the next step",
  close: "Close",
  resendInvite: "Resend invitation",
  sendInvite: "Send activation invitation",
  save: "Save",
  saved: "Application saved.",
  savedMailFailed: "Application saved, but the notification email could not be sent.",
  saveFailed: "The application could not be saved.",
  noInviteYet: "There is no invitation link yet. Approve the application and send the invitation first.",
  copied: "Invitation link copied.",
  copyFailed: "The link could not be copied.",
  inviteQueued: "Invitation accepted for delivery.",
  inviteFailed: "The invitation could not be sent.",
  "status.submitted": "New",
  "status.reviewing": "In review",
  "status.request_more_info": "More information requested",
  "status.approved": "Approved",
  "status.rejected": "Rejected",
  "status.waitlisted": "Waitlisted",
}

export const adminApplicationsCopy = { ar, en }

export function adminApplications(locale: Locale): Copy {
  return locale === "en" ? en : ar
}

export function applicationStatusLabel(locale: Locale, status: AdminApplication["status"]): string {
  const copy = adminApplications(locale)
  const key = `status.${status}` as keyof Copy
  return Object.prototype.hasOwnProperty.call(copy, key) ? copy[key] : status
}

export type ApplicationPage = { page: number; lastPage: number; total: number; from: number; to: number }

/** Page position from the API meta; tolerates an older API that sends no `last_page`. */
export function applicationPage(meta: Record<string, number> | null | undefined, shown: number): ApplicationPage {
  const num = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback)
  const total = num(meta?.total, shown)
  const perPage = Math.max(1, num(meta?.per_page, Math.max(shown, 1)))
  const lastPage = Math.max(1, num(meta?.last_page, Math.ceil(total / perPage)))
  const page = Math.min(lastPage, Math.max(1, num(meta?.current_page, 1)))
  const from = shown ? (page - 1) * perPage + 1 : 0
  return { page, lastPage, total, from, to: shown ? from + shown - 1 : 0 }
}

export function applicationRange(locale: Locale, { from, to, total }: ApplicationPage): string {
  if (!total || !to) return locale === "en" ? "0 applications" : "لا توجد طلبات"
  return locale === "en" ? `${from}–${to} of ${total}` : `${from}–${to} من ${total}`
}

/** Overall total for the summary tile; an older API only reports the filtered total. */
export function applicationAllCount(meta: Record<string, number> | null | undefined): number {
  const value = meta?.all ?? meta?.total
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}
