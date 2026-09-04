import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  CheckSquare,
  FileText,
  Quote,
  Settings as SettingsIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-[#2B213A] bg-[#0F0B17] p-5 md:flex">

      {/* Brand */}
      <div className="mb-10 flex items-center gap-2">
        <span className="text-2xl text-[#C7A6FF]">✦</span>

        <span className="text-lg font-semibold tracking-wide text-[#F4F0FF]">
          CALCITE
        </span>
      </div>

      {/* Main */}
      <nav className="space-y-2">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          onClick={() => navigate("/")}
        />

        <SidebarItem
          icon={<CalendarDays size={18} />}
          label="Today"
          onClick={() => navigate("/today")}
        />

        <SidebarItem
          icon={<BarChart3 size={18} />}
          label="Analytics"
          onClick={() => navigate("/analytics")}
        />
      </nav>

      {/* Tasks */}
      <div className="mt-8">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-[#777080]">
          Tasks
        </p>

        <nav className="space-y-1">
          <SidebarItem
            icon={<CheckSquare size={17} />}
            label="College"
            onClick={() => navigate("/tasks/college")}
          />

          <SidebarItem
            icon={<CheckSquare size={17} />}
            label="Projects"
            onClick={() => navigate("/tasks/projects")}
          />

          <SidebarItem
            icon={<CheckSquare size={17} />}
            label="Personal"
            onClick={() => navigate("/tasks/personal")}
          />
        </nav>
      </div>

      {/* Notes */}
      <div className="mt-8">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-[#777080]">
          Notes
        </p>

        <SidebarItem
          icon={<FileText size={17} />}
          label="Everything"
          onClick={() => navigate("/notes")}
        />
      </div>

      {/* Bottom */}
      <div className="mt-auto space-y-1">
        <SidebarItem
          icon={<Quote size={17} />}
          label="Quotes"
          onClick={() => navigate("/quotes")}
        />

        <SidebarItem
          icon={<SettingsIcon size={17} />}
          label="Settings"
          onClick={() => navigate("/settings")}
        />
      </div>
    </aside>
  )
}

type SidebarItemProps = {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

function SidebarItem({
  icon,
  label,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#9A91AA] transition-colors hover:bg-[#18121F] hover:text-[#F4F0FF]"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

export default Sidebar