import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-raised)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold text-[var(--text)]", className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm font-normal text-[var(--text-muted)]", className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pb-4", className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}
