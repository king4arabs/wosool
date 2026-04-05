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
import { Handshake } from "lucide-react";
import { collaborationCompanies } from "./data";

export function CollaborationSection() {
  return (
    <Section
      title="Open for Collaboration"
      subtitle="Companies actively seeking partners, integrations, and co-building opportunities."
    >
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {collaborationCompanies.map((company) => (
          <Card
            key={company.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: company.brandColor }}
                >
                  {company.initial}
                </div>
                <CardTitle className="text-base">{company.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary" className="text-xs">
                {company.sector}
              </Badge>
              <p className="text-sm leading-relaxed text-secondary/70">
                {company.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                <Handshake className="h-3.5 w-3.5" />
                Connect
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
