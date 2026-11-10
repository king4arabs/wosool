'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { EoaProgram } from '@/lib/eoa'
import { eoaDateLocale } from '@/lib/date-locale'
import { eoaGlobalSessions, registrationOpen } from '@/lib/eoa-calendar'

export function DeliveryModel({ ar }: { ar: boolean }) {
  const rows = ar
    ? [
        ['أقل من 10', 'أيام تعلم افتراضية عالمية'],
        ['10–14', 'إطلاق أولي مع مدرب تعلم افتراضي مخصص'],
        ['15 فأكثر', 'تأهل للإطلاق الرسمي وأيام التعلم الحضورية'],
      ]
    : [
        ['Below 10', 'Global virtual Learning Days'],
        ['10–14', 'Soft launch with an assigned virtual Learning Day trainer'],
        [
          '15 or more',
          'Eligible for official launch and in-person Learning Days',
        ],
      ]
  return (
    <section className="eoa-card eoa-space">
      <h2>{ar ? 'كيف يتم تقديم البرنامج؟' : 'How the program is delivered'}</h2>
      <p>
        {ar
          ? 'تُحدد طريقة أيام التعلم حسب عدد المشاركين المسددين وجاهزية البرنامج. تؤكد مواعيدك قبل بداية المشاركة.'
          : 'Learning Day delivery depends on paid participant numbers and program readiness. Your schedule is confirmed before participation begins.'}
      </p>
      <div className="eoa-policy-table">
        <table>
          <thead>
            <tr>
              <th>{ar ? 'المشاركون المسددون' : 'Paid participants'}</th>
              <th>{ar ? 'طريقة التعلم' : 'Learning format'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([n, t]) => (
              <tr key={n}>
                <td>{n}</td>
                <td>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {ar
          ? 'تجتمع مجموعات المساءلة شهرياً مع مدرب عضو في EO، ويتراوح عدد أفراد المجموعة بين 4 و6.'
          : 'Accountability groups of 4–6 meet monthly with an EO-member coach.'}
      </p>
    </section>
  )
}
export function CoachOverview({ ar }: { ar: boolean }) {
  return (
    <section className="eoa-card eoa-space">
      <h2>
        {ar ? 'مدربو المساءلة في الرياض' : 'Riyadh accountability coaches'}
      </h2>
      <p>
        {ar
          ? 'مدربون من أعضاء EO لديهم خبرة في تنمية الشركات، يلتزمون لمدة 12 شهراً بقيادة مجموعة من 4–6 مشاركين. تشمل مسؤولياتهم لقاءً شهرياً لمدة ساعتين، وأيام التعلم الربع سنوية، والتدريب والمتابعة والسرية.'
          : 'Coaches are current EO members with experience scaling businesses. They commit to a 12-month term with a group of 4–6 participants, monthly two-hour meetings, quarterly Learning Days, training, check-ins and confidentiality.'}
      </p>
      <p>
        {ar
          ? 'تُعرض التعيينات المؤكدة أدناه. دليل الشبكة العالمية منفصل ولا يدل على تعيين أعضائه لدفعتك.'
          : 'Confirmed appointments appear below. The global network directory is separate and does not identify your assigned coach.'}
      </p>
      <Link className="eoa-btn" href="/eoa/contact?category=eoa-coaching">
        {ar ? 'ساهم كمدرب' : 'Enquire about coaching'}
      </Link>
    </section>
  )
}
export function LearningCalendar({ ar }: { ar: boolean }) {
  const [now, setNow] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  useEffect(() => {
    const initial = setTimeout(() => setNow(Date.now()), 0)
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
    }
  }, [])
  const sessions = eoaGlobalSessions.filter(
    (s) =>
      (filter === 'all' || s.kind === filter) &&
      (now === null || Date.parse(s.startsAt) + s.hours * 3600000 > now),
  )
  return (
    <section className="eoa-card eoa-space">
      <h2>{ar ? 'التقويم العالمي 2026–2027' : 'Global calendar 2026–2027'}</h2>
      <p>
        {ar
          ? 'المواعيد أدناه للخيار الصباحي بتوقيت الرياض. يوضح نموذج التسجيل الخيارات الأخرى، والدعوة المؤكدة تحدد موعد الجلسة. يغلق التسجيل قبل 48 ساعة.'
          : 'Morning session options are shown in Riyadh time. Registration offers alternative time slots; your confirmed invitation determines the session time. Registration closes 48 hours beforehand.'}
      </p>
      <label className="eoa-field">
        <span>{ar ? 'نوع الجلسة' : 'Session type'}</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {[
            ['all', 'الكل', 'All'],
            ['learning', 'أيام التعلم', 'Learning Days'],
            ['coach', 'تدريب المدربين', 'Coach training'],
            ['participant', 'المشاركون الجدد', 'New participants'],
          ].map(([v, a, b]) => (
            <option key={v} value={v}>
              {ar ? a : b}
            </option>
          ))}
        </select>
      </label>
      <div className="eoa-policy-table">
        <table>
          <thead>
            <tr>
              {(ar
                ? ['الجلسة', 'الموعد — الرياض', 'المدة', 'التسجيل']
                : ['Session', 'Date — Riyadh', 'Duration', 'Registration']
              ).map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.startsAt}>
                <td>
                  {s.name[ar ? 0 : 1]}
                  <small className="eoa-muted">
                    {s.kind === 'learning'
                      ? ar
                        ? ' — للبرامج التي يقل عددها عن 10 مشاركين مسددين'
                        : ' — for programs below 10 paid participants'
                      : s.kind === 'coach'
                        ? ar
                          ? ' — للمدربين المحددين'
                          : ' — identified coaches'
                        : ar
                          ? ' — للمشاركين الجدد'
                          : ' — new participants'}
                  </small>
                </td>
                <td>
                  <time dateTime={s.startsAt}>
                    {new Intl.DateTimeFormat(eoaDateLocale(ar), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      calendar: 'gregory',
                      timeZone: 'Asia/Riyadh',
                    }).format(new Date(s.startsAt))}
                  </time>
                </td>
                <td>
                  {s.hours} {ar ? 'ساعات' : 'hours'}
                </td>
                <td>
                  {now !== null && registrationOpen(s, now) ? (
                    <a
                      href={s.registration}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ar ? 'التسجيل لدى EO' : 'Register with EO'} ↗
                    </a>
                  ) : (
                    <span>
                      {ar
                        ? 'تحقق من المواعيد المتاحة'
                        : 'Check available dates'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!sessions.length && (
        <p>
          {ar
            ? 'ترقب المواعيد القادمة من فريق البرنامج.'
            : 'Upcoming dates will be confirmed by the program team.'}
        </p>
      )}
      <p>
        {ar
          ? 'الأيام العالمية لا تحل محل جدول الرياض المخصص عندما يتأهل البرنامج لمدربه الخاص.'
          : 'Global sessions are separate from the assigned Riyadh program calendar once the program qualifies for its own trainer.'}
      </p>
    </section>
  )
}
export function ParticipationTerms({
  ar,
  program,
}: {
  ar: boolean
  program: EoaProgram | null
}) {
  const terms = ar
    ? program?.participation_terms_ar
    : program?.participation_terms_en
  return (
    <section className="eoa-card eoa-space" id="participation-terms">
      <h2>{ar ? 'المشاركة والسداد' : 'Participation and payment'}</h2>
      <p>
        {ar
          ? 'القبول المحلي واعتماد EO والسداد وتفعيل المشاركة خطوات مستقلة. لا تبدأ المشاركة المدفوعة إلا وفق تاريخ مؤكد وخدمات جاهزة. لا تتضمن الباقة ضمان استثمار أو عضوية EO أو رحلات وإقامة إضافية.'
          : 'Local acceptance, EO approval, payment and participation activation are separate steps. Paid participation starts on a confirmed date with services ready. The package does not guarantee investment, EO membership or additional travel and accommodation.'}
      </p>
      <p>
        {ar
          ? 'تُعرض الشروط المعتمدة، ومبلغ الفترة الأولى، والتجديد والإلغاء والاسترداد قبل السداد. لا تطبق أحكام عضوية وصول العامة بدلاً من شروط EOA. لا تتوفر أقساط للطلبات الجديدة وفق إجراء EO؛ يناقش الفريق أي ترتيبات مختلفة قبل اعتمادها.'
          : 'Approved terms, first-period charges, renewal, cancellation and refund arrangements are provided before payment. General Wosool membership terms do not replace EOA participation terms. EO’s new-application process does not offer installments; discuss any alternative arrangement with the team before relying on it.'}
      </p>
      {terms ? (
        <p className="eoa-preserve">{terms}</p>
      ) : (
        <p>
          {ar
            ? 'تواصل مع الفريق للحصول على شروط مشاركتك المؤكدة قبل الدفع.'
            : 'Contact the team for your confirmed participation terms before paying.'}
        </p>
      )}
      <Link href="/eoa/contact?category=eoa-fees">
        {ar ? 'استفسر عن الرسوم' : 'Ask about fees'}
      </Link>
    </section>
  )
}
