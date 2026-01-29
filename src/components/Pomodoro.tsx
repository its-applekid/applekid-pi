import { useState, useEffect, useCallback } from 'react'

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroState {
  isActive: boolean
  isPaused: boolean
  phase: PomodoroPhase
  phaseIndex: number // 0-5 in the cycle
  timeRemaining: number // in seconds
}

// Phase durations in seconds
const PHASE_DURATIONS: Record<PomodoroPhase, number> = {
  work: 25 * 60,      // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 35 * 60, // 35 minutes
}

// Cycle: work, short, work, short, work, long (then repeat)
const PHASE_SEQUENCE: PomodoroPhase[] = [
  'work', 'shortBreak', 'work', 'shortBreak', 'work', 'longBreak'
]

interface PomodoroProps {
  onPhaseChange?: (phase: PomodoroPhase) => void
  onClose?: () => void
}

export function usePomodoro({ onPhaseChange, onClose }: PomodoroProps = {}) {
  const [state, setState] = useState<PomodoroState>({
    isActive: false,
    isPaused: false,
    phase: 'work',
    phaseIndex: 0,
    timeRemaining: PHASE_DURATIONS.work,
  })

  // Timer tick
  useEffect(() => {
    if (!state.isActive || state.isPaused) return

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Move to next phase
          const nextIndex = (prev.phaseIndex + 1) % PHASE_SEQUENCE.length
          const nextPhase = PHASE_SEQUENCE[nextIndex]
          onPhaseChange?.(nextPhase)
          return {
            ...prev,
            phaseIndex: nextIndex,
            phase: nextPhase,
            timeRemaining: PHASE_DURATIONS[nextPhase],
          }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.isActive, state.isPaused, onPhaseChange])

  // Notify phase change on start
  useEffect(() => {
    if (state.isActive) {
      onPhaseChange?.(state.phase)
    }
  }, [state.isActive])

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }, [])

  const skip = useCallback(() => {
    setState(prev => {
      const nextIndex = (prev.phaseIndex + 1) % PHASE_SEQUENCE.length
      const nextPhase = PHASE_SEQUENCE[nextIndex]
      onPhaseChange?.(nextPhase)
      return {
        ...prev,
        phaseIndex: nextIndex,
        phase: nextPhase,
        timeRemaining: PHASE_DURATIONS[nextPhase],
      }
    })
  }, [onPhaseChange])

  const reset = useCallback(() => {
    const phase = PHASE_SEQUENCE[0]
    onPhaseChange?.(phase)
    setState({
      isActive: true,
      isPaused: false,
      phase,
      phaseIndex: 0,
      timeRemaining: PHASE_DURATIONS[phase],
    })
  }, [onPhaseChange])

  const close = useCallback(() => {
    setState({
      isActive: false,
      isPaused: false,
      phase: 'work',
      phaseIndex: 0,
      timeRemaining: PHASE_DURATIONS.work,
    })
    onClose?.()
  }, [onClose])

  return {
    ...state,
    start,
    pause,
    skip,
    reset,
    close,
  }
}

// Format seconds to MM:SS
export function formatTime(seconds: number): { minutes: string; seconds: string } {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return {
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  }
}
