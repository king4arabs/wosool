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
import { Briefcase } from "lucide-react";
import { hiringCompanies } from "./data";

export function HiringSection() {
  return (
    <Section
      variant="muted"
      title="Hiring Companies"
      subtitle="Companies actively building their teams — explore open roles across the portfolio."
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        {hiringCompanies.map((company) => (
          <Card
            key={company.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                    style={{ backgroundColor: company.brandColor }}
                  >
                    {company.initial}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="mt-1.5 text-xs"
                    >
                      {company.sector}
                    </Badge>
                  </div>
                </div>
                <Badge variant="accent" className="gap-1 text-xs">
                  <Briefcase className="h-3 w-3" />
                  {company.hiringRoles} Open Roles
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-secondary/70">
                Founded by{" "}
                <span className="font-medium text-secondary">
                  {company.founderName}
                </span>
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Openings
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
