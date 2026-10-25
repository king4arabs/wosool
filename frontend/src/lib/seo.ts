import type { Metadata } from "next"

export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: "./" },
    openGraph: {
      title: `${title} | Wosool`,
      description,
      url: "./",
      type: "website",
      siteName: "Wosool",
      locale: "ar_SA",
      alternateLocale: ["en_US"],
      images: [{ url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "Wosool — Founders to Founders" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Wosool`,
      description,
      images: ["/opengraph-image"],
    },
  }
}
