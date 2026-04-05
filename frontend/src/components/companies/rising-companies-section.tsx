import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { risingCompanies } from "./data";

export function RisingCompaniesSection() {
  return (
    <Section
      title="Rising Companies"
      subtitle="Early-stage companies gaining momentum and making waves in the ecosystem."
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {risingCompanies.map((company) => (
          <Card
            key={company.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: company.brandColor }}
                  >
                    {company.initial}
                  </div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                </div>
                <Badge variant="success" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {company.sector}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {company.stage}
                </Badge>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
