"use client"

import { useEffect, useState } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { ProgramCard } from "@/components/sections/ProgramCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { programs as seedPrograms } from "@/data/seed"
import type { Program } from "@/types"

const categories = ["All Programs", "Onboarding", "Peer Learning", "Growth", "Fundraising"]

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(seedPrograms)
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch("/api/v1/programs", {
          headers: { Accept: "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const data = json.data ?? json
          if (Array.isArray(data) && data.length > 0) {
            setPrograms(
              data.map((p: Record<string, unknown>) => ({
                id: String(p.id),
                name: String(p.name ?? ""),
                slug: String(p.slug ?? ""),
                description: String(p.description ?? ""),
                category: String(p.category ?? ""),
                duration: String(p.duration ?? ""),
                targetStage: Array.isArray(p.target_stages) ? p.target_stages.map(String) : [],
                applicationDeadline: p.application_deadline ? String(p.application_deadline) : undefined,
                cohortSize: p.cohort_size ? Number(p.cohort_size) : undefined,
                benefits: Array.isArray(p.benefits) ? p.benefits.map(String) : [],
                isOpen: Boolean(p.is_open),
              }))
            )
          }
        }
      } catch {
        // Fallback to seed data
      } finally {
        setIsLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  const openPrograms = programs.filter((p) => p.isOpen)
  const closedPrograms = programs.filter((p) => !p.isOpen)

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            Programs
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Structured Support for Every Stage
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            From onboarding to fundraising readiness, Wosool programs are
            designed to give founders exactly what they need at the right moment.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 px-4 bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-[#0A1628] hover:bg-gray-100 whitespace-nowrap transition-colors first:bg-[#0A1628] first:text-white"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Open Programs */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="Currently Open"
            heading="Apply Now"
            subheading="These programs are accepting applications for the current or upcoming cohort."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {openPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          {closedPrograms.length > 0 && (
            <>
              <SectionHeader
                eyebrow="Coming Soon"
                heading="Opening Next Quarter"
                subheading="Join the waitlist for these programs."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {closedPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* How Programs Work */}
      <section className="py-20 px-4 section-cream">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            eyebrow="How It Works"
            heading="Programs built around real founder needs"
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "Apply", desc: "Submit a brief application for your chosen program. We match based on stage, goals, and fit." },
              { step: "Join Your Cohort", desc: "Be matched with peers at a similar stage. Small cohorts for focused learning." },
              { step: "Build & Grow", desc: "Attend sessions, complete milestones, and access ongoing alumni support." },
            ].map(({ step, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#0A1628] mb-2">{step}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0A1628] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate?</h2>
          <p className="text-gray-300 mb-8">
            Become a Wosool member to access all programs and apply to upcoming
            cohorts.
          </p>
          <Button asChild size="lg">
            <Link href="/apply">Apply to Join</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
