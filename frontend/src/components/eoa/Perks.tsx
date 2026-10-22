'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useLocale } from '@/lib/locale'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Notice } from './Shared'
import styles from './Perks.module.css'

type Perk = {
  id: number
  title_en: string
  title_ar: string
  details_en: string
  details_ar: string
  name_en: string
  name_ar: string
  logo_path: string
}

export function EoaPerks() {
  const { user, isLoading } = useAuth()
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [perks, setPerks] = useState<Perk[]>([])
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'restricted' | 'error'>('loading')
  const slider = useRef<HTMLDivElement>(null)
  const load = useCallback((userId: string) => {
    setState('loading')
    api.get<{ data: Perk[] }>('/eoa/perks')
      .then(response => { setPerks(response.data); setLoadedFor(userId); setState('ready') })
      .catch(error => { setLoadedFor(userId); setState(error?.status === 403 ? 'restricted' : 'error') })
  }, [])
  useEffect(() => {
    if (isLoading || !user) return
    let active = true
    const userId = user.id
    api.get<{ data: Perk[] }>('/eoa/perks')
      .then(response => { if (active) { setPerks(response.data); setLoadedFor(userId); setState('ready') } })
      .catch(error => { if (active) { setLoadedFor(userId); setState(error?.status === 403 ? 'restricted' : 'error') } })
    return () => { active = false }
  }, [isLoading, user])

  return <section aria-labelledby="eoa-perks-title">
    <p className="eoa-lead">{ar
      ? 'قد يقدّم شركاء البرنامج عروضاً للمشاركين. لا تظهر تفاصيل أي عرض إلا بعد اعتماد الشريك والعرض من فريق البرنامج، وتأكيد تسجيلك في الدفعة.'
      : 'Program partners may make offers to participants. Offer details appear only after the team approves the provider and offer, and your enrollment is confirmed.'}</p>
    <h2 id="eoa-perks-title">{ar ? 'عروض الشركاء المعتمدة' : 'Approved partner perks'}</h2>
    {(isLoading || (user && (loadedFor !== user.id || state === 'loading'))) && <Notice>{ar ? 'جارٍ تحميل المزايا…' : 'Loading perks…'}</Notice>}
    {!isLoading && !user && <div className="eoa-card"><p>{ar ? 'سجّل الدخول للاطلاع على المزايا بعد اعتماد مشاركتك.' : 'Sign in to view perks once your participation is approved.'}</p><Link className="eoa-btn" href="/eoa/account?mode=login&redirect=%2Feoa%2Fperks">{ar ? 'تسجيل الدخول أو إنشاء حساب' : 'Sign in or create an account'}</Link></div>}
    {state === 'restricted' && user && loadedFor === user.id && <Notice>{ar ? 'هذه العروض متاحة فقط للمشاركين المعتمدين والمسجلين في البرنامج.' : 'These offers are available only to approved, enrolled participants.'}</Notice>}
    {state === 'error' && user && loadedFor === user.id && <Notice error>{ar ? 'تعذر تحميل المزايا.' : 'Perks could not load.'} <button type="button" className="eoa-text-link" onClick={() => load(user.id)}>{ar ? 'إعادة المحاولة' : 'Try again'}</button></Notice>}
    {state === 'ready' && user && loadedFor === user.id && (!perks.length
      ? <Notice>{ar ? 'لا توجد عروض شركاء معتمدة حالياً. تابع الصفحة للحصول على التحديثات.' : 'No partner offers have been approved yet. Check back for updates.'}</Notice>
      : <>
        <div className={styles.controls}>
          <button type="button" aria-label={ar ? 'السابق' : 'Previous perk'} onClick={() => slider.current?.scrollBy({ left: -320, behavior: 'smooth' })}><ArrowLeft aria-hidden="true" /></button>
          <button type="button" aria-label={ar ? 'التالي' : 'Next perk'} onClick={() => slider.current?.scrollBy({ left: 320, behavior: 'smooth' })}><ArrowRight aria-hidden="true" /></button>
        </div>
        <div ref={slider} className={styles.slider} dir="ltr" role="list" aria-label={ar ? 'بطاقات مزايا الشركاء' : 'Partner perk cards'}>
          {perks.map(perk => <article key={perk.id} role="listitem" className={`eoa-card ${styles.card}`} dir={ar ? 'rtl' : 'ltr'}>
            <div className={styles.logo}><BrandLogo src={perk.logo_path} name={ar ? perk.name_ar : perk.name_en} /></div>
            <p className="eoa-eyebrow">{ar ? perk.name_ar : perk.name_en}</p>
            <h3>{ar ? perk.title_ar : perk.title_en}</h3>
            <p>{ar ? perk.details_ar : perk.details_en}</p>
          </article>)}
        </div>
      </>)}
  </section>
}
