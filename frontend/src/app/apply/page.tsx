"use client";

import { useEffect, useRef, useState, type FormEvent, type HTMLInputAutoCompleteAttribute } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { api, ApiError } from "@/lib/api";
import { useLocale } from "@/lib/locale";
import {
  APPLY_FORM_SESSION_KEY, firstErrorStep, initialFormData,
  restoreDraft, sectors, stages, validateStep, type ApplicationForm, type FormErrors, type FormField,
} from "@/lib/application-form";

const criteria = [
  ["أن تكون مؤسسًا أو شريكًا مؤسسًا نشطًا في شركة قائمة أو قيد التأسيس.", "You are an active founder or co-founder of an existing or emerging company."],
  ["أن تكون الشركة مسجلة أو في طريقها إلى التسجيل النظامي.", "Your company is registered or working toward registration."],
  ["أن يكون نشاطك موجهًا إلى السعودية أو الخليج، أو مبنيًا داخلهما.", "Your business operates in or serves Saudi Arabia or the Gulf."],
  ["أن تملك وضوحًا تشغيليًا مع مسار تمويلي أو تشغيلي جاد للمرحلة المقبلة.", "You have a clear operating model and a serious plan for your next stage."],
  ["أن تدخل المجتمع بروح المشاركة والإضافة، لا بهدف الاستفادة الأحادية فقط.", "You want to contribute to the community and support other founders."],
];
const faqs = [
  ["كم يستغرق تقديم الطلب؟", "How long does the application take?", "يستغرق النموذج عادة بين 10 و15 دقيقة. نراجع الطلبات بشكل مستمر.", "The form usually takes 10–15 minutes. Applications are reviewed on an ongoing basis."],
  ["هل توجد رسوم عضوية؟", "Are there membership fees?", "الوصول إلى المجتمع يتم حاليًا عبر الدعوة أو التقديم. تُشارك تفاصيل الرسوم والخيارات المتاحة بعد مراجعة الطلب بحسب المرحلة وملاءمة العضوية.", "Access is currently by invitation or application. Fees and available options are shared after review, based on your stage and membership fit."],
  ["هل يمكنني التقديم إذا كنت ما زلت قبل إطلاق المنتج؟", "Can I apply before launching my product?", "نعم، ما دمت تملك تصورًا واضحًا، وتعمل بجدية على البناء، ولديك اهتمام فعلي بالسوق السعودي أو الخليجي.", "Yes, if you have a clear vision, are actively building, and have a real interest in the Saudi or Gulf market."],
  ["ماذا يحدث بعد إرسال الطلب؟", "What happens after I apply?", "يراجع الفريق طلبك وقد يتواصل معك لترتيب مكالمة تعريفية قصيرة قبل إتمام القبول.", "The team reviews your application and may contact you for a short introductory call before a membership decision."],
];

function ApplicationField({ field, label, value, error, onChange, type = "text", required, maxLength = 255, placeholder, autoComplete, multiline, options }: {
  field: FormField; label: string; value: string; error?: string;
  onChange: (field: FormField, value: string) => void; type?: string; required?: boolean;
  maxLength?: number; placeholder?: string; autoComplete?: HTMLInputAutoCompleteAttribute;
  multiline?: boolean; options?: { value: string; label: string }[];
}) {
  const props = {
    id: field, name: field, value, required, "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${field}-error` : undefined,
    className: "gateway-input", onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(field, event.target.value),
  };
  return (
    <div className="min-w-0">
      <label htmlFor={field} className="gateway-label">{label}{required ? " *" : ""}</label>
      {options ? <select {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        : multiline ? <textarea {...props} rows={4} maxLength={maxLength} placeholder={placeholder} />
          : <input {...props} type={type} maxLength={maxLength} placeholder={placeholder} autoComplete={autoComplete} dir={["email", "tel", "url"].includes(type) ? "ltr" : undefined} />}
      {error && <p id={`${field}-error`} className="mt-2 break-words text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function ApplyPage() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const stepLabels = [t("البيانات الشخصية", "Personal details"), t("بيانات الشركة", "Company details"), t("الأهداف والدوافع", "Goals and motivation")];
  const [currentStep, setCurrentStep] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState<ApplicationForm>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const inFlight = useRef(false);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);
  const focusStep = useRef(false);

  useEffect(() => {
    try {
      setFormData(restoreDraft(sessionStorage.getItem(APPLY_FORM_SESSION_KEY)));
    } catch { /* Continue with in-memory form data when browser storage is unavailable. */ }
    setDraftReady(true);
  }, []);

  useEffect(() => {
    if (!draftReady || submitted) return;
    try { sessionStorage.setItem(APPLY_FORM_SESSION_KEY, JSON.stringify(formData)); }
    catch { /* Storage is optional; submission still uses the in-memory draft. */ }
  }, [draftReady, formData, submitted]);

  useEffect(() => {
    if (submitError) errorSummary.current?.focus();
    else if (focusStep.current) stepTitle.current?.focus();
    focusStep.current = false;
  }, [currentStep, submitError]);

  function updateField(field: FormField, value: string) {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }
  function goToStep(step: number) {
    focusStep.current = true;
    setCurrentStep(step);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setSubmitError("");
    const validation = currentStep < 3 ? validateStep(currentStep, formData, ar) : {
      ...validateStep(1, formData, ar), ...validateStep(2, formData, ar), ...validateStep(3, formData, ar),
    };
    setErrors(validation);
    if (Object.keys(validation).length) {
      goToStep(firstErrorStep(validation));
      setSubmitError(t("يرجى مراجعة الحقول المعلّمة وتصحيحها.", "Review and correct the highlighted fields."));
      return;
    }
    if (currentStep < 3) { goToStep(currentStep + 1); return; }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, key === "bot_field" ? value : value.trim()]));
      await api.post("/applications", payload);
      setSubmitted(true);
      // Optional storage cleanup cannot turn an accepted application into an error.
      try {
        sessionStorage.removeItem(APPLY_FORM_SESSION_KEY);
      } catch { /* The server has already accepted the application. */ }
    } catch (err) {
      const mapped: FormErrors = {};
      if (err instanceof ApiError && err.data && typeof err.data === "object" && "errors" in err.data) {
        const serverErrors = (err.data as { errors?: unknown }).errors;
        if (serverErrors && typeof serverErrors === "object") {
          for (const [key, messages] of Object.entries(serverErrors)) {
            if (Object.hasOwn(initialFormData, key) && key !== "bot_field" && Array.isArray(messages) && typeof messages[0] === "string") mapped[key as FormField] = messages[0];
          }
        }
      }
      setErrors(mapped);
      if (Object.keys(mapped).length) {
        goToStep(firstErrorStep(mapped));
        setSubmitError(t("يرجى مراجعة الحقول المعلّمة وتصحيحها.", "Review and correct the highlighted fields."));
      } else {
        setSubmitError(t("تعذر إرسال الطلب. يرجى الانتظار قليلًا والمحاولة مرة أخرى.", "Could not submit your application. Please wait a moment and try again."));
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  const fieldProps = (field: FormField) => ({ field, value: formData[field], error: errors[field], onChange: updateField });

  if (submitted) return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="gateway-card mx-auto max-w-xl text-center" role="status">
          <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-[#3B52D4]" aria-hidden="true" />
          <h1 className="gateway-heading">{t("تم إرسال الطلب", "Application submitted")}</h1>
          <p className="gateway-lead mt-4">{t("شكرًا لك! استلمنا طلبك بنجاح. سيراجعه الفريق ويتواصل معك عبر بريدك الإلكتروني.", "Thank you! We received your application. The team will review it and contact you by email.")}</p>
          <p className="mt-3 break-all font-medium text-[#3B52D4]" dir="ltr">{formData.email}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="gateway-button flex-1">{t("العودة إلى الرئيسية", "Back to home")}</Link>
            <Link href="/founders" className="gateway-button-secondary flex-1">{t("استكشف المؤسسين", "Explore founders")}</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="gateway-eyebrow">{t("عضوية المجتمع", "COMMUNITY MEMBERSHIP")}</p>
            <h1 className="gateway-heading">{t("انضم إلى شبكة وصول", "Join the Wosool network")}</h1>
            <p className="gateway-lead mt-4">{t("نستقبل المؤسسين في مراحل مختلفة، من البدايات المبكرة حتى من أسسوا وباعوا شركاتهم سابقًا. تُراجع الطلبات بشكل مستمر.", "We welcome founders at every stage, from early ventures to those who have built and exited companies. Applications are reviewed on an ongoing basis.")}</p>
          </div>
          <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="min-w-0">
              <h2 className="text-2xl font-bold leading-relaxed">{t("من الذي نرحب به في المجتمع؟", "Who is the community for?")}</h2>
              <ul className="mt-6 space-y-4">
                {criteria.map(([arabic, english]) => <li key={english} className="flex gap-3 text-base leading-relaxed text-slate-600"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#3B52D4]" aria-hidden="true" /><span>{t(arabic, english)}</span></li>)}
              </ul>
              <div className="mt-8 rounded-2xl bg-[#EEF1FF] p-5 text-sm leading-relaxed text-slate-700">
                <h3 className="mb-2 font-bold">{t("ما يمكن توقعه", "What to expect")}</h3>
                <p>{t("يراجع الفريق طلبك وقد يتواصل معك لترتيب مكالمة تعريفية قصيرة. لا تنشئ هذه الخطوة حسابًا؛ سنشارك الخطوات التالية بعد مراجعة الطلب.", "The team reviews your application and may arrange a short introductory call. This step does not create an account; we will share the next steps after review.")}</p>
              </div>
            </aside>
            <form onSubmit={handleSubmit} noValidate className="gateway-card min-w-0" aria-busy={submitting}>
              <p className="text-sm font-medium text-slate-600" aria-live="polite">{t(`الخطوة ${currentStep} من 3`, `Step ${currentStep} of 3`)}</p>
              <ol className="my-5 grid grid-cols-3 gap-2" aria-label={t("خطوات الطلب", "Application steps")}>
                {stepLabels.map((label, index) => <li key={index} aria-current={currentStep === index + 1 ? "step" : undefined} className={`min-w-0 border-t-4 pt-2 text-xs leading-relaxed ${currentStep >= index + 1 ? "border-[#3B52D4] text-[#273A9E]" : "border-slate-200 text-slate-500"}`}>{label}</li>)}
              </ol>
              <h2 id="application-step-title" ref={stepTitle} tabIndex={-1} className="mb-2 text-xl font-bold leading-relaxed focus:outline-none">{stepLabels[currentStep - 1]}</h2>
              <p className="mb-5 text-sm text-slate-600">{t("الحقول المعلّمة بنجمة (*) مطلوبة.", "Fields marked with an asterisk (*) are required.")}</p>
              {submitError && <p ref={errorSummary} tabIndex={-1} className="gateway-error mb-5 break-words" role="alert">{submitError}</p>}
              <fieldset disabled={submitting || !draftReady} className="min-w-0 space-y-5 disabled:opacity-70">
                <legend className="sr-only">{stepLabels[currentStep - 1]}</legend>
                <input type="text" name="company_fax" tabIndex={-1} autoComplete="off" className="sr-only" value={formData.bot_field} onChange={(event) => updateField("bot_field", event.target.value)} aria-hidden="true" />
                {currentStep === 1 && <>
                  <ApplicationField {...fieldProps("full_name")} label={t("الاسم الكامل", "Full name")} required autoComplete="name" />
                  <ApplicationField {...fieldProps("email")} label={t("البريد الإلكتروني", "Email")} required type="email" autoComplete="email" placeholder="name@company.com" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ApplicationField {...fieldProps("phone")} label={t("رقم الهاتف", "Phone number")} required type="tel" autoComplete="tel" maxLength={50} placeholder="+966 5XX XXX XXXX" />
                    <ApplicationField {...fieldProps("location")} label={t("الموقع", "Location")} required autoComplete="address-level2" placeholder={t("الرياض، السعودية", "Riyadh, Saudi Arabia")} />
                  </div>
                  <ApplicationField {...fieldProps("linkedin_url")} label={t("رابط لينكدإن (اختياري)", "LinkedIn URL (optional)")} type="url" placeholder="https://linkedin.com/in/yourname" />
                </>}
                {currentStep === 2 && <>
                  <ApplicationField {...fieldProps("company_name")} label={t("اسم الشركة", "Company name")} required autoComplete="organization" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ApplicationField {...fieldProps("sector")} label={t("القطاع", "Sector")} required options={sectors.map(([arabic, english]) => ({ value: arabic, label: t(arabic, english) }))} />
                    <ApplicationField {...fieldProps("stage")} label={t("المرحلة", "Company stage")} required options={stages.map(([arabic, english]) => ({ value: english, label: t(arabic, english) }))} />
                  </div>
                  <ApplicationField {...fieldProps("company_website")} label={t("الموقع الإلكتروني (اختياري)", "Company website (optional)")} type="url" placeholder="https://yourcompany.com" />
                </>}
                {currentStep === 3 && <>
                  <ApplicationField {...fieldProps("motivation")} label={t("لماذا ترغب في الانضمام إلى وصول؟", "Why do you want to join Wosool?")} multiline required maxLength={2000} placeholder={t("أخبرنا بما تتطلع إليه من المجتمع…", "Tell us what you hope to gain from the community…")} />
                  <p className="text-end text-sm text-slate-500">{formData.motivation.length}/2000</p>
                  <ApplicationField {...fieldProps("what_you_offer")} label={t("ما الذي يمكنك تقديمه لبقية المؤسسين؟ (اختياري)", "What can you offer other founders? (optional)")} multiline maxLength={1000} />
                  <ApplicationField {...fieldProps("what_you_need")} label={t("ما أكثر ما تحتاج إليه الآن؟ (اختياري)", "What do you need most right now? (optional)")} multiline maxLength={1000} />
                  <ApplicationField {...fieldProps("referral_source")} label={t("كيف سمعت عن وصول؟ (اختياري)", "How did you hear about Wosool? (optional)")} />
                  <ApplicationField {...fieldProps("referrer_name")} label={t("اسم من أحالك إلينا (اختياري)", "Who referred you? (optional)")} />
                </>}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  {currentStep > 1 && <button type="button" className="gateway-button-secondary sm:flex-1" onClick={() => { setSubmitError(""); goToStep(currentStep - 1); }}>{t("رجوع", "Back")}</button>}
                  <button type="submit" className="gateway-button sm:flex-1">{submitting ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />{t("جارٍ الإرسال…", "Submitting…")}</> : currentStep === 3 ? t("إرسال الطلب", "Submit application") : t("متابعة", "Continue")}</button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </section>
      <section className="gateway-section bg-[#F5F7FF]">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-2xl font-bold">{t("أسئلة متكررة", "Frequently asked questions")}</h2>
          <div className="space-y-3">
            {faqs.map(([questionAr, questionEn, answerAr, answerEn], index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <h3><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex min-h-11 w-full items-center justify-between gap-4 p-5 text-start font-bold" aria-expanded={openFaq === index} aria-controls={`application-faq-${index}`}><span>{t(questionAr, questionEn)}</span>{openFaq === index ? <ChevronUp size={20} className="shrink-0" aria-hidden="true" /> : <ChevronDown size={20} className="shrink-0" aria-hidden="true" />}</button></h3>
              <p id={`application-faq-${index}`} hidden={openFaq !== index} className="border-t border-slate-100 p-5 text-base leading-relaxed text-slate-600">{t(answerAr, answerEn)}</p>
            </div>)}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
