"use client"
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'

function NewsletterAction() {
  const params = useSearchParams()
  const kind = params.has('unsubscribe') ? 'unsubscribe' : 'confirm'
  const { locale } = useLocale(); const ar = locale === 'ar'
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [message, setMessage] = useState('')
  async function action(kind: 'confirm' | 'unsubscribe') {
    if (busy) return
    const url = new URL(window.location.href)
    const token = new URLSearchParams(url.hash.slice(1)).get('token')
    const id = Number(url.searchParams.get(kind))
    if (!token || !id) { setMessage(ar ? 'افتح الرابط الوارد في رسالة البريد.' : 'Open the link from your email.'); return }
    setBusy(true); setMessage('')
    try {
      await api.post(`/newsletter/${kind}`, { id, token })
      window.history.replaceState(null, '', '/newsletter')
      setDone(true); setMessage(kind === 'confirm' ? (ar ? 'تم تأكيد اشتراكك. أهلاً بك في نشرة وصول.' : 'Subscription confirmed. Welcome to Wosool updates.') : (ar ? 'تم إلغاء الاشتراك في النشرة. لن تتأثر رسائل حسابك الأساسية.' : 'You have unsubscribed from the newsletter. Essential account emails are unaffected.'))
    } catch (e) { setMessage(e instanceof Error ? e.message : ar ? 'تعذر تنفيذ الطلب.' : 'Unable to complete the request.') }
    finally { setBusy(false) }
  }
  return <PublicLayout><section className="gateway-section"><div className="mx-auto max-w-lg"><p className="gateway-eyebrow">WOSOOL</p><h1 className="gateway-heading">{ar ? 'اشتراك نشرة وصول' : 'Wosool newsletter subscription'}</h1><div className="gateway-card mt-6 space-y-5">
    <p className="text-sm leading-7 text-slate-600">{ar ? 'اختر تأكيد الاشتراك أو إلغاءه باستخدام الرابط المرسل إلى بريدك.' : 'Use the link from your email to confirm or cancel your subscription.'}</p>
    {message && <p role={done ? 'status' : 'alert'} className="rounded-xl bg-slate-100 p-4 text-sm leading-7">{message}</p>}
    {!done && <button disabled={busy} onClick={() => void action(kind)} className="gateway-button w-full">{kind === 'confirm' ? (ar ? 'تأكيد الاشتراك' : 'Confirm subscription') : (ar ? 'إلغاء الاشتراك' : 'Unsubscribe')}</button>}
  </div></div></section></PublicLayout>
}

export default function NewsletterPage() { return <Suspense fallback={<p role="status">…</p>}><NewsletterAction /></Suspense> }
