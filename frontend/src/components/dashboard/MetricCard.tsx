"use client"

export function MetricCard({
  title,
  description,
  value,
  valueClass,
  barClass,
  trend,
  trendClass,
}: {
  title: string
  description: string
  value: number
  valueClass: string
  barClass: string
  trend: string
  trendClass: string
}) {
  return (
    <div className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <span className={`font-sans text-lg font-bold ${valueClass}`}>{value}%</span>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${value}%` }} />
        </div>
        <span className={`text-xs font-medium ${trendClass}`}>{trend}</span>
      </div>
    </div>
  )
}
