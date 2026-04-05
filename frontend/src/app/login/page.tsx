import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-bold text-[#0A1628]">Wosool</span>
            <span className="text-base text-[#C9A84C] font-medium tracking-widest uppercase">
              وصول
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Founders to Founders</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#0A1628] mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">
            Log in to access your Wosool dashboard
          </p>

          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#C9A84C] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Log In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Not a Wosool member yet?
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/apply">Apply to Join Wosool</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By logging in, you agree to our{" "}
          <Link href="/terms" className="hover:text-gray-600 underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-gray-600 underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
