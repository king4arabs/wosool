import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

const principles = [
  {
    title: "Transparency",
    description:
      "We operate with radical openness. Our processes, decisions, and community guidelines are visible to all members. No hidden agendas, no backroom deals.",
  },
  {
    title: "Mutual Support",
    description:
      "Every member commits to giving as much as they take. Whether it's sharing a hard-won lesson, making an introduction, or simply listening — we show up for each other.",
  },
  {
    title: "Quality over Quantity",
    description:
      "We intentionally keep our community curated. Deeper relationships with the right people will always outperform a large, shallow network.",
  },
  {
    title: "Action-Oriented",
    description:
      "Ideas are abundant; execution is everything. We bias toward action, accountability, and measurable progress rather than endless discussion.",
  },
  {
    title: "Diversity of Thought",
    description:
      "The best solutions emerge when diverse perspectives collide. We actively seek founders from different industries, backgrounds, and stages to enrich our collective wisdom.",
  },
  {
    title: "Long-term Relationships",
    description:
      "We're building relationships that last years, not transactions that last minutes. Our community is designed for founders who invest in genuine, lasting connections.",
  },
  {
    title: "Privacy & Trust",
    description:
      "What's shared in the community stays in the community. We protect the confidentiality of our members' challenges, data, and conversations above all else.",
  },
];

export function FounderPrinciplesSection() {
  return (
    <Section variant="default">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Founder-First Principles
          </h2>
          <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-6 text-lg leading-relaxed text-secondary">
            These principles guide everything we build, every decision we make,
            and every member we welcome.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <ol className="space-y-6">
            {principles.map((principle, index) => (
              <li key={principle.title} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-primary">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-secondary">
                    {principle.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
