"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { locale } = useLocale();
  const t = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const inviteToken = searchParams.get("invite") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    if (password !== passwordConfirmation) {
      setError(t("كلمتا المرور غير متطابقتين.", "The passwords do not match."));
      return;
    }
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(t("استخدم 8 أحرف على الأقل، منها أحرف كبيرة وصغيرة ورقم واحد على الأقل.", "Use at least 8 characters, including uppercase and lowercase letters and a number."));
      return;
    }
    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation, inviteToken || undefined);
      router.replace("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.", "Could not create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="mx-auto max-w-md">
          <p className="gateway-eyebrow">WOSOOL</p>
          <h1 className="gateway-heading">{t("أنشئ حسابك", "Create your account")}</h1>
          <p className="gateway-lead mb-8">
            {t("أنشئ حسابك، أكّد بريدك، ثم أكمل طلب الانضمام.", "Create an account, verify your email, then complete your membership application.")}
          </p>
          <form onSubmit={handleSubmit} className="gateway-card space-y-5" aria-busy={isSubmitting}>
            <label className="gateway-label" htmlFor="register-name">
              {t("الاسم الكامل", "Full name")}
              <input id="register-name" name="name" className="gateway-input" autoComplete="name" required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} disabled={isSubmitting} />
            </label>
            <label className="gateway-label" htmlFor="register-email">
              {t("البريد الإلكتروني", "Email")}
              <input id="register-email" name="email" className="gateway-input" type="email" dir="ltr" autoComplete="email" placeholder="name@company.com" required maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} />
            </label>
            <div>
              <label className="gateway-label" htmlFor="register-password">{t("كلمة المرور", "Password")}</label>
              <input id="register-password" name="password" className="gateway-input" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} aria-describedby="register-password-help" />
              <p id="register-password-help" className="mt-2 text-sm leading-relaxed text-slate-600">{t("يجب أن تتكون من 8 أحرف على الأقل، وتتضمن أحرفًا كبيرة وصغيرة ورقمًا واحدًا على الأقل.", "Use at least 8 characters, including uppercase and lowercase letters and at least one number.")}</p>
            </div>
            <label className="gateway-label" htmlFor="register-password-confirmation">
              {t("تأكيد كلمة المرور", "Confirm password")}
              <input id="register-password-confirmation" name="password_confirmation" className="gateway-input" type="password" autoComplete="new-password" required minLength={8} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} disabled={isSubmitting} />
            </label>
            <label className="flex items-start gap-3 text-sm leading-7"><input type="checkbox" name="consent" required className="mt-2 h-4 w-4 shrink-0" /> <span>{t("أوافق على", "I agree to the")} <Link href="/terms" className="underline">{t("الشروط", "terms")}</Link> {t("و", "and")} <Link href="/privacy" className="underline">{t("سياسة الخصوصية", "privacy policy")}</Link>.</span></label>
            {error && <p className="gateway-error break-words" role="alert">{error}</p>}
            <button type="submit" className="gateway-button w-full" disabled={isSubmitting}>{isSubmitting ? t("جارٍ إنشاء الحساب…", "Creating your account…") : t("إنشاء الحساب وإرسال الرمز", "Create account & send code")}</button>
            <Link href="/login" className="gateway-button-secondary w-full">{t("لديك حساب؟ تسجيل الدخول", "Already have an account? Sign in")}</Link>
          </form>
          <p className="mt-6 text-center text-sm leading-relaxed text-slate-600">
            {t("بإنشاء الحساب، فإنك توافق على", "By creating an account, you agree to the")}{" "}
            <Link href="/terms" className="underline">{t("الشروط", "terms")}</Link>{" "}
            {t("و", "and")}{" "}<Link href="/privacy" className="underline">{t("سياسة الخصوصية", "privacy policy")}</Link>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
