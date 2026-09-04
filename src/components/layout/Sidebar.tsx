import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  FileText,
LayoutDashboard,
  MessageSquareQuote,
  Settings,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { useCalcite } from "../../state/CalciteStore"

function Sidebar() {
  const { state } = useCalcite()

  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Today",
      to: "/today",
      icon: CalendarDays,
    },
    {
      label: "Analytics",
      to: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Expenses",
      to: "/expenses",
      icon: CircleDollarSign,
    },
  ]

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-[#2B213A] bg-[#0D0A14] md:flex md:flex-col">
      <div className="flex items-center gap-3 px-7 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3A2B50] bg-[#171021] text-[#C7A6FF]">
          ?
        </div>

        <span className="text-lg font-semibold tracking-wide text-[#F4F0FF]">
          CALCITE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#21172F] text-[#F4F0FF]"
                      : "text-[#9A91AA] hover:bg-[#17121F] hover:text-[#F4F0FF]"
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-8">
          <p className="px-4 text-xs font-medium uppercase tracking-wider text-[#777080]">
            Tasks
          </p>

          <nav className="mt-3 space-y-1">
            {state.taskFolders.map((folder) => (
              <NavLink
                key={folder.id}
                to={`/tasks/${folder.slug}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#21172F] text-[#F4F0FF]"
                      : "text-[#9A91AA] hover:bg-[#17121F] hover:text-[#F4F0FF]"
                  }`
                }
              >
                <CheckSquare size={18} strokeWidth={1.8} />
                <span className="truncate">{folder.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          <p className="px-4 text-xs font-medium uppercase tracking-wider text-[#777080]">
            Notes
          </p>

          <nav className="mt-3">
            <NavLink
              to="/notes"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-[#21172F] text-[#F4F0FF]"
                    : "text-[#9A91AA] hover:bg-[#17121F] hover:text-[#F4F0FF]"
                }`
              }
            >
              <FileText size={18} strokeWidth={1.8} />
              <span>Everything</span>
            </NavLink>
          </nav>
        </div>
      </div>

      <div className="border-t border-[#21192C] px-4 py-4">
        <nav className="space-y-1">
          <NavLink
            to="/quotes"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#21172F] text-[#F4F0FF]"
                  : "text-[#9A91AA] hover:bg-[#17121F] hover:text-[#F4F0FF]"
              }`
            }
          >
            <MessageSquareQuote size={18} strokeWidth={1.8} />
            <span>Quotes</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#21172F] text-[#F4F0FF]"
                  : "text-[#9A91AA] hover:bg-[#17121F] hover:text-[#F4F0FF]"
              }`
            }
          >
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar

