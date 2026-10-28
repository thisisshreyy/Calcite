import { useState, type FormEvent } from "react"
import { Check, Coffee, Plus, Sun, Sunrise, Sunset } from "lucide-react"
import { Link } from "react-router-dom"

import { getDayScore, getHabitItemsForDate } from "@/lib/analytics"
import { compareDateKeys, formatDisplayDate, todayKey } from "@/lib/dates"
import { recurrenceLabel } from "@/lib/habits"
import { useCalcite } from "@/state/CalciteStore"
import type { Habit, Task } from "@/types"
import { PomodoroTimer } from "@/components/common/PomodoroTimer"

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

type RoutineTab = "all" | "morning" | "afternoon" | "evening"

function Today() {
  const { state, dispatch } = useCalcite()
  const today = todayKey()
  const score = getDayScore(state, today)
  const habits = getHabitItemsForDate(state, today)
  const [taskTitle, setTaskTitle] = useState("")
  const [habitName, setHabitName] = useState("")
  const [habitRoutine, setHabitRoutine] = useState<Habit["timeOfDay"]>("anytime")
  const [activeRoutineTab, setActiveRoutineTab] = useState<RoutineTab>("all")

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

  const filteredHabits = habits.filter((item) => {
    if (activeRoutineTab === "all") return true
    return item.habit.timeOfDay === activeRoutineTab
  })

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
        timeOfDay: habitRoutine,
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

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="rounded-full bg-[#1C1628] px-2.5 py-1 text-xs text-[#C7A6FF]">
          Today
        </span>
      </div>
    </div>
  )

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        <header className="mb-8">
          <p className="text-sm text-[#9A91AA]">Daily execution</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F4F0FF]">
            Today
          </h1>
          <p className="mt-2 text-[#777080]">
            {formatDisplayDate(today, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Feature 1: Pomodoro Focus Timer */}
        <section className="mb-6">
          <PomodoroTimer />
        </section>

        {/* Habit Execution Section with Routine Tabs */}
        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <p className="text-sm font-medium text-[#9A91AA]">Today's score</p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-mono text-5xl font-semibold text-[#F4F0FF]">
                {score.score}%
              </span>
              <span className="text-sm text-[#777080]">
                {score.earned} / {score.possible} points
              </span>
            </div>
            <p className="mt-3 text-xs text-[#777080]">
              Score reflects habits scheduled today. Planned rest days do not penalize your streak.
            </p>

            <form className="mt-6 space-y-3" onSubmit={addDailyHabit}>
              <p className="text-xs font-medium uppercase tracking-wider text-[#777080]">
                Quick add habit
              </p>
              <input
                className={inputClass}
                onChange={(event) => setHabitName(event.target.value)}
                placeholder="New daily habit..."
                value={habitName}
              />
              <div className="flex items-center gap-2">
                <select
                  value={habitRoutine}
                  onChange={(e) => setHabitRoutine(e.target.value as Habit["timeOfDay"])}
                  className="rounded-lg border border-[#2B213A] bg-[#0F0B17] px-2.5 py-1.5 text-xs text-[#9A91AA] outline-none focus:border-[#9B6CFF]"
                >
                  <option value="anytime">⏰ Anytime</option>
                  <option value="morning">🌅 Morning</option>
                  <option value="afternoon">☀️ Afternoon</option>
                  <option value="evening">🌙 Evening</option>
                </select>
                <button className={buttonClass} type="submit">
                  <Plus size={16} /> Add habit
                </button>
              </div>
            </form>

            <form className="mt-6 space-y-3" onSubmit={addTodayTask}>
              <p className="text-xs font-medium uppercase tracking-wider text-[#777080]">
                Quick add task for today
              </p>
              <input
                className={inputClass}
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="New task title..."
                value={taskTitle}
              />
              <button className={buttonClass} type="submit">
                <Plus size={16} /> Add task
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#9A91AA]">Habits checklist</p>
                <p className="mt-0.5 text-xs text-[#6F687A]">
                  Check off items or mark planned rest days
                </p>
              </div>

              {/* Routine Filter Tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-[#2B213A] bg-[#0F0B17] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveRoutineTab("all")}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    activeRoutineTab === "all"
                      ? "bg-[#21172F] text-[#F4F0FF] font-medium"
                      : "text-[#777080] hover:text-[#F4F0FF]"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoutineTab("morning")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 transition ${
                    activeRoutineTab === "morning"
                      ? "bg-[#21172F] text-[#F4F0FF] font-medium"
                      : "text-[#777080] hover:text-[#F4F0FF]"
                  }`}
                >
                  <Sunrise size={12} className="text-amber-400" /> Morning
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoutineTab("afternoon")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 transition ${
                    activeRoutineTab === "afternoon"
                      ? "bg-[#21172F] text-[#F4F0FF] font-medium"
                      : "text-[#777080] hover:text-[#F4F0FF]"
                  }`}
                >
                  <Sun size={12} className="text-yellow-400" /> Afternoon
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoutineTab("evening")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 transition ${
                    activeRoutineTab === "evening"
                      ? "bg-[#21172F] text-[#F4F0FF] font-medium"
                      : "text-[#777080] hover:text-[#F4F0FF]"
                  }`}
                >
                  <Sunset size={12} className="text-purple-400" /> Evening
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {filteredHabits.length > 0 ? (
                filteredHabits.map((item) => (
                  <div
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                      item.skipped
                        ? "border-[#3A2A4C] bg-[#140E20]/60 opacity-75"
                        : "border-[#2B213A] bg-[#0F0B17]"
                    }`}
                    key={item.habit.id}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        disabled={item.skipped}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                          item.completed
                            ? "border-[#9B6CFF] bg-[#9B6CFF] text-[#0B0812]"
                            : item.skipped
                              ? "border-[#4A3C5B] bg-transparent text-[#777080] cursor-not-allowed"
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
                        <div className="flex items-center gap-2">
                          <p
                            className={
                              item.completed
                                ? "text-sm text-[#F4F0FF] line-through opacity-70"
                                : item.skipped
                                  ? "text-sm text-[#9A91AA] line-through"
                                  : "text-sm text-[#F4F0FF]"
                            }
                          >
                            {item.habit.name}
                          </p>
                          {item.skipped && (
                            <span className="rounded bg-[#281A3C] px-2 py-0.5 text-[10px] font-medium text-[#C7A6FF]">
                              Rest Day 💤
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-[#777080]">
                          {recurrenceLabel(item.habit.recurrence)}
                          {item.habit.timeOfDay && item.habit.timeOfDay !== "anytime" && (
                            <span className="capitalize"> • {item.habit.timeOfDay}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: "habit/toggle-skip",
                            id: item.habit.id,
                            date: today,
                          })
                        }
                        title={item.skipped ? "Cancel rest day" : "Take rest day (preserves streak)"}
                        className={`rounded-lg p-1.5 transition ${
                          item.skipped
                            ? "bg-[#281A3C] text-[#C7A6FF]"
                            : "text-[#6F687A] hover:bg-[#1C1628] hover:text-[#C7A6FF]"
                        }`}
                      >
                        <Coffee size={14} />
                      </button>
                      <span className="text-sm text-[#C7A6FF]">+{item.points}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-5 text-sm text-[#777080]">
                  No habits found for this routine.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tasks Section */}
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
                to={`/tasks/${defaultFolder?.slug ?? "inbox"}`}
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
