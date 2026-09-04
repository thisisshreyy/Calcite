/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Check,
  Edit3,
  FolderPlus,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"
import { NavLink, useNavigate, useParams } from "react-router-dom"

import { compareDateKeys, formatDisplayDate, todayKey } from "@/lib/dates"
import { useCalcite } from "@/state/CalciteStore"
import type { Task, TaskPriority } from "@/types"

type TaskForm = {
  title: string
  details: string
  folderId: string
  dueDate: string
  priority: TaskPriority
}

const inputClass =
  "w-full rounded-lg border border-[#2B213A] bg-[#0F0B17] px-3 py-2 text-sm text-[#F4F0FF] outline-none transition placeholder:text-[#6F687A] focus:border-[#9B6CFF]"

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-3 py-2 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF] hover:bg-[#21172F]"

const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#3A2433] bg-[#21131D] px-3 py-2 text-sm text-[#FFB4D8] transition hover:border-[#FF7AB8] hover:bg-[#2A1724]"

const priorityClass: Record<TaskPriority, string> = {
  none: "border-[#2B213A] text-[#777080]",
  low: "border-[#2B213A] text-[#9A91AA]",
  medium: "border-[#3D2C64] text-[#C7A6FF]",
  high: "border-[#563049] text-[#FFB4D8]",
}

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
}

const emptyTaskForm = (folderId: string): TaskForm => ({
  title: "",
  details: "",
  folderId,
  dueDate: "",
  priority: "none",
})

const taskFormFromTask = (task: Task): TaskForm => ({
  title: task.title,
  details: task.details,
  folderId: task.folderId,
  dueDate: task.dueDate ?? "",
  priority: task.priority,
})

function Tasks() {
  const { folder } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useCalcite()
  const currentFolder =
    state.taskFolders.find((item) => item.slug === folder) ?? state.taskFolders[0]
  const [taskForm, setTaskForm] = useState<TaskForm>(
    emptyTaskForm(currentFolder?.id ?? ""),
  )
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [renameFolderName, setRenameFolderName] = useState(currentFolder?.name ?? "")
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (currentFolder && folder !== currentFolder.slug) {
      navigate(`/tasks/${currentFolder.slug}`, { replace: true })
    }
  }, [currentFolder, folder, navigate])

useEffect(() => {
  if (!currentFolder) {
    return
  }

  setRenameFolderName(currentFolder.name)

  if (!editingTaskId) {
    setTaskForm(emptyTaskForm(currentFolder.id))
  }
 
}, [currentFolder, editingTaskId])

  const folderTasks = useMemo(() => {
    if (!currentFolder) {
      return []
    }

    return state.tasks
      .filter((task) => task.folderId === currentFolder.id)
      .filter((task) => {
        const search = query.trim().toLowerCase()

        if (!search) {
          return true
        }

        return [task.title, task.details].some((value) =>
          value.toLowerCase().includes(search),
        )
      })
      .sort((left, right) => {
        if (left.completed !== right.completed) {
          return left.completed ? 1 : -1
        }

        if (left.dueDate && right.dueDate && left.dueDate !== right.dueDate) {
          return left.dueDate.localeCompare(right.dueDate)
        }

        if (left.dueDate !== right.dueDate) {
          return left.dueDate ? -1 : 1
        }

        return priorityRank[left.priority] - priorityRank[right.priority]
      })
  }, [currentFolder, query, state.tasks])

  const openTasks = folderTasks.filter((task) => !task.completed)
  const doneTasks = folderTasks.filter((task) => task.completed)
  const today = todayKey()

  const resetTaskForm = () => {
    setTaskForm(emptyTaskForm(currentFolder?.id ?? ""))
    setEditingTaskId(null)
  }

  const submitTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!taskForm.folderId || taskForm.title.trim().length === 0) {
      return
    }

    const input = {
      title: taskForm.title,
      details: taskForm.details,
      folderId: taskForm.folderId,
      dueDate: taskForm.dueDate || undefined,
      priority: taskForm.priority,
    }

    if (editingTaskId) {
      dispatch({ type: "task/update", id: editingTaskId, input })
    } else {
      dispatch({ type: "task/create", input })
    }

    resetTaskForm()
  }

  const createFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newFolderName.trim().length === 0) {
      return
    }

    dispatch({ type: "task-folder/create", name: newFolderName })
    setNewFolderName("")
  }

  const renameFolder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentFolder) {
      return
    }

    dispatch({
      type: "task-folder/rename",
      id: currentFolder.id,
      name: renameFolderName,
    })
  }

  const deleteCurrentFolder = () => {
    if (!currentFolder || state.taskFolders.length <= 1) {
      return
    }

    const fallback = state.taskFolders.find((item) => item.id !== currentFolder.id)
    dispatch({ type: "task-folder/delete", id: currentFolder.id })

    if (fallback) {
      navigate(`/tasks/${fallback.slug}`)
    }
  }

  const dueLabel = (task: Task) => {
    if (!task.dueDate) {
      return "No due date"
    }

    if (task.dueDate === today) {
      return "Due today"
    }

    if (!task.completed && compareDateKeys(task.dueDate, today) < 0) {
      return `Overdue: ${formatDisplayDate(task.dueDate, {
        month: "short",
        day: "numeric",
      })}`
    }

    return formatDisplayDate(task.dueDate, {
      month: "short",
      day: "numeric",
    })
  }

  const renderTask = (task: Task) => (
    <article
      className="rounded-xl border border-[#2B213A] bg-[#0F0B17] p-4"
      key={task.id}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
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

          <div className="min-w-0">
            <h2
              className={
                task.completed
                  ? "break-words text-sm font-medium text-[#777080] line-through"
                  : "break-words text-sm font-medium text-[#F4F0FF]"
              }
            >
              {task.title}
            </h2>
            {task.details && (
              <p className="mt-2 break-words text-sm leading-6 text-[#9A91AA]">
                {task.details}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#2B213A] px-2.5 py-1 text-xs text-[#777080]">
                {dueLabel(task)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs ${priorityClass[task.priority]}`}
              >
                {task.priority === "none" ? "No priority" : task.priority}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={buttonClass}
            onClick={() => {
              setEditingTaskId(task.id)
              setTaskForm(taskFormFromTask(task))
            }}
            type="button"
          >
            <Edit3 size={14} />
            Edit
          </button>
          <button
            className={dangerButtonClass}
            onClick={() => dispatch({ type: "task/delete", id: task.id })}
            type="button"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  )

  if (!currentFolder) {
    return (
      <main className="flex-1 p-8">
        <p className="text-[#9A91AA]">Create a task folder to begin.</p>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
        <header className="mb-8">
          <p className="text-sm text-[#9A91AA]">Tasks</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#F4F0FF]">
            {currentFolder.name}
          </h1>
          <p className="mt-2 text-[#777080]">
            One-off work lives here and never changes your habit score.
          </p>
        </header>

        <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {state.taskFolders.map((taskFolder) => (
              <NavLink
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-lg border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-[#9B6CFF] bg-[#21172F] text-[#F4F0FF]"
                      : "border-[#2B213A] text-[#9A91AA] hover:border-[#9B6CFF]",
                  ].join(" ")
                }
                key={taskFolder.id}
                to={`/tasks/${taskFolder.slug}`}
              >
                {taskFolder.name}
                <span className="ml-2 text-xs text-[#777080]">
                  {
                    state.tasks.filter(
                      (task) =>
                        task.folderId === taskFolder.id && !task.completed,
                    ).length
                  }
                </span>
              </NavLink>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <form className="flex gap-2" onSubmit={createFolder}>
              <input
                className={inputClass}
                onChange={(event) => setNewFolderName(event.target.value)}
                placeholder="New list"
                value={newFolderName}
              />
              <button className={buttonClass} type="submit">
                <FolderPlus size={15} />
              </button>
            </form>

            <form className="flex gap-2" onSubmit={renameFolder}>
              <input
                className={inputClass}
                onChange={(event) => setRenameFolderName(event.target.value)}
                value={renameFolderName}
              />
              <button className={buttonClass} type="submit">
                <Save size={15} />
              </button>
            </form>

            <button
              className={dangerButtonClass}
              disabled={state.taskFolders.length <= 1}
              onClick={deleteCurrentFolder}
              type="button"
            >
              <Trash2 size={15} />
              Delete list
            </button>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5"
            onSubmit={submitTask}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#9A91AA]">
                  {editingTaskId ? "Edit task" : "Create task"}
                </p>
                <p className="mt-1 text-xs text-[#6F687A]">
                  Folder, priority, and due date are optional controls.
                </p>
              </div>
              {editingTaskId && (
                <button className={buttonClass} onClick={resetTaskForm} type="button">
                  <X size={15} />
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-xs font-medium text-[#9A91AA]">
                Title
                <input
                  className={`${inputClass} mt-1`}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="What needs to happen?"
                  value={taskForm.title}
                />
              </label>

              <label className="block text-xs font-medium text-[#9A91AA]">
                Details
                <textarea
                  className={`${inputClass} mt-1 min-h-24 resize-y`}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      details: event.target.value,
                    }))
                  }
                  placeholder="Notes, context, links..."
                  value={taskForm.details}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-xs font-medium text-[#9A91AA]">
                  List
                  <select
                    className={`${inputClass} mt-1`}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        folderId: event.target.value,
                      }))
                    }
                    value={taskForm.folderId}
                  >
                    {state.taskFolders.map((taskFolder) => (
                      <option key={taskFolder.id} value={taskFolder.id}>
                        {taskFolder.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-xs font-medium text-[#9A91AA]">
                  Due
                  <input
                    className={`${inputClass} mt-1`}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    type="date"
                    value={taskForm.dueDate}
                  />
                </label>

                <label className="block text-xs font-medium text-[#9A91AA]">
                  Priority
                  <select
                    className={`${inputClass} mt-1`}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        priority: event.target.value as TaskPriority,
                      }))
                    }
                    value={taskForm.priority}
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <button className={buttonClass} type="submit">
                {editingTaskId ? <Save size={15} /> : <Plus size={15} />}
                {editingTaskId ? "Save task" : "Add task"}
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#9A91AA]">
                  {openTasks.length} open / {doneTasks.length} done
                </p>
                <p className="mt-1 text-xs text-[#6F687A]">
                  Sorted by due date, priority, then status.
                </p>
              </div>
              <input
                className={`${inputClass} sm:max-w-xs`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks"
                value={query}
              />
            </div>

            <div className="mt-5 space-y-3">
              {folderTasks.length > 0 ? (
                folderTasks.map(renderTask)
              ) : (
                <div className="rounded-xl border border-dashed border-[#2B213A] bg-[#0F0B17] p-6 text-sm text-[#777080]">
                  No tasks match this list.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}

export default Tasks
