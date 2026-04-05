import type { Partner } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface PartnerCardProps {
  partner: Partner
}

const statusVariant: Record<Partner["status"], Parameters<typeof Badge>[0]["variant"]> = {
  Confirmed: "success",
  Prospective: "warning",
  "Ecosystem-Aligned": "secondary",
  "Past Collaborator": "outline",
}

export function PartnerCard({ partner }: PartnerCardProps) {
  const initials = partner.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Logo placeholder */}
          <div
            className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0A1628] truncate">{partner.name}</h3>
            <p className="text-xs text-gray-500">{partner.sector}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{partner.type}</Badge>
          <Badge variant={statusVariant[partner.status]}>{partner.status}</Badge>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3 mb-4">{partner.description}</p>

        {partner.website && (
          <a
            href={partner.website}
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
