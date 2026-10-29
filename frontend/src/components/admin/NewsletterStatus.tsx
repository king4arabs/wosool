"use client"
import type { NewsletterStatus as Status } from '@/lib/admin'
import { dateLocale } from '@/lib/date-locale'

export function NewsletterStatus({ status, ar }: { status: Status; ar: boolean }) {
  const date = (value: string) => new Date(value).toLocaleString(dateLocale(ar, 'en-GB'), { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' })
  return <section aria-labelledby="newsletter-health" className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 id="newsletter-health" className="text-xl font-bold">{ar ? 'النشرة البريدية' : 'Newsletter delivery'}</h2>
    <p className="mt-2 text-sm leading-7 text-slate-600">{ar ? 'شهريًا، اليوم الأول الساعة 9 صباحًا بتوقيت الرياض. الأخبار والأعضاء الجدد والفعاليات القادمة.' : 'Monthly, on the first at 09:00 Riyadh. News, new members and upcoming events.'}</p>
    <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[
      [ar ? 'اشتراكات مفعّلة' : 'Active subscriptions', status.active],
      [ar ? 'بانتظار التأكيد' : 'Awaiting confirmation', status.pending],
      [ar ? 'أرسلها النظام خلال 30 يومًا' : 'Sent in 30 days', status.sent_30_days],
      [ar ? 'فشل الإرسال' : 'Failed sends', status.failed],
    ].map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><dt className="text-xs leading-6 text-slate-600">{label}</dt><dd className="mt-2 text-2xl font-bold">{value}</dd></div>)}</dl>
    <div className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
      <p>{status.transport_configured ? (ar ? 'وسيلة إرسال مهيأة؛ يلزم التحقق من الوصول الفعلي إلى البريد.' : 'A sending transport is configured; inbox delivery still needs verification.') : (ar ? 'وسيلة الإرسال غير مهيأة. راجع إعدادات البريد.' : 'Sending transport is not configured. Review mail settings.')}</p>
      <p>{status.scheduler_recent ? (ar ? 'رُصد تشغيل خلال الساعتين الماضيتين.' : 'A run was observed within the last two hours.') : (ar ? 'لم يُرصد تشغيل مكتمل حديثًا. راجع جدولة الخادم.' : 'No recent completed run. Check the server scheduler.')}</p>
      {status.last_run?.finished_at && <p>{ar ? 'آخر تشغيل: ' : 'Last run: '}{date(status.last_run.finished_at)} · {status.last_run.status === 'failed' ? (ar ? 'تعثر الإرسال' : 'Sending failed') : (ar ? 'اكتمل التشغيل' : 'Run completed')}</p>}
      {!!status.unresolved && <p role="alert" className="font-semibold text-amber-800">{ar ? `${status.unresolved} رسائل بحالة إرسال غير محسومة. تحقق من سجل مزود البريد قبل إعادة المحاولة.` : `${status.unresolved} sends need reconciliation. Check provider logs before retrying.`}</p>}
      <p>{ar ? 'موعد الإصدار التالي: ' : 'Next issue: '}{date(status.next_issue_at)}</p>
    </div>
  </section>
}
