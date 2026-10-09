"use client"

import { useState } from "react"
import Link from "next/link"
import { usePublicCollection } from "@/lib/use-public-collection"
import { CollectionStatus } from "@/components/sections/CollectionStatus"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { ProgramCard } from "@/components/sections/ProgramCard"
import { Button } from "@/components/ui/button"
import { localizeProgram, programsPageCopy } from "@/data/localized-seed"
import { type ApiProgram, mapProgram } from "@/lib/content-api"
import { useLocale } from "@/lib/locale"

export default function ProgramsPage() {
  const { locale } = useLocale()
  const copy = programsPageCopy[locale]
  const collection = usePublicCollection<ApiProgram>("/programs")
  const programs = collection.items.map(item => localizeProgram(mapProgram(item), locale))
  const [activeCategory, setActiveCategory] = useState(0)




  const categories = [copy.categories[0], ...new Set(programs.map(program => program.category).filter(Boolean))]
  const visiblePrograms = programs.filter(program => activeCategory === 0 || program.category === categories[activeCategory])
  const openPrograms = visiblePrograms.filter((p) => p.isOpen)
  const closedPrograms = visiblePrograms.filter((p) => !p.isOpen)

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-50/60 px-4 pt-28 pb-20">
        {/* Ambient glows */}
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


        </div>
      </section>
      {collection.error && <CollectionStatus {...collection} hasMore={false} empty={false} />}

      {/* ── Category filter bar ── */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3.5"
        style={{ boxShadow: "0 2px 8px -2px rgba(15,22,40,0.04)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(index)}
                className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all"
                style={
                  activeCategory === index
                    ? {
                        background: "#3B52D4",
                        color: "#fff",
                        boxShadow: "0 4px 12px -2px rgba(59,82,212,0.3)",
                      }
                    : {
                        background: "#F8FAFC",
                        color: "#64748b",
                        border: "1px solid #E2E8F0",
                      }
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Open Programs ── */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#DCFCE7] border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {copy.openEyebrow}
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{copy.openTitle}</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">{copy.openBody}</p>
            </div>
            <span className="shrink-0 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {openPrograms.length}
            </span>
          </div>

          {openPrograms.length === 0 ? (
            <div className="flex items-center justify-center h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-400 font-medium">
                {locale === "ar" ? "لا توجد برامج مفتوحة حاليًا" : "No open programs at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {openPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Coming Soon Programs ── */}
      {closedPrograms.length > 0 && (
        <section className="py-16 px-4 bg-[#F5F7FF]">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
                  {copy.laterEyebrow}
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{copy.laterTitle}</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">{copy.laterBody}</p>
              </div>
              <span className="shrink-0 text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {closedPrograms.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {closedPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ── */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-4">
              {copy.workflowEyebrow}
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{copy.workflowTitle}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {copy.workflowSteps.map(({ step, desc }, i) => (
              <div
                key={step}
                className="relative p-6 bg-white border border-slate-200/80 rounded-2xl transition-all duration-300 hover:border-[#3B52D4]/30 hover:-translate-y-1"
                style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
              >
                {/* Step number */}
                <div className="w-10 h-10 rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] flex items-center justify-center font-black text-[#3B52D4] text-sm mb-4">
                  0{i + 1}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{step}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>

                {/* Connector line (between cards, not last) */}
                {i < copy.workflowSteps.length - 1 && (
                  <div className="hidden sm:block absolute top-10 -end-2 w-4 h-px bg-[#3B52D4]/20" />
                )}
              </div>
            ))}
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
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[#3B52D4]/6 blur-[80px]" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
                {locale === "ar" ? "العضوية" : "Membership"}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{copy.ctaTitle}</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-md mx-auto">{copy.ctaBody}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
                >
                  <Link href="/apply">{copy.cta}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold"
                >
                  <Link href="/contact">
                    {locale === "ar" ? "تواصل معنا" : "Contact us"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {!collection.error && <CollectionStatus {...collection} empty={programs.length === 0} />}
    </PublicLayout>
  )
}
