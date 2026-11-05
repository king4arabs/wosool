export type RelationshipKind = 'crm' | 'pr'
export interface RelationshipActivity { id: number; body: string; author?: { id: number; name: string } | null; created_at: string }
export interface RelationshipRecord {
  id: number; kind: RelationshipKind; name: string; organization: string | null; email: string | null; phone: string | null
  stage: string; priority: 'normal' | 'high'; owner_id: number | null; owner?: { id: number; name: string } | null
  follow_up_on: string | null; campaign: string | null; coverage_url: string | null; notes: string | null; version: number
  activities?: RelationshipActivity[]
}
export interface RelationshipCollection {
  data: RelationshipRecord[]; meta: { current_page: number; last_page: number; total: number }
  summary: { total: number; open: number; due: number; unassigned: number; stages: Record<string, number> }
  owners: { id: number; name: string }[]
}
export const relationshipStages = {
  crm: [['new', 'جديدة', 'New'], ['contacted', 'تم التواصل', 'Contacted'], ['in_progress', 'قيد المتابعة', 'In progress'], ['won', 'مكتملة بنجاح', 'Won'], ['closed', 'مغلقة', 'Closed']],
  pr: [['planned', 'مخططة', 'Planned'], ['pitched', 'تم العرض', 'Pitched'], ['confirmed', 'مؤكدة', 'Confirmed'], ['published', 'منشورة', 'Published'], ['closed', 'مغلقة', 'Closed']],
} as const
export function relationshipStage(kind: RelationshipKind, value: string, ar: boolean) {
  return relationshipStages[kind].find(stage => stage[0] === value)?.[ar ? 1 : 2] ?? value
}

export type RelationshipView = 'all' | 'open' | 'due' | 'unassigned'
export type RelationshipSort = 'follow_up' | 'updated' | 'name'
export interface RelationshipFilters {
  search: string; stage: string; owner: string; priority: string
  view: RelationshipView; sort: RelationshipSort; page: number; record: number | null
}

export function readRelationshipFilters(params: URLSearchParams, kind: RelationshipKind): RelationshipFilters {
  const view = params.get('view') ?? (params.get('due') === '1' ? 'due' : 'all')
  const sort = params.get('sort')
  const page = Number(params.get('page'))
  const record = Number(params.get('record'))
  const owner = params.get('owner') ?? ''
  const stage = params.get('stage') ?? ''
  return {
    search: (params.get('q') ?? '').slice(0, 120),
    stage: relationshipStages[kind].some(item => item[0] === stage) ? stage : '',
    owner: /^[1-9]\d*$/.test(owner) && Number.isSafeInteger(Number(owner)) ? owner : '',
    priority: params.get('priority') === 'high' ? 'high' : '',
    view: ['all', 'open', 'due', 'unassigned'].includes(view) ? view as RelationshipView : 'all',
    sort: sort === 'updated' || sort === 'name' ? sort : 'follow_up',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    record: Number.isSafeInteger(record) && record > 0 ? record : null,
  }
}

export function relationshipQuery(filters: RelationshipFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  if (filters.stage) params.set('stage', filters.stage)
  if (filters.owner) params.set('owner', filters.owner)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.view !== 'all') params.set('view', filters.view)
  if (filters.sort !== 'follow_up') params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.record) params.set('record', String(filters.record))
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function relationshipFollowUp(record: Pick<RelationshipRecord, 'stage' | 'follow_up_on'>, now = new Date()) {
  if (['won', 'published', 'closed'].includes(record.stage)) return 'complete'
  const date = record.follow_up_on?.slice(0, 10)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'unscheduled'
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  return date < today ? 'overdue' : date === today ? 'today' : 'scheduled'
}
