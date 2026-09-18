import type {
  CalciteState,
  HabitDayLog,
  NoteFolder,
  Quote,
  TaskFolder,
} from "@/types"

export const CALCITE_STORAGE_KEY = "calcite:v0.2"
export const CALCITE_STORAGE_VERSION = 2

const LEGACY_STORAGE_KEY = "calcite:v0.1"

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

const normalizeState = (parsed: Record<string, unknown>, seed: CalciteState): CalciteState => ({
  version: CALCITE_STORAGE_VERSION,
  habits: Array.isArray(parsed.habits)
    ? (parsed.habits as CalciteState["habits"])
    : seed.habits,
  habitLogs: Array.isArray(parsed.habitLogs)
    ? (parsed.habitLogs as HabitDayLog[])
    : seed.habitLogs,
  taskFolders: Array.isArray(parsed.taskFolders)
    ? (parsed.taskFolders as TaskFolder[])
    : seed.taskFolders,
  tasks: Array.isArray(parsed.tasks)
    ? (parsed.tasks as CalciteState["tasks"])
    : seed.tasks,
  noteFolders: Array.isArray(parsed.noteFolders)
    ? (parsed.noteFolders as NoteFolder[])
    : seed.noteFolders,
  notes: Array.isArray(parsed.notes)
    ? (parsed.notes as CalciteState["notes"])
    : seed.notes,
  quotes: Array.isArray(parsed.quotes)
    ? (parsed.quotes as Quote[])
    : seed.quotes,
  settings: isRecord(parsed.settings)
    ? (parsed.settings as CalciteState["settings"])
    : seed.settings,
})

export function loadState(): CalciteState {
  const seed = createSeedState()

  if (typeof localStorage === "undefined") {
    return seed
  }

  let raw = localStorage.getItem(CALCITE_STORAGE_KEY)

  if (!raw) {
    raw = localStorage.getItem(LEGACY_STORAGE_KEY)

    if (raw) {
      localStorage.setItem(CALCITE_STORAGE_KEY, raw)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  }

  if (!raw) {
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!isRecord(parsed)) {
      return seed
    }

    const state = normalizeState(parsed, seed)

    if (parsed.version !== CALCITE_STORAGE_VERSION) {
      localStorage.setItem(CALCITE_STORAGE_KEY, JSON.stringify(state))
    }

    return state
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
