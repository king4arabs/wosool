"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Save, MapPin, Link2, User, Briefcase, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, X, Plus } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"
import { dashboardDictionary } from "@/lib/dashboard-i18n"

interface FounderProfile {
  id?: number
  tagline?: string | null
  bio?: string | null
  location?: string | null
  sector?: string | null
  stage?: string | null
  linkedin_url?: string | null
  twitter_url?: string | null
  website_url?: string | null
  needs?: string[] | null
  offers?: string[] | null
  is_public?: boolean
}

function decodeNestedJson(value: unknown, maxDepth = 5): unknown {
  let current = value
  let depth = 0

  while (typeof current === "string" && depth < maxDepth) {
    const trimmed = current.trim()
    if (!trimmed) return ""
    try {
      current = JSON.parse(trimmed)
      depth += 1
    } catch {
      return trimmed
    }
  }

  return current
}

function flattenToStrings(value: unknown): string[] {
  const decoded = decodeNestedJson(value)

  if (Array.isArray(decoded)) {
    return decoded.flatMap((item) => flattenToStrings(item))
  }

  if (typeof decoded === "string") {
    const trimmed = decoded.trim()
    return trimmed ? [trimmed] : []
  }

  return []
}

function toStringArray(value: unknown): string[] {
  const values = flattenToStrings(value)
  return [...new Set(values)]
}

function normalizeProfile(input: FounderProfile): FounderProfile {
  return {
    ...input,
    needs: toStringArray(input.needs),
    offers: toStringArray(input.offers),
  }
}

const SECTORS = ["FinTech", "HealthTech", "EdTech", "SaaS / B2B", "LogTech", "FoodTech", "HRTech", "HospTech", "LegalTech"]
const STAGES = ["pre-seed", "seed", "series-a", "scale-up", "exited"]

const ONBOARDING_STEPS = [
  { key: "profile",  labelAr: "الملف الشخصي",  labelEn: "Founder Profile",   icon: User },
  { key: "company",  labelAr: "بيانات الشركة",  labelEn: "Company Details",   icon: Briefcase },
  { key: "network",  labelAr: "الشبكة",         labelEn: "Network Matching",  icon: Sparkles },
]

const inputClass =
  "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors disabled:opacity-50 aria-invalid:border-red-400"

const selectClass =
  "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors"

const textareaClass =
  "flex w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors resize-none disabled:opacity-50 aria-invalid:border-red-400"

function SectionCard({
  icon: Icon,
  badge,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  badge: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 4px 24px -4px rgba(59,82,212,0.08)" }}
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF1FF] border border-[#E4E7F0] shrink-0">
            <Icon className="h-4 w-4 text-[#3B52D4]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2 py-0.5 rounded-full text-xs font-extrabold text-[#3B52D4] mb-1">
              {badge}
            </div>
            <h3 className="text-sm font-black text-slate-900 leading-none">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {/* Section body */}
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  )
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function Chip({
  label,
  color,
  onRemove,
}: {
  label: string
  color: "indigo" | "emerald"
  onRemove: () => void
}) {
  const styles =
    color === "indigo"
      ? "bg-[#EEF1FF] border-[#E4E7F0] text-[#3B52D4]"
      : "bg-[#F0FDF4] border-[#BBF7D0] text-emerald-700"
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${styles}`}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center w-3.5 h-3.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        aria-label={`Remove ${label}`}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  )
}

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { locale } = useLocale()
  const copy = dashboardDictionary[locale].profile
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get("onboarding") === "1"

  const [profile, setProfile] = useState<FounderProfile>({
    tagline: "",
    bio: "",
    location: "",
    sector: "",
    stage: "",
    linkedin_url: "",
    twitter_url: "",
    website_url: "",
    needs: [],
    offers: [],
  })
  const [needInput, setNeedInput] = useState("")
  const [offerInput, setOfferInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get<{ data: FounderProfile }>("/member/founder-profile")
        if (!cancelled && res?.data) {
          setProfile(normalizeProfile(res.data))
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // No profile yet — keep blank form
        } else if (!cancelled) {
          toast(copy.loadError, "error")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [copy.loadError, toast])

  const updateField = useCallback(
    <K extends keyof FounderProfile>(field: K, value: FounderProfile[K]) => {
      setProfile((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        if (!prev[field as string]) return prev
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    },
    []
  )

  const addNeed = useCallback(() => {
    const v = needInput.trim()
    if (!v) return
    setProfile((p) => ({ ...p, needs: [...(p.needs ?? []), v] }))
    setNeedInput("")
  }, [needInput])

  const removeNeed = useCallback((value: string) => {
    setProfile((p) => ({ ...p, needs: (p.needs ?? []).filter((n) => n !== value) }))
  }, [])

  const addOffer = useCallback(() => {
    const v = offerInput.trim()
    if (!v) return
    setProfile((p) => ({ ...p, offers: [...(p.offers ?? []), v] }))
    setOfferInput("")
  }, [offerInput])

  const removeOffer = useCallback((value: string) => {
    setProfile((p) => ({ ...p, offers: (p.offers ?? []).filter((o) => o !== value) }))
  }, [])

  const onSave = useCallback(async (): Promise<boolean> => {
    setIsSaving(true)
    setErrors({})
    try {
      const payload = {
        tagline: profile.tagline || null,
        bio: profile.bio || null,
        location: profile.location || null,
        sector: profile.sector || null,
        stage: profile.stage || null,
        linkedin_url: profile.linkedin_url || null,
        twitter_url: profile.twitter_url || null,
        website_url: profile.website_url || null,
        needs: profile.needs ?? [],
        offers: profile.offers ?? [],
      }
      const res = await api.put<{ message: string; data: FounderProfile }>(
        "/member/founder-profile",
        payload
      )
      setProfile(normalizeProfile(res.data))
      toast(res.message ?? copy.saveSuccess, "success")
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const data = err.data as { errors?: Record<string, string[]> } | null
        if (data?.errors) {
          const flat: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.errors)) {
            flat[k] = v[0] ?? copy.invalidValue
          }
          setErrors(flat)
        }
        toast(copy.saveValidation, "error")
      } else {
        toast(copy.saveError, "error")
      }
      return false
    } finally {
      setIsSaving(false)
    }
  }, [copy.invalidValue, copy.saveError, copy.saveSuccess, copy.saveValidation, profile, toast])

  const onNext = useCallback(async () => {
    const ok = await onSave()
    if (!ok) return
    router.push("/dashboard/company?onboarding=1")
  }, [onSave, router])

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-20 justify-center">
        <span className="w-2 h-2 rounded-full bg-[#3B52D4] animate-pulse" />
        <span className="text-slate-500 text-sm font-bold">{copy.loading}</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Onboarding header ── */}
      {isOnboarding && (
        <div
          className="relative rounded-2xl overflow-hidden border border-[#C7D0F8] bg-[#EEF1FF]"
          style={{ boxShadow: "0 4px 24px -4px rgba(59,82,212,0.15)" }}
        >
          {/* Dot grid */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(59,82,212,0.15) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 75%)",
            }}
            aria-hidden="true"
          />
          {/* Glow */}
          <div
            className="pointer-events-none absolute top-0 end-0 w-64 h-64 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(59,82,212,0.3), transparent 70%)" }}
            aria-hidden="true"
          />

          <div className="relative px-6 pt-6 pb-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/70 border border-[#C7D0F8] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#3B52D4] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
              {locale === "ar" ? "معالج الانضمام" : "Onboarding Wizard"}
            </div>

            {/* Heading */}
            <h2 className="text-xl font-black text-[#1a2a7c] mb-1 leading-tight">
              {locale === "ar"
                ? "أكمل ملفك الشخصي للانطلاق"
                : "Complete your profile to get started"}
            </h2>
            <p className="text-sm text-[#3B52D4]/80 font-medium mb-6 leading-relaxed">
              {locale === "ar"
                ? "أكمل الخطوات الثلاث لتفعيل وصولك الكامل إلى الشبكة والمطابقات والفعاليات."
                : "Complete all three steps to unlock full access to the network, matches, and events."}
            </p>

            {/* Step tracker */}
            <div className="flex items-center gap-2">
              {ONBOARDING_STEPS.map((step, i) => {
                const isActive = i === 0
                const isDone = false
                const StepIcon = step.icon
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    {i > 0 && (
                      <div
                        className="h-px flex-1 min-w-[24px]"
                        style={{ background: "rgba(59,82,212,0.2)" }}
                      />
                    )}
                    <div
                      className={[
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold border transition-all",
                        isActive
                          ? "bg-[#3B52D4] border-[#2E44C8] text-white shadow-md shadow-[#3B52D4]/25"
                          : isDone
                          ? "bg-white/80 border-[#C7D0F8] text-[#3B52D4]"
                          : "bg-white/50 border-[#C7D0F8] text-[#3B52D4]/50",
                      ].join(" ")}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {locale === "ar" ? step.labelAr : step.labelEn}
                      </span>
                      <span className="sm:hidden">{i + 1}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[#C7D0F8]/50">
            <div className="h-full bg-[#3B52D4] transition-all duration-500" style={{ width: "33%" }} />
          </div>
        </div>
      )}

      {/* ── Personal info ── */}
      <SectionCard
        icon={User}
        badge={locale === "ar" ? "الخطوة 1" : "Step 1"}
        title={copy.personalInfo}
      >
        <Field label={copy.tagline} error={errors.tagline}>
          <input
            id="p-tagline"
            type="text"
            placeholder={locale === "ar" ? "مثال: مؤسس شركة تقنية ناشئة في الرياض" : "e.g. Fintech founder scaling across MENA"}
            value={profile.tagline ?? ""}
            onChange={(e) => updateField("tagline", e.target.value)}
            aria-invalid={Boolean(errors.tagline)}
            className={inputClass}
          />
        </Field>

        <FieldGroup>
          <Field label={copy.location}>
            <div className="relative">
              <MapPin className="absolute top-1/2 -translate-y-1/2 start-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="p-location"
                type="text"
                placeholder={locale === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                value={profile.location ?? ""}
                onChange={(e) => updateField("location", e.target.value)}
                className={inputClass + " ps-9"}
              />
            </div>
          </Field>
          <Field label={copy.linkedin} error={errors.linkedin_url}>
            <div className="relative">
              <Link2 className="absolute top-1/2 -translate-y-1/2 start-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="p-linkedin"
                type="url"
                placeholder="linkedin.com/in/username"
                value={profile.linkedin_url ?? ""}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                aria-invalid={Boolean(errors.linkedin_url)}
                className={inputClass + " ps-9"}
              />
            </div>
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field label={copy.twitter} error={errors.twitter_url}>
            <input
              id="p-twitter"
              type="url"
              placeholder="x.com/username"
              value={profile.twitter_url ?? ""}
              onChange={(e) => updateField("twitter_url", e.target.value)}
              aria-invalid={Boolean(errors.twitter_url)}
              className={inputClass}
            />
          </Field>
          <Field label={copy.website} error={errors.website_url}>
            <input
              id="p-website"
              type="url"
              placeholder="https://yourwebsite.com"
              value={profile.website_url ?? ""}
              onChange={(e) => updateField("website_url", e.target.value)}
              aria-invalid={Boolean(errors.website_url)}
              className={inputClass}
            />
          </Field>
        </FieldGroup>
      </SectionCard>

      {/* ── Professional background ── */}
      <SectionCard
        icon={Briefcase}
        badge={locale === "ar" ? "الخلفية المهنية" : "Background"}
        title={copy.professionalBackground}
      >
        <Field label={copy.bio} error={errors.bio}>
          <textarea
            id="p-bio"
            rows={5}
            placeholder={
              locale === "ar"
                ? "أخبر الشبكة عن تجربتك وما الذي يميزك…"
                : "Tell the network about your journey and what makes you unique…"
            }
            value={profile.bio ?? ""}
            onChange={(e) => updateField("bio", e.target.value)}
            aria-invalid={Boolean(errors.bio)}
            className={textareaClass}
          />
        </Field>

        <FieldGroup>
          <Field label={copy.sector}>
            <select
              id="p-sector"
              value={profile.sector ?? ""}
              onChange={(e) => updateField("sector", e.target.value)}
              className={selectClass}
            >
              <option value="">{copy.selectSector}</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label={copy.stage}>
            <select
              id="p-stage"
              value={profile.stage ?? ""}
              onChange={(e) => updateField("stage", e.target.value)}
              className={selectClass}
            >
              <option value="">{copy.selectStage}</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </FieldGroup>
      </SectionCard>

      {/* ── Needs & Offers ── */}
      <SectionCard
        icon={Sparkles}
        badge={locale === "ar" ? "شبكة التوافق" : "Network Matching"}
        title={copy.needsOffers}
        subtitle={copy.needsOffersDesc}
      >
        {/* Needs */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-600">{copy.whatINeed}</label>
          {(profile.needs ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(profile.needs ?? []).map((need) => (
                <Chip key={need} label={need} color="indigo" onRemove={() => removeNeed(need)} />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={copy.addNeed}
              value={needInput}
              onChange={(e) => setNeedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addNeed() }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addNeed}
              className="flex items-center gap-1.5 px-3 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] hover:bg-[#EEF1FF] transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {copy.add}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Offers */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-600">{copy.whatIOffer}</label>
          {(profile.offers ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(profile.offers ?? []).map((offer) => (
                <Chip key={offer} label={offer} color="emerald" onRemove={() => removeOffer(offer)} />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={copy.addOffer}
              value={offerInput}
              onChange={(e) => setOfferInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addOffer() }
              }}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addOffer}
              className="flex items-center gap-1.5 px-3 h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-400/50 hover:text-emerald-700 hover:bg-[#F0FDF4] transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {copy.add}
            </button>
          </div>
        </div>
      </SectionCard>

      {/* ── Save bar ── */}
      <div
        className="bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
        style={{ boxShadow: "0 4px 24px -4px rgba(59,82,212,0.08)" }}
      >
        {isOnboarding ? (
          <p className="text-xs text-slate-500 font-medium">
            {locale === "ar"
              ? "الخطوة 1 من 3 — احفظ ثم انتقل إلى بيانات الشركة"
              : "Step 1 of 3 — save then continue to company details"}
          </p>
        ) : (
          <p className="text-xs text-slate-400 font-medium">
            {locale === "ar" ? "جميع التغييرات تظهر مباشرة في الشبكة" : "Changes are visible across the network"}
          </p>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-sm font-bold transition-all shadow-md shadow-[#3B52D4]/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving ? copy.saving : copy.saveProfile}
          </button>
          {isOnboarding && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1.5 px-4 h-10 rounded-xl border border-[#3B52D4]/30 text-[#3B52D4] text-xs font-bold hover:bg-[#EEF1FF] transition-colors"
            >
              {locale === "ar" ? "التالي" : "Next"}
              {locale === "ar" ? (
                <ArrowLeft className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
