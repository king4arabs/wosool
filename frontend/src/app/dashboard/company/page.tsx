"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { Save, Globe, Users, Briefcase } from "lucide-react"

const sectors = ["Fintech", "HealthTech", "SaaS / B2B", "Logistics", "FoodTech", "HRTech", "EdTech", "CleanTech"]
const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Scale-up", "Exited"]

interface MemberCompany {
  id: number
  name: string
  description?: string | null
  website?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  founded_year?: number | null
  team_size?: number | null
  is_hiring?: boolean
  is_fundraising?: boolean
  is_collaborating?: boolean
  pivot?: {
    is_primary?: boolean
  }
}

interface CompanyFormState {
  name: string
  description: string
  website: string
  sector: string
  stage: string
  location: string
  foundedYear: string
  teamSize: string
  isHiring: boolean
  isFundraising: boolean
  isCollaborating: boolean
}

const emptyForm: CompanyFormState = {
  name: "",
  description: "",
  website: "",
  sector: "",
  stage: "",
  location: "",
  foundedYear: "",
  teamSize: "",
  isHiring: false,
  isFundraising: false,
  isCollaborating: false,
}

function toFormState(company?: MemberCompany): CompanyFormState {
  if (!company) {
    return emptyForm
  }

  return {
    name: company.name ?? "",
    description: company.description ?? "",
    website: company.website ?? "",
    sector: company.sector ?? "",
    stage: company.stage ?? "",
    location: company.location ?? "",
    foundedYear: company.founded_year ? String(company.founded_year) : "",
    teamSize: company.team_size ? String(company.team_size) : "",
    isHiring: Boolean(company.is_hiring),
    isFundraising: Boolean(company.is_fundraising),
    isCollaborating: Boolean(company.is_collaborating),
  }
}

export default function CompanyPage() {
  const { toast } = useToast()
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [companyCount, setCompanyCount] = useState(0)
  const [founderProfileRequired, setFounderProfileRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<CompanyFormState>(emptyForm)

  const loadCompany = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.get<{ data: MemberCompany[] }>("/member/companies")
      const companies = [...(res.data ?? [])]
      companies.sort((a, b) => Number(Boolean(b.pivot?.is_primary)) - Number(Boolean(a.pivot?.is_primary)))

      const primaryCompany = companies[0]
      setCompanyCount(companies.length)
      setCompanyId(primaryCompany?.id ?? null)
      setForm(toFormState(primaryCompany))
      setFounderProfileRequired(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setFounderProfileRequired(true)
        setCompanyId(null)
        setCompanyCount(0)
        setForm(emptyForm)
      } else {
        toast("Could not load your company profile.", "error")
      }
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadCompany()
  }, [loadCompany])

  const updateField = useCallback(
    <K extends keyof CompanyFormState>(field: K, value: CompanyFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        if (!prev[field as string]) return prev
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    },
    []
  )

  const onSave = useCallback(async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Company name is required." })
      toast("Please add your company name.", "error")
      return
    }

    setIsSaving(true)
    setErrors({})

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      website: form.website.trim() || null,
      sector: form.sector || null,
      stage: form.stage || null,
      location: form.location.trim() || null,
      founded_year: form.foundedYear ? Number(form.foundedYear) : null,
      team_size: form.teamSize ? Number(form.teamSize) : null,
      is_hiring: form.isHiring,
      is_fundraising: form.isFundraising,
      is_collaborating: form.isCollaborating,
      is_public: true,
      role: "Founder",
      is_primary: true,
    }

    try {
      const res = companyId === null
        ? await api.post<{ message: string; data: MemberCompany }>("/member/companies", payload)
        : await api.put<{ message: string; data: MemberCompany }>(`/member/companies/${companyId}`, payload)

      setCompanyId(res.data.id)
      setForm(toFormState(res.data))
      setFounderProfileRequired(false)
      toast(res.message ?? "Company profile saved.", "success")
      await loadCompany()
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const data = err.data as { errors?: Record<string, string[]>; message?: string } | null
        if (data?.errors) {
          const nextErrors: Record<string, string> = {}
          for (const [key, messages] of Object.entries(data.errors)) {
            const mappedKey = key === "founded_year"
              ? "foundedYear"
              : key === "team_size"
                ? "teamSize"
                : key
            nextErrors[mappedKey] = messages[0] ?? "Invalid value."
          }
          setErrors(nextErrors)
        }
        toast(data?.message ?? "Please correct the highlighted fields.", "error")
      } else {
        toast("Could not save company profile. Please try again.", "error")
      }
    } finally {
      setIsSaving(false)
    }
  }, [companyId, form, loadCompany, toast])

  if (isLoading) {
    return <div className="max-w-3xl text-sm text-gray-500">Loading company profile…</div>
  }

  if (founderProfileRequired) {
    return (
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-[#0A1628]">Founder Profile Required</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Create your founder profile first, then you&apos;ll be able to manage your company information here.
            </p>
            <Button asChild>
              <Link href="/dashboard/profile">Complete Founder Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      {companyCount > 1 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You have {companyCount} linked companies. This page is currently editing your primary company profile.
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[#C9A84C]" />
            Company Identity
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Company Name</Label>
            <Input
              id="c-name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-description">Description</Label>
            <Textarea
              id="c-description"
              className="min-h-[120px]"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-sector">Sector</Label>
              <select
                id="c-sector"
                value={form.sector}
                onChange={(e) => updateField("sector", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option value="">Select sector…</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-stage">Stage</Label>
              <select
                id="c-stage"
                value={form.stage}
                onChange={(e) => updateField("stage", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option value="">Select stage…</option>
                {stages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Users className="h-4 w-4 text-[#C9A84C]" />
            Company Details
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-location">Location</Label>
              <Input
                id="c-location"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-founded">Founded Year</Label>
              <Input
                id="c-founded"
                type="number"
                value={form.foundedYear}
                onChange={(e) => updateField("foundedYear", e.target.value)}
                aria-invalid={Boolean(errors.foundedYear)}
              />
              {errors.foundedYear && <p className="text-xs text-red-600">{errors.foundedYear}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-team-size">Team Size</Label>
              <Input
                id="c-team-size"
                type="number"
                min="1"
                value={form.teamSize}
                onChange={(e) => updateField("teamSize", e.target.value)}
                aria-invalid={Boolean(errors.teamSize)}
              />
              {errors.teamSize && <p className="text-xs text-red-600">{errors.teamSize}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="c-website"
                  type="url"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  className="pl-9"
                  aria-invalid={Boolean(errors.website)}
                />
              </div>
              {errors.website && <p className="text-xs text-red-600">{errors.website}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Status &amp; Visibility</h3>
          <p className="text-sm text-gray-500 mt-1">
            Let the community know what your company is currently open to.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            {
              id: "c-hiring",
              field: "isHiring" as const,
              label: "We're Hiring",
              description: "Show a hiring badge on your company profile",
              badge: "Hiring",
              badgeVariant: "success" as const,
            },
            {
              id: "c-fundraising",
              field: "isFundraising" as const,
              label: "Currently Fundraising",
              description: "Signal to investors that you're raising a round",
              badge: "Fundraising",
              badgeVariant: "warning" as const,
            },
            {
              id: "c-collaborating",
              field: "isCollaborating" as const,
              label: "Open to Collaboration",
              description: "Show interest in partnerships and joint projects",
              badge: "Collaborating",
              badgeVariant: "secondary" as const,
            },
          ].map((toggle) => (
            <div key={toggle.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={toggle.id} className="font-medium">{toggle.label}</Label>
                    <Badge variant={toggle.badgeVariant}>{toggle.badge}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{toggle.description}</p>
                </div>
                <input
                  id={toggle.id}
                  type="checkbox"
                  checked={form[toggle.field]}
                  onChange={(e) => updateField(toggle.field, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] mt-0.5"
                />
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onSave} loading={isSaving}>
          <Save className="h-4 w-4" />
          {companyId === null ? "Create Company Profile" : "Save Company Profile"}
        </Button>
      </div>
    </div>
  )
}
