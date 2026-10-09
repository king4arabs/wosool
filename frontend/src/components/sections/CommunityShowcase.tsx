"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, Pause, Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLocale } from "@/lib/locale"
import { founderRows, publicWebsite } from "@/lib/community-display"
import { getInitials } from "@/lib/utils"
import type { Founder, Partner } from "@/types"
import styles from "./community.module.css"

function Logo({ src, name }: { src: string; name: string }) {
  return <Avatar className={styles.logo}>
    <AvatarImage src={src} alt={name} className="object-contain" loading="lazy" />
    <AvatarFallback className="rounded-none bg-transparent text-sm text-slate-600">{name}</AvatarFallback>
  </Avatar>
}

function FounderRow({ founders, row }: { founders: Founder[]; row: number }) {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const id = useId()
  const rail = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  useEffect(() => {
    const element = rail.current
    if (!element) return
    const update = () => {
      const distance = Math.abs(element.scrollLeft)
      setEdges({ start: distance < 2, end: distance >= element.scrollWidth - element.clientWidth - 2 })
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    element.addEventListener("scroll", update, { passive: true })
    update()
    return () => { observer.disconnect(); element.removeEventListener("scroll", update) }
  }, [founders.length])
  function move(forward: boolean) {
    const element = rail.current
    if (!element) return
    const card = element.firstElementChild as HTMLElement | null
    element.scrollBy({ left: (forward ? -1 : 1) * ((card?.offsetWidth ?? 320) + 20), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
  }
  return <div className={styles.row}>
    <div className={styles.rowControls}>
      <span>{ar ? `صف المؤسسين ${row}` : `Founder row ${row}`}</span>
      <div dir="ltr" className={styles.controls}>
        <button type="button" aria-controls={id} aria-label={ar ? "المؤسسون التاليون — إلى اليسار" : "Next founders — move left"} disabled={edges.end} onClick={() => move(true)}><ArrowLeft size={19} /></button>
        <button type="button" aria-controls={id} aria-label={ar ? "المؤسسون السابقون — إلى اليمين" : "Previous founders — move right"} disabled={edges.start} onClick={() => move(false)}><ArrowRight size={19} /></button>
      </div>
    </div>
    <ul id={id} ref={rail} dir="rtl" tabIndex={0} aria-label={ar ? `المؤسسون، الصف ${row}؛ اسحب أو استخدم الأسهم` : `Founders, row ${row}; swipe or use arrow controls`} className={styles.rail}>
      {founders.map(founder => {
        const company = founder.primaryCompany
        const website = publicWebsite(company?.website)
        return <li key={founder.id} dir={direction} className={styles.founderCard}>
          <div className={styles.person}>
            <Avatar className="h-16 w-16 ring-4 ring-slate-50"><AvatarImage src={founder.avatarUrl} alt={founder.name} loading="lazy" /><AvatarFallback className="bg-indigo-50 text-indigo-700">{getInitials(founder.name)}</AvatarFallback></Avatar>
            <div><h3>{founder.name}</h3><p>{founder.location}</p>{founder.isVerified && <span className={styles.verified}>{ar ? "ملف موثّق" : "Verified profile"}</span>}</div>
          </div>
          <p className={styles.brief}>{founder.tagline || founder.bio || (ar ? "تعرّف على خبراته في ملفه الشخصي." : "Explore this founder’s experience in their profile.")}</p>
          <div className={styles.company}>
            {company ? <><div className={styles.companyHeading}><Logo src={company.logoUrl} name={company.name} /><span>{company.name}</span></div><p className={styles.brief}>{company.description || (ar ? "لم تُضف نبذة عن الشركة بعد." : "A company description has not been added yet.")}</p></> : <p>{ar ? "لم تُضف شركة عامة لهذا الملف بعد." : "No public company has been added to this profile yet."}</p>}
            <div className={styles.tags}>{[...new Set([company?.sector || founder.sector, company?.stage || founder.stage].filter(Boolean))].map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
          <details className={styles.profileDetails}><summary>{ar ? "المزيد عن المؤسس والشركة" : "More about the founder & company"}</summary><p>{founder.bio || founder.tagline}</p>{company?.description && <p>{company.description}</p>}<Link href="/login">{ar ? "سجّل الدخول للتواصل مع المجتمع" : "Sign in to connect with the community"}</Link></details>
          {website && <div className={styles.cardLinks}><a href={website} target="_blank" rel="noopener noreferrer" aria-label={`${company?.name} — ${ar ? "الموقع، يفتح في نافذة جديدة" : "website, opens in a new tab"}`}><span dir="ltr">{new URL(website).hostname.replace(/^www\./, "")}</span><ExternalLink size={14} /></a></div>}
        </li>
      })}
    </ul>
  </div>
}

export function FounderShowcase({ founders }: { founders: Founder[] }) {
  return <div>{founderRows(founders).map((row, index) => <FounderRow key={index} founders={row} row={index + 1} />)}</div>
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
