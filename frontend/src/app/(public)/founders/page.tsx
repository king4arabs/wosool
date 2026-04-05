import type { Metadata } from "next";
import {
  HeroSection,
  FeaturedFoundersSection,
  FounderDirectorySection,
  FounderStoriesSection,
  NewMemberSpotlightsSection,
  FounderScoreSection,
  NeedsOffersSection,
  BookDiscussionSection,
} from "@/components/founders";

export const metadata: Metadata = {
  title: "Founders — Wosool",
  description:
    "Discover our curated community of founders building the future of Saudi Arabia and the GCC region.",
};

export default function FoundersPage() {
  return (
    <>
      <HeroSection />
      <FeaturedFoundersSection />
      <FounderDirectorySection />
      <FounderStoriesSection />
      <NewMemberSpotlightsSection />
      <FounderScoreSection />
      <NeedsOffersSection />
      <BookDiscussionSection />
    </>
  );
}
