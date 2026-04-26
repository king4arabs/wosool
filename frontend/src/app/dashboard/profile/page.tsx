"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

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

const SECTORS = ["FinTech", "HealthTech", "EdTech", "SaaS / B2B", "LogTech", "FoodTech", "HRTech", "HospTech", "LegalTech"]
const STAGES = ["pre-seed", "seed", "series-a", "scale-up", "exited"]

export default function ProfilePage() {
  const { toast } = useToast()
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
          setProfile({ ...res.data, needs: res.data.needs ?? [], offers: res.data.offers ?? [] })
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // No profile yet — keep blank form
        } else if (!cancelled) {
          toast("Could not load your profile.", "error")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [toast])

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

  const onSave = useCallback(async () => {
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
      setProfile({ ...res.data, needs: res.data.needs ?? [], offers: res.data.offers ?? [] })
      toast(res.message ?? "Profile saved.", "success")
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const data = err.data as { errors?: Record<string, string[]> } | null
        if (data?.errors) {
          const flat: Record<string, string> = {}
          for (const [k, v] of Object.entries(data.errors)) {
            flat[k] = v[0] ?? "Invalid value."
          }
          setErrors(flat)
        }
        toast("Please correct the highlighted fields.", "error")
      } else {
        toast("Could not save profile. Please try again.", "error")
      }
    } finally {
      setIsSaving(false)
    }
  }, [profile, toast])

  if (isLoading) {
    return <div className="max-w-3xl text-sm text-gray-500">Loading profile…</div>
  }

  return (
    <div className="max-w-3xl space-y-8">
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Personal Information</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="p-tagline">Tagline</Label>
            <Input
              id="p-tagline"
              value={profile.tagline ?? ""}
              onChange={(e) => updateField("tagline", e.target.value)}
              aria-invalid={Boolean(errors.tagline)}
            />
            {errors.tagline && <p className="text-xs text-red-600">{errors.tagline}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-location">Location</Label>
              <Input
                id="p-location"
                value={profile.location ?? ""}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-linkedin">LinkedIn URL</Label>
              <Input
                id="p-linkedin"
                type="url"
                value={profile.linkedin_url ?? ""}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                aria-invalid={Boolean(errors.linkedin_url)}
              />
              {errors.linkedin_url && (
                <p className="text-xs text-red-600">{errors.linkedin_url}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-twitter">Twitter URL</Label>
              <Input
                id="p-twitter"
                type="url"
                value={profile.twitter_url ?? ""}
                onChange={(e) => updateField("twitter_url", e.target.value)}
                aria-invalid={Boolean(errors.twitter_url)}
              />
              {errors.twitter_url && (
                <p className="text-xs text-red-600">{errors.twitter_url}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-website">Website URL</Label>
              <Input
                id="p-website"
                type="url"
                value={profile.website_url ?? ""}
                onChange={(e) => updateField("website_url", e.target.value)}
                aria-invalid={Boolean(errors.website_url)}
              />
              {errors.website_url && (
                <p className="text-xs text-red-600">{errors.website_url}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Professional Background</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-bio">Bio</Label>
            <Textarea
              id="p-bio"
              className="min-h-[120px]"
              value={profile.bio ?? ""}
              onChange={(e) => updateField("bio", e.target.value)}
              aria-invalid={Boolean(errors.bio)}
            />
            {errors.bio && <p className="text-xs text-red-600">{errors.bio}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-sector">Sector</Label>
              <select
                id="p-sector"
                value={profile.sector ?? ""}
                onChange={(e) => updateField("sector", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option value="">Select sector…</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stage">Stage</Label>
              <select
                id="p-stage"
                value={profile.stage ?? ""}
                onChange={(e) => updateField("stage", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option value="">Select stage…</option>
                {STAGES.map((s) => (
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
          <h3 className="font-semibold text-[#0A1628]">Needs &amp; Offers</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tell the network what you&apos;re looking for and what you can give back.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>What I Need</Label>
            <div className="flex flex-wrap gap-2 mt-3 mb-3">
              {(profile.needs ?? []).map((need) => (
                <Badge key={need} variant="outline" className="gap-1">
                  {need}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 ml-1"
                    aria-label={`Remove ${need}`}
                    onClick={() => removeNeed(need)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a need (e.g., 'Regulatory guidance')"
                value={needInput}
                onChange={(e) => setNeedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addNeed()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addNeed}>
                Add
              </Button>
            </div>
          </div>
          <Separator />
          <div>
            <Label>What I Offer</Label>
            <div className="flex flex-wrap gap-2 mt-3 mb-3">
              {(profile.offers ?? []).map((offer) => (
                <Badge key={offer} variant="success" className="gap-1">
                  {offer}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 ml-1"
                    aria-label={`Remove ${offer}`}
                    onClick={() => removeOffer(offer)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add something you offer (e.g., 'Fundraising strategy')"
                value={offerInput}
                onChange={(e) => setOfferInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addOffer()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addOffer}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving…" : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
