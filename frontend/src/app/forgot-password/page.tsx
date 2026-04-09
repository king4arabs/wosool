"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setSubmitting(true)
    // Simulate API call — auth endpoints will be implemented in a future cycle
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0A1628]">Wosool</span>
              <span className="text-base text-[#C9A84C] font-medium tracking-widest uppercase">
                وصول
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-[#C9A84C]/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-[#C9A84C]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#0A1628] mb-2">Check Your Email</h1>
            <p className="text-gray-500 text-sm mb-6">
              If an account exists for <span className="font-medium text-[#0A1628]">{email}</span>,
              you&apos;ll receive a password reset link shortly.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setSubmitted(false)
              }}
              className="text-[#C9A84C] hover:underline"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-[#0A1628] mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter the email address associated with your account and we&apos;ll send
            you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                aria-invalid={!!error}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending…
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-[#C9A84C] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
