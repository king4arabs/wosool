'use client'
import Link from 'next/link'
export function CohortModel({ar}: {ar: boolean}) {
 const steps = ar ? [
  ['عامان','رحلة تعلم ونمو','منهج لمدة عامين مع مشاركة وتجديد سنويين، للعمل على النقد والاستراتيجية والأفراد والتنفيذ.'],
  ['ربع سنوي','أيام التعلم','أربعة أيام تعلم سنوياً، مع تطبيق الأدوات ومراجعة النتائج في شركتك.'],
  ['شهرياً','مجموعات المساءلة','مجموعة من 4–6 مشاركين يقودها مدرب عضو في EO؛ خصص ساعتين إلى أربع ساعات شهرياً.'],
  ['عند التأهل','التقدم إلى EO','عند بلوغ متطلبات EO، راجع فريق البرنامج وتقدم عبر إجراءات قبول الفرع المستقلة.']
 ] : [
  ['TWO YEARS','A learning and growth journey','A two-year curriculum with annual participation and renewal, working on Cash, Strategy, People and Execution.'],
  ['QUARTERLY','Learning Days','Four Learning Days each year, with tools to apply and results to review in your business.'],
  ['MONTHLY','Accountability groups','An EO-member coach guides 4–6 participants. Allow two to four hours each month for your group.'],
  ['WHEN QUALIFIED','Apply to EO','When you meet EO requirements, speak with the program team and follow the chapter’s separate admission process.']
 ]
 return <section className="eoa-space" aria-label={ar?'رحلة التعلم والنمو':'Learning and growth journey'}><div className="eoa-four-grid">{steps.map(([label,title,body])=><article className="eoa-pillar" key={title}><span className="eoa-eyebrow">{label}</span><h3>{title}</h3><p>{body}</p></article>)}</div><p className="eoa-muted">{ar?'قد تفتح دفعات جديدة كل ستة أشهر وفق المواعيد المؤكدة. موعد استقبال الدفعة لا يغيّر مدة المنهج؛ مراجعة التقدم ليست تخرجاً ولا تمنح عضوية EO.':'New intakes may open every six months on confirmed dates. Intake frequency does not shorten the curriculum; a progress review is not graduation or EO membership.'}</p><Link href="/eoa/alumni" className="eoa-text-link">{ar?'التخرج ومتابعة النمو':'Graduation and continued growth'} ↗</Link></section>
}
