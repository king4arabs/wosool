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
        "rounded-2xl border border-gray-100 bg-white p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-brand-cream flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-brand-navy">{value}</p>
      {change && (
        <p
          className={cn(
            "text-sm mt-1 font-medium",
            changeType === "positive" && "text-green-600",
            changeType === "negative" && "text-red-600",
            changeType === "neutral" && "text-gray-500"
          )}
        >
          {change}
        </p>
      )}
    </div>
  )
}
