import { Check } from "lucide-react"

const habits = [
  { name: "ML Study", points: 20, completed: true },
  { name: "VLSI Study", points: 20, completed: true },
  { name: "Gym", points: 15, completed: false },
  { name: "Project", points: 25, completed: false },
  { name: "Spanish", points: 5, completed: true },
]

function HabitsCard() {
  return (
    <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">
            Today's habits
          </p>
          <p className="mt-1 text-xs text-[#6F687A]">
            Complete your habits to increase your score
          </p>
        </div>

        <span className="text-xs text-[#777080]">
          3 / 5 completed
        </span>
      </div>

      <div className="mt-5 divide-y divide-[#241C31]">
        {habits.map((habit) => (
          <div
            key={habit.name}
            className="flex items-center justify-between py-4"
          >
            <div className="flex items-center gap-3">
              <button
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                  habit.completed
                    ? "border-[#9B6CFF] bg-[#9B6CFF] text-[#0B0812]"
                    : "border-[#4A3C5B] hover:border-[#9B6CFF]"
                }`}
              >
                {habit.completed && (
                  <Check size={14} strokeWidth={3} />
                )}
              </button>

              <span
                className={
                  habit.completed
                    ? "text-sm text-[#777080] line-through"
                    : "text-sm text-[#F4F0FF]"
                }
              >
                {habit.name}
              </span>
            </div>

            <span className="text-sm font-medium text-[#C7A6FF]">
              +{habit.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HabitsCard
