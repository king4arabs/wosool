import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Handshake,
  ShieldCheck,
  CalendarCog,
  Brain,
  MapPin,
  Heart,
} from "lucide-react";

const differentiators = [
  {
    icon: Handshake,
    title: "Founder-Led, Not Investor-Led",
    description:
      "Our community is built by founders, for founders. Conversations are candid, peer-driven, and free from investment agendas. Every voice carries equal weight.",
    badge: "Core",
  },
  {
    icon: ShieldCheck,
    title: "Curated, Not Open",
    description:
      "Every member goes through a thoughtful application and review process. This ensures quality conversations, genuine trust, and meaningful connections.",
    badge: "Core",
  },
  {
    icon: CalendarCog,
    title: "Structured Programs",
    description:
      "Beyond networking, we offer structured peer groups, masterclasses, mentorship circles, and accountability partnerships designed to drive real outcomes.",
    badge: "Programs",
  },
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "Our intelligent matching engine connects founders based on stage, sector, challenges, and goals — ensuring every interaction is relevant and valuable.",
    badge: "Technology",
  },
  {
    icon: MapPin,
    title: "Saudi & GCC Focused",
    description:
      "Purpose-built for the unique opportunities and dynamics of the Saudi and GCC startup ecosystem, with deep understanding of local markets and culture.",
    badge: "Regional",
  },
  {
    icon: Heart,
    title: "Trust-First Approach",
    description:
      "Trust is our foundation. From community guidelines to data privacy, everything we do is designed to create a safe space where founders can be open and vulnerable.",
    badge: "Values",
  },
];

export function DifferentiatorsSection() {
  return (
    <Section variant="muted">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            What Makes Wosool Different
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-6 text-lg leading-relaxed text-secondary">
            We&apos;re not another networking group. Here&apos;s what sets us
            apart.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((item) => (
            <Card
              key={item.title}
              className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg text-primary">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-secondary">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
