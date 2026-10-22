"use client"

import { PublicLayout } from "@/components/layout/PublicLayout"
import { PageHero } from "@/components/sections/PageHero"
import { useLocale } from "@/lib/locale"

type Clause = { ar: [string, string | string[]]; en: [string, string | string[]] }

/** Same clauses as the April 2026 Arabic terms; the English text is a translation. */
const clauses: Clause[] = [
  { ar: ["قبول الشروط", "باستخدامك منصة وصول أو وصولك إليها، فإنك تقر بموافقتك على هذه الشروط والأحكام. وإذا لم توافق عليها، فيجب عليك التوقف عن استخدام المنصة."],
    en: ["Acceptance", "By using or accessing Wosool you agree to these terms. If you do not agree, stop using the platform."] },
  { ar: ["وصف الخدمة", "وصول شبكة منتقاة للمؤسسين تعمل بنظام الدعوة أو التقديم، وتركز على منظومة الشركات الناشئة في السعودية والخليج. وتوفر المنصة للأعضاء المعتمدين الوصول إلى المجتمع، والبرامج، والفعاليات، وفرص التعارف، والموارد المرتبطة بالعضوية."],
    en: ["The service", "Wosool is a founder network joined by invitation or application, focused on startups in Saudi Arabia and the Gulf. Approved members get access to the community, programs, events, introductions and member resources."] },
  { ar: ["الأهلية", "يجب أن يكون المتقدم قد أتم الثامنة عشرة، وأن يكون مؤسسًا أو شريكًا مؤسسًا أو مسؤولًا تنفيذيًا في شركة حتى يكون مؤهلًا للتقديم. وتحتفظ وصول بحق قبول الطلبات أو رفضها وفق تقديرها المهني."],
    en: ["Eligibility", "Applicants must be 18 or older and a founder, co-founder or executive of a company. Wosool may accept or decline applications at its professional discretion."] },
  { ar: ["الحسابات", "يتحمل المستخدم مسؤولية الحفاظ على سرية بيانات الدخول إلى الحساب، كما يتحمل مسؤولية أي نشاط يتم من خلاله. ويلتزم بإبلاغ وصول فورًا عند الاشتباه في أي استخدام غير مصرح به."],
    en: ["Accounts", "You are responsible for keeping your sign-in details confidential and for activity on your account. Tell Wosool straight away if you suspect unauthorised use."] },
  { ar: ["الاستخدام المقبول", ["استخدام المنصة لأي غرض غير مشروع أو مخالف للأنظمة السارية.", "مشاركة معلومات سرية تخص أعضاء آخرين دون موافقتهم.", "ممارسة الإزعاج أو الإساءة أو السلوك غير المهني تجاه الأعضاء أو الفريق.", "تقديم معلومات مضللة عن الهوية أو الشركة أو الخلفية المهنية.", "محاولة الوصول غير المصرح به إلى أنظمة المنصة أو حسابات الآخرين.", "استخدام المنصة في التسويق المباشر أو الاستهداف التجاري دون موافقة مسبقة من الطرف المعني."]],
    en: ["Acceptable use", ["Using the platform for any unlawful purpose or in breach of applicable regulations.", "Sharing other members' confidential information without their consent.", "Harassing, abusing or acting unprofessionally towards members or the team.", "Giving misleading information about your identity, company or background.", "Attempting unauthorised access to the platform's systems or other accounts.", "Using the platform for direct marketing or commercial targeting without the other party's prior consent."]] },
  { ar: ["الملكية الفكرية", "جميع المحتويات والتصاميم والشعارات والمواد الظاهرة على المنصة مملوكة لوصول أو للجهات المرخِّصة لها، ولا يجوز نسخها أو إعادة استخدامها أو إنشاء أعمال مشتقة منها دون موافقة خطية مسبقة."],
    en: ["Intellectual property", "All content, designs, logos and materials on the platform belong to Wosool or its licensors and may not be copied, reused or adapted without prior written consent."] },
  { ar: ["العضوية والرسوم", "تُوضح فئات العضوية وما يرتبط بها من رسوم خلال مسار التهيئة والانضمام. وما لم يُنص على خلاف ذلك، لا تُسترد الرسوم المدفوعة. ويجوز لوصول تعديل الأسعار مع إشعار مناسب للأعضاء الحاليين."],
    en: ["Membership and fees", "Membership tiers and any fees are explained during onboarding. Unless stated otherwise, fees paid are non-refundable. Wosool may change prices with reasonable notice to existing members."] },
  { ar: ["الإيقاف أو الإنهاء", "يجوز لوصول تعليق الوصول إلى المنصة أو إنهاؤه إذا تبين الإخلال بهذه الشروط أو بما يهدد سلامة المجتمع أو الثقة داخله. ويجوز للمستخدم إنهاء عضويته متى كان ذلك متاحًا عبر إعدادات الحساب أو بالتواصل مع الفريق."],
    en: ["Suspension and termination", "Wosool may suspend or end access for breaches of these terms or conduct that threatens the community's safety or trust. You may end your membership through account settings, where available, or by contacting the team."] },
  { ar: ["حدود المسؤولية", "تُقدم المنصة كما هي، دون ضمانات صريحة أو ضمنية تتجاوز ما يقتضيه النظام. ولا تتحمل وصول مسؤولية الأضرار غير المباشرة أو التبعية الناتجة عن استخدام المنصة، وذلك في الحدود التي يجيزها النظام."],
    en: ["Limitation of liability", "The platform is provided as is, without warranties beyond those required by law. To the extent the law allows, Wosool is not liable for indirect or consequential loss arising from use of the platform."] },
  { ar: ["النظام الواجب التطبيق", "تخضع هذه الشروط وتفسر وفق أنظمة المملكة العربية السعودية، وتختص المحاكم المختصة في مدينة الرياض بالنظر في أي نزاع ينشأ عنها، ما لم يقتض النظام خلاف ذلك."],
    en: ["Governing law", "These terms are governed by the laws of the Kingdom of Saudi Arabia. The competent courts in Riyadh hear any dispute, unless the law requires otherwise."] },
  { ar: ["تعديل الشروط", "يجوز لوصول تحديث هذه الشروط من وقت إلى آخر. وعند وجود تعديل جوهري، سننبه الأعضاء عبر البريد الإلكتروني أو من خلال المنصة. ويعد استمرارك في استخدام المنصة بعد سريان التعديل موافقة عليه."],
    en: ["Changes to these terms", "Wosool may update these terms. For material changes we will notify members by email or on the platform. Continuing to use the platform after a change takes effect means you accept it."] },
]

export default function TermsPage() {
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const body = "mt-3 text-base leading-8 text-[var(--text-muted)]"
  return <PublicLayout><div dir={direction} lang={locale} className="bg-[var(--page-bg)]">
    <PageHero
      eyebrow={ar ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
      title={ar ? "الشروط والأحكام" : "Terms of service"}
      description={ar ? "القواعد التي تحكم استخدام منصة وصول وعضويتها." : "The rules for using Wosool and holding a membership."}
    />
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {!ar && <p className="mb-8 rounded-xl bg-[var(--surface-soft)] p-4 text-sm leading-7 text-[var(--text-muted)]">This English text is a translation. If the two versions differ, the Arabic version applies.</p>}
      <ol className="space-y-5">
        {clauses.map((clause, index) => {
          const [title, text] = clause[ar ? "ar" : "en"]
          return <li key={index} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-strong)]"><span className="me-2 text-[var(--action-bg)]">{index + 1}.</span>{title}</h2>
            {Array.isArray(text)
              ? <><p className={body}>{ar ? "يلتزم المستخدم بعدم القيام بما يلي:" : "You must not:"}</p><ul className="mt-2 list-disc space-y-2 ps-6 text-base leading-8 text-[var(--text-muted)]">{text.map(item => <li key={item}>{item}</li>)}</ul></>
              : <p className={body}>{text}</p>}
          </li>
        })}
        <li className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-6">
          <h2 className="text-lg font-bold text-[var(--text-strong)]"><span className="me-2 text-[var(--action-bg)]">{clauses.length + 1}.</span>{ar ? "التواصل" : "Contact"}</h2>
          <p className={body}>{ar ? "لأي استفسار بخصوص هذه الشروط راسلنا على" : "For questions about these terms, email"} <a dir="ltr" href="mailto:legal@wosool.org" className="font-semibold text-[var(--link)] underline">legal@wosool.org</a>.</p>
        </li>
      </ol>
    </article>
  </div></PublicLayout>
}
