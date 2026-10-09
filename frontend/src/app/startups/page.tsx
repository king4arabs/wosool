import { PublicLayout } from '@/components/layout/PublicLayout'
import { StartupDirectory } from '@/components/sections/StartupDirectory'
import { pageMetadata } from '@/lib/seo'
export const metadata = pageMetadata('Business & founder directory | دليل الشركات والمؤسسين', 'Discover businesses with websites, published revenue evidence and founder profiles from Saudi Arabia, the GCC, MENA and global markets.')
export default function Startups() {
  return <PublicLayout><div className="bg-slate-50"><StartupDirectory /></div></PublicLayout>
}
