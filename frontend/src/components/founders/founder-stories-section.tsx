import { Section } from "@/components/layout/section";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { founderStories } from "./data";

export function FounderStoriesSection() {
  return (
    <Section
      variant="dark"
      title="Founder Stories"
      subtitle="Hear from members on how Wosool has shaped their entrepreneurial journey."
    >
      <div className="grid gap-8 md:grid-cols-3">
        {founderStories.map((story) => (
          <Card
            key={story.id}
            className="border-none bg-white/10 shadow-none"
          >
            <CardContent className="p-6">
              <Quote className="mb-4 h-8 w-8 text-accent" />
              <blockquote className="text-sm leading-relaxed text-white/80">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${story.avatarColor} text-sm font-bold text-white`}
                >
                  {story.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {story.founderName}
                  </p>
                  <p className="text-xs text-white/60">{story.company}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
