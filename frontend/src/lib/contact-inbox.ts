export type ContactCategory = "general" | "founder-support" | "partnerships" | "sponsorship" | "media" | "office-hours"
export type InboxStatus = "open" | "answered" | ""

export type InboxMessage = {
  id: number
  name: string
  email: string
  company: string | null
  category: ContactCategory
  category_label: { ar: string; en: string }
  subject: string
  message: string
  created_at: string | null
  responded_at: string | null
  responded_by: { id: number; name: string } | null
}

export type InboxResponse = {
  data: InboxMessage[]
  meta: { current_page: number; last_page: number; total: number; open: number; answered: number }
}

/** Query parameters for GET /admin/contact-messages; empty filters are left out. */
export function inboxParams(status: InboxStatus, category: ContactCategory | "", page: number) {
  return { status: status || undefined, category: category || undefined, page: page > 1 ? page : undefined }
}

/**
 * A mailto: link that opens a reply to the sender with "Re: <subject>".
 * Subjects are user input, so they are encoded; line breaks are dropped so they
 * cannot add mail headers.
 */
export function replyHref(message: Pick<InboxMessage, "email" | "subject">) {
  const subject = `Re: ${message.subject.replace(/[\r\n]+/g, " ").trim()}`
  return `mailto:${encodeURIComponent(message.email.trim())}?subject=${encodeURIComponent(subject)}`
}
