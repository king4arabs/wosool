import Link from "next/link"
import { Home, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PublicLayout } from "@/components/layout/PublicLayout"

export default function NotFound() {
  return (
    <PublicLayout>
      <section className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <p className="text-8xl font-bold text-brand-gold mb-4">404</p>
          <h1 className="text-3xl font-bold text-brand-navy mb-3">
            Page not found
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/founders">
                <Search className="h-4 w-4 mr-2" />
                Explore Founders
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/about", label: "About" },
              { href: "/programs", label: "Programs" },
              { href: "/events", label: "Events" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-500 hover:text-brand-gold transition-colors underline underline-offset-2"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
