import { useRef, useState } from "react"
import {
  Cloud,
  CloudDownload,
  CloudUpload,
  Download,
  Loader2,
  RotateCcw,
  Smartphone,
  Upload,
} from "lucide-react"

import { CALCITE_STORAGE_KEY } from "@/lib/storage"
import { useCalcite } from "@/state/CalciteStore"
import { useAuth } from "@/state/AuthContext"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import type { CalciteState } from "@/types"

function Settings() {
  const { state, dispatch } = useCalcite()
  const { user, syncNow, restoreFromCloud, customApiUrl, setCustomApiUrl } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("")
  const [isSyncingManual, setIsSyncingManual] = useState(false)

  const exportData = () => {
    const backup = {
      version: state.version,
      exportedAt: new Date().toISOString(),
      state,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `calcite-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage("Backup downloaded successfully.")
  }

  const resetData = () => {
    if (
      !window.confirm(
        "Reset all Calcite data on this device? This cannot be undone. Make sure to download a backup if you need your data.",
      )
    )
      return

    ;[
      CALCITE_STORAGE_KEY,
      "calcite_expenses",
      "calcite_expense_categories",
      "calcite_expense_amounts",
      "calcite_auth_token",
      "calcite_auth_user",
      "calcite_last_synced_at",
    ].forEach((key) => localStorage.removeItem(key))

    window.location.reload()
  }

  const importData = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text())

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup")
      }

      const root = parsed as Record<string, unknown>
      const candidate =
        root.state && typeof root.state === "object"
          ? (root.state as Record<string, unknown>)
          : root

      const requiredArrays = [
        "habits",
        "habitLogs",
        "taskFolders",
        "tasks",
        "noteFolders",
        "notes",
        "quotes",
      ]

      if (
        !requiredArrays.every((key) => Array.isArray(candidate[key])) ||
        !candidate.settings ||
        typeof candidate.settings !== "object"
      ) {
        throw new Error("Invalid backup")
      }

      const importedState = {
        ...candidate,
        expenses: Array.isArray(candidate.expenses)
          ? candidate.expenses
          : Array.isArray(root.expenses)
            ? root.expenses
            : [],
        expenseCategories: Array.isArray(candidate.expenseCategories)
          ? candidate.expenseCategories
          : Array.isArray(root.expenseCategories)
            ? root.expenseCategories
            : undefined,
        expenseAmounts: Array.isArray(candidate.expenseAmounts)
          ? candidate.expenseAmounts
          : Array.isArray(root.expenseAmounts)
            ? root.expenseAmounts
            : undefined,
      }

      localStorage.setItem(CALCITE_STORAGE_KEY, JSON.stringify(importedState))
      ;[
        "calcite_expenses",
        "calcite_expense_categories",
        "calcite_expense_amounts",
      ].forEach((key) => localStorage.removeItem(key))

      dispatch({
        type: "state/hydrate",
        state: importedState as unknown as CalciteState,
      })
      setMessage("Backup restored successfully!")
    } catch {
      setMessage("That file is not a valid Calcite backup.")
    }
  }

  const handleManualPush = async () => {
    setIsSyncingManual(true)
    await syncNow(true)
    setIsSyncingManual(false)
    setMessage("Local data pushed to cloud storage.")
  }

  const handleManualPull = async () => {
    setIsSyncingManual(true)
    const success = await restoreFromCloud()
    setIsSyncingManual(false)
    if (success) {
      setMessage("Cloud data restored to this device.")
    } else {
      setMessage("No cloud data found or restore failed.")
    }
  }

  const expensesCount = state.expenses.length

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-10 md:py-10">
        <header className="mb-8">
          <p className="text-sm text-[#9A91AA]">Preferences</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#F4F0FF]">
            Settings
          </h1>
          <p className="mt-2 text-[#777080]">
            Manage your account, cloud sync, and local data storage.
          </p>
        </header>

        <section className="space-y-6">
          {/* Cloud Account & Synchronization */}
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <div className="flex items-center gap-2">
              <Cloud className="text-[#9B6CFF]" size={20} />
              <h2 className="text-lg font-medium text-[#F4F0FF]">
                Cloud Account & Sync
              </h2>
            </div>
            <p className="mt-1 text-sm text-[#777080]">
              Sign in with your Gmail account to sync your habits, tasks, notes,
              and expenses across your devices. Calcite always saves locally
              first for zero-latency offline access.
            </p>

            <div className="mt-5">
              <GoogleAuthButton compact={false} showDemoOption={true} />
            </div>

            {user && (
              <div className="mt-5 border-t border-[#211A2B] pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[#777080]">
                  Cloud Actions
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={handleManualPush}
                    disabled={isSyncingManual}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-2.5 text-xs font-medium text-[#F4F0FF] transition hover:border-[#9B6CFF] disabled:opacity-50"
                  >
                    {isSyncingManual ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CloudUpload size={14} />
                    )}
                    <span>Push Local to Cloud</span>
                  </button>

                  <button
                    onClick={handleManualPull}
                    disabled={isSyncingManual}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-2.5 text-xs font-medium text-[#F4F0FF] transition hover:border-[#9B6CFF] disabled:opacity-50"
                  >
                    {isSyncingManual ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CloudDownload size={14} />
                    )}
                    <span>Pull from Cloud</span>
                  </button>
                </div>
              </div>
            )}
            {/* Cloud Backend Server Status */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#211A2B] bg-[#0E0A16] px-4 py-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[#9A91AA]">Cloud Backend:</span>
                <span className="font-mono text-[#F4F0FF]">https://calcite.onrender.com</span>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
                Live & Connected
              </span>
            </div>

            {/* Custom Backend Cloud URL (Advanced Override) */}
            <div className="mt-3 pt-2">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between text-[11px] font-medium text-[#5E566A] transition hover:text-[#9A91AA]">
                  <span>Advanced Server Override (Optional)</span>
                  <span className="text-[9px] text-[#5E566A] transition group-open:rotate-180">▼</span>
                </summary>
                <div className="mt-2 space-y-2">
                  <p className="text-[11px] text-[#6F687A]">
                    By default, all apps connect to <code className="text-[#C7A6FF]">https://calcite.onrender.com</code>. You only need to change this if using a custom private server.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      defaultValue={customApiUrl}
                      placeholder="https://calcite.onrender.com"
                      onBlur={(e) => setCustomApiUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-[#2B213A] bg-[#0E0A16] px-3.5 py-2 text-xs text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Local Data Portability */}
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <h2 className="text-lg font-medium text-[#F4F0FF]">Local Backup & Restore</h2>
            <p className="mt-1 text-sm text-[#777080]">
              Export your entire workspace to a JSON file or restore from a
              previously saved backup.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={exportData}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-3 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF]"
              >
                <Download size={17} /> Export JSON Backup
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-3 text-sm text-[#F4F0FF] transition hover:border-[#9B6CFF]"
              >
                <Upload size={17} /> Import JSON Backup
              </button>
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="application/json,.json"
                onChange={(e) =>
                  e.target.files?.[0] && importData(e.target.files[0])
                }
              />
            </div>
            {message && (
              <p className="mt-4 rounded-lg bg-[#21172F] px-3 py-2 text-xs text-[#C7A6FF]">
                {message}
              </p>
            )}
          </div>

          {/* Android Mobile App */}
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#21172F] text-[#9B6CFF]">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="text-lg font-medium text-[#F4F0FF]">Android Mobile App</h2>
                <p className="text-xs text-[#777080]">Install Calcite natively on your Android device</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#9A91AA]">
              Download the standalone package or install directly via your browser. All data saves offline and syncs with your Gmail account.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href="https://github.com/thisisshreyy/Calcite/releases/download/v1.0.0-apk/Calcite.apk"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#9B6CFF] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#8654ea]"
              >
                <Download size={17} /> Download APK (GitHub Release)
              </a>
              <a
                href="https://github.com/thisisshreyy/Calcite/releases/tag/v1.0.0-apk"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2B213A] bg-[#1C1628] px-4 py-3 text-sm font-medium text-[#F4F0FF] transition hover:border-[#9B6CFF]"
              >
                <Smartphone size={17} /> View Releases & Notes
              </a>
            </div>

            <div className="mt-4 rounded-xl border border-[#211A2B] bg-[#0E0A16] p-3 text-xs text-[#777080]">
              <span className="font-semibold text-[#C7A6FF]">💡 1-Tap Instant Install:</span> On mobile Chrome, you can also tap the browser menu (⋮) → <span className="text-[#F4F0FF]">"Install app"</span> to add Calcite straight to your home screen with zero download waiting!
            </div>
          </div>

          {/* Workspace Statistics */}
          <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-6">
            <h2 className="text-lg font-medium text-[#F4F0FF]">Workspace Statistics</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-[#0F0B17] p-4">
                <p className="text-xs text-[#777080]">Tasks</p>
                <p className="mt-1 text-2xl font-semibold text-[#F4F0FF]">
                  {state.tasks.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#0F0B17] p-4">
                <p className="text-xs text-[#777080]">Habits</p>
                <p className="mt-1 text-2xl font-semibold text-[#F4F0FF]">
                  {state.habits.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#0F0B17] p-4">
                <p className="text-xs text-[#777080]">Notes</p>
                <p className="mt-1 text-2xl font-semibold text-[#F4F0FF]">
                  {state.notes.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#0F0B17] p-4">
                <p className="text-xs text-[#777080]">Expenses</p>
                <p className="mt-1 text-2xl font-semibold text-[#F4F0FF]">
                  {expensesCount}
                </p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-[#3A2433] bg-[#14101D] p-6">
            <h2 className="text-lg font-medium text-[#FFB4D8]">Danger Zone</h2>
            <p className="mt-1 text-sm text-[#777080]">
              Reset all local workspace and session data stored in this browser.
            </p>
            <button
              onClick={resetData}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#563049] bg-[#21131D] px-4 py-3 text-sm text-[#FFB4D8] transition hover:bg-[#2A1724]"
            >
              <RotateCcw size={17} /> Reset Calcite on this Device
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Settings
