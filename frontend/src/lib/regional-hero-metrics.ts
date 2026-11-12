/**
 * Cards are shown in this order for Saudi Arabia, GCC, MENA, and World:
 * founders/ecosystems, companies, revenue/sales growth %, funding-deal growth %.
 * These are sourced ecosystem indicators, never Wosool membership counts.
 *
 * Saudi/GCC/MENA founder and company counts: regional Crunchbase startup hubs.
 * Saudi/GCC growth: GASTAT/MAGNiTT and Kamco Invest/Lucidity Insights.
 * MENA sales growth: Forbes Middle East's top 100 listed companies (FY 2024).
 * World: Startup Genome GSER 2026 ecosystems (350+) and companies (5.5m+),
 * AWS 2026 startup survey revenue growth, and BVK/CB Insights 2025 VC deals.
 * Source links, scopes, and periods are displayed in RegionalHeroMetrics.
 */
export const regionalHeroValues = [
  [808, 762, 7, -39],
  [2978, 2429, 3.6, -33.3],
  [10307, 7722, 12.2, -33],
  [350, 5500000, 65, -17],
] as const satisfies readonly (readonly [number, number, number, number])[]
