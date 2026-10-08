'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useLocale } from '@/lib/locale'
import type { EoaPartner, EoaProgram } from '@/lib/eoa'

export function useEoaProgram() {
  const [program, setProgram] = useState<EoaProgram | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    api
      .get<{ data: EoaProgram }>('/eoa/program')
      .then((r) => {
        if (active) setProgram(r.data)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])
  return { program, failed }
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
  return (
    <label className="eoa-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
export function PartnerStrip({ partners }: { partners: EoaPartner[] }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  if (!partners.length) return null
  return (
    <section
      className="eoa-partners"
      aria-label={ar ? 'نفخر بشركائنا' : 'Proud of Partners'}
    >
      <div className="eoa-container">
        <h2>{ar ? 'نفخر بشركائنا' : 'Proud of Partners'}</h2>
        <div className="eoa-partner-window">
          <div className="eoa-partner-track">
            {[0, 1].map((copy) => (
              <div
                className="eoa-partner-group"
                key={copy}
                aria-hidden={copy === 1}
              >
                {partners.map((p) => (
                  <a
                    key={p.id}
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={copy === 1 ? -1 : 0}
                    aria-label={ar ? p.name_ar : p.name_en}
                  >
                    <Image
                      src={p.logo_path}
                      alt={ar ? p.name_ar : p.name_en}
                      width={180}
                      height={64}
                      unoptimized
                    />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
export function EoaNav() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  return (
    <nav
      className="eoa-subnav"
      aria-label={ar ? 'EO Accelerator' : 'EO Accelerator'}
    >
      <div className="eoa-container">
        {[
          ['/EOA', ar ? 'المسرّعة' : 'Accelerator'],
          ['/EOA/about', ar ? 'عن المسرّعة' : 'About'],
          ['/EOA/program', ar ? 'البرنامج' : 'Program'],
          ['/EOA/eligibility', ar ? 'الأهلية والرسوم' : 'Eligibility & fees'],
          ['/EOA/learning', ar ? 'التعلم' : 'Learning'],
          ['/EOA/partners', ar ? 'الشركاء' : 'Partners'],
          ['/EOA/leadership', ar ? 'القيادة والمدربون' : 'Leadership & coaches'],
          ['/EOA/faq', ar ? 'الأسئلة الشائعة' : 'FAQ'],
          ['/EOA/contact', ar ? 'التواصل' : 'Contact'],
          ['/EOA/account', ar ? 'حسابي' : 'My account'],
        ].map(([href, text]) => (
          <Link key={href} href={href}>
            {text}
          </Link>
        ))}
      </div>
    </nav>
  )
}
