"use client";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";
import { safeRedirect, workspacePath } from "@/lib/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      await login(String(f.get("email")), String(f.get("password")));
      const me = await api.get<{
        user: {
          is_admin?: boolean;
          role_token?: string;
          roles?: string[];
          is_accelerator_applicant?: boolean;
        };
      }>("/auth/me");
      router.replace(
        params.get("redirect")
          ? safeRedirect(params.get("redirect"), workspacePath(me.user))
          : workspacePath(me.user),
      );
      router.refresh();
    } catch {
      setError(
        t(
          "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور أو أعد المحاولة لاحقًا.",
          "Could not sign in. Check your email and password, or try again later.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="mx-auto max-w-md">
          <p className="gateway-eyebrow">WOSOOL</p>
          <h1 className="gateway-heading">
            {t("مرحبًا بعودتك", "Welcome back")}
          </h1>
          <p className="gateway-lead mb-8">
            {t(
              "ادخل لمتابعة طلبك أو الوصول إلى مساحة عملك.",
              "Sign in to track your application or access your workspace.",
            )}
          </p>
          <form onSubmit={submit} className="gateway-card space-y-5">
            <label className="gateway-label">
              {t("البريد الإلكتروني", "Email")}
              <input
                className="gateway-input"
                name="email"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                disabled={busy}
              />
            </label>
            <label className="gateway-label">
              {t("كلمة المرور", "Password")}
              <span className="relative block">
                <input
                  name="password"
                  type={visible ? "text" : "password"}
                  className="gateway-input pe-12"
                  autoComplete="current-password"
                  required
                  disabled={busy}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 end-3"
                  aria-label={
                    visible
                      ? t("إخفاء كلمة المرور", "Hide password")
                      : t("إظهار كلمة المرور", "Show password")
                  }
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <Link
              className="block text-sm text-[#3B52D4] underline"
              href="/forgot-password"
            >
              {t("نسيت كلمة المرور؟", "Forgot password?")}
            </Link>
            {error && (
              <p role="alert" className="gateway-error">
                {error}
              </p>
            )}
            <button className="gateway-button w-full" disabled={busy}>
              {busy
                ? t("جارٍ تسجيل الدخول…", "Signing in…")
                : t("تسجيل الدخول", "Sign in")}
            </button>
            <Link
              className="gateway-button-secondary w-full"
              href="/EOA/apply"
            >
              {t(
                "إنشاء حساب للتقديم إلى المسرّعة",
                "Create an accelerator account",
              )}
            </Link>
            <Link
              className="block text-center text-sm underline"
              href="/register"
            >
              {t(
                "لدي دعوة لعضوية المجتمع",
                "I have a community membership invitation",
              )}
            </Link>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
