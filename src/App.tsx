import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./components/layout/Sidebar"

import Dashboard from "./pages/Dashboard"
import Today from "./pages/Today"
import Analytics from "./pages/Analytics"
import Tasks from "./pages/Tasks"
import Notes from "./pages/Notes"
import Quotes from "./pages/Quotes"
import Settings from "./pages/Settings"

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0B0812] text-[#F4F0FF]">
        <Sidebar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/analytics" element={<Analytics />} />

          <Route path="/tasks/:folder" element={<Tasks />} />

          <Route path="/notes" element={<Notes />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App