"use client"

import Link from "next/link"
import type { NewsItem } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Newspaper, User } from "lucide-react"
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
    <Card className="group flex h-full flex-col overflow-hidden border-[var(--border-soft)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div
        className="flex h-44 items-center justify-center rounded-t-xl bg-[var(--surface-inverse)]"
        aria-hidden="true"
      >
        <span className="grid h-20 w-20 place-items-center rounded-3xl border border-white/20 bg-white/10 text-[var(--on-dark)]">
          <Newspaper className="h-10 w-10" strokeWidth={1.5} />
        </span>
      </div>

      <CardContent className="flex-1 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={variant}>{localized.category}</Badge>
        </div>

        <h3 className="mb-2 line-clamp-2 font-semibold text-[var(--text-strong)] transition-colors group-hover:text-[var(--link)]">
          <Link href={`/news/${item.slug}`}>{localized.title}</Link>
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-7 text-[var(--text-muted)]">{localized.excerpt}</p>

        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
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
