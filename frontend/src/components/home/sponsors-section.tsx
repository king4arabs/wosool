import { Trophy } from "lucide-react";
import { Section } from "@/components/layout/section";

interface SponsorTier {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  slots: string[];
}

const sponsorTiers: SponsorTier[] = [
  {
    name: "Platinum",
    color: "text-slate-700",
    bgColor: "bg-gradient-to-br from-slate-100 to-slate-200",
    borderColor: "border-slate-300",
    slots: ["Platinum Sponsor 1", "Platinum Sponsor 2"],
  },
  {
    name: "Gold",
    color: "text-accent",
    bgColor: "bg-gradient-to-br from-accent/5 to-accent/15",
    borderColor: "border-accent/30",
    slots: ["Gold Sponsor 1", "Gold Sponsor 2", "Gold Sponsor 3"],
  },
  {
    name: "Silver",
    color: "text-secondary/70",
    bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
    borderColor: "border-gray-200",
    slots: [
      "Silver Sponsor 1",
      "Silver Sponsor 2",
      "Silver Sponsor 3",
      "Silver Sponsor 4",
    ],
  },
];

export function SponsorsSection() {
  return (
    <Section
      variant="muted"
      title="Sponsors"
      subtitle="Sponsor the future of entrepreneurship. Support the community shaping the next generation of founders."
    >
      <div className="space-y-10">
        {sponsorTiers.map((tier) => (
          <div key={tier.name}>
            <div className="mb-4 flex items-center justify-center gap-2">
              <Trophy className={`h-4 w-4 ${tier.color}`} />
              <h3 className={`text-sm font-bold uppercase tracking-widest ${tier.color}`}>
                {tier.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {tier.slots.map((slot) => (
                <div
                  key={slot}
                  className={`flex h-20 w-48 items-center justify-center rounded-xl border ${tier.borderColor} ${tier.bgColor} text-xs font-medium text-secondary/40 transition-transform hover:scale-105`}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
