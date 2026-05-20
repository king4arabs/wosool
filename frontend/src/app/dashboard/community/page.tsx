import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CommunityPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0A1628]">Community</h2>
            <Badge variant="secondary">Phase 2</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>The production dashboard now gates the community feed until the backend post, comment, and reaction APIs are ready.</p>
          <p>Profile, companies, events, programs, scorecards, matches, and messaging are already connected to live backend data.</p>
        </CardContent>
      </Card>
    </div>
  )
}
