"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/lib/locale";
import { api } from "@/lib/api";
import { gatewayError } from "@/lib/gateway";
type Partner = {
  id: number;
  name: string;
  name_ar: string | null;
  name_en: string | null;
  slug: string;
  type: string;
  status: string;
  logo_url: string | null;
  website: string | null;
  display_order: number;
  is_public: boolean;
  identity_status: string;
  asset_status: string;
  designation_status: string;
  logo_source_url: string | null;
  approval_note: string | null;
};
const blank: Partner = {
  id: 0,
  name: "",
  name_ar: "",
  name_en: "",
  slug: "",
  type: "ecosystem",
  status: "prospective",
  logo_url: "",
  website: "",
  display_order: 10,
  is_public: false,
  identity_status: "needs_review",
  asset_status: "needs_review",
  designation_status: "needs_review",
  logo_source_url: "",
  approval_note: "",
};
export default function AdminPartners() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState<Partner[]>([]);
  const [edit, setEdit] = useState<Partner | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const r = await api.get<{ data: Partner[] }>("/admin/partners");
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
      const values = {
        ...edit,
        name: edit.name_en || edit.name_ar || edit.name,
      };
      if (edit.id) await api.put("/admin/partners/" + edit.id, values);
      else await api.post("/admin/partners", values);
      setEdit(null);
      await load();
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="gateway-heading">
        {t("الشركاء والشعارات", "Partners and logos")}
      </h1>
      <p className="gateway-lead">
        {t(
          "اعتمد هوية الجهة، ومصدر الشعار، وصفة الشراكة قبل إظهارها. يُحفظ ترتيب العرض كما تحدده هنا.",
          "Verify identity, official artwork, and the partnership designation before publishing. Display order is controlled here.",
        )}
      </p>
      <button
        className="gateway-button mt-5"
        onClick={() => setEdit({ ...blank })}
      >
        {t("إضافة شريك", "Add partner")}
      </button>
      {error && (
        <p className="gateway-error mt-5" role="alert">
          {error}
        </p>
      )}
      {edit && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="gateway-card mt-6 space-y-5"
        >
          <h2 className="text-xl font-bold">
            {t("بيانات الشريك", "Partner details")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["name_ar", "الاسم بالعربية", "Arabic name"],
                ["name_en", "الاسم بالإنجليزية", "English name"],
                ["website", "الموقع الرسمي", "Official website"],
                [
                  "logo_url",
                  "مسار الشعار أو رابطه الرسمي",
                  "Logo path or official URL",
                ],
                ["logo_source_url", "مصدر الشعار", "Official artwork source"],
                ["slug", "المعرّف", "Slug"],
              ] as const
            ).map(([key, a, e]) => (
              <label className="gateway-label" key={key}>
                {t(a, e)}
                <input
                  className="gateway-input"
                  value={edit[key] || ""}
                  required={key === "name_en"}
                  onChange={(e) =>
                    setEdit({ ...edit, [key]: e.target.value || null })
                  }
                />
              </label>
            ))}
            <label className="gateway-label">
              {t("ترتيب العرض", "Display order")}
              <input
                type="number"
                min="0"
                max="100000"
                className="gateway-input"
                value={edit.display_order}
                onChange={(e) =>
                  setEdit({ ...edit, display_order: Number(e.target.value) })
                }
              />
            </label>
            <label className="gateway-label">
              {t("حالة العلاقة", "Relationship status")}
              <select
                className="gateway-input"
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
              >
                {[
                  ["prospective", "قيد المراجعة", "Prospective"],
                  ["confirmed", "مؤكدة", "Confirmed"],
                  ["ecosystem-aligned", "ضمن المنظومة", "Ecosystem aligned"],
                  ["past-collaborator", "تعاون سابق", "Past collaborator"],
                ].map(([v, a, e]) => (
                  <option key={v} value={v}>
                    {t(a, e)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(
            [
              [
                "identity_status",
                "تم التحقق من هوية الجهة",
                "Organization identity verified",
                "verified",
              ],
              [
                "asset_status",
                "الشعار أصلي ومعتمد للاستخدام",
                "Authentic artwork approved for use",
                "verified",
              ],
              [
                "designation_status",
                "صفة الشراكة مؤكدة",
                "Partnership designation approved",
                "approved",
              ],
            ] as const
          ).map(([key, a, e, v]) => (
            <label key={key} className="flex gap-3 text-sm leading-7">
              <input
                type="checkbox"
                checked={edit[key] === v}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    [key]: e.target.checked ? v : "needs_review",
                  })
                }
              />
              {t(a, e)}
            </label>
          ))}
          <label className="gateway-label">
            {t(
              "أساس الاعتماد وملاحظة المراجعة",
              "Approval basis and review note",
            )}
            <textarea
              className="gateway-input"
              rows={3}
              maxLength={2000}
              value={edit.approval_note || ""}
              onChange={(e) =>
                setEdit({ ...edit, approval_note: e.target.value })
              }
            />
          </label>
          <label className="flex gap-3 text-sm">
            <input
              type="checkbox"
              checked={edit.is_public}
              onChange={(e) =>
                setEdit({ ...edit, is_public: e.target.checked })
              }
            />
            {t(
              "إظهار في الموقع بعد اكتمال التحقق",
              "Show publicly once all verification is complete",
            )}
          </label>
          <div className="flex gap-3">
            <button className="gateway-button" disabled={busy}>
              {t("حفظ", "Save")}
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
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {rows.map((p) => (
          <article className="gateway-card" key={p.id}>
            {p.logo_url && (
              <div className="mb-5 flex h-24 justify-center">
                <Image
                  src={p.logo_url}
                  alt={p.name}
                  width={180}
                  height={96}
                  unoptimized
                  className="h-24 w-44 object-contain"
                />
              </div>
            )}
            <div className="flex justify-between gap-3">
              <h2 className="text-lg font-bold">
                {ar ? p.name_ar || p.name : p.name_en || p.name}
              </h2>
              <span className="gateway-badge">{p.display_order}</span>
            </div>
            <p className="mt-3 text-sm leading-7">
              {p.is_public &&
              p.designation_status === "approved" &&
              p.asset_status === "verified" &&
              p.identity_status === "verified"
                ? t("جاهز للعرض", "Ready for display")
                : t("بانتظار استكمال المراجعة", "Review required")}
            </p>
            {p.approval_note && (
              <p className="mt-2 text-xs leading-6 text-slate-600">
                {p.approval_note}
              </p>
            )}
            <button
              className="gateway-button-secondary mt-4"
              onClick={() => setEdit({ ...p })}
            >
              {t("مراجعة وتعديل", "Review and edit")}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
