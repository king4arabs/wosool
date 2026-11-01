"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useLocale } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { StrategicHeaderCard } from "@/components/dashboard/StrategicHeaderCard"
import { FeedFilterBar } from "@/components/dashboard/FeedFilterBar"
import { SocietyPostCard, type SocietyPost } from "@/components/dashboard/SocietyPostCard"
import { SocietyComposerModal, type SocietyPostForm } from "@/components/dashboard/SocietyComposerModal"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { societyFeed, societyShowing, societyTabCounts, type SocietyCounts, type SocietyTab } from "@/lib/society-feed"

type FeedResponse = {
  data: SocietyPost[]
  meta?: { current_page: number; last_page: number; total: number; counts?: SocietyCounts }
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
  const copy = societyFeed(locale)
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
  const [tab, setTab] = useState<SocietyTab>("all")
  const [sector, setSector] = useState("")
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null)
  const [deleteTargetPost, setDeleteTargetPost] = useState<SocietyPost | null>(null)
  const [meta, setMeta] = useState<NonNullable<FeedResponse["meta"]>>({ current_page: 1, last_page: 1, total: 0 })

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
    } catch (error) { if (!signal?.aborted) setLoadError(error instanceof Error && error.message ? error.message : copy.loadFailed) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, tab, sector, postId, copy.loadFailed])

  useEffect(() => {
    const controller = new AbortController()
    void loadPosts(controller.signal)
    return () => controller.abort()
  }, [loadPosts])

  function actionError(error: unknown) { toast(error instanceof Error && error.message ? error.message : copy.actionFailed, "error") }

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
      await api.post<{ data: SocietyPost }>("/member/society/posts", payload)
      setForm(INITIAL_FORM)
      setIsModalOpen(false)
      // Reload so the new post, page totals and tab badges all agree.
      if (page === 1) await loadPosts()
      else setPage(1)
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : copy.publishFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function postAction(postId: number, action: "help" | "save" | "report" | "match") {
    setLoadingActionId(postId)
    try {
      if (action === "help") await api.post(`/member/society/posts/${postId}/help-offers`, { message: copy.helpMessage })
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
    const content = window.prompt(copy.commentPrompt)
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
      await navigator.share({ title: copy.shareTitle, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast(copy.linkCopied, "success")
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

  const counts = postId > 0 ? {} : societyTabCounts(tab, meta)

  return (
    <div className="relative min-h-screen antialiased bg-slate-50 text-slate-900 flex flex-col" dir={direction}>
      <div className="max-w-4xl w-full mx-auto flex-1 px-4 py-6 space-y-6">
        <StrategicHeaderCard
          badge={copy.badge}
          title={copy.title}
          subtitle={copy.subtitle}
          cta={
            <button type="button" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto min-h-11 bg-[#3B52D4] hover:bg-[#2E44C8] text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-colors text-center shrink-0">
              {copy.newPost}
            </button>
          }
        />

        <FeedFilterBar tab={tab} onTab={value => { setPage(1); setTab(value) }} sector={sector} onSector={value => { setPage(1); setSector(value) }} counts={counts} />

        {postId > 0 && <Link href="/dashboard/society" className="underline">{copy.viewAll}</Link>}
        {loading && <p role="status">{copy.loading}</p>}
        {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p>{loadError}</p><button className="mt-3 underline" onClick={() => void loadPosts()}>{copy.retry}</button></div>}
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

          {!loading && !loadError && posts.length === 0 ? <div className="rounded-xl bg-white border border-slate-200 p-6 text-sm text-slate-600">{tab === "all" && !sector ? copy.empty : copy.emptyFiltered}</div> : null}
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-xs">
          <button type="button" className="min-h-11 bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-md disabled:opacity-40" disabled={page <= 1 || loading || postId > 0} onClick={() => setPage(value => value - 1)}>{copy.previous}</button>
          <span className="text-slate-600 font-medium">{societyShowing(locale, posts.length, meta.total)}</span>
          <button type="button" disabled={page >= meta.last_page || loading || postId > 0} onClick={() => setPage(value => value + 1)} className="min-h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-40">{copy.next}</button>
        </div>
      </div>

      <SocietyComposerModal
        open={isModalOpen}
        form={form}
        setForm={setForm}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
        submitError={submitError}
      />

      <Dialog open={deleteTargetPost !== null} onOpenChange={open => { if (!open) setDeleteTargetPost(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base">{copy.deleteTitle}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">{copy.deleteBody}</DialogDescription>
          </DialogHeader>
          {deleteTargetPost ? <p className="line-clamp-2 text-sm text-slate-700">&ldquo;{deleteTargetPost.title}&rdquo;</p> : null}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTargetPost(null)}
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={() => { if (deleteTargetPost) void deletePost(deleteTargetPost.id) }}
              disabled={!deleteTargetPost || loadingActionId === deleteTargetPost.id}
              className="min-h-11 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {deleteTargetPost && loadingActionId === deleteTargetPost.id ? copy.deleting : copy.confirmDelete}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
