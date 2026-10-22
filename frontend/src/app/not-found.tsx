import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PublicLayout } from "@/components/layout/PublicLayout"

export default function NotFound() {
  return (
    <PublicLayout>
      <section className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <p className="mb-4 text-8xl font-bold text-[var(--color-logo-blue)]">404</p>
          <h1 className="mb-3 text-3xl font-bold text-[var(--color-primary-navy)]">الصفحة غير موجودة</h1>
          <p className="mb-8 leading-relaxed text-gray-600">
            يبدو أن الصفحة التي تبحث عنها غير متاحة أو تم نقلها. يمكنك العودة إلى الصفحة الرئيسية أو متابعة التصفح من الروابط التالية.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="ml-2 h-4 w-4" />
                العودة إلى الرئيسية
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/founders">
                <Search className="ml-2 h-4 w-4" />
                استكشف المؤسسين
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/about", label: "عن وصول" },
              { href: "/programs", label: "البرامج" },
              { href: "/events", label: "الفعاليات" },
              { href: "/contact", label: "تواصل معنا" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-[var(--color-logo-blue)]"
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
