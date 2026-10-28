import { useMemo, useState } from "react"
import { addDays, formatDisplayDate, todayKey } from "@/lib/dates"
import { getDayScore } from "@/lib/analytics"
import { useCalcite } from "@/state/CalciteStore"

type HeatmapCell = {
  date: string
  score: number
  completed: number
  total: number
  isToday: boolean
}

export function HabitHeatmap() {
  const { state } = useCalcite()
  const today = todayKey()
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null)

  // Generate the last 52 weeks (364 days) of data ending on today
  const { weeks, monthLabels } = useMemo(() => {
    const todayDate = new Date(today)
    const dayOfWeek = todayDate.getDay() // 0 = Sunday, 6 = Saturday
    // End on current week's Saturday or Sunday
    const endDate = addDays(today, 6 - dayOfWeek)
    const startDate = addDays(endDate, -52 * 7 + 1)

    const matrix: HeatmapCell[][] = []
    let currentDay = startDate
    const months: { label: string; weekIndex: number }[] = []
    let lastMonth = ""

    for (let w = 0; w < 52; w++) {
      const week: HeatmapCell[] = []
      for (let d = 0; d < 7; d++) {
        if (currentDay <= endDate) {
          const score = getDayScore(state, currentDay)
          const cell: HeatmapCell = {
            date: currentDay,
            score: score.score,
            completed: score.completed,
            total: score.total,
            isToday: currentDay === today,
          }
          week.push(cell)

          // Check for month label change
          const dObj = new Date(currentDay)
          const monthName = dObj.toLocaleDateString("en-US", { month: "short" })
          if (monthName !== lastMonth && d === 0) {
            months.push({ label: monthName, weekIndex: w })
            lastMonth = monthName
          }

          currentDay = addDays(currentDay, 1)
        }
      }
      matrix.push(week)
    }

    return { weeks: matrix, monthLabels: months }
  }, [state, today])

  const getCellColor = (cell: HeatmapCell) => {
    if (cell.date > today) return "bg-transparent border-transparent"
    if (cell.total === 0 || cell.score === 0) return "bg-[#181124] border-[#251A36]"
    if (cell.score < 34) return "bg-[#43236E] border-[#582E91]"
    if (cell.score < 67) return "bg-[#6E35B8] border-[#8A42E6]"
    if (cell.score < 100) return "bg-[#9B6CFF] border-[#B28CFF]"
    return "bg-[#10B981] border-[#34D399]" // 100% emerald
  }

  return (
    <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h3 className="font-semibold text-[#F4F0FF]">Yearly Habit Consistency</h3>
          <p className="text-xs text-[#777080]">365-day habit completion matrix</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-[#777080]">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-[#181124] border border-[#251A36]" />
          <div className="h-2.5 w-2.5 rounded-sm bg-[#43236E]" />
          <div className="h-2.5 w-2.5 rounded-sm bg-[#6E35B8]" />
          <div className="h-2.5 w-2.5 rounded-sm bg-[#9B6CFF]" />
          <div className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" />
          <span>100%</span>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Month labels */}
          <div className="relative mb-1 flex h-4 text-[10px] text-[#6F687A]">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute"
                style={{ left: `${(m.weekIndex / 52) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid: 7 rows x 52 columns */}
          <div className="flex gap-[3px]">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between pr-2 text-[9px] text-[#5E566A]">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks */}
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-[3px]">
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-[11px] w-[11px] rounded-xs border transition-transform hover:scale-125 ${getCellColor(
                      cell,
                    )} ${cell.isToday ? "ring-1 ring-[#F4F0FF]" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip / Status bar */}
      <div className="mt-2 min-h-6 text-xs text-[#9A91AA]">
        {hoveredCell ? (
          <span>
            <strong className="text-[#F4F0FF]">
              {formatDisplayDate(hoveredCell.date, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
            : {hoveredCell.score}% score ({hoveredCell.completed} of {hoveredCell.total} habits completed)
          </span>
        ) : (
          <span className="text-[#5F586A]">Hover or tap any square to view daily score</span>
        )}
      </div>
    </div>
  )
}
