import { Section } from "@/components/layout/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Target,
  Network,
  Zap,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { scoreMetrics } from "./data";

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Users,
  Target,
  Network,
  Zap,
  Activity,
};

export function FounderScoreSection() {
  return (
    <Section
      variant="muted"
      title="The Wosool Founder Score"
      subtitle="A holistic scorecard that measures founder readiness across six key dimensions."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scoreMetrics.map((metric) => {
          const Icon = iconMap[metric.icon] ?? Activity;
          return (
            <Card
              key={metric.name}
              className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="mt-3 text-lg">{metric.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-secondary">
                  {metric.description}
                </p>
                <div className="mt-4 h-1 w-full rounded-full bg-muted">
                  <div className="h-1 w-2/3 rounded-full bg-accent" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
