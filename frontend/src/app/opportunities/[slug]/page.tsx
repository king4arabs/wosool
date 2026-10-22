import { OpportunityDirectory } from "@/components/accelerator/OpportunityDirectory";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Opportunity details | تفاصيل الفرصة",
  "Eligibility, application status and official sources for Saudi entrepreneurship opportunities.",
);
export default async function Opportunity({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <OpportunityDirectory slug={slug} />;
}
