import type { Metadata } from "next";
import {
  Trophy,
  Award,
  Presentation,
  Star,
  Users,
  Building2,
  Handshake,
  Calendar,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventTabsSection } from "@/components/events/event-tabs-section";

export const metadata: Metadata = {
  title: "Events — Wosool",
  description: "Discover events, workshops, and networking opportunities in the Wosool founder community.",
};

const signatureEvents = [
  { id: "se1", title: "Wosool Summit", description: "Our flagship annual gathering bringing together 500+ founders, investors, and ecosystem leaders.", date: "October 2025", icon: Trophy },
  { id: "se2", title: "Founder Awards", description: "Celebrating outstanding founders and companies making an impact in the Saudi/GCC ecosystem.", date: "December 2025", icon: Award },
  { id: "se3", title: "Demo Day", description: "Top founders present their companies to a curated audience of investors and partners.", date: "June 2025", icon: Star },
];

const founderSessions = [
  { id: "fs1", title: "Building in Regulated Markets", founderName: "Omar Al-Rashid", date: "March 20, 2025", time: "4:00 PM", format: "Virtual" as const },
  { id: "fs2", title: "From 0 to 1M Users", founderName: "Lina Hakim", date: "March 25, 2025", time: "5:00 PM", format: "In-Person" as const },
  { id: "fs3", title: "Technical Debt: When to Pay It Off", founderName: "Khalid Nasser", date: "April 2, 2025", time: "3:00 PM", format: "Virtual" as const },
];

const externalEvents = [
  { id: "ex1", title: "LEAP 2025", description: "The world's largest tech event in Riyadh, Saudi Arabia.", date: "February 2025", location: "Riyadh" },
  { id: "ex2", title: "Future Investment Initiative (FII)", description: "Global investment forum driving innovation in Riyadh.", date: "October 2025", location: "Riyadh" },
  { id: "ex3", title: "GITEX Global", description: "The largest tech and startup event in the MENA region.", date: "October 2025", location: "Dubai" },
];

const privateSessions = [
  { id: "ps1", title: "Investor Relations Roundtable", description: "Candid discussion on managing investor expectations and board dynamics.", date: "March 28, 2025", time: "6:00 PM", tier: "Premium Members" },
  { id: "ps2", title: "Founder Mental Health Check-in", description: "Safe space for founders to discuss challenges and support each other.", date: "April 5, 2025", time: "5:00 PM", tier: "All Members" },
];

const partnerEvents = [
  { id: "pe1", title: "Legal Foundations for Startups", partnerName: "Wosool Legal Partners", description: "Workshop covering company formation, IP, and contracts.", date: "April 10, 2025", time: "2:00 PM", format: "Virtual" as const },
  { id: "pe2", title: "Cloud Architecture Office Hours", partnerName: "Wosool Tech Partners", description: "1-on-1 sessions with cloud architects for technical guidance.", date: "April 15, 2025", time: "3:00 PM", format: "Virtual" as const },
];

export default function EventsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <Container>
          <div className="relative z-10 max-w-3xl">
            <Badge variant="accent" className="mb-4">Events & Calendar</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Connect, Learn, and Grow Together
            </h1>
            <p className="text-lg text-white/80 mb-8">
              From intimate founder sessions to flagship summits, find the events that matter for your journey.
            </p>
            <Button variant="accent" size="lg">View Full Calendar</Button>
          </div>
        </Container>
      </section>

      {/* Event Tabs */}
      <Section title="Upcoming Events" subtitle="Browse events by timeframe.">
        <EventTabsSection />
      </Section>

      {/* Annual Signature Events */}
      <Section title="Annual Signature Events" subtitle="Marquee events that define the Wosool experience." variant="muted">
        <div className="grid gap-6 sm:grid-cols-3">
          {signatureEvents.map((event) => {
            const Icon = event.icon;
            return (
              <Card key={event.id} className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent mb-3">
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline" size="sm">Learn More</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Founder-Led Sessions */}
      <Section title="Founder-Led Sessions" subtitle="Learn directly from founders who've been there.">
        <div className="grid gap-6 sm:grid-cols-3">
          {founderSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="accent">Founder Session</Badge>
                  <Badge variant={session.format === "Virtual" ? "secondary" : "outline"}>{session.format}</Badge>
                </div>
                <CardTitle className="text-base">{session.title}</CardTitle>
                <CardDescription>
                  Led by {session.founderName} · {session.date} · {session.time}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">RSVP</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* Public Tech Events */}
      <Section title="Public Tech Ecosystem Events" subtitle="Major events across the Saudi and GCC tech ecosystem." variant="muted">
        <div className="grid gap-6 sm:grid-cols-3">
          {externalEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">{event.location}</Badge>
                <CardTitle className="text-base">{event.title}</CardTitle>
                <CardDescription>{event.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Private Sessions */}
      <Section title="Private Discussion Sessions" subtitle="Members-only intimate conversations on founder challenges.">
        <div className="grid gap-6 sm:grid-cols-2">
          {privateSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="warning">{session.tier}</Badge>
                </div>
                <CardTitle className="text-base">{session.title}</CardTitle>
                <CardDescription>{session.date} · {session.time}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{session.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="accent" size="sm">Request Access</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* Partner Events */}
      <Section title="Sponsor & Partner Events" subtitle="Events hosted by our ecosystem partners." variant="muted">
        <div className="grid gap-6 sm:grid-cols-2">
          {partnerEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{event.partnerName}</Badge>
                  <Badge variant="outline">{event.format}</Badge>
                </div>
                <CardTitle className="text-base">{event.title}</CardTitle>
                <CardDescription>{event.date} · {event.time}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Register</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
