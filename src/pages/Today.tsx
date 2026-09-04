import { useState, type FormEvent } from "react"
import { Check, Plus } from "lucide-react"
import { Link } from "react-router-dom"

import { getDayScore, getHabitItemsForDate } from "@/lib/analytics"
import { compareDateKeys, formatDisplayDate, todayKey } from "@/lib/dates"
import { recurrenceLabel } from "@/lib/habits"
import { useCalcite } from "@/state/CalciteStore"
import type { Task } from "@/types"

const inputClass =
  "w-full rounded-lg border border-[#2B213A] bg-[#0F0B17] px-3 py-2 text-sm text-[#F4F0FF] outline-none transition placeholder:text-[#6F687A] focus:border-[#9B6CFF]"

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF] hover:bg-[#21172F]"

const priorityOrder: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
}

function Today() {
  const { state, dispatch } = useCalcite()
  const today = todayKey()
  const score = getDayScore(state, today)
  const habits = getHabitItemsForDate(state, today)
  const [taskTitle, setTaskTitle] = useState("")
  const [habitName, setHabitName] = useState("")

  const defaultFolder = state.taskFolders[0]
  const dueToday = state.tasks
    .filter((task) => task.dueDate === today)
    .sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority])
  const overdue = state.tasks
    .filter(
      (task) =>
        !task.completed &&
        Boolean(task.dueDate) &&
        compareDateKeys(task.dueDate ?? today, today) < 0,
    )
    .sort((left, right) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))

  const addTodayTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!defaultFolder || taskTitle.trim().length === 0) {
      return
    }

    dispatch({
      type: "task/create",
      input: {
        title: taskTitle,
        details: "",
        folderId: defaultFolder.id,
        dueDate: today,
        priority: "medium",
      },
    })
    setTaskTitle("")
  }

  const addDailyHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (habitName.trim().length === 0) {
      return
    }

    dispatch({
      type: "habit/create",
      input: {
        name: habitName,
        points: 10,
        recurrence: { type: "daily" },
      },
    })
    setHabitName("")
  }

  const renderTask = (task: Task) => (
    <div
      className="flex flex-col gap-3 rounded-xl border border-[#2B213A] bg-[#0F0B17] p-3 sm:flex-row sm:items-center sm:justify-between"
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
            {task.priority === "none" ? "No priority" : `${task.priority} priority`}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        <header className="mb-8">
          <p className="text-sm text-[#9A91AA]">
            {formatDisplayDate(today, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[#F4F0FF]">Today</h1>
          <p className="mt-2 text-[#777080]">
            Habits shape the score. Tasks stay separate.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <p className="text-sm font-medium text-[#9A91AA]">Today score</p>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-6xl font-semibold">{score.score}</span>
              <span className="mb-2 text-lg text-[#777080]">/100</span>
            </div>
            <p className="mt-4 text-sm text-[#777080]">
              {score.earned} / {score.possible} points
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#211A2B]">
              <div
                className="h-full rounded-full bg-[#9B6CFF] transition-all"
                style={{ width: `${score.score}%` }}
              />
            </div>

            <div className="mt-6 space-y-3">
              <form className="flex gap-2" onSubmit={addTodayTask}>
                <input
                  className={inputClass}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Add task due today"
                  value={taskTitle}
                />
                <button className={buttonClass} type="submit">
                  <Plus size={15} />
                </button>
              </form>

              <form className="flex gap-2" onSubmit={addDailyHabit}>
                <input
                  className={inputClass}
                  onChange={(event) => setHabitName(event.target.value)}
                  placeholder="Add daily habit"
                  value={habitName}
                />
                <button className={buttonClass} type="submit">
                  <Plus size={15} />
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#9A91AA]">
                  Scheduled habits
                </p>
                <p className="mt-1 text-xs text-[#6F687A]">
                  {score.completed} of {score.total} complete
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {habits.length > 0 ? (
                habits.map((item) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#2B213A] bg-[#0F0B17] p-3"
                    key={item.habit.id}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                          item.completed
                            ? "border-[#9B6CFF] bg-[#9B6CFF] text-[#0B0812]"
                            : "border-[#4A3C5B] hover:border-[#9B6CFF]"
                        }`}
                        onClick={() =>
                          dispatch({
                            type: "habit/toggle-completion",
                            id: item.habit.id,
                            date: today,
                          })
                        }
                        type="button"
                      >
                        {item.completed && <Check size={14} strokeWidth={3} />}
                      </button>
                      <div>
                        <p className="text-sm text-[#F4F0FF]">{item.habit.name}</p>
                        <p className="mt-1 text-xs text-[#777080]">
                          {recurrenceLabel(item.habit.recurrence)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-[#C7A6FF]">+{item.points}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-5 text-sm text-[#777080]">
                  No habits are scheduled today.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#9A91AA]">Due today</p>
                <p className="mt-1 text-xs text-[#6F687A]">
                  Complete them without affecting score
                </p>
              </div>
              <Link
                className="text-sm text-[#C7A6FF] hover:text-[#F4F0FF]"
                to={`/tasks/${defaultFolder?.slug ?? "college"}`}
              >
                Manage
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {dueToday.length > 0 ? (
                dueToday.map(renderTask)
              ) : (
                <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-5 text-sm text-[#777080]">
                  Nothing is due today.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <p className="text-sm font-medium text-[#9A91AA]">Overdue</p>
            <p className="mt-1 text-xs text-[#6F687A]">
              Pull these back into view
            </p>
            <div className="mt-5 space-y-3">
              {overdue.length > 0 ? (
                overdue.map(renderTask)
              ) : (
                <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-5 text-sm text-[#777080]">
                  No overdue tasks.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Today
