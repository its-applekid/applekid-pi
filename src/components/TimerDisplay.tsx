import { formatTime } from './Pomodoro'
import type { PomodoroPhase } from './Pomodoro'

interface TimerDisplayProps {
  timeRemaining: number
  phase: PomodoroPhase
  isPaused: boolean
}

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: 'WORK',
  shortBreak: 'BREAK',
  longBreak: 'LONG BREAK',
}

export function TimerDisplay({ timeRemaining, phase, isPaused }: TimerDisplayProps) {
  const { minutes, seconds } = formatTime(timeRemaining)
  
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Phase label */}
      <div className="text-xs uppercase tracking-widest text-white/60">
        {PHASE_LABELS[phase]}
      </div>
      
      {/* Timer */}
      <div 
        className={`font-pressstart text-4xl md:text-5xl text-white ${isPaused ? 'animate-pulse' : ''}`}
        style={{
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        <span>{minutes}</span>
        <span className="animate-blink">:</span>
        <span>{seconds}</span>
      </div>
      
      {/* Paused indicator */}
      {isPaused && (
        <div className="text-xs uppercase tracking-wider text-white/50 animate-pulse">
          PAUSED
        </div>
      )}
    </div>
  )
}
