'use client'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import type { EoaProgram } from '@/lib/eoa'
export function EoaJourney({ program }: { program: EoaProgram | null }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const steps = ar
    ? [
        ['إنشاء الحساب', 'سجّل بياناتك ووثّق بريدك الإلكتروني.'],
        [
          'اختيار المسار والتقديم',
          'اختر مسارك المفضل وأكمل بيانات الشركة والإيرادات والمستندات.',
        ],
        [
          'المراجعة والمقابلة',
          'تابع طلبات المعلومات وموعد المقابلة من لوحة وصول.',
        ],
        [
          'القبول والانضمام',
          'تعتمد القيادة المسار، ثم تستكمل متطلبات المشاركة والتسجيل.',
        ],
      ]
    : [
        ['Create your account', 'Register and verify your email address.'],
        [
          'Choose a track & apply',
          'Select your preferred track and complete company, revenue and evidence details.',
        ],
        [
          'Review & interview',
          'Follow information requests and interview updates in your Wosool dashboard.',
        ],
        [
          'Acceptance & onboarding',
          'Leadership confirms your track, then you complete participation and enrollment requirements.',
        ],
      ]
  return (
    <>
      <section className="eoa-section eoa-light" id="application-journey">
        <div className="eoa-container">
          <div className="eoa-section-head">
            <div>
              <span className="eoa-eyebrow">
                {ar
                  ? 'من التقديم إلى الانضمام'
                  : 'FROM APPLICATION TO ACCEPTANCE'}
              </span>
              <h2>
                {ar
                  ? 'رحلة واضحة في مكان واحد.'
                  : 'One clear application journey.'}
              </h2>
            </div>
            <Link className="eoa-text-link" href="/dashboard/eoa">
              {ar ? 'افتح لوحة EOA' : 'Open your EOA dashboard'} ↗
            </Link>
          </div>
          <ol className="eoa-journey-grid">
            {steps.map(([title, body], i) => (
              <li className="eoa-pillar" key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div className="eoa-actions">
            <Link className="eoa-btn" href="/EOA/apply">
              {ar ? 'ابدأ طلب الالتحاق' : 'Start your application'}
            </Link>
            <Link className="eoa-btn eoa-btn-outline" href="/EOA/account">
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
                ? 'تتضمن الرحلة أربعة أيام تعلم كل عام، ومجموعات مساءلة شهرية، وتطبيق الأدوات في شركتك ضمن برنامج تعلم يمتد عامين.'
                : 'The two-year learning program combines four learning days annually, monthly accountability groups and practical work on your own company.'}
            </p>
            <Link className="eoa-text-link" href="/EOA/eligibility">
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
                    href={`/EOA/apply?track=${track.id}`}
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
      <section className="eoa-section eoa-light">
        <div className="eoa-container eoa-two-grid">
          <div>
            <span className="eoa-eyebrow">
              {ar ? 'تواصل وتعلم وتقدم' : 'CONNECT. LEARN. GROW.'}
            </span>
            <h2>
              {ar
                ? 'من الرياض إلى مجتمع عالمي.'
                : 'From Riyadh to a global community.'}
            </h2>
            <p>
              {ar
                ? 'تعلّم من خبرات المؤسسين، وناقش تحدياتك مع الأقران، واستكشف فرص التواصل والتعلم المحلية والعالمية المتاحة للمشاركين.'
                : 'Learn from founder experience, work through challenges with peers, and explore the local and global connections and learning opportunities available to participants.'}
            </p>
            <Link className="eoa-text-link" href="/EOA/leadership">
              {ar
                ? 'تعرف على القيادة والمدربين'
                : 'Meet the leadership & coaches'}{' '}
              ↗
            </Link>
          </div>
          <div className="eoa-faq">
            <h3>{ar ? 'أسئلة قبل أن تبدأ' : 'Before you begin'}</h3>
            {(ar
              ? [
                  [
                    'كيف أتابع الطلب؟',
                    'تظهر المسودة وحالة المراجعة والمقابلة والقرار ومسار القبول في قسم EOA داخل لوحة وصول.',
                  ],
                  [
                    'ما رسوم المشاركة؟',
                    'تبلغ رسوم البرنامج العالمية 1,750 دولاراً سنوياً، وتُنشر الرسوم المحلية والرعاية ومساهمة المشارك بعد اعتمادها.',
                  ],
                  [
                    'هل أصبح عضواً في EO بعد البرنامج؟',
                    'تستعد من خلال البرنامج لمتطلبات العضوية. بلوغ مليون دولار من الإيراد خطوة أساسية؛ تبقى عضوية EO خاضعة لطلب ومراجعة مستقلين.',
                  ],
                ]
              : [
                  [
                    'How do I follow my application?',
                    'Your draft, review, interview, decision and accepted track appear in the EOA area of your Wosool dashboard.',
                  ],
                  [
                    'What are the participation fees?',
                    'The annual global program fee is US$1,750. Local fees, sponsorship and participant contributions are published once approved.',
                  ],
                  [
                    'Will I become an EO member?',
                    'The program prepares you for membership requirements. Reaching US$1 million in revenue is a key milestone; EO membership still requires a separate application and review.',
                  ],
                ]
            ).map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
            <Link className="eoa-text-link" href="/EOA/faq">
              {ar ? 'جميع الأسئلة الشائعة' : 'All frequently asked questions'}{' '}
              ↗
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
