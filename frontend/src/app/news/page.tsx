import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { NewsCard } from "@/components/sections/NewsCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { newsItems } from "@/data/seed"

const categories = ["All", "Founder Update", "Ecosystem News", "Event Recap", "Program Update", "Insights", "Announcement"]

export default function NewsPage() {
  const featured = newsItems[0]
  const rest = newsItems.slice(1)

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            News & Insights
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Stories From the Ecosystem
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Founder updates, ecosystem news, program announcements, and insights
            from the Wosool community.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 px-4 bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                i === 0
                  ? "bg-[#0A1628] text-white"
                  : "text-gray-600 hover:text-[#0A1628] hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0A1628] text-white rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row gap-8 items-start">
            <div
              className="w-full lg:w-64 h-48 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-5xl">📰</span>
            </div>
            <div className="flex-1">
              <Badge variant="gold" className="mb-4">{featured.category}</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                {featured.title}
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{new Date(featured.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="Latest" heading="Recent Stories" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Digest Signup */}
      <section className="py-20 px-4 bg-[#0A1628] text-white">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Weekly Founder Digest</h2>
          <p className="text-gray-300 mb-8">
            The best stories, updates, and insights from the Wosool ecosystem —
            delivered to your inbox every Tuesday.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-[#C9A84C]"
              aria-label="Email for weekly digest"
            />
            <Button type="submit">Subscribe</Button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
