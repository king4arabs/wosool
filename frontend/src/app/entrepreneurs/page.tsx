import type { Metadata } from "next"
import { EntrepreneursDirectory } from "./EntrepreneursDirectory"

const title = "Entrepreneurs Directory | Innovation Platform"
const description =
  "Explore fictional entrepreneur profiles across Saudi Arabia, GCC, Arab markets, and global innovation ecosystems."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/entrepreneurs",
  },
  openGraph: {
    title,
    description,
    url: "/entrepreneurs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function EntrepreneursPage() {
  return <EntrepreneursDirectory />
}
