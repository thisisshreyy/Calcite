/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react"

import { todayKey } from "@/lib/dates"
import { isHabitScheduledForDate } from "@/lib/habits"
import { createId } from "@/lib/id"
import { loadState, saveState } from "@/lib/storage"
import type {
  AppSettings,
  CalciteState,
  Habit,
  HabitDayLog,
  HabitRecurrence,
  Note,
  Quote,
  Task,
  TaskPriority,
} from "@/types"

type HabitInput = {
  name: string
  points: number
  recurrence: HabitRecurrence
}

type TaskInput = {
  title: string
  details: string
  folderId: string
  dueDate?: string
  priority: TaskPriority
}

type NoteInput = {
  title: string
  content: string
  folderId: string
}

type QuoteInput = {
  text: string
  author: string
  category: string
}

export type CalciteAction =
  | { type: "habit/create"; input: HabitInput }
  | { type: "habit/update"; id: string; input: HabitInput }
  | { type: "habit/delete"; id: string }
  | { type: "habit/set-active"; id: string; active: boolean }
  | { type: "habit/toggle-completion"; id: string; date?: string }
  | { type: "habit/ensure-date"; date: string }
  | { type: "task-folder/create"; name: string }
  | { type: "task-folder/rename"; id: string; name: string }
  | { type: "task-folder/delete"; id: string }
  | { type: "task/create"; input: TaskInput }
  | { type: "task/update"; id: string; input: TaskInput }
  | { type: "task/toggle"; id: string }
  | { type: "task/delete"; id: string }
  | { type: "note-folder/create"; name: string }
  | { type: "note-folder/rename"; id: string; name: string }
  | { type: "note-folder/delete"; id: string }
  | { type: "note/create"; input: NoteInput }
  | { type: "note/update"; id: string; input: NoteInput }
  | { type: "note/delete"; id: string }
  | { type: "quote/create"; input: QuoteInput }
  | { type: "quote/update"; id: string; input: QuoteInput }
  | { type: "quote/delete"; id: string }
  | { type: "quote/shuffle-dashboard" }
  | { type: "settings/update"; settings: Partial<AppSettings> }

type CalciteContextValue = {
  state: CalciteState
  dispatch: Dispatch<CalciteAction>
}

const CalciteContext = createContext<CalciteContextValue | undefined>(undefined)

const cleanName = (value: string, fallback: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

const cleanPoints = (value: number) => Math.max(1, Math.round(value || 1))

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "folder"

const uniqueSlug = (
  name: string,
  existing: { id: string; slug: string }[],
  ignoreId?: string,
) => {
  const base = slugify(name)
  let candidate = base
  let count = 2

  while (
    existing.some((folder) => folder.slug === candidate && folder.id !== ignoreId)
  ) {
    candidate = `${base}-${count}`
    count += 1
  }

  return candidate
}

const createHabitLog = (
  habit: Habit,
  date: string,
  completed: boolean,
): HabitDayLog => {
  const now = new Date().toISOString()

  return {
    id: `log_${date}_${habit.id}`,
    habitId: habit.id,
    date,
    completed,
    pointsSnapshot: habit.points,
    habitNameSnapshot: habit.name,
    activeSnapshot: habit.active,
    scheduledSnapshot: isHabitScheduledForDate(habit, date),
    createdAt: now,
    updatedAt: now,
    completedAt: completed ? now : undefined,
  }
}

const ensureHabitLogsForDate = (
  state: CalciteState,
  date: string,
): CalciteState => {
  const existingKeys = new Set(
    state.habitLogs.map((log) => `${log.date}:${log.habitId}`),
  )
  const newLogs = state.habits
    .filter((habit) => habit.active && isHabitScheduledForDate(habit, date))
    .filter((habit) => !existingKeys.has(`${date}:${habit.id}`))
    .map((habit) => createHabitLog(habit, date, false))

  if (newLogs.length === 0) {
    return state
  }

  return {
    ...state,
    habitLogs: [...state.habitLogs, ...newLogs],
  }
}

const syncTodayLogForHabit = (
  state: CalciteState,
  habit: Habit,
  previousHabit?: Habit,
) => {
  const today = todayKey()
  const scheduled = habit.active && isHabitScheduledForDate(habit, today)
  const logIndex = state.habitLogs.findIndex(
    (log) => log.habitId === habit.id && log.date === today,
  )

  if (!scheduled) {
    return state
  }

  if (logIndex === -1) {
    return {
      ...state,
      habitLogs: [...state.habitLogs, createHabitLog(habit, today, false)],
    }
  }

  const existing = state.habitLogs[logIndex]

  if (existing.completed) {
    return state
  }

  const updatedLog: HabitDayLog = {
    ...existing,
    pointsSnapshot: habit.points,
    habitNameSnapshot: habit.name,
    activeSnapshot: habit.active,
    scheduledSnapshot: true,
    updatedAt:
      previousHabit &&
      previousHabit.name === habit.name &&
      previousHabit.points === habit.points
        ? existing.updatedAt
        : new Date().toISOString(),
  }

  return {
    ...state,
    habitLogs: state.habitLogs.map((log, index) =>
      index === logIndex ? updatedLog : log,
    ),
  }
}

const toggleHabitCompletion = (
  state: CalciteState,
  habitId: string,
  date = todayKey(),
) => {
  const habit = state.habits.find((item) => item.id === habitId)

  if (!habit || !habit.active || !isHabitScheduledForDate(habit, date)) {
    return state
  }

  const logIndex = state.habitLogs.findIndex(
    (log) => log.habitId === habitId && log.date === date,
  )
  const now = new Date().toISOString()

  if (logIndex === -1) {
    return {
      ...state,
      habitLogs: [...state.habitLogs, createHabitLog(habit, date, true)],
    }
  }

  const current = state.habitLogs[logIndex]
  const completed = !current.completed
  const updated: HabitDayLog = {
    ...current,
    completed,
    pointsSnapshot: current.pointsSnapshot || habit.points,
    habitNameSnapshot: current.habitNameSnapshot || habit.name,
    activeSnapshot: true,
    scheduledSnapshot: true,
    updatedAt: now,
    completedAt: completed ? now : undefined,
  }

  return {
    ...state,
    habitLogs: state.habitLogs.map((log, index) =>
      index === logIndex ? updated : log,
    ),
  }
}

const shuffleDashboardQuote = (state: CalciteState): CalciteState => {
  if (state.quotes.length === 0) {
    return {
      ...state,
      settings: { ...state.settings, lastDashboardQuoteId: undefined },
    }
  }

  const candidates =
    state.quotes.length > 1
      ? state.quotes.filter(
          (quote) => quote.id !== state.settings.lastDashboardQuoteId,
        )
      : state.quotes
  const next = candidates[Math.floor(Math.random() * candidates.length)]

  return {
    ...state,
    settings: {
      ...state.settings,
      lastDashboardQuoteId: next.id,
    },
  }
}

export function calciteReducer(
  state: CalciteState,
  action: CalciteAction,
): CalciteState {
  const now = new Date().toISOString()

  switch (action.type) {
    case "habit/create": {
      const habit: Habit = {
        id: createId("habit"),
        name: cleanName(action.input.name, "New habit"),
        points: cleanPoints(action.input.points),
        recurrence: action.input.recurrence,
        active: true,
        createdAt: now,
        updatedAt: now,
      }

      return syncTodayLogForHabit(
        {
          ...state,
          habits: [...state.habits, habit],
        },
        habit,
      )
    }

    case "habit/update": {
      const previous = state.habits.find((habit) => habit.id === action.id)

      if (!previous) {
        return state
      }

      const updatedHabit: Habit = {
        ...previous,
        name: cleanName(action.input.name, previous.name),
        points: cleanPoints(action.input.points),
        recurrence: action.input.recurrence,
        updatedAt: now,
      }
      const nextState = {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.id ? updatedHabit : habit,
        ),
      }

      return syncTodayLogForHabit(nextState, updatedHabit, previous)
    }

    case "habit/delete": {
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.id),
        habitLogs: state.habitLogs.filter((log) => log.habitId !== action.id),
      }
    }

    case "habit/set-active": {
      const previous = state.habits.find((habit) => habit.id === action.id)

      if (!previous) {
        return state
      }

      const updatedHabit = {
        ...previous,
        active: action.active,
        updatedAt: now,
      }
      const nextState = {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.id ? updatedHabit : habit,
        ),
      }

      return syncTodayLogForHabit(nextState, updatedHabit, previous)
    }

    case "habit/toggle-completion":
      return toggleHabitCompletion(state, action.id, action.date)

    case "habit/ensure-date":
      return ensureHabitLogsForDate(state, action.date)

    case "task-folder/create": {
      const name = cleanName(action.name, "New list")
      return {
        ...state,
        taskFolders: [
          ...state.taskFolders,
          {
            id: createId("task_folder"),
            name,
            slug: uniqueSlug(name, state.taskFolders),
            createdAt: now,
            updatedAt: now,
          },
        ],
      }
    }

    case "task-folder/rename": {
      const current = state.taskFolders.find((folder) => folder.id === action.id)

      if (!current) {
        return state
      }

      const name = cleanName(action.name, current.name)

      return {
        ...state,
        taskFolders: state.taskFolders.map((folder) =>
          folder.id === action.id
            ? {
                ...folder,
                name,
                updatedAt: now,
              }
            : folder,
        ),
      }
    }

    case "task-folder/delete": {
      if (state.taskFolders.length <= 1) {
        return state
      }

      const fallback = state.taskFolders.find(
        (folder) => folder.id !== action.id,
      )

      if (!fallback) {
        return state
      }

      return {
        ...state,
        taskFolders: state.taskFolders.filter((folder) => folder.id !== action.id),
        tasks: state.tasks.map((task) =>
          task.folderId === action.id
            ? { ...task, folderId: fallback.id, updatedAt: now }
            : task,
        ),
      }
    }

    case "task/create": {
      const task: Task = {
        id: createId("task"),
        title: cleanName(action.input.title, "New task"),
        details: action.input.details.trim(),
        folderId: action.input.folderId,
        completed: false,
        dueDate: action.input.dueDate || undefined,
        priority: action.input.priority,
        createdAt: now,
        updatedAt: now,
      }

      return {
        ...state,
        tasks: [task, ...state.tasks],
      }
    }

    case "task/update":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                title: cleanName(action.input.title, task.title),
                details: action.input.details.trim(),
                folderId: action.input.folderId,
                dueDate: action.input.dueDate || undefined,
                priority: action.input.priority,
                updatedAt: now,
              }
            : task,
        ),
      }

    case "task/toggle":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: task.completed ? undefined : now,
                updatedAt: now,
              }
            : task,
        ),
      }

    case "task/delete":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }

    case "note-folder/create":
      return {
        ...state,
        noteFolders: [
          ...state.noteFolders,
          {
            id: createId("note_folder"),
            name: cleanName(action.name, "New folder"),
            createdAt: now,
            updatedAt: now,
          },
        ],
      }

    case "note-folder/rename":
      return {
        ...state,
        noteFolders: state.noteFolders.map((folder) =>
          folder.id === action.id
            ? {
                ...folder,
                name: cleanName(action.name, folder.name),
                updatedAt: now,
              }
            : folder,
        ),
      }

    case "note-folder/delete": {
      if (state.noteFolders.length <= 1) {
        return state
      }

      const fallback = state.noteFolders.find(
        (folder) => folder.id !== action.id,
      )

      if (!fallback) {
        return state
      }

      return {
        ...state,
        noteFolders: state.noteFolders.filter((folder) => folder.id !== action.id),
        notes: state.notes.map((note) =>
          note.folderId === action.id
            ? { ...note, folderId: fallback.id, updatedAt: now }
            : note,
        ),
      }
    }

    case "note/create": {
      const note: Note = {
        id: createId("note"),
        title: cleanName(action.input.title, "Untitled note"),
        content: action.input.content,
        folderId: action.input.folderId,
        createdAt: now,
        updatedAt: now,
      }

      return {
        ...state,
        notes: [note, ...state.notes],
      }
    }

    case "note/update":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.id
            ? {
                ...note,
                title: cleanName(action.input.title, note.title),
                content: action.input.content,
                folderId: action.input.folderId,
                updatedAt: now,
              }
            : note,
        ),
      }

    case "note/delete":
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.id),
      }

    case "quote/create": {
      const quote: Quote = {
        id: createId("quote"),
        text: cleanName(action.input.text, "New quote"),
        author: action.input.author.trim(),
        category: action.input.category.trim(),
        createdAt: now,
        updatedAt: now,
      }

      return {
        ...state,
        quotes: [quote, ...state.quotes],
        settings: {
          ...state.settings,
          lastDashboardQuoteId:
            state.quotes.length === 0
              ? quote.id
              : state.settings.lastDashboardQuoteId,
        },
      }
    }

    case "quote/update":
      return {
        ...state,
        quotes: state.quotes.map((quote) =>
          quote.id === action.id
            ? {
                ...quote,
                text: cleanName(action.input.text, quote.text),
                author: action.input.author.trim(),
                category: action.input.category.trim(),
                updatedAt: now,
              }
            : quote,
        ),
      }

    case "quote/delete": {
      const quotes = state.quotes.filter((quote) => quote.id !== action.id)
      const lastDashboardQuoteId =
        state.settings.lastDashboardQuoteId === action.id
          ? quotes[0]?.id
          : state.settings.lastDashboardQuoteId

      return {
        ...state,
        quotes,
        settings: {
          ...state.settings,
          lastDashboardQuoteId,
        },
      }
    }

    case "quote/shuffle-dashboard":
      return shuffleDashboardQuote(state)

    case "settings/update":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      }

    default:
      return state
  }
}

function createInitialState() {
  return ensureHabitLogsForDate(loadState(), todayKey())
}

export function CalciteProvider({ children }: { children: ReactNode }) {
 const initialState = useMemo(() => createInitialState(), [])
  const [state, dispatch] = useReducer(calciteReducer, initialState)
  const [, setCurrentDate] = useState(todayKey())

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const checkForNewDay = () => {
      const nextDate = todayKey()
      setCurrentDate((currentDate) => {
        if (currentDate === nextDate) {
          return currentDate
        }

        dispatch({ type: "habit/ensure-date", date: nextDate })
        return nextDate
      })
    }

    const interval = window.setInterval(checkForNewDay, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <CalciteContext.Provider value={{ state, dispatch }}>
      {children}
    </CalciteContext.Provider>
  )
}

export function useCalcite() {
  const value = useContext(CalciteContext)

  if (!value) {
    throw new Error("useCalcite must be used inside CalciteProvider")
  }

  return value
}
