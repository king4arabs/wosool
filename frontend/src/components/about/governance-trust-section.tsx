import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Shield, Scale, Lock } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    title: "Community Guidelines",
    description:
      "Clear, published guidelines that set expectations for behavior, communication, and collaboration. Every member agrees to uphold these standards before joining.",
  },
  {
    icon: Shield,
    title: "Active Moderation",
    description:
      "A dedicated community team ensures conversations remain constructive, inclusive, and valuable. Issues are addressed swiftly and fairly.",
  },
  {
    icon: Scale,
    title: "Accountability",
    description:
      "Members are accountable to each other and to the community. We track engagement quality and address patterns that don't align with our values.",
  },
  {
    icon: Lock,
    title: "Data Privacy Commitment",
    description:
      "Your data is yours. We never sell member data, and our privacy practices exceed industry standards. Confidentiality is built into every feature we build.",
  },
];

export function GovernanceTrustSection() {
  return (
    <Section variant="default">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Governance & Trust
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-6 text-lg leading-relaxed text-secondary">
            Trust is earned, not assumed. Here&apos;s how we maintain the
            quality and integrity of our community.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="border border-muted bg-surface shadow-none"
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5">
                  <pillar.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-secondary">
                  {pillar.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
