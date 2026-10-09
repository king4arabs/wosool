import { PublicProfile } from "@/components/sections/PublicProfile"
import { pageMetadata } from "@/lib/seo"
export const metadata = pageMetadata("ملف المؤسس | Founder profile", "اكتشف خبرات المؤسس وشركاته وفرص التواصل في مجتمع وصول.")
export default function FounderProfilePage() { return <PublicProfile kind="founder" /> }
