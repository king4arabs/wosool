import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata(
  "الشروط والأحكام | Terms of service",
  "شروط وأحكام استخدام منصة وصول. Terms for using the Wosool platform.",
)

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
