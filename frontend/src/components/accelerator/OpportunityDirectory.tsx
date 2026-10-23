"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Search, LockKeyhole } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useLocale } from "@/lib/locale";
import { useAuth } from "@/lib/auth";
import { safeWebUrl } from "@/lib/gateway";
import { api } from "@/lib/api";
import type { EcosystemRecord } from "./LegacyOpportunityDetails";
import { sessionFetch } from "@/lib/session-request";
import {
  arrangeOpportunities,
  opportunityCatalog,
  type Opportunity,
} from "@/lib/opportunity-catalog";
import { LegacyOpportunityDetails } from "./LegacyOpportunityDetails";
import styles from "./opportunities.module.css";
export type { EcosystemRecord } from "./LegacyOpportunityDetails";

function Brand({ row }: { row: Opportunity }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={styles.brand}>
      {!failed && (
        <Image
          unoptimized
          src={row.logo_url}
          alt=""
          width={180}
          height={96}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
      <span className={failed ? styles.wordmark : styles.brandName}>
        {row.brand}
      </span>
    </div>
  );
}

export function OpportunityDirectory({ slug }: { slug?: string }) {
  const { locale } = useLocale();
  const { user, isLoading } = useAuth();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [rows, setRows] = useState(opportunityCatalog);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [notice, setNotice] = useState("");
  const [connecting, setConnecting] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const holdUntil = useRef(0);
  const item = opportunityCatalog.find((r) => r.slug === slug);
  useEffect(() => {
    let active = true;
    setRows(arrangeOpportunities(opportunityCatalog));
    async function loadPublished() {
      const loaded: Opportunity[] = [];
      let page = 1,
        last = 1;
      do {
        const response = await api.get<{
          data: EcosystemRecord[];
          last_page?: number;
        }>("/ecosystem", { params: { page } });
        last = response.last_page || 1;
        for (const record of response.data) {
          if (
            opportunityCatalog.some((row) => row.slug === record.slug) ||
            !safeWebUrl(record.website_url)
          )
            continue;
          loaded.push({
            slug: record.slug,
            group:
              record.category === "venture_capital"
                ? "vc"
                : [
                      "financing",
                      "development_finance",
                      "funding_guarantee",
                    ].includes(record.category)
                  ? "investment"
                  : "perks",
            brand: record.name_en,
            title_ar: record.name_ar.split(/\s+/).slice(0, 4).join(" "),
            title_en: record.name_en.split(/\s+/).slice(0, 4).join(" "),
            description_ar: record.description_ar,
            description_en: record.description_en,
            source_url: record.website_url,
            eligibility_ar:
              record.details?.eligibility_ar || "تخضع لشروط الجهة.",
            eligibility_en:
              record.details?.eligibility_en || "Provider eligibility applies.",
            logo_url: new URL("/favicon.ico", record.website_url).href,
            availability: record.application_status,
            reviewed_at: record.verified_at,
          });
        }
        page++;
      } while (active && page <= last && page <= 50);
      if (active)
        setRows(arrangeOpportunities([...opportunityCatalog, ...loaded]));
    }
    loadPublished().catch(() => {
      /* The bundled catalog remains available during API outages. */
    });
    return () => {
      active = false;
    };
  }, []);
  const visible = rows.filter(
    (r) =>
      (!group || r.group === group) &&
      `${r.brand} ${r.title_ar} ${r.title_en} ${r.description_ar} ${r.description_en}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  useEffect(() => {
    const element = rail.current;
    if (
      !element ||
      slug ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = 0,
      previous = 0;
    const tick = (now: number) => {
      if (
        previous &&
        now > holdUntil.current &&
        !dragging.current &&
        !document.hidden &&
        !element.contains(document.activeElement)
      ) {
        const end = element.scrollWidth - element.clientWidth;
        if (end > 0) {
          if (element.scrollLeft <= -end + 1) {
            element.scrollLeft = 0;
            holdUntil.current = now + 1800;
          } else element.scrollLeft -= Math.min(now - previous, 50) * 0.035;
        }
      }
      previous = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [slug, group, search]);
  const label = (value: string) =>
    value === "investment"
      ? t("فرص الاستثمار", "Investment")
      : value === "vc"
        ? t("تواصل مع المستثمرين", "VC connections")
        : t("المزايا والبرامج", "Perks & programs");
  async function connect(row: Opportunity) {
    if (!user) {
      window.location.assign(
        `/login?redirect=${encodeURIComponent("/opportunities/" + row.slug)}`,
      );
      return;
    }
    setConnecting(true);
    setNotice("");
    try {
      const response = await sessionFetch(
        `/api/v1/ecosystem/${encodeURIComponent(row.slug)}/connect`,
      );
      if (response.status === 401) {
        window.location.assign(
          `/login?redirect=${encodeURIComponent("/opportunities/" + row.slug)}`,
        );
        return;
      }
      if (response.status === 403 || response.status === 422) {
        setNotice(
          t(
            "أكمل التسجيل وتفعيل عضويتك وبياناتك أولاً، ثم عد لهذه الفرصة.",
            "Complete registration, activate your membership and finish your profile, then return to this opportunity.",
          ),
        );
        return;
      }
      if (!response.ok) throw new Error();
      const data = await response.json();
      const destination = new URL(data.url);
      if (destination.protocol !== "https:") throw new Error();
      window.location.assign(destination.href);
    } catch {
      setNotice(
        t("تعذر الاتصال. حاول مجدداً.", "Unable to connect. Please try again."),
      );
    } finally {
      setConnecting(false);
    }
  }
  if (slug && !item) return <LegacyOpportunityDetails slug={slug} />;
  return (
    <PublicLayout>
      <section className={styles.section} dir={ar ? "rtl" : "ltr"}>
        <div className={styles.heading}>
          <p className="gateway-eyebrow">
            {t("فرصتك القادمة", "YOUR NEXT OPPORTUNITY")}
          </p>
          <h1 className="gateway-heading">
            {item
              ? ar
                ? item.title_ar
                : item.title_en
              : t("علاقات تفتح لك الأبواب.", "Connections that open doors.")}
          </h1>
          <p className="gateway-lead">
            {t(
              "استثمار، علاقات، ومزايا تدفع شركتك للأمام.",
              "Capital, connections and benefits to move your business forward.",
            )}
          </p>
        </div>
        {item ? (
          <article className={styles.detail}>
            <Brand row={item} />
            <span className="gateway-badge">{label(item.group)}</span>
            <p>{ar ? item.description_ar : item.description_en}</p>
            <h2>{t("لمن تناسب؟", "Who is it for?")}</h2>
            <p>{ar ? item.eligibility_ar : item.eligibility_en}</p>
            <p className={styles.terms}>
              {t(
                "تحدد الجهة شروط القبول وتوافر التقديم والمزايا.",
                "The provider sets eligibility, intake availability and benefit terms.",
              )}
            </p>
            <button
              className="gateway-button"
              disabled={isLoading || connecting}
              onClick={() => connect(item)}
            >
              <LockKeyhole size={17} />
              {connecting
                ? t("جارٍ الاتصال…", "Connecting…")
                : t("تواصل واستفد", "Connect & apply")}
            </button>
            {notice && (
              <div role="alert" className="gateway-error mt-5">
                <p>{notice}</p>
                <Link href="/dashboard/profile" className="underline">
                  {t("إكمال الملف", "Complete profile")}
                </Link>{" "}
                ·{" "}
                <Link href="/apply" className="underline">
                  {t("طلب العضوية", "Apply for membership")}
                </Link>
              </div>
            )}
            {!user && (
              <p className={styles.terms}>
                <Link href="/apply">
                  {t(
                    "سجّل عضويتك وفعّل حسابك للاستفادة من الفرص.",
                    "Register and activate your membership to access opportunities.",
                  )}
                </Link>
              </p>
            )}
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.source}
            >
              {t("المصدر الرسمي", "Official source")} ↗
            </a>
            <Link href="/opportunities" className={styles.source}>
              {t("جميع الفرص", "All opportunities")}
            </Link>
          </article>
        ) : (
          <>
            <div className={styles.toolbar}>
              <div
                className={styles.tabs}
                role="group"
                aria-label={t("تصفية الفرص", "Filter opportunities")}
              >
                {["", "investment", "vc", "perks"].map((value) => (
                  <button
                    key={value}
                    aria-pressed={group === value}
                    onClick={() => {
                      setGroup(value);
                      rail.current?.scrollTo({ left: 0 });
                    }}
                  >
                    {value ? label(value) : t("الكل", "All")}
                  </button>
                ))}
              </div>
              <label className={styles.search}>
                <Search size={18} />
                <input
                  aria-label={t("ابحث عن فرصة", "Search opportunities")}
                  placeholder={t("ابحث عن فرصتك", "Find your opportunity")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.controls}>
              <span>
                {visible.length}{" "}
                {t("فرصة لاستكشافها", "opportunities to explore")}
              </span>
              <div>
                <button
                  aria-label={t("تحريك لليسار", "Scroll left")}
                  onClick={() => {
                    holdUntil.current = performance.now() + 7000;
                    rail.current?.scrollBy({ left: -340, behavior: "smooth" });
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  aria-label={t("تحريك لليمين", "Scroll right")}
                  onClick={() => {
                    holdUntil.current = performance.now() + 7000;
                    rail.current?.scrollBy({ left: 340, behavior: "smooth" });
                  }}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            <div
              ref={rail}
              className={styles.rail}
              dir="rtl"
              aria-label={t("الفرص", "Opportunities")}
              tabIndex={0}
              onPointerEnter={() => {
                dragging.current = true;
              }}
              onPointerLeave={() => {
                dragging.current = false;
              }}
              onTouchStart={() => {
                holdUntil.current = performance.now() + 10000;
              }}
              onWheel={() => {
                holdUntil.current = performance.now() + 7000;
              }}
            >
              {visible.map((row) => (
                <article
                  key={row.slug}
                  className={styles.card}
                  dir={ar ? "rtl" : "ltr"}
                >
                  <Brand row={row} />
                  <div className={styles.body}>
                    <span className={styles.category}>{label(row.group)}</span>
                    <h2>
                      <Link href={`/opportunities/${row.slug}`}>
                        {ar ? row.title_ar : row.title_en}
                      </Link>
                    </h2>
                    <p>{ar ? row.description_ar : row.description_en}</p>
                    <Link
                      className={styles.more}
                      href={`/opportunities/${row.slug}`}
                    >
                      {t("المزيد…", "More…")}
                      <span aria-hidden="true">{ar ? "←" : "→"}</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            {!visible.length && (
              <p role="status" className="py-10 text-center">
                {t(
                  "لا توجد فرص مطابقة. جرّب بحثاً آخر.",
                  "No matching opportunities. Try another search.",
                )}
              </p>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
