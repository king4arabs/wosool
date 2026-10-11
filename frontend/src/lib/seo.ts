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
      images: [{ url: "/wosool-logo-eo.svg", width: 820, height: 180, alt: "Wosool — Founders to Founders" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Wosool`,
      description,
      images: ["/wosool-logo-eo.svg"],
    },
  }
}
