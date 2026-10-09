import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wosool.org";

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
  icons: { icon: "/wosool-network-logo.png", apple: "/wosool-network-logo.png" },
  openGraph: {
    title: "Wosool — Founders to Founders | وصول — من مؤسس إلى مؤسس",
    description:
      "شبكة خاصة للمؤسسين الطموحين الذين يبنون شركات جادة في السعودية والخليج.",
    url: "./",
    siteName: "Wosool",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    images: [{ url: "/wosool-network-logo.png", alt: "Wosool | وصول" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    images: ["/wosool-network-logo.png"],
    title: "Wosool — Founders to Founders | وصول — من مؤسس إلى مؤسس",
    description:
      "شبكة خاصة للمؤسسين في السعودية والخليج.",
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
};

export const viewport: Viewport = {
  themeColor: "#07111F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-[#4056C7] focus:px-4 focus:py-2 focus:font-medium focus:text-white"
          >
            الانتقال إلى المحتوى الرئيسي
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
