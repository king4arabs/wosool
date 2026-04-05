import { Users, Rocket, Target, Shield } from "lucide-react";
import { Section } from "@/components/layout/section";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const valueProps: ValueProp[] = [
  {
    icon: Users,
    title: "Curated Community",
    description:
      "Every member is vetted. No noise, no spam — just ambitious founders who share knowledge, deals, and honest feedback.",
  },
  {
    icon: Rocket,
    title: "Structured Programs",
    description:
      "From founder circles to growth sprints, our programs are designed to move the needle on your most pressing challenges.",
  },
  {
    icon: Target,
    title: "Intelligent Matching",
    description:
      "Our AI-powered matching engine connects you with the right co-founders, mentors, and investors based on stage, sector, and goals.",
  },
  {
    icon: Shield,
    title: "Trusted Network",
    description:
      "Built on trust and reciprocity. Every introduction is warm, every connection is meaningful, and every interaction is confidential.",
  },
];

export function WhyWosoolSection() {
  return (
    <Section
      title="Why Wosool"
      subtitle="We built the community we wished existed when we started — one that treats founders as peers, not deal flow."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((prop) => {
          const Icon = prop.icon;
          return (
            <Card
              key={prop.title}
              className="group relative overflow-hidden border-transparent bg-white shadow-md hover:shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{prop.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {prop.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
