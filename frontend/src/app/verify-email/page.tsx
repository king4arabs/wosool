"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";
import { sessionFetch } from "@/lib/session-request";
import { verificationPath } from "@/lib/gateway";
function Verify() {
  const { user, isLoading, refresh } = useAuth();
  const { locale } = useLocale();
  const ar = locale === "ar";
  const params = useSearchParams();
  const path = verificationPath(params.get("path"));
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    if (!user || !path) return;
    let active = true;
    sessionFetch(path)
      .then(async (r) => {
        if (active) {
          setStatus(r.ok ? "verified" : "error");
          if (r.ok) await refresh();
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [user?.id, path, refresh]); // eslint-disable-line react-hooks/exhaustive-deps
  const redirect = encodeURIComponent("/verify-email?" + params.toString());
  return (
    <div className="gateway-card mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">
        {ar ? "تأكيد البريد الإلكتروني" : "Verify email"}
      </h1>
      <p className="mt-5 leading-8">
        {!path || status === "error"
          ? ar
            ? "الرابط غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من صفحة طلبك."
            : "The link is invalid or expired. Request a new one from your application page."
          : status === "verified"
            ? ar
              ? "تم تأكيد بريدك. يمكنك متابعة طلبك."
              : "Your email is verified. Continue your application."
            : !user && !isLoading
              ? ar
                ? "سجّل الدخول إلى الحساب صاحب الرابط لتأكيده."
                : "Sign in to the account that received this link."
              : ar
                ? "جارٍ التحقق…"
                : "Verifying…"}
      </p>
      {!user && !isLoading ? (
        <Link
          className="gateway-button mt-6"
          href={"/login?redirect=" + redirect}
        >
          {ar ? "تسجيل الدخول" : "Sign in"}
        </Link>
      ) : (
        <Link className="gateway-button mt-6" href="/accelerator/apply">
          {ar ? "متابعة الطلب" : "Continue application"}
        </Link>
      )}
    </div>
  );
}
export default function VerifyEmail() {
  return (
    <PublicLayout>
      <section className="gateway-section">
        <Suspense fallback={<p>…</p>}>
          <Verify />
        </Suspense>
      </section>
    </PublicLayout>
  );
}
