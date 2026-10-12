const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "Wed, 30 Sep 2026" */
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso))

/** "14:22" */
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso))

/** "Wed, 30 Sep 2026, 14:22" */
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso))

/** Calendar day in the viewer's time zone, for grouping. */
export const localDayKey = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** "Today", "Yesterday", otherwise "Mon, 5 Oct 2026" (viewer's time zone). */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const key = localDayKey(iso)
  if (key === localDayKey(now.toISOString())) return 'Today'
  if (key === localDayKey(yesterday.toISOString())) return 'Yesterday'
  return formatDate(iso)
}
