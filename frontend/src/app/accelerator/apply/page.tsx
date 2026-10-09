import { ApplicationWorkspace } from "@/components/accelerator/ApplicationWorkspace";
export const metadata = {
  title: "My Accelerator Application | طلب المسرّعة",
  robots: { index: false, follow: false },
};
export default function ApplicationPage() {
  return <ApplicationWorkspace />;
}
