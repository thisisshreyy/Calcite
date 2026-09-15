import { addDays, formatDisplayDate, getMonthDays, getWeekDays, todayKey } from "@/lib/dates"
import { isHabitScheduledForDate } from "@/lib/habits"
import type { CalciteState, Habit, HabitDayLog } from "@/types"

export type HabitTodayItem = {
  habit: Habit
  log?: HabitDayLog
  completed: boolean
  points: number
}

export type DayScore = {
  date: string
  label: string
  score: number
  earned: number
  possible: number
  completed: number
  total: number
}

export type HabitConsistency = {
  habitId: string
  name: string
  completed: number
  total: number
  missed: number
  percentage: number
}

const percent = (earned: number, possible: number) =>
  possible > 0 ? Math.round((earned / possible) * 100) : 0

const logsForDate = (state: CalciteState, date: string) =>
  state.habitLogs.filter(
    (log) => log.date === date && log.activeSnapshot && log.scheduledSnapshot,
  )

export function getHabitItemsForDate(
  state: CalciteState,
  date = todayKey(),
): HabitTodayItem[] {
  return state.habits
    .filter((habit) => habit.active && isHabitScheduledForDate(habit, date))
    .map((habit) => {
      const log = state.habitLogs.find(
        (item) => item.habitId === habit.id && item.date === date,
      )

      return {
        habit,
        log,
        completed: log?.completed ?? false,
        points: log?.pointsSnapshot ?? habit.points,
      }
    })
}

export function getDayScore(state: CalciteState, date = todayKey()): DayScore {
  const today = todayKey()

  if (date === today) {
    const items = getHabitItemsForDate(state, date)
    const earned = items.reduce(
      (total, item) => total + (item.completed ? item.points : 0),
      0,
    )
    const possible = items.reduce((total, item) => total + item.points, 0)

    return {
      date,
      label: formatDisplayDate(date, { weekday: "short" }),
      score: percent(earned, possible),
      earned,
      possible,
      completed: items.filter((item) => item.completed).length,
      total: items.length,
    }
  }

  const logs = logsForDate(state, date)
  const earned = logs.reduce(
    (total, log) => total + (log.completed ? log.pointsSnapshot : 0),
    0,
  )
  const possible = logs.reduce((total, log) => total + log.pointsSnapshot, 0)

  return {
    date,
    label: formatDisplayDate(date, { weekday: "short" }),
    score: percent(earned, possible),
    earned,
    possible,
    completed: logs.filter((log) => log.completed).length,
    total: logs.length,
  }
}

export function getWeeklyScores(
  state: CalciteState,
  date = todayKey(),
): DayScore[] {
  return getWeekDays(date).map((day) => getDayScore(state, day))
}

export function getMonthlyScores(
  state: CalciteState,
  date = todayKey(),
): DayScore[] {
  return getMonthDays(date)
    .filter((day) => day <= todayKey())
    .map((day) => getDayScore(state, day))
}

export function summarizeScores(scores: DayScore[]) {
  const scoredDays = scores.filter((day) => day.possible > 0)
  const totalEarned = scoredDays.reduce((sum, day) => sum + day.earned, 0)
  const totalPossible = scoredDays.reduce((sum, day) => sum + day.possible, 0)
  const average =
    scoredDays.length > 0
      ? Math.round(
          scoredDays.reduce((sum, day) => sum + day.score, 0) / scoredDays.length,
        )
      : 0
  const best = scoredDays.reduce<DayScore | undefined>(
    (current, day) => (!current || day.score > current.score ? day : current),
    undefined,
  )
  const worst = scoredDays.reduce<DayScore | undefined>(
    (current, day) => (!current || day.score < current.score ? day : current),
    undefined,
  )

  return {
    average,
    best,
    worst,
    totalEarned,
    totalPossible,
    completionPercentage: percent(totalEarned, totalPossible),
  }
}

export function getHabitConsistency(
  state: CalciteState,
  dates = getMonthDays(),
): HabitConsistency[] {
  return state.habits.map((habit) => {
    const logs = state.habitLogs.filter(
      (log) =>
        log.habitId === habit.id &&
        dates.includes(log.date) &&
        log.activeSnapshot &&
        log.scheduledSnapshot,
    )
    const completed = logs.filter((log) => log.completed).length
    const total = logs.length

    return {
      habitId: habit.id,
      name: habit.name,
      completed,
      total,
      missed: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  })
}

export function getCurrentStreak(state: CalciteState, endDate = todayKey()): number {
  let cursor = endDate
  let streak = 0

  while (true) {
    const day = getDayScore(state, cursor)

    if (day.possible === 0 || day.score < 100) {
      break
    }

    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export function getLongestStreak(state: CalciteState): number {
  const dates = Array.from(new Set(state.habitLogs.map((log) => log.date))).sort()
  let current = 0
  let longest = 0
  let previousDate: string | null = null

  dates.forEach((date) => {
    const day = getDayScore(state, date)
    const isConsecutive =
      previousDate !== null && addDays(previousDate, 1) === date

    if (day.possible > 0 && day.score === 100) {
      current = isConsecutive ? current + 1 : 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }

    previousDate = date
  })

  return longest
}

export function compareAverages(current: DayScore[], previous: DayScore[]): number {
  return summarizeScores(current).average - summarizeScores(previous).average
}
