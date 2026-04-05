import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, CheckCircle, ArrowRight } from "lucide-react"

const scoreCategories = [
  { label: "Engagement", score: 90, max: 100, description: "Active participation in community events and discussions" },
  { label: "Credibility", score: 85, max: 100, description: "Verified founder status, company stage, and track record" },
  { label: "Contribution", score: 82, max: 100, description: "Value added to other founders through intros, advice, and resources" },
  { label: "Network", score: 78, max: 100, description: "Quality and breadth of connections within the Wosool community" },
  { label: "Completion", score: 75, max: 100, description: "Profile completeness and program participation" },
]

const improvements = [
  { action: "Complete your founder scorecard questionnaire", impact: "+8 points" },
  { action: "Upload an intro video to your profile", impact: "+5 points" },
  { action: "Make 3 warm introductions this month", impact: "+6 points" },
  { action: "Attend an upcoming Founder Circle session", impact: "+4 points" },
]

const scoreHistory = [72, 74, 74, 76, 79, 81, 84, 87]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]

function overallScore() {
  return Math.round(
    scoreCategories.reduce((sum, c) => sum + c.score, 0) / scoreCategories.length
  )
}

export default function ScorecardPage() {
  const overall = overallScore()

  return (
    <div className="max-w-4xl space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="h-28 w-28 rounded-full bg-[#0A1628] flex flex-col items-center justify-center mb-2">
                <Star className="h-5 w-5 text-[#C9A84C] mb-1" aria-hidden="true" />
                <span className="text-4xl font-bold text-white">{overall}</span>
              </div>
              <Badge variant="gold">Top 20%</Badge>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[#0A1628] mb-2">
                Your Founder Score
              </h2>
              <p className="text-gray-600 mb-4">
                Your Founder Score reflects your engagement, credibility, and
                contribution to the Wosool community. Keep improving to unlock
                premium features.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Verified Founder</Badge>
                <Badge variant="secondary">Series A</Badge>
                <Badge variant="outline">Fintech</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">Score Breakdown</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {scoreCategories.map(({ label, score, max, description }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-medium text-sm text-[#0A1628]">{label}</span>
                  <span className="text-xs text-gray-500 ml-2">{description}</span>
                </div>
                <span className="font-bold text-[#0A1628] text-sm">{score}/{max}</span>
              </div>
              <Progress value={(score / max) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Score History */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#C9A84C]" />
            Score History
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {scoreHistory.map((score, i) => {
              const height = ((score - 60) / 40) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-[#C9A84C]/20 hover:bg-[#C9A84C]/40 transition-colors relative"
                    style={{ height: `${height}%` }}
                    title={`${months[i]}: ${score}`}
                    aria-label={`${months[i]}: score ${score}`}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#C9A84C] rounded-t-sm"
                      style={{ height: "30%" }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{months[i]}</span>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Your score has improved by{" "}
            <span className="font-semibold text-emerald-600">+15 points</span> over the
            last 8 months.
          </p>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628]">How to Improve Your Score</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {improvements.map(({ action, impact }) => (
            <div key={action} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#F8F5EF]">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[#C9A84C] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{action}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="success">{impact}</Badge>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
          <Button className="w-full">Start Improving My Score</Button>
        </CardContent>
      </Card>
    </div>
  )
}
