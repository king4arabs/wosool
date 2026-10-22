'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { errorText, type Organization } from '@/lib/eoa'
import { defaultEoaFaqs, type EoaEditorial, type EoaFaq, type EoaOperator, type EoaPartnerRole } from '@/lib/eoa-editorial'
import { Field, Notice } from './Shared'

type EditorialResponse = {
  data: EoaEditorial
  published_at: string | null
  partner_roles?: Record<string, EoaPartnerRole>
}

const blankOperator: EoaOperator = { name_en: 'LAMARKA', name_ar: 'لاماركا', description_en: '', description_ar: '', website: '', visible: false }
const blankFaq: EoaFaq = { question_en: '', question_ar: '', answer_en: '', answer_ar: '', visible: true }

export function EoaEditorialManager({ ar, organizations, onSaved }: { ar: boolean; organizations: Organization[]; onSaved?: () => Promise<void> }) {
  const [editorial, setEditorial] = useState<EoaEditorial | null>(null)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [roles, setRoles] = useState<Record<string, EoaPartnerRole>>({})
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)
  const selected = organizations.find((organization) => organization.id === selectedId)

  useEffect(() => {
    const controller = new AbortController()
    api.get<EditorialResponse>('/eoa/operations/editorial', { signal: controller.signal }).then((response) => {
      if (controller.signal.aborted) return
      setEditorial({ ...response.data, operator: response.data.operator ?? blankOperator, faqs: response.data.version === 0 && !response.data.faqs.length ? defaultEoaFaqs.map((faq) => ({ ...faq })) : response.data.faqs })
      setPublishedAt(response.published_at)
      setRoles(response.partner_roles ?? {})
      setError('')
    }).catch((cause) => { if (!controller.signal.aborted) setError(errorText(cause)) })
    return () => controller.abort()
  }, [attempt])

  function updateOperator(patch: Partial<EoaOperator>) {
    setEditorial((current) => current ? { ...current, operator: { ...(current.operator ?? blankOperator), ...patch } } : current)
  }

  function updateFaq(index: number, patch: Partial<EoaFaq>) {
    setEditorial((current) => current ? { ...current, faqs: current.faqs.map((faq, position) => position === index ? { ...faq, ...patch } : faq) } : current)
  }

  function moveFaq(index: number, offset: number) {
    setEditorial((current) => {
      if (!current) return current
      const faqs = [...current.faqs]
      const destination = index + offset
      if (destination < 0 || destination >= faqs.length) return current
      ;[faqs[index], faqs[destination]] = [faqs[destination], faqs[index]]
      return { ...current, faqs }
    })
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editorial || busy) return
    const action = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value ?? 'draft'
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const response = await api.put<EditorialResponse>('/eoa/operations/editorial', { ...editorial, action })
      setEditorial(response.data)
      setPublishedAt(response.published_at)
      setNotice(action === 'publish' ? (ar ? 'تم نشر المحتوى على صفحة البرنامج.' : 'Content published to the program page.') : action === 'unpublish' ? (ar ? 'تم إلغاء النشر مع الاحتفاظ بالمسودة.' : 'Content unpublished. Your draft is retained.') : (ar ? 'تم حفظ المسودة. المحتوى المنشور لم يتغير.' : 'Draft saved. Published content is unchanged.'))
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setBusy(false)
    }
  }

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || busy) return
    const values = new FormData(event.currentTarget)
    const payload = Object.fromEntries(values.entries())
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await api.patch(`/eoa/operations/organizations/${selected.id}`, payload)
      setRoles((current) => {
        const next = { ...current }
        if (payload.partner_role) next[String(selected.id)] = String(payload.partner_role) as EoaPartnerRole
        else delete next[String(selected.id)]
        return next
      })
      setNotice(ar ? 'تم حفظ معلومات الجهة.' : 'Organization details saved.')
      if (onSaved) {
        try { await onSaved() }
        catch (cause) { setError(`${ar ? 'تم الحفظ. تعذر تحديث القائمة؛ أعد تحميل الصفحة.' : 'Saved. The list could not refresh; reload the page.'} ${errorText(cause)}`) }
      }
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="eoa-space">
      <h2>{ar ? 'محتوى صفحة البرنامج' : 'Program page content'}</h2>
      <p>{ar ? 'حرّر المحتوى باللغتين واحفظ المسودة قبل النشر. يظل آخر إصدار منشور ظاهراً حتى تنشر تعديلاتك أو تلغي النشر.' : 'Edit both languages and save a draft before publishing. The last published version stays visible until you publish changes or unpublish.'}</p>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      {!editorial ? (
        <div className="eoa-card">
          {!error && <Notice>{ar ? 'جارٍ تحميل المحتوى…' : 'Loading content…'}</Notice>}
          {error && <button type="button" className="eoa-btn" onClick={() => setAttempt((value) => value + 1)}>{ar ? 'إعادة المحاولة' : 'Try again'}</button>}
        </div>
      ) : (
        <form onSubmit={saveContent}>
          <fieldset disabled={busy}>
            <legend className="sr-only">{ar ? 'تحرير محتوى البرنامج' : 'Edit program content'}</legend>
            <div className="eoa-card">
              <div className="eoa-actions">
                <strong>{publishedAt ? (ar ? 'يوجد إصدار منشور' : 'A published version is live') : (ar ? 'لم يُنشر محتوى مخصص بعد' : 'No custom content published yet')}</strong>
                <button type="button" className="eoa-text-link" onClick={() => setAttempt((value) => value + 1)}>{ar ? 'إعادة تحميل النسخة المحفوظة' : 'Reload saved version'}</button>
              </div>
              <Field label={ar ? 'مرجع اعتماد المحتوى (داخلي، مطلوب للنشر)' : 'Content approval reference (internal, required to publish)'}>
                <textarea value={editorial.source_reference ?? ''} maxLength={2000} rows={2} onChange={(event) => setEditorial({ ...editorial, source_reference: event.target.value })} />
              </Field>
              <h3>{ar ? 'الشريك المشغّل' : 'Operating partner'}</h3>
              <label className="eoa-check"><input type="checkbox" checked={editorial.operator?.visible ?? false} onChange={(event) => updateOperator({ visible: event.target.checked })} />{ar ? 'إظهار قسم الشريك المشغّل عند النشر' : 'Show operating partner section when published'}</label>
              <div className="eoa-two-grid">
                <Field label={ar ? 'اسم الجهة بالعربية' : 'Arabic organization name'}><input dir="rtl" value={editorial.operator?.name_ar ?? ''} maxLength={255} onChange={(event) => updateOperator({ name_ar: event.target.value })} /></Field>
                <Field label={ar ? 'اسم الجهة بالإنجليزية' : 'English organization name'}><input dir="ltr" value={editorial.operator?.name_en ?? ''} maxLength={255} onChange={(event) => updateOperator({ name_en: event.target.value })} /></Field>
                <Field label={ar ? 'دور المشغّل بالعربية' : 'Arabic operating partner description'}><textarea dir="rtl" rows={5} value={editorial.operator?.description_ar ?? ''} maxLength={3000} onChange={(event) => updateOperator({ description_ar: event.target.value })} /></Field>
                <Field label={ar ? 'دور المشغّل بالإنجليزية' : 'English operating partner description'}><textarea dir="ltr" rows={5} value={editorial.operator?.description_en ?? ''} maxLength={3000} onChange={(event) => updateOperator({ description_en: event.target.value })} /></Field>
              </div>
              <Field label={ar ? 'الموقع الرسمي للمشغّل (https://)' : 'Operator official website (https://)'}><input type="url" dir="ltr" value={editorial.operator?.website ?? ''} maxLength={255} onChange={(event) => updateOperator({ website: event.target.value })} /></Field>
            </div>
            <div className="eoa-space">
              <h3>{ar ? 'الأسئلة الشائعة' : 'Frequently asked questions'}</h3>
              {editorial.faqs.map((faq, index) => (
                <div key={index} className="eoa-card eoa-space">
                  <div className="eoa-actions">
                    <strong>{ar ? 'السؤال' : 'Question'} {index + 1}</strong>
                    <button type="button" className="eoa-text-link" disabled={index === 0} onClick={() => moveFaq(index, -1)} aria-label={`${ar ? 'نقل السؤال لأعلى' : 'Move question up'} ${index + 1}`}>↑</button>
                    <button type="button" className="eoa-text-link" disabled={index === editorial.faqs.length - 1} onClick={() => moveFaq(index, 1)} aria-label={`${ar ? 'نقل السؤال لأسفل' : 'Move question down'} ${index + 1}`}>↓</button>
                    <button type="button" className="eoa-text-link" onClick={() => setEditorial({ ...editorial, faqs: editorial.faqs.filter((_, position) => position !== index) })}>{ar ? 'حذف من المسودة' : 'Remove from draft'}</button>
                  </div>
                  <div className="eoa-two-grid">
                    <Field label={ar ? 'السؤال بالعربية' : 'Arabic question'}><input dir="rtl" required maxLength={300} value={faq.question_ar} onChange={(event) => updateFaq(index, { question_ar: event.target.value })} /></Field>
                    <Field label={ar ? 'السؤال بالإنجليزية' : 'English question'}><input dir="ltr" required maxLength={300} value={faq.question_en} onChange={(event) => updateFaq(index, { question_en: event.target.value })} /></Field>
                    <Field label={ar ? 'الإجابة بالعربية' : 'Arabic answer'}><textarea dir="rtl" rows={4} required maxLength={3000} value={faq.answer_ar} onChange={(event) => updateFaq(index, { answer_ar: event.target.value })} /></Field>
                    <Field label={ar ? 'الإجابة بالإنجليزية' : 'English answer'}><textarea dir="ltr" rows={4} required maxLength={3000} value={faq.answer_en} onChange={(event) => updateFaq(index, { answer_en: event.target.value })} /></Field>
                  </div>
                  <label className="eoa-check"><input type="checkbox" checked={faq.visible} onChange={(event) => updateFaq(index, { visible: event.target.checked })} />{ar ? 'إظهار السؤال عند النشر' : 'Show question when published'}</label>
                </div>
              ))}
              <button type="button" className="eoa-btn eoa-btn-secondary" disabled={editorial.faqs.length >= 30} onClick={() => setEditorial({ ...editorial, faqs: [...editorial.faqs, { ...blankFaq }] })}>{ar ? 'إضافة سؤال' : 'Add question'}</button>
            </div>
            <div className="eoa-actions eoa-space">
              <button className="eoa-btn eoa-btn-secondary" type="submit" name="action" value="draft">{ar ? 'حفظ المسودة' : 'Save draft'}</button>
              <button className="eoa-btn" type="submit" name="action" value="publish">{ar ? 'نشر المحتوى' : 'Publish content'}</button>
              {publishedAt && <button className="eoa-text-link" type="submit" name="action" value="unpublish" formNoValidate>{ar ? 'إلغاء نشر المحتوى المخصص' : 'Unpublish custom content'}</button>}
            </div>
          </fieldset>
        </form>
      )}
      <div className="eoa-space">
        <h2>{ar ? 'معلومات الشركاء والجهات' : 'Partner & organization details'}</h2>
        <p>{ar ? 'استخدم المعلومات والمصادر الرسمية. يظهر الشريك في القسم العام بعد توثيق العلاقة واعتماد الجهة وإضافة شعارها.' : 'Use official information and sources. Public partner sections show verified organizations with a confirmed relationship, recorded evidence and a logo.'}</p>
        <Field label={ar ? 'اختر الجهة' : 'Choose organization'}>
          <select value={selectedId ?? ''} disabled={busy} onChange={(event) => setSelectedId(event.target.value ? Number(event.target.value) : null)}>
            <option value="">{ar ? 'اختر جهة لتحريرها' : 'Select an organization to edit'}</option>
            {organizations.map((organization) => <option key={organization.id} value={organization.id}>{ar ? organization.name_ar : organization.name_en}</option>)}
          </select>
        </Field>
        {selected && <form key={selected.id} className="eoa-card" onSubmit={saveOrganization}>
          <fieldset disabled={busy}>
            <legend>{ar ? selected.name_ar : selected.name_en}</legend>
            <div className="eoa-two-grid">
              <Field label={ar ? 'الاسم بالعربية' : 'Arabic name'}><input name="name_ar" dir="rtl" required maxLength={255} defaultValue={selected.name_ar} /></Field>
              <Field label={ar ? 'الاسم بالإنجليزية' : 'English name'}><input name="name_en" dir="ltr" required maxLength={255} defaultValue={selected.name_en} /></Field>
              <Field label={ar ? 'الوصف بالعربية' : 'Arabic description'}><textarea name="support_ar" dir="rtl" rows={4} required maxLength={3000} defaultValue={selected.support_ar} /></Field>
              <Field label={ar ? 'الوصف بالإنجليزية' : 'English description'}><textarea name="support_en" dir="ltr" rows={4} required maxLength={3000} defaultValue={selected.support_en} /></Field>
              <Field label={ar ? 'الموقع الرسمي' : 'Official website'}><input name="website" dir="ltr" type="url" required maxLength={255} defaultValue={selected.website} /></Field>
              <Field label={ar ? 'مصدر معلومات الجهة' : 'Organization information source'}><input name="source_url" dir="ltr" type="url" required maxLength={255} defaultValue={selected.source_url} /></Field>
              <Field label={ar ? 'مسار الشعار المحلي (/partners/ أو /eoa/)' : 'Local logo path (/partners/ or /eoa/)'}><input name="logo_path" dir="ltr" maxLength={255} defaultValue={selected.logo_path ?? ''} /></Field>
              <Field label={ar ? 'الرابط الرسمي لمصدر الشعار' : 'Official logo source URL'}><input name="logo_source_url" dir="ltr" type="url" maxLength={2048} defaultValue={selected.logo_source_url ?? ''} /></Field>
              <Field label={ar ? 'نوع الشراكة' : 'Partner role'}><select name="partner_role" defaultValue={roles[String(selected.id)] ?? ''}><option value="">{ar ? 'غير محدد' : 'Unassigned'}</option><option value="operator">{ar ? 'مشغّل' : 'Operating partner'}</option><option value="enabler">{ar ? 'ممكّن' : 'Enabling partner'}</option><option value="supporter">{ar ? 'داعم' : 'Supporting partner'}</option></select></Field>
              <Field label={ar ? 'حالة العلاقة' : 'Relationship status'}><select name="relationship_status" defaultValue={selected.relationship_status}><option value="ecosystem">{ar ? 'ضمن المنظومة' : 'Ecosystem organization'}</option><option value="prospective">{ar ? 'قيد التنسيق' : 'Prospective partner'}</option><option value="confirmed">{ar ? 'شريك مؤكد' : 'Confirmed partner'}</option></select></Field>
            </div>
            <Field label={ar ? 'مرجع تأكيد العلاقة (داخلي)' : 'Relationship confirmation evidence (internal)'}><textarea name="relationship_evidence" rows={3} maxLength={2000} defaultValue={selected.relationship_evidence ?? ''} /></Field>
            <button type="submit" className="eoa-btn">{ar ? 'حفظ معلومات الجهة' : 'Save organization'}</button>
          </fieldset>
        </form>}
      </div>
    </section>
  )
}
