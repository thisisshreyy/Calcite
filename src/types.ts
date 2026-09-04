export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type HabitRecurrence =
  | { type: "daily" }
  | { type: "weekdays" }
  | { type: "selected"; weekdays: Weekday[] }

export type Habit = {
  id: string
  name: string
  points: number
  recurrence: HabitRecurrence
  active: boolean
  createdAt: string
  updatedAt: string
}

export type HabitDayLog = {
  id: string
  habitId: string
  date: string
  completed: boolean
  pointsSnapshot: number
  habitNameSnapshot: string
  activeSnapshot: boolean
  scheduledSnapshot: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type TaskPriority = "none" | "low" | "medium" | "high"

export type TaskFolder = {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: string
  folderId: string
  title: string
  details: string
  completed: boolean
  dueDate?: string
  priority: TaskPriority
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type NoteFolder = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Note = {
  id: string
  folderId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type Quote = {
  id: string
  text: string
  author: string
  category: string
  createdAt: string
  updatedAt: string
}

export type AppSettings = {
  lastDashboardQuoteId?: string
}

export type CalciteState = {
  version: number
  habits: Habit[]
  habitLogs: HabitDayLog[]
  taskFolders: TaskFolder[]
  tasks: Task[]
  noteFolders: NoteFolder[]
  notes: Note[]
  quotes: Quote[]
  settings: AppSettings
}
