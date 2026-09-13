import { useMemo } from "react"
import {
  BarChart3,
  CheckCircle2,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import {
  compareAverages,
  getCurrentStreak,
  getHabitConsistency,
  getLongestStreak,
  getMonthlyScores,
  getWeeklyScores,
  summarizeScores,
} from "@/lib/analytics"
import { addDays, formatDisplayDate, todayKey } from "@/lib/dates"
import { useCalcite } from "@/state/CalciteStore"

const cardClass =
  "rounded-2xl border border-[#2B213A] bg-[#14101D] p-5"

const mutedClass = "text-[#777080]"
const primaryClass = "text-[#F4F0FF]"

function Analytics() {
  const { state } = useCalcite()

  const today = todayKey()

  const weeklyScores = useMemo(
    () => getWeeklyScores(state, today),
    [state, today],
  )

  const monthlyScores = useMemo(
    () => getMonthlyScores(state, today),
    [state, today],
  )

  const monthlySummary = useMemo(
    () => summarizeScores(monthlyScores),
    [monthlyScores],
  )

  const previousWeekScores = useMemo(
    () => getWeeklyScores(state, addDays(today, -7)),
    [state, today],
  )

  const weeklySummary = useMemo(
    () => summarizeScores(weeklyScores),
    [weeklyScores],
  )

  const weekChange = compareAverages(weeklyScores, previousWeekScores)

  const consistency = useMemo(
    () =>
      getHabitConsistency(
        state,
        monthlyScores.map((day) => day.date),
      ).sort((a, b) => b.percentage - a.percentage),
    [monthlyScores, state],
  )

  const currentStreak = getCurrentStreak(state)
  const longestStreak = getLongestStreak(state)
    100,
    ...weeklyScores.map((day) => day.score),
  )

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-7 md:px-8 md:py-10">
        <header className="mb-7">
          <p className={`text-sm ${mutedClass}`}>Performance</p>
          <h1 className={`mt-1 text-3xl font-semibold tracking-tight ${primaryClass}`}>
            Analytics
          </h1>
          <p className={`mt-1 text-sm ${mutedClass}`}>
            Understand your productivity over time.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Target size={18} />}
            label="Monthly average"
            value={`${monthlySummary.average}%`}
            detail={`${monthlySummary.completionPercentage}% of points earned`}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="This week"
            value={`${weeklySummary.average}%`}
            detail={
              weekChange === 0
                ? "Same as last week"
                : `${Math.abs(weekChange)}% ${weekChange > 0 ? "above" : "below"} last week`
            }
            trend={weekChange}
          />
          <StatCard
            icon={<Flame size={18} />}
            label="Current streak"
            value={`${currentStreak} day${currentStreak === 1 ? "" : "s"}`}
            detail={`Best streak: ${longestStreak} day${longestStreak === 1 ? "" : "s"}`}
          />
          <StatCard
            icon={<BarChart3 size={18} />}
            label="Days tracked"
            value={`${monthlyScores.filter((day) => day.possible > 0).length}`}
            detail={`of ${monthlyScores.length} days this month`}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className={cardClass}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className={`font-medium ${primaryClass}`}>This week</h2>
                <p className={`mt-1 text-xs ${mutedClass}`}>
                  Daily productivity score
                </p>
              </div>
              <span className="rounded-full border border-[#2B213A] bg-[#0F0B17] px-3 py-1 text-xs text-[#9A91AA]">
                {formatDisplayDate(today, { month: "short", day: "numeric" })}
              </span>
            </div>

            <div className="flex h-56 items-end gap-2 sm:gap-4">
              {weeklyScores.map((day) => {
                const height = day.possible > 0 ? Math.max(8, day.score) : 4
                const isToday = day.date === today

                return (
                  <div
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                    key={day.date}
                  >
                    <span className={`text-xs ${mutedClass}`}>
                      {day.possible > 0 ? `${day.score}%` : "—"}
                    </span>
                    <div className="flex h-36 w-full max-w-10 items-end rounded-lg bg-[#0F0B17] p-1">
                      <div
                        className={`w-full rounded-md transition ${
                          isToday ? "bg-[#9B6CFF]" : "bg-[#5E4A78]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs ${
                        isToday ? "font-medium text-[#C7A6FF]" : mutedClass
                      }`}
                    >
                      {formatDisplayDate(day.date, { weekday: "short" }).slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-5">
              <h2 className={`font-medium ${primaryClass}`}>Habit consistency</h2>
              <p className={`mt-1 text-xs ${mutedClass}`}>
                Completion rate for tracked days this month
              </p>
            </div>

            <div className="space-y-4">
              {consistency.length > 0 ? (
                consistency.map((habit) => (
                  <div key={habit.habitId}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className={`truncate text-sm ${primaryClass}`}>
                        {habit.name}
                      </span>
                      <span className={`shrink-0 text-xs ${mutedClass}`}>
                        {habit.total > 0 ? `${habit.percentage}%` : "No data"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#0F0B17]">
                      <div
                        className="h-full rounded-full bg-[#9B6CFF]"
                        style={{ width: `${habit.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${mutedClass}`}>No habits to analyze yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-5">
              <h2 className={`font-medium ${primaryClass}`}>Monthly overview</h2>
              <p className={`mt-1 text-xs ${mutedClass}`}>
                {formatDisplayDate(today, { month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Metric label="Average" value={`${monthlySummary.average}%`} />
              <Metric label="Best day" value={monthlySummary.best ? `${monthlySummary.best.score}%` : "—"} />
              <Metric label="Worst day" value={monthlySummary.worst ? `${monthlySummary.worst.score}%` : "—"} />
              <Metric
                label="Points"
                value={`${monthlySummary.totalEarned}/${monthlySummary.totalPossible}`}
              />
            </div>
          </div>

          <div className={cardClass}>
            <div className="mb-5">
              <h2 className={`font-medium ${primaryClass}`}>Recent days</h2>
              <p className={`mt-1 text-xs ${mutedClass}`}>
                Your last seven tracked days
              </p>
            </div>

            <div className="space-y-2">
              {[...monthlyScores]
                .filter((day) => day.possible > 0)
                .slice(-7)
                .reverse()
                .map((day) => (
                  <div
                    className="flex items-center gap-3 rounded-lg border border-[#211A2B] bg-[#0F0B17] px-3 py-2"
                    key={day.date}
                  >
                    <span className={`w-20 text-xs ${mutedClass}`}>
                      {formatDisplayDate(day.date, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#21172F]">
                      <div
                        className="h-full rounded-full bg-[#9B6CFF]"
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                    <span className={`w-10 text-right text-xs font-medium ${primaryClass}`}>
                      {day.score}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
  trend?: number
}

function StatCard({ icon, label, value, detail, trend }: StatCardProps) {
  return (
    <div className={cardClass}>
      <div className="flex items-center gap-2 text-[#9B6CFF]">
        {icon}
        <span className={`text-xs ${mutedClass}`}>{label}</span>
      </div>
      <p className={`mt-4 text-2xl font-semibold ${primaryClass}`}>{value}</p>
      <div className="mt-1 flex items-center gap-1.5">
        {trend !== undefined && trend !== 0 ? (
          trend > 0 ? (
            <TrendingUp className="text-[#9B6CFF]" size={13} />
          ) : (
            <TrendingDown className="text-[#FF8AB8]" size={13} />
          )
        ) : null}
        <p className={`text-xs ${mutedClass}`}>{detail}</p>
      </div>
    </div>
  )
}

type MetricProps = {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <div>
      <p className={`text-xs ${mutedClass}`}>{label}</p>
      <p className={`mt-1 text-lg font-semibold ${primaryClass}`}>{value}</p>
    </div>
  )
}

export default Analytics
