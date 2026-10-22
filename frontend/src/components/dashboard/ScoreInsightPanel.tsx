"use client"

export function ScoreInsightPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2 rounded-xl border border-amber-200/60 bg-amber-50/50 p-5 text-xs text-slate-600">
      <h3 className="text-sm font-bold text-amber-800">{title}</h3>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  )
}
