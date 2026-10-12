'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Organization } from '@/lib/eoa'
import { Notice } from './Shared'

export function EoaDirectory({ ar }: { ar: boolean }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => { setFailed(false); setLoading(true); setAttempt(value => value + 1) }, [])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    api.get<{ data: Organization[] }>('/eoa/directory', { signal: controller.signal })
      .then(result => { if (active) { setOrganizations(result.data); setLoading(false) } })
      .catch(() => { if (active) { setFailed(true); setLoading(false) } })
    return () => { active = false; controller.abort() }
  }, [attempt])

  return <>
    {loading && <Notice>{ar ? 'جارٍ تحميل الدليل…' : 'Loading directory…'}</Notice>}
    {failed && <Notice error>{ar ? 'تعذر تحميل الدليل. تحقق من اتصال الخدمة أو أعد المحاولة.' : 'The directory could not load. Check the service connection or try again.'} <button type="button" className="eoa-text-link" onClick={retry}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></Notice>}
    <div className="eoa-three-grid">
      {organizations.map(o => <article className="eoa-card" key={o.id}>
        <h3>{ar ? o.name_ar : o.name_en}</h3>
        <p>{ar ? o.support_ar : o.support_en}</p>
        <a className="eoa-text-link" href={o.website} target="_blank" rel="noopener noreferrer">{ar ? 'الموقع الرسمي' : 'Official website'} ↗</a>
      </article>)}
    </div>
    {!loading && !failed && !organizations.length && <Notice>{ar ? 'لا توجد جهات منشورة في الدليل بعد.' : 'No organizations have been published in the directory yet.'}</Notice>}
  </>
}
