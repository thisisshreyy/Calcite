import { addDays, todayKey } from "@/lib/dates"
import { isHabitScheduledForDate } from "@/lib/habits"
import type {
  CalciteState,
  Habit,
  HabitDayLog,
  Note,
  NoteFolder,
  Quote,
  Task,
  TaskFolder,
} from "@/types"

export const CALCITE_STORAGE_KEY = "calcite:v0.1"
export const CALCITE_STORAGE_VERSION = 1

const nowIso = () => new Date().toISOString()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

export function createSeedState(): CalciteState {
  const now = nowIso()
  const today = todayKey()

  const habits: Habit[] = [
    {
      id: "habit_ml_study",
      name: "ML Study",
      points: 20,
      recurrence: { type: "weekdays" },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "habit_vlsi_study",
      name: "VLSI Study",
      points: 20,
      recurrence: { type: "weekdays" },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "habit_gym",
      name: "Gym",
      points: 15,
      recurrence: { type: "selected", weekdays: [1, 3, 5] },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "habit_project",
      name: "Project",
      points: 25,
      recurrence: { type: "daily" },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "habit_spanish",
      name: "Spanish",
      points: 5,
      recurrence: { type: "daily" },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const historyDays = Array.from({ length: 15 }, (_, index) =>
    addDays(today, index - 14),
  )

  const habitLogs: HabitDayLog[] = historyDays.flatMap((dateKey, dayIndex) =>
    habits
      .filter((habit) => isHabitScheduledForDate(habit, dateKey))
      .map((habit, habitIndex) => {
        const isTodayLog = dateKey === today
        const completed =
          !isTodayLog && (dayIndex + habitIndex + habit.points) % 4 !== 0

        return {
          id: `log_${dateKey}_${habit.id}`,
          habitId: habit.id,
          date: dateKey,
          completed,
          pointsSnapshot: habit.points,
          habitNameSnapshot: habit.name,
          activeSnapshot: true,
          scheduledSnapshot: true,
          createdAt: now,
          updatedAt: now,
          completedAt: completed ? now : undefined,
        }
      }),
  )

  const taskFolders: TaskFolder[] = [
    "College",
    "Projects",
    "Personal",
    "Shopping",
    "Important",
    "Someday",
    "Ideas",
  ].map((name) => ({
    id: `task_folder_${name.toLowerCase()}`,
    name,
    slug: name.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  }))

  const folderId = (slug: string) =>
    taskFolders.find((folder) => folder.slug === slug)?.id ?? taskFolders[0].id

  const tasks: Task[] = [
    {
      id: "task_submit_notes",
      folderId: folderId("college"),
      title: "Submit signal processing notes",
      details: "Review equations once before uploading.",
      completed: false,
      dueDate: today,
      priority: "high",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "task_calcite_pass",
      folderId: folderId("projects"),
      title: "Sketch Calcite V0.1 polish pass",
      details: "Focus on fast daily usability.",
      completed: false,
      dueDate: today,
      priority: "medium",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "task_electricity",
      folderId: folderId("personal"),
      title: "Pay electricity bill",
      details: "",
      completed: false,
      dueDate: addDays(today, -1),
      priority: "high",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "task_notebooks",
      folderId: folderId("shopping"),
      title: "Buy notebooks",
      details: "",
      completed: false,
      dueDate: addDays(today, 1),
      priority: "none",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "task_dashboard_ideas",
      folderId: folderId("ideas"),
      title: "Capture three dashboard ideas",
      details: "Tiny improvements count.",
      completed: true,
      priority: "low",
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    },
  ]

  const noteFolders: NoteFolder[] = [
    {
      id: "note_folder_inbox",
      name: "Inbox",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note_folder_college",
      name: "College",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note_folder_projects",
      name: "Projects",
      createdAt: now,
      updatedAt: now,
    },
  ]

  const notes: Note[] = [
    {
      id: "note_calcite_v01",
      folderId: "note_folder_projects",
      title: "Calcite V0.1",
      content:
        "# Calcite V0.1\n\n- [ ] Make daily habits effortless\n- [ ] Keep tasks separate from score\n- [x] Preserve the dark plum identity\n\n> Build the tool you want to open tomorrow.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note_quick_capture",
      folderId: "note_folder_inbox",
      title: "Quick capture",
      content:
        "## Today\n\nUse this space for loose thoughts, class notes, links, and project fragments.\n\n| Area | Next |\n| --- | --- |\n| Study | Review weak topics |\n| Projects | Ship one small improvement |",
      createdAt: now,
      updatedAt: now,
    },
  ]

  const quotes: Quote[] = [
    {
      id: "quote_showing_up",
      text: "Small progress is still progress. Keep showing up.",
      author: "Calcite",
      category: "Momentum",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "quote_deep_work",
      text: "What you repeat becomes your foundation.",
      author: "Calcite",
      category: "Habits",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "quote_clear_mind",
      text: "A clear next action is a kindness to your future self.",
      author: "Calcite",
      category: "Planning",
      createdAt: now,
      updatedAt: now,
    },
  ]

  return {
    version: CALCITE_STORAGE_VERSION,
    habits,
    habitLogs,
    taskFolders,
    tasks,
    noteFolders,
    notes,
    quotes,
    settings: {
      lastDashboardQuoteId: quotes[0]?.id,
    },
  }
}

export function loadState(): CalciteState {
  const seed = createSeedState()

  if (typeof localStorage === "undefined") {
    return seed
  }

  const raw = localStorage.getItem(CALCITE_STORAGE_KEY)

  if (!raw) {
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!isRecord(parsed)) {
      return seed
    }

    return {
      version: CALCITE_STORAGE_VERSION,
      habits: Array.isArray(parsed.habits) ? (parsed.habits as Habit[]) : seed.habits,
      habitLogs: Array.isArray(parsed.habitLogs)
        ? (parsed.habitLogs as HabitDayLog[])
        : seed.habitLogs,
      taskFolders: Array.isArray(parsed.taskFolders)
        ? (parsed.taskFolders as TaskFolder[])
        : seed.taskFolders,
      tasks: Array.isArray(parsed.tasks) ? (parsed.tasks as Task[]) : seed.tasks,
      noteFolders: Array.isArray(parsed.noteFolders)
        ? (parsed.noteFolders as NoteFolder[])
        : seed.noteFolders,
      notes: Array.isArray(parsed.notes) ? (parsed.notes as Note[]) : seed.notes,
      quotes: Array.isArray(parsed.quotes) ? (parsed.quotes as Quote[]) : seed.quotes,
      settings: isRecord(parsed.settings)
        ? { ...seed.settings, ...parsed.settings }
        : seed.settings,
    }
  } catch {
    return seed
  }
}

export function saveState(state: CalciteState): void {
  if (typeof localStorage === "undefined") {
    return
  }

  localStorage.setItem(
    CALCITE_STORAGE_KEY,
    JSON.stringify({
      ...state,
      version: CALCITE_STORAGE_VERSION,
    }),
  )
}
