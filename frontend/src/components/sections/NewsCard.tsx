import Link from "next/link"
import type { NewsItem } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"

interface NewsCardProps {
  item: NewsItem
}

const categoryVariant: Record<string, "default" | "secondary" | "success" | "warning" | "gold"> = {
  "Founder Update": "success",
  "Ecosystem News": "default",
  "Event Recap": "secondary",
  "Program Update": "warning",
  Insights: "default",
  Announcement: "gold",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function NewsCard({ item }: NewsCardProps) {
  const variant = categoryVariant[item.category] ?? "secondary"

  return (
    <Card className="flex flex-col h-full group">
      {/* Thumbnail placeholder */}
      <div
        className="h-44 bg-gradient-to-br from-[#0A1628] to-[#1E293B] rounded-t-xl flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-4xl opacity-30">📰</span>
      </div>

      <CardContent className="flex-1 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={variant}>{item.category}</Badge>
        </div>

        <h3 className="font-semibold text-[#0A1628] line-clamp-2 mb-2 group-hover:text-[#C9A84C] transition-colors">
          <Link href={`/news/${item.slug}`}>{item.title}</Link>
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.excerpt}</p>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(item.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{item.author}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
