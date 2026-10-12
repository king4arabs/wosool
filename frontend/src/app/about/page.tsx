"use client"

import Link from "next/link"
import { Check, Globe, Heart, Lightbulb, Shield, Users } from "lucide-react"
import { AboutEnglish } from "./AboutEnglish"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { SectionHeader } from "@/components/sections/SectionHeader"
import { WosoolBoard } from "@/components/sections/WosoolBoard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"

const principles = [
  {
    icon: Shield,
    title: "المؤسس أولًا",
    description: "نقيس كل قرار بسؤال واحد: هل يخلق قيمة فعلية للمؤسس؟ وصول بُني للمؤسسين، لا للمشهد الاستعراضي حولهم.",
  },
  {
    icon: Heart,
    title: "الثقة قبل التوسع",
    description: "نفضّل مجتمعًا أصغر وأكثر تفاعلًا على شبكة واسعة بلا عمق. جودة العلاقة أهم من عدد الأسماء.",
  },
  {
    icon: Lightbulb,
    title: "وضوح بلا مجاملة",
    description: "نؤمن بالملاحظات الصريحة والتقييم الواقعي، لأن المؤسس الجاد يحتاج إلى وضوح يساعده على اتخاذ القرار.",
  },
  {
    icon: Globe,
    title: "جذور خليجية وطموح عالمي",
    description: "نستوعب خصوصية البناء في السعودية والخليج، ونربطها بطموح يليق بشركات تريد أن تنافس على مستوى أعلى.",
  },
  {
    icon: Users,
    title: "العطاء جزء من العضوية",
    description: "أفضل المجتمعات تُبنى حين يشارك الأعضاء خبرتهم وشبكاتهم ووقتهم بسخاء ومسؤولية.",
  },
]

export default function AboutPage() {
  const { locale } = useLocale()
  if (locale === "en") return <AboutEnglish />

  return (
    <PublicLayout>
      <section className="bg-[#0A1628] px-4 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="gold" className="mb-4 px-4 py-1.5 text-xs tracking-widest">
            قصتنا
          </Badge>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">عن وصول</h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-300">
            من لقاء مؤسسين في لندن إلى مجتمع يبني فيه المؤسسون القيمة لبعضهم بعضًا.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold tracking-widest text-[var(--color-logo-blue)]">رسالتنا</p>
              <h2 className="mb-6 text-4xl font-bold text-[#0A1628]">من مؤسس إلى مؤسس</h2>
              <p className="mb-6 leading-relaxed text-gray-600">
                رسالتنا أن نجمع المؤسسين في مجتمع يتبادلون فيه الخبرة والدعم، ونفتح لهم سبل الوصول إلى العلاقات والفرص والموارد المناسبة لبناء شركاتهم.
              </p>
              <p className="leading-relaxed text-gray-600">
                نبدأ من احتياجات المؤسس الحقيقية، ونحوّل قيمة كل لقاء إلى تعاون يستمر بعده.
              </p>
            </div>
            <div className="rounded-3xl bg-[#F7F8FB] p-10">
              <p className="mb-3 text-sm font-semibold tracking-widest text-[var(--color-logo-blue)]">رؤيتنا</p>
              <h3 className="mb-4 text-2xl font-bold text-[#0A1628]">مجتمع ينمو بعطاء مؤسسيه</h3>
              <p className="leading-relaxed text-gray-600">
                رؤيتنا شبكة مؤسسين من السعودية إلى العالم، يساند بعضهم بعضًا لبناء شركات أقوى وأثر أبقى.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-cream px-4 py-24" id="story">
        <div className="mx-auto max-w-4xl">
          <SectionHeader eyebrow="قصة وصول" heading="بدأت الحكاية في لندن" centered />
          <div className="space-y-5 rounded-2xl bg-white p-8 leading-relaxed text-gray-700 shadow-sm">
            <p>خلال برنامج Multiverse من CODE التابع لوزارة الاتصالات وتقنية المعلومات، التقى مؤسسون في لندن ووجدوا في تبادل الخبرات ومساندة بعضهم بعضًا قيمة تستحق أن تستمر بعد البرنامج.</p>
            <p>من تلك التجربة نشأت وصول: مبادرة من المؤسسين للمؤسسين، نمت بدعم المؤسسين ووزارة الاتصالات وتقنية المعلومات لتصبح مجتمعًا منظّمًا يجمعهم حول التعاون والثقة.</p>
            <p>شكر خاص لمعالي السواحه ومعالي الروبيعان وفرق وزارة الاتصالات وتقنية المعلومات على دعمهم.</p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24" id="objectives">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="أهدافنا" heading="ما الذي نسعى إلى تحقيقه؟" centered />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "تبادل الخبرة", text: "إتاحة مساحة آمنة يشارك فيها المؤسسون دروسهم وتحدياتهم العملية." },
              { title: "بناء العلاقات", text: "تيسير التعارف الهادف بين المؤسسين وممكّني المنظومة والشركاء." },
              { title: "تحويل التواصل إلى أثر", text: "تمكين التعاون الذي يساعد المؤسسين على تطوير شركاتهم وتوسيع فرصها." },
            ].map(({ title, text }) => (
              <article key={title} className="rounded-2xl bg-[var(--surface-soft)] p-8">
                <h3 className="mb-3 text-xl font-bold text-[var(--text-strong)]">{title}</h3>
                <p className="leading-relaxed text-[var(--text-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader eyebrow="لماذا وُجد وصول" heading="الفجوة التي نعمل على سدّها" centered />
          <div className="space-y-6 text-right">
            {[
              "كثير من شبكات المؤسسين في المنطقة إما واسعة أكثر من اللازم فتفقد القيمة، أو ضيقة أكثر من اللازم فتتحول إلى دائرة مغلقة. وصول يوازن بين الانتقاء والانفتاح المدروس.",
              "المؤسس في السعودية والخليج يواجه تحديات لا تعالجها الموارد العامة بسهولة، من تنظيم السوق إلى الوصول المبكر إلى العملاء والشركاء والمواهب.",
              "أفضل دعم يحصل عليه المؤسس غالبًا يأتي من مؤسس آخر مرّ بتجربة مشابهة. نحن نحول هذا الدعم من صدفة إلى بنية متاحة ومنظمة.",
            ].map((text, index) => (
              <div key={index} className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-blue)] text-sm font-bold text-[var(--color-logo-blue)]">
                  {index + 1}
                </span>
                <p className="leading-relaxed text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24" id="principles">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="مبادئنا" heading="القيم التي توجه كل ما نقوم به" centered />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl bg-[#F7F8FB] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628]">
                  <Icon className="h-5 w-5 text-[var(--color-logo-blue)]" />
                </div>
                <h3 className="mb-2 font-semibold text-[#0A1628]">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] px-4 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeader
            eyebrow="آلية المجتمع"
            heading="كيف تعمل شبكة وصول"
            subheading="تعمل وصول بصيغة الدعوة أو التقديم. تتم مراجعة كل عضو والتحقق من ملفه قبل منحه حق الوصول إلى المجتمع والبرامج والتعريفات."
            centered
            light
          />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: "1", title: "قدّم", desc: "شاركنا رحلتك الحالية وما الذي تبحث عنه من المجتمع." },
              { step: "2", title: "يُراجع ملفك", desc: "يراجع الفريق الملف ويتحقق من ملاءمته لروح المجتمع وجودة الإضافة المتبادلة." },
              { step: "3", title: "ابدأ الاستفادة", desc: "بعد القبول، تحصل على الوصول إلى الشبكة والبرامج وفرص التعارف المنتقاة." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-2xl bg-white/5 p-6">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-logo-blue)] font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-cream px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeader eyebrow="الحوكمة والثقة" heading="مجتمع مبني على المساءلة" centered />
          <div className="space-y-4 rounded-2xl bg-white p-8 shadow-sm">
            {[
              "تتم مراجعة جميع الأعضاء يدويًا قبل منحهم حق الوصول.",
              "تعكس آليات التقييم والمشاركة تقدير الأعضاء الأكثر فاعلية وإضافة.",
              "تُعامل الخصوصية والسرية باعتبارهما جزءًا أساسيًا من الثقة داخل المجتمع.",
              "تخضع التعريفات والإحالات لمعايير واضحة تتجنب تضارب المصالح وتحفظ الجودة.",
              "لا تُباع بيانات الأعضاء لأي طرف ثالث، ولا تُستخدم إلا في إطار الخدمة وتجربة العضوية.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-blue)]" aria-hidden="true" />
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WosoolBoard />

      <section className="bg-[var(--surface)] px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-strong)]">تواصل معنا</h2>
        <a className="mt-3 inline-block text-lg font-semibold text-[var(--link)] underline underline-offset-4" href="mailto:Info@wosool.org" dir="ltr">Info@wosool.org</a>
      </section>

      <section className="bg-[#EEF2FF] px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-[#0A1628]">هل أنت مستعد لتكون جزءًا من القصة؟</h2>
          <p className="mb-8 text-[#0A1628]/70">تُراجع الطلبات باستمرار مع مراعاة جودة الملاءمة وإضافة كل عضو للمجتمع.</p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/apply">قدّم للانضمام إلى وصول</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}
