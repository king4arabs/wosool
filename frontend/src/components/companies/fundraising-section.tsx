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
import { fundraisingCompanies } from "./data";

export function FundraisingSection() {
  return (
    <Section
      title="Fundraising Companies"
      subtitle="Companies in active fundraise — connect if you're an investor or strategic partner."
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {fundraisingCompanies.map((company) => (
          <Card
            key={company.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                  style={{ backgroundColor: company.brandColor }}
                >
                  {company.initial}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="accent" className="text-xs">
                      {company.fundingRound}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {company.sector}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-semibold text-primary">
                {company.fundingTarget} Target
              </p>
              <p className="text-xs text-secondary/70">
                Founded by{" "}
                <span className="font-medium text-secondary">
                  {company.founderName}
                </span>
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
