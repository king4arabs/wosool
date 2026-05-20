"use client"

import { useState, useCallback } from "react"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast"
import { api, ApiError } from "@/lib/api"
import { Mail, Users, Building, Newspaper, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

const categories = [
  { icon: Mail, label: "استفسار عام", value: "general", description: "أسئلة عامة أو طلبات تواصل أولية" },
  { icon: Users, label: "شراكات", value: "partnerships", description: "شراكات تدعم مجتمع وصول أو برامجه" },
  { icon: Building, label: "رعاية", value: "sponsorship", description: "الرعاية المرتبطة بالمنصة أو الفعاليات" },
  { icon: Newspaper, label: "إعلام", value: "media", description: "استفسارات الصحافة والظهور الإعلامي" },
]

interface ContactFormData {
  name: string
  email: string
  category: string
  subject: string
  message: string
  company: string
}

type ContactErrors = Partial<Record<keyof ContactFormData, string>>

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  category: "general",
  subject: "",
  message: "",
  company: "",
}

function validateContact(data: ContactFormData): ContactErrors {
  const errors: ContactErrors = {}
  if (!data.name.trim()) errors.name = "يرجى إدخال الاسم."
  if (!data.email.trim()) errors.email = "يرجى إدخال البريد الإلكتروني."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "يرجى إدخال بريد إلكتروني صحيح."
  if (!data.category) errors.category = "يرجى اختيار التصنيف."
  if (!data.subject.trim()) errors.subject = "يرجى كتابة عنوان الرسالة."
  if (!data.message.trim()) errors.message = "يرجى كتابة الرسالة."
  if (data.message.length > 3000) errors.message = "يجب ألا تتجاوز الرسالة 3000 حرف."
  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600 mt-1">{message}</p>
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const updateField = useCallback(
    (field: keyof ContactFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateContact(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast("Please fill in all required fields.", "error")
      toast("يرجى استكمال جميع الحقول المطلوبة.", "error")
      return
    }

    setSubmitting(true)
    try {
      await api.post("/contact", formData)
      setSubmitted(true)
      toast("تم إرسال الرسالة بنجاح.", "success")
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object" && "errors" in err.data) {
        const serverErrors = (err.data as { errors: Record<string, string[]> }).errors
        const mapped: ContactErrors = {}
        for (const [key, messages] of Object.entries(serverErrors)) {
          if (key in formData) {
            mapped[key as keyof ContactFormData] = messages[0]
          }
        }
        setErrors(mapped)
        toast("يرجى مراجعة الحقول المعلّمة وتصحيحها.", "error")
      } else {
        toast("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.", "error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <PublicLayout>
        <section className="bg-[#0A1628] text-white py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-[#C9A84C]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              تم إرسال الرسالة
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              شكرًا لتواصلك معنا. وصلتنا رسالتك بنجاح.
            </p>
            <p className="text-gray-400 mb-8">
              سيعود إليك الفريق خلال يومي عمل إلى ثلاثة أيام عمل على{" "}
              <span className="text-white font-medium">{formData.email}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/">العودة إلى الرئيسية</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false)
                  setFormData(initialFormData)
                  setErrors({})
                }}
              >
                إرسال رسالة أخرى
              </Button>
            </div>
          </div>
        </section>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[#0A1628] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4 uppercase tracking-widest text-xs px-4 py-1.5">
            تواصل معنا
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">يسعدنا التواصل معك</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            سواء كان لديك سؤال، أو فكرة شراكة، أو رغبة في معرفة المزيد عن وصول، فنحن جاهزون للاستماع.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Category Selector */}
            <div className="lg:col-span-2">
              <SectionHeader eyebrow="التصنيف" heading="ما طبيعة هذا التواصل؟" />
              <div className="space-y-3">
                {categories.map(({ icon: Icon, label, value, description }) => (
                  <button
                    key={value}
                    onClick={() => updateField("category", value)}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${
                      formData.category === value
                        ? "border-[#C9A84C] bg-[#C9A84C]/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                    aria-pressed={formData.category === value}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        formData.category === value ? "bg-[#C9A84C] text-[#0A1628]" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0A1628]">{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 bg-[#F8F5EF] rounded-2xl">
                <h3 className="font-semibold text-[#0A1628] mb-2">طلب جلسة مباشرة</h3>
                <p className="text-sm text-gray-600 mb-4">
                  إذا رغبت في تنسيق مكالمة مع فريق وصول، فاستخدم النموذج واذكر في رسالتك أنك تطلب جلسة مباشرة.
                </p>
                <p className="text-xs text-gray-400">
                  متوسط زمن الرد: من يومي عمل إلى ثلاثة
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      placeholder="اكتب اسمك الكامل"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      aria-invalid={!!errors.name}
                    />
                    <FieldError message={errors.name} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">البريد الإلكتروني *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={!!errors.email}
                  />
                  <FieldError message={errors.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organisation">الجهة أو الشركة</Label>
                  <Input
                    id="organisation"
                    placeholder="اسم الشركة أو الجهة"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">عنوان الرسالة *</Label>
                  <Input
                    id="subject"
                    placeholder="عنوان مختصر وواضح"
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    aria-invalid={!!errors.subject}
                  />
                  <FieldError message={errors.subject} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">الرسالة *</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="اكتب تفاصيل طلبك أو فكرتك أو استفسارك..."
                    className="min-h-[140px]"
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    aria-invalid={!!errors.message}
                  />
                  <div className="flex justify-between">
                    <FieldError message={errors.message} />
                    <span className="text-xs text-gray-400">{formData.message.length}/3000</span>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      جارٍ الإرسال...
                    </>
                  ) : (
                    "إرسال الرسالة"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative contacts */}
      <section className="py-16 px-4 section-cream">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-2">يمكنك أيضًا التواصل معنا مباشرة عبر</p>
          <a
            href="mailto:hello@wosool.org"
            className="text-[#C9A84C] font-semibold hover:underline"
          >
            hello@wosool.org
          </a>
        </div>
      </section>
    </PublicLayout>
  )
}
