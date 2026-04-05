import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import {
  Landmark,
  Heart,
  GraduationCap,
  Building2,
  Brain,
  ShoppingCart,
  Truck,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { sectors } from "./data";

const iconMap: Record<string, LucideIcon> = {
  Landmark,
  Heart,
  GraduationCap,
  Building2,
  Brain,
  ShoppingCart,
  Truck,
  Leaf,
};

export function SectorExplorerSection() {
  return (
    <Section
      variant="dark"
      title="Explore by Sector"
      subtitle="Discover companies across eight key sectors driving innovation in the region."
    >
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((sector) => {
          const Icon = iconMap[sector.icon];
          return (
            <div
              key={sector.name}
              className="group cursor-pointer rounded-xl bg-white/10 p-6 text-center transition-colors hover:bg-white/20"
            >
              {Icon && (
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${sector.color}20` }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: sector.color }}
                  />
                </div>
              )}
              <p className="font-semibold text-white">{sector.name}</p>
              <Badge
                variant="outline"
                className="mt-2 border-white/30 text-white/80"
              >
                {sector.companyCount} companies
              </Badge>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
