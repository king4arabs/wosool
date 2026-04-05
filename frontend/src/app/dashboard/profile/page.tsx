import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Save } from "lucide-react"

const profileSections = [
  "Personal Info",
  "Professional Background",
  "Founder Journey",
  "Needs & Offers",
]

const currentNeeds = ["Regulatory guidance", "B2B sales partnerships"]
const currentOffers = ["Fundraising strategy", "Product-market fit coaching"]

export default function ProfilePage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Section nav */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {profileSections.map((section, i) => (
          <button
            key={section}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-[#0A1628] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Personal Information</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF · Max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-first-name">First Name</Label>
              <Input id="p-first-name" defaultValue="Layla" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-last-name">Last Name</Label>
              <Input id="p-last-name" defaultValue="Al-Rashid" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-tagline">Tagline</Label>
            <Input id="p-tagline" defaultValue="Building the future of Islamic fintech in Saudi Arabia" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-location">Location</Label>
              <Input id="p-location" defaultValue="Riyadh, Saudi Arabia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-linkedin">LinkedIn URL</Label>
              <Input id="p-linkedin" type="url" defaultValue="https://linkedin.com/in/layla" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Background */}
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
              defaultValue="Ex-McKinsey, 2x founder. Previously built and exited a payments startup. Now focused on Shariah-compliant financial products for the underbanked."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-sector">Sector</Label>
              <select
                id="p-sector"
                defaultValue="Fintech"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                {["Fintech", "HealthTech", "SaaS / B2B", "Logistics", "FoodTech", "HRTech"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stage">Stage</Label>
              <select
                id="p-stage"
                defaultValue="Series A"
                className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                {["Pre-seed", "Seed", "Series A", "Scale-up", "Exited"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Founder Journey */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Founder Journey</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-company">Company Name</Label>
            <Input id="p-company" defaultValue="Meezan Capital" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-story">Your Founding Story</Label>
            <Textarea
              id="p-story"
              className="min-h-[120px]"
              placeholder="What problem are you solving and why does it matter to you personally?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-biggest-win">Biggest win so far</Label>
            <Input id="p-biggest-win" placeholder="e.g., Closed SAR 18M Series A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-biggest-challenge">Biggest challenge right now</Label>
            <Input id="p-biggest-challenge" placeholder="e.g., B2B sales pipeline" />
          </div>
        </CardContent>
      </Card>

      {/* Needs & Offers */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Needs & Offers</h3>
          <p className="text-sm text-gray-500 mt-1">
            Tell the network what you&apos;re looking for and what you can give back.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>What I Need</Label>
            <div className="flex flex-wrap gap-2 mt-3 mb-3">
              {currentNeeds.map((need) => (
                <Badge key={need} variant="outline" className="gap-1">
                  {need}
                  <button className="text-gray-400 hover:text-red-500 ml-1" aria-label={`Remove ${need}`}>×</button>
                </Badge>
              ))}
            </div>
            <Input placeholder="Add a need (e.g., 'Regulatory guidance')" />
          </div>
          <Separator />
          <div>
            <Label>What I Offer</Label>
            <div className="flex flex-wrap gap-2 mt-3 mb-3">
              {currentOffers.map((offer) => (
                <Badge key={offer} variant="success" className="gap-1">
                  {offer}
                  <button className="text-gray-400 hover:text-red-500 ml-1" aria-label={`Remove ${offer}`}>×</button>
                </Badge>
              ))}
            </div>
            <Input placeholder="Add something you offer (e.g., 'Fundraising strategy')" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Profile
        </Button>
      </div>
    </div>
  )
}
