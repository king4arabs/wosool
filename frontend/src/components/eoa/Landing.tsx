'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ArrowLeft, Check, MoveUpRight } from 'lucide-react'
import { useLocale } from '@/lib/locale'
import { Notice, PartnerStrip, useEoaProgram } from './Shared'

export function EoaLanding({ home = false }: { home?: boolean }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program } = useEoaProgram()
  const Arrow = ar ? ArrowLeft : ArrowUpRight
  return (
    <div className="eoa">
      <section className="eoa-hero">
        <div className="eoa-container eoa-hero-grid">
          <div>
            <div className="eoa-eyebrow">
              <span className="eoa-dot" />
              WOSOOL / EO RIYADH ACCELERATOR
            </div>
            <h1>
              {home
                ? ar
                  ? 'من مؤسس إلى مؤسس.'
                  : 'Founders to Founders.'
                : ar
                  ? 'مؤسسون سعوديون.\nنمو بلا حدود.'
                  : 'Saudi founders.\nExtraordinary growth.'}
            </h1>
            <p className="eoa-hero-tag">
              {ar
                ? 'مؤسسون سعوديون. علاقات عالمية. نمو استثنائي.'
                : 'Saudi Founders. Global Connections. Extraordinary Growth.'}
            </p>
            <p>
              {ar
                ? 'وصول بوابتك الرقمية إلى EO Riyadh Accelerator. تعلم عملي، ومساءلة بنّاءة، وعلاقات مع مؤسسين يساعدونك على تطوير شركتك وقيادتك.'
                : 'Wosool is your digital gateway to EO Riyadh Accelerator. Turn ambition into a stronger business through practical learning, peer accountability and founder connections.'}
            </p>
            <div className="eoa-actions">
              <Link className="eoa-btn" href="/EOA/apply">
                {ar ? 'تقدم إلى EO Accelerator' : 'Apply to EO Accelerator'}
                <Arrow size={18} />
              </Link>
              <Link className="eoa-btn eoa-btn-outline" href="/EOA/eligibility">
                {ar ? 'تحقق من الأهلية' : 'Check eligibility'}
              </Link>
            </div>
            <p className="eoa-hero-note">
              {program?.applications_open
                ? ar
                  ? 'باب التقديم المحلي مفتوح.'
                  : 'Local applications are open.'
                : ar
                  ? 'مسار الرياض قيد الإعداد. يمكنك إنشاء حساب وتجهيز طلبك.'
                  : 'The Riyadh program is in preparation. Create your account and prepare your application.'}
            </p>
          </div>
          <div className="eoa-path-card">
            <div className="eoa-path-head">
              <Image
                src="/partners/eo-riyadh-inverse.png"
                alt="EO Riyadh"
                width={160}
                height={64}
                priority
                unoptimized
              />
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
            ].map(([title, body], i) => (
              <div className="eoa-path-step" key={title}>
                <span>0{i + 1}</span>
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
      </section>
      <PartnerStrip partners={program?.partners ?? []} />
      {(ar ? program?.public_message_ar : program?.public_message_en) && (
        <div className="eoa-container">
          <Notice>
            {ar ? program?.public_message_ar : program?.public_message_en}
          </Notice>
        </div>
      )}
      <section className="eoa-statbar">
        <div className="eoa-container">
          {[
            [
              '$250k–$999,999',
              ar ? 'الإيراد السنوي بالدولار' : 'Annual revenue in USD',
            ],
            ['04', ar ? 'أيام تعلم سنوياً' : 'Learning days each year'],
            [
              ar ? 'شهرياً' : 'Monthly',
              ar ? 'مجموعات المساءلة' : 'Accountability groups',
            ],
            ['02', ar ? 'عامان للبرنامج' : 'Year learning program'],
          ].map(([n, label]) => (
            <div key={label}>
              <strong dir="ltr">{n}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
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
            ].map(([title, body], i) => (
              <article className="eoa-pillar" key={title}>
                <span>0{i + 1}</span>
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
                ? 'نربط تطوير الشركات وبناء القدرات الوطنية وطموح القطاع الخاص بمستهدفات رؤية السعودية 2030.'
                : 'Connect company growth, national capabilities and private-sector ambition with Saudi Vision 2030.'}
            </p>
            <Link className="eoa-text-link" href="/EOA/about">
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
              <Link className="eoa-btn" href="/EOA/apply">
                {ar ? 'ابدأ رحلتك' : 'Start your journey'}
                <Arrow size={18} />
              </Link>
              <Link className="eoa-text-link" href="/EOA/contact">
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
