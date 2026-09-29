import { addDays, formatDisplayDate, getMonthDays, getWeekDays, todayKey } from "@/lib/dates"
import { isHabitScheduledForDate } from "@/lib/habits"
import type { CalciteState, Habit, HabitDayLog } from "@/types"

export type ExpenseAnalytics = {
  total: number
  averageDaily: number
  largest: number
  count: number
  categoryTotals: { category: string; amount: number }[]
  dailyTotals: { date: string; amount: number }[]
}

export type TaskAnalytics = {
  total: number
  completed: number
  pending: number
  overdue: number
  completionPercentage: number
  completedThisWeek: number
  dueThisWeek: number
}


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

const localDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const isInDateRange = (date: string, start: string, end: string) =>
  date >= start && date <= end

export function getExpenseAnalytics(
  state: CalciteState,
  dates = getMonthDays(),
): ExpenseAnalytics {
  const start = dates[0] ?? todayKey()
  const end = dates.at(-1) ?? todayKey()
  const expenses = state.expenses.filter((expense) => {
    const date = localDateKey(new Date(expense.date))
    return isInDateRange(date, start, end)
  })

  const categoryMap = new Map<string, number>()
  const dailyMap = new Map<string, number>()

  for (const expense of expenses) {
    const date = localDateKey(new Date(expense.date))
    categoryMap.set(
      expense.category,
      (categoryMap.get(expense.category) ?? 0) + expense.amount,
    )
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + expense.amount)
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return {
    total,
    averageDaily: dates.length > 0 ? total / dates.length : 0,
    largest: expenses.reduce(
      (largest, expense) => Math.max(largest, expense.amount),
      0,
    ),
    count: expenses.length,
    categoryTotals: [...categoryMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    dailyTotals: [...dailyMap.entries()]
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export function getTaskAnalytics(
  state: CalciteState,
  date = todayKey(),
): TaskAnalytics {
  const weekDays = getWeekDays(date)
  const weekStart = weekDays[0] ?? date
  const weekEnd = weekDays.at(-1) ?? date
  const completed = state.tasks.filter((task) => task.completed).length
  const pending = state.tasks.length - completed
  const overdue = state.tasks.filter(
    (task) => !task.completed && Boolean(task.dueDate) && task.dueDate! < date,
  ).length
  const completedThisWeek = state.tasks.filter(
    (task) =>
      task.completed &&
      Boolean(task.completedAt) &&
      isInDateRange(localDateKey(new Date(task.completedAt!)), weekStart, weekEnd),
  ).length
  const dueThisWeek = state.tasks.filter(
    (task) =>
      Boolean(task.dueDate) &&
      isInDateRange(task.dueDate!, weekStart, weekEnd),
  ).length

  return {
    total: state.tasks.length,
    completed,
    pending,
    overdue,
    completionPercentage:
      state.tasks.length > 0 ? Math.round((completed / state.tasks.length) * 100) : 0,
    completedThisWeek,
    dueThisWeek,
  }
}
