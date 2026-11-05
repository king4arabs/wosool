'use client'

import { Suspense, useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, CalendarClock, Plus, RefreshCw, Search } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { useLocale } from '@/lib/locale'
import { dateLocale } from '@/lib/date-locale'
import { Button } from '@/components/ui/button'
import { relationshipStage, relationshipStages, readRelationshipFilters, relationshipQuery, relationshipFollowUp, type RelationshipKind, type RelationshipRecord, type RelationshipCollection, type RelationshipFilters, type RelationshipView } from '@/lib/admin-relationships'

const control = 'min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600'
const label = 'grid min-w-0 gap-2 text-sm font-semibold text-slate-700'
const followUpLabels = {
  overdue: ['متأخرة', 'Overdue'], today: ['اليوم', 'Today'], scheduled: ['مجدولة', 'Scheduled'],
  unscheduled: ['دون موعد', 'No date set'], complete: ['مكتملة', 'Complete'],
} as const

export function RelationshipWorkspace({ kind }: { kind: RelationshipKind }) {
  return <Suspense><RelationshipRoute kind={kind} /></Suspense>
}
function RelationshipRoute({ kind }: { kind: RelationshipKind }) {
  const params = useSearchParams()
  const filters = readRelationshipFilters(new URLSearchParams(params.toString()), kind)
  function update(patch: Partial<RelationshipFilters>) {
    // Read the latest URL so a pending search cannot undo a newer filter selection.
    const current = readRelationshipFilters(new URLSearchParams(window.location.search), kind)
    window.history.replaceState(null, '', `/admin/${kind}${relationshipQuery({ ...current, ...patch })}`)
  }
  return <RelationshipContent key={kind} kind={kind} filters={filters} update={update} />
}
function RelationshipContent({ kind, filters, update }: { kind: RelationshipKind; filters: RelationshipFilters; update: (patch: Partial<RelationshipFilters>) => void }) {
  const { locale } = useLocale(); const ar = locale === 'ar'; const pr = kind === 'pr'
  const { search, stage, owner, view, priority, sort, page, record: recordId } = filters
  const [query, setQuery] = useState(search.trim())
  const [revision, setRevision] = useState(0)
  const [detailRevision, setDetailRevision] = useState(0)
  const [result, setResult] = useState<RelationshipCollection | null>(null)
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<RelationshipRecord | 'new' | null>(null)
  const [opening, setOpening] = useState(false); const [notice, setNotice] = useState('')
  useEffect(() => { const timer = setTimeout(() => setQuery(search.trim()), 250); return () => clearTimeout(timer) }, [search])
  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true); setError('')
    try {
      const data = await api.get<RelationshipCollection>('/admin/relationships', { params: { kind, search: query, stage, owner_id: owner, view, due: view === 'due' ? 1 : undefined, priority, sort, page }, signal })
      if (!signal.aborted) setResult(data)
    } catch (error) { if (!signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load records.') }
    finally { if (!signal.aborted) setLoading(false) }
  }, [kind, query, stage, owner, view, priority, sort, page])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load, revision])
  useEffect(() => {
    if (recordId === null) return
    const controller = new AbortController()
    setOpening(true); setSelected(null)
    api.get<{ data: RelationshipRecord }>(`/admin/relationships/${recordId}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { if (data.data.kind === kind) setSelected(data.data); else setError(ar ? 'السجل تابع لمساحة أخرى.' : 'This record belongs to a different workspace.') } })
      .catch(error => { if (!controller.signal.aborted) setError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setOpening(false) })
    return () => controller.abort()
  }, [recordId, kind, ar, detailRevision])
  function saved(record: RelationshipRecord) { setSelected(record); update({ record: record.id }); setRevision(value => value + 1); setNotice(ar ? 'تم حفظ السجل.' : 'Record saved.') }
  function open(record: number) { setNotice(''); setSelected(null); update({ record }) }
  function close() { setSelected(null); setOpening(false); update({ record: null }) }
  const summaries: { key: RelationshipView; title: string; value: number | undefined }[] = [
    { key: 'all', title: ar ? 'جميع السجلات' : 'All records', value: result?.summary.total },
    { key: 'open', title: ar ? 'علاقات مفتوحة' : 'Open relationships', value: result?.summary.open },
    { key: 'due', title: ar ? 'متابعات مستحقة' : 'Follow-ups due', value: result?.summary.due },
    { key: 'unassigned', title: ar ? 'دون مسؤول' : 'Unassigned', value: result?.summary.unassigned },
  ]
  const filtered = Boolean(search || stage || owner || priority || view !== 'all')
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-[var(--brand-navy)] p-6 text-white sm:p-8">
      <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-widest text-indigo-200">{pr ? 'PR' : 'CRM'}</p><h2 className="mt-2 text-2xl font-extrabold">{pr ? ar ? 'العلاقات العامة والإعلام' : 'Public relations & media' : ar ? 'إدارة العلاقات' : 'Relationship management'}</h2><p className="mt-3 text-sm leading-7 text-slate-200">{pr ? ar ? 'تابع الحملات والجهات الإعلامية من الفكرة إلى التغطية المنشورة.' : 'Track campaigns and media relationships from the first pitch to published coverage.' : ar ? 'نظّم جهات التواصل، وحدد المسؤول والخطوة التالية لكل علاقة.' : 'Organize contacts, assign an owner and keep the next step clear for every relationship.'}</p></div>
      <Button onClick={() => { update({ record: null }); setOpening(false); setSelected('new'); setNotice('') }}><Plus size={16} aria-hidden="true" />{ar ? 'سجل جديد' : 'New record'}</Button>
    </header>
    <nav aria-label={ar ? 'خدمات العلاقات' : 'Relationship services'} className="flex flex-wrap gap-3 text-sm font-semibold text-indigo-700 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center [&>a]:rounded-xl [&>a]:border [&>a]:border-slate-200 [&>a]:bg-white [&>a]:px-4"><Link href="/admin/services">{ar ? 'جميع الخدمات' : 'All services'}</Link><Link href="/admin/messages">{ar ? 'رسائل التواصل الواردة' : 'Incoming contact messages'} ↗</Link><Link href={pr ? '/admin/news' : '/admin/partners'}>{pr ? ar ? 'إدارة المحتوى' : 'Content management' : ar ? 'الشركاء' : 'Partners'} ↗</Link><Link href={pr ? '/admin/crm' : '/admin/pr'}>{pr ? 'CRM' : ar ? 'العلاقات العامة' : 'Public relations'} ↗</Link></nav>
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}<Button variant="outline" className="ms-3" onClick={() => { setRevision(value => value + 1); setDetailRevision(value => value + 1) }}>{ar ? 'إعادة المحاولة' : 'Retry'}</Button></div>}
    {recordId !== null && opening && <p role="status">{ar ? 'جارٍ فتح السجل…' : 'Opening record…'}</p>}
    {selected && (selected === 'new' || (recordId !== null && selected.id === recordId)) && <RelationshipEditor key={selected === 'new' ? 'new' : `${selected.id}-${selected.version}`} kind={kind} record={selected === 'new' ? null : selected} owners={result?.owners ?? []} onSave={saved} onClose={close} onReload={() => setDetailRevision(value => value + 1)} />}
    <section aria-label={ar ? 'طرق عرض العلاقات' : 'Relationship views'} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {summaries.map(item => <button type="button" key={item.key} aria-pressed={view === item.key} onClick={() => update({ view: item.key, stage: '', owner: '', priority: '', search: '', page: 1 })} className={`rounded-2xl border p-5 text-start transition-colors ${view === item.key ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-indigo-300'}`}><span className="block text-sm font-semibold text-slate-700">{item.title}</span><span className="mt-2 block text-3xl font-bold text-slate-950">{item.value ?? '—'}</span></button>)}
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6" aria-label={ar ? 'السجلات والمتابعة' : 'Records and follow-up'} aria-busy={loading}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className={label}><span>{ar ? 'بحث بالاسم أو الجهة أو الحملة' : 'Search name, organization or campaign'}</span><span className="relative"><Search className="absolute start-3 top-3 text-slate-400" size={18} aria-hidden="true"/><input type="search" maxLength={120} className={`${control} ps-10`} value={search} onChange={event => update({ search: event.target.value, page: 1 })} /></span></label>
        <label className={label}>{ar ? 'المرحلة' : 'Stage'}<select aria-label={ar ? 'المرحلة' : 'Stage'} className={control} value={stage} onChange={event => update({ stage: event.target.value, page: 1 })}><option value="">{ar ? 'جميع المراحل' : 'All stages'}</option>{relationshipStages[kind].map(([value, arabic, english]) => <option value={value} key={value}>{ar ? arabic : english}</option>)}</select></label>
        <label className={label}>{ar ? 'المسؤول' : 'Owner'}<select aria-label={ar ? 'المسؤول' : 'Owner'} className={control} value={owner} onChange={event => update({ owner: event.target.value, page: 1 })}><option value="">{ar ? 'جميع المسؤولين' : 'All owners'}</option>{result?.owners.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className={label}>{ar ? 'طريقة العرض' : 'View'}<select aria-label={ar ? 'طريقة العرض' : 'View'} className={control} value={view} onChange={event => update({ view: event.target.value as RelationshipView, page: 1 })}>{summaries.map(item => <option key={item.key} value={item.key}>{item.title}</option>)}</select></label>
        <label className={label}>{ar ? 'الأولوية' : 'Priority'}<select aria-label={ar ? 'الأولوية' : 'Priority'} className={control} value={priority} onChange={event => update({ priority: event.target.value, page: 1 })}><option value="">{ar ? 'جميع الأولويات' : 'All priorities'}</option><option value="high">{ar ? 'أولوية عالية' : 'High priority'}</option></select></label>
        <label className={label}>{ar ? 'الترتيب' : 'Sort by'}<select aria-label={ar ? 'الترتيب' : 'Sort by'} className={control} value={sort} onChange={event => update({ sort: event.target.value as RelationshipFilters['sort'], page: 1 })}><option value="follow_up">{ar ? 'أقرب متابعة' : 'Next follow-up'}</option><option value="updated">{ar ? 'آخر تحديث' : 'Recently updated'}</option><option value="name">{ar ? 'الاسم' : 'Name'}</option></select></label>
      </div>
      <div className="my-4 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-slate-600">{loading ? ar ? 'جارٍ تحميل السجلات…' : 'Loading records…' : `${result?.meta.total ?? 0} ${ar ? 'سجل في هذا العرض' : 'records in this view'}`}</p>
        <div className="flex flex-wrap gap-2">{filtered && <Button variant="outline" onClick={() => update({ search: '', stage: '', owner: '', priority: '', view: 'all', page: 1 })}>{ar ? 'مسح جميع الفلاتر' : 'Clear all filters'}</Button>}<Button variant="outline" disabled={loading} onClick={() => setRevision(value => value + 1)}><RefreshCw size={15} aria-hidden="true" />{ar ? 'تحديث' : 'Refresh'}</Button></div>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-5" aria-label={ar ? 'مراحل المسار' : 'Pipeline stages'}>{relationshipStages[kind].map(([value, arabic, english]) => <button type="button" key={value} aria-pressed={stage === value} onClick={() => update({ stage: stage === value ? '' : value, page: 1 })} className={`min-h-11 rounded-xl border px-3 py-2 text-sm ${stage === value ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-700'}`}>{ar ? arabic : english} <span className="ms-2 font-bold">{result?.summary.stages[value] ?? '—'}</span></button>)}</div>
      {loading ? <div className="space-y-4 py-6" aria-hidden="true">{[0, 1, 2].map(key => <div key={key} className="h-24 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />)}</div> : !error && <>
        {!result?.data.length && <div className="py-10 text-center"><CalendarClock size={30} className="mx-auto mb-3 text-slate-400" aria-hidden="true" /><h3 className="font-bold text-slate-800">{ar ? 'لا توجد سجلات في هذا العرض' : 'No records in this view'}</h3><p className="mt-2 text-sm text-slate-600">{filtered ? ar ? 'غيّر الفلاتر للعثور على علاقات أخرى.' : 'Adjust the filters to find other relationships.' : ar ? 'أضف أول جهة تواصل وحدد خطوة المتابعة التالية.' : 'Add your first contact and plan the next follow-up.'}</p></div>}
        <ul className="divide-y divide-slate-100">{result?.data.map(record => {
          const followUp = relationshipFollowUp(record)
          return <li key={record.id} className="grid gap-4 py-5 xl:grid-cols-[minmax(0,1fr)_minmax(13rem,.5fr)]">
            <div className="min-w-0"><button type="button" onClick={() => open(record.id)} className="min-h-11 break-words text-start text-base font-bold text-indigo-700 underline-offset-4 hover:underline">{record.name}</button><p className="break-words text-sm text-slate-600">{record.organization || '—'}{record.campaign && ` · ${record.campaign}`}</p>
              {record.notes && <p className="mt-2 line-clamp-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700"><span className="font-semibold">{ar ? 'الخطوة التالية: ' : 'Next step: '}</span>{record.notes}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-indigo-50 px-3 py-2 font-semibold text-indigo-800">{relationshipStage(kind, record.stage, ar)}</span>{record.priority === 'high' && <span className="rounded-full bg-amber-50 px-3 py-2 font-semibold text-amber-900">{ar ? 'أولوية عالية' : 'High priority'}</span>}</div>
            </div>
            <div className="flex min-w-0 flex-col items-start justify-center gap-2 text-sm">
              <p className="break-words font-semibold text-slate-700">{record.owner?.name ?? (ar ? 'دون مسؤول' : 'Unassigned')}</p>
              <span className={`inline-flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${followUp === 'overdue' ? 'bg-rose-50 text-rose-800' : followUp === 'today' ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-600'}`}><CalendarClock size={14} aria-hidden="true" />{followUpLabels[followUp][ar ? 0 : 1]}{record.follow_up_on && <time dateTime={record.follow_up_on}>{new Date(`${record.follow_up_on.slice(0, 10)}T12:00:00Z`).toLocaleDateString(dateLocale(ar), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time>}</span>
              <a href={`/admin/${kind}${relationshipQuery({ ...filters, record: record.id })}`} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); open(record.id) } }} aria-label={`${ar ? 'عرض وتعديل' : 'View and edit'} ${record.name}`} className="inline-flex min-h-11 items-center gap-2 font-semibold text-indigo-700">{ar ? 'عرض وتعديل' : 'View & edit'}<ArrowUpRight size={15} aria-hidden="true" /></a>
              {record.coverage_url && <a className="inline-flex min-h-11 items-center gap-1 text-indigo-700 underline" href={record.coverage_url} target="_blank" rel="noopener noreferrer">{ar ? 'التغطية' : 'Coverage'}<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only">{ar ? 'يفتح في نافذة جديدة' : 'opens in a new tab'}</span></a>}
            </div>
          </li>
        })}</ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-sm text-slate-600">{ar ? 'الصفحة' : 'Page'} {result?.meta.current_page ?? 1} / {result?.meta.last_page ?? 1}</p><div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>{ar ? 'السابق' : 'Previous'}</Button><Button variant="outline" disabled={page >= (result?.meta.last_page ?? 1)} onClick={() => update({ page: page + 1 })}>{ar ? 'التالي' : 'Next'}</Button></div></div>
      </>}
    </section>
  </div>
}

function RelationshipEditor({ kind, record, owners, onSave, onClose, onReload }: { kind: RelationshipKind; record: RelationshipRecord | null; owners: RelationshipCollection['owners']; onSave: (record: RelationshipRecord) => void; onClose: () => void; onReload: () => void }) {
  const { locale } = useLocale(); const ar = locale === 'ar'
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [note, setNote] = useState('')
  const [activities, setActivities] = useState(record?.activities ?? [])
  const [noteSaved, setNoteSaved] = useState(false)
  const [conflict, setConflict] = useState(false)
  const focus = useCallback((element: HTMLHeadingElement | null) => { element?.focus() }, [])
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setConflict(false)
    const fields = new FormData(event.currentTarget)
    const data: Record<string, unknown> = Object.fromEntries([...fields.entries()].map(([key, value]) => [key, typeof value === 'string' ? value.trim() || null : value]))
    data.owner_id = data.owner_id ? Number(data.owner_id) : null
    try {
      const response = record ? await api.put<{ data: RelationshipRecord }>(`/admin/relationships/${record.id}`, { ...data, version: record.version }) : await api.post<{ data: RelationshipRecord }>('/admin/relationships', { ...data, kind })
      onSave({ ...response.data, activities })
    } catch (error) { setConflict(error instanceof ApiError && error.status === 409); setError(error instanceof Error ? error.message : ar ? 'تعذر الحفظ.' : 'Unable to save.') } finally { setBusy(false) }
  }
  async function addNote(event: FormEvent) {
    event.preventDefault(); if (!record) return
    setBusy(true); setError(''); setNoteSaved(false)
    try { const response = await api.post<{ data: NonNullable<RelationshipRecord['activities']>[number] }>(`/admin/relationships/${record.id}/activities`, { body: note }); setActivities(values => [response.data, ...values]); setNote(''); setNoteSaved(true) }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to save note.') } finally { setBusy(false) }
  }
  return <section className="rounded-3xl border-2 border-indigo-200 bg-white p-5 sm:p-7" aria-labelledby="relationship-editor">
    <div className="mb-5 flex items-center justify-between gap-4"><h3 id="relationship-editor" tabIndex={-1} ref={focus} className="text-xl font-bold outline-none">{record ? ar ? 'تفاصيل العلاقة' : 'Relationship details' : ar ? 'إضافة سجل' : 'Add record'}</h3><Button variant="outline" disabled={busy} onClick={onClose}>{ar ? 'إغلاق' : 'Close'}</Button></div>
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800"><p>{error}</p>{conflict && <><p className="mt-2 text-sm">{ar ? 'انسخ تعديلاتك قبل تحميل أحدث نسخة.' : 'Copy your changes before loading the latest version.'}</p><Button type="button" variant="outline" className="mt-3" onClick={onReload}>{ar ? 'تحميل أحدث نسخة' : 'Load latest version'}</Button></>}</div>}
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <label className={label}>{kind === 'pr' ? ar ? 'اسم التواصل أو عنوان الفرصة' : 'Contact or opportunity name' : ar ? 'اسم جهة التواصل' : 'Contact name'}<input className={control} name="name" defaultValue={record?.name} required maxLength={255} /></label>
      <label className={label}>{ar ? 'الجهة / الشركة' : 'Organization / company'}<input className={control} name="organization" defaultValue={record?.organization ?? ''} maxLength={255} /></label>
      <label className={label}>{ar ? 'البريد الإلكتروني' : 'Email'}<input className={control} dir="ltr" type="email" name="email" defaultValue={record?.email ?? ''} maxLength={255} /></label>
      <label className={label}>{ar ? 'الهاتف' : 'Phone'}<input className={control} dir="ltr" type="tel" name="phone" defaultValue={record?.phone ?? ''} maxLength={50} /></label>
      <label className={label}>{ar ? 'مرحلة العلاقة' : 'Relationship stage'}<select className={control} name="stage" defaultValue={record?.stage ?? relationshipStages[kind][0][0]}>{relationshipStages[kind].map(([value, arabic, english]) => <option value={value} key={value}>{ar ? arabic : english}</option>)}</select></label>
      <label className={label}>{ar ? 'أولوية المتابعة' : 'Follow-up priority'}<select className={control} name="priority" defaultValue={record?.priority ?? 'normal'}><option value="normal">{ar ? 'عادية' : 'Normal'}</option><option value="high">{ar ? 'عالية' : 'High'}</option></select></label>
      <label className={label}>{ar ? 'المسؤول عن العلاقة' : 'Relationship owner'}<select className={control} name="owner_id" defaultValue={record?.owner_id ?? ''}><option value="">{ar ? 'دون مسؤول' : 'Unassigned'}</option>{owners.map(owner => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select></label>
      <label className={label}>{ar ? 'موعد المتابعة (الرياض)' : 'Follow-up date (Riyadh)'}<input className={control} type="date" name="follow_up_on" defaultValue={record?.follow_up_on ?? ''} /></label>
      <label className={label}>{ar ? 'الحملة / المبادرة' : 'Campaign / initiative'}<input className={control} name="campaign" defaultValue={record?.campaign ?? ''} maxLength={255} /></label>
      {kind === 'pr' && <label className={label}>{ar ? 'رابط التغطية المنشورة' : 'Published coverage URL'}<input className={control} dir="ltr" type="url" name="coverage_url" defaultValue={record?.coverage_url ?? ''} maxLength={2048} placeholder="https://" /></label>}
      <label className={`${label} sm:col-span-2`}>{ar ? 'ملخص العلاقة والخطوة التالية' : 'Relationship brief and next step'}<textarea className={control} name="notes" defaultValue={record?.notes ?? ''} maxLength={5000} rows={3} /></label>
      <div className="sm:col-span-2"><Button disabled={busy} type="submit">{busy ? ar ? 'جارٍ الحفظ…' : 'Saving…' : ar ? 'حفظ السجل' : 'Save record'}</Button></div>
    </form>
    {record && <div className="mt-7 border-t border-slate-200 pt-6"><h4 className="font-bold">{ar ? 'سجل المتابعة' : 'Activity history'}</h4><form onSubmit={addNote} className="mt-4 space-y-3"><label className={label}>{ar ? 'إضافة ملاحظة متابعة' : 'Add an activity note'}<textarea className={control} required maxLength={3000} rows={2} value={note} onChange={event => setNote(event.target.value)} /></label><Button variant="outline" type="submit" disabled={busy || !note.trim()}>{ar ? 'حفظ الملاحظة' : 'Save note'}</Button></form>{noteSaved && <p role="status" className="mt-3 text-sm text-emerald-800">{ar ? 'تم حفظ الملاحظة.' : 'Note saved.'}</p>}<p className="mt-4 text-xs text-slate-500">{ar ? 'أحدث 100 ملاحظة. الملاحظات داخلية لفريق الإدارة.' : 'Latest 100 notes. Notes are internal to the administration team.'}</p><ol className="mt-3 space-y-3">{activities.map(activity => <li key={activity.id} className="rounded-xl bg-slate-50 p-4"><p className="whitespace-pre-wrap break-words text-sm leading-7">{activity.body}</p><p className="mt-2 text-xs text-slate-500">{activity.author?.name ?? '—'} · {new Date(activity.created_at).toLocaleString(dateLocale(ar), { timeZone: 'Asia/Riyadh', calendar: 'gregory' })}</p></li>)}</ol></div>}
  </section>
}
