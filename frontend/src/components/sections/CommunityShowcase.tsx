"use client"

import { useState } from "react"
import Link from "next/link"
import { Pause, Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLocale } from "@/lib/locale"
import { publicWebsite } from "@/lib/community-display"
import { CardBrowser } from "./CardBrowser"
import { FounderCard } from "./FounderCard"
import type { Founder, Partner } from "@/types"
import styles from "./community.module.css"

function Logo({ src, name }: { src: string; name: string }) {
  return <Avatar className={styles.logo}>
    <AvatarImage src={src} alt={name} className="object-contain" loading="lazy" />
    <AvatarFallback className="rounded-none bg-transparent text-sm text-slate-600">{name}</AvatarFallback>
  </Avatar>
}

export function FounderShowcase({ founders }: { founders: Founder[] }) {
  return <CardBrowser items={founders.map(founder => ({ id: founder.id, content: <FounderCard founder={founder} /> }))} />
}

export function CommunityPartners({ partners, loading, failed, retry }: { partners: Partner[]; loading: boolean; failed: boolean; retry: () => void }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [paused, setPaused] = useState(false)
  const approved = partners.filter(partner => partner.status === "Confirmed" && partner.logoUrl)
  const moving = approved.length > 4
  return <section className={styles.partners} aria-labelledby="community-partners-title">
    <div className={styles.partnerHead}><h2 id="community-partners-title">{ar ? "نفخر بشركائنا" : "Proud of Partners"}</h2><Link href="/contact?category=partnerships">{ar ? "انضم كشريك" : "Become a partner"}</Link>{moving && <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)} aria-label={paused ? (ar ? "تشغيل حركة الشعارات" : "Play logo movement") : (ar ? "إيقاف حركة الشعارات" : "Pause logo movement")}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}</div>
    {approved.length ? <div className={styles.logoWindow} tabIndex={0} aria-label={ar ? "شعارات الشركاء" : "Partner logos"}>
      <div className={`${styles.logoTrack} ${moving ? styles.moving : ""}`} data-paused={paused}>
        <div className={styles.logoGroup}>{approved.map(partner => {
          const url = publicWebsite(partner.website)
          return url ? <a key={partner.id} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} — ${ar ? "يفتح في نافذة جديدة" : "opens in a new tab"}`}><Logo src={partner.logoUrl} name={partner.name} /></a> : <div key={partner.id}><Logo src={partner.logoUrl} name={partner.name} /></div>
        })}</div>
      </div>
    </div> : <p className={styles.partnerEmpty} role="status">{loading ? (ar ? "جارٍ تحميل الشركاء…" : "Loading partners…") : failed ? (ar ? "تعذر تحميل الشركاء." : "Partners could not be loaded.") : (ar ? "تظهر هنا الشعارات المعتمدة بعد تأكيد الشراكات." : "Approved logos appear here once partnerships are confirmed.")}{failed && <button type="button" onClick={retry}>{ar ? "إعادة المحاولة" : "Try again"}</button>}</p>}
  </section>
}
