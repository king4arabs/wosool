'use client'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { EoaPrivacy } from './Privacy'
import { EoaContact } from './Contact'
import { EoaBoard } from './Board'
import { EoaProgramDetails } from './EoaProgramDetails'
import { Eligibility } from './Eligibility'
import { Notice, PartnerStrip, useEoaProgram } from './Shared'
import { formatEoaDate } from '@/lib/eoa'
const titles: Record<string, [string, string]> = {
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
}
export function EoaContent({ section }: { section: string }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program, failed } = useEoaProgram()

  return (
    <section className="eoa-section">
      <div className="eoa-container">
        <header className="eoa-page-heading">
          <span className="eoa-eyebrow">EO RIYADH ACCELERATOR</span>
          <h1>{titles[section]?.[ar ? 0 : 1]}</h1>
        </header>
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
                  ? 'قيادة EO الرياض مسؤولة عن الحوكمة؛ EO Accelerator يوفر إطار البرنامج؛ وصول يدعم التقديم والتنسيق وخدمات المشاركين. يعمل الشركاء التشغيليون ضمن النطاقات المعتمدة لهم.'
                  : 'EO Riyadh provides governance. EO Accelerator supplies the program framework. Wosool supports applications, coordination and participant services. Operating partners deliver their assigned, approved scope.'}
              </p>
            </div>
            <div className="eoa-card">
              <h3>{ar ? 'دعم طموح السعودية' : 'Supporting Saudi ambition'}</h3>
              <p>
                {ar
                  ? 'تطوير ريادة الأعمال ونمو القطاع الخاص وبناء القدرات الوطنية والعلاقات الدولية، بما ينسجم مع رؤية السعودية 2030. لا يشير ذلك إلى اعتماد أو تأييد حكومي.'
                  : 'Entrepreneurship, private-sector growth, national capabilities and international connections align with Saudi Vision 2030. This does not represent government endorsement.'}
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
                ? 'برنامج تعلم يمتد عامين. أربعة أيام تعلم كل عام، ومجموعات مساءلة شهرية، وأهداف تُترجم إلى تطبيق في شركتك.'
                : 'A two-year learning program. Four learning days each year, monthly accountability groups and goals you apply in your business.'}
            </p>
            <div className="eoa-four-grid">
              {(ar
                ? ['النقد', 'الاستراتيجية', 'الأفراد', 'التنفيذ']
                : ['Cash', 'Strategy', 'People', 'Execution']
              ).map((x, i) => (
                <div className="eoa-pillar" key={x}>
                  <span>0{i + 1}</span>
                  <h2>{x}</h2>
                </div>
              ))}
            </div>
            <div className="eoa-two-grid eoa-space">
              <div className="eoa-card">
                <h3>{ar ? 'التعلم والمساءلة' : 'Learning & accountability'}</h3>
                <p>
                  {ar
                    ? 'ورش يقودها ميسّرون من EO، ومراجعة أهداف مع الأقران، وتنسيق مع المدربين عند تعيينهم.'
                    : 'Facilitated learning, peer goal reviews and coach coordination when assigned.'}
                </p>
              </div>
              <div className="eoa-card">
                <h3>{ar ? 'علاقات وفرص' : 'Connections & opportunities'}</h3>
                <p>
                  {ar
                    ? 'فرص EO المحلية والعالمية بحسب ما يُتاح للمشاركين. تُنشر الأنشطة الإضافية بعد تأكيدها.'
                    : 'Local and global EO opportunities as shared with participants. Additional activities are published once confirmed.'}
                </p>
              </div>
            </div>
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
                  ? 'تُنشر مواعيد الرياض بعد اعتمادها. يتاح تقويم دفعتك داخل حسابك.'
                  : 'Riyadh dates are shared after approval. Your cohort calendar is available in your account.'}
              </p>
              <Link href="/eoa/account" className="eoa-btn">
                {ar ? 'افتح حسابك' : 'Open your account'}
              </Link>
            </div>
          </div>
        )}
        {section === 'leadership' && <EoaBoard members={program?.board_members ?? []} ar={ar} />}
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
                  ? 'تُعلن أسماء أعضاء اللجنة والمدربين وقادة التعلم بعد تأكيد تكليفاتهم. تُخصص مجموعات المساءلة بما يلائم المشاركين.'
                  : 'Committee members, coaches and learning leads will be announced after their assignments are confirmed. Accountability groups are assigned to suit participants.'}
              </p>
            </div>
          </div>
        )}
        {section === 'faq' && <EoaProgramDetails program={program} section="faq" />}
        {section === 'partners' && <EoaProgramDetails program={program} section="operator" />}
        {section === 'partners' && (
          <>
            <PartnerStrip partners={program?.partners ?? []} />
            {!program?.partners.length && (
              <p>
                {ar
                  ? 'تُنشر الشراكات المعتمدة بعد توثيقها.'
                  : 'Confirmed partnerships will be published after verification.'}
              </p>
            )}
            <h2 className="eoa-space">
              {ar
                ? 'منظومة الدعم في السعودية'
                : 'Saudi founder support ecosystem'}
            </h2>
            <p>
              {ar
                ? 'جهات عامة للمعرفة والاستكشاف. إدراج الجهة لا يعني شراكة أو ضمان الحصول على خدماتها.'
                : 'Organizations to explore. A directory listing does not establish a partnership or entitlement to services.'}
            </p>
            {failed && (
              <Notice error>
                {ar
                  ? 'تعذر تحميل الدليل. حاول لاحقاً.'
                  : 'The directory could not load. Please try later.'}
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
                  <p className="eoa-muted">
                    {ar ? 'تحقق' : 'Verified'}: {formatEoaDate(o.verified_at, ar)}
                  </p>
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
                  ? 'هل ترغب في تمكين المؤسسين؟'
                  : 'Would you like to enable founder growth?'}
              </p>
              <p>
                {ar
                  ? 'نرحب بمناقشة مساحات العمل ودعم التعلم والخبرات والرعاية، ضمن ترتيبات تعتمدها قيادة البرنامج.'
                  : 'Discuss workspace, learning support, expertise and sponsorship through arrangements approved by program leadership.'}
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
            ? 'مصادر حقائق البرنامج: EO الرسمية.'
            : 'Program fact sources: official EO publications.'}{' '}
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
