import { Building2, TrendingUp } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";

interface Company {
  name: string;
  sector: string;
  stage: string;
  description: string;
  color: string;
}

const companies: Company[] = [
  {
    name: "FinLeap Arabia",
    sector: "FinTech",
    stage: "Series A",
    description:
      "Building the infrastructure for embedded finance across the GCC, enabling any platform to offer financial services.",
    color: "bg-accent/10 text-accent",
  },
  {
    name: "DataSphere AI",
    sector: "AI / ML",
    stage: "Seed",
    description:
      "Enterprise-grade Arabic NLP platform powering intelligent automation for government and financial institutions.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    name: "GreenRoute Logistics",
    sector: "Logistics",
    stage: "Series B",
    description:
      "Sustainable last-mile delivery network optimizing routes with AI to reduce carbon footprint by 40%.",
    color: "bg-green-100 text-green-700",
  },
  {
    name: "MedBridge Health",
    sector: "HealthTech",
    stage: "Series A",
    description:
      "Telemedicine platform connecting patients in remote MENA regions with specialized healthcare professionals.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "PropelX Education",
    sector: "EdTech",
    stage: "Pre-Seed",
    description:
      "Gamified micro-learning platform preparing Saudi youth for the future economy with skills-based credentials.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Souq Cloud",
    sector: "SaaS",
    stage: "Seed",
    description:
      "All-in-one commerce operating system for SMBs in the Arab world — inventory, payments, and analytics unified.",
    color: "bg-orange-100 text-orange-700",
  },
];

export function FoundersCompaniesSection() {
  return (
    <Section
      title="Founders' Companies"
      subtitle="A glimpse into the ventures our members are building — across sectors, stages, and ambitions."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div
            key={company.name}
            className="group rounded-2xl border border-muted bg-white p-6 transition-all hover:border-accent/20 hover:shadow-md"
          >
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${company.color}`}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">{company.name}</h3>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="accent" className="text-xs">
                {company.sector}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                {company.stage}
              </Badge>
            </div>

            <p className="text-sm leading-relaxed text-secondary/70">
              {company.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
