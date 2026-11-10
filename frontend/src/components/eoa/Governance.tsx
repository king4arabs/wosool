'use client'
import type { EoaProgram } from '@/lib/eoa'
export function EoaGovernance({
  ar,
  program,
}: {
  ar: boolean
  program: EoaProgram | null
}) {
  const roles = [
    [
      'chair',
      'الرئيس والمساءلة',
      'Chair & accountability',
      'قيادة البرنامج، المدربون، الشراكات والرقابة المالية.',
      'Program leadership, coaches, alliances and financial oversight.',
    ],
    [
      'learning',
      'رئيس التعلم',
      'Learning lead',
      'تنسيق أيام التعلم والمدرب وجودة التعلم.',
      'Learning Day scheduling, trainer coordination and learning quality.',
    ],
    [
      'membership',
      'الاستقطاب والعضوية والتواصل',
      'Recruitment, membership & communication',
      'الاستقطاب والتهيئة والاحتفاظ بالمشاركين والتواصل.',
      'Recruitment, onboarding, participant retention and communication.',
    ],
  ]
  return (
    <section className="eoa-space" id="eoa-board">
      <h2>{ar ? 'مجلس مسرّعة EO الرياض' : 'EO Riyadh Accelerator Board'}</h2>
      <p>
        {ar
          ? 'مجلس البرنامج مسؤول عن تشغيل المسرّعة تحت إشراف فرع EO الرياض. فريق التشغيل يدعم التنفيذ.'
          : 'The program board oversees Accelerator delivery under EO Riyadh. The operating team supports execution.'}
      </p>
      <div className="eoa-three-grid">
        {roles.map(([role, a, en, descA, descEn]) => {
          const member = program?.governance?.find((m) => m.role === role)
          return (
            <article key={role} className="eoa-card">
              <h3>{ar ? a : en}</h3>
              <strong>
                {member
                  ? ar
                    ? member.name_ar
                    : member.name_en
                  : role === 'chair'
                    ? ar
                      ? 'محمد السلمي'
                      : 'Mohammed Alsolami'
                    : ar
                      ? 'سيُعلن التعيين عند تأكيده'
                      : 'Appointment to be announced when confirmed'}
              </strong>
              <p>{ar ? descA : descEn}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
