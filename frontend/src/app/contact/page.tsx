"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import {
  Mail,
  Users,
  Building,
  Newspaper,
  Loader2,
  PartyPopper,
  Clock,
  MessageSquare,
} from "lucide-react"

const categories = [
  { icon: Mail,      label: "استفسار عام",  value: "general",      description: "أسئلة عامة أو طلبات تواصل أولية" },
  { icon: Users,     label: "شراكات",       value: "partnerships", description: "شراكات تدعم مجتمع وصول أو برامجه" },
  { icon: Building,  label: "رعاية",        value: "sponsorship",  description: "الرعاية المرتبطة بالمنصة أو الفعاليات" },
  { icon: Newspaper, label: "إعلام",        value: "media",        description: "استفسارات الصحافة والظهور الإعلامي" },
]

interface ContactFormData {
  name: string
  email: string
  category: string
  subject: string
  message: string
  company: string
}

type ContactErrors = Partial<Record<keyof ContactFormData, string>>

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  category: "general",
  subject: "",
  message: "",
  company: "",
}

function validateContact(data: ContactFormData): ContactErrors {
  const errors: ContactErrors = {}
  if (!data.name.trim())    errors.name    = "يرجى إدخال الاسم."
  if (!data.email.trim())   errors.email   = "يرجى إدخال البريد الإلكتروني."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "يرجى إدخال بريد إلكتروني صحيح."
  if (!data.category)       errors.category = "يرجى اختيار التصنيف."
  if (!data.subject.trim()) errors.subject  = "يرجى كتابة عنوان الرسالة."
  if (!data.message.trim()) errors.message  = "يرجى كتابة الرسالة."
  if (data.message.length > 3000) errors.message = "يجب ألا تتجاوز الرسالة 3000 حرف."
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
      <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
      {message}
    </p>
  )
}

const inputClass =
  "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3B52D4] focus:ring-1 focus:ring-[#3B52D4] transition-colors"

export default function ContactPage() {
  const [formData, setFormData]   = useState<ContactFormData>(initialFormData)
  const [errors, setErrors]       = useState<ContactErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const updateField = useCallback(
    (field: keyof ContactFormData, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateContact(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast("يرجى استكمال جميع الحقول المطلوبة.", "error")
      return
    }
    setSubmitting(true)
    try {
      await api.post("/contact", formData)
      setSubmitted(true)
      toast("تم إرسال الرسالة بنجاح.", "success")
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object" && "errors" in err.data) {
        const serverErrors = (err.data as { errors: Record<string, string[]> }).errors
        const mapped: ContactErrors = {}
        for (const [key, messages] of Object.entries(serverErrors)) {
          if (key in formData) mapped[key as keyof ContactFormData] = messages[0]
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

  // ── Submitted ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <PublicLayout>
        <section className="relative min-h-[80vh] bg-slate-50/60 px-4 py-24 flex items-center">
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
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">تم إرسال الرسالة</h1>
              <p className="text-base text-slate-600 mb-2 leading-relaxed">
                شكرًا لتواصلك معنا. وصلتنا رسالتك بنجاح.
              </p>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                سيعود إليك الفريق خلال يومي إلى ثلاثة أيام عمل على{" "}
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
                  variant="outline"
                  className="rounded-xl border-slate-200 text-slate-700 hover:border-[#3B52D4]/40 hover:text-[#3B52D4] font-bold"
                  onClick={() => { setSubmitted(false); setFormData(initialFormData); setErrors({}) }}
                >
                  إرسال رسالة أخرى
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  // ── Main page ─────────────────────────────────────────────────────────────────
  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-slate-50/60 px-4 pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B52D4]/5 blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-400/4 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(59,82,212,0.06)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,black_10%,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B52D4] animate-pulse" />
            تواصل معنا
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
            يسعدنا{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B52D4] to-indigo-500">
              التواصل معك
            </span>
          </h1>
          <p className="text-base lg:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            سواء كان لديك سؤال، أو فكرة شراكة، أو رغبة في معرفة المزيد عن وصول، فنحن جاهزون للاستماع.
          </p>

          {/* Info chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <div
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600"
              style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}
            >
              <Clock className="h-3 w-3 text-[#3B52D4]" />
              الرد خلال ٢–٣ أيام عمل
            </div>
            <div
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600"
              style={{ boxShadow: "0 2px 8px -2px rgba(59,82,212,0.06)" }}
            >
              <MessageSquare className="h-3 w-3 text-[#3B52D4]" />
              <a href="mailto:hello@wosool.org" className="hover:text-[#3B52D4] transition-colors">
                hello@wosool.org
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form section ── */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* Left: category selector + hint */}
            <div className="lg:col-span-2 space-y-4">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-[#EEF1FF] border border-[#E4E7F0] px-3 py-1 rounded-full text-xs font-bold text-[#3B52D4] mb-3">
                  التصنيف
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">ما طبيعة هذا التواصل؟</h2>
              </div>

              {categories.map(({ icon: Icon, label, value, description }) => {
                const active = formData.category === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField("category", value)}
                    aria-pressed={active}
                    className="w-full flex items-start gap-3 p-4 rounded-2xl border text-start transition-all duration-200"
                    style={
                      active
                        ? {
                            borderColor: "rgba(59,82,212,0.4)",
                            background: "#EEF1FF",
                            boxShadow: "0 4px 16px -4px rgba(59,82,212,0.12)",
                          }
                        : {
                            borderColor: "#E2E8F0",
                            background: "white",
                          }
                    }
                  >
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={
                        active
                          ? { background: "#3B52D4", color: "white" }
                          : { background: "#F8FAFC", color: "#94a3b8" }
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`text-sm font-black mb-0.5 ${active ? "text-[#3B52D4]" : "text-slate-900"}`}>
                        {label}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                    </div>
                  </button>
                )
              })}

              {/* Hint card */}
              <div
                className="mt-2 p-5 bg-[#F5F7FF] border border-[#E4E7F0] rounded-2xl"
              >
                <div className="inline-flex items-center gap-1.5 bg-[#EEF1FF] border border-[#E4E7F0] px-2.5 py-1 rounded-full text-[10px] font-extrabold text-[#3B52D4] mb-3">
                  جلسة مباشرة
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">طلب جلسة مباشرة</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  إذا رغبت في تنسيق مكالمة مع فريق وصول، اذكر في رسالتك أنك تطلب جلسة مباشرة.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <Clock className="h-3 w-3" />
                  متوسط زمن الرد: يومان إلى ثلاثة أيام عمل
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <div
                className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-7"
                style={{ boxShadow: "0 4px 24px -4px rgba(59,82,212,0.07)" }}
              >
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold text-slate-600">
                      الاسم الكامل <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      className={inputClass}
                      placeholder="اكتب اسمك الكامل"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      aria-invalid={!!errors.name}
                    />
                    <FieldError message={errors.name} />
                  </div>

                  {/* Email + Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-email" className="text-xs font-bold text-slate-600">
                        البريد الإلكتروني <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className={inputClass}
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        aria-invalid={!!errors.email}
                      />
                      <FieldError message={errors.email} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="organisation" className="text-xs font-bold text-slate-600">
                        الجهة أو الشركة
                      </label>
                      <input
                        id="organisation"
                        className={inputClass}
                        placeholder="اسم الشركة أو الجهة"
                        value={formData.company}
                        onChange={(e) => updateField("company", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-bold text-slate-600">
                      عنوان الرسالة <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="subject"
                      className={inputClass}
                      placeholder="عنوان مختصر وواضح"
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      aria-invalid={!!errors.subject}
                    />
                    <FieldError message={errors.subject} />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-bold text-slate-600">
                      الرسالة <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className={inputClass + " h-auto resize-none py-3"}
                      placeholder="اكتب تفاصيل طلبك أو فكرتك أو استفسارك..."
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      aria-invalid={!!errors.message}
                    />
                    <div className="flex items-start justify-between gap-2">
                      <FieldError message={errors.message} />
                      <span
                        className={`text-[11px] font-medium shrink-0 ${
                          formData.message.length > 2800 ? "text-amber-500" : "text-slate-400"
                        }`}
                      >
                        {formData.message.length}/3000
                      </span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#3B52D4] hover:bg-[#2E44C8] text-white text-sm font-bold transition-all shadow-md shadow-[#3B52D4]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
