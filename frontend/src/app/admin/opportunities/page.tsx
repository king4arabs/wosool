"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/locale";
import { api } from "@/lib/api";
import { gatewayError, fieldLabel, recordLabel } from "@/lib/gateway";
import type { EcosystemRecord } from "@/components/accelerator/OpportunityDirectory";
export default function DataReview() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState<EcosystemRecord[]>([]);
  const [edit, setEdit] = useState<EcosystemRecord | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const r = await api.get<{ data: EcosystemRecord[] }>("/admin/ecosystem");
      setRows(r.data);
    } catch (e) {
      setError(gatewayError(e, ar));
    }
  }, [ar]);
  useEffect(() => {
    void load();
  }, [load]);
  async function save() {
    if (!edit) return;
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/ecosystem/" + edit.id, {
        name_ar: edit.name_ar,
        name_en: edit.name_en,
        description_ar: edit.description_ar,
        description_en: edit.description_en,
        website_url: edit.website_url,
        application_url: edit.application_url,
        application_status: edit.application_status,
        deadline: edit.deadline || null,
        source_urls: edit.source_urls,
        verification_status: edit.verification_status,
        verified_at: edit.verified_at.slice(0, 10),
        updated_at: edit.updated_at,
        note,
      });
      setEdit(null);
      await load();
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <h1 className="gateway-heading">
        {t("مراجعة بيانات المنظومة", "Ecosystem source review")}
      </h1>
      <p className="gateway-lead">
        {t(
          "التعديلات تحفظ سجلًا للمراجعة وتقفل السجل أمام الاستيراد التلقائي. لا يؤثر هذا الدليل على بيانات المتقدمين.",
          "Reviews keep a revision history and protect edited records from automatic imports. Directory edits do not alter applicant data.",
        )}
      </p>
      {error && (
        <p role="alert" className="gateway-error mt-5">
          {error}
        </p>
      )}
      {edit && (
        <form
          className="gateway-card mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          {(
            ["name_ar", "name_en", "website_url", "application_url"] as const
          ).map((k) => (
            <label className="gateway-label" key={fieldLabel(k, ar)}>
              {fieldLabel(k, ar)}
              <input
                className="gateway-input"
                value={edit[k] || ""}
                onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
              />
            </label>
          ))}
          {(["description_ar", "description_en"] as const).map((k) => (
            <label className="gateway-label" key={fieldLabel(k, ar)}>
              {fieldLabel(k, ar)}
              <textarea
                rows={3}
                className="gateway-input"
                value={edit[k]}
                onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
              />
            </label>
          ))}
          <label className="gateway-label">
            {t("المصادر (رابط لكل سطر)", "Sources (one URL per line)")}
            <textarea
              className="gateway-input"
              value={edit.source_urls.join("\n")}
              onChange={(e) =>
                setEdit({
                  ...edit,
                  source_urls: e.target.value.split("\n").filter(Boolean),
                })
              }
            />
          </label>
          <label className="gateway-label">
            {t("التحقق", "Verification")}
            <select
              className="gateway-input"
              value={edit.verification_status}
              onChange={(e) =>
                setEdit({ ...edit, verification_status: e.target.value })
              }
            >
              {["verified", "needs_review", "expired", "archived"].map((v) => (
                <option key={v} value={v}>
                  {recordLabel(v, ar)}
                </option>
              ))}
            </select>
          </label>
          <label className="gateway-label">
            {t("حالة التقديم", "Application status")}
            <select
              className="gateway-input"
              value={edit.application_status}
              onChange={(e) =>
                setEdit({ ...edit, application_status: e.target.value })
              }
            >
              {["open", "closed", "not_announced"].map((v) => (
                <option key={v} value={v}>
                  {recordLabel(v, ar)}
                </option>
              ))}
            </select>
          </label>
          <label className="gateway-label">
            {t("آخر موعد مؤكد (اختياري)", "Confirmed deadline (optional)")}
            <input
              type="date"
              className="gateway-input"
              value={edit.deadline?.slice(0, 10) || ""}
              onChange={(e) =>
                setEdit({ ...edit, deadline: e.target.value || undefined })
              }
            />
          </label>
          <label className="gateway-label">
            {t("تاريخ التحقق", "Verification date")}
            <input
              type="date"
              className="gateway-input"
              required
              value={edit.verified_at.slice(0, 10)}
              onChange={(e) =>
                setEdit({ ...edit, verified_at: e.target.value })
              }
            />
          </label>
          <label className="gateway-label">
            {t("سبب التعديل", "Reason for review")}
            <textarea
              required
              maxLength={2000}
              className="gateway-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="flex gap-3">
            <button disabled={busy} className="gateway-button">
              {t("حفظ المراجعة", "Save review")}
            </button>
            <button
              type="button"
              className="gateway-button-secondary"
              onClick={() => setEdit(null)}
            >
              {t("إلغاء", "Cancel")}
            </button>
          </div>
        </form>
      )}
      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <article
            key={r.id}
            className="gateway-card flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h2 className="font-bold">{ar ? r.name_ar : r.name_en}</h2>
              <p className="mt-2 text-xs text-slate-600">
                {recordLabel(r.entity_type, ar)} ·{" "}
                {recordLabel(r.verification_status, ar)} ·{" "}
                {r.verified_at.slice(0, 10)}
              </p>
            </div>
            <button
              className="gateway-button-secondary"
              onClick={() => {
                setEdit({ ...r });
                setNote("");
              }}
            >
              {t("مراجعة المصادر", "Review sources")}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
