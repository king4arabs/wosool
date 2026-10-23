import catalog from "@/data/opportunities.json";
export type Opportunity = (typeof catalog)[number];
export const opportunityCatalog = catalog;
export const opportunityGroups = ["investment", "vc", "perks"] as const;
/** Shuffle within each group, preserving the fundraising-first journey. */
export function arrangeOpportunities(
  rows: Opportunity[],
  random = Math.random,
): Opportunity[] {
  return opportunityGroups.flatMap((group) => {
    const items = rows.filter((row) => row.group === group);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });
}
