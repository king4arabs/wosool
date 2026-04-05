import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary py-24 sm:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-accent/5 blur-2xl" />
      </div>

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 text-accent">
            <Heart className="h-5 w-5 fill-accent" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Join a Community{" "}
            <span className="text-accent">That Gets It?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Stop building in isolation. Join 500+ founders who support each
            other with honest feedback, warm introductions, and the kind of
            knowledge that only comes from lived experience.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="accent"
              size="lg"
              className="min-w-[220px] text-base font-semibold"
            >
              Apply to Join Wosool
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
          </div>

          <p className="mt-6 text-sm text-white/40">
            Applications are reviewed weekly. Typical response within 48 hours.
          </p>
        </div>
      </Container>
    </section>
  );
}
