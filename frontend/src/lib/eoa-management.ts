import type { Milestone } from './eoa'
export const pillars = [['cash','النقد','Cash'],['strategy','الاستراتيجية','Strategy'],['people','الأفراد','People'],['execution','التنفيذ','Execution']] as const
export function learningSummary(goals: Milestone[], attendance: {status: string}[]) {
  const recorded = attendance.filter(a=>['attended','absent','excused'].includes(a.status))
  return {total: goals.length, completed: goals.filter(g=>g.completed).length, attended: recorded.filter(a=>a.status==='attended').length, recorded: recorded.length}
}
