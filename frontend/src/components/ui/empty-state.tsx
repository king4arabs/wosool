import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="h-16 w-16 rounded-2xl bg-[var(--surface-soft)] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[var(--text)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm font-normal text-[var(--text-muted)] max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
