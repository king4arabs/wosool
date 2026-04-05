"use client";

import { useState } from "react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { directoryFounders } from "./data";

const filterHints = ["Industry", "Stage", "Location", "Expertise"];

export function FounderDirectorySection() {
  const [query, setQuery] = useState("");

  const filtered = directoryFounders.filter((f) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.company.toLowerCase().includes(q) ||
      f.sector.toLowerCase().includes(q) ||
      f.stage.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const displayed = filtered.slice(0, 8);

  return (
    <Section
      title="Founder Directory"
      subtitle="Explore our growing community of founders across sectors, stages, and geographies."
    >
      {/* Search */}
      <div className="mx-auto mb-6 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/40" />
          <Input
            placeholder="Search by name, company, sector, or tag…"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter hint badges */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {filterHints.map((hint) => (
          <Badge
            key={hint}
            variant="outline"
            className="cursor-pointer select-none hover:bg-secondary/5"
          >
            {hint}
          </Badge>
        ))}
      </div>

      {/* Founder grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((founder) => (
          <Card
            key={founder.id}
            className="border-none bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex-row items-center gap-3 pb-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${founder.avatarColor} text-sm font-bold text-white`}
              >
                {founder.initials}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">{founder.name}</CardTitle>
                <p className="truncate text-xs text-secondary/70">
                  {founder.title} · {founder.company}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <Badge variant="accent" className="text-xs">
                Score: {founder.founderScore}/100
              </Badge>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[11px]">
                  {founder.sector}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  {founder.stage}
                </Badge>
              </div>

              {founder.tags[0] && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-normal"
                >
                  {founder.tags[0]}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-secondary/60">
          No founders match your search. Try a different term.
        </p>
      )}
    </Section>
  );
}
