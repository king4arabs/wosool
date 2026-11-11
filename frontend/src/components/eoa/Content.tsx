'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useLocale } from '@/lib/locale'
import { LearningCalendar, CoachOverview, DeliveryModel, ParticipationTerms } from './ProgramGuide'
import { CohortModel } from './CohortModel'
import { EoaPrivacy } from './Privacy'
import { EoaContact } from './Contact'
import { EoaLeadership } from './Leadership'
import { EoaMentors } from './Mentors'
import { EoGlobalNetwork } from './GlobalNetwork'
import { EoaProgramDetails } from './EoaProgramDetails'
import { EoaPerks } from './Perks'
import { EoaDirectory } from './Directory'
import { Eligibility } from './Eligibility'
import { PartnerStrip, useEoaProgram } from './Shared'
import styles from './PublicDetails.module.css'
const titles: Record<string, [string, string]> = {
  alumni: ['الخريجون ومتابعة النمو', 'Alumni & continued growth'],
  privacy: ['الخصوصية والبيانات', 'Privacy & data'],
  about: ['عن المسرّعة', 'About the Accelerator'],
  program: ['ماذا ستعمل عليه في البرنامج؟', 'What you’ll work on'],
  eligibility: ['الأهلية والرسوم', 'Eligibility & fees'],
  partners: [
    'الشركاء وجهات الدعم',
    'Partners & support',
  ],
  faq: ['الأسئلة الشائعة', 'Frequently asked questions'],
  contact: ['تواصل مع فريق البرنامج', 'Talk to the program team'],
  learning: ['التعلم والفعاليات', 'Learning & events'],
  leadership: ['قيادة البرنامج', 'Program leadership'],
  mentors: ['المرشدون والمستشارون', 'Mentors & advisors'],
  perks: ['عروض الشركاء', 'Partner offers'],
}
export function EoaContent({ section }: { section: string }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program } = useEoaProgram()
  useEffect(() => { document.title = `EO Riyadh Accelerator — ${titles[section]?.[ar ? 0 : 1] ?? ''}` }, [ar, section])

  return (
    <section className={`eoa-section ${section === 'faq' ? styles.faqPage : ''}`}>
      <div className="eoa-container">
        <header className={`eoa-page-heading ${section === 'faq' ? 'mx-auto text-center' : ''}`}>
          <span className="eoa-eyebrow">EO RIYADH ACCELERATOR</span>
          <h1>{titles[section]?.[ar ? 0 : 1]}</h1>
          {section === 'faq' && <p>{ar ? 'إجابات واضحة عن الأهلية، والتقديم، وتجربة التعلم، وما بعد التخرج.' : 'Clear answers about eligibility, applying, the learning experience and life after graduation.'}</p>}
        </header>
        {['program', 'alumni'].includes(section) && <CohortModel ar={ar} />}
        {section === 'alumni' && <section className="eoa-card eoa-space"><h2>{ar?'الانتقال إلى عضوية EO':'Progressing to EO membership'}</h2><p>{ar?'بعد تحقق الأهلية، يراجع الفرع طلب عضويتك بصورة مستقلة. قد يستفيد خريجو EOA المؤهلون من تخفيض 50% على رسم الانضمام الأولي إلى EO وفق الشروط السارية؛ يختلف هذا الرسم عن رسوم المشاركة السنوية. يؤكد الفرع أهليتك والمبلغ قبل الدفع.':'The chapter reviews your EO membership application separately once you qualify. Eligible EOA graduates may receive a 50% reduction in the EO initiation fee under the applicable terms. This is separate from annual participation dues; the chapter confirms your eligibility and amount before payment.'}</p></section>}
        {section === 'alumni' && <div className="eoa-card eoa-space"><h2>{ar?'تستمر الرحلة بعد التخرج':'Your journey continues after graduation'}</h2><p>{ar?'تابع أهداف شركتك وتواصل مع مدربك وراجع الأنشطة ومواعيد المتابعة من حسابك. يسجل فريق البرنامج التخرج وخطة المتابعة، وتُقيّم أهلية EO بصورة مستقلة عند استيفاء شروطها.':'Keep tracking company goals, connect with your coach and review activities and follow-up dates in your account. The program team records graduation and follow-up plans; EO eligibility is assessed separately against its membership requirements.'}</p><Link href="/dashboard/eoa" className="eoa-btn">{ar?'افتح مساحة الخريجين':'Open your alumni workspace'}</Link></div>}
        {section === 'eligibility' && <><Eligibility /><ParticipationTerms ar={ar} program={program} /></>}
        {section === 'perks' && <EoaPerks />}
        {section === 'privacy' && <EoaPrivacy />}
        {section === 'about' && <CohortModel ar={ar} />}
        {section === 'about' && (
          <div className="eoa-two-grid">
            <div>
              <p className="eoa-lead">
                {ar
                  ? 'إذا كنت تدير شركة قائمة، فالبرنامج مساحة للعمل على القرارات التي تشغلك الآن.'
                  : 'If you run a business, this is a place to work on the decisions in front of you.'}
              </p>
              <p>
                {ar
                  ? 'تستخدم مسرّعة EO الرياض إطاراً للتعلم في النقد والاستراتيجية والأفراد والتنفيذ. تناقش تحديات شركتك مع مؤسسين آخرين، وتعود إلى فريقك بخطوات تجرّبها. من حسابك في وصول يمكنك متابعة طلبك وجلساتك ومواد التعلم.'
                  : 'EO Riyadh Accelerator uses four learning areas: Cash, Strategy, People and Execution. You discuss what’s happening in your business with other founders and take ideas back to your team. Your Wosool account keeps your application, sessions and learning materials in one place.'}
              </p>
              <div className="eoa-actions"><Link href="/eoa/eligibility" className="eoa-btn">{ar ? 'تحقق من الأهلية' : 'Check your eligibility'}</Link><Link href="/eoa/program" className="eoa-text-link">{ar ? 'استكشف رحلة التعلم' : 'Explore the learning journey'}</Link></div>
            </div>
            <div className="eoa-card">
              <h3>{ar ? 'من الرياض، مع مؤسسين آخرين' : 'Start with founders in Riyadh'}</h3>
              <p>
                {ar
                  ? 'في الدفعة، ستسمع كيف تعامل مؤسسون آخرون مع تحديات تشبه تحدياتك. وقد تتاح فرص للتعلم من تجارب عبر شبكة EO؛ تتحدد المشاركة وفق البرنامج.'
                  : 'In your cohort, you’ll hear how other founders approached problems like yours. Opportunities to learn from the wider EO network depend on what the program makes available.'}
              </p>
              <Link className="eoa-text-link" href="/eoa/leadership">
                {ar ? 'قيادة البرنامج' : 'Program leadership'} ↗
              </Link>
            </div>
          </div>
        )}
        {section === 'program' && (
          <>
            <p className="eoa-lead">
              {ar
                ? 'يقدم البرنامج منهجاً لمدة عامين مع مشاركة وتجديد سنويين وأيام تعلم ربع سنوية ومساءلة شهرية. مواعيد الدفعات مستقلة عن مدة المنهج، وتُنشر عند تأكيدها.'
                : 'The program follows a two-year curriculum with annual participation and renewal, quarterly Learning Days and monthly accountability. Intake dates are separate from curriculum duration and are published when confirmed.'}
            </p>
            <div className="eoa-four-grid">
              {(ar
                ? [['النقد', 'افهم دورة النقد وحدد ما يساعد شركتك على تمويل نموها.'], ['الاستراتيجية', 'وضح موقع شركتك وأولوياتها وفرص تميزها.'], ['الأفراد', 'طوّر فريقك ووضوح الأدوار وثقافة المسؤولية.'], ['التنفيذ', 'حوّل الاستراتيجية إلى أولويات ومقاييس ومتابعة منتظمة.']]
                : [['Cash', 'Understand your cash cycle and what supports sustainable growth.'], ['Strategy', 'Clarify your position, priorities and opportunities to stand out.'], ['People', 'Build your team, clear roles and a culture of accountability.'], ['Execution', 'Turn strategy into priorities, measures and a steady review rhythm.']]
              ).map(([title, body], i) => (
                <div className="eoa-pillar" key={title}>
                  <span>0{i + 1}</span>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <div className="eoa-two-grid eoa-space">
              <div className="eoa-card">
                <h3>{ar ? 'التعلم والمساءلة' : 'Learning & accountability'}</h3>
                <p>
                  {ar
                    ? 'حضّر تحدياً من شركتك ليوم التعلم، واختر خطوات للتطبيق، ثم راجع تقدمك في لقاءات المساءلة مع أقرانك.'
                    : 'Bring a business challenge to each learning day, choose actions to take, then review your progress with peers in accountability meetings.'}
                </p>
              </div>
              <div className="eoa-card">
                <h3>{ar ? 'علاقات وفرص' : 'Connections & opportunities'}</h3>
                <p>
                  {ar
                    ? 'تبادل التجارب مع مؤسسين يواجهون قرارات مشابهة، واستكشف الأنشطة المحلية والعالمية التي يشاركها فريق البرنامج مع دفعتك.'
                    : 'Exchange experiences with founders facing similar decisions and explore the local and global activities shared by the program team with your cohort.'}
                </p>
              </div>
            </div>
            <DeliveryModel ar={ar} /><div className="eoa-actions eoa-space"><Link className="eoa-btn" href="/eoa/apply">{ar ? 'ابدأ طلبك' : 'Start your application'}</Link><Link className="eoa-text-link" href="/eoa/mentors">{ar ? 'استكشف الإرشاد' : 'Explore mentoring'}</Link></div>
          </>
        )}
        {section === 'learning' && <LearningCalendar ar={ar} />}
        {section === 'learning' && (
          <div className="eoa-two-grid">
            <div>
              <p className="eoa-lead">
                {ar
                  ? 'إيقاع ثابت للتعلم والتطبيق.'
                  : 'A steady rhythm of learning and action.'}
              </p>
              <p>
                {ar
                  ? 'تعرف على ركائز البرنامج الآن. ستظهر مواعيد جلسات دفعتك وموادها والتسجيل فيها في حسابك بعد تفعيل المشاركة.'
                  : 'Explore the program pillars now. Your cohort calendar, materials and session registration appear in your account after enrollment.'}
              </p>
            </div>
            <div className="eoa-card">
              <h3>{ar ? 'تقويم الرياض' : 'Riyadh calendar'}</h3>
              <p>
                {ar
                  ? 'من حسابك، راجع مواعيد دفعتك، وسجّل في الجلسات المتاحة، واطّلع على مكان اللقاء ومواد التحضير.'
                  : 'Use your account to review cohort dates, register for available sessions, and find the meeting location and preparation materials.'}
              </p>
              <Link href="/eoa/account" className="eoa-btn">
                {ar ? 'افتح حسابك' : 'Open your account'}
              </Link>
            </div>
          </div>
        )}
        {section === 'leadership' && <EoaLeadership program={program} ar={ar} />}
        {section === 'mentors' && <>
          <CoachOverview ar={ar} />
          <EoaMentors mentors={program?.mentors ?? []} ar={ar} />
          <EoGlobalNetwork ar={ar} />
        </>}
        {section === 'faq' && <EoaProgramDetails program={program} section="faq" />}
        {section === 'partners' && (
          <div className={styles.partners}>
            <header className={styles.partnerIntro}>
              <h2>{ar ? 'جهات تدعم رحلتك الريادية' : 'Support for your next stage of growth'}</h2>
              <p>{ar ? 'استكشف فرص التعلم والتمويل والتقنية ومساحات العمل، وتواصل مع فريقنا للمساهمة في البرنامج.' : 'Explore learning, funding, technology and workspace support, or speak with our team about contributing to the program.'}</p>
              <nav aria-label={ar ? 'روابط الشراكات' : 'Partnership links'}><a href="#eoa-ecosystem">{ar ? 'استكشف الجهات' : 'Explore organizations'}</a><Link href="/eoa/contact">{ar ? 'تواصل للشراكة' : 'Discuss a partnership'}</Link></nav>
            </header>
            <EoaProgramDetails program={program} section="operator" />
            <div className={styles.partnerStrip}><PartnerStrip partners={program?.partners} /></div>
            {!program?.partners.length && (
              <p>
                {ar
                  ? 'ساهم بخبرتك أو مواردك في دعم نمو المؤسسين. تواصل مع الفريق لاستكشاف فرص الشراكة.'
                  : 'Help founders grow through your expertise or resources. Contact the team to explore partnership opportunities.'}
              </p>
            )}
            <section id="eoa-ecosystem" className={styles.ecosystem} aria-labelledby="eoa-directory-title">
              <h2 id="eoa-directory-title">
                {ar
                  ? 'منظومة الدعم في السعودية'
                  : 'Saudi founder support ecosystem'}
              </h2>
              <p>
                {ar
                  ? 'اكتشف الجهات وخدماتها، وانتقل إلى مواقعها الرسمية لمعرفة البرامج المتاحة.'
                  : 'Find organizations and services, then visit their official websites to explore available programs.'}
              </p>
              <EoaDirectory ar={ar} />
            </section>
          </div>
        )}
        {section === 'contact' && (
          <div className="eoa-two-grid">
            <div>
              <p className="eoa-lead">
                {ar
                  ? 'لديك سؤال قبل التقديم؟'
                  : 'Have a question before you apply?'}
              </p>
              <p>
                {ar
                  ? 'اسألنا عن الأهلية أو الرسوم أو خطوات التقديم. وإذا كنت ترغب في تقديم خبرتك أو مساحة عمل أو رعاية للمشاركين، أخبرنا بما يمكنك تقديمه.'
                  : 'Ask about eligibility, fees or the application steps. If you can offer mentoring, workspace or sponsorship, tell us what you have in mind.'}
              </p>
            </div>
            <div className="eoa-card">
              <h3>{ar ? 'تواصل معنا' : 'Contact us'}</h3>
              <EoaContact />
              {program?.contact_email && (
                <p>
                  <a href={`mailto:${program.contact_email}`}>
                    {program.contact_email}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
        <footer className="eoa-source">
          <nav className="eoa-actions" aria-label={ar ? 'روابط مفيدة' : 'Useful links'}>
            <Link href="/eoa/program" prefetch={false}>{ar ? 'البرنامج' : 'Program'}</Link>
            <Link href="/eoa/eligibility" prefetch={false}>{ar ? 'الأهلية والرسوم' : 'Eligibility & fees'}</Link>
            <Link href="/eoa/contact" prefetch={false}>{ar ? 'تواصل معنا' : 'Contact us'}</Link>
            <Link href="/eoa/privacy" prefetch={false}>{ar ? 'الخصوصية' : 'Privacy'}</Link>
            <a href="https://eonetwork.org/accelerator" target="_blank" rel="noopener noreferrer">EO Accelerator ↗</a>
            <a href="https://eonetwork.org/accelerator/faqs/" target="_blank" rel="noopener noreferrer">{ar ? 'أسئلة EO الشائعة' : 'EO FAQs'} ↗</a>
          </nav>
        </footer>
      </div>
    </section>
  )
}
