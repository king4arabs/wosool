'use client'

import Link from 'next/link'
import { ArrowUpRight, Building2 } from 'lucide-react'
import { eoaFaqTopic } from '@/lib/faq-search'
import { FaqExplorer } from '@/components/sections/FaqExplorer'
import type { FaqItem } from '@/data/faq'
import { useLocale } from '@/lib/locale'
import { eoaFaqs, safeEoaWebsite, type EoaEditorialProgram } from '@/lib/eoa-editorial'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { eoaOrganizationLogo } from '@/lib/eoa-organizations'

export function EoaProgramDetails({
  program,
  section = 'all',
}: {
  program: EoaEditorialProgram | null
  section?: 'all' | 'operator' | 'partners' | 'faq'
}) {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const operator = program?.editorial?.operator
  const operatorUrl = safeEoaWebsite(operator?.website)
  const confirmedIds = new Set(program?.partners.map((partner) => partner.id) ?? [])
  const partners = (program?.ecosystem ?? []).filter((organization) =>
    organization.relationship_status === 'confirmed' && confirmedIds.has(organization.id),
  )
  const faqs = eoaFaqs(program?.editorial)
  const faqItems: FaqItem[] = faqs.map((faq, index) => ({
    id: `eoa-${index + 1}-${faq.question_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'question'}`,
    category: 'events',
    q: { ar: faq.question_ar, en: faq.question_en },
    a: { ar: faq.answer_ar.split(/\n{2,}/), en: faq.answer_en.split(/\n{2,}/) },
  }))

  const faqTopics = [
    { id: 'program', ar: 'البرنامج والتعلم', en: 'Program & learning', contact: 'general' },
    { id: 'joining', ar: 'الأهلية والتقديم', en: 'Eligibility & applying', contact: 'general' },
    { id: 'fees', ar: 'الرسوم والرعاية', en: 'Fees & sponsorship', contact: 'eoa-fees' },
    { id: 'coaching', ar: 'المدربون والمساءلة', en: 'Coaches & accountability', contact: 'eoa-coaching' },
  ].map(topic => ({ ...topic, items: faqItems.filter(item => eoaFaqTopic(item.q.en) === topic.id).map(item => item.id) })).filter(topic => topic.items.length)

  return (
    <>
      {(section === 'all' || section === 'operator') && operator?.visible && operatorUrl && (
        <section className="eoa-section" id="operator" aria-labelledby="eoa-operator-title">
          <div className="eoa-container eoa-two-grid">
            <div>
              <span className="eoa-eyebrow">{ar ? 'الشريك المشغّل' : 'OPERATING PARTNER'}</span>
              <div style={{ height: 90, maxWidth: 260, marginBottom: 24 }}><BrandLogo name={ar ? operator.name_ar : operator.name_en} website={operatorUrl} src={eoaOrganizationLogo({ website: operatorUrl })} /></div>
              <h2 id="eoa-operator-title">{ar ? operator.name_ar : operator.name_en}</h2>
              <p className="eoa-lead" style={{ whiteSpace: 'pre-line' }}>
                {ar ? operator.description_ar : operator.description_en}
              </p>
              <a href={operatorUrl} className="eoa-text-link" target="_blank" rel="noopener noreferrer">
                {ar ? 'زيارة الموقع الرسمي' : 'Visit official website'} <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="eoa-card">
              <Building2 size={30} aria-hidden="true" />
              <h3>{ar ? 'طلباتك وجلساتك في مكان واحد' : 'Your application and sessions in one place'}</h3>
              <p>{ar ? 'استخدم حسابك في وصول لإرسال الطلب، ومتابعة حالته، والاطلاع على جلسات دفعتك بعد التسجيل.' : 'Use your Wosool account to apply, check your application status and see your cohort sessions after enrollment.'}</p>
            </div>
          </div>
        </section>
      )}
      {(section === 'all' || section === 'partners') && partners.length > 0 && (
        <section className="eoa-section" id="enablers" aria-labelledby="eoa-enablers-title">
          <div className="eoa-container">
            <span className="eoa-eyebrow">{ar ? 'الشركاء المعتمدون' : 'CONFIRMED PARTNERS'}</span>
            <h2 id="eoa-enablers-title">{ar ? 'كيف يساهم الشركاء في البرنامج' : 'How partners support the program'}</h2>
            <div className="eoa-two-grid eoa-space">
              {partners.map((partner) => {
                const role = program?.partner_roles?.[String(partner.id)]
                const website = safeEoaWebsite(partner.website)
                return (
                  <article key={partner.id} className="eoa-card">
                    <div style={{ height: 90, marginBottom: 24 }}><BrandLogo name={ar ? partner.name_ar : partner.name_en} website={partner.website} src={eoaOrganizationLogo(partner)} /></div>
                    {role && <span className="eoa-eyebrow">{role === 'operator' ? (ar ? 'الشريك المشغّل' : 'OPERATING PARTNER') : role === 'enabler' ? (ar ? 'الشريك الممكّن' : 'ENABLING PARTNER') : (ar ? 'الشريك الداعم' : 'SUPPORTING PARTNER')}</span>}
                    <h3>{ar ? partner.name_ar : partner.name_en}</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{ar ? partner.support_ar : partner.support_en}</p>
                    {website && <a href={website} className="eoa-text-link" target="_blank" rel="noopener noreferrer">{ar ? 'زيارة الموقع الرسمي' : 'Visit official website'} <ArrowUpRight size={16} aria-hidden="true" /></a>}
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}
      {(section === 'all' || section === 'faq') && faqs.length > 0 && (
        <section className={section === 'faq' ? 'pb-8 pt-2 sm:pb-12' : 'eoa-section'} id="faq" aria-labelledby="eoa-faq-title">
          <div className={section === 'faq' ? '' : 'eoa-container'}>
            <div className={section === 'faq' ? 'sr-only' : 'mx-auto max-w-3xl text-center'}>
              <span className="eoa-eyebrow">{ar ? 'قبل التقديم' : 'BEFORE YOU APPLY'}</span>
              <h2 id="eoa-faq-title">{ar ? 'الأسئلة الشائعة' : 'Frequently asked questions'}</h2>
              <p>{ar ? 'تعرّف على البرنامج، وخطوات التقديم، وما ينتظرك خلال رحلة التعلم.' : 'Explore the program, the application steps and what to expect on your learning journey.'}</p>
            </div>
            <div className={`${section === 'faq' ? '' : 'eoa-space'} mx-auto`}>
              <FaqExplorer items={faqItems} categories={['events']} topics={faqTopics} searchable={faqItems.length > 5} grouped={false} jsonLd={section === 'faq'} footer={false} contactPath="/eoa/contact" placeholder={ar ? 'ابحث: الرسوم، المدة، الأهلية…' : 'Search: fees, duration, eligibility…'} />
              <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                {ar ? 'لديك سؤال آخر؟ ' : 'Have another question? '}
                <Link href="/eoa/contact" className="font-bold text-[var(--link)] underline">{ar ? 'تواصل مع فريق المسرّعة' : 'Contact the Accelerator team'}</Link>
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
