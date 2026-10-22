"use client";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useLocale } from "@/lib/locale";
export default function Privacy() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="mx-auto max-w-3xl">
          <p className="gateway-eyebrow">
            {t("آخر تحديث: 8 أكتوبر 2026", "Updated 8 October 2026")}
          </p>
          <h1 className="gateway-heading">
            {t("إشعار خصوصية وصول", "Wosool privacy notice")}
          </h1>
          {[
            [
              t("البيانات والغرض", "Data and purpose"),
              t(
                "تستخدم وصول بيانات الحساب، وملف المؤسس والشركة، وإيرادات الشركة وتمويلها المصرّح به، وأهداف التقديم لتشغيل حسابك وتقييم طلبك والتواصل بشأنه. لا يطلب مسار المسرّعة وثائق هوية أو تفاصيل بنكية.",
                "Wosool uses account details, founder and company profiles, self-reported revenue and funding, and application goals to operate your account, assess your application, and communicate about it. The accelerator application does not request identity documents or bank details.",
              ),
            ],
            [
              t("الموافقة والتحكم", "Consent and control"),
              t(
                "تُسجّل موافقتك وتاريخها عند إنشاء الحساب، وتُسجّل نسخة الإشعار أيضًا عند إرسال الطلب. المسودة قابلة للتعديل قبل التقديم، ويمكنك طلب التصحيح أو سحب الموافقة في أي وقت من صفحة طلبك.",
                "Consent and its date are recorded at account creation; submission also records the notice version. Drafts can be edited before submission. Request correction or withdrawal of consent through your application page.",
              ),
            ],
            [
              t("الوصول والمشاركة", "Access and sharing"),
              t(
                "تبقى ملفات المتقدمين الجديدة خاصة. يقتصر الوصول إلى الطلب على صاحبه والمسؤولين والمراجعين المكلّفين. لا يظهر ملف المتقدم في دليل المجتمع تلقائيًا. قد تعالج خدمات الاستضافة والبريد البيانات اللازمة لتشغيل الخدمة؛ يلزم اعتماد قائمة مزودي الخدمة ومواقع المعالجة قبل إطلاق استقبال الطلبات الفعلية.",
                "New applicant profiles remain private. Access is limited to the applicant, administrators, and assigned reviewers. Applying does not publish a community profile. Hosting and mail services process data needed to operate the service; the provider register and processing locations must be approved before live intake begins.",
              ),
            ],
            [
              t("الاحتفاظ والحقوق", "Retention and your rights"),
              t(
                "يمكنك طلب نسخة من بياناتك، أو تصحيحها، أو سحب الموافقة، أو حذفها. يراجع الفريق الطلب ويحدد أي احتفاظ لازم لنزاع أو التزام نظامي. مدة الاحتفاظ التشغيلية وهوية الجهة المسؤولة عن المعالجة وقناة مسؤول الخصوصية تحتاج إلى اعتماد المالك قبل استقبال بيانات فعلية.",
                "You may request a copy, correction, consent withdrawal, or deletion. The team reviews requests and any retention needed for a dispute or legal obligation. The operating retention period, legal controller identity, and privacy officer contact require owner approval before live applicant intake.",
              ),
            ],
            [
              t("الجلسات والأمان", "Sessions and security"),
              t(
                "تستخدم المنصة ملفات ارتباط للجلسة والحماية من تزوير الطلبات وتفضيل اللغة. لا تُخزن مسودات الطلبات في التخزين المحلي للمتصفح. تُعرض التحديثات داخل الحساب، وتتطلب الروابط الحساسة تسجيل الدخول.",
                "The platform uses cookies for sessions, request security, and language preference. Application drafts are not stored in browser local storage. Updates appear inside your account and sensitive links require sign-in.",
              ),
            ],
          ].map(([h, b]) => (
            <section key={h} className="mt-8">
              <h2 className="text-xl font-bold">{h}</h2>
              <p className="mt-3 leading-9 text-slate-600">{b}</p>
            </section>
          ))}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="gateway-button" href="/accelerator/apply">
              {t("إدارة طلبات الخصوصية", "Manage privacy requests")}
            </Link>
            <Link className="gateway-button-secondary" href="/contact">
              {t("التواصل مع وصول", "Contact Wosool")}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
