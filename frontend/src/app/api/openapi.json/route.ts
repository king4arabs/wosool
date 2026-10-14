import { publicApiSpec } from "@/lib/public-api-spec"
export const dynamic = "force-static"
export function GET() { return Response.json(publicApiSpec, { headers: { "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } }) }
