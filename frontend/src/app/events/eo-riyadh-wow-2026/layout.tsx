import type { Metadata } from "next"

export const metadata: Metadata = {
 title: "EO Riyadh WOW Event | Golf Club Wadi Safar",
 description: "Join EO Riyadh and EO Riyadh Accelerator on Friday, December 11, 2026, for golf, entrepreneurial conversations and networking in Diriyah. Advance RSVP and organizer approval required.",
 alternates: { canonical: "https://wosool.org/events/eo-riyadh-wow-2026" },
 openGraph: { title: "EO Riyadh WOW Event", description: "Connect. Discover. Inspire. Grow. | December 11, 2026 | Golf Club Wadi Safar", url: "https://wosool.org/events/eo-riyadh-wow-2026", type: "website", images: [{ url: "https://wosool.org/events/wow-2026/hero-golf-sunset.jpg", alt: "Golf-course sunset artwork for EO Riyadh WOW Event" }] },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
