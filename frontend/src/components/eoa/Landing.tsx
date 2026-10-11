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
import { EoaJourney } from "./Journey"
import { EoaLogo } from "./Logo"
import { EoaBoard } from "./Board"
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
        ["4", "ركائز أساسية للنمو"],
        ["عامان", "مدة برنامج التعلم"],
        ["$1M+", "طموح النمو السنوي"],
      ]
    : [
        ["$250K–$999K", "Target annual revenue"],
        ["4", "Core growth pillars"],
        ["2 Years", "Learning program"],
        ["$1M+", "Annual growth ambition"],
      ]

  const valueCards: Array<{ icon: LucideIcon; title: string; body: string }> = ar
    ? [
        { icon: TrendingUp, title: "نمو قابل للقياس", body: "حوّل الطموح إلى أولويات ومؤشرات والتزامات عملية داخل شركتك." },
        { icon: Network, title: "علاقات بين المؤسسين", body: "ناقش تحديات حقيقية مع أقران يفهمون مسؤولية بناء الشركات." },
        { icon: Globe2, title: "اتصال عالمي", body: "استكشف فرص التعلّم والعلاقات التي تتيحها منظومة EO للمشاركين المؤهلين." },
        { icon: ShieldCheck, title: "دعم من أصحاب الخبرة", body: "تعلّم من رواد أعمال ذوي خبرة واستفد من خبراتهم في بناء شركتك." },
      ]
    : [
        { icon: TrendingUp, title: "Measurable growth", body: "Turn ambition into priorities, indicators and practical commitments inside your company." },
        { icon: Network, title: "Founder-to-founder connection", body: "Work through real challenges with peers who understand the responsibility of building companies." },
        { icon: Globe2, title: "Global connectivity", body: "Explore learning and relationship opportunities available through the EO ecosystem to eligible participants." },
        { icon: ShieldCheck, title: "Experienced perspectives", body: "Learn with experienced entrepreneurs and bring fresh perspectives to the decisions that shape your business." },
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
                  ? "انضم إلى رحلة يقودها المؤسسون لتعزيز أعمالك، وتنمية قيادتك، والتوسع نحو إيرادات سنوية تتجاوز مليون دولار من خلال التعلّم العملي والعلاقات الريادية العالمية."
                  : "Join a founder-led journey to strengthen your business, grow your leadership and scale toward US$1M+ annual revenue through practical learning and global entrepreneurial connections."}
              </p>

              <div className="eoa-hero-join-row">
                <div className="eoa-actions">
                  <Link className="eoa-btn" href="/eoa/apply">{ar ? "انضم إلى مسرّعة EO الرياض" : "Apply to EO Riyadh Accelerator"}<Arrow size={18} /></Link>
                  <Link className="eoa-btn eoa-btn-outline" href="/eoa/program">{ar ? "استكشف البرنامج" : "Explore the Program"}</Link>
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
              <div className="eoa-path-foot">{ar ? "تعلّم. طبّق. تقدّم." : "LEARN. APPLY. PROGRESS."}</div>
            </aside>
          </div>

          <div className="eoa-hero-metrics" aria-label={ar ? "مؤشرات البرنامج" : "Program highlights"}>
            {metrics.map(([value, label]) => <div className="eoa-hero-metric" key={label}><strong dir="ltr">{value}</strong><span>{label}</span></div>)}
          </div>
        </div>
      </section>

      <PartnerStrip partners={program?.partners ?? []} />

      {(ar ? program?.public_message_ar : program?.public_message_en) && <div className="eoa-container"><Notice>{ar ? program?.public_message_ar : program?.public_message_en}</Notice></div>}

      <section className="eoa-section eoa-light" id="overview" aria-labelledby="eoa-overview-title">
        <div className="eoa-container">
          <div className="eoa-section-head">
            <div><span className="eoa-eyebrow">{ar ? "من الطموح إلى مستقبل أكبر" : "FROM AMBITION TO A $1M+ FUTURE"}</span><h2 id="eoa-overview-title">{ar ? "مجتمع مؤسسين يفتح آفاق النمو." : "Built around founders. Focused on growth."}</h2></div>
            <p>{ar ? "رحلة منظمة لأصحاب الشركات القائمة، تجمع التعلّم بين الأقران، والمساءلة، والتطبيق الحقيقي على الشركة." : "A structured journey for owners of operating businesses, combining peer learning, accountability and real application inside the company."}</p>
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
            <h3 className="eoa-space">{ar ? 'نمو الشركة يبدأ بتطور مؤسسها.' : 'Stronger founders build stronger businesses.'}</h3>
            <p>{ar ? 'توفر المسرعة إطاراً منظماً للتعلم والمساءلة للمؤسسين الطامحين إلى توسيع شركاتهم والاستعداد لمتطلبات عضوية EO.' : 'Accelerator provides a structured learning and accountability experience for founders working to scale their companies and prepare for EO membership requirements.'}</p>
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
            <p>{ar ? "تجمع الرحلة بين نمو الشركات وبناء القدرات القيادية وعلاقات المؤسسين داخل الرياض وعبر شبكة EO العالمية." : "The journey brings together company growth, leadership capability and founder relationships across Riyadh and the global EO network."}</p>
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

      <EoaJourney program={program} />
      <EoaProgramDetails program={program} />
      <EoaBoard members={program?.board_members ?? []} ar={ar} />

      <section className="eoa-section">
        <div className="eoa-container eoa-two-grid">
          <div><span className="eoa-eyebrow">{ar ? "خطوتك القادمة" : "YOUR NEXT CHAPTER"}</span><h2>{ar ? "طموحك يستحق\nمجتمعاً يدفعه للأمام." : "Your ambition deserves\na community behind it."}</h2></div>
          <div>
            <p>{ar ? "ابدأ بتقييم الأهلية، ثم جهز طلبك واحفظ تقدمك. تراجع اللجنة جاهزية شركتك والتزامك بالنمو." : "Start with an eligibility check, then prepare your application and save your progress. The committee reviews company readiness and your commitment to growth."}</p>
            <div className="eoa-actions"><Link className="eoa-btn" href="/eoa/apply">{ar ? "ابدأ رحلتك" : "Start your journey"}<Arrow size={18} /></Link><Link className="eoa-text-link" href="/eoa/contact">{ar ? "انضم كشريك" : "Become a partner"}</Link></div>
            <p className="eoa-muted">{ar ? "التقديم لا يضمن القبول أو عضوية EO. تُدار مناقشات الاستثمار بشكل مستقل عن البرنامج." : "Admission and EO membership require separate review. Investment discussions are independent of program participation."}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
