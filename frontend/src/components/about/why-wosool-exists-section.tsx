import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, UserX, Puzzle } from "lucide-react";

const problems = [
  {
    icon: UserX,
    title: "Founder Isolation",
    description:
      "Building a startup is one of the most isolating experiences in business. Founders carry immense pressure — from fundraising to hiring to product-market fit — often with no one who truly understands what they're going through.",
  },
  {
    icon: AlertTriangle,
    title: "Lack of Trusted Peers",
    description:
      "Founders need candid, confidential conversations with people who have no agenda — not investors protecting portfolio interests, not consultants selling services, but peers who genuinely want to help each other succeed.",
  },
  {
    icon: Puzzle,
    title: "Beyond Accelerators",
    description:
      "Accelerator programs end. Advisory boards meet quarterly. Founders need structured, ongoing support that grows with them — from pre-seed through scale-up and beyond, adapting to the challenges of each stage.",
  },
];

export function WhyWosoolExistsSection() {
  return (
    <Section variant="muted">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Why Wosool Exists
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-6 text-lg leading-relaxed text-secondary">
            The startup ecosystem is thriving, but founders still face
            fundamental gaps that hold them back.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {problems.map((problem) => (
            <Card
              key={problem.title}
              className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <problem.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl text-primary">
                  {problem.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-secondary">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
