"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react"

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

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
                    <button
                      onClick={() => setCurrentStep(id)}
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
                    </button>
                    <span className="text-xs text-gray-500 hidden sm:block">{label}</span>
                    {id < steps.length && (
                      <div className="w-6 h-px bg-gray-300 mx-1" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <form className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Personal Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input id="full-name" placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, Country" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input id="linkedin" placeholder="https://linkedin.com/in/yourname" />
                  </div>
                  <Button onClick={() => setCurrentStep(2)} className="w-full" type="button">
                    Continue to Company Info →
                  </Button>
                </form>
              )}

              {/* Step 2: Company Info */}
              {currentStep === 2 && (
                <form className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Company Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Your company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <select
                      id="sector"
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option>Fintech</option>
                      <option>HealthTech</option>
                      <option>SaaS / B2B</option>
                      <option>E-commerce</option>
                      <option>Logistics</option>
                      <option>FoodTech</option>
                      <option>HRTech</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <select
                      id="stage"
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                    >
                      <option>Pre-seed</option>
                      <option>Seed</option>
                      <option>Series A</option>
                      <option>Scale-up</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input id="website" type="url" placeholder="https://yourcompany.com" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} type="button" className="flex-1">
                      ← Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} type="button" className="flex-1">
                      Continue →
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <form className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Goals & Motivation</h3>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Why do you want to join Wosool?</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Tell us what you're looking to get from the community..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="offer">What can you offer other founders?</Label>
                    <Textarea
                      id="offer"
                      placeholder="Your expertise, experience, or network..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referral">How did you hear about Wosool?</Label>
                    <Input id="referral" placeholder="Referral, LinkedIn, event, etc." />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} type="button" className="flex-1">
                      ← Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      Submit Application
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
