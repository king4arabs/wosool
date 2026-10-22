'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import { errorText } from '@/lib/eoa'
import { Field, Notice } from './Shared'

type PrivacyRequest = { id: number; type: string; status: string; resolution: string | null }
const types = {
  access: ['الوصول إلى بياناتي', 'Access my data'],
  correction: ['تصحيح بياناتي', 'Correct my data'],
  deletion: ['طلب حذف البيانات', 'Request deletion'],
  withdraw_consent: ['سحب الموافقة', 'Withdraw consent'],
} as const
const statuses: Record<string, [string, string]> = {
  received: ['تم الاستلام', 'Received'], in_review: ['قيد المراجعة', 'In review'],
  completed: ['مكتمل', 'Completed'], declined: ['لم تتم الموافقة', 'Declined'],
}

export function PrivacyRequests() {
  const { locale } = useLocale()
  const index = locale === 'ar' ? 0 : 1
  const [requests, setRequests] = useState<PrivacyRequest[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    const response = await api.get<{ data: PrivacyRequest[] }>('/eoa/privacy-requests')
    setRequests(response.data)
  }, [])
  useEffect(() => { void load().catch(e => setError(errorText(e))) }, [load])
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.post('/eoa/privacy-requests', { type: data.get('type'), message: data.get('message') })
      form.reset()
      setNotice(index === 0 ? 'تم استلام طلبك للمراجعة. لا يعني ذلك حذف البيانات فوراً.' : 'Your request was received for review. This does not mean data was immediately deleted.')
      await load()
    } catch (error) { setError(errorText(error)) }
    finally { setBusy(false) }
  }
  return <section className="eoa-card eoa-space" aria-labelledby="privacy-requests-title">
    <h2 id="privacy-requests-title">{index === 0 ? 'حقوق بياناتك' : 'Your data rights'}</h2>
    <p>{index === 0 ? 'أرسل طلباً لفريق إدارة البيانات وتابع الرد هنا. لا تُرفق بيانات مالية أو مستندات في هذه الرسالة.' : 'Send a request to the data administrator and follow the response here. Do not include financial data or documents in this message.'}</p>
    {error && <Notice error>{error}</Notice>}
    {notice && <Notice>{notice}</Notice>}
    <form onSubmit={submit}>
      <Field label={index === 0 ? 'نوع الطلب' : 'Request type'}>
        <select name="type" required>{Object.entries(types).map(([value, label]) => <option key={value} value={value}>{label[index]}</option>)}</select>
      </Field>
      <Field label={index === 0 ? 'تفاصيل اختيارية' : 'Optional details'}><textarea name="message" maxLength={2000} rows={3} /></Field>
      <button className="eoa-btn" disabled={busy}>{busy ? '…' : index === 0 ? 'إرسال طلب البيانات' : 'Send data request'}</button>
    </form>
    <div className="eoa-space" aria-live="polite">
      {requests.length === 0 && <p>{index === 0 ? 'لا توجد طلبات بيانات سابقة.' : 'No previous data requests.'}</p>}
      {requests.map(request => <div className="eoa-notification" key={request.id}>
        <h3>{types[request.type as keyof typeof types]?.[index] ?? request.type}</h3>
        <p>{statuses[request.status]?.[index] ?? request.status}</p>
        {request.resolution && <p className="eoa-preserve">{request.resolution}</p>}
      </div>)}
    </div>
  </section>
}
