"use client"

import { useState } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, Users, Building, Newspaper } from "lucide-react"

const categories = [
  { icon: Mail, label: "General", value: "general", description: "General questions and enquiries" },
  { icon: Users, label: "Partnerships", value: "partnerships", description: "Partner with the Wosool community" },
  { icon: Building, label: "Sponsorship", value: "sponsorship", description: "Sponsor the Wosool platform or events" },
  { icon: Newspaper, label: "Media", value: "media", description: "Press and media enquiries" },
]

export default function ContactPage() {
  const [category, setCategory] = useState("general")

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Contact
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Whether you have a question, partnership idea, or just want to learn
            more — we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Category Selector */}
            <div className="lg:col-span-2">
              <SectionHeader eyebrow="Category" heading="What's this about?" />
              <div className="space-y-3">
                {categories.map(({ icon: Icon, label, value, description }) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${
                      category === value
                        ? "border-[#C9A84C] bg-[#C9A84C]/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    aria-pressed={category === value}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        category === value ? "bg-[#C9A84C] text-[#0A1628]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0A1628]">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 bg-[#F8F5EF] rounded-2xl">
                <h3 className="font-semibold text-[#0A1628] mb-2">Office Hours Request</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Want to schedule a call with the Wosool team? Use the form
                  and select &ldquo;Office Hours&rdquo; in your message.
                </p>
                <p className="text-xs text-gray-400">
                  Typical response time: 2–3 business days
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="Your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Your last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organisation">Organisation (optional)</Label>
                  <Input id="organisation" placeholder="Your company or organisation" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief subject line" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us what you have in mind..."
                    className="min-h-[140px]"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative contacts */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-2">You can also reach us directly at</p>
          <a
            href="mailto:hello@wosool.org"
            className="text-[#C9A84C] font-semibold hover:underline"
          >
            hello@wosool.org
          </a>
        </div>
      </section>
    </PublicLayout>
  )
}
