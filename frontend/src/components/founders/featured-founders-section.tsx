import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { featuredFounders } from "./data";

export function FeaturedFoundersSection() {
  return (
    <Section
      variant="muted"
      title="Featured Founders"
      subtitle="Meet the standout members leading innovation across the Saudi and GCC startup ecosystem."
    >
      <div className="grid gap-8 lg:grid-cols-3">
        {featuredFounders.map((founder) => (
          <Card
            key={founder.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="items-center text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${founder.avatarColor} text-xl font-bold text-white`}
              >
                {founder.initials}
              </div>
              <CardTitle className="mt-3">{founder.name}</CardTitle>
              <CardDescription>
                {founder.title} at {founder.company}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-center">
              <Badge variant="accent" className="text-sm">
                Score: {founder.founderScore}/100
              </Badge>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">{founder.sector}</Badge>
                <Badge variant="outline">{founder.stage}</Badge>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {founder.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[11px] font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="justify-center">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
