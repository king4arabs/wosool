"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, api } from "@/lib/api"
import { type AdminSettingsResponse } from "@/lib/admin"
import {
  adminSettings,
  settingsFieldErrors,
  settingsFieldId,
  settingsFields,
  settingsPayload,
  toSettingsForm,
  validateSettingsForm,
  type SettingsField,
  type SettingsForm,
  type SettingsFormErrors,
} from "@/lib/admin-settings"
import { useLocale } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"

type FieldOptions = {
  required?: boolean
  hint?: string
  wide?: boolean
  multiline?: boolean
  type?: "text" | "email" | "url" | "number"
  ltr?: boolean
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const copy = adminSettings(locale)
  const [settings, setSettings] = useState<AdminSettingsResponse | null>(null)
  const [form, setForm] = useState<SettingsForm | null>(null)
  const [errors, setErrors] = useState<SettingsFormErrors>({})
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)

  const load = useCallback(() => {
    setStatus("loading")
    api.get<{ data: AdminSettingsResponse }>("/admin/settings")
      .then((response) => {
        setSettings(response.data)
        setForm(toSettingsForm(response.data))
        setErrors({})
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const focusFirstError = (found: SettingsFormErrors) => {
    const first = settingsFields.find((field) => found[field])
    if (first) window.requestAnimationFrame(() => document.getElementById(settingsFieldId(first))?.focus())
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!settings || !form || savingRef.current) return
    const found = validateSettingsForm(locale, form)
    setErrors(found)
    if (Object.keys(found).length) {
      focusFirstError(found)
      toast(copy.saveInvalid, "error")
      return
    }
    savingRef.current = true
    setSaving(true)
    try {
      const response = await api.put<{ data: AdminSettingsResponse }>("/admin/settings", settingsPayload(settings, form))
      setSettings(response.data)
      setForm(toSettingsForm(response.data))
      toast(copy.saved, "success")
    } catch (err) {
      const apiErrors = err instanceof ApiError && err.status === 422
        ? settingsFieldErrors((err.data as { errors?: unknown } | undefined)?.errors, copy.serverRejected)
        : {}
      if (Object.keys(apiErrors).length) {
        setErrors(apiErrors)
        focusFirstError(apiErrors)
        toast(copy.saveInvalid, "error")
      } else {
        toast(copy.saveFailed, "error")
      }
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  if (status === "loading" && !form) {
    return <p role="status" className="text-sm text-gray-500">{copy.loading}</p>
  }

  if (status === "error" || !form) {
    return (
      <div role="alert" className="space-y-3">
        <p className="text-sm text-gray-700">{copy.loadFailed}</p>
        <Button size="sm" variant="outline" onClick={load}>{copy.retry}</Button>
      </div>
    )
  }

  const update = (name: SettingsField, value: string) => {
    setForm((current) => (current ? { ...current, [name]: value } : current))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const field = (name: SettingsField, label: string, options: FieldOptions = {}): ReactNode => {
    const id = settingsFieldId(name)
    const describedBy = errors[name] ? `${id}-error` : options.hint ? `${id}-hint` : undefined
    const shared = {
      id,
      name,
      value: form[name],
      disabled: saving,
      required: options.required,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": describedBy,
      dir: options.ltr ? "ltr" : "auto",
    }
    return (
      <div className={options.wide ? "space-y-2 sm:col-span-2" : "space-y-2"}>
        <Label htmlFor={id}>
          {label}
          {options.required && <span className="ms-1 text-xs font-normal text-gray-500">{copy.required}</span>}
        </Label>
        {options.multiline
          ? <Textarea {...shared} rows={3} onChange={(event) => update(name, event.target.value)} />
          : <Input {...shared} type={options.type ?? "text"} inputMode={options.type === "number" ? "numeric" : undefined} onChange={(event) => update(name, event.target.value)} />}
        {options.hint && !errors[name] && <p id={`${id}-hint`} className="text-xs text-gray-500">{options.hint}</p>}
        {errors[name] && <p id={`${id}-error`} className="text-xs font-medium text-red-700">{errors[name]}</p>}
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={save} noValidate>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{copy.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{copy.intro}</p>
        </div>
        <Button type="submit" size="sm" className="min-h-11" disabled={saving} aria-busy={saving}>
          {saving ? copy.saving : copy.save}
        </Button>
      </div>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{copy.notice}</p>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">{copy.general}</h3></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("general.site_name", copy.siteName, { required: true })}
          {field("general.site_url", copy.siteUrl, { required: true, type: "url", ltr: true })}
          {field("general.site_description", copy.siteDescription, { wide: true, multiline: true })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">{copy.email}</h3></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("email.from_name", copy.fromName, { required: true })}
          {field("email.from_email", copy.fromEmail, { required: true, type: "email", ltr: true })}
          {field("email.reply_to", copy.replyTo, { type: "email", ltr: true })}
          {field("email.smtp_host", copy.smtpHost, { ltr: true })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">{copy.security}</h3></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("security.session_timeout_minutes", copy.sessionTimeout, { required: true, type: "number", hint: copy.sessionTimeoutHint })}
          {field("security.api_rate_limit", copy.apiRateLimit, { required: true, type: "number", hint: copy.apiRateLimitHint })}
          {field("security.password_policy", copy.passwordPolicy, { required: true, wide: true, multiline: true })}
        </CardContent>
      </Card>
    </form>
  )
}
