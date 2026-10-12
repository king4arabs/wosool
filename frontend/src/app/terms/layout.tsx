import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "الشروط والأحكام | Terms of service",
  description: "شروط وأحكام استخدام منصة وصول. Terms for using the Wosool platform.",
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
