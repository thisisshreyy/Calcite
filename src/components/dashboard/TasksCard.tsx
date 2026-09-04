import { Check, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"

import { todayKey } from "@/lib/dates"
import { useCalcite } from "@/state/CalciteStore"

const priorityClass = {
  none: "text-[#777080]",
  low: "text-[#9A91AA]",
  medium: "text-[#C7A6FF]",
  high: "text-[#FFB4D8]",
}

function TasksCard() {
  const { state, dispatch } = useCalcite()
  const today = todayKey()
  const tasks = state.tasks
    .filter((task) => task.dueDate === today)
    .sort((left, right) => Number(left.completed) - Number(right.completed))

  const folderForTask = (folderId: string) =>
    state.taskFolders.find((folder) => folder.id === folderId)

  return (
    <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">Today's tasks</p>
          <p className="mt-1 text-xs text-[#6F687A]">
            Tasks are tracked separately from habit score
          </p>
        </div>

        <Link
          className="inline-flex items-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#9A91AA] transition hover:border-[#9B6CFF] hover:bg-[#21172F] hover:text-[#C7A6FF]"
          to={`/tasks/${state.taskFolders[0]?.slug ?? "college"}`}
        >
          Open tasks
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className="mt-5 divide-y divide-[#241C31]">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const folder = folderForTask(task.folderId)

            return (
              <div
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                key={task.id}
              >
                <div className="flex items-start gap-3">
                  <button
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} incomplete`
                        : `Mark ${task.title} complete`
                    }
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                      task.completed
                        ? "border-[#9B6CFF] bg-[#9B6CFF] text-[#0B0812]"
                        : "border-[#4A3C5B] hover:border-[#9B6CFF]"
                    }`}
                    onClick={() => dispatch({ type: "task/toggle", id: task.id })}
                    type="button"
                  >
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div>
                    <p
                      className={
                        task.completed
                          ? "text-sm text-[#777080] line-through"
                          : "text-sm text-[#F4F0FF]"
                      }
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-[#777080]">
                      {folder?.name ?? "Tasks"}
                    </p>
                  </div>
                </div>

                <span className={`text-xs ${priorityClass[task.priority]}`}>
                  {task.priority === "none" ? "No priority" : task.priority}
                </span>
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-5 text-sm text-[#777080]">
            Nothing is due today.
          </div>
        )}
      </div>
    </section>
  )
}

export default TasksCard
