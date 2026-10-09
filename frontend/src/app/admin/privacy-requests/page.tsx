"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/lib/locale";
import { api } from "@/lib/api";
import { gatewayError, recordLabel } from "@/lib/gateway";
type RequestRow = {
  id: number;
  name: string;
  email: string;
  type: string;
  status: string;
  message?: string;
  resolution?: string;
  created_at: string;
};
export default function PrivacyRequests() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const load = useCallback(async () => {
    try {
      const r = await api.get<{
        data: { data: RequestRow[]; last_page: number };
      }>("/admin/privacy-requests", { params: { page } });
      setRows(r.data.data);
      setLast(r.data.last_page);
    } catch (e) {
      setError(gatewayError(e, ar));
    }
  }, [ar, page]);
  useEffect(() => {
    void load();
  }, [load]);
  async function resolve(id: number, status: string) {
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/privacy-requests/" + id, {
        status,
        resolution: notes[id],
      });
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
        {t("طلبات الخصوصية", "Privacy requests")}
      </h1>
      <p className="gateway-lead">
        {t(
          "راجع الطلب وأنجز إجراءه قبل تسجيله كمكتمل. لا يؤدي تغيير الحالة وحده إلى حذف البيانات أو إرسال نسخة منها.",
          "Review and fulfil the request before marking it complete. A status change alone does not delete data or deliver a copy.",
        )}
      </p>
      {error && (
        <p role="alert" className="gateway-error mt-5">
          {error}
        </p>
      )}
      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <article key={r.id} className="gateway-card">
            <h2 className="font-bold">
              {r.name} · {recordLabel(r.type, ar)}
            </h2>
            <p className="mt-2 text-sm">
              <bdi>{r.email}</bdi> · {recordLabel(r.status, ar)}
            </p>
            <p className="mt-3 text-sm">{r.message || r.resolution}</p>
            <label className="gateway-label mt-4">
              {t("الإجراء المنجز وسبب القرار", "Action taken and reason")}
              <textarea
                className="gateway-input"
                value={notes[r.id] || ""}
                onChange={(e) =>
                  setNotes((n) => ({ ...n, [r.id]: e.target.value }))
                }
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                ["in_review", "قيد المراجعة", "In review"],
                ["completed", "تم التنفيذ", "Fulfilled"],
                ["declined", "رفض مع التوضيح", "Declined with reason"],
              ].map(([v, a, e]) => (
                <button
                  key={v}
                  disabled={busy || !notes[r.id]}
                  className="gateway-button-secondary"
                  onClick={() => void resolve(r.id, v)}
                >
                  {t(a, e)}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      {last > 1 && (
        <div className="mt-5 flex gap-3">
          <button
            className="gateway-button-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("السابق", "Previous")}
          </button>
          <button
            className="gateway-button-secondary"
            disabled={page >= last}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("التالي", "Next")}
          </button>
        </div>
      )}
    </div>
  );
}
