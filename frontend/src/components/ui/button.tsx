"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 whitespace-normal text-center rounded-[var(--radius-control)] text-sm font-bold leading-relaxed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--action-bg)] text-[var(--action-fg)] shadow-sm hover:bg-[var(--action-hover)]",
        secondary:
          "bg-[var(--brand-navy)] text-[var(--on-dark)] shadow-[var(--shadow-card)] hover:bg-[var(--brand-dark-blue)]",
        outline:
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--action-bg)] hover:bg-[var(--action-bg)] hover:text-[var(--action-fg)]",
        ghost:
          "bg-transparent text-[var(--text)] hover:bg-[var(--surface-soft)]",
        link:
          "text-[var(--link)] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        sm: "min-h-11 px-4 py-2 text-sm",
        md: "min-h-11 px-6 py-2",
        lg: "min-h-[52px] px-8 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const classes = cn(buttonVariants({ variant, size, className }))

  if (asChild) {
    return (
      <Comp className={classes} {...props}>
        {children}
      </Comp>
    )
  }

  return (
    <Comp
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Comp>
  )
}
