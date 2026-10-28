"use client"
import { useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { useLocale } from '@/lib/locale'

export function NewsletterSignup() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return
    setBusy(true); setMessage(''); setFailed(false)
    try {
      await api.post('/newsletter/subscribe', { email: email.trim(), locale, consent: true })
      setMessage(ar ? 'تحقق من بريدك لتأكيد الاشتراك. إذا كنت مشتركًا بالفعل، ستستمر رسائلك كالمعتاد.' : 'Check your inbox to confirm. Existing subscribers will continue receiving their updates.')
      setEmail('')
    } catch (e) { setFailed(true); setMessage(e instanceof Error ? e.message : ar ? 'تعذر الاشتراك. حاول مجددًا.' : 'Unable to subscribe. Please retry.') }
    finally { setBusy(false) }
  }
  return <section className="mx-auto mb-12 max-w-5xl rounded-2xl border border-white/20 bg-white/5 p-6" aria-labelledby="newsletter-title">
    <h2 id="newsletter-title" className="text-xl font-bold text-white">{ar ? 'مختارات وصول في بريدك' : 'Wosool highlights in your inbox'}</h2>
    <p className="mt-2 text-sm leading-7 text-slate-300">{ar ? 'أخبار ريادة الأعمال ومقتطفات للمؤسسين، في نشرة أسبوعية مختصرة.' : 'Entrepreneurship news and founder insights in a concise weekly newsletter.'}</p>
    <form onSubmit={submit} className="mt-5 space-y-3">
      <label className="block text-sm text-white" htmlFor="newsletter-email">{ar ? 'البريد الإلكتروني' : 'Email address'}</label>
      <div className="flex flex-col gap-3 sm:flex-row"><input id="newsletter-email" name="newsletter_email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e => setEmail(e.target.value)} dir="ltr" placeholder="name@example.com" disabled={busy} className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-offset-4" /><button disabled={busy} className="min-h-12 shrink-0 rounded-xl bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-500 disabled:opacity-60">{busy ? (ar ? 'جارٍ الإرسال…' : 'Sending…') : (ar ? 'اشترك في النشرة' : 'Subscribe')}</button></div>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-300"><input name="newsletter_consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0" /><span>{ar ? 'أوافق على تلقي نشرة وصول، ويمكنني إلغاء الاشتراك في أي وقت.' : 'I agree to receive Wosool updates and can unsubscribe at any time.'}</span></label>
      {message && <p role={failed ? 'alert' : 'status'} className={`text-sm leading-7 ${failed ? 'text-rose-200' : 'text-emerald-200'}`}>{message}</p>}
    </form>
  </section>
}
