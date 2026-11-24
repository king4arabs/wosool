"use client"
import { useEffect,useState } from "react"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"

type Partner={name:string;logo_url:string;cta_link:string;type:string;published:boolean}
const blank=():Partner=>({name:"",logo_url:"",cta_link:"",type:"partner",published:false})
export function AdminEventPartners({eventId}:{eventId:string}){
 const {locale}=useLocale();const ar=locale==="ar";const t=(a:string,e:string)=>ar?a:e
 const [rows,setRows]=useState<Partner[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState(""),[retry,setRetry]=useState(0)
 useEffect(()=>{let active=true;setLoading(true);setError("");api.get<{data:Partner[]}>(`/admin/events/${eventId}/partners`).then(r=>{if(active){setRows(r.data.map(p=>({...blank(),name:p.name??"",logo_url:p.logo_url??"",cta_link:p.cta_link??"",type:p.type??"partner",published:p.published===true})));setLoading(false)}}).catch(()=>{if(active){setError("Unable to load partners / تعذر تحميل الشركاء");setLoading(false)}});return()=>{active=false}},[eventId,retry])
 function edit(i:number,patch:Partial<Partner>){setRows(old=>old.map((p,j)=>j===i?{...p,...patch}:p));setNotice("")}
 function move(i:number,delta:number){setRows(old=>{const next=[...old];const j=i+delta;if(j>=0&&j<next.length)[next[i],next[j]]=[next[j],next[i]];return next})}
 async function save(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError("");setNotice("");try{await api.put(`/admin/events/${eventId}/partners`,{partners:rows.map(p=>({...p,cta_link:p.cta_link||null}))});setNotice(t("تم حفظ الشركاء","Partners saved"))}catch(err){setError(err instanceof Error?err.message:t("تعذر الحفظ","Unable to save"))}finally{setBusy(false)}}
 return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><h3 className="text-xl font-bold">{t("الشركاء والرعاة","Partners & sponsors")}</h3>
 <p className="mt-2 text-sm text-slate-600">{t("أضف رابط شعار HTTPS معتمد وانشر الشركاء المؤكدين فقط.","Add an approved HTTPS logo URL and publish confirmed partners only.")}</p>
 {loading?<p role="status" className="mt-4">{t("جارٍ التحميل","Loading")}</p>:error&&!rows.length?<div className="mt-3"><p role="alert">{error}</p><button onClick={()=>setRetry(x=>x+1)} className="min-h-11 underline">{t("إعادة المحاولة","Retry")}</button></div>:<form onSubmit={save} className="mt-4 space-y-4"><fieldset disabled={busy} className="space-y-4">
 {rows.map((p,i)=><div key={i} className="grid min-w-0 gap-3 rounded-xl border p-3 sm:grid-cols-2">
 <label className="grid gap-1 text-sm">{t("الاسم","Name")}<input required maxLength={160} value={p.name} onChange={e=>edit(i,{name:e.target.value})} className="min-h-11 min-w-0 rounded-lg border px-3"/></label>
 <label className="grid gap-1 text-sm">{t("رابط الشعار","Logo URL")}<input required type="url" pattern="https://.+" value={p.logo_url} onChange={e=>edit(i,{logo_url:e.target.value})} className="min-h-11 min-w-0 rounded-lg border px-3" dir="ltr"/></label>
 <label className="grid gap-1 text-sm">{t("الموقع","Website")}<input type="url" pattern="https://.+" value={p.cta_link} onChange={e=>edit(i,{cta_link:e.target.value})} className="min-h-11 min-w-0 rounded-lg border px-3" dir="ltr"/></label>
 <label className="grid gap-1 text-sm">{t("الفئة","Category")}<select value={p.type} onChange={e=>edit(i,{type:e.target.value})} className="min-h-11 rounded-lg border px-3">{["partner","sponsor","venue","media","community"].map(v=><option key={v}>{v}</option>)}</select></label>
 <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={p.published} onChange={e=>edit(i,{published:e.target.checked})}/>{t("نشر الشريك المؤكد","Publish confirmed partner")}</label>
 <div className="flex flex-wrap gap-2"><button type="button" disabled={i===0} onClick={()=>move(i,-1)} className="min-h-11 rounded border px-2">{t("أعلى","Up")}</button><button type="button" disabled={i===rows.length-1} onClick={()=>move(i,1)} className="min-h-11 rounded border px-2">{t("أسفل","Down")}</button><button type="button" onClick={()=>setRows(old=>old.filter((_,j)=>j!==i))} className="min-h-11 rounded border px-2 text-red-700">{t("حذف","Remove")}</button></div>
 </div>)}
 <div className="flex flex-wrap gap-2"><button type="button" disabled={rows.length>=50} onClick={()=>setRows(old=>[...old,blank()])} className="min-h-11 rounded-lg border px-4">{t("إضافة شريك","Add partner")}</button><button type="submit" className="min-h-11 rounded-lg bg-indigo-700 px-4 font-bold text-white">{busy?t("جارٍ الحفظ","Saving"):t("حفظ","Save")}</button></div></fieldset>
 {error&&<p role="alert" className="break-words text-red-700">{error}</p>}{notice&&<p role="status" className="text-green-700">{notice}</p>}</form>}
 </section>
}
