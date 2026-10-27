import type { DashboardLocale } from "@/lib/dashboard-i18n"

/** Preference keys returned by GET /api/v1/member/settings, in display order. */
export const memberSettingKeys = {
  notifications: [
    "new_match_suggestions",
    "direct_messages",
    "event_reminders",
    "program_updates",
    "community_activity",
    "weekly_digest",
  ],
  privacy: [
    "profile_visibility",
    "show_founder_score",
    "activity_visibility",
    "appear_in_directory",
  ],
  visibility: [
    "allow_intro_requests",
    "show_email_to_matches",
    "discoverable_for_matching",
  ],
} as const

export type MemberSettingGroup = keyof typeof memberSettingKeys
export type MemberSettingKey = (typeof memberSettingKeys)[MemberSettingGroup][number]

const labels: Record<DashboardLocale, Record<MemberSettingKey, string>> = {
  ar: {
    new_match_suggestions: "اقتراحات توافق جديدة",
    direct_messages: "الرسائل المباشرة",
    event_reminders: "تذكيرات الفعاليات",
    program_updates: "تحديثات طلبات البرامج",
    community_activity: "نشاط المجتمع",
    weekly_digest: "الملخص الأسبوعي",
    profile_visibility: "إظهار ملفي للأعضاء",
    show_founder_score: "إظهار بطاقة أدائي في ملفي",
    activity_visibility: "إظهار نشاطي في المجتمع",
    appear_in_directory: "إدراجي في دليل المؤسسين",
    allow_intro_requests: "السماح بطلبات التعارف",
    show_email_to_matches: "إظهار بريدي لمن توافقت معهم",
    discoverable_for_matching: "إدراجي في اقتراحات التوافق",
  },
  en: {
    new_match_suggestions: "New match suggestions",
    direct_messages: "Direct messages",
    event_reminders: "Event reminders",
    program_updates: "Program application updates",
    community_activity: "Community activity",
    weekly_digest: "Weekly digest",
    profile_visibility: "Show my profile to members",
    show_founder_score: "Show my scorecard on my profile",
    activity_visibility: "Show my community activity",
    appear_in_directory: "List me in the founders directory",
    allow_intro_requests: "Allow introduction requests",
    show_email_to_matches: "Show my email to my matches",
    discoverable_for_matching: "Include me in match suggestions",
  },
}

export const memberSettingsCopy = {
  ar: {
    title: "الإعدادات",
    loading: "جاري تحميل الإعدادات…",
    account: "الحساب",
    displayName: "الاسم المعروض",
    email: "البريد الإلكتروني",
    passwordHint: "اترك حقول كلمة المرور فارغة إذا لم ترد تغييرها.",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    notifications: "الإشعارات",
    privacy: "الخصوصية والظهور",
    save: "حفظ الإعدادات",
    saving: "جاري الحفظ…",
    saved: "تم حفظ الإعدادات.",
    saveFailed: "تعذر حفظ الإعدادات.",
    loadFailed: "تعذر تحميل الإعدادات.",
  },
  en: {
    title: "Settings",
    loading: "Loading settings…",
    account: "Account",
    displayName: "Display name",
    email: "Email address",
    passwordHint: "Leave the password fields empty to keep your current password.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    notifications: "Notifications",
    privacy: "Privacy and visibility",
    save: "Save settings",
    saving: "Saving…",
    saved: "Settings saved.",
    saveFailed: "Could not save settings.",
    loadFailed: "Could not load settings.",
  },
} as const

/** Human label for a preference; unknown keys from a newer API fall back to readable text. */
export function memberSettingLabel(locale: DashboardLocale, key: string): string {
  return (labels[locale] as Record<string, string>)[key] ?? key.replaceAll("_", " ")
}
