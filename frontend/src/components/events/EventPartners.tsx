"use client"
import { useEffect, useRef, useState } from "react"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Partner = {name:string;logo_url:string;cta_link?:string|null}
export function EventPartners({slug,showEmpty=false}:{slug:string;showEmpty?:boolean}) {
 const {locale}=useLocale()
 const ar=locale==="ar"
 const [partners,setPartners]=useState<Partner[]>([])
 const rail=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  let active=true
  const controller=new AbortController()
  api.get<{data:{sponsor_partner_blocks?:Partner[]}}>(`/events/${encodeURIComponent(slug)}`,{signal:controller.signal,cache:"no-store"}).then(r=>{if(active)setPartners((r.data.sponsor_partner_blocks??[]).filter(p=>p.name&&p.logo_url?.startsWith("https://")))}).catch(()=>{if(active)setPartners([])})
  return()=>{active=false;controller.abort()}
 },[slug])
 if(!partners.length&&!showEmpty)return null
 return <section id="partners" aria-labelledby="event-partners-title" className="mt-4 scroll-mt-28 border-t border-slate-200 bg-white px-4 py-8 sm:px-6 sm:py-10">
 <div className="mx-auto max-w-6xl">
 <h2 id="event-partners-title" className="text-center text-2xl font-extrabold text-indigo-950">{ar?"شركاؤنا":"Our Partners"}</h2>
 {partners.length?<div className="mt-5 flex min-w-0 items-center gap-2">
 <button type="button" aria-label={ar?"السابق":"Previous logos"} onClick={()=>rail.current?.scrollBy({left:-240,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200"><ChevronLeft aria-hidden="true"/></button>
 <div ref={rail} dir="ltr" tabIndex={0} aria-label={ar?"شعارات الشركاء":"Partner logos"} className="flex min-w-0 flex-1 snap-x gap-4 overflow-x-auto py-3">
 {partners.map((p,i)=><div key={p.name+"-"+i} className="flex h-24 w-36 shrink-0 snap-center items-center justify-center rounded-xl border border-slate-100 bg-white p-4 sm:w-44">
 {p.cta_link?.startsWith("https://")?<a href={p.cta_link} target="_blank" rel="noopener noreferrer" className="flex h-full w-full items-center justify-center"><PartnerLogo partner={p}/></a>:<PartnerLogo partner={p}/>}
 </div>)}
 </div>
 <button type="button" aria-label={ar?"التالي":"Next logos"} onClick={()=>rail.current?.scrollBy({left:240,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200"><ChevronRight aria-hidden="true"/></button>
 </div>:<div className="mt-4 text-center"><a href="mailto:info@wosool.org" className="inline-flex min-h-11 items-center rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-900">{ar?"استفسارات الشراكة":"Partnership enquiries"}</a></div>}
 </div></section>
}
function PartnerLogo({partner}:{partner:Partner}){
 const [failed,setFailed]=useState(false)
 if(failed) return <span className="text-center text-sm font-semibold">{partner.name}</span>
 // Partner logos are external URLs entered by administrators; next/image would need every host allowlisted.
 // eslint-disable-next-line @next/next/no-img-element
 return <img src={partner.logo_url} alt={partner.name} loading="lazy" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" onError={()=>setFailed(true)}/>
}
