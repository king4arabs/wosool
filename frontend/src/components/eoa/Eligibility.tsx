'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { eligibility } from '@/lib/eoa'
import { Field, Notice, useEoaProgram } from './Shared'
export function Eligibility() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program } = useEoaProgram()
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
    <div className="eoa-two-grid">
      <div>
        <h2>{ar ? 'هل يناسبك البرنامج؟' : 'Is Accelerator right for you?'}</h2>
        <p>
          {ar
            ? 'لمالك أو مؤسس شركة قائمة بإيراد سنوي إجمالي بين 250,000 و999,999 دولار أمريكي.'
            : 'For an owner or founder of an operating business with gross annual revenue of US$250,000–999,999.'}
        </p>
        <div className="eoa-card eoa-fee">
          <span>{ar ? 'الرسوم العالمية السنوية' : 'ANNUAL GLOBAL FEE'}</span>
          <strong>US$1,750</strong>
          <p>
            {ar
              ? 'تضاف رسوم الفرع المحلي. تُحسب الرسوم وفق توقيت الالتحاق والسنة المالية يوليو–يونيو.'
              : 'Local chapter fees are additional. Proration depends on joining date in the July–June financial year.'}
          </p>
          {program?.local_fees ? (
            <dl>
              <dt>{ar ? 'رسوم محلية سنوية' : 'Annual local fee'}</dt>
              <dd>US${program.local_fees.local_fee_usd}</dd>
              <dt>
                {ar ? 'مساهمة الراعي السنوية' : 'Annual sponsor contribution'}
              </dt>
              <dd>US${program.local_fees.sponsor_contribution_usd}</dd>
              <dt>
                {ar
                  ? 'مساهمة المشارك السنوية'
                  : 'Annual participant contribution'}
              </dt>
              <dd>US${program.local_fees.participant_contribution_usd}</dd>
            </dl>
          ) : (
            <p className="eoa-muted">
              {ar
                ? 'الرسوم المحلية ومساهمات الرعاية والمشارك قيد الاعتماد.'
                : 'Local fees and sponsor/participant contributions await approval.'}
            </p>
          )}
        </div>
      </div>
      <form
        className="eoa-card"
        onSubmit={(e) => {
          e.preventDefault()
          setResult(
            eligibility(amount === '' ? NaN : Number(amount), currency, owner),
          )
        }}
      >
        <h3>{ar ? 'تقييم أولي للأهلية' : 'Eligibility self-assessment'}</h3>
        <Field label={ar ? 'الإيراد السنوي الإجمالي' : 'Gross annual revenue'}>
          <input
            type="number"
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
        <label className="eoa-check">
          <input
            type="checkbox"
            checked={owner}
            onChange={(e) => {
              setOwner(e.target.checked)
              setResult('')
            }}
          />
          {ar
            ? 'أنا مالك أو مؤسس شركة قائمة.'
            : 'I am an owner or founder of an operating business.'}
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
        <button className="eoa-btn" type="submit">
          {ar ? 'تحقق من الأهلية' : 'Check eligibility'}
        </button>
        {result && <Notice>{messages[result]}</Notice>}
        <Link className="eoa-text-link" href="/EOA/apply">
          {ar ? 'جهز طلبك' : 'Prepare your application'} ↗
        </Link>
      </form>
    </div>
  )
}
