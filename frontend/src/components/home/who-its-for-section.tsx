import { Rocket, TrendingUp, Zap, Globe } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface Persona {
  icon: LucideIcon;
  title: string;
  badge: string;
  description: string;
  highlights: string[];
}

const personas: Persona[] = [
  {
    icon: Rocket,
    title: "Early-Stage Founders",
    badge: "Pre-Seed to Seed",
    description:
      "Find your first co-founder, validate faster, and connect with founders who've been exactly where you are.",
    highlights: ["Co-founder matching", "Pitch feedback", "First-hire network"],
  },
  {
    icon: TrendingUp,
    title: "Growth Founders",
    badge: "Series A+",
    description:
      "Scale with confidence through peer advisory circles, operator playbooks, and warm investor introductions.",
    highlights: ["Peer advisory", "Investor intros", "Operator playbooks"],
  },
  {
    icon: Zap,
    title: "Technical Founders",
    badge: "CTO / Tech Lead",
    description:
      "Deep-dive into architecture decisions, hiring strategies, and technical due diligence with fellow builders.",
    highlights: ["Tech circles", "Architecture reviews", "Hiring support"],
  },
  {
    icon: Globe,
    title: "Saudi & GCC Founders",
    badge: "Regional Focus",
    description:
      "Navigate the unique opportunities of the MENA ecosystem with founders who understand the landscape.",
    highlights: ["Regional insights", "Gov't access", "Cross-border deals"],
  },
];

export function WhoItsForSection() {
  return (
    <Section
      variant="muted"
      title="Who It's For"
      subtitle="Whether you're launching your first venture or scaling your third, Wosool adapts to where you are in your journey."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {personas.map((persona) => {
          const Icon = persona.icon;
          return (
            <div
              key={persona.title}
              className="group rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-all hover:border-accent/20 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Icon className="h-6 w-6" />
              </div>
              <Badge variant="accent" className="mb-3">
                {persona.badge}
              </Badge>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                {persona.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-secondary/70">
                {persona.description}
              </p>
              <ul className="space-y-1.5">
                {persona.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-xs text-secondary/60"
                  >
                    <div className="h-1 w-1 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
