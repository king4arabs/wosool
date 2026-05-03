"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"
import { api } from "@/lib/api"
import { type AdminCollectionResponse, type AdminNewsItem, formatDate, fromCsvLines, toCsvLines } from "@/lib/admin"
import { Search, FileText, Pencil, Plus, Trash2 } from "lucide-react"

type NewsForm = {
  title: string
  excerpt: string
  content: string
  category: string
  author_name: string
  image_url: string
  tags: string
  status: AdminNewsItem["status"]
  published_at: string
  is_featured: boolean
  is_public: boolean
}

const emptyForm: NewsForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  author_name: "Wosool Team",
  image_url: "",
  tags: "",
  status: "draft",
  published_at: "",
  is_featured: false,
  is_public: true,
}

function toForm(article?: AdminNewsItem | null): NewsForm {
  if (!article) return emptyForm
  return {
    title: article.title,
    excerpt: article.excerpt,
    content: article.content || "",
    category: article.category,
    author_name: article.author_name,
    image_url: article.image_url || "",
    tags: toCsvLines(article.tags),
    status: article.status,
    published_at: article.published_at ? article.published_at.slice(0, 16) : "",
    is_featured: article.is_featured,
    is_public: article.is_public,
  }
}

export default function AdminNewsPage() {
  const { toast } = useToast()
  const [articles, setArticles] = useState<AdminNewsItem[]>([])
  const [meta, setMeta] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<AdminNewsItem | null>(null)
  const [form, setForm] = useState<NewsForm>(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadNews = useCallback(async () => {
    const response = await api.get<AdminCollectionResponse<AdminNewsItem>>("/admin/news", {
      params: { search: search || undefined },
    })
    setArticles(response.data)
    setMeta(response.meta)
  }, [search])

  useEffect(() => {
    loadNews().catch((err: Error) => toast(err.message, "error"))
  }, [loadNews, toast])

  const openEditor = (article?: AdminNewsItem) => {
    setEditing(article || null)
    setForm(toForm(article))
    setOpen(true)
  }

  const saveArticle = async () => {
    setSaving(true)
    const payload = {
      ...form,
      image_url: form.image_url || null,
      tags: fromCsvLines(form.tags),
      published_at: form.published_at || null,
    }

    try {
      if (editing) {
        await api.put(`/admin/news/${editing.id}`, payload)
      } else {
        await api.post("/admin/news", payload)
      }
      toast(`Article ${editing ? "updated" : "created"}.`, "success")
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      await loadNews()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save article.", "error")
    } finally {
      setSaving(false)
    }
  }

  const deleteArticle = async (article: AdminNewsItem) => {
    if (!window.confirm(`Delete ${article.title}?`)) return
    try {
      await api.delete(`/admin/news/${article.id}`)
      toast("Article deleted.", "success")
      await loadNews()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete article.", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News &amp; Content</h2>
          <p className="text-gray-500 text-sm mt-1">Manage articles, announcements, and content.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadNews().catch((err: Error) => toast(err.message, "error"))}>Refresh</Button>
          <Button size="sm" onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Articles", value: meta.total || 0, color: "text-blue-600" },
          { label: "Published", value: meta.published || 0, color: "text-emerald-600" },
          { label: "Drafts", value: meta.drafts || 0, color: "text-amber-600" },
          { label: "Featured", value: meta.featured || 0, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <FileText className={`h-5 w-5 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search articles by title or category..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadNews().catch((err: Error) => toast(err.message, "error"))}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">All Articles ({articles.length})</h3>
            <p className="text-sm text-gray-500">{meta.drafts || 0} draft</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Published</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 max-w-sm truncate">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">By {article.author_name}</p>
                    </td>
                    <td className="px-6 py-4"><Badge variant="secondary">{article.category}</Badge></td>
                    <td className="px-6 py-4">
                      <Badge variant={article.status === "published" ? "success" : article.status === "archived" ? "secondary" : "warning"}>
                        {article.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(article.published_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => openEditor(article)}><Pencil className="h-4 w-4" /></button>
                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteArticle(article)}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit article" : "Create article"}</DialogTitle>
            <DialogDescription>Seeded editorial content is now manageable from the admin console.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
              <Input placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
              <Input placeholder="Author name" value={form.author_name} onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))} />
              <Input placeholder="Image URL" value={form.image_url} onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))} />
              <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminNewsItem["status"] }))}>
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </Select>
              <Input type="datetime-local" value={form.published_at} onChange={(event) => setForm((current) => ({ ...current, published_at: event.target.value }))} />
            </div>
            <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            <Textarea placeholder="Excerpt" value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} />
            <Textarea placeholder="Content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
            <div className="flex gap-4 text-sm text-gray-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))} /> Featured</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_public} onChange={(event) => setForm((current) => ({ ...current, is_public: event.target.checked }))} /> Public</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveArticle} loading={saving}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
