'use client'

import Link from 'next/link'
import type { EoaProgram } from '@/lib/eoa'
import { useLocale } from '@/lib/locale'

export function EoaJourney({ program }: { program: EoaProgram | null }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'

  const steps = ar
    ? [
        ['اكتشف البرنامج', 'تعرّف على التعلم العملي ومجتمع المؤسسين والالتزام بالمشاركة.'],
        ['تحقق من الأهلية', 'راجع متطلبات المؤسس والشركة والإيراد السنوي والرسوم.'],
        ['قدّم طلبك', 'أنشئ حساباً ووثّق بريدك، ثم أكمل طلبك واحفظ تقدمك.'],
        ['المراجعة', 'تابع طلبات المعلومات والمقابلة وقرار اللجنة من حسابك.'],
        ['القبول', 'تؤكد قيادة البرنامج قرار القبول والمسار المناسب.'],
        ['الانضمام والتسجيل', 'استكمل متطلبات المشاركة وتأكيد الرسوم والتسجيل الرسمي.'],
        ['التعلم والمساءلة', 'شارك في أربعة أيام تعلم سنوياً واجتماعات الأقران، وطبّق أهدافك.'],
        ['إكمال البرنامج', 'راجع تقدم شركتك ونتائج التعلم والخطوات التالية مع القيادة.'],
        ['التقديم لعضوية EO', 'عند استيفاء شروط العضوية، قدّم طلباً مستقلاً يراجعه الفرع.'],
      ]
    : [
        ['Discover', 'Explore practical learning, the founder community and the participation commitment.'],
        ['Check eligibility', 'Review founder, company, annual revenue and fee requirements.'],
        ['Apply', 'Create an account, verify your email, and complete or resume your application.'],
        ['Review', 'Follow information requests, interviews and committee decisions in your account.'],
        ['Acceptance', 'Program leadership confirms your admission decision and track.'],
        ['Onboarding', 'Complete participation requirements, fee confirmation and official enrollment.'],
        ['Learn & apply', 'Join four learning days each year, meet your accountability group and pursue your goals.'],
        ['Completion', 'Review your company’s progress, learning outcomes and next steps with leadership.'],
        ['EO membership application', 'When eligible, apply separately for membership through the chapter’s review process.'],
      ]

  return (
    <>
      <section className="eoa-section eoa-light" id="application-journey">
        <div className="eoa-container">
          <div className="eoa-section-head">
            <div>
              <span className="eoa-eyebrow">
                {ar
                  ? 'من الاكتشاف إلى آفاق جديدة'
                  : 'FROM DISCOVERY TO YOUR NEXT CHAPTER'}
              </span>
              <h2>
                {ar
                  ? 'كل خطوة تدفعك للأمام.'
                  : 'A clear path, at every stage.'}
              </h2>
            </div>
            <Link className="eoa-text-link" href="/dashboard/eoa">
              {ar ? 'افتح لوحة EOA' : 'Open your EOA dashboard'} ↗
            </Link>
          </div>
          <ol className="eoa-journey-grid eoa-full-journey">
            {steps.map(([title, body], index) => (
              <li className="eoa-pillar" key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div className="eoa-actions">
            <Link className="eoa-btn" href="/eoa/apply">
              {ar ? 'ابدأ طلب الالتحاق' : 'Start your application'}
            </Link>
            <Link className="eoa-btn eoa-btn-outline" href="/eoa/account">
              {ar ? 'إنشاء حساب أو الدخول' : 'Create account or sign in'}
            </Link>
          </div>
        </div>
      </section>

      <section className="eoa-section" id="admission">
        <div className="eoa-container eoa-two-grid">
          <div>
            <span className="eoa-eyebrow">
              {ar ? 'هل البرنامج مناسب لك؟' : 'IS THIS YOUR NEXT STEP?'}
            </span>
            <h2>
              {ar
                ? 'لمؤسسي الشركات الطامحين للنمو.'
                : 'For founders ready to grow.'}
            </h2>
            <p>
              {ar
                ? 'يستهدف البرنامج مؤسسي ومالكي الشركات القائمة بإيرادات سنوية بين 250 ألفاً و999,999 دولار أمريكي، ممن يسعون للنمو إلى مليون دولار وأكثر.'
                : 'The program serves owners and founders of operating businesses with annual revenue from US$250,000 to US$999,999, aiming to reach US$1 million and beyond.'}
            </p>
            <p>
              {ar
                ? 'يمتد برنامج التعلم لعامين، ويشمل أربعة أيام تعلم كاملة كل عام و8–12 لقاء مساءلة، عادة لساعتين إلى أربع ساعات شهرياً، مع التطبيق العملي داخل شركتك.'
                : 'The two-year learning program includes four full learning days each year and 8–12 accountability meetings, typically two to four hours monthly, alongside practical work in your company.'}
            </p>
            <Link className="eoa-text-link" href="/eoa/eligibility">
              {ar ? 'تحقق من الأهلية والرسوم' : 'Check eligibility & fees'} ↗
            </Link>
          </div>
          <div className="eoa-card">
            <h3>{ar ? 'مسارات التقديم' : 'Application tracks'}</h3>
            {program?.tracks?.length ? (
              program.tracks.map((track) => (
                <div className="eoa-space" key={track.id}>
                  <h4>{ar ? track.name_ar : track.name_en}</h4>
                  <p>{ar ? track.description_ar : track.description_en}</p>
                  <Link
                    className="eoa-text-link"
                    href={`/eoa/apply?track=${track.id}`}
                  >
                    {ar ? 'التقديم لهذا المسار' : 'Apply for this track'} ↗
                  </Link>
                </div>
              ))
            ) : (
              <>
                <h4>EO Riyadh Accelerator</h4>
                <p>
                  {ar
                    ? 'تظهر المسارات المتاحة في استمارة التقديم بعد نشرها من فريق البرنامج.'
                    : 'Available tracks appear in the application form when published by the program team.'}
                </p>
              </>
            )}
            <p className="eoa-muted eoa-space">
              {ar
                ? 'تؤكد القيادة مسار القبول والدفعة المناسبة بعد مراجعة طلبك.'
                : 'Leadership confirms your admission track and cohort after reviewing your application.'}
            </p>
          </div>
        </div>
      </section>


    </>
  )
}
