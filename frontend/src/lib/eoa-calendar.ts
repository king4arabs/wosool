// Session option 2: the published 10:00 GST slot is 09:00 in Riyadh (UTC+3).
export type EoaGlobalSession = {
  kind: 'learning' | 'coach' | 'participant'
  name: [string, string]
  startsAt: string
  hours: number
  registration: string
}
const learning =
  'https://forms.monday.com/forms/e16e10a14cbd25232589c6d59fff6d34?r=use1'
const coach =
  'https://forms.monday.com/forms/13b2f9b1cc1812b5cc5ed1bc085f6c52?r=use1'
const participant =
  'https://forms.monday.com/forms/68f0474f519b49a8cf0793364ce32f12?r=use1'
export const eoaGlobalSessions: EoaGlobalSession[] = [
  {
    kind: 'participant',
    name: ['تعريف المشاركين الجدد', 'New participant webinar'],
    startsAt: '2026-11-19T06:00:00Z',
    hours: 2,
    registration: participant,
  },
  {
    kind: 'learning',
    name: ['الاستراتيجية', 'Strategy Learning Day'],
    startsAt: '2026-12-16T06:00:00Z',
    hours: 5,
    registration: learning,
  },
  {
    kind: 'coach',
    name: ['تدريب مدربي المساءلة', 'Accountability coach training'],
    startsAt: '2027-01-20T06:00:00Z',
    hours: 2,
    registration: coach,
  },
  {
    kind: 'participant',
    name: ['تعريف المشاركين الجدد', 'New participant webinar'],
    startsAt: '2027-02-25T06:00:00Z',
    hours: 2,
    registration: participant,
  },
  {
    kind: 'learning',
    name: ['الأفراد', 'People Learning Day'],
    startsAt: '2027-03-24T06:00:00Z',
    hours: 5,
    registration: learning,
  },
  {
    kind: 'coach',
    name: ['تدريب مدربي المساءلة', 'Accountability coach training'],
    startsAt: '2027-04-21T06:00:00Z',
    hours: 2,
    registration: coach,
  },
  {
    kind: 'participant',
    name: ['تعريف المشاركين الجدد', 'New participant webinar'],
    startsAt: '2027-05-20T06:00:00Z',
    hours: 2,
    registration: participant,
  },
  {
    kind: 'learning',
    name: ['التنفيذ', 'Execution Learning Day'],
    startsAt: '2027-06-23T06:00:00Z',
    hours: 5,
    registration: learning,
  },
]
export function registrationOpen(session: EoaGlobalSession, now: number) {
  return now < Date.parse(session.startsAt) - 48 * 60 * 60 * 1000
}
