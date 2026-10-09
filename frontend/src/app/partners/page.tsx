"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { PartnerCard } from "@/components/sections/PartnerCard"
import { Button } from "@/components/ui/button"
import { localizePartner, partnersPageCopy } from "@/data/localized-seed"
import { getCollectionItems, type ApiPartner, fetchJson, mapPartner, type WrappedResponse } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"
import type { PaginatedResponse, Partner } from "@/types"

const topicIcons: Record<number, string> = { 0: "⚖️", 1: "📊", 2: "🚀" }

export default function PartnersPage() {
  const { locale } = useLocale()
  const copy = partnersPageCopy[locale]
  const [partnerItems, setPartnerItems] = useState<Partner[]>([])


  useEffect(() => {
    async function loadPartners() {
      try {
        const response = await fetchJson<PaginatedResponse<ApiPartner> | WrappedResponse<ApiPartner[]>>("/api/v1/partners")
        const items = getCollectionItems(response).map((item) => localizePartner(mapPartner(item), locale))
        setPartnerItems(items)
      } catch {
        // No invented fallback records.
      }
    }
    void loadPartners()
  }, [locale])

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
            {copy.title.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
              {copy.title.split(" ").slice(2).join(" ")}
            </span>
          </h1>

          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {copy.description}
          </p>

          {/* Partner type chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {copy.types.map((type) => (
              <div
                key={type}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600"
                style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" />
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners grid ── */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
              {copy.sectionEyebrow}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{copy.sectionTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {partnerItems.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Sessions ── */}
      <section className="py-16 px-4 bg-[#F5F7FF]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-4">
              {copy.accessEyebrow}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-3">{copy.accessTitle}</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">{copy.accessBody}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            {copy.accessTopics.map((topic, i) => (
              <div
                key={topic}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center transition-all duration-300 hover:border-[#3B52D4]/30 hover:-translate-y-1"
                style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
              >
                <div className="text-2xl mb-3">{topicIcons[i] ?? "💡"}</div>
                <h3 className="text-sm font-black text-slate-900 mb-1">{topic}</h3>
                <p className="text-[11px] text-slate-400 font-medium">{copy.accessHint}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              asChild
              className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
            >
              <Link href="/login">{copy.accessCta}</Link>
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
                {locale === "ar" ? "انضم للشراكة" : "Partner with us"}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{copy.ctaTitle}</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">{copy.ctaBody}</p>
              <Button
                asChild
                className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
              >
                <Link href="/contact">{copy.cta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
