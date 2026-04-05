import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

export function BookDiscussionSection() {
  return (
    <section className="bg-primary py-16 sm:py-20 lg:py-24">
      <Container className="text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CalendarDays className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Book a Discussion
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            Schedule office hours with fellow founders, mentors, and industry
            experts. Share challenges, exchange ideas, and move faster together.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="accent" size="lg">
              Browse Available Times
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
