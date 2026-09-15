import { useRef, useState } from "react"
import { Download, RotateCcw, Upload } from "lucide-react"

import { CALCITE_STORAGE_KEY } from "@/lib/storage"
import { useCalcite } from "@/state/CalciteStore"

function Settings() {
  const { state } = useCalcite()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("")

  const exportData = () => {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      state,
      expenses: JSON.parse(localStorage.getItem("calcite_expenses") ?? "[]"),
      expenseCategories: JSON.parse(
        localStorage.getItem("calcite_expense_categories") ?? "[]",
      ),
      expenseAmounts: JSON.parse(
        localStorage.getItem("calcite_expense_amounts") ?? "[]",
      ),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `calcite-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage("Backup downloaded.")
  }

  const resetData = () => {
    if (!window.confirm("Reset all Calcite data on this device? This cannot be undone.")) return

    ;[
      CALCITE_STORAGE_KEY,
      "calcite_expenses",
      "calcite_expense_categories",
      "calcite_expense_amounts",
    ].forEach((key) => localStorage.removeItem(key))

    window.location.reload()
  }

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      const backup =
        parsed &&
        typeof parsed === "object" &&
        "state" in parsed &&
        parsed.state &&
        typeof parsed.state === "object"
          ? parsed
          : { state: parsed }

      if (
        !backup.state ||
        !Array.isArray(backup.state.tasks) ||
        !Array.isArray(backup.state.habits)
      ) {
        throw new Error("Invalid backup")
      }

      localStorage.setItem(CALCITE_STORAGE_KEY, JSON.stringify(backup.state))

      if (Array.isArray(backup.expenses)) {
        localStorage.setItem("calcite_expenses", JSON.stringify(backup.expenses))
      }
      if (Array.isArray(backup.expenseCategories)) {
        localStorage.setItem(
          "calcite_expense_categories",
          JSON.stringify(backup.expenseCategories),
        )
      }
      if (Array.isArray(backup.expenseAmounts)) {
        localStorage.setItem(
          "calcite_expense_amounts",
          JSON.stringify(backup.expenseAmounts),
        )
      }

      setMessage("Backup restored. Reloading…")
      setTimeout(() => window.location.reload(), 400)
    } catch {
      setMessage("That file is not a valid Calcite backup.")
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-10">
        <p className="text-sm text-[#9A91AA]">Preferences</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F4F0FF]">Settings</h1>
        <p className="mt-2 text-[#777080]">Manage your data and Calcite on this device.</p>

        <section className="mt-8 space-y-4">
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <h2 className="font-medium text-[#F4F0FF]">Your data</h2>
            <p className="mt-1 text-sm text-[#777080]">Calcite currently stores your workspace locally in this browser.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={exportData} className="flex items-center justify-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-3 text-sm hover:border-[#9B6CFF]"><Download size={17} /> Export backup</button>
              <button onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-3 text-sm hover:border-[#9B6CFF]"><Upload size={17} /> Import backup</button>
              <input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
            </div>
            {message && <p className="mt-4 text-sm text-[#C7A6FF]">{message}</p>}
          </div>

          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5">
            <h2 className="font-medium text-[#F4F0FF]">Workspace</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#0F0B17] p-4"><p className="text-xs text-[#777080]">Tasks</p><p className="mt-1 text-2xl">{state.tasks.length}</p></div>
              <div className="rounded-xl bg-[#0F0B17] p-4"><p className="text-xs text-[#777080]">Habits</p><p className="mt-1 text-2xl">{state.habits.length}</p></div>
              <div className="rounded-xl bg-[#0F0B17] p-4"><p className="text-xs text-[#777080]">Notes</p><p className="mt-1 text-2xl">{state.notes.length}</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#3A2433] bg-[#14101D] p-5">
            <h2 className="font-medium text-[#FFB4D8]">Danger zone</h2>
            <p className="mt-1 text-sm text-[#777080]">Delete the local Calcite workspace and start fresh.</p>
            <button onClick={resetData} className="mt-4 flex items-center gap-2 rounded-xl border border-[#563049] bg-[#21131D] px-4 py-3 text-sm text-[#FFB4D8] hover:bg-[#2A1724]"><RotateCcw size={17} /> Reset Calcite</button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Settings
