import { Pause, Play, RotateCcw, TimerReset, X } from 'lucide-react'
import { useTimer } from '../timer/TimerContext'

export default function GlobalTimer() {
  // Floating timer mirrors TimerContext state when the user opts into global visibility.
  const {
    formattedTime,
    isRunning,
    progress,
    showGlobalTimer,
    completedMode,
    timerComplete,
    timerMode,
    pauseTimer,
    resetTimer,
    setShowGlobalTimer,
    startTimer,
  } = useTimer()

  if (!showGlobalTimer) return null

  // The progress bar is derived from elapsed time, not stored separately.
  return (
    <div className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-orange-200/20 bg-[#0b0e14]/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.38),0_0_35px_rgba(249,115,22,0.12)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-orange-500/15 text-amber-300">
            <TimerReset size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300/75">
              {timerMode === 'break' ? 'Break timer' : 'Focus timer'}
            </p>
            <p className="text-2xl font-black tabular-nums text-orange-50">{formattedTime}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowGlobalTimer(false)}
          className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-orange-100"
          aria-label="Hide timer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {timerComplete && (
        <p className="mt-3 text-sm font-semibold text-amber-200">
          {completedMode === 'break' ? 'Break complete. Time to refocus.' : 'Timer complete. Head to Study to log it.'}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {!isRunning ? (
          <button type="button" onClick={startTimer} className="forge-button inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 text-sm">
            <Play size={16} />
            Start
          </button>
        ) : (
          <button type="button" onClick={pauseTimer} className="forge-button-subtle inline-flex flex-1 items-center justify-center gap-2 px-3 py-2 text-sm font-bold">
            <Pause size={16} />
            Pause
          </button>
        )}
        <button type="button" onClick={resetTimer} className="forge-button-subtle inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold">
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  )
}
