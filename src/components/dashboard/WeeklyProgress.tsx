import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DayScore } from "@/lib/analytics"

function WeeklyProgress({ data }: { data: DayScore[] }) {
  return (
    <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">
            Weekly progress
          </p>
          <p className="mt-1 text-xs text-[#6F687A]">
            Scores from saved habit logs
          </p>
        </div>

        <span className="rounded-full bg-[#21172F] px-3 py-1 text-xs text-[#C7A6FF]">
          This week
        </span>
      </div>

      <div className="mt-6 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#9B6CFF" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#9B6CFF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: "#777080", fontSize: 12 }}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              domain={[0, 100]}
              tick={{ fill: "#777080", fontSize: 12 }}
              tickLine={false}
              width={30}
            />

            <Tooltip
              contentStyle={{
                background: "#1C1628",
                border: "1px solid #2B213A",
                borderRadius: "10px",
                color: "#F4F0FF",
              }}
              formatter={(value, name, entry) => [
                `${value}% (${entry.payload.earned}/${entry.payload.possible})`,
                name,
              ]}
              labelStyle={{ color: "#C7A6FF" }}
            />

            <Area
              dataKey="score"
              fill="url(#scoreGradient)"
              stroke="#9B6CFF"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default WeeklyProgress
