"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { Building, CheckCircle2, Clock, Loader2, Mail, Newspaper, Users, type LucideIcon } from "lucide-react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { PageHero } from "@/components/sections/PageHero"
import { api, ApiError } from "@/lib/api"
import { gatewayError } from "@/lib/gateway"
import { useLocale } from "@/lib/locale"

type Category = "general" | "partnerships" | "sponsorship" | "media" | "founder-support" | "office-hours"

const categories: { value: Category; icon: LucideIcon; ar: [string, string]; en: [string, string] }[] = [
  { value: "general", icon: Mail, ar: ["سؤال عام", "عن وصول أو العضوية أو أي شيء آخر"], en: ["General question", "About Wosool, membership or anything else"] },
  { value: "founder-support", icon: Users, ar: ["دعم المؤسسين", "حسابك أو ملفك أو التعارف"], en: ["Founder support", "Your account, profile or introductions"] },
  { value: "partnerships", icon: Users, ar: ["شراكة", "برامج أو فعاليات مشتركة"], en: ["Partnership", "Joint programs or events"] },
  { value: "sponsorship", icon: Building, ar: ["رعاية", "رعاية فعالية أو لقاء مؤسسين"], en: ["Sponsorship", "Sponsor an event or founder gathering"] },
  { value: "media", icon: Newspaper, ar: ["إعلام", "طلبات الصحافة والمقابلات"], en: ["Media", "Press requests and interviews"] },
  { value: "office-hours", icon: Clock, ar: ["جلسة مع الفريق", "حجز وقت قصير للنقاش"], en: ["Time with the team", "Book a short call"] },
]

type Fields = { name: string; email: string; company: string; category: Category; subject: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>
const empty: Fields = { name: "", email: "", company: "", category: "general", subject: "", message: "" }

const input = "min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:border-[var(--action-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] aria-[invalid=true]:border-red-500"

export default function ContactPage() {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const t = (arText: string, enText: string) => (ar ? arText : enText)
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState("")
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const inFlight = useRef(false)

  // Links such as /contact?subject=...&category=sponsorship pre-fill the form.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const subject = params.get("subject")?.slice(0, 255)
    const category = params.get("category") as Category | null
    setValues(current => ({
      ...current,
      ...(subject ? { subject } : {}),
      ...(category && categories.some(item => item.value === category) ? { category } : {}),
    }))
  }, [])

  const set = useCallback(<K extends keyof Fields>(key: K, value: Fields[K]) => {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setFormError("")
  }, [])

  function validate(): Errors {
    const next: Errors = {}
    if (!values.name.trim()) next.name = t("اكتب اسمك.", "Enter your name.")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = t("اكتب بريداً إلكترونياً صحيحاً.", "Enter a valid email address.")
    if (!values.subject.trim()) next.subject = t("اكتب عنواناً قصيراً للرسالة.", "Add a short subject.")
    if (!values.message.trim()) next.message = t("اكتب رسالتك.", "Write your message.")
    if (values.message.length > 3000) next.message = t("الحد الأقصى 3000 حرف.", "Keep it under 3,000 characters.")
    return next
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    const found = validate()
    if (Object.keys(found).length) {
      setErrors(found)
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus()
      return
    }
    inFlight.current = true
    setBusy(true)
    try {
      await api.post("/contact", { ...values, name: values.name.trim(), email: values.email.trim(), subject: values.subject.trim(), message: values.message.trim() })
      setSent(true)
    } catch (error) {
      const server = error instanceof ApiError && error.data && typeof error.data === "object" && "errors" in error.data
        ? (error.data as { errors?: Record<string, string[]> }).errors : undefined
      if (server) {
        const mapped: Errors = {}
        for (const key of Object.keys(empty) as (keyof Fields)[]) if (server[key]?.[0]) mapped[key] = server[key][0]
        setErrors(mapped)
        setFormError(Object.keys(mapped).length ? "" : Object.values(server).flat()[0] ?? "")
      } else {
        setFormError(gatewayError(error, ar))
      }
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  const fieldProps = (key: keyof Fields) => ({
    id: `contact-${key}`,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `contact-${key}-error` : undefined,
  })
  // Plain render helper (not a component) so inputs keep focus while typing.
  const field = (name: keyof Fields, label: string, children: ReactNode, optional = false) => <div>
    <label htmlFor={`contact-${name}`} className="mb-2 block text-sm font-semibold text-[var(--text)]">{label}{optional && <span className="ms-1 font-normal text-[var(--text-subtle)]">{t("(اختياري)", "(optional)")}</span>}</label>
    {children}
    {errors[name] && <p id={`contact-${name}-error`} className="mt-2 text-sm text-red-700">{errors[name]}</p>}
  </div>

  return <PublicLayout><div dir={direction} lang={locale} className="bg-[var(--page-bg)]">
    <PageHero
      eyebrow={t("تواصل معنا", "Contact")}
      title={t("راسل فريق وصول", "Write to the Wosool team")}
      description={t("نقرأ كل رسالة ونرد خلال يومين إلى ثلاثة أيام عمل. ستصلك نسخة تأكيد على بريدك.", "We read every message and reply within 2–3 business days. You will get a confirmation copy by email.")}
    >
      <p className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]"><Mail size={16} aria-hidden="true" />{t("أو راسلنا مباشرة على", "Or email us directly at")} <a dir="ltr" href="mailto:info@wosool.org" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">info@wosool.org</a></p>
    </PageHero>

    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {sent ? <div role="status" className="mx-auto max-w-xl rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center">
        <CheckCircle2 size={40} className="mx-auto text-[var(--success-text)]" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-[var(--text-strong)]">{t("وصلتنا رسالتك", "Your message is with us")}</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{t("أرسلنا تأكيداً إلى", "We sent a confirmation to")} <span dir="ltr" className="font-semibold text-[var(--text)]">{values.email}</span>. {t("سنرد خلال يومين إلى ثلاثة أيام عمل.", "We will reply within 2–3 business days.")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-xl bg-[var(--action-bg)] px-6 font-bold text-[var(--action-fg)]">{t("العودة للرئيسية", "Back to home")}</Link>
          <button type="button" onClick={() => { setSent(false); setValues(empty) }} className="inline-flex min-h-12 items-center rounded-xl border border-[var(--border)] px-6 font-bold text-[var(--text)]">{t("رسالة أخرى", "Send another")}</button>
        </div>
      </div> :
      <form noValidate onSubmit={submit} aria-busy={busy} className="grid gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <fieldset>
          <legend className="text-base font-bold text-[var(--text-strong)]">{t("عن ماذا تريد أن تكتب؟", "What is this about?")}</legend>
          <div className="mt-4 grid gap-2">
            {categories.map(({ value, icon: Icon, ...copy }) => {
              const [title, hint] = copy[locale === "ar" ? "ar" : "en"]
              const active = values.category === value
              return <label key={value} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${active ? "border-[var(--action-bg)] bg-[var(--info-bg)]" : "border-[var(--border-soft)] bg-[var(--surface)] hover:border-[var(--border)]"}`}>
                <input type="radio" name="category" value={value} checked={active} onChange={() => set("category", value)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--action-bg)]" />
                <Icon size={18} className="mt-0.5 shrink-0 text-[var(--action-bg)]" aria-hidden="true" />
                <span><span className="block text-sm font-bold text-[var(--text-strong)]">{title}</span><span className="block text-xs leading-6 text-[var(--text-muted)]">{hint}</span></span>
              </label>
            })}
          </div>
        </fieldset>

        <div className="space-y-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {field("name", t("الاسم", "Name"), <input {...fieldProps("name")} className={input} value={values.name} onChange={e => set("name", e.target.value)} maxLength={255} autoComplete="name" />)}
            {field("email", t("البريد الإلكتروني", "Email"), <input {...fieldProps("email")} type="email" dir="ltr" className={input} placeholder="name@company.com" value={values.email} onChange={e => set("email", e.target.value)} maxLength={255} autoComplete="email" />)}
          </div>
          {field("company", t("الشركة أو الجهة", "Company or organisation"), <input {...fieldProps("company")} className={input} value={values.company} onChange={e => set("company", e.target.value)} maxLength={255} autoComplete="organization" />, true)}
          {field("subject", t("العنوان", "Subject"), <input {...fieldProps("subject")} className={input} value={values.subject} onChange={e => set("subject", e.target.value)} maxLength={255} />)}
          {field("message", t("الرسالة", "Message"), <textarea {...fieldProps("message")} rows={6} className={`${input} py-3`} value={values.message} onChange={e => set("message", e.target.value)} maxLength={3000} />)}
          <p className="text-xs text-[var(--text-subtle)]">{values.message.length}/3000</p>
          {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
          <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--action-bg)] px-6 font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-60 sm:w-auto">
            {busy && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}{busy ? t("جارٍ الإرسال…", "Sending…") : t("إرسال الرسالة", "Send message")}
          </button>
        </div>
      </form>}
    </section>
  </div></PublicLayout>
}
