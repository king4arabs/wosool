import Link from "next/link"
import type { Program } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle } from "lucide-react"

const categoryIcons: Record<string, string> = {
  Onboarding: "🚀",
  "Peer Learning": "🤝",
  Growth: "📈",
  Fundraising: "💰",
}

interface ProgramCardProps {
  program: Program
}

export function ProgramCard({ program }: ProgramCardProps) {
  const icon = categoryIcons[program.category] ?? "📋"

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-12 w-12 rounded-xl bg-[#F8F5EF] flex items-center justify-center text-2xl shrink-0"
            aria-hidden="true"
          >
            {icon}
          </div>
          <div>
            <Badge variant={program.isOpen ? "success" : "secondary"} className="mb-1">
              {program.isOpen ? "Open" : "Closed"}
            </Badge>
            <h3 className="font-semibold text-[#0A1628]">{program.name}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{program.description}</p>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          {program.targetStage.map((stage) => (
            <Badge key={stage} variant="outline">
              {stage}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Clock className="h-3 w-3" />
          <span>{program.duration}</span>
        </div>

        <ul className="space-y-1">
          {program.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-[#C9A84C] shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          variant={program.isOpen ? "default" : "secondary"}
          size="sm"
          className="w-full"
        >
          <Link href={`/programs#${program.slug}`}>Learn More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
