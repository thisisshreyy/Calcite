import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  Compass,
  FileText,
  Home,
  MessageSquareQuote,
  Search,
  Settings,
  X,
} from "lucide-react"
import { useCalcite } from "@/state/CalciteStore"

type PaletteItem = {
  id: string
  title: string
  subtitle?: string
  category: "Navigation" | "Tasks" | "Notes" | "Habits"
  icon: typeof Home
  action: () => void
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { state } = useCalcite()

  const handleClose = () => {
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
  }

  // Open/Close with Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setIsOpen((prev) => {
          if (!prev) {
            setQuery("")
            setSelectedIndex(0)
          }
          return !prev
        })
      } else if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const defaultTaskFolder = state.taskFolders[0]?.slug ?? "inbox"

  const allItems: PaletteItem[] = useMemo(() => {
    const items: PaletteItem[] = [
      // Navigation
      {
        id: "nav-dashboard",
        title: "Dashboard",
        subtitle: "Overview & scores",
        category: "Navigation",
        icon: Home,
        action: () => navigate("/"),
      },
      {
        id: "nav-today",
        title: "Today",
        subtitle: "Daily habits & due tasks",
        category: "Navigation",
        icon: CalendarDays,
        action: () => navigate("/today"),
      },
      {
        id: "nav-tasks",
        title: "Tasks",
        subtitle: "View all task lists",
        category: "Navigation",
        icon: CheckSquare,
        action: () => navigate(`/tasks/${defaultTaskFolder}`),
      },
      {
        id: "nav-expenses",
        title: "Expenses",
        subtitle: "Track spendings & budget",
        category: "Navigation",
        icon: CircleDollarSign,
        action: () => navigate("/expenses"),
      },
      {
        id: "nav-notes",
        title: "Notes",
        subtitle: "Markdown notes & folders",
        category: "Navigation",
        icon: FileText,
        action: () => navigate("/notes"),
      },
      {
        id: "nav-analytics",
        title: "Analytics",
        subtitle: "Trends, streaks & statistics",
        category: "Navigation",
        icon: BarChart3,
        action: () => navigate("/analytics"),
      },
      {
        id: "nav-quotes",
        title: "Quotes",
        subtitle: "Inspirational library",
        category: "Navigation",
        icon: MessageSquareQuote,
        action: () => navigate("/quotes"),
      },
      {
        id: "nav-settings",
        title: "Settings",
        subtitle: "Cloud sync & backup",
        category: "Navigation",
        icon: Settings,
        action: () => navigate("/settings"),
      },
    ]

    // Tasks
    state.tasks.slice(0, 15).forEach((task) => {
      const folder = state.taskFolders.find((f) => f.id === task.folderId)
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: task.completed ? "Completed task" : `Priority: ${task.priority}`,
        category: "Tasks",
        icon: CheckSquare,
        action: () => navigate(`/tasks/${folder?.slug ?? defaultTaskFolder}`),
      })
    })

    // Notes
    state.notes.slice(0, 15).forEach((note) => {
      items.push({
        id: `note-${note.id}`,
        title: note.title,
        subtitle: "Note document",
        category: "Notes",
        icon: FileText,
        action: () => navigate("/notes"),
      })
    })

    // Habits
    state.habits.forEach((habit) => {
      items.push({
        id: `habit-${habit.id}`,
        title: habit.name,
        subtitle: `${habit.points} pts • ${habit.timeOfDay ?? "anytime"}`,
        category: "Habits",
        icon: Compass,
        action: () => navigate("/today"),
      })
    })

    return items
  }, [state, navigate, defaultTaskFolder])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12)
    const q = query.toLowerCase()
    return allItems
      .filter((item) => item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q))
      .slice(0, 12)
  }, [allItems, query])

  const handleSelect = (item: PaletteItem) => {
    handleClose()
    item.action()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault()
      handleSelect(filteredItems[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-[15vh] backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#2B213A] bg-[#14101D] shadow-2xl"
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-[#211A2B] px-4 py-3">
          <Search size={18} className="text-[#9B6CFF]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, task, note, or habit… (Esc to close)"
            className="flex-1 bg-transparent text-sm text-[#F4F0FF] outline-none placeholder:text-[#5E566A]"
          />
          <button
            onClick={handleClose}
            className="rounded p-1 text-[#6F687A] hover:text-[#F4F0FF]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#6F687A]">
              No results found for "{query}"
            </p>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                    isSelected
                      ? "bg-[#21172F] text-[#F4F0FF]"
                      : "text-[#9A91AA] hover:bg-[#1A1224] hover:text-[#F4F0FF]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={16} className={isSelected ? "text-[#9B6CFF]" : "text-[#777080]"} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#F4F0FF]">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-[10px] text-[#6F687A]">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#0B0812] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#6F687A]">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={13} className="text-[#9B6CFF]" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-[#211A2B] bg-[#0E0A16] px-4 py-2 text-[10px] text-[#5E566A]">
          <div className="flex items-center gap-2">
            <span>Navigation: <kbd className="rounded bg-[#1C1628] px-1 text-[#9B6CFF]">↑</kbd> <kbd className="rounded bg-[#1C1628] px-1 text-[#9B6CFF]">↓</kbd></span>
            <span>Select: <kbd className="rounded bg-[#1C1628] px-1 text-[#9B6CFF]">↵</kbd></span>
          </div>
          <span>Close: <kbd className="rounded bg-[#1C1628] px-1 text-[#9B6CFF]">Esc</kbd></span>
        </div>
      </div>
    </div>
  )
}
