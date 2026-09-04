import type { ReactNode } from "react"
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Quote,
  Sparkles,
  Settings as SettingsIcon,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { useCalcite } from "@/state/CalciteStore"

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
    isActive
      ? "bg-[#21172F] text-[#F4F0FF]"
      : "text-[#9A91AA] hover:bg-[#18121F] hover:text-[#F4F0FF]",
  ].join(" ")

function Sidebar() {
  const { state } = useCalcite()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-[#2B213A] bg-[#0F0B17] p-5 md:flex">
      <div className="mb-10 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2B213A] bg-[#18121F] text-[#C7A6FF]">
          <Sparkles size={17} />
        </span>

        <span className="text-lg font-semibold tracking-wide text-[#F4F0FF]">
          CALCITE
        </span>
      </div>

      <nav className="space-y-2">
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/" />
        <SidebarItem icon={<CalendarDays size={18} />} label="Today" to="/today" />
        <SidebarItem icon={<BarChart3 size={18} />} label="Analytics" to="/analytics" />
      </nav>

      <div className="mt-8 min-h-0">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-[#777080]">
          Tasks
        </p>

        <nav className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {state.taskFolders.map((folder) => (
            <SidebarItem
              key={folder.id}
              icon={<CheckSquare size={17} />}
              label={folder.name}
              to={`/tasks/${folder.slug}`}
            />
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-[#777080]">
          Notes
        </p>

        <SidebarItem icon={<FileText size={17} />} label="Everything" to="/notes" />
      </div>

      <div className="mt-auto space-y-1">
        <SidebarItem icon={<Quote size={17} />} label="Quotes" to="/quotes" />
        <SidebarItem icon={<SettingsIcon size={17} />} label="Settings" to="/settings" />
      </div>
    </aside>
  )
}

type SidebarItemProps = {
  icon: ReactNode
  label: string
  to: string
}

function SidebarItem({ icon, label, to }: SidebarItemProps) {
  return (
    <NavLink className={navItemClass} end={to === "/"} to={to}>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export default Sidebar
