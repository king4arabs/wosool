import { ReviewWorkspace } from "@/components/accelerator/ReviewWorkspace";
import { PublicLayout } from "@/components/layout/PublicLayout";
export const metadata = {
  title: "Application review",
  robots: { index: false, follow: false },
};
export default function Review() {
  return (
    <PublicLayout>
      <section className="gateway-section">
        <ReviewWorkspace />
      </section>
    </PublicLayout>
  );
}
