import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-normal text-[var(--text-muted)]">{label}</p>
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-[var(--surface-soft)] flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <p className="text-[clamp(1.5rem,3vw,1.875rem)] font-bold text-[var(--text)]">{value}</p>
      {change && (
        <p
          className={cn(
            "text-sm mt-1 font-normal",
            changeType === "positive" && "text-[var(--success-text)]",
            changeType === "negative" && "text-[var(--error-text)]",
            changeType === "neutral" && "text-[var(--text-muted)]"
          )}
        >
          {change}
        </p>
      )}
    </div>
  )
}
