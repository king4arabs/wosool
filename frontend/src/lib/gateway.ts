import { ApiError } from "./api";
export type Payload = {
  founder_role?: string;
  founder_bio?: string;
  city?: string;
  company_name?: string;
  company_description?: string;
  company_website?: string;
  sector?: string;
  company_stage?: string;
  team_size?: number | "";
  annual_revenue_usd?: number | "";
  private_funding_usd?: number | "";
  venture_backed?: boolean;
  is_owner?: boolean;
  is_operating?: boolean;
  motivation?: string;
  current_challenge?: string;
  expected_outcome?: string;
  availability_confirmed?: boolean;
  consent?: boolean;
};
export type GatewaySettings = {
  configured: boolean;
  intake_enabled: boolean;
  min_revenue_usd: number;
  max_revenue_usd: number;
  allow_venture_backed: boolean;
  global_fee_usd: number | null;
  local_fee: string | null;
  local_dates: string | null;
  source_url: string;
  verified_at: string;
};
export type Application = {
  id: number;
  status: string;
  revision: number;
  gateway_payload: Payload;
  submitted_at?: string;
  updated_at: string;
  assigned_reviewer_id?: number | null;
  cohort_id?: number | null;
  user?: { id: number; name: string; email: string };
  events: {
    id: number;
    from_status: string;
    to_status: string;
    message?: string;
    created_at: string;
    is_internal: boolean;
  }[];
  sessions: {
    id: number;
    title: string;
    starts_at?: string;
    location?: string;
    online_link?: string;
  }[];
  resources: {
    id: number;
    title: string;
    description?: string;
    url?: string;
  }[];
  mentors: { name: string }[];
  milestones: { title: string; completed: boolean }[];
};
export const statusLabels: Record<string, [string, string]> = {
  draft: ["مسودة", "Draft"],
  submitted: ["تم التقديم", "Submitted"],
  under_review: ["قيد المراجعة", "Under review"],
  information_requested: ["مطلوب استكمال معلومات", "Information requested"],
  shortlisted: ["القائمة المختصرة", "Shortlisted"],
  accepted: ["مقبول", "Accepted"],
  waitlisted: ["قائمة الانتظار", "Waitlisted"],
  declined: ["غير مقبول", "Declined"],
  onboarded: ["اكتمل الانضمام", "Onboarded"],
};
export const fieldLabels: Record<string, [string, string]> = {
  name_ar: ["الاسم بالعربية", "Arabic name"],
  name_en: ["الاسم بالإنجليزية", "English name"],
  description_ar: ["الوصف بالعربية", "Arabic description"],
  description_en: ["الوصف بالإنجليزية", "English description"],
  website_url: ["الموقع الرسمي", "Official website"],
  application_url: ["رابط التقديم", "Application URL"],
  founder_role: ["الدور في الشركة", "Company role"],
  founder_bio: ["نبذة المؤسس", "Founder background"],
  city: ["المدينة", "City"],
  company_name: ["اسم الشركة", "Company name"],
  company_description: ["وصف الشركة", "Company description"],
  company_website: ["موقع الشركة", "Company website"],
  sector: ["القطاع", "Sector"],
  company_stage: ["مرحلة الشركة", "Company stage"],
  team_size: ["حجم الفريق", "Team size"],
  annual_revenue_usd: ["الإيراد السنوي بالدولار", "Annual revenue USD"],
  private_funding_usd: ["التمويل الخاص بالدولار", "Private funding USD"],
  venture_backed: ["مدعومة برأس مال جريء", "Venture-backed"],
  is_owner: ["مالك أو مؤسس", "Owner or founder"],
  is_operating: ["شركة قائمة", "Operating business"],
  motivation: ["دافع التقديم", "Motivation"],
  current_challenge: ["التحدي الرئيسي", "Main challenge"],
  expected_outcome: ["النتيجة المستهدفة", "Expected outcome"],
  availability_confirmed: ["تأكيد الالتزام", "Availability confirmed"],
  consent: ["الموافقة", "Consent"],
  email: ["البريد الإلكتروني", "Email"],
  name: ["الاسم", "Name"],
  password: ["كلمة المرور", "Password"],
  password_confirmation: ["تأكيد كلمة المرور", "Confirm password"],
  status: ["الحالة", "Status"],
  message: ["الرسالة", "Message"],
  revision: ["نسخة الطلب", "Revision"],
};
export const fieldLabel = (key: string, ar: boolean) =>
  fieldLabels[key.replace("payload.", "")]?.[ar ? 0 : 1] ||
  key.replaceAll("_", " ");
export const label = (status: string, ar: boolean) =>
  statusLabels[status]?.[ar ? 0 : 1] || status;
export const safeWebUrl = (url?: string | null) =>
  !!url && /^https:\/\//i.test(url);
export function verificationPath(value: string | null): string | null {
  if (
    !value ||
    !/^\/api\/v1\/auth\/email\/verify\/\d+\/[a-f0-9]{40}\?/.test(value)
  )
    return null;
  const url = new URL(value, "https://wosool.org");
  if (
    url.origin !== "https://wosool.org" ||
    !/^\d+$/.test(url.searchParams.get("expires") || "") ||
    !/^[a-f0-9]{64}$/.test(url.searchParams.get("signature") || "")
  )
    return null;
  return url.pathname + url.search;
}
export function gatewayError(error: unknown, ar: boolean): string {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return ar
        ? "تغيّر الطلب أو حالته. أعد تحميل الصفحة قبل المتابعة."
        : "The record or its status changed. Reload before continuing.";
    if (error.status === 429)
      return ar
        ? "طلبات متكررة. انتظر دقيقة قبل المحاولة مجددًا."
        : "Too many requests. Wait a minute before retrying.";
    if (error.status === 503)
      return ar
        ? "الخدمة غير متاحة حاليًا. حاول لاحقًا."
        : "This service is currently unavailable. Please try later.";
    if (error.status === 401)
      return ar
        ? "انتهت الجلسة. سجّل الدخول مجددًا."
        : "Your session expired. Please sign in again.";
    if (error.status === 403)
      return ar
        ? "يلزم تأكيد البريد أو صلاحية الوصول المناسبة."
        : "Email verification or the appropriate access permission is required.";
    if (error.status === 422) {
      const data = error.data as { errors?: Record<string, string[]> };
      if (ar && data?.errors)
        return (
          "تحقق من الحقول: " +
          Object.keys(data.errors)
            .map((k) => fieldLabel(k, true))
            .join("، ") +
          (data.errors.email
            ? " — تأكد من صحة البريد وأنه لا يرتبط بحساب آخر."
            : "") +
          (data.errors.password
            ? " — استخدم ١٢ حرفًا على الأقل، منها أحرف كبيرة وصغيرة وأرقام، مع تأكيد مطابق."
            : "")
        );
      return (
        Object.values(data?.errors || {})
          .flat()
          .join(" ") ||
        (ar ? "تحقق من الحقول المطلوبة." : "Check the required fields.")
      );
    }
  }
  return ar
    ? "تعذر الاتصال بالخدمة. لم يتم تأكيد الحفظ. حاول مجددًا."
    : "The service could not be reached. Saving is not confirmed. Please retry.";
}

const recordLabels: Record<string, [string, string]> = {
  verified: ["تم التحقق", "Verified"],
  needs_review: ["تحتاج مراجعة", "Needs review"],
  expired: ["منتهية", "Expired"],
  archived: ["مؤرشفة", "Archived"],
  organization: ["جهة", "Organization"],
  program: ["برنامج", "Program"],
  opportunity: ["فرصة", "Opportunity"],
  open: ["التقديم مفتوح", "Applications open"],
  closed: ["التقديم مغلق", "Applications closed"],
  not_announced: ["لم يُعلن", "Not announced"],
  access: ["طلب نسخة", "Data access"],
  correction: ["تصحيح", "Correction"],
  deletion: ["حذف", "Deletion"],
  withdraw_consent: ["سحب الموافقة", "Consent withdrawal"],
  received: ["تم الاستلام", "Received"],
  in_review: ["قيد المراجعة", "In review"],
  completed: ["تم التنفيذ", "Fulfilled"],
  declined: ["مرفوض", "Declined"],
};
export const recordLabel = (key: string, ar: boolean) =>
  recordLabels[key]?.[ar ? 0 : 1] || key;
