"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-2 whitespace-normal text-center rounded-full text-sm font-semibold leading-relaxed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#3B52D4] text-white shadow-sm hover:bg-[#2E44C8] focus-visible:ring-[#3B52D4]",
        secondary:
          "bg-[#0b1420] text-white shadow-[0_14px_30px_rgba(11,20,32,0.18)] hover:bg-[#101b2a] focus-visible:ring-[#0b1420]",
        outline:
          "border border-[#c9c1b5] bg-[rgba(255,255,255,0.48)] text-[#121826] hover:border-[#3B52D4] hover:bg-[#3B52D4] hover:text-white",
        ghost:
          "bg-transparent text-[#121826] hover:bg-[#ece8df]",
        link:
          "text-[#3B52D4] underline-offset-4 hover:underline bg-transparent",
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
