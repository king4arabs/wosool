/**
 * Wosool questions and answers.
 *
 * Every answer describes how the platform works today (see the matching code paths in the
 * comments). Do not add figures, timelines or promises the product does not deliver —
 * when something is decided case by case, say so.
 */

export type FaqCategory = "membership" | "account" | "profile" | "connect" | "events" | "content" | "partners"

export type FaqLink = { href: string; ar: string; en: string }

export type FaqItem = {
  /** Stable anchor: /faq#<id>. Never rename an id that has shipped. */
  id: string
  category: FaqCategory
  q: { ar: string; en: string }
  a: { ar: string[]; en: string[] }
  link?: FaqLink
}

export const FAQ_CATEGORIES: { id: FaqCategory; ar: string; en: string; contact: string }[] = [
  { id: "membership", ar: "العضوية والتقديم", en: "Membership & applying", contact: "general" },
  { id: "account", ar: "الحساب وتسجيل الدخول", en: "Account & sign-in", contact: "founder-support" },
  { id: "profile", ar: "الملف الشخصي والخصوصية", en: "Profile & privacy", contact: "founder-support" },
  { id: "connect", ar: "التعارف وطلب المساعدة", en: "Introductions & asking for help", contact: "founder-support" },
  { id: "events", ar: "الفعاليات والبرامج", en: "Events & programs", contact: "general" },
  { id: "content", ar: "الأخبار وملفات المؤسسين", en: "News & founder profiles", contact: "media" },
  { id: "partners", ar: "الشراكات والرعاية", en: "Partners & sponsors", contact: "partnerships" },
]

export const FAQS: FaqItem[] = [
  // Membership — apply page, terms §2–3, §7
  {
    id: "what-is-wosool", category: "membership",
    q: { ar: "ما هي وصول؟", en: "What is Wosool?" },
    a: {
      ar: ["شبكة أعضاء للمؤسسين في السعودية والخليج وخارجها. يتبادل فيها المؤسسون خبراتهم في التوظيف والتسعير وجمع التمويل والتوسع، ويتعارفون بموافقة الطرفين."],
      en: ["A members' network for founders in Saudi Arabia, the Gulf and beyond. Founders share how they hired, priced, raised and expanded, and meet through introductions both sides agree to."],
    },
    link: { href: "/about", ar: "عن وصول", en: "About Wosool" },
  },
  {
    id: "who-can-join", category: "membership",
    q: { ar: "من يمكنه الانضمام؟", en: "Who can join?" },
    a: {
      ar: ["المؤسسون والشركاء المؤسسون والمسؤولون التنفيذيون في شركات قائمة أو قيد التأسيس، ممن أتموا 18 عامًا، ويعملون في السعودية أو الخليج أو يخدمون أسواقهما.", "ننظر أيضًا إلى وضوح نموذج العمل والخطة للمرحلة القادمة، وإلى رغبتك في المشاركة ودعم المؤسسين الآخرين."],
      en: ["Founders, co-founders and executives of existing or emerging companies who are 18 or older and operate in, or serve, Saudi Arabia or the Gulf.", "We also look for a clear operating model, a serious plan for your next stage, and a willingness to contribute to other founders."],
    },
    link: { href: "/faq", ar: "معايير العضوية", en: "Membership criteria" },
  },
  {
    id: "how-to-apply", category: "membership",
    q: { ar: "كيف أتقدم بطلب عضوية؟", en: "How do I apply?" },
    a: {
      ar: ["أنشئ حسابك وأكّد بريدك برمز التحقق، ثم أكمل بياناتك وبيانات شركتك وأرسل طلبك للمراجعة."],
      en: ["Create an account and verify your email with the code, then complete your founder and company details and submit your application."],
    },
    link: { href: "/apply", ar: "قدّم طلبك", en: "Apply now" },
  },
  {
    id: "after-applying", category: "membership",
    q: { ar: "ماذا يحدث بعد إرسال الطلب؟", en: "What happens after I apply?" },
    a: {
      ar: ["يراجع الفريق كل طلب بنفسه، وعادة نرد خلال 5 إلى 7 أيام عمل. قد نتواصل معك لترتيب مكالمة تعريفية قصيرة قبل القرار.", "عند الموافقة تُفعّل عضويتك وتظهر بطاقتك في دليل المؤسسين والصفحة الرئيسية، ويصلك إشعار بالبريد."],
      en: ["The team reviews every application personally and usually replies within 5–7 business days. We may contact you for a short introductory call before deciding.", "Approval activates your membership and publishes your card in the founder directory and homepage. You receive an email notification."],
    },
  },
  {
    id: "membership-fees", category: "membership",
    q: { ar: "هل توجد رسوم عضوية؟", en: "Are there membership fees?" },
    a: {
      ar: ["العضوية حاليًا بالدعوة أو بالتقديم. تُشارك تفاصيل الرسوم والخيارات المتاحة بعد مراجعة الطلب، بحسب مرحلة شركتك وملاءمة العضوية."],
      en: ["Membership is currently by invitation or application. Fees and available options are shared after your application is reviewed, based on your company's stage and fit."],
    },
  },
  {
    id: "pre-launch", category: "membership",
    q: { ar: "هل يمكنني التقديم قبل إطلاق المنتج؟", en: "Can I apply before launching my product?" },
    a: {
      ar: ["نعم، ما دام لديك تصور واضح، وتعمل فعليًا على البناء، ولديك اهتمام حقيقي بالسوق السعودي أو الخليجي."],
      en: ["Yes, as long as you have a clear vision, are actively building, and have a real interest in the Saudi or Gulf market."],
    },
  },
  {
    id: "membership-vs-accelerator", category: "membership",
    q: { ar: "هل عضوية وصول تعني القبول في مسرّعة EO الرياض؟", en: "Does Wosool membership mean admission to EO Riyadh Accelerator?" },
    a: {
      ar: ["لا. مسرّعة EO الرياض برنامج مستقل له معايير أهلية وطلب تقديم خاص. العضوية في وصول لا تعني القبول في المسرّعة ولا عضوية EO."],
      en: ["No. EO Riyadh Accelerator is a separate program with its own eligibility and application. Wosool membership does not mean Accelerator admission or EO membership."],
    },
    link: { href: "/eoa/faq", ar: "أسئلة المسرّعة", en: "Accelerator FAQ" },
  },

  // Account — auth config (reset links expire after 60 minutes), verification notifications
  {
    id: "verify-email", category: "account",
    q: { ar: "لم تصلني رسالة توثيق البريد. ماذا أفعل؟", en: "I didn't get the verification email. What should I do?" },
    a: {
      ar: ["تحقق من مجلد الرسائل غير المرغوبة، ثم اطلب إرسال الرسالة من جديد من صفحة توثيق البريد، واستخدم أحدث رسالة تصلك. لروابط التوثيق مدة صلاحية، فإن انتهت اطلب رابطًا جديدًا."],
      en: ["Check your spam folder, then request a new message from the email verification page and use the most recent one. Verification links expire, so if yours has, request a new link."],
    },
    link: { href: "/verify-email", ar: "توثيق البريد", en: "Verify email" },
  },
  {
    id: "reset-password", category: "account",
    q: { ar: "نسيت كلمة المرور.", en: "I forgot my password." },
    a: {
      ar: ["اطلب رابط إعادة التعيين من صفحة «نسيت كلمة المرور». يصلك الرابط بالبريد ويبقى صالحًا 60 دقيقة. إذا انتهت صلاحيته اطلب رابطًا جديدًا."],
      en: ["Request a reset link from the forgot-password page. The link arrives by email and is valid for 60 minutes; if it expires, request a new one."],
    },
    link: { href: "/forgot-password", ar: "إعادة تعيين كلمة المرور", en: "Reset password" },
  },
  {
    id: "change-language", category: "account",
    q: { ar: "كيف أغيّر لغة الموقع؟", en: "How do I change the site language?" },
    a: {
      ar: ["استخدم زر اللغة في أعلى الصفحة للتبديل بين العربية والإنجليزية. يتذكر المتصفح اختيارك في الزيارات القادمة."],
      en: ["Use the language switch at the top of the page to move between Arabic and English. Your browser remembers the choice for next time."],
    },
  },
  {
    id: "account-security", category: "account",
    q: { ar: "كيف أحافظ على أمان حسابي؟", en: "How do I keep my account secure?" },
    a: {
      ar: ["لا تشارك بيانات الدخول مع أحد، واستخدم كلمة مرور خاصة بوصول. إذا اشتبهت في استخدام غير مصرح به فغيّر كلمة المرور فورًا وأبلغ الفريق."],
      en: ["Never share your sign-in details and use a password that is unique to Wosool. If you suspect unauthorised use, change your password straight away and tell the team."],
    },
    link: { href: "/contact?category=founder-support&subject=Account%20security", ar: "أبلغ الفريق", en: "Tell the team" },
  },

  // Profile — profile is_public toggle, avatar validation, privacy notice
  {
    id: "profile-visibility", category: "profile",
    q: { ar: "من يرى ملفي الشخصي؟", en: "Who can see my profile?" },
    a: {
      ar: ["يظهر ملفك في دليل المؤسسين العام بعد الموافقة على عضويتك، ويمكنك إخفاؤه في أي وقت من «ملفي الشخصي» بإلغاء خيار الظهور في الدليل. يبقى حسابك متاحًا لك عند الإخفاء.", "طلبات التقديم نفسها خاصة: لا يطّلع عليها إلا صاحبها والمسؤولون والمراجعون المكلّفون."],
      en: ["Your profile appears in the public founder directory once your membership is approved. You can hide it at any time from My profile by turning off directory visibility; your account stays available.", "Applications themselves are private: only you, administrators and assigned reviewers can see them."],
    },
    link: { href: "/dashboard/profile", ar: "ملفي الشخصي", en: "My profile" },
  },
  {
    id: "profile-photo", category: "profile",
    q: { ar: "ما متطلبات صورة الملف؟", en: "What are the profile photo requirements?" },
    a: {
      ar: ["صورة بصيغة JPEG أو PNG أو WebP، لا يتجاوز حجمها 2 ميغابايت، ولا يقل عرضها وارتفاعها عن 160 بكسل. يمكنك استبدالها أو حذفها متى شئت."],
      en: ["A JPEG, PNG or WebP image up to 2 MB and at least 160 × 160 pixels. You can replace or remove it whenever you like."],
    },
  },
  {
    id: "data-rights", category: "profile",
    q: { ar: "كيف أطلب نسخة من بياناتي أو حذفها؟", en: "How do I get a copy of my data or have it deleted?" },
    a: {
      ar: ["يمكنك طلب نسخة من بياناتك أو تصحيحها أو سحب موافقتك أو حذفها. يراجع الفريق الطلب، ويوضح لك إن كان هناك احتفاظ لازم بسبب نزاع أو التزام نظامي."],
      en: ["You can ask for a copy of your data, a correction, withdrawal of consent, or deletion. The team reviews each request and tells you if anything must be kept for a dispute or a legal obligation."],
    },
    link: { href: "/privacy", ar: "إشعار الخصوصية", en: "Privacy notice" },
  },
  {
    id: "data-use", category: "profile",
    q: { ar: "كيف تستخدم وصول بياناتي؟", en: "How does Wosool use my data?" },
    a: {
      ar: ["لتشغيل حسابك، ومراجعة طلبك والتواصل معك بشأنه، وإظهار ملفك للأعضاء إن اخترت ذلك. لا نطلب وثائق هوية أو تفاصيل بنكية، ولا نسمح باستخدام المنصة للتسويق المباشر دون موافقة الطرف الآخر."],
      en: ["To run your account, review and communicate about your application, and show your profile to members if you choose. We don't ask for identity documents or bank details, and members may not use the platform for direct marketing without the other person's consent."],
    },
  },

  // Connect — introductions ledger, help requests
  {
    id: "how-introductions-work", category: "connect",
    q: { ar: "كيف يعمل التعارف بين المؤسسين؟", en: "How do introductions work?" },
    a: {
      ar: ["اختر مؤسسًا وأرسل طلب تعارف تشرح فيه سببه. يقبل الطرف الآخر أو يعتذر، ويمكنك سحب طلبك قبل الرد.", "عند القبول تُفتح محادثة خاصة بينكما، ويصل كل طرف إشعار منفصل حتى لا تُكشف عناوين البريد."],
      en: ["Choose a founder and send an introduction request explaining why. The other founder accepts or declines, and you can withdraw the request before they reply.", "Once accepted, a private conversation opens between you. Each founder is emailed separately so addresses are never shared."],
    },
    link: { href: "/dashboard/matches", ar: "التوافق والتعارف", en: "Matches & introductions" },
  },
  {
    id: "ask-for-help", category: "connect",
    q: { ar: "كيف أطرح سؤالًا على المؤسسين الآخرين؟", en: "How do I ask other founders a question?" },
    a: {
      ar: ["من «اسأل المجتمع» في لوحة العضو، اكتب سؤالك واختر المجال ومدى الإلحاح ومن يمكنه رؤيته. تُفتح غرفة محادثة خاصة بالسؤال، ويمكنك دعوة أعضاء للمساعدة ثم تعليمه «تم الحل»."],
      en: ["From Ask the community in your member dashboard, write your question and choose the topic, urgency and who can see it. A private room opens for it; you can invite members to help and then mark it resolved."],
    },
    link: { href: "/dashboard/help-requests", ar: "اسأل المجتمع", en: "Ask the community" },
  },
  {
    id: "question-visibility", category: "connect",
    q: { ar: "من يرى سؤالي؟", en: "Who sees my question?" },
    a: {
      ar: ["أنت تختار: فريق وصول فقط، أو المؤسسون المقترحون للمساعدة، أو دائرة المؤسسين، أو جميع أعضاء المجتمع. لا يُعرض السؤال خارج المجتمع، ويمكنك تغيير الاختيار لاحقًا."],
      en: ["You choose: the Wosool team only, the founders suggested to help, your founder circle, or the whole member community. Questions are never shown outside the community, and you can change the setting later."],
    },
  },
  {
    id: "messaging-rules", category: "connect",
    q: { ar: "ما قواعد التواصل داخل المجتمع؟", en: "What are the rules for contacting members?" },
    a: {
      ar: ["التواصل المهني، وعدم مشاركة معلومات الأعضاء السرية دون موافقتهم، وعدم استخدام المنصة للتسويق المباشر. قد يعلّق الفريق الحسابات التي تخالف ذلك."],
      en: ["Be professional, never share members' confidential information without consent, and don't use the platform for direct marketing. The team may suspend accounts that break these rules."],
    },
    link: { href: "/terms", ar: "الشروط والأحكام", en: "Terms of service" },
  },

  // Events & programs — event RSVP, .ics, program lifecycle
  {
    id: "event-registration", category: "events",
    q: { ar: "كيف أسجّل في فعالية؟", en: "How do I register for an event?" },
    a: {
      ar: ["افتح صفحة الفعالية وسجّل حضورك بعد تسجيل الدخول. يمكنك إضافتها إلى تقويمك وإلغاء التسجيل من الصفحة نفسها. بعض الفعاليات بالدعوة فقط أو مكتملة العدد، ويظهر ذلك على صفحتها."],
      en: ["Open the event page and register while signed in. You can add it to your calendar and cancel from the same page. Some events are invitation-only or full; the page says so."],
    },
    link: { href: "/events", ar: "الفعاليات", en: "Events" },
  },
  {
    id: "program-applications", category: "events",
    q: { ar: "لماذا لا يمكنني التقديم على برنامج؟", en: "Why can't I apply to a program?" },
    a: {
      ar: ["يُقبل التقديم فقط عندما تكون دورة البرنامج مفتوحة. إذا كان التقديم مغلقًا أو لم يبدأ بعد، تعرض صفحة البرنامج ذلك."],
      en: ["Applications are accepted only while a program's intake is open. If it is closed or hasn't started yet, the program page says so."],
    },
    link: { href: "/programs", ar: "البرامج", en: "Programs" },
  },
  {
    id: "office-hours", category: "events",
    q: { ar: "هل يمكنني حجز ساعات مكتبية مع الفريق؟", en: "Can I book office hours with the team?" },
    a: {
      ar: ["أرسل طلبك من صفحة التواصل بتصنيف «جلسة مع الفريق» مع موضوعك، وسيرد عليك الفريق بالخيارات المتاحة."],
      en: ["Send a request from the contact page under “Time with the team” with your topic, and the team will reply with what is available."],
    },
    link: { href: "/contact?category=office-hours", ar: "اطلب جلسة مع الفريق", en: "Request time with the team" },
  },

  // Content — news briefs, founder spotlight sourcing, activation invitations
  {
    id: "news-sources", category: "content",
    q: { ar: "من أين تأتي الأخبار؟", en: "Where does the news come from?" },
    a: {
      ar: ["كل خبر ملخص قصير يكتبه فريق وصول عن مصدر منشور ومسمّى، مع تاريخ النشر الأصلي ورابط المصدر. لا نعيد نشر المقالات كاملة."],
      en: ["Each story is a short brief written by the Wosool team from a named, published source, with the original publication date and a source link. We don't republish full articles."],
    },
    link: { href: "/news", ar: "الأخبار", en: "News" },
  },
  {
    id: "founder-profile-sources", category: "content",
    q: { ar: "كيف تُعدّ ملفات المؤسسين المميزين؟", en: "How are the featured founder profiles put together?" },
    a: {
      ar: ["من مصادر منشورة فقط، مثل الإعلانات الرسمية والتغطيات الصحفية، مع رابط لكل مصدر. نركز على شركات قائمة لها عمليات فعلية، ونبدأ بالسعودية ثم الخليج ثم العالم."],
      en: ["From published sources only, such as official announcements and press coverage, with a link to each source. We focus on operating companies, starting with Saudi Arabia, then the Gulf, then the rest of the world."],
    },
    link: { href: "/founders", ar: "دليل المؤسسين", en: "Founder directory" },
  },
  {
    id: "correct-or-claim", category: "content",
    q: { ar: "هذا ملفي أو خبر عن شركتي، كيف أصححه أو أتسلمه؟", en: "This is my profile or my company's story — how do I correct or claim it?" },
    a: {
      ar: ["راسلنا من صفحة التواصل مع رابط الصفحة والتصحيح ومصدره. بعد التحقق من هويتك يمكن للفريق إرسال دعوة لتفعيل الملف وإدارته بنفسك."],
      en: ["Message us from the contact page with the page link, the correction and its source. Once we verify who you are, the team can send you an invitation to activate and manage the profile yourself."],
    },
    link: { href: "/contact?category=media&subject=Correction", ar: "اطلب تصحيحًا", en: "Request a correction" },
  },
  {
    id: "submit-news", category: "content",
    q: { ar: "كيف أرسل خبرًا عن شركتي؟", en: "How do I send news about my company?" },
    a: {
      ar: ["أرسل رابط الإعلان المنشور من صفحة التواصل بتصنيف «إعلام». ننشر الأخبار المستندة إلى مصدر منشور يمكن التحقق منه."],
      en: ["Send the link to your published announcement from the contact page under Media. We cover news that rests on a published, verifiable source."],
    },
    link: { href: "/contact?category=media&subject=News%20tip", ar: "أرسل خبرًا", en: "Send news" },
  },

  // Partners — sponsor inquiry form, contact categories
  {
    id: "become-partner", category: "partners",
    q: { ar: "كيف تصبح جهتنا شريكًا لوصول؟", en: "How can our organisation partner with Wosool?" },
    a: {
      ar: ["أرسل طلب شراكة من صفحة التواصل يوضح ما تقدمه جهتكم للمؤسسين: خبرة أو موارد أو برامج. يراجع الفريق الطلب ويتواصل معكم."],
      en: ["Send a partnership request from the contact page explaining what you offer founders — expertise, resources or programs. The team reviews it and gets back to you."],
    },
    link: { href: "/contact?category=partnerships", ar: "اطلب شراكة", en: "Propose a partnership" },
  },
  {
    id: "sponsorship", category: "partners",
    q: { ar: "كيف نرعى فعالية أو برنامجًا؟", en: "How do we sponsor an event or program?" },
    a: {
      ar: ["اختر مستوى الرعاية المناسب وأرسل النموذج من صفحة الرعاة. يصلكم تأكيد بالبريد ويتواصل الفريق لمناقشة التفاصيل."],
      en: ["Pick a sponsorship level and send the form on the sponsors page. You'll get an email confirmation and the team will follow up to discuss details."],
    },
    link: { href: "/sponsors#sponsor-inquiry", ar: "صفحة الرعاة", en: "Sponsors page" },
  },
]

export const faqText = (item: FaqItem, locale: "ar" | "en") => ({
  question: item.q[locale],
  answer: item.a[locale],
})
