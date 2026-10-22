'use client'
import { useState } from 'react'
import { useLocale } from '@/lib/locale'
import { api } from '@/lib/api'
import { errorText } from '@/lib/eoa'
import { Field, Notice } from './Shared'
export function EoaContact() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        const f = new FormData(e.currentTarget)
        try {
          await api.post('/contact', {
            name: f.get('name'),
            email: f.get('email'),
            company: f.get('company'),
            category: f.get('category'),
            subject: `EO Accelerator — ${f.get('subject')}`,
            message: f.get('message'),
          })
          setSaved(true)
        } catch (e) {
          setError(errorText(e))
        } finally {
          setBusy(false)
        }
      }}
    >
      {saved ? (
        <Notice>
          {ar
            ? 'تم حفظ استفسارك لفريق البرنامج.'
            : 'Your inquiry has been recorded for the program team.'}
        </Notice>
      ) : (
        <>
          <Field label={ar ? 'الاسم' : 'Name'}>
            <input name="name" required maxLength={255} />
          </Field>
          <Field label={ar ? 'البريد الإلكتروني' : 'Email'}>
            <input type="email" name="email" required maxLength={255} />
          </Field>
          <Field label={ar ? 'الجهة (اختياري)' : 'Organization (optional)'}>
            <input name="company" maxLength={255} />
          </Field>
          <Field label={ar ? 'نوع الاستفسار' : 'Inquiry type'}>
            <select name="category">
              <option value="general">
                {ar ? 'البرنامج والتقديم' : 'Program & applications'}
              </option>
              <option value="partnerships">
                {ar ? 'شراكة' : 'Partnership'}
              </option>
              <option value="sponsorship">
                {ar ? 'رعاية' : 'Sponsorship'}
              </option>
            </select>
          </Field>
          <Field label={ar ? 'الموضوع' : 'Subject'}>
            <input name="subject" required maxLength={220} />
          </Field>
          <Field label={ar ? 'الرسالة' : 'Message'}>
            <textarea name="message" required maxLength={3000} />
          </Field>
          <button className="eoa-btn" disabled={busy}>
            {ar ? 'إرسال الاستفسار' : 'Submit inquiry'}
          </button>
        </>
      )}
      {error && <Notice error>{error}</Notice>}
    </form>
  )
}
