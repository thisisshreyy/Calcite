import ScoreCard from "@/components/dashboard/ScoreCard"
import WeeklyProgress from "@/components/dashboard/WeeklyProgress"
import HabitsCard from "@/components/dashboard/HabitsCard"
import QuoteCard from "@/components/dashboard/QuoteCard"

function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">

        <header className="mb-10">
          <p className="text-sm text-[#9A91AA]">
            Friday, September 4
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F4F0FF]">
            Good evening
          </h1>

          <p className="mt-2 text-[#777080]">
            Let's make today count.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <ScoreCard />
          <WeeklyProgress />
        </section>

        <section className="mt-5">
          <HabitsCard />
        </section>

        <section className="mt-5">
          <QuoteCard />
        </section>

      </div>
    </main>
  )
}

export default Dashboard
