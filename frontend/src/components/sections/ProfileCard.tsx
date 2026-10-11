"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ExternalLink,
  Globe2,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  revenue?: { summary: string; period: string; source: string; financialStatement: boolean }
  ecosystemSources?: { label: string; relationship: string; url: string }[]
  assetCredit?: string
  sources?: string[]
  reviewedAt?: string
  reviewDue?: boolean
  signals?: { label: string; tone?: "neutral" | "accent" | "success" }[]
  actions?: ReactNode
}

function safeImage(src?: string) {
  return src?.startsWith("/") && !src.startsWith("//") ? src : publicWebsite(src)
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
  const [failed, setFailed] = useState(false)
  const image = safeImage(src)
  return (
    <span className={styles.portrait}>
      {image && !failed ? (
        <Image
          src={image}
          alt={name}
          width={64}
          height={64}
          className="h-full w-full object-cover"
          unoptimized={!image.startsWith("/")}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  )
}

function Signal({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <span className={styles.signal}>{icon}{children}</span>
}

export function ProfileCard({ data }: { data: ProfileCardData }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const website = publicWebsite(data.website)
  const websiteHost = hostLabel(data.website)
  const hasDetails = Boolean(
    data.revenue ||
      data.ecosystemSources?.length ||
      data.sources?.length ||
      data.assetCredit ||
      data.founderBrief ||
      data.companyBrief,
  )

  const socialLinks = (
    items: ProfileCardData["founderSocials"],
    owner: string,
  ) =>
    items
      ?.filter((item) => publicWebsite(item.url))
      .map((item) => (
        <a
          key={`${owner}-${item.url}`}
          href={publicWebsite(item.url) ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${owner} â€” ${item.label} (${ar ? "Ù†Ø§ÙØ°Ø© Ø¬Ø¯ÙŠØ¯Ø©" : "new tab"})`}
        >
          {item.label}<ExternalLink size={13} aria-hidden="true" />
        </a>
      ))

  return (
    <article className={styles.card}>
      <div className={styles.cardTopline} aria-hidden="true" />
      <header className={[styles.logoArea, data.logoTone === "dark" ? styles.darkLogo : ""].join(" ")}>
        <Avatar className={styles.logo}>
          <AvatarImage src={safeImage(data.logo)} alt={data.company} className="object-contain" loading="lazy" />
          <AvatarFallback className="rounded-none bg-transparent px-3 text-center text-sm font-extrabold text-[var(--text)]">
            {data.company}
          </AvatarFallback>
        </Avatar>
        <div className={styles.trustSignals}>
          {data.profileVerified && (
            <Signal icon={<BadgeCheck size={14} aria-hidden="true" />}>
              {ar ? "Ù…Ù„Ù Ù…ÙˆØ«Ù‘Ù‚" : "Verified profile"}
            </Signal>
          )}
          {data.websiteVerifiedAt && (
            <Signal icon={<Globe2 size={14} aria-hidden="true" />}>
              {ar ? "Ù…ÙˆÙ‚Ø¹ Ù…ÙØ±Ø§Ø¬Ø¹" : "Website reviewed"}
            </Signal>
          )}
          {data.reviewedAt && !data.reviewDue && (
            <Signal icon={<ShieldCheck size={14} aria-hidden="true" />}>
              {ar ? "Ù…Ù„Ù Ù…ÙØ±Ø§Ø¬Ø¹" : "Profile reviewed"}
            </Signal>
          )}
          {data.reviewDue && (
            <Signal icon={<CalendarClock size={14} aria-hidden="true" />}>
              {ar ? "Ø¨Ø­Ø§Ø¬Ø© Ø¥Ù„Ù‰ Ù…Ø±Ø§Ø¬Ø¹Ø©" : "Review due"}
            </Signal>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.companyHeading}>
          <div>
            <p className={styles.kicker}><Building2 size={14} aria-hidden="true" />{ar ? "Ø§Ù„Ø¶,v`ö*HˆˆÛÛ\[HŸOÜ‚ˆÈÛ\ÜÓ˜[YO^Üİ[\Ë]_OÙ]K˜ÛÛ\[_OÚÏ‚ˆÙ]‚ˆİÙXœÚ]H	‰ˆÙXœÚ]RÜİ	‰ˆ
ˆHÛ\ÜÓ˜[YO^Üİ[\ËÙXœÚ]P]ÛŸH™Y^İÙXœÚ]_H\™Ù]H—Ø›[šÈˆ™[H››ÛÜ[™\ˆ›Ü™Y™\œ™\ˆˆ\šXK[X™[^Ø	Ù]K˜ÛÛ\[_H8 %	Ø\ˆÈ¶)öa6avb6`¶.H6)öa6,v,öavbˆˆˆ›Ù™šXÚX[ÙXœÚ]HŸXO‚ˆÛØ™LˆÚ^™O^ÌMßH\šXKZY[HYHˆÏÜ[ˆÛ\ÜÓ˜[YOHœÜ‹[Û›HİÙXœÚ]RÜİOÜÜ[‚ˆØO‚ˆ
_BˆÙ]‚‚ˆÛ\ÜÓ˜[YO^Üİ[\Ë˜œšYYŸO‚ˆÙ]K˜ÛÛ\[PœšYYˆ
\ˆÈ¶a6aH6*¶cö-˜˜mŠ‹Š’Š}˜M‹bÇfb¤ƒb£bçb¼¸ˆ€è€‰½µÁ…¹ä¥¹ÑÉ½‘ÕÑ¥½¸¹½Ğå•ĞÁÉ½Ù¥‘•¸ˆ¥ô(€€€€€€€€ğ½Àø((€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”õíÍÑå±•Ì¹™…ÑÉ¥‘ôø(€€€€€€€€€í‘…Ñ„¹Í•Ñ½È€˜˜€ñ‘¥ØøñÍÁ…¸ùí…È€ü€‹bŸffbßbŸbäˆ€è€‰M•Ñ½È‰ôğ½ÍÁ…¸øñÍÑÉ½¹œùí‘…Ñ„¹Í•Ñ½Éôğ½ÍÑÉ½¹œøğ½‘¥Øùô(€€€€€€€€€í‘…Ñ„¹ÍÑ…”€˜˜€ñ‘¥ØøñÍÁ…¸ùí…È€ü€‹bŸffbÇb·fb¤ˆ€è€‰MÑ…”‰ôğ½ÍÁ…¸øñÍÑÉ½¹œùí‘…Ñ„¹ÍÑ…•ôğ½ÍÑÉ½¹œøğ½‘¥Øùô(€€€€€€€€€í‘…Ñ„¹±½…Ñ¥½¸€˜˜€ñ‘¥ØøñÍÁ…¸ùí…È€ü€‹bŸfff#fbäˆ€è€‰1½…Ñ¥½¸‰ôğ½ÍÁ…¸øñÍÑÉ½¹œøñ5…ÁA¥¸Í¥é”õìÄÍô…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ùí‘…Ñ„¹±½…Ñ¥½¹ôğ½ÍÑÉ½¹œøğ½‘¥Øùô(€€€€€€€€€í‘…Ñ„¹‰ÕÍ¥¹•ÍÍQåÁ”€˜˜€ñ‘¥ØøñÍÁ…¸ùí…È€ü€‹ff#bäƒbŸffbÓbŸbÜˆ€è€‰	ÕÍ¥¹•ÍÌÑåÁ”‰ôğ½ÍÁ…¸øñÍÑÉ½¹œùí‘…Ñ„¹‰ÕÍ¥¹•ÍÍQåÁ•ôğ½ÍÑÉ½¹œøğ½‘¥Øùô(€€€€€€€€ğ½‘¥Øø((€€€€€€€ì„…‘…Ñ„¹Í¥¹…±Ìü¹±•¹Ñ €˜˜€ (€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”õíÍÑå±•Ì¹Í¥¹…±I½İô…É¥„µ±…‰•°õí…È€ü€‹b—bØ±Ø§Ø±Ø§Øª Ø§Ù„ØØ¶,v`ö*HˆˆÛÛ\[HÚYÛ˜[ÈŸO‚ˆÙ]KœÚYÛ˜[Ë›X\

ÚYÛ˜[
HOˆ
ˆÜ[‚ˆÙ^O^ÜÚYÛ˜[›X™[BˆÛ\ÜÓ˜[YO^Ø	Üİ[\Ë˜\Ú[™\ÜÔÚYÛ˜[H	Üİ[\ÖØ\Ú[™\ÜÔÚYÛ˜[ÉÜÚYÛ˜[Û™HÏÈ›™]]˜[ŸX_XBˆ‚ˆÜÚYÛ˜[›X™[BˆÜÜ[‚ˆ
J_BˆÙ]‚ˆ
_B‚ˆÙ]K™›İ[™\ˆ	‰ˆ
ˆÙXİ[ÛˆÛ\ÜÓ˜[YO^Üİ[\Ëœ\œÛÛŸH\šXK[X™[^Ø\ˆÈ¶)öa6av)6,ö,Èˆˆ‘›İ[™\ˆŸO‚ˆÜ˜Z]Ù^O^Ù]KœÜ˜Z]ÏÈ]K™›İ[™\ŸHÜ˜Ï^Ù]KœÜ˜Z]H˜[YO^Ù]K™›İ[™\ŸHÏ‚ˆ]ˆÛ\ÜÓ˜[YO^Üİ[\Ëœ\œÛÛÛÜ_O‚ˆÛ\ÜÓ˜[YO^Üİ[\ËšÚXÚÙ\ŸO\Ù\”›İ[™Ú^™O^ÌMH\šXKZY[HYHˆÏØ\ˆÈ¶)öa6av)6,ö,Èˆˆ‘›İ[™\ˆŸOÜ‚ˆÙ]K™›İ[™\ŸOÚ‚ˆÙ]Kœ›ÛH	‰ˆÙ]Kœ›Û_OÜŸBˆÙ]‚ˆÜÙXİ[Û‚ˆ
_B‚ˆÙ]K™›Øİ\Ğ\™XH	‰ˆÛ\ÜÓ˜[YO^Üİ[\Ë™›Øİ\ßOÜ[Ø\ˆÈ¶av+6)öa6)öa6*¶,v`öb¶,ˆˆˆ‘›Øİ\ÈŸOÜÜ[Ù]K™›Øİ\Ğ\™X_OÜŸB‚ˆÊ]K˜ÛÛ\[TÛØÚX[ÏË›[™İ]K™›İ[™\”ÛØÚX[ÏË›[™İÙXœÚ]RÜİ
H	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YO^Üİ[\Ë›[šÜßO‚ˆİÙXœÚ]H	‰ˆÙXœÚ]RÜİ	‰ˆ
ˆH™Y^İÙXœÚ]_H\™Ù]H—Ø›[šÈˆ™[H››ÛÜ[™\ˆ›Ü™Y™\œ™\ˆÜ[ˆ\H›ˆİÙXœÚ]RÜİOÜÜ[\œ›İÕ\šYÚÚ^™O^ÌMH\šXKZY[HYHˆÏØO‚ˆ
_BˆÈHY]K˜ÛÛ\[TÛØÚX[ÏË›[™İ	‰ˆ]Ü[Ø\ˆÈ¶)öa6-6,v`ö*HˆˆÛÛ\[HŸOÜÜ[ÜÛØÚX[[šÜÊ]K˜ÛÛ\[TÛØÚX[Ë]K˜ÛÛ\[J_OÙ]ŸBˆÈHY]K™›İ[™\”ÛØÚX[ÏË›[™İ	‰ˆ]Ü[Ø\ˆÈ¶)öa6av)6,ö,Èˆˆ‘›İ[™\ˆŸOÜÜ[ÜÛØÚX[[šÜÊ]K™›İ[™\”ÛØÚX[Ë]K™›İ[™\ˆÏÈˆŠ_OÙ]ŸBˆÙ]‚ˆ
_B‚ˆÚ\Ñ]Z[È	‰ˆ
ˆ]Z[ÈÛ\ÜÓ˜[YO^Üİ[\Ë™]Z[ßO‚ˆİ[[X\OØ\ˆÈ¶)öa6av-v)ö+ö,H6b6)öa6*¶`v)ö-vb¶aˆˆ”Ûİ\˜Ù\È	ˆ]Z[ÈŸOÜİ[[X\O‚ˆ]ˆÛ\ÜÓ˜[YO^Üİ[\Ë™]Z[Ğ›Ù_O‚ˆÙ]K˜ÛÛ\[PœšYYˆ	‰ˆÙ]K˜ÛÛ\[PœšYYŸOÜŸBˆÙ]K™›İ[™\œšYYˆ	‰ˆÙ]K™›İ[™\œšYYŸOÜŸBˆÙ]Kœ™]™[YH	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YO^Üİ[\Ë™]šY[˜Ù_O‚ˆİ›Û™ÏØ\ˆÈ¶+öa6b¶a6)öa6)vb¶,v)ö+ö)ö*ˆ6)öa6ava¶-˜‹"¢%V&Æ—6†VB&WfVçVRWf–FVæ6R'ÓÂ÷7G&öæsà¢Çç¶FFç&WfVçVRç7VÖÖ'—ÓÂ÷à¢Çç¶"ò-Š}˜M˜Š­‹Š“¢"¢%W&–öC¢'×¶FFç&WfVçVRçW&–öGÓÂ÷à¢Æ‡&Vc×·V&Æ–5vV'6—FR†FFç&WfVçVRç6÷W&6R’óòVæFVf–æVGÒF&vWCÒ%ö&Ææ²"&VÃÒ&æö÷VæW"æ÷&VfW'&W"#à¢¶FFç&WfVçVRæf–ææ6–Å7FFVÖVçBò†"ò-Š}˜M˜-˜Š}Šm˜RŠ}˜M˜]Š}˜M˜­Š’"¢$f–ææ6–Â7FFVÖVçB"’¢†"ò-Š}˜M˜]‹f#bÄƒbŸfffbÙˆØ±" : "Published source")}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              )}
              {data.ecosystemSources?.filter((source) => publicWebsite(source.url)).map((source) => (
                <p key={source.url}><a href={publicWebsite(source.url) ?? undefined} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={13} aria-hidden="true" /></a> â€” {source.relationship}</p>
              ))}
              {data.sources?.filter((source) => publicWebsite(source)).map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">{ar ? "Ø§Ù„Ù…ØµØ¯Ø±" : "Source"} {index + 1}<ExternalLink size={13} aria-hidden="true" /></a>
              ))}
              {data.websiteVerifiedAt && <p>{ar ? "Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…ÙˆÙ‚Ø¹: " : "Website reviewed: "}<time dateTime={data.websiteVerifiedAt}>{data.websiteVerifiedAt}</time></p>}
              {data.reviewedAt && <p>{ar ? "Ø¢Ø®Ø± Ù…Ø±Ø§Ø¬Ø¹Ø©: " : "Last reviewed: "}<time dateTime={data.reviewedAt}>{data.reviewedAt}</time></p>}
              {data.assetCredit && <p>{data.assetCredit}</p>}
            </div>
          </details>
        )}

        <div className={styles.actions}>
          {data.founderHref && <Link className={styles.primaryAction} href={data.founderHref}>{ar ? "Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø¤Ø³Ø³" : "View founder"}<ArrowUpRight size={15} aria-hidden="true" /></Link>}
          {data.href && <Link className={styles.secondaryAction} href={data.href}>{ar ? "Ø¹Ø±Ø¶ Ø§Ù„Ø¶,v`ö*Hˆˆ•šY]ÈÛÛ\[HŸOÓ[šÏŸBˆÙ]K˜Xİ[ÛœßBˆÙ]‚ˆÙ]‚ˆØ\XÛO‚ˆ
BŸB