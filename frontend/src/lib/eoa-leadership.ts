import roster from '@/data/eoa-board-2026-27.json'
import { publishedBoardMembers, type EoaBoardMember } from './eoa-board'

// Public snapshot of the owner-supplied 2026/27 board poster. Live editorial
// decisions, including a deliberately empty roster, take precedence.
export const referenceBoard = roster as EoaBoardMember[]
export function leadershipBoard(members?: EoaBoardMember[] | null) {
  return publishedBoardMembers(members ?? referenceBoard).map(member =>
    member.slug === 'mohammed-alsolami' && member.position_en === 'Membership'
      ? { ...member, position_en: 'Membership & Accelerator Chair', position_ar: 'رئيس العضوية والمسرّعة' }
      : member,
  )
}
