'use client'

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type ReactElement,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import type { EoaPartner, EoaProgram } from '@/lib/eoa'
import { useLocale } from '@/lib/locale'
import { PartnerCarousel } from './PartnerCarousel'
import { acceleratorPartnerLogos } from '@/lib/partner-logos'

export function useEoaProgram() {
  const [program, setProgram] = useState<EoaProgram | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    api
      .get<{ data: EoaProgram }>('/eoa/program', {
        signal: controller.signal,
      })
      .then((response) => {
        if (active) setProgram(response.data)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  return {
    program,
    failed,
    retry: () => {
      setFailed(false)
      setAttempt((value) => value + 1)
    },
  }
}

export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode
  error?: boolean
}) {
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={`eoa-notice ${error ? 'eoa-error' : ''}`}
    >
      {children}
    </p>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const labelId = useId()

  return (
    <label className="eoa-field">
      <span id={labelId}>{label}</span>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{ 'aria-labelledby'?: string }>,
            { 'aria-labelledby': labelId },
          )
        : children}
    </label>
  )
}

export function PartnerStrip({ partners }: { partners?: EoaPartner[] }) {
  const { locale } = useLocale()
  return <PartnerCarousel partners={partners ?? acceleratorPartnerLogos} ar={locale === 'ar'} />
}

export function EoaNav() {
  const { user } = useAuth()
  const roles = user?.roles ?? []
  const admin = user?.roleToken === 'admin' || roles.some(r => ['admin', 'eoa_lead', 'eoa_staff', 'eoa_reviewer'].includes(r))
  const coach = roles.includes('eoa_coach')
  const pathname = usePathname()
  const canonicalPathname = pathname.toLowerCase()
  const { locale } = useLocale()
  const ar = locale === 'ar'

  return (
    <nav
      className="eoa-subnav"
      aria-label={
        ar
          ? 'التنقل في مسرّعة منظمة رواد الأعمال بالرياض'
          : 'EO Riyadh Accelerator navigation'
      }
    >
      <div className="eoa-container">
        {[
          ['/eoa', ar ? 'المسرّعة' : 'Accelerator'],
          ['/eoa/about', ar ? 'عن المسرّعة' : 'About'],
          ['/eoa/program', ar ? 'البرنامج' : 'Program'],
          ['/eoa/eligibility', ar ? 'الأهلية والرسوم' : 'Eligibility & fees'],
          ['/eoa/learning', ar ? 'التعلم' : 'Learning'],
          ['/eoa/alumni', ar ? 'الخريجون' : 'Alumni'],
          ['/eoa/partners', ar ? 'الشركاء' : 'Partners'],
          [
            '/eoa/leadership',
            ar ? 'قيادة البرنامج' : 'Leadership',
          ],
          ['/eoa/mentors', ar ? 'المرشدون والمدربون' : 'Mentors & coaches'],
          ['/eoa/faq', ar ? 'الأسئلة الشائعة' : 'FAQ'],
          ['/eoa/contact', ar ? 'التواصل' : 'Contact'],
          ['/eoa/account', ar ? 'حسابي' : 'My account'],
          ...(admin ? [['/eoa/admin', ar ? 'إدارة البرنامج' : 'Administration']] : []),
          ...(coach ? [['/eoa/coach', ar ? 'مساحة المدرب' : 'Coach workspace']] : []),
        ].map(([href, text]) => (
          <Link
            key={href}
            href={href}
            aria-current={canonicalPathname === href ? 'page' : undefined}
          >
            {text}
          </Link>
        ))}
      </div>
    </nav>
  )
}
