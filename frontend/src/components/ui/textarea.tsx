import * as React from "react"
import { cn } from "@/lib/utils"

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base font-normal text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent aria-invalid:border-[var(--error-text)] disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"
