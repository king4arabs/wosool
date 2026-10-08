"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { FounderCard } from "@/components/sections/FounderCard"
import { Button } from "@/components/ui/button"
import { foundersPageCopy, localizeFounder } from "@/data/localized-seed"
import { getCollectionItems, type ApiFounder, fetchJson, mapFounder, type WrappedResponse } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import type { Founder, PaginatedResponse } from "@/types"

export default function FoundersPage() {
  const { locale, direction } = useLocale()
  const copy = foundersPageCopy[locale]
  const [founders, setFounders] = useState<Founder[]>([])
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState(copy.sectors[0])
  const [stage, setStage] = useState(copy.stages[0])
  const [location, setLocation] = useState(copy.locations[0])
  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset directory state when the locale changes
    setFounders([])
    setSector(copy.sectors[0])
    setStage(copy.stages[0])
    setLocation(copy.locations[0])
  }, [locale])

  useEffect(() => {
    async function fetchFounders() {
      try {
        const response = await fetchJson<PaginatedResponse<ApiFounder> | WrappedResponse<ApiFounder[]>>("/api/v1/founders")
        const items = getCollectionItems(response).map((item) => localizeFounder(mapFounder(item), locale))
        setFounders(items)
      } catch {
        // No invented fallback records.
      }
    }
    void fetchFounders()
  }, [locale])

  const featuredFounders = founders.filter((f) => f.isFeatured)

  const filtered = founders.filter((f) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q || f.name.toLowerCase().includes(q) || f.companyName.toLowerCase().includes(q) || f.tagline.toLowerCase().includes(q)
    const matchSector = sector === copy.sectors[0] || f.sector === sector
    const matchStage  = stage  === copy.stages[0]  || f.stage  === stage
    const matchLoc    = location === copy.locations[0] || f.location.includes(location)
    return matchSearch && matchSector && matchStage && matchLoc
  })

  const selectClass =
    "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors"

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-50/60 px-4 pt-28 pb-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-400/4 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,black_10%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
            {copy.badge}
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
              {copy.title.split(" ").slice(0, 2).join(" ")}
            </span>{" "}
            {copy.title.split(" ").slice(2).join(" ")}
          </h1>

          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {copy.description}
          </p>


        </div>
      </section>

      {/* ── Featured Founders ── */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" />
              {copy.featuredEyebrow}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{copy.featuredTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredFounders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Directory ── */}
      <section className="py-16 px-4 bg-[#F5F7FF]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-500 mb-3">
              {copy.directoryEyebrow}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{copy.directoryTitle}</h2>
          </div>

          {/* Search + filters */}
          <div
            className="mb-8 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4"
            style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
          >
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  aria-label={copy.searchAria}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 ps-9 pe-4 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors"
                />
              </div>

              {/* Filter selects */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <SlidersHorizontal className="h-3 w-3" />
                </div>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={selectClass}
                >
                  {copy.sectors.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className={selectClass}
                >
                  {copy.stages.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={selectClass}
                >
                  {copy.locations.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-medium">
              {copy.results.replace("{count}", String(filtered.length))}
            </p>
            {filtered.length !== founders.length && (
              <button
                onClick={() => { setSearch(""); setSector(copy.sectors[0]); setStage(copy.stages[0]); setLocation(copy.locations[0]) }}
                className="text-xs font-bold text-[#3B52D4] hover:underline"
              >
                {locale === "ar" ? "إعادة ضبط" : "Reset"}
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-sm text-slate-400 font-medium">
                {locale === "ar" ? "لا توجد نتائج مطابقة" : "No matching founders found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((founder) => (
                <FounderCard key={founder.id} founder={founder} />
              ))}
            </div>
          )}

          {/* Sign-in nudge */}
          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/90 border border-slate-200/80 rounded-2xl px-6 py-4"
            style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
          >
            <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
              {locale === "ar"
                ? "بعض الملفات الكاملة متاحة للأعضاء فقط. سجّل دخولك للوصول إلى التفاصيل والتواصل المباشر."
                : "Full profiles are available to members only. Sign in to access details and direct introductions."}
            </p>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold shrink-0 text-xs"
            >
              <Link href="/login" className="flex items-center gap-2">
                {copy.login}
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-slate-50/60">
        <div className="mx-auto max-w-2xl">
          <div
            className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-8 py-12 text-center relative overflow-hidden"
            style={{ boxShadow: "0 8px 40px -8px rgba(59,82,212,0.1)" }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[#3B52D4]/6 blur-[80px]" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {locale === "ar" ? "انضم للشبكة" : "Join the network"}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{copy.ctaTitle}</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">{copy.ctaBody}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
                >
                  <Link href="/apply">{copy.apply}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold"
                >
                  <Link href="/contact">{copy.contact}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
