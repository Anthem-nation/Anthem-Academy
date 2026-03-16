import { RRule } from 'rrule'

// rrule weekday constants: 0=MO,1=TU,2=WE,3=TH,4=FR,5=SA,6=SU
const RRULE_DAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU]

export interface SessionTemplate {
  title: string
  weekdays: number[]      // indices 0–6 into RRULE_DAYS
  startTime: string       // 'HH:mm'
  durationMinutes: number
  location: string
}

export interface GeneratedSession {
  title: string
  starts_at: string   // ISO 8601
  ends_at: string
  location: string | null
}

export function generateSessionDates(
  template: SessionTemplate,
  cohortStartDate: string,  // 'YYYY-MM-DD'
  cohortEndDate: string,
): GeneratedSession[] {
  if (template.weekdays.length === 0) return []

  const dtstart = new Date(`${cohortStartDate}T${template.startTime}:00`)
  const until   = new Date(`${cohortEndDate}T23:59:59`)

  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday: template.weekdays.map(d => RRULE_DAYS[d]),
    dtstart,
    until,
  })

  return rule.all().map(date => {
    const endsAt = new Date(date.getTime() + template.durationMinutes * 60_000)
    return {
      title: template.title,
      starts_at: date.toISOString(),
      ends_at: endsAt.toISOString(),
      location: template.location || null,
    }
  })
}
