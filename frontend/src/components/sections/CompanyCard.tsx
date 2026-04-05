import Link from "next/link"
import type { Company } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Calendar } from "lucide-react"

interface CompanyCardProps {
  company: Company
}

export function CompanyCard({ company }: CompanyCardProps) {
  const initials = company.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1 pt-6">
        {/* Logo placeholder */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="h-14 w-14 rounded-xl bg-[#0A1628] flex items-center justify-center text-white font-bold text-sm shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0A1628] truncate">{company.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-400">{company.location}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{company.description}</p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant="secondary">{company.sector}</Badge>
          <Badge variant="outline">{company.stage}</Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Founded {company.foundedYear}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{company.teamSize}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {company.isHiring && (
            <Badge variant="success">Hiring</Badge>
          )}
          {company.isFundraising && (
            <Badge variant="warning">Fundraising</Badge>
          )}
          {company.isCollaborating && (
            <Badge variant="gold">Open to Collaborate</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link href={`/founders/companies/${company.slug}`}>View Company</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
