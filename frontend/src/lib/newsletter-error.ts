import { ApiError } from './api'

/** Keep field guidance, but never display deployment/router errors to subscribers. */
export function newsletterError(error: unknown, locale: 'ar' | 'en'): string {
  if (error instanceof ApiError && error.status === 422) return error.message
  if (error instanceof ApiError && error.status === 429) {
    return locale === 'ar' ? 'طلبات كثيرة خلال وقت قصير. حاول مجددًا بعد قليل.' : 'Too many attempts. Please try again shortly.'
  }
  return locale === 'ar'
    ? 'خدمة النشرة غير متاحة مؤقتًا. يرجى المحاولة لاحقًا أو التواصل مع info@wosool.org.'
    : 'Newsletter service is temporarily unavailable. Please try again later or contact info@wosool.org.'
}
