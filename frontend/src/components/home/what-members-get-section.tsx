import {
  Award,
  Handshake,
  Calendar,
  Rocket,
  Building2,
  Sparkles,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import type { LucideIcon } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Award,
    title: "Founder Profile & Scorecard",
    description:
      "A dynamic profile that showcases your journey, traction, and reputation within the community.",
  },
  {
    icon: Handshake,
    title: "Warm Introductions",
    description:
      "Skip the cold outreach. Get introduced to investors, partners, and talent through trusted connections.",
  },
  {
    icon: Calendar,
    title: "Curated Events",
    description:
      "Intimate dinners, fireside chats, and workshops designed for meaningful conversations — not networking theatre.",
  },
  {
    icon: Rocket,
    title: "Growth Programs",
    description:
      "Structured cohort-based programs tackling fundraising, GTM strategy, hiring, and product-market fit.",
  },
  {
    icon: Building2,
    title: "Partner Access",
    description:
      "Exclusive perks and credits from top SaaS, cloud, and service providers — negotiated collectively.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "Our matching engine surfaces the right people at the right time based on your needs, stage, and goals.",
  },
];

export function WhatMembersGetSection() {
  return (
    <Section
      title="What Members Get"
      subtitle="Membership is more than a badge — it's a toolkit for building with unfair advantages."
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="group flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 text-accent transition-colors group-hover:from-accent/30 group-hover:to-accent/10">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-primary">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-secondary/70">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
