import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Settings, Mail, Shield, Globe, Save } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage platform settings, email configuration, and security.
          </p>
        </div>
        <Button size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900">General</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Basic platform configuration.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="Wosool" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input id="siteUrl" defaultValue="https://wosool.org" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              defaultValue="The premier founder community for the GCC startup ecosystem."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option>Asia/Riyadh (UTC+3)</option>
                <option>Asia/Dubai (UTC+4)</option>
                <option>Asia/Bahrain (UTC+3)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Default Language</Label>
              <select
                id="language"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
              >
                <option>English</option>
                <option>العربية (Arabic)</option>
              </select>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-xs text-gray-500">Temporarily disable public access to the platform.</p>
            </div>
            <Badge variant="success">Off</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Registration</p>
              <p className="text-xs text-gray-500">Allow new applications to be submitted.</p>
            </div>
            <Badge variant="success">Open</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900">Email Configuration</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Configure email delivery and notification settings.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input id="fromName" defaultValue="Wosool" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input id="fromEmail" type="email" defaultValue="hello@wosool.org" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="replyTo">Reply-To Email</Label>
              <Input id="replyTo" type="email" defaultValue="support@wosool.org" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input id="smtpHost" defaultValue="smtp.resend.com" />
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</p>
            <div className="space-y-3">
              {[
                { label: "New application submitted", enabled: true },
                { label: "Application status changed", enabled: true },
                { label: "New event RSVP", enabled: false },
                { label: "Weekly digest report", enabled: true },
                { label: "Sponsor contract expiring", enabled: true },
              ].map(({ label, enabled }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{label}</p>
                  <Badge variant={enabled ? "success" : "secondary"}>
                    {enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <h3 className="font-semibold text-gray-900">Security</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">Authentication and access control settings.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Require 2FA for all admin accounts.</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Session Timeout</p>
              <p className="text-xs text-gray-500">Automatically log out inactive admin sessions.</p>
            </div>
            <Badge variant="secondary">30 minutes</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Password Policy</p>
              <p className="text-xs text-gray-500">Minimum 12 characters, mixed case, numbers, and symbols.</p>
            </div>
            <Badge variant="success">Strong</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">API Rate Limiting</p>
              <p className="text-xs text-gray-500">Maximum requests per minute per API key.</p>
            </div>
            <Badge variant="secondary">100 req/min</Badge>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Admin Access Log</p>
            <div className="space-y-2">
              {[
                { action: "Settings updated by admin@wosool.org", time: "2 hours ago" },
                { action: "New admin invited: ops@wosool.org", time: "1 day ago" },
                { action: "2FA enabled for all admin accounts", time: "3 days ago" },
                { action: "API key rotated", time: "1 week ago" },
              ].map(({ action, time }) => (
                <div key={action} className="flex items-center justify-between py-2">
                  <p className="text-xs text-gray-700">{action}</p>
                  <p className="text-xs text-gray-400">{time}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
