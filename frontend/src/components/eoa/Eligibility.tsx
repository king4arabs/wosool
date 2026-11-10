'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/locale'
import { eoaPolicy } from '@/lib/eoa-policy'
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
  const [basis, setBasis] = useState('revenue')
  const [result, setResult] = useState('')
  const messages: Record<string, string> = {
    potential: ar
      ? 'قد تستوفي المعيار المالي المحدد. تبدأ المراجعة الرسمية بعد تقديم المستندات ومراجعة الفرع.'
      : 'You may meet the selected financial criterion. Documentary verification and chapter review are still required.',
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
          <strong><bdi dir="ltr">{`US$${eoaPolicy.annualFee.toLocaleString('en-US')}`}</bdi></strong>

          <p>
            {ar
              ? 'يشمل الإجمالي الرسوم العالمية والرسوم المحلية. من المخطط أن يغطي الرعاة نصف التكلفة (2,000 دولار)، لكن الرعاية والجهات الراعية قيد التحديد والاعتماد؛ لا تُضمن مساهمة المشارك المخفضة حتى تأكيد الرعاية.'
              : 'The total includes global and local fees. Sponsors are intended to cover half (US$2,000), but sponsorship and sponsors are still to be confirmed; a reduced participant share is not guaranteed until confirmed.'}
          </p>
          <dl>
            {[[ar?'الرسوم العالمية السنوية':'Annual global dues',eoaPolicy.globalFee], [ar?'الرسوم المحلية السنوية':'Annual local dues',eoaPolicy.localFee], [ar?'مساهمة الراعي':'Sponsor contribution',eoaPolicy.sponsorShare], [ar?'مساهمة المشارك بعد تأكيد الرعاية':'Participant share after sponsorship confirmation',eoaPolicy.participantShare]].map(([label,amount])=><div key={label}><dt>{label}</dt><dd><bdi dir="ltr">US${Number(amount).toLocaleString('en-US')}</bdi></dd></div>)}
          </dl>
          <p>{ar?'السنة المالية من 1 يوليو إلى 30 يونيو. يؤكد الفريق المبلغ المحتسب حسب شهر البداية المعتمد وتغطية الراعي قبل الدفع. الباقة سنوية وليست رسماً لمرة واحدة لمدة عامين.':'The fiscal year runs from 1 July to 30 June. The team confirms prorating from the approved start month and sponsor coverage before payment. This is an annual package, not a one-time two-year fee.'}</p>
          {!program?.local_fees && <p className="eoa-muted">{ar?'لا تُعد الرعاية مؤكدة لمشاركتك حتى يؤكدها الفريق. تواصل قبل أي التزام مالي.':'Sponsorship for your place is not confirmed until verified by the team. Contact us before a financial commitment.'}</p>}
          {failed && <Notice error>{ar?'تعذر تحديث حالة الرعاية.':'Sponsorship status could not be refreshed.'} <button type="button" onClick={retry}>{ar?'إعادة المحاولة':'Retry'}</button></Notice>}

        </div>
      </div>
      <form
        className={`eoa-card ${styles.assessment}`}
        aria-labelledby="eligibility-assessment-title"
        onSubmit={(e) => {
          e.preventDefault()
          setResult(
            eligibility(amount === '' ? NaN : Number(amount), currency, owner, basis),
          )
        }}
      >
        <h2 id="eligibility-assessment-title">{ar ? 'تقييم أولي للأهلية' : 'Eligibility self-assessment'}</h2>
        <Field label={ar?'أساس التقييم':'Eligibility basis'}><select value={basis} onChange={e=>{setBasis(e.target.value);setResult('')}}><option value="revenue">{ar?'الإيرادات السنوية':'Annual gross revenue'}</option><option value="funding">{ar?'تمويل خاص لشركة مدعومة استثمارياً':'Privately raised funds — venture-backed business'}</option></select></Field><div className={styles.fields}>
          <Field label={basis === 'funding' ? (ar?'التمويل الخاص المحصل':'Privately raised funds') : (ar ? 'الإيراد السنوي الإجمالي' : 'Gross annual revenue')}>
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
              ? 'يُحسب التحويل بسعر 3.75 ريال لكل دولار أمريكي.'
              : 'Converted at SAR 3.75 per US dollar.'}{' '}
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
