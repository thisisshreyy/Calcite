function ScoreCard() {
  const score = 78

  return (
    <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">Today's score</p>
          <p className="mt-1 text-xs text-[#6F687A]">
            Based on completed habits
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#21172F] text-[#C7A6FF]">
          ?
        </div>
      </div>

      <div className="mt-8 flex items-end gap-2">
        <span className="text-6xl font-semibold tracking-tight text-[#F4F0FF]">
          {score}
        </span>
        <span className="mb-2 text-lg text-[#777080]">/100</span>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#211A2B]">
        <div
          className="h-full rounded-full bg-[#9B6CFF]"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-[#777080]">
        {score}% of today's possible points earned
      </p>
    </div>
  )
}

export default ScoreCard
