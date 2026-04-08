import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, Globe, Users, Briefcase } from "lucide-react"

const sectors = ["Fintech", "HealthTech", "SaaS / B2B", "Logistics", "FoodTech", "HRTech", "EdTech", "CleanTech"]
const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Scale-up", "Exited"]
const teamSizes = ["1–10", "11–50", "51–200", "201–500", "500+"]

export default function CompanyPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Company Identity */}
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
            <Input id="c-name" defaultValue="Meezan Capital" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-description">Description</Label>
            <Textarea
              id="c-description"
              className="min-h-[120px]"
              defaultValue="Shariah-compliant financial products for underbanked individuals and SMEs across Saudi Arabia and the broader GCC region."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-sector">Sector</Label>
              <select
                id="c-sector"
                defaultValue="Fintech"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                {sectors.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-stage">Stage</Label>
              <select
                id="c-stage"
                defaultValue="Series A"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                {stages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
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
              <Input id="c-location" defaultValue="Riyadh, Saudi Arabia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-founded">Founded Year</Label>
              <Input id="c-founded" type="number" defaultValue="2022" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-team-size">Team Size</Label>
              <select
                id="c-team-size"
                defaultValue="11–50"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                {teamSizes.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="c-website" type="url" defaultValue="https://meezancapital.com" className="pl-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Toggles */}
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
              label: "We're Hiring",
              description: "Show a hiring badge on your company profile",
              defaultChecked: true,
              badge: "Hiring",
              badgeVariant: "success" as const,
            },
            {
              id: "c-fundraising",
              label: "Currently Fundraising",
              description: "Signal to investors that you're raising a round",
              defaultChecked: false,
              badge: "Fundraising",
              badgeVariant: "warning" as const,
            },
            {
              id: "c-collaborating",
              label: "Open to Collaboration",
              description: "Show interest in partnerships and joint projects",
              defaultChecked: true,
              badge: "Collaborating",
              badgeVariant: "secondary" as const,
            },
          ].map((toggle) => (
            <div key={toggle.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={toggle.id} className="font-medium">
                      {toggle.label}
                    </Label>
                    <Badge variant={toggle.badgeVariant}>{toggle.badge}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{toggle.description}</p>
                </div>
                <input
                  id={toggle.id}
                  type="checkbox"
                  defaultChecked={toggle.defaultChecked}
                  className="h-5 w-5 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] mt-0.5"
                />
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Company Profile
        </Button>
      </div>
    </div>
  )
}
