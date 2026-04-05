import { HeroSection } from "@/components/home/hero-section";
import { WhyWosoolSection } from "@/components/home/why-wosool-section";
import { WhoItsForSection } from "@/components/home/who-its-for-section";
import { WhatMembersGetSection } from "@/components/home/what-members-get-section";
import { FounderScorecardsSection } from "@/components/home/founder-scorecards-section";
import { FoundersCompaniesSection } from "@/components/home/founders-companies-section";
import { CalendarEventsSection } from "@/components/home/calendar-events-section";
import { PartnersSection } from "@/components/home/partners-section";
import { SponsorsSection } from "@/components/home/sponsors-section";
import { NewsInsightsSection } from "@/components/home/news-insights-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyWosoolSection />
      <WhoItsForSection />
      <WhatMembersGetSection />
      <FounderScorecardsSection />
      <FoundersCompaniesSection />
      <CalendarEventsSection />
      <PartnersSection />
      <SponsorsSection />
      <NewsInsightsSection />
      <FinalCtaSection />
    </>
  );
}
