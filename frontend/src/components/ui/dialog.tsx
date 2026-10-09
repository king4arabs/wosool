"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { cn } from "@/lib/utils"

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  const { locale, direction } = useLocale()
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        dir={direction}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 sm:p-8 shadow-2xl",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute end-4 top-4 rounded-md p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3B52D4]">
          <X className="h-4 w-4" />
          <span className="sr-only">{locale === "ar" ? "إغلاق" : "Close"}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2 mb-6 pe-8", className)} {...props} />
  )
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-xl font-semibold text-[#0A1628]", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  )
}
