'use client'
import Link from 'next/link'
import { eoaJourneyStage } from '@/lib/eoa-journey'

export function EoaProgress({ status, verified, participantStatus, onboardingComplete, ar }: {
  status?: string; verified: boolean; participantStatus?: string; onboardingComplete?: boolean; ar: boolean
}) {
  const stage = eoaJourneyStage(status, verified, participantStatus)
  const steps = ar ? ['توثيق الحساب', 'تجهيز الطلب', 'مراجعة الطلب', 'استكمال الانضمام', 'التعلم والنمو'] : ['Verify account', 'Prepare application', 'Application review', 'Complete onboarding', 'Learn & grow']
  let message = ar ? 'أكمل بيانات المؤسس والشركة وأهداف النمو. يمكنك حفظ المسودة والعودة لاحقاً.' : 'Complete your founder details, company information and growth goals. Save a draft and return whenever you are ready.'
  let href = '/EOA/apply'
  let action = ar ? 'استكمال الطلب' : 'Continue application'
  if (stage === 0) { message = ar ? 'افتح رابط التوثيق المرسل إلى بريدك، ثم حدّث حالة حسابك أدناه.' : 'Open the verification link in your email, then refresh your account status below.'; href = '#verify-email'; action = ar ? 'توثيق بريدي' : 'Verify my email' }
  else if (status === 'information_requested') { message = ar ? 'طلب الفريق معلومات إضافية. راجع ملاحظاته، وحدّث طلبك ثم أعد إرساله.' : 'The team requested more information. Read their notes, update your application and resubmit.' }
  else if (stage === 2) {
    message = status === 'interview' ? (ar ? 'طلبك في مرحلة المقابلة. تابع إشعاراتك لتفاصيل التنسيق مع فريق البرنامج.' : 'Your application is at the interview stage. Check notifications for coordination with the program team.')
      : status === 'waitlisted' ? (ar ? 'طلبك على قائمة الانتظار. سيظهر أي تحديث في حسابك عند توفر مقعد مناسب.' : 'Your application is waitlisted. Any update will appear in your account when a suitable place becomes available.')
      : status === 'rejected' ? (ar ? 'راجع قرار الفريق أدناه. يمكنك التواصل مع البرنامج للاستفسار عن الخطوات المناسبة لك.' : 'Read the team’s decision below. Contact the program to discuss suitable next steps.')
      : (ar ? 'تم استلام طلبك. تابع إشعارات الحساب لأي أسئلة أو تحديثات من الفريق.' : 'Your application has been received. Check account notifications for questions or updates from the team.')
    href = status === 'rejected' ? '/EOA/contact' : '#application-updates'; action = status === 'rejected' ? (ar ? 'التواصل مع الفريق' : 'Contact the team') : (ar ? 'عرض التحديثات' : 'View updates')
  } else if (stage >= 3) {
    message = stage === 4 ? (ar ? 'تابع جلساتك وأهدافك وموارد التعلم في مساحة المشارك.' : 'Manage your sessions, goals and learning resources in your participant workspace.')
      : onboardingComplete ? (ar ? 'اكتملت قائمة الانضمام. تابع تأكيد التسجيل والرسوم من فريق البرنامج.' : 'Your onboarding checklist is complete. Await enrollment and fee confirmation from the program team.')
      : (ar ? 'راجع مسار قبولك وأكمل قائمة الانضمام. التسجيل النهائي يتطلب تأكيد الإدارة.' : 'Review your accepted track and complete your onboarding checklist. Final enrollment requires confirmation from the team.')
    href = participantStatus ? '#participant-workspace' : '/EOA/contact'; action = participantStatus ? (ar ? 'فتح مساحة المشارك' : 'Open participant workspace') : (ar ? 'التواصل مع الفريق' : 'Contact the team')
  }
  return <section className="eoa-card eoa-space" aria-labelledby="eoa-next-step">
    <h2 id="eoa-next-step">{ar ? 'خطوتك التالية' : 'Your next step'}</h2>
    <ol className="eoa-journey-progress" aria-label={ar ? 'مراحل رحلتك' : 'Your journey stages'}>{steps.map((label, i) => <li key={label} aria-current={i === stage ? 'step' : undefined} data-complete={i < stage}><span aria-hidden="true">{i < stage ? '✓' : i + 1}</span>{label}<span className="sr-only">{i < stage ? (ar ? ' — مكتمل' : ' — complete') : ''}</span></li>)}</ol>
    <p>{message}</p><Link className="eoa-btn" href={href}>{action}</Link>
  </section>
}
