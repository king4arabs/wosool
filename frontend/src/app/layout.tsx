import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import { SkipLink } from "@/components/layout/SkipLink"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wosool.org"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wosool — Founders to Founders | وصول — من مؤسس إلى مؤسس",
    template: "%s | Wosool",
  },
  description:
    "Wosool — Founders to Founders. A founder community for connections, learning and collaboration in Saudi Arabia and the GCC. وصول — مجتمع المؤسسين للتواصل والتعلم والتعاون.",
  keywords: [
    "founders network",
    "Saudi Arabia startups",
    "GCC entrepreneurs",
    "شبكة المؤسسين",
    "مؤسسو السعودية",
    "founder community",
    "startup ecosystem",
    "Vision 2030",
    "MENA startups",
  ],
  authors: [{ name: "Wosool", url: siteUrl }],
  creator: "Wosool",
  publisher: "Wosool",
  icons: {
    icon: [{ url: "/wosool-w-favicon.svg", type: "image/svg+xml" }],
    shortcut: "/wosool-w-favicon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Wosool — Founders to Founders | وصول — من مؤسس إلى مؤسس",
    description: "شبكة خاصة للمؤسسين الطموحين الذين يبنون شركات جادة في السعودية والخليج.",
    url: "./",
    siteName: "Wosool",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    images: [{ url: "/wosool-logo-eo.svg", width: 820, height: 180, alt: "Wosool — Founders to Founders" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/wosool-logo-eo.svg"],
    title: "Wosool — Founders to Founders | وصول — من مؤسس إلى مؤسس",
    description: "شبكة خاصة للمؤسسين في السعودية والخليج.",
    creator: "@AboutWosool",
    site: "@AboutWosool",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "./",
  },
}

export const viewport: Viewport = {
  themeColor: "#0C0C31",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  )
}
