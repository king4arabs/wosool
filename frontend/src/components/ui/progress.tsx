import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

export function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[#C9A84C] transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
