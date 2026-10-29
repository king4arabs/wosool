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
