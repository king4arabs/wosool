import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { newMembers } from "./data";

export function NewMemberSpotlightsSection() {
  const spotlights = newMembers.slice(0, 3);

  return (
    <Section
      title="New Member Spotlights"
      subtitle="Welcome the newest founders to join the Wosool community."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {spotlights.map((member) => (
          <Card
            key={member.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${member.avatarColor} text-sm font-bold text-white`}
              >
                {member.initials}
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm font-semibold text-primary">
                  {member.name}
                </p>
                <p className="truncate text-xs text-secondary/70">
                  {member.title} · {member.company}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="success" className="text-[11px]">
                    Recently Joined
                  </Badge>
                  <Badge variant="secondary" className="text-[11px]">
                    {member.sector}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
