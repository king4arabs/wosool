"use client"

import { useRef, useState } from "react"
import { Camera, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"]

interface AvatarUploaderProps {
  locale: "ar" | "en"
  avatarUrl?: string | null
  displayName?: string | null
  /** Upload needs a saved founder profile; before that the control explains the next step. */
  profileSaved: boolean
  onChange: (avatarUrl: string | null) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

/** Member portrait upload: JPEG/PNG/WebP up to 2 MB, validated again on the server. */
export default function AvatarUploader({ locale, avatarUrl, displayName, profileSaved, onChange, onError, onSuccess }: AvatarUploaderProps) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const ar = locale === "ar"
  const initials = (displayName || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase()

  async function upload(file: File) {
    if (!ACCEPTED.includes(file.type)) return onError(ar ? "اختر صورة بصيغة JPEG أو PNG أو WebP." : "Choose a JPEG, PNG or WebP image.")
    if (file.size > MAX_BYTES) return onError(ar ? "الحد الأقصى لحجم الصورة ٢ ميغابايت." : "The image must be 2 MB or smaller.")
    const body = new FormData()
    body.append("avatar", file)
    setBusy(true)
    try {
      const response = await api.post<{ data?: { avatar_url?: string | null } }>("/member/founder-profile/avatar", body)
      onChange(response.data?.avatar_url ?? null)
      onSuccess(ar ? "تم تحديث صورة الملف." : "Profile photo updated.")
    } catch (error) {
      onError(error instanceof Error ? error.message : ar ? "تعذر رفع الصورة." : "The photo could not be uploaded.")
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ""
    }
  }

  async function remove() {
    setBusy(true)
    try {
      await api.delete("/member/founder-profile/avatar")
      onChange(null)
      onSuccess(ar ? "تمت إزالة الصورة." : "Profile photo removed.")
    } catch (error) {
      onError(error instanceof Error ? error.message : ar ? "تعذر إزالة الصورة." : "The photo could not be removed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-50 text-lg font-bold text-indigo-700">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- member-supplied URL or uploaded path; sized and cropped here.
          <img src={avatarUrl} alt={ar ? "صورة الملف" : "Profile photo"} className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="space-y-2">
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          id="founder-avatar-file"
          disabled={!profileSaved || busy}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor="founder-avatar-file"
            aria-disabled={!profileSaved || busy}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-semibold text-indigo-700 ${!profileSaved || busy ? "pointer-events-none opacity-50" : "hover:border-indigo-400"}`}
          >
            <Camera size={16} aria-hidden="true" />
            {busy ? (ar ? "جارٍ الرفع…" : "Uploading…") : avatarUrl ? (ar ? "تغيير الصورة" : "Change photo") : (ar ? "رفع صورة" : "Upload photo")}
          </label>
          {avatarUrl && profileSaved && (
            <button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-red-200 hover:text-red-600 disabled:opacity-50">
              <Trash2 size={16} aria-hidden="true" />
              {ar ? "إزالة" : "Remove"}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {profileSaved
            ? ar ? "JPEG أو PNG أو WebP، حتى ٢ ميغابايت، ١٦٠×١٦٠ بكسل على الأقل." : "JPEG, PNG or WebP, up to 2 MB, at least 160×160 px."
            : ar ? "احفظ ملفك أولاً ثم ارفع صورتك." : "Save your profile first, then upload your photo."}
        </p>
      </div>
    </div>
  )
}
