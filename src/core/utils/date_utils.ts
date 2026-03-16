import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(utc)

export function formatDate(date: string | Date | undefined | null, format = 'MMM D, YYYY'): string {
  if (!date) return '—'
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return dayjs(date).format('MMM D, YYYY h:mm A')
}

export function fromNow(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return dayjs(date).fromNow()
}

export function isBefore(date: string | Date, compareDate: string | Date): boolean {
  return dayjs(date).isBefore(dayjs(compareDate))
}

export function diffHours(start: string | Date, end: string | Date): number {
  return dayjs(end).diff(dayjs(start), 'hour', true)
}
