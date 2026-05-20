"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale"

export default function CommunityPage() {
  const { locale } = useLocale()
  const isAr = locale === "ar"

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0A1628]">{isAr ? "المجتمع" : "Community"}</h2>
            <Badge variant="secondary">{isAr ? "المرحلة الثانية" : "Phase 2"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            {isAr
              ? "لوحة الإنتاج تربط قسم المجتمع مؤقتًا إلى حين اكتمال واجهات المنشورات والتعليقات والتفاعلات في الباك إند."
              : "The production dashboard currently gates the community feed until backend post, comment, and reaction APIs are ready."}
          </p>
          <p>
            {isAr
              ? "الملف الشخصي، الشركات، الفعاليات، البرامج، التقييم، التوافق، والرسائل كلها مرتبطة الآن ببيانات حية من الباك إند."
              : "Profile, companies, events, programs, scorecards, matches, and messaging are already connected to live backend data."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
