'use client'
import { EoaLogo } from './Logo'
import Link from 'next/link'
import { Globe2, TrendingUp, UsersRound, ArrowUpRight } from 'lucide-react'
import { useLocale } from '@/lib/locale'
export function EoaOverview() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const items = [
    {
      icon: Globe2,
      metric: ar ? 'علاقات عالمية' : 'Global connections',
      text: ar
        ? 'تبادل الخبرة مع مجتمع من المؤسسين ورواد الأعمال.'
        : 'Learn alongside a connected community of founders and entrepreneurs.',
    },
    {
      icon: TrendingUp,
      metric: 'US$1M+',
      text: ar
        ? 'طوّر شركتك لتبلغ مليون دولار على الأقل من الإيرادات السنوية.'
        : 'Build toward at least US$1 million in annual revenue.',
    },
    {
      icon: UsersRound,
      metric: ar ? 'الاستعداد لعضوية EO' : 'EO membership readiness',
      text: ar
        ? 'طوّر قيادتك وخطتك للنمو واستعد لخطوة العضوية التالية.'
        : 'Strengthen your leadership and prepare for your next membership step.',
    },
  ]
  return (
    <section className="eoa-overview" aria-labelledby="eoa-overview-title">
      <div className="eoa-overview-head">
        <EoaLogo />
        <div>
          <p className="eoa-eyebrow">
            {ar ? 'مسار نمو للمؤسسين' : 'A GROWTH PATH FOR FOUNDERS'}
          </p>
          <h2 id="eoa-overview-title">EO Riyadh Accelerator</h2>
          <p>
            {ar
              ? 'مسرّعة رائدة تجمع التعلم العملي والمساءلة والعلاقات العالمية لدعم نمو شركتك.'
              : 'A premier accelerator combining practical learning, accountability and global founder connections.'}
          </p>
        </div>
      </div>
      <ol className="eoa-overview-steps">
        {items.map(({ icon: Icon, metric, text }, i) => (
          <li key={metric}>
            <div>
              <span className="eoa-overview-number">0{i + 1}</span>
              <Icon aria-hidden="true" size={26} />
            </div>
            <h3 dir={i === 1 ? 'ltr' : undefined}>{metric}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <div className="eoa-actions">
        <Link className="eoa-btn" href="/EOA">
          {ar ? 'اكتشف المسرّعة' : 'Explore the Accelerator'}
          <ArrowUpRight size={18} />
        </Link>
        <Link className="eoa-btn eoa-btn-outline" href="/EOA/apply">
          {ar ? 'قدّم طلبك' : 'Apply now'}
        </Link>
        <Link className="eoa-text-link" href="/dashboard/eoa">
          {ar ? 'تابع طلبك' : 'Track your application'}
        </Link>
      </div>
    </section>
  )
}
