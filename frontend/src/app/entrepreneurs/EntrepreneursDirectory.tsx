"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, SlidersHorizontal, Users } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { EntrepreneurCard } from "@/components/sections/EntrepreneurCard"
import { EntrepreneurProfileDialog } from "@/components/sections/EntrepreneurProfileDialog"
import {
  filterEntrepreneurs,
  getEntrepreneurCountries,
  getEntrepreneurs,
  getFeaturedEntrepreneurs,
} from "@/data/entrepreneurs"
import type { Entrepreneur, EntrepreneurGender } from "@/types/entrepreneur"
import {
  ENTREPRENEUR_REGIONS,
  ENTREPRENEUR_SECTORS,
  STARTUP_STAGES,
} from "@/types/entrepreneur"
import { useLocale } from "@/lib/locale"

const ALL = "all"

const pageCopy = {
  ar: {
    badge: "دليل روّاد الأعمال",
    title: "روّاد أعمال من السعودية إلى العالم",
    description:
      "ملفات تعريفية خيالية لروّاد أعمال من السعودية والخليج والعالم العربي والأسواق العالمية، عبر عشرين قطاعًا ابتكاريًا. جميع الملفات والشخصيات خيالية بالكامل.",
    featuredEyebrow: "ملفات مميزة",
    featuredTitle: "روّاد مختارون هذا الشهر",
    directoryEyebrow: "الدليل الكامل",
    directoryTitle: "استكشف جميع روّاد الأعمال",
    searchPlaceholder: "ابحث بالاسم أو الدولة أو المدينة أو الشركة أو القطاع أو الوسوم...",
    searchAria: "البحث في دليل روّاد الأعمال",
    filterCountry: "كل الدول",
    filterRegion: "كل المناطق",
    filterSector: "كل القطاعات",
    filterGender: "الكل",
    filterGenderMale: "رجال",
    filterGenderFemale: "نساء",
    filterStage: "كل المراحل",
    results: "{count} رائد أعمال",
    reset: "إعادة ضبط",
    emptyTitle: "لا توجد نتائج مطابقة",
    emptyBody: "جرّب تعديل البحث أو إزالة بعض عوامل التصفية.",
    statProfiles: "ملفًا رياديًا",
    statCountries: "دولة",
    statSectors: "قطاعًا",
  },
  en: {
    badge: "Entrepreneurs Directory",
    title: "Entrepreneurs from Saudi Arabia to the World",
    description:
      "Fictional entrepreneur profiles spanning Saudi Arabia, the GCC, Arab markets, and global innovation ecosystems across twenty sectors. All profiles and people are entirely fictional.",
    featuredEyebrow: "Featured profiles",
    featuredTitle: "Featured entrepreneurs this month",
    directoryEyebrow: "Full directory",
    directoryTitle: "Explore all entrepreneurs",
    searchPlaceholder: "Search by name, country, city, startup, sector, or tags...",
    searchAria: "Search the entrepreneurs directory",
    filterCountry: "All countries",
    filterRegion: "All regions",
    filterSector: "All sectors",
    filterGender: "All genders",
    filterGenderMale: "Male",
    filterGenderFemale: "Female",
    filterStage: "All stages",
    results: "{count} entrepreneurs",
    reset: "Reset",
    emptyTitle: "No matching entrepreneurs found",
    emptyBody: "Try adjusting your search or removing some filters.",
    statProfiles: "founder profiles",
    statCountries: "countries",
    statSectors: "sectors",
  },
}

const selectClass =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors focus:border-[#3B52D4] focus:outline-none focus:ring-1 focus:ring-[#3B52D4]"

export function EntrepreneursDirectory() {
  const { locale } = useLocale()
  const copy = pageCopy[locale] ?? pageCopy.en

  const allEntrepreneurs = useMemo(() => getEntrepreneurs(), [])
  const featured = useMemo(() => getFeaturedEntrepreneurs(), [])
  const countries = useMemo(() => getEntrepreneurCountries(), [])

  const [search, setSearch] = useState("")
  const [country, setCountry] = useState(ALL)
  const [region, setRegion] = useState(ALL)
  const [sector, setSector] = useState(ALL)
  const [gender, setGender] = useState(ALL)
  const [stage, setStage] = useState(ALL)
  const [selected, setSelected] = useState<Entrepreneur | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!dialogOpen) {
      // Keep content mounted during the close animation, then clear.
      const timeout = setTimeout(() => setSelected(null), 200)
      return () => clearTimeout(timeout)
    }
  }, [dialogOpen])

  const filtered = useMemo(
    () =>
      filterEntrepreneurs({
        search,
        country: country === ALL ? undefined : country,
        region: region === ALL ? undefined : region,
        sector: sector === ALL ? undefined : sector,
        gender: gender === ALL ? undefined : (gender as EntrepreneurGender),
        startupStage: stage === ALL ? undefined : stage,
      }),
    [search, country, region, sector, gender, stage]
  )

  const hasActiveFilters =
    search !== "" || country !== ALL || region !== ALL || sector !== ALL || gender !== ALL || stage !== ALL

  const resetFilters = () => {
    setSearch("")
    setCountry(ALL)
    setRegion(ALL)
    setSector(ALL)
    setGender(ALL)
    setStage(ALL)
  }

  const openProfile = (entrepreneur: Entrepreneur) => {
    setSelected(entrepreneur)
    setDialogOpen(true)
  }

  const stats = [
    `${allEntrepreneurs.length}+ ${copy.statProfiles}`,
    `${countries.length} ${copy.statCountries}`,
    `${ENTREPRENEUR_SECTORS.length} ${copy.statSectors}`,
  ]

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-50/60 px-4 pb-20 pt-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-400/4 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,black_10%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-3 py-1 text-xs font-bold text-[#3B52D4]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3B52D4]" />
            {copy.badge}
          </div>

          <h1 className="mb-5 text-4xl font-black leading-[1.15] tracking-tight text-slate-900 lg:text-5xl">
            <span className="bg-gradient-to-r from-[#3B52D4] to-indigo-500 bg-clip-text text-transparent">
              {copy.title.split(" ").slice(0, 2).join(" ")}
            </span>{" "}
            {copy.title.split(" ").slice(2).join(" ")}
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 lg:text-lg">
            {copy.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {stats.map((chip) => (
              <div
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-600"
                style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#3B52D4]" />
                {chip}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured entrepreneurs ── */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E4E7F0] bg-[#EEF1FF] px-3 py-1 text-xs font-bold text-[#3B52D4]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B52D4]" />
              {copy.featuredEyebrow}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">
              {copy.featuredTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((entrepreneur) => (
              <EntrepreneurCard
                key={entrepreneur.id}
                entrepreneur={entrepreneur}
                onViewProfile={openProfile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Full directory ── */}
      <section className="bg-[#F5F7FF] px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">
              {copy.directoryEyebrow}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">
              {copy.directoryTitle}
            </h2>
          </div>

          {/* Search + filters */}
          <div
            className="mb-8 rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-sm"
            style={{ boxShadow: "0 2px 12px -2px rgba(15,22,40,0.06)" }}
          >
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  aria-label={copy.searchAria}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pe-4 ps-9 text-xs font-medium text-slate-700 transition-colors placeholder:text-slate-400 focus:border-[#3B52D4] focus:outline-none focus:ring-1 focus:ring-[#3B52D4]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-400" aria-hidden="true">
                  <SlidersHorizontal className="h-3 w-3" />
                </span>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={selectClass}
                  aria-label={copy.filterCountry}
                >
                  <option value={ALL}>{copy.filterCountry}</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={selectClass}
                  aria-label={copy.filterRegion}
                >
                  <option value={ALL}>{copy.filterRegion}</option>
                  {ENTREPRENEUR_REGIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={selectClass}
                  aria-label={copy.filterSector}
                >
                  <option value={ALL}>{copy.filterSector}</option>
                  {ENTREPRENEUR_SECTORS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={selectClass}
                  aria-label={copy.filterGender}
                >
                  <option value={ALL}>{copy.filterGender}</option>
                  <option value="male">{copy.filterGenderMale}</option>
                  <option value="female">{copy.filterGenderFemale}</option>
                </select>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className={selectClass}
                  aria-label={copy.filterStage}
                >
                  <option value={ALL}>{copy.filterStage}</option>
                  {STARTUP_STAGES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500" aria-live="polite">
              {copy.results.replace("{count}", String(filtered.length))}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[#3B52D4] hover:underline"
              >
                {copy.reset}
              </button>
            )}
          </div>

          {/* Grid / empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Users className="h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-500">{copy.emptyTitle}</p>
              <p className="text-xs text-slate-400">{copy.emptyBody}</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs font-bold text-[#3B52D4] hover:underline"
              >
                {copy.reset}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((entrepreneur) => (
                <EntrepreneurCard
                  key={entrepreneur.id}
                  entrepreneur={entrepreneur}
                  onViewProfile={openProfile}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <EntrepreneurProfileDialog
        entrepreneur={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </PublicLayout>
  )
}
