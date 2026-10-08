import type { Metadata } from "next"

export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: "./" },
    openGraph: {
      title: `${title} | Wosool`, description, url: "./", type: "website",
      siteName: "Wosool", locale: "ar_SA", alternateLocale: ["en_US"],
      images: [{ url: "/wosool-network-logo.png", alt: "Wosool | وصول" }],
    },
    twitter: { card: "summary", title: `${title} | Wosool`, description, images: ["/wosool-network-logo.png"] },
  }
}
