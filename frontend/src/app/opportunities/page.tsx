import { OpportunityDirectory } from "@/components/accelerator/OpportunityDirectory";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Saudi entrepreneurship opportunities | فرص ريادة الأعمال",
  "Explore verified organizations, programs and opportunities in Saudi Arabia with official sources. اكتشف برامج وفرص ريادة الأعمال بمصادرها الرسمية.",
);
export default function Opportunities() {
  return <OpportunityDirectory />;
}
