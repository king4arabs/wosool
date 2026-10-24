// What to tell a visitor when "Connect & apply" on an opportunity does not open the provider.
// The API (EcosystemController::connect and the verified/member middleware) refuses for
// different reasons; each one needs its own next step instead of a generic message.

export type ConnectProblem =
  | "sign_in"
  | "verify_email"
  | "membership"
  | "profile_incomplete"
  | "profile_pending"
  | "profile_inactive"
  | "closed"
  | "unavailable"
  | "rate_limited"
  | "failed";

export interface ConnectGuidance {
  message: string;
  links: { href: string; label: string }[];
}

type Body = { reason?: unknown; message?: unknown } | null | undefined;

export function connectProblem(
  status: number,
  body: Body,
  user: { email_verified_at?: string | null } | null | undefined,
): ConnectProblem {
  const reason = typeof body?.reason === "string" ? body.reason : "";
  const message = typeof body?.message === "string" ? body.message : "";
  if (status === 401) return "sign_in";
  if (status === 429) return "rate_limited";
  if (status === 409) return "closed";
  if (status === 404) return "unavailable";
  if (status === 422)
    return reason === "profile_incomplete" ? "profile_incomplete" : "unavailable";
  if (status === 403) {
    if (reason === "profile_pending") return "profile_pending";
    if (reason === "profile_inactive" || /founder profile must be active/i.test(message))
      return "profile_inactive";
    // Laravel's `verified` middleware answers 403 before the membership check runs.
    // Match its message too: the user may still be loading when the button is pressed.
    if (/email address is not verified/i.test(message) || (user && !user.email_verified_at))
      return "verify_email";
    return "membership";
  }
  return "failed";
}

export function connectGuidance(problem: ConnectProblem, ar: boolean): ConnectGuidance {
  const t = (a: string, e: string) => (ar ? a : e);
  const all = { href: "/opportunities", label: t("جميع الفرص", "All opportunities") };
  switch (problem) {
    case "sign_in":
      return {
        message: t("سجّل الدخول لفتح هذه الفرصة.", "Sign in to open this opportunity."),
        links: [{ href: "/login", label: t("تسجيل الدخول", "Sign in") }],
      };
    case "verify_email":
      return {
        message: t(
          "أكّد بريدك الإلكتروني أولاً من الرابط الذي أرسلناه إليك، ثم عد إلى هذه الفرصة.",
          "Confirm your email first using the link we sent you, then come back to this opportunity.",
        ),
        links: [{ href: "/contact", label: t("لم يصلك الرابط؟ تواصل معنا", "No link? Contact us") }],
      };
    case "membership":
      return {
        message: t(
          "الفرص متاحة لأعضاء وصول. قدّم طلب العضوية، وبعد قبوله أكمل ملفك ثم عد إليها.",
          "Opportunities are open to Wosool members. Apply for membership; once you are accepted, complete your profile and come back.",
        ),
        links: [{ href: "/apply", label: t("طلب العضوية", "Apply for membership") }],
      };
    case "profile_incomplete":
      return {
        message: t(
          "أضف النبذة التعريفية والقطاع والموقع إلى ملفك، ثم عد إلى هذه الفرصة.",
          "Add your bio, sector and location to your profile, then come back to this opportunity.",
        ),
        links: [{ href: "/dashboard/profile", label: t("إكمال الملف", "Complete profile") }],
      };
    case "profile_pending":
      return {
        message: t(
          "تُفتح الفرص بعد اعتماد ملفك في وصول، وهو الآن قيد المراجعة.",
          "Opportunities open once your Wosool profile is approved. It is still under review.",
        ),
        links: [{ href: "/dashboard", label: t("لوحة العضو", "Member dashboard") }],
      };
    case "profile_inactive":
      return {
        message: t(
          "ملفك في وصول غير مفعّل حالياً، لذلك لا يمكن فتح الفرص. تواصل معنا لإعادة تفعيله.",
          "Your Wosool profile is not active, so opportunities are locked. Contact us to reactivate it.",
        ),
        links: [{ href: "/contact", label: t("تواصل معنا", "Contact us") }],
      };
    case "closed":
      return {
        message: t("التقديم على هذه الفرصة مغلق حالياً.", "Applications for this opportunity are closed right now."),
        links: [all],
      };
    case "unavailable":
      return {
        message: t("هذه الفرصة لم تعد متاحة.", "This opportunity is no longer available."),
        links: [all],
      };
    case "rate_limited":
      return {
        message: t(
          "محاولات كثيرة خلال وقت قصير. انتظر دقيقة ثم حاول مجدداً.",
          "Too many attempts in a short time. Wait a minute and try again.",
        ),
        links: [],
      };
    default:
      return {
        message: t("تعذر الاتصال. حاول مجدداً.", "Unable to connect. Please try again."),
        links: [],
      };
  }
}
