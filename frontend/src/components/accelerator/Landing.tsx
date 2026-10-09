"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  BookOpen,
  Users,
  Target,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PartnerStrip } from "./PartnerStrip";
import { useLocale } from "@/lib/locale";
import { api } from "@/lib/api";
import { gatewayError, type GatewaySettings } from "@/lib/gateway";

export function Landing({ home = false }: { home?: boolean }) {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api
      .get<{ data: GatewaySettings }>("/accelerator")
      .then((r) => setSettings(r.data))
      .catch(() => {});
  }, []);
  const text = (a: string, e: string) => (ar ? a : e);
  async function assess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult("");
    const form = new FormData(event.currentTarget);
    try {
      const r = await api.post<{ data: { result: string } }>(
        "/accelerator/eligibility",
        {
          annual_revenue_usd: Number(form.get("revenue")),
          private_funding_usd: Number(form.get("funding") || 0),
          venture_backed: form.get("venture") === "on",
          is_owner: form.get("owner") === "on",
          is_operating: form.get("operating") === "on",
        },
      );
      setResult(r.data.result);
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicLayout>
      <section className="gateway-hero px-5 py-16 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="gateway-eyebrow">
              {text(
                "وصول • من الطموح إلى النمو",
                "WOSOOL • AMBITION INTO GROWTH",
              )}
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.3] tracking-tight text-slate-950 sm:text-6xl">
              {home
                ? text("خطوتك التالية نحو", "Your next chapter of")
                : "EO Riyadh"}
              <br />
              <span className="text-[#3B52D4]">
                {home
                  ? text("نموّ أعمالك.", "business growth.")
                  : "Accelerator"}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-9 text-slate-600">
              {text(
                "اكتشف EO Accelerator، قيّم جاهزيتك، وابدأ طلبك عبر وصول. رحلة واضحة للمؤسس، ومجتمع يدعم التعلّم والنمو.",
                "Discover EO Accelerator, assess your readiness, and start your application through Wosool. A clear path for founders who are ready to learn and grow.",
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="gateway-button" href="/accelerator/apply">
                {text("قدّم إلى EO Accelerator", "Apply to EO Accelerator")}
                <ArrowUpRight size={18} />
              </Link>
              <Link className="gateway-button-secondary" href="/opportunities">
                {text(
                  "استكشف فرص ريادة الأعمال",
                  "Explore Entrepreneurship Opportunities",
                )}
              </Link>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500">
              {text(
                "وصول بوابة محلية للاكتشاف واستقبال الطلبات. يخضع الالتحاق لمراجعة EO وإجراءاته الرسمية؛ تقديم الطلب لا يضمن القبول.",
                "Wosool supports local discovery and application review. Enrolment remains subject to EO’s official process and approval; applying does not guarantee acceptance.",
              )}
            </p>
          </div>
          <div className="rounded-3xl bg-[#101b37] p-7 text-white shadow-xl sm:p-9">
            <div className="flex items-center justify-between border-b border-white/15 pb-6">
              <span className="text-sm tracking-widest text-indigo-200">
                EO ACCELERATOR
              </span>
              <Compass className="h-7 w-7 text-indigo-300" />
            </div>
            <h2 className="mt-7 text-2xl font-semibold leading-relaxed">
              {text(
                "طموح عالمي. خطوة محلية.",
                "Global ambition. A local first step.",
              )}
            </h2>
            <ol className="mt-8 space-y-6">
              {[
                [
                  text("اكتشف البرنامج", "Discover the program"),
                  text(
                    "افهم التجربة ومعايير الملاءمة",
                    "Understand the experience and fit",
                  ),
                ],
                [
                  text("جهّز ملفك", "Build your profile"),
                  text(
                    "معلوماتك وبيانات شركتك في مكان واحد",
                    "Your founder and company story in one place",
                  ),
                ],
                [
                  text("قدّم وتابع", "Apply and follow progress"),
                  text(
                    "احفظ طلبك وتابع المراجعة والخطوات التالية",
                    "Save your application and track next steps",
                  ),
                ],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 text-sm text-indigo-200">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/accelerator#eligibility"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-indigo-200"
            >
              {text(
                "تحقق من الملاءمة الأولية",
                "Check your initial eligibility",
              )}{" "}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <PartnerStrip />
      <section className="gateway-section">
        <div className="mx-auto max-w-6xl">
          <p className="gateway-eyebrow">
            {text("التعلّم عبر التطبيق", "LEARN THROUGH ACTION")}
          </p>
          <h2 className="gateway-heading">
            {text(
              "مساحة لتطوير المؤسس والشركة.",
              "Build the founder. Grow the business.",
            )}
          </h2>
          <p className="gateway-lead">
            {text(
              "يجمع البرنامج العالمي بين التعلّم المنظّم، وتبادل الخبرات، والمساءلة الدورية. يتناول المنهج أربعة محاور مترابطة.",
              "The global program combines structured learning, peer experience, and regular accountability across four connected pillars.",
            )}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [
                BookOpen,
                text("الاستراتيجية", "Strategy"),
                text(
                  "حدد أولويات النمو وقيمة شركتك.",
                  "Clarify growth priorities and your company’s value.",
                ),
              ],
              [
                Users,
                text("الأفراد", "People"),
                text(
                  "طوّر فريقك وممارسات القيادة.",
                  "Develop your team and leadership practices.",
                ),
              ],
              [
                Target,
                text("التنفيذ", "Execution"),
                text(
                  "حوّل الأولويات إلى عمل قابل للقياس.",
                  "Turn priorities into measurable action.",
                ),
              ],
              [
                Compass,
                text("النقد", "Cash"),
                text(
                  "افهم محركات السيولة وقرارات النمو.",
                  "Understand cash drivers and growth decisions.",
                ),
              ],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof BookOpen;
              return (
                <article key={String(title)} className="gateway-card">
                  <I className="mb-6 text-[#3B52D4]" size={25} />
                  <h3 className="text-xl font-bold">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {String(body)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section
        id="eligibility"
        className="gateway-section scroll-mt-24 bg-[#f0f3fc]"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <p className="gateway-eyebrow">
              {text("هل يناسبك البرنامج؟", "IS IT THE RIGHT FIT?")}
            </p>
            <h2 className="gateway-heading">
              {text("ابدأ بفحص الملاءمة.", "Start with an eligibility check.")}
            </h2>
            <p className="gateway-lead">
              {text(
                `للمالك أو المؤسس لشركة قائمة بإيرادات سنوية إجمالية بين ${(settings?.min_revenue_usd ?? 250000).toLocaleString("en-US")} و${(settings?.max_revenue_usd ?? 999999).toLocaleString("en-US")} دولار أمريكي. راجع شروط EO للمسارات المتاحة.`,
                `For owners or founders of operating businesses with gross annual revenue from US$${(settings?.min_revenue_usd ?? 250000).toLocaleString("en-US")} to US$${(settings?.max_revenue_usd ?? 999999).toLocaleString("en-US")}. Refer to EO’s criteria for available eligibility routes.`,
              )}
            </p>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              {text(
                "هذه أداة إرشادية وليست قرار قبول. تُراجع المعلومات قبل اتخاذ القرار، ويمكنك تقديم طلب للمناقشة إذا لم تتطابق الأرقام مع النطاق.",
                "This is guidance, not an admission decision. Information is reviewed before a decision; you can apply for discussion if your figures fall outside the range.",
              )}
            </p>
            <a
              href="https://eonetwork.org/accelerator/faqs/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block font-semibold text-[#3B52D4]"
            >
              {text("الشروط الرسمية لدى EO ↗", "Official EO criteria ↗")}
            </a>
            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="font-bold">
                  {text("رسوم البرنامج العالمي", "Global program fee")}
                </dt>
                <dd className="mt-1 leading-7">
                  {settings
                    ? settings.global_fee_usd != null
                      ? `US$${settings.global_fee_usd.toLocaleString()}`
                      : text("لم يُعلن", "Not announced")
                    : "US$1,750"}{" "}
                  {text(
                    "سنويًا، إضافة إلى الرسوم المحلية. تُؤكد الرسوم قبل الالتحاق.",
                    "per year, plus local fees. Fees are reconfirmed before enrolment.",
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-bold">
                  {text("رسوم ومواعيد الرياض", "Riyadh fees and dates")}
                </dt>
                <dd className="mt-1">
                  {settings?.local_fee || text("لم تُعلن", "Not announced")} ·{" "}
                  {settings?.local_dates || text("لم تُعلن", "Not announced")}
                </dd>
              </div>
            </dl>
          </div>
          <form onSubmit={assess} className="gateway-card space-y-5">
            <h3 className="text-xl font-bold">
              {text("تقييم أولي", "Initial assessment")}
            </h3>
            <label className="gateway-label">
              {text(
                "الإيراد السنوي الإجمالي بالدولار الأمريكي",
                "Gross annual revenue in US dollars",
              )}
              <input
                className="gateway-input"
                name="revenue"
                type="number"
                min="0"
                max="999999999999"
                required
                step="0.01"
              />
            </label>
            <label className="gateway-label">
              {text(
                "التمويل الخاص الذي جُمع بالدولار (إن وجد)",
                "Private funding raised in US dollars (if applicable)",
              )}
              <input
                className="gateway-input"
                name="funding"
                type="number"
                min="0"
                max="999999999999"
                step="0.01"
              />
            </label>
            {[
              [
                "owner",
                text("أنا مالك أو مؤسس للشركة", "I am an owner or founder"),
              ],
              [
                "operating",
                text("الشركة قائمة وتعمل حاليًا", "The business is operating"),
              ],
              [
                "venture",
                text(
                  "الشركة مدعومة برأس مال جريء",
                  "The company is venture-backed",
                ),
              ],
            ].map(([name, title]) => (
              <label
                key={name}
                className="flex items-start gap-3 text-sm leading-6"
              >
                <input
                  type="checkbox"
                  name={name}
                  className="mt-1 h-4 w-4 accent-[#3B52D4]"
                />
                {title}
              </label>
            ))}
            <button className="gateway-button w-full" disabled={busy}>
              {busy
                ? text("جارٍ التقييم…", "Checking…")
                : text("تحقق من الملاءمة", "Check eligibility")}
            </button>
            {error && (
              <p role="alert" className="gateway-error">
                {error}
              </p>
            )}
            {result && (
              <div
                role="status"
                className="rounded-xl bg-indigo-50 p-4 text-sm leading-7"
              >
                {result === "potentially_eligible"
                  ? text(
                      "تبدو بياناتك متوافقة مبدئيًا. الخطوة التالية: إنشاء الحساب وتجهيز الطلب.",
                      "Your figures indicate potential eligibility. Next: create your account and prepare an application.",
                    )
                  : text(
                      "تحتاج حالتك إلى مناقشة مع فريق البرنامج. يمكنك تقديم بياناتك للمراجعة أو استكشاف فرص أخرى.",
                      "Your circumstances need discussion with the program team. You can submit your details for review or explore other opportunities.",
                    )}
                <Link
                  className="mt-3 block font-bold text-[#3B52D4]"
                  href="/accelerator/apply"
                >
                  {text("ابدأ طلبك", "Start your application")} ↗
                </Link>
              </div>
            )}
          </form>
        </div>
      </section>
      <section className="gateway-section">
        <div className="mx-auto max-w-6xl">
          <h2 className="gateway-heading">
            {text(
              "من الاكتشاف إلى المشاركة",
              "From discovery to participation",
            )}
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              text(
                "أنشئ حسابك وأكّد البريد، ثم أكمل ملف المؤسس والشركة.",
                "Create and verify your account, then complete your founder and company profiles.",
              ),
              text(
                "احفظ طلبك أثناء الإعداد. أرسله وتابع حالته أو استكمل المعلومات المطلوبة.",
                "Save as you prepare. Submit, track review, and respond to information requests.",
              ),
              text(
                "عند القبول، أكمل خطوات الانضمام واطّلع على الجلسات والموارد المتاحة لك.",
                "If accepted, complete onboarding and access your scheduled sessions and resources.",
              ),
            ].map((item, i) => (
              <article key={item} className="gateway-card">
                <span className="text-sm font-bold text-[#3B52D4]">
                  0{i + 1}
                </span>
                <p className="mt-4 leading-8">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="gateway-section border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="gateway-heading">
            {text("أسئلة شائعة", "A few things to know")}
          </h2>
          {[
            [
              text("ما علاقة وصول بـ EO؟", "How does Wosool relate to EO?"),
              text(
                "تسهّل وصول الاكتشاف واستقبال الطلبات والمراجعة المحلية لبرنامج EO Riyadh Accelerator. لا تحل محل أنظمة EO العالمية ولا تمنح العضوية أو القبول تلقائيًا.",
                "Wosool supports discovery, application intake, and local review for EO Riyadh Accelerator. It does not replace EO’s global systems or automatically grant admission or membership.",
              ),
            ],
            [
              text(
                "ماذا يشمل التعلّم؟",
                "What does the learning experience include?",
              ),
              text(
                "تصف EO البرنامج بأنه رحلة تعلّم لسنتين تتضمن أربعة أيام تعلّم ربع سنوية ومجموعات مساءلة شهرية. جدول الرياض المحلي يُؤكد عند إعلانه.",
                "EO describes a two-year learning program with four quarterly full-day learning events and monthly accountability groups. Riyadh’s local schedule will be confirmed when announced.",
              ),
            ],
            [
              text("هل يتضمن تمويلًا مضمونًا؟", "Is funding guaranteed?"),
              text(
                "لا. يركز EO Accelerator على التعلّم والنمو والمساءلة؛ لا يعد التقديم التزامًا بالاستثمار أو التمويل.",
                "No. EO Accelerator focuses on learning, growth, and accountability. An application is not an investment or funding commitment.",
              ),
            ],
            [
              text("هل يمكنني حفظ الطلب؟", "Can I save and return later?"),
              text(
                "نعم. بعد تأكيد البريد، تُحفظ المسودة في حسابك ويمكنك العودة لإكمالها. راقب مؤشر الحفظ قبل إغلاق الصفحة.",
                "Yes. After email verification, your draft is saved to your account. Check the save indicator before leaving the page.",
              ),
            ],
          ].map(([q, a]) => (
            <details key={q} className="border-b border-slate-200 py-6">
              <summary className="cursor-pointer text-lg font-semibold">
                {q}
              </summary>
              <p className="mt-4 leading-8 text-slate-600">{a}</p>
            </details>
          ))}
          <p className="mt-6 text-xs leading-6 text-slate-500">
            {text(
              "مرجع المعلومات: EO Accelerator — مراجعة 8 أكتوبر 2026. قد تتغير الشروط قبل الالتحاق.",
              "Source: EO Accelerator — reviewed 8 October 2026. Criteria may change before enrolment.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="gateway-button" href="/accelerator/apply">
              <Check size={18} />
              {text("ابدأ رحلتك", "Start your journey")}
            </Link>
            <Link className="gateway-button-secondary" href="/contact">
              {text("تواصل معنا", "Contact Wosool")}
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
