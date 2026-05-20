import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Manrope } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wosool.org";
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وصول | شبكة خاصة للمؤسسين",
    template: "%s | Wosool",
  },
  description:
    "وصول شبكة خاصة للمؤسسين تربط البنّائين الطموحين في السعودية والخليج بوصول نوعي وبرامج منتقاة وعلاقات عالية القيمة.",
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
  openGraph: {
    title: "وصول | شبكة خاصة للمؤسسين",
    description:
      "شبكة خاصة للمؤسسين الطموحين الذين يبنون شركات جادة في السعودية والخليج.",
    url: siteUrl,
    siteName: "Wosool",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "وصول | شبكة خاصة للمؤسسين",
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
    canonical: siteUrl,
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
      <body className={`${manrope.variable} ${cairo.variable} min-h-full flex flex-col font-sans`}>
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
