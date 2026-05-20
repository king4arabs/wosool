"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sparkles, Check, X } from "lucide-react"
import { api } from "@/lib/api"

type Match = {
  id: number
  match_score: number
  match_reasons: string[]
  status: string
  founder_a?: { id: number; name?: string | null; companies?: Array<{ name: string }>; sector?: string | null; stage?: string | null; tagline?: string | null }
  founder_b?: { id: number; name?: string | null; companies?: Array<{ name: string }>; sector?: string | null; stage?: string | null; tagline?: string | null }
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2)
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = () =>
    api.get<{ data: Match[] }>("/member/matches")
      .then((response) => setMatches(response.data))
      .catch((err: Error) => setError(err.message))

  useEffect(() => {
    load()
  }, [])

  const update = async (id: number, action: "accept" | "decline") => {
    await api.post(`/member/matches/${id}/${action}`)
    await load()
  }

  const suggested = matches.filter((match) => match.status === "suggested")
  const active = matches.filter((match) => match.status !== "suggested")

  if (error) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Matches are not available yet.</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-[#0A1628] flex items-center justify-center shrink-0">
              <Sparkles className="h-7 w-7 text-[#C9A84C]" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[#0A1628]">Founder Matches</h2>
              <p className="text-gray-600 mt-1">Suggestions are generated from profile overlap, stage fit, and ecosystem relevance.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="suggested">
        <TabsList>
          <TabsTrigger value="suggested">Suggested ({suggested.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="suggested" className="mt-6 space-y-4">
          {suggested.length === 0 && <p className="text-sm text-gray-500">No suggested matches right now.</p>}
          {suggested.map((match) => {
            const founder = match.founder_b || match.founder_a
            const name = founder?.name || "Founder"
            return (
              <Card key={match.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 shrink-0"><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#0A1628]">{name}</span>
                          <Badge variant="outline">{founder?.stage || "Member"}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{founder?.companies?.[0]?.name || "Independent"} · {founder?.sector || "—"}</p>
                        <p className="text-sm text-gray-600 mt-2">{founder?.tagline || "Potentially relevant founder connection."}</p>
                        <div className="mt-3 space-y-1">
                          {match.match_reasons.map((reason) => (
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
                        <div className="text-2xl font-bold text-[#C9A84C]">{Math.round(match.match_score)}%</div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1" onClick={() => update(match.id, "accept")}><Check className="h-3 w-3" />Connect</Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => update(match.id, "decline")}><X className="h-3 w-3" />Skip</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
        <TabsContent value="active" className="mt-6 space-y-4">
          {active.length === 0 && <p className="text-sm text-gray-500">Accepted and connected matches will appear here.</p>}
          {active.map((match) => {
            const founder = match.founder_b || match.founder_a
            const name = founder?.name || "Founder"
            return (
              <Card key={match.id}>
                <CardContent className="pt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 shrink-0"><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold text-[#0A1628]">{name}</p>
                      <p className="text-sm text-gray-500">{founder?.companies?.[0]?.name || "Independent"} · {founder?.sector || "—"}</p>
                    </div>
                  </div>
                  <Badge variant={match.status === "accepted" ? "success" : "secondary"}>{match.status}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
