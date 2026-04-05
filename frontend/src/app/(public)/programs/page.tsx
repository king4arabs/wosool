import type { Metadata } from "next";
import {
  Rocket,
  Users,
  TrendingUp,
  DollarSign,
  Code,
  Handshake,
  Heart,
  Crown,
  Globe,
  Sparkles,
  ClipboardCheck,
  UserCheck,
  Zap,
  Award,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Program, ProgramStep, Cohort, ProgramFAQ } from "@/components/programs/types";
import { ProgramFAQSection } from "@/components/programs/faq-section";

export const metadata: Metadata = {
  title: "Programs — Wosool",
  description:
    "Structured programs and tracks designed to accelerate founder growth at every stage.",
};

const programs: Omit<Program, "icon">[] = [
  {
    id: "onboarding",
    title: "Founder Onboarding",
    description:
      "Get oriented in the Wosool community. Complete your profile, connect with your first peers, and discover resources tailored to your stage.",
    duration: "4 weeks",
    level: "Beginner",
    outcomes: ["Complete founder profile & scorecard", "Join your first Founder Circle", "Connect with 5+ relevant founders"],
  },
  {
    id: "circles",
    title: "Founder Circles",
    description:
      "Small, curated peer groups that meet regularly to share challenges, celebrate wins, and hold each other accountable.",
    duration: "Ongoing",
    level: "All Levels",
    outcomes: ["Trusted peer advisory group", "Monthly structured sessions", "Accountability partnerships"],
  },
  {
    id: "growth",
    title: "Growth & Traction Support",
    description:
      "Hands-on support for founders ready to scale. Covers go-to-market, customer acquisition, retention strategies, and operational scaling.",
    duration: "8 weeks",
    level: "Growth Stage",
    outcomes: ["Go-to-market playbook", "Customer acquisition framework", "Scaling operations plan"],
  },
  {
    id: "fundraising",
    title: "Fundraising Readiness",
    description:
      "Prepare for your next round with pitch coaching, financial modeling, investor matching, and due diligence preparation.",
    duration: "6 weeks",
    level: "Pre-Fundraise",
    outcomes: ["Investor-ready pitch deck", "Financial model review", "Warm investor introductions"],
  },
  {
    id: "technical",
    title: "Technical Founder Support",
    description:
      "For technical founders navigating business challenges. Covers product-market fit, team building, and balancing tech with business.",
    duration: "4 weeks",
    level: "Technical",
    outcomes: ["Product strategy framework", "Hiring your first non-technical team", "Technical debt management"],
  },
  {
    id: "office-hours",
    title: "Partner Office Hours",
    description:
      "Direct access to Wosool partners for expert guidance on legal, finance, marketing, HR, and technology decisions.",
    duration: "Weekly",
    level: "All Levels",
    outcomes: ["1-on-1 expert sessions", "Actionable next steps", "Partner network access"],
  },
  {
    id: "wellness",
    title: "Founder Wellness & Resilience",
    description:
      "Address the mental and emotional demands of building a startup. Covers burnout prevention, stress management, and sustainable leadership.",
    duration: "Ongoing",
    level: "All Levels",
    outcomes: ["Burnout prevention strategies", "Peer support network", "Work-life integration tools"],
  },
  {
    id: "leadership",
    title: "Leadership & Execution",
    description:
      "Advanced program for experienced founders. Covers executive leadership, board management, culture building, and strategic planning.",
    duration: "8 weeks",
    level: "Advanced",
    outcomes: ["Executive leadership toolkit", "Board management playbook", "Strategic planning framework"],
  },
  {
    id: "ecosystem",
    title: "Saudi/GCC Ecosystem Access",
    description:
      "Navigate the Saudi and GCC startup ecosystem. Covers regulations, government programs, regional partnerships, and market entry strategies.",
    duration: "6 weeks",
    level: "Regional",
    outcomes: ["Regulatory navigation guide", "Government program access", "Regional partnership strategy"],
  },
  {
    id: "ai-founders",
    title: "AI for Founders",
    description:
      "Leverage AI to accelerate your startup. Covers AI tools for productivity, AI product strategy, and building AI-powered features.",
    duration: "4 weeks",
    level: "All Levels",
    outcomes: ["AI productivity toolkit", "AI product strategy", "Implementation roadmap"],
  },
];

const iconMap: Record<string, React.ReactNode> = {
  onboarding: <Rocket className="h-6 w-6" />,
  circles: <Users className="h-6 w-6" />,
  growth: <TrendingUp className="h-6 w-6" />,
  fundraising: <DollarSign className="h-6 w-6" />,
  technical: <Code className="h-6 w-6" />,
  "office-hours": <Handshake className="h-6 w-6" />,
  wellness: <Heart className="h-6 w-6" />,
  leadership: <Crown className="h-6 w-6" />,
  ecosystem: <Globe className="h-6 w-6" />,
  "ai-founders": <Sparkles className="h-6 w-6" />,
};

const steps: Omit<ProgramStep, "icon">[] = [
  { step: 1, title: "Apply", description: "Submit your interest and tell us about your goals." },
  { step: 2, title: "Match", description: "We match you with the right program and cohort." },
  { step: 3, title: "Engage", description: "Participate in sessions, workshops, and peer groups." },
  { step: 4, title: "Grow", description: "Apply learnings, track progress, and level up." },
];

const stepIcons = [
  <ClipboardCheck key="s1" className="h-8 w-8" />,
  <UserCheck key="s2" className="h-8 w-8" />,
  <Zap key="s3" className="h-8 w-8" />,
  <Award key="s4" className="h-8 w-8" />,
];

const cohorts: Cohort[] = [
  { id: "c1", programName: "Growth & Traction Support", startDate: "March 15, 2025", spotsAvailable: 8, totalSpots: 15 },
  { id: "c2", programName: "Fundraising Readiness", startDate: "April 1, 2025", spotsAvailable: 5, totalSpots: 12 },
  { id: "c3", programName: "AI for Founders", startDate: "April 20, 2025", spotsAvailable: 12, totalSpots: 20 },
];

const faqs: ProgramFAQ[] = [
  { question: "Who is eligible for Wosool programs?", answer: "All Wosool members are eligible. Some programs have specific stage or experience requirements noted in their descriptions." },
  { question: "Are programs free for members?", answer: "Most programs are included in your Wosool membership. Select premium programs with external facilitators may have additional fees, which are always disclosed upfront." },
  { question: "How much time commitment is required?", answer: "Time varies by program. Most require 2-4 hours per week including sessions and assignments. Ongoing programs like Founder Circles meet monthly." },
  { question: "Can I join multiple programs?", answer: "Yes, but we recommend focusing on one intensive program at a time. Ongoing programs like Circles and Office Hours can run in parallel." },
  { question: "What if I need to pause or drop out?", answer: "We understand founder life is unpredictable. You can pause most programs and rejoin a future cohort. Just let your program lead know." },
  { question: "How are cohorts formed?", answer: "Cohorts are curated based on stage, sector, goals, and complementary skills to maximize peer value and collaboration opportunities." },
];

function getLevelVariant(level: string) {
  switch (level) {
    case "Beginner": return "success" as const;
    case "Growth Stage": return "accent" as const;
    case "Advanced": return "warning" as const;
    case "Technical": return "secondary" as const;
    default: return "outline" as const;
  }
}

export default function ProgramsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-primary py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <Container>
          <div className="relative z-10 max-w-3xl">
            <Badge variant="accent" className="mb-4">Programs & Tracks</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Structured Support for Every Founder Journey
            </h1>
            <p className="text-lg text-white/80 mb-8">
              From onboarding to advanced leadership, our programs are designed to help you grow
              faster with the right support at the right time.
            </p>
            <div className="flex gap-4">
              <Button variant="accent" size="lg">Explore Programs</Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                View Schedule
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Program Cards */}
      <Section title="Our Programs" subtitle="Ten structured tracks designed for founder growth at every stage.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {iconMap[program.id]}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{program.duration}</Badge>
                    <Badge variant={getLevelVariant(program.level)}>{program.level}</Badge>
                  </div>
                </div>
                <CardTitle>{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {program.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* How Programs Work */}
      <Section title="How Programs Work" subtitle="A simple path from interest to impact." variant="muted">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                {stepIcons[i]}
              </div>
              <div className="mb-2 text-sm font-semibold text-accent">Step {step.step}</div>
              <h3 className="text-lg font-semibold text-primary mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Upcoming Cohorts */}
      <Section title="Upcoming Cohorts" subtitle="Join the next cohort and start your journey.">
        <div className="grid gap-6 sm:grid-cols-3">
          {cohorts.map((cohort) => (
            <Card key={cohort.id}>
              <CardHeader>
                <CardTitle className="text-lg">{cohort.programName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Starts {cohort.startDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spots available</span>
                  <Badge variant={cohort.spotsAvailable < 6 ? "warning" : "success"}>
                    {cohort.spotsAvailable} / {cohort.totalSpots}
                  </Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${((cohort.totalSpots - cohort.spotsAvailable) / cohort.totalSpots) * 100}%` }}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="accent" className="w-full">Apply Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Frequently Asked Questions" subtitle="Everything you need to know about our programs." variant="muted">
        <div className="max-w-3xl mx-auto">
          <ProgramFAQSection faqs={faqs} />
        </div>
      </Section>
    </>
  );
}
