"use client"

import Link from "next/link"
import Image from "next/image"
import { CalendarDays, CalendarPlus, MessageCircle, Mail, Share2, Briefcase, MapPin, Clock, ArrowUpRight } from "lucide-react"
import { EventPartners } from "@/components/events/EventPartners"
import { WowWeather } from "@/components/events/WowWeather"
import { WowRegistration } from "@/components/events/WowRegistration"
import { EoaLogo } from "@/components/eoa/Logo"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { useLocale } from "@/lib/locale"

const eventUrl = "https://wosool.org/events/eo-riyadh-wow-2026"
const map = "https://maps.app.goo.gl/G4XGAB566UbG4Lsn9"
type AgendaTone = "regular" | "golf" | "maghrib" | "formal" | "isha" | "main" | "dinner"

const agenda: {time: string; en: string; ar: string; tone: AgendaTone; detailEn?: string; detailAr?: string}[] = [
 {time:"3:00 PM",en:"Welcome reception and open time for golf",ar:"استقبال الضيوف ووقت مفتوح للجولف",tone:"regular"},
 {time:"3:00–5:00 PM",en:"Golf Tournament",ar:"دورية جولف مبسطه",tone:"golf",detailEn:"First come, first served",detailAr:"الأولوية حسب أسبقية الحضور"},
 {time:"5:00 PM",en:"Maghrib prayer break",ar:"استراحة صلاة المغرب",tone:"maghrib"},
 {time:"5:30 PM",en:"Formal opening, introducing EO, and panel discussion",ar:"الافتتاح الرسمي والتعريف بـ EO وجلسة حوارية",tone:"formal"},
 {time:"6:30 PM",en:"Isha prayer break",ar:"استراحة صلاة العشاء",tone:"isha"},
 {time:"7:00 PM",en:"Learning event with special guests",ar:"لقاء تعليمي مع ضيوف مميزين",tone:"main"},
 {time:"8:00 PM",en:"Dinner and networking",ar:"العشاء والتواصل",tone:"dinner"},
 {time:"9:00–11:00 PM",en:"Open networking and activities",ar:"لقاءات وأنشطة مفتوحة",tone:"regular"},
]

const agendaStyles: Record<AgendaTone, {row:string; time:string; label:string}> = {
 regular: {row:"bg-white border-s-slate-200",time:"text-indigo-800",label:"text-slate-800"},
 golf: {row:"bg-emerald-50 border-s-emerald-600",time:"text-emerald-900",label:"font-bold text-emerald-950"},
 maghrib: {row:"bg-teal-50 border-s-teal-500",time:"text-teal-900",label:"font-semibold text-teal-950"},
 formal: {row:"bg-[#183a82] border-s-cyan-300",time:"text-cyan-100",label:"font-extrabold text-white"},
 isha: {row:"bg-violet-50 border-s-violet-500",time:"text-violet-900",label:"font-semibold text-violet-950"},
 main: {row:"bg-[#4b2078] border-s-fuchsia-300",time:"text-fuchsia-100",label:"font-extrabold text-white"},
 dinner: {row:"bg-rose-50 border-s-rose-500",time:"text-rose-900",label:"font-bold text-rose-950"},
}

export default function WowEventPage() {
 const { locale } = useLocale()
 const ar = locale === "ar"
 const action = "inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 font-bold text-indigo-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
 return <PublicLayout><div dir={ar ? "rtl" : "ltr"} className="bg-[#f5f7fb]">
 <section aria-labelledby="wow-title" className="relative isolate overflow-hidden bg-[#08163d] px-4 py-10 text-white sm:px-6 sm:py-14 lg:py-20">
 <Image src="/events/wow-2026/hero-golf-sunset.jpg" alt="" fill preload unoptimized sizes="100vw" className="z-0 object-cover object-[65%_center] sm:object-center" />
 <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none" style={{background: `linear-gradient(${ar ? "270deg" : "90deg"}, rgba(4,16,44,.90) 0%, rgba(4,16,44,.66) 45%, rgba(4,16,44,.20) 100%), linear-gradient(0deg, rgba(4,16,44,.78), transparent 85%)`}} />
 <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-300"/>
 <div className="relative z-20 mx-auto max-w-6xl">
 <EoaLogo inverse priority className="mb-4" />
 <p className="text-xs font-semibold tracking-wide text-cyan-100 sm:text-sm">{ar?"من تنظيم EO الرياض ومسرّعة EO":"EO Riyadh · EO Riyadh Accelerator"}</p>
 <h1 id="wow-title" className="mt-2 max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-extrabold leading-[1.12] tracking-tight">EO Riyadh <span className="text-cyan-300">WOW</span> Event</h1>
 <p className="mt-3 text-base font-medium text-white sm:text-xl">{ar?"تواصل. اكتشف. ألهم. انطلق.":"Connect. Discover. Inspire. Grow."}</p>
 <dl className="mt-6 grid max-w-4xl gap-2 sm:grid-cols-3 sm:gap-3">
 {[
 {label:ar?"التاريخ":"Date",value:ar?"الجمعة 11 ديسمبر 2026":"Fri, Dec 11, 2026",Icon:CalendarDays},
 {label:ar?"الموقع":"Venue",value:ar?"نادي جولف وادي صفار، الدرعية":"Golf Club Wadi Safar, Diriyah",Icon:MapPin},
 {label:ar?"الوقت":"Hours",value:ar?"٣ عصراً – ١١ مساءً":"3 PM – 11 PM",Icon:Clock}
 ].map(({label,value,Icon})=><div key={label} className="min-w-0 rounded-xl border border-white/25 bg-[#06132f]/80 p-3"><dt className="flex items-center gap-2 text-xs font-medium text-cyan-100"><Icon size={18} aria-hidden="true"/>{label}</dt><dd className="mt-1 text-sm font-bold leading-snug sm:text-base">{value}</dd></div>)}
 </dl>
 <p className="mt-3 text-sm font-medium text-white">{ar?"البرنامج الرسمي: ٥:٣٠–٨:٣٠ مساءً":"Official program: 5:30–8:30 PM"}</p>
 <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:gap-3"><a className={action} href="#registration">{ar?"احجز مكانك":"Reserve your place"}</a><a className={action+" !border !border-white/40 !bg-[#06132f]/80 !text-white"} href={map}>{ar?"الموقع والاتجاهات":"Location & directions"}</a></div>
 <p className="mt-3 text-xs leading-5 text-white sm:text-sm">{ar?"التسجيل المسبق وموافقة المنظمين مطلوبان.":"Advance RSVP and organizer approval required."}</p>
 </div></section>
 <nav aria-label={ar?"أقسام الفعالية":"Event sections"} className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto overscroll-x-contain px-4 py-2 text-sm font-semibold text-indigo-950 md:justify-center sm:gap-4">{[["agenda",ar?"البرنامج":"Agenda"],["dress",ar?"الزي":"Dress code"],["weather",ar?"الطقس":"Weather"],["partners",ar?"الشركاء":"Partners"],["actions",ar?"المشاركة":"Share & save"],["registration",ar?"التسجيل":"Register"]].map(([id,label])=><a key={id} href={"#"+id} className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg px-3 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">{label}</a>)}</div></nav>
 <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
 <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"><div className="min-w-0">
 <a href={map} className="mb-7 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
 <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-indigo-700">{ar?"الموقع":"Venue"}</p><p className="mt-1 font-bold text-indigo-950">Golf Club Wadi Safar</p><span className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">{ar?"الدرعية · الاتجاهات":"Diriyah · Directions"}<ArrowUpRight size={15} aria-hidden="true"/></span></div>
 <Image src="/events/wow-2026/location.svg" width={80} height={80} alt={ar?"رمز الاستجابة السريعة للموقع":"Venue directions QR code"} className="h-20 w-20 shrink-0"/>
 </a>
 <h2 id="agenda" className="scroll-mt-28 text-2xl font-extrabold text-indigo-950">{ar?"برنامج الفعالية":"Event agenda"}</h2>
 <ol aria-labelledby="agenda" className="mt-4 divide-y divide-slate-200/70 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{agenda.map((item)=>{
  const style=agendaStyles[item.tone]
  return <li key={item.time} className={`grid min-w-0 gap-1 border-s-4 px-3 py-3.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-3 sm:px-4 ${style.row}`}>
   <span dir="ltr" className={`text-start text-sm font-bold tabular-nums ${style.time}`}>{item.time}</span>
   <div className="min-w-0"><span className={`block break-words text-sm leading-6 ${style.label}`}>{ar?item.ar:item.en}</span>{item.detailEn&&<span className="mt-0.5 block text-xs font-semibold text-emerald-900">{ar?item.detailAr:item.detailEn}</span>}</div>
  </li>
 })}</ol>
 <p className="mt-2 text-xs text-slate-600">{ar?"الصلاة حسب التوقيت المحلي.":"Prayer times are local."}</p>
 <h2 id="dress" className="mt-10 scroll-mt-28 text-2xl font-bold">{ar?"الزي المقترح":"Dress code"}</h2>
 <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
 {[
  {title: ar?"الرجال":"Men", items:[{label:ar?"ملابس عمل":"Business Smart",x:9.26},{label:ar?"ثوب سعودي":"Saudi Thobe",x:23.94},{label:ar?"ملابس جولف":"Golf Attire",x:38.82}]},
  {title: ar?"النساء":"Women", items:[{label:ar?"ملابس عمل":"Business Smart",x:62.07},{label:ar?"عباءة أنيقة":"Elegant Abaya",x:77.71},{label:ar?"ملابس جولف":"Golf Attire",x:93.01}]}
 ].map(group=><div key={group.title} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"><h3 className="font-bold text-indigo-950">{group.title}</h3>
 <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">{group.items.map(item=><figure key={item.label} className="m-0 min-w-0 text-center">
 <div aria-hidden="true" className="mx-auto aspect-[19/34] w-full max-w-[108px] rounded-lg bg-[#091b49] bg-no-repeat" style={{backgroundImage:"url('/events/wow-2026/dress-avatars.jpg')",backgroundSize:"867.37% 272.94%",backgroundPosition:`${item.x}% 61.22%`}} />
 <figcaption className="mt-2 break-words text-xs font-semibold leading-snug text-slate-800">{item.label}</figcaption>
 </figure>)}</div></div>)}
 </div>
 <p className="mt-3 text-sm text-slate-600">{ar?"للجولف: بولو، بنطال طويل وحذاء مناسب للملعب.":"Golf: polo shirt, full-length trousers and suitable golf shoes."}</p>
 <div id="weather" className="scroll-mt-28"><WowWeather /></div>
 </div><aside className="min-w-0 lg:sticky lg:top-24"><WowRegistration /></aside></div>
 <section id="actions" className="mt-10 scroll-mt-28 rounded-3xl bg-[#101e50] p-5 text-white sm:p-8"><h2 className="text-2xl font-bold">{ar?"احفظ وشارك الفعالية":"Save & share the event"}</h2><div className="mt-4 flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-2 sm:gap-3" aria-label={ar?"اختصارات حفظ ومشاركة الفعالية":"Event save and share shortcuts"}>{[
 {label:"Google",description:"Google Calendar",Icon:CalendarPlus,href:"https://calendar.google.com/calendar/render?action=TEMPLATE&text=EO%20Riyadh%20WOW%20Event&dates=20261211T120000Z%2F20261211T200000Z&location=Golf%20Club%20Wadi%20Safar%2C%20Diriyah&details="+encodeURIComponent(eventUrl)},
 {label:ar?"التقويم":"Calendar",description:ar?"تقويم Apple أو Outlook":"Apple or Outlook calendar",Icon:CalendarDays,href:"/events/wow-2026/event.ics"},
 {label:"WhatsApp",description:ar?"مشاركة عبر واتساب":"Share on WhatsApp",Icon:MessageCircle,href:"https://wa.me/?text="+encodeURIComponent("EO Riyadh WOW Event | "+eventUrl)},
 {label:"LinkedIn",description:ar?"مشاركة عبر LinkedIn":"Share on LinkedIn",Icon:Briefcase,href:"https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(eventUrl)},
 {label:"X",description:ar?"مشاركة عبر X":"Share on X",Icon:Share2,href:"https://twitter.com/intent/tweet?text="+encodeURIComponent("EO Riyadh WOW Event")+"&url="+encodeURIComponent(eventUrl)},
 {label:ar?"البريد":"Email",description:ar?"مشاركة الدعوة بالبريد الإلكتروني":"Share invitation by email",Icon:Mail,href:"mailto:?subject="+encodeURIComponent("EO Riyadh WOW Event")+"&body="+encodeURIComponent("Friday, December 11, 2026 | Golf Club Wadi Safar, Diriyah\n"+eventUrl)}
 ].map(({label,description,Icon,href})=><a key={label} aria-label={label + " · " + description} title={description} className="flex min-h-16 min-w-[76px] flex-1 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/10 px-2 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-cyan-300 sm:min-w-[90px]" href={href}><Icon size={21} aria-hidden="true"/><span>{label}</span></a>)}</div></section>
 <h2 className="mt-8 text-lg font-bold text-indigo-950">{ar?"مجتمعنا":"Our community"}</h2>
 <div className="mt-4 flex flex-wrap gap-4"><Link className="font-bold text-indigo-700 underline" href="/register">{ar?"التسجيل في وصول":"Join Wosool"}</Link><Link className="font-bold text-indigo-700 underline" href="/eoa/account">{ar?"حساب مسرّعة EO":"EO Accelerator account"}</Link><a className="font-bold text-indigo-700 underline" href="https://eonetwork.org/chapter/riyadh">EO Riyadh</a></div>
 <p className="mt-3 text-sm"><a className="font-medium text-indigo-700 underline" href="mailto:info@wosool.org">info@wosool.org</a></p>
 </section><EventPartners slug="eo-riyadh-wow-2026" showEmpty /></div></PublicLayout>
}
