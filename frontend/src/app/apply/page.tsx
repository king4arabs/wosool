"use client"

import { useState, useCallback } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import { CheckCircle, ChevronDown, ChevronUp, Loader2, PartyPopper } from "lucide-react"
import Link from "next/link"

const criteria = [
  "You are an active founder or co-founder of a company",
  "Your company is incorporated or in the process of incorporation",
  "You are building in or with a focus on Saudi Arabia or the GCC",
  "You have at least 6 months of runway or are actively raising",
  "You are committed to contributing to the community, not just consuming",
]

const faqs = [
  {
    q: "How long does the application take?",
    a: "The application form takes about 10–15 minutes. We review applications on a rolling basis and typically respond within 5–7 business days.",
  },
  {
    q: "Is there a membership fee?",
    a: "Wosool is currently invite-and-apply access. Pricing details are shared after your application is reviewed. We offer multiple tiers to accommodate different stages.",
  },
  {
    q: "Can I apply if I'm pre-product?",
    a: "Yes, as long as you have a clear concept, are actively building, and are committed to the GCC market. Pre-seed and pre-product founders are welcome.",
  },
  {
    q: "What happens after I apply?",
    a: "You'll receive a confirmation email. Our team reviews your application and may schedule a brief onboarding call before granting access.",
  },
]

const steps = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Company Info" },
  { id: 3, label: "Goals & Motivation" },
]

const sectors = [
  "Fintech",
  "HealthTech",
  "SaaS / B2B",
  "E-commerce",
  "Logistics",
  "FoodTech",
  "HRTech",
  "EdTech",
  "PropTech",
  "CleanTech",
  "Other",
]

const stages = ["Pre-seed", "Seed", "Series A", "Series B+", "Scale-up", "Exited"]

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
}

type FormErrors = Partial<Record<keyof FormData, string>>

const initialFormData: FormData = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin_url: "",
  company_name: "",
  sector: "Fintech",
  stage: "Pre-seed",
  company_website: "",
  motivation: "",
  what_you_offer: "",
  what_you_need: "",
  referral_source: "",
  referrer_name: "",
}

function validateStep(step: number, data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (step === 1) {
    if (!data.full_name.trim()) errors.full_name = "Please enter your full name."
    if (!data.email.trim()) errors.email = "Please enter your email address."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Please enter a valid email address."
    if (!data.phone.trim()) errors.phone = "Please enter your phone number."
    if (!data.location.trim()) errors.location = "Please enter your location."
    if (data.linkedin_url && !/^https?:\/\/.+/.test(data.linkedin_url))
      errors.linkedin_url = "Please enter a valid URL."
  }

  if (step === 2) {
    if (!data.company_name.trim()) errors.company_name = "Please enter your company name."
    if (!data.sector.trim()) errors.sector = "Please select your sector."
    if (!data.stage.trim()) errors.stage = "Please select your company stage."
    if (data.company_website && !/^https?:\/\/.+/.test(data.company_website))
      errors.company_website = "Please enter a valid URL."
  }

  if (step === 3) {
    if (!data.motivation.trim()) errors.motivation = "Please tell us why you want to join Wosool."
    if (data.motivation.length > 2000) errors.motivation = "Motivation must be under 2000 characters."
  }

  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600 mt-1">{message}</p>
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field]
          return next
        })
      }
    },
    [errors]
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

    // Validate all steps
    const allErrors = {
      ...validateStep(1, formData),
      ...validateStep(2, formData),
      ...validateStep(3, formData),
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      // Go back to the first step with errors
      if (allErrors.full_name || allErrors.email || allErrors.phone || allErrors.location || allErrors.linkedin_url)
        setCurrentStep(1)
      else if (allErrors.company_name || allErrors.sector || allErrors.stage || allErrors.company_website)
        setCurrentStep(2)
      toast("Please fill in all required fields.", "error")
      return
    }

    setSubmitting(true)
    try {
      await api.post("/applications", formData)
      setSubmitted(true)
      toast("Application submitted successfully!", "success")
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
        toast("Please correct the highlighted errors.", "error")
      } else {
        toast("Something went wrong. Please try again.", "error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <PublicLayout>
        <section className="bg-[#0A1628] text-white py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-[#C9A84C]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Application Submitted!
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              Thank you, {formData.full_name.split(" ")[0]}! We&apos;ve received your application.
            </p>
            <p className="text-gray-400 mb-8">
              Our team will review it and get back to you within 5–7 business days
              at <span className="text-white font-medium">{formData.email}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/">Back to Homepage</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/founders">Explore Founders</Link>
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Apply to Join
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Join the Wosool Network
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Applications are reviewed on a rolling basis. We accept founders at
            all stages — from pre-seed to exited.
          </p>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Criteria */}
            <div>
              <SectionHeader eyebrow="Eligibility" heading="Who We Accept" />
              <div className="space-y-4">
                {criteria.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#C9A84C] mt-0.5 shrink-0" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-[#F8F5EF] rounded-3xl p-8">
              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${
                        currentStep === id
                          ? "bg-[#C9A84C] text-[#0A1628]"
                          : currentStep > id
                          ? "bg-[#0A1628] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                      aria-label={`Step ${id}: ${label}`}
                    >
                      {currentStep > id ? "✓" : id}
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:block">{label}</span>
                    {id < steps.length && (
                      <div className="w-6 h-px bg-gray-300 mx-1" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Personal Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name *</Label>
                    <Input
                      id="full-name"
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={(e) => updateField("full_name", e.target.value)}
                      aria-invalid={!!errors.full_name}
                    />
                    <FieldError message={errors.full_name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      aria-invalid={!!errors.email}
                    />
                    <FieldError message={errors.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+966 5XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      aria-invalid={!!errors.phone}
                    />
                    <FieldError message={errors.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      aria-invalid={!!errors.location}
                    />
                    <FieldError message={errors.location} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourname"
                      value={formData.linkedin_url}
                      onChange={(e) => updateField("linkedin_url", e.target.value)}
                      aria-invalid={!!errors.linkedin_url}
                    />
                    <FieldError message={errors.linkedin_url} />
                  </div>
                  <Button onClick={() => handleStepContinue(2)} className="w-full" type="button">
                    Continue to Company Info →
                  </Button>
                </div>
              )}

              {/* Step 2: Company Info */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Company Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input
                      id="company-name"
                      placeholder="Your company name"
                      value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      aria-invalid={!!errors.company_name}
                    />
                    <FieldError message={errors.company_name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector *</Label>
                    <select
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => updateField("sector", e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                      aria-invalid={!!errors.sector}
                    >
                      {sectors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <FieldError message={errors.sector} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage *</Label>
                    <select
                      id="stage"
                      value={formData.stage}
                      onChange={(e) => updateField("stage", e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                      aria-invalid={!!errors.stage}
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <FieldError message={errors.stage} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.company_website}
                      onChange={(e) => updateField("company_website", e.target.value)}
                      aria-invalid={!!errors.company_website}
                    />
                    <FieldError message={errors.company_website} />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} type="button" className="flex-1">
                      ← Back
                    </Button>
                    <Button onClick={() => handleStepContinue(3)} type="button" className="flex-1">
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Goals & Motivation</h3>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Why do you want to join Wosool? *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Tell us what you're looking to get from the community..."
                      className="min-h-[100px]"
                      value={formData.motivation}
                      onChange={(e) => updateField("motivation", e.target.value)}
                      aria-invalid={!!errors.motivation}
                    />
                    <div className="flex justify-between">
                      <FieldError message={errors.motivation} />
                      <span className="text-xs text-gray-400">{formData.motivation.length}/2000</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer">What can you offer other founders?</Label>
                    <Textarea
                      id="offer"
                      placeholder="Your expertise, experience, or network..."
                      value={formData.what_you_offer}
                      onChange={(e) => updateField("what_you_offer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="need">What do you need most right now?</Label>
                    <Textarea
                      id="need"
                      placeholder="Fundraising advice, technical talent, market access..."
                      value={formData.what_you_need}
                      onChange={(e) => updateField("what_you_need", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral">How did you hear about Wosool?</Label>
                    <Input
                      id="referral"
                      placeholder="Referral, LinkedIn, event, etc."
                      value={formData.referral_source}
                      onChange={(e) => updateField("referral_source", e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} type="button" className="flex-1">
                      ← Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting…
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-2xl mx-auto">
          <SectionHeader eyebrow="FAQ" heading="Common Questions" centered />
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-[#0A1628] hover:bg-gray-50 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-[#C9A84C] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#C9A84C] shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
