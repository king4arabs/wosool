import Link from "next/link"
import type { Founder } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"

interface FounderCardProps {
  founder: Founder
}

export function FounderCard({ founder }: FounderCardProps) {
  const initials = founder.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1 pt-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#0A1628] truncate">{founder.name}</h3>
              {founder.isVerified && (
                <span className="text-[#C9A84C]" title="Verified Member">✓</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{founder.companyName}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-400">{founder.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{founder.tagline}</p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant="secondary">{founder.sector}</Badge>
          <Badge variant="outline">{founder.stage}</Badge>
        </div>

        {/* Score indicator */}
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-[#C9A84C]" />
          <span className="text-sm font-semibold text-[#0A1628]">{founder.score}</span>
          <span className="text-xs text-gray-400">Founder Score</span>
        </div>

        {/* Needs & Offers */}
        {founder.needs.length > 0 && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Needs: </span>
            <span className="text-xs text-gray-600">{founder.needs.slice(0, 2).join(", ")}</span>
          </div>
        )}
        {founder.offers.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Offers: </span>
            <span className="text-xs text-gray-600">{founder.offers.slice(0, 2).join(", ")}</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/founders/${founder.slug}`}>Connect</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
