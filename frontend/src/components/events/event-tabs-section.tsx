"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WosoolEvent } from "./types";

const allEvents: WosoolEvent[] = [
  { id: "e1", title: "Founder Circle: FinTech Edition", description: "Join fellow FinTech founders for a structured peer advisory session.", date: "2025-03-10", time: "6:00 PM", type: "Meetup", format: "In-Person" },
  { id: "e2", title: "Pitch Clinic Workshop", description: "Refine your pitch with expert feedback from investors and mentors.", date: "2025-03-12", time: "2:00 PM", type: "Workshop", format: "Virtual" },
  { id: "e3", title: "AI Product Strategy Panel", description: "Leading AI founders discuss building AI-first products in the GCC.", date: "2025-03-15", time: "4:00 PM", type: "Panel", format: "Hybrid" },
  { id: "e4", title: "Fundraising Fireside Chat", description: "Hear from founders who recently closed rounds on what worked.", date: "2025-03-18", time: "5:00 PM", type: "Fireside", format: "Virtual" },
  { id: "e5", title: "Startup Networking Night", description: "Connect with 50+ founders in a casual evening of networking.", date: "2025-03-22", time: "7:00 PM", type: "Networking", format: "In-Person" },
  { id: "e6", title: "Build Weekend Hackathon", description: "48-hour hackathon to prototype your next feature or product.", date: "2025-03-28", time: "9:00 AM", type: "Hackathon", format: "In-Person" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return { day: d.getDate(), month: d.toLocaleString("en", { month: "short" }) };
}

function getTypeBadgeVariant(type: string) {
  switch (type) {
    case "Workshop": return "accent" as const;
    case "Panel": return "secondary" as const;
    case "Hackathon": return "warning" as const;
    default: return "outline" as const;
  }
}

function EventCard({ event }: { event: WosoolEvent }) {
  const { day, month } = formatDate(event.date);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center rounded-lg bg-accent/10 px-3 py-2 text-center min-w-[56px]">
            <span className="text-2xl font-bold text-accent">{day}</span>
            <span className="text-xs uppercase text-accent/70">{month}</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-1">
              <Badge variant={getTypeBadgeVariant(event.type)}>{event.type}</Badge>
              <Badge variant={event.format === "Virtual" ? "secondary" : "outline"}>{event.format}</Badge>
            </div>
            <CardTitle className="text-base">{event.title}</CardTitle>
            <CardDescription className="text-xs mt-1">{event.time}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="accent" size="sm">RSVP</Button>
      </CardFooter>
    </Card>
  );
}

export function EventTabsSection() {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="week">This Week</TabsTrigger>
        <TabsTrigger value="month">This Month</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <p className="text-center text-muted-foreground py-8">No events scheduled for today. Check back soon!</p>
      </TabsContent>
      <TabsContent value="week">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.slice(0, 2).map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </TabsContent>
      <TabsContent value="month">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </TabsContent>
      <TabsContent value="all">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allEvents.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </TabsContent>
    </Tabs>
  );
}
