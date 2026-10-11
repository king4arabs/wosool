"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowUpRight, Search, Sparkles, UsersRound } from "lucide-react"
import { api } from "@/lib/api"
import { type ApiFounder, mapFounder } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProfileCard } from "@/components/sections/ProfileCard"
import type { Founder } from "@/types"

type DirectoryFounder = Founder & { userId?: number }

export default function FounderDirectoryPage() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const [search, setSearch] = useState(query)
  const [filter, setFilter] = useState(query)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [items, setItems] = useState<DirectoryFounder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [target, setTarget] = useState<DirectoryFounder | null>(null)
  const [brief, setBrief] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    setSearch(query)
    setFilter(query)
    setPage(1)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    api
      .get<{ data: ApiFounder[]; meta?: { last_page?: number } }>("/founders", {
        params: { search: filter, page, per_page: 12 },
        headers: { "X-Locale": locale },
        signal: controller.signal,
      })
      .then((response) => {
        setItems(response.data.map((item) => ({ ...mapFounder(item), userId: item.user?.id })))
        setLastPage(response.meta?.last_page ?? 1)
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load founders")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, filter, locale, page])

  const resultsLabel = useMemo(
    () => ar ? `${items.length} Ù…Ø¤Ø³Ø³Ø§Ù‹ ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø©` : `${items.length} founders on this page`,
    [ar, items.length],
  )

  async function introduce(event: FormEvent) {
    event.preventDefault()
    if (!target || sending) return

    setSending(true)
    setSendError(null)
    try {
      await api.post("/member/introductions", {
        target_founder_id: Number(target.id),
        payload_context_brief: brief.trim(),
      })
      toast(
        ar
          ? "ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„ØªØ¹Ø§Ø±Ù. ÙŠÙ…ÙƒÙ†Ùƒ Ù…ØªØ§Ø¨Ø¹Ø© Ø­Ø§Ù„ØªÙ‡ Ù…Ù† ØµÙØ­Ø© Ø§Ù„ØªÙˆØ§ÙÙ‚ ÙˆØ§Ù„ØªØ¹Ø§Ø±Ù."
          : "Introduction requested. Track its status from Matches & Introductions.",
        "success",
      )
      setTarget(null)
      setBrief("")
    } catch (requestError) {
      setSendError(requestError instanceof Error ? requestError.message : "Unable to send introduction")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="relative overflow-hidden rounded-[var(--radius-hero)] border border-[var(--border-soft)] bg-[var(--brand-navy)] px-6 py-8 text-white shadow-[var(--shadow-raised)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(61,70,242,.55),transparent_34%),radial-gradient(circle_at_10%_100%,rgba(255,52,110,.18),transparent_30%)]" aria-hidden="true" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--brand-light-blue)]">
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              {ar ? "Ø´Ø¨ÙƒØ© ÙˆØµÙˆÙ„ Ø§Ù„Ù…ÙˆØ«ÙˆÙ‚Ø©" : "The trusted Wosool network"}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              {ar ? "Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ø¤Ø³Ø³ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©" : "Find the right founder for your next conversation"}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-white/75 sm:text-base">
              {ar
                ? "Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø­Ø³Ø¨ Ø§Ù„Ø®Ø¨Ø±Ø© ÙˆØ§Ù„Ù‚Ø·Ø§Ø¹ ÙˆØ§Ù„Ù…Ø±Ø­Ù„Ø©ØŒ Ø«Ù… Ø§Ø·Ù„Ø¨ ØªØ¹Ø§Ø±ÙØ§Ù‹ Ù…Ù†Ø¸Ù…Ø§Ù‹ ÙŠÙˆØ¶Ø­ Ø³Ø¨Ø¨ Ø§Ù„ØªÙˆØ§ØµÙ„ ÙˆÙŠØ­ØªØ±Ù… Ø®ØµÙˆØµÙŠØ© Ø§Ù„Ø·Ø±ÙÙŠÙ†."
                : "Explore approved profiles by experience, sector and stage, then request a structured introduction that explains the purpose and respects both foundersâ€™ privacy."}
            </p>
          </div>
          <Button asChild variant="outline" className="min-h-12 border-white/25 bg-white/10 font-bold text-white hover:bg-white hover:text-[var(--brand-navy)]">
            <Link href="/dashboard/matches">
              {ar ? "Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„ØªØ¹Ø§Ø±Ù ÙˆØ§Ù„ØªÙˆØ§ÙÙ‚" : "Track matches & introductions"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <form
          role="search"
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setFilter(search.trim())
          }}
        >
          <label className="relative flex-1">
            <span className="sr-only">{ar ? "Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ù…Ø¤Ø³Ø³" : "Search founders"}</span>
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
            <Input
              className="min-h-12 ps-11"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={ar ? "Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ø¶,v`ö*v#6)öa6`¶-ö)ö.H6(öb6)öa6+¶*6,v*Hˆˆ“˜[YKÛÛ\[KÙXİÜˆÜˆ^\\ÙHŸBˆÏ‚ˆÛX™[‚ˆ]Ûˆ\OHœİX›Z]ˆÛ\ÜÓ˜[YOH›Z[‹ZLLˆMÈ›ÛX›ÛØ\ˆÈ¶*6+v*Èˆˆ”ÙX\˜ÚŸOĞ]Û‚ˆÙš[\ˆ	‰ˆ
ˆ]Û‚ˆ\OH˜]Ûˆ‚ˆ˜\šX[H›İ][™H‚ˆÛ\ÜÓ˜[YOH›Z[‹ZLLˆ‚ˆÛÛXÚÏ^Ê
HOˆÂˆÙ]ÙX\˜Ú
ˆŠBˆÙ]š[\ŠˆŠBˆÙ]YÙJJBˆ_Bˆ‚ˆØ\ˆÈ¶av,ö+HˆˆÛX\ˆŸBˆĞ]Û‚ˆ
_BˆÙ›Ü›O‚ˆÛ\ÜÓ˜[YOH›]LÈ^^È›Û\Ù[ZX›Û^Vİ˜\ŠK]^[]]Y
WHˆ›ÛOHœİ]\ÈÜ™\İ[ÓX™[OÜ‚ˆÜÙXİ[Û‚‚ˆÛØY[™È	‰ˆ
ˆ]ˆÛ\ÜÓ˜[YOH™ÜšYØ\MHY™ÜšYXÛÛËLˆ™ÜšYXÛÛËLÈˆ\šXK[X™[^Ø\ˆÈ¶+6)ö,vcH6*v+vavb¶a6)öa6ava6`v)ö*ˆˆˆ“ØY[™È›Ùš[\ÈŸO‚ˆĞ\œ˜^K™œ›ÛJÈ[™İˆˆK
Ë[™^
HOˆ]ˆÙ^O^Ú[™^HÛ\ÜÓ˜[YOHšVÌÍ™[WH[š[X]K\[ÙH›İ[™YVİ˜\ŠK\˜Y]\ËXØ\™
WH™ËVİ˜\ŠK\İ\™˜XÙK\ÛÙ
WH[İ[Û‹\™YXÙN˜[š[X]K[›Û™HˆÏŠ_BˆÙ]‚ˆ
_B‚ˆÙ\œ›Üˆ	‰ˆ
ˆ]ˆ›ÛOH˜[\ˆÛ\ÜÓ˜[YOHœ›İ[™YVİ˜\ŠK\˜Y]\ËXØ\™
WH›Ü™\ˆ›Ü™\‹Vİ˜\ŠKY\œ›Ü‹X›Ü™\ŠWH™ËVİ˜\ŠKY\œ›Ü‹X™ÊWHMH^Vİ˜\ŠKY\œ›Ü‹]^
WH‚ˆÙ\œ›ÜŸOÜ‚ˆ]Ûˆ˜\šX[H›İ][™HˆÛ\ÜÓ˜[YOH›]MˆÛÛXÚÏ^Ê
HOˆÙ]][\

˜[YJHOˆ˜[YH
ÈJ_O‚ˆØ\ˆÈ¶)v.v)ö+ö*H6)öa6av+v)öb6a6*Hˆˆ•HYØZ[ˆŸBˆĞ]Û‚ˆÙ]‚ˆ
_B‚ˆÈ[ØY[™È	‰ˆY\œ›Üˆ	‰ˆ
ˆ‚ˆÈZ][\Ë›[™İÈ
ˆ]ˆÛ\ÜÓ˜[YOH™ÜšYZ[‹ZMMˆXÙKZ][\ËXÙ[\ˆ›İ[™YVİ˜\ŠK\˜Y]\ËXØ\™
WH›Ü™\ˆ›Ü™\‹Y\ÚY›Ü™\‹Vİ˜\ŠKX›Ü™\ŠWH™ËVİ˜\ŠK\İ\™˜XÙJWHN^XÙ[\ˆ‚ˆ]Ü\šÛ\ÈÛ\ÜÓ˜[YOH›^X]]ÈX‹MMÈËMÈ^Vİ˜\ŠKXXİ[Û‹X™ÊWHˆÏÛ\ÜÓ˜[YOH™›ÛX›ÛØ\ˆÈ¶a6)È6*¶b6+6+È6a¶*¶)ö)¶+6av-ö)ö*6`¶*H6+v)öa6b¶)öbËˆˆˆ“›ÈX]Ú[™È›İ[™\œÈšYÚ›İËˆŸOÜÙ]‚ˆÙ]‚ˆ
Hˆ
ˆ]ˆÛ\ÜÓ˜[YOH™ÜšY][\Ë\İ™]ÚØ\MHY™ÜšYXÛÛËLˆ™ÜšYXÛÛËLÈ‚ˆÚ][\Ë›X\

›İ[™\ŠHOˆ
ˆ›Ùš[PØ\™ˆÙ^O^Ù›İ[™\‹šYBˆ]O^ŞÂˆÛÛ\[Nˆ›İ[™\‹œš[X\PÛÛ\[OË›˜[YH›İ[™\‹˜ÛÛ\[S˜[YH›İ[™\‹›˜[YKˆÙÛÎˆ›İ[™\‹œš[X\PÛÛ\[OË›ÙÛÕ\›ˆÛÛ\[PœšYYˆ›İ[™\‹œš[X\PÛÛ\[OË™\ØÜš\[Û‹ˆÙXœÚ]Nˆ›İ[™\‹œš[X\PÛÛ\[OËÙXœÚ]Kˆ›İ[™\ˆ›İ[™\‹›˜[YKˆÜ˜Z]ˆ›İ[™\‹˜]˜]\•\›ˆ›ÛNˆ›İ[™\‹œÜÚ][Û‹ˆ›İ[™\œšYYˆ›İ[™\‹˜š[È›İ[™\‹YÛ[™KˆØØ][Ûˆ›İ[™\‹›ØØ][Û‹ˆÙXİÜˆ›İ[™\‹œÙXİÜ‹ˆİYÙNˆ›İ[™\‹œİYÙKˆ›İ[™\’™YˆÙ›İ[™\œËÉÙ›İ[™\‹œÛYßXˆ™Yˆ›İ[™\‹œš[X\PÛÛ\[OËœÛYÈÈÙ›İ[™\œËØÛÛ\[šY\ËÉÙ›İ[™\‹œš[X\PÛÛ\[KœÛYßXˆ[™Yš[™Yˆ›İ[™\”ÛØÚX[ÎˆÂˆÈX™[ˆ“[šÙY[ˆ‹\›ˆ›İ[™\‹›[šÙY[•\›ÏÈˆˆKˆÈX™[ˆ–‹\›ˆ›İ[™\‹Ú]\•\›ÏÈˆˆKˆK™š[\Š
ÛØÚX[
HOˆÛØÚX[\›
KˆXİ[ÛœÎˆ›İ[™\‹\Ù\’YOOH[X™\Š\Ù\ËšY
HÈ
ˆ]ÛˆÛ\ÜÓ˜[YOH›Z[‹ZLLH›^LH›ÛX›ÛˆÛÛXÚÏ^Ê
HOˆÈÙ]\™Ù]
›İ[™\ŠNÈÙ]œšYYŠˆŠNÈÙ]Ù[™\œ›ÜŠ[
H_O‚ˆØ\ˆÈ¶-öa6*6*¶.v)ö,v`Hˆˆ”™\]Y\İ[›ÙXİ[ÛˆŸBˆĞ]Û‚ˆ
Hˆ[™Yš[™Yˆ_BˆÏ‚ˆ
J_BˆÙ]‚ˆ
_B‚ˆ˜]ˆÛ\ÜÓ˜[YOH™›^›^]Ü˜\][\ËXÙ[\ˆ\İYKX™]ÙY[ˆØ\LÈ›İ[™YVİ˜\ŠK\˜Y]\ËXØ\™
WH›Ü™\ˆ›Ü™\‹Vİ˜\ŠKX›Ü™\‹\ÛÙ
WH™ËVİ˜\ŠK\İ\™˜XÙJWHMˆ\šXK[X™[^Ø\ˆÈ¶-v`v+v)ö*ˆ6+öa6b¶a6)öa6av)6,ö,öb¶aˆˆˆ‘›İ[™\ˆ\™XİÜHYÙ\ÈŸO‚ˆ]Ûˆ˜\šX[H›İ][™Hˆ\ØX›Y^ÜYÙHH_HÛÛXÚÏ^Ê
HOˆÙ]YÙJ
˜[YJHOˆ˜[YHHJ_OØ\ˆÈ¶)öa6,ö)ö*6`ˆˆˆ”™]š[İ\ÈŸOĞ]Û‚ˆÜ[ˆÛ\ÜÓ˜[YOH^\ÛH›ÛX›Û^Vİ˜\ŠK]^[]]Y
WHØ\ˆÈ6-v`v+v*H	ÜYÙ_H6avaˆ	Û\İYÙ_XˆYÙH	ÜYÙ_HÙˆ	Û\İYÙ_XOÜÜ[‚ˆ]Ûˆ˜\šX[H›İ][™Hˆ\ØX›Y^ÜYÙHH\İYÙ_HÛÛXÚÏ^Ê
HOˆÙ]YÙJ
˜[YJHOˆ˜[YH
ÈJ_OØ\ˆÈ¶)öa6*¶)öa6bˆˆˆ“™^ŸOĞ]Û‚ˆÛ˜]‚ˆÏ‚ˆ
_B‚ˆX[ÙÈÜ[^Ğ›ÛÛX[Š\™Ù]
_HÛ“Ü[Ú[™ÙO^Ê™^Ü[ŠHOˆÈYˆ
[™^Ü[ˆ	‰ˆ\Ù[™[™ÊHÙ]\™Ù]
[
H_O‚ˆX[ÙĞÛÛ[‚ˆX[ÙÒXY\‚ˆX[ÙÕ]OØ\ˆÈ6-öa6*6*¶.v)ö,v`H6av.H	İ\™Ù]Ë›˜[YHÏÈˆŸXˆ[›ÙXİ[ÛˆÈ	İ\™Ù]Ë›˜[YHÏÈˆŸXOÑX[ÙÕ]O‚ˆX[ÙÑ\ØÜš\[Û‚ˆØ\‚ˆÈ¶)ö-6,v+H6*6b6-¶b6+H6,ö*6*6)öa6*¶b6)ö-va6b6)öa6`¶b¶av*H6)öa6*¶bˆ6b¶av`öaˆ6(öaˆ6*¶`¶+öavaö)Ëˆ6b¶,v)ö+6.H6`v,vb¶`ˆ6b6-vb6a6)öa6-öa6*6`¶*6a6`v*¶+H6)öa6*¶b6)ö-va6)öa6av*6)ö-6,Kˆ‚ˆˆ‘^Z[ˆH™X\ÛÛˆ›ÜˆÛÛ›™Xİ[™È[™H˜[YH[İHØ[ˆÙ™™\‹ˆÛÜÛÛÛ™]šY]ÜÈH™\]Y\İ™Y›Ü™H\™XİÛÛXİ\ÈÜ[™YˆŸBˆÑX[ÙÑ\ØÜš\[Û‚ˆÑX[ÙÒXY\‚ˆ›Ü›HÛ”İX›Z]^Ú[›ÙXÙ_HÛ\ÜÓ˜[YOHœÜXÙK^KM‚ˆX™[Û\ÜÓ˜[YOH˜›ØÚÈ^\ÛH›ÛX›Ûˆ[›ÜHš[›ËXœšYYˆØ\ˆÈ¶aö+ö`H6)öa6*¶.v)ö,v`Hˆˆ’[›ÙXİ[Ûˆ\œÜÙHŸOÛX™[‚ˆ^\™XHYHš[›ËXœšYYˆˆ™\]Z\™YZ[“[™İ^ÌŒHX^[™İ^ÍH˜[YO^ØœšYYŸHÛÚ[™ÙO^Ê]™[
HOˆÙ]œšYYŠ]™[\™Ù]˜[YJ_HÏ‚ˆÛ\ÜÓ˜[YOH^^È^Vİ˜\ŠK]^[]]Y
WHØœšYY‹›[™İKÍÜ‚ˆÜÙ[™\œ›Üˆ	‰ˆ›ÛOH˜[\ˆÛ\ÜÓ˜[YOH^Vİ˜\ŠKY\œ›Ü‹]^
WHÜÙ[™\œ›ÜŸOÜŸBˆ]Ûˆ\OHœİX›Z]ˆØY[™Ï^ÜÙ[™[™ßH\ØX›Y^ØœšYY‹š[J
K›[™İŒHÛ\ÜÓ˜[YOHËY[›ÛX›Û‚ˆØ\ˆÈ¶)v,v,ö)öa6-öa6*6)öa6*¶.v)ö,v`Hˆˆ”Ù[™[›ÙXİ[Ûˆ™\]Y\İŸBˆĞ]Û‚ˆÙ›Ü›O‚ˆÑX[ÙĞÛÛ[‚ˆÑX[ÙÏ‚ˆÙ]‚ˆ
BŸB