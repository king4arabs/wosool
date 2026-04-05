import type { Metadata } from "next";
import {
  HeroSection,
  FeaturedCompaniesSection,
  RisingCompaniesSection,
  RecentlyUpdatedSection,
  CollaborationSection,
  HiringSection,
  FundraisingSection,
  SectorExplorerSection,
} from "@/components/companies";

export const metadata: Metadata = {
  title: "Companies — Wosool",
  description:
    "Explore innovative companies built by Wosool founders across the Saudi and GCC ecosystem.",
};

export default function CompaniesPage() {
  return (
    <>
      <HeroSection />
      <FeaturedCompaniesSection />
      <RisingCompaniesSection />
      <RecentlyUpdatedSection />
      <CollaborationSection />
      <HiringSection />
      <FundraisingSection />
      <SectorExplorerSection />
    </>
  );
}
