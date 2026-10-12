"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Globe2,
  MoveUpRight,
  Network,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { useLocale } from "@/lib/locale"
import { programAvailability } from "@/lib/eoa"
import { EoaHeroMedia } from "./HeroMedia"
import { CohortModel } from './CohortModel'
import { EoaJourney } from "./Journey"
import { EoaLogo } from "./Logo"
import { EoaBoard } from "./Board"
import { EoaMentors } from "./Mentors"
import { EoaProgramDetails } from "./EoaProgramDetails"
import { EoaPillars } from "./Pillars"
import { Notice, PartnerStrip, useEoaProgram } from "./Shared"

export function EoaLanding() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const { program, failed, retry } = useEoaProgram()
  const availability = programAvailability(program, failed)
  const Arrow = ar ? ArrowLeft : ArrowUpRight

  const metrics = ar
    ? [
        ["$250K–$999K", "نطاق الإيراد السنوي المستهدف"],
        ["4", "محاور للعمل على شركتك"],
        ["٦ أشهر", "تعلم وتوجيه مع الدفعة"],
        ["$1M+", "هدف الإيراد السنوي"],
      ]
    : [
        ["$250K–$999K", "Target annual revenue"],
        ["4", "Areas to work on"],
        ["6 months", "Learning and coaching with your cohort"],
        ["$1M+", "Annual revenue goal"],
      ]

  const valueCards: Array<{ icon: LucideIcon; title: string; body: string }> = ar
    ? [
        { icon: TrendingUp, title: "قرارات أوضح لشركتك", body: "حدّد ما تريد تغييره في عملك، وكيف ستعرف إن كنت تتقدم." },
        { icon: Network, title: "مؤسسون يشاركونك التحديات", body: "تحدّث عن قرارات التوظيف والسيولة والنمو مع من يواجهون مثلها." },
        { icon: Globe2, title: "تجارب من شبكة EO", body: "تعرّف على خبرات مؤسسين من شبكة EO، وفق فرص المشاركة المتاحة." },
        { icon: ShieldCheck, title: "خبرة قابلة للتطبيق", body: "استمع إلى تجارب رواد أعمال، ثم اختر ما يناسب شركتك." },
      ]
    : [
        { icon: TrendingUp, title: "Clearer business decisions", body: "Name what needs to change in your business and how you’ll know it’s working." },
        { icon: Network, title: "Founders facing similar decisions", body: "Talk through hiring, cash and growth with people who have been there." },
        { icon: Globe2, title: "Experience from the EO network", body: "Hear from founders across EO when participation opportunities are available." },
        { icon: ShieldCheck, title: "Advice you can put to work", body: "Learn from entrepreneurs’ experiences and decide what fits your company." },
      ]

  return (
    <div className="eoa">
      <section className="eoa-hero" aria-labelledby="eoa-hero-title">
        <EoaHeroMedia ar={ar} />
        <div className="eoa-container eoa-hero-shell">
          <div className="eoa-hero-grid">
            <div className="eoa-hero-copy">
              <div className="eoa-eyebrow"><span className="eoa-dot" />{ar ? "منظمة رواد الأعمال | EO الرياض" : "ENTREPRENEURS' ORGANIZATION | EO RIYADH"}</div>
              <EoaLogo className="eoa-hero-logo" inverse priority />
              <h1 id="eoa-hero-title" className="eoa-hero-title">
                {ar ? <><span>روّاد أعمال من الرياض.</span><span>علاقات عالمية.</span><span>نمو استثنائي.</span></> : <><span>Riyadh-based Founders.</span><span>Global Connections.</span><span>Extraordinary Growth.</span></>}
              </h1>
              <p className="eoa-hero-message">
                {ar
                  ? "لديك شركة قائمة وقرارات لا يمكن تأجيلها؟ خصص ستة أشهر للعمل عليها مع مؤسسين آخرين ومدربين، ثم واصل المتابعة ضمن مجتمع الخريجين. تنطلق دفعة جديدة كل ستة أشهر."
                  : "Running a business means making decisions you can’t put off. Spend six months working through them with fellow founders and coaches, then stay connected through the alumni program. A new cohort begins every six months."}
              </p>

              <div className="eoa-hero-join-row">
                <div className="eoa-actions">
                  <Link className="eoa-btn" href="/eoa/apply">{ar ? "انضم إلى مسرّعة EO الرياض" : "Apply to EO Riyadh Accelerator"}<Arrow size={18} /></Link>
                  <Link className="eoa-btn eoa-btn-outline" href="/eoa/program">{ar ? "استكشف البرنامج" : "Explore the Program"}</Link>
                  <Link className="eoa-text-link" href="/eoa/perks">{ar ? "مزايا المشاركين" : "Participant perks"}</Link>
                  <a className="eoa-text-link" href="https://eonetwork.org/" target="_blank" rel="noopener noreferrer">{ar ? "اكتشف EO" : "Discover EO"}<Arrow size={18} /></a>
                </div>
              </div>

              <p className="eoa-hero-note" role="status">
                {availability === "loading"
                  ? ar ? "جارٍ التحقق من حالة التقديم…" : "Checking application availability…"
                  : availability === "unavailable"
                    ? ar ? "تعذر التحقق من حالة التقديم." : "Application availability could not be verified."
                    : availability === "open"
                      ? ar ? "باب التقديم المحلي مفتوح." : "Local applications are open."
                      : ar ? "التقديم مغلق حالياً. تابع الإعلانات المعتمدة أو تواصل مع فريق البرنامج." : "Applications are currently closed. Follow confirmed updates or contact the program team."}
              </p>
              {failed && <button type="button" className="eoa-btn eoa-btn-outline eoa-hero-retry" onClick={retry}>{ar ? "إعادة المحاولة" : "Try again"}</button>}
            </div>

            <aside className="eoa-path-card" aria-label={ar ? "مسار نمو المؤسس" : "Founder growth path"}>
              <div className="eoa-path-head"><strong>EO ACCELERATOR</strong><span>{ar ? "مسار المؤسس" : "THE FOUNDER PATH"}</span></div>
              <div className="eoa-growth-mark" aria-hidden="true"><MoveUpRight size={92} strokeWidth={1} /></div>
              {[
                [ar ? "ابنِ الأساس" : "Build your foundation", ar ? "النقد • الاستراتيجية" : "Cash • Strategy"],
                [ar ? "نمِّ قدراتك" : "Strengthen your leadership", ar ? "الأفراد • التنفيذ" : "People • Execution"],
                [ar ? "وسّع آفاقك" : "Grow your possibilities", ar ? "رحلة نحو جاهزية عضوية EO" : "A path toward EO membership readiness"],
              ].map(([title, body], index) => <div className="eoa-path-step" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}
              <div className="eoa-path-foot">{ar ? "من تحديات شركتك، إلى خطوات تجرّبها." : "BRING A CHALLENGE. LEAVE WITH A NEXT STEP."}</div>
            </aside>
          </div>

          <div className="eoa-hero-metrics" aria-label={ar ? "مؤشرات البرنامج" : "Program highlights"}>
            {metrics.map(([value, label]) => <div className="eoa-hero-metric" key={label}><strong dir="ltr">{value}</strong><span>{label}</span></div>)}
          </div>
        </div>
      </section>

      <PartnerStrip partners={program?.partners} />

      {(ar ? program?.public_message_ar : program?.public_message_en) && <div className="eoa-container"><Notice>{ar ? program?.public_message_ar : program?.public_message_en}</Notice></div>}

      <section className="eoa-section eoa-light" id="overview" aria-labelledby="eoa-overview-title">
        <div className="eoa-container">
          <div className="eoa-section-head">
            <div><span className="eoa-eyebrow">{ar ? "اعمل على شركتك، لا على أفكار مجردة" : "WORK ON THE BUSINESS YOU RUN"}</span><h2 id="eoa-overview-title">{ar ? "أحضر تحديات شركتك إلى الطاولة." : "Bring your business questions to the table."}</h2></div>
            <p>{ar ? "كيف تدير السيولة؟ من تحتاج في فريقك؟ وأين تركز وقتك؟ ناقش هذه الأسئلة مع دفعتك، ثم جرّب ما تعلمته في شركتك." : "Cash is tight. The team needs to grow. Where do you focus first? Bring those questions to your cohort, then test what you learn in your business."}</p>
          </div>
          <div className="eoa-four-grid">
            {valueCards.map(({ icon: Icon, title, body }) => <article className="eoa-pillar" key={title}><Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="eoa-section eoa-network" id="about-eo" aria-labelledby="about-eo-title">
        <div className="eoa-container eoa-two-grid">
          <div>
            <span className="eoa-eyebrow">{ar ? 'مجتمع يجمعك بمن يفهم رحلتك' : 'PEOPLE WHO UNDERSTAND THE JOURNEY'}</span>
            <h2 id="about-eo-title">{ar ? 'عالم من الخبرات. مجتمعك في الرياض.' : 'A world of experience. Your community in Riyadh.'}</h2>
            <p>{ar ? 'منظمة رواد الأعمال EO شبكة عالمية تجمع أصحاب الشركات للتعلم من التجربة وتبادل الخبرات وبناء علاقات موثوقة. يجمع فرع الرياض هذا المجتمع محلياً ويفتح آفاق التواصل عبر الشبكة العالمية.' : 'Entrepreneurs’ Organization brings business owners together through shared experience, peer learning and trusted relationships. EO Riyadh connects that community locally, with opportunities to learn across the global network.'}</p>
            <a className="eoa-text-link" href="https://eonetwork.org/" target="_blank" rel="noopener noreferrer">{ar ? 'اكتشف منظمة رواد الأعمال' : 'Explore Entrepreneurs’ Organization'} ↗</a>
          </div>
          <div className="eoa-card">
            <EoaLogo />
            <h3 className="eoa-space">{ar ? 'لا تحتاج إلى اتخاذ كل قرار وحدك.' : 'You don’t have to make every decision alone.'}</h3>
            <p>{ar ? 'تجمع المسرّعة مؤسسين لتبادل التجارب ومراجعة التقدم في شركاتهم. ولعضوية EO متطلبات وقرار قبول مستقلان.' : 'Accelerator brings founders together to share experience and check progress in their companies. EO membership has its own requirements and admission process.'}</p>
            <a className="eoa-text-link" href="https://eoriyadh.org/" target="_blank" rel="noopener noreferrer">{ar ? 'تعرف على EO الرياض' : 'Meet EO Riyadh'} ↗</a>
          </div>
        </div>
      </section>

      <EoaPillars />

      <section className="eoa-section eoa-light" id="governance">
        <div className="eoa-container eoa-two-grid">
          <div>
            <span className="eoa-eyebrow">{ar ? "بقيادة المؤسسين" : "FOUNDER LED"}</span>
            <h2>{ar ? "محلي في جذوره.\nعالمي في علاقاته." : "Rooted in Riyadh.\nConnected to the world."}</h2>
            <p>{ar ? "يقود EO الرياض البرنامج محلياً، ويقدّم إطار EO للتعلّم نقطة انطلاق للعمل على تحديات الشركة. يدير وصول التقديم ومتابعة المشاركين." : "EO Riyadh leads the local program. EO’s learning framework gives founders a place to start on business challenges; Wosool handles applications and participant follow-up."}</p>
            <Link className="eoa-text-link" href="/eoa/about">{ar ? "تعرف على البرنامج" : "Meet the program"}<Arrow size={18} /></Link>
          </div>
          <div className="eoa-card">
            {[
              [ar ? "EO الرياض" : "EO Riyadh", ar ? "قيادة الفرع وحوكمة البرنامج والقرارات المعتمدة." : "Chapter leadership, program governance and authorized decisions."],
              ["EO Accelerator", ar ? "إطار التعلّم ومتطلبات البرنامج والمسار نحو النمو." : "The learning framework, program requirements and growth pathway."],
              [ar ? "وصول" : "Wosool", ar ? "الاكتشاف والتقديم والتنسيق وخدمات المشاركين والتشغيل الرقمي." : "Discovery, applications, coordination, participant services and digital operations."],
            ].map(([name, body]) => <div className="eoa-role-row" key={name}><Check size={18} /><div><h3>{name}</h3><p>{body}</p></div></div>)}
          </div>
        </div>
      </section>

      <div className="eoa-container eoa-section"><CohortModel ar={ar} /></div>
      <EoaJourney program={program} />
      <EoaMentors key={ar ? "ar" : "en"} mentors={program?.mentors ?? []} ar={ar} loading={!program && !failed} failed={failed} retry={retry} compact />
      <EoaProgramDetails program={program} />
      <EoaBoard members={program?.board_members ?? []} ar={ar} />

      <section className="eoa-section">
        <div className="eoa-container eoa-two-grid">
          <div><span className="eoa-eyebrow">{ar ? "قبل أن تتقدم" : "BEFORE YOU APPLY"}</span><h2>{ar ? "ابدأ بالأهلية.\nثم أخبرنا عن شركتك." : "Check the criteria.\nThen tell us about your business."}</h2></div>
          <div>
            <p>{ar ? "ابدأ بتقييم الأهلية، ثم جهز طلبك واحفظ تقدمك. تراجع اللجنة جاهزية شركتك والتزامك بالنمو." : "Start with an eligibility check, then prepare your application and save your progress. The committee reviews company readiness and your commitment to growth."}</p>
            <div className="eoa-actions"><Link className="eoa-btn" href="/eoa/apply">{ar ? "جهّز طلبك" : "Prepare your application"}<Arrow size={18} /></Link><Link className="eoa-text-link" href="/eoa/contact">{ar ? "تحدث مع الفريق" : "Ask the team"}</Link></div>
            <p className="eoa-muted">{ar ? "التقديم لا يضمن القبول أو عضوية EO. تُدار مناقشات الاستثمار بشكل مستقل عن البرنامج." : "Admission and EO membership require separate review. Investment discussions are independent of program participation."}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
