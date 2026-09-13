import type {
  CalciteState,
  HabitDayLog,
  NoteFolder,
  TaskFolder,
} from "@/types"

export const CALCITE_STORAGE_KEY = "calcite:v0.2"
export const CALCITE_STORAGE_VERSION = 2

const nowIso = () => new Date().toISOString()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

export function createSeedState(): CalciteState {
  const now = nowIso()

  const taskFolders: TaskFolder[] = [
    {
      id: "task_folder_inbox",
      name: "Inbox",
      slug: "inbox",
      createdAt: now,
      updatedAt: now,
    },
  ]

  const noteFolders: NoteFolder[] = [
    {
      id: "note_folder_inbox",
      name: "Inbox",
      createdAt: now,
      updatedAt: now,
    },
  ]

  return {
    version: CALCITE_STORAGE_VERSION,
    habits: [],
    habitLogs: [],
    taskFolders,
    tasks: [],
    noteFolders,
    notes: [],
    quotes: [],
    settings: {},
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
      habits: Array.isArray(parsed.habits) ? (parsed.habits as CalciteState["habits"]) : seed.habits,
      habitLogs: Array.isArray(parsed.habitLogs)
        ? (parsed.habitLogs as HabitDayLog[])
        : seed.habitLogs,
      taskFolders: Array.isArray(parsed.taskFolders)
        ? (parsed.taskFolders as TaskFolder[])
        : seed.taskFolders,
      tasks: Array.isArray(parsed.tasks) ? (parsed.tasks as CalciteState["tasks"]) : seed.tasks,
      noteFolders: Array.isArray(parsed.noteFolders)
        ? (parsed.noteFolders as NoteFolder[])
        : seed.noteFolders,
      notes: Array.isArray(parsed.notes) ? (parsed.notes as CalciteState["notes"]) : seed.notes,
      quotes: Array.isArray(parsed.quotes) ? (parsed.quotes as Quote[]) : seed.quotes,
      settings: isRecord(parsed.settings) ? parsed.settings as CalciteState["settings"] : seed.settings,
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
