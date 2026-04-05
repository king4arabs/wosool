import { Star } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";

interface Founder {
  name: string;
  role: string;
  company: string;
  score: number;
  stage: string;
  sector: string;
  initials: string;
  gradient: string;
}

const founders: Founder[] = [
  {
    name: "Nora Al-Rashid",
    role: "CEO & Co-Founder",
    company: "FinLeap Arabia",
    score: 92,
    stage: "Series A",
    sector: "FinTech",
    initials: "NR",
    gradient: "from-accent/80 to-accent/40",
  },
  {
    name: "Omar Khattab",
    role: "CTO & Founder",
    company: "DataSphere AI",
    score: 88,
    stage: "Seed",
    sector: "AI / ML",
    initials: "OK",
    gradient: "from-secondary/80 to-secondary/40",
  },
  {
    name: "Lina Mansour",
    role: "CEO & Founder",
    company: "GreenRoute Logistics",
    score: 95,
    stage: "Series B",
    sector: "Logistics",
    initials: "LM",
    gradient: "from-primary/80 to-primary/40",
  },
];

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-sm font-bold text-accent">
      <Star className="h-3.5 w-3.5 fill-accent" />
      {score}
    </div>
  );
}

export function FounderScorecardsSection() {
  return (
    <Section
      variant="muted"
      title="Founder Scorecards"
      subtitle="Every founder gets a living scorecard — a dynamic snapshot of credibility, traction, and community engagement."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {founders.map((founder) => (
          <div
            key={founder.name}
            className="group relative overflow-hidden rounded-2xl border border-muted bg-white shadow-sm transition-all hover:shadow-lg"
          >
            {/* Top accent bar */}
            <div className={`h-1.5 bg-gradient-to-r ${founder.gradient}`} />

            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${founder.gradient} text-sm font-bold text-white`}
                  >
                    {founder.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {founder.name}
                    </h3>
                    <p className="text-xs text-secondary/60">{founder.role}</p>
                  </div>
                </div>
                <ScoreBadge score={founder.score} />
              </div>

              <p className="mb-4 text-sm font-medium text-secondary">
                {founder.company}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {founder.stage}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {founder.sector}
                </Badge>
              </div>

              {/* Mini stats */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-muted pt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">12</p>
                  <p className="text-[10px] uppercase tracking-wider text-secondary/50">
                    Connections
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">8</p>
                  <p className="text-[10px] uppercase tracking-wider text-secondary/50">
                    Events
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">3</p>
                  <p className="text-[10px] uppercase tracking-wider text-secondary/50">
                    Programs
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
