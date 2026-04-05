import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-60 w-60 rounded-full bg-accent/5 blur-2xl" />
        <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <Container className="relative z-10 py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" />
            By Invitation Only — Applications Open
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Founders Helping Founders{" "}
            <span className="text-accent">Build Faster</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
            Wosool is the premier founder community connecting ambitious
            entrepreneurs with curated peers, structured programs, and
            intelligent matching — so you never build alone.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="accent" size="lg" className="min-w-[200px] text-base font-semibold">
              Apply to Join
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] border-white/30 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              Explore the Community
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-white/50">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">500+</span>
              <span>Active Founders</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">50+</span>
              <span>Companies</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-white">$2B+</span>
              <span>Capital Raised</span>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
