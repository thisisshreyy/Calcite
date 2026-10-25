import type {
  CalciteState,
  Expense,
  HabitDayLog,
  NoteFolder,
  Quote,
  TaskFolder,
} from "@/types"

export const CALCITE_STORAGE_KEY = "calcite:v0.2"
export const CALCITE_STORAGE_VERSION = 3

const LEGACY_STORAGE_KEY = "calcite:v0.1"
const LEGACY_EXPENSES_KEY = "calcite_expenses"
const LEGACY_CATEGORIES_KEY = "calcite_expense_categories"
const LEGACY_AMOUNTS_KEY = "calcite_expense_amounts"

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Stationery",
  "College",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Travel",
  "Other",
]

export const DEFAULT_EXPENSE_AMOUNTS = [20, 50, 100, 200, 500, 1000]

const nowIso = () => new Date().toISOString()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const readLegacyJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

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
    expenses: [],
    expenseCategories: [...DEFAULT_EXPENSE_CATEGORIES],
    expenseAmounts: [...DEFAULT_EXPENSE_AMOUNTS],
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
  expenses: Array.isArray(parsed.expenses)
    ? (parsed.expenses as Expense[])
    : seed.expenses,
  expenseCategories: Array.isArray(parsed.expenseCategories)
    ? (parsed.expenseCategories as string[])
    : seed.expenseCategories,
  expenseAmounts: Array.isArray(parsed.expenseAmounts)
    ? (parsed.expenseAmounts as number[])
    : seed.expenseAmounts,
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

    const hasExpenses = Object.prototype.hasOwnProperty.call(parsed, "expenses")
    const hasExpenseCategories = Object.prototype.hasOwnProperty.call(
      parsed,
      "expenseCategories",
    )
    const hasExpenseAmounts = Object.prototype.hasOwnProperty.call(
      parsed,
      "expenseAmounts",
    )

    const legacyExpenses = !hasExpenses
      ? readLegacyJson<Expense[]>(LEGACY_EXPENSES_KEY, [])
      : []
    const legacyCategories = !hasExpenseCategories
      ? readLegacyJson<string[]>(LEGACY_CATEGORIES_KEY, [])
      : []
    const legacyAmounts = !hasExpenseAmounts
      ? readLegacyJson<number[]>(LEGACY_AMOUNTS_KEY, [])
      : []

    const state = normalizeState(
      {
        ...parsed,
        expenses: hasExpenses ? parsed.expenses : legacyExpenses,
        expenseCategories: hasExpenseCategories
          ? parsed.expenseCategories
          : legacyCategories.length > 0
            ? legacyCategories
            : DEFAULT_EXPENSE_CATEGORIES,
        expenseAmounts: hasExpenseAmounts
          ? parsed.expenseAmounts
          : legacyAmounts.length > 0
            ? legacyAmounts
            : DEFAULT_EXPENSE_AMOUNTS,
      },
      seed,
    )

    if (
      parsed.version !== CALCITE_STORAGE_VERSION ||
      !hasExpenses ||
      !hasExpenseCategories ||
      !hasExpenseAmounts
    ) {
      localStorage.setItem(CALCITE_STORAGE_KEY, JSON.stringify(state))
    }

    if (!hasExpenses || !hasExpenseCategories || !hasExpenseAmounts) {
      localStorage.removeItem(LEGACY_EXPENSES_KEY)
      localStorage.removeItem(LEGACY_CATEGORIES_KEY)
      localStorage.removeItem(LEGACY_AMOUNTS_KEY)
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

export type UnifiedWorkspace = {
  version: number
  state: CalciteState
  expenses: unknown[]
  expenseCategories: unknown[]
  expenseAmounts: unknown[]
  updatedAt?: string
}

export function getUnifiedWorkspace(state?: CalciteState): UnifiedWorkspace {
  const currentState = state ?? loadState()
  let expenses: unknown[] = []
  let expenseCategories: unknown[] = []
  let expenseAmounts: unknown[] = []

  if (typeof localStorage !== "undefined") {
    try {
      const expRaw = localStorage.getItem("calcite_expenses")
      if (expRaw) expenses = JSON.parse(expRaw)
    } catch {
      // ignore
    }
    try {
      const catRaw = localStorage.getItem("calcite_expense_categories")
      if (catRaw) expenseCategories = JSON.parse(catRaw)
    } catch {
      // ignore
    }
    try {
      const amtRaw = localStorage.getItem("calcite_expense_amounts")
      if (amtRaw) expenseAmounts = JSON.parse(amtRaw)
    } catch {
      // ignore
    }
  }

  return {
    version: CALCITE_STORAGE_VERSION,
    state: currentState,
    expenses,
    expenseCategories,
    expenseAmounts,
    updatedAt: new Date().toISOString(),
  }
}

export function applyUnifiedWorkspace(workspace: UnifiedWorkspace): void {
  if (typeof localStorage === "undefined") return

  if (workspace.state) {
    saveState(workspace.state)
  }
  if (Array.isArray(workspace.expenses)) {
    localStorage.setItem("calcite_expenses", JSON.stringify(workspace.expenses))
  }
  if (Array.isArray(workspace.expenseCategories)) {
    localStorage.setItem(
      "calcite_expense_categories",
      JSON.stringify(workspace.expenseCategories),
    )
  }
  if (Array.isArray(workspace.expenseAmounts)) {
    localStorage.setItem(
      "calcite_expense_amounts",
      JSON.stringify(workspace.expenseAmounts),
    )
  }
}
