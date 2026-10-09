import { currentLocale } from "./session-request"

export function requestErrorMessage(status: number): string {
  const ar = currentLocale() === "ar"
  if (status === 401) return ar ? "انتهت الجلسة. يرجى تسجيل الدخول مجددًا." : "Your session has ended. Please sign in again."
  if (status === 403) return ar ? "ليس لديك صلاحية لهذا الإجراء." : "You do not have permission for this action."
  if (status === 429) return ar ? "طلبات كثيرة خلال وقت قصير. يرجى الانتظار ثم المحاولة." : "Too many requests. Please wait and try again."
  return ar ? "تعذر إتمام الطلب. يرجى المحاولة مجددًا." : "Unable to complete the request. Please try again."
}

export async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204 || response.status === 205) return undefined as T
  try { return await response.json() as T } catch {
    throw new Error(requestErrorMessage(response.status))
  }
}
