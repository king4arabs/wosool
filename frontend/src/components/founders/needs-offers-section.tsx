import { Section } from "@/components/layout/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Code,
  DollarSign,
  Megaphone,
  Users,
  BookOpen,
  Lightbulb,
  Handshake,
  GraduationCap,
  Globe,
  Rocket,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NeedOrOffer {
  icon: LucideIcon;
  label: string;
  description: string;
}

const founderNeeds: NeedOrOffer[] = [
  {
    icon: Code,
    label: "Technical Co-founders",
    description:
      "Engineers and CTOs ready to build alongside a business-focused founder.",
  },
  {
    icon: DollarSign,
    label: "Seed Funding",
    description:
      "Early-stage capital to validate ideas and reach product-market fit.",
  },
  {
    icon: Megaphone,
    label: "Marketing Expertise",
    description:
      "Growth strategists who understand the Saudi and GCC consumer landscape.",
  },
  {
    icon: Users,
    label: "Talent Acquisition",
    description:
      "Access to top engineering, design, and operations talent in the region.",
  },
  {
    icon: BookOpen,
    label: "Mentorship",
    description:
      "Guidance from experienced founders who have scaled companies regionally.",
  },
  {
    icon: Briefcase,
    label: "Strategic Partners",
    description:
      "Corporate and government partners to unlock distribution and credibility.",
  },
];

const founderOffers: NeedOrOffer[] = [
  {
    icon: Lightbulb,
    label: "Industry Expertise",
    description:
      "Deep domain knowledge across FinTech, HealthTech, PropTech, and more.",
  },
  {
    icon: Handshake,
    label: "Strategic Partnerships",
    description:
      "Introductions and co-development opportunities with key stakeholders.",
  },
  {
    icon: GraduationCap,
    label: "Mentorship",
    description:
      "One-on-one coaching and peer group facilitation for early-stage founders.",
  },
  {
    icon: Globe,
    label: "Market Access",
    description:
      "Connections to customers, regulators, and distribution channels in new markets.",
  },
  {
    icon: Rocket,
    label: "Operational Support",
    description:
      "Hands-on help with hiring, legal, finance, and go-to-market execution.",
  },
  {
    icon: Shield,
    label: "Governance Guidance",
    description:
      "Board structuring, cap table management, and investor relations advice.",
  },
];

function ItemList({ items }: { items: NeedOrOffer[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
            <item.icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{item.label}</p>
            <p className="text-sm leading-relaxed text-secondary/70">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NeedsOffersSection() {
  return (
    <Section
      title="Founder Needs & Offers"
      subtitle="Discover what members are looking for and what they bring to the table."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">What Founders Need</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemList items={founderNeeds} />
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">What Founders Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemList items={founderOffers} />
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
