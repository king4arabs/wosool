'use client'
import { FormEvent, useState } from 'react'
import { api } from '@/lib/api'
import { errorText, type EoaTrack } from '@/lib/eoa'
import { useLocale } from '@/lib/locale'
import { Field, Notice } from './Shared'
export function TrackManager({
  tracks,
  reload,
}: {
  tracks: EoaTrack[]
  reload: () => Promise<void>
}) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [selected, setSelected] = useState<EoaTrack | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true)
    setError('')
    setNotice('')
    const payload = {
      name_ar: data.get('name_ar'),
      name_en: data.get('name_en'),
      description_ar: data.get('description_ar'),
      description_en: data.get('description_en'),
      is_active: data.get('is_active') === 'on',
    }
    try {
      if (selected)
        await api.patch(`/eoa/operations/update/tracks/${selected.id}`, payload)
      else await api.post('/eoa/operations/create/tracks', payload)
      await reload()
      setSelected(null)
      form.reset()
      setNotice(ar ? 'تم حفظ المسار.' : 'Track saved.')
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="eoa-space">
      <h2>{ar ? 'مسارات القبول' : 'Admission tracks'}</h2>
      <p>
        {ar
          ? 'أنشئ مسارات البرنامج وحدد المتاح للتقديم. يختار المتقدم مساره المفضل وتعتمد الإدارة المسار عند القبول.'
          : 'Create program tracks and choose which accept applications. Applicants state their preference; leadership confirms a track at acceptance.'}
      </p>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <div className="eoa-two-grid">
        <div className="eoa-card">
          {tracks.map((track) => (
            <button
              type="button"
              key={track.id}
              className="eoa-app-row"
              onClick={() => setSelected(track)}
            >
              <strong>{ar ? track.name_ar : track.name_en}</strong>
              <span>
                {track.is_active
                  ? ar
                    ? 'متاح للتقديم'
                    : 'Available for applications'
                  : ar
                    ? 'مغلق للتقديم'
                    : 'Closed to applications'}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="eoa-btn eoa-btn-secondary"
            onClick={() => setSelected(null)}
          >
            {ar ? 'مسار جديد' : 'New track'}
          </button>
        </div>
        <form key={selected?.id ?? 'new'} className="eoa-card" onSubmit={save}>
          <h3>
            {selected
              ? ar
                ? 'تعديل المسار'
                : 'Edit track'
              : ar
                ? 'إنشاء مسار'
                : 'Create track'}
          </h3>
          <fieldset disabled={busy}>
            {[
              ['name_ar', ar ? 'الاسم بالعربية' : 'Arabic name'],
              ['name_en', ar ? 'الاسم بالإنجليزية' : 'English name'],
              ['description_ar', ar ? 'الوصف بالعربية' : 'Arabic description'],
              [
                'description_en',
                ar ? 'الوصف بالإنجليزية' : 'English description',
              ],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  name={key}
                  required={key.startsWith('name')}
                  defaultValue={String(selected?.[key as keyof EoaTrack] ?? '')}
                  maxLength={key.startsWith('name') ? 255 : 2000}
                />
              </Field>
            ))}
            <label className="eoa-check">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked={selected ? Boolean(selected.is_active) : true}
              />
              {ar ? 'متاح للتقديم' : 'Available for applications'}
            </label>
            <button className="eoa-btn" type="submit" disabled={busy}>
              {busy
                ? ar
                  ? 'جارٍ الحفظ…'
                  : 'Saving…'
                : ar
                  ? 'حفظ المسار'
                  : 'Save track'}
            </button>
          </fieldset>
        </form>
      </div>
    </section>
  )
}
