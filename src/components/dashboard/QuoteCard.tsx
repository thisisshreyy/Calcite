import { RefreshCw } from "lucide-react"

import { useCalcite } from "@/state/CalciteStore"

function QuoteCard() {
  const { state, dispatch } = useCalcite()
  const quote =
    state.quotes.find(
      (item) => item.id === state.settings.lastDashboardQuoteId,
    ) ?? state.quotes[0]

  return (
    <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#777080]">
            Saved quote
          </p>

          {quote ? (
            <>
              <blockquote className="mt-5 max-w-3xl text-xl leading-relaxed text-[#F4F0FF]">
                "{quote.text}"
              </blockquote>

              <p className="mt-5 text-sm text-[#9A91AA]">
                {quote.author || "Unknown"}
                {quote.category ? ` / ${quote.category}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-5 text-sm text-[#777080]">
              Save a few quotes and Calcite will surface one here.
            </p>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#9A91AA] transition hover:border-[#9B6CFF] hover:bg-[#21172F] hover:text-[#C7A6FF] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={state.quotes.length === 0}
          onClick={() => dispatch({ type: "quote/shuffle-dashboard" })}
          type="button"
        >
          <RefreshCw size={15} />
          Another quote
        </button>
      </div>
    </section>
  )
}

export default QuoteCard
