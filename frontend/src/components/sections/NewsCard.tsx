"use client"

import Link from "next/link"
import type { NewsItem } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { getLocalizedNewsContent } from "@/lib/news-content"

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

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function NewsCard({ item }: NewsCardProps) {
  const { locale } = useLocale()
  const intlLocale = locale === "ar" ? "ar" : "en-US"
  const localized = getLocalizedNewsContent(item, locale)
  const variant = categoryVariant[item.category] ?? "secondary"

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-[#ddd7ca] bg-[linear-gradient(180deg,#fbfaf6_0%,#f3eee5_100%)] shadow-[0_18px_44px_-24px_rgba(18,24,38,0.18)]">
      <div
        className="flex h-44 items-center justify-center rounded-t-xl bg-[radial-gradient(circle_at_top_left,rgba(31,138,112,0.16),transparent_36%),linear-gradient(145deg,#0b1420,#162131)]"
        aria-hidden="true"
      >
        <span className="text-4xl opacity-30">📰</span>
      </div>

      <CardContent className="flex-1 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={variant}>{localized.category}</Badge>
        </div>

        <h3 className="mb-2 line-clamp-2 font-semibold text-[#121826] transition-colors group-hover:text-[#1f8a70]">
          <Link href={`/news/${item.slug}`}>{localized.title}</Link>
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-7 text-[#5b6472]">{localized.excerpt}</p>

        <div className="flex items-center gap-4 text-xs text-[#7b8494]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(localized.publishedAt, intlLocale)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{localized.author}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
