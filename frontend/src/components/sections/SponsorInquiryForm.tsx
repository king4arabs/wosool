"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { gatewayError } from "@/lib/gateway"

type Labels = {
  orgName: string; orgPlaceholder: string; contactName: string; contactPlaceholder: string
  email: string; tier: string; message: string; messagePlaceholder: string; submit: string
}
type Fields = { company: string; name: string; email: string; tier: string; message: string }
type Errors = Partial<Record<keyof Fields | "form", string>>

const field = "min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--text)] focus:border-[var(--action-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

/** Sponsorship inquiry: sent through the contact API with the "sponsorship" category so the team is alerted. */
export function SponsorInquiryForm({ labels, tiers, locale }: { labels: Labels; tiers: string[]; locale: "ar" | "en" }) {
  const ar = locale === "ar"
  const [values, setValues] = useState<Fields>({ company: "", name: "", email: "", tier: tiers[0] ?? "", message: "" })
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const inFlight = useRef(false)

  // Keep the selected tier in the visitor's current language when the locale changes.
  useEffect(() => {
    setValues(current => tiers.includes(current.tier) ? current : { ...current, tier: tiers[0] ?? "" })
  }, [tiers])

  const set = (key: keyof Fields, value: string) => {
    setValues(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined, form: undefined }))
  }

  function validate(): Errors {
    const next: Errors = {}
    if (!values.company.trim()) next.company = ar ? "اكتب اسم الجهة." : "Enter your organisation's name."
    if (!values.name.trim()) next.name = ar ? "اكتب اسمك." : "Enter your name."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = ar ? "اكتب بريداً إلكترونياً صحيحاً." : "Enter a valid email address."
    if (values.message.length > 2800) next.message = ar ? "الرسالة طويلة جداً." : "The message is too long."
    return next
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    const found = validate()
    if (Object.keys(found).length) { setErrors(found); return }
    inFlight.current = true
    setBusy(true)
    try {
      await api.post("/contact", {
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        category: "sponsorship",
        subject: `${ar ? "استفسار رعاية" : "Sponsorship inquiry"}: ${values.company.trim()} (${values.tier})`.slice(0, 255),
        message: [`${labels.tier}: ${values.tier}`, values.message.trim()].filter(Boolean).join("\n\n"),
      })
      setSent(true)
    } catch (error) {
      const server = error instanceof ApiError && error.data && typeof error.data === "object" && "errors" in error.data ? (error.data as { errors?: Record<string, string[]> }).errors : undefined
      setErrors(server ? { email: server.email?.[0], name: server.name?.[0], company: server.company?.[0], message: server.message?.[0], form: Object.values(server).flat()[0] } : { form: gatewayError(error, ar) })
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  if (sent) {
    return <div role="status" className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center">
      <CheckCircle2 className="mx-auto text-[var(--success-text)]" size={40} aria-hidden="true" />
      <h3 className="mt-4 text-xl font-bold text-[var(--text-strong)]">{ar ? "وصلنا طلبك" : "We have your inquiry"}</h3>
      <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{ar ? `أرسلنا تأكيداً إلى ${values.email}، وسيتواصل معك الفريق خلال يومين إلى ثلاثة أيام عمل.` : `We sent a confirmation to ${values.email}. The team will be in touch within 2–3 business days.`}</p>
    </div>
  }

  const row = (key: keyof Fields, label: string, input: React.ReactNode) => <div>
    <label htmlFor={`sponsor-${key}`} className="mb-2 block text-sm font-semibold text-[var(--text)]">{label}</label>
    {input}
    {errors[key] && <p id={`sponsor-${key}-error`} className="mt-2 text-sm text-red-700">{errors[key]}</p>}
  </div>
  const described = (key: keyof Fields) => ({ "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `sponsor-${key}-error` : undefined })

  return <form noValidate onSubmit={submit} aria-busy={busy} className="space-y-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
    {row("company", labels.orgName, <input id="sponsor-company" className={field} placeholder={labels.orgPlaceholder} value={values.company} onChange={e => set("company", e.target.value)} maxLength={255} autoComplete="organization" {...described("company")} />)}
    {row("name", labels.contactName, <input id="sponsor-name" className={field} placeholder={labels.contactPlaceholder} value={values.name} onChange={e => set("name", e.target.value)} maxLength={255} autoComplete="name" {...described("name")} />)}
    {row("email", labels.email, <input id="sponsor-email" type="email" dir="ltr" className={field} placeholder="name@company.com" value={values.email} onChange={e => set("email", e.target.value)} maxLength={255} autoComplete="email" {...described("email")} />)}
    {row("tier", labels.tier, <select id="sponsor-tier" className={field} value={values.tier} onChange={e => set("tier", e.target.value)}>{tiers.map(option => <option key={option}>{option}</option>)}</select>)}
    {row("message", labels.message, <textarea id="sponsor-message" rows={5} className={`${field} py-3`} placeholder={labels.messagePlaceholder} value={values.message} onChange={e => set("message", e.target.value)} {...described("message")} />)}
    {errors.form && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{errors.form}</p>}
    <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--action-bg)] px-6 font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)] disabled:opacity-60">
      {busy && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}{labels.submit}
    </button>
  </form>
}
