import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { founders } from "@/data/seed"
import { Search, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react"
import Link from "next/link"

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2)
}

const communityPosts = [
  {
    id: "post-1",
    author: founders[1],
    content:
      "Just closed our first hospital partnership in Abu Dhabi! 🏥 Grateful for the intros from this community. If anyone is navigating healthcare partnerships in the UAE, happy to share learnings.",
    likes: 24,
    comments: 8,
    time: "3h ago",
    tags: ["HealthTech", "Partnerships"],
  },
  {
    id: "post-2",
    author: founders[2],
    content:
      "Looking for beta testers for our new AI-powered invoicing module. If you run an SME in Saudi Arabia and hate bookkeeping (who doesn't?), DM me! 📊",
    likes: 15,
    comments: 12,
    time: "6h ago",
    tags: ["SaaS", "Beta Testing"],
  },
  {
    id: "post-3",
    author: founders[5],
    content:
      "Sharing my framework for building a talent pipeline in Saudi's competitive tech market. Wrote a quick thread on what's worked for Mawahib — check it out and let me know your thoughts.",
    likes: 38,
    comments: 14,
    time: "1d ago",
    tags: ["HRTech", "Hiring"],
  },
  {
    id: "post-4",
    author: founders[3],
    content:
      "Expanding Wasla Logistics into Saudi Arabia next quarter. Would love to connect with founders who have experience with Saudi logistics regulations and last-mile infrastructure.",
    likes: 19,
    comments: 6,
    time: "2d ago",
    tags: ["Logistics", "Expansion"],
  },
]

export default function CommunityPage() {
  const otherFounders = founders.filter((f) => f.id !== "f1")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="directory">Founder Directory</TabsTrigger>
        </TabsList>

        {/* Feed */}
        <TabsContent value="feed" className="mt-6 space-y-6">
          {/* Compose */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs">LR</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Input placeholder="Share an update, ask a question, or celebrate a win..." />
                  <div className="flex justify-end">
                    <Button size="sm">Post</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {communityPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="text-xs">
                      {initials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#0A1628]">
                        {post.author.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {post.author.companyName} · {post.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-6 text-gray-500">
                      <button className="flex items-center gap-1.5 text-xs hover:text-[#C9A84C] transition-colors">
                        <Heart className="h-3.5 w-3.5" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs hover:text-[#C9A84C] transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs hover:text-[#C9A84C] transition-colors">
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Directory */}
        <TabsContent value="directory" className="mt-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search founders by name, company, or sector..." className="pl-9" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherFounders.map((founder) => (
              <Card key={founder.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback>{initials(founder.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#0A1628] truncate">
                          {founder.name}
                        </span>
                        {founder.isVerified && <Badge variant="success">Verified</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {founder.companyName} · {founder.location}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {founder.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{founder.sector}</Badge>
                        <Badge variant="secondary">{founder.stage}</Badge>
                        <div className="ml-auto flex items-center gap-1 text-xs text-[#C9A84C]">
                          <TrendingUp className="h-3 w-3" />
                          {founder.score}
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button size="sm" variant="outline" className="w-full" asChild>
                          <Link href="/dashboard/messages">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
