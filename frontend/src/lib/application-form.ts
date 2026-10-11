export const APPLY_FORM_SESSION_KEY = "wosool_apply_form_v1";
export const APPLY_FORM_STARTED_AT_KEY = "wosool_apply_started_at";

export const sectors = [
  ["التقنية المالية", "Fintech"], ["التقنية الصحية", "Healthtech"],
  ["برمجيات الأعمال", "Business software"], ["التجارة الإلكترونية", "E-commerce"],
  ["اللوجستيات", "Logistics"], ["تقنية الغذاء", "Foodtech"],
  ["تقنية الموارد البشرية", "HR technology"], ["تقنية التعليم", "Edtech"],
  ["تقنية العقار", "Proptech"], ["التقنيات النظيفة", "Cleantech"], ["أخرى", "Other"],
] as const;
export const stages = [
  ["ما قبل البذرة", "Pre-seed"], ["البذرة", "Seed"], ["السلسلة A", "Series A"],
  ["السلسلة B+", "Series B+"], ["التوسّع", "Scale-up"], ["مؤسس متخارج", "Exited"],
] as const;
export const initialFormData = {
  full_name: "", email: "", phone: "", location: "", linkedin_url: "",
  company_name: "", sector: "التقنية المالية", stage: "Pre-seed", company_website: "",
  motivation: "", what_you_offer: "", what_you_need: "", referral_source: "",
  referrer_name: "", bot_field: "",
};
export type ApplicationForm = typeof initialFormData;
export type FormField = keyof ApplicationForm;
export type FormErrors = Partial<Record<FormField, string>>;

const fieldsByStep: FormField[][] = [
  ["full_name", "email", "phone", "location", "linkedin_url"],
  ["company_name", "sector", "stage", "company_website"],
  ["motivation", "what_you_offer", "what_you_need", "referral_source", "referrer_name"],
];
export function firstErrorStep(errors: FormErrors): number {
  const index = fieldsByStep.findIndex((fields) => fields.some((field) => errors[field]));
  return index < 0 ? 3 : index + 1;
}

export function restoreDraft(saved: string | null): ApplicationForm {
  const restored = { ...initialFormData };
  if (!saved) return restored;
  try {
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return restored;
    for (const field of Object.keys(restored) as FormField[]) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string") restored[field] = value;
    }
    // Retain drafts saved before the API stage values were introduced.
    restored.stage = stages.find(([ar, en]) => ar === restored.stage || en === restored.stage)?.[1] || "Pre-seed";
    if (!sectors.some(([value]) => value === restored.sector)) restored.sector = initialFormData.sector;
  } catch { /* A damaged draft must not prevent a new application. */ }
  return restored;
}

export function validateStep(step: number, data: ApplicationForm, ar: boolean): FormErrors {
  const errors: FormErrors = {};
  const t = (arabic: string, english: string) => ar ? arabic : english;
  const required: Partial<Record<FormField, string>> = {
    full_name: t("يرجى إدخال الاسم الكامل.", "Enter your full name."),
    email: t("يرجى إدخال البريد الإلكتروني.", "Enter your email address."),
    phone: t("يرجى إدخال رقم الهاتف.", "Enter your phone number."),
    location: t("يرجى إدخال الموقع.", "Enter your location."),
    company_name: t("يرجى إدخال اسم الشركة.", "Enter your company name."),
    sector: t("يرجى اختيار القطاع.", "Select your sector."),
    stage: t("يرجى اختيار المرحلة.", "Select your company stage."),
    motivation: t("أخبرنا لماذا ترغب في الانضمام إلى وصول.", "Tell us why you want to join Wosool."),
  };
  for (const field of fieldsByStep[step - 1] || []) {
    const value = data[field].trim();
    if (!value && required[field]) errors[field] = required[field];
    const max = field === "motivation" ? 2000 : field === "what_you_offer" || field === "what_you_need" ? 1000 : field === "phone" ? 50 : field === "sector" ? 100 : 255;
    if (value.length > max) errors[field] = t(`يجب ألا تتجاوز هذه الإجابة ${max} حرف.`, `Use no more than ${max} characters.`);
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = t("يرجى إدخال بريد إلكتروني صحيح.", "Enter a valid email address.");
    if ((field === "linkedin_url" || field === "company_website") && value) {
      try {
        const url = new URL(value);
        if (!["https:", "http:"].includes(url.protocol) || !url.hostname) throw new Error("Invalid URL");
      } catch { errors[field] = t("يرجى إدخال رابط يبدأ بـ https:// أو http://.", "Enter a URL beginning with https:// or http://."); }
    }
    if (field === "stage" && !stages.some(([, stage]) => stage === value)) errors.stage = required.stage;
  }
  return errors;
}
