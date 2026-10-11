'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MoveUpRight,
} from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { programAvailability } from '@/lib/eoa'
import { EoaJourney } from './Journey'
import { EoaLogo } from './Logo'
import { EoaHeroMedia } from './HeroMedia'
import { Notice, PartnerStrip, useEoaProgram } from './Shared'

export function EoaLanding() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program, failed, retry } = useEoaProgram()
  const availability = programAvailability(program, failed)
  const Arrow = ar ? ArrowLeft : ArrowUpRight

  const metrics = ar
    ? [
        ['$250K–$999K', 'نطاق الإيراد السنوي المستهدف'],
        ['4', 'ركائز أساسية للنمو'],
        ['12–24', 'شهراً للرحلة المحلية المقترحة'],
        ['$1M+', 'طموح النمو السنوي'],
      ]
    : [
        ['$250K–$999K', 'Target annual revenue'],
        ['4', 'Core growth pillars'],
        ['12–24 Months', 'Proposed local journey'],
        ['$1M+', 'Annual growth ambition'],
      ]

  return (
    <div className="eoa">
      <section className="eoa-hero" aria-labelledby="eoa-hero-title">
        <EoaHeroMedia ar={ar} />
        <div className="eoa-container eoa-hero-shell">
          <div className="eoa-hero-grid">
            <div className="eoa-hero-copy">
              <div className="eoa-eyebrow">
                <span className="eoa-dot" />
                {ar
                  ? 'منظمة رواد الأعمال | EO الرياض'
                  : "ENTREPRENEURS' ORGANIZATION | EO RIYADH"}
              </div>
              <EoaLogo className="eoa-hero-logo" inverse priority />
              <h1 id="eoa-hero-title" className="eoa-hero-title">
                {ar ? (
                  <>
                    <span>روّاد أعمال من الرياض.</span>
                    <span>علاقات عالمية.</span>
                    <span>نمو استثنائي.</span>
                  </>
                ) : (
                  <>
                    <span>Riyadh-based Founders.</span>
                    <span>Global Connections.</span>
                    <span>Extraordinary Growth.</span>
                  </>
                )}
              </h1>
              <p className="eoa-hero-message">
                {ar
                  ? 'انضم إلى رحلة يقودها المؤسسون لتعزيز أعمالك، وتنمية قيادتك، والتوسع نحو إيرادات سنوية تتجاوز مليون دولار من خلال التعلم العملي والعلاقات الريادية العالمية.'
                  : 'Join a founder-led journey to strengthen your business, grow your leadership and scale toward US$1M+ annual revenue through practical learning and global entrepreneurial connections.'}
              </p>
              <div className="eoa-hero-join-row">
                <div className="eoa-actions">
                  <Link className="eoa-btn" href="/eoa/apply">
                    {ar
                      ? 'انضم إلى مسرّعة EO الرياض'
                      : 'JOIN EO RIYADH ACCELERATOR'}
                    <Arrow size={18} />
                  </Link>
                  <Link className="eoa-btn eoa-btn-outline" href="/eoa/program">
                    {ar ? 'استكشف البرنامج' : 'Explore the Program'}
                  </Link>
                  <a
                    className="eoa-text-link"
                    href="https://eonetwork.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ar ? 'اكتشف EO' : 'Discover EO'}
                    <Arrow size={18} />
                  </a>
                </div>
                <EoaLogo className="eoa-hero-cta-logo" inverse />
              </div>
              <p className="eoa-hero-note" role="status">
                {availability === 'loading'
                  ? ar
                    ? 'جارٍ التحقق من حالة التقديم…'
                    : 'Checking application availability…'
                  : availability === 'unavailable'
                    ? ar
                      ? 'تعذر التحقق من حالة التقديم.'
                      : 'Application availability could not be verified.'
                    : availability === 'open'
                      ? ar
                        ? 'باب التقديم المحلي مفتوح.'
                        : 'Local applications are open.'
                      : ar
                        ? 'التقديم مغلق حالياً. تابع الإعلانات المعتمدة أو تواصل مع فريق البرنامج.'
                        : 'Applications are currently closed. Follow confirmed updates or contact the program team.'}
              </p>
              {failed && (
                <button
                  type="button"
                  className="eoa-btn eoa-btn-outline eoa-hero-retry"
                  onClick={retry}
                >
                  {ar ? 'إعادة المحاولة' : 'Try again'}
                </button>
              )}
            </div>

            <div className="eoa-path-card">
              <div className="eoa-path-head">
                <EoaLogo inverse />
                <span>{ar ? 'مسار المؤسس' : 'THE FOUNDER PATH'}</span>
              </div>
              <div className="eoa-growth-mark" aria-hidden="true">
                <MoveUpRight size={92} strokeWidth={1} />
              </div>
              {[
                [
                  ar ? 'ابنِ الأساس' : 'Build your foundation',
                  ar ? 'النقد • الاستراتيجية' : 'Cash • Strategy',
                ],
                [
                  ar ? 'نمِّ قدراتك' : 'Strengthen your leadership',
                  ar ? 'الأفراد • التنفيذ' : 'People • Execution',
                ],
                [
                  ar ? 'وسّع آفاقك' : 'Grow your possibilities',
                  ar
                    ? 'رحلة نحو جاهزية عضوية EO'
                    : 'A path toward EO membership readiness',
                ],
              ].map(([title, body], index) => (
                <div className="eoa-path-step" key={title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
              <div className="eoa-path-foot">
                {ar ? 'تعلّم. طبّق. تقدّم.' : 'LEARN. APPLY. PROGRESS.'}
              </div>
            </div>
          </div>

          <div className="eoa-hero-metrics" aria-label={ar ? 'مؤشرات البرنامج' : 'Program highlights'}>
            {metrics.map(([value, label]) => (
              <div className="eoa-hero-metric" key={label}>
                <strong dir="ltr">{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnerStrip partners={program?.partners ?? []} />

      {(ar ? program?.public_message_ar : program?.public_message_en) && (
        <div className="eoa-container">
          <Notice>
            {ar ? program?.public_message_ar : program?.public_message_en}
          </Notice>
        </div>
      )}

      <section className="eoa-section">
        <div className="eoa-container">
          <div className="eoa-section-head">
            <div>
              <span className="eoa-eyebrow">
                {ar
                  ? 'طموح أكبر. خطوات أوضح.'
                  : 'BIGGER AMBITION. CLEARER NEXT STEPS.'}
              </span>
              <h2>
                {ar
                  ? 'ابنِ الشركة التي تطمح إليها.'
                  : 'Build the company you envision.'}
              </h2>
            </div>
            <p>
              {ar
                ? 'أربع ركائز لتطوير أعمالك، بإيقاع يحوّل التعلم إلى تطبيق.'
                : 'Four pillars for your business, with a rhythm that turns learning into action.'}
            </p>
          </div>
          <div className="eoa-four-grid">
            {[
              [
                ar ? 'النقد' : 'Cash',
                ar
                  ? 'افهم التدفقات النقدية وخيارات تمويل النمو.'
                  : 'Understand cash flow and the choices that fund growth.',
              ],
              [
                ar ? 'الاستراتيجية' : 'Strategy',
                ar
                  ? 'وضّح تموضعك وحدد أولويات النمو.'
                  : 'Sharpen your positioning and growth priorities.',
              ],
              [
                ar ? 'الأفراد' : 'People',
                ar
                  ? 'طوّر فريقاً وقيادة يتقدمان مع شركتك.'
                  : 'Develop the team and leadership your business needs.',
              ],
              [
                ar ? 'التنفيذ' : 'Execution',
                ar
                  ? 'حوّل أهدافك إلى التزامات ونتائج قابلة للمتابعة.'
                  : 'Turn goals into commitments you can track.',
              ],
            ].map(([title, body], index) => (
              <article className="eoa-pillar" key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="eoa-section eoa-light">
        <div className="eoa-container eoa-two-grid">
          <div>
            <span className="eoa-eyebrow">
              {ar ? 'بقيادة المؤسسين' : 'FOUNDER LED'}
            </span>
            <h2>
              {ar
                ? 'محلي في جذوره.\nعالمي في علاقاته.'
                : 'Rooted in Riyadh.\nConnected to the world.'}
            </h2>
            <p>
              {ar
                ? 'تجمع الرحلة بين نمو الشركات وبناء القدرات القيادية وعلاقات المؤسسين داخل الرياض وعبر شبكة EO العالمية.'
                : 'The journey brings together company growth, leadership capability and founder relationships across Riyadh and the global EO network.'}
            </p>
            <Link className="eoa-text-link" href="/eoa/about">
              {ar ? 'تعرف على البرنامج' : 'Meet the program'}
              <Arrow size={18} />
            </Link>
          </div>
          <div className="eoa-card">
            {[
              [
                ar ? 'EO الرياض' : 'EO Riyadh',
                ar
                  ? 'قيادة الفرع وحوكمة البرنامج.'
                  : 'Chapter leadership and program governance.',
              ],
              [
                'EO Accelerator',
                ar
                  ? 'الإطار التعليمي ومتطلبات البرنامج.'
                  : 'The learning framework and program requirements.',
              ],
              [
                ar ? 'وصول' : 'Wosool',
                ar
                  ? 'الاكتشاف والتقديم والتنسيق وخدمات المشاركين.'
                  : 'Discovery, applications, coordination and participant services.',
              ],
            ].map(([name, body]) => (
              <div className="eoa-role-row" key={name}>
                <Check size={18} />
                <div>
                  <h3>{name}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EoaJourney program={program} />

      <section className="eoa-section">
        <div className="eoa-container eoa-two-grid">
          <div>
            <span className="eoa-eyebrow">
              {ar ? 'خطوتك القادمة' : 'YOUR NEXT CHAPTER'}
            </span>
            <h2>
              {ar
                ? 'طموحك يستحق\nمجتمعاً يدفعه للأمام.'
                : 'Your ambition deserves\na community behind it.'}
            </h2>
          </div>
          <div>
            <p>
              {ar
                ? 'ابدأ بتقييم الأهلية، ثم جهز طلبك واحفظ تقدمك. تراجع اللجنة جاهزية شركتك والتزامك بالنمو.'
                : 'Start with an eligibility check, then prepare your application and save your progress. The committee reviews company readiness and your commitment to growth.'}
            </p>
            <div className="eoa-actions">
              <Link className="eoa-btn" href="/eoa/apply">
                {ar ? 'ابدأ رحلتك' : 'Start your journey'}
                <Arrow size={18} />
              </Link>
              <Link className="eoa-text-link" href="/eoa/contact">
                {ar ? 'انضم كشريك' : 'Become a partner'}
              </Link>
            </div>
            <p className="eoa-muted">
              {ar
                ? 'التقديم لا يضمن القبول أو عضوية EO. تُدار مناقشات الاستثمار بشكل مستقل عن البرنامج.'
                : 'Admission and EO membership require separate review. Investment discussions are independent of program participation.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
