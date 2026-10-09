import { PublicProfile } from "@/components/sections/PublicProfile"
import { pageMetadata } from "@/lib/seo"
export const metadata = pageMetadata("ملف الشركة | Company profile", "تعرّف على الشركة ومؤسسيها وفرص التعاون في مجتمع وصول.")
export default function CompanyProfilePage() { return <PublicProfile kind="company" /> }
