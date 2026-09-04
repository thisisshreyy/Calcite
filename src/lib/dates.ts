import type { Weekday } from "@/types"

const pad = (value: number) => String(value).padStart(2, "0")

export function dateKeyFromDate(date: Date): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-")
}

export function todayKey(): string {
  return dateKeyFromDate(new Date())
}

export function dateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(dateKey: string, amount: number): string {
  const date = dateFromKey(dateKey)
  date.setDate(date.getDate() + amount)
  return dateKeyFromDate(date)
}

export function getWeekday(dateKey: string): Weekday {
  return dateFromKey(dateKey).getDay() as Weekday
}

export function getWeekStart(dateKey: string): string {
  const date = dateFromKey(dateKey)
  const weekday = date.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  date.setDate(date.getDate() + diff)
  return dateKeyFromDate(date)
}

export function getWeekDays(dateKey = todayKey()): string[] {
  const start = getWeekStart(dateKey)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function getMonthDays(dateKey = todayKey()): string[] {
  const date = dateFromKey(dateKey)
  const year = date.getFullYear()
  const month = date.getMonth()
  const days = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: days }, (_, index) =>
    dateKeyFromDate(new Date(year, month, index + 1)),
  )
}

export function formatDisplayDate(dateKey: string, format: Intl.DateTimeFormatOptions): string {
  return dateFromKey(dateKey).toLocaleDateString(undefined, format)
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours()

  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 17) {
    return "Good afternoon"
  }

  return "Good evening"
}

export function compareDateKeys(left: string, right: string): number {
  return left.localeCompare(right)
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey()
}
