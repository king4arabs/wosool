import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import { Eye, Target } from "lucide-react";

export function VisionMissionSection() {
  return (
    <Section variant="default">
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Vision */}
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 lg:mx-0">
                <Eye className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-primary">
                Our Vision
              </h2>
              <Separator className="mx-auto my-4 w-12 bg-accent lg:mx-0" />
              <p className="text-lg leading-relaxed text-secondary">
                To become the most trusted founder community in the MENA region,
                where every founder has access to the support, connections, and
                tools they need to build world-class companies.
              </p>
            </div>

            {/* Mission */}
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 lg:mx-0">
                <Target className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-primary">
                Our Mission
              </h2>
              <Separator className="mx-auto my-4 w-12 bg-accent lg:mx-0" />
              <p className="text-lg leading-relaxed text-secondary">
                To connect founders with founders through curated community,
                structured programs, intelligent matching, and shared
                resources — enabling every entrepreneur in the Saudi and GCC
                ecosystem to build, grow, and scale with confidence.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
