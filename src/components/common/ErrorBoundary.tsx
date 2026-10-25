import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, Download, RefreshCw, Trash2 } from "lucide-react"

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Calcite caught an unhandled error:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleEmergencyExport = () => {
    try {
      const backup: Record<string, unknown> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("calcite")) {
          try {
            backup[key] = JSON.parse(localStorage.getItem(key) || "null")
          } catch {
            backup[key] = localStorage.getItem(key)
          }
        }
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `calcite-emergency-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert("Could not export backup: " + String(e))
    }
  }

  handleReset = () => {
    if (
      window.confirm(
        "Reset local data? This will clear browser storage for Calcite. Be sure to export an emergency backup first.",
      )
    ) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith("calcite")) {
          localStorage.removeItem(key)
        }
      }
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B0812] px-6 text-[#F4F0FF]">
          <div className="w-full max-w-md rounded-2xl border border-[#3A2433] bg-[#14101D] p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2A1520] text-[#FF7AB8]">
              <AlertTriangle size={24} />
            </div>
            <h1 className="text-xl font-semibold text-[#F4F0FF]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-[#9A91AA]">
              Calcite encountered an unexpected error. Your saved data is still
              safe in your storage.
            </p>
            {this.state.error?.message && (
              <div className="my-4 max-h-28 overflow-y-auto rounded-lg border border-[#2B213A] bg-[#0A0710] p-3 text-left font-mono text-xs text-[#E178A7]">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#9B6CFF] px-4 py-2.5 text-sm font-medium text-[#0B0812] transition hover:bg-[#8B56FF]"
              >
                <RefreshCw size={16} /> Reload Calcite
              </button>
              <button
                onClick={this.handleEmergencyExport}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#2B213A] bg-[#1C1628] px-4 py-2.5 text-sm font-medium text-[#F4F0FF] transition hover:border-[#9B6CFF]"
              >
                <Download size={16} /> Export Emergency Backup
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#3A2433] bg-[#21131D] px-4 py-2.5 text-sm font-medium text-[#FFB4D8] transition hover:border-[#FF7AB8]"
              >
                <Trash2 size={16} /> Reset & Clear Cache
              </button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
