import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";

type ApprovalStatus = "Confirmed" | "Prospective" | "Placeholder";

interface LeaderSlot {
  initials: string;
  bgColor: string;
  name: string;
  title: string;
  quote: string | null;
  sourceUrl: string | null;
  status: ApprovalStatus;
}

const statusVariant: Record<ApprovalStatus, "success" | "warning" | "secondary"> = {
  Confirmed: "success",
  Prospective: "warning",
  Placeholder: "secondary",
};

/**
 * CMS-ready placeholder data.
 * Replace with real data once confirmed and approved.
 * NEVER fabricate real quotes or imply endorsement.
 */
const leaderSlots: LeaderSlot[] = [
  {
    initials: "AA",
    bgColor: "bg-primary",
    name: "[Name Pending Approval]",
    title: "[Title — e.g., CEO, Venture Studio]",
    quote: null,
    sourceUrl: null,
    status: "Placeholder",
  },
  {
    initials: "SB",
    bgColor: "bg-secondary",
    name: "[Name Pending Approval]",
    title: "[Title — e.g., Managing Partner, VC Fund]",
    quote: null,
    sourceUrl: null,
    status: "Placeholder",
  },
  {
    initials: "MK",
    bgColor: "bg-accent",
    name: "[Name Pending Approval]",
    title: "[Title — e.g., Founder & CTO, Tech Company]",
    quote: null,
    sourceUrl: null,
    status: "Placeholder",
  },
  {
    initials: "NR",
    bgColor: "bg-primary",
    name: "[Name Pending Approval]",
    title: "[Title — e.g., Ecosystem Lead, Government Entity]",
    quote: null,
    sourceUrl: null,
    status: "Placeholder",
  },
  {
    initials: "HT",
    bgColor: "bg-secondary",
    name: "[Name Pending Approval]",
    title: "[Title — e.g., Serial Entrepreneur]",
    quote: null,
    sourceUrl: null,
    status: "Placeholder",
  },
  {
    initials: "LW",
    bgColor: "bg-accent",
    name: "[Name Pending Approval]",
    title: "[Title — e.g., Director, Innovation Hub]",
    quote: null,
    sourceUrl: null,
    status: "Placeholder",
  },
];

export function LeadershipSection() {
  return (
    <Section variant="muted">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Saudi Innovation Leadership
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-6 text-lg leading-relaxed text-secondary">
            Wosool is guided by leaders across the Saudi and GCC innovation
            ecosystem. This section will feature confirmed advisors and
            supporters once approvals are finalized.
          </p>
          <p className="mt-3 text-sm italic text-secondary/60">
            All names, titles, and quotes below are placeholders and do not
            represent any real individual or endorsement.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leaderSlots.map((slot, index) => (
            <Card
              key={index}
              className="border border-dashed border-muted bg-white/60 shadow-none"
            >
              <CardHeader className="items-center pb-2">
                {/* Colored circle with initials as image placeholder */}
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full ${slot.bgColor} text-2xl font-bold text-white`}
                >
                  {slot.initials}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-primary">
                  {slot.name}
                </h3>
                <p className="text-sm text-secondary/70">{slot.title}</p>
                <Badge variant={statusVariant[slot.status]} className="mt-2 text-xs">
                  {slot.status}
                </Badge>
              </CardHeader>

              <CardContent className="text-center">
                <Separator className="mb-4" />

                {slot.quote ? (
                  <blockquote className="text-sm italic leading-relaxed text-secondary">
                    &ldquo;{slot.quote}&rdquo;
                  </blockquote>
                ) : (
                  <p className="text-sm italic text-secondary/40">
                    [Quote placeholder — pending approval]
                  </p>
                )}

                {slot.sourceUrl ? (
                  <a
                    href={slot.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    View Source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-secondary/30">
                    [Source link placeholder]
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
