import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Users } from "lucide-react";

export function WhoWeAreSection() {
  return (
    <Section variant="default">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Users className="h-7 w-7 text-accent" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Who We Are
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-6 text-center">
          <p className="text-lg leading-relaxed text-secondary">
            Wosool is a curated founder network born from a simple but powerful
            belief: the best startup advice doesn&apos;t come from textbooks,
            keynotes, or even investors — it comes from other founders who have
            walked the same path, faced the same obstacles, and made the same
            difficult decisions.
          </p>
          <p className="text-lg leading-relaxed text-secondary">
            We are a community of builders, operators, and visionaries across
            the Saudi and GCC ecosystem. Every member has been carefully
            selected — not for the size of their funding round, but for the
            depth of their commitment to building something meaningful and their
            willingness to help others do the same.
          </p>
          <p className="text-lg leading-relaxed text-secondary">
            At Wosool, we believe that entrepreneurship doesn&apos;t have to be
            lonely. When founders support founders — openly, honestly, and
            consistently — extraordinary companies emerge.
          </p>
        </div>
      </Container>
    </Section>
  );
}
