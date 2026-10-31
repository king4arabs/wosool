/**
 * Validation errors for the member founder-profile form (`PUT /member/founder-profile`).
 *
 * Laravel reports list items by position ("skills.1", "needs.0"), but the form shows one
 * message per field. Fold item errors into their field so every message has a place on
 * the page, and give each message a stable id the input can point to.
 */
export type ProfileFieldErrors = Record<string, string>

export function profileFieldErrors(errors: Record<string, string[] | string> | null | undefined, fallback: string): ProfileFieldErrors {
  const flat: ProfileFieldErrors = {}
  for (const [key, value] of Object.entries(errors ?? {})) {
    const field = key.split(".")[0]
    if (!field || flat[field]) continue
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string" && item.trim()) : value
    flat[field] = typeof message === "string" && message.trim() ? message : fallback
  }
  return flat
}

export function profileErrorId(field: string): string {
  return `profile-${field.replace(/[^a-z0-9_-]/gi, "-")}-error`
}

/** Props that mark an input invalid and connect it to its visible error message. */
export function profileInvalidProps(errors: ProfileFieldErrors, field: string): { "aria-invalid": boolean; "aria-describedby"?: string } {
  return errors[field]
    ? { "aria-invalid": true, "aria-describedby": profileErrorId(field) }
    : { "aria-invalid": false }
}
