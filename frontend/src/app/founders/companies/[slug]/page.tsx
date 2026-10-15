import { PublicProfile } from "@/components/sections/PublicProfile"
import { publicProfileMetadata } from "@/lib/profile-metadata"
import { env } from "@/lib/env"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return publicProfileMetadata("company", (await params).slug, env.apiUrl)
}

export default function CompanyProfilePage() { return <PublicProfile kind="company" /> }
