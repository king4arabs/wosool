import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { featuredCompanies } from "./data";

export function FeaturedCompaniesSection() {
  return (
    <Section
      variant="muted"
      title="Featured Companies"
      subtitle="Standout companies from our portfolio that are leading innovation in their sectors."
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {featuredCompanies.map((company) => (
          <Card
            key={company.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
                  style={{ backgroundColor: company.brandColor }}
                >
                  {company.initial}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {company.sector}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {company.stage}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-secondary/70">
                Founded by{" "}
                <span className="font-medium text-secondary">
                  {company.founderName}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-secondary">
                {company.description}
              </p>
              {company.keyMetric && (
                <Badge variant="accent">{company.keyMetric}</Badge>
              )}
              <div className="flex flex-wrap gap-1.5">
                {company.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Company
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
