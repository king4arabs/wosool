import { publicApiSpec } from "@/lib/public-api-spec"

type Locale = "ar" | "en"
type Operation = { operationId: string; summary: string; description?: string; parameters?: { name: string }[] }

/** Arabic copy for the /api reference page, keyed by OpenAPI operationId. The OpenAPI contract itself stays in English. */
export const arabicOperationCopy: Record<string, { summary: string; description?: string }> = {
  getHealth: { summary: "التحقق من أن الخدمة تعمل" },
  getReadiness: { summary: "جاهزية قاعدة البيانات والترحيلات" },
  listFounders: {
    summary: "تصفح ملفات المؤسسين العامة",
    description: "الملفات النشطة والعامة فقط. الملفات التحريرية لا تعني العضوية في المجتمع. قيمة per_page محصورة بين 1 و100.",
  },
  getFounder: { summary: "قراءة ملف مؤسس عام" },
  listCompanies: {
    summary: "تصفح الشركات العامة",
    description: "الشركات النشطة والعامة فقط. لا يشمل founders_count وfounders إلا ملفات المؤسسين النشطة والعامة. قيمة per_page محصورة بين 1 و100. الاستعلامات غير الصحيحة لا تعيد بعدُ خطأ 422 موثقاً.",
  },
  getCompany: { summary: "قراءة ملف شركة عامة" },
  listNews: {
    summary: "قراءة الأخبار المنشورة",
    description: "الأخبار المنشورة والعامة فقط، ولا تظهر الأخبار ذات تاريخ النشر المستقبلي. المطابقة مع الشركات تكون بالاسم الدقيق للشركة أو بالوسوم. قيمة per_page محصورة بين 1 و50.",
  },
  getNews: { summary: "قراءة خبر منشور" },
  listStartups: {
    summary: "تصفح الشركات الناشئة ذات الإيرادات الموثقة",
    description: "السجلات المنشورة ذات المواقع النشطة ودليل إيرادات معلن أو من قوائم مالية. بخلاف دليل المؤسسين، تشترط هذه المجموعة دليلاً على الإيرادات. تتضمن بيانات الصفحات خيارات القطاعات. أحجام الصفحات غير الصالحة تعيد 422.",
  },
}

export type EndpointCopy = { path: string; summary: string; description?: string; parameters: string[] }

/** Endpoint rows for the reference page in the selected language; falls back to the English contract if a translation is missing. */
export function apiEndpoints(locale: Locale): EndpointCopy[] {
  return Object.entries(publicApiSpec.paths).map(([path, spec]) => {
    const operation = spec.get as Operation
    const arabic = locale === "ar" ? arabicOperationCopy[operation.operationId] : undefined
    return {
      path,
      summary: arabic?.summary ?? operation.summary,
      description: arabic ? arabic.description : operation.description,
      parameters: (operation.parameters ?? []).map(parameter => parameter.name),
    }
  })
}
