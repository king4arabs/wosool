"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { StrategicHeaderCard } from "@/components/dashboard/StrategicHeaderCard"
import { FeedFilterBar } from "@/components/dashboard/FeedFilterBar"
import { SocietyPostCard, type SocietyPost } from "@/components/dashboard/SocietyPostCard"
import { SocietyAutoUpdateBanner } from "@/components/dashboard/SocietyAutoUpdateBanner"
import { SocietyComposerModal, type SocietyPostForm } from "@/components/dashboard/SocietyComposerModal"

type FeedResponse = {
  data: SocietyPost[]
  meta?: { current_page: number; last_page: number; total: number }
}

const INITIAL_FORM: SocietyPostForm = {
  post_type: "ask",
  title: "",
  content: "",
  sector: "fintech",
  priority: "normal",
}

export default function SocietyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<SocietyPostForm>(INITIAL_FORM)
  const [posts, setPosts] = useState<SocietyPost[]>([])
  const [tab, setTab] = useState<"all" | "asks" | "offers">("all")
  const [sector, setSector] = useState("")
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null)
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number }>({ current_page: 1, last_page: 1, total: 0 })

  async function loadPosts() {
    const params: Record<string, string> = { tab, sort: "latest" }
    if (sector) params.sector = sector
    const res = await api.get<FeedResponse>("/member/society/posts", { params })
    setPosts(res.data ?? [])
    setMeta(res.meta ?? { current_page: 1, last_page: 1, total: res.data?.length ?? 0 })
  }

  useEffect(() => {
    loadPosts().catch(() => setPosts([]))
  }, [tab, sector])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const payload = {
        post_type: form.post_type,
        title: form.title.trim(),
        content: form.content.trim(),
        sector: form.sector,
        priority: form.priority,
      }
      const response = await api.post<{ data: SocietyPost }>("/member/society/posts", payload)
      setPosts((prev) => [response.data, ...prev])
      setForm(INITIAL_FORM)
      setIsModalOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "تعذر إرسال المنشور الآن.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function postAction(postId: number, action: "help" | "save" | "report" | "match") {
    setLoadingActionId(postId)
    try {
      if (action === "help") await api.post(`/member/society/posts/${postId}/help-offers`, { message: "أستطيع المساعدة" })
      if (action === "save") await api.post(`/member/society/posts/${postId}/save`)
      if (action === "report") await api.post(`/member/society/posts/${postId}/report`, { reason: "review_needed" })
      if (action === "match") await api.post(`/member/society/posts/${postId}/ai-match`)
      await loadPosts()
    } finally {
      setLoadingActionId(null)
    }
  }

  async function reactToPost(postId: number) {
    setLoadingActionId(postId)
    try {
      await api.post(`/member/society/posts/${postId}/reactions`, { reaction_type: "like" })
      await loadPosts()
    } finally {
      setLoadingActionId(null)
    }
  }

  async function commentOnPost(postId: number) {
    const content = window.prompt("اكتب تعليقك")
    if (!content || !content.trim()) return
    setLoadingActionId(postId)
    try {
      await api.post(`/member/society/posts/${postId}/comments`, { content: content.trim() })
      await loadPosts()
    } finally {
      setLoadingActionId(null)
    }
  }

  async function sharePost(postId: number) {
    const url = `${window.location.origin}/dashboard/society?post=${postId}`
    if (navigator.share) {
      await navigator.share({ title: "Wosool Society Post", url })
      return
    }
    await navigator.clipboard.writeText(url)
  }

  const counts = useMemo(() => {
    const all = posts.length
    const asks = posts.filter((p) => p.post_type === "ask").length
    const offers = posts.filter((p) => p.post_type === "offer").length
    return { all, asks, offers }
  }, [posts])

  return (
    <div className="relative min-h-screen antialiased bg-slate-50 text-slate-900 flex flex-col" dir="rtl">
      <main className="max-w-4xl w-full mx-auto flex-1 px-4 py-6 space-y-6">
        <StrategicHeaderCard
          badge="خلاصة التنفيذ الحية"
          title="مجتمع البُناة المشترك (Society Feed)"
          subtitle="تبادل مباشر وعالي الإشارة للمسائل التشغيلية اليومية والمطابقة الفورية عبر الـ AI."
          cta={
            <button id="openModalBtn" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors text-center shrink-0">
              + مشاركة طلب دعم أو إنجاز جديد
            </button>
          }
        />

        <FeedFilterBar tab={tab} onTab={setTab} sector={sector} onSector={setSector} counts={counts} />

        <div className="space-y-4">
          {posts.map((post) => (
            <SocietyPostCard
              key={post.id}
              post={post}
              onHelp={() => postAction(post.id, "help")}
              onSave={() => postAction(post.id, "save")}
              onReact={() => reactToPost(post.id)}
              onComment={() => commentOnPost(post.id)}
              onShare={() => sharePost(post.id).catch(() => null)}
              onReport={() => postAction(post.id, "report")}
              onMatch={() => postAction(post.id, "match")}
              loading={loadingActionId === post.id}
            />
          ))}

          {posts.length === 0 ? <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-500">لا توجد منشورات بعد. ابدأ أول منشور داخل المجتمع.</div> : null}

          <SocietyAutoUpdateBanner
            title="تحديث المنصة: تم رصد إنجازات جديدة في المجتمع وسيتم تحديث المطابقات آليًا."
            subtitle="يتم تحديث قراءة المجتمع ومؤشرات بطاقة الأداء عند توفر إشارات تشغيلية جديدة."
            cta="إرسال تهنئة فورية"
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-xs">
          <button className="bg-white border border-slate-200 text-slate-400 py-1.5 px-3 rounded-md cursor-not-allowed" disabled>الصفحة السابقة</button>
          <span className="text-slate-500 font-medium">عرض {posts.length} من أصل {meta.total} منشور</span>
          <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-1.5 px-3 rounded-md transition-colors">الصفحة التالية</button>
        </div>
      </main>

      <SocietyComposerModal
        open={isModalOpen}
        form={form}
        setForm={setForm}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  )
}
