"use client"
import { useState, type FormEvent } from "react"
import { useAuth } from "@/lib/auth"
import { api } from "@/lib/api"
import { useLocale } from "@/lib/locale"
import Link from "next/link"

export function WowRegistration() {
 const {user,isLoading,error:sessionError,refresh,login,register}=useAuth()
 const {locale}=useLocale()
 const ar=locale==="ar"
 const t=(a:string,e:string)=>ar?a:e
 const [mode,setMode]=useState<"login"|"register">("register")
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState("")
 const [notice,setNotice]=useState("")
 const [ticket,setTicket]=useState(false)
 const field="gateway-input"
 async function submit(e:FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if(busy)return
  setBusy(true);setError("");setNotice("")
  const f=new FormData(e.currentTarget)
  const val=(key:string)=>String(f.get(key)||"").trim()
  try {
   if(!user){
    const password=String(f.get("password")||"")
    if(mode==="login")await login(val("email"),password)
    else await register(val("name"),val("email"),password,String(f.get("confirmation")||""))
   }
   const result=await api.post<{registration:{ticket_email_sent_at:string|null},ticket_url:string}>("/wow-registration",{phone:val("phone"),company:val("company"),eo_interest:f.get("eo")==="yes",eoa_interest:f.get("eoa")==="yes",consent:f.get("consent")==="on"})
   setTicket(true)
   setNotice(t("تم حفظ التسجيل. أكمل الحجز في Luma، وأكّد بريدك لاحقاً لتفعيل العضوية بعد موافقة الإدارة.","Registration saved. Complete RSVP in Luma; verify your email separately for membership review."))
   if(result.ticket_url==="https://luma.com/8fccrqkx") window.location.assign(result.ticket_url)
  }catch(err){setError(err instanceof Error?err.message:t("تعذر إكمال الطلب","Unable to complete your request"))}
  finally{setBusy(false)}
 }
 return <section id="registration" className="scroll-mt-28 rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-8">
 <h2 className="text-2xl font-extrabold text-indigo-950">{t("سجّل وأكمل حجز تذكرتك","Register & complete your ticket")}</h2>
 <p className="mt-2 text-slate-600">{t("أكمل حجز التذكرة مباشرة بعد التسجيل. تفعيل العضوية يتطلب تأكيد البريد وموافقة الإدارة.","Complete ticket booking immediately after registration. Membership activation requires email verification and admin approval.")}</p>
 {isLoading?<p role="status" className="mt-4">{t("جارٍ التحقق من الحساب…","Checking your account…")}</p>:sessionError?<button className="gateway-button mt-4" onClick={()=>void refresh()}>{t("إعادة المحاولة","Retry")}</button>:ticket?<div className="mt-5 space-y-4" role="status"><p>{notice}</p><a className="gateway-button w-full" href="https://luma.com/8fccrqkx">{t("أكمل الحجز واستلم تذكرتك","Complete RSVP & get your ticket")}</a><p>{t("استخدم البريد نفسه في Luma. الحضور مشروط بموافقة المنظمين.","Use the same email in Luma. Attendance is subject to organizer approval.")}</p></div>:<form key={user?"details":mode} onSubmit={submit} className="mt-6 space-y-4" aria-busy={busy}>
 {!user?<><div className="flex flex-wrap gap-3"><button type="button" aria-pressed={mode==="register"} onClick={()=>setMode("register")} className="gateway-button-secondary">{t("حساب جديد","New account")}</button><button type="button" aria-pressed={mode==="login"} onClick={()=>setMode("login")} className="gateway-button-secondary">{t("حساب وصول أو EOA","Existing Wosool / EOA account")}</button></div>
 {mode==="register"&&<label className="gateway-label">{t("الاسم الكامل","Full name")}<input name="name" required maxLength={255} autoComplete="name" className={field}/></label>}
 <label className="gateway-label">{t("البريد الإلكتروني","Email")}<input name="email" type="email" required autoComplete="email" dir="ltr" className={field}/></label>
 <label className="gateway-label">{t("كلمة المرور","Password")}<input name="password" type="password" required minLength={mode==="register"?8:undefined} autoComplete={mode==="register"?"new-password":"current-password"} className={field}/></label>
 {mode==="register"?<><label className="gateway-label">{t("تأكيد كلمة المرور","Confirm password")}<input name="confirmation" type="password" required minLength={8} autoComplete="new-password" className={field}/></label><label className="flex items-start gap-2"><input type="checkbox" required/><span>{t("أوافق على","I agree to")} <Link href="/terms" className="underline">{t("الشروط","Terms")}</Link> · <Link href="/privacy" className="underline">{t("الخصوصية","Privacy")}</Link></span></label></>:<Link href="/forgot-password" className="underline">{t("نسيت كلمة المرور؟","Forgot password?")}</Link>}
 </>:<p>{user.name} · {user.email}</p>}
 <label className="gateway-label">{t("رقم الجوال","Phone")}<input name="phone" type="tel" dir="ltr" placeholder="+966" required autoComplete="tel" maxLength={50} className={field}/></label><label className="gateway-label">{t("الجهة / الشركة (اختياري)","Entity / Company (Optional)")}<input name="company" autoComplete="organization" maxLength={255} className={field}/></label>{[["eo",t("هل ترغب بمعلومات عن عضوية EO؟","Would you like information about EO membership?")],["eoa",t("هل ترغب بمعلومات عن مسرّعة EOA؟","Would you like information about EOA?")]].map(([name,label])=><fieldset key={name} className="rounded-xl border border-slate-200 p-4"><legend className="px-1 font-semibold">{label} <span className="text-sm font-normal text-slate-500">{t("(اختياري)","(Optional)")}</span></legend><div className="flex flex-wrap gap-6">{["yes","no","skip"].map(value=><label key={value} className="flex min-h-11 items-center gap-2"><input type="radio" name={name} value={value}/>{value==="yes"?t("نعم","Yes"):value==="no"?t("لا","No"):t("تخطي","Skip")}</label> )}</div></fieldset>)}<label className="flex gap-2"><input name="consent" type="checkbox" required/>{t("أوافق على حفظ بيانات التسجيل لإدارة الفعالية والتواصل بشأن الاهتمامات التي اخترتها.","I agree to storing registration data for event administration and follow-up on my selected interests.")}</label>
 {error&&<p role="alert" className="gateway-error">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <button className="gateway-button w-full" disabled={busy}>{busy?t("جارٍ المعالجة…","Please wait…"):t("حفظ ومتابعة حجز التذكرة","Save & complete RSVP")}</button>
 </form>}

 </section>
}
