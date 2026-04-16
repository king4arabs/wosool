"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")

      if (password !== passwordConfirmation) {
        setError("Passwords do not match.")
        return
      }

      setIsSubmitting(true)

      try {
        await register(name, email, password, passwordConfirmation)
        router.push("/dashboard")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [name, email, password, passwordConfirmation, register, router]
  )

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
          <h1 className="text-2xl font-bold text-[#0A1628] mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Join Wosool and connect with founders across the GCC
          </p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400">
                Must contain uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm password</Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Already have an account?
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account, you agree to our{" "}
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
