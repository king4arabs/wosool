"use client"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { useLocale } from "@/lib/locale"
import { apiEndpoints } from "@/lib/api-reference"

export function ApiReference() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  return <PublicLayout><div className="bg-[var(--page-bg)] pb-16">
    <header className="bg-[var(--surface-inverse)] px-5 py-14 text-[var(--on-dark)]"><div className="mx-auto max-w-5xl">
      <p className="font-bold text-[var(--on-dark-muted)]">{ar ? "وصول / للمطورين" : "WOSOOL / DEVELOPERS"}</p><h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">{ar ? "واجهة البيانات العامة" : "Build with Wosool public data"}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--on-dark-muted)]">{ar ? "مرجع للقراءة فقط: ملفات المؤسسين والأخبار المنشورة ودليل الشركات. استخدم المصادر وافصل الحقائق عن مؤشرات النمو." : "A read-only reference for founder discovery, published news and sourced startups. Preserve attribution and distinguish facts from growth signals."}</p>
      <a href="/api/openapi.json" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-white px-5 py-3 font-bold text-[var(--surface-inverse)]">{ar ? "تنزيل مواصفة OpenAPI" : "Download OpenAPI specification"}</a>
    </div></header>
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-10">
      <section className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 sm:p-8"><h2 className="text-2xl font-bold">{ar ? "ابدأ بطلب واحد" : "Start with one request"}</h2><p className="mt-3 leading-7">{ar ? "لا تتطلب هذه القراءات مفتاح API. البيانات تعكس السجلات العامة فقط؛ وقد تمنع حدود الطلبات الاستخدام المفرط." : "These reads require no API key and return public records only. Handle rate limits and retry only after the server allows it."}</p><pre dir="ltr" className="mt-5 overflow-x-auto rounded-xl bg-[var(--surface-inverse)] p-5 text-sm text-[var(--on-dark)]"><code>{'curl -H "Accept: application/json" \\\n  "https://wosool.org/api/v1/news?region=saudi&per_page=10"'}</code></pre></section>
      <section><h2 className="mb-5 text-2xl font-bold">{ar ? "نقاط الوصول" : "Endpoints"}</h2><div className="space-y-4">{apiEndpoints(locale).map(endpoint => <article key={endpoint.path} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5"><div dir="ltr" className="flex flex-wrap items-center gap-3"><span className="rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-sm font-bold">GET</span><code className="break-all text-sm font-bold text-[var(--link)]">{endpoint.path}</code></div><p className="mt-3 font-semibold">{endpoint.summary}</p>{endpoint.description && <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{endpoint.description}</p>}{endpoint.parameters.length > 0 && <p className="mt-2 break-words text-sm text-[var(--text-muted)]">{ar ? "المعاملات: " : "Parameters: "}<code dir="ltr">{endpoint.parameters.join(", ")}</code></p>}</article>)}</div></section>
      <section className="rounded-3xl bg-[var(--surface-soft)] p-6 leading-8"><h2 className="mb-3 text-xl font-bold">{ar ? "قبل التكامل" : "Before you integrate"}</h2><p>{ar ? "اتبع بيانات الصفحات في meta. قيمة region للأخبار تختلف عن دليل الشركات؛ راجع المواصفة. عالج 404 و422 و429 و503. لا يعني فحص الجاهزية نجاح البريد أو النسخ الاحتياطي. عمليات الأعضاء والإدارة تتطلب جلسات آمنة وصلاحيات وليست ضمن هذا المرجع." : "Follow pagination meta. News and startup-directory region values differ; use the specification. Handle 404, 422, 429 and 503 responses. Readiness does not prove email delivery or backup recovery. Member and admin writes require secure sessions and authorization and are outside this reference."}</p><p className="mt-3">{ar ? "هذه النسخة توثق نقاط الوصول العامة الأساسية؛ مخططات حقول السجلات قابلة للتوسعة ولم تُستكمل لكل الحقول بعد." : "This initial contract covers core public endpoints; record schemas are extensible and do not yet describe every field."}</p></section>
      <Link href="/wiki" className="inline-flex min-h-11 items-center font-bold text-[var(--link)] underline">{ar ? "مركز المعرفة" : "Explore the knowledge hub"}</Link>
    </div>
  </div></PublicLayout>
}
