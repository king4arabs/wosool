import { Landing } from "@/components/accelerator/Landing";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "EO Riyadh Accelerator | مسرّعة EO الرياض",
  "Discover eligibility, learning and the local EO Accelerator application journey through Wosool. اكتشف مسارك للنمو مع وصول.",
);
export default function AcceleratorPage() {
  return <Landing />;
}
