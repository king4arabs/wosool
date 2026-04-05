import { Section } from "@/components/layout/section";

interface Partner {
  name: string;
  color: string;
}

interface PartnerCategory {
  label: string;
  partners: Partner[];
}

const partnerCategories: PartnerCategory[] = [
  {
    label: "Strategic",
    partners: [
      { name: "Vision Ventures", color: "bg-primary text-white" },
      { name: "Gulf Capital", color: "bg-secondary text-white" },
      { name: "STC Ventures", color: "bg-accent text-primary" },
    ],
  },
  {
    label: "Ecosystem",
    partners: [
      { name: "KAUST Innovation", color: "bg-blue-700 text-white" },
      { name: "Monsha'at", color: "bg-green-700 text-white" },
      { name: "Hub71", color: "bg-slate-700 text-white" },
    ],
  },
  {
    label: "Knowledge",
    partners: [
      { name: "McKinsey", color: "bg-primary text-white" },
      { name: "BCG Digital", color: "bg-emerald-700 text-white" },
      { name: "Bain & Co", color: "bg-red-700 text-white" },
    ],
  },
  {
    label: "Community",
    partners: [
      { name: "Endeavor", color: "bg-orange-600 text-white" },
      { name: "YPO Arabia", color: "bg-indigo-700 text-white" },
      { name: "EO MENA", color: "bg-yellow-600 text-white" },
    ],
  },
];

export function PartnersSection() {
  return (
    <Section
      title="Partners & Supporters"
      subtitle="We're proud to work with organizations that share our commitment to founder success."
    >
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {partnerCategories.map((category) => (
          <div key={category.label}>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-secondary/50">
              {category.label}
            </h3>
            <div className="space-y-3">
              {category.partners.map((partner) => (
                <div
                  key={partner.name}
                  className={`flex h-14 items-center justify-center rounded-xl ${partner.color} text-sm font-semibold shadow-sm transition-transform hover:scale-105`}
                >
                  {partner.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
