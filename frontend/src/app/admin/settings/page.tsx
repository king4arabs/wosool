"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { type AdminSettingsResponse } from "@/lib/admin"
import { useToast } from "@/components/ui/toast"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<AdminSettingsResponse | null>(null)

  useEffect(() => {
    api.get<{ data: AdminSettingsResponse }>("/admin/settings")
      .then((response) => setSettings(response.data))
      .catch((err: Error) => toast(err.message, "error"))
  }, [toast])

  const save = async () => {
    if (!settings) return
    await api.put("/admin/settings", settings)
    toast("Settings updated.", "success")
  }

  if (!settings) {
    return <div className="text-sm text-gray-500">Loading settings…</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Manage platform settings, email configuration, and security defaults.</p>
        </div>
        <Button size="sm" onClick={save}>Save Changes</Button>
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">General</h3></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="siteName">Site Name</Label><Input id="siteName" value={settings.general.site_name} onChange={(event) => setSettings((current) => current ? { ...current, general: { ...current.general, site_name: event.target.value } } : current)} /></div>
            <div className="space-y-2"><Label htmlFor="siteUrl">Site URL</Label><Input id="siteUrl" value={settings.general.site_url} onChange={(event) => setSettings((current) => current ? { ...current, general: { ...current.general, site_url: event.target.value } } : current)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="siteDescription">Site Description</Label><Textarea id="siteDescription" rows={3} value={settings.general.site_description} onChange={(event) => setSettings((current) => current ? { ...current, general: { ...current.general, site_description: event.target.value } } : current)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Email Configuration</h3></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="fromName">From Name</Label><Input id="fromName" value={settings.email.from_name} onChange={(event) => setSettings((current) => current ? { ...current, email: { ...current.email, from_name: event.target.value } } : current)} /></div>
          <div className="space-y-2"><Label htmlFor="fromEmail">From Email</Label><Input id="fromEmail" type="email" value={settings.email.from_email} onChange={(event) => setSettings((current) => current ? { ...current, email: { ...current.email, from_email: event.target.value } } : current)} /></div>
          <div className="space-y-2"><Label htmlFor="replyTo">Reply-To Email</Label><Input id="replyTo" type="email" value={settings.email.reply_to || ""} onChange={(event) => setSettings((current) => current ? { ...current, email: { ...current.email, reply_to: event.target.value } } : current)} /></div>
          <div className="space-y-2"><Label htmlFor="smtpHost">SMTP Host</Label><Input id="smtpHost" value={settings.email.smtp_host || ""} onChange={(event) => setSettings((current) => current ? { ...current, email: { ...current.email, smtp_host: event.target.value } } : current)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold text-gray-900">Security</h3></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label><Input id="sessionTimeout" type="number" value={settings.security.session_timeout_minutes} onChange={(event) => setSettings((current) => current ? { ...current, security: { ...current.security, session_timeout_minutes: Number(event.target.value) } } : current)} /></div>
          <div className="space-y-2"><Label htmlFor="apiRateLimit">API Rate Limit</Label><Input id="apiRateLimit" type="number" value={settings.security.api_rate_limit} onChange={(event) => setSettings((current) => current ? { ...current, security: { ...current.security, api_rate_limit: Number(event.target.value) } } : current)} /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="passwordPolicy">Password Policy</Label><Textarea id="passwordPolicy" rows={3} value={settings.security.password_policy} onChange={(event) => setSettings((current) => current ? { ...current, security: { ...current.security, password_policy: event.target.value } } : current)} /></div>
        </CardContent>
      </Card>
    </div>
  )
}
