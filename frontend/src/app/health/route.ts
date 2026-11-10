import { getFrontendReleaseRevision } from "@/lib/release-revision"

// Liveness only; check Laravel separately at /api/ready.
export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(
    { status: "healthy", service: "wosool-frontend", revision: getFrontendReleaseRevision() },
    { headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } },
  )
}
