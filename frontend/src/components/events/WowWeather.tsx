"use client"

import { useLocale } from "@/lib/locale"

export function WowWeather() {
 const { locale } = useLocale()
 const ar = locale === "ar"
 const t = (a: string, e: string) => ar ? a : e
 return <section aria-labelledby="wow-weather-title" className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 id="wow-weather-title" className="text-2xl font-extrabold text-slate-900">{t("طقس الرياض في ديسمبر","December weather")}</h2><p className="mt-2 text-sm text-slate-600">{t("وادي صفار، الدرعية","Wadi Safar, Diriyah")}</p></div>
   <svg aria-hidden="true" viewBox="0 0 48 48" className="h-12 w-12 shrink-0" fill="none" strokeLinecap="round" strokeWidth="2.5"><circle cx="18" cy="17" r="8" stroke="#b45309"/><path d="M18 3v4M18 27v4M4 17h4M28 17h4M8 7l3 3M25 7l3 3" stroke="#b45309"/><path d="M14 39a8 8 0 1 1 2-15 11 11 0 0 1 21 3 6 6 0 1 1 1 12Z" fill="#f8fafc" stroke="#64748b"/></svg>
  </div>
  <p className="mt-5 text-sm font-semibold text-slate-700">{t("متوسطات مناخية تاريخية","Historical climate averages")}</p>
  <div className="mt-3 grid grid-cols-2 gap-3">
   <div className="rounded-xl bg-indigo-50 p-3"><p className="text-sm text-slate-600">{t("متوسط العظمى","Average high")}</p><p dir="ltr" className="mt-2 text-3xl font-extrabold text-indigo-950">22°C</p></div>
   <div className="rounded-xl bg-indigo-50 p-3"><p className="text-sm text-slate-600">{t("متوسط الصغرى","Average low")}</p><p dir="ltr" className="mt-2 text-3xl font-extrabold text-indigo-950">11°C</p></div>
  </div>
  <p className="mt-4 text-sm leading-7 text-slate-700">{t("يُنصح بجاكيت خفيف مساءً.","A light jacket is recommended after sunset.")}</p>
  <p className="mt-2 text-xs text-slate-600">{t("ليست توقعات يوم الفعالية.","Not an event-day forecast.")} <a className="underline" href="https://climopolis.com/en/saudi-arabia/riyadh">{t("المصدر","Source")}</a></p>
  <a className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-bold text-indigo-900" href="https://www.timeanddate.com/weather/saudi-arabia/riyadh/ext">{t("أحدث توقعات الرياض","Latest Riyadh forecast")}</a>
 </section>
}
