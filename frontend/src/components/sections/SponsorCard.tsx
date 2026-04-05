import type { Sponsor } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface SponsorCardProps {
  sponsor: Sponsor
}

const tierVariant: Record<Sponsor["tier"], "default" | "gold" | "secondary"> = {
  Platinum: "default",
  Gold: "gold",
  Silver: "secondary",
  Bronze: "secondary",
  Community: "secondary",
}

const tierColors: Record<Sponsor["tier"], string> = {
  Platinum: "from-slate-200 to-slate-300",
  Gold: "from-yellow-100 to-amber-200",
  Silver: "from-gray-100 to-gray-200",
  Bronze: "from-orange-100 to-orange-200",
  Community: "from-blue-50 to-blue-100",
}

export function SponsorCard({ sponsor }: SponsorCardProps) {
  const initials = sponsor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Logo placeholder */}
        <div
          className={`h-20 rounded-xl bg-gradient-to-br ${tierColors[sponsor.tier]} flex items-center justify-center mb-4`}
          aria-hidden="true"
        >
          <span className="text-2xl font-bold text-gray-600">{initials}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[#0A1628]">{sponsor.name}</h3>
          <Badge variant={tierVariant[sponsor.tier]}>{sponsor.tier}</Badge>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{sponsor.description}</p>

        {sponsor.website && (
          <a
            href={sponsor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#C9A84C] hover:underline"
          >
            Visit website
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}
