"use client"

import Link from "next/link"
import Image from "next/image"
import { WowWeather } from "@/components/events/WowWeather"
import { WowRegistration } from "@/components/events/WowRegistration"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { useLocale } from "@/lib/locale"

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
 return <PublicLayout><main dir={ar ? "rtl" : "ltr"}>
 <section className="bg-gradient-to-br from-[#08163d] via-[#202b77] to-[#51218b] px-5 py-16 text-white sm:py-24">
 <div className="mx-auto max-w-5xl">
 <p className="text-lg font-bold">EO Riyadh · EO Riyadh Accelerator</p>
 <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">EO Riyadh <span className="text-cyan-300">WOW</span> Event</h1>
 <p className="mt-4 text-xl">Connect. Discover. Inspire. Grow.</p>
 <div className="mt-8 grid gap-4 sm:grid-cols-3">
 {[[ar?"التاريخ":"Date",ar?"الجمعة 11 ديسمبر 2026":"Friday, December 11, 2026"],[ar?"الموقع":"Venue","Golf Club Wadi Safar, Diriyah"],[ar?"الوقت":"Hours","2:00 PM – Midnight"]].map(([label,value])=><div key={label} className="rounded-2xl border border-white/30 p-4"><p className="text-sm text-cyan-200">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}
 </div>
 <p className="mt-4 font-semibold">{ar?"البرنامج الرسمي: 5:30–8:30 مساءً":"Official program: 5:30–8:30 PM"}</p>
 <div className="mt-7 flex flex-wrap gap-3"><a className={action} href="#registration">{ar?"احجز مكانك":"Reserve your place"}</a><a className={action} href={map}>{ar?"الموقع والاتجاهات":"Location & directions"}</a></div>
 <p className="mt-4 text-sm">{ar?"التسجيل المسبق مطلوب والحضور مشروط بتأكيد اللجنة المنظمة.":"Advance registration is required. Attendance is subject to confirmation by the organizing committee."}</p>
 </div></section>
 <section className="mx-auto max-w-5xl px-5 py-12">
 <WowRegistration />
 <div className="mb-10 mt-10 grid gap-5 sm:grid-cols-2">{[["#registration","registration",ar?"سجّل عبر وصول":"Register with Wosool"],[map,"location",ar?"امسح للوصول للموقع":"Scan for directions"]].map(([href,id,label])=><a key={id} href={href} className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 p-5 text-center font-bold">{id==="location"?<Image src="/events/wow-2026/location.svg" width={160} height={160} alt={label}/>:<span className="flex min-h-40 items-center text-xl text-indigo-800">{ar?"ابدأ التسجيل":"Start registration"}</span>}{label}</a>)}</div>
 <h2 className="text-2xl font-bold">{ar?"برنامج الفعالية":"Event agenda"}</h2>
 <div className="mt-5 divide-y rounded-2xl border border-slate-200">{agenda.map(([time,en,arabic])=><div key={time} className="grid gap-2 p-4 sm:grid-cols-[180px_1fr]"><span dir="ltr" className="font-bold text-indigo-800">{time}</span><span>{ar?arabic:en}</span></div>)}</div>
 <p className="mt-3 text-sm text-slate-600">{ar?"استراحات الصلاة حسب التوقيت المحلي.":"Prayer breaks follow local prayer times."}</p>
 <h2 className="mt-10 text-2xl font-bold">{ar?"الزي المقترح":"Dress code"}</h2><p className="mt-3">{ar?"ملابس عمل أنيقة، مع إمكانية ارتداء الثوب السعودي والعباءة.":"Business Smart, with optional Saudi traditional attire (Thobe and Abaya)."}</p>
 <WowWeather />
 <h2 className="mt-10 text-2xl font-bold">{ar?"اكتشف مجتمعنا":"Discover our community"}</h2>
 <div className="mt-4 flex flex-wrap gap-4"><Link className="font-bold text-indigo-700 underline" href="/register">{ar?"التسجيل في وصول":"Join Wosool"}</Link><Link className="font-bold text-indigo-700 underline" href="/eoa/account">{ar?"حساب مسرّعة EO":"EO Accelerator account"}</Link><a className="font-bold text-indigo-700 underline" href="https://eonetwork.org/chapter/riyadh">EO Riyadh</a></div>
 <p className="mt-5"><a href="mailto:info@wosool.org">info@wosool.org</a></p>
 </section></main></PublicLayout>
}
