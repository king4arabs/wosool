"use client"

import type { ReactNode } from "react"
import { useId, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ExternalLink,
  Globe2,
  MapPin,
  UserRound,
} from "lucide-react"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { CountryFlag } from '@/components/ui/CountryFlag'
import { countryCode } from '@/lib/directory-geography'
import { brandLogoNeedsDarkSurface } from "@/lib/brand-logos"
import { publicWebsite } from "@/lib/community-display"
import { useLocale } from "@/lib/locale"
import { getInitials } from "@/lib/utils"
import styles from "./profile-cards.module.css"

export type ProfileCardData = {
  company: string
  logo?: string
  logoTone?: "dark"
  companyBrief?: string
  website?: string
  founder?: string
  portrait?: string
  role?: string
  founderBrief?: string
  location?: string
  countryCode?: string
  engagement?: number | null
  sector?: string
  stage?: string
  href?: string
  founderHref?: string
  founderSocials?: { label: string; url: string }[]
  companySocials?: { label: string; url: string }[]
  businessType?: string
  focusArea?: string
  websiteVerifiedAt?: string
  profileVerified?: boolean
  revenue?: {
    summary: string
    period: string
    source: string
    financialStatement: boolean
  }
  ecosystemSources?: { label: string; relationship: string; url: string }[]
  assetCredit?: string
  sources?: string[]
  reviewedAt?: string
  reviewDue?: boolean
  signals?: { label: string; tone?: "neutral" | "accent" | "success" }[]
  foundedYear?: number
  traction?: { text: string; sourceUrl?: string }
  actions?: ReactNode
}

function safeImage(src?: string) {
  return src?.startsWith("/") && !src.startsWith("//")
    ? src
    : publicWebsite(src)
}

function hostLabel(url?: string) {
  const safe = publicWebsite(url)
  if (!safe) return null
  try {
    return new URL(safe).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

function Portrait({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState<string | null>(null)
  const image = safeImage(src)

  return (
    <span className={styles.portrait}>
      {image && failed !== image ? (
        <Image
          src={image}
          alt={name}
          width={160}
          height={160}
          sizes="(max-width: 360px) 58px, (max-width: 660px) 66px, 76px"
          className={styles.portraitImage}
          unoptimized={!image.startsWith("/")}
          onError={() => setFailed(image)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}

function TrustSignal({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className={styles.signal}>{icon}{children}</span>
}

export function ProfileCard({ data, variant = "company", layout = "carousel" }: { data: ProfileCardData; variant?: "company" | "founder"; layout?: "grid" | "carousel" }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const id = useId()
  const founderFirst = variant === "founder" && Boolean(data.founder)
  const CompanyHeading = founderFirst ? 'h4' : 'h3'
  const PersonHeading = founderFirst ? 'h3' : 'h4'
  const website = publicWebsite(data.website)
  const websiteHost = hostLabel(data.website)
  const flag = countryCode(data.countryCode)
  const hasDetails = Boolean(
    data.revenue ||
      data.ecosystemSources?.length ||
      data.sources?.length ||
      data.assetCredit ||
      data.founderBrief ||
      data.companyBrief,
  )
  const hasEvidence = Boolean(data.revenue || data.ecosystemSources?.length || data.sources?.length || data.assetCredit)

  const person = data.founder && <div className={styles.personBlock}>
    <section className={styles.person} aria-label={ar ? "المؤسس" : "Founder"}>
      <Portrait src={data.portrait} name={data.founder} />
      <div className={styles.personCopy}>
        <p className={styles.kicker}><UserRound size={14} aria-hidden="true" />{ar ? "المؤسس" : "Founder"}</p>
        <PersonHeading id={founderFirst ? id : undefined}>{data.founderHref ? <Link href={data.founderHref}>{data.founder}</Link> : data.founder}</PersonHeading>
        {data.role && <p>{data.role}</p>}
      </div>
    </section>
    {data.founderBrief && <p className={styles.founderBrief}>{data.founderBrief}</p>}
  </div>

  function socialLinks(
    items: ProfileCardData["founderSocials"],
    owner: string,
  ) {
    return items
      ?.filter((item) => publicWebsite(item.url))
      .map((item) => (
        <a
          key={`${owner}-${item.url}`}
          href={publicWebsite(item.url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${owner} — ${item.label} (${ar ? "نافذة جديدة" : "new tab"})`}
        >
          {item.label}
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      ))
  }

  return (
    <article className={`${styles.card} ${founderFirst ? styles.founderCard : ''} ${layout === 'grid' ? styles.gridCard : ''}`} aria-labelledby={id}>
      <div className={styles.cardTopline} aria-hidden="true" />
      <header
        className={[
          styles.logoArea,
          data.logoTone === "dark" || brandLogoNeedsDarkSurface(data.logo, data.website) ? styles.darkLogo : "",
        ].join(" ")}
      >
        {flag && <span className={styles.countryFlag} data-country={flag}><CountryFlag code={flag} locale={locale} /></span>}
        <div className={styles.logo}><BrandLogo src={data.logo} name={data.company} website={data.website} /></div>

        <div className={styles.trustSignals}>
          {data.profileVerified && (
            <TrustSignal icon={<BadgeCheck size={14} aria-hidden="true" />}>
              {ar ? "ملف موثّق" : "Verified profile"}
            </TrustSignal>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {founderFirst && person}
        {data.company && <div className={styles.companyHeading}>
          <div>
            <p className={styles.kicker}>
              <Building2 size={14} aria-hidden="true" />
              {ar ? "الشركة" : "Company"}
            </p>
            <CompanyHeading className={styles.title} id={!founderFirst ? id : undefined}>{data.company}</CompanyHeading>
          </div>
          {website && websiteHost && (
            <a
              className={styles.websiteButton}
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${data.company} — ${ar ? "الموقع الرسمي" : "official website"}`}
            >
              <Globe2 size={17} aria-hidden="true" />
              <span className="sr-only">{websiteHost}</span>
            </a>
          )}
        </div>}

        {data.companyBrief && <p className={styles.brief}>{data.companyBrief}</p>}

        <div className={styles.factGrid}>
          {data.sector && (
            <div><span>{ar ? "القطاع" : "Sector"}</span><strong>{data.sector}</strong></div>
          )}
          {data.stage && (
            <div><span>{ar ? "المرحلة" : "Stage"}</span><strong>{data.stage}</strong></div>
          )}
          {data.location && (
            <div>
              <span>{ar ? "الموقع" : "Location"}</span>
              <strong><MapPin size={13} aria-hidden="true" />{data.location}</strong>
            </div>
          )}
          {data.businessType && (
            <div><span>{ar ? "نوع النشاط" : "Business type"}</span><strong>{data.businessType}</strong></div>
          )}
          {!!data.foundedYear && (
            <div><span>{ar ? "سنة التأسيس" : "Founded"}</span><strong>{data.foundedYear}</strong></div>
          )}
        </div>

        {data.traction && (
          <div className={styles.traction}>
            <p>{data.traction.text}</p>
            {publicWebsite(data.traction.sourceUrl) && (
              <a href={publicWebsite(data.traction.sourceUrl)} target="_blank" rel="noopener noreferrer">
                {ar ? "المصدر" : "Source"}: <span dir="ltr">{hostLabel(data.traction.sourceUrl)}</span>
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {(!!data.signals?.length || data.engagement !== undefined) && (
          <div role="group"
            className={styles.signalRow}
            aria-label={ar ? "إشارات الشركة" : "Company signals"}
          >
            {data.signals?.map((signal) => (
              <span
                key={signal.label}
                className={`${styles.businessSignal} ${styles[`businessSignal_${signal.tone ?? "neutral"}`]}`}
              >
                {signal.label}
              </span>
            ))}
            {data.engagement !== undefined && <span className={`${styles.businessSignal} ${styles.engagement}`} data-community-engagement>
              <span>{ar ? 'التفعيل والتفاعل' : 'Community engagement'}</span><strong dir="ltr">{data.engagement === null ? '—' : `${data.engagement}%`}</strong>
            </span>}
          </div>
        )}

        {!founderFirst && person}

        {data.focusArea && (
          <p className={styles.focus}>
            <span>{ar ? "مجال التركيز" : "Focus"}</span>
            {data.focusArea}
          </p>
        )}

        {(data.companySocials?.length ||
          data.founderSocials?.length ||
          websiteHost) && (
          <div className={styles.links}>
            {website && websiteHost && (
              <a href={website} target="_blank" rel="noopener noreferrer">
                <span dir="ltr">{websiteHost}</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            {!!data.companySocials?.length && (
              <div>
                <span>{ar ? "الشركة" : "Company"}</span>
                {socialLinks(data.companySocials, data.company)}
              </div>
            )}
            {!!data.founderSocials?.length && (
              <div>
                <span>{ar ? "المؤسس" : "Founder"}</span>
                {socialLinks(data.founderSocials, data.founder ?? "")}
              </div>
            )}
          </div>
        )}

        {hasDetails && (
          <details className={styles.details}>
            <summary>{hasEvidence ? ar ? "المصادر والتفاصيل" : "Sources & details" : ar ? "اقرأ المزيد" : "Read more"}</summary>
            <div className={styles.detailsBody}>
              {data.companyBrief && <p>{data.companyBrief}</p>}
              {data.founderBrief && <p>{data.founderBrief}</p>}
              {data.revenue && (
                <div className={styles.evidence}>
                  <strong>
                    {ar
                      ? "دليل الإيرادات المنشور"
                      : "Published revenue evidence"}
                  </strong>
                  <p>{data.revenue.summary}</p>
                  <p>{ar ? "الفترة: " : "Period: "}{data.revenue.period}</p>
                  <a
                    href={publicWebsite(data.revenue.source)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {data.revenue.financialStatement
                      ? ar ? "القوائم المالية" : "Financial statement"
                      : ar ? "المصدر المنشور" : "Published source"}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              )}
              {data.ecosystemSources
                ?.filter((source) => publicWebsite(source.url))
                .map((source) => (
                  <p key={source.url}>
                    <a
                      href={publicWebsite(source.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.label}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                    {" — "}{source.relationship}
                  </p>
                ))}
              {data.sources
                ?.filter((source) => publicWebsite(source))
                .map((url, index) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    {ar ? "المصدر" : "Source"} {index + 1}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                ))}
              {data.assetCredit && <p>{data.assetCredit}</p>}
            </div>
          </details>
        )}

        <div className={styles.actions}>
          {data.founderHref && (
            <Link className={styles.primaryAction} href={data.founderHref}>
              {ar ? "عرض المؤسس" : "View founder"}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          )}
          {data.href && (
            <Link className={styles.secondaryAction} href={data.href}>
              {ar ? "عرض الشركة" : "View company"}
            </Link>
          )}
          {data.actions}
        </div>
      </div>
    </article>
  )
}
