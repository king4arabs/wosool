"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#C9A84C] text-[#0A1628] hover:bg-[#b8943f] focus-visible:ring-[#C9A84C]",
        secondary:
          "bg-[#0A1628] text-white hover:bg-[#1E293B] focus-visible:ring-[#0A1628]",
        outline:
          "border-2 border-[#0A1628] bg-transparent text-[#0A1628] hover:bg-[#0A1628] hover:text-white",
        ghost:
          "bg-transparent text-[#0A1628] hover:bg-gray-100",
        link:
          "text-[#C9A84C] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-6",
        lg: "h-12 px-8 text-base",
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
