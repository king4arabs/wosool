"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/lib/auth";
import { useLocale } from "@/lib/locale";
import { api, ApiError } from "@/lib/api";
import {
  gatewayError,
  label,
  safeWebUrl,
  type Application,
  type Payload,
  type GatewaySettings,
} from "@/lib/gateway";

function AccountForm({
  ar,
  onReady,
  available,
}: {
  ar: boolean;
  available: boolean;
  onReady: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const data = Object.fromEntries(f.entries());
      await api.post(
        mode === "register" ? "/auth/applicant-register" : "/auth/login",
        { ...data, consent: f.get("consent") === "on" },
      );
      await onReady();
    } catch (err) {
      setError(gatewayError(err, ar));
    } finally {
      setBusy(false);
    }
  }
  const t = (a: string, e: string) => (ar ? a : e);
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex gap-3">
        <button
          className={
            mode === "register" ? "gateway-button" : "gateway-button-secondary"
          }
          onClick={() => setMode("register")}
        >
          {t("حساب جديد", "Create account")}
        </button>
        <button
          className={
            mode === "login" ? "gateway-button" : "gateway-button-secondary"
          }
          onClick={() => setMode("login")}
        >
          {t("تسجيل الدخول", "Sign in")}
        </button>
      </div>
      {!available && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-indigo-50 p-4 text-sm leading-7"
        >
          {t(
            "استقبال الحسابات والطلبات الجديدة غير متاح حاليًا. يمكنك الدخول لمتابعة طلب قائم أو استكشاف الفرص.",
            "New account and application intake is currently unavailable. You can sign in to follow an existing application or explore opportunities.",
          )}
        </p>
      )}
      <form onSubmit={submit} className="gateway-card space-y-5">
        <h2 className="text-2xl font-bold">
          {t("حسابك، وخطوتك الأولى", "Your account. Your first step.")}
        </h2>
        {mode === "register" && (
          <label className="gateway-label">
            {t("الاسم الكامل", "Full name")}
            <input
              name="name"
              className="gateway-input"
              required
              autoComplete="name"
              maxLength={255}
            />
          </label>
        )}
        <label className="gateway-label">
          {t("البريد الإلكتروني", "Email")}
          <input
            name="email"
            className="gateway-input"
            type="email"
            dir="ltr"
            required
            autoComplete="email"
          />
        </label>
        <label className="gateway-label">
          {t("كلمة المرور", "Password")}
          <input
            name="password"
            className="gateway-input"
            type="password"
            required
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            minLength={mode === "register" ? 12 : 1}
          />
        </label>
        {mode === "register" && (
          <>
            <p className="text-xs leading-6 text-slate-600">
              {t(
                "١٢ حرفًا على الأقل، منها أحرف إنجليزية كبيرة وصغيرة وأرقام.",
                "At least 12 characters, with uppercase and lowercase letters and numbers.",
              )}
            </p>
            <label className="gateway-label">
              {t("تأكيد كلمة المرور", "Confirm password")}
              <input
                name="password_confirmation"
                className="gateway-input"
                type="password"
                required
                autoComplete="new-password"
                minLength={12}
              />
            </label>
            <label className="flex gap-3 text-sm leading-7">
              <input
                name="consent"
                type="checkbox"
                required
                className="mt-2 shrink-0"
              />
              <span>
                {t(
                  "أوافق على معالجة بيانات الحساب والطلب لأغراض التقييم والتواصل التشغيلي وفق",
                  "I consent to account and application processing for review and operational communications under the",
                )}{" "}
                <Link href="/privacy" className="underline">
                  {t("إشعار الخصوصية", "privacy notice")}
                </Link>
                .
              </span>
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="gateway-error">
            {error}
          </p>
        )}
        <button
          disabled={busy || (mode === "register" && !available)}
          className="gateway-button w-full"
        >
          {busy
            ? t("يرجى الانتظار…", "Please wait…")
            : mode === "register"
              ? t(
                  "إنشاء حساب وإرسال رابط التأكيد",
                  "Create account and verify email",
                )
              : t("الدخول", "Sign in")}
        </button>
        <Link className="block text-sm text-[#3B52D4]" href="/forgot-password">
          {t("نسيت كلمة المرور؟", "Forgot password?")}
        </Link>
      </form>
    </div>
  );
}

const steps = [
  ["المؤسس", "Founder"],
  ["الشركة", "Company"],
  ["الأعمال والملاءمة", "Business & eligibility"],
  ["الأهداف والمراجعة", "Goals & review"],
];
export function ApplicationWorkspace() {
  const { user, isLoading, refresh } = useAuth();
  const { locale } = useLocale();
  const ar = locale === "ar";
  const t = (a: string, e: string) => (ar ? a : e);
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  useEffect(() => {
    api
      .get<{ data: GatewaySettings }>("/accelerator")
      .then((r) => setSettings(r.data))
      .catch(() => {});
  }, []);
  const [application, setApplication] = useState<Application | null>(null);
  const [payload, setPayload] = useState<Payload>({});
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("{}");
  const revision = useRef(0);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const conflict = useRef(false);
  const authUser = user as typeof user & {
    email_verified_at?: string;
    is_accelerator_applicant?: boolean;
  };
  const verified = !!authUser?.email_verified_at;
  const editable =
    !application ||
    ["draft", "information_requested"].includes(application.status);
  const changed = JSON.stringify(payload) !== saved;
  const reload = useCallback(async () => {
    setError("");
    setLoaded(false);
    try {
      const r = await api.get<{ data: Application | null }>(
        "/applicant/application",
      );
      setApplication(r.data);
      const p = r.data?.gateway_payload || {};
      setPayload(p);
      setSaved(JSON.stringify(p));
      revision.current = r.data?.revision || 0;
      conflict.current = false;
      setLoaded(true);
    } catch {
      setError(
        "تعذر تحميل الطلب. حاول مجددًا. / Could not load your application. Please retry.",
      );
    }
  }, []);
  useEffect(() => {
    if (verified) void reload();
  }, [verified, reload]);
  const save = useCallback(
    (snapshot: Payload) => {
      const task = chain.current
        .catch(() => {})
        .then(async () => {
          if (conflict.current) throw new Error("Reload required");
          setSaving(true);
          try {
            const r = await api.put<{ data: Application }>(
              "/applicant/application",
              { revision: revision.current, payload: snapshot },
            );
            revision.current = r.data.revision;
            setApplication(r.data);
            setSaved(JSON.stringify(snapshot));
            setError("");
          } catch (e) {
            if (e instanceof ApiError && e.status === 409)
              conflict.current = true;
            setError(gatewayError(e, ar));
            throw e;
          } finally {
            setSaving(false);
          }
        });
      chain.current = task;
      return task;
    },
    [ar],
  );
  useEffect(() => {
    if (!loaded || !editable || !changed || busy || conflict.current) return;
    const timer = setTimeout(() => {
      void save(payload).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [payload, loaded, editable, changed, busy, save]);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (changed || saving) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [changed, saving]);
  function field<K extends keyof Payload>(key: K, value: Payload[K]) {
    setPayload((p) => ({ ...p, [key]: value }));
  }
  async function action(kind: "submit" | "onboard") {
    setBusy(true);
    setError("");
    try {
      if (kind === "submit") await save(payload);
      const r = await api.post<{ data: Application }>(
        `/applicant/application/${kind}`,
        { revision: revision.current, acknowledged: true },
      );
      setApplication(r.data);
      revision.current = r.data.revision;
      setNote(
        t(
          "تم تأكيد العملية وحفظها.",
          "Your action has been confirmed and saved.",
        ),
      );
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/email/resend");
      setNote(
        t(
          "تم طلب إرسال الرابط. تحقق من البريد ومجلد الرسائل غير المرغوبة.",
          "Verification requested. Check your inbox and spam folder.",
        ),
      );
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  async function privacy(type: string) {
    setBusy(true);
    setError("");
    try {
      await api.post("/applicant/privacy-requests", { type });
      setNote(
        t(
          "استلمنا طلبك للمراجعة.",
          "Your privacy request has been received for review.",
        ),
      );
    } catch (e) {
      setError(gatewayError(e, ar));
    } finally {
      setBusy(false);
    }
  }
  function input(
    key: keyof Payload,
    title: string,
    type = "text",
    required = true,
  ) {
    return (
      <label className="gateway-label" key={key}>
        {title}
        {required ? " *" : ""}
        <input
          className="gateway-input"
          value={String(payload[key] ?? "")}
          type={type}
          required={required}
          min={type === "number" ? 0 : undefined}
          max={type === "number" ? 999999999999 : undefined}
          maxLength={type === "text" ? 255 : undefined}
          onChange={(e) =>
            field(
              key,
              type === "number"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
        />
      </label>
    );
  }
  function textarea(key: keyof Payload, title: string) {
    return (
      <label className="gateway-label" key={key}>
        {title} *
        <textarea
          className="gateway-input"
          rows={4}
          required
          maxLength={key === "founder_bio" ? 2000 : 3000}
          value={String(payload[key] ?? "")}
          onChange={(e) => field(key, e.target.value)}
        />
      </label>
    );
  }
  function checkbox(key: keyof Payload, title: string) {
    return (
      <label className="flex items-start gap-3 text-sm leading-7" key={key}>
        <input
          type="checkbox"
          className="mt-2 h-4 w-4 shrink-0 accent-[#3B52D4]"
          checked={!!payload[key]}
          onChange={(e) => field(key, e.target.checked)}
        />
        {title}
      </label>
    );
  }
  return (
    <PublicLayout>
      <section className="gateway-section">
        <div className="mx-auto max-w-5xl">
          <p className="gateway-eyebrow">EO RIYADH ACCELERATOR</p>
          <h1 className="gateway-heading">
            {t("طلبك، خطوة بخطوة.", "Your application, step by step.")}
          </h1>
          <p className="gateway-lead mb-9">
            {t(
              "هذا طلب للمراجعة المحلية عبر وصول. القبول وإجراءات EO الرسمية تُؤكد لاحقًا من فريق البرنامج.",
              "This application supports local review through Wosool. Admission and EO’s official enrolment steps are confirmed separately by the program team.",
            )}
          </p>
          {isLoading ? (
            <p role="status">
              {t("جارٍ تحميل حسابك…", "Loading your account…")}
            </p>
          ) : !user ? (
            <AccountForm
              ar={ar}
              onReady={refresh}
              available={!!settings?.configured && !!settings?.intake_enabled}
            />
          ) : !verified ? (
            <div className="gateway-card max-w-xl space-y-5">
              <h2 className="text-xl font-bold">
                {t("أكّد بريدك الإلكتروني أولًا", "Verify your email first")}
              </h2>
              <p className="leading-8">
                {t(
                  "افتح رابط التأكيد المرسل إلى",
                  "Open the verification link sent to",
                )}{" "}
                <bdi>{user.email}</bdi>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="gateway-button"
                  disabled={busy}
                  onClick={resend}
                >
                  {t("إعادة إرسال الرابط", "Resend verification")}
                </button>
                <button
                  className="gateway-button-secondary"
                  onClick={() => void refresh()}
                >
                  {t("تحققت من البريد", "I have verified")}
                </button>
              </div>
            </div>
          ) : !loaded ? (
            <div className="gateway-card">
              <p>
                {error || t("جارٍ تحميل طلبك…", "Loading your application…")}
              </p>
              <button
                className="gateway-button-secondary mt-4"
                onClick={() => void reload()}
              >
                {t("إعادة المحاولة", "Retry")}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <span className="gateway-badge">
                  {label(application?.status || "draft", ar)}
                </span>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm text-slate-600"
                >
                  {saving
                    ? t("جارٍ الحفظ…", "Saving…")
                    : changed
                      ? t("تغييرات لم تُحفظ بعد", "Unsaved changes")
                      : t("جميع التغييرات محفوظة", "All changes saved")}
                </p>
              </div>
              {editable && !settings?.intake_enabled && (
                <p
                  role="status"
                  className="mb-5 rounded-xl bg-indigo-50 p-4 text-sm leading-7"
                >
                  {t(
                    "استقبال الطلبات متوقف حاليًا. سيظهر خيار الإرسال عند فتح التقديم.",
                    "Application intake is paused. Submission will become available when intake opens.",
                  )}
                </p>
              )}
              {editable && (
                <div className="gateway-card">
                  <nav
                    aria-label={t("خطوات الطلب", "Application steps")}
                    className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4"
                  >
                    {steps.map((s, i) => (
                      <button
                        key={s[1]}
                        aria-current={step === i ? "step" : undefined}
                        className={`rounded-lg border p-3 text-sm font-semibold ${step === i ? "border-[#3B52D4] bg-indigo-50 text-[#3B52D4]" : "border-slate-200"}`}
                        onClick={() => setStep(i)}
                      >
                        {i + 1}. {s[ar ? 0 : 1]}
                      </button>
                    ))}
                  </nav>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (step < 3) setStep(step + 1);
                      else void action("submit");
                    }}
                    className="space-y-5"
                  >
                    <p className="text-sm text-slate-500">
                      {t(
                        "الحقول المعلّمة بنجمة مطلوبة عند الإرسال.",
                        "Fields marked * are required when submitting.",
                      )}
                    </p>
                    {step === 0 && (
                      <>
                        {input(
                          "founder_role",
                          t("صفتك في الشركة", "Your role in the company"),
                        )}
                        {input("city", t("المدينة", "City"))}
                        {textarea(
                          "founder_bio",
                          t(
                            "نبذة عنك وخبرتك",
                            "Your background and experience",
                          ),
                        )}
                      </>
                    )}
                    {step === 1 && (
                      <>
                        {input("company_name", t("اسم الشركة", "Company name"))}
                        {textarea(
                          "company_description",
                          t(
                            "ما الذي تقدمه الشركة؟",
                            "What does the company do?",
                          ),
                        )}
                        {input(
                          "company_website",
                          t(
                            "الموقع الرسمي (https://)",
                            "Official website (https://)",
                          ),
                          "url",
                          false,
                        )}
                        {input("sector", t("القطاع", "Sector"))}
                        <label className="gateway-label">
                          {t("مرحلة الشركة", "Company stage")} *
                          <select
                            className="gateway-input"
                            required
                            value={payload.company_stage || ""}
                            onChange={(e) =>
                              field("company_stage", e.target.value)
                            }
                          >
                            <option value="">
                              {t("اختر المرحلة", "Select stage")}
                            </option>
                            {[
                              ["pre-seed", "ما قبل البذرة", "Pre-seed"],
                              ["seed", "البذرة", "Seed"],
                              ["series-a", "السلسلة أ", "Series A"],
                              ["growth", "النمو", "Growth"],
                              ["established", "شركة قائمة", "Established"],
                            ].map(([v, a, e]) => (
                              <option key={v} value={v}>
                                {t(a, e)}
                              </option>
                            ))}
                          </select>
                        </label>
                        {input(
                          "team_size",
                          t("عدد أفراد الفريق", "Team size"),
                          "number",
                        )}
                      </>
                    )}
                    {step === 2 && (
                      <>
                        {input(
                          "annual_revenue_usd",
                          t(
                            "الإيراد السنوي الإجمالي بالدولار الأمريكي",
                            "Gross annual revenue in US dollars",
                          ),
                          "number",
                        )}
                        {input(
                          "private_funding_usd",
                          t(
                            "التمويل الخاص بالدولار (إن وجد)",
                            "Private funding in US dollars (if applicable)",
                          ),
                          "number",
                          false,
                        )}
                        {checkbox(
                          "is_owner",
                          t(
                            "أنا مالك أو مؤسس للشركة *",
                            "I am an owner or founder *",
                          ),
                        )}
                        {checkbox(
                          "is_operating",
                          t(
                            "الشركة قائمة وتعمل حاليًا *",
                            "The business is operating *",
                          ),
                        )}
                        {checkbox(
                          "venture_backed",
                          t(
                            "الشركة مدعومة برأس مال جريء",
                            "The company is venture-backed",
                          ),
                        )}
                        <p className="text-sm leading-7 text-slate-500">
                          {t(
                            "يُقيّم الفريق الملاءمة. لا نطلب وثائق هوية أو حسابات بنكية في هذه المرحلة.",
                            "The team will assess fit. Identity documents and bank details are not requested at this stage.",
                          )}
                        </p>
                      </>
                    )}
                    {step === 3 && (
                      <>
                        {textarea(
                          "motivation",
                          t(
                            "لماذا ترغب في الانضمام؟",
                            "Why would you like to join?",
                          ),
                        )}
                        {textarea(
                          "current_challenge",
                          t(
                            "ما التحدي الرئيسي؟",
                            "What is your main challenge?",
                          ),
                        )}
                        {textarea(
                          "expected_outcome",
                          t(
                            "ما النتيجة التي تسعى إليها؟",
                            "What outcome are you working toward?",
                          ),
                        )}
                        <div className="rounded-xl bg-slate-50 p-5 text-sm leading-8">
                          <h3 className="font-bold">
                            {t("راجع بياناتك", "Review your details")}
                          </h3>
                          <p>
                            {payload.company_name} · {payload.city} ·{" "}
                            {payload.sector}
                          </p>
                          <p>
                            {t(
                              "الإيراد السنوي بالدولار:",
                              "Annual revenue in USD:",
                            )}{" "}
                            {payload.annual_revenue_usd}
                          </p>
                        </div>
                        {checkbox(
                          "availability_confirmed",
                          t(
                            "أستطيع الالتزام بالتعلّم والجلسات بعد تأكيد الجدول *",
                            "I can commit to learning and sessions once the schedule is confirmed *",
                          ),
                        )}
                        {checkbox(
                          "consent",
                          t(
                            "أوافق على معالجة بيانات الطلب ومشاركتها مع مراجعي البرنامج المخوّلين لغرض التقييم والتواصل بشأنه، وفق إشعار الخصوصية. *",
                            "I consent to application processing and sharing with authorized program reviewers for evaluation and related communications, under the privacy notice. *",
                          ),
                        )}
                        <Link href="/privacy" className="text-sm underline">
                          {t("قراءة إشعار الخصوصية", "Read the privacy notice")}
                        </Link>
                      </>
                    )}
                    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                      {step > 0 && (
                        <button
                          type="button"
                          className="gateway-button-secondary"
                          onClick={() => setStep(step - 1)}
                        >
                          {t("السابق", "Back")}
                        </button>
                      )}
                      <button
                        type="button"
                        className="gateway-button-secondary"
                        disabled={busy || saving || conflict.current}
                        onClick={() => void save(payload).catch(() => {})}
                      >
                        {t("حفظ المسودة", "Save draft")}
                      </button>
                      <button
                        className="gateway-button"
                        disabled={
                          busy ||
                          conflict.current ||
                          (step === 3 && !settings?.intake_enabled)
                        }
                      >
                        {busy
                          ? t("يرجى الانتظار…", "Please wait…")
                          : step === 3
                            ? t("تأكيد وإرسال الطلب", "Confirm and submit")
                            : t("التالي", "Continue")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {application && (
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <section className="gateway-card">
                    <h2 className="text-xl font-bold">
                      {t("التحديثات والمراسلات", "Updates and communications")}
                    </h2>
                    {application.events.length === 0 ? (
                      <p className="mt-5 text-sm text-slate-600">
                        {t(
                          "تظهر التحديثات هنا بعد إرسال الطلب.",
                          "Updates will appear here after submission.",
                        )}
                      </p>
                    ) : (
                      <ol className="mt-5 space-y-5">
                        {application.events.map((e) => (
                          <li
                            key={e.id}
                            className="border-s-2 border-indigo-200 ps-4"
                          >
                            <h3 className="font-semibold">
                              {label(e.to_status, ar)}
                            </h3>
                            <time className="text-xs text-slate-500">
                              {new Date(e.created_at).toLocaleString(
                                ar ? "ar-SA" : "en-GB",
                                { timeZone: "Asia/Riyadh" },
                              )}
                            </time>
                            {e.message && (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
                                {e.message}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                  <section className="gateway-card">
                    <h2 className="text-xl font-bold">
                      {t("الخطوة التالية", "Your next step")}
                    </h2>
                    <p className="mt-4 text-sm leading-8">
                      {application.status === "information_requested"
                        ? t(
                            "راجع رسالة الفريق وأكمل المعلومات ثم أعد الإرسال.",
                            "Read the team’s request, update your information, then resubmit.",
                          )
                        : application.status === "accepted"
                          ? t(
                              "راجع تعليمات الفريق وأكّد جاهزيتك لبدء الانضمام.",
                              "Review the team’s instructions and confirm readiness to begin onboarding.",
                            )
                          : application.status === "onboarded"
                            ? t(
                                "تابع الجلسات والموارد المخصصة لك أدناه.",
                                "Follow your assigned sessions and resources below.",
                              )
                            : t(
                                "تابع هذه الصفحة للاطلاع على المراجعة والتحديثات.",
                                "Check this page for review updates and required actions.",
                              )}
                    </p>
                    {application.status === "accepted" && (
                      <button
                        className="gateway-button mt-5"
                        disabled={busy}
                        onClick={() => void action("onboard")}
                      >
                        {t(
                          "قرأت التعليمات وأؤكد جاهزيتي",
                          "I have read the instructions and am ready",
                        )}
                      </button>
                    )}
                    <button
                      className="gateway-button-secondary mt-5"
                      disabled={changed || saving || busy}
                      onClick={() => void reload()}
                    >
                      {t("تحديث الحالة", "Refresh status")}
                    </button>
                  </section>
                </div>
              )}
              {application &&
                ["accepted", "onboarded"].includes(application.status) && (
                  <section className="gateway-card mt-6">
                    <h2 className="text-xl font-bold">
                      {t("البرنامج الخاص بك", "Your program")}
                    </h2>
                    <h3 className="mt-6 font-bold">
                      {t("الجلسات", "Sessions")}
                    </h3>
                    {application.sessions.length ? (
                      application.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="mt-3 rounded-lg bg-slate-50 p-4"
                        >
                          <p>{s.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {s.starts_at
                              ? new Date(s.starts_at).toLocaleString(
                                  ar ? "ar-SA" : "en-GB",
                                  { timeZone: "Asia/Riyadh" },
                                )
                              : t("لم يُعلن", "Not announced")}{" "}
                            · {s.location}
                          </p>
                          {safeWebUrl(s.online_link) && (
                            <a
                              className="text-sm underline"
                              href={s.online_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t("رابط الجلسة", "Session link")}
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">
                        {t(
                          "لم تُحدد جلسات بعد.",
                          "No sessions have been scheduled yet.",
                        )}
                      </p>
                    )}
                    <h3 className="mt-6 font-bold">
                      {t("الموارد", "Resources")}
                    </h3>
                    {application.resources.length ? (
                      application.resources.map((r) => (
                        <p className="mt-3" key={r.id}>
                          {safeWebUrl(r.url) ? (
                            <a
                              className="text-[#3B52D4] underline"
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.title}
                            </a>
                          ) : (
                            r.title
                          )}
                        </p>
                      ))
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">
                        {t(
                          "ستظهر الموارد المعتمدة هنا.",
                          "Approved resources will appear here.",
                        )}
                      </p>
                    )}
                    {application.mentors.length > 0 && (
                      <p className="mt-6">
                        {t("المرشدون: ", "Mentors: ")}
                        {application.mentors.map((m) => m.name).join(" · ")}
                      </p>
                    )}
                    {application.milestones.length > 0 && (
                      <ul className="mt-6 space-y-2">
                        {application.milestones.map((m, i) => (
                          <li key={i} className="text-sm">
                            {m.completed ? "✓" : "○"} {m.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}
            </>
          )}
          {error && verified && loaded && (
            <div className="mt-5">
              <p role="alert" className="gateway-error">
                {error}
              </p>
              {conflict.current && (
                <button
                  className="gateway-button-secondary mt-3"
                  onClick={() => void reload()}
                >
                  {t(
                    "تحميل النسخة المحفوظة (استبدال التعديلات الحالية)",
                    "Load saved version (replace current edits)",
                  )}
                </button>
              )}
            </div>
          )}
          {error && !verified && (
            <p role="alert" className="gateway-error mt-5">
              {error}
            </p>
          )}
          {note && (
            <p
              role="status"
              className="mt-5 rounded-xl bg-indigo-50 p-4 text-sm leading-7"
            >
              {note}
            </p>
          )}
          {user && (
            <details className="mt-10 border-t border-slate-200 pt-5">
              <summary className="cursor-pointer text-sm font-semibold">
                {t(
                  "إدارة بياناتك وحقوق الخصوصية",
                  "Your data and privacy rights",
                )}
              </summary>
              <p className="mt-4 text-sm leading-7">
                {t(
                  "يمكنك طلب نسخة من بياناتك أو تصحيحها أو سحب الموافقة أو حذفها. يراجع الفريق الطلب مع مراعاة متطلبات الاحتفاظ المطبقة.",
                  "Request a copy, correction, consent withdrawal, or deletion. The team reviews requests alongside applicable retention requirements.",
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["access", "طلب نسخة", "Request a copy"],
                  ["correction", "تصحيح البيانات", "Correct data"],
                  ["withdraw_consent", "سحب الموافقة", "Withdraw consent"],
                  ["deletion", "طلب حذف", "Request deletion"],
                ].map(([v, a, e]) => (
                  <button
                    key={v}
                    disabled={busy}
                    className="gateway-button-secondary"
                    onClick={() => void privacy(v)}
                  >
                    {t(a, e)}
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
