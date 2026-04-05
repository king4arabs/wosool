import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  MessageCircle,
  BrainCircuit,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { founders, events } from "@/data/seed"
import Link from "next/link"

const priorities = [
  { label: "Complete your Founder Score", done: false },
  { label: "Request 2 warm introductions", done: true },
  { label: "Join your Founder Circle", done: false },
  { label: "Attend the Dubai Founders Dinner", done: false },
]

const activityFeed = [
  { text: "Omar Al-Farsi accepted your connection request", time: "2h ago", type: "connect" },
  { text: "New event: AI in the GCC Roundtable — Sept 18", time: "5h ago", type: "event" },
  { text: "Your Founder Score improved by 3 points", time: "1d ago", type: "score" },
  { text: "Wosool Digest #24 is available", time: "2d ago", type: "news" },
]

export default function DashboardPage() {
  const upcomingEvents = events.slice(0, 3)
  const matches = founders.filter((f) => f.id !== "f1").slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A1628]">Good morning, Layla 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening in your network.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profile">Complete Your Profile</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#0A1628]">Profile Completion</h3>
                <span className="text-2xl font-bold text-[#C9A84C]">75%</span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={75} className="mb-4" />
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["Basic Info ✓", "Company Profile ✓", "Founder Story ✓", "Scorecard ●", "Needs & Offers ●", "Intro Video ●"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2 text-gray-600">
                      <span>{item.includes("✓") ? "✅" : "⚪"}</span>
                      <span>{item.replace(" ✓", "").replace(" ●", "")}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Founder Score Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#C9A84C]" />
                  Founder Score
                </h3>
                <Badge variant="gold">87</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Engagement", score: 90 },
                  { label: "Credibility", score: 85 },
                  { label: "Contribution", score: 82 },
                  { label: "Network", score: 78 },
                ].map(({ label, score }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl font-bold text-[#0A1628]">{score}</div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <Progress value={score} className="mt-1 h-1" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/scorecard"
                  className="text-sm text-[#C9A84C] font-medium hover:underline flex items-center gap-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  View full scorecard
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Matches */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#C9A84C]" />
                Recommended Matches
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.map((founder) => (
                <div key={founder.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {founder.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#0A1628] truncate">{founder.name}</p>
                    <p className="text-xs text-gray-500 truncate">{founder.companyName} · {founder.sector}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Intro
                  </Button>
                </div>
              ))}
              <Link
                href="/dashboard/matches"
                className="text-sm text-[#C9A84C] font-medium hover:underline"
              >
                View all matches →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly Priorities */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#0A1628]">This Week&apos;s Priorities</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorities.map(({ label, done }) => (
                <div key={label} className="flex items-start gap-3">
                  {done ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
                  )}
                  <span className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#C9A84C]" />
                Upcoming Events
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => {
                const date = new Date(event.date)
                return (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#0A1628] text-white flex flex-col items-center justify-center">
                      <span className="text-xs text-[#C9A84C]">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A1628] line-clamp-1">{event.title}</p>
                      <p className="text-xs text-gray-400">{event.isVirtual ? "Virtual" : event.location}</p>
                    </div>
                  </div>
                )
              })}
              <Link
                href="/dashboard/events"
                className="text-sm text-[#C9A84C] font-medium hover:underline"
              >
                View calendar →
              </Link>
            </CardContent>
          </Card>

          {/* AI Assistant */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#C9A84C]" />
                AI Assistant
              </h3>
            </CardHeader>
            <CardContent>
              <div className="bg-[#F8F5EF] rounded-xl p-4 mb-4 min-h-[80px]">
                <p className="text-sm text-gray-600">
                  💡 Based on your profile, I suggest connecting with{" "}
                  <span className="font-semibold text-[#0A1628]">Sara Al-Mutairi</span> — her
                  expertise in SaaS aligns with your growth stage.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask the AI assistant..."
                  className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                  aria-label="AI assistant input"
                />
                <Button size="sm">Send</Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[#0A1628]">Recent Activity</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityFeed.map(({ text, time }) => (
                <div key={text} className="flex gap-3">
                  <Clock className="h-3 w-3 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">{text}</p>
                    <p className="text-xs text-gray-400">{time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
