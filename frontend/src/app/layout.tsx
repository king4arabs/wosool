import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wosool.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wosool — Founders to Founders",
    template: "%s | Wosool",
  },
  description:
    "Wosool is a premium founders-to-founders network for ambitious entrepreneurs building in Saudi Arabia and the GCC. Apply to join a trusted community of verified founders.",
  keywords: [
    "founders network",
    "Saudi Arabia startups",
    "GCC entrepreneurs",
    "founder community",
    "startup ecosystem",
    "Vision 2030",
    "MENA startups",
  ],
  authors: [{ name: "Wosool", url: siteUrl }],
  creator: "Wosool",
  publisher: "Wosool",
  openGraph: {
    title: "Wosool — Founders to Founders",
    description:
      "A premium founders-to-founders network for ambitious entrepreneurs in Saudi Arabia and the GCC.",
    url: siteUrl,
    siteName: "Wosool",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wosool — Founders to Founders",
    description:
      "A premium founders-to-founders network for ambitious entrepreneurs in Saudi Arabia and the GCC.",
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
  themeColor: "#0A1628",
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
    <html lang="en" dir="ltr" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-gold focus:text-brand-navy focus:rounded-md focus:font-medium"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
