import { lazy, Suspense } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"

import MobileNav from "./components/layout/MobileNav"
import Sidebar from "./components/layout/Sidebar"
import { CalciteProvider } from "./state/CalciteStore"

const Dashboard = lazy(() => import("./pages/Dashboard"))
const Today = lazy(() => import("./pages/Today"))
const Analytics = lazy(() => import("./pages/Analytics"))
const Tasks = lazy(() => import("./pages/Tasks"))
const Notes = lazy(() => import("./pages/Notes"))
const Quotes = lazy(() => import("./pages/Quotes"))
const Expenses = lazy(() => import("./pages/Expenses"))
const Settings = lazy(() => import("./pages/Settings"))

function PageLoader() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#0B0812] px-6">
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#2B213A] border-t-[#9B6CFF]"
        />
        <p className="mt-3 text-sm text-[#777080]">Loading Calcite…</p>
      </div>
    </main>
  )
}

function App() {
  return (
    <CalciteProvider>
      <HashRouter>
        <div className="flex min-h-screen bg-[#0B0812] pb-20 text-[#F4F0FF] md:pb-0">
          <Sidebar />

          <Suspense fallback={<PageLoader />}>
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
          </Suspense>

          <MobileNav />
        </div>
      </HashRouter>
    </CalciteProvider>
  )
}

export default App
