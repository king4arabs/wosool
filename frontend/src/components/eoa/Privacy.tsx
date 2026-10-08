'use client'
import Link from 'next/link'
import { useEoaProgram } from './Shared'
import { useLocale } from '@/lib/locale'

export function EoaPrivacy() {
  const { locale } = useLocale()
  const ar = locale === 'ar'
  const { program } = useEoaProgram()
  const localNotice = ar
    ? program?.privacy_notice_ar
    : program?.privacy_notice_en
  const items = ar
    ? [
        [
          'البيانات والغرض',
          'يستخدم وصول بيانات الحساب والمؤسس والشركة والإيرادات والمستندات الداعمة لتوثيق الحساب، وحفظ طلبك، وتقييم جاهزية الشركة، والتواصل بشأن الطلب. بعد القبول، تُستخدم بيانات الانضمام والأهداف والحضور والملاحظات لتنسيق البرنامج وتطوير مشاركتك.',
        ],
        [
          'من يمكنه الاطلاع',
          'يطلع صاحب الطلب وقيادة البرنامج والموظفون المخولون والمراجعون المخصصون على الطلب ومستنداته. يطلع المدرب المخصص على الأهداف والتقدم والحضور دون الإيرادات أو المستندات المالية. لا يُعرض الطلب أو الإيراد للمشاركين الآخرين.',
        ],
        [
          'الحماية والخدمات',
          'تُحفظ الحقول المالية للطلب مشفرة في قاعدة البيانات. تُحفظ المستندات في مساحة خاصة، ويتطلب تنزيلها حساباً مخولاً. تُستخدم خدمة بريد مضبوطة من مشغل الموقع لإرسال روابط الحساب والتنبيهات العامة دون إرفاق المستندات المالية. نستخدم ملفات جلسة ضرورية لحماية الدخول وتفضيل اللغة.',
        ],
        [
          'التصحيح وطلبات الخصوصية',
          'يمكن تعديل المسودة قبل التقديم، أو عند طلب معلومات إضافية. لطلب نسخة من بياناتك أو تصحيح طلب مقفل أو حذف البيانات، استخدم نموذج التواصل مع تحديد أن الطلب يخص الخصوصية. يتحقق الفريق من هوية صاحب الطلب قبل المعالجة. لا ترسل مستندات مالية عبر نموذج التواصل.',
        ],
        [
          'الاحتفاظ والحوكمة',
          'مدة الاحتفاظ والجهات المشغلة ومواقع معالجة البيانات تخضع لاعتماد قيادة البرنامج قبل فتح التقديم. يظهر الإشعار المحلي المعتمد أدناه عند اعتماده. لا يؤدي حذف ملف داعم من المسودة تلقائياً إلى حذفه من النسخ الاحتياطية. لا يُستخدم طلبك كإذن لتواصل استثماري أو تسويقي.',
        ],
      ]
    : [
        [
          'Data and purpose',
          'Wosool uses account, founder, company, revenue and supporting-document information to verify accounts, save applications, assess company readiness and communicate about an application. After acceptance, onboarding, goals, attendance and feedback support program coordination and participant development.',
        ],
        [
          'Who can access it',
          'The applicant, authorized program leadership and staff, and assigned reviewers can access the application and evidence. Assigned coaches see goals, progress and attendance, without application revenue or financial documents. Other participants cannot see your application or revenue.',
        ],
        [
          'Protection and services',
          'Application financial fields are encrypted in the database. Documents are kept in private storage and require an authorized account to download. The operator’s configured email service sends account links and general notifications without financial attachments. Essential session cookies protect sign-in and a preference stores your selected language.',
        ],
        [
          'Corrections and privacy requests',
          'You can edit a draft before submission or when additional information is requested. Use the contact form, identifying your message as a privacy request, to request a copy, correction of a locked application or deletion. The team verifies your identity before processing. Do not send financial documents through the contact form.',
        ],
        [
          'Retention and governance',
          'Local retention periods, operating entities and processing locations require leadership approval before applications open. The approved local notice appears below when available. Removing a draft attachment does not automatically remove backup copies. An application does not authorize investment or marketing outreach.',
        ],
      ]
  return (
    <div className="eoa-privacy">
      <p className="eoa-lead">
        {ar
          ? 'إشعار بيانات EO Riyadh Accelerator — نسخة 8 أكتوبر 2026.'
          : 'EO Riyadh Accelerator data notice — version 8 October 2026.'}
      </p>
      {items.map(([title, body]) => (
        <article key={title} className="eoa-card eoa-space">
          <h2>{title}</h2>
          <p>{body}</p>
        </article>
      ))}
      {localNotice && (
        <article className="eoa-card eoa-space">
          <h2>
            {ar ? 'الإشعار المحلي المعتمد' : 'Approved local notice'} —{' '}
            {program?.privacy_notice_version}
          </h2>
          <p className="eoa-preserve">{localNotice}</p>
        </article>
      )}
      <Link href="/EOA/contact" className="eoa-btn eoa-space">
        {ar ? 'تواصل بشأن بياناتك' : 'Contact us about your data'}
      </Link>
    </div>
  )
}
