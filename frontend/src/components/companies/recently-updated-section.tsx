import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { recentlyUpdatedCompanies } from "./data";

export function RecentlyUpdatedSection() {
  return (
    <Section
      variant="muted"
      title="Recently Updated"
      subtitle="Companies with the latest milestones, launches, and progress updates."
    >
      <div className="mx-auto max-w-4xl space-y-4">
        {recentlyUpdatedCompanies.map((company) => (
          <Card
            key={company.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: company.brandColor }}
                >
                  {company.initial}
                </div>
                <div>
                  <p className="font-semibold text-primary">{company.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {company.sector}
                    </Badge>
                    {company.updateNote && (
                      <span className="text-sm text-secondary/70">
                        {company.updateNote}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {company.lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-secondary/60">
                  <Clock className="h-3.5 w-3.5" />
                  {company.lastUpdated}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
