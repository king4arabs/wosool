'use client'

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'
import { Pause, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { api } from '@/lib/api'
import type { EoaPartner, EoaProgram } from '@/lib/eoa'
import { useLocale } from '@/lib/locale'
import { EoaLogo } from './Logo'

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

export function PartnerStrip({ partners }: { partners: EoaPartner[] }) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const [paused, setPaused] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = windowRef.current
    if (!element) return

    const update = () => setWidth(element.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const uniquePartners = [
    ...new Map(
      [
        {
          id: 0,
          name_ar: 'EO الرياض',
          name_en: 'EO Riyadh',
          website: 'https://eonetwork.org/riyadh',
          logo_path: '/partners/eo-riyadh.png',
        },
        ...partners,
      ].map((partner) => [partner.logo_path, partner]),
    ).values(),
  ]

  return (
    <section
      className="eoa-partners"
      aria-label={ar ? 'نفخر بمنظومة شركائنا' : 'Proud of our ecosystem'}
    >
      <div className="eoa-container">
        <div className="eoa-partner-head">
          <h2>
            {partners.length
              ? ar
                ? 'نفخر بمنظومة شركائنا'
                : 'Proud of Our Ecosystem'
              : ar
                ? 'بقيادة EO الرياض'
                : 'Led by EO Riyadh'}
          </h2>
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
            {paused
              ? ar
                ? 'تشغيل الحركة'
                : 'Play movement'
              : ar
                ? 'إيقاف الحركة'
                : 'Pause movement'}
          </button>
        </div>
        <div ref={windowRef} className="eoa-partner-window" tabIndex={0}>
          <div
            className="eoa-partner-track"
            data-paused={paused}
            style={{ '--partner-width': `${width}px` } as CSSProperties}
          >
            {[0, 1].map((copy) => (
              <div
                className="eoa-partner-group"
                key={copy}
                aria-hidden={copy === 1}
              >
                {uniquePartners.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={copy === 1 ? -1 : 0}
                    aria-label={ar ? partner.name_ar : partner.name_en}
                  >
                    {partner.logo_path === '/partners/eo-riyadh.png' ? (
                      <EoaLogo />
                    ) : (
                      <Image
                        src={partner.logo_path}
                        alt={ar ? partner.name_ar : partner.name_en}
                        width={180}
                        height={64}
                        unoptimized
                      />
                    )}
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
          ['/eoa/partners', ar ? 'الشركاء' : 'Partners'],
          [
            '/eoa/leadership',
            ar ? 'القيادة والمدربون' : 'Leadership & coaches',
          ],
          ['/eoa/faq', ar ? 'الأسئلة الشائعة' : 'FAQ'],
          ['/eoa/contact', ar ? 'التواصل' : 'Contact'],
          ['/eoa/account', ar ? 'حسابي' : 'My account'],
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
