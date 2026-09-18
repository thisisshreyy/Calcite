import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  FileText,
  Home,
  Quote,
  Settings,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { useCalcite } from "@/state/CalciteStore"

const itemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] transition",
    isActive
      ? "bg-[#21172F] text-[#F4F0FF]"
      : "text-[#9A91AA] hover:bg-[#18121F] hover:text-[#F4F0FF]",
  ].join(" ")

function MobileNav() {
  const { state } = useCalcite()
  const firstTaskFolder = state.taskFolders[0]?.slug ?? "inbox"

  const items = [
    { to: "/", label: "Home", icon: <Home size={18} />, end: true },
    { to: "/today", label: "Today", icon: <CalendarDays size={18} /> },
    {
      to: `/tasks/${firstTaskFolder}`,
      label: "Tasks",
      icon: <CheckSquare size={18} />,
    },
    { to: "/expenses", label: "Money", icon: <CircleDollarSign size={18} /> },
    { to: "/notes", label: "Notes", icon: <FileText size={18} /> },
    { to: "/analytics", label: "Stats", icon: <BarChart3 size={18} /> },
    { to: "/quotes", label: "Quotes", icon: <Quote size={18} /> },
    { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2B213A] bg-[#0F0B17]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {items.map((item) => (
          <NavLink
            className={itemClass}
            end={item.end}
            key={item.to}
            to={item.to}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
