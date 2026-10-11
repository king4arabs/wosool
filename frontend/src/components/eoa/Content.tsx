'use client'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { CohortModel } from './CohortModel'
import { EoaPrivacy } from './Privacy'
import { EoaContact } from './Contact'
import { EoaBoard } from './Board'
import { EoaMentors } from './Mentors'
import { EoaProgramDetails } from './EoaProgramDetails'
import { Eligibility } from './Eligibility'
import { Notice, PartnerStrip, useEoaProgram } from './Shared'
import { formatEoaDate } from '@/lib/eoa'
const titles: Record<string, [string, string]> = {
  alumni: ['الخريجون ومتابعة النمو', 'Alumni & continued growth'],
  privacy: ['الخصوصية والبيانات', 'Privacy & data'],
  about: ['عن المسرّعة', 'About the Accelerator'],
  program: ['من التعلم إلى نمو الأعمال', 'From learning to business growth'],
  eligibility: ['الأهلية والرسوم', 'Eligibility & fees'],
  partners: [
    'شركاء ومنظومة ريادة الأعمال',
    'Partners & entrepreneurship ecosystem',
  ],
  faq: ['الأسئلة الشائعة', 'Frequently asked questions'],
  contact: ['لنبنِ فرص النمو معاً', 'Let’s build opportunities together'],
  learning: ['التعلم والفعاليات', 'Learning & events'],
  leadership: ['قيادة البرنامج', 'Program leadership'],
  mentors: ['المرشدون والمستشارون', 'Mentors & advisors'],
}
export function EoaContent({ section }: { section: string }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program, failed, retry } = useEoaProgram()

  return (
    <section className="eoa-section">
      <div className="eoa-container">
        <header className="eoa-page-heading">
          <span className="eoa-eyebrow">EO RIYADH ACCELERATOR</span>
          <h1>{titles[section]?.[ar ? 0 : 1]}</h1>
        </header>
        {['program', 'alumni'].includes(section) && <CohortModel ar={ar} />}
        {section === 'alumni' && <div className="eoa-card eoa-space"><h2>{ar?'تستمر الرحلة بعد التخرج':'Your journey continues after graduation'}</h2><p>{ar?'تابع أهداف شركتك وتواصل مع مدربك وراجع الأنشطة ومواعيد المتابعة من حسابك. يسجل فريق البرنامج التخرج وخطة المتابعة، وتُقيّم أهلية EO بصورة مستقلة عند استيفاء شروطها.':'Keep tracking company goals, connect with your coach and review activities and follow-up dates in your account. The program team records graduation and follow-up plans; EO eligibility is assessed separately against its membership requirements.'}</p><Link href="/dashboard/eoa" className="eoa-btn">{ar?'افتح مساحة الخريجين':'Open your alumni workspace'}</Link></div>}
        {section === 'eligibility' && <Eligibility />}
        {section === 'privacy' && <EoaPrivacy />}
        {section === 'about' && (
          <div className="eoa-two-grid">
            <div>
              <p className="eoa-lead">
                {ar
                  ? 'منصة نمو بقيادة المؤسسين، للشركات القائمة الطامحة إلى تطوير أعمالها وقيادتها وعلاقاتها.'
                  : 'A founder-led growth platform for operating businesses ready to strengthen their companies, leadership and connections.'}
              </p>
              <p>
                {ar
                  ? 'تجمع المسرّعة إطار التعلم العالمي من EO وخبرة مجتمع الرياض. تعمل على أولويات شركتك، وتراجع تقدمك مع أقرانك، وتتابع طلبك وجلساتك وموارد التعلم من حسابك في وصول.'
                  : 'Accelerator combines EO’s global learning framework with the experience of the Riyadh community. Work on your business priorities, review progress with peers, and manage your application, sessions and learning resources through your Wosool account.'}
              </p>
              <div className="eoa-actions"><Link href="/eoa/eligibility" className="eoa-btn">{ar ? 'تحقق من الأهلية' : 'Check your eligibility'}</Link><Link href="/eoa/program" className="eoa-text-link">{ar ? 'استكشف رحلة التعلم' : 'Explore the learning journey'}</Link></div>
            </div>
            <div className="eoa-card">
              <h3>{ar ? 'طموح سعودي وآفاق عالمية' : 'Saudi ambition, global perspectives'}</h3>
              <p>
                {ar
                  ? 'ابنِ شركة أكثر جاهزية للنمو في السوق السعودي، وتعلّم من تجارب مؤسسين داخل المملكة وعبر شبكة EO. اجعل التحديات اليومية نقطة انطلاق لتطوير القيادة وبناء علاقات طويلة الأمد.'
                  : 'Build a business ready to grow in Saudi Arabia and learn from founder experiences across the Kingdom and the EO network. Turn day-to-day challenges into opportunities to develop your leadership and lasting relationships.'}
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
                ? 'برنامج يمتد ستة أشهر من التدريب والتوجيه والأنشطة المرموقة. تنطلق دفعة جديدة كل ستة أشهر، ويستمر دعم الخريجين بعد التخرج.'
                : 'Six months of coaching, training and prestigious activities. A new cohort begins every six months, with continued alumni support after graduation.'}
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
            <div className="eoa-actions eoa-space"><Link className="eoa-btn" href="/eoa/apply">{ar ? 'ابدأ طلبك' : 'Start your application'}</Link><Link className="eoa-text-link" href="/eoa/mentors">{ar ? 'استكشف الإرشاد' : 'Explore mentoring'}</Link></div>
          </>
        )}
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
        {section === 'leadership' && <EoaBoard members={program?.board_members ?? []} ar={ar} />}
        {section === 'mentors' && <EoaMentors key={ar ? "ar" : "en"} mentors={program?.mentors ?? []} ar={ar} loading={!program && !failed} failed={failed} retry={retry} />}
        {section === 'leadership' && (
          <div className="eoa-two-grid">
            <div className="eoa-card">
              <span className="eoa-eyebrow">
                {ar ? 'قيادة البرنامج' : 'PROGRAM LEADERSHIP'}
              </span>
              <h2>{ar ? 'محمد السلمي' : 'Mohammed Alsolami'}</h2>
              <p>
                {ar
                  ? 'رئيس العضوية والمسرّعة – EO الرياض'
                  : 'EO Riyadh Membership & Accelerator Chair'}
              </p>
            </div>
            <div>
              <h2>
                {ar
                  ? 'خبرة المؤسسين في خدمة المؤسسين'
                  : 'Founder experience, shared with founders'}
              </h2>
              <p>
                {ar
                  ? 'تواصل مع قيادة البرنامج حول جاهزية شركتك، ومتطلبات المشاركة، وكيفية الإسهام بخبرتك في مجتمع المؤسسين. تابع ملفات المرشدين للتعرف على مجالات الخبرة المتاحة.'
                  : 'Connect with program leadership about your business readiness, participation requirements or contributing your experience to the founder community. Explore mentor profiles to learn about their areas of expertise.'}
              </p>
              <div className="eoa-actions"><Link href="/eoa/contact" className="eoa-btn">{ar ? 'تواصل مع القيادة' : 'Contact the team'}</Link><Link href="/eoa/mentors" className="eoa-text-link">{ar ? 'المرشدون والمستشارون' : 'Mentors & advisors'}</Link></div>
            </div>
          </div>
        )}
        {section === 'faq' && <EoaProgramDetails program={program} section="faq" />}
        {section === 'partners' && <EoaProgramDetails program={program} section="operator" />}
        {section === 'partners' && (
          <>
            <PartnerStrip partners={program?.partners} />
            {!program?.partners.length && (
              <p>
                {ar
                  ? 'ساهم بخبرتك أو مواردك في دعم نمو المؤسسين. تواصل مع الفريق لاستكشاف فرص الشراكة.'
                  : 'Help founders grow through your expertise or resources. Contact the team to explore partnership opportunities.'}
              </p>
            )}
            <h2 className="eoa-space">
              {ar
                ? 'منظومة الدعم في السعودية'
                : 'Saudi founder support ecosystem'}
            </h2>
            <p>
              {ar
                ? 'استكشف جهات تدعم ريادة الأعمال والابتكار وتنمية القدرات، وتعرّف على برامجها وخدماتها عبر مواقعها الرسمية.'
                : 'Explore organizations supporting entrepreneurship, innovation and capability building. Visit their official websites to discover their programs and services.'}
            </p>
            {failed && (
              <Notice error>
                {ar
                  ? 'تعذر تحميل الدليل.'
                  : 'The directory could not load.'}
                {' '}<button type="button" className="eoa-text-link" onClick={retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>
              </Notice>
            )}
            <div className="eoa-three-grid">
              {program?.ecosystem.map((o) => (
                <article className="eoa-card" key={o.id}>
                  <h3>{ar ? o.name_ar : o.name_en}</h3>
                  <p>{ar ? o.support_ar : o.support_en}</p>
                  <a
                    className="eoa-text-link"
                    href={o.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ar ? 'الموقع الرسمي' : 'Official website'} ↗
                  </a>
                </article>
              ))}
            </div>
          </>
        )}
        {section === 'contact' && (
          <div className="eoa-two-grid">
            <div>
              <p className="eoa-lead">
                {ar
                  ? 'لنتحدث عن خطوتك القادمة.'
                  : 'Let’s discuss your next step.'}
              </p>
              <p>
                {ar
                  ? 'اسأل عن الأهلية أو التقديم أو رحلة المشاركة. ونرحب أيضاً بمن يرغب في الإسهام بالإرشاد والخبرات ومساحات العمل والرعاية.'
                  : 'Ask about eligibility, applying or the participant journey. We also welcome conversations about mentoring, expertise, workspace and sponsorship.'}
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
        <footer className="eoa-source"><Link href="/eoa/privacy">{ar ? 'إشعار الخصوصية' : 'Data notice'}</Link> · 
          {ar
            ? 'نموذج الدفعات المحلي: قيادة برنامج الرياض. شروط EO: المصادر الرسمية.'
            : 'Local cohort model: Riyadh program leadership. EO requirements: official EO publications.'}{' '}
          {program?.facts.verified_at && <span>{ar ? 'آخر مراجعة مسجلة' : 'Last recorded review'}: {formatEoaDate(program.facts.verified_at, ar)} · </span>}
          <a
            href="https://eonetwork.org/accelerator"
            target="_blank"
            rel="noopener noreferrer"
          >
            EO Accelerator ↗
          </a>{' '}
          ·{' '}
          <a
            href="https://eonetwork.org/accelerator/faqs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            FAQ ↗
          </a>
          <div className="eoa-actions">
            {Object.entries(titles).map(([slug, title]) => (
              <Link key={slug} href={`/eoa/${slug}`}>
                {title[ar ? 0 : 1]}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </section>
  )
}
