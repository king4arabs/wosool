'use client'
import {
  useEffect,
  useState,
  useRef,
  useId,
  cloneElement,
  isValidElement,
  type ReactElement,
  type CSSProperties,
} from 'react'
import { Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { EoaLogo } from './Logo'
import { api } from '@/lib/api'
import { useLocale } from '@/lib/locale'
import type { EoaPartner, EoaProgram } from '@/lib/eoa'

export function useEoaProgram() {
  const [program, setProgram] = useState<EoaProgram | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    api
      .get<{ data: EoaProgram }>('/eoa/program', { signal: controller.signal })
      .then((r) => {
        if (active) setProgram(r.data)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])
  return { program, failed, retry: () => { setFailed(false); setAttempt((value) => value + 1) } }
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
      aria-label={ar ? 'نفخر بشركائنا' : 'Proud of Partners'}
    >
      <div className="eoa-container">
        <div className="eoa-partner-head">
          <h2>
            {partners.length
              ? ar
                ? 'نفخر بشركائنا'
                : 'Proud of our partners'
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
                {uniquePartners.map((p) => (
                  <a
                    key={p.id}
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={copy === 1 ? -1 : 0}
                    aria-label={ar ? p.name_ar : p.name_en}
                  >
                    {p.logo_path === '/partners/eo-riyadh.png' ? (
                      <EoaLogo />
                    ) : (
                      <Image
                        src={p.logo_path}
                        alt={ar ? p.name_ar : p.name_en}
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
          [
            '/EOA/leadership',
            ar ? 'القيادة والمدربون' : 'Leadership & coaches',
          ],
          ['/EOA/faq', ar ? 'الأسئلة الشائعة' : 'FAQ'],
          ['/EOA/contact', ar ? 'التواصل' : 'Contact'],
          ['/EOA/account', ar ? 'حسابي' : 'My account'],
        ].map(([href, text]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? 'page' : undefined}
          >
            {text}
          </Link>
        ))}
      </div>
    </nav>
  )
}
