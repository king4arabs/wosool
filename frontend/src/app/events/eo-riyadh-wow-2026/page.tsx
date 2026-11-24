"use client"

import Link from "next/link"
import Image from "next/image"
import { CalendarDays, CalendarPlus, MessageCircle, Mail, Share2, Briefcase } from "lucide-react"
import { EventPartners } from "@/components/events/EventPartners"
import { WowWeather } from "@/components/events/WowWeather"
import { WowRegistration } from "@/components/events/WowRegistration"
import { EoaLogo } from "@/components/eoa/Logo"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { useLocale } from "@/lib/locale"

const eventUrl = "https://wosool.org/events/eo-riyadh-wow-2026"
const map = "https://maps.app.goo.gl/G4XGAB566UbG4Lsn9"
const agenda = [
 ["2:00–5:00 PM","Welcome reception, networking and golf","استقبال الضيوف والتواصل وأنشطة الجولف"],
 ["5:00 PM","Maghrib prayer break","استراحة صلاة المغرب"],
 ["5:30 PM","Opening, introduction to EO and EOA, and panel discussion","الافتتاح والتعريف بـ EO وEOA وجلسة حوارية"],
 ["6:30 PM","Isha prayer break","استراحة صلاة العشاء"],
 ["7:00 PM","Main session with special guest","الجلسة الرئيسية مع الضيف الخاص"],
 ["8:00 PM","Dinner and networking","العشاء والتواصل"],
 ["9:00 PM–Midnight","Open networking and activities","لقاءات وأنشطة مفتوحة"],
]
export default function WowEventPage() {
 const { locale } = useLocale()
 const ar = locale === "ar"
 const action = "inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-indigo-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
 return <PublicLayout><main dir={ar ? "rtl" : "ltr"} className="bg-slate-50">
 <section aria-labelledby="wow-title" className="relative isolate overflow-hidden bg-[#08163d] px-5 py-12 text-white sm:py-16 lg:py-20">
 <Image src="/events/wow-2026/hero-golf-sunset.jpg" alt="" fill preload unoptimized sizes="100vw" className="z-0 object-cover object-[65%_center] sm:object-center" />
 <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none" style={{background: `linear-gradient(${ar ? "270deg" : "90deg"}, rgba(4,16,44,.92) 0%, rgba(4,16,44,.72) 40%, rgba(4,16,44,.20) 100%), linear-gradient(0deg, rgba(4,16,44,.92), transparent 70%)`}} />
 <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-300"/>
 <div className="relative z-20 mx-auto max-w-6xl">
 <EoaLogo inverse priority className="mb-6" />
 <p className="text-sm font-semibold tracking-wide text-white sm:text-base">EO Riyadh · EO Riyadh Accelerator</p>
 <h1 id="wow-title" className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">EO Riyadh <span className="text-cyan-300">WOW</span> Event</h1>
 <p className="mt-4 text-xl">Connect. Discover. Inspire. Grow.</p>
 <div className="mt-8 grid gap-4 sm:grid-cols-3">
 {[[ar?"التاريخ":"Date",ar?"الجمعة 11 ديسمبر 2026":"Friday, December 11, 2026"],[ar?"الموقع":"Venue","Golf Club Wadi Safar, Diriyah"],[ar?"الوقت":"Hours","2:00 PM – Midnight"]].map(([label,value])=><div key={label} className="rounded-2xl border border-white/30 bg-[#06132f]/80 p-4"><p className="text-sm text-cyan-200">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}
 </div>
 <p className="mt-4 font-semibold">{ar?"البرنامج الرسمي: 5:30–8:30 مساءً":"Official program: 5:30–8:30 PM"}</p>
 <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap"><a className={action} href="#registration">{ar?"احجز مكانك":"Reserve your place"}</a><a className={action} href={map}>{ar?"الموقع والاتجاهات":"Location & directions"}</a></div>
 <p className="mt-4 text-sm">{ar?"التسجيل المسبق مطلوب والحضور مشروط بتأكيد اللجنة المنظمة.":"Advance registration is required. Attendance is subject to confirmation by the organizing committee."}</p>
 </div></section>
 <nav aria-label={ar?"أقسام الفعالية":"Event sections"} className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-1 px-5 py-2 text-sm font-bold text-indigo-950">{[["agenda",ar?"البرنامج":"Agenda"],["dress",ar?"الزي":"Dress code"],["weather",ar?"الطقس":"Weather"],["partners",ar?"الشركاء":"Partners"],["actions",ar?"المشاركة":"Share & save"],["registration",ar?"التسجيل":"Register"]].map(([id,label])=><a key={id} href={"#"+id} className="inline-flex min-h-11 items-center hover:underline">{label}</a>)}</div></nav>
 <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
 <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"><div className="min-w-0">
 <div className="mb-8 grid gap-5 sm:grid-cols-2">{[["#registration","registration",ar?"سجّل عبر وصول":"Register with Wosool"],[map,"location",ar?"امسح للوصول للموقع":"Scan for directions"]].map(([href,id,label])=><a key={id} href={href} className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 p-5 text-center font-bold">{id==="location"?<Image src="/events/wow-2026/location.svg" width={160} height={160} alt={label}/>:<span className="flex min-h-40 items-center text-xl text-indigo-800">{ar?"ابدأ التسجيل":"Start registration"}</span>}{label}</a>)}</div>
 <h2 id="agenda" className="scroll-mt-28 text-2xl font-bold">{ar?"برنامج الفعالية":"Event agenda"}</h2>
 <div className="mt-5 divide-y rounded-2xl border border-slate-200 bg-white shadow-sm">{agenda.map(([time,en,arabic])=><div key={time} className="grid gap-2 p-4 sm:grid-cols-[150px_1fr]"><span dir="ltr" className="font-bold text-indigo-800">{time}</span><span>{ar?arabic:en}</span></div>)}</div>
 <p className="mt-3 text-sm text-slate-600">{ar?"استراحات الصلاة حسب التوقيت المحلي.":"Prayer breaks follow local prayer times."}</p>
 <h2 id="dress" className="mt-10 scroll-mt-28 text-2xl font-bold">{ar?"الزي المقترح":"Dress code"}</h2><p className="mt-3">{ar?"ملابس عمل أنيقة، أو الثوب السعودي والعباءة، أو ملابس جولف مناسبة للأنشطة الرياضية.":"Business Smart, optional Saudi traditional attire (Thobe and Abaya), or suitable golf attire for golf activities."}</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
 {[
  {title: ar?"الرجال":"Men", items:[{label:ar?"ملابس عمل":"Business Smart",x:9.26},{label:ar?"ثوب سعودي":"Saudi Thobe",x:23.94},{label:ar?"ملابس جولف":"Golf Attire",x:38.82}]},
  {title: ar?"النساء":"Women", items:[{label:ar?"ملابس عمل":"Business Smart",x:62.07},{label:ar?"عباءة أنيقة":"Elegant Abaya",x:77.71},{label:ar?"ملابس جولف":"Golf Attire",x:93.01}]}
 ].map(group=><div key={group.title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"><h3 className="font-bold text-indigo-950">{group.title}</h3>
 <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">{group.items.map(item=><figure key={item.label} className="m-0 min-w-0 text-center">
 <div aria-hidden="true" className="mx-auto aspect-[19/34] w-full max-w-[108px] rounded-lg bg-[#091b49] bg-no-repeat" style={{backgroundImage:"url('/events/wow-2026/dress-avatars.jpg')",backgroundSize:"867.37% 272.94%",backgroundPosition:`${item.x}% 61.22%`}} />
 <figcaption className="mt-2 break-words text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs">{item.label}</figcaption>
 </figure>)}</div></div>)}
 </div>
 <p className="mt-3 text-sm text-slate-600">{ar?"للجولف: قميص بولو وبنطال طويل وحذاء مناسب للملعب للرجال والنساء.":"Golf activities: polo shirt, full-length golf trousers and course-appropriate footwear for men and women."}</p>
 <div id="weather" className="scroll-mt-28"><WowWeather /></div>
 </div><aside className="min-w-0 lg:sticky lg:top-24"><WowRegistration /></aside></div>
 <section id="actions" className="mt-10 scroll-mt-28 rounded-3xl bg-[#101e50] p-5 text-white sm:p-8"><h2 className="text-2xl font-bold">{ar?"احفظ وشارك الفعالية":"Save & share the event"}</h2><p className="mt-2 text-sm text-slate-200">{ar?"إضافة التقويم لا تعني تأكيد الحضور.":"Saving to your calendar does not confirm attendance."}</p><div className="mt-5 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-2 sm:gap-3" aria-label={ar?"اختصارات حفظ ومشاركة الفعالية":"Event save and share shortcuts"}>{[
 {label:"Google",description:"Google Calendar",Icon:CalendarPlus,href:"https://calendar.google.com/calendar/render?action=TEMPLATE&text=EO%20Riyadh%20WOW%20Event&dates=20261211T110000Z%2F20261211T210000Z&location=Golf%20Club%20Wadi%20Safar%2C%20Diriyah&details="+encodeURIComponent(eventUrl)},
 {label:ar?"التقويم":"Calendar",description:ar?"تقويم Apple أو Outlook":"Apple or Outlook calendar",Icon:CalendarDays,href:"/events/wow-2026/event.ics"},
 {label:"WhatsApp",description:ar?"مشاركة عبر واتساب":"Share on WhatsApp",Icon:MessageCircle,href:"https://wa.me/?text="+encodeURIComponent("EO Riyadh WOW Event | "+eventUrl)},
 {label:"LinkedIn",description:ar?"مشاركة عبر LinkedIn":"Share on LinkedIn",Icon:Briefcase,href:"https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(eventUrl)},
 {label:"X",description:ar?"مشاركة عبر X":"Share on X",Icon:Share2,href:"https://twitter.com/intent/tweet?text="+encodeURIComponent("EO Riyadh WOW Event")+"&url="+encodeURIComponent(eventUrl)},
 {label:ar?"البريد":"Email",description:ar?"مشاركة الدعوة بالبريد الإلكتروني":"Share invitation by email",Icon:Mail,href:"mailto:?subject="+encodeURIComponent("EO Riyadh WOW Event")+"&body="+encodeURIComponent("Friday, December 11, 2026 | Golf Club Wadi Safar, Diriyah\n"+eventUrl)}
 ].map(({label,description,Icon,href})=><a key={label} aria-label={description} title={description} className="flex min-h-16 min-w-[76px] flex-1 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/10 px-2 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-cyan-300 sm:min-w-[90px]" href={href}><Icon size={21} aria-hidden="true"/><span>{label}</span></a>)}</div></section>
 <h2 className="mt-10 text-2xl font-bold">{ar?"اكتشف مجتمعنا":"Discover our community"}</h2>
 <div className="mt-4 flex flex-wrap gap-4"><Link className="font-bold text-indigo-700 underline" href="/register">{ar?"التسجيل في وصول":"Join Wosool"}</Link><Link className="font-bold text-indigo-700 underline" href="/eoa/account">{ar?"حساب مسرّعة EO":"EO Accelerator account"}</Link><a className="font-bold text-indigo-700 underline" href="https://eonetwork.org/chapter/riyadh">EO Riyadh</a></div>
 <p className="mt-5"><a href="mailto:info@wosool.org">info@wosool.org</a></p>
 </section><EventPartners slug="eo-riyadh-wow-2026" showEmpty /></main></PublicLayout>
}
