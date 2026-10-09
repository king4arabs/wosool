"use client"
import { useLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
export function CollectionStatus({ loading, error, retry, hasMore, loadMore, empty }: { loading: boolean; error: string | null; retry: () => void; hasMore: boolean; loadMore: () => void; empty: boolean }) {
  const { locale } = useLocale()
  const ar = locale === "ar"
  if (!loading && !error && !hasMore && !empty) return null
  return <div className="mx-auto max-w-7xl px-4 py-6 text-center">
    {loading && <p role="status">{ar ? "جارٍ تحميل المحتوى…" : "Loading content…"}</p>}
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5"><p>{error}</p><Button variant="outline" className="mt-3" onClick={retry}>{ar ? "إعادة المحاولة" : "Try again"}</Button></div>}
    {!loading && !error && empty && <p>{ar ? "لا توجد عناصر منشورة حاليًا." : "No published items yet."}</p>}
    {!loading && !error && hasMore && <Button variant="outline" onClick={loadMore}>{ar ? "عرض المزيد" : "Load more"}</Button>}
  </div>
}
