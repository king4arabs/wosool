'use client'
import Link from 'next/link'
import { statusLabel } from '@/lib/eoa'

export type Management = {
  alumni?: {total: number; follow_ups_due: number}
  generated_at: string
  pipeline: Record<string, number>
  attention: Record<string, number>
  learning: {goals: number; completed_goals: number; participants_with_goals: number; enrolled: number}
  upcoming_sessions: {id: number; title: string; starts_at: string; session_type: string}[]
  cohorts: {id: number; name: string; status: string; capacity: number; assigned: number}[]
}
export function ManagementOverview({data, ar, settings, mail, open, navigate}: {
  data?: Management; ar: boolean; settings: Record<string, string | number | null>; mail: boolean; open: boolean; navigate: (tab: string) => void
}) {
  if (!data) return <p>{ar ? 'يتطلب الملخص تحديث خدمة إدارة البرنامج.' : 'The management summary requires the updated program service.'}</p>
  const priorities = [
    ['unassigned_reviews','مراجعات تحتاج إسناداً','Reviews need an owner','applications'],
    ['overdue_reviews','مراجعات دون تحديث منذ 14 يوماً','Reviews unchanged for 14 days','applications'],
    ['onboarding','مشاركون يستكملون الانضمام','Participants onboarding','enrollment'],
    ['unassigned_participants','مشاركون يحتاجون دفعة أو مجموعة','Participants need a cohort or group','enrollment'],
    ['groups_without_coach','مجموعات تحتاج مدرباً موثقاً','Groups need a verified coach','program'],
    ['overdue_goals','أهداف تجاوزت موعدها','Goals past their target date','coaching'],
  ]
  return <div className="eoa-space">
    <div className="eoa-management-hero"><span className="eoa-eyebrow">EO RIYADH ACCELERATOR</span><h2>{ar?'من القبول إلى النمو':'From admission to growth'}</h2><p>{ar?'خطوة واضحة لكل طلب ومشارك وفريق.':'A clear next step for every application, participant and team.'}</p><span>{ar?'آخر تحديث: ':'Updated: '}{new Date(data.generated_at).toLocaleString(ar?'ar-SA-u-ca-gregory':'en-GB',{timeZone:'Asia/Riyadh'})} · {ar?'الرياض':'Riyadh'}</span></div>
    {data.alumni && <div className="eoa-two-grid"><button type="button" className="eoa-card eoa-priority" onClick={()=>navigate('alumni')}><strong>{data.alumni.total}</strong><span>{ar?'الخريجون':'Alumni'} ↗</span></button><button type="button" className="eoa-card eoa-priority" onClick={()=>navigate('alumni')}><strong>{data.alumni.follow_ups_due}</strong><span>{ar?'متابعات الخريجين المستحقة':'Alumni follow-ups due'} ↗</span></button></div>}
    <section><h2>{ar?'أولويات اليوم':'Needs attention'}</h2><div className="eoa-three-grid">{priorities.map(([key,arabic,english,tab])=><button type="button" key={key} className="eoa-card eoa-priority" onClick={()=>navigate(tab)}><strong>{data.attention[key] ?? 0}</strong><span>{ar?arabic:english} ↗</span></button>)}</div></section>
    <div className="eoa-two-grid"><section className="eoa-card"><h3>{ar?'مسار الطلبات':'Application pipeline'}</h3>{Object.entries(data.pipeline).length ? Object.entries(data.pipeline).map(([status,count])=><div className="eoa-summary-line" key={status}><span>{statusLabel(status,ar)}</span><strong>{count}</strong></div>):<p>{ar?'لا توجد طلبات مرسلة بعد.':'No submitted applications yet.'}</p>}<button type="button" className="eoa-text-link" onClick={()=>navigate('applications')}>{ar?'إدارة المراجعة':'Manage review'} ↗</button></section>
    <section className="eoa-card"><h3>{ar?'جاهزية التشغيل':'Operating readiness'}</h3>{[[ar?'اعتماد البرنامج':'Program approved',settings.approval_status==='approved'],[ar?'اعتماد إشعار البيانات':'Data notice approved',settings.privacy_status==='approved'],[ar?'إعداد البريد':'Mail transport configured',mail],[ar?'مفتاح القبول مفعل':'Intake switch enabled',open]].map(([label,ready])=><div className="eoa-summary-line" key={String(label)}><span>{label}</span><span className="eoa-badge">{ready ? ar?'جاهز':'Ready':ar?'معلق':'Pending'}</span></div>)}<p className="eoa-muted">{ar?'إعداد البريد لا يؤكد تسليم الرسائل. راجع الموعد النهائي والاعتمادات قبل فتح القبول.':'Mail configuration does not confirm delivery. Review the deadline and approvals before opening intake.'}</p><button type="button" className="eoa-text-link" onClick={()=>navigate('settings')}>{ar?'مراجعة الإعدادات':'Review settings'} ↗</button></section></div>
    <div className="eoa-two-grid"><section className="eoa-card"><h3>{ar?'سعة الدفعات':'Cohort capacity'}</h3>{data.cohorts.length?data.cohorts.map(c=><div key={c.id} className="eoa-capacity"><div className="eoa-summary-line"><strong>{c.name}</strong><span>{c.assigned} / {c.capacity}</span></div><progress aria-label={c.name} value={Math.min(c.assigned,c.capacity)} max={Math.max(c.capacity,1)}/><small>{statusLabel(c.status,ar)}</small></div>):<p>{ar?'أنشئ دفعة ثم حدد السعة والمواعيد.':'Create a cohort and set its capacity and dates.'}</p>}<button type="button" className="eoa-text-link" onClick={()=>navigate('program')}>{ar?'إدارة التشغيل':'Manage operations'} ↗</button></section>
    <section className="eoa-card"><h3>{ar?'التعلم والمساءلة':'Learning & accountability'}</h3><div className="eoa-summary-line"><span>{ar?'الأهداف المكتملة':'Completed goals'}</span><strong>{data.learning.completed_goals} / {data.learning.goals}</strong></div><div className="eoa-summary-line"><span>{ar?'مشاركون لديهم أهداف':'Participants with goals'}</span><strong>{data.learning.participants_with_goals} / {data.learning.enrolled}</strong></div><p>{ar?'تابع أهدافاً قابلة للقياس في النقد والاستراتيجية والأفراد والتنفيذ، وراجع التقدم في لقاءات المساءلة.':'Set measurable goals across cash, strategy, people and execution, then review progress in accountability meetings.'}</p><Link className="eoa-text-link" href="/eoa/coach">{ar?'مساحة المدرب':'Coach workspace'} ↗</Link></section></div>
    <section className="eoa-card"><h3>{ar?'الجلسات القادمة':'Upcoming sessions'}</h3>{data.upcoming_sessions.length?data.upcoming_sessions.map(s=><div className="eoa-summary-line" key={s.id}><strong>{s.title}</strong><time dateTime={s.starts_at}>{new Date(s.starts_at).toLocaleString(ar?'ar-SA-u-ca-gregory':'en-GB',{timeZone:'Asia/Riyadh'})}</time></div>):<p>{ar?'لا توجد جلسات قادمة منشورة.':'No upcoming sessions published.'}</p>}</section>
  </div>
}

export function AccessGuide({ar}: {ar: boolean}) {
 const rows = [
  ['المتقدم','Applicant','طلبه ومستنداته وإشعاراته فقط','Own application, evidence and notifications'],
  ['المشارك المسجل','Enrolled participant','أهدافه وجلسات ومواد دفعته','Own goals and cohort sessions and materials'],
  ['مراجع الطلبات','Reviewer','الطلبات المسندة؛ دون قرارات نهائية','Assigned applications; no final decisions'],
  ['المدرب','Coach','المشاركون المسندون؛ أهداف وملاحظات وحضور','Assigned participants; goals, feedback and attendance'],
  ['إدارة العمليات','Operations staff','الطلبات والدفعات والمجموعات والمحتوى','Applications, cohorts, groups and operating content'],
  ['قائد البرنامج','Program lead','القرارات النهائية والرسوم والتسجيل والاعتمادات','Final decisions, fees, enrollment and approvals'],
  ['مدير المنصة','Platform administrator','كل ما سبق ومنح وسحب صلاحيات الفريق','All of the above, plus granting and revoking team access'],
 ]
 return <section className="eoa-card eoa-space"><h2>{ar?'من يستطيع فعل ماذا؟':'Who can do what?'}</h2><p>{ar?'تُجمع الصلاحيات عند إسناد أكثر من دور. عضوية المجلس أو نشر ملف مرشد لا يمنح وصولاً إدارياً.':'Multiple roles combine their permissions. A board appointment or public mentor profile does not grant administrative access.'}</p><div className="eoa-role-grid">{rows.map(([a,e,ad,ed])=><article key={e}><h3>{ar?a:e}</h3><p>{ar?ad:ed}</p></article>)}</div></section>
}
