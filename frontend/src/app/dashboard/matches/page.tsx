import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { founders } from "@/data/seed"
import { Sparkles, Check, X, MessageCircle, UserCheck } from "lucide-react"
import Link from "next/link"

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2)
}

const suggestedMatches = [
  {
    founder: founders[2],
    score: 92,
    reasons: ["Both based in Riyadh", "Complementary skills: SaaS + Fintech", "Similar stage alignment"],
  },
  {
    founder: founders[3],
    score: 85,
    reasons: ["Series A peers", "Potential logistics partnership", "Shared investor network"],
  },
  {
    founder: founders[4],
    score: 78,
    reasons: ["Saudi-based founders", "FoodTech × Fintech payment synergy", "Both need distribution help"],
  },
  {
    founder: founders[5],
    score: 74,
    reasons: ["HRTech for your hiring needs", "Scale-up experience", "Warm intro available"],
  },
]

const connectedFounders = [
  { founder: founders[1], connectedAt: "Connected 3 weeks ago", lastMessage: "Thanks for the investor intro!" },
]

export default function MatchesPage() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-[#0A1628] flex items-center justify-center shrink-0">
              <Sparkles className="h-7 w-7 text-[#C9A84C]" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[#0A1628]">AI-Powered Matches</h2>
              <p className="text-gray-600 mt-1">
                We analyze your profile, needs, stage, and sector to suggest founders
                you should connect with. Matches update weekly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="suggested">
        <TabsList>
          <TabsTrigger value="suggested">Suggested ({suggestedMatches.length})</TabsTrigger>
          <TabsTrigger value="connected">Connected ({connectedFounders.length})</TabsTrigger>
        </TabsList>

        {/* Suggested Matches */}
        <TabsContent value="suggested" className="mt-6 space-y-4">
          {suggestedMatches.map(({ founder, score, reasons }) => (
            <Card key={founder.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback>{initials(founder.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#0A1628]">{founder.name}</span>
                        {founder.isVerified && <Badge variant="success">Verified</Badge>}
                      </div>
                      <p className="text-sm text-gray-500">
                        {founder.companyName} · {founder.sector} · {founder.stage}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{founder.tagline}</p>
                      <div className="mt-3 space-y-1">
                        {reasons.map((reason) => (
                          <p key={reason} className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-[#C9A84C] shrink-0" />
                            {reason}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 sm:min-w-[120px]">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#C9A84C]">{score}%</div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1">
                        <Check className="h-3 w-3" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <X className="h-3 w-3" />
                        Skip
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Connected Founders */}
        <TabsContent value="connected" className="mt-6 space-y-4">
          {connectedFounders.map(({ founder, connectedAt, lastMessage }) => (
            <Card key={founder.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback>{initials(founder.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0A1628]">{founder.name}</span>
                      <UserCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-500">
                      {founder.companyName} · {founder.sector}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{connectedAt}</p>
                    {lastMessage && (
                      <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{lastMessage}&rdquo;</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/messages">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Separator />
          <p className="text-sm text-gray-500 text-center py-4">
            Connect with more founders from the{" "}
            <span className="text-[#C9A84C] font-medium">Suggested</span> tab to grow your network.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
