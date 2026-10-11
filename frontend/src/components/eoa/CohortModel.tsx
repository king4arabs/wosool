'use client'
import Link from 'next/link'
export function CohortModel({ar}: {ar: boolean}) {
 const steps = ar ? [
  ['٦ أشهر','التدريب والتوجيه','رحلة مكثفة تجمع التدريب العملي والتوجيه ومجموعات المساءلة والأنشطة المرموقة لتنمية الشركة والقيادة.'],
  ['كل ٦ أشهر','دفعة جديدة','تنطلق جولة جديدة كل ستة أشهر. ينشر الفريق مواعيد كل دفعة والتقديم والأنشطة عند تأكيدها.'],
  ['بعد التخرج','مجتمع الخريجين','متابعة وتوجيه وعلاقات وأنشطة لدعم الشركات الناشئة في مسيرتها نحو مليون دولار من الإيراد السنوي.'],
  ['عند التأهل','التقديم لعضوية EO','يمكن لمشاركي EOA والمؤسسين والخريجين التقدم عند استيفاء جميع شروط EO واجتياز إجراءات الانضمام ومراجعة الفرع.']
 ] : [
  ['6 MONTHS','Coaching & training','An intensive journey combining practical training, coaching, accountability groups and prestigious activities to develop the business and its founder.'],
  ['EVERY 6 MONTHS','A new cohort','A new cohort round begins every six months. Confirmed intake dates, cohort schedules and activities are published by the team.'],
  ['AFTER GRADUATION','An alumni community','Ongoing follow-ups, coaching, connections and activities support startups as they work toward US$1 million in annual revenue.'],
  ['WHEN QUALIFIED','Apply to join EO','EOA participants, founders and alumni can apply when they meet all EO membership requirements and complete its admission and chapter-review process.']
 ]
 return <section className="eoa-space" aria-label={ar?'رحلة الدفعة والخريجين':'Cohort and alumni journey'}><div className="eoa-four-grid">{steps.map(([label,title,body])=><article className="eoa-pillar" key={title}><span className="eoa-eyebrow">{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><p className="eoa-muted">{ar?'التخرج من الدفعة مستقل عن الوصول إلى مليون دولار وعن القبول في EO. يستمر دعم الخريجين بعد انتهاء الأشهر الستة.':'Cohort graduation is separate from reaching US$1 million and from admission to EO. Alumni support continues beyond the six-month cohort.'}</p><Link href="/eoa/alumni" className="eoa-text-link">{ar?'استكشف برنامج الخريجين':'Explore the alumni program'} ↗</Link></section>
}
