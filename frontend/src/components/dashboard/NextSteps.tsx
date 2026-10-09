import Link from 'next/link'

export default function NextSteps({ ar, profileCompletion, companyCompletion, pendingIntros }: { ar: boolean; profileCompletion?: number; companyCompletion?: number; pendingIntros?: number }) {
  const items = [
    { href: '/dashboard/profile', title: ar ? 'ملفك كمؤسس' : 'Your founder profile', body: ar ? 'عرّف المجتمع بخبراتك وأهدافك وما يمكنك تقديمه.' : 'Share your experience, goals and what you can offer the community.', progress: profileCompletion },
    { href: '/dashboard/company', title: ar ? 'شركتك وفرص التعاون' : 'Your company & opportunities', body: ar ? 'حدّث معلومات شركتك لتسهيل اكتشاف فرص التعاون.' : 'Keep your company information current so founders can discover opportunities to collaborate.', progress: companyCompletion },
    { href: pendingIntros ? '/dashboard/matches' : '/dashboard/directory', title: pendingIntros ? (ar ? 'طلبات التعارف بانتظارك' : 'Introductions awaiting you') : (ar ? 'تعرّف إلى المؤسسين' : 'Meet fellow founders'), body: pendingIntros ? (ar ? 'راجع طلبات التعارف وتابع الخطوة التالية.' : 'Review introduction requests and take the next step.') : (ar ? 'ابحث عن مؤسسين واطلب تعارفاً مناسباً لأهدافك.' : 'Discover founders and request an introduction aligned with your goals.') },
  ]
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="member-next-steps">
    <h2 id="member-next-steps" className="text-lg font-bold text-slate-900">{ar ? 'ابدأ بخطوة تصنع فرقاً' : 'Make your next connection count'}</h2>
    <p className="mt-2 text-sm text-slate-600">{ar ? 'ملف واضح، شركة معروفة، وعلاقات ذات قيمة.' : 'A clear profile, a visible company and meaningful relationships.'}</p>
    <div className="mt-5 grid gap-4 lg:grid-cols-3">{items.map((item, i) => <Link key={item.href} href={item.href} className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
      <span className="text-sm font-bold text-blue-700">0{i + 1}</span><h3 className="mt-2 font-bold text-slate-900">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
      {typeof item.progress === 'number' && Number.isFinite(item.progress) && <div className="mt-4"><progress className="h-2 w-full accent-blue-600" max={100} value={Math.min(100, Math.max(0, item.progress))} aria-label={item.title} /><span className="text-xs text-slate-600">{Math.round(Math.min(100, Math.max(0, item.progress)))}% {ar ? 'مكتمل' : 'complete'}</span></div>}
      <span className="mt-4 inline-block text-sm font-bold text-blue-700">{ar ? 'فتح' : 'Open'}<span className="sr-only"> {item.title}</span></span>
    </Link>)}</div>
    <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">{[['/dashboard/events', ar ? 'الفعاليات القادمة' : 'Upcoming events'], ['/dashboard/messages', ar ? 'رسائلي' : 'My messages'], ['/dashboard/eoa', 'EO Riyadh Accelerator']].map(([href, label]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200">{label}</Link>)}</div>
  </section>
}
