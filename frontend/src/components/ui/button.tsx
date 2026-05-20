"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,#169b76_0%,#127e63_100%)] text-white shadow-[0_14px_30px_rgba(22,155,118,0.22)] hover:bg-[linear-gradient(180deg,#15916f_0%,#116d56_100%)] hover:shadow-[0_18px_36px_rgba(22,155,118,0.24)] focus-visible:ring-[#169b76]",
        secondary:
          "bg-[#0b1420] text-white shadow-[0_14px_30px_rgba(11,20,32,0.18)] hover:bg-[#101b2a] focus-visible:ring-[#0b1420]",
        outline:
          "border border-[#c9c1b5] bg-[rgba(255,255,255,0.48)] text-[#121826] hover:border-[#169b76] hover:bg-[#169b76] hover:text-white",
        ghost:
          "bg-transparent text-[#121826] hover:bg-[#ece8df]",
        link:
          "text-[#1f8a70] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-[52px] px-8 text-base",
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
      disabled={disabled ?? loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Comp>
  )
}
