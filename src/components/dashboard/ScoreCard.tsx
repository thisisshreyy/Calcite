import { Target } from "lucide-react"

import type { DayScore } from "@/lib/analytics"

function ScoreCard({ score }: { score: DayScore }) {
  return (
    <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">Today's score</p>
          <p className="mt-1 text-xs text-[#6F687A]">
            {score.earned} of {score.possible} habit points earned
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#21172F] text-[#C7A6FF]">
          <Target size={18} />
        </div>
      </div>

      <div className="mt-8 flex items-end gap-2">
        <span className="text-6xl font-semibold tracking-tight text-[#F4F0FF]">
          {score.score}
        </span>
        <span className="mb-2 text-lg text-[#777080]">/100</span>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#211A2B]">
        <div
          className="h-full rounded-full bg-[#9B6CFF] transition-all"
          style={{ width: `${score.score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-[#777080]">
        {score.total === 0
          ? "No active habits are scheduled for today."
          : `${score.completed} of ${score.total} scheduled habits complete`}
      </p>
    </section>
  )
}

export default ScoreCard
