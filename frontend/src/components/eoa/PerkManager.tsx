'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { errorText, type Organization } from '@/lib/eoa'
import { Field, Notice } from './Shared'

type Perk = {
  id: number
  organization_id: number
  title_en: string
  title_ar: string
  details_en: string
  details_ar: string
  approval_reference: string | null
  is_approved: boolean
  sort_order: number
}

export function PerkManager({ organizations, ar }: { organizations: Organization[]; ar: boolean }) {
  const [perks, setPerks] = useState<Perk[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    try {
      const result = await api.get<{ data: Perk[] }>('/eoa/operations/perks')
      setPerks(result.data)
    } catch (cause) { setError(errorText(cause)) }
  }, [])
  useEffect(() => { void load() }, [load])
  const approved = organizations.filter(org => org.relationship_status === 'confirmed' && org.logo_path)

  async function save(event: React.FormEvent<HTMLFormElement>, id?: number) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const form = new FormData(event.currentTarget)
    const data = {
      organization_id: Number(form.get('organization_id')),
      title_en: form.get('title_en'),
      title_ar: form.get('title_ar'),
      details_en: form.get('details_en'),
      details_ar: form.get('details_ar'),
      approval_reference: form.get('approval_reference') || null,
      is_approved: form.get('is_approved') === 'on',
      sort_order: Number(form.get('sort_order')),
    }
    try {
      if (id) await api.patch(`/eoa/operations/perks/${id}`, data)
      else await api.post('/eoa/operations/perks', data)
      await load()
      setNotice(ar ? 'تم حفظ العرض.' : 'Offer saved.')
      if (!id) event.currentTarget.reset()
    } catch (cause) { setError(errorText(cause)) }
    finally { setBusy(false) }
  }

  return <section className="eoa-space">
    <h2>{ar ? 'مزايا الشركاء' : 'Partner perks'}</h2>
    <p>{ar ? 'لا تنشر عرضاً قبل تأكيد العلاقة والشعار والحصول على مرجع موافقة العرض. لا تظهر التفاصيل إلا للمشاركين المسجلين.' : 'Confirm the provider relationship, logo and offer approval reference before publication. Details are visible only to enrolled participants.'}</p>
    {error && <Notice error>{error}</Notice>}
    {notice && <Notice>{notice}</Notice>}
    {[...perks, null].map((perk, index) => <form key={perk?.id ?? 'new'} className="eoa-card eoa-space" onSubmit={event => void save(event, perk?.id)}>
      <h3>{perk ? (ar ? 'تعديل العرض' : 'Edit offer') + ` #${index + 1}` : ar ? 'عرض جديد' : 'New offer'}</h3>
      <Field label={ar ? 'الجهة' : 'Provider'}><select name="organization_id" required defaultValue={perk?.organization_id ?? ''} key={perk?.id ?? 'new'}><option value="">{ar ? 'اختر جهة' : 'Choose a provider'}</option>{organizations.filter(org => approved.some(a => a.id === org.id) || org.id === perk?.organization_id).map(org => <option key={org.id} value={org.id}>{ar ? org.name_ar : org.name_en}</option>)}</select></Field>
      {(['title_en', 'title_ar'] as const).map(key => <Field key={key} label={key}><input name={key} required maxLength={255} defaultValue={perk?.[key] ?? ''} /></Field>)}
      {(['details_en', 'details_ar'] as const).map(key => <Field key={key} label={key}><textarea name={key} required maxLength={2000} rows={3} defaultValue={perk?.[key] ?? ''} /></Field>)}
      <Field label={ar ? 'مرجع الموافقة' : 'Offer approval reference'}><input name="approval_reference" maxLength={500} defaultValue={perk?.approval_reference ?? ''} /></Field>
      <Field label={ar ? 'الترتيب' : 'Display order'}><input name="sort_order" type="number" min="0" max="100000" required defaultValue={perk?.sort_order ?? 0} /></Field>
      <label className="eoa-check"><input name="is_approved" type="checkbox" defaultChecked={perk?.is_approved ?? false} />{ar ? 'اعتماد العرض ونشره للمشاركين' : 'Approve and publish to participants'}</label>
      <button className="eoa-btn" disabled={busy}>{ar ? 'حفظ' : 'Save'}</button>
    </form>)}
  </section>
}
