const applicationStates = ['submitted', 'reviewing', 'request_more_info', 'approved', 'waitlisted', 'rejected'] as const
export function summarizeApplicationPipeline(pipeline: Record<string, number> = {}) {
  const count = (key: string) => Number.isFinite(pipeline[key]) ? Math.max(0, pipeline[key]) : 0
  const entries = applicationStates.map(status => [status, count(status)] as const)
  return { entries, total: entries.reduce((sum, [, value]) => sum + value, 0), overdue: count('stale_submitted') + count('stale_reviewing') }
}
