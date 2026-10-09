import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wosool.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وصول | بوابة ريادة الأعمال وEO Accelerator",
    template: "%s | Wosool",
  },
  description:
    "وصول بوابة اكتشاف ريادة الأعمال السعودية والتقديم لبرنامج EO Riyadh Accelerator ومتابعة رحلة المؤسس.",
    default: "وصول | من مؤسس إلى مؤسس • EO Accelerator",
    template: "%s | Wosool",
  },
  description:
    "Wosool — Founders to Founders. بوابتك الرقمية إلى EO Riyadh Accelerator: تعلم ونمو وعلاقات عالمية للمؤسسين.",
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
    title: "وصول | بوابة ريادة الأعمال وEO Accelerator",
    title: "وصول | من مؤسس إلى مؤسس • EO Accelerator",
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
    title: "وصول | بوابة ريادة الأعمال وEO Accelerator",
    title: "وصول | من مؤسس إلى مؤسس • EO Accelerator",
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
