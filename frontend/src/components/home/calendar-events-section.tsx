import { Calendar, ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Event {
  date: string;
  month: string;
  day: string;
  title: string;
  type: string;
  typeBadgeVariant: "default" | "accent" | "secondary" | "outline";
  time: string;
  location: string;
}

const events: Event[] = [
  {
    date: "2025-02-15",
    month: "FEB",
    day: "15",
    title: "Founder Circle: Navigating Series A in the GCC",
    type: "Peer Advisory",
    typeBadgeVariant: "accent",
    time: "6:00 PM – 8:00 PM AST",
    location: "Riyadh, Saudi Arabia",
  },
  {
    date: "2025-02-22",
    month: "FEB",
    day: "22",
    title: "Fireside Chat with Unicorn Founders",
    type: "Fireside Chat",
    typeBadgeVariant: "secondary",
    time: "7:00 PM – 9:00 PM AST",
    location: "Virtual Event",
  },
  {
    date: "2025-03-05",
    month: "MAR",
    day: "05",
    title: "GTM Strategy Workshop for B2B SaaS",
    type: "Workshop",
    typeBadgeVariant: "default",
    time: "10:00 AM – 1:00 PM AST",
    location: "Dubai, UAE",
  },
  {
    date: "2025-03-18",
    month: "MAR",
    day: "18",
    title: "Wosool Annual Summit 2025",
    type: "Summit",
    typeBadgeVariant: "accent",
    time: "9:00 AM – 6:00 PM AST",
    location: "Riyadh, Saudi Arabia",
  },
];

export function CalendarEventsSection() {
  return (
    <Section
      variant="muted"
      title="Calendar & Events"
      subtitle="Intimate gatherings designed for depth over breadth. Every event is an opportunity to learn, connect, and grow."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => (
          <div
            key={event.title}
            className="group flex flex-col overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm transition-all hover:shadow-md"
          >
            {/* Date header */}
            <div className="flex items-center gap-3 border-b border-muted px-5 py-4">
              <div className="flex flex-col items-center rounded-lg bg-primary px-3 py-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  {event.month}
                </span>
                <span className="text-xl font-bold leading-none text-white">
                  {event.day}
                </span>
              </div>
              <div>
                <Badge variant={event.typeBadgeVariant} className="text-[10px]">
                  {event.type}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-2 text-sm font-semibold leading-snug text-primary">
                {event.title}
              </h3>
              <div className="mt-auto space-y-1 text-xs text-secondary/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {event.time}
                </div>
                <p>{event.location}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full justify-center text-xs font-semibold text-accent hover:text-accent/80"
              >
                RSVP
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
