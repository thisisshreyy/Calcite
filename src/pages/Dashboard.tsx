import HabitsCard from "@/components/dashboard/HabitsCard"
import QuoteCard from "@/components/dashboard/QuoteCard"
import ScoreCard from "@/components/dashboard/ScoreCard"
import TasksCard from "@/components/dashboard/TasksCard"
import WeeklyProgress from "@/components/dashboard/WeeklyProgress"
import { getDayScore, getWeeklyScores } from "@/lib/analytics"
import { formatDisplayDate, getGreeting, todayKey } from "@/lib/dates"
import { useCalcite } from "@/state/CalciteStore"

function Dashboard() {
  const { state } = useCalcite()
  const today = todayKey()
  const todayScore = getDayScore(state, today)
  const week = getWeeklyScores(state, today)

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        <header className="mb-8">
          <p className="text-sm text-[#9A91AA]">
            {formatDisplayDate(today, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F4F0FF]">
            {getGreeting()}
          </h1>

          <p className="mt-2 text-[#777080]">Let's make today count.</p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <ScoreCard score={todayScore} />
          <WeeklyProgress data={week} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <HabitsCard />
          <TasksCard />
        </section>

        <section className="mt-5">
          <QuoteCard />
        </section>
      </div>
    </main>
  )
}

export default Dashboard
