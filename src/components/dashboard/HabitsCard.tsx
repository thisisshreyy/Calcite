import { useMemo, useState, type FormEvent } from "react"
import {
  Check,
  Edit3,
  PauseCircle,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"

import { getHabitItemsForDate } from "@/lib/analytics"
import { todayKey } from "@/lib/dates"
import { allWeekdays, recurrenceLabel, weekdayName } from "@/lib/habits"
import { useCalcite } from "@/state/CalciteStore"
import type { Habit, HabitRecurrence, Weekday } from "@/types"

type HabitForm = {
  name: string
  points: number
  recurrenceType: HabitRecurrence["type"]
  weekdays: Weekday[]
}

const emptyForm: HabitForm = {
  name: "",
  points: 10,
  recurrenceType: "daily",
  weekdays: [1, 2, 3, 4, 5],
}

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF] hover:bg-[#21172F]"

const inputClass =
  "w-full rounded-lg border border-[#2B213A] bg-[#0F0B17] px-3 py-2 text-sm text-[#F4F0FF] outline-none transition placeholder:text-[#6F687A] focus:border-[#9B6CFF]"

const recurrenceFromForm = (form: HabitForm): HabitRecurrence => {
  if (form.recurrenceType === "weekdays") {
    return { type: "weekdays" }
  }

  if (form.recurrenceType === "selected") {
    return { type: "selected", weekdays: form.weekdays }
  }

  return { type: "daily" }
}

const formFromHabit = (habit: Habit): HabitForm => ({
  name: habit.name,
  points: habit.points,
  recurrenceType: habit.recurrence.type,
  weekdays:
    habit.recurrence.type === "selected"
      ? habit.recurrence.weekdays
      : [1, 2, 3, 4, 5],
})

function HabitsCard() {
  const { state, dispatch } = useCalcite()
  const date = todayKey()
  const items = getHabitItemsForDate(state, date)
  const [form, setForm] = useState<HabitForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sortedHabits = useMemo(
    () =>
      [...state.habits].sort((left, right) => {
        if (left.active !== right.active) {
          return left.active ? -1 : 1
        }

        return left.name.localeCompare(right.name)
      }),
    [state.habits],
  )

  const completedCount = items.filter((item) => item.completed).length

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const submitHabit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const input = {
      name: form.name,
      points: form.points,
      recurrence: recurrenceFromForm(form),
    }

    if (editingId) {
      dispatch({ type: "habit/update", id: editingId, input })
    } else {
      dispatch({ type: "habit/create", input })
    }

    resetForm()
  }

  const toggleWeekday = (weekday: Weekday) => {
    setForm((current) => {
      const hasDay = current.weekdays.includes(weekday)
      const weekdays = hasDay
        ? current.weekdays.filter((day) => day !== weekday)
        : ([...current.weekdays, weekday].sort((left, right) => left - right) as Weekday[])

      return {
        ...current,
        weekdays,
      }
    })
  }

  return (
    <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#9A91AA]">Today's habits</p>
          <p className="mt-1 text-xs text-[#6F687A]">
            Complete habits to raise today's score
          </p>
        </div>

        <span className="text-xs text-[#777080]">
          {completedCount} / {items.length} complete
        </span>
      </div>

      <div className="mt-5 divide-y divide-[#241C31]">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.habit.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  aria-label={
                    item.completed
                      ? `Mark ${item.habit.name} incomplete`
                      : `Mark ${item.habit.name} complete`
                  }
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                    item.completed
                      ? "border-[#9B6CFF] bg-[#9B6CFF] text-[#0B0812]"
                      : "border-[#4A3C5B] hover:border-[#9B6CFF]"
                  }`}
                  onClick={() =>
                    dispatch({
                      type: "habit/toggle-completion",
                      id: item.habit.id,
                      date,
                    })
                  }
                  type="button"
                >
                  {item.completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div>
                  <p
                    className={
                      item.completed
                        ? "text-sm text-[#777080] line-through"
                        : "text-sm text-[#F4F0FF]"
                    }
                  >
                    {item.habit.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6F687A]">
                    {recurrenceLabel(item.habit.recurrence)}
                  </p>
                </div>
              </div>

              <span className="text-sm font-medium text-[#C7A6FF]">
                +{item.points}
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-5 text-sm text-[#777080]">
            No active habits are scheduled for today.
          </div>
        )}
      </div>

      <form
        className="mt-6 rounded-xl border border-[#2B213A] bg-[#0F0B17] p-4"
        onSubmit={submitHabit}
      >
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[1.2fr_0.5fr_0.8fr_auto] lg:items-end">
          <label className="text-xs font-medium text-[#9A91AA]">
            Habit
            <input
              className={`${inputClass} mt-1`}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Read, train, study..."
              value={form.name}
            />
          </label>

          <label className="text-xs font-medium text-[#9A91AA]">
            Points
            <input
              className={`${inputClass} mt-1`}
              min={1}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  points: Number(event.target.value),
                }))
              }
              type="number"
              value={form.points}
            />
          </label>

          <label className="text-xs font-medium text-[#9A91AA]">
            Recurrence
            <select
              className={`${inputClass} mt-1`}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recurrenceType: event.target.value as HabitRecurrence["type"],
                }))
              }
              value={form.recurrenceType}
            >
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays</option>
              <option value="selected">Selected days</option>
            </select>
          </label>

          <div className="flex gap-2">
            <button className={buttonClass} type="submit">
              {editingId ? <Save size={15} /> : <Plus size={15} />}
              {editingId ? "Save" : "Add"}
            </button>
            {editingId && (
              <button className={buttonClass} onClick={resetForm} type="button">
                <X size={15} />
                Cancel
              </button>
            )}
          </div>
        </div>

        {form.recurrenceType === "selected" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allWeekdays.map((weekday) => {
              const selected = form.weekdays.includes(weekday)

              return (
                <button
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selected
                      ? "border-[#9B6CFF] bg-[#21172F] text-[#F4F0FF]"
                      : "border-[#2B213A] text-[#9A91AA] hover:border-[#9B6CFF]"
                  }`}
                  key={weekday}
                  onClick={() => toggleWeekday(weekday)}
                  type="button"
                >
                  {weekdayName(weekday)}
                </button>
              )
            })}
          </div>
        )}
      </form>

      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#777080]">
          Habit library
        </p>

        <div className="space-y-2">
          {sortedHabits.map((habit) => (
            <div
              className="flex flex-col gap-3 rounded-xl border border-[#2B213A] bg-[#0F0B17] p-3 sm:flex-row sm:items-center sm:justify-between"
              key={habit.id}
            >
              <div>
                <p className="text-sm font-medium text-[#F4F0FF]">
                  {habit.name}
                </p>
                <p className="mt-1 text-xs text-[#777080]">
                  {habit.points} pts - {recurrenceLabel(habit.recurrence)} -{" "}
                  {habit.active ? "Active" : "Paused"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={buttonClass}
                  onClick={() => {
                    setEditingId(habit.id)
                    setForm(formFromHabit(habit))
                  }}
                  type="button"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  className={buttonClass}
                  onClick={() =>
                    dispatch({
                      type: "habit/set-active",
                      id: habit.id,
                      active: !habit.active,
                    })
                  }
                  type="button"
                >
                  {habit.active ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                  {habit.active ? "Pause" : "Reactivate"}
                </button>
                <button
                  aria-label={"Delete " + habit.name}
                  className={buttonClass}
                  onClick={() => {
                    if (window.confirm('Delete "' + habit.name + '"? This also removes its habit history.')) {
                      dispatch({ type: "habit/delete", id: habit.id })
                    }
                  }}
                  type="button"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HabitsCard
