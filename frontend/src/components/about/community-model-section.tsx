import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import {
  ClipboardCheck,
  Filter,
  Compass,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Application",
    description:
      "Founders submit a brief application sharing their story, stage, and what they hope to contribute and gain.",
  },
  {
    icon: Filter,
    title: "Curation",
    description:
      "Our review team evaluates every application for alignment with community values, founder stage, and potential contribution.",
  },
  {
    icon: Compass,
    title: "Onboarding",
    description:
      "New members receive a personalized welcome, orientation to the community, and initial introductions to relevant peers.",
  },
  {
    icon: Zap,
    title: "Engagement",
    description:
      "Members participate in peer groups, attend events, access resources, and receive AI-powered introductions to the right founders.",
  },
  {
    icon: TrendingUp,
    title: "Growth",
    description:
      "As members grow, the community grows with them — unlocking new programs, leadership roles, and deeper connections.",
  },
];

export function CommunityModelSection() {
  return (
    <Section variant="muted">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Our Community Model
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-6 text-lg leading-relaxed text-secondary">
            A thoughtful journey from application to lasting impact.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <div className="grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Connector arrow (hidden on mobile, visible on md+) */}
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 z-10 hidden translate-x-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-accent/50" />
                  </div>
                )}

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                  <step.icon className="h-7 w-7" />
                </div>

                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                  Step {index + 1}
                </div>

                <h3 className="mb-2 text-lg font-bold text-primary">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
