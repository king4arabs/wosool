"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";
import { ProgramOperations } from "./ProgramOperations";
import { api } from "@/lib/api";
import {
  gatewayError,
  label,
  fieldLabel,
  statusLabels,
  type Application,
  type GatewaySettings,
} from "@/lib/gateway";
const transitions: Record<string, string[]> = {
  submitted: ["under_review"],
  under_review: [
    "information_requested",
    "shortlisted",
    "waitlisted",
    "declined",
  ],
  shortlisted: ["accepted", "waitlisted", "declined", "information_requested"],
  waitlisted: ["under_review", "accepted", "declined"],
};
type ReviewData = {
  data: Application[];
  meta: {
    program_id: number;
    current_page: number;
    last_page: number;
    total: number;
  };
  reviewers: { id: number; name: string }[];
  cohorts: { id: number; name: string }[];
  settings: GatewaySettings | null;
};
export function ReviewWorkspace() {
  const { user, isLoading } = useAuth();
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const admin = !!user?.isAdmin || user?.roles?.includes("admin");
  const reviewer = admin || user?.roles?.includes("accelerator-reviewer");
  const [data, setData] = useState<ReviewData | null>(null);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const r = await api.get<ReviewData>("/review/accelerator", {
        params: { status: filter, page },
      });
      setData(r);
      setSettings(r.settings);
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }, [filter, page, ar]);
  useEffect(() => {
    if (reviewer) void load();
  }, [reviewer, load]);
  async function update(a: Application, change: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      await api.patch("/review/accelerator/" + a.id, {
        revision: a.revision,
        ...change,
        message: notes[a.id] || undefined,
      });
      await load();
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  async function saveSettings() {
    if (!settings) return;
    setBusy(true);
    try {
      await api.put("/admin/accelerator/settings", settings);
      setMessage(t("تم حفظ الإعدادات.", "Settings saved."));
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  if (isLoading) return <p>…</p>;
  if (!user)
    return (
      <Link className="gateway-button" href="/login?redirect=/review">
        {t("تسجيل الدخول", "Sign in")}
      </Link>
    );
  if (!reviewer)
    return (
      <p role="alert">
        {t(
          "هذه الصفحة للمراجعين المكلّفين فقط.",
          "This workspace is for assigned reviewers.",
        )}
      </p>
    );
  return (
    <div className="mx-auto max-w-6xl">
      <p className="gateway-eyebrow">EO RIYADH ACCELERATOR</p>
      <h1 className="gateway-heading">
        {t("مراجعة الطلبات", "Application review")}
      </h1>
      <div className="mt-6 flex flex-wrap gap-4">
        <label className="gateway-label">
          {t("الحالة", "Status")}
          <select
            className="gateway-input"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("جميع الطلبات", "All applications")}</option>
            {Object.keys(statusLabels)
              .filter((s) => s !== "draft")
              .map((s) => (
                <option key={s} value={s}>
                  {label(s, ar)}
                </option>
              ))}
          </select>
        </label>
        <button
          className="gateway-button-secondary self-end"
          disabled={busy}
          onClick={() => void load()}
        >
          {t("تحديث", "Refresh")}
        </button>
        {data && admin && (
          <Link
            className="gateway-button-secondary self-end"
            href={"/admin/programs/" + data.meta.program_id}
          >
            {t(
              "إدارة الدفعات والجلسات والموارد",
              "Manage cohorts, sessions and resources",
            )}
          </Link>
        )}
      </div>
      {error && (
        <p role="alert" className="gateway-error mt-5">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-5">
          {message}
        </p>
      )}
      {busy && (
        <p role="status" className="mt-5">
          {t("جارٍ التحديث…", "Updating…")}
        </p>
      )}
      {data && (
        <p className="mt-6 text-sm text-slate-500">
          {data.meta.total} {t("طلب", "applications")}
        </p>
      )}
      <div className="mt-6 space-y-5">
        {data?.data.map((a) => (
          <article key={a.id} className="gateway-card">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{a.user?.name}</h2>
                <p className="mt-2 text-sm">
                  <bdi>{a.user?.email}</bdi> · {a.gateway_payload.company_name}
                </p>
              </div>
              <span className="gateway-badge self-start">
                {label(a.status, ar)}
              </span>
            </div>
            <details className="mt-5">
              <summary className="cursor-pointer font-semibold">
                {t("ملف المؤسس والشركة", "Founder and company profile")}
              </summary>
              <dl className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                {Object.entries(a.gateway_payload).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-bold text-slate-500">
                      {fieldLabel(k, ar)}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-7">
                      {typeof v === "boolean"
                        ? v
                          ? t("نعم", "Yes")
                          : t("لا", "No")
                        : String(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
            {admin && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="gateway-label">
                  {t("المراجع المكلّف", "Assigned reviewer")}
                  <select
                    className="gateway-input"
                    disabled={busy}
                    value={a.assigned_reviewer_id || ""}
                    onChange={(e) =>
                      void update(a, {
                        assigned_reviewer_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">{t("غير مكلّف", "Unassigned")}</option>
                    {data.reviewers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="gateway-label">
                  {t("الدفعة", "Cohort")}
                  <select
                    className="gateway-input"
                    disabled={busy}
                    value={a.cohort_id || ""}
                    onChange={(e) =>
                      void update(a, {
                        cohort_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">{t("غير محددة", "Unassigned")}</option>
                    {data.cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <label className="gateway-label mt-5">
              {t(
                "رسالة للمتقدم (مطلوبة عند طلب معلومات أو رفض الطلب)",
                "Applicant message (required for information requests or declines)",
              )}
              <textarea
                className="gateway-input"
                rows={3}
                maxLength={3000}
                value={notes[a.id] || ""}
                onChange={(e) =>
                  setNotes((n) => ({ ...n, [a.id]: e.target.value }))
                }
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {(transitions[a.status] || [])
                .filter(
                  (s) =>
                    admin ||
                    !["accepted", "waitlisted", "declined"].includes(s),
                )
                .map((s) => (
                  <button
                    key={s}
                    className="gateway-button-secondary"
                    disabled={busy}
                    onClick={() => void update(a, { status: s })}
                  >
                    {label(s, ar)}
                  </button>
                ))}
              <button
                className="gateway-button-secondary"
                disabled={busy || !notes[a.id]}
                onClick={() => void update(a, {})}
              >
                {t("حفظ كملاحظة داخلية", "Save as internal note")}
              </button>
            </div>
            <details className="mt-5">
              <summary className="cursor-pointer text-sm font-semibold">
                {t("سجل المراجعة", "Review history")}
              </summary>
              <ol className="mt-3 space-y-3">
                {a.events.map((e) => (
                  <li key={e.id} className="text-sm leading-7">
                    <time>
                      {new Date(e.created_at).toLocaleString(
                        ar ? "ar-SA" : "en-GB",
                        { timeZone: "Asia/Riyadh" },
                      )}
                    </time>{" "}
                    · {label(e.to_status, ar)}{" "}
                    {e.is_internal ? t("(داخلي)", "(internal)") : ""}
                    <p className="whitespace-pre-wrap">{e.message}</p>
                  </li>
                ))}
              </ol>
            </details>
          </article>
        ))}
      </div>
      {data && !data.data.length && (
        <p className="gateway-card mt-6">
          {t(
            "لا توجد طلبات تطابق هذا الاختيار.",
            "No applications match this selection.",
          )}
        </p>
      )}
      {data && data.meta.last_page > 1 && (
        <div className="mt-6 flex gap-3">
          <button
            className="gateway-button-secondary"
            disabled={page === 1 || busy}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("السابق", "Previous")}
          </button>
          <button
            className="gateway-button-secondary"
            disabled={page >= data.meta.last_page || busy}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("التالي", "Next")}
          </button>
        </div>
      )}
      {admin && settings && (
        <details className="gateway-card mt-8">
          <summary className="cursor-pointer text-lg font-bold">
            {t("إعدادات الملاءمة والتقديم", "Eligibility and intake settings")}
          </summary>
          <p className="mt-4 text-sm leading-7">
            {t(
              "أدخل معلومات مؤكدة فقط مع مصدر وتاريخ تحقق. اترك رسوم ومواعيد الرياض فارغة حتى اعتمادها.",
              "Use confirmed information with a source and verification date. Leave Riyadh fees and dates empty until approved.",
            )}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(
              [
                "min_revenue_usd",
                "max_revenue_usd",
                "global_fee_usd",
                "local_fee",
                "local_dates",
                "source_url",
                "verified_at",
              ] as const
            ).map((k) => (
              <label className="gateway-label" key={k}>
                {
                  {
                    min_revenue_usd: t(
                      "الحد الأدنى للإيراد بالدولار",
                      "Minimum revenue USD",
                    ),
                    max_revenue_usd: t(
                      "الحد الأعلى للإيراد بالدولار",
                      "Maximum revenue USD",
                    ),
                    global_fee_usd: t(
                      "الرسوم العالمية بالدولار",
                      "Global fee USD",
                    ),
                    local_fee: t(
                      "الرسوم المحلية المؤكدة",
                      "Confirmed local fees",
                    ),
                    local_dates: t(
                      "المواعيد المحلية المؤكدة",
                      "Confirmed local dates",
                    ),
                    source_url: t("المصدر", "Source URL"),
                    verified_at: t("تاريخ التحقق", "Verified date"),
                  }[k]
                }
                <input
                  className="gateway-input"
                  type={
                    k.endsWith("_usd")
                      ? "number"
                      : k === "verified_at"
                        ? "date"
                        : "text"
                  }
                  value={settings[k] ?? ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [k]: k.endsWith("_usd")
                        ? e.target.value === ""
                          ? null
                          : Number(e.target.value)
                        : e.target.value || null,
                    })
                  }
                />
              </label>
            ))}
          </div>
          <label className="mt-5 flex gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.intake_enabled}
              onChange={(e) =>
                setSettings({ ...settings, intake_enabled: e.target.checked })
              }
            />
            {t("استقبال الطلبات المحلية", "Accept local applications")}
          </label>
          <label className="mt-4 flex gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.allow_venture_backed}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  allow_venture_backed: e.target.checked,
                })
              }
            />
            {t(
              "إتاحة مسار الشركات المدعومة استثماريًا",
              "Allow venture-backed eligibility route",
            )}
          </label>
          <button
            className="gateway-button mt-5"
            disabled={busy}
            onClick={() => void saveSettings()}
          >
            {t("حفظ الإعدادات", "Save settings")}
          </button>
        </details>
      )}
      {admin && <ProgramOperations />}
    </div>
  );
}
