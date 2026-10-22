'use client'
import Link from 'next/link'
export function CohortModel({ar}: {ar: boolean}) {
 const steps = ar ? [
  ['٦ أشهر','التعلم مع الدفعة','احضر جلسات التعلم والتوجيه، وناقش مع مجموعتك ما جربته في شركتك منذ اللقاء السابق.'],
  ['كل ٦ أشهر','دفعة جديدة','تنطلق جولة جديدة كل ستة أشهر. ينشر الفريق مواعيد كل دفعة والتقديم والأنشطة عند تأكيدها.'],
  ['بعد التخرج','متابعة الخريجين','واصل مراجعة أهداف شركتك مع البرنامج بعد الدفعة، وأبقِ هدف المليون دولار من الإيراد السنوي قيد النظر.'],
  ['عند التأهل','التقديم لعضوية EO','يمكن لمشاركي EOA والمؤسسين والخريجين التقدم عند استيفاء جميع شروط EO واجتياز إجراءات الانضمام ومراجعة الفرع.']
 ] : [
  ['6 MONTHS','Learn with your cohort','Attend learning and coaching sessions, then talk through what you tried in your business with your accountability group.'],
  ['EVERY 6 MONTHS','A new cohort','A new cohort round begins every six months. Confirmed intake dates, cohort schedules and activities are published by the team.'],
  ['AFTER GRADUATION','Alumni follow-ups','Keep reviewing your business goals with the program after your cohort, including the goal of US$1 million in annual revenue.'],
  ['WHEN QUALIFIED','Apply to join EO','EOA participants, founders and alumni can apply when they meet all EO membership requirements and complete its admission and chapter-review process.']
 ]
 return <section className="eoa-space" aria-label={ar?'رحلة الدفعة والخريجين':'Cohort and alumni journey'}><div className="eoa-four-grid">{steps.map(([label,title,body])=><article className="eoa-pillar" key={title}><span className="eoa-eyebrow">{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><p className="eoa-muted">{ar?'التخرج من الدفعة مستقل عن الوصول إلى مليون دولار وعن القبول في EO. يستمر دعم الخريجين بعد انتهاء الأشهر الستة.':'Cohort graduation is separate from reaching US$1 million and from admission to EO. Alumni support continues beyond the six-month cohort.'}</p><Link href="/eoa/alumni" className="eoa-text-link">{ar?'استكشف برنامج الخريجين':'Explore the alumni program'} ↗</Link></section>
}
