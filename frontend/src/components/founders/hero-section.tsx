import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 sm:py-32 lg:py-40">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-accent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-secondary blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent blur-3xl" />
      </div>

      <Container className="relative text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Our Community
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Our Founders
        </h1>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-accent" />
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
          A curated community of visionary entrepreneurs building the future of
          Saudi Arabia and the GCC region
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="accent" size="lg">
            Explore Founders
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Apply to Join
          </Button>
        </div>
      </Container>
    </section>
  );
}
