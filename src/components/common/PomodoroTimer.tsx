import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer,
} from "lucide-react"
import { useCalcite } from "@/state/CalciteStore"

type TimerMode = "focus" | "shortBreak" | "longBreak"

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
}

function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3) // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1.2)
  } catch {
    // Audio context may not be allowed without user interaction
  }
}

export function PomodoroTimer() {
  const { state } = useCalcite()
  const [mode, setMode] = useState<TimerMode>("focus")
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(true)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const activeTasks = state.tasks.filter((task) => !task.completed)
  const selectedTask = state.tasks.find((task) => task.id === selectedTaskId)

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playGentleChime()
            if (mode === "focus") {
              setSessionsCompleted((c) => c + 1)
              setMode("shortBreak")
              return MODE_DURATIONS.shortBreak
            } else {
              setMode("focus")
              return MODE_DURATIONS.focus
            }
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, mode])

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(MODE_DURATIONS[newMode])
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(MODE_DURATIONS[mode])
  }

  const handleSkip = () => {
    setIsRunning(false)
    if (mode === "focus") {
      switchMode("shortBreak")
    } else {
      switchMode("focus")
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const totalDuration = MODE_DURATIONS[mode]
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100

  return (
    <div className="rounded-2xl border border-[#2B213A] bg-[#14101D] p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#21172F] text-[#9B6CFF]">
            <Timer size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F4F0FF]">Focus Pomodoro</h3>
            <p className="text-[11px] text-[#777080]">
              {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""} completed today
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-lg p-1.5 text-[#777080] hover:bg-[#1C1628] hover:text-[#F4F0FF]"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#2B213A] bg-[#0F0B17] p-1 text-xs">
            {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                className={`rounded-lg py-1.5 font-medium transition ${
                  mode === tab
                    ? "bg-[#9B6CFF] text-[#0B0812] shadow"
                    : "text-[#9A91AA] hover:text-[#F4F0FF]"
                }`}
              >
                {MODE_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="my-5 flex flex-col items-center">
            <div className="font-mono text-5xl font-bold tracking-tight text-[#F4F0FF]">
              {formattedTime}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-[#1C1628]">
              <div
                className="h-full bg-gradient-to-r from-[#7B46FF] to-[#C7A6FF] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Task Linker */}
            <div className="mt-4 w-full max-w-xs">
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full truncate rounded-xl border border-[#2B213A] bg-[#0F0B17] px-3 py-1.5 text-xs text-[#F4F0FF] outline-none focus:border-[#9B6CFF]"
              >
                <option value="">🎯 Link to a task (Optional)</option>
                {activeTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
              {selectedTask && (
                <p className="mt-1.5 text-center text-[11px] text-[#C7A6FF]">
                  Focusing on: <span className="font-medium">{selectedTask.title}</span>
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              title="Reset"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2B213A] bg-[#1C1628] text-[#9A91AA] transition hover:border-[#9B6CFF] hover:text-[#F4F0FF]"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex h-12 w-28 items-center justify-center gap-2 rounded-xl bg-[#9B6CFF] font-semibold text-[#0B0812] shadow-lg shadow-[#9B6CFF]/20 transition hover:bg-[#8B56FF]"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
              <span className="text-sm">{isRunning ? "Pause" : "Start"}</span>
            </button>

            <button
              onClick={handleSkip}
              title="Skip"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2B213A] bg-[#1C1628] text-[#9A91AA] transition hover:border-[#9B6CFF] hover:text-[#F4F0FF]"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
