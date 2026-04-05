import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
  centered?: boolean
  light?: boolean
}

export function SectionHeader({
  eyebrow,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
  centered = false,
  light = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12",
        centered ? "text-center" : "flex items-end justify-between gap-6 flex-wrap"
      )}
    >
      <div className={cn(centered && "mx-auto", "max-w-2xl")}>
        {eyebrow && (
          <p className="text-sm font-semibold text-[#C9A84C] uppercase tracking-widest mb-3">
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "text-3xl sm:text-4xl font-bold tracking-tight",
            light ? "text-white" : "text-[#0A1628]"
          )}
        >
          {heading}
        </h2>
        {subheading && (
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed",
              light ? "text-gray-300" : "text-gray-600"
            )}
          >
            {subheading}
          </p>
        )}
      </div>

      {ctaLabel && ctaHref && !centered && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] hover:gap-3 transition-all shrink-0"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {ctaLabel && ctaHref && centered && (
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C9A84C] hover:gap-3 transition-all"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
