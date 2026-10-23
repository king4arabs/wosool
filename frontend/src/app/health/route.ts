import { dependencyHealth } from "@/lib/health"

// Liveness by default; dependency readiness is explicitly requested.
export const dynamic = "force-dynamic"

export function GET(request: Request) {
  if (new URL(request.url).searchParams.get("check") === "dependencies") {
    return dependencyHealth({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_ENABLE_DEMO_CONTENT: process.env.NEXT_PUBLIC_ENABLE_DEMO_CONTENT,
    })
  }
  return Response.json(
    { status: "healthy", service: "wosool-frontend" },
    { headers: { "Cache-Control": "no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" } },
  )
}
