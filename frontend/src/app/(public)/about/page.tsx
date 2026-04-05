import type { Metadata } from "next";
import {
  HeroSection,
  WhoWeAreSection,
  WhyWosoolExistsSection,
  VisionMissionSection,
  DifferentiatorsSection,
  FounderPrinciplesSection,
  CommunityModelSection,
  GovernanceTrustSection,
  LeadershipSection,
} from "@/components/about";

export const metadata: Metadata = {
  title: "About — Wosool",
  description:
    "Learn about Wosool, a curated founder network where founders support founders across the Saudi and GCC ecosystem.",
};

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <WhoWeAreSection />
      <WhyWosoolExistsSection />
      <VisionMissionSection />
      <DifferentiatorsSection />
      <FounderPrinciplesSection />
      <CommunityModelSection />
      <GovernanceTrustSection />
      <LeadershipSection />
    </>
  );
}
