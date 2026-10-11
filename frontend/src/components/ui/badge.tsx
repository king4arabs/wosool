import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand-navy)] text-[var(--on-dark)]",
        secondary: "bg-[var(--surface-soft)] text-[var(--link)]",
        outline: "border border-[var(--border-soft)] text-[var(--text)] bg-transparent",
        success: "bg-[var(--success-bg)] text-[var(--success-text)]",
        warning: "bg-[var(--brand-light-yellow)] text-[var(--text)]",
        destructive: "bg-[var(--error-bg)] text-[var(--error-text)]",
        gold: "bg-[var(--action-bg)] text-[var(--action-fg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}
