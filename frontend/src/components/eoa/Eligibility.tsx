'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { eligibility } from '@/lib/eoa'
import { Field, Notice, useEoaProgram } from './Shared'
import styles from './PublicDetails.module.css'
export function Eligibility() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program, failed, retry } = useEoaProgram()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [owner, setOwner] = useState(false)
  const [result, setResult] = useState('')
  const messages: Record<string, string> = {
    potential: ar
      ? 'قد تستوفي معيار الإيراد. تبدأ المراجعة الرسمية بعد تقديم المستندات ومراجعة الفرع.'
      : 'You may meet the revenue criterion. Documentary verification and chapter review are still required.',
    membership: ar
      ? 'قد يناسبك مسار عضوية EO المباشرة. تواصل مع قيادة الفرع للتحقق من المتطلبات.'
      : 'The direct EO membership pathway may fit. Contact chapter leadership to verify all requirements.',
    review: ar
      ? 'تحتاج حالتك إلى مراجعة. يمكن للشركات المدعومة استثمارياً طلب مراجعة معيار التمويل المنشور من EO.'
      : 'Your circumstances need review. Venture-backed companies can request review against EO’s published funding criterion.',
    invalid: ar
      ? 'أدخل إيراداً سنوياً صحيحاً.'
      : 'Enter a valid annual revenue amount.',
  }
  return (
    <div className={styles.eligibility} data-eoa-eligibility>
      <div className={`eoa-card ${styles.summary}`}>
        <h2>{ar ? 'هل يناسبك البرنامج؟' : 'Is Accelerator right for you?'}</h2>
        <p>
          {ar
            ? 'لمالك أو مؤسس شركة قائمة بإيراد سنوي إجمالي بين 250,000 و999,999 دولار أمريكي.'
            : 'For an owner or founder of an operating business with gross annual revenue of US$250,000–999,999.'}
        </p>
        <div className={`eoa-fee ${styles.fee}`}>
          <span>{ar ? 'تكلفة رحلة EOA السنوية' : 'ANNUAL EOA JOURNEY COST'}</span>
          <strong><bdi dir="ltr">{program ? `US$${program.facts.annual_journey_usd.toLocaleString('en-US')}` : '—'}</bdi></strong>
          {!program && <Notice error={failed}>{failed ? (ar ? 'تعذر تحميل الرسوم المعتمدة.' : 'Published fees could not load.') : (ar ? 'جارٍ تحميل الرسوم…' : 'Loading fees…')}{failed && <button type="button" className="eoa-text-link" onClick={retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>}</Notice>}
          <p>
            {ar
              ? 'يشمل الإجمالي الرسوم العالمية والرسوم المحلية. من المخطط أن يغطي الرعاة نصف التكلفة (2,000 دولار)، لكن الرعاية والجهات الراعية قيد التحديد والاعتماد؛ لا تُضمن مساهمة المشارك المخفضة حتى تأكيد الرعاية.'
              : 'The total includes global and local fees. Sponsors are intended to cover half (US$2,000), but sponsorship and sponsors are still to be confirmed; a reduced participant share is not guaranteed until confirmed.'}
          </p>
          {program?.local_fees ? (
            <dl>
              <dt>{ar ? 'رسوم محلية سنوية' : 'Annual local fee'}</dt>
              <dd><bdi dir="ltr">US${program.local_fees.local_fee_usd.toLocaleString('en-US')}</bdi></dd>
              <dt>
                {ar ? 'مساهمة الراعي السنوية' : 'Annual sponsor contribution'}
              </dt>
              <dd><bdi dir="ltr">US${program.local_fees.sponsor_contribution_usd.toLocaleString('en-US')}</bdi></dd>
              <dt>
                {ar
                  ? 'مساهمة المشارك السنوية'
                  : 'Annual participant contribution'}
              </dt>
              <dd><bdi dir="ltr">US${program.local_fees.participant_contribution_usd.toLocaleString('en-US')}</bdi></dd>
            </dl>
          ) : (
            program && <p className="eoa-muted">
              {ar
                ? 'تفاصيل السداد ومساهمة الراعي قيد الاعتماد. تواصل مع الفريق قبل أي التزام مالي.'
                : 'Payment details and sponsor contributions await approval. Contact the team before making any financial commitment.'}
            </p>
          )}
        </div>
      </div>
      <form
        className={`eoa-card ${styles.assessment}`}
        aria-labelledby="eligibility-assessment-title"
        onSubmit={(e) => {
          e.preventDefault()
          setResult(
            eligibility(amount === '' ? NaN : Number(amount), currency, owner),
          )
        }}
      >
        <h2 id="eligibility-assessment-title">{ar ? 'تقييم أولي للأهلية' : 'Eligibility self-assessment'}</h2>
        <div className={styles.fields}>
          <Field label={ar ? 'الإيراد السنوي الإجمالي' : 'Gross annual revenue'}>
            <input
              type="number"
              inputMode="decimal"
              dir="ltr"
              min="0"
              step="0.01"
              required
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setResult('')
              }}
            />
          </Field>
          <Field label={ar ? 'العملة' : 'Currency'}>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value)
                setResult('')
              }}
            >
              <option>USD</option>
              <option>SAR</option>
            </select>
          </Field>
        </div>
        <label className="eoa-check">
          <input
            type="checkbox"
            checked={owner}
            onChange={(e) => {
              setOwner(e.target.checked)
              setResult('')
            }}
          />
          <span>{ar
            ? 'أنا مالك أو مؤسس شركة قائمة.'
            : 'I am an owner or founder of an operating business.'}</span>
        </label>
        {currency === 'SAR' && (
          <p className="eoa-muted">
            {ar
              ? 'تحويل استرشادي: 3.75 ريال لكل دولار وفق سياسة الربط لدى البنك المركزي السعودي. تحقق 8 أكتوبر 2026.'
              : 'Indicative conversion: SAR 3.75 per US$1, using SAMA’s peg policy. Verified 8 October 2026.'}{' '}
            <a
              href="https://sama.gov.sa/en-US/MediaCenter/News/Pages/news-557.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              SAMA ↗
            </a>
          </p>
        )}
        <div className={styles.actions}>
          <button className="eoa-btn" type="submit">
            {ar ? 'تحقق من الأهلية' : 'Check eligibility'}
          </button>
          <Link className="eoa-btn eoa-btn-outline" href="/eoa/apply">
            {ar ? 'جهز طلبك' : 'Prepare your application'} ↗
          </Link>
        </div>
        {result && <Notice>{messages[result]}</Notice>}
      </form>
    </div>
  )
}
