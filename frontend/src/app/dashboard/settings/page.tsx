import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, Shield, Bell, Eye, Trash2 } from "lucide-react"

const notificationSettings = [
  { id: "notif-matches", label: "New match suggestions", description: "Get notified when the AI finds a new match for you", defaultChecked: true },
  { id: "notif-messages", label: "Direct messages", description: "Receive alerts for new messages from other founders", defaultChecked: true },
  { id: "notif-events", label: "Event reminders", description: "Reminders for upcoming events you've registered for", defaultChecked: true },
  { id: "notif-programs", label: "Program updates", description: "Updates about your enrolled programs and new applications", defaultChecked: true },
  { id: "notif-community", label: "Community activity", description: "Likes, comments, and mentions in the community feed", defaultChecked: false },
  { id: "notif-digest", label: "Weekly digest", description: "A weekly email summary of your Wosool activity", defaultChecked: true },
]

const privacySettings = [
  { id: "priv-profile", label: "Profile visibility", description: "Allow other members to view your full profile", defaultChecked: true },
  { id: "priv-score", label: "Show Founder Score", description: "Display your score on your public profile", defaultChecked: true },
  { id: "priv-activity", label: "Activity visibility", description: "Show your community activity to other members", defaultChecked: true },
  { id: "priv-directory", label: "Appear in directory", description: "Be discoverable in the founder directory", defaultChecked: true },
]

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Account */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#C9A84C]" />
            Account Settings
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="s-email">Email Address</Label>
            <Input id="s-email" type="email" defaultValue="layla@meezancapital.com" />
            <p className="text-xs text-gray-400">
              Used for login and notifications. Changing this will require verification.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="s-current-password">Current Password</Label>
            <Input id="s-current-password" type="password" placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="s-new-password">New Password</Label>
              <Input id="s-new-password" type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-confirm-password">Confirm New Password</Label>
              <Input id="s-confirm-password" type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm">Update Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#C9A84C]" />
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose which notifications you&apos;d like to receive.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationSettings.map((setting, idx) => (
            <div key={setting.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                </div>
                <input
                  id={setting.id}
                  type="checkbox"
                  defaultChecked={setting.defaultChecked}
                  className="h-5 w-5 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] mt-0.5"
                />
              </div>
              {idx < notificationSettings.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#C9A84C]" />
            Privacy Settings
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Control how your information is shared within the Wosool community.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {privacySettings.map((setting, idx) => (
            <div key={setting.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                </div>
                <input
                  id={setting.id}
                  type="checkbox"
                  defaultChecked={setting.defaultChecked}
                  className="h-5 w-5 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C] mt-0.5"
                />
              </div>
              {idx < privacySettings.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <h3 className="font-semibold text-red-600 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, all of your data will be permanently removed.
            This action cannot be undone.
          </p>
          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
            Delete My Account
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
