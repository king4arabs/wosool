import type { Metadata } from "next"

export const socialImage = { url: "/opengraph-image", type: "image/png", width: 1200, height: 630, alt: "Wosool — Founders to Founders" }

export function pageMetadata(title: string, description: string, path = "./"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Wosool`,
      description,
      url: path,
      type: "website",
      siteName: "Wosool",
      locale: "ar_SA",
      alternateLocale: ["en_US"],
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Wosool`,
      description,
      images: [socialImage.url],
    },
  }
}

/** Escape script delimiters in content from the public API. */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export function breadcrumbData(items: { name: string; path: string }[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name,
      item: new URL(item.path, siteUrl).href,
    })),
  }
}
