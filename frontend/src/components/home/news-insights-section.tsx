import { ArrowRight, BookOpen } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NewsItem {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  categoryVariant: "default" | "accent" | "secondary";
}

const newsItems: NewsItem[] = [
  {
    title: "How Wosool Founders Raised $120M in 2024",
    excerpt:
      "A look at how community-driven introductions and peer support helped our members close their biggest rounds yet.",
    date: "Jan 28, 2025",
    category: "Community",
    categoryVariant: "accent",
  },
  {
    title: "The Saudi Startup Ecosystem: 2025 Outlook",
    excerpt:
      "Key trends, opportunities, and challenges shaping the Kingdom's rapidly evolving entrepreneurial landscape.",
    date: "Jan 15, 2025",
    category: "Insights",
    categoryVariant: "secondary",
  },
  {
    title: "Launching Founder Circles: Peer Advisory for Growth",
    excerpt:
      "Introducing our new structured peer advisory program — small groups, big impact, and radical candor.",
    date: "Jan 5, 2025",
    category: "Programs",
    categoryVariant: "default",
  },
];

export function NewsInsightsSection() {
  return (
    <Section
      title="News & Insights"
      subtitle="Stories, analysis, and updates from the Wosool community and the broader founder ecosystem."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {newsItems.map((item) => (
          <div
            key={item.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-muted bg-white transition-all hover:shadow-md"
          >
            {/* Image placeholder */}
            <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
              <BookOpen className="h-10 w-10 text-secondary/20" />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-3 flex items-center gap-3">
                <Badge variant={item.categoryVariant} className="text-[10px]">
                  {item.category}
                </Badge>
                <span className="text-xs text-secondary/50">{item.date}</span>
              </div>

              <h3 className="mb-2 text-base font-semibold leading-snug text-primary group-hover:text-accent transition-colors">
                {item.title}
              </h3>

              <p className="mb-4 flex-1 text-sm leading-relaxed text-secondary/70">
                {item.excerpt}
              </p>

              <Button
                variant="link"
                className="w-fit p-0 text-xs font-semibold text-accent"
              >
                Read More
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
