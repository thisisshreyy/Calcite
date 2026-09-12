import { HashRouter, Routes, Route } from "react-router-dom"

import MobileNav from "./components/layout/MobileNav"
import Sidebar from "./components/layout/Sidebar"
import { CalciteProvider } from "./state/CalciteStore"

import Dashboard from "./pages/Dashboard"
import Today from "./pages/Today"
import Analytics from "./pages/Analytics"
import Tasks from "./pages/Tasks"
import Notes from "./pages/Notes"
import Quotes from "./pages/Quotes"
import Expenses from "./pages/Expenses"
import Settings from "./pages/Settings"

function App() {
  return (
    <CalciteProvider>
      <HashRouter>
        <div className="flex min-h-screen bg-[#0B0812] pb-20 text-[#F4F0FF] md:pb-0">
          <Sidebar />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/today" element={<Today />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tasks/:folder" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

          <MobileNav />
        </div>
      </HashRouter>
    </CalciteProvider>
  )
}

export default App