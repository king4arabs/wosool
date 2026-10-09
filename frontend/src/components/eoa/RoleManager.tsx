'use client'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { errorText } from '@/lib/eoa'
import { useLocale } from '@/lib/locale'
import { Field, Notice } from './Shared'

type Account = {
  id: number
  name: string
  email: string
  verified: boolean
  roles: string[]
}
const roles = [
  [
    'eoa_lead',
    'قائد البرنامج',
    'Program lead',
    'القرارات النهائية والإعدادات والتسجيل',
    'Final decisions, settings and enrollment',
  ],
  [
    'eoa_staff',
    'إدارة العمليات',
    'Operations admin',
    'تشغيل البرنامج وتوزيع الطلبات',
    'Program operations and review assignments',
  ],
  [
    'eoa_reviewer',
    'مراجع الطلبات',
    'Application reviewer',
    'الطلبات المسندة إليه فقط',
    'Only assigned applications',
  ],
  [
    'eoa_coach',
    'مدرب',
    'Coach',
    'المشاركون ومجموعات المساءلة المسندة إليه',
    'Assigned participants and accountability groups',
  ],
]
export function RoleManager() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [lastPage, setLastPage] = useState(1)
  const [selected, setSelected] = useState<Account | null>(null)
  const [chosen, setChosen] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get<{
          data: { data: Account[]; last_page: number }
        }>('/eoa/operations/accounts', {
          params: { search: search || undefined, page },
          signal,
        })
        if (!signal?.aborted) {
          setAccounts(response.data.data)
          setLastPage(response.data.last_page)
        }
      } catch (e) {
        if (!signal?.aborted) setError(errorText(e))
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
    },
    [search, page],
  )
  useEffect(() => {
    const c = new AbortController()
    void load(c.signal)
    return () => c.abort()
  }, [load])
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!selected || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const response = await api.patch<{ data: Account }>(
        `/eoa/operations/accounts/${selected.id}`,
        { roles: chosen },
      )
      setSelected(response.data)
      setChosen(response.data.roles)
      await load()
      setNotice(
        ar
          ? 'تم تحديث الصلاحيات وتسجيل التغيير.'
          : 'Access updated and recorded in the audit log.',
      )
    } catch (e) {
      setError(errorText(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="eoa-space">
      <h2>
        {ar ? 'حسابات فريق EOA وصلاحياتها' : 'EOA team accounts & access'}
      </h2>
      <p>
        {ar
          ? 'ابحث عن حساب موجود واختر صلاحياته داخل برنامج EOA.'
          : 'Find an existing account and assign its EOA responsibilities.'}
      </p>
      <form
        className="eoa-actions"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(query.trim())
          setPage(1)
          setSelected(null)
        }}
      >
        <Field label={ar ? 'الاسم أو البريد الإلكتروني' : 'Name or email'}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            minLength={2}
            type="search"
          />
        </Field>
        <button className="eoa-btn" type="submit">
          {ar ? 'بحث' : 'Search'}
        </button>
      </form>
      {error && (
        <Notice error>
          {error}
          <button
            type="button"
            className="eoa-text-link"
            onClick={() => void load()}
          >
            {ar ? 'إعادة المحاولة' : 'Try again'}
          </button>
        </Notice>
      )}
      {notice && <Notice>{notice}</Notice>}
      <div className="eoa-two-grid">
        <div className="eoa-card">
          {loading ? (
            <Notice>{ar ? 'جارٍ التحميل…' : 'Loading…'}</Notice>
          ) : !accounts.length ? (
            <p>{ar ? 'لا توجد حسابات مطابقة.' : 'No matching accounts.'}</p>
          ) : (
            accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className="eoa-app-row"
                aria-pressed={selected?.id === account.id}
                onClick={() => {
                  setSelected(account)
                  setChosen(account.roles)
                  setNotice('')
                }}
              >
                <strong>{account.name}</strong>
                <span dir="ltr">{account.email}</span>
                <span>
                  {account.verified
                    ? ar
                      ? 'بريد موثّق'
                      : 'Email verified'
                    : ar
                      ? 'البريد غير موثّق'
                      : 'Email unverified'}
                </span>
              </button>
            ))
          )}
          <div className="eoa-actions">
            <button
              className="eoa-text-link"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              {ar ? 'السابق' : 'Previous'}
            </button>
            <span>
              {page} / {lastPage}
            </span>
            <button
              className="eoa-text-link"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              {ar ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
        {selected && (
          <form className="eoa-card" onSubmit={save}>
            <h3>{selected.name}</h3>
            <p dir="ltr">{selected.email}</p>
            <fieldset disabled={busy}>
              <legend>{ar ? 'صلاحيات البرنامج' : 'Program permissions'}</legend>
              {roles.map(
                ([key, arabic, english, arDescription, enDescription]) => (
                  <label key={key} className="eoa-check">
                    <input
                      type="checkbox"
                  aria-label={ar ? arabic : english}
                      checked={chosen.includes(key)}
                      disabled={
                        !selected.verified && !selected.roles.includes(key)
                      }
                      onChange={(e) =>
                        setChosen((current) =>
                          e.target.checked
                            ? [...current, key]
                            : current.filter((role) => role !== key),
                        )
                      }
                    />
                    <span>
                      <strong>{ar ? arabic : english}</strong>
                      <small className="block">
                        {ar ? arDescription : enDescription}
                      </small>
                    </span>
                  </label>
                ),
              )}
            </fieldset>
            {!selected.verified && (
              <Notice>
                {ar
                  ? 'يجب توثيق البريد قبل منح صلاحيات جديدة.'
                  : 'Email verification is required before granting access.'}
              </Notice>
            )}
            <button type="submit" className="eoa-btn" disabled={busy}>
              {busy
                ? ar
                  ? 'جارٍ الحفظ…'
                  : 'Saving…'
                : ar
                  ? 'حفظ الصلاحيات'
                  : 'Save permissions'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
