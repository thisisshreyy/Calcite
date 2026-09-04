import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 85 },
  { day: "Wed", score: 64 },
  { day: "Thu", score: 91 },
  { day: "Fri", score: 78 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 78 },
]

function WeeklyProgress() {
  return (
    <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">
            Weekly progress
          </p>
          <p className="mt-1 text-xs text-[#6F687A]">
            Your daily productivity score
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
              <linearGradient
                id="scoreGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#9B6CFF"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="#9B6CFF"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#777080", fontSize: 12 }}
            />

            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#777080", fontSize: 12 }}
              width={30}
            />

            <Tooltip
              contentStyle={{
                background: "#1C1628",
                border: "1px solid #2B213A",
                borderRadius: "10px",
                color: "#F4F0FF",
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#9B6CFF"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default WeeklyProgress
