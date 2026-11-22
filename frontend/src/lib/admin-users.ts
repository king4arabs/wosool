import type { Locale } from "./locale"

/**
 * Copy, rules and helpers for the administrator users page (`/admin/users`).
 *
 * The identity review dialog approves a registered account through
 * `POST /api/v1/admin/users/{user}/verify` (`Admin\UserController@verify`). The API refuses when:
 * - the account email is not verified (409 `identity.email`);
 * - the "I reviewed the identity evidence" box is not ticked (422, `identity_verified` accepted);
 * - the account has neither registration details (`onboarding_data`) nor a linked profile
 *   (409 `identity.complete`);
 * - for a registration, no matching profile or "new profile" was chosen while candidates exist
 *   (409 `identity.match`), or the chosen candidate is no longer eligible (409 `identity.stale`).
 *
 * The page used to disable the approve button for any of these without saying which one applied.
 */

const ar = {
  title: "عرض جميع الأعضاء",
  intro: "التسجيل والمطابقة والتحقق والدعوات في مكان واحد. تصنيف مصدر البيانات يظهر للإدارة فقط.",
  refresh: "تحديث",
  registered: "بيانات عضو مسجل",
  invited: "بيانات عضو مدعو",
  results: "نتائج العرض",
  search: "ابحث بالاسم أو البريد",
  origin: "مصدر بيانات العضو",
  allUsers: "جميع الأعضاء",
  selectPage: "تحديد مدعوي الصفحة",
  inviteSelected: "دعوة المحددين",
  inviteAll: "دعوة جميع المدعوين",
  reviewInvitations: "مراجعة عناوين الدعوات وحالتها",
  noReviewedEmail: "لا يوجد بريد معتمد",
  emailVerified: "البريد مؤكد",
  emailNotVerified: "البريد غير مؤكد",
  verified: "تم التحقق",
  verificationPending: "بانتظار تحقق الإدارة",
  reviewIdentity: "مراجعة المطابقة والتحقق",
  selectForInvite: "تحديد للدعوة",
  manageInvitation: "إدارة الدعوة",
  noResults: "لا توجد نتائج.",
  pages: "صفحات الأعضاء",
  previous: "السابق",
  next: "التالي",
  loadFailed: "تعذر تحميل الأعضاء. حاول مرة أخرى.",
  dialogTitle: "مراجعة هوية العضو",
  dialogDescription: "قارن بيانات التسجيل بالملفات المنشورة ثم اعتمد الملف الصحيح.",
  finding: "جارٍ البحث والمطابقة…",
  reviewFailed: "تعذر تحميل بيانات المراجعة. أغلق النافذة وحاول مرة أخرى.",
  hasProfile: "يوجد ملف موحد مرتبط بالحساب.",
  viewProfile: "عرض الملف",
  matches: "الملفات المطابقة",
  publishedProfile: "الملف المنشور",
  companyWebsite: "موقع الشركة",
  noneMatch: "راجعت النتائج ولا تخص هذا العضو؛ أنشئ ملفًا جديدًا.",
  noMatch: "لا توجد مطابقة؛ انشر ملف العضو الجديد بعد التحقق.",
  confirm: "راجعت تطابق الهوية وبيانات العضو وأعتمد خطوة «تم التحقق».",
  approve: "اعتماد الملف وتم التحقق",
  approving: "جارٍ الاعتماد…",
  approved: "تم اعتماد البيانات وتوحيد الملف والتحقق من العضو.",
  approveFailed: "تعذر اعتماد الملف.",
  stale: "تغيرت الملفات المطابقة منذ فتح المراجعة، فأُعيد تحميلها. راجع الاختيار ثم اعتمد مجددًا.",
  blockersTitle: "قبل الاعتماد:",
  blockEmail: "ينتظر العضو تأكيد بريده الإلكتروني. لا يمكن الاعتماد قبل ذلك.",
  blockComplete: "على العضو إكمال بيانات التسجيل قبل اعتماد الملف.",
  blockChoice: "اختر الملف المطابق أو إنشاء ملف جديد.",
  blockConfirm: "ضع علامة على تأكيد مراجعة الهوية.",
  inviteTitle: "مراجعة دعوات التسجيل",
  inviteAllScope: "يشمل هذا الإجراء جميع الملفات المدعوة، بصرف النظر عن البحث الحالي.",
  inviteSelectedScope: "المحدد للدعوة: {count} ملفًا.",
  inviteRules: "تُرسل الدعوات الفردية للعناوين التي اعتمدتها الإدارة فقط. تُتجاوز الحسابات المسجلة والعناوين المفقودة والدعوات السارية. تستمر المطابقة وربط الملف عند التسجيل والتحقق.",
  inviteQueue: "جدولة دعوات التسجيل",
  inviteQueued: "جُدولت {queued} دعوة، وتُجاوز {skipped} ملفًا غير مؤهل أو قيد المعالجة.",
  inviteFailed: "تعذر جدولة الدعوات.",
  signalName: "الاسم",
  signalCompanyWebsite: "موقع الشركة",
  signalCompanyName: "اسم الشركة",
  signalContactEmail: "بريد تواصل معتمد",
  signalInvitationEmail: "بريد الدعوة",
}

const en: Record<keyof typeof ar, string> = {
  title: "View all users",
  intro: "Registration, identity review, verification and invitations. Record-origin labels are visible only to administrators.",
  refresh: "Refresh",
  registered: "Registered member data",
  invited: "Invited member data",
  results: "Results",
  search: "Search name or email",
  origin: "Member record origin",
  allUsers: "All users",
  selectPage: "Select invited records on this page",
  inviteSelected: "Invite selected",
  inviteAll: "Invite all invited records",
  reviewInvitations: "Review invitation addresses and progress",
  noReviewedEmail: "No reviewed email",
  emailVerified: "Email verified",
  emailNotVerified: "Email not verified",
  verified: "Verified",
  verificationPending: "Administrator verification pending",
  reviewIdentity: "Review identity & verification",
  selectForInvite: "Select for invitation",
  manageInvitation: "Manage invitation",
  noResults: "No results.",
  pages: "User pages",
  previous: "Previous",
  next: "Next",
  loadFailed: "Unable to load users. Please try again.",
  dialogTitle: "Member identity review",
  dialogDescription: "Compare registration details with published profiles and approve the correct identity.",
  finding: "Finding matching profiles…",
  reviewFailed: "Unable to load the review. Close this window and try again.",
  hasProfile: "This account already has a canonical profile.",
  viewProfile: "View profile",
  matches: "Matching profiles",
  publishedProfile: "Published profile",
  companyWebsite: "Company website",
  noneMatch: "I reviewed the results; none belongs to this member. Create a new profile.",
  noMatch: "No match found. Publish a new member profile after verification.",
  confirm: "I reviewed the identity evidence and member details and approve the Verified step.",
  approve: "Approve profile & verify",
  approving: "Approving…",
  approved: "The member is verified and their canonical profile is ready.",
  approveFailed: "Unable to verify this profile.",
  stale: "The matching profiles changed since this review opened, so they were reloaded. Check your choice and approve again.",
  blockersTitle: "Before approving:",
  blockEmail: "The member has not confirmed their email yet. Approval is possible after that.",
  blockComplete: "The member must complete registration details before approval.",
  blockChoice: "Choose the matching profile or a new profile.",
  blockConfirm: "Tick the identity review confirmation.",
  inviteTitle: "Review registration invitations",
  inviteAllScope: "This action includes every invited record, regardless of the current search.",
  inviteSelectedScope: "{count} records selected.",
  inviteRules: "Individual invitations use administrator-reviewed email addresses only. Registered accounts, missing addresses and active invitations are skipped. Identity matching continues during registration and verification.",
  inviteQueue: "Queue registration invitations",
  inviteQueued: "{queued} invitations queued; {skipped} ineligible or already processing records skipped.",
  inviteFailed: "Unable to queue invitations.",
  signalName: "Name",
  signalCompanyWebsite: "Company website",
  signalCompanyName: "Company name",
  signalContactEmail: "Reviewed contact email",
  signalInvitationEmail: "Invitation email",
}

export const adminUsersCopy = { ar, en }
export type AdminUsersCopy = typeof ar

export function adminUsersText(locale: Locale): AdminUsersCopy {
  return locale === "ar" ? ar : en
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

const signalKeys: Record<string, keyof AdminUsersCopy> = {
  name: "signalName",
  company_website: "signalCompanyWebsite",
  company_name: "signalCompanyName",
  verified_contact_email: "signalContactEmail",
  verified_invitation_email: "signalInvitationEmail",
}

/** Label for a matching signal from `FounderIdentityService`; LinkedIn and unknown codes stay as given. */
export function signalLabel(locale: Locale, signal: string): string {
  if (signal === "linkedin") return "LinkedIn"
  const key = signalKeys[signal]
  return key ? adminUsersText(locale)[key] : signal
}

export type IdentityReview = {
  user: { email_verified: boolean }
  profile: { id: number } | null
  application: { onboarding_data: unknown } | null
  candidates: { id: number }[]
}

export type VerifyBlocker = "email" | "complete" | "choice" | "confirm"

/**
 * Reasons the approve button is unavailable, in the order an administrator can act on them.
 * Mirrors `Admin\UserController@verify` and `FounderIdentityService`: an account that already has
 * a canonical profile needs no matching choice; a registration needs details and, when profiles
 * match, a choice between one of them and a new profile.
 */
export function verifyBlockers(review: IdentityReview, choice: string, confirmed: boolean): VerifyBlocker[] {
  const blockers: VerifyBlocker[] = []
  if (!review.user.email_verified) blockers.push("email")
  const hasDetails = Boolean(review.application?.onboarding_data)
  if (!review.profile && !hasDetails) blockers.push("complete")
  if (!review.profile && hasDetails && !validChoice(review, choice)) blockers.push("choice")
  if (!confirmed) blockers.push("confirm")
  return blockers
}

function validChoice(review: IdentityReview, choice: string): boolean {
  if (choice === "new") return true
  return /^[1-9]\d*$/.test(choice) && review.candidates.some((candidate) => candidate.id === Number(choice))
}

export function blockerText(locale: Locale, blocker: VerifyBlocker): string {
  const t = adminUsersText(locale)
  return { email: t.blockEmail, complete: t.blockComplete, choice: t.blockChoice, confirm: t.blockConfirm }[blocker]
}

/** Request body for the verify call; a stale choice that is no longer listed is never sent. */
export function verifyPayload(review: IdentityReview, choice: string) {
  const id = choice !== "new" && validChoice(review, choice) ? Number(choice) : null
  return { identity_verified: true, matched_founder_id: review.profile ? null : id, create_new_profile: !review.profile && choice === "new" }
}

/**
 * A 409 while choosing among candidates means the list changed (`identity.stale` or
 * `identity.match`): the page reloads the candidates instead of leaving a dead end.
 */
export function shouldReloadReview(status: number | undefined, review: IdentityReview): boolean {
  return status === 409 && !review.profile && Boolean(review.application?.onboarding_data) && review.user.email_verified
}
