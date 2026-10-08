"use client"

import { useState, useCallback, useEffect } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import { CheckCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, PartyPopper } from "lucide-react"
import Link from "next/link"

const criteria = [
  "أن تكون مؤسسًا أو شريكًا مؤسسًا نشطًا في شركة قائمة أو قيد التأسيس.",
  "أن تكون الشركة مسجلة أو في طريقها إلى التسجيل النظامي.",
  "أن يكون نشاطك موجهًا إلى السعودية أو الخليج، أو مبنيًا داخلهما.",
  "أن تملك وضوحًا تشغيليًا مع مسار تمويلي أو تشغيلي جاد للمرحلة المقبلة.",
  "أن تدخل المجتمع بروح المشاركة والإضافة، لا بهدف الاستفادة الأحادية فقط.",
]

const faqs = [
  {
    q: "كم يستغرق تقديم الطلب؟",
    a: "يستغرق النموذج عادة بين 10 و15 دقيقة. نراجع الطلبات بشكل مستمر، ويصل الرد غالبًا خلال خمسة إلى سبعة أيام عمل.",
  },
  {
    q: "هل توجد رسوم عضوية؟",
    a: "الوصول إلى المجتمع يتم حاليًا عبر الدعوة أو التقديم. تُشارك تفاصيل الرسوم والخيارات المتاحة بعد مراجعة الطلب بحسب المرحلة وملاءمة العضوية.",
  },
  {
    q: "هل يمكنني التقديم إذا كنت ما زلت قبل إطلاق المنتج؟",
    a: "نعم، ما دمت تملك تصورًا واضحًا، وتعمل بجدية على البناء، ولديك اهتمام فعلي بالسوق السعودي أو الخليجي.",
  },
  {
    q: "ماذا يحدث بعد إرسال الطلب؟",
    a: "ستتلقى رسالة تأكيد أولية، ثم يراجع الفريق طلبك وقد يتواصل معك لترتيب مكالمة تعريفية قصيرة قبل إتمام القبول.",
  },
]

const steps = [
  { id: 1, label: "البيانات الشخصية" },
  { id: 2, label: "بيانات الشركة" },
  { id: 3, label: "الأهداف والدوافع" },
]

const sectors = [
  "التقنية المالية",
  "التقنية الصحية",
  "برمجيات الأعمال",
  "التجارة الإلكترونية",
  "اللوجستيات",
  "تقنية الغذاء",
  "تقنية الموارد البشرية",
  "تقنية التعليم",
  "تقنية العقار",
  "التقنيات النظيفة",
  "أخرى",
]

const stages = [
  { label: "ما قبل البذرة", value: "Pre-seed" },
  { label: "البذرة", value: "Seed" },
  { label: "السلسلة A", value: "Series A" },
  { label: "السلسلة B+", value: "Series B+" },
  { label: "التوسّع", value: "Scale-up" },
  { label: "مؤسس متخارج", value: "Exited" },
]

const stageValueByLabel: Record<string, string> = {
  "ما قبل البذرة": "Pre-seed",
  "البذرة": "Seed",
  "السلسلة A": "Series A",
  "السلسلة B+": "Series B+",
  "التوسّع": "Scale-up",
  "مؤسس متخارج": "Exited",
}

const APPLY_FORM_SESSION_KEY = "wosool_apply_form_v1"
const APPLY_FORM_STARTED_AT_KEY = "wosool_apply_started_at"

interface FormData {
  full_name: string
  email: string
  phone: string
  location: string
  linkedin_url: string
  company_name: string
  sector: string
  stage: string
  company_website: string
  motivation: string
  what_you_offer: string
  what_you_need: string
  referral_source: string
  referrer_name: string
  bot_field: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const initialFormData: FormData = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin_url: "",
  company_name: "",
  sector: "التقنية المالية",
  stage: "Pre-seed",
  company_website: "",
  motivation: "",
  what_you_offer: "",
  what_you_need: "",
  referral_source: "",
  referrer_name: "",
  bot_field: "",
}

function validateStep(step: number, data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (step === 1) {
    if (!data.full_name.trim()) errors.full_name = "يرجى إدخال الاسم الكامل."
    if (!data.email.trim()) errors.email = "يرجى إدخال البريد الإلكتروني."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "يرجى إدخال بريد إلكتروني صحيح."
    if (!data.phone.trim()) errors.phone = "يرجى إدخال رقم الهاتف."
    if (!data.location.trim()) errors.location = "يرجى إدخال الموقع."
    if (data.linkedin_url && !/^https?:\/\/.+/.test(data.linkedin_url))
      errors.linkedin_url = "يرجى إدخال رابط صحيح."
  }

  if (step === 2) {
    if (!data.company_name.trim()) errors.company_name = "يرجى إدخال اسم الشركة."
    if (!data.sector.trim()) errors.sector = "يرجى اختيار القطاع."
    if (!data.stage.trim()) errors.stage = "يرجى اختيار المرحلة."
    if (data.company_website && !/^https?:\/\/.+/.test(data.company_website))
      errors.company_website = "يرجى إدخال رابط صحيح."
  }

  if (step === 3) {
    if (!data.motivation.trim()) errors.motivation = "أخبرنا لماذا ترغب في الانضمام إلى وصول."
    if (data.motivation.length > 2000) errors.motivation = "يجب ألا تتجاوز هذه الإجابة 2000 حرف."
  }

  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-500 mt-1 font-medium">{message}</p>
}

const inputClass =
  "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors"

const selectClass =
  "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors"

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const normalizeStage = useCallback((stage: string): string => {
    if (stages.some((entry) => entry.value === stage)) return stage
    return stageValueByLabel[stage] || "Pre-seed"
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem(APPLY_FORM_SESSION_KEY)
    if (!saved) {
      if (!sessionStorage.getItem(APPLY_FORM_STARTED_AT_KEY)) {
        sessionStorage.setItem(APPLY_FORM_STARTED_AT_KEY, String(Date.now()))
      }
      return
    }

    try {
      const parsed = JSON.parse(saved) as Partial<FormData>
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        stage: normalizeStage(String(parsed.stage || prev.stage)),
      }))
    } catch {
      sessionStorage.removeItem(APPLY_FORM_SESSION_KEY)
    }

    if (!sessionStorage.getItem(APPLY_FORM_STARTED_AT_KEY)) {
      sessionStorage.setItem(APPLY_FORM_STARTED_AT_KEY, String(Date.now()))
    }
  }, [normalizeStage])

  useEffect(() => {
    sessionStorage.setItem(APPLY_FORM_SESSION_KEY, JSON.stringify(formData))
  }, [formData])

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const handleStepContinue = (nextStep: number) => {
    const stepErrors = validateStep(currentStep, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setCurrentStep(nextStep)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const allErrors = {
      ...validateStep(1, formData),
      ...validateStep(2, formData),
      ...validateStep(3, formData),
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      if (allErrors.full_name || allErrors.email || allErrors.phone || allErrors.location || allErrors.linkedin_url)
        setCurrentStep(1)
      else if (allErrors.company_name || allErrors.sector || allErrors.stage || allErrors.company_website)
        setCurrentStep(2)
      toast("يرجى استكمال جميع الحقول المطلوبة.", "error")
      return
    }

    setSubmitting(true)
    try {
      const startedAt = Number(sessionStorage.getItem(APPLY_FORM_STARTED_AT_KEY) || Date.now())
      const payload = {
        ...formData,
        stage: normalizeStage(formData.stage),
        form_started_at: startedAt,
      }

      await api.post("/applications", payload)
      setSubmitted(true)
      sessionStorage.removeItem(APPLY_FORM_SESSION_KEY)
      sessionStorage.removeItem(APPLY_FORM_STARTED_AT_KEY)
      toast("تم إرسال الطلب بنجاح.", "success")
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object" && "errors" in err.data) {
        const serverErrors = (err.data as { errors: Record<string, string[]> }).errors
        const mapped: FormErrors = {}
        for (const [key, messages] of Object.entries(serverErrors)) {
          if (key in formData) {
            mapped[key as keyof FormData] = messages[0]
          }
        }
        setErrors(mapped)
        toast("يرجى مراجعة الحقول المعلّمة وتصحيحها.", "error")
      } else {
        toast("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.", "error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submitted state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <PublicLayout>
        <section className="relative min-h-[80vh] bg-slate-50/60 px-4 py-24 flex items-center">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          </div>
          <div className="relative mx-auto max-w-lg w-full text-center">
            <div
              className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-8 py-14"
              style={{ boxShadow: "0 8px 40px -8px rgba(59,82,212,0.1)" }}
            >
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-[#EEF1FF] border border-[#E4E7F0] flex items-center justify-center">
                  <PartyPopper className="h-9 w-9 text-[#3B52D4]" />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4]" />
                تم بنجاح
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                تم إرسال الطلب
              </h1>
              <p className="text-base text-slate-600 mb-2 leading-relaxed">
                شكرًا لك، <span className="font-bold text-slate-900">{formData.full_name.split(" ")[0]}</span>! لقد استلمنا طلبك بنجاح.
              </p>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                سيقوم الفريق بمراجعته والرد عليك خلال خمسة إلى سبعة أيام عمل عبر{" "}
                <span className="font-medium text-[#3B52D4]">{formData.email}</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold shadow-md shadow-[#3B52D4]/20"
                >
                  <Link href="/">العودة إلى الرئيسية</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold"
                >
                  <Link href="/founders">استكشف المؤسسين</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  // ── Progress percentage ───────────────────────────────────────────────────────
  const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-50/60 px-4 pt-28 pb-16">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#14b8a6]/4 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,black_10%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
            قدّم للانضمام
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
            انضم إلى شبكة{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
              وصول
            </span>
          </h1>
          <p className="text-base lg:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            تُراجع الطلبات بشكل مستمر. نستقبل المؤسسين في مراحل مختلفة، من البدايات المبكرة حتى من أسسوا وباعوا شركاتهم سابقًا.
          </p>


        </div>
      </section>

      {/* ── Criteria + Form ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: Criteria */}
            <div>
              <SectionHeader eyebrow="الملاءمة" heading="من الذي نرحب به في المجتمع؟" />
              <div className="space-y-4 mt-2">
                {criteria.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-[#EEF1FF] border border-[#E4E7F0] flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-[#3B52D4]" />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              {/* What to expect card */}
              <div
                className="mt-10 rounded-2xl border border-slate-200/60 bg-[#EEF1FF]/40 p-6"
                style={{ boxShadow: "0 2px 12px -2px rgba(59,82,212,0.04)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#3B52D4]" />
                  <span className="text-xs font-extrabold text-[#3B52D4] uppercase tracking-widest">ما يمكن توقعه</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  مراجعة دقيقة تستغرق من 5 إلى 7 أيام عمل، تليها مكالمة تعريفية قصيرة مع الفريق إن كان الطلب مناسبًا.
                </p>
              </div>
            </div>

            {/* Right: Multi-step form */}
            <div
              className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-7"
              style={{ boxShadow: "0 4px 24px -4px rgba(59,82,212,0.08), 0 1px 4px rgba(59,82,212,0.04)" }}
            >
              {/* Step header row */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400">
                  الخطوة {currentStep} من {steps.length}
                </span>
                <span className="text-xs font-bold text-[#3B52D4]">{steps[currentStep - 1].label}</span>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#3B52D4] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct === 0 ? 10 : progressPct}%` }}
                />
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-1 mb-7" role="list" aria-label="Application steps">
                {steps.map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-1 flex-1 last:flex-none">
                    <div
                      className={`h-7 w-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 transition-all ${
                        currentStep === id
                          ? "bg-[#3B52D4] text-white shadow-md shadow-[#3B52D4]/30"
                          : currentStep > id
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                      role="listitem"
                      aria-label={`الخطوة ${id}: ${label}`}
                      aria-current={currentStep === id ? "step" : undefined}
                    >
                      {currentStep > id ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        id
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold hidden sm:block ${
                        currentStep === id ? "text-[#3B52D4]" : "text-slate-400"
                      }`}
                    >
                      {label}
                    </span>
                    {id < steps.length && (
                      <div className="flex-1 h-px bg-slate-200 mx-1" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>

              {/* ── Step 1: Personal Info ── */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">البيانات الشخصية</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="full-name" className="text-xs font-bold text-slate-600">الاسم الكامل *</Label>
                    <Input
                      id="full-name"
                      placeholder="اكتب اسمك الكامل"
                      value={formData.full_name}
                      onChange={(e) => updateField("full_name", e.target.value)}
                      aria-invalid={!!errors.full_name}
                      className={inputClass}
                    />
                    <FieldError message={errors.full_name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-600">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      aria-invalid={!!errors.email}
                      className={inputClass}
                    />
                    <FieldError message={errors.email} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-600">رقم الهاتف *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+966 5XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        aria-invalid={!!errors.phone}
                        className={inputClass}
                      />
                      <FieldError message={errors.phone} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-xs font-bold text-slate-600">الموقع *</Label>
                      <Input
                        id="location"
                        placeholder="الرياض، السعودية"
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                        aria-invalid={!!errors.location}
                        className={inputClass}
                      />
                      <FieldError message={errors.location} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin" className="text-xs font-bold text-slate-600">رابط لينكدإن</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourname"
                      value={formData.linkedin_url}
                      onChange={(e) => updateField("linkedin_url", e.target.value)}
                      aria-invalid={!!errors.linkedin_url}
                      className={inputClass}
                    />
                    <FieldError message={errors.linkedin_url} />
                  </div>
                  <button
                    onClick={() => handleStepContinue(2)}
                    type="button"
                    className="w-full mt-2 py-3 bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#3B52D4]/20"
                  >
                    المتابعة إلى بيانات الشركة
                  </button>
                </div>
              )}

              {/* ── Step 2: Company Info ── */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">بيانات الشركة</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="company-name" className="text-xs font-bold text-slate-600">اسم الشركة *</Label>
                    <Input
                      id="company-name"
                      placeholder="اسم الشركة"
                      value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      aria-invalid={!!errors.company_name}
                      className={inputClass}
                    />
                    <FieldError message={errors.company_name} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sector" className="text-xs font-bold text-slate-600">القطاع *</Label>
                      <select
                        id="sector"
                        value={formData.sector}
                        onChange={(e) => updateField("sector", e.target.value)}
                        className={selectClass}
                        aria-invalid={!!errors.sector}
                      >
                        {sectors.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <FieldError message={errors.sector} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stage" className="text-xs font-bold text-slate-600">المرحلة *</Label>
                      <select
                        id="stage"
                        value={formData.stage}
                        onChange={(e) => updateField("stage", e.target.value)}
                        className={selectClass}
                        aria-invalid={!!errors.stage}
                      >
                        {stages.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <FieldError message={errors.stage} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-xs font-bold text-slate-600">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.company_website}
                      onChange={(e) => updateField("company_website", e.target.value)}
                      aria-invalid={!!errors.company_website}
                      className={inputClass}
                    />
                    <FieldError message={errors.company_website} />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition"
                    >
                      رجوع
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepContinue(3)}
                      className="flex-1 py-3 bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#3B52D4]/20"
                    >
                      متابعة
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Goals ── */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="company_fax"
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] opacity-0 pointer-events-none"
                    value={formData.bot_field}
                    onChange={(e) => updateField("bot_field", e.target.value)}
                    aria-hidden="true"
                  />
                  <h3 className="text-base font-extrabold text-slate-900 mb-1">الأهداف والدوافع</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="motivation" className="text-xs font-bold text-slate-600">
                      لماذا ترغب في الانضمام إلى وصول؟ *
                    </Label>
                    <Textarea
                      id="motivation"
                      placeholder="أخبرنا بما تتطلع إليه من المجتمع وما الذي سيصنع لك فرقًا حقيقيًا..."
                      className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] resize-none"
                      value={formData.motivation}
                      onChange={(e) => updateField("motivation", e.target.value)}
                      aria-invalid={!!errors.motivation}
                    />
                    <div className="flex justify-between">
                      <FieldError message={errors.motivation} />
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        {formData.motivation.length}/2000
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="offer" className="text-xs font-bold text-slate-600">
                      ما الذي يمكنك تقديمه لبقية المؤسسين؟
                    </Label>
                    <Textarea
                      id="offer"
                      placeholder="خبراتك، علاقاتك، أو المجالات التي يمكنك أن تضيف فيها..."
                      className="rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] resize-none"
                      value={formData.what_you_offer}
                      onChange={(e) => updateField("what_you_offer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="need" className="text-xs font-bold text-slate-600">
                      ما أكثر ما تحتاج إليه الآن؟
                    </Label>
                    <Textarea
                      id="need"
                      placeholder="دعم في الاستثمار، مواهب تقنية، وصول إلى السوق، شراكات..."
                      className="rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] resize-none"
                      value={formData.what_you_need}
                      onChange={(e) => updateField("what_you_need", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="referral" className="text-xs font-bold text-slate-600">
                      كيف سمعت عن وصول؟
                    </Label>
                    <Input
                      id="referral"
                      placeholder="إحالة، لينكدإن، فعالية، صديق، جهة شريكة..."
                      value={formData.referral_source}
                      onChange={(e) => updateField("referral_source", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition"
                    >
                      رجوع
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-[#3B52D4] hover:bg-[#2E44C8] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-[#3B52D4]/20 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          جارٍ الإرسال...
                        </>
                      ) : (
                        "إرسال الطلب"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-slate-50/60">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="max-w-2xl mx-auto">
          <SectionHeader eyebrow="الأسئلة الشائعة" heading="أسئلة متكررة" centered />
          <div className="space-y-3 mt-2">
            {faqs.map(({ q, a }, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 transition-all duration-200 hover:border-[#3B52D4]/30"
                style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.04)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-right font-bold text-sm text-slate-800 hover:bg-slate-50/60 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-[#3B52D4] shrink-0 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#3B52D4] shrink-0 transition-transform" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
