import type { ReactNode } from "react"

/**
 * One hero for every public page: eyebrow, a single headline, one supporting sentence,
 * at most two actions. Start-aligned so it reads naturally in Arabic and English.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  tone = "light",
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Optional compact content under the copy (stats, a notice). */
  children?: ReactNode
  tone?: "light" | "dark"
}) {
  const dark = tone === "dark"
  return (
    <header className={`${dark ? "bg-[var(--surface-inverse)] text-[var(--on-dark)]" : "border-b border-[var(--border-soft)] bg-[var(--surface-soft)] text-[var(--text-strong)]"} px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14`}>
      <div className="mx-auto max-w-6xl">
        {eyebrow && <p className={`text-xs font-bold uppercase tracking-[0.08em] ${dark ? "text-[var(--on-dark-muted)]" : "text-[var(--action-bg)]"}`}>{eyebrow}</p>}
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-[1.2] sm:text-5xl">{title}</h1>
        {description && <p className={`mt-5 max-w-2xl text-base leading-8 sm:text-lg ${dark ? "text-[var(--on-dark-muted)]" : "text-[var(--text-muted)]"}`}>{description}</p>}
        {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  )
}

/** Primary/secondary hero actions with consistent sizing. */
export const heroPrimary = "inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--action-bg)] px-6 text-sm font-bold text-[var(--action-fg)] hover:bg-[var(--action-hover)]"
export const heroSecondary = "inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 text-sm font-bold text-[var(--text)] hover:border-[var(--action-bg)]"
