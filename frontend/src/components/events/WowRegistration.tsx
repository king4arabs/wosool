"use client"
import { useEffect, useState, type FormEvent } from "react"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import Link from "next/link"

export function WowRegistration() {
 const {user,isLoading,error:sessionError,refresh,login}=useAuth()
 const {locale}=useLocale()
 const ar=locale==="ar"
 const t=(a:string,e:string)=>ar?a:e
 const [mode,setMode]=useState<"login"|"register">("register")
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState("")
 const [notice,setNotice]=useState("")
 const [ticket,setTicket]=useState(false)
 const [saved,setSaved]=useState<{phone:string;company:string;eo_interest:boolean|number;eoa_interest:boolean|number;ticket_email_sent_at:string|null}|null>(null)
 const [recovery,setRecovery]=useState(false)
 const [recoveryError,setRecoveryError]=useState(false)
 useEffect(()=>{
  if(!user?.id)return
  let active=true
  api.get<{registration:typeof saved,ticket_url:string|null}>("/wow-registration",{cache:"no-store"}).then(result=>{if(active){setSaved(result.registration);setRecovery(true);setRecoveryError(false)}}).catch(()=>{if(active){setRecovery(true);setRecoveryError(true)}})
  return ()=>{active=false}
 },[user?.id])
 const field="gateway-input !w-full !min-w-0 !min-h-12 !text-base rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
 const button="gateway-button !w-full !min-h-12 !whitespace-normal !text-center !leading-6"
 const secondary="gateway-button-secondary !w-full !min-w-0 !min-h-12 !whitespace-normal !text-center !leading-6"
 async function submit(e:FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if(busy)return
  setBusy(true);setError("");setNotice("")
  const f=new FormData(e.currentTarget)
  const val=(key:string)=>String(f.get(key)||"").trim()
  try {
   const details={phone:val("phone"),company:val("company"),eo_interest:f.get("eo")==="yes",eoa_interest:f.get("eoa")==="yes",consent:f.get("consent")==="on"}
   type Handoff={registration:{ticket_email_sent_at:string|null},ticket_url:string}
   let result:Handoff
   if(!user&&mode==="register"){
    result=await api.post<Handoff>("/auth/wow-register",{...details,name:val("name"),email:val("email"),password:String(f.get("password")||""),password_confirmation:String(f.get("confirmation")||""),account_consent:f.get("account_consent")==="on"})
   }else{
    if(!user)await login(val("email"),String(f.get("password")||""))
    result=await api.post<Handoff>("/wow-registration",details)
   }
   if(result.ticket_url!=="https://luma.com/8fccrqkx")throw new Error(t("تعذر فتح رابط الحجز. يرجى المحاولة مجدداً.","Unable to open the RSVP link. Please try again."))
   setTicket(true)
   setNotice(t("تم التسجيل. جارٍ الانتقال لحجز التذكرة…","Registered. Opening ticket booking…"))
   window.location.assign(result.ticket_url)
  }catch(err){setError(err instanceof Error?err.message:t("تعذر إكمال الطلب","Unable to complete your request"))}
  finally{setBusy(false)}
 }
 return <section id="registration" aria-labelledby="wow-registration-title" className="min-w-0 scroll-mt-28 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
 <h2 id="wow-registration-title" className="text-xl font-extrabold leading-snug text-indigo-950 sm:text-2xl">{t("احجز مكانك","Reserve your place")}</h2>
 <p className="mt-2 text-slate-600">{t("التسجيل ثم حجز التذكرة عبر Luma.","Register, then complete your RSVP on Luma.")}</p>
 {isLoading?<p role="status" className="mt-4 text-sm text-slate-600">{t("جارٍ التحميل…","Loading…")}</p>:sessionError?<button className={button+" mt-4"} onClick={()=>void refresh()}>{t("إعادة المحاولة","Retry")}</button>:user&&!recovery&&!busy?<p role="status" className="mt-4">{t("جارٍ تحميل التسجيل…","Loading registration…")}</p>:ticket?<div className="mt-5 space-y-4" role="status"><p>{notice}</p><a className={button} href="https://luma.com/8fccrqkx">{t("متابعة الحجز في Luma","Continue to Luma")}</a><p>{t("استخدم البريد نفسه. الحضور بعد موافقة المنظمين.","Use the same email. Organizer approval required.")}</p></div>:<form key={user?"details-"+(saved?"saved":"new"):mode} onSubmit={submit} className="mt-5 min-w-0 space-y-4" aria-busy={busy}><fieldset disabled={busy} className="min-w-0 space-y-4">
 {!user?<><div role="group" aria-label={t("نوع الحساب","Account type")} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><button type="button" aria-pressed={mode==="register"} onClick={()=>setMode("register")} disabled={busy} className={secondary+(mode==="register"?" !border-indigo-600 !bg-indigo-50 !text-indigo-950":"")}>{t("حساب جديد","New account")}</button><button type="button" aria-pressed={mode==="login"} onClick={()=>setMode("login")} disabled={busy} className={secondary+(mode==="login"?" !border-indigo-600 !bg-indigo-50 !text-indigo-950":"")}>{t("حساب حالي","Existing account")}</button></div>
 {mode==="register"&&<label className="gateway-label">{t("الاسم الكامل","Full name")}<input name="name" required maxLength={255} autoComplete="name" className={field}/></label>}
 <label className="gateway-label">{t("البريد الإلكتروني","Email")}<input name="email" type="email" required autoComplete="email" dir="ltr" className={field}/></label>
 <label className="gateway-label">{t("كلمة المرور","Password")}<input name="password" type="password" required minLength={mode==="register"?8:undefined} autoComplete={mode==="register"?"new-password":"current-password"} className={field}/></label>
 {mode==="register"?<><label className="gateway-label">{t("تأكيد كلمة المرور","Confirm password")}<input name="confirmation" type="password" required minLength={8} autoComplete="new-password" className={field}/></label><label className="flex min-h-12 items-start gap-3 text-sm leading-6"><input name="account_consent" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-indigo-700" required/><span>{t("أوافق على","I agree to")} <Link href="/terms" className="underline">{t("الشروط","Terms")}</Link> · <Link href="/privacy" className="underline">{t("الخصوصية","Privacy")}</Link></span></label></>:<Link href="/forgot-password" className="inline-flex min-h-11 items-center underline">{t("نسيت كلمة المرور؟","Forgot password?")}</Link>}
 </>:<p className="break-all rounded-xl bg-indigo-50 p-3 text-sm text-indigo-950">{user.name} · {user.email}</p>}
 <label className="gateway-label">{t("رقم الجوال","Phone")}<input name="phone" defaultValue={saved?.phone||""} type="tel" dir="ltr" placeholder="+966" required autoComplete="tel" maxLength={50} className={field}/></label><label className="gateway-label">{t("الجهة / الشركة (اختياري)","Entity / Company (Optional)")}<input name="company" defaultValue={saved?.company||""} autoComplete="organization" maxLength={255} className={field}/></label>{[["eo",t("الاهتمام بعضوية EO","EO membership interest")],["eoa",t("الاهتمام بمسرّعة EOA","EO Accelerator interest")]].map(([name,label])=><fieldset key={name} className="min-w-0 rounded-xl border border-slate-200 p-3 sm:p-4"><legend className="px-1 font-semibold">{label} <span className="text-sm font-normal text-slate-500">{t("(اختياري)","(Optional)")}</span></legend><div className="grid grid-cols-3 gap-1 sm:gap-2">{["yes","no","skip"].map(value=><label key={value} className="flex min-h-12 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200 px-1 text-sm has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"><input type="radio" className="h-4 w-4 shrink-0 accent-indigo-700" name={name} value={value} defaultChecked={!!saved && value===(Boolean(name==="eo"?saved.eo_interest:saved.eoa_interest)?"yes":"no")}/>{value==="yes"?t("نعم","Yes"):value==="no"?t("لا","No"):t("تخطي","Skip")}</label> )}</div></fieldset>)}<label className="flex min-h-12 items-start gap-3 text-sm leading-6"><input name="consent" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-indigo-700" required/>{t("أوافق على حفظ بيانات التسجيل لإدارة الفعالية والتواصل بشأن الاهتمامات التي اخترتها.","I agree to storing registration data for event administration and follow-up on my selected interests.")}</label>
 {recoveryError&&<p role="status" className="text-sm text-slate-600">{t("تعذر تحميل بيانات التسجيل السابقة. يمكنك المتابعة.","Previous registration unavailable. You may continue.")}</p>}
 {error&&<p role="alert" className="gateway-error break-words">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <button className={button} disabled={busy}>{busy?t("جارٍ المعالجة…","Please wait…"):t("التسجيل ومتابعة الحجز","Register & continue")}</button>
 </fieldset><p className="mt-3 text-xs leading-5 text-slate-600">{t("العضوية: تأكيد البريد وموافقة الإدارة.","Membership requires email verification and admin approval.")}</p></form>}

 </section>
}
