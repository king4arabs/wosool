"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useLocale } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { StrategicHeaderCard } from "@/components/dashboard/StrategicHeaderCard"
import { FeedFilterBar } from "@/components/dashboard/FeedFilterBar"
import { SocietyPostCard, type SocietyPost } from "@/components/dashboard/SocietyPostCard"
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
  const { locale, direction } = useLocale()
  const ar = locale === "ar"
  const { toast } = useToast()
  const postId = Number(useSearchParams().get("post"))
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<SocietyPostForm>(INITIAL_FORM)
  const [posts, setPosts] = useState<SocietyPost[]>([])
  const [tab, setTab] = useState<"all" | "asks" | "offers">("all")
  const [sector, setSector] = useState("")
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null)
  const [deleteTargetPost, setDeleteTargetPost] = useState<SocietyPost | null>(null)
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number }>({ current_page: 1, last_page: 1, total: 0 })

  const loadPosts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setLoadError(null)
    try {
      if (postId > 0) {
        const response = await api.get<{ data: SocietyPost }>(`/member/society/posts/${postId}`, { signal })
        if (signal?.aborted) return
        setPosts([response.data]); setMeta({ current_page: 1, last_page: 1, total: 1 })
      } else {
        const response = await api.get<FeedResponse>("/member/society/posts", { params: { tab, sector, page, sort: "latest" }, signal })
        if (signal?.aborted) return
        setPosts(response.data ?? [])
        setMeta(response.meta ?? { current_page: 1, last_page: 1, total: response.data?.length ?? 0 })
      }
    } catch (error) { if (!signal?.aborted) setLoadError(error instanceof Error ? error.message : "Unable to load posts") }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, tab, sector, postId])

  useEffect(() => {
    const controller = new AbortController()
    void loadPosts(controller.signal)
    return () => controller.abort()
  }, [loadPosts])

  function actionError(error: unknown) { toast(error instanceof Error ? error.message : (ar ? "تعذر إتمام الإجراء." : "Unable to complete the action."), "error") }

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
      if (action === "save") {
        const saved = posts.find(post => post.id === postId)?.viewer_state?.saved
        if (saved) await api.delete(`/member/society/posts/${postId}/save`)
        else await api.post(`/member/society/posts/${postId}/save`)
      }
      if (action === "report") await api.post(`/member/society/posts/${postId}/report`, { reason: "review_needed" })
      if (action === "match") await api.post(`/member/society/posts/${postId}/ai-match`)
      await loadPosts()
    } catch (error) { actionError(error) } finally {
      setLoadingActionId(null)
    }
  }

  async function reactToPost(postId: number, reactionType: "like" | "insightful" | "support") {
    setLoadingActionId(postId)
    try {
      await api.post(`/member/society/posts/${postId}/reactions`, { reaction_type: reactionType })
      await loadPosts()
    } catch (error) { actionError(error) } finally {
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
    } catch (error) { actionError(error) } finally {
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
    toast(ar ? "تم نسخ الرابط." : "Link copied.", "success")
  }

  async function deletePost(postId: number) {
    setLoadingActionId(postId)
    try {
      await api.delete(`/member/society/posts/${postId}`)
      setDeleteTargetPost(null)
      await loadPosts()
    } catch (error) { actionError(error) } finally {
      setLoadingActionId(null)
    }
  }

  const counts = useMemo(() => {
    const all = posts.length
    const asks = posts.filter((p) => p.post_type === "ask").length
    const offers = posts.filter((p) => p.post_type === "offer").length
    return { all, asks, offers }
  }, [posts])

  return (
    <div className="relative min-h-screen antialiased bg-slate-50 text-slate-900 flex flex-col" dir={direction}>
      <main className="max-w-4xl w-full mx-auto flex-1 px-4 py-6 space-y-6">
        <StrategicHeaderCard
          badge="خلاصة التنفيذ الحية"
          title="مجتمع البُناة المشترك (Society Feed)"
          subtitle="شارك خبراتك وتحدياتك، وتواصل مع المؤسسين المناسبين."
          cta={
            <button id="openModalBtn" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors text-center shrink-0">
              + مشاركة طلب دعم أو إنجاز جديد
            </button>
          }
        />

        <FeedFilterBar tab={tab} onTab={value => { setPage(1); setTab(value) }} sector={sector} onSector={value => { setPage(1); setSector(value) }} counts={counts} />

        {postId > 0 && <Link href="/dashboard/society" className="underline">{ar ? "عرض جميع المنشورات" : "View all posts"}</Link>}
        {loading && <p role="status">{ar ? "جارٍ تحميل المنشورات…" : "Loading posts…"}</p>}
        {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p>{loadError}</p><button className="mt-3 underline" onClick={() => void loadPosts()}>{ar ? "إعادة المحاولة" : "Try again"}</button></div>}
        <div className="space-y-4">
          {posts.map((post) => (
            <SocietyPostCard
              key={post.id}
              post={post}
              onHelp={() => postAction(post.id, "help")}
              onSave={() => postAction(post.id, "save")}
              onReactSelect={(type) => reactToPost(post.id, type)}
              onComment={() => commentOnPost(post.id)}
              onShare={() => sharePost(post.id).catch(error => { if (!(error instanceof Error && error.name === "AbortError")) actionError(error) })}
              onReportOrDelete={() => {
                if (post.viewer_state?.is_owner) {
                  setDeleteTargetPost(post)
                  return
                }
                postAction(post.id, "report")
              }}
              onMatch={() => postAction(post.id, "match")}
              loading={loadingActionId === post.id}
            />
          ))}

          {!loading && !loadError && posts.length === 0 ? <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-500">لا توجد منشورات بعد. ابدأ أول منشور داخل المجتمع.</div> : null}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-xs">
          <button className="bg-white border border-slate-200 text-slate-600 py-2 px-3 rounded-md disabled:opacity-40" disabled={page <= 1 || loading || postId > 0} onClick={() => setPage(value => value - 1)}>الصفحة السابقة</button>
          <span className="text-slate-500 font-medium">عرض {posts.length} من أصل {meta.total} منشور</span>
          <button disabled={page >= meta.last_page || loading || postId > 0} onClick={() => setPage(value => value + 1)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-40">الصفحة التالية</button>
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

      {deleteTargetPost ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">تأكيد حذف المنشور</h3>
              <p className="mt-1 text-xs text-slate-500">سيتم أرشفة هذا المنشور ولن يظهر للأعضاء بعد الحذف.</p>
            </div>
            <div className="px-5 py-4">
              <p className="line-clamp-2 text-xs text-slate-600">&ldquo;{deleteTargetPost.title}&rdquo;</p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                onClick={() => setDeleteTargetPost(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => deletePost(deleteTargetPost.id)}
                disabled={loadingActionId === deleteTargetPost.id}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {loadingActionId === deleteTargetPost.id ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
