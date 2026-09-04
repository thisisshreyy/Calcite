import { getWeekday } from "@/lib/dates"
import type { Habit, HabitRecurrence, Weekday } from "@/types"

const weekdayLabels: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
}

export function isHabitScheduledForDate(habit: Habit, dateKey: string): boolean {
  const weekday = getWeekday(dateKey)

  if (habit.recurrence.type === "daily") {
    return true
  }

  if (habit.recurrence.type === "weekdays") {
    return weekday >= 1 && weekday <= 5
  }

  return habit.recurrence.weekdays.includes(weekday)
}

export function recurrenceLabel(recurrence: HabitRecurrence): string {
  if (recurrence.type === "daily") {
    return "Every day"
  }

  if (recurrence.type === "weekdays") {
    return "Weekdays"
  }

  if (recurrence.weekdays.length === 0) {
    return "No days selected"
  }

  return recurrence.weekdays.map((day) => weekdayLabels[day]).join(", ")
}

export function weekdayName(weekday: Weekday): string {
  return weekdayLabels[weekday]
}

export const weekdays: Weekday[] = [1, 2, 3, 4, 5]

export const allWeekdays: Weekday[] = [0, 1, 2, 3, 4, 5, 6]
