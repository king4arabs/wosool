"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Save, Shield, Bell, Eye } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useLocale } from "@/lib/locale"
import { resolveDashboardLocale } from "@/lib/dashboard-i18n"
import { memberSettingKeys, memberSettingLabel, memberSettingsCopy, type MemberSettingGroup } from "@/lib/member-settings"

type MemberSettings = {
  account: {
    name: string
    email: string
  }
  privacy: {
    profile_visibility: boolean
    show_founder_score: boolean
    activity_visibility: boolean
    appear_in_directory: boolean
  }
  notifications: {
    new_match_suggestions: boolean
    direct_messages: boolean
    event_reminders: boolean
    program_updates: boolean
    community_activity: boolean
    weekly_digest: boolean
  }
  visibility: {
    allow_intro_requests: boolean
    show_email_to_matches: boolean
    discoverable_for_matching: boolean
  }
}

const emptyState: MemberSettings = {
  account: { name: "", email: "" },
  privacy: {
    profile_visibility: true,
    show_founder_score: true,
    activity_visibility: true,
    appear_in_directory: true,
  },
  notifications: {
    new_match_suggestions: true,
    direct_messages: true,
    event_reminders: true,
    program_updates: true,
    community_activity: false,
    weekly_digest: true,
  },
  visibility: {
    allow_intro_requests: true,
    show_email_to_matches: false,
    discoverable_for_matching: true,
  },
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const lang = resolveDashboardLocale(locale)
  const copy = memberSettingsCopy[lang]
  const [settings, setSettings] = useState<MemberSettings>(emptyState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")

  useEffect(() => {
    api.get<{ data: MemberSettings }>("/member/settings")
      .then((res) => setSettings(res.data))
      .catch((err: Error) => toast(err.message || memberSettingsCopy[lang].loadFailed, "error"))
      .finally(() => setLoading(false))
  }, [toast, lang])

  const save = async () => {
    setSaving(true)
    try {
      await api.put<{ message: string; data: MemberSettings }>("/member/settings", {
        ...settings,
        account: {
          ...settings.account,
          current_password: currentPassword || undefined,
          new_password: newPassword || undefined,
          new_password_confirmation: newPasswordConfirmation || undefined,
        },
      })
      setCurrentPassword("")
      setNewPassword("")
      setNewPasswordConfirmation("")
      toast(copy.saved, "success")
    } catch (err) {
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as { message?: string; errors?: Record<string, string[]> }
        const first = data.errors ? Object.values(data.errors).flat()[0] : null
        toast((first as string) || data.message || copy.saveFailed, "error")
      } else {
        toast(err instanceof Error && err.message ? err.message : copy.saveFailed, "error")
      }
    } finally {
      setSaving(false)
    }
  }

  const toggles = (group: MemberSettingGroup) => {
    const values = settings[group] as Record<string, boolean>
    const keys = memberSettingKeys[group].filter((key) => key in values)
    return keys.map((key, idx) => (
      <div key={key}>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={`setting-${key}`} className="font-medium">{memberSettingLabel(lang, key)}</Label>
          <input
            id={`setting-${key}`}
            type="checkbox"
            checked={values[key]}
            onChange={(e) => setSettings((prev) => ({
              ...prev,
              [group]: { ...prev[group], [key]: e.target.checked },
            }))}
            className="h-5 w-5 shrink-0 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
          />
        </div>
        {idx < keys.length - 1 ? <Separator className="mt-4" /> : null}
      </div>
    ))
  }

  if (loading) {
    return <div className="text-sm text-gray-500" role="status">{copy.loading}</div>
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-[#0A1628]">{copy.title}</h1>
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#C9A84C]" aria-hidden="true" />
            {copy.account}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s-name">{copy.displayName}</Label>
            <Input
              id="s-name"
              autoComplete="name"
              value={settings.account.name}
              onChange={(e) => setSettings((prev) => ({ ...prev, account: { ...prev.account, name: e.target.value } }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">{copy.email}</Label>
            <Input
              id="s-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={settings.account.email}
              onChange={(e) => setSettings((prev) => ({ ...prev, account: { ...prev.account, email: e.target.value } }))}
            />
          </div>
          <Separator />
          <p id="s-password-hint" className="text-sm text-slate-500">{copy.passwordHint}</p>
          <div className="space-y-2">
            <Label htmlFor="s-current-password">{copy.currentPassword}</Label>
            <Input id="s-current-password" type="password" autoComplete="current-password" aria-describedby="s-password-hint" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s-new-password">{copy.newPassword}</Label>
              <Input id="s-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-confirm-password">{copy.confirmPassword}</Label>
              <Input id="s-confirm-password" type="password" autoComplete="new-password" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#C9A84C]" aria-hidden="true" />
            {copy.notifications}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">{toggles("notifications")}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#C9A84C]" aria-hidden="true" />
            {copy.privacy}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {toggles("privacy")}
          <Separator />
          {toggles("visibility")}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={save} disabled={saving}>
          <Save className="h-4 w-4 me-2" aria-hidden="true" />
          {saving ? copy.saving : copy.save}
        </Button>
      </div>
    </div>
  )
}
