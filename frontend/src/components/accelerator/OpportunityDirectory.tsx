"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useLocale } from "@/lib/locale";
import { api } from "@/lib/api";
import { gatewayError, safeWebUrl } from "@/lib/gateway";
export type EcosystemRecord = {
  id: number;
  slug: string;
  entity_type: string;
  name_ar: string;
  name_en: string;
  category: string;
  description_ar: string;
  description_en: string;
  website_url: string;
  application_url?: string;
  verification_status: string;
  application_status: string;
  deadline?: string;
  verified_at: string;
  source_urls: string[];
  updated_at: string;
  details: {
    coverage?: string;
    coverage_ar?: string;
    delivery_format?: string;
    stages?: string[];
    sectors?: string[];
    support_type?: string[];
    funding_terms?: string;
    funding_terms_ar?: string;
    eligibility_ar?: string;
    eligibility_en?: string;
    starts_at?: string;
    ends_at?: string;
    contact_email?: string;
    notes?: string;
  };
};
const categories: Record<string, [string, string]> = {
  mentorship: ["الإرشاد", "Mentorship"],
  digital_entrepreneurship: [
    "ريادة الأعمال الرقمية",
    "Digital entrepreneurship",
  ],
  competition: ["المسابقات", "Competitions"],
  pre_accelerator: ["ما قبل التسريع", "Pre-accelerator"],
  funding_guarantee: ["ضمان التمويل", "Financing guarantees"],
  development_finance: ["التمويل التنموي", "Development finance"],
  government_support: ["جهات الدعم", "Public support"],
  incubation: ["الاحتضان", "Incubation"],
  acceleration: ["التسريع", "Acceleration"],
  accelerator: ["المسرعات", "Accelerators"],
  training: ["التدريب", "Training"],
  venture_capital: ["رأس المال الجريء", "Venture capital"],
  financing: ["التمويل", "Financing"],
  innovation_hub: ["مراكز الابتكار", "Innovation hubs"],
  entrepreneurship_support: ["دعم ريادة الأعمال", "Entrepreneurship support"],
};
export function OpportunityDirectory({ slug }: { slug?: string }) {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState<EcosystemRecord[]>([]);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      api
        .get<{ data: EcosystemRecord[] | EcosystemRecord; last_page?: number }>(
          slug ? `/ecosystem/${encodeURIComponent(slug)}` : "/ecosystem",
          {
            params: slug
              ? {}
              : { search, entity_type: kind, application_status: status, page },
          },
        )
        .then((r) => {
          if (active) {
            setRows(Array.isArray(r.data) ? r.data : [r.data]);
            setLast(r.last_page || 1);
          }
        })
        .catch((e) => {
          if (active) {
            setRows([]);
            setError(gatewayError(e, ar));
          }
        })
        .finally(() => {
          if (active) setBusy(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [slug, search, kind, status, page, ar, reload]);
  function statusText(r: EcosystemRecord) {
    return r.application_status === "open"
      ? t("التقديم مفتوح", "Applications open")
      : r.application_status === "closed"
        ? t("التقديم مغلق", "Applications closed")
        : t("موعد التقديم غير معلن", "Intake not announced");
  }
  return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="mx-auto max-w-6xl">
          <p className="gateway-eyebrow">
            {t(
              "منظومة ريادة الأعمال السعودية",
              "SAUDI ENTREPRENEURSHIP ECOSYSTEM",
            )}
          </p>
          <h1 className="gateway-heading">
            {slug
              ? rows[0]?.[ar ? "name_ar" : "name_en"] ||
                t("تفاصيل الفرصة", "Opportunity details")
              : t("اعثر على خطوتك المناسبة.", "Find the right next step.")}
          </h1>
          <p className="gateway-lead">
            {t(
              "جهات وبرامج وفرص موثّقة بمصادرها الرسمية. لكل برنامج شروطه، وتاريخ التحقق ظاهر لتسهيل المراجعة.",
              "Organizations, programs, and opportunities with official sources and review dates. Each program has its own eligibility and application process.",
            )}
          </p>
          {!slug && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="gateway-card mt-8 grid gap-4 md:grid-cols-[2fr_1fr_1fr]"
            >
              <label className="gateway-label">
                <span className="flex gap-2">
                  <Search size={18} />
                  {t("البحث", "Search")}
                </span>
                <input
                  className="gateway-input"
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t(
                    "اسم الجهة أو وصف البرنامج",
                    "Organization or program description",
                  )}
                />
              </label>
              <label className="gateway-label">
                {t("نوع السجل", "Record type")}
                <select
                  className="gateway-input"
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">{t("الكل", "All")}</option>
                  <option value="organization">
                    {t("الجهات", "Organizations")}
                  </option>
                  <option value="program">{t("البرامج", "Programs")}</option>
                  <option value="opportunity">
                    {t("فرص محددة", "Specific opportunities")}
                  </option>
                </select>
              </label>
              <label className="gateway-label">
                {t("حالة التقديم", "Application status")}
                <select
                  className="gateway-input"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">{t("الكل", "All")}</option>
                  <option value="open">{t("مفتوح", "Open")}</option>
                  <option value="closed">{t("مغلق", "Closed")}</option>
                  <option value="not_announced">
                    {t("غير معلن", "Not announced")}
                  </option>
                </select>
              </label>
            </form>
          )}
          {busy ? (
            <p role="status" className="mt-10">
              {t("جارٍ تحميل المصادر…", "Loading sources…")}
            </p>
          ) : error ? (
            <div className="mt-8 gateway-error" role="alert">
              {error}
              <button
                className="gateway-button-secondary mt-3"
                onClick={() => setReload((n) => n + 1)}
              >
                {t("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="gateway-card mt-8">
              <p>
                {t(
                  "لم نجد نتائج مطابقة. جرّب إزالة أحد المرشحات.",
                  "No matching records. Try removing a filter.",
                )}
              </p>
            </div>
          ) : (
            <div
              className={`mt-9 grid gap-5 ${slug ? "" : "md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {rows.map((r) => (
                <article key={r.id} className="gateway-card flex flex-col">
                  <div className="flex flex-wrap gap-2">
                    <span className="gateway-badge">
                      {r.verification_status === "expired"
                        ? t("منتهية / سجل تاريخي", "Expired / historical")
                        : t("تم التحقق", "Verified")}
                    </span>
                    <span className="text-xs leading-7 text-slate-600">
                      {categories[r.category]?.[ar ? 0 : 1] ||
                        r.category.replaceAll("_", " ")}
                    </span>
                  </div>
                  {!slug && (
                    <h2 className="mt-5 text-xl font-bold leading-8">
                      <Link href={"/opportunities/" + r.slug}>
                        {ar ? r.name_ar : r.name_en}
                      </Link>
                    </h2>
                  )}
                  <p className="mt-4 text-sm leading-8 text-slate-600">
                    {ar ? r.description_ar : r.description_en}
                  </p>
                  <p className="mt-5 text-sm font-semibold">{statusText(r)}</p>
                  <dl className="mt-4 space-y-3 text-sm leading-7">
                    {r.deadline && (
                      <div>
                        <dt className="font-semibold">
                          {t("آخر موعد", "Deadline")}
                        </dt>
                        <dd>
                          {new Date(r.deadline).toLocaleDateString(
                            ar ? "ar-SA" : "en-GB",
                            { timeZone: "Asia/Riyadh" },
                          )}
                        </dd>
                      </div>
                    )}
                    {slug && (
                      <>
                        <div>
                          <dt className="font-semibold">
                            {t("شروط الأهلية", "Eligibility")}
                          </dt>
                          <dd>
                            {r.details[
                              ar ? "eligibility_ar" : "eligibility_en"
                            ] ||
                              t(
                                "راجع المصدر الرسمي",
                                "See the official source",
                              )}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold">
                            {t(
                              "التغطية وآلية التقديم",
                              "Coverage and delivery",
                            )}
                          </dt>
                          <dd>
                            {(ar
                              ? r.details.coverage_ar
                              : r.details.coverage) ||
                              t("غير معلن", "Not announced")}{" "}
                            ·{" "}
                            {(ar
                              ? (
                                  {
                                    hybrid: "حضوري وعن بعد",
                                    in_person: "حضوري",
                                    online_self_paced: "تعلم ذاتي عبر الإنترنت",
                                    online_application: "تقديم إلكتروني",
                                  } as Record<string, string>
                                )[r.details.delivery_format || ""]
                              : r.details.delivery_format) ||
                              t("غير معلن", "Not announced")}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold">
                            {t(
                              "طبيعة الدعم والتمويل",
                              "Support and financing terms",
                            )}
                          </dt>
                          <dd>
                            {(ar
                              ? r.details.funding_terms_ar
                              : r.details.funding_terms) ||
                              t(
                                "لا توجد شروط مالية مؤكدة في هذا السجل. راجع الجهة.",
                                "No confirmed financial terms in this record. Check with the provider.",
                              )}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                  <p className="mt-5 text-xs text-slate-500">
                    {t("آخر تحقق: ", "Last verified: ")}
                    {r.verified_at.slice(0, 10)}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {!slug ? (
                      <Link
                        className="gateway-button-secondary"
                        href={"/opportunities/" + r.slug}
                      >
                        {t("التفاصيل والمصادر", "Details and sources")}
                      </Link>
                    ) : (
                      <>
                        <a
                          className="gateway-button-secondary"
                          href={r.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("الموقع الرسمي", "Official website")}
                          <ExternalLink size={15} />
                        </a>
                        {r.application_status === "open" &&
                          safeWebUrl(r.application_url) && (
                            <a
                              className="gateway-button"
                              href={r.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t(
                                "التقديم لدى الجهة",
                                "Apply with the provider",
                              )}
                            </a>
                          )}
                      </>
                    )}
                  </div>
                  {slug && (
                    <div className="mt-8 border-t border-slate-200 pt-5">
                      <h2 className="font-bold">
                        {t("المصادر الرسمية", "Official sources")}
                      </h2>
                      <ul className="mt-4 space-y-3">
                        {r.source_urls.map((u) => (
                          <li key={u}>
                            <a
                              className="break-all text-sm text-[#3B52D4] underline"
                              href={u}
                              target="_blank"
                              rel="noopener noreferrer"
                              dir="ltr"
                            >
                              {u}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 text-sm leading-7 text-slate-500">
                        {t(
                          "ظهور الجهة في الدليل لا يعني شراكة مع وصول. أكّد الشروط وتوافر التقديم لدى المصدر قبل اتخاذ قرار.",
                          "A directory listing does not imply a Wosool partnership. Confirm terms and availability with the provider before applying.",
                        )}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          {!slug && last > 1 && (
            <div className="mt-8 flex items-center gap-5">
              <button
                className="gateway-button-secondary"
                disabled={page === 1 || busy}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("السابق", "Previous")}
              </button>
              <span>
                {page} / {last}
              </span>
              <button
                className="gateway-button-secondary"
                disabled={page >= last || busy}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("التالي", "Next")}
              </button>
            </div>
          )}
          {slug && (
            <Link
              className="mt-7 inline-block font-semibold text-[#3B52D4]"
              href="/opportunities"
            >
              {t("العودة إلى جميع الفرص", "Back to all opportunities")}
            </Link>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
