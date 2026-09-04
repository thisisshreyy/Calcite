import { RefreshCw } from "lucide-react"

function QuoteCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#2B213A] bg-[#14101D] p-7">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#7C4DFF]/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#777080]">
          Saved quote
        </p>

        <blockquote className="mt-5 max-w-3xl text-xl leading-relaxed text-[#F4F0FF]">
          "Small progress is still progress. Keep showing up."
        </blockquote>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-[#9A91AA]">
            — Calcite
          </span>

          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9A91AA] transition hover:bg-[#21172F] hover:text-[#C7A6FF]">
            <RefreshCw size={15} />
            Another quote
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuoteCard
