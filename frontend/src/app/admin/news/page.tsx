import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { newsItems } from "@/data/seed"
import { Search, Filter, FileText, Eye, Edit, Plus, Trash2 } from "lucide-react"

type ContentStatus = "published" | "draft" | "archived"

const statusBadge = (status: ContentStatus) => {
  switch (status) {
    case "published": return <Badge variant="success">Published</Badge>
    case "draft": return <Badge variant="warning">Draft</Badge>
    case "archived": return <Badge variant="secondary">Archived</Badge>
  }
}

const tableNews = newsItems.map((n, i) => ({
  ...n,
  status: (["published", "published", "published", "draft", "published", "archived"] as ContentStatus[])[i],
  publishedFormatted: new Date(n.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  views: [1240, 890, 670, 0, 520, 310][i],
}))

const stats = [
  { label: "Total Articles", value: newsItems.length, color: "text-blue-600" },
  { label: "Published", value: tableNews.filter(n => n.status === "published").length, color: "text-emerald-600" },
  { label: "Drafts", value: tableNews.filter(n => n.status === "draft").length, color: "text-amber-600" },
  { label: "Total Views", value: tableNews.reduce((sum, n) => sum + n.views, 0).toLocaleString(), color: "text-purple-600" },
]

export default function AdminNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News &amp; Content</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage articles, announcements, and content.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <FileText className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search articles by title or category..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Search articles"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by status"
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
                aria-label="Filter by category"
              >
                <option>All Categories</option>
                <option>Founder Update</option>
                <option>Ecosystem News</option>
                <option>Event Recap</option>
                <option>Program Update</option>
                <option>Insights</option>
                <option>Announcement</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Articles ({tableNews.length})</h3>
            <p className="text-sm text-gray-500">
              {tableNews.filter(n => n.status === "draft").length} draft
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Published</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Views</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableNews.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 max-w-sm truncate">{article.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">By {article.author}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{article.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(article.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {article.publishedFormatted}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700">{article.views.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`View ${article.title}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label={`Edit ${article.title}`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {article.status === "archived" && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" aria-label={`Delete ${article.title}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
