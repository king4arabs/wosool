'use client'

import Image from 'next/image'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { errorText } from '@/lib/eoa'
import { boardPortraitUrl, boardText, type BoardSource, type EoaBoardMember } from '@/lib/eoa-board'
import { useLocale } from '@/lib/locale'
import { Field, Notice } from './Shared'
import styles from './Board.module.css'

const endpoint = '/eoa/operations/board-members'
const profileFields = [
  ['name_en', 'English name', 'الاسم بالإنجليزية', true],
  ['name_ar', 'Arabic name', 'الاسم بالعربية', false],
  ['position_en', 'Board position · English', 'منصب المجلس بالإنجليزية', true],
  ['position_ar', 'Board position · Arabic', 'منصب المجلس بالعربية', false],
  ['company_name_en', 'Company · English', 'الشركة بالإنجليزية', false],
  ['company_name_ar', 'Company · Arabic', 'الشركة بالعربية', false],
  ['company_role_en', 'Company role · English', 'الدور في الشركة بالإنجليزية', false],
  ['company_role_ar', 'Company role · Arabic', 'الدور في الشركة بالعربية', false],
] as const
const linkFields = [
  ['company_url', 'Company website', 'موقع الشركة'],
  ['linkedin_url', 'LinkedIn', 'لينكدإن'],
  ['twitter_url', 'X / Twitter', 'إكس / تويتر'],
  ['facebook_url', 'Facebook', 'فيسبوك'],
  ['instagram_url', 'Instagram', 'إنستغرام'],
] as const

function SourceFields({ sources, ar, disabled }: { sources: BoardSource[]; ar: boolean; disabled: boolean }) {
  const [rows, setRows] = useState(() => sources.map((source, index) => ({ ...source, key: index })))
  const [nextKey, setNextKey] = useState(sources.length)
  return <fieldset className={styles.formGroup} disabled={disabled}>
    <legend>{ar ? 'مصادر التحقق' : 'Verification sources'}</legend>
    <p className={styles.hint}>{ar ? 'احفظ المرجع الذي يؤكد الاسم والمنصب والشركة وروابط الحسابات. اترك الحسابات غير المؤكدة فارغة.' : 'Record evidence for the name, board role, company and social accounts. Leave unverified accounts blank.'}</p>
    {rows.map((source, index) => <div key={source.key}>
      <div className={styles.fields}>
        <Field label={ar ? `المرجع ${index + 1}` : `Source ${index + 1}`}><input name="source_label" defaultValue={source.label} required maxLength={255} /></Field>
        <Field label={ar ? 'رابط المصدر' : 'Source URL'}><input name="source_url" type="url" defaultValue={source.url || ''} placeholder="https://" dir="ltr" maxLength={2048} /></Field>
      </div>
      <Field label={ar ? 'ملاحظة المصدر' : 'Source note'}><input name="source_note" defaultValue={source.note || ''} maxLength={2000} /></Field>
      <button className="eoa-text-link" type="button" onClick={() => setRows(current => current.filter(row => row.key !== source.key))} aria-label={ar ? `إزالة المرجع ${index + 1}` : `Remove source ${index + 1}`}><Trash2 size={15} aria-hidden="true" />{ar ? 'إزالة المرجع' : 'Remove source'}</button>
      <hr style={{ marginBlock: 20, borderColor: 'var(--eoa-border)' }} />
    </div>)}
    <button type="button" className="eoa-btn eoa-btn-secondary" disabled={rows.length >= 20} onClick={() => { setRows(current => [...current, { key: nextKey, label: '', url: '', note: '' }]); setNextKey(value => value + 1) }}><Plus size={16} aria-hidden="true" />{ar ? 'إضافة مصدر' : 'Add source'}</button>
  </fieldset>
}

export function BoardManager({ lead }: { lead: boolean }) {
  const { user } = useAuth()
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [members, setMembers] = useState<EoaBoardMember[]>([])
  const [selected, setSelected] = useState<EoaBoardMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [formVersion, setFormVersion] = useState(0)
  const readOnly = !lead && selected?.publication_status === 'published'

  useEffect(() => {
    if (!user?.email_verified_at) return
    const controller = new AbortController()
    api.get<{ data: EoaBoardMember[] }>(endpoint, { signal: controller.signal })
      .then(response => {
        if (!controller.signal.aborted) {
          setMembers(response.data)
          setSelected(current => current ? response.data.find(member => member.id === current.id) ?? null : null)
          setFormVersion(version => version + 1)
        }
      })
      .catch(cause => { if (!controller.signal.aborted) setError(errorText(cause)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [user?.id, user?.email_verified_at, attempt])

  function choose(member: EoaBoardMember | null) {
    setSelected(member)
    setFormVersion(version => version + 1)
    setError('')
    setNotice('')
  }

  function remember(member: EoaBoardMember) {
    setMembers(current => [...current.filter(item => item.id !== member.id), member])
    setSelected(member)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || readOnly) return
    const form = new FormData(event.currentTarget)
    const portrait = form.get('portrait')
    if (portrait instanceof File && portrait.size && (portrait.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(portrait.type))) {
      setError(ar ? 'اختر صورة JPG أو PNG أو WebP لا يزيد حجمها على ٢ ميغابايت.' : 'Choose a JPG, PNG or WebP portrait no larger than 2 MB.')
      return
    }
    const text = (key: string) => String(form.get(key) || '').trim() || null
    const sources = form.getAll('source_label').map((label, index) => ({
      label: String(label).trim(),
      url: String(form.getAll('source_url')[index] || '').trim() || null,
      note: String(form.getAll('source_note')[index] || '').trim() || null,
    })).filter(source => source.label)
    const deferPublication = lead && text('publication_status') === 'published' && !selected?.portrait_path && portrait instanceof File && portrait.size > 0
    const payload = {
      ...(selected ? { version: selected.version } : {}),
      ...Object.fromEntries([...profileFields, ...linkFields].map(([key]) => [key, text(key)])),
      slug: text('slug'),
      board_term: text('board_term'),
      display_order: Number(form.get('display_order')),
      portrait_position: text('portrait_position') || '50% 35%',
      portrait_alt_en: text('portrait_alt_en'),
      portrait_alt_ar: text('portrait_alt_ar'),
      is_active: form.get('is_active') === 'on',
      source_references: sources,
      verified_at: text('verified_at'),
      ...(lead ? { publication_status: deferPublication ? 'draft' : text('publication_status') } : {}),
    }
    setBusy(true)
    setError('')
    setNotice('')
    let profileSaved = false
    let failedStep: 'profile' | 'portrait' | 'publication' = 'profile'
    try {
      const response = selected
        ? await api.patch<{ data: EoaBoardMember }>(`${endpoint}/${selected.id}`, payload)
        : await api.post<{ data: EoaBoardMember }>(endpoint, payload)
      profileSaved = true
      let saved = response.data
      remember(response.data)
      if (portrait instanceof File && portrait.size) {
        failedStep = 'portrait'
        const upload = new FormData()
        upload.append('portrait', portrait)
        upload.append('version', String(saved.version))
        const uploaded = await api.post<{ data: EoaBoardMember }>(`${endpoint}/${response.data.id}/portrait`, upload)
        remember(uploaded.data)
        saved = uploaded.data
      }
      if (deferPublication) {
        failedStep = 'publication'
        const published = await api.patch<{ data: EoaBoardMember }>(`${endpoint}/${response.data.id}`, { publication_status: 'published', version: saved.version })
        remember(published.data)
      }
      setFormVersion(version => version + 1)
      setNotice(ar ? 'تم حفظ بيانات عضو المجلس.' : 'Board member saved.')
    } catch (cause) {
      const partialMessage = failedStep === 'publication'
        ? ar ? 'تم حفظ الملف والصورة كمسودة، لكن تعذر النشر. أعد اختيار حالة النشر واحفظ.' : 'The profile and portrait were saved as a draft, but publication failed. Select Published and save again.'
        : ar ? 'تم حفظ البيانات، لكن تعذر رفع الصورة. اختر الصورة وأعد الحفظ لتجربة الرفع مجدداً.' : 'The profile was saved, but the portrait could not upload. Select the image and save again to retry the upload.'
      setError(profileSaved ? `${partialMessage} ${errorText(cause)}` : errorText(cause))
    } finally {
      setBusy(false)
    }
  }

  const portrait = boardPortraitUrl(selected?.portrait_path)
  const sorted = [...members].sort((a, b) => a.display_order - b.display_order || a.id - b.id)
  return <section className="eoa-space" aria-labelledby="board-manager-title">
    <h2 id="board-manager-title">{ar ? 'إدارة مجلس EO الرياض' : 'EO Riyadh board management'}</h2>
    <p>{ar ? 'حدّث ملفات الأعضاء والصور وترتيب الظهور ومصادر التحقق. تظهر الملفات المنشورة والنشطة في الصفحة العامة.' : 'Maintain member profiles, portraits, display order and verification sources. Published, active profiles appear on the public page.'}</p>
    {loading && <Notice>{ar ? 'جارٍ تحميل أعضاء المجلس…' : 'Loading board members…'}</Notice>}
    {error && <Notice error>{error} <button className="eoa-text-link" type="button" disabled={busy || loading} onClick={() => { setError(''); setLoading(true); setAttempt(value => value + 1) }}>{ar ? 'تحديث القائمة' : 'Reload list'}</button></Notice>}
    {notice && <Notice>{notice}</Notice>}
    <div className={styles.managerGrid}>
      <div className="eoa-card">
        <button className="eoa-btn eoa-btn-secondary" type="button" disabled={busy || loading} onClick={() => choose(null)}><Plus size={17} aria-hidden="true" />{ar ? 'إضافة عضو' : 'New board member'}</button>
        {!loading && !sorted.length && <p>{ar ? 'لم تُضف ملفات أعضاء بعد.' : 'No board members have been added yet.'}</p>}
        <div className={styles.memberList}>
          {sorted.map(member => <button className={styles.memberRow} type="button" key={member.id} disabled={busy} aria-pressed={selected?.id === member.id} onClick={() => choose(member)}>
            <span className={styles.order}>{member.display_order}</span><span><strong>{boardText(ar, member.name_ar, member.name_en)}</strong><small>{member.board_term} · {member.publication_status === 'published' ? ar ? 'منشور' : 'Published' : ar ? 'مسودة' : 'Draft'}{!member.is_active && (ar ? ' · مخفي' : ' · Hidden')}</small></span>
          </button>)}
        </div>
      </div>
      <form key={`${selected?.id ?? 'new'}-${formVersion}`} className="eoa-card" onSubmit={save}>
        <h3>{selected ? ar ? 'تعديل ملف العضو' : 'Edit board member' : ar ? 'إنشاء ملف عضو' : 'Create board member'}</h3>
        {readOnly && <Notice>{ar ? 'تعديل الملفات المنشورة متاح لقيادة البرنامج. يمكنك إنشاء ملفات مسودة جديدة.' : 'Program leadership can edit published profiles. You can create new draft profiles.'}</Notice>}
        <fieldset disabled={busy || loading || readOnly} style={{ border: 0, padding: 0, minWidth: 0 }}>
          <fieldset className={styles.formGroup}>
            <legend>{ar ? 'بيانات العضو' : 'Member details'}</legend>
            <div className={styles.fields}>
              {profileFields.map(([key, en, arabic, required]) => <Field key={key} label={ar ? arabic : en}><input name={key} defaultValue={selected?.[key] || ''} required={required} maxLength={255} dir={key.endsWith('_ar') ? 'rtl' : 'ltr'} /></Field>)}
              <Field label={ar ? 'المعرّف' : 'Slug'}><input name="slug" defaultValue={selected?.slug || ''} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title={ar ? 'حروف إنجليزية صغيرة وأرقام تفصلها شرطات' : 'Lowercase letters and numbers separated by hyphens'} maxLength={100} dir="ltr" placeholder="member-name" /></Field>
              <Field label={ar ? 'دورة المجلس' : 'Board term'}><input name="board_term" defaultValue={selected?.board_term || ''} required maxLength={40} dir="ltr" placeholder="2026–2027" /></Field>
            </div>
          </fieldset>
          <fieldset className={styles.formGroup}>
            <legend>{ar ? 'الصورة الشخصية' : 'Portrait'}</legend>
            {portrait && <div className={styles.preview}><Image src={portrait} alt={boardText(ar, selected?.name_ar || null, selected?.name_en || null)} width={92} height={92} unoptimized={!portrait.startsWith('/')} style={{ objectPosition: selected?.portrait_position || '50% 35%' }} /><span className={styles.hint}>{ar ? 'الصورة الحالية' : 'Current portrait'}</span></div>}
            <Field label={ar ? 'رفع صورة أصلية' : 'Upload original portrait'}><input name="portrait" type="file" accept="image/jpeg,image/png,image/webp" /></Field>
            <p className={styles.hint}>{ar ? 'JPG أو PNG أو WebP، حتى ٢ ميغابايت. الأبعاد من ١٦٠ إلى ٦٠٠٠ بكسل لكل جانب. تُحفظ الصورة عند حفظ الملف.' : 'JPG, PNG or WebP, up to 2 MB. Each side must be 160–6,000 pixels. The image uploads when you save the profile.'}</p>
            <div className={styles.fields}>
              <Field label={ar ? 'وصف الصورة بالإنجليزية' : 'Portrait description · English'}><input name="portrait_alt_en" defaultValue={selected?.portrait_alt_en || ''} maxLength={255} dir="ltr" /></Field>
              <Field label={ar ? 'وصف الصورة بالعربية' : 'Portrait description · Arabic'}><input name="portrait_alt_ar" defaultValue={selected?.portrait_alt_ar || ''} maxLength={255} dir="rtl" /></Field>
            </div>
            <Field label={ar ? 'موضع الصورة (أفقي، رأسي)' : 'Portrait position (horizontal, vertical)'}><input name="portrait_position" defaultValue={selected?.portrait_position || '50% 35%'} pattern="(?:100|[0-9]{1,2})% (?:100|[0-9]{1,2})%" title="50% 35%" placeholder="50% 35%" dir="ltr" /></Field>
          </fieldset>
          <fieldset className={styles.formGroup}>
            <legend>{ar ? 'الموقع وحسابات التواصل' : 'Website and social profiles'}</legend>
            <div className={styles.fields}>{linkFields.map(([key, en, arabic]) => <Field key={key} label={ar ? arabic : en}><input name={key} type="url" defaultValue={selected?.[key] || ''} placeholder="https://" maxLength={2048} dir="ltr" /></Field>)}</div>
          </fieldset>
          <SourceFields sources={selected?.source_references || []} ar={ar} disabled={busy || loading || readOnly} />
          <fieldset className={styles.formGroup}>
            <legend>{ar ? 'الظهور والنشر' : 'Display and publication'}</legend>
            <div className={styles.fields}>
              <Field label={ar ? 'ترتيب الظهور' : 'Display order'}><input name="display_order" type="number" required min={0} max={9999} step={1} defaultValue={selected?.display_order ?? (sorted.length ? Math.max(...sorted.map(member => member.display_order)) + 1 : 1)} /></Field>
              <Field label={ar ? 'تاريخ التحقق من البيانات' : 'Verification date'}><input name="verified_at" type="date" defaultValue={selected?.verified_at?.slice(0, 10) || ''} /></Field>
              {lead && <Field label={ar ? 'حالة النشر' : 'Publication status'}><select name="publication_status" defaultValue={selected?.publication_status || 'draft'}><option value="draft">{ar ? 'مسودة' : 'Draft'}</option><option value="published">{ar ? 'منشور' : 'Published'}</option></select></Field>}
            </div>
            <label className="eoa-check"><input type="checkbox" name="is_active" defaultChecked={selected?.is_active ?? true} />{ar ? 'نشط — يظهر عند النشر' : 'Active — visible when published'}</label>
          </fieldset>
          <div className={styles.formFooter}><button type="submit" className="eoa-btn" disabled={busy || loading || readOnly}>{busy ? ar ? 'جارٍ الحفظ…' : 'Saving…' : ar ? 'حفظ ملف العضو' : 'Save board member'}</button>{!lead && <span className={styles.hint}>{ar ? 'تعتمد قيادة البرنامج النشر.' : 'Program leadership approves publication.'}</span>}</div>
        </fieldset>
      </form>
    </div>
  </section>
}
